"""Independent A8 structural checks. Semantic scope is documented separately."""
from pathlib import Path
import json, hashlib, re, sys
import pymupdf
sys.stdout.reconfigure(encoding="utf-8")
S3=Path(__file__).resolve().parents[1]
S2=S3.parent/"stage-2"
def read(p):return json.loads(p.read_text(encoding="utf-8"))
A1=read(S3/"evidence/A1_LESSON_BLUEPRINT.json")
A2=read(S3/"evidence/A2_BOOK_SECTION_INDEX.json")
A3=read(S3/"evidence/A3_OBJECTIVE_INVENTORY.json")
Q={r["part_id"]:r for r in read(S2/"QUESTION_PATTERN_MAP.json")["rows"]}
P={r["pattern_id"] for r in read(S2/"EXAM_PATTERN_CATALOG.json")["patterns"]}
errors=[]
def ck(ok,msg):
 if not ok:errors.append(msg)
def unique(rows,key):
 vals=[r[key] for r in rows];ck(len(vals)==len(set(vals)),"Duplicate "+key);return set(vals)
O=unique(A3["objectives"],"objective_id")
L=unique(A1["lessons"],"lesson_id")
B={b["block_id"] for l in A1["lessons"] for b in l["blocks"]}
K={b["block_id"] for l in A1["lessons"] for b in l["blocks"] if ".knowledge." in b["block_id"]}
A=unique(A1["planned_assessment_destinations"],"assessment_id")
ck({r["pattern_id"] for r in A1["pattern_destinations"]}==P,"58 pattern destination set mismatch")
for d in A1["pattern_destinations"]:
 ck(d["lesson_id"] in L,"Unknown pattern lesson")
 for b in d["knowledge_block_ids"]+d.get("secondary_knowledge_block_ids",[]):ck(b in K,"Unknown pattern block "+b)
for l in A1["lessons"]:
 ck(set(l["titles"])=={"vi","en"} and all(l["titles"].values()),"Missing bilingual lesson title")
 ck(l["route_status"]=="PLANNED_NOT_IMPLEMENTED", "Route not planned: "+l["lesson_id"])
 for b in l["blocks"]:
  if b["block_id"] in K:
   ck(bool(b.get("knowledge_label_vi")) and bool(b.get("knowledge_label_en")),"Missing bilingual block label")
for a in A1["planned_assessment_destinations"]:
 ck(a["lesson_id"] in L,"Unknown assessment lesson")
 for b in a["knowledge_block_ids"]:ck(b in K,"Unknown assessment knowledge "+b)
for e in A1["cross_lesson_application_links"]:
 ck(e["from_block_id"] in B and e["recommended_before_block_id"] in B,"Bad conditional block link")
 for b in e.get("additional_required_block_ids",[]):ck(b in B,"Bad additional block")
edges=[e for e in A1["prerequisite_edges"] if e["kind"]=="required"]
adj={l:[] for l in L}
for e in edges:
 f,t=e["from_lesson_id"],e["to_lesson_id"];ck(f in L and t in L and f!=t,"Invalid lesson edge");ck(bool(e["reason"]),"Empty edge rationale");adj[f].append(t)
vis=set();active=set()
def walk(n):
 if n in active:errors.append("DAG cycle at "+n);return
 if n in vis:return
 active.add(n)
 for v in adj[n]:walk(v)
 active.remove(n);vis.add(n)
for n in L:walk(n)
for o in A3["objectives"]:
 for pr in o["prerequisite_objective_ids"]:ck(pr in O,"Unknown prerequisite objective "+pr)
 for item in o.get("corpus_evidence",[]):
  ck(item["part_id"] in Q,"Unknown evidence part "+item["part_id"])
  if item["part_id"] in Q:
   q=Q[item["part_id"]]
   for key in ["qp_basis","ms_basis"]:ck(item[key]==q[key],"Locator mismatch "+o["objective_id"]+" "+item["part_id"]+" "+key)
 for link in o["candidate_pattern_links"]:ck(link["pattern_id"] in P,"Unknown candidate pattern")
for source in [A2["source"],A3["source"]]:
 path=Path(source.get("source_path",source.get("path")));ck(hashlib.sha256(path.read_bytes()).hexdigest()==source["sha256"],"Source hash mismatch")
pdf=pymupdf.open(A2["source"]["source_path"])
page_pairs=set()
for sec in A2["sections"]:
 ck(len(sec["printed_pages"])==len(sec["pdf_pages"]),"Book page vector mismatch")
 for pr,pg in zip(sec["printed_pages"],sec["pdf_pages"]):
  text=pdf[pg-1].get_text();ck(str(pr) in text.splitlines()[:6],f"Printed number not present {pr}/{pg}");page_pairs.add((pr,pg))
result={"status":"PASS" if not errors else "FAIL","scope":"Structural verification of A1/A2/A3 only; not the final assembled Stage3 gate", "counts":{"patterns":len(P),"objectives":len(O),"lessons":len(L),"knowledge_blocks":len(K),"assessments":len(A),"required_lesson_edges":len(edges),"book_sections":len(A2["sections"]),"unique_book_page_pairs":len(page_pairs)},"errors":errors}
(S3/"evidence/A8_INPUT_CHECK.json").write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print(json.dumps(result,ensure_ascii=False,indent=2))
