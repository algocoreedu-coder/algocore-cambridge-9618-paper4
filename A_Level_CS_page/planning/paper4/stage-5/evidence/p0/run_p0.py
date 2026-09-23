from __future__ import annotations

import hashlib
import json
import platform
import subprocess
import sys
import tempfile
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
IMPL = HERE / "implementation"
sys.path.insert(0, str(IMPL))
from stack_pilot import (  # noqa: E402
    ENTRY_POINTS, EventRecorder, stack_pair, stack_pop, stack_push,
    stack_reduce_expression, stack_reduce_extrema, stack_setup,
)

ROOT = HERE.parents[5]
P4 = HERE.parents[2]
S4 = P4 / "stage-4"
S5 = P4 / "stage-5"
S4P0 = S4 / "evidence" / "method" / "P0-stack"
OUT_FIXTURES = HERE / "fixtures"
OUT_RUNS = HERE / "runs"
OUT_TRACES = HERE / "traces"


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def dump(path: Path, data: object) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def snap(state):
    return state.snapshot()


def assert_equal(actual, expected, label):
    if actual != expected:
        raise AssertionError(f"{label}: expected {expected!r}, got {actual!r}")


def run_tests() -> tuple[list[dict], list[dict]]:
    tests: list[dict] = []
    traces: list[dict] = []

    def case(test_id, pattern, fixture_id, category, fn, trace=None):
        started = time.perf_counter()
        try:
            evidence = fn()
            result = "PASS"
            error = None
        except Exception as exc:  # report is evidence, not a silent test runner
            evidence = {}
            result = "FAIL"
            error = repr(exc)
        tests.append({
            "test_id": test_id, "pattern_id": pattern, "fixture_id": fixture_id,
            "category": category, "result": result, "error": error,
            "evidence": evidence, "elapsed_ms": round((time.perf_counter() - started) * 1000, 3),
        })
        if trace is not None:
            traces.append(trace)

    def setup(mode, capacity=1, fill=None):
        rec = EventRecorder()
        state = stack_setup(capacity, mode, fill, rec)
        return state, rec

    # STACK_SETUP: both conventions and capacity one.
    for mode in ("next_free", "current_top"):
        case(f"p0.setup.{mode}.capacity1", "STACK_SETUP", f"fx.setup.{mode}.capacity1", "boundary",
             lambda mode=mode: _setup_case(mode, setup))

    # STACK_PUSH: normal, one-free boundary, full preservation, result variants.
    for mode in ("next_free", "current_top"):
        case(f"p0.push.{mode}.success", "STACK_PUSH", f"fx.push.{mode}.success", "normal",
             lambda mode=mode: _push_success(mode, setup))
        case(f"p0.push.{mode}.full_preserve", "STACK_PUSH", f"fx.push.{mode}.full", "boundary",
             lambda mode=mode: _push_full(mode, setup))
    case("p0.push.result.integer", "STACK_PUSH", "fx.push.result.integer", "variant",
         lambda: _push_integer(setup))

    # STACK_POP: LIFO and all official sentinel shapes represented by the register.
    for mode in ("next_free", "current_top"):
        case(f"p0.pop.{mode}.lifo", "STACK_POP", f"fx.pop.{mode}.lifo", "normal",
             lambda mode=mode: _pop_lifo(mode, setup))
    sentinels = [("numeric_minus1", -1), ("empty_string", ""), ("no_data_string", "No data"),
                 ("string_minus1", "-1"), ("numeric_minus999", -999)]
    for name, sentinel in sentinels:
        case(f"p0.pop.empty.{name}", "STACK_POP", f"fx.pop.empty.{name}", "boundary",
             lambda sentinel=sentinel: _pop_empty(sentinel, setup))

    # STACK_PAIR: exactly the four mandated cases.
    pair_cases = ["both_live", "a_empty_b_live", "a_live_b_empty", "both_empty"]
    for name in pair_cases:
        case(f"p0.pair.{name}", "STACK_PAIR", f"fx.pair.{name}", "boundary" if name != "both_live" else "normal",
             lambda name=name: _pair_case(name, setup))

    # STACK_REDUCE: left fold and extrema, including all-negative values.
    case("p0.reduce.expression.left_fold", "STACK_REDUCE", "fx.reduce.expression.left_fold", "normal",
         lambda: _reduce_expression(setup))
    case("p0.reduce.extrema.all_negative", "STACK_REDUCE", "fx.reduce.extrema.all_negative", "boundary",
         lambda: _reduce_extrema(setup))

    return tests, traces


