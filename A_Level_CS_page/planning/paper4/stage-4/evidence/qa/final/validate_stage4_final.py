#!/usr/bin/env python3
"""Independent, read-only aggregate QA for canonical Stage 4 artifacts."""

from __future__ import annotations

import hashlib
import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path


HERE = Path(__file__).resolve().parent
S4 = HERE.parents[2]
PAPER4 = S4.parent


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8-sig"))


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


results = []


def check(check_id: str, passed: bool, detail) -> None:
    results.append({"check_id": check_id, "status": "PASS" if passed else "FAIL", "detail": detail})


cards_doc = load(S4 / "PATTERN_CARDS.json")
variants_doc = load(S4 / "VARIANT_INVARIANT_REGISTER.json")
marking_doc = load(S4 / "MARKING_MAP.json")
ownership_doc = load(S4 / "MARKING_METHOD_OWNERSHIP.json")
errors_doc = load(S4 / "ERROR_PREVENTION_MATRIX.json")
solutions_doc = load(S4 / "SOLUTION_DESIGN_BRIEFS.json")
examples_doc = load(S4 / "WORKED_EXAMPLE_SPECS.json")
assessment_doc = load(S4 / "ASSESSMENT_DESIGN_BRIEFS.json")
visuals_doc = load(S4 / "PRELIMINARY_VISUAL_BRIEFS.json")
caveats_doc = load(S4 / "SOURCE_CAVEAT_CARRYOVER.json")
gaps_doc = load(S4 / "GAP_DISPOSITIONS.json")
audit_doc = load(S4 / "STAGE4_COVERAGE_AUDIT.json")

cards = cards_doc["pattern_cards"]
variants = variants_doc["variants"]
marking = marking_doc["rows"]
ownership = ownership_doc["decisions"]
errors = errors_doc["error_rows"]
solutions = solutions_doc["solution_designs"]
examples = examples_doc["worked_example_specs"]
assessments = assessment_doc["assessment_designs"]
visuals = visuals_doc["visual_briefs"]

catalog = load(PAPER4 / "stage-2/EXAM_PATTERN_CATALOG.json")
qmap = load(PAPER4 / "stage-2/QUESTION_PATTERN_MAP.json")
confusables = load(PAPER4 / "stage-2/CONFUSABLE_PATTERNS.json")
coverage3 = load(PAPER4 / "stage-3/COVERAGE_MATRIX.json")
gap3 = load(PAPER4 / "stage-3/GAP_REGISTER.json")

pattern_ids = {row["pattern_id"] for row in catalog["patterns"]}
card_map = {row["pattern_id"]: row for row in cards}
step_owner = {}
for card in cards:
    for step in card["method_steps"]:
        step_owner[step["step_id"]] = card["pattern_id"]

# Exact canonical sets and cardinalities.
check("patterns.exact_58", len(cards) == 58 and set(card_map) == pattern_ids, {"canonical": len(cards), "catalog": len(pattern_ids), "missing": sorted(pattern_ids-set(card_map)), "extra": sorted(set(card_map)-pattern_ids)})
check("patterns.variants.exact_60", len(variants) == 60 and len({row["variant_id"] for row in variants}) == 60, {"rows": len(variants), "unique": len({row["variant_id"] for row in variants})})
check("patterns.errors.exact_154", len(errors) == 154 and len({row["error_id"] for row in errors}) == 154, {"rows": len(errors), "unique": len({row["error_id"] for row in errors})})
for name, rows in [("solutions", solutions), ("examples", examples), ("visuals", visuals)]:
    ids = [row["pattern_id"] for row in rows]
    check(f"patterns.{name}.exact_once", len(ids) == 58 and len(set(ids)) == 58 and set(ids) == pattern_ids, {"rows": len(ids), "unique": len(set(ids))})

expected_relations = {(row["part_id"], p) for row in qmap["rows"] for p in row["assessed_pattern_ids"]}
actual_relations = {(part, card["pattern_id"]) for card in cards for part in card["source_scope"]["assessed_part_ids"]}
check("stage2.assessed_relations_exact", actual_relations == expected_relations, {"expected": len(expected_relations), "actual": len(actual_relations), "missing": sorted(expected_relations-actual_relations)[:20], "extra": sorted(actual_relations-expected_relations)[:20]})

