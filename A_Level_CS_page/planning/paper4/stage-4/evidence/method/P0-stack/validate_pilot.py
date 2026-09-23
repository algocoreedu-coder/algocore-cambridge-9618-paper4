from __future__ import annotations

import hashlib
import json
from pathlib import Path

from jsonschema import Draft202012Validator


HERE = Path(__file__).resolve().parent
P4 = HERE.parents[3]
S2 = P4 / "stage-2"
S3 = P4 / "stage-3"
S4 = P4 / "stage-4"
PATTERNS = ["STACK_SETUP", "STACK_PUSH", "STACK_POP", "STACK_PAIR", "STACK_REDUCE"]
FILES = [
    "PATTERN_CARDS.json",
    "VARIANT_INVARIANT_REGISTER.json",
    "ERROR_PREVENTION.json",
    "SOLUTION_DESIGNS.json",
    "WORKED_EXAMPLE_SPECS.json",
    "VISUAL_BRIEFS.json",
]


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def sha256(path: Path):
    h = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


checks = []
failures = []


def check(name, condition, detail=""):
    checks.append({"check": name, "passed": bool(condition), "detail": detail})
    if not condition:
        failures.append(f"{name}: {detail}")


docs = {name: read_json(HERE / name) for name in FILES}
cards = docs["PATTERN_CARDS.json"]["pattern_cards"]
variants = docs["VARIANT_INVARIANT_REGISTER.json"]["variants"]
errors = docs["ERROR_PREVENTION.json"]["error_rows"]
solutions = docs["SOLUTION_DESIGNS.json"]["solution_designs"]
examples = docs["WORKED_EXAMPLE_SPECS.json"]["worked_example_specs"]
visuals = docs["VISUAL_BRIEFS.json"]["visual_briefs"]
rework_response = read_json(HERE / "REWORK_RESPONSE.json")

for name, doc in docs.items():
    check(f"{name}:status", doc.get("status") == "SUBMITTED", str(doc.get("status")))
    for locked in doc.get("input_hashes", []):
        path = P4 / locked["path"]
        check(f"{name}:input_exists:{locked['path']}", path.exists())
        if path.exists():
            check(f"{name}:input_hash:{locked['path']}", sha256(path) == locked["sha256"])

expected = set(PATTERNS)
for label, seq in [
    ("cards", cards),
    ("solutions", solutions),
    ("examples", examples),
    ("visuals", visuals),
]:
    actual = [x["pattern_id"] for x in seq]
    check(f"exact_pattern_set:{label}", set(actual) == expected and len(actual) == 5, str(actual))

pattern_schema = read_json(S4 / "schemas/pattern-card.schema.json")
error_schema = read_json(S4 / "schemas/error-prevention.schema.json")
pattern_validator = Draft202012Validator(pattern_schema)
error_validator = Draft202012Validator(error_schema)
for card in cards:
    problems = sorted(pattern_validator.iter_errors(card), key=lambda e: list(e.path))
    check(f"schema:card:{card['pattern_id']}", not problems, "; ".join(e.message for e in problems))
for row in errors:
    problems = sorted(error_validator.iter_errors(row), key=lambda e: list(e.path))
    check(f"schema:error:{row['error_id']}", not problems, "; ".join(e.message for e in problems))

catalog = {x["pattern_id"]: x for x in read_json(S2 / "EXAM_PATTERN_CATALOG.json")["patterns"] if x["pattern_id"] in expected}
card_by_pattern = {x["pattern_id"]: x for x in cards}
for pattern in PATTERNS:
    actual = set(card_by_pattern[pattern]["source_scope"]["assessed_part_ids"])
    expected_parts = set(catalog[pattern]["assessed_part_ids"])
    check(f"assessed_parts:{pattern}", actual == expected_parts, f"missing={sorted(expected_parts-actual)} extra={sorted(actual-expected_parts)}")
    source_part_ids = [x["part_id"] for x in card_by_pattern[pattern]["source_scope"]["official_source_refs"]]
    check(f"source_ref_parts:{pattern}", set(source_part_ids) == expected_parts and len(source_part_ids) == len(expected_parts), str(source_part_ids))


