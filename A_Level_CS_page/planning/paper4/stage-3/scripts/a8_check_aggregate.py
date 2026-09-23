"""Independent joins/counts/identity/DAG audit of assembled Stage3 artifacts."""
from pathlib import Path
import json,collections,hashlib,sys
sys.stdout.reconfigure(encoding="utf-8")
S3=Path(__file__).resolve().parents[1]
def read(n):return json.loads((S3/n).read_text(encoding="utf-8"))
BM=read("BOOK_KNOWLEDGE_MAP.json");CM=read("COVERAGE_MATRIX.json");LP=read("LESSON_PACKAGES.json");PM=read("PREREQUISITE_MAP.json");GR=read("GAP_REGISTER.json")
A2=read("evidence/A2_BOOK_SECTION_INDEX.json");A3=read("evidence/A3_OBJECTIVE_INVENTORY.json")
S2=json.loads((S3.parent/"stage-2/QUESTION_PATTERN_MAP.json").read_text(encoding="utf-8"))
CAT=json.loads((S3.parent/"stage-2/EXAM_PATTERN_CATALOG.json").read_text(encoding="utf-8"))
errors=[];checks=0

def ck(ok,msg):
 global checks
 checks+=1
 if not ok:errors.append(msg)
def idx(items,key):
 result={x[key]:x for x in items};ck(len(items)==len(result),"Duplicate IDs:"+key);return result
Q=idx(S2["rows"],"part_id");PAT=idx(CAT["patterns"],"pattern_id")
K=idx(BM["knowledge_blocks"],"knowledge_id");O=idx(CM["objectives"],"objective_id")
B=idx(BM["sections"],"section_id");L=idx(LP["lessons"],"lesson_id")
P=idx(BM["pattern_chains"],"pattern_id");A=idx(LP["planned_assessment_destinations"],"assessment_id")
R=idx(LP["assessment_requirements"],"requirement_id") if LP["assessment_requirements"] else {}
ck(set(P)==set(PAT),"Pattern58 set mismatch")
ck(BM["sections"]==A2["sections"],"Book section source copy changed")
ck(CM["whole_syllabus_disposition"]==A3["whole_syllabus_disposition"],"Whole-syllabus dispositions changed")
corefields=["source","scope","capability_en","capability_vi","corpus_coverage","corpus_evidence","candidate_pattern_links"]
for orig in A3["objectives"]:
 o=O[orig["objective_id"]]
 for field in corefields:ck(o[field]==orig[field],"Objective source field changed "+o["objective_id"]+" "+field)
 if o["scope"]=="excluded":
  ck(not o["knowledge_block_ids"] and not o["assessment_requirement_ids"],"Excluded assigned production target")
 else:
  ck(bool(o["knowledge_block_ids"]),"Objective missing knowledge "+o["objective_id"])
  ck(bool(o["assessment_requirement_ids"]),"Objective missing requirement "+o["objective_id"])
 for k in o["knowledge_block_ids"]:
  ck(k in K,"Unknown knowledge for objective")
  if k in K:ck(o["objective_id"] in K[k]["objective_ids"],"Objective knowledge backreference missing")
 for req in o["assessment_requirement_ids"]:ck(req in R,"Unknown assessment requirement "+req)
 ck(set(o["book_section_ids"])=={b for k in o["knowledge_block_ids"] for b in K[k]["book_section_ids"]},"Objective book join mismatch")
for k in K.values():
 ck(k["lesson_id"] in L,"Unknown knowledge lesson")
 ck(bool(k["book_section_ids"]),"Missing book links "+k["knowledge_id"])
 ck(bool(k["objective_ids"] or k["assessment_constraint_ids"]),"Knowledge missing scope anchor")
 ck(set(k["titles"])=={"vi","en"} and all(k["titles"].values()),"Missing bilingual knowledge title")
 for loc in k["book_locators"]:ck(loc==B.get(loc["section_id"]),"Locator copy differs from book registry")
 for loc in k["book_section_ids"]:ck(loc in B,"Unknown book section")
 for ob in k["objective_ids"]:ck(ob in O,"Unknown block objective")
 for lang in ["vi","en"]:ck(k["planned_locale_targets"][lang].startswith("/"+lang+"/docs/paper-4/"),"Invalid planned locale")
for p in P.values():
 pid=p["pattern_id"]
 ck(p["candidate_skill_ids"]==PAT[pid]["candidate_skill_ids"],"Skill registry mismatch")
 ck(bool(p["knowledge_chain"]) and bool(p["candidate_skill_ids"]),"Pattern chain incomplete")
 ck(set(p["stage2_assessed_part_ids"])=={q["part_id"] for q in Q.values() if pid in q["assessed_pattern_ids"]},"Assessed part set changed "+pid)
 for e in p["source_examples"]:
  q=Q[e["part_id"]];ck(pid in q["assessed_pattern_ids"],"Unassessed source example")
  for fld in ["qp_basis","ms_basis","ms_distinguishing_requirement","variants"]:ck(e[fld]==q[fld],"Source example changed")
 for c in p["knowledge_chain"]:
  ck(c["knowledge_id"] in K,"Unknown pattern knowledge")
  k=K[c["knowledge_id"]]
  for fld in ["lesson_id","objective_ids","assessment_constraint_ids","book_section_ids","book_relationship"]:ck(c[fld]==k[fld],"Chain join changed")
 ck(p["assessment_destination_id"] in A,"Unknown pattern assessment")
