#!/usr/bin/env python3
"""Validate Stage 4 B2 search/sort submission against current source joins."""
from __future__ import annotations

import hashlib
import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

try:
    import jsonschema
except ImportError:
    jsonschema = None

HERE = Path(__file__).resolve().parent
STAGE4 = HERE.parents[2]
PLANNING = STAGE4.parent
ROOT = PLANNING.parent
CATALOG = PLANNING / "stage-2" / "EXAM_PATTERN_CATALOG.json"
MAPPING = PLANNING / "stage-3" / "BOOK_KNOWLEDGE_MAP.json"
SUPPORT = [
    PLANNING / "stage-2" / "QUESTION_PATTERN_MAP.json",
    PLANNING / "stage-2" / "CONFUSABLE_PATTERNS.json",
    PLANNING / "stage-3" / "COVERAGE_MATRIX.json",
    PLANNING / "stage-3" / "LESSON_PACKAGES.json",
    PLANNING / "stage-1" / "SOURCE_ISSUES.json",
    STAGE4 / "schemas" / "pattern-card.schema.json",
    STAGE4 / "schemas" / "error-prevention.schema.json",
    STAGE4 / "schemas" / "design-briefs.schema.json",
]
MARKING = [
    STAGE4 / "evidence" / "marking" / "2021-2022" / "MARKING_SUBMISSION.json",
    STAGE4 / "evidence" / "marking" / "2023-2024" / "MARKING_SUBMISSION.json",
    STAGE4 / "evidence" / "marking" / "2025" / "MARKING_SUBMISSION.json",
]
RISKS = [p.with_name("SOURCE_RISK_REGISTER.json") for p in MARKING]
PATTERNS = ["ORDERED_INSERT", "LINEAR_SEARCH", "COUNT_OCCURRENCES", "FILTER_RECORDS", "GROUP_AGGREGATE", "BUBBLE_SORT", "INSERTION_SORT", "BINARY_SEARCH"]
OVERRIDES = {
    "9618_w22_41_1(c)": {1, 4, 5, 6, 7}, "9618_w22_43_1(c)": {1, 4, 5, 6, 7},
    "9618_w22_42_2(e)": {2, 3, 5, 6}, "9618_s23_42_3(d)": {4, 5},
    "9618_s24_41_2(e)(ii)": {2}, "9618_s24_43_2(e)(ii)": {2},
    "9618_s24_42_1(c)(i)": {3, 5},
}

def load(path): return json.loads(path.read_text(encoding="utf-8"))
def sha(path): return hashlib.sha256(path.read_bytes()).hexdigest()
def rows_of(doc): return doc.get("rows") or doc.get("parts") or []
def row_id(row): return row.get("part_id") or row.get("question_part_id")
def atom_id(atom): return atom.get("marking_point_id") or atom.get("atom_id")
def suffix(atom):
    match = re.search(r"(?:-|\.)(\d{2})$", atom_id(atom))
    return int(match.group(1)) if match else None
def applicable(row):
    atoms = row.get("marking_points") or row.get("award_atoms") or []
    allowed = OVERRIDES.get(row_id(row))
    return atoms if allowed is None else [a for a in atoms if suffix(a) in allowed]
def nonempty_bi(value): return isinstance(value, dict) and all(isinstance(value.get(k), str) and value[k].strip() for k in ("vi", "en"))