qrows = {row["part_id"]: row for row in qmap["rows"]}
mrows = {row["part_id"]: row for row in marking}
check("marking.exact_672_parts", len(marking) == 672 and len(mrows) == 672 and set(mrows) == set(qrows), {"rows": len(marking), "unique": len(mrows)})
check("marking.exact_29_87_2175", len({r["paper_id"] for r in marking}) == 29 and len({r["question_id"] for r in marking}) == 87 and sum(r["official_part_marks"] for r in marking) == 2175, {"papers": len({r["paper_id"] for r in marking}), "questions": len({r["question_id"] for r in marking}), "marks": sum(r["official_part_marks"] for r in marking)})
part_mismatch = [pid for pid, row in mrows.items() if row["pattern_ids"] != qrows[pid]["assessed_pattern_ids"] or row["context_pattern_ids"] != qrows[pid]["context_pattern_ids"] or row["official_part_marks"] != qrows[pid]["marks"]]
check("marking.stage2_part_semantics", not part_mismatch, part_mismatch)

atoms = [(row["part_id"], atom) for row in marking for atom in row["marking_points"]]
atom_ids = [atom["marking_point_id"] for _, atom in atoms]
bad_locators = [(part, atom["marking_point_id"]) for part, atom in atoms if not atom.get("ms_source_id") or not atom.get("ms_pdf_pages")]
check("marking.exact_2236_unique_atoms", len(atom_ids) == 2236 and len(set(atom_ids)) == 2236, {"atoms": len(atom_ids), "unique": len(set(atom_ids))})
check("marking.all_official_locators", not bad_locators, bad_locators[:50])

# Ownership joins.
decisions = {row["marking_point_id"]: row for row in ownership}
check("ownership.exact_once", len(ownership) == 2236 and len(decisions) == 2236 and set(decisions) == set(atom_ids), {"rows": len(ownership), "unique": len(decisions), "missing": len(set(atom_ids)-set(decisions)), "extra": len(set(decisions)-set(atom_ids))})
duplicates = [row for row in ownership if len(row["candidate_pattern_ids"]) > 1]
check("ownership.duplicates_182", len(duplicates) == 182 and ownership_doc["counts"]["duplicates_resolved"] == 182, len(duplicates))
bad_owners = []
for atom_id, row in decisions.items():
    owner = row["owner_pattern_id"]
    if owner not in row["candidate_pattern_ids"] or owner not in pattern_ids:
        bad_owners.append((atom_id, "owner_not_candidate", owner, row["candidate_pattern_ids"]))
    atom_steps = next(atom["method_step_refs"] for _, atom in atoms if atom["marking_point_id"] == atom_id)
    if not atom_steps or any(step_owner.get(step) != owner for step in atom_steps):
        bad_owners.append((atom_id, "step_owner_mismatch", owner, atom_steps))
check("ownership.owner_and_method_join", not bad_owners, bad_owners[:100])

# Semantic spot-checks for the duplicate cases where part-order precedence is not
# the same as the atom's actual assessed operation.
expected_owner_overrides = {
    "MP-9618-W24-41-2-C-II-01": "OOP_INSTANTIATE",
    "MP-9618-W24-41-2-C-II-03": "OOP_INSTANTIATE",
    "MP-9618-W24-43-2-C-II-01": "OOP_INSTANTIATE",
    "MP-9618-W24-43-2-C-II-03": "OOP_INSTANTIATE",
    "MP-9618-S24-42-2-B-I-01": "OOP_CLASS",
    "9618_s25_41_3(c)(i).mp.01": "OOP_CLASS",
    "9618_s25_43_3(b)(i).mp.01": "OOP_CLASS",
    "9618_w25_43_1(b)(i).mp.04": "OOP_INSTANTIATE",
}
semantic_owner_mismatches = [
    (atom_id, decisions[atom_id]["owner_pattern_id"], expected)
    for atom_id, expected in expected_owner_overrides.items()
    if decisions.get(atom_id, {}).get("owner_pattern_id") != expected
]
check("ownership.semantic_duplicate_resolution", not semantic_owner_mismatches, semantic_owner_mismatches)
check(
    "marking.authority_boundary_current",
    "remain empty" not in marking_doc.get("authority_boundary", "").lower(),
    marking_doc.get("authority_boundary"),
)

