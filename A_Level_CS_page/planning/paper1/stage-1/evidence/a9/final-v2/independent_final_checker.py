#!/usr/bin/env python3
"""Independent A9 final checker for Paper 1 Stage 1 aggregate.

This checker intentionally does not import or invoke A0's aggregate validator.
It reads frozen source/candidate/aggregate evidence and writes only the A9
final-v2 input manifest and machine-check result.
"""

from __future__ import annotations

import hashlib
import json
import re
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any


ROOT = Path.cwd()
S1 = ROOT / "A_Level_CS_page/planning/paper1/stage-1"
OUT = S1 / "evidence/a9/final-v2"
META = {"record_type", "batch_id", "batch_version", "batch_root", "batch_gate"}
ALLOWED_STATUS = {
    "EXTRACTED",
    "VISUAL_CHECK_REQUIRED",
    "MS_LINKED",
    "UNRESOLVED",
    "REVIEWED",
    "ACCEPTED",
}

FROZEN = {
    "A_Level_CS_page/planning/paper1/stage-1/CORPUS_INDEX.jsonl": (2328319, "9f5a2f45430234c67a780f50c82134654f60d49bca911d5b5d40b381acd8b92d"),
    "A_Level_CS_page/planning/paper1/stage-1/CORPUS_MANIFEST.json": (6751, "0c053152796cd539a833d8a91dbdf2954539e413824f9b961b5f522047076e0a"),
    "A_Level_CS_page/planning/paper1/stage-1/UNRESOLVED_REGISTER.md": (5511, "35dfb66a70c9c2922485e18a4240170b33bc37da81ae7e5e274b738d91f4d0d0"),
    "A_Level_CS_page/planning/paper1/stage-1/FINAL_INTEGRITY_CHECK.json": (4826, "1f81e4a20a3fe99f48d67b4aaec927d54b89213c3d3f174aed6e693f2f455e2d"),
    "A_Level_CS_page/planning/paper1/stage-1/STAGE1_SUMMARY.md": (4284, "e6468960552a2d1418d5131ae8d9ddb1519effd7062a30ec5df0f9e9a9ef9495"),
    "A_Level_CS_page/planning/paper1/stage-1/evidence/a0/final/validate_aggregate.py": (16737, "7e674f9998dcecd4b2e33830564212d1613f7d4aad0bc8bfa443dc2c8630d040"),
    "A_Level_CS_page/planning/paper1/stage-0/evidence/a2/SOURCE_MANIFEST.json": (121886, "195a68ad98b4739dff0d3496dc93ba9e85d67d2dae0d88e3d4e4a088f1259c9c"),
    "A_Level_CS_page/planning/paper1/stage-1/CORPUS_SCHEMA.md": (3675, "9fe71d4719b0c8f9fd6d6fd6fb0316c7f9a840b6b964634889ea6d98245a1f1f"),
    "A_Level_CS_page/planning/paper1/stage-1/EXTRACTION_POLICY.md": (2535, "97bd6c69ea8d459ea99713e943c2d092a88999b6df7cb315d2820547789c11f2"),
}

DECISIONS = {
    "B21": ("A_Level_CS_page/planning/paper1/stage-1/evidence/a0/B21_BATCH_DECISION_V6.json", "15ae3f00d8920c38a0a55e1ebc282cc6f77a93010043b41740eab80b31c64645"),
    "B22": ("A_Level_CS_page/planning/paper1/stage-1/evidence/a0/B22_BATCH_DECISION_V5.json", "fc5f990ad9e22d42b7409aad504ea0ce2255f0bf9e0c7905a14fe2506a1f887a"),
    "B23": ("A_Level_CS_page/planning/paper1/stage-1/evidence/a0/B23_BATCH_DECISION_V3.json", "653ea257ab0d78a16a2fc7771f5f95a63d6fc925df08b3085f45b235ac975bca"),
    "B24": ("A_Level_CS_page/planning/paper1/stage-1/evidence/a0/B24_BATCH_DECISION_V2.json", "76797cebe4aae2932751a60a7886d4a63ded5d943d469d5fd66961b475bbe101"),
    "B25": ("A_Level_CS_page/planning/paper1/stage-1/evidence/a0/B25_BATCH_DECISION_V3.json", "0d4a0b6725df45638f2ba5efca0f7a548ec20ff1ae77e9b5657788b34fda1ca6"),
}

