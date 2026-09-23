from __future__ import annotations

import copy
import hashlib
import json
from collections import Counter, defaultdict
from pathlib import Path


S4 = Path(__file__).resolve().parents[1]
METHOD = S4 / "evidence" / "method"
BATCH_DIRS = {
    "P0": "P0-stack",
    "B1": "B1-foundations-text",
    "B2": "B2-search-sort",
    "B3": "B3-queue-linked-list",
    "B4": "B4-recursion-tree",
    "B5": "B5-dictionary-hash",
    "B6": "B6-oop",
    "B7": "B7-files",
    "B8": "B8-integration",
}
FILE_KEYS = {
    "PATTERN_CARDS.json": ("pattern_cards",),
    "VARIANT_INVARIANT_REGISTER.json": ("variants",),
    "ERROR_PREVENTION.json": ("error_rows", "errors"),
    "SOLUTION_DESIGNS.json": ("solution_designs",),
    "WORKED_EXAMPLE_SPECS.json": ("worked_example_specs",),
    "VISUAL_BRIEFS.json": ("visual_briefs",),
}

# Independent semantic review overrides for atoms referenced by more than one
# pattern submission. The owner is the method that directly produces the
# assessed evidence, rather than the first pattern listed on the source part.
SEMANTIC_OWNER_OVERRIDES = {
    "MP-9618-W24-41-2-C-II-01": "OOP_INSTANTIATE",
    "MP-9618-W24-41-2-C-II-03": "OOP_INSTANTIATE",
    "MP-9618-W24-43-2-C-II-01": "OOP_INSTANTIATE",
    "MP-9618-W24-43-2-C-II-03": "OOP_INSTANTIATE",
    "MP-9618-S24-42-2-B-I-01": "OOP_CLASS",
    "9618_s25_41_3(c)(i).mp.01": "OOP_CLASS",
    "9618_s25_43_3(b)(i).mp.01": "OOP_CLASS",
    "9618_w25_43_1(b)(i).mp.04": "OOP_INSTANTIATE",
}


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def digest(path: Path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def array(doc: dict, keys: tuple[str, ...]):
    return next(doc[k] for k in keys if k in doc)


def write_json(name: str, payload: dict):
    path = S4 / name
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return digest(path)


def main():
    plan = load(S4 / "BATCH_PLAN.json")
    expected_patterns = [p for batch in plan["method_batches"] for p in batch["pattern_ids"]]
    docs: dict[str, list] = {name: [] for name in FILE_KEYS}
    provenance = {}
    for batch_id, dirname in BATCH_DIRS.items():
        batch_dir = METHOD / dirname
        if not batch_dir.exists():
            raise SystemExit(f"Missing batch directory: {batch_dir}")
        provenance[batch_id] = {"directory": str(batch_dir.relative_to(S4)), "artifacts": {}}
        for filename, keys in FILE_KEYS.items():
            path = batch_dir / filename
            if not path.exists():
                raise SystemExit(f"Missing {path}")
            doc = load(path)
            items = array(doc, keys)
            for item in items:
                value = copy.deepcopy(item)
                value["source_batch_id"] = batch_id
                docs[filename].append(value)
            provenance[batch_id]["artifacts"][filename] = digest(path)

    cards = docs["PATTERN_CARDS.json"]
    card_by_pattern = {x["pattern_id"]: x for x in cards}
    actual_patterns = [x["pattern_id"] for x in cards]
    if Counter(actual_patterns) != Counter(expected_patterns):
        raise SystemExit({"expected": expected_patterns, "actual": actual_patterns})

    marking = load(S4 / "MARKING_MAP.json")
    atom_to_row = {}
    for row in marking["rows"]:
        for point in row["marking_points"]:
            atom_to_row[point["marking_point_id"]] = row
    refs = defaultdict(list)
    for card in cards:
        for atom_id in card.get("marking_point_refs", []):
            refs[atom_id].append(card["pattern_id"])
    invalid_refs = sorted(set(refs) - set(atom_to_row))
    if invalid_refs:
        raise SystemExit({"invalid_marking_point_refs": invalid_refs[:50]})

    decisions = []
    owner_to_atoms = defaultdict(list)
    duplicates = 0
    missing = 0
    for atom_id, row in atom_to_row.items():
        candidates = list(dict.fromkeys(refs.get(atom_id, [])))
        if not candidates:
            missing += 1
            owner = row["pattern_ids"][0]
            rule = "fallback_primary_pattern_for_unreferenced_atom"
        elif len(candidates) == 1:
            owner = candidates[0]
            rule = "single_submitted_owner"
        else:
            duplicates += 1
            if atom_id in SEMANTIC_OWNER_OVERRIDES:
                owner = SEMANTIC_OWNER_OVERRIDES[atom_id]
                if owner not in candidates:
                    raise SystemExit({"atom": atom_id, "semantic_override_not_candidate": owner, "candidates": candidates})
                rule = "cross_batch_duplicate_semantic_override_after_a8_review"
            else:
                owner = next((p for p in row["pattern_ids"] if p in candidates), candidates[0])
                rule = "cross_batch_duplicate_resolved_by_part_pattern_order"
        if owner not in card_by_pattern:
            raise SystemExit({"atom": atom_id, "missing_owner_card": owner})
        owner_to_atoms[owner].append(atom_id)
        decisions.append({
            "marking_point_id": atom_id,
            "part_id": row["part_id"],
            "candidate_pattern_ids": candidates,
            "owner_pattern_id": owner,
            "resolution_rule": rule,
            "official_mark_value_unchanged": True,
        })
    for card in cards:
        card["marking_point_refs"] = sorted(owner_to_atoms[card["pattern_id"]])
        card["status"] = "SUBMITTED"

    method_steps_by_pattern = {
        card["pattern_id"]: [x["step_id"] for x in sorted(card["method_steps"], key=lambda y: y["sequence"])]
        for card in cards
    }
    decision_by_atom = {x["marking_point_id"]: x for x in decisions}
    for row in marking["rows"]:
        for point in row["marking_points"]:
            owner = decision_by_atom[point["marking_point_id"]]["owner_pattern_id"]
            point["method_owner_pattern_id"] = owner
            point["method_step_refs"] = method_steps_by_pattern[owner]
            point["method_join_scope"] = "ordered_pattern_method_sequence; no independent mark value is inferred from the breadth of this link"
    marking["status"] = "LEAD_PASS1_METHOD_JOIN"
    marking["authority_boundary"] = (
        "QP/MS locators and source mark values are official. Criterion wording is a concise editorial paraphrase. "
        "Method owner and method-step links are AlgoCore coordination joins; their breadth does not infer or reallocate marks."
    )
    marking["method_join_counts"] = {
        "atoms": len(decisions), "single_submitted_owner": sum(x["resolution_rule"] == "single_submitted_owner" for x in decisions),
        "cross_batch_duplicates_resolved": duplicates, "unreferenced_atoms_assigned_to_primary_pattern": missing,
    }

    containers = {
        "PATTERN_CARDS.json": {"schema_version": "s4-pattern-cards-v1", "status": "LEAD_PASS1_CANDIDATE", "counts": {"patterns": len(cards), "method_steps": sum(len(x["method_steps"]) for x in cards)}, "pattern_cards": cards},
        "VARIANT_INVARIANT_REGISTER.json": {"schema_version": "s4-variant-register-v1", "status": "LEAD_PASS1_CANDIDATE", "counts": {"variants": len(docs["VARIANT_INVARIANT_REGISTER.json"])}, "variants": docs["VARIANT_INVARIANT_REGISTER.json"]},
        "ERROR_PREVENTION_MATRIX.json": {"schema_version": "s4-error-prevention-v1", "status": "LEAD_PASS1_CANDIDATE", "counts": {"errors": len(docs["ERROR_PREVENTION.json"])}, "error_rows": docs["ERROR_PREVENTION.json"]},
        "SOLUTION_DESIGN_BRIEFS.json": {"schema_version": "s4-solution-design-v1", "status": "LEAD_PASS1_CANDIDATE", "counts": {"solutions": len(docs["SOLUTION_DESIGNS.json"])}, "solution_designs": docs["SOLUTION_DESIGNS.json"]},
        "WORKED_EXAMPLE_SPECS.json": {"schema_version": "s4-worked-example-spec-v1", "status": "LEAD_PASS1_CANDIDATE", "counts": {"examples": len(docs["WORKED_EXAMPLE_SPECS.json"])}, "worked_example_specs": docs["WORKED_EXAMPLE_SPECS.json"]},
        "PRELIMINARY_VISUAL_BRIEFS.json": {"schema_version": "s4-visual-brief-v1", "status": "LEAD_PASS1_CANDIDATE", "counts": {"visuals": len(docs["VISUAL_BRIEFS.json"])}, "visual_briefs": docs["VISUAL_BRIEFS.json"]},
    }
    canonical_hashes = {name: write_json(name, payload) for name, payload in containers.items()}
    marking_hash = write_json("MARKING_MAP.json", marking)
    ownership = {
        "schema_version": "s4-marking-method-ownership-v1",
        "status": "LEAD_PASS1_CANDIDATE",
        "policy": "Each official marking atom remains in one part row and receives one coordination owner pattern. Method links cover the owner's ordered sequence and do not allocate extra marks.",
        "counts": {"marking_atoms": len(decisions), "duplicates_resolved": duplicates, "unreferenced_assigned": missing, "owners": len(owner_to_atoms)},
        "decisions": decisions,
    }
    ownership_hash = write_json("MARKING_METHOD_OWNERSHIP.json", ownership)
    audit = {
        "schema_version": "s4-coverage-audit-v1",
        "status": "LEAD_PASS1_CANDIDATE",
        "counts": {
            "patterns": len(cards), "method_steps": sum(len(x["method_steps"]) for x in cards),
            "variants": len(docs["VARIANT_INVARIANT_REGISTER.json"]), "errors": len(docs["ERROR_PREVENTION.json"]),
            "solutions": len(docs["SOLUTION_DESIGNS.json"]), "worked_examples": len(docs["WORKED_EXAMPLE_SPECS.json"]),
            "visuals": len(docs["VISUAL_BRIEFS.json"]), "marking_atoms": len(decisions),
        },
        "checks": {
            "patterns_58_exact": len(cards) == 58 and set(actual_patterns) == set(expected_patterns),
            "one_solution_per_pattern": Counter(x["pattern_id"] for x in docs["SOLUTION_DESIGNS.json"]) == Counter(expected_patterns),
            "one_example_per_pattern": Counter(x["pattern_id"] for x in docs["WORKED_EXAMPLE_SPECS.json"]) == Counter(expected_patterns),
            "one_visual_per_pattern": Counter(x["pattern_id"] for x in docs["VISUAL_BRIEFS.json"]) == Counter(expected_patterns),
            "marking_atoms_2236": len(decisions) == 2236,
            "marking_ownership_exact_once": sum(len(x) for x in owner_to_atoms.values()) == len(decisions),
            "all_marking_atoms_have_method_steps": all(point["method_step_refs"] for row in marking["rows"] for point in row["marking_points"]),
            "all_solutions_pending_stage5": all(x["status"] == "PENDING_STAGE5_EXECUTION_VERIFICATION" for x in docs["SOLUTION_DESIGNS.json"]),
            "all_visuals_pending_stage7": all(x["status"] == "PENDING_STAGE5_TRACE_AND_STAGE7_STORYBOARD" for x in docs["VISUAL_BRIEFS.json"]),
        },
        "batch_provenance": provenance,
        "canonical_hashes": {**canonical_hashes, "MARKING_MAP.json": marking_hash, "MARKING_METHOD_OWNERSHIP.json": ownership_hash},
    }
    if not all(audit["checks"].values()):
        raise SystemExit(audit["checks"])
    write_json("STAGE4_COVERAGE_AUDIT.json", audit)
    (S4 / "STAGE4_COVERAGE_AUDIT.md").write_text(
        "# Stage 4 coverage audit\n\nStatus: **LEAD_PASS1_CANDIDATE**.\n\n"
        + "\n".join(f"- {k}: {'PASS' if v else 'FAIL'}" for k, v in audit["checks"].items())
        + f"\n\nCross-batch duplicate references resolved: {duplicates}. Previously unreferenced atoms assigned to the part's first assessed pattern: {missing}. These are coordination joins; official marks remain owned once by the part row.\n",
        encoding="utf-8",
    )
    for name, payload in containers.items():
        key = next(k for k in payload if k not in {"schema_version", "status", "counts"})
        (S4 / name.replace(".json", ".md")).write_text(
            f"# {name.replace('_', ' ').replace('.json', '').title()}\n\nStatus: **LEAD_PASS1_CANDIDATE**.\n\n- Records: {len(payload[key])}.\n- Canonical merge source: P0 and B1–B8 submissions.\n- Final `DESIGN_REVIEWED` status requires A8 aggregate QA and Lead pass 2.\n",
            encoding="utf-8",
        )
    print(json.dumps({"status": "PASS", "counts": audit["counts"], "ownership": ownership["counts"]}, indent=2))


if __name__ == "__main__":
    main()
