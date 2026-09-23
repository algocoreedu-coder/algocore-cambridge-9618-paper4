from __future__ import annotations

import hashlib
import json
from pathlib import Path

from jsonschema import Draft202012Validator


HERE = Path(__file__).resolve().parent
P4 = HERE.parents[3]
S2, S3, S4 = P4 / "stage-2", P4 / "stage-3", P4 / "stage-4"
PATTERNS = [
    "QUEUE_SETUP", "QUEUE_ENQUEUE", "QUEUE_DEQUEUE", "QUEUE_INSPECT", "QUEUE_REDUCE",
    "LIST_SETUP", "LIST_TRAVERSE", "LIST_INSERT", "LIST_REMOVE",
]
FILES = ["PATTERN_CARDS.json", "VARIANT_INVARIANT_REGISTER.json", "ERROR_PREVENTION.json",
         "SOLUTION_DESIGNS.json", "WORKED_EXAMPLE_SPECS.json", "VISUAL_BRIEFS.json"]


def load(path):
    return json.loads(Path(path).read_text(encoding="utf-8"))


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


checks, failures = [], []
def check(name, condition, detail=""):
    checks.append({"check": name, "passed": bool(condition), "detail": detail})
    if not condition:
        failures.append(f"{name}: {detail}")


docs = {f: load(HERE / f) for f in FILES}
cards = docs["PATTERN_CARDS.json"]["pattern_cards"]
variants = docs["VARIANT_INVARIANT_REGISTER.json"]["variants"]
errors = docs["ERROR_PREVENTION.json"]["error_rows"]
solutions = docs["SOLUTION_DESIGNS.json"]["solution_designs"]
examples = docs["WORKED_EXAMPLE_SPECS.json"]["worked_example_specs"]
visuals = docs["VISUAL_BRIEFS.json"]["visual_briefs"]

for name, doc in docs.items():
    check(f"{name}:submitted", doc.get("status") == "SUBMITTED", str(doc.get("status")))
    check(f"{name}:batch", doc.get("batch_id") == "B3-queue-linked-list")
    for item in doc.get("input_hashes", []):
        p = P4 / item["path"]
        check(f"{name}:input_exists:{item['path']}", p.exists())
        if p.exists():
            check(f"{name}:input_hash:{item['path']}", sha(p) == item["sha256"])

expected = set(PATTERNS)
for label, seq in [("cards", cards), ("solutions", solutions), ("examples", examples), ("visuals", visuals)]:
    actual = [x["pattern_id"] for x in seq]
    check(f"exact_pattern_order:{label}", actual == PATTERNS, str(actual))

card_schema = load(S4 / "schemas/pattern-card.schema.json")
error_schema = load(S4 / "schemas/error-prevention.schema.json")
for card in cards:
    problems = list(Draft202012Validator(card_schema).iter_errors(card))
    check(f"schema:card:{card['pattern_id']}", not problems, "; ".join(x.message for x in problems))
for row in errors:
    problems = list(Draft202012Validator(error_schema).iter_errors(row))
    check(f"schema:error:{row['error_id']}", not problems, "; ".join(x.message for x in problems))

catalog = {x["pattern_id"]: x for x in load(S2 / "EXAM_PATTERN_CATALOG.json")["patterns"] if x["pattern_id"] in expected}
card_by = {x["pattern_id"]: x for x in cards}
marking_rows = []
for year in ("2021-2022", "2023-2024", "2025"):
    doc = load(S4 / f"evidence/marking/{year}/MARKING_SUBMISSION.json")
    for row in doc.get("rows") or doc.get("parts") or []:
        pats = row.get("assessed_pattern_ids") or row.get("pattern_ids") or []
        if set(pats) & expected:
            marking_rows.append((year, row, pats))