knownblocks={b["block_id"] for l in L.values() for b in l["blocks"]}
ck(set(K)<=knownblocks,"Knowledge missing package block")
for a in A.values():
 ck(a["lesson_id"] in L,"Assessment lesson missing")
 ck(set(a["knowledge_block_ids"])<=set(K),"Assessment knowledge missing")
ck({g["objective_id"] for g in GR["objective_obligations"]}=={o["objective_id"] for o in O.values() if o["scope"]!="excluded"},"Gap obligations mismatch")
for g in GR["objective_obligations"]:
 o=O[g["objective_id"]]
 for f in ["knowledge_block_ids","assessment_requirement_ids","corpus_coverage"]:ck(g[f]==o[f],"Gap coverage join mismatch")
def dag(nodes,edges,label):
 adj={n:[] for n in nodes};deg=dict.fromkeys(nodes,0)
 for f,t in edges:
  ck(f in nodes and t in nodes and f!=t,"Bad edge "+label)
  if f in nodes and t in nodes:adj[f].append(t);deg[t]+=1
 ready=[x for x in nodes if deg[x]==0];seen=[]
 while ready:
  n=ready.pop();seen.append(n)
  for t in adj[n]:
   deg[t]-=1
   if deg[t]==0:ready.append(t)
 ck(len(seen)==len(nodes),"Cycle "+label)
for kind in ["required","all"]:
 es=[e for e in PM["lesson_edges"] if kind=="all" or e["kind"]=="required"]
 for e in es:ck(bool(e["reason"]),"Missing lesson edge rationale")
 dag(set(L),[(e["from_lesson_id"],e["to_lesson_id"]) for e in es],kind)
for e in PM["conditional_block_dependencies"]:
 ck(e["consumer_block_id"] in knownblocks and set(e["prerequisite_block_ids"])<=knownblocks,"Unknown conditional dependency")
 ck(bool(e["reason"]) and bool(e["condition"]),"Conditional relation lacks reason/condition")
# Independently validate every production requirement and exact source copy.
AR=read("evidence/A1_OBJECTIVE_ASSESSMENT_REQUIREMENTS.json")
ck(LP["assessment_requirements"]==AR["requirements"],"Assessment requirement source changed")
ck({r["objective_id"] for r in R.values()}=={o["objective_id"] for o in O.values() if o["scope"]!="excluded"},"Requirement objective coverage mismatch")
for r in R.values():
 oid=r["objective_id"];o=O[oid]
 ck(r["knowledge_block_ids"]==o["knowledge_block_ids"],"Requirement exact block mismatch "+oid)
 ck(r["suggested_assessment_id"] in A,"Requirement destination missing "+oid)
 ck(set(r["supporting_assessment_ids"])<=set(A),"Requirement support destination missing")
 ck(set(r["task_brief"])=={"vi","en"} and all(r["task_brief"].values()),"Requirement bilingual brief missing")
 ck(set(r["capability"])=={"vi","en"} and all(r["capability"].values()),"Requirement bilingual capability missing")
 ck(r["status"]=="PLANNED_NOT_AUTHORED" and r["origin"]=="AlgoCore original" and r["official_marks"] is None,"Assessment authority/readiness overstated")
 ck(len(r["acceptance_checks"])>=2 and all(r["acceptance_checks"]),"Requirement lacks concrete acceptance checks")
for prov in AR["input_provenance"]:
 ck(hashlib.sha256((S3/prov["path"]).read_bytes()).hexdigest()==prov["sha256"],"Requirement source provenance drift: "+prov["path"])
ck("objective_prerequisite_edges" not in PM and "objective_topological_layers" not in PM,"Rejected objective dependencies retained")
ck(all("prerequisite_objective_ids" not in o for o in O.values()),"Rejected objective prerequisites retained in coverage")
dag(knownblocks,[(p,e["consumer_block_id"]) for e in PM["conditional_block_dependencies"] for p in e["prerequisite_block_ids"]],"conditional_block_union")
result={"status":"PASS" if not errors else "REWORK","checks":checks,"counts":{"patterns":len(P),"knowledge_blocks":len(K),"objectives":len(O),"lessons":len(L),"assessment_destinations":len(A),"assessment_requirements":len(R),"objective_obligations":len(GR["objective_obligations"]),"corpus_status":dict(collections.Counter(o["corpus_coverage"] for o in O.values()))},"errors":errors,"reviewed_artifact_sha256":{n:hashlib.sha256((S3/n).read_bytes()).hexdigest() for n in ["BOOK_KNOWLEDGE_MAP.json","COVERAGE_MATRIX.json","LESSON_PACKAGES.json","PREREQUISITE_MAP.json","GAP_REGISTER.json"]}}
(S3/"evidence/A8_AGGREGATE_CHECK.json").write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print(json.dumps(result,ensure_ascii=False,indent=2))
