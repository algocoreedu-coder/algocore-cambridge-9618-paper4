from __future__ import annotations

import json
from collections import Counter, defaultdict
from pathlib import Path


S4 = Path(__file__).resolve().parents[4]
PAPER4 = S4.parent
METHOD = S4 / "evidence" / "method"
BATCH_DIRS = [
    "P0-stack",
    "B1-foundations-text",
    "B2-search-sort",
    "B3-queue-linked-list",
    "B4-recursion-tree",
    "B5-dictionary-hash",
    "B6-oop",
    "B7-files",
    "B8-integration",
]

# Human semantic review: these atoms are claimed by both patterns, but the
# current part-order rule selects a method that does not teach the directly
# assessed operation. Values are the expected atom-level coordination owners.
EXPECTED_OWNER_OVERRIDES = {
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


def main():
    ownership = load(S4 / "MARKING_METHOD_OWNERSHIP.json")
    marking = load(S4 / "MARKING_MAP.json")
    cards = load(S4 / "PATTERN_CARDS.json")["pattern_cards"]
    stage2 = load(PAPER4 / "stage-2" / "QUESTION_PATTERN_MAP.json")

    checks = []

    def check(check_id: str, passed: bool, detail):
        checks.append({"check_id": check_id, "passed": bool(passed), "detail": detail})

    rows = {row["part_id"]: row for row in marking["rows"]}
    s2_rows = {row["part_id"]: row for row in stage2["rows"]}
    atoms = {
        point["marking_point_id"]: (row, point)
        for row in marking["rows"]
        for point in row["marking_points"]
    }
    decisions = ownership["decisions"]
    decision_by_atom = {item["marking_point_id"]: item for item in decisions}
    cross = [item for item in decisions if len(item["candidate_pattern_ids"]) > 1]

    check("ownership.decision_count", len(decisions) == 2236, len(decisions))
    check("ownership.decision_ids_unique", len(decision_by_atom) == len(decisions), len(decision_by_atom))
    check("ownership.covers_exact_atom_set", set(decision_by_atom) == set(atoms), {
        "missing": sorted(set(atoms) - set(decision_by_atom)),
        "extra": sorted(set(decision_by_atom) - set(atoms)),
    })
    check("ownership.cross_batch_count", len(cross) == 182, len(cross))
    check(
        "ownership.cross_rules",
        all(
            item["resolution_rule"]
            == (
                "cross_batch_duplicate_semantic_override_after_a8_review"
                if item["marking_point_id"] in EXPECTED_OWNER_OVERRIDES
                else "cross_batch_duplicate_resolved_by_part_pattern_order"
            )
            for item in cross
        ),
        dict(Counter(item["resolution_rule"] for item in cross)),
    )
    check(
        "ownership.official_values_unchanged",
        all(item["official_mark_value_unchanged"] is True for item in decisions),
        sum(item["official_mark_value_unchanged"] is not True for item in decisions),
    )

    # Rebuild candidate lists from the unmerged P0/B1-B8 cards in canonical
    # ingestion order. This is independent of the generated ownership file.
    raw_refs = defaultdict(list)
    pattern_batch = {}
    for dirname in BATCH_DIRS:
        raw_cards = load(METHOD / dirname / "PATTERN_CARDS.json")["pattern_cards"]
        for card in raw_cards:
            pattern_batch[card["pattern_id"]] = dirname
            for atom_id in card.get("marking_point_refs", []):
                if card["pattern_id"] not in raw_refs[atom_id]:
                    raw_refs[atom_id].append(card["pattern_id"])
    candidate_mismatches = []
    for atom_id, decision in decision_by_atom.items():
        if decision["candidate_pattern_ids"] != raw_refs.get(atom_id, []):
            candidate_mismatches.append(atom_id)
    check("ownership.candidates_rebuilt_from_batch_cards", not candidate_mismatches, candidate_mismatches)
    check(
        "ownership.cross_candidates_are_cross_batch",
        all(len({pattern_batch[p] for p in item["candidate_pattern_ids"]}) > 1 for item in cross),
        [item["marking_point_id"] for item in cross if len({pattern_batch[p] for p in item["candidate_pattern_ids"]}) <= 1],
    )

    stage2_mismatches = []
    policy_owner_mismatches = []
    for item in decisions:
        row = rows[item["part_id"]]
        s2 = s2_rows[item["part_id"]]
        if row["pattern_ids"] != s2["assessed_pattern_ids"]:
            stage2_mismatches.append(item["part_id"])
        expected = EXPECTED_OWNER_OVERRIDES.get(
            item["marking_point_id"],
            next((p for p in row["pattern_ids"] if p in item["candidate_pattern_ids"]), None),
        )
        if expected != item["owner_pattern_id"]:
            policy_owner_mismatches.append(item["marking_point_id"])
    check("ownership.stage2_assessed_patterns_preserved", not stage2_mismatches, sorted(set(stage2_mismatches)))
    check("ownership.part_order_policy_reproduced", not policy_owner_mismatches, policy_owner_mismatches)
    check(
        "ownership.owner_is_assessed_candidate",
        all(
            item["owner_pattern_id"] in item["candidate_pattern_ids"]
            and item["owner_pattern_id"] in rows[item["part_id"]]["pattern_ids"]
            for item in decisions
        ),
        [
            item["marking_point_id"]
            for item in decisions
            if item["owner_pattern_id"] not in item["candidate_pattern_ids"]
            or item["owner_pattern_id"] not in rows[item["part_id"]]["pattern_ids"]
        ],
    )

    card_by_pattern = {card["pattern_id"]: card for card in cards}
    top_level_owners = defaultdict(list)
    for card in cards:
        for atom_id in card["marking_point_refs"]:
            top_level_owners[atom_id].append(card["pattern_id"])
    ownership_card_mismatches = []
    method_ref_mismatches = []
    for atom_id, decision in decision_by_atom.items():
        if top_level_owners.get(atom_id) != [decision["owner_pattern_id"]]:
            ownership_card_mismatches.append(atom_id)
        owner_card = card_by_pattern[decision["owner_pattern_id"]]
        expected_steps = [
            step["step_id"]
            for step in sorted(owner_card["method_steps"], key=lambda step: step["sequence"])
        ]
        point = atoms[atom_id][1]
        if point.get("method_owner_pattern_id") != decision["owner_pattern_id"] or point.get("method_step_refs") != expected_steps:
            method_ref_mismatches.append(atom_id)
    check("ownership.canonical_card_top_refs_exact_once", not ownership_card_mismatches, ownership_card_mismatches)
    check("ownership.map_owner_and_steps_match_card", not method_ref_mismatches, method_ref_mismatches)

    # Verify official MS locators directly against the three source submissions.
    source_points = {}
    source_qp = {}
    for batch, key in (("2021-2022", "rows"), ("2023-2024", "parts"), ("2025", "rows")):
        submission = load(S4 / "evidence" / "marking" / batch / "MARKING_SUBMISSION.json")
        for row in submission[key]:
            source_qp[row["part_id"]] = row.get("qp_requirements", row.get("qp_requirement"))
            for point in row["marking_points"]:
                source_points[point["marking_point_id"]] = point
    ms_locator_mismatches = []
    for atom_id, (_, point) in atoms.items():
        source = source_points[atom_id]
        if (point["ms_source_id"], point["ms_pdf_pages"]) != (source["ms_source_id"], source["ms_pdf_pages"]):
            ms_locator_mismatches.append(atom_id)
    qp_locator_mismatches = []
    for part_id, row in rows.items():
        raw = source_qp[part_id]
        raw_items = raw if isinstance(raw, list) else [raw]
        expected = [(item["source_id"], item["pdf_pages"]) for item in raw_items]
        actual = [(item["source_id"], item["pdf_pages"]) for item in row["qp_requirements"]]
        if actual != expected:
            qp_locator_mismatches.append(part_id)
    check("source.ms_locators_preserved_2236", not ms_locator_mismatches, ms_locator_mismatches)
    check("source.qp_locators_preserved_672", not qp_locator_mismatches, qp_locator_mismatches)

    semantic_mismatches = []
    for atom_id, expected_owner in EXPECTED_OWNER_OVERRIDES.items():
        decision = decision_by_atom[atom_id]
        if decision["owner_pattern_id"] != expected_owner:
            semantic_mismatches.append({
                "marking_point_id": atom_id,
                "current_owner": decision["owner_pattern_id"],
                "expected_owner": expected_owner,
                "candidate_pattern_ids": decision["candidate_pattern_ids"],
                "criterion_paraphrase": atoms[atom_id][1]["criterion_paraphrase"],
            })
    check("semantic.atom_level_owner_alignment", not semantic_mismatches, semantic_mismatches)
    stale_boundary = "remain empty" in marking.get("authority_boundary", "").lower()
    check("metadata.method_join_boundary_current", not stale_boundary, marking.get("authority_boundary"))

    result = {
        "status": "PASS" if all(item["passed"] for item in checks) else "REWORK",
        "counts": {
            "decisions": len(decisions),
            "cross_batch_duplicates": len(cross),
            "cross_batch_parts": len({item["part_id"] for item in cross}),
            "candidate_owner_families": len({(tuple(item["candidate_pattern_ids"]), item["owner_pattern_id"]) for item in cross}),
            "semantic_acceptable": len(cross) - len(semantic_mismatches),
            "semantic_misjoins": len(semantic_mismatches),
            "ms_locators_checked": len(atoms),
            "qp_locators_checked": len(rows),
        },
        "checks": checks,
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))
    raise SystemExit(0 if result["status"] == "PASS" else 1)


if __name__ == "__main__":
    main()
