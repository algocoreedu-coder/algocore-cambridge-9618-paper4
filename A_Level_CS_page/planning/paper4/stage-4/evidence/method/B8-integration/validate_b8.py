from __future__ import annotations

import hashlib
import json
from collections import defaultdict
from pathlib import Path

from jsonschema import Draft202012Validator


HERE = Path(__file__).resolve().parent
P4 = HERE.parents[3]
S1, S2, S3, S4 = (P4 / f"stage-{n}" for n in (1, 2, 3, 4))
PATTERNS = ["MAIN_FLOW", "OUTPUT_FORMAT", "EVIDENCE_RUN"]
PRIOR_BATCHES = ["P0-stack", "B1-foundations-text", "B2-search-sort", "B3-queue-linked-list", "B4-recursion-tree", "B5-dictionary-hash", "B6-oop", "B7-files"]
FILES = [
    "PATTERN_CARDS.json", "VARIANT_INVARIANT_REGISTER.json",
    "ERROR_PREVENTION.json", "SOLUTION_DESIGNS.json",
    "WORKED_EXAMPLE_SPECS.json", "VISUAL_BRIEFS.json",
]


def read(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def sha(path: Path):
    h = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


checks, failures = [], []


def check(name, condition, detail=""):
    checks.append({"check": name, "passed": bool(condition), "detail": detail})
    if not condition:
        failures.append(f"{name}: {detail}")


docs = {name: read(HERE / name) for name in FILES}
cards = docs["PATTERN_CARDS.json"]["pattern_cards"]
variants = docs["VARIANT_INVARIANT_REGISTER.json"]["variants"]
errors = docs["ERROR_PREVENTION.json"]["error_rows"]
solutions = docs["SOLUTION_DESIGNS.json"]["solution_designs"]
examples = docs["WORKED_EXAMPLE_SPECS.json"]["worked_example_specs"]
visuals = docs["VISUAL_BRIEFS.json"]["visual_briefs"]

for name, doc in docs.items():
    check(f"{name}:status", doc.get("status") == "SUBMITTED", str(doc.get("status")))
    check(f"{name}:batch", doc.get("batch_id") == "B8-integration")
    for locked in doc.get("input_hashes", []):
        path = P4 / locked["path"]
        check(f"{name}:input_exists:{locked['path']}", path.exists())
        if path.exists():
            check(f"{name}:input_hash:{locked['path']}", sha(path) == locked["sha256"])

expected = set(PATTERNS)
for label, seq in (("cards", cards), ("variants", variants), ("solutions", solutions), ("examples", examples), ("visuals", visuals)):
    actual = [x["pattern_id"] if "pattern_id" in x else x["pattern_ids"][0] for x in seq]
    check(f"exact_pattern_set:{label}", len(actual) == 3 and set(actual) == expected, str(actual))

pattern_schema = read(S4 / "schemas/pattern-card.schema.json")
error_schema = read(S4 / "schemas/error-prevention.schema.json")
for card in cards:
    problems = list(Draft202012Validator(pattern_schema).iter_errors(card))
    check(f"schema:card:{card['pattern_id']}", not problems, "; ".join(e.message for e in problems))
for row in errors:
    problems = list(Draft202012Validator(error_schema).iter_errors(row))
    check(f"schema:error:{row['error_id']}", not problems, "; ".join(e.message for e in problems))

catalog = {x["pattern_id"]: x for x in read(S2 / "EXAM_PATTERN_CATALOG.json")["patterns"] if x["pattern_id"] in expected}
card_by_pattern = {x["pattern_id"]: x for x in cards}
for pattern in PATTERNS:
    card = card_by_pattern[pattern]
    actual = card["source_scope"]["assessed_part_ids"]
    target = catalog[pattern]["assessed_part_ids"]
    check(f"assessed_parts:{pattern}", len(actual) == len(target) and set(actual) == set(target), f"actual={len(actual)} expected={len(target)}")
    source_parts = [x["part_id"] for x in card["source_scope"]["official_source_refs"]]
    check(f"source_parts:{pattern}", len(source_parts) == len(target) and set(source_parts) == set(target))


source_rows = {}
batch_policies = {}
for year in ("2021-2022", "2023-2024", "2025"):
    submission = read(S4 / f"evidence/marking/{year}/MARKING_SUBMISSION.json")
    for row in submission.get("parts") or submission.get("rows") or []:
        source_rows[row["part_id"]] = (year, row)
    risk = read(S4 / f"evidence/marking/{year}/SOURCE_RISK_REGISTER.json")
    if risk.get("batch_fidelity_policy"):
        batch_policies[year] = risk["batch_fidelity_policy"]


prior_claimed_atoms = {
    ref
    for batch in PRIOR_BATCHES
    for card in read(S4 / f"evidence/method/{batch}/PATTERN_CARDS.json")["pattern_cards"]
    for ref in card["marking_point_refs"]
}


def atom_owner(row, atom):
    if atom["marking_point_id"] in prior_claimed_atoms:
        return None
    b8 = [p for p in row.get("assessed_pattern_ids", row.get("pattern_ids", [])) if p in expected]
    if not b8:
        return None
    if len(b8) == 1:
        return b8[0]
    pair = set(b8)
    if pair == {"MAIN_FLOW", "EVIDENCE_RUN"}:
        return "EVIDENCE_RUN"
    if pair == {"MAIN_FLOW", "OUTPUT_FORMAT"}:
        text = atom["criterion_paraphrase"].lower()
        output_terms = ("output", "print", "display", "message", "format", "new line", "complete line", "concatenat")
        return "OUTPUT_FORMAT" if any(term in text for term in output_terms) else "MAIN_FLOW"
    raise ValueError(f"Unadjudicated multi-B8 atom ownership: {row['part_id']} {b8} {atom['marking_point_id']}")


expected_atoms = defaultdict(list)
for _, row in source_rows.values():
    for atom in row.get("marking_points", []):
        owner = atom_owner(row, atom)
        if owner:
            expected_atoms[owner].append(atom["marking_point_id"])

claimed = []
for pattern in PATTERNS:
    card = card_by_pattern[pattern]
    actual = card["marking_point_refs"]
    target = expected_atoms[pattern]
    check(f"atom_exact:{pattern}", len(actual) == len(target) and set(actual) == set(target), f"actual={len(actual)} expected={len(target)}")
    claimed.extend(actual)
    step_refs = [r for step in card["method_steps"] for r in step["marking_point_refs"]]
    check(f"atom_step_join:{pattern}", len(step_refs) == len(actual) and set(step_refs) == set(actual))
    source_atoms = [m for ref in card["source_scope"]["official_source_refs"] for m in ref["ms_atoms"]]
    check(f"atom_source_join:{pattern}", {m["marking_point_id"] for m in source_atoms} == set(actual))
    for ref in card["source_scope"]["official_source_refs"]:
        year, row = source_rows[ref["part_id"]]
        check(f"qp_locator:{pattern}:{ref['part_id']}", ref["qp_locator"]["source_id"] == row["qp_requirement"]["source_id"] and ref["qp_locator"]["pdf_pages"] == row["qp_requirement"]["pdf_pages"] and bool(ref["qp_locator"]["pdf_pages"]))
        official = {m["marking_point_id"]: m for m in row.get("marking_points", [])}
        for atom in ref["ms_atoms"]:
            src = official[atom["marking_point_id"]]
            check(f"ms_locator:{pattern}:{atom['marking_point_id']}", atom["source_id"] == src["ms_source_id"] and atom["pdf_pages"] == src["ms_pdf_pages"] and bool(atom["pdf_pages"]))
            for field in ("criterion_paraphrase", "award_semantics", "condition", "alternatives", "dependency", "source_mark_value_if_unambiguous", "group_id", "group_max", "source_issue_refs"):
                check(f"atom_semantics:{atom['marking_point_id']}:{field}", atom.get(field) == src.get(field))

check("owned_atoms_unique", len(claimed) == len(set(claimed)), f"total={len(claimed)} unique={len(set(claimed))}")
check("owned_atom_total_exact", len(claimed) == sum(len(v) for v in expected_atoms.values()), str(len(claimed)))

manifest = read(S1 / "SOURCE_MANIFEST.json")
manifest_rows = manifest.get("sources") or manifest.get("documents") or []
page_count = {x["source_id"]: x.get("page_count") for x in manifest_rows}
for card in cards:
    for ref in card["source_scope"]["official_source_refs"]:
        q = ref["qp_locator"]
        check(f"qp_source_live:{ref['part_id']}", q["source_id"] in page_count)
        check(f"qp_pages_live:{ref['part_id']}", all(isinstance(p, int) and 1 <= p <= page_count[q["source_id"]] for p in q["pdf_pages"]))
        for atom in ref["ms_atoms"]:
            check(f"ms_source_live:{atom['marking_point_id']}", atom["source_id"] in page_count)
            check(f"ms_pages_live:{atom['marking_point_id']}", all(isinstance(p, int) and 1 <= p <= page_count[atom["source_id"]] for p in atom["pdf_pages"]))

all_steps = []
method_signatures = []
for card in cards:
    steps = card["method_steps"]
    all_steps += [x["step_id"] for x in steps]
    check(f"four_steps:{card['pattern_id']}", len(steps) == 4)
    check(f"step_sequence:{card['pattern_id']}", [x["sequence"] for x in steps] == [1, 2, 3, 4])
    for field in ("action", "why", "check"):
        check(f"bilingual:{card['pattern_id']}:{field}", all(set(x[field]) == {"vi", "en"} and x[field]["vi"] and x[field]["en"] for x in steps))
    check(f"method_fields:{card['pattern_id']}", all(x["invariant"] and x["guard"] and x["termination_role"] for x in steps))
    check(f"method_invariant_vi:{card['pattern_id']}", all(x.get("invariant_vi") and x.get("guard_vi") and x.get("termination_role_vi") for x in steps))
    method_signatures.append(tuple(x["action"]["en"] for x in steps))
    expected_issues = {i for ref in card["source_scope"]["official_source_refs"] for i in (ref["source_issue_refs"] + [j for atom in ref["ms_atoms"] for j in atom["source_issue_refs"]])}
    check(f"source_issue_exact:{card['pattern_id']}", set(card["source_issue_refs"]) == expected_issues)
    check(f"policy_not_issue:{card['pattern_id']}", all(not x.startswith("S4-S2-POLICY") for x in card["source_issue_refs"]))
    expected_policy = [batch_policies[y] for y in sorted({x["source_batch"] for x in card["source_scope"]["official_source_refs"]}) if y in batch_policies]
    check(f"policy_exact:{card['pattern_id']}", card["source_fidelity_policies"] == expected_policy)
    check(f"policy_flags:{card['pattern_id']}", all(p.get("is_source_issue") is False and p.get("per_part_source_issue_refs") is False for p in card["source_fidelity_policies"]))

check("step_ids_unique", len(all_steps) == len(set(all_steps)))
check("methods_pattern_specific", len(method_signatures) == len(set(method_signatures)) == 3)

requirements = {x["requirement_id"] for x in read(S3 / "LESSON_PACKAGES.json")["assessment_requirements"]}
error_ids = {x["error_id"] for x in errors}
for row in errors:
    check(f"error_bilingual:{row['error_id']}", all(set(row[f]) == {"vi", "en"} and row[f]["vi"] and row[f]["en"] for f in ("likely_error", "consequence", "detection_check", "repair_action")))
    check(f"error_refs:{row['error_id']}", set(row["method_step_refs"]) <= set(all_steps) and set(row["requirement_refs"]) <= requirements)
    check(f"error_detection_repair:{row['error_id']}", bool(row["detection_check"]["vi"]) and bool(row["repair_action"]["vi"]))
    check(f"no_mark_loss_claim:{row['error_id']}", row["exact_mark_loss_claim"] is None)
for card in cards:
    expected_error = {x["error_id"] for x in errors if x["pattern_id"] == card["pattern_id"]}
    check(f"two_errors:{card['pattern_id']}", len(expected_error) == 2 and set(card["error_refs"]) == expected_error)

solution_by_id = {x["solution_design_id"]: x for x in solutions}
visual_by_id = {x["visual_brief_id"]: x for x in visuals}
event_signatures = []
visual_case_triples = []
for card in cards:
    p = card["pattern_id"]
    solution = solution_by_id.get(card["solution_design_ref"])
    visual = visual_by_id.get(card["visual_brief_ref"])
    check(f"solution_join:{p}", bool(solution) and solution["pattern_id"] == p)
    check(f"solution_status:{p}", bool(solution) and solution["status"] == "PENDING_STAGE5_EXECUTION_VERIFICATION")
    check(f"solution_steps:{p}", bool(solution) and solution["ordered_method_step_ids"] == [x["step_id"] for x in card["method_steps"]])
    check(f"solution_contract:{p}", bool(solution) and all(solution[x] for x in ("preconditions", "postconditions", "invariants", "termination_argument", "stage5_test_obligations")))
    check(f"visual_join:{p}", bool(visual) and visual["pattern_id"] == p)
    check(f"visual_status:{p}", bool(visual) and visual["status"] == "PENDING_STAGE5_TRACE_AND_STAGE7_STORYBOARD")
    check(f"visual_event_driven:{p}", bool(visual) and visual["visual_mode"] == "event_driven" and len(visual["proposed_event_types"]) >= 4)
    event_signatures.append(tuple(visual["proposed_event_types"]))
    visual_case_triples.append((visual["normal_case"]["en"], visual["boundary_case"]["en"], visual["failure_case"]["en"]))
check("visuals_pattern_specific", len(event_signatures) == len(set(event_signatures)) == 3)
check("visual_case_triples_unique", len(visual_case_triples) == len(set(visual_case_triples)) == 3)
for visual in visuals:
    text = json.dumps(visual, ensure_ascii=False)
    check(f"visual_no_template:{visual['pattern_id']}", "Trace the " not in text and " case step by step" not in text and "Use boundary `" not in text and "to check the invariant" not in text)

variant_by_pattern = {x["pattern_ids"][0]: x for x in variants}
for pattern in PATTERNS:
    variant = variant_by_pattern[pattern]
    check(f"variant_specific:{pattern}", bool(variant["axis"] and variant["decision_rule"]["vi"] and variant["decision_rule"]["en"] and variant["invariant"] and len(variant["cases"]) >= 2))
    check(f"variant_invariant_bilingual:{pattern}", set(variant["invariant_bilingual"]) == {"vi", "en"} and all(variant["invariant_bilingual"].values()))
    check(f"variant_case_ids:{pattern}", len({x["case_id"] for x in variant["cases"]}) == len(variant["cases"]))

for example in examples:
    p = example["pattern_id"]
    check(f"example_status:{p}", example["status"] == "PENDING_STAGE5_EXECUTION_VERIFICATION")
    check(f"example_anchor:{p}", example["anchor_source"]["part_id"] in catalog[p]["assessed_part_ids"])
    check(f"example_steps:{p}", set(example["method_step_refs"]) == {x["step_id"] for x in card_by_pattern[p]["method_steps"]})
    check(f"example_no_claims:{p}", bool(example["prohibited_stage4_claims"]))



check("no_prior_atom_overlap", not (set(claimed) & prior_claimed_atoms), str(sorted(set(claimed) & prior_claimed_atoms)[:10]))
check("all_b8_atoms_owned_once", len(claimed) == len(set(claimed)))
evidence_card = card_by_pattern["EVIDENCE_RUN"]
evidence_solution = next(x for x in solutions if x["pattern_id"] == "EVIDENCE_RUN")
evidence_example = next(x for x in examples if x["pattern_id"] == "EVIDENCE_RUN")
evidence_visual = next(x for x in visuals if x["pattern_id"] == "EVIDENCE_RUN")
check("evidence_card_pending", evidence_card["downstream_status"] == "PENDING_STAGE5_EXECUTION_VERIFICATION")
check("evidence_solution_pending", evidence_solution["status"] == "PENDING_STAGE5_EXECUTION_VERIFICATION")
check("evidence_example_pending", evidence_example["status"] == "PENDING_STAGE5_EXECUTION_VERIFICATION")
check("evidence_visual_planned_events", all(x.startswith("PLAN_") for x in evidence_visual["proposed_event_types"]))
evidence_json = json.dumps({"card": evidence_card, "solution": evidence_solution, "example": evidence_example, "visual": evidence_visual}, ensure_ascii=False)
for forbidden_field in ('"observed_output"', '"execution_status"', '"screenshot_path"', '"run_result"', '"tests_passed"'):
    check(f"evidence_no_field:{forbidden_field}", forbidden_field not in evidence_json)
check("evidence_prohibited_claims", bool(evidence_example["prohibited_stage4_claims"]) and "No certified trace" in evidence_example["prohibited_stage4_claims"])

combined = "\n".join((HERE / name).read_text(encoding="utf-8") for name in FILES)
for forbidden in ("tests passed", "executed successfully", "verified runtime output", "PILOT_GATE=PASS", "DESIGN_REVIEWED"):
    check(f"forbidden_claim:{forbidden}", forbidden not in combined)

review = (HERE / "REVIEW.md").read_text(encoding="utf-8")
check("review_status", "Status: **SUBMITTED**" in review and "not a canonical batch PASS" in review)
check("review_unresolved", "## Unresolved decisions" in review)
check("review_policy_boundary", "source_fidelity_policies" in review and "only in `source_fidelity_policies`" in review)
check("review_prior_dedup", "zero overlap with P0/B1–B7 atoms" in review and "already owned there is excluded from B8" in review)
check("review_evidence_boundary", "does not assert that a run, output, screenshot or test pass exists" in review and "PENDING_STAGE5" in review)

result = {
    "schema_version": "s4-b8-self-validation-v1",
    "status": "SUBMITTED",
    "result": "PASS" if not failures else "FAIL",
    "authority": "Author self-check only; independent QA and Lead gate remain pending.",
    "counts": {
        "checks": len(checks), "passed": sum(x["passed"] for x in checks), "failed": len(failures),
        "patterns": len(cards),
        "assessed_part_pattern_links": sum(len(x["source_scope"]["assessed_part_ids"]) for x in cards),
        "unique_assessed_parts": len({x for c in cards for x in c["source_scope"]["assessed_part_ids"]}),
        "official_marking_atoms_owned": len(claimed), "method_steps": len(all_steps),
        "error_rows": len(errors), "solution_designs": len(solutions),
        "worked_example_specs": len(examples), "visual_briefs": len(visuals),
    },
    "checks": checks,
    "failures": failures,
    "gate_status": "NOT_EVALUATED",
}
(HERE / "VALIDATION.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps({"result": result["result"], "counts": result["counts"], "failures": failures}, ensure_ascii=False, indent=2))
raise SystemExit(1 if failures else 0)
