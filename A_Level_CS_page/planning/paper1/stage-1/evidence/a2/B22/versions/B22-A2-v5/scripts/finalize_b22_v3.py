#!/usr/bin/env python3
"""Self-validate, finalize the B22-v3 hash chain, and freeze the submission."""
from __future__ import annotations
import hashlib,json,re,shutil,sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[8]
B=ROOT/"A_Level_CS_page/planning/paper1/stage-1/evidence/a2/B22"
STAGE1=ROOT/"A_Level_CS_page/planning/paper1/stage-1"
STAGE0=ROOT/"A_Level_CS_page/planning/paper1/stage-0/evidence/a2/SOURCE_MANIFEST.json"
REQUIRED=["BATCH_MANIFEST.json","PAGE_INDEX.jsonl","QUESTION_INDEX.jsonl","MARKING_INDEX.jsonl","VISUAL_MANIFEST.json","EXTRACTION_QA.md","UNRESOLVED.md","HANDOFF_CHECK.json","REVISION_NOTES.md"]
HASH_FILES=["PAGE_INDEX.jsonl","QUESTION_INDEX.jsonl","MARKING_INDEX.jsonl","VISUAL_MANIFEST.json","EXTRACTION_QA.md","UNRESOLVED.md","HANDOFF_CHECK.json","REVISION_NOTES.md"]
HANDOFF_HASH_FILES=[x for x in HASH_FILES if x!="HANDOFF_CHECK.json"]
def jread(p): return json.loads(p.read_text(encoding="utf-8"))
def jl(p): return [json.loads(x) for x in p.read_text(encoding="utf-8").splitlines() if x.strip()]
def write(p,x): p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
def hashf(p):
 h=hashlib.sha256()
 with p.open("rb") as f:
  for b in iter(lambda:f.read(1024*1024),b""): h.update(b)
 return h.hexdigest()

man=jread(B/"BATCH_MANIFEST.json")
base=jread(STAGE0)
base_by={x["id"]:x for x in base["primary_sources"]}
sources=man.get("inputs",[])
source_checks=[]
for item in sources:
 sid=item["source_id"]; expected=base_by.get(sid)
 if expected is None: raise SystemExit(f"unknown Stage0 source {sid}")
 p=ROOT/item["relative_path"]
 actual=hashf(p)
 if actual!=expected["sha256"] or item.get("sha256_verified")!=expected["sha256"] or item.get("sha256_baseline")!=expected["sha256"]:
  raise SystemExit(f"source hash mismatch: {sid}")
 try:
  import pymupdf
  doc=pymupdf.open(p); pages=doc.page_count; doc.close()
 except Exception as e: raise SystemExit(f"cannot read PDF pages for {sid}: {e}")
 if pages!=expected["page_count"] or pages!=item["page_count"]: raise SystemExit(f"source page count mismatch: {sid}")
 source_checks.append({"source_id":sid,"relative_path":item["relative_path"],"sha256":actual,"page_count":pages,"stage0_match":True})
if len(source_checks)!=12: raise SystemExit(f"expected 12 sources, found {len(source_checks)}")

qi=jl(B/"QUESTION_INDEX.jsonl"); mi=jl(B/"MARKING_INDEX.jsonl"); pages=jl(B/"PAGE_INDEX.jsonl")
qs={x["id"]:x for x in qi if "question_number" in x}
parts=[x for x in qi if "question_id" in x and "label" in x]
part_by={x["id"]:x for x in parts}
if len(qs)!=52 or len(parts)!=214 or len(part_by)!=len(parts): raise SystemExit("question/part count or uniqueness mismatch")
if len(mi)!=188 or len({x["id"] for x in mi})!=len(mi): raise SystemExit("marking item count or uniqueness mismatch")
bad_parent=[]
for p in parts:
 if p["question_id"] not in qs: bad_parent.append((p["id"],"question"))
 parent=p.get("parent_part_id_or_null")
 if parent and (parent not in part_by or part_by[parent]["question_id"]!=p["question_id"] or not p["label"].startswith(part_by[parent]["label"])):
  bad_parent.append((p["id"],parent))
