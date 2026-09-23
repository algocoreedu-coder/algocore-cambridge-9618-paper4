import hashlib
import json
import subprocess
import sys
from collections import Counter, defaultdict, deque
from pathlib import Path


ROOT = Path(__file__).resolve().parents[7]
STAGE2 = ROOT / "A_Level_CS_page/planning/paper1/stage-2"
EQV = STAGE2 / "evidence/a4/equivalence-v2"
AGG = STAGE2 / "evidence/a4/aggregate-v2"


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def iter_jsonl(path: Path):
    with path.open("r", encoding="utf-8-sig") as f:
        for line in f:
            if line.strip():
                yield json.loads(line)


def check(condition, check_id, detail, checks):
    checks.append({"check_id": check_id, "status": "PASS" if condition else "FAIL", "detail": detail})


def main():
    checks = []
    expected_names = {
        "CANDIDATE_PAIR_UNIVERSE.jsonl", "CANDIDATE_GENERATION_MANIFEST.json",
        "CANDIDATE_GENERATION_CONFIG.json", "generate_candidate_pairs.py",
        "VARIANT_RELATION_REGISTER.jsonl", "EQUIVALENCE_GROUPS.json",
        "REJECTED_PAIR_AUDIT.json", "CONTRADICTION_UNRESOLVED_REPORT.md",
        "QA.json", "INPUT_MANIFEST.json", "OUTPUT_MANIFEST.json", "HANDOFF.json",
    }
    actual_names = {p.name for p in EQV.iterdir() if p.is_file()}
    check(actual_names == expected_names, "A0-C3B-01-EXACT-OUTPUT-SET", {"expected": sorted(expected_names), "actual": sorted(actual_names)}, checks)

    input_manifest = json.loads((EQV / "INPUT_MANIFEST.json").read_text(encoding="utf-8-sig"))
    input_results = []
    for entry in input_manifest["files"]:
        p = ROOT / entry["path"]
        ok = p.exists() and p.stat().st_size == entry["bytes"] and sha256(p) == entry["sha256"]
        input_results.append({"path": entry["path"], "match": ok})
    check(len(input_results) == 203 and all(x["match"] for x in input_results), "A0-C3B-02-INPUT-HASHES", {"files": len(input_results), "mismatches": sum(not x["match"] for x in input_results)}, checks)

    output_manifest = json.loads((EQV / "OUTPUT_MANIFEST.json").read_text(encoding="utf-8-sig"))
    output_results = []
    for entry in output_manifest["files"]:
        p = EQV / entry["path"]
        ok = p.exists() and p.stat().st_size == entry["bytes"] and sha256(p) == entry["sha256"]
        output_results.append({"path": entry["path"], "match": ok})
    handoff = json.loads((EQV / "HANDOFF.json").read_text(encoding="utf-8-sig"))
    handoff_files = {x["path"]: x for x in handoff["files"]}
    handoff_ok = all((EQV / name).exists() and (EQV / name).stat().st_size == e["bytes"] and sha256(EQV / name) == e["sha256"] for name, e in handoff_files.items())
    check(len(output_results) == 10 and all(x["match"] for x in output_results) and len(handoff_files) == 11 and handoff_ok, "A0-C3B-03-OUTPUT-HANDOFF-CLOSURE", {"manifest_files": len(output_results), "handoff_files": len(handoff_files), "mismatches": sum(not x["match"] for x in output_results)}, checks)

    units = []
    for row in iter_jsonl(AGG / "QUESTION_BANK_INDEX.jsonl"):
        if row["record_kind"] == "ASSESSMENT_UNIT":
            units.append(row["assessment_unit_id"])
    unit_set = set(units)
    check(len(units) == len(unit_set) == 893, "A0-C3B-04-ELIGIBLE-NODES", {"units": len(unit_set)}, checks)

    candidates = {}
    channel_counts = Counter()
    overlap_histogram = Counter()
    candidate_errors = []
    for row in iter_jsonl(EQV / "CANDIDATE_PAIR_UNIVERSE.jsonl"):
        pair_id = row["pair_id"]
        left, right = row["left_id"], row["right_id"]
        expected_id = "eqp-" + hashlib.sha256(f"{left}|{right}".encode()).hexdigest()[:24]
        if not (left < right and left in unit_set and right in unit_set and pair_id == expected_id and row["review_required"] is True and row["author_review_status"] == "COMPLETE"):
            candidate_errors.append(pair_id)
        if pair_id in candidates:
            candidate_errors.append(pair_id)
        candidates[pair_id] = row
        for channel in row["channels"]:
            channel_counts[channel] += 1
        overlap_histogram[str(len(row["channels"]))] += 1
    check(len(candidates) == 36416 and not candidate_errors, "A0-C3B-05-CANDIDATE-IDENTITY", {"candidates": len(candidates), "errors": candidate_errors[:10]}, checks)

    required_channels = {
        "QP_EXACT_STRICT", "QP_EXACT_SKELETON", "SAME_SESSION_CROSS_COMPONENT",
        "REQ_RESPONSE_MARKS_OR_STIMULUS", "MS_STRUCTURAL", "QP_TEXT_STRUCTURE",
        "STRUCTURE_COMPOSITE", "SAME_PROVISIONAL_PATTERN",
    }
    generation_manifest = json.loads((EQV / "CANDIDATE_GENERATION_MANIFEST.json").read_text(encoding="utf-8-sig"))
    channels_ok = set(channel_counts) == required_channels and dict(channel_counts) == generation_manifest["channel_raw_trigger_counts"] and dict(overlap_histogram) == generation_manifest["candidate_channel_overlap_histogram"]
    check(channels_ok, "A0-C3B-06-CHANNEL-COUNTS", {"actual": dict(sorted(channel_counts.items())), "required": sorted(required_channels)}, checks)

    relations = {}
    relation_counts = Counter()
    relation_errors = []
    positive_edges = []
    unresolved_edges = []
    for row in iter_jsonl(EQV / "VARIANT_RELATION_REGISTER.jsonl"):
        pair_id = row["pair_id"]
        relation = row["relation"]
        relation_counts[relation] += 1
        if pair_id in relations or pair_id not in candidates or row["review_status"] != "COMPLETE":
            relation_errors.append(pair_id)
        if not row.get("qp_ms_evidence", {}).get("left") or not row.get("qp_ms_evidence", {}).get("right"):
            relation_errors.append(pair_id)
        if candidates.get(pair_id, {}).get("relation_id") != row["relation_id"] or candidates.get(pair_id, {}).get("review_disposition") != relation:
            relation_errors.append(pair_id)
        comparisons = row["comparison"]
        if relation in {"DUPLICATE", "PARALLEL_EQUIVALENT"}:
            if not row["positive"] or not all(comparisons.values()):
                relation_errors.append(pair_id)
            if relation == "DUPLICATE":
                metrics = candidates[pair_id]["metrics"]
                if not metrics["same_strict_qp_fingerprint"] or not metrics["same_ms_structural_fingerprint"]:
                    relation_errors.append(pair_id)
            positive_edges.append((row["left_id"], row["right_id"], row["relation_id"]))
        elif row["positive"]:
            relation_errors.append(pair_id)
        if relation == "UNRESOLVED":
            if not row["quarantine"]:
                relation_errors.append(pair_id)
            unresolved_edges.append((row["left_id"], row["right_id"], row["relation_id"]))
        relations[pair_id] = row
    expected_relation_counts = {"DUPLICATE": 12, "PARALLEL_EQUIVALENT": 60, "RELATED_NOT_EQUIVALENT": 2402, "DISTINCT": 33942}
    check(len(relations) == 36416 and set(relations) == set(candidates) and dict(relation_counts) == expected_relation_counts and not relation_errors, "A0-C3B-07-RELATION-COMPLETENESS", {"relations": len(relations), "counts": dict(relation_counts), "errors": relation_errors[:10]}, checks)

    groups_doc = json.loads((EQV / "EQUIVALENCE_GROUPS.json").read_text(encoding="utf-8-sig"))
    groups = groups_doc["positive_groups"]
    guards = groups_doc["split_guard_components"]
    member_counts = Counter(member for group in groups for member in group["members"])
    group_by_unit = {member: group["group_id"] for group in groups for member in group["members"]}
    group_edges_ok = all(group_by_unit[a] == group_by_unit[b] for a, b, _ in positive_edges)
    group_rel_ids = {r for g in groups for r in g["positive_relation_ids"]}
    positive_rel_ids = {r for _, _, r in positive_edges}
    groups_ok = len(groups) == 824 and set(member_counts) == unit_set and set(member_counts.values()) == {1} and group_edges_ok and group_rel_ids == positive_rel_ids and groups_doc["contradictions"] == []
    check(groups_ok, "A0-C3B-08-POSITIVE-GROUPS", {"groups": len(groups), "members": len(member_counts), "positive_edges": len(positive_edges), "contradictions": len(groups_doc["contradictions"])}, checks)

    guard_member_counts = Counter(member for group in guards for member in group["members"])
    guard_by_unit = {member: group["split_guard_id"] for group in guards for member in group["members"]}
    guard_edges_ok = all(guard_by_unit[a] == guard_by_unit[b] for a, b, _ in positive_edges + unresolved_edges)
    guards_ok = set(guard_member_counts) == unit_set and set(guard_member_counts.values()) == {1} and guard_edges_ok
    check(guards_ok, "A0-C3B-09-SPLIT-GUARDS", {"guards": len(guards), "members": len(guard_member_counts), "unresolved_edges": len(unresolved_edges)}, checks)

    audit = json.loads((EQV / "REJECTED_PAIR_AUDIT.json").read_text(encoding="utf-8-sig"))
    samples = audit["samples"]
    sample_counts = Counter(x["stratum"] for x in samples)
    sample_ids = set()
    audit_errors = []
    for row in samples:
        left, right, pair_id, stratum = row["left_id"], row["right_id"], row["pair_id"], row["stratum"]
        expected_id = "eqp-" + hashlib.sha256(f"{left}|{right}".encode()).hexdigest()[:24]
        expected_rank = hashlib.sha256(f'{audit["seed"]}|{stratum}|{pair_id}'.encode()).hexdigest()
        if pair_id in candidates or pair_id in sample_ids or pair_id != expected_id or row["rank_sha256"] != expected_rank or row["review_status"] != "COMPLETE" or row["false_negative"]:
            audit_errors.append(pair_id)
        sample_ids.add(pair_id)
    targets = {k: min(audit["population_counts"][k], 100 if k != "R5" else 200) for k in ["R1", "R2", "R3", "R4", "R5"]}
    audit_ok = len(samples) == 586 and dict(sample_counts) == targets and audit["false_negative_count"] == 0 and audit["zero_observed_false_negatives"] and not audit_errors
    check(audit_ok, "A0-C3B-10-COMPLEMENT-AUDIT", {"samples": len(samples), "sample_counts": dict(sample_counts), "targets": targets, "errors": audit_errors[:10]}, checks)

    pair_accounting_ok = len(candidates) + generation_manifest["complement_pair_count"] == 398278 == generation_manifest["complete_unordered_pair_space"]
    check(pair_accounting_ok, "A0-C3B-11-PAIR-ACCOUNTING", {"candidate": len(candidates), "complement": generation_manifest["complement_pair_count"], "total": len(candidates) + generation_manifest["complement_pair_count"]}, checks)

    proc = subprocess.run([sys.executable, str(EQV / "generate_candidate_pairs.py"), "--verify-universe"], cwd=ROOT, capture_output=True, text=True)
    verify = json.loads(proc.stdout.strip()) if proc.returncode == 0 and proc.stdout.strip() else {"status": "FAIL", "stderr": proc.stderr}
    check(proc.returncode == 0 and verify.get("status") == "PASS" and verify.get("exact_twelve_outputs") is True, "A0-C3B-12-GENERATOR-RERUN", verify, checks)

    required_positive = {
        "eqp-d39e691ca61aabc170ff29e2", "eqp-b1bd1bbd61ce999a284fdc1c",
        "eqp-58a9faed083abf812245f18d", "eqp-17921c83caef754451c7c38d",
        "eqp-164f851361ce8691ce982686", "eqp-1d450f0e4947672e1b239cad",
    }
    required_negative = {
        "eqp-398f9f24aaf0d181531da38d", "eqp-a1af49a090b3288101ca79be",
        "eqp-b44849bf9cbe4b759853492d", "eqp-efd733a739b48623e8096ea2",
    }
    regression = {pid: relations.get(pid, {}).get("relation") for pid in sorted(required_positive | required_negative)}
    regression_ok = all(regression[x] == "PARALLEL_EQUIVALENT" for x in required_positive) and all(regression[x] == "RELATED_NOT_EQUIVALENT" for x in required_negative)
    check(regression_ok, "A0-C3B-13-REGRESSION-PAIRS", regression, checks)

    v1_rel = {row["pair_id"]: row["relation"] for row in iter_jsonl(STAGE2 / "evidence/a4/equivalence-v1/VARIANT_RELATION_REGISTER.jsonl")}
    changed = {pid: {"v1": v1_rel.get(pid), "v2": relations[pid]["relation"]} for pid in relations if v1_rel.get(pid) != relations[pid]["relation"]}
    delta_ok = set(changed) == required_positive and all(x["v1"] == "RELATED_NOT_EQUIVALENT" and x["v2"] == "PARALLEL_EQUIVALENT" for x in changed.values())
    check(delta_ok, "A0-C3B-14-EXACT-RELATION-DELTA", {"count": len(changed), "changed": changed}, checks)

    result = {
        "schema_version": "1.0", "audit_role": "A0 pre-A9-v2 independent machine audit",
        "artifact": "C3b equivalence-v2", "result": "PASS" if all(x["status"] == "PASS" for x in checks) else "FAIL",
        "counts": {"nodes": len(unit_set), "candidate_pairs": len(candidates), "complement_pairs": generation_manifest["complement_pair_count"], "relations": len(relations), "positive_edges": len(positive_edges), "unresolved_edges": len(unresolved_edges), "positive_groups": len(groups), "complement_samples": len(samples)},
        "author_handoff_sha256": sha256(EQV / "HANDOFF.json"),
        "author_output_manifest_sha256": sha256(EQV / "OUTPUT_MANIFEST.json"),
        "checks": checks,
        "note": "This machine audit does not accept C3b. Fresh A9 semantic review remains required."
    }
    out = Path(__file__).with_name("V2_PRE_RETEST_AUDIT.json")
    out.write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({"result": result["result"], "checks": len(checks), "counts": result["counts"], "output": str(out)}, indent=2))
    raise SystemExit(0 if result["result"] == "PASS" else 1)


if __name__ == "__main__":
    main()
