"""Internal Stage 1 extraction evidence generator for batch B21.

This script only reads the exact source records named in the Stage 0 manifest
and writes derived transcripts/indexes under its own B21 evidence directory.
It deliberately leaves mark-scheme links unresolved where the page text cannot
establish a one-to-one question/part mapping.
"""
from __future__ import annotations

import hashlib
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

BASE = Path(__file__).resolve().parent
ROOT = BASE.parents[6]
sys.path.insert(0, str(BASE / "vendor"))
from pypdf import PdfReader

manifest_path = ROOT / "A_Level_CS_page/planning/paper1/stage-0/evidence/a2/SOURCE_MANIFEST.json"
source_manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
sources = [x for x in source_manifest["primary_sources"] if re.fullmatch(r"9618_(?:s21|w21)_(?:qp|ms)_(?:11|12|13)", x.get("id", ""))]
sources.sort(key=lambda x: x["id"])
(BASE / "transcripts").mkdir(exist_ok=True)
(BASE / "renders").mkdir(exist_ok=True)

def sha256(p: Path) -> str:
    h=hashlib.sha256()
    with p.open("rb") as f:
        for c in iter(lambda:f.read(1024*1024), b""): h.update(c)
    return h.hexdigest()

def loc(sid, page, q=None, part=None):
    x={"source_id":sid,"pdf_page_1_based":page}
    if q is not None: x["question"]=str(q)
    if part is not None: x["part"]=str(part)
    return x

pages=[]; questions=[]; parts=[]; marking=[]; visuals=[]; source_entries=[]
question_hits={}
for s in sources:
    p=ROOT/s["path"]
    actual=sha256(p)
    if actual != s["sha256"]: raise RuntimeError(f"hash mismatch: {s['id']}")
    reader=PdfReader(str(p)); sid=s["id"]
    all_text=[]
    for n,page in enumerate(reader.pages,1):
        text=page.extract_text() or ""
        (BASE/"transcripts"/f"{sid}-p{n}.txt").write_text(text, encoding="utf-8")
        transcript=f"transcripts/{sid}-p{n}.txt"
        # Text structure is not proof for rendered layout.  Heuristics only flag risk.
        risk=bool(re.search(r"\b(table|diagram|circuit|logic|truth|Fig\.?|complete the|grid|chart)\b|[¬≤≥→]", text, re.I))
        pages.append({"source_id":sid,"pdf_page_1_based":n,"printed_page_or_null":None,
                      "extraction_status":"EXTRACTED","visual_status":"RENDERED_A2_INSPECTED_PENDING_REVIEW" if risk else "TEXT_ONLY_PENDING_REVIEW",
                      "transcript_ref_or_null":transcript})
        if risk:
            vid=f"{sid}-p{n}-whole-page"
            visuals.append({"id":vid,"source_id":sid,"pdf_page_1_based":n,"page_ref":loc(sid,n),
                            "kind":"whole_page_risk_inventory","relates_to_ids":[],"extraction_risk":"layout_or_nontext_structure_possible",
                            "rendered_asset_ref":f"renders/{sid}-p{n}.png","reviewer_status":"A2_VISUALLY_INSPECTED_PENDING_A3_A4_A9"})
        all_text.append((n,text))
    source_entries.append({"source_id":sid,"sha256":actual,"relative_path":s["path"],"kind":s["kind"],"year":s["year"],"session":"s" if "_s21_" in sid else "w","component":s["component"],"page_count":len(reader.pages),"hash_matches_stage0":True})
    if s["kind"]=="qp":
        # Cambridge Paper 1 questions begin at left line position in extracted text.
        # Question spans/part labels are evidence candidates, not mark-scheme mapping.
        found={}
        for n,text in all_text:
            for m in re.finditer(r"(?m)^\s*(\d{1,2})\s+(?=[A-Z])", text):
                q=int(m.group(1));
                if 1 <= q <= 20: found.setdefault(q,n)
        # A fallback recognises e.g. `1 (a)` in PDFs with broken line layout.
        for n,text in all_text:
            for m in re.finditer(r"(?m)^\s*(\d{1,2})\s*\([a-z]\)", text):
                q=int(m.group(1));
                if 1 <= q <= 20: found.setdefault(q,n)
        question_hits[sid]=found
        for q,n in sorted(found.items()):
            qid=f"{sid}-q{q}"
            qtext=(BASE/"transcripts"/f"{sid}-p{n}.txt").read_text(encoding="utf-8")
            cmd=None
            qm=re.search(rf"(?m)^\s*{q}\s+(.{{0,220}})",qtext)
            if qm:
                cm=re.search(r"\b(Describe|Explain|State|Identify|Give|Calculate|Complete|Draw|Suggest|Determine|Use|Compare|Outline|Name)\b",qm.group(1),re.I)
                cmd=cm.group(1) if cm else None
            questions.append({"id":qid,"source_qp_id":sid,"year":2021,"session":"s" if "_s21_" in sid else "w","component":s["component"],"question_number":str(q),"parent_id_or_null":None,"marks_displayed_or_null":None,"command_word_verbatim_or_null":cmd,"qp_locator":loc(sid,n,q),"prompt_transcript_ref":f"transcripts/{sid}-p{n}.txt","context_ref_or_null":None,"status":"EXTRACTED"})
            # Do not guess subpart marks. Extract visible lower-case labels on the first candidate page.
            labels=[]
            for lm in re.finditer(r"(?m)^\s*\(([a-z])\)\s+",qtext): labels.append(lm.group(1))
            for label in dict.fromkeys(labels):
                pid=f"{qid}-p{label}"
                parts.append({"id":pid,"question_id":qid,"parent_part_id_or_null":None,"label":label,"marks_displayed_or_null":None,"qp_locator":loc(sid,n,q,label),"prompt_transcript_ref":f"transcripts/{sid}-p{n}.txt","ms_locator_or_null":None,"dependency_refs":[qid],"context_required":True,"status":"UNRESOLVED"})

