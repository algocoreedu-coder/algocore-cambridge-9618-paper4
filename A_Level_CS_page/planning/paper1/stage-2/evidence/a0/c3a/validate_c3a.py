import hashlib
import json
from collections import Counter, defaultdict
from pathlib import Path


ROOT = Path(__file__).resolve().parents[7]
STAGE2 = ROOT / "A_Level_CS_page/planning/paper1/stage-2"
AGG = STAGE2 / "evidence/a4/aggregate-v1"
BATCHES = {"B21": "v4", "B22": "v4", "B23": "v4", "B24": "v4", "B25": "v2"}


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def jsonl(path: Path):
    with path.open("r", encoding="utf-8-sig") as f:
        return [json.loads(line) for line in f if line.strip()]


def check(condition, check_id, detail, checks):
    checks.append({"check_id": check_id, "status": "PASS" if condition else "FAIL", "detail": detail})


def main():
    checks = []
    expected_names = {
        "QUESTION_BANK_INDEX.jsonl",
        "PATTERN_CATALOG_PROVISIONAL.json",
        "PATTERN_EVIDENCE.jsonl",
        "MARKING_EVIDENCE_CATALOG.jsonl",
        "GAP_CONFLICT_REPORT.md",
        "QA.json",
        "INPUT_MANIFEST.json",
        "OUTPUT_MANIFEST.json",
        "HANDOFF.json",
    }
    actual_names = {p.name for p in AGG.iterdir() if p.is_file()}
    check(actual_names == expected_names, "A0-C3A-01-EXACT-OUTPUT-SET", {"expected": sorted(expected_names), "actual": sorted(actual_names)}, checks)

    output_manifest = json.loads((AGG / "OUTPUT_MANIFEST.json").read_text(encoding="utf-8-sig"))
    manifest_results = []
    for entry in output_manifest["files"]:
        p = ROOT / entry["path"]
        actual = {"path": entry["path"], "bytes": p.stat().st_size, "sha256": sha256(p)}
        actual["match"] = actual["bytes"] == entry["bytes"] and actual["sha256"] == entry["sha256"]
        manifest_results.append(actual)
    check(len(manifest_results) == 7 and all(x["match"] for x in manifest_results), "A0-C3A-02-MANIFEST-CLOSURE", manifest_results, checks)

    handoff = json.loads((AGG / "HANDOFF.json").read_text(encoding="utf-8-sig"))
    manifest_pin = handoff["output_manifest"]
    check(
        manifest_pin["bytes"] == (AGG / "OUTPUT_MANIFEST.json").stat().st_size
        and manifest_pin["sha256"] == sha256(AGG / "OUTPUT_MANIFEST.json"),
        "A0-C3A-03-HANDOFF-PINS-MANIFEST",
        {"expected": manifest_pin, "actual_sha256": sha256(AGG / "OUTPUT_MANIFEST.json")},
        checks,
    )

    qbi = jsonl(AGG / "QUESTION_BANK_INDEX.jsonl")
    occurrences = jsonl(AGG / "PATTERN_EVIDENCE.jsonl")
    marking = jsonl(AGG / "MARKING_EVIDENCE_CATALOG.jsonl")
    catalog_doc = json.loads((AGG / "PATTERN_CATALOG_PROVISIONAL.json").read_text(encoding="utf-8-sig"))
    patterns = catalog_doc["patterns"]

    kinds = Counter(r["record_kind"] for r in qbi)
    check(kinds == {"ASSESSMENT_UNIT": 893, "CONTAINER": 379, "UNRESOLVED_CONTEXT": 128}, "A0-C3A-04-QBI-KINDS", dict(kinds), checks)
    unit_rows = [r for r in qbi if r["record_kind"] == "ASSESSMENT_UNIT"]
    container_rows = [r for r in qbi if r["record_kind"] == "CONTAINER"]
    unresolved_rows = [r for r in qbi if r["record_kind"] == "UNRESOLVED_CONTEXT"]
    unit_ids = [r["assessment_unit_id"] for r in unit_rows]
    record_ids = [r["record_id"] for r in qbi]
    check(len(unit_ids) == len(set(unit_ids)) == 893 and len(record_ids) == len(set(record_ids)) == 1400, "A0-C3A-05-UNIQUE-IDS", {"unit_ids": len(set(unit_ids)), "record_ids": len(set(record_ids))}, checks)

    source_groups = {
        "ATOMIC_ITEM_MAP.jsonl": unit_rows,
        "CONTAINER_MAP.jsonl": container_rows,
        "UNRESOLVED_DISPOSITION.jsonl": unresolved_rows,
    }
    source_identity = []
    for filename, aggregate_rows in source_groups.items():
        by_batch = defaultdict(list)
        for row in aggregate_rows:
            by_batch[row["batch_id"]].append(row)
        for batch, version in BATCHES.items():
            source_path = STAGE2 / f"evidence/a4/{batch}/{version}/{filename}"
            source_rows = jsonl(source_path)
            carried = [r["source_record"] for r in by_batch[batch]]
            ok = Counter(json.dumps(x, sort_keys=True, separators=(",", ":")) for x in source_rows) == Counter(json.dumps(x, sort_keys=True, separators=(",", ":")) for x in carried)
            source_identity.append({"batch": batch, "file": filename, "source_rows": len(source_rows), "aggregate_rows": len(carried), "match": ok})
    check(all(x["match"] for x in source_identity), "A0-C3A-06-QBI-SOURCE-VALUE-IDENTITY", source_identity, checks)

    marking_identity = []
    for batch, version in BATCHES.items():
        source_path = STAGE2 / f"evidence/a4/{batch}/{version}/MARKING_EVIDENCE_MAP.jsonl"
        source_rows = jsonl(source_path)
        carried = [r["source_record"] for r in marking if r["batch_id"] == batch]
        ok = Counter(json.dumps(x, sort_keys=True, separators=(",", ":")) for x in source_rows) == Counter(json.dumps(x, sort_keys=True, separators=(",", ":")) for x in carried)
        marking_identity.append({"batch": batch, "source_rows": len(source_rows), "aggregate_rows": len(carried), "match": ok})
    check(all(x["match"] for x in marking_identity), "A0-C3A-07-MARKING-SOURCE-VALUE-IDENTITY", marking_identity, checks)

    marking_roles = Counter(r["record_role"] for r in marking)
    check(marking_roles == {"SCORING_LINK": 893, "PARENT_CONTEXT_NONSCORING": 34}, "A0-C3A-08-MARKING-ROLES", dict(marking_roles), checks)
    scoring = [r for r in marking if r["record_role"] == "SCORING_LINK"]
    linked_units = [r["assessment_unit_id_or_null"] for r in scoring]
    check(set(linked_units) == set(unit_ids) and len(linked_units) == len(set(linked_units)) == 893, "A0-C3A-09-SCORING-BIJECTION", {"linked_units": len(set(linked_units))}, checks)

    paper_totals = defaultdict(int)
    for row in unit_rows:
        paper_totals[row["paper_id"]] += row["displayed_marks"]
    check(len(paper_totals) == 30 and sum(paper_totals.values()) == 2250 and set(paper_totals.values()) == {75}, "A0-C3A-10-MARKS-PAPERS", {"papers": len(paper_totals), "marks": sum(paper_totals.values()), "totals": dict(sorted(paper_totals.items()))}, checks)

    occurrence_units = [r["assessment_unit_id"] for r in occurrences]
    pattern_ids = [r["pattern_id"] for r in patterns]
    occurrence_pattern_ids = [r["provisional_pattern_id"] for r in occurrences]
    check(len(occurrences) == 893 and set(occurrence_units) == set(unit_ids) and len(occurrence_units) == len(set(occurrence_units)), "A0-C3A-11-OCCURRENCE-BIJECTION", {"occurrences": len(occurrences)}, checks)
    check(len(patterns) == len(set(pattern_ids)) == 498 and set(occurrence_pattern_ids) == set(pattern_ids), "A0-C3A-12-PATTERN-REFS", {"patterns": len(patterns), "referenced_patterns": len(set(occurrence_pattern_ids))}, checks)

    count_by_pattern = Counter(occurrence_pattern_ids)
    papers_by_pattern = defaultdict(set)
    for row in occurrences:
        papers_by_pattern[row["provisional_pattern_id"]].add(row["paper_id"])
    catalog_counts_ok = all(p["raw_occurrence_count"] == count_by_pattern[p["pattern_id"]] and p["distinct_paper_count"] == len(papers_by_pattern[p["pattern_id"]]) for p in patterns)
    provisional_ok = all(
        p["catalog_phase"] == "PROVISIONAL_PRE_EQUIVALENCE"
        and p["status"] == "NEEDS_REVIEW"
        and p["equivalence_state"] == "PENDING"
        and p["distinct_equivalence_group_count_or_null"] is None
        for p in patterns
    )
    check(catalog_counts_ok, "A0-C3A-13-CATALOG-COUNTS", {"raw_occurrence_sum": sum(p["raw_occurrence_count"] for p in patterns)}, checks)
    check(provisional_ok, "A0-C3A-14-PROVISIONAL-ONLY", {"patterns_checked": len(patterns)}, checks)

    all_qbi_ids = set(record_ids) | set(unit_ids)
    refs_ok = all(r["assessment_unit_id"] in set(unit_ids) and r["provisional_pattern_id"] in set(pattern_ids) for r in occurrences)
    examples_ok = all(
        p["official_example_unit_ids"]
        and p["boundary_or_counterexample_ids"]
        and all(x in set(unit_ids) for x in p["official_example_unit_ids"] + p["boundary_or_counterexample_ids"])
        for p in patterns
    )
    check(refs_ok and examples_ok, "A0-C3A-15-REVERSE-REFS-BOUNDARIES", {"occurrence_refs": refs_ok, "examples_boundaries": examples_ok}, checks)

    report_text = (AGG / "GAP_CONFLICT_REPORT.md").read_text(encoding="utf-8-sig")
    check("VC-B25-0021" in report_text and "VC-B25-0041" in report_text, "A0-C3A-16-B25-DEFERRED-NOTE", {"wrong_id_documented": "VC-B25-0021" in report_text, "controlling_id_documented": "VC-B25-0041" in report_text}, checks)

    result = {
        "schema_version": "1.0",
        "audit_role": "A0 pre-review independent machine audit",
        "artifact": "C3a aggregate-v1",
        "result": "PASS" if all(x["status"] == "PASS" for x in checks) else "FAIL",
        "counts": {"question_bank_rows": len(qbi), "atomic_units": len(unit_rows), "containers": len(container_rows), "unresolved": len(unresolved_rows), "marking_rows": len(marking), "pattern_occurrences": len(occurrences), "patterns": len(patterns), "marks": sum(paper_totals.values()), "papers": len(paper_totals)},
        "author_handoff_sha256": sha256(AGG / "HANDOFF.json"),
        "author_output_manifest_sha256": sha256(AGG / "OUTPUT_MANIFEST.json"),
        "checks": checks,
        "note": "This pre-review audit does not accept C3a; independent A3 review and A0 post-review decision remain required.",
    }
    out = Path(__file__).with_name("PRE_REVIEW_AUDIT.json")
    out.write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({"result": result["result"], "checks": len(checks), "counts": result["counts"], "output": str(out)}, indent=2))
    raise SystemExit(0 if result["result"] == "PASS" else 1)


if __name__ == "__main__":
    main()
