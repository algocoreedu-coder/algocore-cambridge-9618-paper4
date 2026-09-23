import hashlib
import json
from collections import Counter
from pathlib import Path

ROOT = Path.cwd()
S2 = ROOT / "A_Level_CS_page/planning/paper1/stage-2"
OUT = S2 / "evidence/a3/trace-v2"


def load(path): return json.loads(path.read_text(encoding="utf-8"))
def jsonl(path): return [json.loads(x) for x in path.read_text(encoding="utf-8").splitlines() if x.strip()]
def digest(path):
    b = path.read_bytes()
    return len(b), hashlib.sha256(b).hexdigest()


checks = []
def check(name, ok, detail): checks.append({"check": name, "status": "PASS" if ok else "FAIL", "detail": detail})


expected = sorted(["COVERAGE_MATRIX.jsonl", "OBJECTIVE_ASSESSMENT_MATRIX.jsonl", "LEARNING_MAP.json", "GAP_REGISTER.json", "ORIGINAL_ASSESSMENT_BRIEFS.jsonl", "SOURCE_FLAGS_REGISTER.md", "QA.json", "INPUT_MANIFEST.json", "OUTPUT_MANIFEST.json", "HANDOFF.json"])
actual = sorted(p.name for p in OUT.iterdir() if p.is_file())
check("01_exact_ten_files", actual == expected, actual)

issued = S2 / "work-orders/c4/P1-S2-A3-CORRECT-TRACE-v2_INPUT_MANIFEST.json"
check("02_input_copy", issued.read_bytes() == (OUT / "INPUT_MANIFEST.json").read_bytes(), digest(issued))
im = load(OUT / "INPUT_MANIFEST.json")
drift = []
for e in im["files"]:
    p = Path(e["path"])
    if not p.is_absolute(): p = ROOT / p
    if not p.exists() or digest(p) != (e["bytes"], e["sha256"]): drift.append(e["path"])
check("03_rehash_155_inputs", len(im["files"]) == 155 and not drift, {"checked": len(im["files"]), "drift": drift})

om = load(OUT / "OUTPUT_MANIFEST.json")
h = load(OUT / "HANDOFF.json")
bad = []
for e in om["files"]:
    p = OUT / e["path"]
    if not p.exists() or digest(p) != (e["bytes"], e["sha256"]): bad.append(e["path"])
if digest(OUT / h["output_manifest"]["path"]) != (h["output_manifest"]["bytes"], h["output_manifest"]["sha256"]): bad.append("HANDOFF:OUTPUT_MANIFEST")
for e in h["files"]:
    p = OUT / e["path"]
    if digest(p) != (e["bytes"], e["sha256"]): bad.append("HANDOFF:" + e["path"])
check("04_output_closure", not bad and om["file_count"] == 8, bad)

src_req = {r["requirement_id"]: r for r in jsonl(S2 / "evidence/a3/foundation-v1/OBJECTIVE_REQUIREMENTS.jsonl")}
src_obj = {r["objective_id"]: r for r in jsonl(S2 / "evidence/a3/foundation-v1/SYLLABUS_OBJECTIVES.jsonl")}
src_lu = {r["learning_unit_id"]: r for r in jsonl(S2 / "evidence/a3/foundation-v1/LEARNING_UNIT_PROPOSAL.jsonl")}
cov = jsonl(OUT / "COVERAGE_MATRIX.jsonl")
obj = jsonl(OUT / "OBJECTIVE_ASSESSMENT_MATRIX.jsonl")
briefs = jsonl(OUT / "ORIGINAL_ASSESSMENT_BRIEFS.jsonl")
check("05_exact_requirement_coverage", len(cov) == 205 and len({r["requirement_id"] for r in cov}) == 205 and {r["requirement_id"] for r in cov} == set(src_req), {"rows": len(cov), "unique": len({r["requirement_id"] for r in cov})})
check("06_exact_objective_summaries", len(obj) == 99 and len({r["objective_id"] for r in obj}) == 99 and {r["objective_id"] for r in obj} == set(src_obj), {"rows": len(obj), "unique": len({r["objective_id"] for r in obj})})