# Link only an exact printed `question(part)` label from QP to a page containing
# that same label in the paired MS. This preserves a locator without allocating
# individual marks or interpreting alternatives/conditions.
for s in sources:
    if s["kind"] != "ms": continue
    sid=s["id"]
    qp_sid=sid.replace("_ms_", "_qp_")
    ms_pages=[x for x in pages if x["source_id"]==sid]
    for part in [x for x in parts if x["question_id"].startswith(qp_sid+"-")]:
        q=part["question_id"].rsplit("-q",1)[1]
        label=part["label"]
        hit=None
        for pg in ms_pages:
            tx=(BASE/pg["transcript_ref_or_null"]).read_text(encoding="utf-8")
            if re.search(rf"(?:Question\s*)?{re.escape(q)}\s*\({re.escape(label)}\)",tx,re.I):
                hit=pg; break
        if hit:
            part["ms_locator_or_null"]=loc(sid,hit["pdf_page_1_based"],q,label)
            part["status"]="MS_LINKED"
            marking.append({"id":f"{sid}-{q}-{label}-label-link","part_id":part["id"],"ms_locator":loc(sid,hit["pdf_page_1_based"],q,label),"transcript_ref":hit["transcript_ref_or_null"],"mark_or_condition_or_null":None,"table_row_ref_or_null":None,"visual_dependency_refs":[],"status":"MS_LINKED"})

for v in visuals:
    # Add question candidates on the same source/page without asserting relation to a particular non-text object.
    v["relates_to_ids"]=[q["id"] for q in questions if q["source_qp_id"]==v["source_id"] and q["qp_locator"]["pdf_page_1_based"]==v["pdf_page_1_based"]]

def write_jsonl(name, objs):
    (BASE/name).write_text("".join(json.dumps(o,ensure_ascii=False)+"\n" for o in objs),encoding="utf-8")
write_jsonl("PAGE_INDEX.jsonl",pages)
write_jsonl("QUESTION_INDEX.jsonl",questions+parts)
write_jsonl("MARKING_INDEX.jsonl",marking)
(BASE/"VISUAL_MANIFEST.json").write_text(json.dumps({"schema_version":"1.0","regions":visuals},indent=2),encoding="utf-8")
derived=[str(p.relative_to(BASE)).replace("\\","/") for p in sorted((BASE/"transcripts").glob("*.txt"))]
batch={"schema_version":"1.0","artifact_version":"0.1.0","task_id":"P1-S1-A2-B21","author":"A2","status":"SUBMITTED","generated_at":datetime.now(timezone.utc).isoformat(),"sources":source_entries,"record_counts":{"pages":len(pages),"questions":len(questions),"parts":len(parts),"marking_items":len(marking),"visual_regions":len(visuals)},"derived_transcripts":derived,"derived_renders_expected":[v["rendered_asset_ref"] for v in visuals],"notes":["Renders listed in VISUAL_MANIFEST are required before A2 handoff; this initial generator does not claim visual verification.","MS records intentionally stay UNRESOLVED until a reviewer can match the mark-scheme table/conditions to QP parts."]}
(BASE/"BATCH_MANIFEST.json").write_text(json.dumps(batch,indent=2),encoding="utf-8")
print(json.dumps(batch["record_counts"],indent=2))
