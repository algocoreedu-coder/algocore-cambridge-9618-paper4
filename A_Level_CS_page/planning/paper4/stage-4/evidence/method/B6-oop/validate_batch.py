from __future__ import annotations

import hashlib
import json
from collections import defaultdict
from pathlib import Path

from jsonschema import Draft202012Validator


HERE = Path(__file__).resolve().parent
P4 = HERE.parents[3]
S2, S3, S4 = P4 / "stage-2", P4 / "stage-3", P4 / "stage-4"
PATTERNS = ["OOP_CLASS", "OOP_SUBCLASS", "OOP_GET", "OOP_SET", "OOP_UPDATE",
            "OOP_OVERRIDE", "OOP_INSTANTIATE", "OOP_CAPACITY_ADD"]
FILES = ["PATTERN_CARDS.json", "VARIANT_INVARIANT_REGISTER.json", "ERROR_PREVENTION.json",
         "SOLUTION_DESIGNS.json", "WORKED_EXAMPLE_SPECS.json", "VISUAL_BRIEFS.json"]


def load(path):
    return json.loads(Path(path).read_text(encoding="utf-8"))


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


checks, failures = [], []
def check(name, condition, detail=""):
    checks.append({"check": name, "passed": bool(condition), "detail": detail})
    if not condition:
        failures.append(f"{name}: {detail}")


docs = {f: load(HERE / f) for f in FILES}
cards = docs["PATTERN_CARDS.json"]["pattern_cards"]
variants = docs["VARIANT_INVARIANT_REGISTER.json"]["variants"]
errors = docs["ERROR_PREVENTION.json"]["error_rows"]
solutions = docs["SOLUTION_DESIGNS.json"]["solution_designs"]
examples = docs["WORKED_EXAMPLE_SPECS.json"]["worked_example_specs"]
visuals = docs["VISUAL_BRIEFS.json"]["visual_briefs"]

for name, doc in docs.items():
    check(f"{name}:submitted", doc.get("status") == "SUBMITTED", str(doc.get("status")))
    check(f"{name}:batch", doc.get("batch_id") == "B6-oop")
    for item in doc.get("input_hashes", []):
        p = P4 / item["path"]
        check(f"{name}:input_exists:{item['path']}", p.exists())
        if p.exists(): check(f"{name}:input_hash:{item['path']}", sha(p) == item["sha256"])

expected = set(PATTERNS)
W21_PARTS = {"9618_w21_41_2(e)", "9618_w21_42_2(e)"}
W21_RESOLVED_CONDITION = (
    "Criterion retained under Lead decision S4-S1-DEC-001: all 11 criteria remain official evidence, "
    "no criterion receives an independent atom value, and the official part-level holistic ceiling is 8."
)
for label, seq in [("cards",cards),("solutions",solutions),("examples",examples),("visuals",visuals)]:
    check(f"exact_pattern_order:{label}", [x["pattern_id"] for x in seq] == PATTERNS)

card_schema = load(S4 / "schemas/pattern-card.schema.json")
error_schema = load(S4 / "schemas/error-prevention.schema.json")
for card in cards:
    problems = list(Draft202012Validator(card_schema).iter_errors(card))
    check(f"schema:card:{card['pattern_id']}", not problems, "; ".join(x.message for x in problems))
for row in errors:
    problems = list(Draft202012Validator(error_schema).iter_errors(row))
    check(f"schema:error:{row['error_id']}", not problems, "; ".join(x.message for x in problems))

catalog = {x["pattern_id"]:x for x in load(S2 / "EXAM_PATTERN_CATALOG.json")["patterns"] if x["pattern_id"] in expected}
card_by = {x["pattern_id"]:x for x in cards}
all_rows = {}
for year in ("2021-2022","2023-2024","2025"):
    doc=load(S4/f"evidence/marking/{year}/MARKING_SUBMISSION.json")
    for raw in doc.get("rows") or doc.get("parts") or []:
        row=dict(raw); row["source_batch"]=year; all_rows[row["part_id"]]=row