EXPECTED_VERSIONS = {
    "B21": "B21-A2-v6",
    "B22": "B22-A2-v5",
    "B23": "B23-A2-v3",
    "B24": "B24-A2-v2",
    "B25": "B25-A2-v3",
}

EXPECTED_COUNTS = {
    "source_file": 60,
    "page": 811,
    "question": 247,
    "part": 1025,
    "marking_item": 927,
    "visual_region": 534,
}


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def load_jsonl(path: Path) -> list[dict[str, Any]]:
    result = []
    for line_no, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        if line.strip():
            try:
                result.append(json.loads(line))
            except Exception as exc:
                raise ValueError(f"{path}:{line_no}: {exc}") from exc
    return result


def canonical(record: dict[str, Any]) -> str:
    body = {k: v for k, v in record.items() if k not in META}
    return json.dumps(body, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


errors: list[dict[str, Any]] = []
checks: dict[str, Any] = {}


def fail(check: str, message: str, affected: Any = None) -> None:
    errors.append({"check": check, "message": message, "affected": affected})


def record_check(name: str, passed: bool, evidence: Any) -> None:
    checks[name] = {"result": "PASS" if passed else "FAIL", "evidence": evidence}


# 1. Frozen inputs and decision pins.
input_entries = []
frozen_ok = True
for rel, (expected_bytes, expected_hash) in FROZEN.items():
    path = ROOT / rel
    actual_exists = path.is_file()
    actual_bytes = path.stat().st_size if actual_exists else None
    actual_hash = sha256(path) if actual_exists else None
    ok = actual_exists and actual_bytes == expected_bytes and actual_hash == expected_hash
    frozen_ok &= ok
    if not ok:
        fail("frozen_inputs", "Frozen input drift or missing", rel)
    input_entries.append({
        "path": rel,
        "expected_bytes": expected_bytes,
        "actual_bytes": actual_bytes,
        "expected_sha256": expected_hash,
        "actual_sha256": actual_hash,
        "match": ok,
    })

decision_entries = []
decision_ok = True
for batch, (rel, expected_hash) in DECISIONS.items():
    path = ROOT / rel
    actual = sha256(path) if path.is_file() else None
    ok = actual == expected_hash
    decision_ok &= ok
    if not ok:
        fail("decision_pins", "Decision drift or missing", rel)
    decision_entries.append({"batch_id": batch, "path": rel, "expected_sha256": expected_hash, "actual_sha256": actual, "match": ok})
record_check("frozen_inputs_no_drift", frozen_ok, {"matched": sum(x["match"] for x in input_entries), "total": len(input_entries)})
record_check("accepted_decision_hashes", decision_ok, {"matched": sum(x["match"] for x in decision_entries), "total": len(decision_entries)})

corpus_path = S1 / "CORPUS_INDEX.jsonl"
rows = load_jsonl(corpus_path)
manifest = load_json(S1 / "CORPUS_MANIFEST.json")
by_type: dict[str, list[dict[str, Any]]] = defaultdict(list)
for row in rows:
    by_type[row.get("record_type")].append(row)

# 2. Counts.
actual_counts = {k: len(v) for k, v in by_type.items()}
counts_ok = len(rows) == 3604 and actual_counts == EXPECTED_COUNTS
if not counts_ok:
    fail("aggregate_counts", "Aggregate record counts differ", {"actual": actual_counts, "expected": EXPECTED_COUNTS, "total": len(rows)})
record_check("aggregate_parse_and_exact_counts", counts_ok, {"total": len(rows), "by_type": actual_counts})

# 3. Accepted batch metadata and exact versions/roots.
accepted_by_batch = {b["batch_id"]: b for b in manifest["accepted_batches"]}
metadata_errors = []
for i, row in enumerate(rows, 1):
    batch = row.get("batch_id")
    entry = accepted_by_batch.get(batch)
    expected_root = entry.get("candidate_root") if entry else None
    if (
        batch not in EXPECTED_VERSIONS
        or row.get("batch_version") != EXPECTED_VERSIONS.get(batch)
        or row.get("batch_root") != expected_root
        or row.get("batch_gate") != "ACCEPTED"
    ):
        metadata_errors.append({"line": i, "id": row.get("id") or row.get("source_id"), "batch": batch})
if metadata_errors:
    fail("accepted_batch_metadata", "Unexpected/superseded candidate metadata or non-accepted gate", metadata_errors[:20])
record_check("only_accepted_candidate_versions", not metadata_errors, {
    "versions": sorted({(r.get("batch_id"), r.get("batch_version")) for r in rows}),
    "all_batch_gate_accepted": all(r.get("batch_gate") == "ACCEPTED" for r in rows),
    "errors": len(metadata_errors),
})

# 4. Twenty canonical multiset comparisons.
comparison_specs = {
    "PAGE_INDEX.jsonl": "page",
    "QUESTION_INDEX.jsonl": ("question", "part"),
    "MARKING_INDEX.jsonl": "marking_item",
    "VISUAL_MANIFEST.json": "visual_region",
}
comparisons = []
for batch, entry in accepted_by_batch.items():
    root = ROOT / entry["candidate_root"]
    for filename, record_types in comparison_specs.items():
        if filename == "VISUAL_MANIFEST.json":
            visual_payload = load_json(root / filename)
            if isinstance(visual_payload, list):
                candidate = visual_payload
            else:
                candidate = visual_payload.get("visual_regions", visual_payload.get("regions", []))
        else:
            candidate = load_jsonl(root / filename)
        types = (record_types,) if isinstance(record_types, str) else record_types
        aggregate = [r for r in rows if r["batch_id"] == batch and r["record_type"] in types]
        left = Counter(canonical(r) for r in candidate)
        right = Counter(canonical(r) for r in aggregate)
        ok = left == right
        if not ok:
            fail("candidate_multisets", "Canonical candidate/aggregate multiset mismatch", {"batch": batch, "file": filename})
        comparisons.append({
            "batch_id": batch,
            "candidate_file": filename,
            "record_types": list(types),
            "candidate_count": len(candidate),
            "aggregate_count": len(aggregate),
            "equal": ok,
            "candidate_only": sum((left - right).values()),
            "aggregate_only": sum((right - left).values()),
        })
record_check("accepted_candidate_canonical_multisets", all(x["equal"] for x in comparisons) and len(comparisons) == 20, {"comparisons": comparisons})

# 5. Stage 0 source set, physical hashes, pages, and locator ranges.
stage0 = load_json(ROOT / "A_Level_CS_page/planning/paper1/stage-0/evidence/a2/SOURCE_MANIFEST.json")
stage0_sources = {
    x["id"]: x for x in stage0["primary_sources"]
    if x.get("kind") in {"qp", "ms"} and x.get("year") in range(2021, 2026)
}
agg_sources = {x["source_id"]: x for x in by_type["source_file"]}
source_set_ok = len(stage0_sources) == 60 and set(stage0_sources) == set(agg_sources)
source_mismatches = []
physical = []
for sid, source in agg_sources.items():
    baseline = stage0_sources.get(sid)
    if baseline is None:
        continue
    fields = {
        "sha256": source.get("sha256") == baseline.get("sha256"),
        "bytes": source.get("bytes") == baseline.get("bytes"),
        "page_count": source.get("page_count") == baseline.get("page_count"),
        "kind": source.get("kind") == baseline.get("kind"),
        "year": source.get("year") == baseline.get("year"),
        "component": source.get("component") == baseline.get("component"),
        "relative_path": source.get("relative_path") == baseline.get("path"),
    }
    if not all(fields.values()):
        source_mismatches.append({"source_id": sid, "field_matches": fields})
    pdf = ROOT / source["relative_path"]
    actual_hash = sha256(pdf) if pdf.is_file() else None
    actual_bytes = pdf.stat().st_size if pdf.is_file() else None
    ok = actual_hash == source["sha256"] and actual_bytes == source["bytes"]
    physical.append({"source_id": sid, "path": source["relative_path"], "sha256": actual_hash, "bytes": actual_bytes, "match": ok})
    if not ok:
        fail("physical_pdf_hashes", "Original PDF missing or hash/bytes mismatch", sid)
if not source_set_ok or source_mismatches:
    fail("stage0_source_identity", "Aggregate source set/metadata differs from Stage 0", source_mismatches[:20])
record_check("stage0_source_set_and_metadata", source_set_ok and not source_mismatches, {"stage0_count": len(stage0_sources), "aggregate_count": len(agg_sources), "mismatches": len(source_mismatches)})
record_check("all_original_pdfs_rehashed", len(physical) == 60 and all(x["match"] for x in physical), {"hashed": len(physical), "matched": sum(x["match"] for x in physical)})

page_keys = [(x["source_id"], x["pdf_page_1_based"]) for x in by_type["page"]]
page_counts = Counter(x["source_id"] for x in by_type["page"])
page_errors = []
for sid, source in agg_sources.items():
    observed = sorted(x[1] for x in page_keys if x[0] == sid)
    expected = list(range(1, source["page_count"] + 1))
    if observed != expected:
        page_errors.append({"source_id": sid, "observed_count": len(observed), "expected_count": len(expected)})
if len(set(page_keys)) != len(page_keys):
    page_errors.append({"duplicate_page_keys": len(page_keys) - len(set(page_keys))})
record_check("page_reconciliation_and_unique_keys", not page_errors and len(page_keys) == 811, {"page_rows": len(page_keys), "errors": page_errors})
if page_errors:
    fail("page_reconciliation", "Missing, duplicate, or out-of-range page rows", page_errors[:20])

def locator_ok(locator: Any, expected_kind: str | None = None) -> bool:
    if not isinstance(locator, dict):
        return False
    sid = locator.get("source_id")
    page = locator.get("pdf_page_1_based")
    source = agg_sources.get(sid)
    return bool(source and isinstance(page, int) and 1 <= page <= source["page_count"] and (expected_kind is None or source["kind"] == expected_kind))

locator_errors = []
for row in by_type["question"] + by_type["part"]:
    if not locator_ok(row.get("qp_locator"), "qp"):
        locator_errors.append({"id": row["id"], "field": "qp_locator"})
for row in by_type["part"]:
    loc = row.get("ms_locator_or_null")
    if loc is not None and not locator_ok(loc, "ms"):
        locator_errors.append({"id": row["id"], "field": "ms_locator_or_null"})
    if row.get("status") == "MS_LINKED" and loc is None:
        locator_errors.append({"id": row["id"], "field": "linked_part_missing_ms_locator"})
for row in by_type["marking_item"]:
    if not locator_ok(row.get("ms_locator"), "ms"):
        locator_errors.append({"id": row["id"], "field": "ms_locator"})
for row in by_type["visual_region"]:
    if not locator_ok({"source_id": row.get("source_id"), "pdf_page_1_based": row.get("pdf_page_1_based")}):
        locator_errors.append({"id": row["id"], "field": "visual_page"})
    page_ref = row.get("page_ref")
    if isinstance(page_ref, dict):
        page_ref_valid = page_ref.get("source_id") == row.get("source_id") and page_ref.get("pdf_page_1_based") == row.get("pdf_page_1_based")
    else:
        page_ref_valid = isinstance(page_ref, str) and bool(page_ref)
    if not page_ref_valid:
        locator_errors.append({"id": row["id"], "field": "page_ref"})
record_check("all_locators_in_range", not locator_errors, {"errors": locator_errors[:50], "error_count": len(locator_errors)})
if locator_errors:
    fail("locators", "Missing, wrong-kind, or out-of-range locator", locator_errors[:20])

# 6. Typed IDs, hierarchy/cycles, targets, relations/dependencies, file refs.
typed_rows = by_type["question"] + by_type["part"] + by_type["marking_item"] + by_type["visual_region"]
typed_ids = [x["id"] for x in typed_rows]
id_errors = []
if len(typed_ids) != len(set(typed_ids)):
    id_errors.append({"duplicate_ids": [k for k, v in Counter(typed_ids).items() if v > 1]})
record_check("typed_id_uniqueness", not id_errors and len(typed_ids) == 2733, {"checked": len(typed_ids), "errors": id_errors})
if id_errors:
    fail("typed_ids", "Duplicate typed IDs", id_errors)

questions = {x["id"]: x for x in by_type["question"]}
parts = {x["id"]: x for x in by_type["part"]}
marking = {x["id"]: x for x in by_type["marking_item"]}
visuals = {x["id"]: x for x in by_type["visual_region"]}
all_relation_ids = set(questions) | set(parts) | set(marking) | set(visuals)
hierarchy_errors = []
for q in questions.values():
    parent = q.get("parent_id_or_null")
    if parent is not None and parent not in questions:
        hierarchy_errors.append({"id": q["id"], "bad_question_parent": parent})
for p in parts.values():
    if p.get("question_id") not in questions:
        hierarchy_errors.append({"id": p["id"], "bad_question_id": p.get("question_id")})
    parent = p.get("parent_part_id_or_null")
    if parent is not None and (parent not in parts or parts[parent].get("question_id") != p.get("question_id")):
        hierarchy_errors.append({"id": p["id"], "bad_part_parent": parent})

def has_cycle(node: str, parent_map: dict[str, str | None]) -> bool:
    seen = set()
    while node is not None:
        if node in seen:
            return True
        seen.add(node)
        node = parent_map.get(node)
    return False

q_parent = {x["id"]: x.get("parent_id_or_null") for x in questions.values()}
p_parent = {x["id"]: x.get("parent_part_id_or_null") for x in parts.values()}
cycles = [x for x in q_parent if has_cycle(x, q_parent)] + [x for x in p_parent if has_cycle(x, p_parent)]
if cycles:
    hierarchy_errors.append({"cycles": cycles})
record_check("question_part_hierarchy_and_cycles", not hierarchy_errors, {"questions": len(questions), "parts": len(parts), "errors": hierarchy_errors[:50]})
if hierarchy_errors:
    fail("hierarchy", "Broken parent/question relationship or cycle", hierarchy_errors[:20])

target_errors = []
for item in marking.values():
    part_target = item.get("part_id_or_null")
    question_target = item.get("question_id_or_null")
    if (part_target is None) == (question_target is None):
        target_errors.append({"id": item["id"], "reason": "target_cardinality"})
    elif part_target is not None and part_target not in parts:
        target_errors.append({"id": item["id"], "missing_part": part_target})
    elif question_target is not None and question_target not in questions:
        target_errors.append({"id": item["id"], "missing_question": question_target})
record_check("marking_item_exactly_one_valid_target", not target_errors and len(marking) == 927, {"checked": len(marking), "errors": target_errors[:50]})
if target_errors:
    fail("marking_targets", "Invalid marking-item target", target_errors[:20])

relation_errors = []
file_ref_errors = []
referenced_files: set[str] = set()

def resolve_ref(row: dict[str, Any], ref: str, field: str) -> None:
    root = ROOT / row["batch_root"]
    path = root / ref
    referenced_files.add(path.relative_to(ROOT).as_posix())
    if not path.is_file():
        file_ref_errors.append({"id": row.get("id") or row.get("source_id"), "field": field, "ref": ref})

for page in by_type["page"]:
    ref = page.get("transcript_ref_or_null")
    if ref:
        resolve_ref(page, ref, "transcript_ref_or_null")
for q in questions.values():
    resolve_ref(q, q["prompt_transcript_ref"], "prompt_transcript_ref")
    if q.get("context_ref_or_null"):
        resolve_ref(q, q["context_ref_or_null"], "context_ref_or_null")
for p in parts.values():
    resolve_ref(p, p["prompt_transcript_ref"], "prompt_transcript_ref")
    for dep in p.get("dependency_refs", []):
        if isinstance(dep, str):
            if "/" in dep or dep.endswith((".json", ".txt", ".png", ".jpg")):
                resolve_ref(p, dep, "dependency_refs")
            elif "-context-" in dep:
                locator_deps = [x for x in p.get("dependency_refs", []) if isinstance(x, dict)]
                if not dep.startswith(p["question_id"] + "-context-") or not locator_deps or not all(locator_ok(x, "qp") for x in locator_deps):
                    relation_errors.append({"id": p["id"], "bad_context_anchor": dep})
            elif dep not in all_relation_ids:
                relation_errors.append({"id": p["id"], "bad_dependency_id": dep})
        elif isinstance(dep, dict):
            if not locator_ok(dep):
                relation_errors.append({"id": p["id"], "bad_dependency_locator": dep})
        else:
            relation_errors.append({"id": p["id"], "bad_dependency_type": type(dep).__name__})
for item in marking.values():
    resolve_ref(item, item["transcript_ref"], "transcript_ref")
    for dep in item.get("visual_dependency_refs", []):
        if dep not in visuals:
            relation_errors.append({"id": item["id"], "bad_visual_dependency": dep})
for visual in visuals.values():
    if isinstance(visual.get("page_ref"), str):
        resolve_ref(visual, visual["page_ref"], "page_ref")
    resolve_ref(visual, visual["rendered_asset_ref"], "rendered_asset_ref")
    for related in visual.get("relates_to_ids", []):
        if related not in all_relation_ids:
            relation_errors.append({"id": visual["id"], "bad_related_id": related})
record_check("visual_relations_and_dependencies", not relation_errors, {"visual_regions": len(visuals), "errors": relation_errors[:50], "error_count": len(relation_errors)})
record_check("all_referenced_transcript_context_render_files_exist", not file_ref_errors, {"unique_files_checked": len(referenced_files), "errors": file_ref_errors[:50], "error_count": len(file_ref_errors)})
if relation_errors:
    fail("relations", "Broken dependency or visual relation", relation_errors[:20])
if file_ref_errors:
    fail("referenced_files", "Referenced transcript/context/render is missing", file_ref_errors[:20])

# 7. Displayed mark totals.
mark_totals = {}
for source_id in sorted(x for x in agg_sources if agg_sources[x]["kind"] == "qp"):
    qrows = [x for x in questions.values() if x["source_qp_id"] == source_id]
    qids = {x["id"] for x in qrows}
    prows = [x for x in parts.values() if x["question_id"] in qids]
    mark_totals[source_id] = sum((x.get("marks_displayed_or_null") or 0) for x in qrows + prows)
mark_ok = len(mark_totals) == 30 and all(v == 75 for v in mark_totals.values())
record_check("all_30_qp_displayed_mark_totals_equal_75", mark_ok, mark_totals)
if not mark_ok:
    fail("displayed_marks", "One or more QP displayed-mark totals are not 75", {k: v for k, v in mark_totals.items() if v != 75})

# 8. Unresolved reconciliation and B24/B25 extracted grouping parents.
unresolved = [x for x in rows if x.get("status") == "UNRESOLVED"]
unresolved_counts = Counter((x["batch_id"], x["record_type"]) for x in unresolved)
expected_unresolved = Counter({("B21", "part"): 34, ("B21", "marking_item"): 34, ("B22", "part"): 32, ("B23", "part"): 28})
register_text = (S1 / "UNRESOLVED_REGISTER.md").read_text(encoding="utf-8")
register_ids = set(re.findall(r"`(9618_[^`]+)`", register_text))
unresolved_ids = {x["id"] for x in unresolved}
unresolved_ok = len(unresolved) == 128 and unresolved_counts == expected_unresolved and register_ids == unresolved_ids
if not unresolved_ok:
    fail("unresolved_reconciliation", "Unresolved count/type/register ID mismatch", {"counts": dict(unresolved_counts), "register_only": sorted(register_ids - unresolved_ids), "corpus_only": sorted(unresolved_ids - register_ids)})
record_check("exact_unresolved_reconciliation", unresolved_ok, {
    "total": len(unresolved),
    "by_batch_type": {f"{k[0]}/{k[1]}": v for k, v in sorted(unresolved_counts.items())},
    "register_id_count": len(register_ids),
    "id_sets_equal": register_ids == unresolved_ids,
})

parent_ids = Counter(x.get("parent_part_id_or_null") for x in parts.values() if x.get("parent_part_id_or_null"))
group_results = {}
group_ok = True
for batch, expected in (("B24", 29), ("B25", 27)):
    groups = [x for x in parts.values() if x["batch_id"] == batch and x["id"] in parent_ids]
    ok = (
        len(groups) == expected
        and all(x["status"] == "EXTRACTED" for x in groups)
        and all(x.get("ms_locator_or_null") is None for x in groups)
        and all(parent_ids[x["id"]] >= 1 for x in groups)
        and not any(x["status"] == "UNRESOLVED" for x in groups)
    )
    group_ok &= ok
    group_results[batch] = {"count": len(groups), "expected": expected, "all_extracted": all(x["status"] == "EXTRACTED" for x in groups), "all_have_children": all(parent_ids[x["id"]] >= 1 for x in groups), "ids": [x["id"] for x in groups]}
record_check("b24_b25_extracted_parent_groups", group_ok, group_results)
if not group_ok:
    fail("parent_groups", "B24/B25 grouping-parent classification or child mapping mismatch", group_results)

# 9. Status/year/manifests/decision and authority pins.
status_errors = []
for row in rows:
    if row["record_type"] in {"question", "part", "marking_item"} and row.get("status") not in ALLOWED_STATUS:
        status_errors.append({"id": row.get("id"), "status": row.get("status")})
    year = row.get("year")
    if year is not None and year not in range(2021, 2026):
        status_errors.append({"id": row.get("id") or row.get("source_id"), "year": year})
record_check("allowed_statuses_and_years", not status_errors, {"errors": status_errors[:50], "years": sorted({x.get("year") for x in rows if x.get("year") is not None})})
if status_errors:
    fail("statuses_years", "Invalid status or year", status_errors[:20])

pin_results = []
pin_ok = True
for batch, entry in accepted_by_batch.items():
    root = ROOT / entry["candidate_root"]
    file_pins = [
        ("handoff_sha256", root / "HANDOFF_CHECK.json"),
        ("batch_manifest_sha256", root / "BATCH_MANIFEST.json"),
    ]
    if entry.get("snapshot_manifest_sha256") is not None:
        file_pins.append(("snapshot_manifest_sha256", root / "SNAPSHOT_MANIFEST.json"))
    for field, path in file_pins:
        actual = sha256(path) if path.is_file() else None
        ok = actual == entry[field]
        pin_ok &= ok
        pin_results.append({"batch_id": batch, "field": field, "path": path.relative_to(ROOT).as_posix(), "expected": entry[field], "actual": actual, "match": ok})
    decision_rel, decision_hash = DECISIONS[batch]
    ok = entry["decision_path"] == decision_rel and entry["decision_sha256"] == decision_hash
    pin_ok &= ok
    pin_results.append({"batch_id": batch, "field": "decision_manifest_pin", "match": ok})
    decision = load_json(ROOT / decision_rel)
    decision_candidate = decision.get("candidate", decision.get("candidate_version"))
    accepted_decision = str(decision.get("decision", "")).startswith("ACCEPTED") and decision_candidate == EXPECTED_VERSIONS[batch]
    pin_ok &= accepted_decision
    pin_results.append({"batch_id": batch, "field": "decision_content", "candidate": decision_candidate, "decision": decision.get("decision"), "match": accepted_decision})

for name, pin in manifest["authority_pins"].items():
    path = ROOT / pin["path"]
    actual = sha256(path) if path.is_file() else None
    ok = actual == pin["sha256"]
    pin_ok &= ok
    pin_results.append({"authority": name, "path": pin["path"], "expected": pin["sha256"], "actual": actual, "match": ok})
record_check("manifest_decision_candidate_authority_pins", pin_ok, {"pins": pin_results, "matched": sum(x["match"] for x in pin_results), "total": len(pin_results)})
if not pin_ok:
    fail("pins", "Candidate/decision/authority pin mismatch", [x for x in pin_results if not x["match"]])

manifest_count_errors = []
for batch, entry in accepted_by_batch.items():
    actual = Counter(x["record_type"] for x in rows if x["batch_id"] == batch)
    expected = {
        "source_file": entry["counts"]["sources"],
        "page": entry["counts"]["pages"],
        "question": entry["counts"]["question_roots"],
        "part": entry["counts"]["parts"],
        "marking_item": entry["counts"]["marking_items"],
        "visual_region": entry["counts"]["visual_regions"],
    }
    if dict(actual) != expected:
        manifest_count_errors.append({"batch_id": batch, "actual": dict(actual), "expected": expected})
record_check("manifest_per_batch_counts", not manifest_count_errors, {"errors": manifest_count_errors})
if manifest_count_errors:
    fail("manifest_counts", "Per-batch manifest counts differ", manifest_count_errors)

# 10. Scope honesty: assert required limiting statements and inspect prohibited positive claims.
summary_text = (S1 / "STAGE1_SUMMARY.md").read_text(encoding="utf-8")
manifest_text = (S1 / "CORPUS_MANIFEST.json").read_text(encoding="utf-8")
scope_requirements = {
    "no_lessons_or_app_change": "does not contain lessons or modify the Fumadocs app" in summary_text,
    "remote_authenticity_limit": "adds no new remote authenticity certification" in summary_text,
    "variant_equivalence_not_assessed": "Variant equivalence is not assessed" in summary_text,
    "later_stage_boundaries": "Lesson correctness, Vietnamese/English translation, taxonomy, app behavior and publication are later-stage gates" in summary_text,
    "manifest_no_stage2_claim": "No lesson, translation, taxonomy, application or publication claim is made" in manifest_text,
}
scope_ok = all(scope_requirements.values())
record_check("summary_and_scope_limits_honest", scope_ok, scope_requirements)
if not scope_ok:
    fail("scope_honesty", "Required Stage 1 limit statement missing", [k for k, v in scope_requirements.items() if not v])

overall = not errors and all(x["result"] == "PASS" for x in checks.values())
machine = {
    "schema_version": "1.0",
    "check_id": "P1-S1-A9-FINAL-V2-INDEPENDENT-CHECK",
    "reviewer_role": "A9 independent final reviewer",
    "checker": "independent_final_checker.py",
    "a0_validator_used_as_evidence": False,
    "result": "PASS" if overall else "FAIL",
    "frozen_inputs_drifted": not frozen_ok or not decision_ok,
    "checks": checks,
    "counts": {
        "records": len(rows),
        "record_types": actual_counts,
        "typed_ids": len(typed_ids),
        "original_pdfs_rehashed": len(physical),
        "page_rows": len(page_keys),
        "canonical_candidate_comparisons": len(comparisons),
        "referenced_files_checked": len(referenced_files),
        "unresolved_records": len(unresolved),
        "qp_mark_totals": len(mark_totals),
    },
    "errors": errors,
}

input_manifest = {
    "schema_version": "1.0",
    "manifest_id": "P1-S1-A9-FINAL-V2-INPUTS",
    "work_order": {
        "path": "A_Level_CS_page/planning/paper1/stage-1/evidence/a0/final/A9_FINAL_REVIEW_WORK_ORDER_V2.md",
        "expected_sha256": "8c3059e35b80922bafaf7c1a78fe169698a395fe808c22a9e1d613684365a024",
        "actual_sha256": sha256(S1 / "evidence/a0/final/A9_FINAL_REVIEW_WORK_ORDER_V2.md"),
        "match": sha256(S1 / "evidence/a0/final/A9_FINAL_REVIEW_WORK_ORDER_V2.md") == "8c3059e35b80922bafaf7c1a78fe169698a395fe808c22a9e1d613684365a024",
    },
    "frozen_inputs_drifted": not frozen_ok or not decision_ok,
    "frozen_inputs": input_entries,
    "accepted_decisions": decision_entries,
    "accepted_candidates": [
        {
            "batch_id": b["batch_id"],
            "candidate_version": b["candidate_version"],
            "candidate_root": b["candidate_root"],
            "decision_path": b["decision_path"],
            "decision_sha256": b["decision_sha256"],
            "handoff_sha256": b["handoff_sha256"],
            "batch_manifest_sha256": b["batch_manifest_sha256"],
            "snapshot_manifest_sha256": b["snapshot_manifest_sha256"],
        }
        for b in manifest["accepted_batches"]
    ],
}

OUT.mkdir(parents=True, exist_ok=True)
(OUT / "FINAL_MACHINE_CHECKS.json").write_text(json.dumps(machine, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
(OUT / "INPUT_MANIFEST.json").write_text(json.dumps(input_manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps({"result": machine["result"], "checks": len(checks), "errors": len(errors), "counts": machine["counts"]}, indent=2))
raise SystemExit(0 if overall else 1)
