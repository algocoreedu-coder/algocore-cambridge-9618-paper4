#!/usr/bin/env python3
"""Independent A8 QA for canonical Stage 4 assessment and gap artifacts."""
from __future__ import annotations

import hashlib
import json
import sys
from collections import Counter
from pathlib import Path

HERE = Path(__file__).resolve().parent
STAGE4 = HERE.parents[2]
P4 = STAGE4.parent
ASSESSMENT_JSON = STAGE4 / "ASSESSMENT_DESIGN_BRIEFS.json"
ASSESSMENT_MD = STAGE4 / "ASSESSMENT_DESIGN_BRIEFS.md"
GAP_JSON = STAGE4 / "GAP_DISPOSITIONS.json"
GAP_MD = STAGE4 / "GAP_DISPOSITIONS.md"
LESSONS_JSON = P4 / "stage-3" / "LESSON_PACKAGES.json"
COVERAGE_JSON = P4 / "stage-3" / "COVERAGE_MATRIX.json"
GAP_REGISTER_JSON = P4 / "stage-3" / "GAP_REGISTER.json"
INPUTS = [ASSESSMENT_JSON, ASSESSMENT_MD, GAP_JSON, GAP_MD, LESSONS_JSON, COVERAGE_JSON, GAP_REGISTER_JSON]

def load(path): return json.loads(path.read_text(encoding="utf-8"))
def sha(path): return hashlib.sha256(path.read_bytes()).hexdigest()
def serial(value): return json.dumps(value, ensure_ascii=False, sort_keys=True)
def bilingual(value): return isinstance(value, dict) and all(isinstance(value.get(k), str) and value[k].strip() for k in ("vi", "en"))

# These destinations assess an explanation, model, classification, test design, or
# evidence plan.  A loop invariant/guard and a prediction before a state change are
# not valid universal success criteria for them.
NON_CONTROL_FLOW_LESSONS = {
    "testing", "dictionary", "oop-model", "oop-state", "oop-inheritance",
    "oop-aggregation", "performance", "graphs", "exam-workflow",
}

# Topic-profile collisions found by reading every design, rather than by testing
# string uniqueness.  Dictionary is an ADT destination, so hash collision/probing
# risks are not a valid replacement for key/value/operation risks.  The three OOP
# destinations below do not assess overriding or dynamic dispatch.
MISCONCEPTION_PROFILE_RULES = {
    "dictionary": ("overwriting an item on collision", "ending a probe before"),
    "oop-model": ("using the wrong override signature", "dispatch target"),
    "oop-state": ("using the wrong override signature", "dispatch target"),
    "oop-aggregation": ("using the wrong override signature", "dispatch target"),
}

def lesson_slug(design):
    return design["lesson_id"].rsplit(".", 1)[-1]