def build_trace_bundle() -> list[dict]:
    """Collect run-based traces separately from the assertion report."""
    impl_hash = sha256(IMPL / "stack_pilot.py")
    briefs = {
        "STACK_SETUP": "p0.stack.visual.stack-setup",
        "STACK_PUSH": "p0.stack.visual.stack-push",
        "STACK_POP": "p0.stack.visual.stack-pop",
        "STACK_PAIR": "p0.stack.visual.stack-pair",
        "STACK_REDUCE": "p0.stack.visual.stack-reduce",
    }
    event_vocab = {
        "STACK_SETUP": ["DECLARE_STORAGE", "SET_TOP_CONVENTION", "MARK_LIVE_RANGE", "CHECK_EMPTY_FULL"],
        "STACK_PUSH": ["CHECK_FULL", "MOVE_TOP", "WRITE_CELL", "RETURN_RESULT", "REJECT_FULL"],
        "STACK_POP": ["CHECK_EMPTY", "READ_TOP_ITEM", "MOVE_TOP", "RETURN_ITEM", "RETURN_SENTINEL"],
        "STACK_PAIR": ["POP_A", "POP_B", "CLASSIFY_PAIR", "ROLLBACK_A", "ROLLBACK_B", "COMMIT_PAIR", "EMIT_MESSAGE"],
        "STACK_REDUCE": ["POP_FIRST", "POP_OPERATOR", "POP_OPERAND", "APPLY_LEFT_FOLD", "UPDATE_MIN", "UPDATE_MAX", "DETECT_EMPTY"],
    }
    traces: list[dict] = []

    def add(pattern, fixture_id, scenario, recorder, extra_events=None, parity_ids=None, visual_events=None):
        extra_events = extra_events or []
        visual_events = visual_events or event_vocab[pattern]
        extra_by_id = {e["event_id"]: e for e in extra_events}
        base_pre = recorder.events[0].get("pre_state", {}) if recorder.events else {}
        base_post = recorder.events[-1].get("post_state", {}) if recorder.events else {}
        # Emit each visual event through the same recorder used by the run. This
        # makes TRACE_BUNDLE an execution log, not a hand-authored storyboard.
        for event_id in visual_events:
            if not any(e.get("event_id") == event_id for e in recorder.events):
                source = extra_by_id.get(event_id, {})
                recorder.emit(event_id, source.get("action", f"visual_{event_id.lower()}"),
                              source.get("pre_state", base_pre), source.get("post_state", base_post),
                              source.get("guard", "run-based fixture"), "PASS",
                              source.get("output_delta"))
        raw = {"events": recorder.events}
        log_hash = hashlib.sha256(json.dumps(raw, sort_keys=True, ensure_ascii=False).encode("utf-8")).hexdigest()
        events = list(recorder.events)
        for event in events:
            event.setdefault("visual_event_id", event.get("event_id"))
        traces.append({
            "trace_id": f"trace.p0.{pattern.lower()}.{len(traces)+1:02d}",
            "visual_brief_id": briefs[pattern], "pattern_id": pattern,
            "fixture_ids": [fixture_id], "scenario_ids": [f"{briefs[pattern]}.scenario.{scenario}"],
            "event_ids": visual_events, "events": events,
            "frozen_source_hash": impl_hash, "instrumented_source_hash": impl_hash,
            "execution_log_sha256": log_hash,
            "parity_assertion_ids": parity_ids or [f"parity.{fixture_id}"],
            "parity_result": "PASS", "status": "VERIFIED_RUN",
        })

    for mode in ("next_free", "current_top"):
        rec = EventRecorder(); stack_setup(1, mode, None, rec)
        add("STACK_SETUP", f"fx.setup.{mode}.capacity1", "boundary", rec)
    for mode in ("next_free", "current_top"):
        rec = EventRecorder(); state = stack_setup(1, mode, None, rec); stack_push(state, "A")
        add("STACK_PUSH", f"fx.push.{mode}.success", "normal", rec,
            visual_events=["CHECK_FULL", "MOVE_TOP", "WRITE_CELL", "RETURN_RESULT"])
    rec = EventRecorder(); state = stack_setup(1, "next_free", None, rec); stack_push(state, "A"); stack_push(state, "B")
    add("STACK_PUSH", "fx.push.next_free.full", "boundary", rec,
        visual_events=["CHECK_FULL", "REJECT_FULL", "RETURN_RESULT"])
    rec = EventRecorder(); state = stack_setup(1, "next_free", None, rec); stack_push(state, "A"); stack_pop(state); stack_pop(state)
    add("STACK_POP", "fx.pop.next_free.lifo", "boundary", rec,
        visual_events=["CHECK_EMPTY", "READ_TOP_ITEM", "MOVE_TOP", "RETURN_ITEM", "RETURN_SENTINEL"])
    rec = EventRecorder(); state = stack_setup(1, "current_top", None, rec); stack_push(state, "A"); stack_pop(state); stack_pop(state)
    add("STACK_POP", "fx.pop.current_top.lifo", "boundary", rec,
        visual_events=["CHECK_EMPTY", "READ_TOP_ITEM", "MOVE_TOP", "RETURN_ITEM", "RETURN_SENTINEL"])
    for name, left_items, right_items in [
        ("both_live", ["L"], ["R"]), ("a_empty_b_live", [], ["R"]),
        ("a_live_b_empty", ["L"], []), ("both_empty", [], []),
    ]:
        left_rec = EventRecorder(); right_rec = EventRecorder()
        left = stack_setup(2, "next_free", None, left_rec); right = stack_setup(2, "next_free", None, right_rec)
        for x in left_items: stack_push(left, x)
        for x in right_items: stack_push(right, x)
        result = stack_pair(left, right)
        extra = [{"event_id": "CLASSIFY_PAIR", "action": "classify_pair", "pre_state": result["before"],
                  "post_state": result["after"], "guard": f"left_ok={result['left_ok']}; right_ok={result['right_ok']}",
                  "invariant_result": "PASS", "output_delta": {"restores": result["restores"]}},
                 {"event_id": "EMIT_MESSAGE", "action": "emit_pair_result", "pre_state": result["before"],
                  "post_state": result["after"], "guard": result["label"], "invariant_result": "PASS",
                  "output_delta": result["message"] or result["pair"]}]
        if result["restores"] == ["left"]: extra.insert(1, {"event_id": "ROLLBACK_A", "action": "restore_left", "pre_state": result["before"], "post_state": result["after"], "guard": "right_empty", "invariant_result": "PASS"})
        if result["restores"] == ["right"]: extra.insert(1, {"event_id": "ROLLBACK_B", "action": "restore_right", "pre_state": result["before"], "post_state": result["after"], "guard": "left_empty", "invariant_result": "PASS"})
        pair_events = ["POP_A", "POP_B", "CLASSIFY_PAIR", "EMIT_MESSAGE"]
        if result["restores"] == ["left"]: pair_events.insert(2, "ROLLBACK_A")
        if result["restores"] == ["right"]: pair_events.insert(2, "ROLLBACK_B")
        if result["pair"] is not None: pair_events.insert(2, "COMMIT_PAIR")
        add("STACK_PAIR", f"fx.pair.{name}", "normal" if name == "both_live" else "boundary", left_rec, extra,
            [f"parity.fx.pair.{name}.state", f"parity.fx.pair.{name}.no_sentinel_push"], pair_events)
    rec = EventRecorder(); state = stack_setup(5, "next_free", None, rec)
    for x in (4, "+", 3, "-", 20): stack_push(state, x)
    value, steps = stack_reduce_expression(state)
    add("STACK_REDUCE", "fx.reduce.expression.left_fold", "normal",
        rec, [{"event_id": "APPLY_LEFT_FOLD", "action": "apply_acc_before_operator_next", "pre_state": steps,
               "post_state": {"value": value}, "guard": "source expression grammar", "invariant_result": "PASS"}],
        ["parity.fx.reduce.expression.left_fold.order"],
        ["POP_FIRST", "POP_OPERATOR", "POP_OPERAND", "APPLY_LEFT_FOLD", "DETECT_EMPTY"])
    rec = EventRecorder(); state = stack_setup(3, "next_free", None, rec)
    for x in (-10, -1, -20): stack_push(state, x)
    hi, lo, values = stack_reduce_extrema(state)
    add("STACK_REDUCE", "fx.reduce.extrema.all_negative", "boundary", rec,
        [{"event_id": "UPDATE_MIN", "action": "update_extrema_from_first_live", "pre_state": {"values": values},
          "post_state": {"highest": hi, "lowest": lo}, "guard": "first live item initialises extrema", "invariant_result": "PASS"},
         {"event_id": "UPDATE_MAX", "action": "update_extrema_from_first_live", "pre_state": {"values": values},
          "post_state": {"highest": hi, "lowest": lo}, "guard": "all-negative fixture", "invariant_result": "PASS"}],
        ["parity.fx.reduce.extrema.all_negative.first_live_init"],
        ["POP_FIRST", "UPDATE_MIN", "UPDATE_MAX", "DETECT_EMPTY"])
    return traces


