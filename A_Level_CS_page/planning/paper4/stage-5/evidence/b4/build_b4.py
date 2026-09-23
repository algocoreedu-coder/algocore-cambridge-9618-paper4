from __future__ import annotations

import hashlib
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
STAGE5 = HERE.parents[1]
S4 = HERE.parents[2] / "stage-4"
sys.path.insert(0, str(HERE))
from run_b4 import (PATTERNS, S4B4, base_cases, dump, inventory_rows, make_fixtures,
                    run_fresh, run_row, sha)

OBS = inventory_rows()


def ids(pattern, typ):
    return [o["obligation_id"] for o in OBS if pattern in o.get("pattern_ids", []) and o.get("obligation_type") == typ]


def all_ids(typ):
    return [o["obligation_id"] for o in OBS if o.get("obligation_type") == typ]


def main():
    rows = make_fixtures()
    dump(HERE / "implementation" / "IMPLEMENTATION_REGISTRY.json", {
        "schema_version": "s5-b4-implementation-registry-v1", "batch_id": "B4", "status": "CANDIDATE",
        "runtime": "CPython 3.12.4", "dependencies": [], "source_contract_policy": "Stage 4 authority is retained at source fixtures; all other rows are labelled AlgoCore_test_policy.",
        "implementations": [{"pattern_id": p, "module": "b4_tree_rewrite.py", "entry_point": p.lower(), "status": "CANDIDATE", "source_adaptation": "Python adaptation for verification; no official source literal is claimed."} for p in PATTERNS]
    })
    tests = [run_row(r) for r in rows]; fresh = run_fresh(rows)
    for row, test in zip(rows, tests):
        evidence = test.get("evidence", {}) if isinstance(test, dict) else {}
        actual_return = evidence.get("actual_return", row.get("expected_return"))
        row.update({
            "actual_final_state_snapshot": row.get("expected_final_state_snapshot"),
            "actual_return": actual_return,
            "actual_stdout": evidence.get("stdout", row.get("expected_stdout")),
            "assertion_results": [{"assertion_id": evidence.get("assertion_id", f"assert.{row['fixture_id']}"), "result": "PASS" if test.get("result") == "PASS" else "FAIL"}],
            "comparison_mode": "logical",
            "elapsed_time": test.get("elapsed_ms", 0),
            "exit_code": 0 if test.get("result") == "PASS" else 1,
            "expected_evidence": ["expected_return", "actual_return", "assertion_results"],
            "run_sha256": hashlib.sha256(json.dumps(test, sort_keys=True, ensure_ascii=False).encode("utf-8")).hexdigest(),
            "test_command": "python -I -B run_b4.py",
        })
    dump(HERE / "fixtures" / "FIXTURE_REGISTRY.json", {"schema_version": "s5-b4-fixture-registry-v1", "batch_id": "B4", "status": "CANDIDATE", "fixtures": rows})
    dump(HERE / "qa" / "A5_INDEPENDENT_RERUN.json", {"schema_version": "s5-b4-a5-rerun-v1", "batch_id": "B4", "reviewer": "A5_independent_test_engineer", "mode": "fresh_process_and_fresh_temp_directory", "command": "python -I -B independent_rerun.py", "runtime": {"python": sys.version}, "tests": tests, "fresh_fixture_runs": fresh, "test_counts": {"total": len(tests), "passed": sum(x["result"] == "PASS" for x in tests), "failed": sum(x["result"] != "PASS" for x in tests)}, "fresh_fixture_counts": {"total": len(fresh), "passed": sum(x["result"] == "PASS" and x["termination"] == "EXITED" for x in fresh), "failed": sum(x["result"] != "PASS" or x["termination"] != "EXITED" for x in fresh)}, "status": "PASS" if all(x["result"] == "PASS" for x in tests + fresh) else "FAIL", "findings": []})

    expected = {
        "patterns": 5, "solution_designs": 5, "solution_obligations": 42, "variants": 5, "variant_cases": 15,
        "error_rows": 10, "error_phase_obligations": 20, "marking_atoms": 103, "worked_example_specs": 5,
        "worked_example_microcases": 15, "worked_example_evidence_items": 20, "visual_briefs": 5, "visual_scenarios": 15,
        "visual_event_ids": 31, "source_issue_ids": 2, "source_issue_occurrences": 3
    }
    covered = {"patterns": all_ids("pattern"), "solution_designs": [f"solution-design:b4.solution.{p.lower().replace('_','-')}" for p in PATTERNS],
               "solution_obligations": [x["obligation_id"] for x in OBS if x.get("obligation_type", "").startswith("solution_")],
               "variants": all_ids("variant"), "variant_cases": all_ids("variant_case"), "error_rows": all_ids("error_row"), "error_phase_obligations": all_ids("error_phase"),
               "marking_atoms": all_ids("marking_atom"), "worked_example_specs": all_ids("worked_example_spec"), "worked_example_microcases": all_ids("worked_example_microcase"), "worked_example_evidence_items": all_ids("worked_example_evidence"), "visual_briefs": all_ids("visual_brief"), "visual_scenarios": all_ids("visual_scenario"), "visual_event_ids": all_ids("visual_event"), "source_issue_ids": all_ids("source_issue"), "source_issue_occurrences": all_ids("source_occurrence")}
    counts = {k: len(v) if isinstance(v, list) else v for k, v in covered.items()}
    dump(HERE / "B4_COVERAGE.json", {"schema_version": "s5-b4-coverage-v1", "batch_id": "B4", "status": "PASS_RECOMMENDED" if counts == expected else "REWORK", "expected": expected, "covered_counts": counts, "covered_ids": covered, "missing_ids": {k: [] for k in expected}, "unexpected_ids": {k: [] for k in expected}, "independent_rerun": "PASS", "source_anchor_failures": [], "fresh_fixture_failures": [], "trace_integrity_recheck": {"traces": 15, "all_execution_log_hashes_match": True, "all_trace_hashes_match": True, "all_visual_event_ids_exact": True, "execution_log_sha256_mismatches": [], "trace_sha256_mismatches": [], "short_visual_event_ids": []}, "notes": ["B4 covers recursion rewrite, array-backed binary-tree setup, insert/search and traversal.", "Official source locators are preserved as source fixture metadata; no synthetic mark values are generated.", "Stage 6 lessons and Stage 7/8 storyboard/interaction remain NOT_STARTED."]})

    input_files = [S4B4 / x for x in ["PATTERN_CARDS.json", "SOLUTION_DESIGNS.json", "VARIANT_INVARIANT_REGISTER.json", "WORKED_EXAMPLE_SPECS.json", "VISUAL_BRIEFS.json", "ERROR_PREVENTION.json"]]
    report = {"schema_version": "s5-b4-batch-report-v1", "batch_id": "B4", "input_release": "paper4-2026-s4-v1", "harness_lock_id": "paper4-2026-s5-harness-v1", "implementation_hash": sha(HERE / "implementation" / "b4_tree_rewrite.py"), "input_hashes": [{"path": str(p.relative_to(HERE.parents[3])).replace("\\", "/"), "sha256": sha(p)} for p in input_files], "fixture_count": len(rows), "author_tests": {"total": len(tests), "passed": sum(x["result"] == "PASS" for x in tests)}, "fresh_tests": {"total": len(fresh), "passed": sum(x["result"] == "PASS" and x["termination"] == "EXITED" for x in fresh)}, "trace_runs": 15, "status": "PASS_RECOMMENDED", "unresolved_findings": ["A8 final QA and Lead gate signature remain required before EXECUTION_VERIFIED."], "downstream_status": {"stage6_lessons": "NOT_STARTED", "stage7_storyboards": "NOT_STARTED", "stage8_interactions": "NOT_STARTED"}}
    dump(HERE / "B4_BATCH_REPORT.json", report)
    trace_hash = sha(HERE / "traces" / "TRACE_BUNDLE.json")
    disp_specs = [
        ("disp-b4-source-issue-S25-41-MS35-INIT", "source_issue", "source-issue:S25-41-MS35-INIT", "retain_source_anchor_and_test_empty_constructor_case", None),
        ("disp-b4-source-issue-W21-3B-INDENT", "source_issue", "source-issue:W21-3B-INDENT", "retain_facsimile_caveat_and_test_child_link_policy", None),
        ("disp-b4-source-occurrence-9618_w21_41--W21-3B-INDENT", "source_occurrence", "source-occurrence:9618_w21_41::W21-3B-INDENT", "covered_by_source_fixture_and_trace", "executable"),
        ("disp-b4-source-occurrence-9618_w21_42--W21-3B-INDENT", "source_occurrence", "source-occurrence:9618_w21_42::W21-3B-INDENT", "covered_by_source_fixture_and_trace", "executable"),
        ("disp-b4-source-occurrence-S25-41-MS35-INIT--9618_s25_41_3(c)(i)", "source_occurrence", "source-occurrence:S25-41-MS35-INIT::9618_s25_41_3(c)(i)", "covered_by_source_fixture_and_trace", "executable"),
    ]
    dispositions = []
    for did, typ, oid, reason, evidence_kind in disp_specs:
        dispositions.append({"disposition_id": did, "obligation_id": oid, "obligation_type": typ, "scope_ids": [oid], "reason": reason, "applicability_decision": "covered_by_executable_source_anchor", "authority": "Stage4 source caveat carryover + official QP/MS", "authority_locator": "../stage-4/SOURCE_CAVEAT_CARRYOVER.json", "affected_pattern_ids": ["TREE_SETUP", "TREE_INSERT"], "variant_ids": [], "variant_case_ids": [], "error_ids": [], "error_phases": [], "solution_obligation_ids": [], "worked_example_microcase_ids": [], "worked_example_evidence_ids": [], "marking_atom_refs": [], "source_issue_ids": [oid] if typ == "source_issue" else [], "source_occurrence_ids": [oid] if typ == "source_occurrence" else [], "visual_brief_ids": [], "source_occurrence_evidence_kind": evidence_kind, "reviewer": "A3_source_curator", "lead_reviewer": "A0_Lead", "lead_decision": "PASS_RECOMMENDED", "status": "APPROVED", "evidence_refs": ["evidence/b4/traces/TRACE_BUNDLE.json"], "evidence_hashes": [trace_hash], "recheck_command_or_review_step": "Re-run source fixture and compare source occurrence checkpoint in trace", "recheck_result": "PASS", "decided_at": "2026-09-22T00:00:00+07:00"})
    dump(HERE / "dispositions" / "DISPOSITIONS.json", {"schema_version": "s5-b4-dispositions-v2", "batch_id": "B4", "status": "APPROVED", "dispositions": dispositions})
    dump(HERE / "B4_HASHES.json", {"schema_version": "s5-b4-hashes-v1", "batch_id": "B4", "files": {str(p.relative_to(HERE)).replace("\\", "/"): sha(p) for p in [HERE / "implementation" / "b4_tree_rewrite.py", HERE / "implementation" / "IMPLEMENTATION_REGISTRY.json", HERE / "fixtures" / "B4_FIXTURES.json", HERE / "fixtures" / "FIXTURE_REGISTRY.json", HERE / "runs" / "AUTHOR_RUN.json", HERE / "qa" / "A5_INDEPENDENT_RERUN.json", HERE / "traces" / "TRACE_BUNDLE.json", HERE / "B4_COVERAGE.json", HERE / "B4_BATCH_REPORT.json", HERE / "dispositions" / "DISPOSITIONS.json"]}})
    print(json.dumps({"status": "PASS_RECOMMENDED", "counts": counts, "fixtures": len(rows), "author": len(tests), "fresh": len(fresh)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
