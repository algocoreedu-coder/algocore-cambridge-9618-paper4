"""Build B23 source-location indices from the direct PDF extraction.

This intentionally records only locators, displayed marks and source structure.
It does not interpret mark schemes or create teaching content.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent
PROV = json.loads((OUT / "direct_extraction_provenance.json").read_text(encoding="utf-8"))

# Confirmed from direct page renders/transcripts: question-number start pages.
QSTART = {
 "9618_s23_qp_11": {1:2,2:4,3:8,4:10,5:12,6:13},
 "9618_s23_qp_12": {1:2,2:5,3:8,4:9,5:10,6:12,7:13},
 "9618_s23_qp_13": {1:2,2:3,3:5,4:7,5:10,6:11,7:12},
 "9618_w23_qp_11": {1:3,2:4,3:6,4:8,5:9,6:11,7:12,8:13},
 "9618_w23_qp_12": {1:2,2:4,3:6,4:7,5:8,6:9,7:10,8:13,9:14},
 "9618_w23_qp_13": {1:2,2:3,3:4,4:7,5:8,6:9,7:10,8:12,9:13},
}
RISK = re.compile(r"\b(table|truth|circuit|logic expression|diagram|formula|binary|hexadecimal|SQL|register transfer|instruction set|addressing|normalised|normalised|matrix|tick|line from|complete the)\b", re.I)
COMMAND = re.compile(r"\b(Explain|Describe|State|Identify|Complete|Calculate|Convert|Draw|Write|Give|Tick|Justify|Define)\b")
TOKEN = re.compile(r"(?m)^\s*\(([a-z]+|[ivxlcdm]+)\)\s+")

def page_text(src, n):
    return (OUT / f"transcripts/{src}-p{n:02d}.txt").read_text(encoding="utf-8")

def loc(source_id, page, **kw):
    d = {"source_id": source_id, "pdf_page_1_based": page, "printed_page_or_null": page if page > 1 else None}
    d.update(kw)
    return d

def clean_status(kind, text):
    if kind == "ms" and "Generic Marking Principles" not in text and "Question Answer Marks" in text:
        return "VISUAL_CHECK_REQUIRED" if RISK.search(text) else "EXTRACTED"
    return "VISUAL_CHECK_REQUIRED" if RISK.search(text) else "EXTRACTED"

def ms_page_for(ms_id, q, chain):
    needle = str(q) + "".join(f"({x})" for x in chain)
    src = next(x for x in PROV["sources"] if x["source_id"] == ms_id)
    for p in src["pages"]:
        txt = page_text(ms_id, p["pdf_page_1_based"])
        if needle in txt:
            return p["pdf_page_1_based"]
    return None

def main():
    page_rows, questions, markings, visuals = [], [], [], []
    page_by_source = {s["source_id"]: s for s in PROV["sources"]}
    for s in PROV["sources"]:
        sid = s["source_id"]
        kind = "qp" if "_qp_" in sid else "ms"
        for p in s["pages"]:
            n = p["pdf_page_1_based"]
            txt = page_text(sid,n)
            status = clean_status(kind, txt)
            visual_status = "RENDERED_VISUAL_CHECK_REQUIRED" if status == "VISUAL_CHECK_REQUIRED" else "RENDERED_NO_RISK_TRIGGER"
            page_rows.append({"source_id":sid,"pdf_page_1_based":n,"printed_page_or_null":n if n>1 else None,
                              "extraction_status":"EXTRACTED","visual_status":visual_status,"transcript_ref":p["transcript_ref"]})
            if status == "VISUAL_CHECK_REQUIRED":
                vid=f"{sid}-p{n:02d}-vr1"
                visuals.append({"id":vid,"source_id":sid,"pdf_page_1_based":n,"page_ref":loc(sid,n),
                                "kind":"page-level-layout-or-structure-risk","relates_to_ids":[],
                                "extraction_risk":"keyword-screened; rendered; requires reviewer visual confirmation",
                                "rendered_asset_ref":p["rendered_asset_ref"],"reviewer_status":"SELF_VISUAL_INSPECTION_PENDING"})
    for qp, starts in QSTART.items():
        base = page_by_source[qp]
        session = "s" if "_s23_" in qp else "w"
        component = qp[-2:]
        ms=qp.replace("_qp_","_ms_")
        ordered=list(starts.items())
        for ix,(q,start) in enumerate(ordered):
            end=(ordered[ix+1][1]-1) if ix+1<len(ordered) else base["page_count_direct"]
            # End at the last non-blank question page, avoiding copyright blank page references.
            while end>start and "BLANK PAGE" in page_text(qp,end): end-=1
            qid=f"{qp}-q{q}"
            qtext=page_text(qp,start)
            cmd=COMMAND.search(qtext)
            questions.append({"id":qid,"source_qp_id":qp,"year":2023,"session":session,"component":component,
                              "question_number":str(q),"parent_id_or_null":None,"marks_displayed_or_null":None,
                              "command_word_verbatim_or_null":cmd.group(1) if cmd else None,
                              "qp_locator":loc(qp,start,question=str(q)),"prompt_transcript_ref":f"transcripts/{qp}-p{start:02d}.txt",
                              "context_ref_or_null":None,"status":"EXTRACTED"})
            # Part extraction is source-navigation evidence. Consecutive labels are
            # disambiguated by their outer-part ancestry and page of first occurrence.
            outer=None; romans={"i","ii","iii","iv","v","vi","vii","viii","ix","x"}
            seen=set()
            for p in range(start,end+1):
                txt=page_text(qp,p)
                matches=list(TOKEN.finditer(txt))
                for j,m in enumerate(matches):
                    label=m.group(1)
                    seg=txt[m.start():matches[j+1].start() if j+1<len(matches) else len(txt)]
                    is_roman=label in romans
                    parent=outer if is_roman else None
                    chain=(outer+[label]) if is_roman and outer else [label]
                    pid=qid+"".join(f"-p{x}" for x in chain)
                    # A continuing part on a later page is already represented.
                    if pid in seen: continue
                    seen.add(pid)
                    if not is_roman: outer=[label]
                    marks=re.findall(r"\[(\d+)\]",seg)
                    displayed=int(marks[-1]) if marks else None
                    command=COMMAND.search(seg)
                    mp=ms_page_for(ms,q,chain)
                    status="MS_LINKED" if mp else "UNRESOLVED"
                    part={"id":pid,"question_id":qid,"parent_part_id_or_null":qid+"".join(f"-p{x}" for x in parent) if parent else None,
                          "label":label,"marks_displayed_or_null":displayed,"qp_locator":loc(qp,p,question=str(q),part="".join(f"({x})" for x in chain)),
                          "prompt_transcript_ref":f"transcripts/{qp}-p{p:02d}.txt",
                          "ms_locator_or_null":loc(ms,mp,question=str(q),part="".join(f"({x})" for x in chain)) if mp else None,
                          "dependency_refs":[qid],"context_required":True,
                          "status":status,"command_word_verbatim_or_null":command.group(1) if command else None}
                    questions.append(part)
                    if mp:
                        markings.append({"id":pid+"-mi-01","part_id":pid,"ms_locator":loc(ms,mp,question=str(q),part="".join(f"({x})" for x in chain)),
                                         "transcript_ref":f"transcripts/{ms}-p{mp:02d}.txt","mark_or_condition_or_null":None,
                                         "table_row_ref_or_null":None,"visual_dependency_refs":[],"status":"MS_LINKED"})
    # Whole-page evidence remains deliberately broad where a stable bbox is
    # impractical.  Link it to every indexed source item on that page, without
    # claiming that plain-text extraction represents the visual geometry.
    for v in visuals:
        sid, page = v["source_id"], v["pdf_page_1_based"]
        linked=[]
        for r in questions:
            qloc=r.get("qp_locator", {})
            mloc=r.get("ms_locator_or_null") or {}
            if (qloc.get("source_id")==sid and qloc.get("pdf_page_1_based")==page) or (mloc.get("source_id")==sid and mloc.get("pdf_page_1_based")==page):
                linked.append(r["id"])
        for r in markings:
            mloc=r["ms_locator"]
            if mloc.get("source_id")==sid and mloc.get("pdf_page_1_based")==page:
                linked.append(r["id"])
                r["visual_dependency_refs"].append(v["id"])
        v["relates_to_ids"]=sorted(set(linked))
        v["reviewer_status"]="SELF_VISUALLY_INSPECTED_PENDING_INDEPENDENT_REVIEW"
    (OUT/"PAGE_INDEX.jsonl").write_text("".join(json.dumps(x,ensure_ascii=False)+"\n" for x in page_rows),encoding="utf-8")
    (OUT/"QUESTION_INDEX.jsonl").write_text("".join(json.dumps(x,ensure_ascii=False)+"\n" for x in questions),encoding="utf-8")
    (OUT/"MARKING_INDEX.jsonl").write_text("".join(json.dumps(x,ensure_ascii=False)+"\n" for x in markings),encoding="utf-8")
    (OUT/"VISUAL_MANIFEST.json").write_text(json.dumps(visuals,ensure_ascii=False,indent=2),encoding="utf-8")
    print(json.dumps({"pages":len(page_rows),"records":len(questions),"marking":len(markings),"visual":len(visuals)},indent=2))

if __name__ == "__main__": main()
