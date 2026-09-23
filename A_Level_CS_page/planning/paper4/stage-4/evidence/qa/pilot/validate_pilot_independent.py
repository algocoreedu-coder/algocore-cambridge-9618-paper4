#!/usr/bin/env python3
"""Independent, read-only QA checks for the Stage 4 P0 Stack pilot."""

from __future__ import annotations

import hashlib
import json
import re
import sys
from collections import Counter
from pathlib import Path


HERE = Path(__file__).resolve().parent
PAPER4 = HERE.parents[3]
PILOT = PAPER4 / "stage-4/evidence/method/P0-stack"
PATTERNS = {"STACK_SETUP", "STACK_PUSH", "STACK_POP", "STACK_PAIR", "STACK_REDUCE"}
FILES = {
    "cards": "PATTERN_CARDS.json",
    "variants": "VARIANT_INVARIANT_REGISTER.json",
    "errors": "ERROR_PREVENTION.json",
    "solutions": "SOLUTION_DESIGNS.json",
    "examples": "WORKED_EXAMPLE_SPECS.json",
    "visuals": "VISUAL_BRIEFS.json",
}


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


checks: list[dict] = []


def check(check_id: str, ok: bool, detail: str) -> None:
    checks.append({"check_id": check_id, "status": "PASS" if ok else "FAIL", "detail": detail})


docs = {key: load(PILOT / name) for key, name in FILES.items()}
cards = docs["cards"]["pattern_cards"]
variants = docs["variants"]["variants"]
errors = docs["errors"]["error_rows"]
solutions = docs["solutions"]["solution_designs"]
examples = docs["examples"]["worked_example_specs"]
visuals = docs["visuals"]["visual_briefs"]

# All six generated artifacts must be built from the same live inputs.
for key, doc in docs.items():
    drift = []
    for item in doc.get("input_hashes", []):
        path = PAPER4 / item["path"]
        actual = sha(path) if path.exists() else "MISSING"
        if actual != item["sha256"]:
            drift.append({"path": item["path"], "recorded": item["sha256"], "actual": actual})
    check(f"inputs.{key}.no_drift", not drift, json.dumps(drift, ensure_ascii=False))

# Independent required-field and enum checks derived from the locked JSON schemas.
required = {
    "cards": {"card_id", "pattern_id", "version", "status", "package_id", "lesson_id", "titles", "recognition", "source_scope", "applicability", "method_steps", "authority_labels", "downstream_status"},
    "errors": {"error_id", "pattern_id", "requirement_refs", "method_step_refs", "likely_error", "consequence", "detection_check", "repair_action", "basis", "authority_note", "status"},
    "solutions": {"solution_design_id", "pattern_id", "input_contract", "output_contract", "state_model", "preconditions", "postconditions", "invariants", "ordered_method_step_ids", "stage5_test_obligations", "status"},
    "visuals": {"visual_brief_id", "pattern_id", "method_step_refs", "learning_question", "visual_mode", "state_to_show", "proposed_event_types", "predict_prompt", "static_fallback", "status"},
}
for key, rows in [("cards", cards), ("errors", errors), ("solutions", solutions), ("visuals", visuals)]:
    missing = [{"index": idx, "fields": sorted(required[key] - set(row))} for idx, row in enumerate(rows) if required[key] - set(row)]
    check(f"schema.{key}.required_fields", not missing, json.dumps(missing, ensure_ascii=False))
check("schema.cards.status", all(row["status"] in {"DRAFT", "SUBMITTED", "NEEDS_REWORK", "DESIGN_REVIEWED"} for row in cards), str([row["status"] for row in cards]))
check("schema.errors.basis", all(row["basis"] in {"official_qp_ms", "official_er_observation", "source_issue", "AlgoCore_inference", "AlgoCore_risk"} for row in errors), str([row["basis"] for row in errors]))