def source_rows():
    result = []
    for year in ("2021-2022", "2023-2024", "2025"):
        doc = read_json(S4 / f"evidence/marking/{year}/MARKING_SUBMISSION.json")
        for row in doc.get("rows") or doc.get("parts") or []:
            assessed = row.get("pattern_ids") or row.get("assessed_pattern_ids") or []
            if any(p in expected for p in assessed):
                result.append((year, row, assessed))
    return result


marking_rows = source_rows()


def applicable_mps(pattern, row, assessed):
    if row["part_id"].endswith("_3(b)(iv)") and set(assessed) == {"STACK_PUSH", "STACK_POP"}:
        suffix = "-01" if pattern == "STACK_PUSH" else "-02"
        return [m for m in row["marking_points"] if m["marking_point_id"].endswith(suffix)]
    return row["marking_points"]


all_claimed_mps = []
for pattern in PATTERNS:
    expected_refs = []
    official_lookup = {}
    for year, row, assessed in marking_rows:
        if pattern not in assessed:
            continue
        for mp in applicable_mps(pattern, row, assessed):
            expected_refs.append(mp["marking_point_id"])
            official_lookup[mp["marking_point_id"]] = (year, row, mp)
    card = card_by_pattern[pattern]
    actual_refs = card["marking_point_refs"]
    check(f"marking_atom_exact_set:{pattern}", set(actual_refs) == set(expected_refs) and len(actual_refs) == len(expected_refs), f"expected={len(expected_refs)} actual={len(actual_refs)}")
    all_claimed_mps.extend(actual_refs)
    step_refs = {ref for method in card["method_steps"] for ref in method.get("marking_point_refs", [])}
    check(f"all_atoms_join_method:{pattern}", set(actual_refs) <= step_refs, f"missing={sorted(set(actual_refs)-step_refs)}")
    official_source_refs = card["source_scope"]["official_source_refs"]
    card_atoms = {m["marking_point_id"]: m for source in official_source_refs for m in source["ms_atoms"]}
    check(f"source_atom_exact_set:{pattern}", set(card_atoms) == set(expected_refs))
    for mp_id, (year, row, mp) in official_lookup.items():
        atom = card_atoms.get(mp_id, {})
        check(f"locator:{pattern}:{mp_id}", atom.get("source_id") == mp["ms_source_id"] and atom.get("pdf_pages") == mp["ms_pdf_pages"] and bool(atom.get("pdf_pages")), str(atom))
        for field in ("criterion_paraphrase", "award_semantics", "condition", "alternatives", "dependency", "source_mark_value_if_unambiguous", "group_id", "group_max", "source_issue_refs"):
            check(f"atom_semantics:{pattern}:{mp_id}:{field}", atom.get(field) == mp.get(field), f"card={atom.get(field)!r} source={mp.get(field)!r}")
        source = next((x for x in official_source_refs if x["part_id"] == row["part_id"]), None)
        check(f"qp_locator:{pattern}:{row['part_id']}", bool(source) and source["qp_locator"]["source_id"] == row["qp_requirement"]["source_id"] and source["qp_locator"]["pdf_pages"] == row["qp_requirement"]["pdf_pages"])

check("marking_atoms_not_duplicated_between_cards", len(all_claimed_mps) == len(set(all_claimed_mps)), f"total={len(all_claimed_mps)} unique={len(set(all_claimed_mps))}")
check("marking_atom_count", len(all_claimed_mps) == 91, str(len(all_claimed_mps)))

