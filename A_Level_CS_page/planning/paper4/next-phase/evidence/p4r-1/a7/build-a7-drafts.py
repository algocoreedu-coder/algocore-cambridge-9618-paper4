#!/usr/bin/env python3
"""Build deterministic P4R-1 A7 marking and assessment draft maps.

This is a draft-only builder. It reads the P4R-0 locked inputs and writes only
the two JSON artifacts in its own directory. It does not mutate upstream or
canonical application data.
"""

from __future__ import annotations

import hashlib
import json
from collections import defaultdict
from pathlib import Path


ROOT = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent

PATHS = {
    "input_lock": "A_Level_CS_page/planning/paper4/next-phase/evidence/p4r-0/a1/INPUT_LOCK.json",
    "denominators": "A_Level_CS_page/planning/paper4/next-phase/evidence/p4r-0/a1/EXACT_DENOMINATORS.json",
    "practice_assignment": "A_Level_CS_page/planning/paper4/next-phase/evidence/p4r-0/a0/PRACTICE_ID_ASSIGNMENT.json",
    "lesson_packages": "A_Level_CS_page/planning/paper4/stage-3/LESSON_PACKAGES.json",
    "pattern_cards": "A_Level_CS_page/planning/paper4/stage-4/PATTERN_CARDS.json",
    "marking_map": "A_Level_CS_page/planning/paper4/stage-4/MARKING_MAP.json",
    "assessment_briefs": "A_Level_CS_page/planning/paper4/stage-4/ASSESSMENT_DESIGN_BRIEFS.json",
    "learning_pages": "A_Level_CS_page/algocore-fumadocs/app/data/stage9-learning-pages.json",
}


def read_json(key: str):
    return json.loads((ROOT / PATHS[key]).read_text(encoding="utf-8"))


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def source_record(key: str) -> dict:
    path = ROOT / PATHS[key]
    return {"path": PATHS[key], "sha256": sha256(path)}


def stable_json(data: object) -> str:
    return json.dumps(data, ensure_ascii=False, indent=2, sort_keys=False) + "\n"


def write_json(name: str, data: object) -> None:
    (OUT / name).write_text(stable_json(data), encoding="utf-8", newline="\n")