def atom_owner(row, atom):
    assessed=row.get("assessed_pattern_ids") or row.get("pattern_ids") or []
    b6=[p for p in assessed if p in PATTERNS]
    if not b6: return None
    if len(b6)==1: return b6[0]
    kinds,text=set(b6),atom["criterion_paraphrase"].lower()
    if kinds=={"OOP_CLASS","OOP_GET"}: return "OOP_GET" if "get method" in text or "getter" in text else "OOP_CLASS"
    if kinds=={"OOP_SUBCLASS","OOP_UPDATE"}: return "OOP_UPDATE" if any(k in text for k in ("changenumberwords","setterritory","adds parameter")) else "OOP_SUBCLASS"
    if kinds=={"OOP_OVERRIDE","OOP_UPDATE"}: return "OOP_OVERRIDE" if "method header" in text and "overrid" in text else "OOP_UPDATE"
    if kinds=={"OOP_CLASS","OOP_INSTANTIATE"}: return "OOP_INSTANTIATE" if any(k in text for k in ("initialises all tree","storing boardobject object")) else "OOP_CLASS"
    primary=row.get("primary_pattern_id")
    return primary if primary in b6 else b6[0]


owned={p:defaultdict(list) for p in PATTERNS}
for row in all_rows.values():
    for atom in row["marking_points"]:
        owner=atom_owner(row,atom)
        if owner: owned[owner][row["part_id"]].append(atom)

all_claimed, all_parts, all_step_ids = [], set(), []
for pattern in PATTERNS:
    card=card_by[pattern]; expected_parts=catalog[pattern]["assessed_part_ids"]
    actual_parts=card["source_scope"]["assessed_part_ids"]
    check(f"assessed_set:{pattern}", actual_parts == expected_parts)
    refs_by_part={x["part_id"]:x for x in card["source_scope"]["official_source_refs"]}
    check(f"source_ref_set:{pattern}", set(refs_by_part)==set(expected_parts) and len(refs_by_part)==len(expected_parts))
    expected_atoms=[]; raw_issue_set=set()
    for part in expected_parts:
        all_parts.add(part); row=all_rows[part]; src=refs_by_part[part]
        expected_owned=owned[pattern].get(part,[])
        expected_atoms.extend(x["marking_point_id"] for x in expected_owned)
        check(f"source_batch:{pattern}:{part}",src["source_batch"]==row["source_batch"])
        check(f"qp_locator:{pattern}:{part}",src["qp_locator"]=={"source_id":row["qp_requirement"]["source_id"],"pdf_pages":row["qp_requirement"]["pdf_pages"]})
        check(f"qp_locator_nonempty:{pattern}:{part}",bool(src["qp_locator"]["source_id"]) and bool(src["qp_locator"]["pdf_pages"]))
        check(f"qp_paraphrase:{pattern}:{part}",src["qp_requirement_paraphrase"]==row["qp_requirement"]["paraphrase"])
        check(f"qp_constraints:{pattern}:{part}",src["qp_constraint_refs"]==row["qp_requirement"].get("constraint_refs",[]))
        expected_row_issues=set(row.get("source_issue_refs",[]))
        for a in row["marking_points"]: expected_row_issues.update(a.get("source_issue_refs",[]))
        raw_issue_set.update(expected_row_issues)
        check(f"row_issues:{pattern}:{part}",set(src["source_issue_refs"])==expected_row_issues)
        actual_atom_map={x["marking_point_id"]:x for x in src["ms_atoms"]}
        check(f"owned_atom_count:{pattern}:{part}",len(actual_atom_map)==len(expected_owned))
        for atom in expected_owned:
            aid=atom["marking_point_id"]; copy=actual_atom_map.get(aid,{})
            check(f"atom_locator:{pattern}:{aid}",copy.get("source_id")==atom["ms_source_id"] and copy.get("pdf_pages")==atom["ms_pdf_pages"] and bool(copy.get("pdf_pages")))
            for field in ("criterion_paraphrase","award_semantics","condition","alternatives","dependency","source_mark_value_if_unambiguous","group_id","group_max","source_issue_refs"):
                expected_value = W21_RESOLVED_CONDITION if field == "condition" and part in W21_PARTS else atom.get(field)
                check(f"atom_semantics:{pattern}:{aid}:{field}",copy.get(field)==expected_value,f"copy={copy.get(field)!r} source={expected_value!r}")
    check(f"atom_exact_owner:{pattern}",set(card["marking_point_refs"])==set(expected_atoms) and len(card["marking_point_refs"])==len(expected_atoms),f"expected={len(expected_atoms)} actual={len(card['marking_point_refs'])}")
    all_claimed += card["marking_point_refs"]
    check(f"issue_exact_set:{pattern}",set(card["source_issue_refs"])==raw_issue_set,f"expected={sorted(raw_issue_set)} actual={card['source_issue_refs']}")
    step_ids=[x["step_id"] for x in card["method_steps"]]; all_step_ids += step_ids
    check(f"step_ids_unique:{pattern}",len(step_ids)==len(set(step_ids)))
    check(f"step_sequence:{pattern}",[x["sequence"] for x in card["method_steps"]]==list(range(1,len(step_ids)+1)))
    step_atoms=[a for x in card["method_steps"] for a in x["marking_point_refs"]]
    check(f"step_atoms_exact_once:{pattern}",len(step_atoms)==len(set(step_atoms)) and set(step_atoms)==set(expected_atoms))
    for s in card["method_steps"]:
        for field in ("action","why","check"):
            check(f"bilingual:{s['step_id']}:{field}",set(s[field])=={"vi","en"} and all(s[field].values()))
        check(f"step_complete:{s['step_id']}",bool(s["invariant"] and s["guard"] and s["termination_role"] and isinstance(s["reads"],list) and isinstance(s["writes"],list)))

