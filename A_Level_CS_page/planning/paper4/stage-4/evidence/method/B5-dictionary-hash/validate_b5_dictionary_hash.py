#!/usr/bin/env python3
"""Validate the deterministic Stage 4 B5 dictionary/hash submission."""
from __future__ import annotations

import hashlib
import json
import sys
from collections import Counter
from pathlib import Path

try:
    import jsonschema
except ImportError:
    jsonschema = None

HERE = Path(__file__).resolve().parent
STAGE4 = HERE.parents[2]
P4 = STAGE4.parent
CATALOG = P4 / "stage-2" / "EXAM_PATTERN_CATALOG.json"
MAP = P4 / "stage-3" / "BOOK_KNOWLEDGE_MAP.json"
MARKING = STAGE4 / "evidence" / "marking" / "2025" / "MARKING_SUBMISSION.json"
RISK = MARKING.with_name("SOURCE_RISK_REGISTER.json")
INPUTS = [CATALOG,P4/"stage-2"/"QUESTION_PATTERN_MAP.json",P4/"stage-2"/"CONFUSABLE_PATTERNS.json",MAP,P4/"stage-3"/"COVERAGE_MATRIX.json",P4/"stage-3"/"LESSON_PACKAGES.json",P4/"stage-1"/"SOURCE_ISSUES.json",STAGE4/"evidence"/"marking"/"2021-2022"/"MARKING_SUBMISSION.json",STAGE4/"evidence"/"marking"/"2021-2022"/"SOURCE_RISK_REGISTER.json",STAGE4/"evidence"/"marking"/"2023-2024"/"MARKING_SUBMISSION.json",STAGE4/"evidence"/"marking"/"2023-2024"/"SOURCE_RISK_REGISTER.json",MARKING,RISK,STAGE4/"schemas"/"pattern-card.schema.json",STAGE4/"schemas"/"error-prevention.schema.json",STAGE4/"schemas"/"design-briefs.schema.json"]
PATTERNS=["HASH_SETUP","HASH_FUNCTION","HASH_INSERT","HASH_SEARCH"]

def load(path): return json.loads(path.read_text(encoding="utf-8"))
def sha(path): return hashlib.sha256(path.read_bytes()).hexdigest()
def bi(v): return isinstance(v,dict) and all(isinstance(v.get(k),str) and v[k].strip() for k in ("vi","en"))