for label, rows, id_key in [
    ("cards", cards, "pattern_id"),
    ("solutions", solutions, "pattern_id"),
    ("examples", examples, "pattern_id"),
    ("visuals", visuals, "pattern_id"),
]:
    ids = [row[id_key] for row in rows]
    check(f"set.{label}.five_patterns", len(ids) == 5 and set(ids) == PATTERNS and len(ids) == len(set(ids)), str(ids))

# Stage 2 is the authority for the exact assessed part-pattern relation set.
stage2 = load(PAPER4 / "stage-2/QUESTION_PATTERN_MAP.json")
expected_relations = {
    (row["part_id"], pattern)
    for row in stage2["rows"]
    for pattern in row["assessed_pattern_ids"]
    if pattern in PATTERNS
}
actual_relations = {
    (part_id, card["pattern_id"])
    for card in cards
    for part_id in card["source_scope"]["assessed_part_ids"]
}
check(
    "coverage.part_pattern_relations",
    actual_relations == expected_relations and len(actual_relations) == 27,
    f"actual={len(actual_relations)}, expected={len(expected_relations)}, missing={sorted(expected_relations-actual_relations)}, extra={sorted(actual_relations-expected_relations)}",
)
check("coverage.unique_parts", len({part for part, _ in actual_relations}) == 25, str(len({part for part, _ in actual_relations})))

# Load current marking sources and compare every embedded official atom field.
source_parts = {}
for batch in ("2021-2022", "2023-2024", "2025"):
    doc = load(PAPER4 / f"stage-4/evidence/marking/{batch}/MARKING_SUBMISSION.json")
    for row in doc.get("parts", doc.get("rows", [])):
        source_parts[row["part_id"]] = row

atom_occurrences = []
atom_diffs = []
embedded_by_part: dict[str, set[str]] = {}
compare_fields = (
    "criterion_paraphrase",
    "award_semantics",
    "condition",
    "alternatives",
    "dependency",
    "source_mark_value_if_unambiguous",
    "group_id",
    "group_max",
    "source_issue_refs",
)
for card in cards:
    expected_parts = {part for part, pattern in expected_relations if pattern == card["pattern_id"]}
    refs = {part["part_id"]: part for part in card["source_scope"]["official_source_refs"]}
    check(f"coverage.{card['pattern_id']}.official_source_refs", set(refs) == expected_parts, f"actual={sorted(refs)}, expected={sorted(expected_parts)}")
    for part_id, rep in refs.items():
        canonical = source_parts[part_id]
        check(
            f"locator.{card['pattern_id']}.{part_id}.qp",
            rep["qp_locator"]["source_id"] == canonical["qp_requirement"]["source_id"]
            and rep["qp_locator"]["pdf_pages"] == canonical["qp_requirement"]["pdf_pages"],
            json.dumps(rep["qp_locator"], ensure_ascii=False),
        )
        current_atoms = {atom["marking_point_id"]: atom for atom in canonical["marking_points"]}
        embedded_atoms = {atom["marking_point_id"]: atom for atom in rep["ms_atoms"]}
        embedded_by_part.setdefault(part_id, set()).update(embedded_atoms)
        for atom_id, embedded in embedded_atoms.items():
            atom_occurrences.append((part_id, atom_id))
            current = current_atoms.get(atom_id)
            if current is None:
                continue
            if embedded.get("source_id") != current.get("ms_source_id") or embedded.get("pdf_pages") != current.get("ms_pdf_pages"):
                atom_diffs.append({"part_id": part_id, "marking_point_id": atom_id, "kind": "locator"})
            for field in compare_fields:
                if embedded.get(field) != current.get(field):
                    atom_diffs.append(
                        {
                            "part_id": part_id,
                            "marking_point_id": atom_id,
                            "field": field,
                            "embedded": embedded.get(field),
                            "current": current.get(field),
                        }
                    )