# Cross-artifact method joins and required statuses.
all_steps = set(step_owner)
bad_refs = []
for kind, rows, field in [("error", errors, "method_step_refs"), ("solution", solutions, "ordered_method_step_ids"), ("example", examples, "method_step_refs"), ("visual", visuals, "method_step_refs")]:
    for row in rows:
        for ref in row.get(field, []):
            if ref not in all_steps or step_owner.get(ref) != row["pattern_id"]:
                bad_refs.append((kind, row["pattern_id"], ref, step_owner.get(ref)))
check("joins.method_steps", not bad_refs, bad_refs[:100])
check("status.solutions_stage5", all(row["status"] == "PENDING_STAGE5_EXECUTION_VERIFICATION" for row in solutions), Counter(row["status"] for row in solutions))
check("status.examples_stage5", all(row["status"] == "PENDING_STAGE5_EXECUTION_VERIFICATION" for row in examples), Counter(row["status"] for row in examples))
check("status.visuals_stage7", all(row["status"] == "PENDING_STAGE5_TRACE_AND_STAGE7_STORYBOARD" for row in visuals), Counter(row["status"] for row in visuals))
check("status.assessments_stage6", all(row["status"] == "DESIGNED_NOT_AUTHORED" and row.get("official_marks") is None for row in assessments), Counter(row["status"] for row in assessments))
check("status.cards_design_reviewed", all(row["status"] == "DESIGN_REVIEWED" for row in cards), Counter(row["status"] for row in cards))
check("status.errors_design_reviewed", all(row["status"] == "DESIGN_REVIEWED" for row in errors), Counter(row["status"] for row in errors))

expected_document_statuses = {
    "PATTERN_CARDS.json": "DESIGN_REVIEWED",
    "VARIANT_INVARIANT_REGISTER.json": "DESIGN_REVIEWED",
    "MARKING_MAP.json": "DESIGN_REVIEWED_METHOD_JOIN",
    "MARKING_METHOD_OWNERSHIP.json": "DESIGN_REVIEWED",
    "ERROR_PREVENTION_MATRIX.json": "DESIGN_REVIEWED",
    "SOLUTION_DESIGN_BRIEFS.json": "DESIGN_REVIEWED",
    "WORKED_EXAMPLE_SPECS.json": "DESIGN_REVIEWED",
    "ASSESSMENT_DESIGN_BRIEFS.json": "DESIGN_REVIEWED",
    "PRELIMINARY_VISUAL_BRIEFS.json": "DESIGN_REVIEWED",
    "SOURCE_CAVEAT_CARRYOVER.json": "DESIGN_REVIEWED",
    "GAP_DISPOSITIONS.json": "DESIGN_REVIEWED",
    "STAGE4_COVERAGE_AUDIT.json": "DESIGN_REVIEWED",
}
document_status_mismatches = []
for name, expected in expected_document_statuses.items():
    actual = load(S4 / name).get("status")
    if actual != expected:
        document_status_mismatches.append((name, expected, actual))
check("status.canonical_documents_final", not document_status_mismatches, document_status_mismatches)

expected_schemas = {
    "PATTERN_CARDS.json": "s4-pattern-cards-v1",
    "VARIANT_INVARIANT_REGISTER.json": "s4-variant-register-v1",
    "MARKING_MAP.json": "s4-marking-map-v1",
    "MARKING_METHOD_OWNERSHIP.json": "s4-marking-method-ownership-v1",
    "ERROR_PREVENTION_MATRIX.json": "s4-error-prevention-v1",
    "SOLUTION_DESIGN_BRIEFS.json": "s4-solution-design-v1",
    "WORKED_EXAMPLE_SPECS.json": "s4-worked-example-spec-v1",
    "ASSESSMENT_DESIGN_BRIEFS.json": "s4-assessment-design-v1",
    "PRELIMINARY_VISUAL_BRIEFS.json": "s4-visual-brief-v1",
    "SOURCE_CAVEAT_CARRYOVER.json": "s4-source-caveat-carryover-v1",
    "GAP_DISPOSITIONS.json": "s4-gap-disposition-v1",
    "STAGE4_COVERAGE_AUDIT.json": "s4-coverage-audit-v1",
}
schema_mismatches = []
for name, expected in expected_schemas.items():
    actual = load(S4 / name).get("schema_version")
    if actual != expected:
        schema_mismatches.append((name, expected, actual))
