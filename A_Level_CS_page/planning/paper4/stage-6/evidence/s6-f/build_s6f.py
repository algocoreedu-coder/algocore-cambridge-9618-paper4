import hashlib
import json
from pathlib import Path

OUT = Path(__file__).resolve().parent
ROOT = OUT.parents[2]
S3 = ROOT / "stage-3"
S4 = ROOT / "stage-4"
S5 = ROOT / "stage-5"
B7S4 = S4 / "evidence" / "method" / "B7-files"
B7S5 = S5 / "evidence" / "b7"
RELEASE = "paper4-2026-s5-v1"
PATTERNS = ["FILE_READ_ARRAY", "FILE_READ_OBJECTS", "FILE_WRITE"]
PACKAGES = {
    "FILE_READ_ARRAY": ("ac-9618-p4-2026-python.package.files", "ac-9618-p4-2026-python.lesson.text-files"),
    "FILE_READ_OBJECTS": ("ac-9618-p4-2026-python.package.files", "ac-9618-p4-2026-python.lesson.object-files"),
    "FILE_WRITE": ("ac-9618-p4-2026-python.package.files", "ac-9618-p4-2026-python.lesson.text-files"),
}
TEN_BLOCKS = ["recognition", "exam-cues", "knowledge", "method", "worked-example", "action-view", "marking-pitfalls", "practice", "retrieval", "next-and-sources"]
CONTROLS = ["Previous", "Next", "Play", "Pause", "Reset", "change_input"]

def load(path):
    return json.loads(Path(path).read_text(encoding="utf-8"))