check("part_pattern_links_164",sum(len(c["source_scope"]["assessed_part_ids"]) for c in cards)==164)
check("unique_parts_152",len(all_parts)==152,str(len(all_parts)))
check("owned_atoms_559",len(all_claimed)==559,str(len(all_claimed)))
check("owned_atoms_unique",len(all_claimed)==len(set(all_claimed)))
check("method_steps_36",len(all_step_ids)==36,str(len(all_step_ids)))
check("method_step_ids_unique",len(all_step_ids)==len(set(all_step_ids)))

valid_requirements={x["requirement_id"] for x in load(S3/"LESSON_PACKAGES.json")["assessment_requirements"]}
expected_issue_ids={"S21-3A-PARAM","S21-3B-COUNT","S25-41-MS31-INIT","S25-41-MS35-INIT",
                    "S25-42-Q3CI-NAME","W21-2E-RUBRIC","W22-42-2A-ATTRIBUTE"}
check("exact_issue_set",{i for c in cards for i in c["source_issue_refs"]}==expected_issue_ids)
for card in cards:
    p=card["pattern_id"]
    check(f"requirements:{p}",bool(card["assessment_requirement_refs"]) and set(card["assessment_requirement_refs"])<=valid_requirements)
    check(f"book_locators:{p}",bool(card["book_foundation_refs"]) and all(x["source_id"] and x["pdf_pages"] for x in card["book_foundation_refs"]))
    check(f"fidelity_not_issue:{p}","S4-S2-POLICY-LAYOUT-CODE-FIDELITY" not in card["source_issue_refs"])
    has_s2=any(x["source_batch"]=="2023-2024" for x in card["source_scope"]["official_source_refs"])
    pol=card["source_fidelity_policies"]
    check(f"fidelity_policy:{p}",(not has_s2 and pol==[]) or (has_s2 and len(pol)==1 and pol[0]["policy_id"]=="S4-S2-POLICY-LAYOUT-CODE-FIDELITY" and pol[0]["is_source_issue"] is False))

error_ids=[x["error_id"] for x in errors]
check("error_count_31",len(errors)==31,str(len(errors)))
check("error_ids_unique",len(error_ids)==len(set(error_ids)))
for card in cards:
    expected_errors=[x["error_id"] for x in errors if x["pattern_id"]==card["pattern_id"]]
    check(f"error_reverse_join:{card['pattern_id']}",card["error_refs"]==expected_errors)
for e in errors:
    check(f"error_steps:{e['error_id']}",bool(e["method_step_refs"]) and set(e["method_step_refs"])<=set(all_step_ids))
    check(f"error_requirements:{e['error_id']}",bool(e["requirement_refs"]) and set(e["requirement_refs"])<=valid_requirements)
    check(f"error_no_mark_claim:{e['error_id']}",e["exact_mark_loss_claim"] is None)
    if e["basis"] in {"official_qp_ms","source_issue"}: check(f"error_locator:{e['error_id']}",bool(e["source_locator_if_official"]))
    if e["basis"]=="source_issue":
        item=e["source_locator_if_official"][0]
        check(f"issue_locator_real:{e['error_id']}",bool(item["source_locators"]) and all(x["source_id"] and x["pdf_pages"] for x in item["source_locators"]))