check("schema.canonical_versions", not schema_mismatches, schema_mismatches)

# Bilingual structural parity.
for name, doc in [("cards", cards), ("variants", variants), ("errors", errors), ("solutions", solutions), ("examples", examples), ("assessments", assessments), ("visuals", visuals)]:
    broken = []
    def walk(value, path=""):
        if isinstance(value, dict):
            if "vi" in value or "en" in value:
                if not value.get("vi") or not value.get("en"):
                    broken.append(path)
            for key, child in value.items():
                walk(child, f"{path}.{key}" if path else key)
        elif isinstance(value, list):
            for idx, child in enumerate(value):
                walk(child, f"{path}[{idx}]")
    walk(doc)
    check(f"bilingual.{name}.structural", not broken, broken[:100])

# Semantic VI/EN parity: known repeated Vietnamese placeholders map to many distinct English meanings.
placeholder_findings = {
    "B2_step_and_example_checks": [],
    "B1_error_consequences": [],
    "B1_error_repairs": [],
    "solution_output_contracts": [],
}
b2_placeholder = "Đối chiếu trạng thái này với hợp đồng và bất biến trước khi đi tiếp."
for card in cards:
    for step in card["method_steps"]:
        if step["check"]["vi"] == b2_placeholder:
            placeholder_findings["B2_step_and_example_checks"].append(step["step_id"])
for row in errors:
    if row["consequence"]["vi"] == "Lỗi này phá invariant hoặc hợp đồng state/kết quả của pattern.":
        placeholder_findings["B1_error_consequences"].append(row["error_id"])
    if row["repair_action"]["vi"] == "Quay lại guard/commit liên quan, dựng lại state theo invariant rồi kiểm bằng boundary case.":
        placeholder_findings["B1_error_repairs"].append(row["error_id"])
for row in solutions:
    if isinstance(row["output_contract"], dict) and row["output_contract"].get("vi") == "Kết quả hoặc state cuối phải thỏa invariant đã nêu và giữ đúng hợp đồng nguồn.":
        placeholder_findings["solution_output_contracts"].append(row["pattern_id"])
check("bilingual.semantic_parity", not any(placeholder_findings.values()), placeholder_findings)

# Error-prevention specificity.
generic_error_ids = []
generic_en = {
    "Use normal, boundary and counterexample cases against the invariant.",
    "The invariant or postcondition fails, so the corresponding marking evidence is no longer clear.",
    "Use a boundary counterexample and compare every state with the invariant.",
    "Return to the referenced step, repair its guard or state update, then resume from the last valid state.",
    "Breaks the address domain, storage invariant, or result contract, so related assessed evidence is no longer clear.",
    "Trace a representation-specific boundary case and check address, probe, changed-slot count, and every return path.",
    "Restore the source contract, return to the last valid state, repair guard/probe/sentinel, then retrace to termination.",
}
for row in errors:
    fields = [row["consequence"]["en"], row["detection_check"]["en"], row["repair_action"]["en"]]
    if any(value in generic_en for value in fields):
        generic_error_ids.append(row["error_id"])
check("semantic.error_rows_specific", not generic_error_ids, generic_error_ids)

# Preliminary visuals must remain concrete and distinct by pattern.
triples = defaultdict(list)
for row in visuals:
    triples[(row["normal_case"]["en"], row["boundary_case"]["en"], row["failure_case"]["en"])].append(row["pattern_id"])
duplicate_visuals = [ids for ids in triples.values() if len(ids) > 1]
check("semantic.visual_cases_specific", not duplicate_visuals, duplicate_visuals)