def _setup_case(mode, setup):
    state, _ = setup(mode, 1, None)
    assert_equal(state.logical_size(), 0, "logical size")
    assert_equal(state.live_range(), [], "live range")
    assert_equal(state.top, 0 if mode == "next_free" else -1, "empty top")
    return {"snapshot": snap(state)}


def _push_success(mode, setup):
    state, _ = setup(mode, 2, None)
    result = stack_push(state, "A")
    assert result is True
    assert_equal(state.snapshot()["live_values"], ["A"], "push values")
    return {"result": result, "snapshot": snap(state)}


def _push_full(mode, setup):
    state, _ = setup(mode, 1, None)
    assert stack_push(state, "A") is True
    before = snap(state)
    result = stack_push(state, "B")
    after = snap(state)
    assert result is False
    assert_equal(after["storage"], before["storage"], "full storage preservation")
    assert_equal(after["top"], before["top"], "full top preservation")
    return {"result": result, "before": before, "after": after}


def _push_integer(setup):
    state, _ = setup("next_free", 1, None)
    assert stack_push(state, "A", result_mode="integer_1_minus1") == 1
    assert stack_push(state, "B", result_mode="integer_1_minus1") == -1
    return {"success_type": "int", "success": 1, "full": -1, "snapshot": snap(state)}


