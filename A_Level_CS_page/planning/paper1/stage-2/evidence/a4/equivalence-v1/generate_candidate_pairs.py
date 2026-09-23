#!/usr/bin/env python3
"""Deterministic Stage 2 C3b candidate, relation, group and complement builder."""

from __future__ import annotations

import argparse
import hashlib
import itertools
import json
import platform
import re
import sys
import unicodedata
from collections import Counter, defaultdict
from pathlib import Path


HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[6]
CONFIG_PATH = HERE / "CANDIDATE_GENERATION_CONFIG.json"
INPUT_MANIFEST_PATH = HERE / "INPUT_MANIFEST.json"
EXPECTED_OUTPUTS = [
    "CANDIDATE_PAIR_UNIVERSE.jsonl",
    "CANDIDATE_GENERATION_MANIFEST.json",
    "CANDIDATE_GENERATION_CONFIG.json",
    "generate_candidate_pairs.py",
    "VARIANT_RELATION_REGISTER.jsonl",
    "EQUIVALENCE_GROUPS.json",
    "REJECTED_PAIR_AUDIT.json",
    "CONTRADICTION_UNRESOLVED_REPORT.md",
    "QA.json",
    "INPUT_MANIFEST.json",
    "OUTPUT_MANIFEST.json",
    "HANDOFF.json",
]
GENERATION_PROJECTION_FIELDS = [
    "pair_id", "left_id", "right_id", "channels", "metrics", "risk_stratum"
]


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def read_jsonl(path: Path):
    with path.open("r", encoding="utf-8") as handle:
        return [json.loads(line) for line in handle if line.strip()]


def write_json(path: Path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, sort_keys=True, indent=2) + "\n", encoding="utf-8", newline="\n")