for card in cards:
    check(f"removed_pseudo_issue:{card['pattern_id']}", "S4-S2-LAYOUT-CODE-FIDELITY" not in card.get("source_issue_refs", []))
    policies = card.get("source_fidelity_policies", [])
    has_s2_source = any(x["source_batch"] == "2023-2024" for x in card["source_scope"]["official_source_refs"])
    if has_s2_source:
        check(f"s2_fidelity_policy:{card['pattern_id']}", len(policies) == 1 and policies[0].get("policy_id") == "S4-S2-POLICY-LAYOUT-CODE-FIDELITY" and policies[0].get("is_source_issue") is False and policies[0].get("per_part_source_issue_refs") is False)
    else:
        check(f"no_irrelevant_s2_policy:{card['pattern_id']}", policies == [])

reduce_card = card_by_pattern["STACK_REDUCE"]
reduce_atoms = {m["marking_point_id"]: m for source in reduce_card["source_scope"]["official_source_refs"] for m in source["ms_atoms"]}
for suffix in ("04", "05", "06", "07"):
    mp_id = f"9618_s25_42_1(e).mp.{suffix}"
    check(f"s3_reduce_one_mark:{suffix}", reduce_atoms[mp_id]["source_mark_value_if_unambiguous"] == 1)
check("s3_reduce_mp05_discrete", reduce_atoms["9618_s25_42_1(e).mp.05"]["award_semantics"] == "discrete")
check("s3_reduce_mp05_no_alternatives", reduce_atoms["9618_s25_42_1(e).mp.05"]["alternatives"] in ([], None))

all_step_ids = []
for card in cards:
    steps = card["method_steps"]
    ids = [s["step_id"] for s in steps]
    all_step_ids.extend(ids)
    check(f"unique_steps:{card['pattern_id']}", len(ids) == len(set(ids)))
    check(f"step_sequence:{card['pattern_id']}", [s["sequence"] for s in steps] == list(range(1, len(steps)+1)))
    for field in ("action", "why", "check"):
        check(f"bilingual_steps:{card['pattern_id']}:{field}", all(set(s[field]) == {"vi", "en"} and s[field]["vi"] and s[field]["en"] for s in steps))
    check(f"method_content:{card['pattern_id']}", all(s["invariant"] and s["guard"] and s["termination_role"] for s in steps))

check("global_step_ids_unique", len(all_step_ids) == len(set(all_step_ids)))

valid_requirements = {x["requirement_id"] for x in read_json(S3 / "LESSON_PACKAGES.json")["assessment_requirements"]}
for card in cards:
    check(f"assessment_requirements:{card['pattern_id']}", bool(card["assessment_requirement_refs"]) and set(card["assessment_requirement_refs"]) <= valid_requirements)

error_ids = [x["error_id"] for x in errors]
check("error_ids_unique", len(error_ids) == len(set(error_ids)))
for card in cards:
    expected_error_ids = {x["error_id"] for x in errors if x["pattern_id"] == card["pattern_id"]}
    check(f"error_reverse_join:{card['pattern_id']}", set(card["error_refs"]) == expected_error_ids)
for row in errors:
    check(f"error_step_refs:{row['error_id']}", set(row["method_step_refs"]) <= set(all_step_ids))
    check(f"error_requirement_refs:{row['error_id']}", set(row["requirement_refs"]) <= valid_requirements)
    check(f"no_exact_mark_loss:{row['error_id']}", row.get("exact_mark_loss_claim") is None)
    if row["basis"] == "official_qp_ms":
        check(f"official_error_locator:{row['error_id']}", bool(row.get("marking_point_refs")) and bool(row.get("source_locator_if_official")))

solution_by_id = {x["solution_design_id"]: x for x in solutions}
visual_by_id = {x["visual_brief_id"]: x for x in visuals}
for card in cards:
    solution = solution_by_id.get(card["solution_design_ref"])
    visual = visual_by_id.get(card["visual_brief_ref"])
    check(f"solution_join:{card['pattern_id']}", bool(solution) and solution["pattern_id"] == card["pattern_id"])
    check(f"solution_status:{card['pattern_id']}", bool(solution) and solution["status"] == "PENDING_STAGE5_EXECUTION_VERIFICATION")
    check(f"solution_steps:{card['pattern_id']}", bool(solution) and solution["ordered_method_step_ids"] == [s["step_id"] for s in card["method_steps"]])
    check(f"visual_join:{card['pattern_id']}", bool(visual) and visual["pattern_id"] == card["pattern_id"])
    check(f"visual_status:{card['pattern_id']}", bool(visual) and visual["status"] == "PENDING_STAGE5_TRACE_AND_STAGE7_STORYBOARD")
    check(f"visual_events:{card['pattern_id']}", bool(visual) and visual["visual_mode"] == "event_driven" and bool(visual["proposed_event_types"]))