def main():
    checks=[]; failures=[]
    def check(name,ok,detail=""):
        checks.append({"check":name,"pass":bool(ok),"detail":detail})
        if not ok: failures.append(f"{name}: {detail}")
    catalog={x["pattern_id"]:x for x in load(CATALOG)["patterns"]}
    chains={x["pattern_id"]:x for x in load(MAP)["pattern_chains"]}
    source_rows={x["part_id"]:x for x in load(MARKING)["rows"]}
    risk_doc=load(RISK)
    risk_parts={pid for r in risk_doc["risks"] for pid in r["affected_part_ids"]}
    cards_doc=load(HERE/"PATTERN_CARDS.json"); cards=cards_doc["pattern_cards"]; by={c["pattern_id"]:c for c in cards}
    variant_doc=load(HERE/"VARIANT_INVARIANT_REGISTER.json"); variants=variant_doc["variants"]
    error_doc=load(HERE/"ERROR_PREVENTION.json"); errors=error_doc["error_rows"]
    design_doc=load(HERE/"SOLUTION_DESIGNS.json"); designs=design_doc["solution_designs"]
    example_doc=load(HERE/"WORKED_EXAMPLE_SPECS.json"); examples=example_doc["worked_example_specs"]
    visual_doc=load(HERE/"VISUAL_BRIEFS.json"); visuals=visual_doc["visual_briefs"]

    check("exact_pattern_order",list(by)==PATTERNS,str(list(by)))
    check("artifact_counts",len(cards)==4 and len(variants)==6 and len(errors)==12 and len(designs)==len(examples)==len(visuals)==4,f"{len(cards)}/{len(variants)}/{len(errors)}/{len(designs)}/{len(examples)}/{len(visuals)}")
    check("all_top_status_submitted",all(d["status"]=="SUBMITTED" for d in [cards_doc,variant_doc,error_doc,design_doc,example_doc,visual_doc]),"")

    owned=[]; step_owned=[]; part_links=[]
    for pattern in PATTERNS:
        c=by[pattern]; expected_parts=catalog[pattern]["assessed_part_ids"]; got=c["source_scope"]["assessed_part_ids"]
        check(f"{pattern}.exact_parts",got==expected_parts,f"expected {expected_parts}; got {got}")
        check(f"{pattern}.stage3_join",c["lesson_id"]==chains[pattern]["lesson_id"] and c["package_id"]==chains[pattern]["package_id"] and c["knowledge_block_ids"]==chains[pattern]["knowledge_block_ids"],"")
        refs=c["source_scope"]["official_source_refs"]
        check(f"{pattern}.source_ref_count",len(refs)==len(expected_parts),f"{len(refs)} vs {len(expected_parts)}")
        live=True; expected_atoms=[]
        for ref in refs:
            row=source_rows.get(ref["part_id"])
            if not row or ref["part_id"] not in expected_parts: live=False; continue
            if ref["qp_locator"]!={"source_id":row["qp_requirement"]["source_id"],"pdf_pages":row["qp_requirement"]["pdf_pages"]}: live=False
            atom_map={m["marking_point_id"]:m for m in row["marking_points"]}; ref_map={m["marking_point_id"]:m for m in ref["ms_atoms"]}
            if set(atom_map)!=set(ref_map): live=False
            for aid,m in atom_map.items():
                rm=ref_map.get(aid)
                if not rm or rm["source_id"]!=m["ms_source_id"] or rm["pdf_pages"]!=m["ms_pdf_pages"] or rm["award_semantics"]!=m["award_semantics"] or rm.get("dependency")!=m.get("dependency") or rm.get("alternatives")!=m.get("alternatives"): live=False
            expected_atoms.extend(atom_map)
        check(f"{pattern}.locators_atoms_semantics_live",live,"QP/MS locators, award semantics, alternatives, dependencies")
        own=c["marking_point_refs"]; steprefs=[a for s in c["method_steps"] for a in s.get("marking_point_refs",[])]
        check(f"{pattern}.atom_set_exact",Counter(own)==Counter(expected_atoms),f"{len(own)} vs {len(expected_atoms)}")
        check(f"{pattern}.step_atom_once",Counter(steprefs)==Counter(expected_atoms),f"{len(steprefs)} vs {len(expected_atoms)}")
        owned+=own; step_owned+=steprefs; part_links+=got
        check(f"{pattern}.method_bilingual",all(bi(s["action"]) and bi(s["why"]) and bi(s["check"]) for s in c["method_steps"]),"")
        check(f"{pattern}.invariant_guard_termination_bilingual",all("VI:" in s["invariant"] and "EN:" in s["invariant"] and "VI:" in s["guard"] and "EN:" in s["guard"] and "VI:" in s["termination_role"] and "EN:" in s["termination_role"] for s in c["method_steps"]),"")
        check(f"{pattern}.sequence",[s["sequence"] for s in c["method_steps"]]==list(range(1,len(c["method_steps"])+1)),"")
        check(f"{pattern}.no_current_source_risk",not set(expected_parts)&risk_parts and c["source_issue_refs"]==[],"")
        check(f"{pattern}.limited_corpus_caveat",any(x.get("policy_id")=="B5-LIMITED-2025-HASH-CORPUS" for x in c["source_fidelity_policies"]),"")
    check("eight_unique_parts",len(part_links)==len(set(part_links))==8,str(part_links))
    check("twenty_four_unique_atoms",len(owned)==len(set(owned))==24,f"{len(owned)}/{len(set(owned))}")
    check("step_ownership_global_unique",len(step_owned)==len(set(step_owned))==24,"")

    rules=[(c["applicability"]["decision_rule"]["vi"],c["applicability"]["decision_rule"]["en"]) for c in cards]
    check("distinct_decision_rules",len(rules)==len(set(rules))==4,"")
    check("confusable_refs_are_stage2_patterns",all(set(c["confusable_pattern_refs"]).issubset(set(catalog)) for c in cards),"")
    all_method_text=json.dumps(cards,ensure_ascii=False).lower()
    for token in ["modulus","sentinel","probe","duplicate","full","not found","spare","bucket","python dict"]:
        check(f"method_contract_token.{token}",token in all_method_text,token)

    vby={v["variant_id"]:v for v in variants}
    check("a3c14_exact",set(vby["B5-V04-collision-strategy"]["stage2_contrast_refs"])=={"A3C14"},str(vby["B5-V04-collision-strategy"]["stage2_contrast_refs"]))
    check("dict_contrast_not_fake_stage2",vby["B5-V06-dictionary-vs-explicit-hash"]["stage2_contrast_refs"]==[],"")
    check("variant_bilingual",all(bi(v["decision_rule"]) and v["invariant"] and v["cases"] for v in variants),"")

    eby=Counter(e["pattern_id"] for e in errors)
    check("three_errors_each",all(eby[p]==3 for p in PATTERNS),str(eby))
    check("error_detection_repair_bilingual",all(bi(e["likely_error"]) and bi(e["consequence"]) and bi(e["detection_check"]) and bi(e["repair_action"]) for e in errors),"")
    check("no_mark_loss_claim",all(e.get("exact_mark_loss_claim") is None for e in errors),"")
    error_locators_live=True
    atom_to_source={m["marking_point_id"]:(r,m) for r in source_rows.values() for m in r["marking_points"]}
    for e in errors:
        for aid in e["marking_point_refs"]:
            row,atom=atom_to_source[aid]; loc=e["source_locator_if_official"]
            if loc["qp_locator"]!={"source_id":row["qp_requirement"]["source_id"],"pdf_pages":row["qp_requirement"]["pdf_pages"]} or loc["ms_locator"]!={"source_id":atom["ms_source_id"],"pdf_pages":atom["ms_pdf_pages"]}: error_locators_live=False
    check("error_source_locators_live",error_locators_live,"")

    dby={d["pattern_id"]:d for d in designs}
    check("designs_pending",set(dby)==set(PATTERNS) and all(d["status"]=="PENDING_STAGE5_EXECUTION_VERIFICATION" for d in designs),"")
    check("design_steps_exact",all(d["ordered_method_step_ids"]==[s["step_id"] for s in by[p]["method_steps"]] for p,d in dby.items()),"")
    check("design_fixture_categories",all(set(d["stage5_test_obligations"])=={"normal","boundary","counterexample","source_fixture"} for d in designs),"")
    check("boundary_cases_present",all(any(x in " ".join(d["stage5_test_obligations"]["boundary"]).lower() for x in (["duplicate","full"] if d["pattern_id"]=="HASH_INSERT" else ["absent","empty"] if d["pattern_id"]=="HASH_SEARCH" else ["modulus"] if d["pattern_id"]=="HASH_FUNCTION" else ["spare"] )) for d in designs),"")

    exby={e["pattern_id"]:e for e in examples}
    check("one_live_anchor_each",set(exby)==set(PATTERNS) and all(e["anchor_source"]["part_id"] in by[p]["source_scope"]["assessed_part_ids"] for p,e in exby.items()),"")
    check("examples_pending",all(e["status"]=="PENDING_STAGE5_EXECUTION_VERIFICATION" and e["prohibited_stage4_claims"] for e in examples),"")

    vb={v["pattern_id"]:v for v in visuals}; questions=[(v["learning_question"]["vi"],v["learning_question"]["en"]) for v in visuals]; events=[tuple(v["proposed_event_types"]) for v in visuals]; cases=[(v["normal_case"]["en"],v["boundary_case"]["en"],v["failure_case"]["en"]) for v in visuals]
    check("visuals_one_each",set(vb)==set(PATTERNS),"")
    check("visual_questions_distinct",len(questions)==len(set(questions))==4,"")
    check("visual_events_distinct",len(events)==len(set(events))==4 and all(len(x)>=5 for x in events),"")
    check("visual_cases_distinct",len(cases)==len(set(cases))==4,"")
    check("visual_bilingual_pending",all(bi(v["learning_question"]) and bi(v["predict_prompt"]) and bi(v["normal_case"]) and bi(v["boundary_case"]) and bi(v["failure_case"]) and bi(v["static_fallback"]) and v["status"]=="PENDING_STAGE5_TRACE_AND_STAGE7_STORYBOARD" for v in visuals),"")

    hashes=[{"path":str(p.relative_to(P4)).replace("\\","/"),"sha256":sha(p)} for p in INPUTS]
    check("input_hashes_current",all(d["input_hashes"]==hashes for d in [cards_doc,variant_doc,error_doc,design_doc,example_doc,visual_doc]),"")
    forbidden=["execution verified","executed successfully","all tests passed","trace verified"]
    check("no_execution_claims",not any(tok in (HERE/f).read_text(encoding="utf-8").lower() for f in ["PATTERN_CARDS.json","SOLUTION_DESIGNS.json","WORKED_EXAMPLE_SPECS.json","VISUAL_BRIEFS.json"] for tok in forbidden),"")

    if jsonschema:
        cs=load(STAGE4/"schemas"/"pattern-card.schema.json"); es=load(STAGE4/"schemas"/"error-prevention.schema.json"); serr=[]
        for c in cards:
            try: jsonschema.validate(c,cs)
            except Exception as exc: serr.append(f"card {c['pattern_id']}: {exc.message}")
        for e in errors:
            try: jsonschema.validate(e,es)
            except Exception as exc: serr.append(f"error {e['error_id']}: {exc.message}")
        check("json_schema_cards_errors",not serr,"; ".join(serr))
    else: check("json_schema_cards_errors",True,"jsonschema unavailable")

    result={"schema_version":"s4-schema-v1","status":"PASS" if not failures else "FAIL","batch_id":"B5-dictionary-hash","summary":{"checks":len(checks),"passed":sum(c["pass"] for c in checks),"failed":len(failures),"patterns":len(cards),"assessed_part_links":len(part_links),"unique_parts":len(set(part_links)),"owned_official_atoms":len(owned),"method_steps":sum(len(c["method_steps"]) for c in cards),"variants":len(variants),"errors":len(errors),"designs":len(designs),"worked_examples":len(examples),"visuals":len(visuals)},"checks":checks,"errors":failures}
    (HERE/"VALIDATION.json").write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(json.dumps({"status":result["status"],**result["summary"]},ensure_ascii=False))
    for f in failures: print("FAIL:",f)
    return 1 if failures else 0

if __name__=="__main__": sys.exit(main())