all_claimed, all_source_parts, all_step_ids = [], set(), []
for pattern in PATTERNS:
    card = card_by[pattern]
    expected_parts = catalog[pattern]["assessed_part_ids"]
    actual_parts = card["source_scope"]["assessed_part_ids"]
    check(f"parts:{pattern}", actual_parts == expected_parts, f"expected={expected_parts} actual={actual_parts}")
    refs = card["source_scope"]["official_source_refs"]
    source_part_ids = [x["part_id"] for x in refs]
    check(f"source_rows:{pattern}", set(source_part_ids) == set(expected_parts) and len(source_part_ids) == len(expected_parts))
    expected_rows = [(y, r) for y, r, pats in marking_rows if pattern in pats]
    check(f"source_row_count:{pattern}", len(expected_rows) == len(refs))
    expected_atoms = []
    by_part = {r["part_id"]: r for r in refs}
    for year, row in expected_rows:
        part = row["part_id"]
        all_source_parts.add(part)
        src = by_part.get(part, {})
        expected_row_issues = set(row.get("source_issue_refs", []))
        for raw_atom in row["marking_points"]:
            expected_row_issues.update(raw_atom.get("source_issue_refs", []))
        check(f"source_batch:{pattern}:{part}", src.get("source_batch") == year)
        check(f"qp_locator:{pattern}:{part}", src.get("qp_locator") == {"source_id": row["qp_requirement"]["source_id"], "pdf_pages": row["qp_requirement"]["pdf_pages"]})
        check(f"qp_paraphrase:{pattern}:{part}", src.get("qp_requirement_paraphrase") == row["qp_requirement"]["paraphrase"])
        check(f"qp_constraint_refs:{pattern}:{part}", src.get("qp_constraint_refs") == row["qp_requirement"].get("constraint_refs", []))
        check(f"qp_locator_nonempty:{pattern}:{part}", bool(src.get("qp_locator", {}).get("source_id")) and bool(src.get("qp_locator", {}).get("pdf_pages")))
        check(f"row_issue_refs:{pattern}:{part}", set(src.get("source_issue_refs", [])) == expected_row_issues)
        source_atoms = {x["marking_point_id"]: x for x in src.get("ms_atoms", [])}
        check(f"atom_count:{pattern}:{part}", len(source_atoms) == len(row["marking_points"]))
        for atom in row["marking_points"]:
            atom_id = atom["marking_point_id"]
            expected_atoms.append(atom_id)
            copy = source_atoms.get(atom_id, {})
            check(f"atom_locator:{pattern}:{atom_id}", copy.get("source_id") == atom["ms_source_id"] and copy.get("pdf_pages") == atom["ms_pdf_pages"] and bool(copy.get("pdf_pages")))
            for field in ("criterion_paraphrase", "award_semantics", "condition", "alternatives", "dependency", "source_mark_value_if_unambiguous", "group_id", "group_max", "source_issue_refs"):
                check(f"atom_semantics:{pattern}:{atom_id}:{field}", copy.get(field) == atom.get(field), f"copy={copy.get(field)!r} source={atom.get(field)!r}")
    actual_atoms = card["marking_point_refs"]
    check(f"atom_exact_ownership:{pattern}", actual_atoms == expected_atoms, f"expected={len(expected_atoms)} actual={len(actual_atoms)}")
    all_claimed.extend(actual_atoms)
    step_ids = [x["step_id"] for x in card["method_steps"]]
    all_step_ids.extend(step_ids)
    check(f"step_ids_unique:{pattern}", len(step_ids) == len(set(step_ids)))
    check(f"step_sequence:{pattern}", [x["sequence"] for x in card["method_steps"]] == list(range(1, len(step_ids)+1)))
    step_atoms = [m for x in card["method_steps"] for m in x["marking_point_refs"]]
    check(f"step_atom_exact_once:{pattern}", len(step_atoms) == len(set(step_atoms)) and set(step_atoms) == set(actual_atoms), f"step={len(step_atoms)} card={len(actual_atoms)}")
    for s in card["method_steps"]:
        for field in ("action", "why", "check"):
            check(f"bilingual:{s['step_id']}:{field}", set(s[field]) == {"vi","en"} and all(s[field].values()))
        check(f"step_complete:{s['step_id']}", bool(s["invariant"] and s["guard"] and s["termination_role"] and isinstance(s["reads"], list) and isinstance(s["writes"], list)))

check("part_pattern_links_60", sum(len(x["source_scope"]["assessed_part_ids"]) for x in cards) == 60)
check("unique_source_parts_60", len(all_source_parts) == 60, str(len(all_source_parts)))
check("official_atoms_266", len(all_claimed) == 266, str(len(all_claimed)))
check("official_atoms_no_cross_card_duplicate", len(all_claimed) == len(set(all_claimed)))
check("method_steps_45", len(all_step_ids) == 45, str(len(all_step_ids)))
check("method_step_ids_global_unique", len(all_step_ids) == len(set(all_step_ids)))