lm = load(OUT / "LEARNING_MAP.json")
lus = {r["learning_unit_id"]: r for r in lm["learning_units"]}
check("07_learning_units_preserved", set(lus) == set(src_lu) and len(lus) == 99 and all(set(lus[k]["requirement_ids"]) == set(src_lu[k]["requirement_ids"]) for k in lus), {"units": len(lus), "source": len(src_lu)})

order = lm["topological_order"]
pos = {x: i for i, x in enumerate(order)}
hard = lm["hard_prerequisite_edges"]
bad_edges = [e["edge_id"] for e in hard if e["from_id"] not in pos or e["to_id"] not in pos or pos[e["from_id"]] >= pos[e["to_id"]]]
check("08_hard_topological_order", len(order) == len(set(order)) == 99 and set(order) == set(lus) and len(hard) == 62 and not bad_edges, {"nodes": len(order), "edges": len(hard), "bad": bad_edges})

qb = {r["assessment_unit_id"]: r for r in jsonl(S2 / "evidence/a4/aggregate-v2/QUESTION_BANK_INDEX.jsonl") if r.get("record_kind") == "ASSESSMENT_UNIT"}
split = {r["assessment_unit_id"]: r for r in jsonl(S2 / "evidence/a2/split-v1/SPLIT_ASSIGNMENTS.jsonl")}
patterns = {p["pattern_id"] for p in load(S2 / "evidence/a4/pattern-final-v1/PATTERN_CATALOG.json")["patterns"]}
groups = {g["group_id"] for g in load(S2 / "evidence/a4/equivalence-v2/EQUIVALENCE_GROUPS.json")["positive_groups"]}
terms = {r["term_id"] for r in jsonl(S2 / "evidence/a6/glossary-v2-r2/GLOSSARY_SEED_V2.jsonl")}
reg = lm["registries"]
reg_ids = {
    "assessment_units": {x["assessment_unit_id"] for x in reg["assessment_units"]},
    "requirements": {x["requirement_id"] for x in reg["requirements"]},
    "objectives": {x["objective_id"] for x in reg["objectives"]},
    "patterns": {x["pattern_id"] for x in reg["patterns"]},
    "equivalence_components": {x["equivalence_group_id"] for x in reg["equivalence_components"]},
    "glossary_terms": {x["term_id"] for x in reg["glossary_terms"]},
}
check("09_registry_population", reg_ids["assessment_units"] == set(qb) and reg_ids["requirements"] == set(src_req) and reg_ids["objectives"] == set(src_obj) and reg_ids["patterns"] == patterns and reg_ids["equivalence_components"] == groups and reg_ids["glossary_terms"] == terms, {k: len(v) for k, v in reg.items()})

split_counts = Counter(split[x]["split"] for x in reg_ids["assessment_units"])
check("10_split_preserved", split_counts == Counter({"AUTHOR_POOL": 701, "CONTROLLED_CHECK": 192}), dict(split_counts))

dangling = []
for r in cov:
    rid = r["requirement_id"]
    if not r["planned_learning_unit_ids"] or any(x not in lus for x in r["planned_learning_unit_ids"]): dangling.append((rid, "learning"))
    oa = r["official_assessment"]
    if any(x not in qb for x in oa["all_unit_ids"]): dangling.append((rid, "assessment"))
    if set(oa["author_pool_unit_ids"]) & set(oa["controlled_check_unit_ids"]): dangling.append((rid, "split_overlap"))
    if any(x not in patterns for x in r["final_pattern_ids"]): dangling.append((rid, "pattern"))
    if any(x not in groups for x in r["equivalence_group_ids"]): dangling.append((rid, "group"))
    if any(x not in terms for x in r["glossary_term_ids"]): dangling.append((rid, "term"))
check("11_forward_refs_and_teaching_destination", not dangling, dangling[:50])

