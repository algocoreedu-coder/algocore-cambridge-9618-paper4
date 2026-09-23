from __future__ import annotations

import argparse
import hashlib
import json
from collections import Counter
from pathlib import Path

import jsonschema


S4 = Path(__file__).resolve().parents[1]
PAPER4 = S4.parent
WORKSPACE = PAPER4.parents[3]


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def digest(path: Path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def resolve_input(rel: str) -> Path:
    candidates = [S4 / rel, PAPER4 / rel, WORKSPACE / rel]
    for path in candidates:
        if path.exists():
            return path
    raise FileNotFoundError(rel)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("batch_id")
    parser.add_argument("batch_dir")
    args = parser.parse_args()
    batch_dir = Path(args.batch_dir).resolve()
    plan = load(S4 / "BATCH_PLAN.json")
    expected = next(x["pattern_ids"] for x in plan["method_batches"] if x["batch_id"] == args.batch_id)
    files = {
        "cards": ("PATTERN_CARDS.json", ("pattern_cards",)),
        "variants": ("VARIANT_INVARIANT_REGISTER.json", ("variants",)),
        "errors": ("ERROR_PREVENTION.json", ("error_rows", "errors")),
        "solutions": ("SOLUTION_DESIGNS.json", ("solution_designs",)),
        "examples": ("WORKED_EXAMPLE_SPECS.json", ("worked_example_specs",)),
        "visuals": ("VISUAL_BRIEFS.json", ("visual_briefs",)),
    }
    docs = {name: load(batch_dir / fn) for name, (fn, _) in files.items()}
    arrays = {name: next(docs[name][key] for key in keys if key in docs[name]) for name, (_, keys) in files.items()}
    cards = arrays["cards"]
    catalog = load(PAPER4 / "stage-2" / "EXAM_PATTERN_CATALOG.json")
    patterns = catalog.get("patterns", catalog.get("pattern_catalog", []))
    expected_parts = {x["pattern_id"]: set(x["assessed_part_ids"]) for x in patterns}
    marking = load(S4 / "MARKING_MAP.json")
    valid_atoms = {p["marking_point_id"] for row in marking["rows"] for p in row["marking_points"]}
    issue_data = load(S4 / "SOURCE_CAVEAT_CARRYOVER.json")
    valid_issues = {x.get("issue_id", x.get("source_issue_id")) for x in issue_data["issues"]}

    checks = []
    def check(name, passed, detail):
        checks.append({"check": name, "passed": bool(passed), "detail": detail})

    actual = [c["pattern_id"] for c in cards]
    check("pattern_set_exact", set(actual) == set(expected) and len(actual) == len(set(actual)), {"expected": expected, "actual": actual})
    check("one_solution_per_pattern", Counter(x["pattern_id"] for x in arrays["solutions"]) == Counter(expected), len(arrays["solutions"]))
    check("one_example_per_pattern", Counter(x["pattern_id"] for x in arrays["examples"]) == Counter(expected), len(arrays["examples"]))
    check("one_visual_per_pattern", Counter(x["pattern_id"] for x in arrays["visuals"]) == Counter(expected), len(arrays["visuals"]))
    check("variant_patterns_in_batch", all(set(x["pattern_ids"]) <= set(expected) for x in arrays["variants"]), len(arrays["variants"]))
    check("errors_patterns_in_batch", all(x["pattern_id"] in expected for x in arrays["errors"]), len(arrays["errors"]))

    schema_cards = load(S4 / "schemas" / "pattern-card.schema.json")
    schema_errors = load(S4 / "schemas" / "error-prevention.schema.json")
    schema_failures = []
    for kind, arr, schema in [("card", cards, schema_cards), ("error", arrays["errors"], schema_errors)]:
        for item in arr:
            try:
                jsonschema.validate(item, schema)
            except Exception as exc:
                schema_failures.append({"kind": kind, "id": item.get("pattern_id") or item.get("error_id"), "error": exc.message})
    check("item_schemas", not schema_failures, schema_failures[:20])

    coverage_failures = []
    for card in cards:
        pid = card["pattern_id"]
        actual_parts = set(card["source_scope"]["assessed_part_ids"])
        if actual_parts != expected_parts.get(pid, set()):
            coverage_failures.append({"pattern_id": pid, "missing": sorted(expected_parts.get(pid, set()) - actual_parts), "extra": sorted(actual_parts - expected_parts.get(pid, set()))})
    check("assessed_part_sets_exact", not coverage_failures, coverage_failures)

    atom_refs = [mp for card in cards for mp in card.get("marking_point_refs", [])]
    check("marking_refs_exist", set(atom_refs) <= valid_atoms, sorted(set(atom_refs) - valid_atoms))
    check("marking_refs_unique_in_batch", len(atom_refs) == len(set(atom_refs)), [x for x, n in Counter(atom_refs).items() if n > 1][:50])
    issue_refs = [x for card in cards for x in card.get("source_issue_refs", [])]
    check("source_issue_refs_valid", set(issue_refs) <= valid_issues, sorted(set(issue_refs) - valid_issues))
    check("fidelity_policy_not_source_issue", "S4-S2-LAYOUT-CODE-FIDELITY" not in issue_refs and "S4-S2-POLICY-LAYOUT-CODE-FIDELITY" not in issue_refs, issue_refs)

    step_ids = [s["step_id"] for c in cards for s in c["method_steps"]]
    check("step_ids_unique", len(step_ids) == len(set(step_ids)), [x for x, n in Counter(step_ids).items() if n > 1])
    check("card_steps_minimum", all(len(c["method_steps"]) >= 2 for c in cards), [(c["pattern_id"], len(c["method_steps"])) for c in cards])
    check("step_sequences_contiguous", all([s["sequence"] for s in c["method_steps"]] == list(range(1, len(c["method_steps"]) + 1)) for c in cards), [(c["pattern_id"], [s["sequence"] for s in c["method_steps"]]) for c in cards])

    bilingual_failures = []
    for card in cards:
        for field in [card["titles"], card["recognition"], card["applicability"]["decision_rule"]]:
            if not field.get("vi") or not field.get("en"):
                bilingual_failures.append(card["pattern_id"])
        for step in card["method_steps"]:
            for field in [step["action"], step["why"], step["check"]]:
                if not field.get("vi") or not field.get("en"):
                    bilingual_failures.append(step["step_id"])
    for error in arrays["errors"]:
        for key in ["likely_error", "consequence", "detection_check", "repair_action"]:
            if not error[key].get("vi") or not error[key].get("en"):
                bilingual_failures.append(error["error_id"])
    for visual in arrays["visuals"]:
        for key in ["learning_question", "predict_prompt", "normal_case", "boundary_case", "failure_case", "static_fallback"]:
            if not visual[key].get("vi") or not visual[key].get("en"):
                bilingual_failures.append(visual["visual_brief_id"])
    check("bilingual_required_fields", not bilingual_failures, bilingual_failures)

    check("solutions_pending_stage5", all(x["status"] == "PENDING_STAGE5_EXECUTION_VERIFICATION" for x in arrays["solutions"]), [x["status"] for x in arrays["solutions"]])
    check("examples_pending_stage5", all(x["status"] == "PENDING_STAGE5_EXECUTION_VERIFICATION" for x in arrays["examples"]), [x["status"] for x in arrays["examples"]])
    check("visuals_pending_stage7", all(x["status"] == "PENDING_STAGE5_TRACE_AND_STAGE7_STORYBOARD" for x in arrays["visuals"]), [x["status"] for x in arrays["visuals"]])
    visual_triples = [(x["normal_case"]["en"], x["boundary_case"]["en"], x["failure_case"]["en"]) for x in arrays["visuals"]]
    check("visual_cases_not_generic_duplicates", len(visual_triples) == len(set(visual_triples)), [x["pattern_id"] for x in arrays["visuals"]])
    decision_rules = [x["applicability"]["decision_rule"]["en"] for x in cards]
    learning_questions = [x["learning_question"]["en"] for x in arrays["visuals"]]
    check("decision_rules_pattern_specific", len(decision_rules) == len(set(decision_rules)), decision_rules)
    check("visual_questions_pattern_specific", len(learning_questions) == len(set(learning_questions)), learning_questions)
    template_phrases = []
    for visual in arrays["visuals"]:
        for key in ["normal_case", "boundary_case", "failure_case"]:
            text = visual[key]["en"].lower()
            if (text.startswith("trace the ") and text.endswith(" case step by step.")) or (text.startswith("use boundary `") and text.endswith("` to check the invariant.")):
                template_phrases.append((visual["pattern_id"], key, visual[key]["en"]))
    check("visual_cases_concrete_not_token_templates", not template_phrases, template_phrases)

    stale = []
    banned = ["requires Lead adjudication", "Lead adjudication is requested", "PENDING_LEAD", '"status": "EXECUTION_VERIFIED"', '"tests_passed": true', '"trace_verified": true']
    for fn, _ in files.values():
        text = (batch_dir / fn).read_text(encoding="utf-8")
        stale.extend((fn, term) for term in banned if term.lower() in text.lower())
    check("no_stale_decision_or_execution_claim", not stale, stale)

    drift = []
    for name, doc in docs.items():
        raw_hashes = doc.get("input_hashes", {})
        if isinstance(raw_hashes, list):
            pairs = []
            for item in raw_hashes:
                if isinstance(item, dict):
                    rel = item.get("path") or item.get("file") or item.get("input")
                    expected_hash = item.get("sha256") or item.get("hash")
                    if rel and expected_hash:
                        pairs.append((rel, expected_hash))
        else:
            pairs = list(raw_hashes.items())
        for rel, expected_hash in pairs:
            try:
                path = resolve_input(rel)
                actual_hash = digest(path)
                if actual_hash != expected_hash:
                    drift.append({"artifact": name, "path": rel, "expected": expected_hash, "actual": actual_hash})
            except FileNotFoundError:
                drift.append({"artifact": name, "path": rel, "error": "missing"})
    check("input_hashes_no_drift", not drift, drift[:30])

    report = {
        "schema_version": "s4-lead-batch-audit-v1",
        "batch_id": args.batch_id,
        "batch_dir": str(batch_dir),
        "status": "PASS" if all(x["passed"] for x in checks) else "REWORK",
        "counts": {
            "patterns": len(cards), "variants": len(arrays["variants"]), "errors": len(arrays["errors"]),
            "solutions": len(arrays["solutions"]), "examples": len(arrays["examples"]), "visuals": len(arrays["visuals"]),
            "method_steps": len(step_ids), "marking_atom_refs": len(atom_refs), "checks": len(checks),
        },
        "checks": checks,
        "artifact_hashes": {fn: digest(batch_dir / fn) for fn, _ in files.values()},
    }
    out_dir = S4 / "evidence" / "lead-review"
    out_dir.mkdir(parents=True, exist_ok=True)
    out = out_dir / f"{args.batch_id}-PASS1.json"
    out.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"status": report["status"], "counts": report["counts"], "failed": [x for x in checks if not x["passed"]]}, ensure_ascii=False, indent=2))
    raise SystemExit(0 if report["status"] == "PASS" else 1)


if __name__ == "__main__":
    main()
