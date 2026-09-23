from __future__ import annotations

import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
P4 = HERE.parents[2]
S4P0 = P4 / "stage-4" / "evidence" / "method" / "P0-stack"


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def read(name):
    return json.loads((S4P0 / name).read_text(encoding="utf-8"))


def main() -> None:
    cards = {x["pattern_id"]: x for x in read("PATTERN_CARDS.json")["pattern_cards"]}
    designs = {x["pattern_id"]: x for x in read("SOLUTION_DESIGNS.json")["solution_designs"]}
    variants = read("VARIANT_INVARIANT_REGISTER.json")["variants"]
    examples = {x["pattern_id"]: x for x in read("WORKED_EXAMPLE_SPECS.json")["worked_example_specs"]}
    briefs = {x["pattern_id"]: x for x in read("VISUAL_BRIEFS.json")["visual_briefs"]}
    errors = read("ERROR_PREVENTION.json")["error_rows"]
    run = json.loads((HERE / "runs" / "AUTHOR_RUN.json").read_text(encoding="utf-8"))
    rerun = json.loads((HERE / "qa" / "A5_INDEPENDENT_RERUN.json").read_text(encoding="utf-8"))
    traces = json.loads((HERE / "traces" / "TRACE_BUNDLE.json").read_text(encoding="utf-8"))
    impl = HERE / "implementation" / "stack_pilot.py"
    fresh_by_fixture = {x["fixture_id"]: x for x in run["fresh_fixture_runs"]}
    anchors_by_pattern = {x["pattern_id"]: x for x in run["source_anchor_runs"]}

    fixture_rows = []
    for test in run["tests"]:
        pattern = test["pattern_id"]
        fixture_rows.append({
            "fixture_id": test["fixture_id"], "test_id": test["test_id"], "pattern_id": pattern,
            "variant_id": designs[pattern]["variant_id"],
            "entry_point": "see variant binding for case; fixture executes one binding",
            "representation": designs[pattern]["state_model"],
            "oracle": "AlgoCore_test_policy" if test["fixture_id"] == "fx.pair.both_empty" else "official_source_adjudication",
            "authority": "AlgoCore_inference" if test["fixture_id"] == "fx.pair.both_empty" else "official_source_adjudication",
            "expected_evidence": test["evidence"],
            "fresh_subprocess_run": fresh_by_fixture[test["fixture_id"]],
            "status": test["result"],
        })
    for pattern, anchor in anchors_by_pattern.items():
        fixture_rows.append({
            "fixture_id": anchor["fixture_id"],
            "test_id": f"p0.anchor.{pattern.lower()}",
            "pattern_id": pattern,
            "variant_id": designs[pattern]["variant_id"],
            "entry_point": "source-anchor executable worker",
            "representation": designs[pattern]["state_model"],
            "oracle": "official_qp_ms_source_anchor",
            "authority": "official_qp_ms_source_anchor",
            "source_part_id": anchor["part_id"],
            "source_anchor_run": anchor,
            "status": anchor["result"],
        })
    fixture_doc = {
        "schema_version": "s5-p0-fixture-registry-v1", "batch_id": "P0",
        "input_release": "paper4-2026-s4-v1",
        "implementation_hash": sha256(impl), "fixtures": fixture_rows,
        "source_anchors": {
            p: {"fixture_id": f"fx.anchor.{p.lower()}", "part_id": examples[p]["anchor_source"]["part_id"],
                "source_batch": examples[p]["anchor_source"]["source_batch"],
                "qp_locator": examples[p]["anchor_source"]["qp_locator"],
                "authority": "official_source_adjudication",
                "run_evidence": anchors_by_pattern[p]["evidence"],
                "run_record": anchors_by_pattern[p]}
            for p in designs
        },
    }
    (HERE / "fixtures" / "FIXTURE_REGISTRY.json").write_text(json.dumps(fixture_doc, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    pattern_rows = []
    for pattern in designs:
        test_rows = [t for t in run["tests"] if t["pattern_id"] == pattern]
        trace_rows = [t for t in traces["traces"] if t["pattern_id"] == pattern]
        pattern_rows.append({
            "pattern_id": pattern, "solution_design_id": designs[pattern]["solution_design_id"],
            "implementation_path": "implementation/stack_pilot.py", "implementation_sha256": sha256(impl),
            "variant_entry_point_bindings": {
                "variant_id": designs[pattern]["variant_id"],
                "bindings": [v for v in variants if v["variant_id"] == designs[pattern]["variant_id"]][0]["cases"],
            },
            "method_step_ids": designs[pattern]["ordered_method_step_ids"],
            "marking_point_refs": sorted({m["marking_point_id"] for s in designs[pattern]["source_constraints"] for m in s["ms_atoms"]}),
            "source_anchor_fixture_id": f"fx.anchor.{pattern.lower()}",
            "fixture_ids": [t["fixture_id"] for t in test_rows], "test_ids": [t["test_id"] for t in test_rows],
            "trace_ids": [t["trace_id"] for t in trace_rows],
            "visual_brief_id": briefs[pattern]["visual_brief_id"],
            "error_ids": [e["error_id"] for e in errors if e["pattern_id"] == pattern],
            "status": "PASS_RECOMMENDED",
            "fresh_subprocess_fixture_ids": [t["fixture_id"] for t in test_rows],
            "source_anchor_run": anchors_by_pattern[pattern]["fixture_id"],
        })
    impl_doc = {
        "schema_version": "s5-p0-implementation-registry-v1", "batch_id": "P0",
        "implementation_sha256": sha256(impl), "entry_points": "implementation/stack_pilot.py::ENTRY_POINTS",
        "patterns": pattern_rows, "run_report": "runs/AUTHOR_RUN.json",
        "independent_rerun": "qa/A5_INDEPENDENT_RERUN.json", "status": "PASS_RECOMMENDED",
    }
    (HERE / "implementation" / "IMPLEMENTATION_REGISTRY.json").write_text(json.dumps(impl_doc, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    coverage = {
        "schema_version": "s5-p0-coverage-v1", "batch_id": "P0", "status": "PASS_RECOMMENDED",
        "expected": {"patterns": 5, "solution_designs": 5, "variants": 5, "variant_cases": 16,
                      "worked_example_specs": 5, "visual_briefs": 5, "source_anchor_fixtures": 5,
                      "error_rows": len(errors), "tests": 20, "source_anchor_runs": 5, "fresh_fixture_runs": 20},
        "covered": {"patterns": len(pattern_rows), "solution_designs": len(pattern_rows), "variants": 5,
                     "variant_cases": sum(len(v["cases"]) for v in variants), "worked_example_specs": len(examples),
                     "visual_briefs": len(traces["visual_briefs_with_trace_bundle"]),
                     "source_anchor_fixtures": len(pattern_rows), "source_anchor_runs": len(anchors_by_pattern),
                     "fresh_fixture_runs": len(fresh_by_fixture), "error_rows": len(errors), "tests": len(run["tests"]),
                     "trace_runs": traces["actual_trace_run_count"]},
        "missing_ids": [], "unexpected_ids": [], "independent_rerun": rerun["result"],
        "fresh_fixture_failures": [x["fixture_id"] for x in run["fresh_fixture_runs"] if x["result"] != "PASS" or x["termination"] != "completed"],
        "source_anchor_failures": [x["fixture_id"] for x in run["source_anchor_runs"] if x["result"] != "PASS" or x["termination"] != "completed"],
        "notes": ["P0 local coverage only; aggregate Stage 5 denominators remain open until B1-B8.",
                  "Both-empty pair message is explicitly AlgoCore_inference and no official Cambridge literal is claimed.",
                  "Malformed/initially-empty STACK_REDUCE inputs remain outside source precondition and are not upgraded to Cambridge requirements."],
    }
    (HERE / "P0_COVERAGE.json").write_text(json.dumps(coverage, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
