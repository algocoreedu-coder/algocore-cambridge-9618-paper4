import hashlib
import json
from collections import Counter
from pathlib import Path

ROOT = Path.cwd()
S2 = ROOT / "A_Level_CS_page/planning/paper1/stage-2"


def load(name): return json.loads((S2 / name).read_text(encoding="utf-8"))
def jsonl(name): return [json.loads(x) for x in (S2 / name).read_text(encoding="utf-8").splitlines() if x.strip()]
def digest(path):
    b = path.read_bytes()
    return len(b), hashlib.sha256(b).hexdigest()


checks = []
def check(cid, ok, detail): checks.append({"id": cid, "status": "PASS" if ok else "FAIL", "detail": detail})


gates = ["evidence/a0/c1/C1_GATE_DECISION.json", "evidence/a0/c2/decisions/C2_GATE_DECISION.json", "evidence/a0/c3a/C3A_GATE_DECISION_V2.json", "evidence/a0/c3b/C3B_GATE_DECISION_V2.json", "evidence/a0/c3c/C3C_GATE_DECISION.json", "evidence/a0/c4a/C4A_GATE_DECISION.json", "evidence/a0/c4b/C4B_GATE_DECISION_V2.json"]
gate_state = {x: load(x).get("decision", load(x).get("state")) for x in gates}
check("S2-M01-GATE-AUTHORITY", all(v == "PASS" for v in gate_state.values()), gate_state)

manifest = load("STAGE2_MANIFEST.json")
bad = []
for e in manifest["canonical_artifacts"] + manifest["gate_authorities"]:
    p = ROOT / e["path"]
    if not p.exists() or digest(p) != (e["bytes"], e["sha256"]): bad.append(e["path"])
copy_bad = [x for x in manifest["copy_lineage"] if not x["byte_identical"] or (ROOT / x["target"]).read_bytes() != (ROOT / x["source"]).read_bytes()]
check("S2-M02-MANIFEST-CLOSURE", not bad and not copy_bad and len(manifest["canonical_artifacts"]) == manifest["canonical_file_count"] == 27, {"canonical": len(manifest["canonical_artifacts"]), "bad": bad, "copy_bad": [x["target"] for x in copy_bad]})

objectives = jsonl("SYLLABUS_OBJECTIVES.jsonl")
requirements = jsonl("OBJECTIVE_REQUIREMENTS.jsonl")
coverage = jsonl("COVERAGE_MATRIX.jsonl")
learning = load("LEARNING_MAP.json")
objective_ids = {x["objective_id"] for x in objectives}
req_ids = {x["requirement_id"] for x in requirements}
lu_ids = {x["learning_unit_id"] for x in learning["learning_units"]}
cov_ids = {x["requirement_id"] for x in coverage}
check("S2-M03-OBJECTIVE-REQUIREMENT-LEARNING", len(objective_ids) == 99 and len(req_ids) == len(cov_ids) == 205 and req_ids == cov_ids and len(lu_ids) == 99 and all(x["planned_learning_unit_ids"] and set(x["planned_learning_unit_ids"]) <= lu_ids for x in coverage), {"objectives": len(objective_ids), "requirements": len(req_ids), "coverage": len(cov_ids), "learning_units": len(lu_ids)})

units = jsonl("ASSESSMENT_UNIT_INDEX.jsonl")
containers = jsonl("CONTAINER_INDEX.jsonl")
unit_ids = {x["assessment_unit_id"] for x in units}
container_ids = {x["container_id"] for x in containers}
marking_targets = [x["marking_item_id"] for x in units]
paper_marks = Counter()
for x in units: paper_marks[x["paper_id"]] += x["displayed_marks"]
check("S2-M04-ASSESSMENT-POPULATION", len(units) == len(unit_ids) == len(marking_targets) == len(set(marking_targets)) == 893 and len(containers) == len(container_ids) == 379 and sum(paper_marks.values()) == 2250 and len(paper_marks) == 30 and all(v == 75 for v in paper_marks.values()), {"units": len(units), "containers": len(containers), "unique_marking_targets": len(set(marking_targets)), "marks": sum(paper_marks.values()), "papers": len(paper_marks)})

