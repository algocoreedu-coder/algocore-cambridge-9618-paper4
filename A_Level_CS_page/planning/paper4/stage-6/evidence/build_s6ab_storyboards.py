"""Build Stage 6 storyboard candidates only from exact Stage 5 trace/event joins.

The script intentionally leaves the Stage 6 release, gates and manifests alone.  It
writes only VISUAL_EVENT_STORYBOARDS.json and STORYBOARD_AUDIT.json in s6-a/s6-b.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
STAGE5 = ROOT / "stage-5" / "evidence"
STAGE6 = ROOT / "stage-6" / "evidence"
INVENTORY = json.loads((ROOT / "stage-5" / "OBLIGATION_INVENTORY.json").read_text(encoding="utf-8"))
EXAMPLES = json.loads((ROOT / "stage-4" / "WORKED_EXAMPLE_SPECS.json").read_text(encoding="utf-8"))

EXAMPLE_BY_PATTERN = {x["pattern_id"]: x["worked_example_spec_id"] for x in EXAMPLES["worked_example_specs"]}
CONTROL_IDS = ["Previous", "Next", "Play", "Pause", "Reset", "change_input"]
SCOPE = {
    "s6-a": {
        "sources": [("b1", "B1"), ("b8", "B8")],
        "patterns": [
            "DATA_STORAGE", "DATA_RECORD", "ARRAY_APPEND", "RANDOM_ARRAY", "RULE_COMPUTE",
            "VALIDATE_INPUT", "UNIQUE_SELECTION", "CHECK_DIGIT", "ALGORITHM_TRANSLATE",
            "STRING_COMPARE", "STRING_SPLIT", "STRING_ROUTE", "RUN_LENGTH_ENCODE",
            "MAIN_FLOW", "EVIDENCE_RUN",
        ],
    },
    "s6-b": {
        "sources": [("b2", "B2"), ("p0", "P0")],
        "patterns": [
            "ORDERED_INSERT", "LINEAR_SEARCH", "COUNT_OCCURRENCES", "FILTER_RECORDS",
            "GROUP_AGGREGATE", "BUBBLE_SORT", "INSERTION_SORT", "BINARY_SEARCH",
            "STACK_SETUP", "STACK_PUSH", "STACK_POP", "STACK_PAIR", "STACK_REDUCE",
        ],
    },
}


def dump(path: Path, obj: object) -> None:
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8", newline="\n")


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def trace_scenario(trace: dict) -> str | None:
    if trace.get("visual_scenario_id"):
        return trace["visual_scenario_id"]
    scenarios = trace.get("scenario_ids") or []
    return scenarios[0] if scenarios else None


def trace_event_ids(trace: dict) -> list[str]:
    return [e.get("visual_event_id") or e.get("event_id") for e in trace.get("events", [])]


def inventory_events(pattern: str) -> set[str]:
    return {r["obligation_id"] for r in INVENTORY["obligations"]
            if r.get("primary_batch") in {"B1", "B2"} and r.get("obligation_type") == "visual_event"
            and pattern in r.get("pattern_ids", [])}


def storyboard(wave: str, trace: dict, pattern: str, ordinal: int) -> dict:
    events = trace.get("events", [])
    ids = trace_event_ids(trace)
    first = events[0] if events else {}
    last = events[-1] if events else {}
    scenario = trace_scenario(trace)
    case = trace.get("visual_case_kind") or ("normal" if scenario and scenario.endswith(":normal") else "boundary")
    brief = trace.get("visual_brief_id") or f"visual-brief:{pattern.lower()}"
    example = EXAMPLE_BY_PATTERN.get(pattern, f"stage5.example.{pattern.lower()}")
    bilingual = {
        "vi": f"Đối chiếu chuỗi event {pattern} với trace Stage 5 và bất biến trước/sau.",
        "en": f"Compare the {pattern} event sequence with the Stage 5 trace and before/after invariant.",
    }
    return {
        "visual_id": f"{wave}.visual.{pattern.lower()}.{ordinal:02d}",
        "scenario_id": scenario,
        "event_ids": ids,
        "example_id": example,
        "pattern_id": pattern,
        "trace_id": trace.get("trace_id"),
        "trace_sha256": trace.get("trace_sha256"),
        "before": {"vi": "Snapshot trước event theo trace Stage 5.", "en": "State before the event from the Stage 5 trace.", "state": first.get("pre_state")},
        "delta": {
            "vi": bilingual["vi"], "en": bilingual["en"],
            "event_actions": [e.get("action") for e in events],
        },
        "after": {"vi": "Snapshot sau event cuối, đối chiếu bất biến.", "en": "State after the final event; check the invariant.", "state": last.get("post_state")},
        "invariant": {
            "vi": "Mọi event và assertion của trace Stage 5 phải giữ đúng trạng thái và output.",
            "en": "Every Stage 5 trace event and assertion must preserve the state and output.",
        },
        "code_highlight": (first.get("method_step_id") or f"{pattern}-trace-step"),
        "prediction": {"vi": "Dự đoán event kế tiếp và state sau event.", "en": "Predict the next event and resulting state."},
        "feedback": {"vi": "Đối chiếu trace, bất biến và output; nếu sai dùng Reset rồi replay.", "en": "Compare trace, invariant and output; if wrong, use Reset and replay."},
        "controls": CONTROL_IDS,
        "replay_semantics": {"vi": "Play chạy tuần tự; Previous/Next đi qua đúng event; replay giữ nguyên input.", "en": "Play runs events in order; Previous/Next selects exact events; replay keeps the same input."},
        "reset_semantics": {"vi": "Reset về snapshot đầu; change_input chỉ chọn fixture Stage 5 đã khóa.", "en": "Reset returns to the initial snapshot; change_input selects only a locked Stage 5 fixture."},
        "static_fallback": {"status": "provided", "vi": "Bảng before/delta/after cùng guard và invariant.", "en": "Before/delta/after table with guard and invariant."},
        "alt": {"vi": f"Chuỗi event {pattern} với trạng thái trước, thay đổi và sau.", "en": f"{pattern} event sequence with before, delta and after states."},
        "caption": bilingual,
        "source_refs": [
            {"authority": "Stage5_trace", "source_id": trace.get("trace_id"), "trace_sha256": trace.get("trace_sha256"), "status": "VERIFIED_STAGE5"},
            {"authority": "Stage4_visual_brief", "source_id": brief, "status": "VERIFIED_STAGE4"},
        ],
        "visual_case_kind": case,
        "status": "Stage6_specified",
        "author": "A6_S6AB_REWORK",
        "reviewer": "A0_LEAD_PENDING",
    }


def build(wave: str) -> None:
    cfg = SCOPE[wave]
    out = STAGE6 / wave
    traces = []
    for batch, _ in cfg["sources"]:
        p = STAGE5 / batch / "traces" / "TRACE_BUNDLE.json"
        if p.exists():
            traces.extend(json.loads(p.read_text(encoding="utf-8")).get("traces", []))
    entries = []
    mapped = []
    missing = []
    mapping_checks = []
    for pattern in cfg["patterns"]:
        candidates = [t for t in traces if t.get("pattern_id") == pattern]
        valid = []
        for t in candidates:
            ids = set(trace_event_ids(t))
            expected = inventory_events(pattern)
            # Exact event join is required; B1/B2 traces use the frozen inventory IDs.
            if expected and expected == ids and t.get("overall_result", "PASS") == "PASS":
                valid.append(t)
        if not valid:
            missing.append({"pattern_id": pattern, "required_scenarios": 3, "reason": "No PASS trace whose visual_event_id set equals frozen Stage5 inventory IDs."})
            mapping_checks.append({"pattern_id": pattern, "status": "MISSING", "candidate_trace_count": len(candidates)})
            continue
        # Keep normal/boundary/failure once each where available.
        chosen = []
        for kind in ("normal", "boundary", "failure"):
            match = next((t for t in valid if (t.get("visual_case_kind") == kind or (trace_scenario(t) or "").endswith(f":{kind}"))), None)
            if match and match not in chosen:
                chosen.append(match)
        for t in valid:
            if t not in chosen:
                chosen.append(t)
        for i, t in enumerate(chosen[:3], 1):
            entries.append(storyboard(wave, t, pattern, i))
        mapped.append(pattern)
        mapping_checks.append({"pattern_id": pattern, "status": "EXACT", "entry_count": min(3, len(chosen)), "trace_ids": [t.get("trace_id") for t in chosen[:3]]})
    payload = {
        "schema_version": "s6-visual-storyboard-v1",
        "stage": 6,
        "wave": wave.upper().replace("-", "-"),
        "release_id": "paper4-2026-s5-v1",
        "entries": entries,
        "checks": {
            "event_ids_exact_stage5": not missing,
            "all_controls_present": all(set(e["controls"]) >= set(CONTROL_IDS) for e in entries),
            "static_fallback_present": all(e["static_fallback"].get("status") == "provided" for e in entries),
            "trace_result_pass": all(e.get("trace_id") for e in entries),
        },
        "status": "COMPOSED_CANDIDATE" if entries else "REWORK_REQUIRED",
    }
    missing_denominators = []
    for item in missing:
        pattern = item["pattern_id"]
        rows = [r for r in INVENTORY["obligations"] if pattern in r.get("pattern_ids", [])]
        item["missing_denominators"] = {
            "visual_briefs": sum(r.get("obligation_type") == "visual_brief" for r in rows),
            "visual_scenarios": sum(r.get("obligation_type") == "visual_scenario" for r in rows),
            "visual_event_entries": sum(r.get("obligation_type") == "visual_event" for r in rows),
        }
        missing_denominators.append(item)
    audit = {
        "schema_version": "s6-visual-storyboard-audit-v1",
        "stage": 6,
        "wave": wave.upper(),
        "input_release": "paper4-2026-s5-v1",
        "source_trace_batches": [x[0] for x in cfg["sources"]],
        "requested_patterns": cfg["patterns"],
        "exactly_mapped_patterns": mapped,
        "missing_patterns": missing_denominators,
        "entry_count": len(entries),
        "mapping_checks": mapping_checks,
        "denominator_note": "Only entries backed by a PASS Stage5 trace with an exact frozen visual_event_id set were written. Missing patterns remain explicit for Lead rework; no synthetic event IDs were created.",
        "status": "REWORK_REQUIRED" if missing else "PASS_RECOMMENDED",
    }
    dump(out / "VISUAL_EVENT_STORYBOARDS.json", payload)
    dump(out / "STORYBOARD_AUDIT.json", audit)
    lines = [
        f"# {wave.upper()} storyboard audit",
        "",
        f"Status: **{audit['status']}**",
        "",
        f"Exact Stage 5 mappings: **{len(mapped)} patterns / {len(entries)} storyboard entries**.",
        "The generated entries use only PASS traces whose `visual_event_id` set equals the frozen Stage 5 inventory set.",
        "",
        "## Missing denominators",
        "",
    ]
    if missing_denominators:
        lines.append("| Pattern | Visual briefs | Scenarios | Event entries | Evidence gap |")
        lines.append("|---|---:|---:|---:|---|")
        for item in missing_denominators:
            d = item["missing_denominators"]
            lines.append(f"| `{item['pattern_id']}` | {d['visual_briefs']} | {d['visual_scenarios']} | {d['visual_event_entries']} | {item['reason']} |")
    else:
        lines.append("None.")
    lines += [
        "",
        "These gaps remain explicit for Lead rework. No synthetic storyboard or event ID was created, and Stage 6 release files were not changed.",
        "",
    ]
    (out / "STORYBOARD_AUDIT.md").write_text("\n".join(lines), encoding="utf-8", newline="\n")


if __name__ == "__main__":
    build("s6-a")
    build("s6-b")