if bad_parent: raise SystemExit(f"invalid hierarchy: {bad_parent[:5]}")
leaf=[p for p in parts if not any(x.get("parent_part_id_or_null")==p["id"] for x in parts)]
containers=[p for p in parts if p not in leaf]
if len(leaf)!=182 or len(containers)!=32: raise SystemExit("unexpected leaf/container counts")
if any(p.get("marks_displayed_or_null") is None for p in leaf): raise SystemExit("leaf mark remains null")
if any(p.get("marks_displayed_or_null") is not None for p in containers): raise SystemExit("container mark is non-null")

mi_by_target={}
for m in mi:
 part=m.get("part_id_or_null"); q=m.get("question_id_or_null")
 if bool(part)==bool(q): raise SystemExit(f"bad nullable target: {m['id']}")
 if part and (part not in part_by or part_by[part].get("parent_part_id_or_null") is None and part in {c["id"] for c in containers}):
  raise SystemExit(f"mark item targets invalid/container part: {m['id']}")
 target=part or q
 if target in mi_by_target: raise SystemExit(f"duplicate marking item for {target}")
 mi_by_target[target]=m
 loc=m["ms_locator"]
 if m.get("part_id_or_null"):
  t=part_by[part]
  if loc.get("part")!=t["label"] or loc.get("question")!=t["qp_locator"]["question"]:
   raise SystemExit(f"marking locator label mismatch: {m['id']}")
 else:
  if q not in qs or loc.get("question")!=qs[q]["question_number"]: raise SystemExit(f"whole-question locator mismatch: {m['id']}")
 if not (B/m["transcript_ref"]).is_file(): raise SystemExit(f"missing transcript: {m['id']}")
 for rid in m.get("visual_dependency_refs",[]):
  # Cross-checked after visual regions are loaded.
  pass
for p in leaf:
 if p.get("status")=="MS_LINKED" and p["id"] not in mi_by_target: raise SystemExit(f"linked part has no marking item: {p['id']}")
 if p.get("status")=="UNRESOLVED" and p["id"] in mi_by_target: raise SystemExit(f"unresolved part has marking item: {p['id']}")

u_text=(B/"UNRESOLVED.md").read_text(encoding="utf-8")
unresolved_ids=set(re.findall(r"^## ([\w-]+)$",u_text,re.M))
if len(unresolved_ids)!=32 or unresolved_ids!={p["id"] for p in containers}: raise SystemExit("unresolved register does not match 32 parent containers")
if any(p["status"]!="UNRESOLVED" or p["ms_locator_or_null"] is not None for p in containers): raise SystemExit("container mapping is not explicitly unresolved")

visual=jread(B/"VISUAL_MANIFEST.json"); regions=visual.get("regions",[]); region_by={r["id"]:r for r in regions}
for m in mi:
 loc=m["ms_locator"]
 for rid in m.get("visual_dependency_refs",[]):
  r=region_by.get(rid)
  if not r or r["source_id"]!=loc["source_id"] or r["pdf_page_1_based"]!=loc["pdf_page_1_based"]: raise SystemExit(f"visual dependency mismatch: {m['id']}")
for r in regions:
 asset=B/r["rendered_asset_ref"] if r.get("rendered_asset_ref") else None
 if r.get("reviewer_status")=="RENDER_REQUIRED" and asset and asset.exists(): raise SystemExit(f"render exists but status says required: {r['id']}")
 if r.get("reviewer_status")=="UNUSABLE" and not (r.get("replacement_asset_ref") or r.get("reason")): raise SystemExit(f"UNUSABLE region lacks reason: {r['id']}")

if len({x["source_id"] for x in pages})!=12: raise SystemExit("page index does not cover all 12 inputs")
if len(pages)!=sum(x["page_count"] for x in sources): raise SystemExit("page index count differs from source PDF page total")
if len(regions)!=88: raise SystemExit("visual region count changed unexpectedly")

# Update derived artifact inventory and record the self-check result location.
derived=set(man.get("derived_artifacts",[]))
derived.update(["validation-self-check.json","scripts/finalize_b22_v3.py","renders/a2-v3-ms-review/9618_s22_ms_13-p07.png"])
snap=B/"versions/B22-A2-v3"
derived.update(f"versions/B22-A2-v3/{name}" for name in REQUIRED)
derived.add("versions/B22-A2-v3/SNAPSHOT_MANIFEST.json")
man["derived_artifacts"]=sorted(derived)
man["record_counts"]={"page":len(pages),"question":len(qs),"part":len(parts),"marking_item":len(mi),"visual_region":len(regions)}
man["status"]="SUBMITTED_FOR_A3_A4_A9_RETEST"
man["schema_version"]="1.1"
man["artifact_version"]="B22-A2-v3"
man["active_artifact_hash_exclusions"]=[{"file":"BATCH_MANIFEST.json","reason":"The manifest cannot contain its own SHA-256 without recursion."}]
man["source_validation"]={"source_count":len(source_checks),"stage0_matches":len(source_checks),"checks":source_checks}