# All 20 Stage 2 confusable contrasts require traceable canonical references.
contrast_ids = {row["id"] for row in confusables["contrasts"]}
card_contrasts = {ref for card in cards for ref in card.get("confusable_contrast_refs", [])}
variant_contrasts = {ref for row in variants for ref in row.get("stage2_contrast_refs", [])}
check("contrasts.cards_20_of_20", card_contrasts == contrast_ids, {"covered": len(card_contrasts), "missing": sorted(contrast_ids-card_contrasts), "extra": sorted(card_contrasts-contrast_ids)})
check("contrasts.variants_20_of_20", variant_contrasts == contrast_ids, {"covered": len(variant_contrasts), "missing": sorted(contrast_ids-variant_contrasts), "extra": sorted(variant_contrasts-contrast_ids)})

# Assessment and gap obligations.
stage3_req_ids = {req for obj in coverage3["objectives"] if obj["scope"] != "excluded" for req in obj["assessment_requirement_ids"]}
design_req_ids = [req for row in assessments for req in row["requirement_ids"]]
coverage_req_ids = [row["requirement_id"] for row in assessment_doc["requirement_coverage"]]
check("assessment.37_designs", len(assessments) == 37, len(assessments))
check("assessment.107_requirements_exact_once", len(design_req_ids) == 107 and len(set(design_req_ids)) == 107 and set(design_req_ids) == stage3_req_ids and coverage_req_ids == design_req_ids, {"design": len(design_req_ids), "unique": len(set(design_req_ids)), "stage3": len(stage3_req_ids), "coverage_rows": len(coverage_req_ids)})
nonexcluded_objectives = {row["objective_id"] for row in coverage3["objectives"] if row["scope"] != "excluded"}
disposition_ids = [row["objective_id"] for row in gaps_doc["objective_dispositions"]]
priority_counts = Counter(row["priority"] for row in gaps_doc["objective_dispositions"])
check("gaps.107_objectives_65_42", len(disposition_ids) == 107 and len(set(disposition_ids)) == 107 and set(disposition_ids) == nonexcluded_objectives and priority_counts == {"AUTHORED_CAPABILITY_CHECK": 65, "TRANSFER_CHECK": 42}, {"rows": len(disposition_ids), "unique": len(set(disposition_ids)), "priorities": dict(priority_counts)})
stage3_book_gaps = {(row["pattern_id"], row["gap"]) for row in gap3["book_specific_gaps"]}
stage4_book_gaps = {(row["pattern_id"], row["gap"]) for row in gaps_doc["book_gap_dispositions"]}
check("gaps.19_book_gaps", len(stage4_book_gaps) == 19 and stage4_book_gaps == stage3_book_gaps, {"stage3": len(stage3_book_gaps), "stage4": len(stage4_book_gaps), "missing": sorted(stage3_book_gaps-stage4_book_gaps)})

# Source caveat joins and excluded syllabus boundaries.
issue_ids = {row["issue_id"] for row in caveats_doc["issues"]}
all_issue_refs = []
def collect_issue_refs(value):
    if isinstance(value, dict):
        for key, child in value.items():
            if key == "source_issue_refs" and isinstance(child, list):
                all_issue_refs.extend(child)
            collect_issue_refs(child)
    elif isinstance(value, list):
        for child in value:
            collect_issue_refs(child)
collect_issue_refs(cards)
collect_issue_refs(marking)
check("source_caveats.references_valid", set(all_issue_refs).issubset(issue_ids) and "S4-S2-LAYOUT-CODE-FIDELITY" not in all_issue_refs, {"issue_ids": len(issue_ids), "referenced": len(set(all_issue_refs)), "unknown": sorted(set(all_issue_refs)-issue_ids)})
check(
    "source_caveats.exact_counts",
    len(issue_ids) == 25
    and caveats_doc["counts"]["occurrences"] == 62
    and caveats_doc["counts"]["affected_parts_unique"] == 61
    and caveats_doc["counts"]["unresolved_source_decisions"] == 0,
    caveats_doc["counts"],
)
excluded_ids = {row["objective_id"] for row in coverage3["objectives"] if row["scope"] == "excluded"}
canonical_text = "\n".join((S4 / name).read_text(encoding="utf-8") for name in ["PATTERN_CARDS.json", "SOLUTION_DESIGN_BRIEFS.json", "ASSESSMENT_DESIGN_BRIEFS.json", "GAP_DISPOSITIONS.json"])
check("scope.excluded_objectives_absent", not any(oid in canonical_text for oid in excluded_ids), sorted(excluded_ids))