def main():
    checks, errors = [], []
    def check(name, condition, detail=""):
        checks.append({"check": name, "pass": bool(condition), "detail": detail})
        if not condition: errors.append(f"{name}: {detail}")

    docs = [load(p) for p in MARKING]
    batches = ("2021-2022", "2023-2024", "2025")
    all_rows = {}
    for doc, batch in zip(docs, batches):
        for row in rows_of(doc):
            row["source_batch"] = batch
            all_rows[row_id(row)] = row
    catalog = load(CATALOG)
    catalog_rows = {p["pattern_id"]: p for p in catalog["patterns"]}
    mapping = load(MAPPING)
    chains = {p["pattern_id"]: p for p in mapping["pattern_chains"]}
    cards_doc = load(HERE / "PATTERN_CARDS.json")
    cards = cards_doc["pattern_cards"]
    cards_by = {c["pattern_id"]: c for c in cards}
    variants = load(HERE / "VARIANT_INVARIANT_REGISTER.json")["variants"]
    errors_doc = load(HERE / "ERROR_PREVENTION.json")
    error_rows = errors_doc["error_rows"]
    designs = load(HERE / "SOLUTION_DESIGNS.json")["solution_designs"]
    examples = load(HERE / "WORKED_EXAMPLE_SPECS.json")["worked_example_specs"]
    visuals = load(HERE / "VISUAL_BRIEFS.json")["visual_briefs"]

    check("exact_pattern_set", list(cards_by) == PATTERNS, str(list(cards_by)))
    check("eight_cards", len(cards) == 8, str(len(cards)))
    check("twelve_variants", len(variants) == 12, str(len(variants)))
    check("twenty_four_errors", len(error_rows) == 24, str(len(error_rows)))
    check("eight_designs_examples_visuals", len(designs) == len(examples) == len(visuals) == 8, f"{len(designs)}/{len(examples)}/{len(visuals)}")
    check("top_status_submitted", all(load(HERE / f)["status"] == "SUBMITTED" for f in ["PATTERN_CARDS.json", "VARIANT_INVARIANT_REGISTER.json", "ERROR_PREVENTION.json", "SOLUTION_DESIGNS.json", "WORKED_EXAMPLE_SPECS.json", "VISUAL_BRIEFS.json"]), "")

    expected_all, owned_all, step_owned_all = [], [], []
    expected_issue_refs = defaultdict(set)
    for rd in [load(p) for p in RISKS]:
        for instance in rd.get("instances", []):
            expected_issue_refs[instance.get("part_id") or instance.get("question_part_id")].add(instance["source_issue_id"])
        for risk in rd.get("risks", []):
            rid = risk.get("risk_id") or risk.get("issue_id")
            for pid in risk.get("affected_part_ids") or risk.get("part_ids") or []:
                expected_issue_refs[pid].add(rid)

    for pattern in PATTERNS:
        card = cards_by[pattern]
        expected_parts = catalog_rows[pattern]["assessed_part_ids"]
        got_parts = card["source_scope"]["assessed_part_ids"]
        check(f"{pattern}.assessed_parts_exact", got_parts == expected_parts, f"expected {len(expected_parts)}, got {len(got_parts)}")
        check(f"{pattern}.stage3_chain", card["lesson_id"] == chains[pattern]["lesson_id"] and card["package_id"] == chains[pattern]["package_id"] and card["knowledge_block_ids"] == chains[pattern]["knowledge_block_ids"], "")
        refs = card["source_scope"]["official_source_refs"]
        check(f"{pattern}.source_ref_count", len(refs) == len(expected_parts), f"{len(refs)} vs {len(expected_parts)}")
        live_ref = True
        for ref in refs:
            row = all_rows.get(ref["part_id"])
            if not row or ref["part_id"] not in expected_parts:
                live_ref = False; continue
            if ref["qp_locator"] != {"source_id": row["qp_requirement"]["source_id"], "pdf_pages": row["qp_requirement"]["pdf_pages"]}:
                live_ref = False
            atom_map = {atom_id(a): a for a in applicable(row)}
            if set(a["marking_point_id"] for a in ref["ms_atoms"]) != set(atom_map):
                live_ref = False
            for a in ref["ms_atoms"]:
                src = atom_map.get(a["marking_point_id"])
                if not src or a["source_id"] != src["ms_source_id"] or a["pdf_pages"] != src["ms_pdf_pages"]:
                    live_ref = False
        check(f"{pattern}.locators_live", live_ref, "QP/MS ids, pages, and applicable atoms match current submissions")
        expected = [atom_id(a) for pid in expected_parts for a in applicable(all_rows[pid])]
        expected_all.extend(expected)
        owned = card["marking_point_refs"]
        owned_all.extend(owned)
        step_owned = [ref for s in card["method_steps"] for ref in s.get("marking_point_refs", [])]
        step_owned_all.extend(step_owned)
        check(f"{pattern}.atom_set_exact", Counter(owned) == Counter(expected), f"expected {len(expected)}, got {len(owned)}")
        check(f"{pattern}.step_atom_ownership_once", Counter(step_owned) == Counter(expected), f"expected {len(expected)}, got {len(step_owned)}")
        seq = [s["sequence"] for s in card["method_steps"]]
        check(f"{pattern}.step_sequence", seq == list(range(1, len(seq)+1)), str(seq))
        check(f"{pattern}.method_bilingual", all(nonempty_bi(s["action"]) and nonempty_bi(s["why"]) and nonempty_bi(s["check"]) for s in card["method_steps"]), "")
        check(f"{pattern}.method_specific_fields", all(s["invariant"].strip() and s["guard"].strip() and s["termination_role"].strip() for s in card["method_steps"]), "")
        issue_union = set().union(*(expected_issue_refs[pid] for pid in expected_parts)) | set(r for pid in expected_parts for r in all_rows[pid].get("source_issue_refs", []))
        check(f"{pattern}.source_issues_current", set(card["source_issue_refs"]) == issue_union, f"expected {sorted(issue_union)}, got {card['source_issue_refs']}")

    check("global_atom_ownership_unique", len(owned_all) == len(set(owned_all)), f"{len(owned_all)} refs / {len(set(owned_all))} unique")
    check("global_step_atom_ownership_unique", len(step_owned_all) == len(set(step_owned_all)), f"{len(step_owned_all)} refs / {len(set(step_owned_all))} unique")
    check("part_link_count_48", sum(len(c["source_scope"]["assessed_part_ids"]) for c in cards) == 48, "")
    decision_rules = [(c["applicability"]["decision_rule"]["vi"], c["applicability"]["decision_rule"]["en"]) for c in cards]
    check("decision_rules_pattern_specific", len(decision_rules) == len(set(decision_rules)) == len(PATTERNS), "duplicate bilingual decision rule detected" if len(decision_rules) != len(set(decision_rules)) else "8 distinct rules")

    variant_patterns = set(p for v in variants for p in v["pattern_ids"])
    check("variants_cover_all_patterns", variant_patterns == set(PATTERNS), str(sorted(variant_patterns)))
    contrast_ids = set(r for v in variants for r in v["stage2_contrast_refs"])
    check("required_stage2_contrasts", {"A3C07", "A3C08", "A3C10", "A3C13", "A3C20"}.issubset(contrast_ids), str(sorted(contrast_ids)))
    axes = " ".join(v["axis"] for v in variants).lower()
    check("variant_controls_preserved", all(token in axes for token in ["linear-vs-binary", "iterative-recursive", "inclusive-bounds", "adjacent-passes-vs-sorted-prefix", "existing-new-group", "compound-predicate"]), axes)
    check("variant_bilingual", all(nonempty_bi(v["decision_rule"]) and v["invariant"].strip() and v["cases"] for v in variants), "")

    err_by = Counter(e["pattern_id"] for e in error_rows)
    check("three_errors_per_pattern", all(err_by[p] == 3 for p in PATTERNS), str(err_by))
    check("errors_bilingual_detect_repair", all(nonempty_bi(e["likely_error"]) and nonempty_bi(e["consequence"]) and nonempty_bi(e["detection_check"]) and nonempty_bi(e["repair_action"]) for e in error_rows), "")
    check("no_exact_mark_loss_claim", all(e.get("exact_mark_loss_claim") is None for e in error_rows), "")

    design_by = {d["pattern_id"]: d for d in designs}
    check("design_status_pending_stage5", all(d["status"] == "PENDING_STAGE5_EXECUTION_VERIFICATION" for d in designs), "")
    check("design_steps_exact", all(d["ordered_method_step_ids"] == [s["step_id"] for s in cards_by[p]["method_steps"]] for p,d in design_by.items()), "")
    check("source_issue_dispositions", all(set(x["source_issue_id"] for x in d["source_issue_dispositions"]) == set(cards_by[d["pattern_id"]]["source_issue_refs"]) for d in designs), "")
    check("stage5_fixture_categories", all(set(d["stage5_test_obligations"]) == {"normal", "boundary", "counterexample", "source_fixture"} for d in designs), "")

    ex_by = {e["pattern_id"]: e for e in examples}
    check("one_anchor_per_pattern", set(ex_by) == set(PATTERNS) and all(e["anchor_source"]["part_id"] in cards_by[p]["source_scope"]["assessed_part_ids"] for p,e in ex_by.items()), "")
    check("examples_pending_and_no_run_claims", all(e["status"] == "PENDING_STAGE5_EXECUTION_VERIFICATION" and e["prohibited_stage4_claims"] for e in examples), "")

    vis_by = {v["pattern_id"]: v for v in visuals}
    event_lists = [tuple(v["proposed_event_types"]) for v in visuals]
    learning_questions = [(v["learning_question"]["vi"], v["learning_question"]["en"]) for v in visuals]
    check("one_visual_per_pattern", set(vis_by) == set(PATTERNS), "")
    check("visuals_pattern_specific", len(event_lists) == len(set(event_lists)) and all(len(x) >= 4 for x in event_lists), "")
    check("learning_questions_pattern_specific", len(learning_questions) == len(set(learning_questions)) == len(PATTERNS), "duplicate bilingual learning question detected" if len(learning_questions) != len(set(learning_questions)) else "8 distinct questions")
    check("visuals_bilingual_cases", all(nonempty_bi(v["learning_question"]) and nonempty_bi(v["predict_prompt"]) and nonempty_bi(v["normal_case"]) and nonempty_bi(v["boundary_case"]) and nonempty_bi(v["failure_case"]) and nonempty_bi(v["static_fallback"]) for v in visuals), "")
    check("visual_status_pending_stage7", all(v["status"] == "PENDING_STAGE5_TRACE_AND_STAGE7_STORYBOARD" and v["visual_mode"] == "event_driven" for v in visuals), "")

    input_paths = [CATALOG, *SUPPORT[:2], MAPPING, *SUPPORT[2:5], *MARKING, *RISKS, *SUPPORT[5:]]
    expected_hashes = [{"path": str(p.relative_to(PLANNING)).replace("\\", "/"), "sha256": sha(p)} for p in input_paths]
    check("input_hashes_current", cards_doc["input_hashes"] == expected_hashes, "")
    check("no_executable_claims", not any(token in (HERE / f).read_text(encoding="utf-8").lower() for f in ["PATTERN_CARDS.json", "SOLUTION_DESIGNS.json", "WORKED_EXAMPLE_SPECS.json", "VISUAL_BRIEFS.json"] for token in ["execution verified", "executed successfully", "all tests passed"]), "")

    if jsonschema:
        card_schema = load(STAGE4 / "schemas" / "pattern-card.schema.json")
        err_schema = load(STAGE4 / "schemas" / "error-prevention.schema.json")
        schema_errors = []
        for card in cards:
            try: jsonschema.validate(card, card_schema)
            except Exception as exc: schema_errors.append(f"card {card['pattern_id']}: {exc.message}")
        for err in error_rows:
            try: jsonschema.validate(err, err_schema)
            except Exception as exc: schema_errors.append(f"error {err['error_id']}: {exc.message}")
        check("json_schema_cards_errors", not schema_errors, "; ".join(schema_errors))
    else:
        check("json_schema_cards_errors", True, "jsonschema unavailable; structural checks used")

    result = {
        "schema_version": "s4-schema-v1", "status": "PASS" if not errors else "FAIL",
        "batch_id": "B2-search-sort", "summary": {"checks": len(checks), "passed": sum(c["pass"] for c in checks), "failed": len(errors), "patterns": len(cards), "assessed_part_links": sum(len(c["source_scope"]["assessed_part_ids"]) for c in cards), "unique_parts": len(set(pid for c in cards for pid in c["source_scope"]["assessed_part_ids"])), "owned_official_atoms": len(owned_all), "method_steps": sum(len(c["method_steps"]) for c in cards), "variants": len(variants), "errors": len(error_rows), "designs": len(designs), "worked_examples": len(examples), "visuals": len(visuals)},
        "checks": checks, "errors": errors,
    }
    (HERE / "VALIDATION.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"status": result["status"], **result["summary"]}, ensure_ascii=False))
    if errors:
        for err in errors: print("FAIL:", err)
        return 1
    return 0

if __name__ == "__main__":
    sys.exit(main())