variant_patterns={p for x in variants for p in x["pattern_ids"]}
check("variant_count_7",len(variants)==7,str(len(variants)))
check("variant_coverage",variant_patterns==expected)
decision_texts=[]
for v in variants:
    check(f"variant_cases:{v['variant_id']}",len(v["cases"])>=2 and bool(v["invariant"]))
    check(f"variant_bilingual:{v['variant_id']}",set(v["decision_rule"])=={"vi","en"} and all(v["decision_rule"].values()))
    decision_texts.append((v["decision_rule"]["vi"],v["decision_rule"]["en"]))
check("variant_decisions_unique",len(decision_texts)==len(set(decision_texts)))

solution_by={x["solution_design_id"]:x for x in solutions}; visual_by={x["visual_brief_id"]:x for x in visuals}
for card in cards:
    p=card["pattern_id"]; sol=solution_by.get(card["solution_design_ref"]); vis=visual_by.get(card["visual_brief_ref"])
    check(f"solution_join:{p}",bool(sol) and sol["pattern_id"]==p)
    check(f"solution_status:{p}",sol["status"]=="PENDING_STAGE5_EXECUTION_VERIFICATION")
    check(f"solution_bilingual:{p}",set(sol["input_contract"])=={"vi","en"} and set(sol["output_contract"])=={"vi","en"} and all(sol["input_contract"].values()) and all(sol["output_contract"].values()))
    check(f"solution_steps:{p}",sol["ordered_method_step_ids"]==[x["step_id"] for x in card["method_steps"]])
    sol_parts=[x["part_id"] for x in sol["source_constraints"]]
    check(f"solution_parts:{p}",set(sol_parts)==set(catalog[p]["assessed_part_ids"]) and len(sol_parts)==len(catalog[p]["assessed_part_ids"]))
    check(f"solution_tests:{p}",all(sol["stage5_test_obligations"][k] for k in ("normal","boundary","counterexample","source_fixture")))
    dispositions=sol["source_issue_dispositions"]
    check(f"solution_issues:{p}",{x["issue_id"] for x in dispositions}==set(card["source_issue_refs"]))
    for issue in dispositions:
        check(f"issue_disposition_locator:{p}:{issue['issue_id']}",bool(issue["source_locators"]) and all(x["source_id"] and x["pdf_pages"] for x in issue["source_locators"]))
        check(f"issue_disposition_obligation:{p}:{issue['issue_id']}",bool(issue["stage4_dispositions"]) and bool(issue["stage5_obligations"]))
        if issue["issue_id"]=="W21-2E-RUBRIC":
            check("w21_adjudication_join",issue["status"]=="CARRIED_FORWARD_ADJUDICATED" and issue["adjudication_refs"]==["S4-S1-DEC-001"])
            check("w21_resolved_disposition",all("Lead-resolved by S4-S1-DEC-001" in x and "all 11 criteria" in x and "holistic ceiling of 8" in x for x in issue["stage4_dispositions"]))
            check("w21_occurrences_resolved",all(x["status"]=="LEAD_RESOLVED" and x["resolution_ref"]=="S4-S1-DEC-001" for x in issue["affected_occurrences"]))
    check(f"visual_join:{p}",bool(vis) and vis["pattern_id"]==p)
    check(f"visual_status:{p}",vis["status"]=="PENDING_STAGE5_TRACE_AND_STAGE7_STORYBOARD")
    check(f"visual_steps:{p}",vis["method_step_refs"]==[x["step_id"] for x in card["method_steps"]])
    check(f"visual_errors:{p}",vis["error_refs"]==card["error_refs"])
    check(f"visual_events:{p}",vis["visual_mode"]=="event_driven" and len(vis["proposed_event_types"])>=5)
    for field in ("learning_question","predict_prompt","normal_case","boundary_case","failure_case","static_fallback"):
        check(f"visual_bilingual:{p}:{field}",set(vis[field])=={"vi","en"} and all(vis[field].values()))

case_sigs=[]; question_sigs=[]; event_sigs=[]
for v in visuals:
    case_sigs.append((v["normal_case"]["en"],v["boundary_case"]["en"],v["failure_case"]["en"]))
    question_sigs.append(v["learning_question"]["en"]); event_sigs.append(tuple(v["proposed_event_types"]))
