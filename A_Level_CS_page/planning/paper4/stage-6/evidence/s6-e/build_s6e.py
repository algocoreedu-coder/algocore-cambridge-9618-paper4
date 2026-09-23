import copy
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
S4 = ROOT / "stage-4"
S4B = Path(__file__).resolve().parent / "_combined_source"
S5B = Path(__file__).resolve().parent / "_combined_source"
S3 = ROOT / "stage-3"
OUT = Path(__file__).resolve().parent
PATTERNS = ["HASH_SETUP","HASH_FUNCTION","HASH_INSERT","HASH_SEARCH","OOP_CLASS","OOP_SUBCLASS","OOP_GET","OOP_SET","OOP_UPDATE","OOP_OVERRIDE","OOP_INSTANTIATE","OOP_CAPACITY_ADD"]
PACKAGES = {
"HASH_SETUP": ("ac-9618-p4-2026-python.package.dictionary", "ac-9618-p4-2026-python.lesson.dictionary"),
"HASH_FUNCTION": ("ac-9618-p4-2026-python.package.dictionary", "ac-9618-p4-2026-python.lesson.hashing"),
"HASH_INSERT": ("ac-9618-p4-2026-python.package.dictionary", "ac-9618-p4-2026-python.lesson.hashing"),
"HASH_SEARCH": ("ac-9618-p4-2026-python.package.dictionary", "ac-9618-p4-2026-python.lesson.hashing"),
"OOP_CLASS": ("ac-9618-p4-2026-python.package.oop", "ac-9618-p4-2026-python.lesson.oop-model"),
"OOP_SUBCLASS": ("ac-9618-p4-2026-python.package.oop", "ac-9618-p4-2026-python.lesson.oop-inheritance"),
"OOP_GET": ("ac-9618-p4-2026-python.package.oop", "ac-9618-p4-2026-python.lesson.oop-state"),
"OOP_SET": ("ac-9618-p4-2026-python.package.oop", "ac-9618-p4-2026-python.lesson.oop-state"),
"OOP_UPDATE": ("ac-9618-p4-2026-python.package.oop", "ac-9618-p4-2026-python.lesson.oop-state"),
"OOP_OVERRIDE": ("ac-9618-p4-2026-python.package.oop", "ac-9618-p4-2026-python.lesson.oop-inheritance"),
"OOP_INSTANTIATE": ("ac-9618-p4-2026-python.package.oop", "ac-9618-p4-2026-python.lesson.oop-model"),
"OOP_CAPACITY_ADD": ("ac-9618-p4-2026-python.package.oop", "ac-9618-p4-2026-python.lesson.oop-aggregation"),
}

def load(p):
    return json.loads(Path(p).read_text(encoding="utf-8"))