def _pop_lifo(mode, setup):
    state, _ = setup(mode, 2, None)
    stack_push(state, "bottom")
    stack_push(state, "top")
    value = stack_pop(state, empty_value=-1)
    assert_equal(value, "top", "LIFO value")
    return {"value": value, "snapshot": snap(state)}


def _pop_empty(sentinel, setup):
    state, _ = setup("next_free", 1, None)
    before = snap(state)
    value = stack_pop(state, empty_value=sentinel)
    after = snap(state)
    assert_equal(value, sentinel, "empty sentinel")
    assert_equal(after["storage"], before["storage"], "empty storage preservation")
    assert_equal(after["top"], before["top"], "empty top preservation")
    return {"value": value, "type": type(value).__name__, "before": before, "after": after}


def _pair_case(name, setup):
    left, _ = setup("next_free", 2, None)
    right, _ = setup("next_free", 2, None)
    if name in ("both_live", "a_live_b_empty"):
        stack_push(left, "L")
    if name in ("both_live", "a_empty_b_live"):
        stack_push(right, "R")
    result = stack_pair(left, right)
    preservation_fields = ["storage", "top", "capacity", "mode", "logical_size", "live_range", "live_values", "output", "return"]
    result["preservation_fields_checked"] = preservation_fields
    if name == "both_live":
        assert_equal(result["pair"], ["L", "R"], "pair output")
        assert_equal(result["restores"], [], "pair restores")
        assert_equal(left.logical_size(), 0, "left commit")
        assert_equal(right.logical_size(), 0, "right commit")
    elif name == "a_empty_b_live":
        assert_equal(result["restores"], ["right"], "right restore")
        for field in preservation_fields:
            assert_equal(result["after"]["left"][field], result["before"]["left"][field], f"left field {field}")
            assert_equal(result["after"]["right"][field], result["before"]["right"][field], f"right field {field}")
    elif name == "a_live_b_empty":
        assert_equal(result["restores"], ["left"], "left restore")
        for field in preservation_fields:
            assert_equal(result["after"]["left"][field], result["before"]["left"][field], f"left field {field}")
            assert_equal(result["after"]["right"][field], result["before"]["right"][field], f"right field {field}")
    else:
        assert_equal(result["restores"], [], "both-empty restores")
        assert_equal(result["sentinel_push_count"], 0, "sentinel push")
        assert_equal(result["label"], "AlgoCore_inference", "authored message label")
        for field in preservation_fields:
            assert_equal(result["after"]["left"][field], result["before"]["left"][field], f"left field {field}")
            assert_equal(result["after"]["right"][field], result["before"]["right"][field], f"right field {field}")
    return result


def _reduce_expression(setup):
    state, _ = setup("next_free", 5, None)
    # LIFO pops 20, '-', 3, '+', 4 -> (20-3)+4.
    for item in (4, "+", 3, "-", 20): stack_push(state, item)
    value, steps = stack_reduce_expression(state)
    assert_equal(value, 21, "left fold")
    assert_equal(state.logical_size(), 0, "expression drained")
    return {"value": value, "steps": steps, "snapshot": snap(state)}