unresolved = jsonl("UNRESOLVED_DISPOSITION.jsonl")
unresolved_ids = {x["corpus_record_id"] for x in unresolved}
check("S2-M05-UNRESOLVED-CONTEXT", len(unresolved) == len(unresolved_ids) == 128 and not (unresolved_ids & {x["corpus_target_id"] for x in units}) and all(not x["eligible_as_assessment_unit"] and not x["eligible_for_marking_claim"] and x["stage2_role"] == "CONTEXT_ONLY" for x in unresolved), {"records": len(unresolved), "overlap": len(unresolved_ids & {x["corpus_target_id"] for x in units})})

patterns = load("PATTERN_CATALOG.json")
pe = jsonl("PATTERN_EVIDENCE.jsonl")
ledger = jsonl("PATTERN_COUNT_LEDGER.jsonl")
raw = sum(x["raw_occurrence_contribution"] for x in ledger)
paper = sum(x["distinct_paper_contribution"] for x in ledger)
eq = sum(x["distinct_equivalence_group_contribution"] for x in ledger)
check("S2-M06-PATTERN-INTEGRITY", patterns["pattern_count"] == 504 and len(pe) == len(ledger) == 893 and raw == 893 and paper == 853 and eq == 824 and patterns["status_counts"] == {"ESTABLISHED": 127, "NEEDS_REVIEW": 3, "SINGLETON": 374}, {"patterns": patterns["pattern_count"], "evidence": len(pe), "ledger": len(ledger), "sums": [raw, paper, eq], "statuses": patterns["status_counts"]})

relations = jsonl("VARIANT_RELATION_REGISTER.jsonl")
groups = load("EQUIVALENCE_GROUPS.json")
split = jsonl("SPLIT_ASSIGNMENTS.jsonl")
split_by = {x["assessment_unit_id"]: x["split"] for x in split}
positive = [x for x in relations if x["relation"] in ("DUPLICATE", "PARALLEL_EQUIVALENT")]
cross = [x["relation_id"] for x in positive if split_by[x["left_id"]] != split_by[x["right_id"]]]
split_counts = Counter(x["split"] for x in split)
hold = load("HOLDOUT_DECISION.json")
leak = load("LEAKAGE_CHECK.json")
check("S2-M07-EQUIVALENCE-SPLIT", len(relations) == 36416 and len(positive) == 72 and groups["positive_group_count"] == 824 and len(split) == 893 and split_counts == Counter({"AUTHOR_POOL": 701, "CONTROLLED_CHECK": 192}) and not cross and hold["decision"] == "CONTROLLED_CHECK" and leak["complement_audit"]["sample_count"] == 586 and leak["complement_audit"]["false_negative_count"] == 0, {"relations": len(relations), "positive": len(positive), "groups": groups["positive_group_count"], "split": dict(split_counts), "cross": cross, "complement_sample": leak["complement_audit"]["sample_count"]})

glossary = jsonl("GLOSSARY_SEED.jsonl")
commands = jsonl("COMMAND_WORD_REGISTER.jsonl")
term_ids = {x["term_id"] for x in glossary}
pattern_ids = {x["pattern_id"] for x in patterns["patterns"]}
glossary_bad = [x["term_id"] for x in glossary if any(p not in pattern_ids for p in x.get("pattern_ids", [])) or any(o not in objective_ids for o in x.get("objective_ids", []))]
check("S2-M08-GLOSSARY", len(glossary) == len(term_ids) == 96 and len(commands) == 27 and not glossary_bad, {"terms": len(glossary), "commands": len(commands), "bad_refs": glossary_bad})

registry_units = {x["assessment_unit_id"]: x for x in learning["registries"]["assessment_units"]}
source_units = {x["assessment_unit_id"]: x for x in units}
role_bad = []
for uid, src in source_units.items():
    tr = registry_units[uid]
    if set(src["primary_requirement_ids"]) != set(tr["primary_requirement_ids"]) or set(src["supporting_requirement_ids"]) != set(tr["supporting_requirement_ids"]) or set(tr["primary_requirement_ids"]) & set(tr["supporting_requirement_ids"]): role_bad.append(uid)
