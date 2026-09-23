from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parent
REQ = json.loads((ROOT / "QUESTION_REQUIREMENTS.json").read_text(encoding="utf-8"))
MARK = json.loads((ROOT / "MARKING_SUBMISSION.json").read_text(encoding="utf-8"))
RISK = json.loads((ROOT / "SOURCE_RISK_REGISTER.json").read_text(encoding="utf-8"))


checks: list[dict] = []


def check(name: str, passed: bool, detail) -> None:
    checks.append({"check": name, "passed": bool(passed), "detail": detail})


req_ids = [row["part_id"] for row in REQ["rows"]]
mark_ids = [row["part_id"] for row in MARK["rows"]]
atom_ids = [atom["marking_point_id"] for row in MARK["rows"] for atom in row["marking_points"]]
check("status_submitted", REQ["status"] == MARK["status"] == RISK["status"] == "SUBMITTED", "all three artifacts")
check("parts_228", len(req_ids) == len(mark_ids) == 228, {"requirements": len(req_ids), "marking": len(mark_ids)})
check("parts_exact_join", set(req_ids) == set(mark_ids) and len(set(req_ids)) == 228, "no missing or duplicate part IDs")
check("marks_825", sum(row["original_marks"] for row in REQ["rows"]) == 825, "Stage 1 baseline")
check("papers_11", len({row["paper_id"] for row in REQ["rows"]}) == 11, "Stage 1 baseline")
check("questions_33", len({row["question_id"] for row in REQ["rows"]}) == 33, "Stage 1 baseline")
check("atom_ids_unique", len(atom_ids) == len(set(atom_ids)), len(atom_ids))
check("all_parts_have_atoms", all(row["marking_points"] for row in MARK["rows"]), len(atom_ids))
check(
    "all_official_atoms_located",
    all(atom["authority"] == "official_ms" and atom["ms_source_id"] and atom["ms_pdf_pages"] for row in MARK["rows"] for atom in row["marking_points"]),
    "authority and PDF page locator present",
)
check(
    "all_qp_requirements_located",
    all(row["qp_requirement"]["authority"] == "official_qp" and row["qp_requirement"]["source_id"] and row["qp_requirement"]["pdf_pages"] for row in REQ["rows"]),
    "authority and PDF page locator present",
)
check(
    "assessed_context_separate",
    all("assessed_pattern_ids" in row and "context_pattern_ids" in row for row in REQ["rows"]),
    "relations retained without mark splitting",
)
check(
    "dependency_ids_preserved",
    all("dependency_part_ids" in row for row in REQ["rows"]) and all("dependency_part_ids" in row for row in MARK["rows"]),
    "part-level prerequisites retained",
)

expected_pending = {
    "9618_w21_41_2(e)",
    "9618_w21_42_2(e)",
    "9618_w22_41_1(b)",
    "9618_w22_43_1(b)",
}
actual_pending = {row["part_id"] for row in MARK["rows"] if row["review_status"] == "PENDING_SOURCE_DECISION"}
check("pending_decisions_exact", actual_pending == expected_pending, sorted(actual_pending))

upper_mismatches = []
for row in MARK["rows"]:
    if row["part_id"] in expected_pending:
        continue
    groups = {}
    ungrouped = 0
    for atom in row["marking_points"]:
        if atom["group_id"]:
            groups[atom["group_id"]] = atom["group_max"]
        elif atom["source_mark_value_if_unambiguous"] is not None:
            ungrouped += atom["source_mark_value_if_unambiguous"]
    upper = ungrouped + sum(groups.values())
    if upper != row["original_part_marks"]:
        upper_mismatches.append({"part_id": row["part_id"], "source_marks": row["original_part_marks"], "modeled_upper": upper})
check("unambiguous_award_upper_bounds", not upper_mismatches, upper_mismatches)

check("stage1_issue_ids_14", len(RISK["issue_definitions"]) == 14, len(RISK["issue_definitions"]))
check("stage1_issue_instances_27", len(RISK["instances"]) == 27, len(RISK["instances"]))
check(
    "risk_instances_located",
    all(item["qp_locator"]["pdf_pages"] and item["ms_locator"]["pdf_pages"] for item in RISK["instances"]),
    "all issue occurrences have QP and MS pages",
)
check(
    "criteria_are_concise",
    max(len(atom["criterion_paraphrase"]) for row in MARK["rows"] for atom in row["marking_points"]) <= 220,
    max(len(atom["criterion_paraphrase"]) for row in MARK["rows"] for atom in row["marking_points"]),
)

report = {
    "schema_version": "1.0",
    "status": "PASS" if all(item["passed"] for item in checks) else "FAIL",
    "checks_total": len(checks),
    "checks_passed": sum(item["passed"] for item in checks),
    "checks": checks,
    "submission_boundary": "PASS validates source-ledger integrity. Four parts remain explicitly pending Lead semantic adjudication and are not hidden by this validator.",
}
(ROOT / "VALIDATION.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps(report, ensure_ascii=False, indent=2))
raise SystemExit(0 if report["status"] == "PASS" else 1)