def main() -> None:
    lock = read_json("input_lock")
    denominators = read_json("denominators")
    assignments = read_json("practice_assignment")
    lessons_source = read_json("lesson_packages")
    patterns_source = read_json("pattern_cards")
    marking_source = read_json("marking_map")
    assessments_source = read_json("assessment_briefs")
    pages_source = read_json("learning_pages")

    expected = denominators["expected"]
    input_records = [source_record(key) for key in PATHS]
    locked_hashes = {item["path"]: item["sha256"] for item in lock["locked_inputs"]}
    for record in input_records:
        if record["path"] in locked_hashes and record["sha256"] != locked_hashes[record["path"]]:
            raise SystemExit(f"Locked input drift: {record['path']}")

    lessons = lessons_source["lessons"]
    lessons_by_id = {item["lesson_id"]: item for item in lessons}
    lessons_by_slug = {item["slug"]: item for item in lessons}
    patterns = patterns_source["pattern_cards"]
    patterns_by_id = {item["pattern_id"]: item for item in patterns}
    patterns_by_lesson: dict[str, list[str]] = defaultdict(list)
    requirement_patterns: dict[str, list[str]] = defaultdict(list)
    for card in patterns:
        patterns_by_lesson[card["lesson_id"]].append(card["pattern_id"])
        for requirement_id in card["assessment_requirement_refs"]:
            requirement_patterns[requirement_id].append(card["pattern_id"])

    rows_by_atom: dict[str, dict] = {}
    atoms_by_pattern: dict[str, list[str]] = defaultdict(list)
    marking_atoms = []
    for row in marking_source["rows"]:
        qp_locators = [
            {
                "requirement_id": requirement["requirement_id"],
                "source_id": requirement["source_id"],
                "pdf_pages": requirement["pdf_pages"],
                "authority": requirement["authority"],
            }
            for requirement in row["qp_requirements"]
        ]
        for atom in row["marking_points"]:
            atom_id = atom["marking_point_id"]
            pattern_id = atom["method_owner_pattern_id"]
            card = patterns_by_id[pattern_id]
            issue_refs = sorted(set(row.get("source_issue_refs", []) + atom.get("source_issue_refs", [])))
            ambiguous_value = atom.get("source_mark_value_if_unambiguous") is None
            disposition = "RETAIN_WITH_SOURCE_CAVEAT" if issue_refs or ambiguous_value else "RETAIN_DIRECT_OFFICIAL_ATOM"
            record = {
                "marking_point_id": atom_id,
                "disposition": disposition,
                "pattern_id": pattern_id,
                "lesson_id": card["lesson_id"],
                "part_id": row["part_id"],
                "question_id": row["question_id"],
                "paper_id": row["paper_id"],
                "qp_locators": qp_locators,
                "ms_locator": {
                    "source_id": atom["ms_source_id"],
                    "pdf_pages": atom["ms_pdf_pages"],
                    "authority": atom["authority"],
                },
                "criterion_paraphrase": atom["criterion_paraphrase"],
                "award_semantics": atom["award_semantics"],
                "source_mark_value_if_unambiguous": atom.get("source_mark_value_if_unambiguous"),
                "group_id": atom.get("group_id"),
                "group_max": atom.get("group_max"),
                "dependency": atom.get("dependency"),
                "alternatives": atom.get("alternatives", []),
                "method_step_refs": atom["method_step_refs"],
                "code_or_evidence_obligation": atom["code_or_evidence_obligation"],
                "source_issue_refs": issue_refs,
                "authority": "official_ms",
                "authority_policy": "Official only within the cited QP/MS context; the editorial paraphrase is not a replacement mark scheme.",
                "limited_evidence": bool(issue_refs or ambiguous_value),
                "review_status": "DRAFT_SOURCE_PRESERVED",
            }
            rows_by_atom[atom_id] = row
            atoms_by_pattern[pattern_id].append(atom_id)
            marking_atoms.append(record)

    marking_chains = []
    for card in patterns:
        pattern_id = card["pattern_id"]
        atom_ids = atoms_by_pattern[pattern_id]
        chain_atoms = [item for item in marking_atoms if item["pattern_id"] == pattern_id]
        caveat_count = sum(item["limited_evidence"] for item in chain_atoms)
        marking_chains.append(
            {
                "marking_chain_id": f"paper4-2026.marking-chain.{pattern_id.lower().replace('_', '-')}",
                "pattern_id": pattern_id,
                "lesson_id": card["lesson_id"],
                "requirement_ref": card["assessment_requirement_refs"][0] if card["assessment_requirement_refs"] else None,
                "requirement_refs": card["assessment_requirement_refs"],
                "method_step_refs": [step["step_id"] for step in card["method_steps"]],
                "error_refs": card["error_refs"],
                "marking_atom_ids": atom_ids,
                "marking_atom_count": len(atom_ids),
                "direct_official_atom_count": len(atom_ids) - caveat_count,
                "limited_evidence_atom_count": caveat_count,
                "detection_check": {
                    "vi": "Đối chiếu từng tiêu chí với đúng QP/MS locator và giữ nguyên dependency/group semantics.",
                    "en": "Check each criterion against its QP/MS locator and preserve dependency/group semantics.",
                },
                "repair_check": {
                    "vi": "Không suy điểm Cambridge từ method step hoặc rubric AlgoCore; mở lại nguồn khi atom có caveat.",
                    "en": "Do not infer Cambridge marks from a method step or AlgoCore rubric; reopen the source for caveated atoms.",
                },
                "limited_evidence": caveat_count > 0,
                "transfer_limit": {
                    "vi": "Chain chỉ đại diện các part đã dẫn nguồn; biến thể mới cần kiểm lại QP/MS của chính biến thể đó.",
                    "en": "The chain represents only cited parts; a new variant requires its own QP/MS check.",
                },
                "reviewer": "A7_P4R1_DRAFT",
                "status": "DRAFT_REVIEW_REQUIRED" if caveat_count else "DRAFT_SOURCE_VALIDATED",
            }
        )

    marking_findings = {
        "atoms_with_source_issue_refs": sum(bool(item["source_issue_refs"]) for item in marking_atoms),
        "atoms_without_unambiguous_source_mark_value": sum(
            item["source_mark_value_if_unambiguous"] is None for item in marking_atoms
        ),
        "chains_with_limited_evidence": sum(item["limited_evidence"] for item in marking_chains),
    }

    marking_output = {
        "schema_version": "paper4-p4r1-marking-disposition-draft-v1",
        "target_release": "paper4-2026-s9-v2",
        "status": "DRAFT_PENDING_LEAD_AND_A8_REVIEW",
        "authority_boundary": {
            "official_atoms": "Only records with direct official_qp and official_ms locators retain Cambridge authority.",
            "editorial_text": "Criterion paraphrases and chain checks are AlgoCore editorial aids and carry no independent mark value.",
            "no_invented_marks": True,
        },
        "inputs": input_records,
        "counts": {
            "marking_atoms": len(marking_atoms),
            "marking_chains": len(marking_chains),
            "patterns": len(patterns),
            **marking_findings,
        },
        "marking_chains": marking_chains,
        "marking_atom_dispositions": marking_atoms,
        "findings": [
            {
                "finding_id": "A7-P4R1-MARK-001",
                "severity": "required_caveat",
                "count": marking_findings["atoms_with_source_issue_refs"],
                "statement": "Source issue references remain attached and must be shown to reviewers; they are not silently closed by this draft.",
            },
            {
                "finding_id": "A7-P4R1-MARK-002",
                "severity": "required_caveat",
                "count": marking_findings["atoms_without_unambiguous_source_mark_value"],
                "statement": "These atoms keep a null source mark value. No value is inferred from part totals, groups, method steps, or wording.",
            },
        ],
        "expected_denominators": {
            "marking_atoms": expected["marking_atoms"],
            "patterns": expected["patterns"],
        },
    }

    requirements_stage3 = {item["requirement_id"]: item for item in lessons_source["assessment_requirements"]}
    requirement_coverage = {item["requirement_id"]: item for item in assessments_source["requirement_coverage"]}
    lesson_ids_by_requirement: dict[str, list[str]] = defaultdict(list)
    for lesson in lessons:
        for requirement_id in lesson["assessment_requirement_ids"]:
            lesson_ids_by_requirement[requirement_id].append(lesson["lesson_id"])

    assessment_designs = {item["assessment_id"]: item for item in assessments_source["assessment_designs"]}
    destinations = []
    for assessment_id in sorted(assessment_designs):
        design = assessment_designs[assessment_id]
        pattern_ids = sorted(patterns_by_lesson.get(design["lesson_id"], []))
        destinations.append(
            {
                "destination_id": assessment_id,
                "lesson_id": design["lesson_id"],
                "package_id": design["package_id"],
                "requirement_ids": design["requirement_ids"],
                "pattern_ids": pattern_ids,
                "pattern_link_status": "LINKED" if pattern_ids else "GAP_NO_STAGE4_PATTERN_FOR_LESSON",
                "origin": design["origin"],
                "authority": "AlgoCore_authored_assessment",
                "official_source_refs": design.get("official_source_refs", []),
                "official_marks": design.get("official_marks"),
                "status": "DRAFT_CONTENT_REVIEW_REQUIRED",
            }
        )

    requirement_dispositions = []
    for requirement_id in sorted(requirements_stage3):
        source = requirements_stage3[requirement_id]
        coverage = requirement_coverage[requirement_id]
        pattern_ids = sorted(requirement_patterns.get(requirement_id, []))
        lesson_ids = sorted(lesson_ids_by_requirement.get(requirement_id, []))
        destination_ids = sorted(
            set([source["suggested_assessment_id"]] + source.get("supporting_assessment_ids", []))
        )
        requirement_dispositions.append(
            {
                "assessment_requirement_id": requirement_id,
                "disposition": "RETAIN_ALGOCORE_ASSESSMENT_REQUIREMENT",
                "objective_id": source["objective_id"],
                "lesson_ids": lesson_ids,
                "knowledge_block_ids": source["knowledge_block_ids"],
                "pattern_ids": pattern_ids,
                "pattern_link_status": "LINKED" if pattern_ids else "GAP_NO_STAGE4_PATTERN_LINK",
                "destination_ids": destination_ids,
                "primary_destination_id": coverage["assessment_id"],
                "origin": source["origin"],
                "authority": "AlgoCore_original_assessment_requirement",
                "official_marks": source.get("official_marks"),
                "authority_note": source["authority_note"],
                "mapping_authority": source["mapping_authority"],
                "status": "DRAFT_REWORK_REQUIRED" if not pattern_ids else "DRAFT_SOURCE_VALIDATED",
            }
        )

    assignment_ids = {
        (item["lesson_slug"], item["level"]): item["assessment_item_id"]
        for item in assignments["assignments"]
    }
    practice_items = []
    generic_rubric_item_ids = []
    legacy_item_ids = []
    missing_pass_rule_item_ids = []
    for page in pages_source["lessons"]:
        lesson_id = page["lessonId"]
        lesson = lessons_by_id[lesson_id]
        block = next(item for item in page["blocks"] if item["kind"] == "practice")
        vi = block["content"]["vi"]
        en = block["content"]["en"]
        pattern_ids = sorted(patterns_by_lesson.get(lesson_id, []))
        requirement_ids = lesson["assessment_requirement_ids"]
        destination_ids = lesson["planned_assessment_ids"]
        if "practiceItems" in vi:
            vi_items = {item["level"]: item for item in vi["practiceItems"]}
            en_items = {item["level"]: item for item in en["practiceItems"]}
            levels = ["guided", "faded", "independent"]
            shape = "practiceItems"
        else:
            vi_items = {level: vi["practiceFlow"][level] for level in ("guided", "faded", "independent")}
            en_items = {level: en["practiceFlow"][level] for level in ("guided", "faded", "independent")}
            levels = ["guided", "faded", "independent"]
            shape = "practiceFlow"
        for index, level in enumerate(levels):
            vi_item = vi_items[level]
            en_item = en_items[level]
            if shape == "practiceItems":
                item_id = vi_item["id"]
                if item_id != en_item["id"]:
                    raise SystemExit(f"VI/EN item ID mismatch: {lesson['slug']} {level}")
                rubric = {
                    "authority": vi_item["rubric"]["authority"],
                    "criteria": {"vi": vi_item["rubric"]["criteria"], "en": en_item["rubric"]["criteria"]},
                    "pass_rule": (
                        {"vi": vi_item["rubric"]["passRule"], "en": en_item["rubric"]["passRule"]}
                        if "passRule" in vi_item["rubric"] and "passRule" in en_item["rubric"]
                        else None
                    ),
                    "official_marks": None,
                }
                prompt = {"vi": vi_item["prompt"], "en": en_item["prompt"]}
                reveal_rule = {
                    "vi": vi_item.get("revealRule", vi_item.get("revealCondition")),
                    "en": en_item.get("revealRule", en_item.get("revealCondition")),
                }
                if vi_item["rubric"]["criteria"] and vi_item["rubric"]["criteria"][0] == "bao phủ yêu cầu":
                    generic_rubric_item_ids.append(item_id)
                if rubric["pass_rule"] is None:
                    missing_pass_rule_item_ids.append(item_id)
                source_identity_authority = "stage9-learning-pages"
                prompt_status = "UNVERIFIED_REQUIRES_P4R2_AUTHOR_REVIEW"
            else:
                item_id = assignment_ids[(lesson["slug"], level)]
                rubric = {
                    "authority": "AlgoCore_authored_rubric",
                    "criteria": {"vi": vi["practiceFlow"]["rubric"], "en": en["practiceFlow"]["rubric"]},
                    "pass_rule": None,
                    "official_marks": None,
                }
                prompt = None
                reveal_rule = None
                legacy_item_ids.append(item_id)
                missing_pass_rule_item_ids.append(item_id)
                source_identity_authority = "A0_LEAD_ID_NORMALIZATION"
                prompt_status = "REWORK_REQUIRED_MISSING_EXPLICIT_PROMPT"
            destination_id = destination_ids[min(index, len(destination_ids) - 1)]
            practice_items.append(
                {
                    "assessment_item_id": item_id,
                    "lesson_id": lesson_id,
                    "pattern_ids": pattern_ids,
                    "pattern_link_status": "LINKED" if pattern_ids else "GAP_NO_STAGE4_PATTERN_FOR_LESSON",
                    "assessment_requirement_ids": requirement_ids,
                    "requirement_link_semantics": "LESSON_SCOPE_ONLY_NOT_PROMPT_PROVEN",
                    "destination_id": destination_id,
                    "destination_ids": destination_ids,
                    "level": level,
                    "prompt": prompt,
                    "fixture": {"vi": vi_item.get("fixture"), "en": en_item.get("fixture")},
                    "expected_artifact": {
                        "vi": vi_item.get("expectedArtifact", vi_item.get("expected")),
                        "en": en_item.get("expectedArtifact", en_item.get("expected")),
                    },
                    "hint": {"vi": vi_item["hint"], "en": en_item["hint"]},
                    "feedback": {
                        "vi": vi_item["feedback"],
                        "en": en_item["feedback"],
                    },
                    "reveal_rule": reveal_rule,
                    "self_rubric": rubric,
                    "official_marks": None,
                    "source_shape": shape,
                    "source_locator": f"{PATHS['learning_pages']}#lessonId={lesson_id}/practice/{level}",
                    "source_identity_authority": source_identity_authority,
                    "prompt_alignment_status": prompt_status,
                    "status": "DRAFT_REWORK_REQUIRED",
                }
            )

    patternless_lessons = sorted(
        lesson_id for lesson_id in lessons_by_id if not patterns_by_lesson.get(lesson_id)
    )
    requirements_without_patterns = sorted(
        item["assessment_requirement_id"]
        for item in requirement_dispositions
        if not item["pattern_ids"]
    )
    items_without_patterns = sorted(
        item["assessment_item_id"] for item in practice_items if not item["pattern_ids"]
    )

    assessment_output = {
        "schema_version": "paper4-p4r1-assessment-item-map-draft-v1",
        "target_release": "paper4-2026-s9-v2",
        "status": "DRAFT_REWORK_REQUIRED",
        "authority_boundary": {
            "assessment_requirements": "All 107 retained requirements are AlgoCore-authored assessment design records, not Cambridge mark allocations.",
            "practice_rubrics": "All 78 self-rubrics are AlgoCore-authored and carry official_marks=null.",
            "official_marks_policy": "No Cambridge mark is assigned without a direct QP/MS locator; this draft assigns none to assessments.",
        },
        "inputs": input_records,
        "counts": {
            "assessment_requirements": len(requirement_dispositions),
            "assessment_destinations": len(destinations),
            "practice_items": len(practice_items),
            "stable_practice_item_ids": len({item["assessment_item_id"] for item in practice_items}),
            "a0_normalized_practice_ids": len(legacy_item_ids),
            "requirements_without_stage4_pattern_link": len(requirements_without_patterns),
            "patternless_lessons": len(patternless_lessons),
            "practice_items_without_stage4_pattern_link": len(items_without_patterns),
            "legacy_items_without_explicit_prompt": len(legacy_item_ids),
            "regular_items_with_generic_stage9_rubric": len(generic_rubric_item_ids),
            "items_without_explicit_pass_rule": len(missing_pass_rule_item_ids),
        },
        "assessment_requirement_dispositions": requirement_dispositions,
        "assessment_destination_dispositions": destinations,
        "assessment_items": practice_items,
        "findings": [
            {
                "finding_id": "A7-P4R1-ASSESS-001",
                "severity": "required",
                "count": len(requirements_without_patterns),
                "affected_ids": requirements_without_patterns,
                "statement": "Requirements have no Stage 4 pattern-card link. P4R-2 must author or explicitly disposition the missing method/pattern relationship.",
            },
            {
                "finding_id": "A7-P4R1-ASSESS-002",
                "severity": "required",
                "count": len(items_without_patterns),
                "affected_lesson_ids": patternless_lessons,
                "affected_item_ids": items_without_patterns,
                "statement": "Practice items in patternless lessons cannot satisfy the required pattern join until a reviewed pattern/disposition exists.",
            },
            {
                "finding_id": "A7-P4R1-ASSESS-003",
                "severity": "required",
                "count": len(legacy_item_ids),
                "affected_item_ids": legacy_item_ids,
                "statement": "The A0 IDs are preserved, but legacy practiceFlow entries have no explicit bilingual prompt or structured pass rule.",
            },
            {
                "finding_id": "A7-P4R1-ASSESS-004",
                "severity": "required",
                "count": len(practice_items),
                "statement": "Current items do not carry requirement/destination semantics in Stage 9. The draft supplies lesson-scope joins only; prompt-level assessment alignment remains unverified.",
            },
            {
                "finding_id": "A7-P4R1-ASSESS-005",
                "severity": "required",
                "count": len(generic_rubric_item_ids),
                "affected_item_ids": generic_rubric_item_ids,
                "statement": "These Stage 9 items reuse one of the broad requirement/state/code rubric signatures. P4R-2 must replace them with destination-specific criteria before release.",
            },
            {
                "finding_id": "A7-P4R1-ASSESS-006",
                "severity": "required",
                "count": len(missing_pass_rule_item_ids),
                "affected_item_ids": missing_pass_rule_item_ids,
                "statement": "These items have no explicit pass rule in the locked Stage 9 source; the draft preserves null instead of inventing one.",
            },
        ],
        "expected_denominators": {
            "assessment_requirements": expected["assessment_requirements"],
            "assessment_destinations": expected["assessment_destinations"],
            "practice_items": expected["practice_items"],
        },
    }

    write_json("MARKING_DISPOSITION_DRAFT.json", marking_output)
    write_json("ASSESSMENT_ITEM_MAP_DRAFT.json", assessment_output)
    print(
        json.dumps(
            {
                "marking_atoms": len(marking_atoms),
                "marking_chains": len(marking_chains),
                "requirements": len(requirement_dispositions),
                "destinations": len(destinations),
                "practice_items": len(practice_items),
                "assessment_status": assessment_output["status"],
            },
            sort_keys=True,
        )
    )


if __name__ == "__main__":
    main()