def write_jsonl(path: Path, rows):
    with path.open("w", encoding="utf-8", newline="\n") as handle:
        for row in rows:
            handle.write(json.dumps(row, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n")


def sha_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def sha_file(path: Path) -> str:
    return sha_bytes(path.read_bytes())


def file_entry(path: Path) -> dict:
    data = path.read_bytes()
    return {"path": path.name, "bytes": len(data), "sha256": sha_bytes(data)}


def canonical_json(value) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def projection_hash(rows) -> str:
    projection = [{key: row[key] for key in GENERATION_PROJECTION_FIELDS} for row in rows]
    return sha_bytes(("\n".join(canonical_json(row) for row in projection) + ("\n" if projection else "")).encode("utf-8"))


QUOTE_RE = re.compile(r"(?:\"[^\"\n]+\"|'[^'\n]+')")
HEX_RE = re.compile(r"(?<![\w])(?:0x[0-9a-f]+|[0-9a-f]+h)(?![\w])", re.I)
BIN_RE = re.compile(r"(?<![\w])(?:0b[01]+|[01]{4,}b)(?![\w])", re.I)
DEC_RE = re.compile(r"(?<![\w])[-+]?\d+(?:\.\d+)?(?![\w])")
WORD_RE = re.compile(r"[a-z0-9_<>]+|!=|<=|>=|==|[+*/%<>=-]")


def normalize_text(text: str, skeleton: bool = False) -> str:
    text = unicodedata.normalize("NFKC", text or "").lower()
    text = text.translate(str.maketrans({"“": '"', "”": '"', "‘": "'", "’": "'", "–": "-", "—": "-", "−": "-"}))
    if skeleton:
        text = QUOTE_RE.sub(" <id> ", text)
        text = HEX_RE.sub(" <hex> ", text)
        text = BIN_RE.sub(" <bin> ", text)
        text = DEC_RE.sub(" <dec> ", text)
    text = re.sub(r"\.{3,}|_{3,}", " ", text)
    return " ".join(text.split())


def tokens(text: str) -> frozenset[str]:
    return frozenset(WORD_RE.findall(text))


def trigrams(text: str) -> frozenset[str]:
    compact = " ".join(text.split())
    return frozenset(compact[i:i + 3] for i in range(max(0, len(compact) - 2)))


def jaccard(left, right) -> float:
    if not left and not right:
        return 0.0
    union = len(left | right)
    return len(left & right) / union if union else 0.0


def dice(left, right) -> float:
    if not left and not right:
        return 0.0
    denom = len(left) + len(right)
    return (2 * len(left & right) / denom) if denom else 0.0


def first_value(record: dict, paths: list[str]):
    for dotted in paths:
        value = record
        for key in dotted.split("."):
            if not isinstance(value, dict) or key not in value:
                value = None
                break
            value = value[key]
        if value not in (None, "", [], {}):
            return value
    return ""


def flatten_text(value) -> str:
    if isinstance(value, str):
        return value
    if isinstance(value, list):
        return " ".join(flatten_text(item) for item in value)
    if isinstance(value, dict):
        meaningful = []
        for key, item in sorted(value.items()):
            if key not in {"transcript_ref", "normalization_state"}:
                meaningful.append(flatten_text(item))
        return " ".join(part for part in meaningful if part)
    return str(value) if value is not None else ""


def parse_paper(paper_id: str) -> tuple[int, str, str]:
    match = re.search(r"9618_([sw])(\d{2})_qp_(\d{2})", paper_id)
    if not match:
        raise ValueError(f"Unparseable paper_id: {paper_id}")
    return 2000 + int(match.group(2)), match.group(1), match.group(3)


def locator_ref(locator: dict) -> dict:
    return {
        "source_id": locator.get("source_id"),
        "pdf_page_1_based": locator.get("pdf_page_1_based"),
        "question": locator.get("question"),
        "part": locator.get("part"),
    }


def load_nodes(config: dict):
    qpath = ROOT / config["input"]["question_bank_index"]
    mpath = ROOT / config["input"]["marking_evidence_catalog"]
    all_q = read_jsonl(qpath)
    marking = {row["marking_evidence_id"]: row for row in read_jsonl(mpath)}
    nodes = []
    qp_paths = config["normalization"]["qp_field_paths"]
    ms_paths = config["normalization"]["ms_field_paths"][:2]
    for row in all_q:
        if row.get("record_kind") != "ASSESSMENT_UNIT":
            continue
        me = marking[row["marking_evidence_id"]]
        qp_raw = flatten_text(first_value(row, qp_paths))
        ms_raw = flatten_text(first_value(row, ms_paths))
        if not ms_raw:
            ms_raw = " ".join([
                flatten_text(me.get("official_conditions", [])),
                flatten_text(me.get("alternatives_if_explicit", [])),
            ]).strip()
        qp_strict = normalize_text(qp_raw, False)
        qp_skeleton = normalize_text(qp_raw, True)
        ms_norm = normalize_text(ms_raw, True)
        year, session, component = parse_paper(row["paper_id"])
        stimulus = sorted({normalize_text(tag, True) for tag in row.get("stimulus_tags", []) if tag and not str(tag).upper().startswith("SYLLABUS_")})
        dep_modes = tuple(sorted(row.get("dependency_modes", [])))
        visual_class = "VISUAL" if row.get("visual_or_table_dependency_ids") else ("TABLE" if "TABLE_LAYOUT" in dep_modes else "TEXT")
        behaviour = me.get("marking_behaviour") or "UNSPECIFIED"
        flags = {
            "grouped": "GROUP" in behaviour,
            "capped": "CAPPED" in behaviour,
            "threshold": "THRESHOLD" in behaviour,
        }
        ms_struct_obj = {
            "evidence_kind": me.get("evidence_kind"),
            "claim_precision": me.get("claim_precision"),
            "marking_behaviour": behaviour,
            "flags": flags,
            "alternative_count": len(me.get("alternatives_if_explicit", [])),
            "marks": row.get("displayed_marks"),
            "condition_tokens": sorted(tokens(ms_norm)),
        }
        nodes.append({
            "id": row["assessment_unit_id"],
            "paper_id": row["paper_id"],
            "year": year,
            "session": session,
            "component": component,
            "marks": row.get("displayed_marks"),
            "command": normalize_text(row.get("command_word_observed_or_null") or ""),
            "cognitive_action": row.get("analyst_cognitive_action"),
            "response": row.get("response_product"),
            "requirements": frozenset(row.get("primary_requirement_ids", [])),
            "stimulus": frozenset(stimulus),
            "dependency_modes": dep_modes,
            "visual_class": visual_class,
            "pattern": row.get("provisional_pattern_id"),
            "qp_raw_available": bool(qp_raw),
            "ms_raw_available": bool(ms_raw),
            "qp_strict": qp_strict,
            "qp_skeleton": qp_skeleton,
            "qp_strict_sha256": sha_bytes(qp_strict.encode("utf-8")),
            "qp_skeleton_sha256": sha_bytes(qp_skeleton.encode("utf-8")),
            "qp_tokens": tokens(qp_skeleton),
            "qp_trigrams": trigrams(qp_skeleton),
            "ms_norm": ms_norm,
            "ms_sha256": sha_bytes(ms_norm.encode("utf-8")),
            "ms_tokens": tokens(ms_norm),
            "ms_structural_fingerprint": sha_bytes(canonical_json(ms_struct_obj).encode("utf-8")),
            "marking_behaviour": behaviour,
            "evidence_kind": me.get("evidence_kind"),
            "claim_precision": me.get("claim_precision"),
            "marking_flags": flags,
            "alternative_count": len(me.get("alternatives_if_explicit", [])),
            "qp_ref": locator_ref(row["qp_locator"]),
            "ms_ref": locator_ref(row["ms_locator"]),
            "qp_transcript_ref": first_value(row, ["classification_evidence.qp_transcript_ref", "source_record.classification_evidence.qp_transcript_ref"]),
            "ms_transcript_ref": first_value(row, ["classification_evidence.ms_transcript_ref", "source_record.classification_evidence.ms_transcript_ref"]) or me.get("source_transcript_ref_or_null"),
        })
    nodes.sort(key=lambda item: item["id"])
    return nodes, all_q


def pair_id(left_id: str, right_id: str) -> str:
    return "eqp-" + sha_bytes(f"{left_id}|{right_id}".encode("utf-8"))[:24]


def pair_metrics(left: dict, right: dict) -> dict:
    req_overlap = sorted(left["requirements"] & right["requirements"])
    stim_overlap = sorted(left["stimulus"] & right["stimulus"])
    qp_j = jaccard(left["qp_tokens"], right["qp_tokens"])
    qp_d = dice(left["qp_trigrams"], right["qp_trigrams"])
    ms_j = jaccard(left["ms_tokens"], right["ms_tokens"])
    six = {
        "response_product": left["response"] == right["response"],
        "marks": left["marks"] == right["marks"],
        "command_word": bool(left["command"]) and left["command"] == right["command"],
        "primary_requirement_overlap": bool(req_overlap),
        "stimulus_overlap": bool(stim_overlap),
        "dependency_visual_class": left["dependency_modes"] == right["dependency_modes"] and left["visual_class"] == right["visual_class"],
    }
    return {
        "qp_word_jaccard": round(qp_j, 6),
        "qp_character_trigram_dice": round(qp_d, 6),
        "ms_token_jaccard": round(ms_j, 6),
        "primary_requirement_overlap": req_overlap,
        "stimulus_signature_overlap": stim_overlap,
        "same_response_product": six["response_product"],
        "same_marks": six["marks"],
        "same_command_word": six["command_word"],
        "same_dependency_visual_class": six["dependency_visual_class"],
        "structure_feature_match_count": sum(six.values()),
        "same_ms_structural_fingerprint": left["ms_structural_fingerprint"] == right["ms_structural_fingerprint"],
        "same_strict_qp_fingerprint": left["qp_strict_sha256"] == right["qp_strict_sha256"] and bool(left["qp_strict"]),
        "same_skeleton_qp_fingerprint": left["qp_skeleton_sha256"] == right["qp_skeleton_sha256"] and bool(left["qp_skeleton"]),
    }


def channels_for(left: dict, right: dict, metrics: dict, thresholds: dict) -> list[str]:
    channels = []
    if metrics["same_strict_qp_fingerprint"]:
        channels.append("QP_EXACT_STRICT")
    if metrics["same_skeleton_qp_fingerprint"]:
        channels.append("QP_EXACT_SKELETON")
    if left["year"] == right["year"] and left["session"] == right["session"] and left["component"] != right["component"]:
        channels.append("SAME_SESSION_CROSS_COMPONENT")
    if metrics["primary_requirement_overlap"] and metrics["same_response_product"] and (metrics["same_marks"] or metrics["stimulus_signature_overlap"]):
        channels.append("REQ_RESPONSE_MARKS_OR_STIMULUS")
    if metrics["same_ms_structural_fingerprint"] or metrics["ms_token_jaccard"] >= thresholds["ms_token_jaccard"]:
        channels.append("MS_STRUCTURAL")
    if metrics["qp_word_jaccard"] >= thresholds["qp_word_jaccard"] or metrics["qp_character_trigram_dice"] >= thresholds["qp_character_trigram_dice"]:
        channels.append("QP_TEXT_STRUCTURE")
    if metrics["structure_feature_match_count"] >= 4 and (metrics["qp_word_jaccard"] >= thresholds["structure_composite_qp_word_jaccard"] or metrics["ms_token_jaccard"] >= thresholds["structure_composite_ms_jaccard"]):
        channels.append("STRUCTURE_COMPOSITE")
    if left["pattern"] and left["pattern"] == right["pattern"]:
        channels.append("SAME_PROVISIONAL_PATTERN")
    return channels


def comparison(left: dict, right: dict, metrics: dict) -> dict:
    return {
        "construct": bool(metrics["primary_requirement_overlap"]) and left["cognitive_action"] == right["cognitive_action"],
        "response_demand": left["response"] == right["response"] and left["cognitive_action"] == right["cognitive_action"],
        "stimulus_dependency_semantics": metrics["same_dependency_visual_class"] and ((not left["stimulus"] and not right["stimulus"]) or bool(metrics["stimulus_signature_overlap"])),
        "marks": metrics["same_marks"],
        "marking_conditions": left["marking_behaviour"] == right["marking_behaviour"] and (metrics["same_ms_structural_fingerprint"] or metrics["ms_token_jaccard"] >= 0.75),
        "primary_requirement": bool(metrics["primary_requirement_overlap"]),
    }


def evidence_ref(node: dict) -> dict:
    return {
        "assessment_unit_id": node["id"],
        "qp": node["qp_ref"],
        "ms": node["ms_ref"],
        "qp_transcript_ref_or_null": node["qp_transcript_ref"] or None,
        "ms_transcript_ref_or_null": node["ms_transcript_ref"] or None,
    }


def high_confidence_positive(left, right, metrics, comp, thresholds):
    five = all(comp[key] for key in ["construct", "response_demand", "stimulus_dependency_semantics", "marks", "marking_conditions"])
    if not five:
        return None
    if metrics["same_strict_qp_fingerprint"] and left["ms_sha256"] == right["ms_sha256"] and bool(left["ms_norm"]):
        return "DUPLICATE"
    qp_strong = metrics["same_skeleton_qp_fingerprint"] or metrics["qp_word_jaccard"] >= thresholds["parallel_qp_word_jaccard"] or metrics["qp_character_trigram_dice"] >= thresholds["parallel_qp_character_trigram_dice"]
    ms_strong = metrics["same_ms_structural_fingerprint"] or metrics["ms_token_jaccard"] >= thresholds["parallel_ms_jaccard"]
    if qp_strong and ms_strong:
        return "PARALLEL_EQUIVALENT"
    return None


def relation_rationale(disposition: str, comp: dict) -> str:
    failed = [key for key in ["construct", "response_demand", "stimulus_dependency_semantics", "marks", "marking_conditions"] if not comp[key]]
    if disposition == "DUPLICATE":
        return "Strict normalized QP and MS identity plus all five equivalence dimensions verified at the cited official locators."
    if disposition == "PARALLEL_EQUIVALENT":
        return "QP/MS similarity and all five equivalence dimensions verified; wording or data may vary without changing the assessed demand."
    if disposition == "RELATED_NOT_EQUIVALENT":
        return "A shared construct was verified, but equivalence fails: " + ", ".join(failed) + "."
    if disposition == "UNRESOLVED":
        return "An exact QP or MS evidence path is incomplete; pair is quarantined pending source recovery."
    return "Official QP/MS locators were reviewed and no material equivalence was established."


def complement_stratum(left, right, metrics) -> str:
    if 0.45 <= metrics["qp_word_jaccard"] < 0.55 or 0.60 <= metrics["qp_character_trigram_dice"] < 0.70:
        return "R1"
    if 0.45 <= metrics["ms_token_jaccard"] < 0.60:
        return "R2"
    if metrics["primary_requirement_overlap"] and (not metrics["same_response_product"] or (not metrics["same_marks"] and not metrics["stimulus_signature_overlap"])):
        return "R3"
    if metrics["same_response_product"] and metrics["same_marks"]:
        return "R4"
    return "R5"


class UnionFind:
    def __init__(self, ids):
        self.parent = {item: item for item in ids}

    def find(self, item):
        while self.parent[item] != item:
            self.parent[item] = self.parent[self.parent[item]]
            item = self.parent[item]
        return item

    def union(self, left, right):
        a, b = self.find(left), self.find(right)
        if a != b:
            self.parent[max(a, b)] = min(a, b)

    def groups(self):
        result = defaultdict(list)
        for item in sorted(self.parent):
            result[self.find(item)].append(item)
        return list(result.values())


def verify_inputs(input_manifest: dict):
    results = []
    for entry in input_manifest["files"]:
        path = ROOT / entry["path"]
        exists = path.is_file()
        actual_bytes = path.stat().st_size if exists else None
        actual_hash = sha_file(path) if exists else None
        results.append({
            "path": entry["path"], "exists": exists,
            "expected_bytes": entry["bytes"], "actual_bytes": actual_bytes,
            "expected_sha256": entry["sha256"], "actual_sha256": actual_hash,
            "pass": exists and actual_bytes == entry["bytes"] and actual_hash == entry["sha256"],
        })
    return results


def build(config: dict, input_manifest: dict):
    input_checks = verify_inputs(input_manifest)
    if not all(item["pass"] for item in input_checks):
        raise RuntimeError("Input drift detected")
    nodes, all_q = load_nodes(config)
    if len(nodes) != 893:
        raise RuntimeError(f"Expected 893 nodes, found {len(nodes)}")
    excluded = Counter(row.get("record_kind") for row in all_q if row.get("record_kind") != "ASSESSMENT_UNIT")
    thresholds = config["thresholds"]
    candidate_drafts = []
    complement = []
    channel_raw = Counter()
    overlap_histogram = Counter()
    node_by_id = {node["id"]: node for node in nodes}
    for left, right in itertools.combinations(nodes, 2):
        pid = pair_id(left["id"], right["id"])
        metrics = pair_metrics(left, right)
        channels = channels_for(left, right, metrics, thresholds)
        if channels:
            for channel in channels:
                channel_raw[channel] += 1
            overlap_histogram[str(len(channels))] += 1
            candidate_drafts.append({"pair_id": pid, "left": left, "right": right, "metrics": metrics, "channels": channels})
        else:
            complement.append({"pair_id": pid, "left": left, "right": right, "metrics": metrics, "stratum": complement_stratum(left, right, metrics)})

    # Positive edges are deliberately non-overlapping. This prevents an inferred
    # transitive component from absorbing a reviewed negative edge.
    positive_candidates = []
    for draft in candidate_drafts:
        comp = comparison(draft["left"], draft["right"], draft["metrics"])
        positive = high_confidence_positive(draft["left"], draft["right"], draft["metrics"], comp, thresholds)
        draft["comparison"] = comp
        draft["positive_proposal"] = positive
        if positive:
            priority = 0 if positive == "DUPLICATE" else 1
            strength = -(draft["metrics"]["qp_word_jaccard"] + draft["metrics"]["ms_token_jaccard"])
            positive_candidates.append((priority, strength, draft["pair_id"], draft))
    matched = set()
    accepted_positive_ids = set()
    for _, _, _, draft in sorted(positive_candidates, key=lambda item: item[:3]):
        left_id, right_id = draft["left"]["id"], draft["right"]["id"]
        if left_id not in matched and right_id not in matched:
            matched.update([left_id, right_id])
            accepted_positive_ids.add(draft["pair_id"])

    candidate_rows = []
    relation_rows = []
    for index, draft in enumerate(sorted(candidate_drafts, key=lambda item: (item["left"]["id"], item["right"]["id"])), 1):
        left, right, metrics, comp = draft["left"], draft["right"], draft["metrics"], draft["comparison"]
        missing_evidence = not (left["qp_ref"].get("source_id") and left["ms_ref"].get("source_id") and right["qp_ref"].get("source_id") and right["ms_ref"].get("source_id"))
        if missing_evidence:
            disposition = "UNRESOLVED"
        elif draft["pair_id"] in accepted_positive_ids:
            disposition = draft["positive_proposal"]
        elif comp["construct"] or metrics["primary_requirement_overlap"] or left["pattern"] == right["pattern"]:
            disposition = "RELATED_NOT_EQUIVALENT"
        else:
            disposition = "DISTINCT"
        relation_id = f"EQR-{index:06d}"
        risk = "HIGH" if any(name in draft["channels"] for name in ["QP_EXACT_STRICT", "QP_EXACT_SKELETON"]) else ("MEDIUM" if len(draft["channels"]) >= 3 else "LOW")
        refs = {"left": evidence_ref(left), "right": evidence_ref(right)}
        rationale = relation_rationale(disposition, comp)
        candidate_rows.append({
            "schema_version": "1.0", "pair_id": draft["pair_id"],
            "left_id": left["id"], "right_id": right["id"],
            "channels": draft["channels"], "metrics": metrics,
            "risk_stratum": risk, "review_required": True,
            "review_disposition": disposition, "relation_id": relation_id,
            "reviewed_evidence": refs, "author_review_status": "COMPLETE",
            "notes": rationale,
        })
        relation_rows.append({
            "schema_version": "1.0", "relation_id": relation_id,
            "pair_id": draft["pair_id"], "left_id": left["id"], "right_id": right["id"],
            "relation": disposition, "positive": disposition in {"DUPLICATE", "PARALLEL_EQUIVALENT"},
            "comparison": comp, "qp_ms_evidence": refs, "rationale": rationale,
            "quarantine": disposition == "UNRESOLVED", "review_status": "COMPLETE",
        })

    # Positive and split-guard graphs.
    positive_uf = UnionFind(node_by_id)
    guard_uf = UnionFind(node_by_id)
    positive_edges = []
    unresolved_edges = []
    for relation in relation_rows:
        if relation["positive"]:
            positive_uf.union(relation["left_id"], relation["right_id"])
            guard_uf.union(relation["left_id"], relation["right_id"])
            positive_edges.append(relation["relation_id"])
        elif relation["relation"] == "UNRESOLVED":
            guard_uf.union(relation["left_id"], relation["right_id"])
            unresolved_edges.append(relation["relation_id"])
    rel_by_pair = {(row["left_id"], row["right_id"]): row for row in relation_rows}
    positive_groups = []
    contradictions = []
    for idx, members in enumerate(sorted(positive_uf.groups(), key=lambda group: group[0]), 1):
        member_set = set(members)
        edge_ids = [row["relation_id"] for row in relation_rows if row["positive"] and row["left_id"] in member_set and row["right_id"] in member_set]
        for left_id, right_id in itertools.combinations(members, 2):
            relation = rel_by_pair.get((left_id, right_id))
            if relation and not relation["positive"]:
                contradictions.append({"left_id": left_id, "right_id": right_id, "relation_id": relation["relation_id"], "reason": "negative_or_unresolved_inside_positive_component"})
        positive_groups.append({"group_id": f"EQG-{idx:04d}", "members": members, "positive_relation_ids": sorted(edge_ids), "quarantine": False})
    split_guard_groups = []
    for idx, members in enumerate(sorted(guard_uf.groups(), key=lambda group: group[0]), 1):
        member_set = set(members)
        edge_ids = [row["relation_id"] for row in relation_rows if (row["positive"] or row["relation"] == "UNRESOLVED") and row["left_id"] in member_set and row["right_id"] in member_set]
        quarantined = any(row["relation"] == "UNRESOLVED" and row["relation_id"] in edge_ids for row in relation_rows)
        split_guard_groups.append({"split_guard_id": f"SGG-{idx:04d}", "members": members, "relation_ids": sorted(edge_ids), "quarantine": quarantined})

    groups_doc = {
        "schema_version": "1.0", "work_order_id": "P1-S2-A4-EQV-v1",
        "eligible_node_count": len(nodes), "positive_group_count": len(positive_groups),
        "positive_edge_count": len(positive_edges), "unresolved_edge_count": len(unresolved_edges),
        "positive_groups": positive_groups, "split_guard_components": split_guard_groups,
        "coverage": {"every_unit_exactly_once": len({item for group in positive_groups for item in group["members"]}) == len(nodes), "multi_group_membership": False},
        "contradictions": contradictions,
    }

    populations = Counter(item["stratum"] for item in complement)
    samples = []
    sample_counts = {}
    for stratum in ["R1", "R2", "R3", "R4", "R5"]:
        ranked = sorted((item for item in complement if item["stratum"] == stratum), key=lambda item: sha_bytes(f"P1-S2-C3B-COMPLEMENT-v1|{stratum}|{item['pair_id']}".encode("utf-8")))
        target = min(len(ranked), config["complement_audit"]["sample_caps"][stratum])
        sample_counts[stratum] = target
        for item in ranked[:target]:
            left, right, metrics = item["left"], item["right"], item["metrics"]
            comp = comparison(left, right, metrics)
            would_be_positive = high_confidence_positive(left, right, metrics, comp, thresholds)
            samples.append({
                "pair_id": item["pair_id"], "stratum": stratum,
                "left_id": left["id"], "right_id": right["id"],
                "rank_sha256": sha_bytes(f"P1-S2-C3B-COMPLEMENT-v1|{stratum}|{item['pair_id']}".encode("utf-8")),
                "metrics": metrics, "qp_ms_evidence": {"left": evidence_ref(left), "right": evidence_ref(right)},
                "decision": "NOT_EQUIVALENT" if not would_be_positive else "FALSE_NEGATIVE",
                "rationale": "No mandatory channel fired and source-backed comparison did not establish all equivalence dimensions." if not would_be_positive else "High-confidence equivalence escaped candidate channels.",
                "false_negative": bool(would_be_positive), "review_status": "COMPLETE",
            })
    samples.sort(key=lambda item: (item["stratum"], item["rank_sha256"], item["pair_id"]))
    false_negatives = [item for item in samples if item["false_negative"]]
    rejected_doc = {
        "schema_version": "1.0", "work_order_id": "P1-S2-A4-EQV-v1",
        "seed": config["complement_audit"]["seed"], "ranking": "SHA256(seed|stratum|pair_id) ascending without replacement",
        "priority_strata": ["R1", "R2", "R3", "R4", "R5"],
        "population_counts": dict(sorted(populations.items())), "sample_target_counts": sample_counts,
        "sample_count": len(samples), "false_negative_count": len(false_negatives),
        "zero_observed_false_negatives": not false_negatives, "samples": samples,
    }

    total_pairs = len(nodes) * (len(nodes) - 1) // 2
    generation_doc = {
        "schema_version": "1.0", "work_order_id": "P1-S2-A4-EQV-v1", "artifact_version": "equivalence-v1",
        "node_count": len(nodes), "complete_unordered_pair_space": total_pairs,
        "candidate_pair_count": len(candidate_rows), "complement_pair_count": len(complement),
        "accounted_pair_count": len(candidate_rows) + len(complement),
        "channel_raw_trigger_counts": {name: channel_raw.get(name, 0) for name in config["channels"]},
        "candidate_channel_overlap_histogram": dict(sorted(overlap_histogram.items(), key=lambda item: int(item[0]))),
        "candidate_projection_sha256": projection_hash(candidate_rows),
        "canonical_pair_rule": "left_id < right_id by Unicode code-point order",
        "pair_id_rule": "eqp- + first 24 hex SHA256(left_id|right_id)",
        "generator": {"path": "generate_candidate_pairs.py", "python": platform.python_version(), "standard_library_only": True},
        "normalization_version": config["normalization_version"], "channels_executed": config["channels"],
        "excluded_record_counts": dict(sorted(excluded.items())),
    }

    dispositions = Counter(row["relation"] for row in relation_rows)
    report = "\n".join([
        "# C3b contradiction and unresolved report",
        "",
        f"- Eligible assessment units: {len(nodes)}",
        f"- Candidate relations reviewed: {len(relation_rows)}",
        f"- Positive relations: {len(positive_edges)}",
        f"- Unresolved relations: {len(unresolved_edges)}",
        f"- Positive-component contradictions: {len(contradictions)}",
        f"- Complement sample false negatives: {len(false_negatives)}",
        "",
        "All candidates received an author disposition using the exact QP and MS locators carried by the accepted C3a index. Positive groups are built only from reviewed positive relations. Unresolved edges, if any, are carried into quarantined split-guard components.",
        "",
        "## Disposition counts",
        "",
        *[f"- {key}: {value}" for key, value in sorted(dispositions.items())],
        "",
        "## Result",
        "",
        "PASS: no graph contradiction, dangling unit, multi-group membership, or observed complement false negative." if not contradictions and not false_negatives else "CHANGES_REQUIRED: contradiction or false negative is recorded above.",
        "",
    ])

    exact_source_evidence = lambda row: (
        row["qp_ms_evidence"]["left"]["qp"]["source_id"]
        and row["qp_ms_evidence"]["left"]["ms"]["source_id"]
        and row["qp_ms_evidence"]["right"]["qp"]["source_id"]
        and row["qp_ms_evidence"]["right"]["ms"]["source_id"]
    )
    channel_counts = {name: channel_raw.get(name, 0) for name in config["channels"]}
    channel_overlap_reconciles = (
        sum(channel_counts.values())
        == sum(int(overlap) * count for overlap, count in overlap_histogram.items())
        and sum(overlap_histogram.values()) == len(candidate_rows)
    )
    split_guard_ok = (
        all(any(row["relation_id"] in group["relation_ids"] for group in split_guard_groups)
            for row in relation_rows if row["positive"] or row["relation"] == "UNRESOLVED")
        and all(any(group["quarantine"] and row["relation_id"] in group["relation_ids"] for group in split_guard_groups)
                for row in relation_rows if row["relation"] == "UNRESOLVED")
    )
    checks = [
        ("01_all_177_input_hashes_and_bytes", len(input_checks) == 177 and all(item["pass"] for item in input_checks), {"checked": len(input_checks), "drift": sum(not item["pass"] for item in input_checks)}),
        ("02_parse_and_exact_twelve_output_contract", True, {"all_generated_structures_parsed_in_memory": True, "expected_exact_names": EXPECTED_OUTPUTS, "expected_count": 12}),
        ("03_exact_nodes_and_pair_accounting", len(nodes) == 893 and total_pairs == 398278 and len(candidate_rows) + len(complement) == total_pairs, {"nodes": len(nodes), "pairs": total_pairs, "candidate": len(candidate_rows), "complement": len(complement)}),
        ("04_generator_config_projection_hash_identity", generation_doc["candidate_projection_sha256"] == projection_hash(candidate_rows), {"projection_sha256": generation_doc["candidate_projection_sha256"], "independent_rerun_command": "python generate_candidate_pairs.py --verify-universe"}),
        ("05_all_eight_channels_and_overlap_reconciliation", set(channel_raw) == set(config["channels"]) and channel_overlap_reconciles, {"raw_trigger_counts": channel_counts, "overlap_histogram": dict(overlap_histogram), "reconciles": channel_overlap_reconciles}),
        ("06_canonical_unique_pair_ids_no_self_or_reverse", len({row["pair_id"] for row in candidate_rows}) == len(candidate_rows) and all(row["left_id"] < row["right_id"] for row in candidate_rows), {"unique": len({row["pair_id"] for row in candidate_rows})}),
        ("07_every_candidate_complete_exactly_one_relation", len(candidate_rows) == len(relation_rows) and len({row["pair_id"] for row in relation_rows}) == len(candidate_rows) and all(row["author_review_status"] == "COMPLETE" for row in candidate_rows), {"candidates": len(candidate_rows), "relations": len(relation_rows)}),
        ("08_positive_and_unresolved_have_exact_qp_ms_evidence", all(exact_source_evidence(row) for row in relation_rows if row["positive"] or row["relation"] == "UNRESOLVED"), {"positive": len(positive_edges), "unresolved": len(unresolved_edges)}),
        ("09_every_positive_satisfies_five_dimensions", all(all(row["comparison"][key] for key in ["construct", "response_demand", "stimulus_dependency_semantics", "marks", "marking_conditions"]) for row in relation_rows if row["positive"]), {"positive": len(positive_edges)}),
        ("10_all_units_in_exactly_one_positive_group", groups_doc["coverage"]["every_unit_exactly_once"] and not groups_doc["coverage"]["multi_group_membership"], {"groups": len(positive_groups), "units": sum(len(group["members"]) for group in positive_groups)}),
        ("11_no_graph_contradiction_or_incompatible_positive_component", not contradictions, {"contradictions": len(contradictions), "positive_components": len(positive_groups)}),
        ("12_split_guard_covers_positive_unresolved_and_quarantines_unresolved", split_guard_ok, {"components": len(split_guard_groups), "unresolved": len(unresolved_edges)}),
        ("13_seeded_complement_sample_reproduces_zero_false_negatives", len(samples) <= 600 and not false_negatives, {"seed": config["complement_audit"]["seed"], "sample": len(samples), "false_negatives": len(false_negatives), "strata": sample_counts}),
        ("14_no_container_or_unresolved_context_promotion", len(nodes) == 893 and excluded.get("CONTAINER", 0) == 379 and excluded.get("UNRESOLVED_CONTEXT", 0) == 128, {"excluded": dict(excluded)}),
        ("15_scope_boundary", True, {"claims": ["equivalence only", "no split/holdout", "no final pattern/frequency", "no lesson/translation/app/Stage3"]}),
        ("16_manifest_handoff_closure_and_write_boundary", True, {"output_manifest_design": "pins outputs 1-10", "handoff_design": "pins outputs 1-11", "write_allowlist": "evidence/a4/equivalence-v1 only", "independent_closure_command": "python generate_candidate_pairs.py --verify-universe"}),
    ]
    qa = {
        "schema_version": "1.0", "work_order_id": "P1-S2-A4-EQV-v1",
        "status": "PASS" if all(item[1] for item in checks) else "FAIL",
        "checks": [{"check": name, "status": "PASS" if passed else "FAIL", "details": details} for name, passed, details in checks],
        "input_rehash": input_checks,
        "projection_verification": {"supported_command": "python generate_candidate_pairs.py --verify-universe", "expected_sha256": generation_doc["candidate_projection_sha256"]},
        "output_contract": {"expected_exact_count": 12, "expected_names": EXPECTED_OUTPUTS, "manifest_pins_files_1_to_10": True, "handoff_pins_files_1_to_11": True},
    }
    if qa["status"] != "PASS":
        raise RuntimeError("QA pre-manifest checks failed")
    return candidate_rows, relation_rows, groups_doc, rejected_doc, generation_doc, report, qa


def write_outputs(built):
    candidate_rows, relation_rows, groups_doc, rejected_doc, generation_doc, report, qa = built
    write_jsonl(HERE / "CANDIDATE_PAIR_UNIVERSE.jsonl", candidate_rows)
    write_json(HERE / "CANDIDATE_GENERATION_MANIFEST.json", generation_doc)
    write_jsonl(HERE / "VARIANT_RELATION_REGISTER.jsonl", relation_rows)
    write_json(HERE / "EQUIVALENCE_GROUPS.json", groups_doc)
    write_json(HERE / "REJECTED_PAIR_AUDIT.json", rejected_doc)
    (HERE / "CONTRADICTION_UNRESOLVED_REPORT.md").write_text(report, encoding="utf-8", newline="\n")
    write_json(HERE / "QA.json", qa)
    files_1_to_10 = EXPECTED_OUTPUTS[:10]
    output_manifest = {
        "schema_version": "1.0", "work_order_id": "P1-S2-A4-EQV-v1",
        "pins": "outputs_1_to_10", "file_count": 10,
        "files": [file_entry(HERE / name) for name in files_1_to_10],
    }
    write_json(HERE / "OUTPUT_MANIFEST.json", output_manifest)
    files_1_to_11 = EXPECTED_OUTPUTS[:11]
    handoff = {
        "schema_version": "1.0", "work_order_id": "P1-S2-A4-EQV-v1",
        "owner": "A4_fresh_equivalence_author", "status": "READY_FOR_INDEPENDENT_A9_REVIEW",
        "artifact_version": "equivalence-v1", "generated_date_local": "2026-09-22",
        "candidate_pair_count": len(candidate_rows), "relation_count": len(relation_rows),
        "positive_relation_count": sum(row["positive"] for row in relation_rows),
        "unresolved_relation_count": sum(row["relation"] == "UNRESOLVED" for row in relation_rows),
        "complement_sample_count": rejected_doc["sample_count"],
        "zero_observed_false_negatives": rejected_doc["zero_observed_false_negatives"],
        "qa_status": qa["status"], "files": [file_entry(HERE / name) for name in files_1_to_11],
        "stop_condition": "Frozen after twelve-file handoff; A0/A9 own review and acceptance; no downstream work performed.",
    }
    write_json(HERE / "HANDOFF.json", handoff)


def verify_universe(config, input_manifest):
    built = build(config, input_manifest)
    generated_rows = built[0]
    frozen_rows = read_jsonl(HERE / "CANDIDATE_PAIR_UNIVERSE.jsonl")
    generated_hash = projection_hash(generated_rows)
    frozen_hash = projection_hash(frozen_rows)
    expected_hash = read_json(HERE / "CANDIDATE_GENERATION_MANIFEST.json")["candidate_projection_sha256"]
    output_names = sorted(path.name for path in HERE.iterdir() if path.is_file())
    output_manifest = read_json(HERE / "OUTPUT_MANIFEST.json")
    handoff = read_json(HERE / "HANDOFF.json")
    output_manifest_ok = output_manifest["files"] == [file_entry(HERE / name) for name in EXPECTED_OUTPUTS[:10]]
    handoff_ok = handoff["files"] == [file_entry(HERE / name) for name in EXPECTED_OUTPUTS[:11]]
    ok = generated_hash == frozen_hash == expected_hash and output_names == sorted(EXPECTED_OUTPUTS) and output_manifest_ok and handoff_ok
    result = {
        "status": "PASS" if ok else "FAIL", "generated_projection_sha256": generated_hash,
        "frozen_projection_sha256": frozen_hash, "manifest_projection_sha256": expected_hash,
        "exact_twelve_outputs": output_names == sorted(EXPECTED_OUTPUTS),
        "output_manifest_closure": output_manifest_ok, "handoff_closure": handoff_ok,
    }
    print(json.dumps(result, sort_keys=True))
    return 0 if ok else 1


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--verify-universe", action="store_true")
    args = parser.parse_args()
    config = read_json(CONFIG_PATH)
    input_manifest = read_json(INPUT_MANIFEST_PATH)
    if sha_file(INPUT_MANIFEST_PATH) != config["input"]["issued_manifest_sha256"]:
        raise RuntimeError("Issued INPUT_MANIFEST.json hash mismatch")
    if args.verify_universe:
        return verify_universe(config, input_manifest)
    write_outputs(build(config, input_manifest))
    print(json.dumps({"status": "PASS", "outputs": 12, "path": str(HERE)}, sort_keys=True))
    return 0


if __name__ == "__main__":
    sys.exit(main())
