import hashlib
import json
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path.cwd()
S2 = ROOT / "A_Level_CS_page/planning/paper1/stage-2"
OUT = S2 / "evidence/a2/split-v1"


def load(path):
    return json.loads(path.read_text(encoding="utf-8"))


def jsonl(path):
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def digest(path):
    data = path.read_bytes()
    return len(data), hashlib.sha256(data).hexdigest()


checks = []


def check(name, ok, detail):
    checks.append({"check": name, "status": "PASS" if ok else "FAIL", "detail": detail})


expected = sorted(["SPLIT_POLICY.md", "SPLIT_ASSIGNMENTS.jsonl", "HOLDOUT_DECISION.json", "AUTHOR_ALLOWLIST.json", "LEAKAGE_CHECK.json", "QA.json", "INPUT_MANIFEST.json", "OUTPUT_MANIFEST.json", "HANDOFF.json"])
actual = sorted(p.name for p in OUT.iterdir() if p.is_file())
check("01_exact_nine_files", actual == expected, actual)

issued = S2 / "work-orders/c4/P1-S2-A2-SPLIT-v1_INPUT_MANIFEST.json"
check("02_input_manifest_copy", OUT.joinpath("INPUT_MANIFEST.json").read_bytes() == issued.read_bytes(), digest(issued))
im = load(OUT / "INPUT_MANIFEST.json")
drift = []
for e in im["files"]:
    p = Path(e["path"])
    if not p.is_absolute():
        p = ROOT / p
    if not p.exists() or digest(p) != (e["bytes"], e["sha256"]):
        drift.append(e["path"])
check("03_rehash_all_inputs", len(drift) == 0 and len(im["files"]) == 49, {"checked": len(im["files"]), "drift": drift})

om = load(OUT / "OUTPUT_MANIFEST.json")
bad = []
for e in om["files"]:
    p = OUT / e["path"]
    if not p.exists() or digest(p) != (e["bytes"], e["sha256"]):
        bad.append(e["path"])
h = load(OUT / "HANDOFF.json")
if digest(OUT / h["output_manifest"]["path"]) != (h["output_manifest"]["bytes"], h["output_manifest"]["sha256"]):
    bad.append("HANDOFF:OUTPUT_MANIFEST")
for e in h["files"]:
    p = OUT / e["path"]
    if digest(p) != (e["bytes"], e["sha256"]):
        bad.append("HANDOFF:" + e["path"])
check("04_manifest_handoff_closure", not bad and om["file_count"] == 7, bad)

rows = jsonl(OUT / "SPLIT_ASSIGNMENTS.jsonl")
ids = [r["assessment_unit_id"] for r in rows]
qb = {r["assessment_unit_id"]: r for r in jsonl(S2 / "evidence/a4/aggregate-v2/QUESTION_BANK_INDEX.jsonl") if r.get("record_kind") == "ASSESSMENT_UNIT"}
check("05_exact_unit_population", len(rows) == len(set(ids)) == len(qb) == 893 and set(ids) == set(qb), {"rows": len(rows), "unique": len(set(ids)), "source": len(qb)})

groups_doc = load(S2 / "evidence/a4/equivalence-v2/EQUIVALENCE_GROUPS.json")
source_groups = {g["group_id"]: set(g["members"]) for g in groups_doc["positive_groups"]}
actual_groups = defaultdict(set)
group_splits = defaultdict(set)
field_mismatch = []
for r in rows:
    actual_groups[r["equivalence_group_id"]].add(r["assessment_unit_id"])
    group_splits[r["equivalence_group_id"]].add(r["split"])
    q = qb[r["assessment_unit_id"]]
    if (r["paper_id"], r["marks"], r["primary_requirement_ids"]) != (q["paper_id"], q["displayed_marks"], q["primary_requirement_ids"]):
        field_mismatch.append(r["assessment_unit_id"])
check("06_group_identity_and_atomicity", actual_groups == source_groups and len(actual_groups) == 824 and not [g for g, v in group_splits.items() if len(v) != 1], {"groups": len(actual_groups), "cross_split": [g for g, v in group_splits.items() if len(v) != 1]})
check("07_question_bank_field_identity", not field_mismatch, field_mismatch)

pattern_ids = {p["pattern_id"] for p in load(S2 / "evidence/a4/pattern-final-v1/PATTERN_CATALOG.json")["patterns"]}
req_ids = {r["requirement_id"] for r in jsonl(S2 / "evidence/a3/foundation-v1/OBJECTIVE_REQUIREMENTS.jsonl")}
dangling_patterns = [r["assessment_unit_id"] for r in rows if r["final_pattern_id"] not in pattern_ids]
dangling_reqs = [(r["assessment_unit_id"], x) for r in rows for x in r["primary_requirement_ids"] if x not in req_ids]
check("08_pattern_requirement_refs", not dangling_patterns and not dangling_reqs, {"patterns": dangling_patterns, "requirements": dangling_reqs})