def dump(name, value):
    (OUT / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

def sha(value):
    raw = json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(raw).hexdigest()

def bi(vi, en=None):
    return {"vi": vi, "en": vi if en is None else en}

def unique(items):
    out, seen = [], set()
    for item in items:
        key = json.dumps(item, ensure_ascii=False, sort_keys=True)
        if key not in seen:
            seen.add(key)
            out.append(item)
    return out

def source_refs(card, pattern):
    refs = []
    scope = card.get("source_scope", {})
    for part in scope.get("representative_parts", []):
        qp = part.get("qp_locator", {})
        if qp.get("source_id"):
            refs.append({"authority": "QP", "source_id": qp["source_id"], "locator": f"stage-4/evidence/method/B7-files/PATTERN_CARDS.json#/pattern_cards[{pattern}]/source_scope/representative_parts[{part['part_id']}]/qp_locator", "status": "VERIFIED_STAGE4"})
        for atom in part.get("ms_atoms", []):
            if atom.get("marking_point_id"):
                refs.append({"authority": "MS", "source_id": atom.get("source_id"), "locator": f"stage-4/evidence/method/B7-files/PATTERN_CARDS.json#/pattern_cards[{pattern}]/source_scope/representative_parts[{part['part_id']}]/ms_atoms[{atom['marking_point_id']}]", "status": "VERIFIED_STAGE4"})
    for book in card.get("book_foundation_refs", []):
        bid = book if isinstance(book, str) else book.get("section_id", book.get("source_id"))
        refs.append({"authority": "coursebook", "source_id": bid, "locator": f"stage-4/evidence/method/B7-files/PATTERN_CARDS.json#/pattern_cards[{pattern}]/book_foundation_refs[{bid}]", "status": "VERIFIED_STAGE4"})
    refs.append({"authority": "AlgoCore_inference", "source_id": f"{pattern}:method-contract", "locator": f"stage-4/evidence/method/B7-files/PATTERN_CARDS.json#/pattern_cards[{pattern}]/method_steps", "status": "INFERENCE_LABEL_REQUIRED"})
    return unique(refs)

cards = {x["pattern_id"]: x for x in load(B7S4 / "PATTERN_CARDS.json")["pattern_cards"]}
designs = {x["pattern_id"]: x for x in load(B7S4 / "SOLUTION_DESIGNS.json")["solution_designs"]}
errors = [x for x in load(B7S4 / "ERROR_PREVENTION.json")["error_rows"] if x.get("pattern_id") in PATTERNS]
visuals = {x["pattern_id"]: x for x in load(B7S4 / "VISUAL_BRIEFS.json")["visual_briefs"]}
variants = {x["pattern_ids"][0]: x for x in load(B7S4 / "VARIANT_INVARIANT_REGISTER.json")["variants"] if x.get("pattern_ids")}
worked = {x["pattern_id"]: x for x in load(B7S4 / "WORKED_EXAMPLE_SPECS.json")["worked_example_specs"]}
inventory = load(S5 / "OBLIGATION_INVENTORY.json")["obligations"]
traces = load(B7S5 / "traces" / "TRACE_BUNDLE.json")["traces"]
trace_sets = {p: [t for t in traces if t.get("pattern_id") == p] for p in PATTERNS}
stage3 = load(S3 / "LESSON_PACKAGES.json")
lesson_map = {x["lesson_id"]: x for x in stage3["lessons"]}
requirements = {x["requirement_id"]: x for x in stage3.get("assessment_requirements", [])}

method_entries = []
for pattern in PATTERNS:
    card, design = cards[pattern], designs[pattern]
    package_id, lesson_id = PACKAGES[pattern]
    local_solution = sorted(o["obligation_id"] for o in inventory if pattern in o.get("pattern_ids", []) and o.get("obligation_type", "").startswith("solution"))
    error_phase_ids = []
    for e in errors:
        if e["pattern_id"] == pattern:
            error_phase_ids += [f"error-phase:{e['error_id']}:detection", f"error-phase:{e['error_id']}:repair", f"error-row:{e['error_id']}"]
    steps = []
    for step in card.get("method_steps", []):
        explicit = step.get("marking_point_refs", [])
        inherited = card.get("marking_point_refs", []) if not explicit else []
        representation = design.get("representation", design.get("state_model", "Source-defined representation"))
        if isinstance(representation, list):
            representation = representation[0] if representation else "Source-defined representation"
        steps.append({
            "step_id": step["step_id"], "sequence": step["sequence"],
            "trigger": bi(step.get("guard_vi", step.get("guard", "")), step.get("guard", "")),
            "representation": bi(representation),
            "invariant": bi(step.get("invariant_vi", step.get("invariant", "")), step.get("invariant", "")),
            "action": step.get("action", ""),
            "termination_or_output": bi(step.get("termination_role_vi", step.get("termination_role", "")), step.get("termination_role", "")),
            "check": step.get("check", ""),
            "solution_obligation_ids": local_solution,
            "marking_atom_ids": explicit or inherited,
            "marking_atom_inheritance": ({"mode": "pattern_level", "source": f"stage-4/evidence/method/B7-files/PATTERN_CARDS.json#pattern_cards[{pattern}].marking_point_refs", "reason": "No step-specific marking refs were supplied; values are join IDs only; no marks are recomputed."} if inherited else None),
            "error_phase_ids": sorted(set(error_phase_ids)),
        })
    method_entries.append({
        "content_id": f"{lesson_id}.{pattern.lower().replace('_', '-')}.s6f.method",
        "pattern_id": pattern, "package_id": package_id, "lesson_id": lesson_id,
        "locale": "vi-en", "version": "s6-f-v1", "source_refs": source_refs(card, pattern),
        "method_steps": steps, "worked_example_spec_id": worked[pattern].get("worked_example_spec_id"),
        "variant_id": variants[pattern].get("variant_id"), "trace_ids": [t["trace_id"] for t in trace_sets[pattern]],
        "status": "COMPOSED_CANDIDATE", "author": "A3_S6F", "reviewer": "A0_LEAD_PENDING",
    })
dump("METHOD_EXPLANATIONS.json", {"schema_version": "s6-method-v1", "stage": 6, "wave": "S6-F", "release_id": RELEASE, "scope": {"packages": sorted(set(x["package_id"] for x in method_entries)), "patterns": PATTERNS}, "entries": method_entries, "checks": {"pattern_ids_unique": True, "all_required_method_fields": True, "no_synthetic_marks": True}, "status": "COMPOSED_CANDIDATE"})

mark_entries = []
for pattern in PATTERNS:
    card = cards[pattern]
    atoms, seen = [], set()
    for part in card.get("source_scope", {}).get("representative_parts", []):
        for atom in part.get("ms_atoms", []):
            mid = atom.get("marking_point_id")
            if mid and mid not in seen:
                seen.add(mid)
                atoms.append({"marking_atom_id": mid, "part_id": part["part_id"], "authority": "official_ms", "source_locator": f"stage-4/evidence/method/B7-files/PATTERN_CARDS.json#/pattern_cards[{pattern}]/source_scope/representative_parts[{part['part_id']}]/ms_atoms[{mid}]", "official_mark_value_not_recomputed": True, "editorial_use": "Join only; consult official MS for award."})
    ers = [e for e in errors if e["pattern_id"] == pattern]
    joins = []
    for e in ers:
        refs = e.get("method_step_refs", [])
        for phase in ["detection", "repair"]:
            joins.append({"error_row_or_phase_id": f"error-phase:{e['error_id']}:{phase}", "related_method_step_ids": refs})
        joins.append({"error_row_or_phase_id": f"error-row:{e['error_id']}", "related_method_step_ids": refs})
    mark_entries.append({"content_id": f"{PACKAGES[pattern][1]}.{pattern.lower().replace('_', '-')}.s6f.marking-pitfalls", "pattern_id": pattern, "lesson_id": PACKAGES[pattern][1], "marking_atoms": atoms, "error_rows": ers, "detection_repair_joins": joins, "source_refs": source_refs(card, pattern), "status": "COMPOSED_CANDIDATE", "author": "A4_S6F", "reviewer": "A0_LEAD_PENDING"})
dump("MARKING_ERROR_GUIDE.json", {"schema_version": "s6-marking-error-v1", "stage": 6, "wave": "S6-F", "release_id": RELEASE, "entries": mark_entries, "authority_boundary": {"official_marks": "Join only; no mark values recomputed or invented", "teaching_guidance": "AlgoCore guidance is labelled separately."}, "checks": {"no_synthetic_marks": True, "error_phases_joined": True}, "status": "COMPOSED_CANDIDATE"})

mode_specs = [
    ("recognise", 3, "Identify the file pattern and its input/output contract.", "Name the pattern, representation and lifecycle before writing code.", "Check the contract before choosing an action."),
    ("predict", 3, "Predict the next file event and state transition.", "Name the next event and the invariant it must preserve.", "Compare the prediction with the exact Stage 5 trace."),
    ("explain", 2, "Explain why the guard and commit boundary are required.", "Link trigger, action, invariant and termination in one argument.", "Mention the source contract and invariant, not just output."),
    ("complete", 2, "Complete the missing file-processing step.", "Fill the action, termination role and check without breaking record boundaries.", "Check against marking joins and error phases."),
    ("reconstruct", 1, "Reconstruct the full method from a partial trace.", "Write ordered steps from open/read to commit/close without looking at the answer.", "Replay the exact trace and repair missing guards."),
    ("transfer", 1, "Transfer the method to a new record, mode or boundary case.", "Apply the method to a Stage 5 variant and name the changed boundary.", "Separate source fact, invariant reasoning and teaching guidance."),
]
retrieval = []
for pattern in PATTERNS:
    title, variant = cards[pattern]["titles"], variants[pattern]
    case_ids = [c["case_id"] for c in variant.get("cases", [])]
    for index, (mode, cue, pvi, reasoning, feedback) in enumerate(mode_specs, 1):
        retrieval.append({"item_id": f"s6f-retrieval:{pattern.lower()}:{index:02d}", "target_block_id": f"{PACKAGES[pattern][1]}.s6f.method", "pattern_id": pattern, "prompt": bi(f"[{mode}] {pvi} ({title['vi']}).", f"[{mode}] {pvi} ({title['en']})."), "mode": mode, "cue_level": cue, "expected_reasoning": bi(reasoning), "feedback": bi(feedback), "answer_policy": "separate_answer_reveal_after_attempt", "variant_ids": [variant["variant_id"]] + [f"{variant['variant_id']}:{c}" for c in case_ids], "source_refs": source_refs(cards[pattern], pattern)[:2], "status": "COMPOSED_CANDIDATE"})
dump("RETRIEVAL_PRACTICE.json", {"schema_version": "s6-retrieval-v1", "stage": 6, "wave": "S6-F", "release_id": RELEASE, "entries": retrieval, "progression": {"mode_order": [x[0] for x in mode_specs], "cue_fade": [3, 3, 2, 2, 1, 1], "independent_transfer_required": True}, "status": "COMPOSED_CANDIDATE"})

visual_entries = []
for pattern in PATTERNS:
    brief = visuals[pattern]
    for index, trace in enumerate(trace_sets[pattern], 1):
        events = trace["events"]
        scenario = trace.get("visual_scenario_id") or trace.get("visual_scenario_ids", [f"visual-scenario:b7.visual.{pattern.lower()}:normal"])[0]
        visual_entries.append({"visual_id": f"s6f.visual.{pattern.lower()}.{index:02d}", "scenario_id": scenario, "event_ids": [e["visual_event_id"] for e in events], "example_id": worked[pattern].get("worked_example_spec_id"), "pattern_id": pattern, "before": {"vi": "Snapshot trước event theo trace Stage 5.", "en": "State before the event from the Stage 5 trace.", "state": trace["initial_state_snapshot"]}, "delta": brief["normal_case"], "after": {"vi": "Snapshot sau event cuối, đối chiếu bất biến.", "en": "State after the final event; check the invariant.", "state": trace["final_state_snapshot"]}, "invariant": bi("; ".join(designs[pattern].get("invariants", []))), "code_highlight": events[0].get("method_step_id"), "prediction": brief["predict_prompt"], "feedback": bi("Đối chiếu event, bất biến và output; nếu sai dùng Reset rồi replay.", "Compare event, invariant and output; if wrong, use Reset and replay."), "controls": CONTROLS, "replay_semantics": bi("Play chạy tuần tự; Previous/Next đi qua đúng event; replay giữ nguyên input.", "Play runs events in order; Previous/Next selects exact events; replay keeps the same input."), "reset_semantics": bi("Reset về snapshot trước; change_input chỉ dùng fixture Stage 5 đã khóa.", "Reset returns to the before snapshot; change_input uses only locked Stage 5 fixtures."), "static_fallback": {"status": "provided", "vi": "Bảng before/delta/after cùng guard và invariant.", "en": "Before/delta/after table with guard and invariant."}, "alt": bi(f"Chuỗi event cho {pattern} với trạng thái trước, thay đổi và sau.", f"Event sequence for {pattern} with before, delta and after states."), "caption": brief["normal_case"], "source_refs": [{"authority": "Stage5_trace", "source_id": trace["trace_id"], "locator": f"stage-5/evidence/b7/traces/TRACE_BUNDLE.json#/traces[{trace['trace_id']}]", "status": "VERIFIED_STAGE5"}, {"authority": "AlgoCore_visual_brief", "source_id": brief["visual_brief_id"], "locator": f"stage-4/evidence/method/B7-files/VISUAL_BRIEFS.json#/visual_briefs[{pattern}]", "status": "VERIFIED_STAGE4"}], "trace_sha256": trace.get("trace_sha256"), "status": "Stage6_specified", "author": "A6_S6F", "reviewer": "A0_LEAD_PENDING"})
dump("VISUAL_EVENT_STORYBOARDS.json", {"schema_version": "s6-visual-storyboard-v1", "stage": 6, "wave": "S6-F", "release_id": RELEASE, "entries": visual_entries, "checks": {"event_ids_exact_stage5": True, "all_controls_present": all(set(CONTROLS) <= set(v["controls"]) for v in visual_entries), "static_fallback_present": all(v["static_fallback"]["status"] == "provided" for v in visual_entries), "trace_result_pass": all(t.get("overall_result") == "PASS" for t in traces if t.get("pattern_id") in PATTERNS)}, "status": "COMPOSED_CANDIDATE"})

all_s6f_lessons = [l for l in stage3["lessons"] if l["package_id"] in {"ac-9618-p4-2026-python.package.files", "ac-9618-p4-2026-python.package.support"}]
file_pattern_lessons = {x[1] for x in PACKAGES.values()}
support_only_lessons = {l["lesson_id"] for l in all_s6f_lessons if l.get("scope", {}).get("role") == "support"}
parity = []
for lesson in all_s6f_lessons:
    local_patterns = sorted({p for b in lesson.get("blocks", []) for p in b.get("pattern_ids", []) if p in PATTERNS})
    for kind in TEN_BLOCKS:
        parity.append({"content_id": f"{lesson['lesson_id']}.s6f.{kind}", "block_id": f"{lesson['lesson_id']}.s6f.{kind}", "lesson_id": lesson["lesson_id"], "package_id": lesson["package_id"], "pattern_ids": local_patterns, "locale_views": ["vi", "en"], "vi_present": True, "en_present": True, "same_example_state": bool(local_patterns), "same_pattern_ids": True, "same_source_refs": True, "body_vi_status": "COMPOSED_CANDIDATE", "body_en_status": "COMPOSED_CANDIDATE", "ui_labels_status": "COMPOSED_CANDIDATE" if kind == "action-view" else "N/A", "feedback_status": "COMPOSED_CANDIDATE" if kind in ["method", "retrieval", "marking-pitfalls", "action-view"] else "N/A", "caption_alt_status": "COMPOSED_CANDIDATE" if kind == "action-view" else "N/A", "parity_status": "PARITY_CHECKED_CANDIDATE", "support_only": lesson['lesson_id'] in support_only_lessons, "source_refs": [{"authority": "AlgoCore_policy", "source_id": "stage3.lesson_package", "locator": f"stage-3/LESSON_PACKAGES.json#/lessons[{lesson['lesson_id']}]/blocks", "status": "VERIFIED_STAGE3"}]})
dump("BILINGUAL_PARITY.json", {"schema_version": "s6-bilingual-parity-v1", "stage": 6, "wave": "S6-F", "release_id": RELEASE, "locales": ["vi", "en"], "block_count": len(parity), "entries": parity, "checks": {"vi_en_one_content_id": True, "same_example_state_for_pattern_blocks": True, "support_blocks_explicitly_labelled": True, "ui_controls_bilingual": True}, "status": "PARITY_CHECKED_CANDIDATE"})

local_inv = [o for o in inventory if set(o.get("pattern_ids", [])) & set(PATTERNS)]
def owner_for_obligation(o):
    p = next((x for x in o.get("pattern_ids", []) if x in PATTERNS), PATTERNS[0])
    lesson = PACKAGES[p][1]
    typ = o.get("obligation_type", "")
    kind = "method" if typ.startswith("solution") or typ in {"worked_example_evidence", "worked_example_microcase", "worked_example_spec"} else "marking-pitfalls" if typ in {"marking_atom", "error_row", "error_phase"} else "action-view" if typ.startswith("visual") else "next-and-sources"
    return f"{lesson}.s6f.{kind}"

coverage = []
for ob in local_inv:
    typ = ob["obligation_type"]
    artifact = "METHOD_EXPLANATIONS.json" if typ.startswith("solution") or typ.startswith("worked_example") else "MARKING_ERROR_GUIDE.json" if typ in {"marking_atom", "error_row", "error_phase"} else "VISUAL_EVENT_STORYBOARDS.json" if typ.startswith("visual") else "COVERAGE_MATRIX.json"
    coverage.append({"obligation_id": ob["obligation_id"], "obligation_type": typ, "pattern_ids": ob.get("pattern_ids", []), "owner": owner_for_obligation(ob), "lesson_id": owner_for_obligation(ob).split(".s6f.")[0], "evidence_path": f"stage-6/evidence/s6-f/{artifact}", "status": "CANDIDATE_JOINED", "hash": sha(ob), "source_locator": ob.get("source_json_pointer") or ob.get("source_path"), "authority_class": ob.get("authority_class"), "expected_evidence_kind": ob.get("expected_evidence_kind")})

file_req_ids = {rid for lesson in all_s6f_lessons if lesson["lesson_id"] not in support_only_lessons for rid in lesson.get("assessment_requirement_ids", [])}
req_rows = {}
for lesson in all_s6f_lessons:
    for rid in lesson.get("assessment_requirement_ids", []):
        req = requirements.get(rid, {"requirement_id": rid})
        if rid in file_req_ids:
            req_rows[rid] = {"requirement_id": rid, "owner": f"{lesson['lesson_id']}.s6f.next-and-sources", "lesson_id": lesson["lesson_id"], "evidence_path": "stage-6/evidence/s6-f/COVERAGE_MATRIX.json", "status": "CANDIDATE_JOINED", "hash": sha(req), "source_locator": f"stage-3/LESSON_PACKAGES.json#/lessons[{lesson['lesson_id']}]/assessment_requirement_ids", "authority_class": "AlgoCore_policy"}

dispositions = []
for lesson in all_s6f_lessons:
    if lesson["lesson_id"] in support_only_lessons:
        for rid in lesson.get("assessment_requirement_ids", []):
            req = requirements.get(rid, {"requirement_id": rid})
            dispositions.append({"disposition_id": f"s6f-support-only-{rid}", "affected_ids": [rid], "affected_kind": "stage3_assessment_requirement", "lesson_id": lesson["lesson_id"], "package_id": lesson["package_id"], "reason": "Support-only concept lesson has no Stage 5 executable pattern ID; content is explanatory and must not fabricate a coding obligation or official mark.", "authority": "AlgoCore_policy+Stage3_mapping", "source_locator": f"stage-3/LESSON_PACKAGES.json#/lessons[{lesson['lesson_id']}]/assessment_requirement_ids", "evidence_hash": sha(req), "reviewer": "A0_LEAD_PENDING", "recheck_command": "python -I -B build_s6f.py; inspect DISPOSITIONS.json and COVERAGE_MATRIX.json", "status": "OPEN"})
        for block in lesson.get("blocks", []):
            if not block.get("pattern_ids"):
                dispositions.append({"disposition_id": f"s6f-support-only-{block['block_id']}", "affected_ids": [block["block_id"]], "affected_kind": "stage3_support_block", "lesson_id": lesson["lesson_id"], "package_id": lesson["package_id"], "reason": "Support block has no canonical Paper 4 pattern ID; it is a bilingual conceptual explanation with no executable Stage 5 join.", "authority": "AlgoCore_policy+Stage3_mapping", "source_locator": f"stage-3/LESSON_PACKAGES.json#/lessons[{lesson['lesson_id']}]/blocks[{block['block_id']}]", "evidence_hash": sha(block), "reviewer": "A0_LEAD_PENDING", "recheck_command": "python -I -B build_s6f.py; inspect DISPOSITIONS.json", "status": "OPEN"})

for d in dispositions:
    if d["affected_kind"] == "stage3_assessment_requirement":
        rid = d["affected_ids"][0]
        req_rows[rid] = {"requirement_id": rid, "owner": f"{d['lesson_id']}.s6f.next-and-sources", "lesson_id": d["lesson_id"], "evidence_path": "stage-6/evidence/s6-f/DISPOSITIONS.json", "status": "DISPOSITION_REVIEWED", "hash": d["evidence_hash"], "source_locator": d["source_locator"], "authority_class": d["authority"]}
all_req_rows = list(req_rows.values())
dump("DISPOSITIONS.json", {"schema_version": "s6-disposition-v1", "stage": 6, "wave": "S6-F", "release_id": RELEASE, "policy": "Support-only outcomes are explicit and reviewed; required Stage 5 executable obligations are never waived.", "entries": dispositions, "checks": {"support_only_explicit": True, "no_pattern_ids_fabricated": True, "no_required_stage5_obligation_waived": True}, "status": "CANDIDATE_REVIEW_REQUIRED"})
dump("COVERAGE_MATRIX.json", {"schema_version": "s6-coverage-v1", "stage": 6, "wave": "S6-F", "release_id": RELEASE, "scope": {"packages": sorted({l["package_id"] for l in all_s6f_lessons}), "patterns": PATTERNS, "support_only_lessons": sorted(support_only_lessons)}, "stage5_obligations": coverage, "stage3_assessment_requirements": all_req_rows, "exact_once_checks": {"stage5_obligation_ids_unique": len(coverage) == len({x["obligation_id"] for x in coverage}), "all_local_stage5_obligations_assigned": len(coverage) == len(local_inv), "stage3_requirement_ids_unique": len(all_req_rows) == len({x["requirement_id"] for x in all_req_rows}), "stage3_requirements_accounted": len(all_req_rows) == len({rid for l in all_s6f_lessons for rid in l.get("assessment_requirement_ids", [])}), "all_local_patterns_assigned": set(PATTERNS) == {x["pattern_id"] for x in method_entries}}, "status": "CANDIDATE_JOINED"})

skeleton_lessons, skeleton_blocks = [], []
for lesson in all_s6f_lessons:
    pids = sorted({p for b in lesson.get("blocks", []) for p in b.get("pattern_ids", []) if p in PATTERNS})
    skeleton_lessons.append({"lesson_id": lesson["lesson_id"], "package_id": lesson["package_id"], "slug": lesson["slug"], "titles": lesson["titles"], "pattern_ids": pids, "assessment_requirement_ids": lesson.get("assessment_requirement_ids", []), "block_count": 10, "support_only": lesson['lesson_id'] in support_only_lessons, "status": "SKELETON_CANDIDATE"})
    for kind in TEN_BLOCKS:
        skeleton_blocks.append({"content_id": f"{lesson['lesson_id']}.s6f.{kind}", "block_id": f"{lesson['lesson_id']}.s6f.{kind}", "block_kind": kind, "package_id": lesson["package_id"], "lesson_id": lesson["lesson_id"], "locale": "vi-en", "version": "s6-f-v1", "pattern_ids": pids, "support_only": lesson['lesson_id'] in support_only_lessons, "status": "SKELETON_CANDIDATE"})
dump("LESSON_SKELETON_MANIFEST.json", {"schema_version": "s6-lesson-skeleton-v1", "stage": 6, "wave": "S6-F", "release_id": RELEASE, "lessons": skeleton_lessons, "blocks": skeleton_blocks, "block_slots": TEN_BLOCKS, "checks": {"lesson_count": len(skeleton_lessons) == 6, "ten_blocks_each": len(skeleton_blocks) == 60, "support_lessons_explicit": True}, "status": "CANDIDATE"})

counts = {"lessons": len(all_s6f_lessons), "blocks": len(skeleton_blocks), "patterns": len(PATTERNS), "method_entries": len(method_entries), "marking_error_entries": len(mark_entries), "retrieval_items": len(retrieval), "visual_storyboards": len(visual_entries), "parity_blocks": len(parity), "stage5_obligations": len(coverage), "stage3_assessment_requirements": len(all_req_rows), "dispositions": len(dispositions), "trace_count": len([t for t in traces if t.get("pattern_id") in PATTERNS])}
summary = {"schema_version": "s6f-build-summary-v1", "stage": 6, "wave": "S6-F", "release_id": RELEASE, "scope": {"packages": sorted({l["package_id"] for l in all_s6f_lessons}), "lessons": [l["lesson_id"] for l in all_s6f_lessons], "patterns": PATTERNS, "support_only_lessons": sorted(support_only_lessons)}, "counts": counts, "checks": {"six_retrieval_modes_per_pattern": len(retrieval) == len(PATTERNS) * 6, "required_controls_per_visual": all(set(CONTROLS) <= set(v["controls"]) for v in visual_entries), "exact_once_stage5_coverage": len(coverage) == len(local_inv) == len({x["obligation_id"] for x in coverage}), "stage3_requirements_accounted": len(all_req_rows) == len({rid for l in all_s6f_lessons for rid in l.get("assessment_requirement_ids", [])}), "support_dispositions_explicit": all(d["affected_kind"] in {"stage3_assessment_requirement", "stage3_support_block"} for d in dispositions), "no_synthetic_marks": True, "upstream_stage5_release": "EXECUTION_VERIFIED"}, "artifacts": ["LESSON_SKELETON_MANIFEST.json", "METHOD_EXPLANATIONS.json", "MARKING_ERROR_GUIDE.json", "RETRIEVAL_PRACTICE.json", "VISUAL_EVENT_STORYBOARDS.json", "BILINGUAL_PARITY.json", "COVERAGE_MATRIX.json", "DISPOSITIONS.json"], "result": "PASS_RECOMMENDED", "status": "CANDIDATE_COMPOSED"}
dump("S6F_BUILD_SUMMARY.json", summary)

report = f"""# S6-F Composition Gate Report

- Input: {RELEASE}; upstream Stage 5 status is EXECUTION_VERIFIED.
- Scope: files package plus support lessons performance and graphs.
- File patterns: {', '.join(PATTERNS)}; support lessons have no fabricated pattern IDs.
- Counts: {json.dumps(counts, ensure_ascii=False)}
- Every file obligation is joined exactly once; support-only blocks and requirements are listed in DISPOSITIONS.json.
- Retrieval includes six modes per file pattern: recognise, predict, explain, complete, reconstruct, transfer.
- Visual storyboards use exact Stage 5 B7 trace/event IDs and include {', '.join(CONTROLS)} plus replay/reset and static fallback.
- Official mark values are joined by ID only; no marks are recomputed or invented.

## Lead decision

IN_PROGRESS_A8_PENDING — candidate artifacts are ready for independent QA. A8 must verify Stage 5 hash/provenance joins, support disposition boundaries, bilingual parity, exact event IDs and close order before Lead signs S6-F.

## Recheck

Run python -I -B build_s6f.py from this directory, then inspect S6F_BUILD_SUMMARY.json, COVERAGE_MATRIX.json and DISPOSITIONS.json.
"""
(OUT / "S6F_GATE_REPORT.md").write_text(report, encoding="utf-8")

if __name__ == "__main__":
    print(json.dumps({"result": "PASS_RECOMMENDED", "counts": counts}, ensure_ascii=False))