check("visual_cases_unique",len(case_sigs)==len(set(case_sigs))==8)
check("visual_questions_unique",len(question_sigs)==len(set(question_sigs))==8)
check("visual_events_unique",len(event_sigs)==len(set(event_sigs))==8)
for generic in ("A valid state with enough space/data for success.","Empty, full, one-item or one-free-slot state as appropriate.","A failed guard or one-sided transaction failure with required state preservation."):
    check(f"no_generic_visual:{generic[:20]}",all(generic not in json.dumps(v,ensure_ascii=False) for v in visuals))

for ex in examples:
    p=ex["pattern_id"]
    check(f"example_status:{p}",ex["status"]=="PENDING_STAGE5_EXECUTION_VERIFICATION")
    check(f"example_anchor:{p}",ex["anchor_source"]["part_id"] in catalog[p]["assessed_part_ids"])
    check(f"example_steps:{p}",ex["method_step_refs"]==[x["step_id"] for x in card_by[p]["method_steps"]])
    check(f"example_boundary:{p}",bool(ex["contrast_and_boundary_microcases"]) and bool(ex["prohibited_stage4_claims"]))

combined="\n".join((HERE/f).read_text(encoding="utf-8") for f in FILES)
for required in ("double underscore implies Python name mangling","constructor parameter order follows the QP",
                 "parent arguments go through the parent constructor","field_after equals parameter",
                 "candidate is computed from old state","Same callable contract dispatches to subclass behaviour",
                 "distinct mutable instances per required slot","store precedes increment",
                 "S21-3A-PARAM","S21-3B-COUNT","S25-41-MS31-INIT","S25-41-MS35-INIT",
                 "S25-42-Q3CI-NAME","W21-2E-RUBRIC","W22-42-2A-ATTRIBUTE"):
    check(f"required_content:{required[:36]}",required.lower() in combined.lower())
for forbidden in ("tests passed","executed successfully","verified runtime output","DESIGN_REVIEWED","PILOT_GATE=PASS"):
    check(f"forbidden_claim:{forbidden}",forbidden not in combined)
stale_tokens = ["PENDING" + "_LEAD", "Lead must " + "adjudicate", "required " + "adjudication"]
for index, stale in enumerate(stale_tokens, start=1):
    check(f"no_stale_resolution_phrase:{index}", stale.lower() not in combined.lower())

w21_refs=[]
for card in cards:
    for src in card["source_scope"]["official_source_refs"]:
        if src["part_id"] in W21_PARTS: w21_refs.append(src)
check("w21_all_criteria_retained",len(w21_refs)==2 and all(len(x["ms_atoms"])==11 for x in w21_refs))
check("w21_no_atom_values",all(a["source_mark_value_if_unambiguous"] is None for x in w21_refs for a in x["ms_atoms"]))
check("w21_resolved_conditions",all(a["condition"]==W21_RESOLVED_CONDITION for x in w21_refs for a in x["ms_atoms"]))

review=(HERE/"REVIEW.md").read_text(encoding="utf-8")
check("review_status","Status: **SUBMITTED**" in review)
check("review_counts",all(x in review for x in ("164","152","559","36","31")))
check("review_issues",all(x in review for x in expected_issue_ids))
check("review_open_decisions","No Lead decision remains open" in review)

result={"schema_version":"s4-b6-oop-self-validation-v1","status":"SUBMITTED","result":"PASS" if not failures else "FAIL",
 "authority":"Author self-check only; independent QA and Lead review remain required.",
 "counts":{"checks":len(checks),"passed":sum(x["passed"] for x in checks),"failed":len(failures),"patterns":len(cards),
           "assessed_part_pattern_links":sum(len(c["source_scope"]["assessed_part_ids"]) for c in cards),
           "unique_source_parts":len(all_parts),"official_marking_atoms_owned":len(all_claimed),"method_steps":len(all_step_ids),
           "variant_registers":len(variants),"error_rows":len(errors),"solution_designs":len(solutions),"worked_examples":len(examples),"visual_briefs":len(visuals)},
 "checks":checks,"failures":failures,"open_decisions":[],"gate_status":"NOT_EVALUATED"}
(HERE/"VALIDATION.json").write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print(json.dumps({"result":result["result"],"counts":result["counts"],"failures":failures},ensure_ascii=False,indent=2))
raise SystemExit(1 if failures else 0)
