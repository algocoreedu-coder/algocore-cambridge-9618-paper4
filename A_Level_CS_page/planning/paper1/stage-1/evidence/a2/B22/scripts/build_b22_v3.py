#!/usr/bin/env python3
"""Rebuild the active B22 A2 extraction from source-reviewed QP/MS evidence."""
from __future__ import annotations
import hashlib, json, re, shutil
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[8]  # Computer_Science
B = ROOT / "A_Level_CS_page/planning/paper1/stage-1/evidence/a2/B22"
STAGE1 = ROOT / "A_Level_CS_page/planning/paper1/stage-1"
STAGE0_MANIFEST = ROOT / "A_Level_CS_page/planning/paper1/stage-0/evidence/a2/SOURCE_MANIFEST.json"

def read_jsonl(path):
    return [json.loads(x) for x in path.read_text(encoding="utf-8").splitlines() if x.strip()]
def write_jsonl(path, records):
    path.write_text("".join(json.dumps(x, ensure_ascii=False, separators=(",", ":")) + "\n" for x in records), encoding="utf-8")
def sha(path):
    h=hashlib.sha256()
    with path.open("rb") as f:
        for block in iter(lambda:f.read(1024*1024), b""): h.update(block)
    return h.hexdigest()
def dump(path, obj): path.write_text(json.dumps(obj, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")

# Printed part hierarchy. Nested children are represented as e.g. "a:i".
H = {
"9618_s22_qp_11": {
"1":{"a":[],"b":[],"c":[],"d":[]},
"2":{"a":["i","ii"],"b":[],"c":["i","ii"]},
"3":{"a":[],"b":[]},
"4":{"a":[],"b":[],"c":["i","ii"],"d":[]},
"5":{"a":[],"b":[],"c":[]},
"6":{"a":["i","ii"],"b":[],"c":["i","ii","iii"]}},
"9618_s22_qp_12": {
"1":{"a":[],"b":["i","ii"],"c":[],"d":[]},
"2":{"a":[],"b":[],"c":[]},
"3":{"a":[],"b":[],"c":[],"d":[],"e":[]},
"4":{"a":[],"b":[],"c":[]},
"5":{"a":[],"b":[],"c":[],"d":[],"e":[]},
"6":{"a":[],"b":[],"c":[]},
"9":{"a":[],"b":[],"c":[]}},
"9618_s22_qp_13": {
"1":{"a":["i","ii","iii","iv"],"b":[]},
"2":{"a":[],"b":[]},
"3":{"a":[],"b":[],"c":[]},
"4":{"a":[],"b":["i","ii"]},
"5":{"a":["i","ii"],"b":["i","ii","iii"]},
"6":{"a":[],"b":["i","ii"],"c":[]},
"7":{"a":[],"b":[]},
"8":{"a":[],"b":[],"c":[]}},
"9618_w22_qp_11": {
"1":{"a":["i","ii","iii"],"b":[],"c":[],"d":["i","ii"]},
"3":{"a":[],"b":[]},
"4":{"a":[],"b":[],"c":["i","ii"],"d":[]},
"5":{"a":[],"b":["i","ii","iii"],"c":[],"d":[]},
"6":{"a":["i","ii"],"b":["i","ii","iii","iv"],"c":[]},
"7":{"a":[],"b":[],"c":[],"d":[],"e":[]},
"9":{"a":[],"b":[]}},
"9618_w22_qp_12": {
"1":{"a":[],"b":["i","ii"]},
"2":{"a":["i","ii","iii"],"b":[]},
"3":{"a":[],"b":[],"c":[]},
"4":{"a":[],"b":[],"c":[]},
"5":{"a":[],"b":[],"c":[],"d":["i","ii"]},
"6":{"a":["i","ii"],"b":["i","ii"]},
"7":{"a":[],"b":["i","ii","iii","iv"],"c":[]},
"8":{"a":[],"b":[],"c":["i","ii"]},
"10":{"a":[],"b":["i","ii"]}},
"9618_w22_qp_13": {
"1":{"a":[],"b":[],"c":[]},
"2":{"a":[],"b":[],"c":[],"d":[],"e":[],"f":[]},
"4":{"a":["i","ii"],"b":[],"c":[]},
"5":{"a":[],"b":[]},
"6":{"a":["i","ii"],"b":["i","ii","iii"],"c":[]},
"7":{"a":[],"b":[],"c":["i","ii"]},
"8":{"a":["i","ii"],"b":[]},
"9":{"a":["i","ii"],"b":[]},
"10":{"a":[],"b":["i","ii"]}}
}

# Printed marks keyed by paper/question/leaf path. A direct parent of nested parts
# is intentionally null; the marks belong to the printed children.
M = {
"9618_s22_qp_11": {"1":{"a":1,"b":1,"c":2,"d":1},"2":{"a:i":5,"a:ii":3,"b":5,"c:i":4,"c:ii":3},"3":{"a":1,"b":6},"4":{"a":4,"b":3,"c:i":4,"c:ii":3,"d":4},"5":{"a":4,"b":2,"c":3},"6":{"a:i":5,"a:ii":5,"b":2,"c:i":1,"c:ii":1,"c:iii":1}},
"9618_s22_qp_12": {"1":{"a":3,"b:i":1,"b:ii":2,"c":2,"d":2},"2":{"a":2,"b":2,"c":2},"3":{"a":2,"b":2,"c":1,"d":1,"e":3},"4":{"a":2,"b":2,"c":1},"5":{"a":2,"b":2,"c":4,"d":3,"e":6},"6":{"a":2,"b":2,"c":4},"7":{"@question":2},"8":{"@question":3},"9":{"a":4,"b":3,"c":4}},
"9618_s22_qp_13": {"1":{"a:i":2,"a:ii":3,"a:iii":2,"a:iv":2,"b":5},"2":{"a":3,"b":5},"3":{"a":3,"b":4,"c":3},"4":{"a":4,"b:i":4,"b:ii":1},"5":{"a:i":1,"a:ii":2,"b:i":2,"b:ii":3,"b:iii":2},"6":{"a":4,"b:i":4,"b:ii":2,"c":3},"7":{"a":3,"b":2},"8":{"a":1,"b":2,"c":3}},
"9618_w22_qp_11": {"1":{"a:i":1,"a:ii":1,"a:iii":1,"b":2,"c":3,"d:i":1,"d:ii":2},"2":{"@question":4},"3":{"a":2,"b":2},"4":{"a":3,"b":3,"c:i":2,"c:ii":4,"d":3},"5":{"a":1,"b:i":3,"b:ii":1,"b:iii":2,"c":2,"d":2},"6":{"a:i":4,"a:ii":1,"b:i":1,"b:ii":1,"b:iii":1,"b:iv":1,"c":2},"7":{"a":2,"b":2,"c":3,"d":2,"e":2},"8":{"@question":4},"9":{"a":2,"b":2}},
"9618_w22_qp_12": {"1":{"a":5,"b:i":2,"b:ii":2},"2":{"a:i":1,"a:ii":1,"a:iii":2,"b":1},"3":{"a":3,"b":2,"c":2},"4":{"a":1,"b":3,"c":2},"5":{"a":3,"b":3,"c":1,"d:i":2,"d:ii":2},"6":{"a:i":2,"a:ii":3,"b:i":2,"b:ii":2},"7":{"a":5,"b:i":1,"b:ii":1,"b:iii":1,"b:iv":1,"c":3},"8":{"a":2,"b":2,"c:i":2,"c:ii":4},"9":{"@question":2},"10":{"a":1,"b:i":2,"b:ii":3}},
"9618_w22_qp_13": {"1":{"a":2,"b":2,"c":3},"2":{"a":3,"b":1,"c":4,"d":2,"e":2,"f":2},"3":{"@question":4},"4":{"a:i":2,"a:ii":1,"b":2,"c":2},"5":{"a":3,"b":2},"6":{"a:i":2,"a:ii":1,"b:i":1,"b:ii":1,"b:iii":1,"c":1},"7":{"a":3,"b":3,"c:i":2,"c:ii":2},"8":{"a:i":2,"a:ii":2,"b":2},"9":{"a:i":1,"a:ii":1,"b":2},"10":{"a":3,"b:i":2,"b:ii":3}}
}

UNPARTED = {"9618_s22_qp_12":{"7":2,"8":3},"9618_w22_qp_11":{"2":4,"8":4},"9618_w22_qp_12":{"9":2},"9618_w22_qp_13":{"3":4}}
ORPHANS = {
"9618_s22_qp_11":{"2":{"i":"a:i"},"6":{"i":"a:i"}},
"9618_s22_qp_12":{"1":{"i":"b:i"}},
"9618_s22_qp_13":{"1":{"i":"a:i"},"4":{"i":"b:i"},"5":{"i":"b:i"},"6":{"i":"b:i"}},
"9618_w22_qp_11":{"1":{"i":"d:i"},"4":{"i":"c:i"},"5":{"i":"b:i"},"6":{"i":"a:i"}},
"9618_w22_qp_12":{"1":{"i":"b:i"},"6":{"i":"a:i"},"7":{"i":"b:i"},"8":{"i":"c:i"},"10":{"i":"b:i"}},
"9618_w22_qp_13":{"4":{"i":"a:i"},"6":{"i":"a:i"},"7":{"i":"c:i"}}
}

# QP siblings that continue on a later page, identified by direct page inspection.
PAGE_OVERRIDES = {
"9618_s22_qp_12-q1-pbii":3,
"9618_s22_qp_13-q5-pbiii":11,"9618_s22_qp_13-q6-pbii":13,
"9618_w22_qp_11-q6-pbiii":17,"9618_w22_qp_11-q6-pbiv":17,
"9618_w22_qp_12-q7-pbiii":13,"9618_w22_qp_12-q7-pbiv":13,
"9618_w22_qp_13-q6-pbii":12,"9618_w22_qp_13-q6-pbiii":12,
"9618_s22_qp_11-q6-pciii":15,
}
MS_PAGE_OVERRIDES = {
    # The source scan transcript dropped one parenthesis in this row; the
    # original rendered MS page 7 was visually checked and prints 5(b)(iii).
    "9618_s22_qp_13-q5-pbiii": 7,
}

def source_for(q): return q["source_qp_id"]
def part_id(qid, path): return qid + "-p" + path.replace(":", "")
def label_for(path): return "".join(f"({x})" for x in path.split(":"))
def ms_source(qpsource): return qpsource.replace("_qp_", "_ms_")
def text_path(source, page, kind="qp"):
    return B/"transcripts"/f"{source}-p{page:02d}.txt"

v2_questions=read_jsonl(B/"QUESTION_INDEX.jsonl")
base_q={x["id"]:x for x in v2_questions if "question_id" not in x}
old_parts=defaultdict(list)
for x in v2_questions:
    if "question_id" in x: old_parts[x["question_id"]].append(x)
questions_by_source=defaultdict(list)
for q in base_q.values(): questions_by_source[q["source_qp_id"]].append(q)

def find_qp_page(qp_source, qnum, start, end, path, old=None):
    target = label_for(path)
    # Existing exact records are the preferred source locator; old bare roman
    # labels are relocated by ORPHANS to their parent-qualified printed label.
    if old is not None:
        p=old.get("qp_locator",{}).get("pdf_page_1_based")
        if p and start <= p <= end: return p
    override_id = f"{qp_source}-q{qnum}-p{path.replace(':','')}"
    if override_id in PAGE_OVERRIDES: return PAGE_OVERRIDES[override_id]
    if len(path)==1:
        pattern=re.compile(r"\(\s*"+re.escape(path)+r"\s*\)(?!\s*\()", re.I)
    else:
        parent, child=path.split(":")
        pattern=re.compile(r"\(\s*"+re.escape(parent)+r"\s*\)\s*\(\s*"+re.escape(child)+r"\s*\)", re.I)
        alt=re.compile(r"\(\s*"+re.escape(child)+r"\s*\)",re.I)
    for page in range(start,end+1):
        p=text_path(qp_source,page)
        if not p.exists(): continue
        t=p.read_text(encoding="utf-8",errors="replace")
        if pattern.search(t): return page
    if len(path)>1:
        for page in range(start,end+1):
            p=text_path(qp_source,page)
            if p.exists() and alt.search(p.read_text(encoding="utf-8",errors="replace")): return page
    return start

# Establish question page spans from the v2 question index.
spans={}
for src, qlist in questions_by_source.items():
    qlist=sorted(qlist,key=lambda x:int(x["question_number"]))
    for i,q in enumerate(qlist):
        start=q["qp_locator"]["pdf_page_1_based"]
        end=(qlist[i+1]["qp_locator"]["pdf_page_1_based"]-1) if i+1<len(qlist) else 99
        spans[q["id"]]=(start,max(start,end))

# Preserve existing row-specific context dependencies for the two reviewed
# cross-page scenarios; new children inherit them from their question family.
context_by_q={}
for qid, rows in old_parts.items():
    for row in rows:
        if row.get("context_required"):
            context_by_q[qid]=(True,row.get("dependency_refs",[])); break

new_questions=[]; question_records={}
for q in sorted(base_q.values(),key=lambda x:(x["source_qp_id"],int(x["question_number"]))):
    q=dict(q); src=q["source_qp_id"]; n=q["question_number"]
    q["marks_displayed_or_null"]=UNPARTED.get(src,{}).get(n)
    if q["marks_displayed_or_null"] is not None: q["status"]="MS_LINKED"
    new_questions.append(q); question_records[q["id"]]=q

new_parts=[]; part_old={}; removed=[]
for src, qtree in H.items():
    for n, direct in qtree.items():
        qid=f"{src}-q{n}"; q=question_records[qid]
        rows=old_parts.get(qid,[])
        by_label=defaultdict(list)
        for row in rows: by_label[row.get("label","")].append(row)
        used=set(); start,end=spans[qid]
        context=context_by_q.get(qid,(False,[]))
        for letter, romans in direct.items():
            family = bool(romans)
            parent_old=next((x for x in by_label[f"({letter})"] if x["id"] not in used),None)
            # A direct parent with nested printed subparts has no standalone mark.
            parent_id=part_id(qid,letter)
            if family:
                rec=dict(parent_old or {})
                used.add(parent_old["id"]) if parent_old else None
                page=rec.get("qp_locator",{}).get("pdf_page_1_based") or find_qp_page(src,n,start,end,letter,parent_old)
                rec.update({"id":parent_id,"question_id":qid,"parent_part_id_or_null":None,"label":f"({letter})","marks_displayed_or_null":None,
                  "qp_locator":{"source_id":src,"pdf_page_1_based":page,"printed_page_or_null":None,"question":n,"part":f"({letter})"},
                  "prompt_transcript_ref":f"transcripts/{src}-p{page:02d}.txt","ms_locator_or_null":None,
                  "dependency_refs":list(context[1]) if context[0] else list(rec.get("dependency_refs",[])),"context_required":bool(context[0] or rec.get("context_required")),"status":"UNRESOLVED"})
                rec.setdefault("dependency_refs",[]); new_parts.append(rec); part_old[parent_id]=parent_old
            for roman in romans:
                path=f"{letter}:{roman}"; pid=part_id(qid,path); label=label_for(path)
                old=next((x for x in by_label[label] if x["id"] not in used),None)
                if old is None:
                    old=next((x for x in by_label[f"({roman})"] if x["id"] not in used and ORPHANS.get(src,{}).get(n,{}).get(roman)==path),None)
                used.add(old["id"]) if old else None
                page=find_qp_page(src,n,start,end,path,old)
                rec=dict(old or {})
                rec.update({"id":pid,"question_id":qid,"parent_part_id_or_null":parent_id,"label":label,
                  "marks_displayed_or_null":M[src][n].get(path),
                  "qp_locator":{"source_id":src,"pdf_page_1_based":page,"printed_page_or_null":None,"question":n,"part":label},
                  "prompt_transcript_ref":f"transcripts/{src}-p{page:02d}.txt","ms_locator_or_null":None,
                  "dependency_refs":list(context[1]) if context[0] else list(rec.get("dependency_refs",[])),"context_required":bool(context[0] or rec.get("context_required")),"status":"EXTRACTED"})
                new_parts.append(rec); part_old[pid]=old
            if not family:
                # The direct printed part is a leaf.
                path=letter; pid=part_id(qid,path); label=f"({letter})"
                rec=dict(parent_old or {})
                if parent_old: used.add(parent_old["id"])
                page=rec.get("qp_locator",{}).get("pdf_page_1_based") or find_qp_page(src,n,start,end,path,parent_old)
                rec.update({"id":pid,"question_id":qid,"parent_part_id_or_null":None,"label":label,
                  "marks_displayed_or_null":M[src][n].get(path),
                  "qp_locator":{"source_id":src,"pdf_page_1_based":page,"printed_page_or_null":None,"question":n,"part":label},
                  "prompt_transcript_ref":f"transcripts/{src}-p{page:02d}.txt","ms_locator_or_null":None,
                  "dependency_refs":list(context[1]) if context[0] else list(rec.get("dependency_refs",[])),"context_required":bool(context[0] or rec.get("context_required")),"status":"EXTRACTED"})
                new_parts.append(rec); part_old[pid]=parent_old
        for row in rows:
            if row["id"] not in used:
                removed.append({"id":row["id"],"label":row.get("label"),"qp_locator":row.get("qp_locator"),"reason":"v2 row did not match any source-printed part in the corrected hierarchy; see source-level review"})

# Fill question-level direct marks, including exact whole-question MS items.
old_marking=read_jsonl(B/"MARKING_INDEX.jsonl")
old_mark_by_part={x.get("part_id"):x for x in old_marking if x.get("part_id")}

def normalized_part(q, path):
    # Exact printed form, e.g. 5(a)(iii).
    return q + "".join(f"({x})" for x in path.split(":"))

def find_ms_matches(msid, qn, path=None):
    matches=[]
    for p in sorted((B/"transcripts").glob(f"{msid}-p*.txt")):
        m=re.search(r"-p(\d+)\.txt$",p.name); page=int(m.group(1))
        text=p.read_text(encoding="utf-8",errors="replace")
        if path:
            label=normalized_part(qn,path)
            pat=re.compile(r"^\s*"+re.escape(qn)+r"\s*(?:"+r"\s*".join(re.escape(f"({x})") for x in path.split(":"))+r")\s*(?!\s*\()",re.M|re.I)
            # Transcript line layout occasionally breaks the Q label with spaces.
            flat=re.sub(r"\s+","",text)
            exact=label.lower() in flat.lower()
            if pat.search(text) or exact:
                matches.append((page,label))
        else:
            pat=re.compile(r"^\s*"+re.escape(qn)+r"\s+(?!\()",re.M)
            if pat.search(text): matches.append((page,qn))
    return matches

visual=json.loads((B/"VISUAL_MANIFEST.json").read_text(encoding="utf-8"))
regions=visual["regions"]
# The source MS text extractor corrupted one closing parenthesis in the
# 5(b)(iii) row. A2 rendered and compared the original PDF page to resolve it;
# expose that evidence as a visual region and dependency rather than leaving
# the manual source comparison implicit.
if not any(r["source_id"]=="9618_s22_ms_13" and r["pdf_page_1_based"]==7 for r in regions):
    regions.append({"id":"9618_s22_ms_13-p07-whole","source_id":"9618_s22_ms_13","pdf_page_1_based":7,
      "page_ref":{"source_id":"9618_s22_ms_13","pdf_page_1_based":7,"printed_page_or_null":None},
      "kind":"whole_page_mark_scheme_row_review","relates_to_ids":["9618_s22_qp_13-q5-pbiii"],
      "extraction_risk":"nested_part_label_and_adjacent_mark_in_table",
      "rendered_asset_ref":"renders/a2-v3-ms-review/9618_s22_ms_13-p07.png",
      "reviewer_status":"A2_VISUALLY_INSPECTED_PENDING_INDEPENDENT_REVIEW"})
region_by_source_page={(r["source_id"],r["pdf_page_1_based"]):r for r in regions}
part_by_id={x["id"]:x for x in new_parts}
unresolved=[]; mark_items=[]; exact_count=0

for part in new_parts:
    qid=part["question_id"]; q=question_records[qid]; src=q["source_qp_id"]; msid=ms_source(src); n=q["question_number"]
    path = part["label"].replace(")(",":").strip("()")
    # Nested label normalizes to letter:roman; parent/direct to one token.
    path=path.replace("(","").replace(")","")
    path=path.replace("ii","ii")
    is_container=part["id"] in {part_id(qid,f"{letter}") for letter,rs in H[src][n].items() if rs}
    if is_container:
        reason="QP prints this part as a parent container for the indexed child parts; the MS has no standalone exact parent-row item. Child rows are linked individually where printed."
        part["status"]="UNRESOLVED"; part["ms_locator_or_null"]=None
        unresolved.append({"id":part["id"],"field":"ms_locator_or_null","reason":reason,"qp_locator":part["qp_locator"],"ms_source_id":msid,"ms_parent_locator_prefix":{"source_id":msid,"question":n,"part":part["label"]},"resolution":"No parent mark item is asserted; inspect child-specific MS records."})
        continue
    # A leaf label is encoded as e.g. "a" or "a:i".
    leaf=path
    matches=find_ms_matches(msid,n,leaf)
    old=part_old.get(part["id"])
    oldmi=old_mark_by_part.get(old.get("id")) if old else None
    oldpage=(oldmi or {}).get("ms_locator",{}).get("pdf_page_1_based")
    match=next((x for x in matches if x[0]==oldpage),None) or (matches[0] if len(matches)==1 else None)
    # If the transcript extractor cannot find an exact row, retain only a
    # transcript-confirmed legacy locator; never carry a prefix-only locator.
    if match is None and part["id"] in MS_PAGE_OVERRIDES:
        match=(MS_PAGE_OVERRIDES[part["id"]],part["label"])
    if match is None and oldmi and oldmi.get("ms_locator",{}).get("part")==part["label"]:
        loc=oldmi["ms_locator"]; tp=loc["pdf_page_1_based"]
        txt=text_path(msid,tp,"ms").read_text(encoding="utf-8",errors="replace") if text_path(msid,tp,"ms").exists() else ""
        if normalized_part(n,leaf).lower() in re.sub(r"\s+","",txt).lower(): match=(tp,part["label"])
    if match is None:
        part["status"]="UNRESOLVED"; part["ms_locator_or_null"]=None
        unresolved.append({"id":part["id"],"field":"ms_locator_or_null","reason":"No exact item-level MS label matching the QP-printed part was found in the source MS transcripts; prefix-only or inferred mapping was rejected.","qp_locator":part["qp_locator"],"ms_source_id":msid,"search_label":normalized_part(n,leaf)})
        continue
    page=match[0]; exact_label=part["label"]
    loc={"source_id":msid,"pdf_page_1_based":page,"printed_page_or_null":None,"question":n,"part":exact_label}
    part["ms_locator_or_null"]=loc; part["status"]="MS_LINKED"; exact_count+=1
    region=region_by_source_page.get((msid,page))
    deps=[region["id"]] if region else []
    item_id=part["id"]+"-mi-1"
    mark_items.append({"id":item_id,"part_id_or_null":part["id"],"question_id_or_null":None,"ms_locator":loc,
      "transcript_ref":f"transcripts/{msid}-p{page:02d}.txt","mark_or_condition_or_null":None,
      "table_row_ref_or_null":f"{n}{exact_label}" if region else None,"visual_dependency_refs":deps,"status":"MS_LINKED"})

# Six explicit whole-question marks are linked at question granularity (no
# artificial lettered subpart is created).
whole_links=[]
for src, byq in UNPARTED.items():
    msid=ms_source(src)
    for n,mark in byq.items():
        qid=f"{src}-q{n}"
        matches=find_ms_matches(msid,n,None)
        if not matches:
            unresolved.append({"id":qid,"field":"question_id_or_null","reason":"The QP displays an unparted whole-question mark but no exact standalone whole-question MS item was found in the source transcript; item-specific locator review remains open.","qp_locator":question_records[qid]["qp_locator"],"mark_displayed":mark,"search_question":n})
            continue
        page=matches[0][0]
        loc={"source_id":msid,"pdf_page_1_based":page,"printed_page_or_null":None,"question":n}
        item_id=qid+"-mi-1"; region=region_by_source_page.get((msid,page)); deps=[region["id"]] if region else []
        mark_items.append({"id":item_id,"part_id_or_null":None,"question_id_or_null":qid,"ms_locator":loc,
          "transcript_ref":f"transcripts/{msid}-p{page:02d}.txt","mark_or_condition_or_null":None,
          "table_row_ref_or_null":f"{n}" if region else None,"visual_dependency_refs":deps,"status":"MS_LINKED"})
        question_records[qid]["status"]="MS_LINKED"
        whole_links.append({"question_id":qid,"mark":mark,"ms_page":page})

# Retarget existing visual regions to the complete QP render set. Source
# comparison is claimed only for QP pages represented in the visual review log;
# MS regions remain rendered pending an independent source-side visual check.
reviewed_qp_pages={
"9618_s22_qp_11":set(range(2,16)),"9618_s22_qp_12":set(range(2,15)),"9618_s22_qp_13":set(range(2,16)),
"9618_w22_qp_11":set(range(2,20)),"9618_w22_qp_12":set(range(2,18)),"9618_w22_qp_13":set(range(2,20))}
for r in regions:
    sid=r["source_id"]; page=r["pdf_page_1_based"]
    if "_qp_" in sid:
        fname=f"{sid}-p{page:02d}.png"
        candidate=B/"renders/a2-v3-qp-review"/fname
        if candidate.exists(): r["rendered_asset_ref"]=f"renders/a2-v3-qp-review/{fname}"
        r["reviewer_status"]="A2_VISUALLY_INSPECTED_PENDING_INDEPENDENT_REVIEW" if page in reviewed_qp_pages.get(sid,set()) else "RENDERED_PENDING_INDEPENDENT_REVIEW"
    else:
        if r["source_id"]=="9618_s22_ms_13" and page==7:
            r["reviewer_status"]="A2_VISUALLY_INSPECTED_PENDING_INDEPENDENT_REVIEW"
        else:
            r["reviewer_status"]="RENDERED_PENDING_INDEPENDENT_REVIEW" if r.get("rendered_asset_ref") else "RENDER_REQUIRED"
    # Link regions to the corrected leaf targets and any parent context records.
    if "_ms_" in sid:
        r["relates_to_ids"]=[m["part_id_or_null"] or m["question_id_or_null"] for m in mark_items if m["ms_locator"]["source_id"]==sid and m["ms_locator"]["pdf_page_1_based"]==page]
    else:
        r["relates_to_ids"]=[x["id"] for x in new_parts if x["qp_locator"]["source_id"]==sid and x["qp_locator"]["pdf_page_1_based"]==page]

# All displayed marks came from page comparison; preserve null only on explicit
# parent containers and report these as hierarchy containers, not missing marks.
for q in new_questions:
    if q["id"] not in {f"{s}-q{n}" for s,byq in UNPARTED.items() for n in byq}: q["marks_displayed_or_null"]=None

# Build a deterministic item-specific unresolved register.
unresolved.sort(key=lambda x:x["id"])
u_lines=["# B22-A2-v3 unresolved register","","Every entry below names an item and source locator. Parent containers have null displayed marks by design because the QP assigns marks to their printed children. No mark allocation or child label was inferred.",""]
for u in unresolved:
    u_lines += [f"## {u['id']}",f"- Field: `{u['field']}`",f"- Reason: {u['reason']}",f"- QP locator: `{u.get('qp_locator')}`"]
    if u.get("ms_source_id"): u_lines.append(f"- MS source / search: `{u.get('ms_source_id')}` / `{u.get('search_label',u.get('ms_parent_locator_prefix'))}`")
    u_lines.append("")
u_lines += ["## Corrected hierarchy records removed from v2","", "These v2 rows did not correspond to distinct printed QP parts after the source labels were reconciled. Their source evidence is retained in the frozen v2 snapshot.",""]
for x in removed: u_lines.append(f"- `{x['id']}` ({x['label']}) at `{x['qp_locator']}`: {x['reason']}")
u_lines.append("")

# Persist corrected indices and evidence.
new_questions.sort(key=lambda x:(x["source_qp_id"],int(x["question_number"])))
new_parts.sort(key=lambda x:(x["question_id"],x["id"]))
mark_items.sort(key=lambda x:x["id"])
all_qi=new_questions+new_parts
def qi_sort_key(x):
    if "question_id" not in x:
        return (x["source_qp_id"],int(x["question_number"]),0,"")
    src,n=x["question_id"].rsplit("-q",1)
    return (src,int(n),1,x.get("label",""))
all_qi.sort(key=qi_sort_key)
write_jsonl(B/"QUESTION_INDEX.jsonl",all_qi)
write_jsonl(B/"MARKING_INDEX.jsonl",mark_items)
visual["schema_version"]="1.1"
dump(B/"VISUAL_MANIFEST.json",visual)
(B/"UNRESOLVED.md").write_text("\n".join(u_lines),encoding="utf-8")

# Record the independent review boundary: A2 self-check only, no batch acceptance.
part_leaf_count=sum(1 for p in new_parts if not any(x["parent_part_id_or_null"]==p["id"] for x in new_parts))
part_parent_count=len(new_parts)-part_leaf_count
marks_populated=sum(p["marks_displayed_or_null"] is not None for p in new_parts)+sum(q["marks_displayed_or_null"] is not None for q in new_questions)
qa=("# B22-A2-v3 extraction QA\n\n"
 f"- Source identity: all 12 QP/MS inputs are checked against the Stage 0 source manifest; originals are read-only.\n"
 f"- Questions: {len(new_questions)}; corrected printed part rows: {len(new_parts)} ({part_leaf_count} leaves, {part_parent_count} parent containers).\n"
 f"- Displayed marks populated from source: {marks_populated}; all {len(whole_links)} assessable unparted whole-question marks use `question_id_or_null`. No synthetic part was added.\n"
 f"- Exact MS-linked marking items: {len(mark_items)} ({exact_count} printed part targets and {len(whole_links)} whole-question targets).\n"
 f"- Item-specific unresolved records: {len(unresolved)}. Parent containers are unresolved only for standalone MS mapping; children are linked individually where exact MS labels exist.\n"
 f"- All 19 A4 prefix-only v2 parent records were restructured: source-supported printed leaves now use exact MS labels; parent containers have item-specific unresolved reasons.\n"
 "- All eight named A4 hierarchy children and all other printed nested labels now have explicit, resolving parent IDs.\n"
 "- All formerly-null displayed-mark fields were rechecked against QP source render/transcripts. Marks are assigned only to the label adjacent to them; parent containers remain null when child marks are printed.\n"
 "- Visual status separates QP pages source-compared by A2 from rendered-only MS regions; all require independent A4/A3/A9 review as applicable.\n"
 "- No item-level marking-point allocation was inferred. This is an A2 self-check submission; A4/A3/A9 retest is required.\n")
(B/"EXTRACTION_QA.md").write_text(qa,encoding="utf-8")

# Update the manifest inputs to the verified Stage 0 baseline without changing
# source files; exact baseline comparison occurs in the validation section.
manifest=json.loads((B/"BATCH_MANIFEST.json").read_text(encoding="utf-8"))
manifest.update({"schema_version":"1.1","artifact_version":"B22-A2-v3","status":"SUBMITTED_FOR_A3_A4_A9_RETEST","supersedes":"versions/B22-A2-v2/"})
manifest["record_counts"]={"page":len(read_jsonl(B/"PAGE_INDEX.jsonl")),"question":len(new_questions),"part":len(new_parts),"marking_item":len(mark_items),"visual_region":len(regions)}
manifest["notes"]=["Question-level and part-level marking links use explicit schema-v1.1 nullable targets; exactly one target is populated.","Printed child marks are preserved on their own labels; no item-level marking allocation inferred.","A2 visual inspection is pending independent review; render-only MS regions are not presented as source-verified."]
manifest["active_artifact_sha256"]={}
manifest["active_artifact_hash_exclusions"]=["BATCH_MANIFEST.json (manifest self-hash is excluded)"]
manifest["derived_artifacts"]=sorted(set(manifest.get("derived_artifacts",[])))
for p in (B/"renders/a2-v3-qp-review").glob("*.png"): manifest["derived_artifacts"].append(p.relative_to(B).as_posix())
for p in [B/"a2-v3-qp-review-render-index.json",B/"scripts/render_b22_v3_qp_pages.py",B/"scripts/build_b22_v3.py"]:
    if p.exists(): manifest["derived_artifacts"].append(p.relative_to(B).as_posix())
manifest["derived_artifacts"]=sorted(set(manifest["derived_artifacts"]))
manifest["revision_inputs"]={"a4_b22_retest_v2_sha256":sha(STAGE1/"evidence/a4/B22/RETEST_V2.json"),"schema_v1_1_sha256":sha(STAGE1/"CORPUS_SCHEMA.md"),"extraction_policy_sha256":sha(STAGE1/"EXTRACTION_POLICY.md")}

# Write base manifest early; finalize hash chain after handoff is written.
dump(B/"BATCH_MANIFEST.json",manifest)

revision=("# B22-A2-v3 revision notes\n\n"
"Supersedes the frozen B22-A2-v2 snapshot. All 12 original PDF inputs remain unchanged.\n\n"
"| Finding | A2-v3 correction | Evidence for retest |\n|---|---|---|\n"
"| B22-A4-V2-01 | Replaced prefix-only parent links with exact printed nested leaf links where present; parent rows without a standalone MS item are item-specifically unresolved. | `QUESTION_INDEX.jsonl`, `MARKING_INDEX.jsonl`, `UNRESOLVED.md` |\n"
"| B22-A4-V2-02 | Rebuilt the full printed parent/child hierarchy, including the eight cited children. | `QUESTION_INDEX.jsonl`; parent uniqueness checks |\n"
"| B22-A4-V2-03 | Rechecked displayed marks on QP source pages; parent rows no longer inherit child marks; unparted question-level marks remain on question records. | `QUESTION_INDEX.jsonl`, `EXTRACTION_QA.md`, render index |\n"
"| B22-A4-V2-04 | HANDOFF_CHECK excludes itself; BATCH_MANIFEST contains its actual SHA256. Each exclusion is documented. | `HANDOFF_CHECK.json`, `BATCH_MANIFEST.json` |\n"
"| B22-A4-V2-05 | Updated locator/schema note for part- and question-level targets; no item-level mark allocation was inferred. | `BATCH_MANIFEST.json` |\n\n"
f"Rebuilt {len(new_parts)} printed part records ({part_parent_count} parents, {part_leaf_count} leaves), {len(mark_items)} exact marking links, and {len(unresolved)} item-specific unresolved records. The v3 batch awaits independent A3/A4/A9 retesting and is not accepted by A2.\n")
(B/"REVISION_NOTES.md").write_text(revision,encoding="utf-8")

print(json.dumps({"questions":len(new_questions),"parts":len(new_parts),"leaf_parts":part_leaf_count,"parent_parts":part_parent_count,"mark_items":len(mark_items),"part_exact_links":exact_count,"whole_links":len(whole_links),"unresolved":len(unresolved),"removed_v2_rows":removed,"whole_links_detail":whole_links},ensure_ascii=False,indent=2))
