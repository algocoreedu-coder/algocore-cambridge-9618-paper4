"""Create source-backed B21 A2-v3 correction from frozen v2 inputs."""
import hashlib, json
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
import pymupdf

BASE = Path(__file__).resolve().parent
ROOT = BASE.parents[6]
S1 = ROOT / "A_Level_CS_page/planning/paper1/stage-1"
V2 = BASE / "versions/B21-A2-v2"

def jread(p): return json.loads(p.read_text(encoding="utf-8"))
def jlread(p): return [json.loads(x) for x in p.read_text(encoding="utf-8").splitlines() if x.strip()]
def jwrite(p, x): p.write_text(json.dumps(x, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
def jlwrite(p, xs): p.write_text("".join(json.dumps(x, ensure_ascii=False) + "\n" for x in xs), encoding="utf-8")
def sha(p):
    h=hashlib.sha256()
    with p.open("rb") as f:
        for b in iter(lambda:f.read(1024*1024),b""): h.update(b)
    return h.hexdigest()
def hashes(paths): return {str(p.relative_to(ROOT)).replace("\\","/"):sha(p) for p in paths}

manifest=jread(V2/"BATCH_MANIFEST.json")
assert manifest["artifact_version"]=="B21-A2-v2"
stage0=jread(S1.parent/"stage-0/evidence/a2/SOURCE_MANIFEST.json")
stage0src={x["id"]:x for x in stage0["primary_sources"]}
source_details=[]
for s in manifest["sources"]:
    p=ROOT/s["relative_path"]
    assert sha(p)==s["sha256"]==stage0src[s["source_id"]]["sha256"]
    d=pymupdf.open(p)
    try: assert len(d)==s["page_count"]
    finally: d.close()
    source_details.append({"source_id":s["source_id"],"sha256":s["sha256"],"page_count":s["page_count"]})
assert len(source_details)==12

# Add full-page MS p10 renders from original, hash-verified PDFs (2x page size).
new_visuals=[]
for c in ("11","13"):
    sid=f"9618_s21_ms_{c}"
    src=next(s for s in manifest["sources"] if s["source_id"]==sid)
    asset=BASE/"renders"/f"{sid}-p10.png"
    doc=pymupdf.open(ROOT/src["relative_path"])
    try: doc[9].get_pixmap(matrix=pymupdf.Matrix(2,2),alpha=False).save(asset)
    finally: doc.close()
    new_visuals.append({"id":f"{sid}-p10-whole-page","source_id":sid,"pdf_page_1_based":10,
        "page_ref":{"source_id":sid,"pdf_page_1_based":10},"kind":"whole_page_risk_inventory",
        "relates_to_ids":[f"9618_s21_qp_{c}-q8"],
        "extraction_risk":"completed_logic_gate_table_and_grouped_marking_condition",
        "rendered_asset_ref":f"renders/{sid}-p10.png",
        "reviewer_status":"A2_VISUALLY_INSPECTED_PENDING_INDEPENDENT_REVIEW"})

# Rebuild the two S21 Q7 hierarchies; remove false Q8(c) rows and attach Q8 [3].
idx=jlread(V2/"QUESTION_INDEX.jsonl")
questions=[x for x in idx if "question_id" not in x]
parts=[x for x in idx if "question_id" in x]
false={f"9618_s21_qp_{c}-q8-pc" for c in ("11","13")}
assert false <= {x["id"] for x in parts}
parts=[x for x in parts if x["id"] not in false]
for c in ("11","13"):
    qp=f"9618_s21_qp_{c}"; ms=f"9618_s21_ms_{c}"; q7=f"{qp}-q7"; q8=f"{qp}-q8"
    next(q for q in questions if q["id"]==q8)["marks_displayed_or_null"]=3
    ctx=f"contexts/{q7}.json"; par=f"{q7}-pb"
    parts.extend([
      {"id":f"{par}-piii","question_id":q7,"parent_part_id_or_null":par,"label":"iii","marks_displayed_or_null":1,
       "qp_locator":{"source_id":qp,"pdf_page_1_based":16,"question":"7","part":"b(iii)"},
       "prompt_transcript_ref":f"transcripts/{qp}-p16.txt",
       "ms_locator_or_null":{"source_id":ms,"pdf_page_1_based":9,"question":"7","part":"b(iii)"},
       "dependency_refs":[q7,ctx],"context_required":False,"status":"MS_LINKED","part_path":"b.iii"},
      {"id":f"{q7}-pc","question_id":q7,"parent_part_id_or_null":None,"label":"c","marks_displayed_or_null":3,
       "qp_locator":{"source_id":qp,"pdf_page_1_based":16,"question":"7","part":"c"},
       "prompt_transcript_ref":f"transcripts/{qp}-p16.txt",
       "ms_locator_or_null":{"source_id":ms,"pdf_page_1_based":9,"question":"7","part":"c"},
       "dependency_refs":[q7,ctx],"context_required":False,"status":"MS_LINKED","part_path":"c"}])
qorder={q["id"]:(q["source_qp_id"],int(q["question_number"])) for q in questions}
parts.sort(key=lambda x:(qorder[x["question_id"]],x["qp_locator"]["pdf_page_1_based"],x.get("part_path",x["label"])))
jlwrite(BASE/"QUESTION_INDEX.jsonl",questions+parts)

# Q7 shares p16; Q8 remains a whole unlettered question starting p16.
contexts=jlread(V2/"CONTEXT_INDEX.jsonl")
for c in ("11","13"):
    qp=f"9618_s21_qp_{c}"; q7=f"{qp}-q7"; q8=f"{qp}-q8"
    x=next(x for x in contexts if x["question_id"]==q7)
    x.update(continuation_pages=[16],all_context_pages=[15,16],source_evidence=[
      {"source_id":qp,"pdf_page_1_based":15,"question":"7"},
      {"source_id":qp,"pdf_page_1_based":16,"question":"7","part":"b(iii)"},
      {"source_id":qp,"pdf_page_1_based":16,"question":"7","part":"c"}])
    jwrite(BASE/f"contexts/{q7}.json",x)
    y=next(y for y in contexts if y["question_id"]==q8)
    y.update(question_start_page=16,continuation_pages=[],all_context_pages=[16],source_evidence=[{"source_id":qp,"pdf_page_1_based":16,"question":"8"}])
jlwrite(BASE/"CONTEXT_INDEX.jsonl",contexts)

# Migrate every active marking row to schema 1.1 nullable targets and IDs.
oldmarks=jlread(V2/"MARKING_INDEX.jsonl"); marks=[]; target_n=Counter()
for old in oldmarks:
    x=dict(old); oldpart=x.pop("part_id",None)
    x["part_id_or_null"]=x.get("part_id_or_null",oldpart); x["question_id_or_null"]=None
    target=x["part_id_or_null"]; assert target
    target_n[target]+=1; x["id"]=f"{target}-mi-{target_n[target]}"; marks.append(x)
for c in ("11","13"):
    qp=f"9618_s21_qp_{c}"; ms=f"9618_s21_ms_{c}"
    for leaf,label in ((f"{qp}-q7-pb-piii","b(iii)"),(f"{qp}-q7-pc","c")):
        target_n[leaf]+=1
        marks.append({"id":f"{leaf}-mi-{target_n[leaf]}","part_id_or_null":leaf,"question_id_or_null":None,
          "ms_locator":{"source_id":ms,"pdf_page_1_based":9,"question":"7","part":label},
          "transcript_ref":f"transcripts/{ms}-p9.txt","mark_or_condition_or_null":None,
          "table_row_ref_or_null":None,"visual_dependency_refs":[f"{ms}-p9-whole-page"],
          "status":"MS_LINKED","link_type":"EXACT_PRINTED_LABEL"})
    q8=f"{qp}-q8"; target_n[q8]+=1
    marks.append({"id":f"{q8}-mi-{target_n[q8]}","part_id_or_null":None,"question_id_or_null":q8,
      "ms_locator":{"source_id":ms,"pdf_page_1_based":10,"question":"8"},
      "transcript_ref":f"transcripts/{ms}-p10.txt","mark_or_condition_or_null":"1 mark per correct row; total 3",
      "table_row_ref_or_null":None,"visual_dependency_refs":[f"{ms}-p10-whole-page"],
      "status":"MS_LINKED","link_type":"EXACT_PRINTED_LABEL"})
assert all(bool(x["part_id_or_null"]) ^ bool(x["question_id_or_null"]) for x in marks)
assert len({x["id"] for x in marks})==len(marks)
jlwrite(BASE/"MARKING_INDEX.jsonl",marks)

# Normalize visual states and connect both questions to their shared QP p16.
vd=jread(V2/"VISUAL_MANIFEST.json"); vd.update(schema_version="1.1",artifact_version="B21-A2-v3"); visuals=vd["regions"]
for v in visuals:
    assert (BASE/v["rendered_asset_ref"]).is_file(),v["id"]
    if v["reviewer_status"]=="RENDER_REQUIRED_V2": v["reviewer_status"]="RENDERED_PENDING_INDEPENDENT_REVIEW"
    elif v["reviewer_status"]=="A2_V2_RELATION_REBUILT_PENDING_RETEST": v["reviewer_status"]="A2_VISUALLY_INSPECTED_PENDING_INDEPENDENT_REVIEW"
    for c in ("11","13"):
        sid=f"9618_s21_qp_{c}"
        if v["id"]==f"{sid}-p16-whole-page":
            v["relates_to_ids"]=[f"{sid}-q7",f"{sid}-q8"]
            v["reviewer_status"]="A2_VISUALLY_INSPECTED_PENDING_INDEPENDENT_REVIEW"
visuals.extend(new_visuals); jwrite(BASE/"VISUAL_MANIFEST.json",vd)
pages=jlread(V2/"PAGE_INDEX.jsonl")
for p in pages:
    if p["source_id"] in {"9618_s21_ms_11","9618_s21_ms_13"} and p["pdf_page_1_based"]==10:
        p["visual_status"]="RENDERED_A2_INSPECTED_PENDING_REVIEW"
jlwrite(BASE/"PAGE_INDEX.jsonl",pages)

manifest.update(schema_version="1.1",artifact_version="B21-A2-v3",status="SUBMITTED_FOR_RETEST",
                generated_at=datetime.now(timezone.utc).isoformat(),supersedes="B21-A2-v2")
manifest["record_counts"].update(pages=len(pages),questions=len(questions),parts=len(parts),marking_items=len(marks),
    visual_regions=len(visuals),unresolved_parts=0,parent_context_only_unresolved_marking_items=sum(x.get("link_type")=="PARENT_CONTEXT_ONLY" for x in marks),
    question_level_marking_items=sum(x["question_id_or_null"] is not None for x in marks))
manifest["derived_renders_expected"]=sorted(x["rendered_asset_ref"] for x in visuals)
jwrite(BASE/"BATCH_MANIFEST.json",manifest)

(BASE/"UNRESOLVED.md").write_text("""# B21 unresolved register — A2 v3\n\nStatus: `SUBMITTED_FOR_RETEST`.\n\n## Parent context versus leaf criterion\n\nThirty-four `PARENT_CONTEXT_ONLY` marking records remain explicitly `UNRESOLVED`, with null mark/condition and table-row fields. They are parent MS context only, not leaf marking rows. Preserve this distinction during review.\n\n## Visual/table dependency limits\n\nThe two unlettered S21 Q8 prompts have question-level MS p10 evidence and whole-page visual dependencies. No table-row allocation is represented. Other page-level visual dependencies remain subject to A3/A4/A9 review; inventory counts alone do not establish adequacy.\n\n## Resolved in v3\n\nThe two S21 QP11/QP13 leaves formerly unmatched in v2 are source-backed Q7(b)(iii) and Q7(c) records with exact MS p9 labels. False Q8(c) rows were removed. This records source linkage only.\n""",encoding="utf-8")
(BASE/"EXTRACTION_QA.md").write_text("""# B21 extraction QA — A2 v3\n\nStatus: `SUBMITTED_FOR_RETEST`; A3 and A4 must independently retest this exact v3 set, followed by A9 batch review.\n\n- Frozen inputs: `versions/B21-A2-v1/` and `versions/B21-A2-v2/`; all 637 files in v2 were compared by path and SHA-256 before revision.\n- All 12 source hashes/page counts match Stage 0; all 154 pages remain indexed.\n- All 48 question starts remain. The 205-part hierarchy removes false Q8(c) records and restores Q7(b)(iii)/Q7(c) under Q7 in S21 QP11/13.\n- Both Q7 contexts span pp15–16; Q8 remains unlettered, starts p16, and carries its own displayed [3].\n- Each Q8 has one question-target MS p10 item with the printed condition and total. No table-row allocation is invented.\n- The 34 parent-context-only records remain unresolved; both former unmatched leaves are source-resolved.\n- The eight v2-added render statuses now say `RENDERED_PENDING_INDEPENDENT_REVIEW`; no rendered asset is marked render-required.\n\nOriginal PDFs/renders remain authoritative for layout, symbols, marks, and table structure.\n""",encoding="utf-8")
(BASE/"REVISION_NOTES.md").write_text("""# B21-A2-v3 revision notes\n\nStatus: `SUBMITTED_FOR_RETEST`. This active packet supersedes frozen `versions/B21-A2-v2/` and uses schema v1.1; v1/v2 snapshots remain unchanged. Source PDFs and Stage 0 hashes are unchanged.\n\n| Finding | Correction | Evidence / next gate |\n|---|---|---|\n| A3-B21-CTX-02/03; A4-B21-V2-01/03 | Removed false Q8(c); added Q7(b)(iii) [1] and Q7(c) [3] under Q7 for both S21 components. | Original QP p16 and exact MS p9 labels; A3/A4 retest. |\n| A4-B21-V2-02 | Added Q8 whole-question [3] and one question-target MS p10 record per component. | MS says “1 mark per correct row; total 3”; no row refs/allocation. |\n| A3-B21-VIS-01; A4-B21-V2-03 | Q7 context spans pp15–16; Q8 remains started p16; each QP p16 visual relates to Q7 and Q8. | Context indexes, original QP pages, visual manifest. |\n| A4-B21-V2-02/04 | Added full-page MS p10 renders; corrected stale statuses for eight prior render additions. | Original hash-verified MS files, rendered assets; independent review pending. |\n| Schema v1.1 | All active marking rows now use exactly one nullable target field and target-addressed IDs. | MARKING_INDEX; structural self-check. |\n| Existing unresolved semantics | Preserved 34 parent-context rows as UNRESOLVED with null marks/conditions/table rows; resolved two prior leaf gaps from source. | Original S21 MS p9; UNRESOLVED.md. |\n\nThe v2 snapshot was copied before editing; all 637 files matched by relative path and SHA-256. Source PDF hashes and page counts were rechecked. Q7 linkage locates printed source rows; it does not certify answers or scoring interpretation. Q8 remains a whole unlettered question, with no invented child or row allocation. A3/A4 same-v3 retests and A9 batch review remain required.\n""",encoding="utf-8")

# A2 self-check only; independent A3/A4 and A9 gates remain open.
qid={x["id"] for x in questions}; pid={x["id"] for x in parts}
assert len(pages)==154 and len(questions)==48 and len(parts)==205 and len(marks)==207 and len(visuals)==61 and len(contexts)==48
assert all(not x["parent_part_id_or_null"] or x["parent_part_id_or_null"] in pid for x in parts)
assert all((BASE/x["rendered_asset_ref"]).is_file() for x in visuals)
assert not any(x["reviewer_status"]=="RENDER_REQUIRED" for x in visuals)
assert sum(x.get("link_type")=="PARENT_CONTEXT_ONLY" for x in marks)==34
for c in ("11","13"):
    qp=f"9618_s21_qp_{c}"; q7=f"{qp}-q7"; q8=f"{qp}-q8"
    assert {f"{q7}-pb-piii",f"{q7}-pc"}<={x["id"] for x in parts}
    assert not any(x["id"]==f"{q8}-pc" for x in parts)
    assert {q7,q8}<=set(next(x for x in visuals if x["id"]==f"{qp}-p16-whole-page")["relates_to_ids"])
    assert next(x for x in contexts if x["question_id"]==q7)["all_context_pages"]==[15,16]
    assert next(x for x in contexts if x["question_id"]==q8)["all_context_pages"]==[16]
check={"schema_version":"1.1","artifact_version":"B21-A2-v3","status":"A2_SELF_CHECK_PASS_SUBMITTED_FOR_RETEST",
 "source_count":12,"source_pages":sum(x["page_count"] for x in source_details),
 "counts":{"pages":154,"questions":48,"parts":205,"marking_items":207,"visual_regions":61,"parent_context_only_unresolved":34,"unresolved_leaf_gaps":0,"question_level_marking_items":2},
 "checks":{"source_hashes_match_stage0":True,"all_parent_refs_resolve":True,"marking_targets_exactly_one_nullable_field":True,"all_render_assets_exist":True,"no_render_required_with_existing_asset":True,"q7_q8_p16_repaired":True,"a3_a4_retest_complete":False,"a9_batch_review_complete":False},"source_details":source_details}
jwrite(BASE/"V3_SELF_CHECK.json",check)

inputs=[S1/"CORPUS_SCHEMA.md",S1/"EXTRACTION_POLICY.md",S1/"WORK_ORDERS.md",
 S1.parent/"stage-0/evidence/a2/SOURCE_MANIFEST.json",S1.parent/"stage-0/SCOPE_AND_COVERAGE_PLAN.md",S1.parent/"stage-0/GATE_REVIEW.md",
 S1/"evidence/a3/B21/CONTEXT_SCOPE_RETEST_V2.md",S1/"evidence/a3/B21/HANDOFF_RETEST_V2.json",
 S1/"evidence/a4/B21/RETEST_V2.md",S1/"evidence/a4/B21/RETEST_FINDINGS_V2.json",S1/"evidence/a4/B21/RETEST_HANDOFF_V2.json",S1/"evidence/a4/B21/RECONCILIATION_ADDENDUM.md"]
core=["BATCH_MANIFEST.json","PAGE_INDEX.jsonl","QUESTION_INDEX.jsonl","MARKING_INDEX.jsonl","VISUAL_MANIFEST.json","CONTEXT_INDEX.jsonl","REVISION_NOTES.md","UNRESOLVED.md","EXTRACTION_QA.md","V3_SELF_CHECK.json"]
output_files=[BASE/n for n in core]
output_files += [BASE/f"contexts/9618_s21_qp_{c}-q7.json" for c in ("11","13")]
output_files += [BASE/f"renders/9618_s21_ms_{c}-p10.png" for c in ("11","13")]
output_files += [BASE/"revise_b21_v3.py"]
validation_path=BASE/"A0_VALIDATION_V3.json"
if validation_path.exists():
    validation=jread(validation_path)
    assert validation.get("pass") is True
    output_files.append(validation_path)
handoff={"schema_version":"1.1","task_id":"P1-S1-A2-B21-V3","artifact_version":"B21-A2-v3","author":"A2","status":"SUBMITTED_FOR_INDEPENDENT_A3_A4_RETEST","recommendation":"A2_SELF_CHECK_PASS_PENDING_A3_A4_AND_A9","supersedes":"B21-A2-v2",
 "frozen_inputs":{"v1_snapshot":"versions/B21-A2-v1/","v2_snapshot":"versions/B21-A2-v2/","v2_files_hash_compared":637,"v2_core_hashes":hashes([V2/n for n in ["BATCH_MANIFEST.json","PAGE_INDEX.jsonl","QUESTION_INDEX.jsonl","MARKING_INDEX.jsonl","VISUAL_MANIFEST.json","CONTEXT_INDEX.jsonl","REVISION_NOTES.md","UNRESOLVED.md"]]),"policy_and_review_input_hashes":hashes(inputs)},
 "source_details":source_details,"counts":check["counts"],"output_hashes":hashes(output_files),
 "a0_validation":{"path":"A0_VALIDATION_V3.json","pass":validation.get("pass") if validation_path.exists() else None,"sha256":sha(validation_path) if validation_path.exists() else None},
 "required_next_gates":["A3 same-version v3 retest","A4 same-version v3 retest","A9 independent batch review after alignment"],
 "limits":["A2 self-check is not independent review.","No answer correctness or scoring allocation is claimed.","No batch acceptance or lesson reuse is claimed."]}
jwrite(BASE/"HANDOFF_CHECK.json",handoff)
print(json.dumps({"artifact_version":"B21-A2-v3","counts":check["counts"],"source_count":12,"rendered_ms_p10":[x["rendered_asset_ref"] for x in new_visuals]},indent=2))