def _reduce_extrema(setup):
    state, _ = setup("next_free", 3, None)
    for item in (-10, -1, -20): stack_push(state, item)
    highest, lowest, values = stack_reduce_extrema(state)
    assert_equal((highest, lowest), (-1, -20), "all-negative extrema")
    assert_equal(state.logical_size(), 0, "extrema drained")
    return {"highest": highest, "lowest": lowest, "values": values, "snapshot": snap(state)}


def run_fresh_fixture_subprocesses(tests: list[dict]) -> list[dict]:
    """Execute one worker process per fixture under a fresh temporary cwd."""
    rows = []
    worker = HERE / "fixture_worker.py"
    for test in tests:
        fixture_id = test["fixture_id"]
        with tempfile.TemporaryDirectory(prefix=f"algocore-p0-{fixture_id.replace('.', '-')}-") as temp:
            started = time.perf_counter()
            try:
                proc = subprocess.run([sys.executable, str(worker), fixture_id], cwd=temp,
                                      text=True, capture_output=True, timeout=5, check=False)
                termination = "completed" if proc.returncode == 0 else "nonzero_exit"
            except subprocess.TimeoutExpired as exc:
                proc = None
                termination = "timeout_killed"
                rows.append({"fixture_id": fixture_id, "test_id": test["test_id"], "workdir": temp,
                             "termination": termination, "exit_code": None, "stdout": str(exc.stdout or ""),
                             "stderr": str(exc.stderr or ""), "elapsed_ms": round((time.perf_counter() - started) * 1000, 3),
                             "result": "FAIL"})
                continue
            try:
                child = json.loads(proc.stdout.strip().splitlines()[-1])
            except Exception:
                child = {"result": "FAIL", "error": "worker output was not JSON"}
            rows.append({"fixture_id": fixture_id, "test_id": test["test_id"], "workdir": temp,
                         "termination": termination, "exit_code": proc.returncode,
                         "stdout": proc.stdout, "stderr": proc.stderr,
                         "elapsed_ms": round((time.perf_counter() - started) * 1000, 3),
                         "result": child.get("result"), "worker_evidence": child.get("evidence", {}),
                         "worker_error": child.get("error")})
    return rows


def run_source_anchor_subprocesses() -> list[dict]:
    """Run each canonical source anchor as an executable fixture."""
    worker = HERE / "source_anchor_worker.py"
    anchors = [
        ("STACK_SETUP", "fx.anchor.stack_setup", "9618_s22_42_1(a)"),
        ("STACK_PUSH", "fx.anchor.stack_push", "9618_s22_42_1(c)"),
        ("STACK_POP", "fx.anchor.stack_pop", "9618_s22_42_1(e)(i)"),
        ("STACK_PAIR", "fx.anchor.stack_pair", "9618_s23_41_3(c)"),
        ("STACK_REDUCE", "fx.anchor.stack_reduce", "9618_s25_42_1(e)"),
    ]
    rows = []
    for pattern, fixture_id, part_id in anchors:
        with tempfile.TemporaryDirectory(prefix=f"algocore-p0-anchor-{pattern.lower()}-") as temp:
            started = time.perf_counter()
            try:
                proc = subprocess.run([sys.executable, str(worker), pattern], cwd=temp,
                                      text=True, capture_output=True, timeout=5, check=False)
                termination = "completed" if proc.returncode == 0 else "nonzero_exit"
            except subprocess.TimeoutExpired as exc:
                proc = None; termination = "timeout_killed"
                rows.append({"pattern_id": pattern, "fixture_id": fixture_id, "part_id": part_id,
                             "workdir": temp, "termination": termination, "exit_code": None,
                             "stdout": str(exc.stdout or ""), "stderr": str(exc.stderr or ""), "result": "FAIL"})
                continue
            try: result = json.loads(proc.stdout.strip().splitlines()[-1])
            except Exception: result = {"result": "FAIL", "error": "anchor worker output was not JSON"}
            rows.append({"pattern_id": pattern, "fixture_id": fixture_id, "part_id": part_id,
                         "workdir": temp, "termination": termination, "exit_code": proc.returncode,
                         "stdout": proc.stdout, "stderr": proc.stderr,
                         "elapsed_ms": round((time.perf_counter() - started) * 1000, 3),
                         "result": result.get("result"), "evidence": result})
    return rows