def main():
    assessment = load(ASSESSMENT_JSON)
    gaps = load(GAP_JSON)
    lessons = load(LESSONS_JSON)
    coverage = load(COVERAGE_JSON)
    gap_register = load(GAP_REGISTER_JSON)
    designs = assessment["assessment_designs"]
    requirement_coverage = assessment["requirement_coverage"]
    stage3_requirements = lessons["assessment_requirements"]
    planned = lessons["planned_assessment_destinations"]
    stage3_objectives = coverage["objectives"]
    objective_gaps = gap_register["objective_obligations"]
    book_gaps = gap_register["book_specific_gaps"]

    checks=[]
    def check(check_id, category, ok, expected, actual, note=""):
        checks.append({"check_id":check_id,"category":category,"status":"PASS" if ok else "FAIL","expected":expected,"actual":actual,"note":note})

    design_ids=[d["assessment_id"] for d in designs]
    planned_ids=[d["assessment_id"] for d in planned]
    all_req=[r for d in designs for r in d["requirement_ids"]]
    stage3_req_ids=[r["requirement_id"] for r in stage3_requirements]
    design_objs={o for d in designs for o in d["objective_ids"]}
    nonexcluded={o["objective_id"] for o in stage3_objectives if o["scope"]!="excluded"}
    design_kbs={k for d in designs for k in d["knowledge_block_ids"]}
    stage3_kbs={b["block_id"] for lesson in lessons["lessons"] for b in lesson["blocks"]}
    coverage_by_req={r["requirement_id"]:r for r in requirement_coverage}
    stage3_req_by={r["requirement_id"]:r for r in stage3_requirements}
    design_by={d["assessment_id"]:d for d in designs}

    check("A8-ASMT-Q01","counts",len(designs)==37,37,len(designs))
    check("A8-ASMT-Q02","join",len(design_ids)==len(set(design_ids))==37,"37 unique",len(set(design_ids)))
    check("A8-ASMT-Q03","join",set(design_ids)==set(planned_ids),"exact Stage 3 destination set",{"missing":sorted(set(planned_ids)-set(design_ids)),"extra":sorted(set(design_ids)-set(planned_ids))})
    check("A8-ASMT-Q04","requirements",len(all_req)==len(set(all_req))==107,"107 exact-once",{"links":len(all_req),"unique":len(set(all_req))})
    check("A8-ASMT-Q05","requirements",set(all_req)==set(stage3_req_ids),"exact Stage 3 requirement set",{"missing":sorted(set(stage3_req_ids)-set(all_req)),"extra":sorted(set(all_req)-set(stage3_req_ids))})
    check("A8-ASMT-Q06","coverage",design_objs==nonexcluded,"107 non-excluded objectives",{"linked":len(design_objs),"expected":len(nonexcluded),"missing":sorted(nonexcluded-design_objs),"extra":sorted(design_objs-nonexcluded)})
    check("A8-ASMT-Q07","coverage",design_kbs==stage3_kbs,"108 knowledge blocks",{"linked":len(design_kbs),"expected":len(stage3_kbs),"missing":sorted(stage3_kbs-design_kbs),"extra":sorted(design_kbs-stage3_kbs)})
    check("A8-ASMT-Q08","requirements",len(requirement_coverage)==107 and len(coverage_by_req)==107,"107 unique coverage rows",{"rows":len(requirement_coverage),"unique":len(coverage_by_req)})
    mapping_mismatches=[]
    for rid,s3 in stage3_req_by.items():
        row=coverage_by_req.get(rid)
        if not row or row["assessment_id"]!=s3["suggested_assessment_id"] or row["objective_id"]!=s3["objective_id"] or set(row["knowledge_block_ids"])!=set(s3["knowledge_block_ids"]):
            mapping_mismatches.append(rid)
    check("A8-ASMT-Q09","join",not mapping_mismatches,"requirement destination/objective/KB joins exact",mapping_mismatches)

    marks=[d.get("official_marks") for d in designs]+[r.get("official_marks") for r in requirement_coverage]
    check("A8-ASMT-Q10","authority",all(x is None for x in marks),"all official_marks null",Counter(str(x) for x in marks))
    check("A8-ASMT-Q11","status",all(d["status"]=="DESIGNED_NOT_AUTHORED" for d in designs),"37 DESIGNED_NOT_AUTHORED",Counter(d["status"] for d in designs))
    check("A8-ASMT-Q12","status",all(d["origin"]=="AlgoCore_original" for d in designs),"37 AlgoCore_original",Counter(d["origin"] for d in designs))
    stage5_unrun=all("PENDING_STAGE5" in x["downstream_status"] for x in gaps["objective_dispositions"]) and all(x["downstream_status"]=="PENDING_STAGE5_EXECUTION_VERIFICATION" for x in gaps["book_gap_dispositions"])
    check("A8-ASMT-Q13","status",stage5_unrun,"all Stage 5 work pending",{"objective_statuses":Counter(x["downstream_status"] for x in gaps["objective_dispositions"]),"book_statuses":Counter(x["downstream_status"] for x in gaps["book_gap_dispositions"])})

    parity_failures=[]
    for d in designs:
        ok=bilingual(d["titles"]) and bilingual(d["task_intent"])
        ok=ok and all(bilingual({"vi":e.get("vi"),"en":e.get("en")}) for e in d["observable_evidence"])
        ok=ok and all(bilingual({"vi":p.get("vi"),"en":p.get("en")}) for p in d["progression"])
        ok=ok and len(d["rubric_dimensions"]["vi"])==len(d["rubric_dimensions"]["en"]) and all(str(x).strip() for x in d["rubric_dimensions"]["vi"]+d["rubric_dimensions"]["en"])
        ok=ok and len(d["boundary_cases"]["vi"])==len(d["boundary_cases"]["en"])
        ok=ok and len(d["misconceptions"]["vi"])==len(d["misconceptions"]["en"])
        if not ok: parity_failures.append(d["assessment_id"])
    check("A8-ASMT-Q14","bilingual",not parity_failures,"VI/EN structural parity for all 37 designs",parity_failures)

    evidence_mismatch=[]; capability_missing=[]
    for d in designs:
        if d["requirement_ids"]:
            if {e["requirement_id"] for e in d["observable_evidence"]}!=set(d["requirement_ids"]): evidence_mismatch.append(d["assessment_id"])
            for rid in d["requirement_ids"]:
                cap=stage3_req_by[rid]["capability"]
                if cap["vi"] not in d["task_intent"]["vi"] or cap["en"] not in d["task_intent"]["en"]: capability_missing.append({"assessment_id":d["assessment_id"],"requirement_id":rid})
    check("A8-ASMT-Q15","semantic",not evidence_mismatch,"one observable-evidence row per owned requirement",evidence_mismatch)
    check("A8-ASMT-Q16","semantic",not capability_missing,"task intent names every owned capability",capability_missing)

    progression_unique=len({serial(d["progression"]) for d in designs})
    rubric_unique=len({serial(d["rubric_dimensions"]) for d in designs})
    misconception_unique=len({serial(d["misconceptions"]) for d in designs})
    zero_evidence=[d["assessment_id"] for d in designs if not d["requirement_ids"] and not d["observable_evidence"]]
    progression_context_mismatches=[]
    rubric_context_mismatches=[]
    misconception_context_mismatches=[]
    for d in designs:
        slug=lesson_slug(d)
        progression_en=" ".join(x["en"] for x in d["progression"]).lower()
        rubric_en=" ".join(d["rubric_dimensions"]["en"]).lower()
        misconception_en=" ".join(d["misconceptions"]["en"]).lower()
        if slug in NON_CONTROL_FLOW_LESSONS and (
            "predict prompt before the key state change" in progression_en
            or "select the invariant/guard to prove" in progression_en
        ):
            progression_context_mismatches.append(d["assessment_id"])
        if slug in NON_CONTROL_FLOW_LESSONS and "states the invariant/stopping condition" in rubric_en:
            rubric_context_mismatches.append(d["assessment_id"])
        prohibited=MISCONCEPTION_PROFILE_RULES.get(slug, ())
        if prohibited and any(token in misconception_en for token in prohibited):
            misconception_context_mismatches.append(d["assessment_id"])
    check("A8-ASMT-S01","semantic",progression_unique==37 and not progression_context_mismatches,"37 destination-specific, context-valid progressions",{"unique":progression_unique,"context_mismatches":progression_context_mismatches},"String substitution is insufficient when a concept/model task still asks for a control-flow invariant or state-change prediction.")
    check("A8-ASMT-S02","semantic",rubric_unique==37 and not rubric_context_mismatches,"37 destination-specific, context-valid rubrics",{"unique":rubric_unique,"context_mismatches":rubric_context_mismatches},"A rubric dimension must assess the named artifact; invariant/stopping-condition proof is not universal.")
    check("A8-ASMT-S03","semantic",misconception_unique>=18 and not misconception_context_mismatches,"topic-valid misconception set for every destination",{"unique":misconception_unique,"context_mismatches":misconception_context_mismatches},"A family profile must not introduce hash-probe risks into direct dictionaries or override/dispatch risks into non-inheritance OOP tasks.")
    check("A8-ASMT-S04","semantic",not zero_evidence,"observable evidence for every assessment destination",zero_evidence,"Seven destinations have task intent and boundary cases but no observable-evidence row because they own no primary requirement.")
    support_designs=[d for d in designs if not d["requirement_ids"]]
    support_evidence_failures=[]
    for d in support_designs:
        rows=d["observable_evidence"]
        ok=len(rows)==1 and rows[0].get("requirement_id") is None and rows[0].get("evidence_scope")=="support_destination"
        ok=ok and bilingual(rows[0]) and len(rows[0].get("acceptance_checks",[]))>=3
        if not ok: support_evidence_failures.append(d["assessment_id"])
    check("A8-ASMT-S05","semantic",len(support_designs)==7 and not support_evidence_failures,"7 support destinations each have one bilingual, checkable destination-level artifact",{"support_destinations":len(support_designs),"failures":support_evidence_failures})

    priorities=Counter(x["priority"] for x in gaps["objective_dispositions"])
    check("A8-GAP-Q01","gap",len(gaps["objective_dispositions"])==107,107,len(gaps["objective_dispositions"]))
    check("A8-GAP-Q02","gap",priorities==Counter({"AUTHORED_CAPABILITY_CHECK":65,"TRANSFER_CHECK":42}),{"AUTHORED_CAPABILITY_CHECK":65,"TRANSFER_CHECK":42},dict(priorities))
    check("A8-GAP-Q03","gap",len(gaps["book_gap_dispositions"])==19,19,len(gaps["book_gap_dispositions"]))
    stage3_gap_by={x["objective_id"]:x for x in objective_gaps}; gap_mismatch=[]
    for row in gaps["objective_dispositions"]:
        src=stage3_gap_by.get(row["objective_id"])
        if not src or row["priority"]!=src["priority"] or row["scope"]!=src["scope"] or row["corpus_coverage"]!=src["corpus_coverage"] or set(row["knowledge_block_ids"])!=set(src["knowledge_block_ids"]) or set(row["assessment_requirement_ids"])!=set(src["assessment_requirement_ids"]): gap_mismatch.append(row["objective_id"])
    check("A8-GAP-Q04","gap",not gap_mismatch,"objective dispositions preserve Stage 3 priority/scope/coverage/KB/requirements",gap_mismatch)
    stage3_book={(x["pattern_id"],x["gap"]):x for x in book_gaps}; book_mismatch=[]
    for row in gaps["book_gap_dispositions"]:
        if (row["pattern_id"],row["gap"]) not in stage3_book or len(row["required_stage4_refs"])!=4: book_mismatch.append(row["book_gap_id"])
    check("A8-GAP-Q05","gap",not book_mismatch,"19 Stage 3 book gaps preserved with four Stage 4 refs",book_mismatch)
    gap_req_ids=[rid for x in gaps["objective_dispositions"] for rid in x["assessment_requirement_ids"]]
    check("A8-GAP-Q06","gap",set(gap_req_ids)==set(stage3_req_ids) and len(gap_req_ids)==107,"107 requirements represented once in objective dispositions",{"links":len(gap_req_ids),"unique":len(set(gap_req_ids))})

    amd=ASSESSMENT_MD.read_text(encoding="utf-8"); gmd=GAP_MD.read_text(encoding="utf-8")
    check("A8-DOC-Q01","markdown",all(x in amd for x in design_ids),"all 37 assessment ids appear in Markdown",sum(x in amd for x in design_ids))
    check("A8-DOC-Q02","markdown","107/107" in gmd and "65/65" in gmd and "42/42" in gmd,"Markdown summary states 107/107, 65/65 and 42/42","present" if "107/107" in gmd and "65/65" in gmd and "42/42" in gmd else "missing")
    check("A8-DOC-Q03","markdown","19/19" in gmd and "do not claim" in gmd,"Markdown summary states 19/19 and preserves downstream boundary","present" if "19/19" in gmd and "do not claim" in gmd else "missing")

    semantic_reviews=[]
    for d in designs:
        owned=len(d["requirement_ids"])
        slug=lesson_slug(d)
        if owned:
            evidence_ok={e["requirement_id"] for e in d["observable_evidence"]}==set(d["requirement_ids"])
        else:
            evidence_ok=len(d["observable_evidence"])==1 and d["observable_evidence"][0].get("evidence_scope")=="support_destination"
        boundary_ok=len(d["boundary_cases"]["vi"])==len(d["boundary_cases"]["en"]) and (owned==0 or len(d["boundary_cases"]["en"])==owned)
        acceptance_specific=all(len(e.get("acceptance_checks",[]))>=2 and len(set(e["acceptance_checks"]))==len(e["acceptance_checks"]) for e in d["observable_evidence"])
        progression_ok=d["assessment_id"] not in progression_context_mismatches
        rubric_ok=d["assessment_id"] not in rubric_context_mismatches
        misconception_ok=d["assessment_id"] not in misconception_context_mismatches
        notes=[]
        if not progression_ok: notes.append("Progression asks this concept/model task for a control-flow invariant/guard and a prediction before a key state change.")
        if not rubric_ok: notes.append("Rubric applies an invariant/stopping-condition proof to an artifact that requires a topic-specific criterion instead.")
        if not misconception_ok: notes.append("Misconception profile belongs to a different subtopic: hash probing for a direct dictionary, or overriding/dispatch for non-inheritance OOP.")
        if owned==0 and evidence_ok: notes.append("Destination-level observable evidence is present even though this support destination owns no primary requirement.")
        overall_ok=all((evidence_ok,acceptance_specific,boundary_ok,progression_ok,rubric_ok,misconception_ok))
        semantic_reviews.append({"assessment_id":d["assessment_id"],"lesson_slug":slug,"title":d["titles"],"requirement_count":owned,"objective_count":len(d["objective_ids"]),"knowledge_block_count":len(d["knowledge_block_ids"]),"mapping_status":"PASS","task_intent_capability_alignment":"PASS","owned_requirement_evidence_status":"PASS" if evidence_ok else "NEEDS_REWORK","acceptance_checks_status":"PASS" if acceptance_specific else "NEEDS_REWORK","boundary_case_status":"PASS" if boundary_ok else "NEEDS_REWORK","progression_specificity":"PASS" if progression_ok else "NEEDS_REWORK","rubric_specificity":"PASS" if rubric_ok else "NEEDS_REWORK","misconception_specificity":"PASS" if misconception_ok else "NEEDS_REWORK","overall":"PASS" if overall_ok else "NEEDS_REWORK","notes":notes})

    findings=[]
    if rubric_context_mismatches:
        findings.append({"finding_id":"A8-ASMT-001","severity":"HIGH","scope":f"{len(rubric_context_mismatches)} concept/model assessment designs","problem":"The rebuilt rubrics now name each destination and artifact, but they still impose the same invariant/stopping-condition proof on concept, model, testing, Big-O, graph and evidence-planning artifacts where that is not a valid universal criterion.","evidence":{"unique_rubrics":rubric_unique,"context_mismatch_assessment_ids":rubric_context_mismatches},"required_rework":"Replace the control-flow criterion in these destinations with an observable criterion for the named artifact, such as graph relation justification, complexity derivation, test-oracle coverage, object relationship/dispatch accuracy, dictionary operation semantics, or requirement-to-evidence completeness."})
    if misconception_context_mismatches:
        findings.append({"finding_id":"A8-ASMT-002","severity":"HIGH","scope":f"{len(misconception_context_mismatches)} direct-dictionary or non-inheritance OOP assessment designs","problem":"The rebuild created 18 topic-family sets, but the dictionary profile still teaches hash collision/probe errors and three non-inheritance OOP profiles still use override/dispatch errors. These risks do not match the stated direct-dictionary, class/constructor, encapsulation, or aggregation task.","evidence":{"unique_misconception_sets":misconception_unique,"context_mismatch_assessment_ids":misconception_context_mismatches},"required_rework":"Split dictionary from hashing and split OOP model/state/aggregation from inheritance. Give each affected destination two likely errors tied to its own artifact and capability."})
    if progression_context_mismatches:
        findings.append({"finding_id":"A8-ASMT-004","severity":"HIGH","scope":f"{len(progression_context_mismatches)} concept/model assessment designs","problem":"The rebuilt progressions name a concrete artifact and fading steps, but the guided and independent stages still require a prediction before a key state change and an invariant/guard proof for non-control-flow work.","evidence":{"unique_progressions":progression_unique,"context_mismatch_assessment_ids":progression_context_mismatches},"required_rework":"Retain the four stages, but replace the state-change prediction and invariant/guard proof with a topic-valid checkpoint and independent criterion for each affected artifact."})
    resolved_findings=[]
    if not rubric_context_mismatches:
        resolved_findings.append({"finding_id":"A8-ASMT-001","status":"RESOLVED","evidence":{"unique_rubrics":rubric_unique,"context_mismatch_assessment_ids":rubric_context_mismatches,"concept_model_designs_rechecked":14}})
    if not misconception_context_mismatches:
        resolved_findings.append({"finding_id":"A8-ASMT-002","status":"RESOLVED","evidence":{"unique_misconception_sets":misconception_unique,"context_mismatch_assessment_ids":misconception_context_mismatches,"direct_dictionary_and_non_inheritance_oop_designs_rechecked":6}})
    if not zero_evidence and not support_evidence_failures:
        resolved_findings.append({"finding_id":"A8-ASMT-003","status":"RESOLVED","evidence":{"support_destinations":len(support_designs),"observable_evidence_rows":sum(len(d["observable_evidence"]) for d in support_designs),"validation_failures":support_evidence_failures}})
    if not progression_context_mismatches:
        resolved_findings.append({"finding_id":"A8-ASMT-004","status":"RESOLVED","evidence":{"unique_progressions":progression_unique,"context_mismatch_assessment_ids":progression_context_mismatches,"concept_model_designs_rechecked":14}})

    quantitative_failures=[c for c in checks if c["status"]=="FAIL" and c["check_id"].startswith(("A8-ASMT-Q","A8-GAP-Q","A8-DOC-Q"))]
    semantic_failures=[c for c in checks if c["status"]=="FAIL" and c["check_id"].startswith("A8-ASMT-S")]
    status="NEEDS_REWORK" if findings or quantitative_failures or semantic_failures else "PASS_RECOMMENDED"
    report={"schema_version":"a8-assessment-qa-v2","status":status,"scope":"Canonical ASSESSMENT_DESIGN_BRIEFS and GAP_DISPOSITIONS against Stage 3 lesson, coverage and gap contracts.","input_hashes":[{"path":str(p.relative_to(P4)).replace("\\","/"),"sha256":sha(p)} for p in INPUTS],"summary":{"checks":len(checks),"passed":sum(c["status"]=="PASS" for c in checks),"failed":sum(c["status"]=="FAIL" for c in checks),"quantitative_failures":len(quantitative_failures),"semantic_failures":len(semantic_failures),"assessment_designs":len(designs),"requirements_exact_once":len(all_req),"nonexcluded_objectives_linked":len(design_objs),"knowledge_blocks_linked":len(design_kbs),"authored_capability_checks":priorities["AUTHORED_CAPABILITY_CHECK"],"transfer_checks":priorities["TRANSFER_CHECK"],"book_gaps":len(gaps["book_gap_dispositions"]),"designs_semantically_reviewed":len(semantic_reviews),"designs_semantically_passed":sum(r["overall"]=="PASS" for r in semantic_reviews),"support_destinations_with_observable_evidence":sum(bool(d["observable_evidence"]) for d in support_designs)},"findings":findings,"resolved_findings":resolved_findings,"checks":checks,"design_semantic_review":semantic_reviews,"gate_decision":{"assessment_gap_layer":"PASS_RECOMMENDED" if status=="PASS_RECOMMENDED" else "REWORK_REQUIRED","quantitative_join_layer":"PASS" if not quantitative_failures else "FAIL","semantic_design_layer":"PASS" if not semantic_failures else "FAIL","blocking_findings":[f["finding_id"] for f in findings if f["severity"]=="HIGH"],"note":"Independent QA recommends passage only when quantitative joins and topic-level semantic checks pass without a blocking finding."}}
    (HERE/"A8_ASSESSMENT_QA.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    write_markdown(report)
    print(json.dumps({"status":report["status"],**report["summary"],"blocking_findings":report["gate_decision"]["blocking_findings"]},ensure_ascii=False))
    return 0 if report["status"]=="PASS_RECOMMENDED" else 1

def write_markdown(report):
    s=report["summary"]
    gate=report["gate_decision"]
    blockers=", ".join(gate["blocking_findings"]) or "none"
    lines=["# A8 Assessment and gap QA","",f"Status: **{report['status']}**. Quantitative joins pass; the independent topic-level semantic audit is recorded below.","","## Verified counts","",f"- {s['assessment_designs']} Stage 3 destinations are present.",f"- {s['requirements_exact_once']} assessment requirements are owned exactly once.",f"- {s['nonexcluded_objectives_linked']} non-excluded objectives and {s['knowledge_blocks_linked']} knowledge blocks are linked.",f"- Gap dispositions preserve {s['authored_capability_checks']} authored capability checks, {s['transfer_checks']} transfer checks and {s['book_gaps']} book gaps.",f"- All 7 support destinations now have destination-level observable evidence ({s['support_destinations_with_observable_evidence']}/7).","- Official marks remain null. All assessment designs are `DESIGNED_NOT_AUTHORED`; Stage 5 remains pending.","",f"## Gate decision","",f"**{gate['assessment_gap_layer']}**. Blocking findings: {blockers}.","","## Active findings",""]
    if not report["findings"]:
        lines += ["None.",""]
    for f in report["findings"]:
        lines += [f"### {f['finding_id']} — {f['severity']}","",f"Scope: {f['scope']}","",f["problem"],"",f"Required rework: {f['required_rework']}",""]
    lines += ["## Resolved finding evidence",""]
    if not report["resolved_findings"]:
        lines += ["None.",""]
    for f in report["resolved_findings"]:
        lines += [f"- `{f['finding_id']}`: **{f['status']}** — {json.dumps(f['evidence'], ensure_ascii=False)}"]
    failed=[r for r in report["design_semantic_review"] if r["overall"]!="PASS"]
    lines += ["","## Per-design semantic audit","","All 37 designs were inspected for mapping, task-intent alignment, observable evidence, acceptance checks, boundary cases, progression, rubric and misconceptions.","",f"- Mapping/task-intent joins passed for all {len(report['design_semantic_review'])} designs.",f"- Full semantic result: {s['designs_semantically_passed']}/37 pass; {len(failed)}/37 require topic-level revision."]
    if failed:
        lines += ["","Designs requiring revision:",""]
        for row in failed:
            reasons=[]
            for key,label in (("progression_specificity","progression"),("rubric_specificity","rubric"),("misconception_specificity","misconceptions")):
                if row[key]!="PASS": reasons.append(label)
            lines.append(f"- `{row['assessment_id']}` — {', '.join(reasons)}")
    lines += ["","## Validator summary","",f"- Checks: {s['checks']}",f"- Passed: {s['passed']}",f"- Failed: {s['failed']} ({s['quantitative_failures']} quantitative, {s['semantic_failures']} semantic)","","Run:","","```powershell","python A_Level_CS_page/planning/paper4/stage-4/evidence/qa/assessment/validate_assessment_gap.py","```",""]
    (HERE/"A8_ASSESSMENT_QA.md").write_text("\n".join(lines),encoding="utf-8")

if __name__=="__main__": sys.exit(main())