for part_id in {part for part, _ in expected_relations}:
    current_ids = {atom["marking_point_id"] for atom in source_parts[part_id]["marking_points"]}
    if embedded_by_part.get(part_id, set()) != current_ids:
        atom_diffs.append(
            {
                "part_id": part_id,
                "kind": "cross_card_id_union",
                "current": sorted(current_ids),
                "embedded": sorted(embedded_by_part.get(part_id, set())),
            }
        )
check("coverage.atom_ownership_count", len(atom_occurrences) == 91, str(len(atom_occurrences)))
check("coverage.atom_ownership_unique", len(atom_occurrences) == len(set(atom_occurrences)), f"duplicates={len(atom_occurrences)-len(set(atom_occurrences))}")
check("source.embedded_atoms_match_live", not atom_diffs, json.dumps(atom_diffs, ensure_ascii=False))

# Check bilingual parity recursively for all explicit bilingual objects.
for label, rows in [("cards", cards), ("errors", errors), ("solutions", solutions), ("examples", examples), ("visuals", visuals), ("variants", variants)]:
    broken = []

    def walk(value, path=""):
        if isinstance(value, dict):
            if "vi" in value or "en" in value:
                if set(value).issuperset({"vi", "en"}) is False or not str(value.get("vi", "")).strip() or not str(value.get("en", "")).strip():
                    broken.append(path)
            for key, child in value.items():
                walk(child, f"{path}.{key}" if path else key)
        elif isinstance(value, list):
            for idx, child in enumerate(value):
                walk(child, f"{path}[{idx}]")

    walk(rows)
    check(f"parity.{label}", not broken, str(broken))

# Cross-artifact references.
step_ids = {step["step_id"] for card in cards for step in card["method_steps"]}
error_ids = {row["error_id"] for row in errors}
bad_step_refs = []
for collection_name, rows in [("errors", errors), ("solutions", solutions), ("examples", examples), ("visuals", visuals)]:
    for row in rows:
        refs = row.get("method_step_refs", row.get("ordered_method_step_ids", []))
        for ref in refs:
            if ref not in step_ids:
                bad_step_refs.append((collection_name, row.get("pattern_id"), ref))
check("joins.method_steps", not bad_step_refs, str(bad_step_refs))
bad_error_refs = [(row["visual_brief_id"], ref) for row in visuals for ref in row["error_refs"] if ref not in error_ids]
check("joins.visual_errors", not bad_error_refs, str(bad_error_refs))

# Required downstream boundaries and absence of execution claims.
check(
    "boundary.solutions_stage5",
    all(row["status"] == "PENDING_STAGE5_EXECUTION_VERIFICATION" for row in solutions),
    str([row["status"] for row in solutions]),
)
check(
    "boundary.visuals_stage7",
    all(row["status"] == "PENDING_STAGE5_TRACE_AND_STAGE7_STORYBOARD" and row["visual_mode"] == "event_driven" for row in visuals),
    str([(row["pattern_id"], row["status"], row["visual_mode"]) for row in visuals]),
)
serialized = "\n".join((PILOT / name).read_text(encoding="utf-8") for name in FILES.values())
forbidden_claims = [r"tests? pass(?:ed)?", r"runtime output (?:is|was|verified)", r"certified executable", r"execution verified"]
hits = [pattern for pattern in forbidden_claims if re.search(pattern, serialized, flags=re.I)]
check("boundary.no_execution_claims", not hits, str(hits))