mapped = set()
for r in cov: mapped.update(r["official_assessment"]["all_unit_ids"])
unmapped = set(qb) - mapped
gap = load(OUT / "GAP_REGISTER.json")
declared_unmapped = {x["assessment_unit_id"] for x in gap["unmapped_assessment_unit_source_limitations"]}
check("12_reverse_assessment_join", len(mapped) == 892 and unmapped == declared_unmapped == {"AU-9618_s23_qp_12-q5-pd-pii"}, {"mapped": len(mapped), "unmapped": sorted(unmapped)})

registry_units = {x["assessment_unit_id"]: x for x in reg["assessment_units"]}
role_drift = []
for unit_id, source in qb.items():
    trace = registry_units[unit_id]
    source_primary = set(source["primary_requirement_ids"])
    source_supporting = set(source["supporting_requirement_ids"])
    trace_primary = set(trace["primary_requirement_ids"])
    trace_supporting = set(trace["supporting_requirement_ids"])
    if source_primary != trace_primary or source_supporting != trace_supporting or (trace_primary & trace_supporting):
        role_drift.append({
            "assessment_unit_id": unit_id,
            "added_primary": sorted(trace_primary - source_primary),
            "removed_primary": sorted(source_primary - trace_primary),
            "added_supporting": sorted(trace_supporting - source_supporting),
            "removed_supporting": sorted(source_supporting - trace_supporting),
            "trace_role_overlap": sorted(trace_primary & trace_supporting),
        })
check("12b_protected_requirement_role_identity", not role_drift, {"affected_units": len(role_drift), "drift": role_drift})

brief_by_req = {r["requirement_id"]: r for r in briefs}
needed = {r["requirement_id"] for r in cov if r["original_assessment_brief_id_or_null"] is not None}
brief_safe = all(r["provenance_class"] == "ALGCORE_ORIGINAL" and r["prompt_status"] == "NOT_AUTHORED_IN_STAGE_2" and r["answer_or_solution_status"] == "NOT_AUTHORED_IN_STAGE_2" for r in briefs)
check("13_brief_reconciliation", len(briefs) == len(brief_by_req) == 15 and set(brief_by_req) == needed and brief_safe, {"briefs": len(briefs), "requirements": len(needed), "safe": brief_safe})

flags = Counter(x for r in cov for x in r["source_and_coverage_flags"])
expected_flags = {"NO_OFFICIAL_EVIDENCE": 12, "CONTROLLED_CHECK_ONLY": 3, "NO_VERIFIED_BOOK_SUPPORT": 165, "NEEDS_REVIEW_PATTERN_DEPENDENCY": 3, "GLOSSARY_CANDIDATE_STATUS_ONLY": 200}
check("14_gap_flags", all(flags[k] == v for k, v in expected_flags.items()) and all(gap["flag_counts"].get(k) == v for k, v in expected_flags.items()), {"recomputed": {k: flags[k] for k in expected_flags}, "declared": gap["flag_counts"]})

unresolved_ids = {x["corpus_record_id"] for x in reg["unresolved_context_only"]}
check("15_unresolved_context_only", len(reg["unresolved_context_only"]) == len(unresolved_ids) == 128 and lm["counts"]["unresolved_context_only_records"] == 128 and all(not x["eligible_for_marking_claim"] for x in reg["unresolved_context_only"]), {"records": len(reg["unresolved_context_only"])})
qa = load(OUT / "QA.json")
check("16_qa_scope", qa["result"] == h["qa_status"] == "PASS" and qa["status"] == h["status"] == "READY_FOR_FRESH_INDEPENDENT_A4_AND_A9_RETEST", {"qa": qa["result"], "qa_status": qa["status"], "handoff": h["status"]})

result = {"schema_version": "1.0", "validator": "A0 C4b TRACE-v2 independent validator", "date_local": "2026-09-23", "result": "PASS" if all(x["status"] == "PASS" for x in checks) else "FAIL", "checks": checks}
print(json.dumps(result, ensure_ascii=False, indent=2))