case_signatures = []
for visual in visuals:
    for field in ("normal_case", "boundary_case", "failure_case"):
        check(f"visual_case_bilingual:{visual['pattern_id']}:{field}", set(visual[field]) == {"vi", "en"} and bool(visual[field]["vi"]) and bool(visual[field]["en"]))
    case_signatures.append((visual["normal_case"]["en"], visual["boundary_case"]["en"], visual["failure_case"]["en"]))
check("visual_cases_not_repeated", len(case_signatures) == len(set(case_signatures)) == 5)
visual_text_by_pattern = {x["pattern_id"]: json.dumps(x, ensure_ascii=False) for x in visuals}
for generic in (
    "A valid state with enough space/data for success.",
    "Empty, full, one-item or one-free-slot state as appropriate.",
    "A failed guard or one-sided transaction failure with required state preservation.",
):
    check(f"visual_generic_removed:{generic[:18]}", all(generic not in text for text in visual_text_by_pattern.values()))
check("visual_setup_specific", "empty/full/read/write equations" in visual_text_by_pattern["STACK_SETUP"] and "live regions" in visual_text_by_pattern["STACK_SETUP"])
check("visual_push_specific", "one-free-slot" in visual_text_by_pattern["STACK_PUSH"] and "full" in visual_text_by_pattern["STACK_PUSH"])
check("visual_pop_specific", "one-item" in visual_text_by_pattern["STACK_POP"] and "empty Pop" in visual_text_by_pattern["STACK_POP"])
check("visual_pair_specific", "all four cases" in visual_text_by_pattern["STACK_PAIR"] and "both-empty" in visual_text_by_pattern["STACK_PAIR"])
check("visual_reduce_specific", "non-commutative" in visual_text_by_pattern["STACK_REDUCE"] and "all-negative" in visual_text_by_pattern["STACK_REDUCE"] and "Stage 5 test obligation" in visual_text_by_pattern["STACK_REDUCE"])

for example in examples:
    check(f"example_status:{example['pattern_id']}", example["status"] == "PENDING_STAGE5_EXECUTION_VERIFICATION")
    check(f"example_anchor:{example['pattern_id']}", example["anchor_source"]["part_id"] in catalog[example["pattern_id"]]["assessed_part_ids"])
    check(f"example_no_runtime_claim:{example['pattern_id']}", bool(example["prohibited_stage4_claims"]))

variant_patterns = {p for v in variants for p in v["pattern_ids"]}
check("variant_pattern_coverage", variant_patterns == expected, str(sorted(variant_patterns)))
check("variant_decisions", all(v["decision_rule"]["vi"] and v["decision_rule"]["en"] and v["invariant"] for v in variants))

combined = "\n".join((HERE / f).read_text(encoding="utf-8") for f in FILES)
check("pair_rollback_explicit", "sole successful" in combined and "both fail" in combined and "sentinel Push" in combined)
check("reduce_order_explicit", "total operator number" in combined and "total_before operator next_number" in combined)
check("reduce_termination_explicit", "drains the stack" in combined and "finite capacity implies termination" in combined)
check("two_top_conventions_explicit", "next_free" in combined and "current_top" in combined)
for forbidden in ("tests passed", "executed successfully", "verified runtime output", "PILOT_GATE=PASS", "DESIGN_REVIEWED"):
    check(f"forbidden_claim:{forbidden}", forbidden not in combined)