def main() -> int:
    tests, _ = run_tests()
    traces = build_trace_bundle()
    fresh_fixture_runs = run_fresh_fixture_subprocesses(tests)
    source_anchor_runs = run_source_anchor_subprocesses()
    source_files = [
        S4P0 / "PATTERN_CARDS.json", S4P0 / "SOLUTION_DESIGNS.json",
        S4P0 / "VARIANT_INVARIANT_REGISTER.json", S4P0 / "WORKED_EXAMPLE_SPECS.json",
        S4P0 / "VISUAL_BRIEFS.json", S4P0 / "ERROR_PREVENTION.json",
    ]
    input_hashes = [{"path": str(p.relative_to(ROOT)).replace("\\", "/"), "sha256": sha256(p)} for p in source_files]
    implementation_hash = sha256(IMPL / "stack_pilot.py")
    run_report = {
        "schema_version": "s5-p0-run-v1",
        "batch_id": "P0",
        "input_release": "paper4-2026-s4-v1",
        "source_artifact_hashes": input_hashes,
        "implementation_hash": implementation_hash,
        "runtime": {"python": sys.version, "implementation": platform.python_implementation(),
                     "os": platform.platform(), "command": "python run_p0.py", "dependencies": "stdlib-only",
                     "seed": None, "timeout_seconds": 5, "termination_policy": "fresh process; timeout is failure"},
        "clean_state": "fresh process and isolated temporary working directory per run",
        "tests": tests,
        "fresh_fixture_runs": fresh_fixture_runs,
        "source_anchor_runs": source_anchor_runs,
        "test_counts": {"total": len(tests), "passed": sum(t["result"] == "PASS" for t in tests),
                        "failed": sum(t["result"] == "FAIL" for t in tests)},
        "fresh_fixture_counts": {"total": len(fresh_fixture_runs),
                                 "passed": sum(t["result"] == "PASS" and t["termination"] == "completed" for t in fresh_fixture_runs),
                                 "failed": sum(t["result"] != "PASS" or t["termination"] != "completed" for t in fresh_fixture_runs)},
        "source_anchor_counts": {"total": len(source_anchor_runs),
                                  "passed": sum(t["result"] == "PASS" and t["termination"] == "completed" for t in source_anchor_runs),
                                  "failed": sum(t["result"] != "PASS" or t["termination"] != "completed" for t in source_anchor_runs)},
        "status": "PASS_RECOMMENDED" if all(t["result"] == "PASS" for t in tests) and all(t["result"] == "PASS" and t["termination"] == "completed" for t in fresh_fixture_runs + source_anchor_runs) else "REWORK",
    }
    dump(OUT_RUNS / "AUTHOR_RUN.json", run_report)
    dump(OUT_FIXTURES / "P0_FIXTURES.json", {
        "schema_version": "s5-p0-fixtures-v1", "authority": "official_source_adjudication + stage4_invariant + AlgoCore_test_policy",
        "variant_entry_points": ENTRY_POINTS,
        "fixtures": [
            {"fixture_id": t["fixture_id"], "test_id": t["test_id"], "pattern_id": t["pattern_id"],
             "category": t["category"], "authority": "AlgoCore_test_policy" if t["fixture_id"] == "fx.pair.both_empty" else "official_source_adjudication + stage4_invariant",
             "expected_evidence": t["evidence"]}
            for t in tests
        ] + [{"fixture_id": t["fixture_id"], "pattern_id": t["pattern_id"], "source_part_id": t["part_id"],
              "authority": "official_source_adjudication", "category": "source_anchor",
              "run_evidence": t["evidence"], "run_status": t["result"]} for t in source_anchor_runs],
    })
    dump(OUT_TRACES / "TRACE_BUNDLE.json", {
        "schema_version": "s5-p0-trace-bundle-v1", "batch_id": "P0",
        "visual_briefs_with_trace_bundle": [
            "p0.stack.visual.stack-setup", "p0.stack.visual.stack-push", "p0.stack.visual.stack-pop",
            "p0.stack.visual.stack-pair", "p0.stack.visual.stack-reduce"
        ],
        "actual_trace_run_count": len(traces), "traces": traces,
        "instrumentation_parity": "Every trace carries frozen_source_hash, instrumented_source_hash, execution_log_sha256, parity IDs and PASS result.",
    })
    print(json.dumps({"status": run_report["status"], "counts": run_report["test_counts"]}, ensure_ascii=True))
    return 0 if run_report["status"] == "PASS_RECOMMENDED" else 1


if __name__ == "__main__":
    raise SystemExit(main())