valid_requirements = {x["requirement_id"] for x in load(S3 / "LESSON_PACKAGES.json")["assessment_requirements"]}
for card in cards:
    check(f"requirements:{card['pattern_id']}", bool(card["assessment_requirement_refs"]) and set(card["assessment_requirement_refs"]) <= valid_requirements)
    check(f"knowledge_blocks:{card['pattern_id']}", bool(card["knowledge_block_ids"]))
    check(f"book_locators:{card['pattern_id']}", bool(card["book_foundation_refs"]) and all(x["source_id"] and x["pdf_pages"] for x in card["book_foundation_refs"]))
    expected_issues = sorted({i for _, row, pats in marking_rows if card["pattern_id"] in pats
                              for i in (set(row.get("source_issue_refs", [])) |
                                        {j for atom in row["marking_points"] for j in atom.get("source_issue_refs", [])})})
    check(f"issue_exact_set:{card['pattern_id']}", card["source_issue_refs"] == expected_issues, f"expected={expected_issues} actual={card['source_issue_refs']}")
    check(f"fidelity_not_issue:{card['pattern_id']}", "S4-S2-POLICY-LAYOUT-CODE-FIDELITY" not in card["source_issue_refs"])
    has_s2 = any(x["source_batch"] == "2023-2024" for x in card["source_scope"]["official_source_refs"])
    policies = card["source_fidelity_policies"]
    check(f"fidelity_policy:{card['pattern_id']}", (not has_s2 and policies == []) or (has_s2 and len(policies)==1 and policies[0]["policy_id"]=="S4-S2-POLICY-LAYOUT-CODE-FIDELITY" and policies[0]["is_source_issue"] is False))

error_ids = [x["error_id"] for x in errors]
check("error_count_25", len(errors) == 25, str(len(errors)))
check("exact_source_issue_set", {i for c in cards for i in c["source_issue_refs"]} ==
      {"S21-1DI-FREE", "S22-41-3C-DEQUEUE", "W22-42-3B-SCOPE", "W25-43-Q2B-FULL-GUARD"})
check("error_ids_unique", len(error_ids) == len(set(error_ids)))
for card in cards:
    expected_errors = [e["error_id"] for e in errors if e["pattern_id"] == card["pattern_id"]]
    check(f"error_reverse_join:{card['pattern_id']}", card["error_refs"] == expected_errors)
for e in errors:
    check(f"error_steps:{e['error_id']}", bool(e["method_step_refs"]) and set(e["method_step_refs"]) <= set(all_step_ids))
    check(f"error_requirements:{e['error_id']}", bool(e["requirement_refs"]) and set(e["requirement_refs"]) <= valid_requirements)
    check(f"error_no_fixed_mark_loss:{e['error_id']}", e["exact_mark_loss_claim"] is None)
    if e["basis"] in {"official_qp_ms","source_issue"}:
        check(f"error_official_locator:{e['error_id']}", bool(e["source_locator_if_official"]))
    if e["basis"] == "source_issue":
        item = e["source_locator_if_official"][0]
        check(f"issue_locator_real:{e['error_id']}", bool(item["source_locators"]) and all(x["source_id"] and x["pdf_pages"] for x in item["source_locators"]))

variant_patterns = {p for x in variants for p in x["pattern_ids"]}
check("variant_coverage", variant_patterns == expected, str(sorted(variant_patterns)))
for v in variants:
    check(f"variant_bilingual:{v['variant_id']}", set(v["decision_rule"]) == {"vi","en"} and all(v["decision_rule"].values()))
    check(f"variant_cases:{v['variant_id']}", len(v["cases"]) >= 2 and bool(v["invariant"]))

