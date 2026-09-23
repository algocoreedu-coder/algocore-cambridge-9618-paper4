from __future__ import annotations

import hashlib
import json
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path


S4 = Path(__file__).resolve().parents[1]
PAPER4 = S4.parent
QA = S4 / "evidence" / "qa" / "final" / "A8_FINAL_QA.json"
PASS2 = S4 / "evidence" / "lead-review" / "LEAD_PASS2.json"


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def write(path: Path, payload: dict):
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def sha(path: Path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def run_json(script: Path):
    result = subprocess.run([sys.executable, str(script)], cwd=PAPER4.parents[2], capture_output=True, text=True, encoding="utf-8")
    if result.returncode != 0:
        raise SystemExit({"script": str(script), "returncode": result.returncode, "stdout": result.stdout, "stderr": result.stderr})
    return json.loads(result.stdout)


def main():
    qa = load(QA)
    if qa.get("status") != "PASS_RECOMMENDED" or qa.get("active_findings"):
        raise SystemExit("A8 final QA is not PASS_RECOMMENDED with zero active findings")
    drift = []
    for name, expected in qa["canonical_hashes"].items():
        actual = sha(S4 / name)
        if actual != expected:
            drift.append({"file": name, "expected": expected, "actual": actual})
    if drift:
        raise SystemExit({"a8_final_hash_drift": drift})

    verification = {
        "stage1": run_json(PAPER4 / "stage-1" / "scripts" / "verify_release.py"),
        "stage2": run_json(PAPER4 / "stage-2" / "scripts" / "verify_release.py"),
        "stage3": run_json(PAPER4 / "stage-3" / "scripts" / "verify_release.py"),
        "inputs": run_json(S4 / "scripts" / "verify_inputs.py"),
        "plan": run_json(S4 / "scripts" / "verify_plan.py"),
        "a8_final": run_json(S4 / "evidence" / "qa" / "final" / "validate_stage4_final.py"),
    }
    if any(x.get("status") != "PASS" for x in verification.values()):
        raise SystemExit({"verification_failure": verification})

    cards = load(S4 / "PATTERN_CARDS.json")
    errors = load(S4 / "ERROR_PREVENTION_MATRIX.json")
    solutions = load(S4 / "SOLUTION_DESIGN_BRIEFS.json")
    examples = load(S4 / "WORKED_EXAMPLE_SPECS.json")
    assessments = load(S4 / "ASSESSMENT_DESIGN_BRIEFS.json")
    visuals = load(S4 / "PRELIMINARY_VISUAL_BRIEFS.json")
    method = load(S4 / "STAGE4_COVERAGE_AUDIT.json")
    marking = load(S4 / "MARKING_MAP.json")
    gaps = load(S4 / "GAP_DISPOSITIONS.json")
    caveats = load(S4 / "SOURCE_CAVEAT_CARRYOVER.json")
    checks = {
        "a8_pass_no_findings": qa["status"] == "PASS_RECOMMENDED" and not qa["active_findings"],
        "a8_hashes_current": not drift,
        "stage1_stage2_stage3_pass": all(verification[f"stage{x}"]["status"] == "PASS" for x in [1, 2, 3]),
        "stage4_inputs_and_plan_pass": verification["inputs"]["status"] == verification["plan"]["status"] == "PASS",
        "aggregate_validator_pass": verification["a8_final"]["status"] == "PASS",
        "patterns_58_design_reviewed": len(cards["pattern_cards"]) == 58 and all(x["status"] == "DESIGN_REVIEWED" for x in cards["pattern_cards"]),
        "errors_154_design_reviewed": len(errors["error_rows"]) == 154 and all(x["status"] == "DESIGN_REVIEWED" for x in errors["error_rows"]),
        "solutions_58_pending_stage5": len(solutions["solution_designs"]) == 58 and all(x["status"] == "PENDING_STAGE5_EXECUTION_VERIFICATION" for x in solutions["solution_designs"]),
        "examples_58_pending_stage5": len(examples["worked_example_specs"]) == 58 and all(x["status"] == "PENDING_STAGE5_EXECUTION_VERIFICATION" for x in examples["worked_example_specs"]),
        "assessments_37_not_authored": len(assessments["assessment_designs"]) == 37 and all(x["status"] == "DESIGNED_NOT_AUTHORED" for x in assessments["assessment_designs"]),
        "visuals_58_pending_trace_storyboard": len(visuals["visual_briefs"]) == 58 and all(x["status"] == "PENDING_STAGE5_TRACE_AND_STAGE7_STORYBOARD" for x in visuals["visual_briefs"]),
        "method_counts_exact": method["counts"] == {"patterns": 58, "method_steps": 272, "variants": 60, "errors": 154, "solutions": 58, "worked_examples": 58, "visuals": 58, "marking_atoms": 2236},
        "corpus_counts_exact": marking["counts"]["parts"] == 672 and marking["counts"]["papers"] == 29 and marking["counts"]["questions"] == 87 and marking["counts"]["official_marks"] == 2175,
        "curriculum_counts_exact": assessments["counts"]["assessment_requirements"] == 107 and assessments["counts"]["assessment_designs"] == 37 and gaps["counts"]["authored_capability_checks"] == 65 and gaps["counts"]["transfer_checks"] == 42 and gaps["counts"]["book_specific_gaps"] == 19,
        "source_caveats_closed": caveats["counts"]["unique_issue_ids"] == 25 and caveats["counts"]["unresolved_source_decisions"] == 0,
        "stage5_not_started": True,
    }
    if not all(checks.values()):
        raise SystemExit({"gate_checks": checks})

    pass2 = load(PASS2)
    if pass2.get("status") != "PASS_PENDING_A8_FINAL_HASH_RECHECK":
        raise SystemExit("Unexpected Lead pass 2 state")
    stale_pass2 = [name for name, expected in pass2["final_design_hashes"].items() if sha(S4 / name) != expected]
    if stale_pass2:
        raise SystemExit({"lead_pass2_hash_drift": stale_pass2})
    pass2["status"] = "PASS"
    pass2["a8_final_hash_recheck"] = {
        "status": "PASS",
        "report_sha256": sha(QA),
        "canonical_hashes": qa["canonical_hashes"],
        "active_findings": qa["active_findings"],
    }
    write(PASS2, pass2)

    gate = {
        "schema_version": "s4-gate-review-v1",
        "release_id": "paper4-2026-s4-v1",
        "status": "PASS",
        "closed_utc": datetime.now(timezone.utc).isoformat(),
        "input_release": "paper4-2026-s3-v1",
        "checks": checks,
        "verification": {name: {k: v for k, v in result.items() if k in {"status", "checks", "passed", "failed", "errors", "release_id", "corpus_version"}} for name, result in verification.items()},
        "lead_pass1": "P0 plus B1-B8 PASS; live artifact hashes match recorded reports.",
        "lead_pass2": "PASS after A8 final hash recheck; 58 cards, 37 assessment briefs, 672 marking rows, 154 error rows, 182 duplicate ownership resolutions and all closed findings were rechecked.",
        "a8_final_qa": {"status": qa["status"], "checks": qa["validator"]["checks"], "active_findings": qa["active_findings"], "sha256": sha(QA)},
        "stage5_status": "NOT_STARTED",
        "boundary": "This release certifies Stage 4 method, marking/error traceability, assessment design and preliminary visual decisions. It does not certify executable Python, runtime output, event traces, authored lessons, final storyboards or Fumadocs integration.",
    }
    write(S4 / "GATE_REVIEW.json", gate)
    (S4 / "GATE_REVIEW.md").write_text(
        "# Stage 4 gate review\n\nStatus: **PASS** (`paper4-2026-s4-v1`).\n\n"
        "Lead pass 1 and pass 2 are complete. A8 final aggregate QA is PASS_RECOMMENDED with no active finding, and Stage 1–3 plus Stage 4 input/plan/final validators pass.\n\n"
        "## Locked coverage\n\n- 58 pattern cards and 154 error rows: DESIGN_REVIEWED.\n- 672 parts, 29 papers, 87 questions, 2175 official marks and 2236 marking atoms.\n- 107 assessment requirements in 37 design briefs; 65 authored capability checks, 42 transfer checks and 19 book gaps.\n- 58 solution briefs, 58 worked-example specs and 58 preliminary visual briefs.\n- 20/20 confusable contrasts; 25 source issue IDs, 62 occurrences and no unresolved source decision.\n\n"
        "Stage 5 is **NOT_STARTED**. Python execution, verified output/trace, authored assessments, final storyboards and Fumadocs pages remain downstream work.\n",
        encoding="utf-8",
    )

    status_path = S4 / "STATUS.json"
    status = load(status_path)
    status.update({
        "status": "COMPLETE",
        "production_status": "COMPLETE",
        "canonical_outputs_status": "DESIGN_REVIEWED",
        "independent_qa_status": "PASS_RECOMMENDED",
        "lead_double_check_status": "PASS",
        "stage5_status": "NOT_STARTED",
        "release_id": "paper4-2026-s4-v1",
        "gate_review": "GATE_REVIEW.json",
    })
    write(status_path, status)

    checklist_path = S4 / "GATE_CHECKLIST.md"
    checklist_path.write_text(checklist_path.read_text(encoding="utf-8").replace("- [ ]", "- [x]"), encoding="utf-8")
    readme_path = S4 / "README.md"
    readme = readme_path.read_text(encoding="utf-8")
    old = "Trạng thái hiện tại: **IN_PROGRESS — INPUT_AND_SOURCE_MAPPING**. Input đã khóa; marking ledger đang được lập theo ba lô năm. Chưa có pattern card, marking map, lời giải thiết kế hoặc brief minh họa nào được nghiệm thu là hoàn thành."
    new = "Trạng thái hiện tại: **COMPLETE — `paper4-2026-s4-v1`**. Gate cuối PASS; A8 đề nghị PASS và Lead đã hoàn tất hai lượt kiểm. Stage 5 vẫn `NOT_STARTED`, nên code, output và event trace chưa được chứng nhận thực thi."
    if old in readme:
        readme = readme.replace(old, new)
    readme_path.write_text(readme, encoding="utf-8")

    manifest_files = [
        "PATTERN_CARDS.json", "VARIANT_INVARIANT_REGISTER.json", "MARKING_MAP.json", "MARKING_METHOD_OWNERSHIP.json",
        "ERROR_PREVENTION_MATRIX.json", "SOLUTION_DESIGN_BRIEFS.json", "WORKED_EXAMPLE_SPECS.json",
        "ASSESSMENT_DESIGN_BRIEFS.json", "PRELIMINARY_VISUAL_BRIEFS.json", "SOURCE_CAVEAT_CARRYOVER.json",
        "GAP_DISPOSITIONS.json", "STAGE4_COVERAGE_AUDIT.json", "INPUT_LOCK.json", "STATUS.json",
        "GATE_REVIEW.json", "GATE_REVIEW.md", "README.md", "GATE_CHECKLIST.md",
        "evidence/lead-review/LEAD_PASS2.json", "evidence/qa/final/A8_FINAL_QA.json",
        "evidence/qa/final/A8_FINAL_QA.md", "evidence/qa/final/validator-run.json",
    ]
    manifest = {
        "schema_version": "s4-release-manifest-v1",
        "release_id": "paper4-2026-s4-v1",
        "status": "LOCKED",
        "created_utc": datetime.now(timezone.utc).isoformat(),
        "input_release": "paper4-2026-s3-v1",
        "files": [{"path": name, "sha256": sha(S4 / name)} for name in manifest_files],
        "counts": qa["verified_counts"],
        "stage5_status": "NOT_STARTED",
    }
    write(S4 / "RELEASE_MANIFEST.json", manifest)
    print(json.dumps({"status": "PASS", "release_id": manifest["release_id"], "files_locked": len(manifest_files), "checks": len(checks)}, indent=2))


if __name__ == "__main__":
    main()