primary_count = sum(len(x["primary_requirement_ids"]) for x in registry_units.values())
support_count = sum(len(x["supporting_requirement_ids"]) for x in registry_units.values())
check("S2-M09-TRACE-ROLE-IDENTITY", not role_bad and primary_count == 1153 and support_count == 174, {"primary": primary_count, "supporting": support_count, "bad_units": role_bad})

order = learning["topological_order"]
pos = {x: i for i, x in enumerate(order)}
hard = learning["hard_prerequisite_edges"]
edge_bad = [x["edge_id"] for x in hard if x["from_id"] not in pos or x["to_id"] not in pos or pos[x["from_id"]] >= pos[x["to_id"]]]
check("S2-M10-PREREQUISITE-TOPOLOGY", len(order) == len(set(order)) == 99 and len(hard) == 62 and not edge_bad, {"nodes": len(order), "edges": len(hard), "bad": edge_bad})

briefs = jsonl("ORIGINAL_ASSESSMENT_BRIEFS.jsonl")
brief_ids = {x["brief_id"] for x in briefs}
required_briefs = {x["original_assessment_brief_id_or_null"] for x in coverage if x["original_assessment_brief_id_or_null"]}
unmapped = load("GAP_REGISTER.json")["unmapped_assessment_unit_source_limitations"]
check("S2-M11-COVERAGE-GAPS-BRIEFS", len(briefs) == len(brief_ids) == len(required_briefs) == 15 and brief_ids == required_briefs and all(x["provenance_class"] == "ALGCORE_ORIGINAL" and x["prompt_status"] == x["answer_or_solution_status"] == "NOT_AUTHORED_IN_STAGE_2" for x in briefs) and len(unmapped) == 1 and unmapped[0]["assessment_unit_id"] == "AU-9618_s23_qp_12-q5-pd-pii", {"briefs": len(briefs), "required_briefs": len(required_briefs), "unmapped": unmapped})

book = jsonl("COURSEBOOK_MAP.jsonl")
flags = Counter(x for r in coverage for x in r["source_and_coverage_flags"])
check("S2-M12-SOURCE-BOUNDARIES", len(book) == 99 and flags["NO_VERIFIED_BOOK_SUPPORT"] == 165 and flags["NO_OFFICIAL_EVIDENCE"] == 12 and flags["CONTROLLED_CHECK_ONLY"] == 3 and flags["NEEDS_REVIEW_PATTERN_DEPENDENCY"] == 3 and flags["GLOSSARY_CANDIDATE_STATUS_ONLY"] == 200, {"book_rows": len(book), "flags": {k: flags[k] for k in ["NO_VERIFIED_BOOK_SUPPORT", "NO_OFFICIAL_EVIDENCE", "CONTROLLED_CHECK_ONLY", "NEEDS_REVIEW_PATTERN_DEPENDENCY", "GLOSSARY_CANDIDATE_STATUS_ONLY"]}})

summary = load("COVERAGE_SUMMARY.json")
check("S2-M13-SCOPE-BOUNDARY", summary["claims"] == {"stage2_result": "planned coverage and traceability only", "holdout_label": "CONTROLLED_CHECK", "lesson_complete": False, "bilingual_lesson_parity": False, "app_complete": False, "stage3_started": False} and manifest["state"] == "FROZEN_PENDING_FINAL_A9_REVIEW", {"claims": summary["claims"], "manifest_state": manifest["state"]})

review_handoffs = ["evidence/a9/reviews/glossary-v2-r2/review-v1/HANDOFF.json", "evidence/a9/reviews/split-v1/review-v1/HANDOFF.json", "evidence/a4/reviews/trace-v2/retest-v1/HANDOFF.json", "evidence/a9/reviews/trace-v2/retest-v1/HANDOFF.json"]
review_states = {x: load(x).get("result", load(x).get("recommendation")) for x in review_handoffs}
check("S2-M14-REVIEW-AND-FINDING-CLOSURE", all(v == "PASS" for v in review_states.values()), review_states)

result = {"schema_version": "1.0", "validator": "A0 Stage 2 final integrity validator", "date_local": "2026-09-23", "state": "FROZEN_PENDING_FINAL_A9_REVIEW", "result": "PASS" if all(x["status"] == "PASS" for x in checks) else "FAIL", "check_count": len(checks), "checks": checks}
print(json.dumps(result, ensure_ascii=False, indent=2))