solution_by = {x["solution_design_id"]: x for x in solutions}
visual_by = {x["visual_brief_id"]: x for x in visuals}
for card in cards:
    p = card["pattern_id"]
    sol = solution_by.get(card["solution_design_ref"])
    vis = visual_by.get(card["visual_brief_ref"])
    check(f"solution_join:{p}", bool(sol) and sol["pattern_id"] == p)
    check(f"solution_pending:{p}", sol["status"] == "PENDING_STAGE5_EXECUTION_VERIFICATION")
    check(f"solution_steps:{p}", sol["ordered_method_step_ids"] == [x["step_id"] for x in card["method_steps"]])
    sol_parts = [x["part_id"] for x in sol["source_constraints"]]
    check(f"solution_source_rows:{p}", set(sol_parts) == set(catalog[p]["assessed_part_ids"]) and len(sol_parts) == len(catalog[p]["assessed_part_ids"]))
    check(f"solution_test_dimensions:{p}", all(sol["stage5_test_obligations"][k] for k in ("normal","boundary","counterexample","source_fixture")))
    expected_issue_set = set(card["source_issue_refs"])
    actual_issue_set = {x["issue_id"] for x in sol["source_issue_dispositions"]}
    check(f"solution_issue_disposition:{p}", actual_issue_set == expected_issue_set)
    for issue in sol["source_issue_dispositions"]:
        check(f"solution_issue_locators:{p}:{issue['issue_id']}", bool(issue["source_locators"]) and all(x["source_id"] and x["pdf_pages"] for x in issue["source_locators"]))
        check(f"solution_issue_obligations:{p}:{issue['issue_id']}", bool(issue["stage4_dispositions"]) and bool(issue["stage5_obligations"]))
    check(f"visual_join:{p}", bool(vis) and vis["pattern_id"] == p)
    check(f"visual_pending:{p}", vis["status"] == "PENDING_STAGE5_TRACE_AND_STAGE7_STORYBOARD")
    check(f"visual_steps:{p}", vis["method_step_refs"] == [x["step_id"] for x in card["method_steps"]])
    check(f"visual_errors:{p}", vis["error_refs"] == card["error_refs"])
    check(f"visual_events:{p}", vis["visual_mode"] == "event_driven" and len(vis["proposed_event_types"]) >= 5)
    for field in ("learning_question","predict_prompt","normal_case","boundary_case","failure_case","static_fallback"):
        check(f"visual_bilingual:{p}:{field}", set(vis[field]) == {"vi","en"} and all(vis[field].values()))

for ex in examples:
    p = ex["pattern_id"]
    check(f"example_pending:{p}", ex["status"] == "PENDING_STAGE5_EXECUTION_VERIFICATION")
    check(f"example_anchor:{p}", ex["anchor_source"]["part_id"] in catalog[p]["assessed_part_ids"])
    check(f"example_steps:{p}", ex["method_step_refs"] == [x["step_id"] for x in card_by[p]["method_steps"]])
    check(f"example_boundary:{p}", bool(ex["contrast_and_boundary_microcases"]) and bool(ex["prohibited_stage4_claims"]))

combined = "\n".join((HERE / f).read_text(encoding="utf-8") for f in FILES)
for required in (
    "linear queues do not wrap unless stated", "circular queues wrap head/tail at capacity",
    "next-free tail writes then advances", "last-item tail advances",
    "save the item at head before changing", "half-open [head,tail)",
    "flushes final run", "save free-node successor before overwrite",
    "advance via Next", "unlink", "recycle", "head", "interior", "tail",
    "S21-1DI-FREE", "S22-41-3C-DEQUEUE", "W22-42-3B-SCOPE", "W25-43-Q2B-FULL-GUARD",
):
    check(f"required_content:{required[:32]}", required.lower() in combined.lower())
for forbidden in ("tests passed", "executed successfully", "verified runtime output", "DESIGN_REVIEWED", "PILOT_GATE=PASS"):
    check(f"forbidden_claim:{forbidden}", forbidden not in combined)

review = (HERE / "REVIEW.md").read_text(encoding="utf-8")
check("review_status", "Status: **SUBMITTED**" in review)
check("review_counts", "60 part-pattern" not in review and "Stage 2 assessed part-pattern links: 60" in review and "266" in review and "45" in review)
check("review_source_caveats", all(x in review for x in ("S21-1DI-FREE","S22-41-3C-DEQUEUE","W22-42-3B-SCOPE","W25-43-Q2B-FULL-GUARD")))
check("review_no_open_decision", "No Lead decision remains open" in review)

result = {
    "schema_version":"s4-b3-method-self-validation-v1", "status":"SUBMITTED",
    "result":"PASS" if not failures else "FAIL",
    "authority":"Author self-check only; independent QA and Lead review remain required.",
    "counts":{"checks":len(checks),"passed":sum(x["passed"] for x in checks),"failed":len(failures),
              "patterns":len(cards),"assessed_part_pattern_links":sum(len(x["source_scope"]["assessed_part_ids"]) for x in cards),
              "unique_source_parts":len(all_source_parts),"official_marking_atoms_owned":len(all_claimed),
              "method_steps":len(all_step_ids),"variant_registers":len(variants),"error_rows":len(errors),
              "solution_designs":len(solutions),"worked_examples":len(examples),"visual_briefs":len(visuals)},
    "checks":checks, "failures":failures, "open_decisions":[], "gate_status":"NOT_EVALUATED",
}
(HERE / "VALIDATION.json").write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print(json.dumps({"result":result["result"],"counts":result["counts"],"failures":failures},ensure_ascii=False,indent=2))
raise SystemExit(1 if failures else 0)
