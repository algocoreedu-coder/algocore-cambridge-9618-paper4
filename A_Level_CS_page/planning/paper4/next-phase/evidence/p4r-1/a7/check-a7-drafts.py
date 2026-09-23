#!/usr/bin/env python3
"""Read-only exact-set and authority checker for P4R-1 A7 draft maps."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent

PATHS = {
    "p4r0_a8": "A_Level_CS_page/planning/paper4/next-phase/evidence/p4r-0/a8/A8_P4R0_RECHECK.json",
    "input_lock": "A_Level_CS_page/planning/paper4/next-phase/evidence/p4r-0/a1/INPUT_LOCK.json",
    "denominators": "A_Level_CS_page/planning/paper4/next-phase/evidence/p4r-0/a1/EXACT_DENOMINATORS.json",
    "practice_assignment": "A_Level_CS_page/planning/paper4/next-phase/evidence/p4r-0/a0/PRACTICE_ID_ASSIGNMENT.json",
    "lesson_packages": "A_Level_CS_page/planning/paper4/stage-3/LESSON_PACKAGES.json",
    "pattern_cards": "A_Level_CS_page/planning/paper4/stage-4/PATTERN_CARDS.json",
    "marking_map": "A_Level_CS_page/planning/paper4/stage-4/MARKING_MAP.json",
    "assessment_briefs": "A_Level_CS_page/planning/paper4/stage-4/ASSESSMENT_DESIGN_BRIEFS.json",
    "learning_pages": "A_Level_CS_page/algocore-fumadocs/app/data/stage9-learning-pages.json",
    "marking_draft": "A_Level_CS_page/planning/paper4/next-phase/evidence/p4r-1/a7/MARKING_DISPOSITION_DRAFT.json",
    "assessment_draft": "A_Level_CS_page/planning/paper4/next-phase/evidence/p4r-1/a7/ASSESSMENT_ITEM_MAP_DRAFT.json",
}


def load(key: str):
    return json.loads((ROOT / PATHS[key]).read_text(encoding="utf-8"))


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def snapshot() -> dict[str, str]:
    return {key: sha256(ROOT / path) for key, path in PATHS.items()}


def exact(actual, expected, label: str) -> None:
    actual_list = list(actual)
    expected_list = list(expected)
    if len(actual_list) != len(set(actual_list)):
        raise AssertionError(f"{label}: duplicate identities")
    if set(actual_list) != set(expected_list):
        missing = sorted(set(expected_list) - set(actual_list))[:10]
        extra = sorted(set(actual_list) - set(expected_list))[:10]
        raise AssertionError(f"{label}: identity mismatch missing={missing} extra={extra}")


def main() -> None:
    before = snapshot()
    p4r0 = load("p4r0_a8")
    lock = load("input_lock")
    denominators = load("denominators")
    assignments = load("practice_assignment")
    lesson_source = load("lesson_packages")
    pattern_source = load("pattern_cards")
    marking_source = load("marking_map")
    assessment_source = load("assessment_briefs")
    learning_pages = load("learning_pages")
    marking = load("marking_draft")
    assessment = load("assessment_draft")

    assert p4r0["decision"] == "PASS", "P4R-0 input gate is not PASS"
    assert before["input_lock"] == p4r0["input_evidence"]["input_lock_sha256"]
    assert before["denominators"] == p4r0["input_evidence"]["exact_denominators_sha256"]
    assert before["practice_assignment"] == p4r0["input_evidence"]["practice_id_assignment_sha256"]
    locked_hashes = {item["path"]: item["sha256"] for item in lock["locked_inputs"]}
    for artifact in marking["inputs"] + assessment["inputs"]:
        path = ROOT / artifact["path"]
        assert sha256(path) == artifact["sha256"], f"Draft input hash mismatch: {artifact['path']}"
        if artifact["path"] in locked_hashes:
            assert artifact["sha256"] == locked_hashes[artifact["path"]], f"P4R-0 lock mismatch: {artifact['path']}"

    expected_sets = denominators["sets"]
    expected_counts = denominators["expected"]
    lessons = {item["lesson_id"]: item for item in lesson_source["lessons"]}
    patterns = {item["pattern_id"]: item for item in pattern_source["pattern_cards"]}
    requirements = {item["requirement_id"]: item for item in lesson_source["assessment_requirements"]}
    destinations = {item["assessment_id"]: item for item in assessment_source["assessment_designs"]}

    source_atoms = {
        atom["marking_point_id"]: (row, atom)
        for row in marking_source["rows"]
        for atom in row["marking_points"]
    }
    atom_records = marking["marking_atom_dispositions"]
    atom_ids = [item["marking_point_id"] for item in atom_records]
    exact(atom_ids, expected_sets["marking_atoms"]["ids"], "marking atoms vs P4R-0")
    exact(atom_ids, source_atoms, "marking atoms vs Stage 4")
    assert len(atom_ids) == expected_counts["marking_atoms"] == 2236

    for record in atom_records:
        row, source = source_atoms[record["marking_point_id"]]
        assert record["pattern_id"] == source["method_owner_pattern_id"]
        assert record["lesson_id"] == patterns[record["pattern_id"]]["lesson_id"]
        assert record["authority"] == source["authority"] == "official_ms"
        assert record["source_mark_value_if_unambiguous"] == source.get("source_mark_value_if_unambiguous")
        assert record["ms_locator"] == {
            "source_id": source["ms_source_id"],
            "pdf_pages": source["ms_pdf_pages"],
            "authority": source["authority"],
        }
        expected_qp = [
            {
                "requirement_id": requirement["requirement_id"],
                "source_id": requirement["source_id"],
                "pdf_pages": requirement["pdf_pages"],
                "authority": requirement["authority"],
            }
            for requirement in row["qp_requirements"]
        ]
        assert record["qp_locators"] == expected_qp
        assert all(locator["authority"] == "official_qp" for locator in record["qp_locators"])

    chains = marking["marking_chains"]
    chain_pattern_ids = [item["pattern_id"] for item in chains]
    exact(chain_pattern_ids, expected_sets["patterns"]["ids"], "marking chains")
    chain_atom_ids = [atom_id for chain in chains for atom_id in chain["marking_atom_ids"]]
    exact(chain_atom_ids, atom_ids, "chain atom partition")
    for chain in chains:
        card = patterns[chain["pattern_id"]]
        assert chain["lesson_id"] == card["lesson_id"]
        assert chain["requirement_refs"] == card["assessment_requirement_refs"]
        assert chain["method_step_refs"] == [step["step_id"] for step in card["method_steps"]]
        assert chain["error_refs"] == card["error_refs"]
        assert chain["marking_atom_count"] == len(chain["marking_atom_ids"])

    requirement_records = assessment["assessment_requirement_dispositions"]
    requirement_ids = [item["assessment_requirement_id"] for item in requirement_records]
    exact(requirement_ids, expected_sets["assessment_requirements"]["ids"], "assessment requirements")
    assert len(requirement_ids) == expected_counts["assessment_requirements"] == 107
    for record in requirement_records:
        source = requirements[record["assessment_requirement_id"]]
        assert record["official_marks"] is None and source.get("official_marks") is None
        assert record["authority"] == "AlgoCore_original_assessment_requirement"
        assert all(lesson_id in lessons for lesson_id in record["lesson_ids"])
        assert all(pattern_id in patterns for pattern_id in record["pattern_ids"])
        assert all(destination_id in destinations for destination_id in record["destination_ids"])

    destination_records = assessment["assessment_destination_dispositions"]
    destination_ids = [item["destination_id"] for item in destination_records]
    exact(destination_ids, expected_sets["assessment_destinations"]["ids"], "assessment destinations")
    assert len(destination_ids) == expected_counts["assessment_destinations"] == 37
    for record in destination_records:
        assert record["lesson_id"] in lessons
        assert record["official_marks"] is None
        assert record["official_source_refs"] == []
        assert record["authority"] == "AlgoCore_authored_assessment"
        assert all(requirement_id in requirements for requirement_id in record["requirement_ids"])
        assert all(pattern_id in patterns for pattern_id in record["pattern_ids"])

    item_records = assessment["assessment_items"]
    item_ids = [item["assessment_item_id"] for item in item_records]
    expected_practice_ids = [item["stable_id"] for item in expected_sets["practice_items"]["items"]]
    exact(item_ids, expected_practice_ids, "practice items")
    assert len(item_ids) == expected_counts["practice_items"] == 78
    assigned_ids = {item["assessment_item_id"] for item in assignments["assignments"]}
    assert assigned_ids <= set(item_ids) and len(assigned_ids) == 15
    for item in item_records:
        lesson_id = item["lesson_id"]
        assert lesson_id in lessons
        assert item["level"] in {"guided", "faded", "independent", "retrieval"}
        assert item["official_marks"] is None
        assert item["self_rubric"]["authority"] == "AlgoCore_authored_rubric"
        assert item["self_rubric"]["official_marks"] is None
        assert all(pattern_id in patterns for pattern_id in item["pattern_ids"])
        assert all(patterns[pattern_id]["lesson_id"] == lesson_id for pattern_id in item["pattern_ids"])
        lesson_requirement_ids = set(lessons[lesson_id]["assessment_requirement_ids"])
        assert set(item["assessment_requirement_ids"]) == lesson_requirement_ids
        assert all(requirement_id in requirements for requirement_id in item["assessment_requirement_ids"])
        assert item["destination_id"] in destinations
        assert destinations[item["destination_id"]]["lesson_id"] == lesson_id
        assert all(destination_id in destinations for destination_id in item["destination_ids"])
        assert all(destinations[destination_id]["lesson_id"] == lesson_id for destination_id in item["destination_ids"])

    # Re-extract the Stage 9 practice identity set to make the A0 normalization explicit.
    observed_ids = []
    assignment_lookup = {
        (item["lesson_slug"], item["level"]): item["assessment_item_id"]
        for item in assignments["assignments"]
    }
    for page in learning_pages["lessons"]:
        practice = next(block for block in page["blocks"] if block["kind"] == "practice")["content"]
        vi = practice["vi"]
        en = practice["en"]
        if "practiceItems" in vi:
            assert [item["id"] for item in vi["practiceItems"]] == [item["id"] for item in en["practiceItems"]]
            observed_ids.extend(item["id"] for item in vi["practiceItems"])
        else:
            for level in ("guided", "faded", "independent"):
                observed_ids.append(assignment_lookup[(page["slug"], level)])
    exact(item_ids, observed_ids, "practice item source identities")

    after = snapshot()
    assert before == after, "Read-only checker changed an input or draft artifact"
    result = {
        "status": "PASS_WITH_REQUIRED_DRAFT_FINDINGS",
        "read_only": True,
        "p4r0_gate": p4r0["decision"],
        "counts": {
            "marking_atoms": len(atom_ids),
            "marking_chains": len(chains),
            "assessment_requirements": len(requirement_ids),
            "assessment_destinations": len(destination_ids),
            "practice_items": len(item_ids),
            "a0_ids_preserved": len(assigned_ids),
        },
        "draft_hashes": {
            "marking": before["marking_draft"],
            "assessment": before["assessment_draft"],
        },
        "required_findings": len(assessment["findings"]),
    }
    print(json.dumps(result, sort_keys=True))


if __name__ == "__main__":
    main()