review = (HERE / "REVIEW.md").read_text(encoding="utf-8")
check("review_submitted_boundary", "Status: **SUBMITTED**" in review and "not `PILOT_GATE=PASS`" in review)
check("review_pair_adjudication", "P0-STACK-PAIR" in review and "AlgoCore_inference" in review and "all four cases" in review and "must not be presented as an official Cambridge literal" in review)
check("review_source_issues", "S4-S2-S23-QP-ARROW-EXTRACTION" in review and "S4-S2-LAYOUT-CODE-FIDELITY" in review)
check("review_fidelity_policy_boundary", "S4-S2-POLICY-LAYOUT-CODE-FIDELITY" in review and "non-source batch policy" in review)
check("review_rework_semantics", "mp.04–mp.07" in review and "mp.05 is `discrete`" in review)

check("rework_response_status", rework_response.get("status") == "RESUBMITTED" and rework_response.get("rework_round") == 2)
check("rework_response_scope", rework_response.get("scope") == PATTERNS)
for item in rework_response.get("input_hash_changes", []):
    path = P4 / item["path"]
    check(f"rework_new_hash:{item['path']}", item["new_sha256"] == sha256(path) and item["old_sha256"] == item["new_sha256"] and item["changed"] is False)
change_ids = {x["change_id"] for x in rework_response.get("exact_changes", [])}
check("rework_exact_change_set", change_ids == {"P0-R2-PAIR-STALE-ADJUDICATION", "P0-R2-VISUAL-CASE-SPECIFIC"}, str(sorted(change_ids)))
history = rework_response.get("prior_rework_rounds", [])
check("rework_round1_history", len(history) == 1 and history[0].get("rework_round") == 1 and history[0].get("validation", {}).get("result") == "PASS")

variant_text = (HERE / "VARIANT_INVARIANT_REGISTER.json").read_text(encoding="utf-8")
error_text = (HERE / "ERROR_PREVENTION.json").read_text(encoding="utf-8")
for label, stale in (
    ("variant_pending_decision", "source message precedence requires Lead adjudication"),
    ("error_pending_decision", "Lead adjudication is requested"),
):
    check(f"no_stale_pair_phrase:{label}", stale not in variant_text and stale not in error_text)
check("both_empty_resolved_variant", "no restore; no mutation; no sentinel push" in variant_text and "not an official Cambridge literal" in variant_text)
check("both_empty_resolved_error", "no restore, no mutation and no sentinel Push" in error_text and "not be presented as an official Cambridge literal" in error_text)

result = {
    "schema_version": "s4-p0-stack-self-validation-v1",
    "status": "SUBMITTED",
    "result": "PASS" if not failures else "FAIL",
    "authority": "Author self-check only; this is not independent QA and does not set PILOT_GATE.",
    "counts": {
        "checks": len(checks),
        "passed": sum(x["passed"] for x in checks),
        "failed": len(failures),
        "patterns": len(cards),
        "assessed_part_pattern_links": sum(len(x["source_scope"]["assessed_part_ids"]) for x in cards),
        "unique_source_parts": len({r["part_id"] for _, r, _ in marking_rows}),
        "official_marking_atoms_owned": len(all_claimed_mps),
        "method_steps": len(all_step_ids),
        "error_rows": len(errors),
    },
    "checks": checks,
    "failures": failures,
    "gate_status": "NOT_EVALUATED",
}
(HERE / "VALIDATION.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
rework_response["validation"] = {
    "status": result["result"],
    "report": "VALIDATION.json",
    "sha256": sha256(HERE / "VALIDATION.json"),
    "checks": result["counts"]["checks"],
    "failed": result["counts"]["failed"],
    "authority": "Author self-check only; independent QA and Lead gate remain pending.",
}
(HERE / "REWORK_RESPONSE.json").write_text(json.dumps(rework_response, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps({"result": result["result"], "counts": result["counts"], "failures": failures}, ensure_ascii=False, indent=2))
raise SystemExit(1 if failures else 0)