# Stage boundaries: forbid affirmative completion claims.
forbidden = [r'"status"\s*:\s*"VERIFIED"', r'"status"\s*:\s*"AUTHORED"', r'tests? pass(?:ed)?', r'execution verified', r'storyboard completed', r'lesson authored']
claim_hits = [pattern for pattern in forbidden if re.search(pattern, canonical_text, flags=re.I)]
check("boundary.no_execution_lesson_storyboard_claims", not claim_hits, claim_hits)

# Canonical and batch hashes recorded by the coverage audit.
canonical_drift = []
for name, expected in audit_doc["canonical_hashes"].items():
    actual = sha(S4 / name)
    if actual != expected:
        canonical_drift.append((name, expected, actual))
batch_drift = []
for batch_id, block in audit_doc["batch_provenance"].items():
    for name, expected in block["artifacts"].items():
        actual = sha(S4 / block["directory"] / name)
        if actual != expected:
            batch_drift.append((batch_id, name, expected, actual))
check("hashes.coverage_audit_current", not canonical_drift and not batch_drift, {"canonical": canonical_drift, "batch": batch_drift})

# Bind the final A8 run to the exact status-promotion transition recorded by Lead.
lead_pass2 = load(S4 / "evidence/lead-review/LEAD_PASS2.json")
final_hash_mismatches = []
for name, expected in lead_pass2["final_design_hashes"].items():
    actual = sha(S4 / name)
    if actual != expected:
        final_hash_mismatches.append((name, expected, actual))
check(
    "lead_pass2.final_hashes_current",
    lead_pass2.get("status") == "PASS"
    and lead_pass2.get("a8_candidate_hashes_verified_before_promotion") is True
    and not final_hash_mismatches
    and sha(S4 / "STAGE4_COVERAGE_AUDIT.json") == lead_pass2.get("coverage_audit_sha256"),
    {"lead_status": lead_pass2.get("status"), "hash_mismatches": final_hash_mismatches},
)

# Every Lead PASS1 report must still cover the exact current batch artifacts.
lead_drift = []
for report_path in sorted((S4 / "evidence/lead-review").glob("B*-PASS1.json")):
    report = load(report_path)
    if report.get("status") != "PASS":
        lead_drift.append((report_path.name, "status", report.get("status")))
    for name, expected in report["artifact_hashes"].items():
        actual = sha(S4 / report["batch_dir"] / name)
        if actual != expected:
            lead_drift.append((report_path.name, name, expected, actual))
check("lead_pass1.hashes_current", not lead_drift, lead_drift)

# Earlier independent QA must be closed and current.
source_qa = load(S4 / "evidence/qa/source/A8_SOURCE_QA.json")
pilot_qa = load(S4 / "evidence/qa/pilot/A8_PILOT_QA.json")
assessment_qa = load(S4 / "evidence/qa/assessment/A8_ASSESSMENT_QA.json")
ownership_qa = load(S4 / "evidence/qa/final/support/A8_MARKING_METHOD_OWNERSHIP_QA.json")
check("prior_qa.source_pass", source_qa.get("status") == "PASS_RECOMMENDED" and all(row["status"] == "CLOSED" for row in source_qa["findings"]), source_qa.get("status"))
check("prior_qa.pilot_pass", pilot_qa.get("status") == "PASS_RECOMMENDED" and all(row["status"] == "CLOSED" for row in pilot_qa["findings"]), pilot_qa.get("status"))
check("prior_qa.assessment_pass", assessment_qa.get("status") == "PASS_RECOMMENDED" and not assessment_qa.get("findings"), assessment_qa.get("status"))
check("prior_qa.ownership_pass", ownership_qa.get("status") == "PASS_RECOMMENDED" and all(row.get("status") == "CLOSED" for row in ownership_qa.get("findings", [])), ownership_qa.get("status"))

failed = [row for row in results if row["status"] == "FAIL"]
output = {"status": "PASS" if not failed else "REWORK", "checks": len(results), "passed": len(results)-len(failed), "failed": len(failed), "results": results}
print(json.dumps(output, ensure_ascii=False, indent=2))
sys.exit(1 if failed else 0)