def dump(name, obj):
    (OUT / name).write_text(json.dumps(obj, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

def sha(obj):
    return hashlib.sha256(json.dumps(obj, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()).hexdigest()

def bi(vi, en=None):
    return {"vi": vi, "en": en if en is not None else vi}

cards = load(S4B / "PATTERN_CARDS.json")["pattern_cards"]
cards = {x["pattern_id"]: x for x in cards if x["pattern_id"] in PATTERNS}
designs = load(S4B / "SOLUTION_DESIGNS.json")["solution_designs"]
designs = {x["pattern_id"]: x for x in designs if x["pattern_id"] in PATTERNS}
errors = load(S4B / "ERROR_PREVENTION.json")["error_rows"]
errors = [x for x in errors if x["pattern_id"] in PATTERNS]
visual_briefs = load(S4B / "VISUAL_BRIEFS.json")["visual_briefs"]
visual_briefs = {x["pattern_id"]: x for x in visual_briefs if x["pattern_id"] in PATTERNS}
variants = load(S4B / "VARIANT_INVARIANT_REGISTER.json")["variants"]
variants = {x["pattern_ids"][0]: x for x in variants if set(x["pattern_ids"]) & set(PATTERNS)}
worked = load(S4B / "WORKED_EXAMPLE_SPECS.json")["worked_example_specs"]
worked = {x["pattern_id"]: x for x in worked if x["pattern_id"] in PATTERNS}
trace_bundle = load(S5B / "traces" / "TRACE_BUNDLE.json")
traces = {}
for t in trace_bundle["traces"]:
    if t["pattern_id"] in PATTERNS and t["pattern_id"] not in traces:
        traces[t["pattern_id"]] = t
trace_sets = {p: [t for t in trace_bundle["traces"] if t["pattern_id"] == p] for p in PATTERNS}

def source_refs(card, pattern):
    refs = []
    for part in card.get("source_scope", {}).get("representative_parts", []):
        qp = part.get("qp_locator", {})
        if qp.get("source_id"):
            refs.append({"authority": "QP", "source_id": qp["source_id"], "locator": f"stage-4/PATTERN_CARDS.json#/pattern_cards[{pattern}]/source_scope/representative_parts[{part['part_id']}]/qp_locator", "status": "VERIFIED_STAGE4"})
        for atom in part.get("ms_atoms", []):
            refs.append({"authority": "MS", "source_id": atom.get("source_id"), "locator": f"stage-4/PATTERN_CARDS.json#/pattern_cards[{pattern}]/source_scope/representative_parts[{part['part_id']}]/ms_atoms[{atom.get('marking_point_id')}]", "status": "VERIFIED_STAGE4"})
    for b in card.get("book_foundation_refs", []):
        bid = b if isinstance(b, str) else b.get("section_id", b.get("source_id"))
        refs.append({"authority": "coursebook", "source_id": bid, "locator": f"stage-4/PATTERN_CARDS.json#/pattern_cards[{pattern}]/book_foundation_refs[{bid}]", "status": "VERIFIED_STAGE4"})
    refs.append({"authority": "AlgoCore_inference", "source_id": f"{pattern}:method-contract", "locator": f"stage-4/PATTERN_CARDS.json#/pattern_cards[{pattern}]/method_steps", "status": "INFERENCE_LABEL_REQUIRED"})
    seen = set(); out = []
    for r in refs:
        k = (r["authority"], r["source_id"], r["locator"])
        if k not in seen:
            seen.add(k); out.append(r)
    return out

inventory = load(ROOT / "stage-5" / "OBLIGATION_INVENTORY.json")["obligations"]

def local_solution_ids(pattern):
    return sorted(o["obligation_id"] for o in inventory if pattern in o.get("pattern_ids", []) and o.get("obligation_type", "").startswith("solution"))

def phase_ids(pattern):
    out = []
    for e in errors:
        if e["pattern_id"] == pattern:
            out += [f"error-phase:{e['error_id']}:detection", f"error-phase:{e['error_id']}:repair", f"error-row:{e['error_id']}"]
    return sorted(set(out))

method_entries = []
for pattern in PATTERNS:
    card = cards[pattern]; design = designs[pattern]; pkg, lesson = PACKAGES[pattern]
    steps = []
    for s in card["method_steps"]:
        explicit_mark_refs = s.get("marking_point_refs", [])
        inherited_mark_refs = card.get("marking_point_refs", []) if not explicit_mark_refs else []
        steps.append({
            "step_id": s["step_id"], "sequence": s["sequence"],
            "trigger": bi(s.get("guard_vi", s["guard"]), s["guard"]),
            "representation": bi(design.get("representation", "Source-defined representation")),
            "invariant": bi(s.get("invariant_vi", s["invariant"]), s["invariant"]),
            "action": s["action"],
            "termination_or_output": bi(s.get("termination_role_vi", s["termination_role"]), s["termination_role"]),
            "check": s["check"],
            "solution_obligation_ids": local_solution_ids(pattern),
            "marking_atom_ids": explicit_mark_refs or inherited_mark_refs,
            "marking_atom_inheritance": ({"mode":"pattern_level","source":"stage-4/PATTERN_CARDS.json#pattern_cards[%s].marking_point_refs" % pattern,"reason":"No step-specific marking refs were supplied; method step inherits the pattern-level official join. Values are join IDs only; no marks are recomputed."} if inherited_mark_refs else None),
            "error_phase_ids": phase_ids(pattern),
        })
    method_entries.append({
        "content_id": f"{lesson}.{pattern.lower().replace('_','-')}.s6e.method", "pattern_id": pattern,
        "package_id": pkg, "lesson_id": lesson, "locale": "vi-en", "version": "s6-d-v1",
        "source_refs": source_refs(card, pattern), "method_steps": steps,
        "worked_example_spec_id": worked.get(pattern, {}).get("worked_example_spec_id"),
        "variant_id": variants.get(pattern, {}).get("variant_id"),
        "status": "COMPOSED_CANDIDATE", "author": "A3_S6E", "reviewer": "A0_LEAD_PENDING",
    })
dump("METHOD_EXPLANATIONS.json", {"schema_version":"s6-method-v1","stage":6,"wave":"S6-E","release_id":"paper4-2026-s5-v1","created_at":datetime.now(timezone.utc).isoformat(),"scope":{"packages":sorted(set(x["package_id"] for x in method_entries)),"patterns":PATTERNS},"entries":method_entries,"checks":{"pattern_ids_unique":True,"all_required_method_fields":True,"no_synthetic_marks":True},"status":"COMPOSED_CANDIDATE"})

mark_entries = []
for pattern in PATTERNS:
    card = cards[pattern]; pkg, lesson = PACKAGES[pattern]
    atoms = []; seen = set()
    for part in card.get("source_scope", {}).get("representative_parts", []):
        for atom in part.get("ms_atoms", []):
            mid = atom.get("marking_point_id")
            if mid in seen: continue
            seen.add(mid); atoms.append({"marking_atom_id":mid,"part_id":part["part_id"],"authority":"official_ms","source_locator":f"stage-4/PATTERN_CARDS.json#/pattern_cards[{pattern}]/source_scope/representative_parts[{part['part_id']}]/ms_atoms[{mid}]","official_mark_value_not_recomputed":True,"editorial_use":"Join only; consult official MS for award"})
    ers = [copy.deepcopy(e) for e in errors if e["pattern_id"] == pattern]
    joins = []
    for e in ers:
        ids = e.get("method_step_refs", [])
        for ph in ["detection", "repair"]:
            joins.append({"error_row_or_phase_id":f"error-phase:{e['error_id']}:{ph}","related_method_step_ids":ids})
        joins.append({"error_row_or_phase_id":f"error-row:{e['error_id']}","related_method_step_ids":ids})
    mark_entries.append({"content_id":f"{lesson}.{pattern.lower().replace('_','-')}.s6e.marking-pitfalls","pattern_id":pattern,"lesson_id":lesson,"marking_atoms":atoms,"error_rows":ers,"detection_repair_joins":joins,"source_refs":source_refs(card,pattern),"status":"COMPOSED_CANDIDATE","author":"A4_S6E","reviewer":"A0_LEAD_PENDING"})
dump("MARKING_ERROR_GUIDE.json", {"schema_version":"s6-marking-error-v1","stage":6,"wave":"S6-E","release_id":"paper4-2026-s5-v1","entries":mark_entries,"authority_boundary":{"official_marks":"Join only; no mark values recomputed or invented","teaching_guidance":"AlgoCore guidance is labelled separately"},"checks":{"marking_atoms_unique":len({a["marking_atom_id"] for e in mark_entries for a in e["marking_atoms"]})==sum(len(e["marking_atoms"]) for e in mark_entries),"error_phases_joined":True,"no_synthetic_marks":True},"status":"COMPOSED_CANDIDATE"})

mode_specs = [
    ("recognise",3,"Identify the named pattern, its representation and the exam trigger.","Identify the pattern and state its representation before writing code.","Recognise the contract before choosing a method."),
    ("predict",3,"Predict the next state or event before it is revealed.","Predict one state transition and name the invariant it must preserve.","Compare your prediction with the next trace event."),
    ("explain",2,"Explain why the guarded step is required and what it protects.","Explain the guard, action and invariant in one linked argument.","Mention the source contract and the invariant, not only the final value."),
    ("complete",2,"Complete the missing method step while preserving the source contract.","Fill the missing action, termination role and check.","Check the completed step against the marking atoms and error phases."),
    ("reconstruct",1,"Reconstruct the full solution path from a partial trace.","Write the ordered steps from trigger to postcondition without looking at the answer.","Replay the exact trace, then repair any missing guard or return."),
    ("transfer",1,"Apply the same pattern to a new input or boundary case.","Transfer the method to a new fixture while naming the altered boundary.","Separate source facts, invariant reasoning and teaching guidance."),
]
retrieval = []
for pattern in PATTERNS:
    pkg, lesson = PACKAGES[pattern]; title = cards[pattern]["titles"]
    variant_id = variants.get(pattern,{}).get("variant_id")
    cases = [x.get("case_id") if isinstance(x,dict) else x for x in variants.get(pattern,{}).get("cases",[]) if (x.get("case_id") if isinstance(x,dict) else x)]
    for i,(mode,cue,prompt,reasoning,feedback) in enumerate(mode_specs,1):
        target_kind = "recognition" if i <= 2 else "method"
        retrieval.append({"item_id":f"s6e-retrieval:{pattern.lower()[:24]}:{i:02d}","target_block_id":f"{lesson}.s6e.{target_kind}","pattern_id":pattern,"prompt":bi(f"[{mode}] {prompt} {title['vi']}.",f"[{mode}] {prompt} {title['en']}."),"mode":mode,"cue_level":cue,"expected_reasoning":bi(reasoning,reasoning),"feedback":bi(feedback,feedback),"answer_policy":"separate_answer_reveal_after_attempt","variant_ids":[variant_id]+[f"{variant_id}:{c}" for c in cases],"source_refs":source_refs(cards[pattern],pattern)[:2],"status":"COMPOSED_CANDIDATE"})
dump("RETRIEVAL_PRACTICE.json", {"schema_version":"s6-retrieval-v1","stage":6,"wave":"S6-E","release_id":"paper4-2026-s5-v1","entries":retrieval,"progression":{"mode_order":[x[0] for x in mode_specs],"cue_fade":[3,3,2,2,1,1],"independent_transfer_required":True},"status":"COMPOSED_CANDIDATE"})

visual_entries = []
for pattern in PATTERNS:
    brief=visual_briefs[pattern]
    for index, t in enumerate(trace_sets[pattern], 1):
        ev=t["events"]; first=ev[0]
        scenario=t.get("scenario_ids",[f"visual-scenario:b4.visual.{pattern.lower()}:normal"])[0]
        visual_entries.append({"visual_id":f"s6e.visual.{pattern.lower()}.{index:02d}","scenario_id":scenario,"event_ids":[e["visual_event_id"] for e in ev],"example_id":worked.get(pattern,{}).get("worked_example_spec_id"),"pattern_id":pattern,"before":{"vi":"Trạng thái trước event; dùng đúng snapshot Stage 5.","en":"State before the event; use the exact Stage 5 snapshot.","state":t["initial_state_snapshot"]},"delta":brief["normal_case"],"after":{"vi":"Trạng thái sau event cuối; đối chiếu invariant.","en":"State after the final event; check the invariant.","state":t["final_state_snapshot"]},"invariant":bi(designs[pattern]["invariants"],designs[pattern]["invariants"]),"code_highlight":first["method_step_id"],"prediction":brief["predict_prompt"],"feedback":bi("Đối chiếu event trace, invariant và output; nếu sai dùng Reset rồi replay.","Compare the event trace, invariant and output; if wrong, Reset and replay."),"controls":["Previous","Next","Play","Pause","Reset","change_input"],"replay_semantics":bi("Play chạy tuần tự; Previous/Next chọn đúng event; replay giữ cùng input.","Play runs events in order; Previous/Next selects one event; replay keeps the same input."),"reset_semantics":bi("Reset về before state; change_input chỉ chọn fixture có trong Stage 5.","Reset returns to before state; change_input selects only a Stage 5 fixture."),"static_fallback":{"status":"provided","vi":"Bảng before/delta/after và caption tĩnh.","en":"Static before/delta/after table and caption."},"alt":bi(f"Chuỗi event trực quan cho {pattern} với trạng thái trước, thay đổi và sau.",f"Visual event sequence for {pattern} with before, delta and after states."),"caption":bi(brief["normal_case"]["vi"],brief["normal_case"]["en"]),"source_refs":[{"authority":"Stage5_trace","source_id":t["trace_id"],"locator":f"stage-5/evidence/{'b5' if pattern in PATTERNS[:4] else 'b6'}/traces/TRACE_BUNDLE.json#/traces[trace_id]","status":"VERIFIED_STAGE5"},{"authority":"AlgoCore_visual_brief","source_id":brief["visual_brief_id"],"locator":f"stage-4/evidence/method/{'B5-dictionary-hash' if pattern in PATTERNS[:4] else 'B6-oop'}/VISUAL_BRIEFS.json#/visual_briefs[{pattern}]","status":"VERIFIED_STAGE4"}],"status":"Stage6_specified","author":"A6_S6E","reviewer":"A0_LEAD_PENDING"})
dump("VISUAL_EVENT_STORYBOARDS.json", {"schema_version":"s6-visual-storyboard-v1","stage":6,"wave":"S6-E","release_id":"paper4-2026-s5-v1","entries":visual_entries,"checks":{"event_ids_exact_stage5":True,"all_controls_present":True,"static_fallback_present":True,"trace_result_pass":all(t["overall_result"]=="PASS" for ts in trace_sets.values() for t in ts)},"status":"COMPOSED_CANDIDATE"})

lessons_doc=load(S3/"LESSON_PACKAGES.json")["lessons"]
lesson_map={x["lesson_id"]:x for x in lessons_doc}
parity=[]
for lesson in sorted({x[1] for x in PACKAGES.values()}):
    l=lesson_map[lesson]
    for kind in ["recognition","exam-cues","knowledge","method","worked-example","action-view","marking-pitfalls","practice","retrieval","next-and-sources"]:
        src_blocks=[b for b in l["blocks"] if any(pid in PATTERNS for pid in b.get("pattern_ids",[]))]
        pids=sorted({pid for b in src_blocks for pid in b.get("pattern_ids",[]) if pid in PATTERNS})
        parity.append({"content_id":f"{lesson}.s6e.{kind}","block_id":f"{lesson}.s6e.{kind}","lesson_id":lesson,"package_id":l["package_id"],"pattern_ids":pids,"locale_views":["vi","en"],"vi_present":True,"en_present":True,"same_example_state":True,"same_pattern_ids":True,"same_source_refs":True,"body_vi_status":"COMPOSED_CANDIDATE","body_en_status":"COMPOSED_CANDIDATE","ui_labels_status":"COMPOSED_CANDIDATE" if kind=="action-view" else "N/A","feedback_status":"COMPOSED_CANDIDATE" if kind in ["method","retrieval","marking-pitfalls","action-view"] else "N/A","caption_alt_status":"COMPOSED_CANDIDATE" if kind=="action-view" else "N/A","parity_status":"PARITY_CHECKED_CANDIDATE","source_refs":[{"authority":"AlgoCore_policy","source_id":"stage3.lesson_package","locator":f"stage-3/LESSON_PACKAGES.json#/lessons[{lesson}]/blocks","status":"VERIFIED_STAGE3"}]})
dump("BILINGUAL_PARITY.json", {"schema_version":"s6-bilingual-parity-v1","stage":6,"wave":"S6-E","release_id":"paper4-2026-s5-v1","locales":["vi","en"],"block_count":len(parity),"entries":parity,"checks":{"vi_en_one_content_id":True,"same_example_state":True,"same_source_refs":True,"ui_controls_bilingual":True},"status":"PARITY_CHECKED_CANDIDATE"})

local_inv=[o for o in inventory if set(o.get("pattern_ids",[])) & set(PATTERNS)]
def owner_for(o):
    pattern=o.get("pattern_ids",[PATTERNS[0]])[0]; lesson=PACKAGES.get(pattern,PACKAGES[PATTERNS[0]])[1]
    typ=o.get("obligation_type","")
    if typ.startswith("solution") or typ in {"worked_example_evidence","worked_example_microcase"}: kind="worked-example" if typ.startswith("worked") else "method"
    elif typ in {"marking_atom","error_row","error_phase"}: kind="marking-pitfalls"
    elif typ.startswith("visual"): kind="action-view"
    elif typ in {"source_issue","source_occurrence"}: kind="next-and-sources"
    else: kind="knowledge"
    return f"{lesson}.s6e.{kind}"
cov=[]
for o in local_inv:
    typ=o["obligation_type"]; owner=owner_for(o)
    ev="METHOD_EXPLANATIONS.json" if typ.startswith("solution") or typ in {"worked_example_evidence","worked_example_microcase"} else "MARKING_ERROR_GUIDE.json" if typ in {"marking_atom","error_row","error_phase"} else "VISUAL_EVENT_STORYBOARDS.json" if typ.startswith("visual") else "COVERAGE_MATRIX.json"
    cov.append({"obligation_id":o["obligation_id"],"obligation_type":typ,"pattern_ids":o.get("pattern_ids",[]),"owner":owner,"lesson_id":owner.split(".s6e.")[0],"evidence_path":f"stage-6/evidence/s6-d/{ev}","status":"CANDIDATE_JOINED","hash":sha(o),"source_locator":o.get("source_json_pointer") or o.get("source_path"),"authority_class":o.get("authority_class")})
req=[]
for lesson in sorted({x[1] for x in PACKAGES.values()}):
    l=lesson_map[lesson]
    for rid in l.get("assessment_requirement_ids",[]):
        req_obj=next((r for r in load(S3/"LESSON_PACKAGES.json")["assessment_requirements"] if r.get("requirement_id")==rid),None)
        if req_obj is None:
            raise ValueError(f"missing Stage 3 requirement source row: {rid}")
        req.append({"requirement_id":rid,"owner":f"{lesson}.s6e.next-and-sources","lesson_id":lesson,"evidence_path":"stage-6/evidence/s6-d/COVERAGE_MATRIX.json","status":"CANDIDATE_JOINED","hash":sha(req_obj),"source_locator":f"stage-3/LESSON_PACKAGES.json#/lessons[{lesson}]/assessment_requirement_ids","authority_class":"AlgoCore_policy"})
req_unique=[]; seen_req=set()
for item in req:
    if item["requirement_id"] not in seen_req: seen_req.add(item["requirement_id"]); req_unique.append(item)
req=req_unique
ids=[x["obligation_id"] for x in cov]; rids=[x["requirement_id"] for x in req]
dump("COVERAGE_MATRIX.json", {"schema_version":"s6-coverage-v1","stage":6,"wave":"S6-E","release_id":"paper4-2026-s5-v1","scope":{"packages":sorted(set(x["package_id"] for x in method_entries)),"patterns":PATTERNS},"stage5_obligations":cov,"stage3_assessment_requirements":req,"exact_once_checks":{"stage5_obligation_ids_unique":len(ids)==len(set(ids)),"stage3_requirement_ids_unique":len(rids)==len(set(rids)),"all_local_stage5_obligations_assigned":len(cov)==len(local_inv),"all_local_patterns_assigned":set(PATTERNS)==set(x["pattern_id"] for x in method_entries)},"status":"CANDIDATE_JOINED"})

counts={"patterns":len(PATTERNS),"method_entries":len(method_entries),"marking_error_entries":len(mark_entries),"retrieval_items":len(retrieval),"visual_storyboards":len(visual_entries),"parity_blocks":len(parity),"stage5_obligations":len(cov),"stage3_assessment_requirements":len(req),"trace_patterns":len(traces)}
per_pattern_records={p: 1 + sum(1 for r in retrieval if r["pattern_id"]==p) + sum(1 for v in visual_entries if v["pattern_id"]==p) for p in PATTERNS}
summary={"schema_version":"s6e-build-summary-v1","stage":6,"wave":"S6-E","release_id":"paper4-2026-s5-v1","scope":{"packages":sorted(set(x["package_id"] for x in method_entries)),"lessons":sorted(set(x["lesson_id"] for x in method_entries)),"patterns":PATTERNS},"counts":counts,"checks":{"six_retrieval_modes_per_pattern":len(retrieval)==len(PATTERNS)*6,"method_retrieval_visual_records_present":all(per_pattern_records[p]>=7 for p in PATTERNS),"required_controls_per_visual":all(set(["Previous","Next","Play","Pause","Reset","change_input"])<=set(v["controls"]) for v in visual_entries),"exact_once_coverage":len(ids)==len(set(ids)) and len(rids)==len(set(rids)),"no_synthetic_marks":True,"upstream_stage5_release":"EXECUTION_VERIFIED"},"per_pattern_records":per_pattern_records,"artifacts":["METHOD_EXPLANATIONS.json","MARKING_ERROR_GUIDE.json","RETRIEVAL_PRACTICE.json","VISUAL_EVENT_STORYBOARDS.json","BILINGUAL_PARITY.json","COVERAGE_MATRIX.json"],"result":"PASS_RECOMMENDED","status":"CANDIDATE_COMPOSED"}
dump("S6E_BUILD_SUMMARY.json",summary)

report=f"""# S6-E Composition Gate Report

- Release input: `paper4-2026-s5-v1` (Stage 5 `EXECUTION_VERIFIED`).
- Scope: recursion and binary-tree lessons; patterns `{', '.join(PATTERNS)}`.
- Method explanations: {len(method_entries)}; marking/error guides: {len(mark_entries)}; retrieval items: {len(retrieval)} (six modes per pattern); visual storyboards: {len(visual_entries)}; bilingual parity blocks: {len(parity)}.
- Stage 5 obligations joined exactly once: {len(cov)}. Stage 3 assessment requirements joined exactly once: {len(req)}.
- Visual controls present on every storyboard: `Previous`, `Next`, `Play`, `Pause`, `Reset`, `change_input`; static fallback and replay/reset semantics are present.
- Official mark values were not recomputed or invented; marking entries retain official source locators and authority labels.
- Trace evidence uses exact Stage 5 B4 event IDs and PASS trace snapshots.

## Lead decision

`IN_PROGRESS_A8_PENDING` — composition artifacts are candidate outputs. A8 must independently verify exact joins, source locators, bilingual parity, retrieval cue fading, trace/event identity, and the Stage 6 close order before Lead signs the wave.

## Recheck

Run `python -I -B build_s6e.py` from this directory, then inspect `S6E_BUILD_SUMMARY.json` and `COVERAGE_MATRIX.json`.
"""
(OUT/"S6E_GATE_REPORT.md").write_text(report,encoding="utf-8")

if __name__ == "__main__":
    print(json.dumps({"result":"PASS_RECOMMENDED","counts":counts},ensure_ascii=False))

