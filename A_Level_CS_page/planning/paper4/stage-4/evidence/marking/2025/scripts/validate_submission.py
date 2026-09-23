from __future__ import annotations

import hashlib
import json
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = HERE.parent
PAPER4 = HERE.parents[4]


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def sha256(path: Path) -> str:
    h = hashlib.sha256(path.read_bytes()).hexdigest()
    return h


def check(condition: bool, check_id: str, detail: str, results: list[dict]) -> None:
    results.append({"check_id": check_id, "status": "PASS" if condition else "FAIL", "detail": detail})


def main() -> None:
    requirements = read_json(OUT / "QUESTION_REQUIREMENTS.json")
    marking = read_json(OUT / "MARKING_SUBMISSION.json")
    risks = read_json(OUT / "SOURCE_RISK_REGISTER.json")
    rework = read_json(OUT / "REWORK_RESPONSE.json")
    index = read_json(PAPER4 / "stage-1" / "batches" / "2025" / "index.json")
    stage2 = read_json(PAPER4 / "stage-2" / "QUESTION_PATTERN_MAP.json")

    source_ids = set()
    expected = {}
    for paper in index["papers"]:
        source_ids.update([paper["qp_source_id"], paper["ms_source_id"]])
        for question in paper["questions"]:
            for part in question["parts"]:
                part_id = f"{paper['paper_id']}_{part['part']}"
                expected[part_id] = {"marks": part["marks"], "qp_pages": part["qp_pages"], "ms_pages": part["ms_pages"]}
    expected_patterns = {
        row["part_id"]: (row["assessed_pattern_ids"], row["context_pattern_ids"])
        for row in stage2["rows"]
        if row["part_id"] in expected
    }

    req_rows = {row["part_id"]: row for row in requirements["rows"]}
    mark_rows = {row["part_id"]: row for row in marking["rows"]}
    all_points = [point for row in marking["rows"] for point in row["marking_points"]]
    point_ids = [point["marking_point_id"] for point in all_points]
    results = []

    check(requirements["status"] == marking["status"] == risks["status"] == "SUBMITTED", "status", "All deliverables are SUBMITTED, not canonical PASS.", results)
    check(set(req_rows) == set(expected), "requirement-part-set", f"Requirement rows {len(req_rows)}/{len(expected)}.", results)
    check(set(mark_rows) == set(expected), "marking-part-set", f"Marking rows {len(mark_rows)}/{len(expected)}.", results)
    check(len(marking["rows"]) == 140, "part-count", "Exactly 140 marking rows.", results)
    check(sum(row["marks"] for row in marking["rows"]) == 450, "mark-total", "Exactly 450 indexed marks, counted once by part.", results)
    check(len(point_ids) == len(set(point_ids)), "marking-point-ids", f"All {len(point_ids)} marking point IDs are unique.", results)
    check(all(row["marks"] == expected[row["part_id"]]["marks"] for row in marking["rows"]), "part-marks", "Every part mark equals the Stage 1 frozen index.", results)
    check(all(row["qp_requirement"]["pdf_pages"] == expected[row["part_id"]]["qp_pages"] for row in marking["rows"]), "qp-pages", "Every QP locator matches Stage 1.", results)
    check(all(point["ms_pdf_pages"] == expected[row["part_id"]]["ms_pages"] for row in marking["rows"] for point in row["marking_points"]), "ms-pages", "Every MS locator matches the frozen page span for its part.", results)
    check(all(point["authority"] == "official_ms" for point in all_points), "authority", "All marking atoms use official_ms authority.", results)
    check(all(point["method_join_status"] == "PENDING_LEAD_METHOD_JOIN" and point["method_step_refs"] == [] for point in all_points), "method-boundary", "No canonical method IDs were fabricated.", results)
    check(all(row["pattern_ids"] == expected_patterns[row["part_id"]][0] and row["context_pattern_ids"] == expected_patterns[row["part_id"]][1] for row in marking["rows"]), "pattern-joins", "Assessed and context pattern arrays equal Stage 2.", results)
    check(all(len(row["marking_points"]) > 0 for row in marking["rows"]), "atom-presence", "Every part has at least one marking atom.", results)
    check(all(point["ms_pdf_pages"] and point["ms_source_id"] in source_ids for point in all_points), "atom-locators", "Every atom has an in-batch MS source and page locator.", results)
    check(all(point["award_semantics"] in {"discrete", "group_max", "alternative", "dependent", "holistic", "evidence", "accept_equivalent"} for point in all_points), "award-semantics", "Every atom uses the Stage 4 award vocabulary.", results)
    check(all((point["group_max"] is not None and point["group_id"]) if point["award_semantics"] == "group_max" else True for point in all_points), "group-max", "Every group-max atom has a group ID and cap.", results)
    check(all(row["authority_note"].startswith("Official marks belong to this part row") for row in marking["rows"]), "no-cotag-mark-split", "Marks remain owned by one row even for co-tags.", results)

    per_paper = defaultdict(lambda: [0, 0])
    for row in marking["rows"]:
        per_paper[row["paper_id"]][0] += 1
        per_paper[row["paper_id"]][1] += row["marks"]
    check(len(per_paper) == 6 and all(marks == 75 for _, marks in per_paper.values()), "paper-totals", "Six papers, each with 75 marks.", results)
    check(sum(len(paper["questions"]) for paper in index["papers"]) == 18, "question-count", "Exactly 18 source questions.", results)
    check(marking["ambiguities"] == [], "allocation-review", "No unresolved atom-count allocation anomaly after facsimile review.", results)
    check(len(marking.get("resolved_allocation_ambiguities", [])) == 4 and all(item["source_locator"]["pdf_pages"] for item in marking["resolved_allocation_ambiguities"]), "resolved-ambiguities", "Four layout/allocation ambiguities have an explicit facsimile-backed resolution and locator.", results)

    check(all(row["requirement_atoms"] and all(atom["source_locator"]["pdf_pages"] for atom in row["requirement_atoms"]) for row in requirements["rows"]), "requirement-atoms", "Every requirement row has source-located atoms.", results)
    check(all(row["assessed_pattern_ids"] == expected_patterns[row["part_id"]][0] for row in requirements["rows"]), "requirement-patterns", "Requirement assessed-pattern joins equal Stage 2.", results)
    check(requirements["unprocessed_part_ids"] == marking["unprocessed_part_ids"] == [], "unprocessed", "No unprocessed part IDs.", results)

    check(len(risks["risks"]) == 6, "risk-count", "Six concrete 2025 source risk instances recorded, including both constructor occurrences.", results)
    check(all(risk["source_locator"]["pdf_pages"] and risk["stage5_obligation"] for risk in risks["risks"]), "risk-fields", "Every source risk has a locator and Stage 5 obligation.", results)
    check(all(part_id in expected for risk in risks["risks"] for part_id in risk["affected_part_ids"]), "risk-parts", "Every risk points to a valid 2025 part.", results)

    evidence_row = mark_rows["9618_s25_42_2(f)(iii)"]
    evidence_point = evidence_row["marking_points"][0]
    check(
        evidence_point["award_semantics"] == "evidence"
        and evidence_point["source_mark_value_if_unambiguous"] == 1
        and evidence_point["ms_pdf_pages"] == [32]
        and "PrintSpare" in evidence_point["criterion_paraphrase"]
        and "non-empty" in evidence_point["criterion_paraphrase"],
        "a8-src-req-005",
        "Spare-key screenshot criterion is meaningful, bounded, one-mark evidence on MS page 32.",
        results,
    )

    reduce_points = mark_rows["9618_s25_42_1(e)"]["marking_points"]
    check(
        len(reduce_points) == 7
        and all(point["source_mark_value_if_unambiguous"] == 1 for point in reduce_points)
        and reduce_points[4]["award_semantics"] == "discrete"
        and reduce_points[4]["alternatives"] == [],
        "a8-src-req-006",
        "Stack Reduce has seven explicit one-mark atoms; mp.05 is discrete with no alternative text.",
        results,
    )

    risk_by_id = {risk["risk_id"]: risk for risk in risks["risks"]}
    constructor_risk = risk_by_id.get("S25-41-MS35-INIT", {})
    constructor_req = req_rows["9618_s25_41_3(c)(i)"]
    constructor_mark = mark_rows["9618_s25_41_3(c)(i)"]
    check(
        constructor_risk.get("source_locator", {}).get("source_id") == "9618_s25_ms_41"
        and constructor_risk.get("source_locator", {}).get("pdf_pages") == [35]
        and constructor_risk.get("affected_part_ids") == ["9618_s25_41_3(c)(i)"]
        and "S25-41-MS35-INIT" in constructor_req["source_issue_refs"]
        and "S25-41-MS35-INIT" in constructor_mark["source_issue_refs"]
        and all("S25-41-MS35-INIT" in point["source_issue_refs"] for point in constructor_mark["marking_points"]),
        "a8-src-req-007",
        "MS page 35 constructor defect is joined to the part, requirement and both marking atoms.",
        results,
    )

    queue_risk = risk_by_id["W25-43-Q2B-FULL-GUARD"]
    fixture_counts = [fixture["occupied_slots"] for fixture in queue_risk.get("stage5_boundary_fixtures", [])]
    check(
        fixture_counts == [0, 99, 100]
        and all(token in queue_risk["stage5_obligation"] for token in ["empty queue", "99 occupied", "100 occupied"]),
        "a8-src-req-008",
        "Queue full-guard JSON obligation explicitly carries empty, 99-occupied and 100-occupied fixtures.",
        results,
    )

    expected_findings = {"A8-SRC-REQ-005", "A8-SRC-REQ-006", "A8-SRC-REQ-007", "A8-SRC-REQ-008"}
    response_findings = {item["finding_id"] for item in rework["findings"]}
    response_hashes_ok = all(sha256(OUT / name) == digest for name, digest in rework["artifact_sha256"].items())
    check(response_findings == expected_findings and response_hashes_ok, "rework-response", "Rework response maps all four findings and hashes the regenerated artifacts.", results)

    hashes_ok = True
    for item in marking["input_hashes"]:
        path = PAPER4 / item["path"]
        hashes_ok &= path.exists() and sha256(path) == item["sha256"]
    check(hashes_ok, "input-hashes", "Every declared input digest matches the current read-only file.", results)

    counts = Counter(result["status"] for result in results)
    report = {
        "schema_version": "s4-source-validation-v1",
        "status": "PASS" if not counts["FAIL"] else "FAIL",
        "work_order": "S4-S3",
        "batch": "2025",
        "validated_utc": datetime.now(timezone.utc).replace(microsecond=0).isoformat(),
        "counts": dict(counts),
        "checks": results,
    }
    (OUT / "VALIDATION.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    rework["validation_status"] = report["status"]
    rework["validation_report_sha256"] = sha256(OUT / "VALIDATION.json")
    (OUT / "REWORK_RESPONSE.json").write_text(json.dumps(rework, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"status": report["status"], "counts": report["counts"]}, ensure_ascii=False))
    if report["status"] != "PASS":
        raise SystemExit(1)


if __name__ == "__main__":
    main()