split_counts = Counter(r["split"] for r in rows)
marks = Counter()
components = defaultdict(set)
papers = defaultdict(set)
for r in rows:
    marks[r["split"]] += r["marks"]
    components[r["split"]].add(r["equivalence_group_id"])
    papers[r["split"]].add(r["paper_id"])
check("09_split_totals", split_counts == Counter({"AUTHOR_POOL": 701, "CONTROLLED_CHECK": 192}) and marks == Counter({"AUTHOR_POOL": 1800, "CONTROLLED_CHECK": 450}) and {k: len(v) for k, v in components.items()} == {"AUTHOR_POOL": 632, "CONTROLLED_CHECK": 192}, {"units": split_counts, "marks": marks, "components": {k: len(v) for k, v in components.items()}})

all_by_paper = defaultdict(set)
marks_by_paper = Counter()
for r in rows:
    all_by_paper[r["paper_id"]].add(r["assessment_unit_id"])
    marks_by_paper[r["paper_id"]] += r["marks"]
controlled = {r["assessment_unit_id"] for r in rows if r["split"] == "CONTROLLED_CHECK"}
controlled_papers = sorted(papers["CONTROLLED_CHECK"])
whole = all(all_by_paper[p] <= controlled and marks_by_paper[p] == 75 for p in controlled_papers)
check("10_whole_paper_controlled_check", whole and len(controlled_papers) == 6 and sum(marks_by_paper[p] for p in controlled_papers) == 450, {"papers": controlled_papers, "paper_marks": {p: marks_by_paper[p] for p in controlled_papers}})

allow = load(OUT / "AUTHOR_ALLOWLIST.json")
author_units = {r["assessment_unit_id"] for r in rows if r["split"] == "AUTHOR_POOL"}
author_groups = {r["equivalence_group_id"] for r in rows if r["split"] == "AUTHOR_POOL"}
excluded_controlled = set(allow["explicit_exclusions"]["CONTROLLED_CHECK"]["assessment_unit_ids"])
check("11_allowlist_exact", set(allow["allowed_assessment_unit_ids"]) == author_units and set(allow["allowed_equivalence_group_ids"]) == author_groups and excluded_controlled == controlled and not (controlled & set(allow["allowed_assessment_unit_ids"])), {"allowed_units": len(author_units), "allowed_groups": len(author_groups), "excluded_controlled": len(excluded_controlled)})

relation_rows = jsonl(S2 / "evidence/a4/equivalence-v2/VARIANT_RELATION_REGISTER.jsonl")
by_id = {r["assessment_unit_id"]: r["split"] for r in rows}
positive = [r for r in relation_rows if r["relation"] in ("DUPLICATE", "PARALLEL_EQUIVALENT")]
cross = [r["relation_id"] for r in positive if by_id[r["left_id"]] != by_id[r["right_id"]]]
unresolved = [r for r in relation_rows if r["relation"] == "UNRESOLVED" or r["review_status"] != "COMPLETE"]
check("12_relation_leakage", len(relation_rows) == 36416 and len(positive) == 72 and not cross and not unresolved, {"relations": len(relation_rows), "positive": len(positive), "cross": cross, "unresolved_or_unreviewed": len(unresolved)})

leak = load(OUT / "LEAKAGE_CHECK.json")
comp = load(S2 / "evidence/a4/equivalence-v2/REJECTED_PAIR_AUDIT.json")
check("13_complement_audit_and_claim_limit", comp["sample_count"] == 586 and comp["false_negative_count"] == 0 and leak["complement_audit"]["sample_count"] == 586 and leak["complement_audit"]["false_negative_count"] == 0 and "does not prove" in leak["limitation"], {"source_sample": comp["sample_count"], "source_false_negative": comp["false_negative_count"], "limitation": leak["limitation"]})

hold = load(OUT / "HOLDOUT_DECISION.json")
check("14_honest_holdout_label", hold["decision"] == "CONTROLLED_CHECK" and hold["blind_holdout"] is False and hold["procedural_isolation_only"] is True and "Blind holdout" in hold["prohibited_claims"], {"decision": hold["decision"], "blind": hold["blind_holdout"]})

check("15_scope_and_qa", load(OUT / "QA.json")["status"] == "PASS" and h["qa_status"] == "PASS" and h["status"] == "READY_FOR_INDEPENDENT_A9_REVIEW", {"qa": load(OUT / "QA.json")["status"], "handoff": h["status"]})

result = {"schema_version": "1.0", "validator": "A0 C4a split-v1 independent validator", "date_local": "2026-09-23", "result": "PASS" if all(c["status"] == "PASS" for c in checks) else "FAIL", "checks": checks}
print(json.dumps(result, ensure_ascii=False, indent=2))
