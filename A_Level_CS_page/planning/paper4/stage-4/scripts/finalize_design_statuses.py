from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path


S4 = Path(__file__).resolve().parents[1]
QA = S4 / "evidence" / "qa" / "final" / "A8_FINAL_QA.json"
PASS2 = S4 / "evidence" / "lead-review" / "LEAD_PASS2.json"


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def write(path: Path, payload: dict):
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def sha(path: Path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    qa = load(QA)
    if qa.get("status") != "PASS_RECOMMENDED" or qa.get("active_findings"):
        raise SystemExit("A8 aggregate QA has not cleared the candidate artifacts")
    stale = []
    for name, expected in qa["canonical_hashes"].items():
        actual = sha(S4 / name)
        if actual != expected:
            stale.append({"file": name, "expected": expected, "actual": actual})
    if stale:
        raise SystemExit(json.dumps({"stale_a8_hashes": stale}, indent=2))

    status_plan = {
        "PATTERN_CARDS.json": ("DESIGN_REVIEWED", "pattern_cards"),
        "VARIANT_INVARIANT_REGISTER.json": ("DESIGN_REVIEWED", None),
        "MARKING_MAP.json": ("DESIGN_REVIEWED_METHOD_JOIN", None),
        "MARKING_METHOD_OWNERSHIP.json": ("DESIGN_REVIEWED", None),
        "ERROR_PREVENTION_MATRIX.json": ("DESIGN_REVIEWED", "error_rows"),
        "SOLUTION_DESIGN_BRIEFS.json": ("DESIGN_REVIEWED", None),
        "WORKED_EXAMPLE_SPECS.json": ("DESIGN_REVIEWED", None),
        "ASSESSMENT_DESIGN_BRIEFS.json": ("DESIGN_REVIEWED", None),
        "PRELIMINARY_VISUAL_BRIEFS.json": ("DESIGN_REVIEWED", None),
        "SOURCE_CAVEAT_CARRYOVER.json": ("DESIGN_REVIEWED", None),
        "GAP_DISPOSITIONS.json": ("DESIGN_REVIEWED", None),
    }
    pre_hashes = {name: sha(S4 / name) for name in status_plan}
    for name, (status, row_key) in status_plan.items():
        path = S4 / name
        doc = load(path)
        doc["status"] = status
        if row_key:
            for row in doc[row_key]:
                row["status"] = "DESIGN_REVIEWED"
        write(path, doc)

    downstream = {
        "solutions": load(S4 / "SOLUTION_DESIGN_BRIEFS.json")["solution_designs"],
        "examples": load(S4 / "WORKED_EXAMPLE_SPECS.json")["worked_example_specs"],
        "assessments": load(S4 / "ASSESSMENT_DESIGN_BRIEFS.json")["assessment_designs"],
        "visuals": load(S4 / "PRELIMINARY_VISUAL_BRIEFS.json")["visual_briefs"],
    }
    checks = {
        "cards_58_design_reviewed": sum(x["status"] == "DESIGN_REVIEWED" for x in load(S4 / "PATTERN_CARDS.json")["pattern_cards"]) == 58,
        "errors_154_design_reviewed": sum(x["status"] == "DESIGN_REVIEWED" for x in load(S4 / "ERROR_PREVENTION_MATRIX.json")["error_rows"]) == 154,
        "solutions_58_still_pending_stage5": all(x["status"] == "PENDING_STAGE5_EXECUTION_VERIFICATION" for x in downstream["solutions"]),
        "examples_58_still_pending_stage5": all(x["status"] == "PENDING_STAGE5_EXECUTION_VERIFICATION" for x in downstream["examples"]),
        "assessments_37_still_not_authored": all(x["status"] == "DESIGNED_NOT_AUTHORED" for x in downstream["assessments"]),
        "visuals_58_still_pending_stage5_stage7": all(x["status"] == "PENDING_STAGE5_TRACE_AND_STAGE7_STORYBOARD" for x in downstream["visuals"]),
    }
    if not all(checks.values()):
        raise SystemExit(checks)

    coverage_path = S4 / "STAGE4_COVERAGE_AUDIT.json"
    coverage = load(coverage_path)
    coverage["status"] = "DESIGN_REVIEWED"
    coverage["canonical_hashes"] = {
        **{name: sha(S4 / name) for name in [
            "PATTERN_CARDS.json", "VARIANT_INVARIANT_REGISTER.json", "ERROR_PREVENTION_MATRIX.json",
            "SOLUTION_DESIGN_BRIEFS.json", "WORKED_EXAMPLE_SPECS.json", "PRELIMINARY_VISUAL_BRIEFS.json",
            "MARKING_MAP.json", "MARKING_METHOD_OWNERSHIP.json",
        ]}
    }
    write(coverage_path, coverage)

    for md in [
        "PATTERN_CARDS.md", "VARIANT_INVARIANT_REGISTER.md", "ERROR_PREVENTION_MATRIX.md",
        "SOLUTION_DESIGN_BRIEFS.md", "WORKED_EXAMPLE_SPECS.md", "PRELIMINARY_VISUAL_BRIEFS.md",
        "ASSESSMENT_DESIGN_BRIEFS.md", "SOURCE_CAVEAT_CARRYOVER.md", "GAP_DISPOSITIONS.md",
        "STAGE4_COVERAGE_AUDIT.md",
    ]:
        path = S4 / md
        text = path.read_text(encoding="utf-8")
        for old in ["LEAD_PASS1_CANDIDATE", "LEAD_REVIEWED", "LEAD_CANONICALIZED"]:
            text = text.replace(old, "DESIGN_REVIEWED")
        path.write_text(text, encoding="utf-8")

    report = {
        "schema_version": "s4-lead-pass2-v1",
        "status": "PASS_PENDING_A8_FINAL_HASH_RECHECK",
        "checked_utc": datetime.now(timezone.utc).isoformat(),
        "a8_candidate_report": str(QA.relative_to(S4)).replace("\\", "/"),
        "a8_candidate_report_sha256": sha(QA),
        "a8_candidate_hashes_verified_before_promotion": True,
        "checks": checks,
        "pre_promotion_hashes": pre_hashes,
        "final_design_hashes": {name: sha(S4 / name) for name in status_plan},
        "coverage_audit_sha256": sha(coverage_path),
        "boundary": "Status promotion certifies the reviewed Stage 4 design only. Execution, trace, authored assessment and storyboard statuses remain pending their downstream stages.",
    }
    write(PASS2, report)
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
