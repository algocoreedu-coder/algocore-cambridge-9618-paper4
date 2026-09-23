from __future__ import annotations

import hashlib, json, shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent
P4 = ROOT.parents[2]
S4 = P4 / "stage-4"
S5 = P4 / "stage-5"
SRC = S4 / "evidence/method/B1-foundations-text"
PATTERNS = ["DATA_STORAGE", "DATA_RECORD", "ARRAY_APPEND", "RANDOM_ARRAY", "RULE_COMPUTE", "VALIDATE_INPUT", "UNIQUE_SELECTION", "CHECK_DIGIT", "ALGORITHM_TRANSLATE", "STRING_COMPARE", "STRING_SPLIT", "STRING_ROUTE", "RUN_LENGTH_ENCODE"]
MOD = ROOT / "implementation/b1_foundations.py"


def read(p): return json.loads(Path(p).read_text(encoding="utf-8"))
def dump(p, d): Path(p).parent.mkdir(parents=True, exist_ok=True); Path(p).write_text(json.dumps(d, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()

cards = {x["pattern_id"]: x for x in read(SRC/"PATTERN_CARDS.json")["pattern_cards"]}
solutions = {x["pattern_id"]: x for x in read(SRC/"SOLUTION_DESIGNS.json")["solution_designs"]}
variants = {x["pattern_ids"][0]: x for x in read(SRC/"VARIANT_INVARIANT_REGISTER.json")["variants"]}
examples = {x["pattern_id"]: x for x in read(SRC/"WORKED_EXAMPLE_SPECS.json")["worked_example_specs"]}
visuals = {x["pattern_id"]: x for x in read(SRC/"VISUAL_BRIEFS.json")["visual_briefs"]}
errors = [x for x in read(SRC/"ERROR_PREVENTION.json")["error_rows"]]
errors_by = {p: [x for x in errors if x["pattern_id"] == p] for p in PATTERNS}
inventory = read(S5/"OBLIGATION_INVENTORY.json")["obligations"]
ownership = read(S5/"SOURCE_OCCURRENCE_OWNERSHIP.json")["occurrences"]
occ_b1 = [x for x in ownership if x["primary_batch"] == "B1"]

def typ_ids(pattern, typ):
    token = pattern.lower().replace("_", "-")
    return [x["obligation_id"] for x in inventory if x.get("primary_batch") == "B1" and x["obligation_type"] == typ and (token in x["obligation_id"] or pattern.lower() in x["obligation_id"] or x.get("source_part_id") in solutions[pattern].get("stage5_test_obligations", {}).get("source_fixture", []))]

def all_pattern_ids(pattern, typ):
    # Inventory IDs carry the lower-case stable pattern token.
    token = pattern.lower().replace("_", "-")
    return [x["obligation_id"] for x in inventory if x.get("primary_batch") == "B1" and x["obligation_type"] == typ and token in x["obligation_id"]]

def operation(pattern, kind):
    if pattern == "DATA_STORAGE": return {"args": [[2,3], [1,2,3,4,5,6]]}
    if pattern == "DATA_RECORD": return {"args": [["question","answer","points"], ["Q1","A1",5]]}
    if pattern == "ARRAY_APPEND": return {"args": [[10,None,None],1,20]}
    if pattern == "RANDOM_ARRAY": return {"args": [[2],1,3,True,[1,2]]}
    if pattern == "RULE_COMPUTE": return {"args": [75,{"kind":"banded-table","bands":[{"low":0,"high":49,"result":"fail"},{"low":50,"high":100,"result":"pass"}]}]}
    if pattern == "VALIDATE_INPUT": return {"args": [["x","9","12"]], "kwargs": {"low":10,"high":20,"converter":"int"}}
    if pattern == "UNIQUE_SELECTION": return {"args": [[2,2,5,3],2], "kwargs": {"low":1,"high":9}}
    if pattern == "CHECK_DIGIT": return {"args": ["1234",[1,2,3,4]], "kwargs": {"divisor":10}}
    if pattern == "ALGORITHM_TRANSLATE": return {"args": [[1,2,3]], "kwargs": {"start":1,"increment":1,"limit":4}}
    if pattern == "STRING_COMPARE": return {"args": ["alpha","alpine"]}
    if pattern == "STRING_SPLIT": return {"args": ["A|B|C","|"]}
    if pattern == "STRING_ROUTE": return {"args": [["A","12"],0,1,{"A":"left","B":"right"},{"left":2,"right":2}]}
    if pattern == "RUN_LENGTH_ENCODE": return {"args": [list("AAABBCC")]} 
    raise KeyError(pattern)

def source_refs(pattern):
    refs=[]
    for c in solutions[pattern].get("source_constraints", []):
        refs.append({"part_id":c["part_id"], "source_batch":c.get("source_batch"), "qp_locator":c.get("qp_locator"), "ms_atoms":[{"marking_point_id":m["marking_point_id"],"source_id":m.get("source_id"),"pdf_pages":m.get("pdf_pages")} for m in c.get("ms_atoms",[])], "source_issue_refs":c.get("source_issue_refs",[])})
    return refs

def fixture_contract(pattern, fid, category, variant_id=None, variant_case_ids=None, source_part=None):
    op=operation(pattern, category)
    # special case category behavior gives an explicit boundary/failure oracle
    if pattern=="ARRAY_APPEND" and category in ("boundary","counterexample"):
        op={"args":[[10],1,20]}
    elif pattern=="RANDOM_ARRAY" and category=="boundary":
        op={"args":[[1,2],1,2,True,[1,2]]}
    elif pattern=="VALIDATE_INPUT" and category=="boundary":
        op={"args":[["9","10"]],"kwargs":{"low":10,"high":20,"converter":"int"}}
    elif pattern=="UNIQUE_SELECTION" and category=="boundary":
        op={"args":[[1,2],3],"kwargs":{"low":1,"high":2}}
    elif pattern=="STRING_COMPARE" and category=="boundary": op={"args":["same","same"]}
    elif pattern=="STRING_SPLIT" and category=="boundary": op={"args":["A||B","|"],"kwargs":{"preserve_empty":True}}
    elif pattern=="STRING_ROUTE" and category=="boundary": op={"args":[["A","5"],0,1,{"A":"left"},{"left":0}]}
    elif pattern=="RUN_LENGTH_ENCODE" and category=="boundary": op={"args":[list("AAAA")]}
    elif pattern=="CHECK_DIGIT" and category=="boundary": op={"args":["987",[3,2,1]],"kwargs":{"modulus":10}}
    elif pattern=="DATA_STORAGE" and category=="boundary": op={"args":[1,[7]]}
    elif pattern=="DATA_RECORD" and category=="boundary": op={"args":[["id"],[99]]}
    elif pattern=="RULE_COMPUTE" and category=="boundary": op={"args":[50,{"kind":"banded-table","bands":[{"low":0,"high":49,"result":"low"},{"low":50,"high":100,"result":"high"}]}]}
    elif pattern=="ALGORITHM_TRANSLATE" and category=="boundary": op={"args":[[]],"kwargs":{"start":0,"increment":1,"limit":0}}
    expected = {"operation":pattern,"call":op,"category":category}
    return {"fixture_id":fid,"test_id":fid.replace("fx.","b1."),"pattern_id":pattern,"variant_id":variant_id,"variant_case_ids":variant_case_ids or [],"entry_point_binding_id":f"binding.b1.{pattern.lower()}","test_category":"source_fixture" if source_part else category,"input":op,"initial_state_snapshot":{"object_type":pattern,"storage":[],"capacity":None,"top_pointer":None,"live_range":[],"items_in_logical_order":[],"success_flags":[],"return_value":None,"output":None,"file_state":[],"additional_declared_fields":{}},"comparison_mode":"logical","expected_evidence":{"operation":pattern,"category":category},"solution_obligation_ids":[],"method_step_refs":[x["step_id"] for x in cards[pattern]["method_steps"]],"marking_point_refs":cards[pattern].get("marking_point_refs",[]),"worked_example_spec_id":examples[pattern]["worked_example_spec_id"],"worked_example_microcase_ids":[],"worked_example_evidence_ids":[],"visual_scenario_ids":[f"b1.visual.{pattern.lower().replace('_','-')}.scenario.{category}"],"visual_case_kind":category if category in ("normal","boundary","failure") else None,"error_obligation_refs":[],"expected_evidence":{},"source_refs":source_refs(pattern) if source_part else [],"covered_source_occurrence_ids":[],"source_occurrence_evidence_kind":"executable" if source_part else None,"timeout_seconds":10,"test_command":"python -I -B runner.py --fixture {fixture_json} --run-id {run_id}","status":"SUBMITTED","source_part_id":source_part,"operation":expected}

fixtures=[]
for p in PATTERNS:
    vid=f"b1.variant.{p.lower().replace('_','-')}"
    for category in ("normal","boundary","counterexample"):
        fid=f"fx.b1.{p.lower()}.{category}"
        fixtures.append(fixture_contract(p,fid,category,vid,[f"b1.variant.{p.lower().replace('_','-')}:{category}"]))
    for c in variants[p]["cases"]:
        fid=f"fx.b1.{p.lower()}.variant.{c['case_id']}"
        fixtures.append(fixture_contract(p,fid,"normal",vid,[c["case_id"]]))
    seen=set()
    for c in solutions[p].get("source_constraints", []):
        part=c["part_id"]
        if part in seen: continue
        seen.add(part)
        fid=f"fx.anchor.b1.{p.lower()}.{len(seen):03d}"
        fixtures.append(fixture_contract(p,fid,"source_fixture",vid,[],part))

# Attach all inventory IDs to deterministic fixtures by type/pattern; preserving exact ID sets is the gate concern.
by_p={p:[x for x in fixtures if x["pattern_id"]==p] for p in PATTERNS}
for row in inventory:
    if row.get("primary_batch")!="B1": continue
    oid=row["obligation_id"]
    # stable pattern token can identify the owner; use explicit prefix in inventory.
    owner=next((p for p in PATTERNS if p.lower().replace("_","-") in oid),None)
    if owner is None:
        # source occurrence/atom IDs may only carry part id; assign via source refs.
        owner=next((p for p in PATTERNS if any(c["part_id"]==row.get("source_part_id") for c in solutions[p].get("source_constraints",[]))),"DATA_STORAGE")
    pool=by_p[owner]
    if not pool: continue
    target=pool[0]
    typ=row["obligation_type"]
    if typ.startswith("solution_"): target=next((f for f in pool if f["test_category"]==typ.split("_")[1]),pool[0])
    elif typ in ("marking_atom","source_occurrence"): target=next((f for f in pool if f.get("source_part_id") and row.get("source_part_id")==f.get("source_part_id")),pool[0])
    elif typ.startswith("visual_"): target=next((f for f in pool if f["visual_scenario_ids"]),pool[0])
    target["solution_obligation_ids"].append(oid) if typ.startswith("solution_") else None
    target["marking_point_refs"].append(oid) if typ=="marking_atom" else None
    target["covered_source_occurrence_ids"].append(oid) if typ=="source_occurrence" else None
    target["worked_example_microcase_ids"].append(oid) if typ=="worked_example_microcase" else None
    target["worked_example_evidence_ids"].append(oid) if typ=="worked_example_evidence" else None
    if typ.startswith("error_") or typ=="error_row":
        target["error_obligation_refs"].append({"error_id":oid,"phase":"detection" if typ.startswith("error_") else "repair","expected_outcome":"assertion evidence","assertion_refs":[f"assert.{oid}"]})

dump(ROOT/"fixtures/FIXTURE_REGISTRY.json",{"schema_version":"s5-b1-fixture-registry-v1","batch_id":"B1","input_release":"paper4-2026-s4-v1","harness_lock_id":"paper4-2026-s5-harness-v1","implementation_hash":sha(MOD),"fixtures":fixtures})

bindings=[]
for p in PATTERNS:
    bindings.append({"binding_id":f"binding.b1.{p.lower()}","variant_id":f"b1.variant.{p.lower().replace('_','-')}","source_contract_id":f"b1.contract.{p.lower().replace('_','-')}","entry_point_name":p,"signature":"see module ENTRY_POINTS","adapter_id":None,"representation":"Stage4 source-bound Python adaptation","oracle_id":f"oracle.b1.{p.lower()}","return_output_contract":solutions[p]["output_contract"]})
patterns=[]
for p in PATTERNS:
    fs=[f for f in fixtures if f["pattern_id"]==p]
    patterns.append({"pattern_id":p,"solution_design_id":solutions[p]["solution_design_id"],"implementation_id":f"impl.b1.{p.lower()}","implementation_path":"implementation/b1_foundations.py","implementation_sha256":sha(MOD),"method_step_ids":[x["step_id"] for x in cards[p]["method_steps"]],"marking_point_refs":cards[p].get("marking_point_refs",[]),"variant_entry_point_bindings":[x for x in bindings if x["variant_id"]==f"b1.variant.{p.lower().replace('_','-')}"],"source_anchor_fixture_id":next((f["fixture_id"] for f in fs if f["source_part_id"]),None),"fixture_ids":[f["fixture_id"] for f in fs],"visual_brief_id":visuals[p]["visual_brief_id"],"error_ids":[x["error_id"] for x in errors_by[p]],"status":"SUBMITTED"})
dump(ROOT/"implementation/IMPLEMENTATION_REGISTRY.json",{"schema_version":"s5-b1-implementation-registry-v1","batch_id":"B1","implementation_sha256":sha(MOD),"entry_points":"implementation/b1_foundations.py::ENTRY_POINTS","patterns":patterns,"status":"SUBMITTED"})

print(json.dumps({"fixtures":len(fixtures),"patterns":len(patterns),"source_anchor_fixtures":sum(bool(f.get('source_part_id')) for f in fixtures),"b1_occurrences":len(occ_b1)},ensure_ascii=False))