# Required semantic decisions.
top = next(row for row in variants if row["variant_id"] == "p0.stack.variant.top-pointer")
case = {row["case_id"]: row for row in top["cases"]}
check(
    "semantic.top_pointer_variants",
    case["next_free"]["empty"] == "top=0"
    and case["next_free"]["full"] == "top=capacity"
    and "write stack[top], then top+=1" == case["next_free"]["push"]
    and case["current_top"]["empty"] == "top=-1"
    and case["current_top"]["full"] == "top=capacity-1"
    and case["current_top"]["push"] == "top+=1, then write stack[top]",
    json.dumps(case, ensure_ascii=False),
)
pair = next(row for row in variants if row["variant_id"] == "p0.stack.variant.pair-transaction")
pair_cases = {row["case_id"]: row["state_change"] for row in pair["cases"]}
pair_text = json.dumps(pair, ensure_ascii=False)
check(
    "semantic.pair_four_cases",
    set(pair_cases) == {"both_live", "a_empty_b_live", "a_live_b_empty", "both_empty"}
    and "restore B" in pair_cases["a_empty_b_live"]
    and "restore A" in pair_cases["a_live_b_empty"]
    and ("no net mutation" in pair_cases["both_empty"] or "no mutation" in pair_cases["both_empty"])
    and pair.get("lead_adjudication", {}).get("authority") == "AlgoCore_inference"
    and "no sentinel" in pair_text.lower(),
    json.dumps(pair_cases, ensure_ascii=False),
)
reduce = next(row for row in variants if row["variant_id"] == "p0.stack.variant.reduce-protocol")
reduce_cases = {row["case_id"]: row for row in reduce["cases"]}
check(
    "semantic.reduce_order_termination",
    reduce_cases["expression_left_fold"]["operator_order"] == "total_before operator next_number"
    and reduce_cases["expression_left_fold"]["termination"] == "empty after complete pairs"
    and reduce_cases["extrema"]["termination"] == "Pop until empty",
    json.dumps(reduce_cases, ensure_ascii=False),
)

# Source-issue/policy boundary.
old_issue_paths = []

def find_old_issue(value, path=""):
    if isinstance(value, dict):
        for key, child in value.items():
            find_old_issue(child, f"{path}.{key}" if path else key)
    elif isinstance(value, list):
        for idx, child in enumerate(value):
            find_old_issue(child, f"{path}[{idx}]")
    elif value == "S4-S2-LAYOUT-CODE-FIDELITY":
        old_issue_paths.append(path)


for key, doc in docs.items():
    find_old_issue(doc, key)
check("authority.old_fake_source_issue_removed", not old_issue_paths, str(old_issue_paths))
policies = [policy for card in cards for policy in card.get("source_fidelity_policies", [])]
check(
    "authority.fidelity_policy_non_source",
    bool(policies) and all(policy.get("policy_id") == "S4-S2-POLICY-LAYOUT-CODE-FIDELITY" and policy.get("is_source_issue") is False for policy in policies),
    json.dumps(policies, ensure_ascii=False),
)

# Semantic consistency: a completed Lead decision must not still be described as pending.
pending_decision_paths = []
for path, text_value in [
    ("VARIANT_INVARIANT_REGISTER.json:pair.both_empty.state_change", pair_cases.get("both_empty", "")),
    (
        "ERROR_PREVENTION.json:p0.stack.stack-pair.error.both-empty-sentinel-push.authority_note",
        next(row for row in errors if row["error_id"].endswith("both-empty-sentinel-push"))["authority_note"],
    ),
]:
    if re.search(r"requires Lead adjudication|Lead adjudication is requested", text_value, flags=re.I):
        pending_decision_paths.append(path)
check("semantic.pair_decision_not_pending", not pending_decision_paths, str(pending_decision_paths))

# Visual cases must be specific to the pattern, rather than copied template text.
case_signatures = Counter(
    (
        row["normal_case"]["en"],
        row["boundary_case"]["en"],
        row["failure_case"]["en"],
    )
    for row in visuals
)
templated_visuals = [
    row["visual_brief_id"]
    for row in visuals
    if case_signatures[(row["normal_case"]["en"], row["boundary_case"]["en"], row["failure_case"]["en"])] > 1
]
check("semantic.visual_cases_pattern_specific", not templated_visuals, str(templated_visuals))

failed = [row for row in checks if row["status"] == "FAIL"]
print(json.dumps({"status": "PASS" if not failed else "REWORK", "checks": len(checks), "passed": len(checks) - len(failed), "failed": len(failed), "results": checks}, ensure_ascii=False, indent=2))
sys.exit(1 if failed else 0)