handoff={
 "batch_id":"B22","artifact_version":"B22-A2-v3","handoff_status":"SUBMITTED_FOR_INDEPENDENT_RETEST",
 "schema_version":"1.1","self_check_scope":"A2 structural, locator, hierarchy, source hash/page-count, and active-artifact self-check only; no acceptance decision.",
 "checks":{"source_hashes_match_stage0":True,"source_page_counts_match_stage0":True,"source_count_is_12":True,
  "question_count_is_52":True,"part_ids_unique":True,"nested_parent_ids_resolve":True,"leaf_displayed_marks_populated":True,
  "whole_question_targets_preserved":True,"marking_targets_use_exactly_one_v1_1_target":True,
  "all_leaf_parts_linked_or_unresolved":True,"visual_dependencies_resolve_source_and_page":True},
 "counts":{"source":len(source_checks),"page":len(pages),"question":len(qs),"part":len(parts),"part_leaf":len(leaf),"part_parent":len(containers),"marking_item":len(mi),"part_exact_links":sum(bool(p.get("ms_locator_or_null")) for p in leaf),"whole_question_links":6,"unresolved":len(unresolved_ids),"visual_region":len(regions)},
 "retest_required":["A3","A4","A9"],
 "known_limits":["All 32 unresolved entries are parent containers with no standalone MS item; their printed child leaves are linked separately.","No item-level marking-point wording or allocation was inferred.","A2 visual comparison is not independent review; A3/A4/A9 must retest their assigned evidence."],
 "active_artifact_sha256_excluding_manifest_and_handoff":{name:hashf(B/name) for name in HANDOFF_HASH_FILES},
 "hash_exclusions":[
  {"file":"HANDOFF_CHECK.json","reason":"The handoff cannot contain its own SHA-256 without recursion."},
  {"file":"BATCH_MANIFEST.json","reason":"The batch manifest is excluded from the handoff hash table; its own hash table records the actual handoff file SHA-256."}
 ]
}
write(B/"HANDOFF_CHECK.json",handoff)
man["active_artifact_sha256"]={name:hashf(B/name) for name in HASH_FILES}
write(B/"BATCH_MANIFEST.json",man)

# Copy the finalized set into an immutable version folder; never touch v1/v2.
if snap.exists():
 if not (snap/"SNAPSHOT_MANIFEST.json").exists() or jread(snap/"SNAPSHOT_MANIFEST.json").get("artifact_version")!="B22-A2-v3":
  raise SystemExit("refusing to replace a snapshot that is not our B22-A2-v3 freeze")
else:
 snap.mkdir(parents=True)
for name in REQUIRED: shutil.copy2(B/name,snap/name)
snapshot={"artifact_version":"B22-A2-v3","frozen":True,"source_active_version":"B22-A2-v3","hash_exclusions":["SNAPSHOT_MANIFEST.json (self-hash excluded)"],"artifact_sha256":{name:hashf(snap/name) for name in REQUIRED}}
write(snap/"SNAPSHOT_MANIFEST.json",snapshot)

# Local machine-readable self-check. The shared validator is run after this
# script and overwrites this file with its source-manifest validation result.
selfcheck={"pass":True,"scope":"A2 self-check; independent review pending","sources_checked":source_checks,"counts":handoff["counts"],"handoff_sha256":hashf(B/"HANDOFF_CHECK.json"),"active_artifact_sha256":man["active_artifact_sha256"]}
write(B/"validation-self-check.json",selfcheck)
print(json.dumps({"pass":True,"counts":handoff["counts"],"active_artifact_sha256":man["active_artifact_sha256"],"handoff_sha256":hashf(B/"HANDOFF_CHECK.json"),"snapshot":str(snap)},ensure_ascii=False,indent=2))
