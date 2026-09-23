from __future__ import annotations

import hashlib
import json
import re
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path


OUT = Path(__file__).resolve().parent
PAPER4 = OUT.parents[3]
S1 = PAPER4 / "stage-1"
S2 = PAPER4 / "stage-2"
BATCH = S1 / "batches" / "2021-2022"


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def compact(value: str) -> str:
    value = value.replace("\u00a0", " ").replace("\u2212", "-")
    value = value.replace("\u2026", "...")
    return re.sub(r"\s+", " ", value).strip()


def source_issue_refs(part) -> list[str]:
    refs = []
    for note in part.get("notes", []):
        refs.extend(re.findall(r"(?:issue|Issue)\s+([A-Z0-9-]+)", note))
    return sorted(set(refs))


def evidence_kind(evidence_requirement: str) -> str:
    text = evidence_requirement.lower()
    if "screenshot" in text:
        return "screenshot_evidence"
    if "program code" in text:
        return "code_listing"
    return "documented_evidence"


def rubric_core(candidate: dict) -> str:
    # Candidate extraction keeps the marking prose in the first table cell and
    # language listings in later cells. Stop before any listing if a cell also
    # contains one.
    text = candidate.get("rubric", [""])[0]
    cuts = [
        r"\bExample program code\s*:",
        r"\n\s*VB\.NET\s*\n",
        r"\n\s*Python\s*\n",
        r"\n\s*Java\s*\n",
        r"\n\s*Page\s+\d+\s+of\s+\d+",
    ]
    positions = []
    for pattern in cuts:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            positions.append(match.start())
    if positions:
        text = text[: min(positions)]
    return text.strip()


def directive_info(text: str, part_marks: int) -> dict:
    normalized = compact(text).lower()
    max_match = re.search(r"\bmax(?:imum)?\s*(\d+)\b", normalized)
    completed = re.search(r"complet(?:e|ed) statement(?:s)?(?:\s+to\s+max)?\s*\(?\s*(\d+)\s*\)?", normalized)
    return {
        "group_max": int(max_match.group(1)) if max_match else None,
        "completed_statement_marks": int(completed.group(1)) if completed else None,
        "per_bullet": bool(re.search(r"1 mark per (?:bullet|mark point|point)", normalized)),
        "part_marks": part_marks,
    }


def clean_clause(value: str) -> str:
    value = compact(value)
    value = re.sub(r"^[\u2022*\-]+\s*", "", value)
    value = re.sub(r"^\.{2,}\s*", "", value)
    value = re.sub(r"^1\s+mark(?:s)?\s+(?:per\s+(?:bullet|mark point|point)|for)\s*", "", value, flags=re.I)
    value = re.sub(
        r"\s+1\s+mark(?:s)?.*?\bmax\s+\d+\s*$",
        "",
        value,
        flags=re.I,
    )
    value = re.sub(r"\s+Pseudocode\s*:.*$", "", value)
    value = re.sub(r"\s+Example\s*:.*$", "", value)
    value = re.sub(r"\s+(?:FUNCTION|PROCEDURE)\s+[A-Za-z].*$", "", value)
    value = re.sub(r"\s+Input the (?:Frame|Maximum).*$", "", value)
    value = re.sub(r"\s+Page\s+\d+\s+of\s+\d+.*$", "", value, flags=re.I)
    return value.strip(" .;:")


def nonbullet_clauses(text: str) -> list[str]:
    flat = compact(text)
    # Keep explicit one-mark statements separate. Expected output examples are
    # evidence fixtures, not extra marking atoms.
    matches = list(re.finditer(r"(?i)(?:^|\s)(1\s+mark(?:s)?\s+for\s+)", flat))
    if matches:
        clauses = []
        for index, match in enumerate(matches):
            start = match.start(1)
            end = matches[index + 1].start(1) if index + 1 < len(matches) else len(flat)
            clause = clean_clause(flat[start:end])
            clause = re.split(r"(?i)\b(?:For example|Answer)\s*:?", clause)[0].strip()
            if clause:
                clauses.append(clause)
        return clauses
    first = re.split(r"(?i)\b(?:For example|Answer)\s*:?", flat)[0].strip()
    first = clean_clause(first)
    return [first] if first else []


def extract_atoms(candidate: dict, row: dict, part: dict) -> tuple[list[dict], dict]:
    core = rubric_core(candidate)
    directive = directive_info(core, part["marks"])
    # Cambridge PDFs use both ordinary bullet U+2022 and a private-use glyph
    # U+F0B7 depending on the source font.
    split = re.split(r"[\u2022\uf0b7]", core)
    bullets = [clean_clause(value) for value in split[1:] if clean_clause(value)]
    clauses = bullets or nonbullet_clauses(core)
    if not clauses:
        clauses = [row["ms_distinguishing_requirement"] or part["prompt_summary"]]
    if directive["completed_statement_marks"] is not None:
        clauses = [
            clause for clause in clauses
            if not re.search(r"(?i)\b(?:each\s+)?complet(?:e|ed) statement", clause)
        ]
    if "screenshot" in part["evidence_requirement"].lower() and part["marks"] == 1 and len(clauses) > 1:
        clauses = ["the screenshot contains every listed evidence element: " + "; ".join(clauses)]

    part_key = re.sub(r"[^a-zA-Z0-9]+", "-", part["part_id"]).strip("-").lower()
    main_group_max = directive["group_max"] if directive["completed_statement_marks"] is None else None
    group_id = f"grp-{part_key}" if main_group_max is not None else None
    atoms = []

    completed_marks = directive["completed_statement_marks"]
    if completed_marks:
        atoms.append(
            {
                "marking_point_id": f"mp-{part_key}-completed-statements",
                "ms_source_id": row["ms_basis"]["source_id"],
                "ms_pdf_pages": candidate["pages"],
                "criterion_paraphrase": f"Complete the {completed_marks} source-supplied statements accurately.",
                "authority": "official_ms",
                "condition": "Apply only to the incomplete statements printed in the question.",
                "alternatives": [],
                "dependency": None,
                "award_semantics": "group_max",
                "source_mark_value_if_unambiguous": None,
                "group_id": f"grp-{part_key}-completed-statements",
                "group_max": completed_marks,
                "method_step_refs": [],
                "code_or_evidence_obligation": evidence_kind(part["evidence_requirement"]),
                "source_issue_refs": source_issue_refs(part),
            }
        )

    for index, clause in enumerate(clauses, start=1):
        lowered = clause.lower()
        continuation = bool(re.match(r"(?:and|with|returning|assigning|adding|outputting|reading|using)\b", lowered))
        if main_group_max is not None:
            semantics = "group_max"
        elif "screenshot" in part["evidence_requirement"].lower():
            semantics = "evidence"
        elif "or equivalent" in lowered:
            semantics = "accept_equivalent"
        elif " either " in f" {lowered} " or " // " in clause:
            semantics = "alternative"
        elif continuation and atoms:
            semantics = "dependent"
        elif len(clauses) == 1 and part["marks"] > 1:
            semantics = "holistic"
        else:
            semantics = "discrete"

        if directive["per_bullet"]:
            value = 1
        elif len(clauses) == part["marks"]:
            value = 1
        elif completed_marks and re.search(r"(?i)\b1\s+mark\s+for\b", core):
            value = 1
        elif len(clauses) == 1 and not completed_marks:
            value = part["marks"]
        elif re.search(r"(?i)\b1\s+mark\b", core) and len(clauses) > 1:
            value = 1
        else:
            value = None

        alternatives = []
        if "or equivalent" in lowered:
            alternatives.append("Equivalent response accepted by the official source wording.")
        if " either " in f" {lowered} ":
            alternatives.append("The official criterion permits the stated implementation alternatives.")

        previous = atoms[-1]["marking_point_id"] if continuation and atoms else None
        phrase = (
            f"Continuation criterion: {clause}."
            if continuation
            else f"Credit for {clause[0].lower() + clause[1:] if clause else clause}."
        )
        atoms.append(
            {
                "marking_point_id": f"mp-{part_key}-{index:02d}",
                "ms_source_id": row["ms_basis"]["source_id"],
                "ms_pdf_pages": candidate["pages"],
                "criterion_paraphrase": phrase,
                "authority": "official_ms",
                "condition": "Within the source part and its stated data/representation contract.",
                "alternatives": alternatives,
                "dependency": previous,
                "award_semantics": semantics,
                "source_mark_value_if_unambiguous": value,
                "group_id": group_id,
                "group_max": main_group_max,
                "method_step_refs": [],
                "code_or_evidence_obligation": evidence_kind(part["evidence_requirement"]),
                "source_issue_refs": source_issue_refs(part),
            }
        )

    return atoms, directive


def main() -> None:
    question_index_path = S1 / "QUESTION_INDEX.json"
    source_issues_path = S1 / "SOURCE_ISSUES.json"
    pattern_map_path = S2 / "QUESTION_PATTERN_MAP.json"
    question_index = load(question_index_path)
    source_issues = load(source_issues_path)
    pattern_map = load(pattern_map_path)

    map_rows = {
        row["part_id"]: row
        for row in pattern_map["rows"]
        if re.search(r"_(?:s|w)(?:21|22)_", row["part_id"])
    }
    parts = []
    for paper in question_index["papers"]:
        if not re.search(r"_(?:s|w)(?:21|22)_", paper["paper_id"]):
            continue
        for question in paper["questions"]:
            for part in question["parts"]:
                parts.append((paper, question, part))

    candidate_paths = sorted(BATCH.glob("*_ms_candidates.json"))
    candidates = {}
    for path in candidate_paths:
        paper_id = path.name.removesuffix("_ms_candidates.json")
        candidates[paper_id] = {item["part"]: item for item in load(path)}

    built_utc = datetime.now(timezone.utc).replace(microsecond=0).isoformat()
    input_paths = [question_index_path, source_issues_path, pattern_map_path, *candidate_paths]
    input_hashes = [
        {"path": path.relative_to(PAPER4).as_posix(), "sha256": sha256(path)}
        for path in input_paths
    ]

    requirement_rows = []
    marking_rows = []
    directive_counts = Counter()
    for paper, question, part in parts:
        part_id = part["part_id"]
        row = map_rows[part_id]
        candidate = candidates[paper["paper_id"]][part["part"]]
        dependencies = list(row.get("dependency_part_ids", []))
        constraint_refs = [
            {"kind": "dependency_part", "ref": dependency} for dependency in dependencies
        ]
        constraint_refs.extend(
            {"kind": "required_source_file", "ref": name}
            for name in part.get("required_source_files", [])
        )
        requirement = {
            "part_id": part_id,
            "question_id": row["question_id"],
            "paper_id": row["paper_id"],
            "source_part_label": part["part"],
            "original_marks": part["marks"],
            "primary_pattern_id": row["primary_pattern_id"],
            "assessed_pattern_ids": row["assessed_pattern_ids"],
            "context_pattern_ids": row["context_pattern_ids"],
            "dependency_part_ids": dependencies,
            "qp_requirement": {
                "paraphrase": part["prompt_summary"],
                "source_id": row["qp_basis"]["source_id"],
                "pdf_pages": row["qp_basis"]["pdf_pages"],
                "constraint_refs": constraint_refs,
                "required_source_files": part.get("required_source_files", []),
                "evidence_requirement": compact(part["evidence_requirement"]),
                "authority": "official_qp",
            },
            "source_issue_refs": source_issue_refs(part),
            "review_status": "SUBMITTED",
        }
        requirement_rows.append(requirement)

        atoms, directive = extract_atoms(candidate, row, part)
        if directive["group_max"] is not None:
            directive_counts["group_max_parts"] += 1
        if directive["completed_statement_marks"] is not None:
            directive_counts["completed_statement_parts"] += 1
        if any(atom["award_semantics"] == "evidence" for atom in atoms):
            directive_counts["evidence_parts"] += 1
        if any(atom["award_semantics"] in {"alternative", "accept_equivalent"} for atom in atoms):
            directive_counts["alternative_or_equivalent_parts"] += 1

        pending_source_decision = part_id in {
            "9618_w21_41_2(e)",
            "9618_w21_42_2(e)",
            "9618_w22_41_1(b)",
            "9618_w22_43_1(b)",
        }
        if pending_source_decision:
            for atom in atoms:
                atom["award_semantics"] = "holistic"
                atom["source_mark_value_if_unambiguous"] = None
                atom["group_id"] = None
                atom["group_max"] = None
                if part_id.startswith("9618_w21_"):
                    atom["condition"] = "Criterion retained pending Lead adjudication of the printed max-7 grouping; the official part total remains 8."
                else:
                    atom["condition"] = "Criterion retained pending Lead adjudication of seven printed bullets against the official part total of 6."
        review_status = "PENDING_SOURCE_DECISION" if pending_source_decision else "SUBMITTED"
        marking_rows.append(
            {
                "part_id": part_id,
                "question_id": row["question_id"],
                "paper_id": row["paper_id"],
                "pattern_ids": row["assessed_pattern_ids"],
                "context_pattern_ids": row["context_pattern_ids"],
                "dependency_part_ids": dependencies,
                "original_part_marks": part["marks"],
                "qp_requirement": requirement["qp_requirement"],
                "marking_points": atoms,
                "part_disposition": "official_qp_ms_mapped",
                "review_status": review_status,
                "authority_note": "QP and MS locators are official. Atom wording is a concise Stage 4 editorial paraphrase; it is not a replacement for the source MS.",
            }
        )

    # Build issue identities and paper-specific occurrences without collapsing
    # duplicate paper variants.
    issue_definitions = {}
    issue_instances = []
    for observation in source_issues["batch_observations"]:
        paper_id = observation["paper_id"]
        if not re.search(r"_(?:s|w)(?:21|22)_", paper_id):
            continue
        for issue in observation["observations"]:
            issue_definitions.setdefault(
                issue["id"],
                {
                    "source_issue_id": issue["id"],
                    "kind": issue["kind"],
                    "description": issue["description"],
                    "stage1_disposition": issue["stage1_disposition"],
                    "downstream_owner": issue["downstream_owner"],
                },
            )
            part_id = f"{paper_id}_{issue['part']}"
            pattern_row = map_rows[part_id]
            if issue["id"] == "W21-2E-RUBRIC":
                disposition = "Keep the official part total at 8 and preserve the exception criteria plus the capped implementation group. Lead must adjudicate whether the two exception bullets sit inside or outside the printed max-7 group before canonical merge; do not sum them to 9."
                stage5 = "No execution implication; retain the Lead-approved group semantics in downstream rubric checks."
                status = "PENDING_LEAD_ADJUDICATION"
            else:
                disposition = "Preserve the source requirement and locator, exclude the source listing from any claim of verified correctness, and carry the identified discrepancy into the solution design contract."
                stage5 = "Independently implement and test the affected boundary, identifier, pointer, file, scope, or integration behaviour before learner-facing use."
                status = "SUBMITTED"
            issue_instances.append(
                {
                    "issue_instance_id": f"{paper_id}::{issue['id']}",
                    "source_issue_id": issue["id"],
                    "paper_id": paper_id,
                    "part_id": part_id,
                    "pattern_ids": pattern_row["assessed_pattern_ids"],
                    "context_pattern_ids": pattern_row["context_pattern_ids"],
                    "qp_locator": {
                        "source_id": pattern_row["qp_basis"]["source_id"],
                        "pdf_pages": issue.get("qp_pages", pattern_row["qp_basis"]["pdf_pages"]),
                    },
                    "ms_locator": {
                        "source_id": pattern_row["ms_basis"]["source_id"],
                        "pdf_pages": issue.get("ms_pages", pattern_row["ms_basis"]["pdf_pages"]),
                    },
                    "interpretation_risk": issue["description"],
                    "stage4_disposition": disposition,
                    "stage5_obligation": stage5,
                    "status": status,
                }
            )

    counts = {
        "papers": len({row["paper_id"] for row in requirement_rows}),
        "questions": len({row["question_id"] for row in requirement_rows}),
        "parts": len(requirement_rows),
        "original_marks": sum(row["original_marks"] for row in requirement_rows),
        "marking_atoms": sum(len(row["marking_points"]) for row in marking_rows),
        "unique_source_issue_ids": len(issue_definitions),
        "source_issue_instances": len(issue_instances),
    }
    self_checks = {
        "expected_counts": {"papers": 11, "questions": 33, "parts": 228, "original_marks": 825},
        "actual_counts": counts,
        "part_id_set_matches_stage1": len(requirement_rows) == 228 and len({r["part_id"] for r in requirement_rows}) == 228,
        "part_id_set_matches_stage2": set(map_rows) == {r["part_id"] for r in requirement_rows},
        "no_duplicate_part_rows": len({r["part_id"] for r in marking_rows}) == len(marking_rows),
        "all_qp_locators_present": all(r["qp_requirement"]["source_id"] and r["qp_requirement"]["pdf_pages"] for r in requirement_rows),
        "all_ms_atoms_have_locators": all(
            atom["ms_source_id"] and atom["ms_pdf_pages"]
            for row in marking_rows for atom in row["marking_points"]
        ),
        "all_official_atoms_labeled": all(
            atom["authority"] == "official_ms"
            for row in marking_rows for atom in row["marking_points"]
        ),
        "all_parts_have_atoms": all(row["marking_points"] for row in marking_rows),
        "issue_baseline_matches": len(issue_definitions) == 14 and len(issue_instances) == 27,
        "unresolved_part_ids": [
            row["part_id"] for row in marking_rows if row["review_status"] == "PENDING_SOURCE_DECISION"
        ],
        "directive_counts": dict(directive_counts),
    }

    common = {
        "schema_version": "s4-schema-v1-submission",
        "status": "SUBMITTED",
        "batch_id": "S4-S1",
        "years": [2021, 2022],
        "built_utc": built_utc,
        "input_release": "paper4-2026-s3-v1",
        "input_hashes": input_hashes,
    }
    requirements = {
        **common,
        "authority_boundary": "QP requirements are editorial paraphrases anchored to official QP pages. They do not add marking criteria.",
        "counts": counts,
        "rows": requirement_rows,
        "self_checks": self_checks,
    }
    marking = {
        **common,
        "authority_boundary": "Each atom paraphrases an official MS criterion at the cited pages. Group/alternative/dependency semantics prevent arithmetic claims unsupported by the source.",
        "counts": counts,
        "rows": marking_rows,
        "lead_adjudication_required": [
            {
                "decision_id": "S4-S1-DEC-001",
                "part_ids": ["9618_w21_41_2(e)", "9618_w21_42_2(e)"],
                "source_issue_id": "W21-2E-RUBRIC",
                "question": "Does the printed max-7 cap include both exception bullets, or is one exception mark outside the cap?",
                "safe_interim_rule": "Keep the official part total at 8, retain every criterion, and do not arithmetically total atom values until Lead records the group model.",
            },
            {
                "decision_id": "S4-S1-DEC-002",
                "part_ids": ["9618_w22_41_1(b)", "9618_w22_43_1(b)"],
                "source_issue_id": None,
                "question": "How should the seven printed ReadFile bullets be grouped under the official part total of 6?",
                "safe_interim_rule": "Retain all seven criteria and do not assign an arithmetic atom total until Lead confirms whether the exception-handling continuation is one combined point.",
            }
        ],
        "rows": marking_rows,
        "self_checks": self_checks,
    }
    risks = {
        **common,
        "authority_boundary": "This register preserves source discrepancies; it neither repairs official materials nor certifies source code.",
        "counts": {
            "unique_source_issue_ids": len(issue_definitions),
            "issue_instances": len(issue_instances),
            "pending_lead_adjudication": sum(i["status"] == "PENDING_LEAD_ADJUDICATION" for i in issue_instances),
            "stage5_execution_obligations": len(issue_instances) - sum(i["source_issue_id"] == "W21-2E-RUBRIC" for i in issue_instances),
        },
        "issue_definitions": sorted(issue_definitions.values(), key=lambda item: item["source_issue_id"]),
        "instances": sorted(issue_instances, key=lambda item: item["issue_instance_id"]),
        "stage4_discovered_ambiguities": [
            {
                "ambiguity_id": "S4-S1-DEC-002",
                "part_ids": ["9618_w22_41_1(b)", "9618_w22_43_1(b)"],
                "qp_ms_locator": {
                    "qp_source_ids": ["9618_w22_qp_41", "9618_w22_qp_43"],
                    "qp_pdf_pages": [2],
                    "ms_source_ids": ["9618_w22_ms_41", "9618_w22_ms_43"],
                    "ms_pdf_pages": [3, 4],
                },
                "risk": "The MS prints seven bullets under repeated one-mark-per-point headings while the official part total is 6.",
                "safe_disposition": "Preserve all criteria and request Lead grouping adjudication; do not claim seven marks.",
                "status": "PENDING_LEAD_ADJUDICATION",
            }
        ],
        "self_checks": {
            "unique_ids_expected_14": len(issue_definitions) == 14,
            "instances_expected_27": len(issue_instances) == 27,
            "all_instances_join_to_part": all(i["part_id"] in map_rows for i in issue_instances),
            "all_instances_have_qp_ms_locators": all(i["qp_locator"]["pdf_pages"] and i["ms_locator"]["pdf_pages"] for i in issue_instances),
        },
    }

    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "QUESTION_REQUIREMENTS.json").write_text(json.dumps(requirements, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (OUT / "MARKING_SUBMISSION.json").write_text(json.dumps(marking, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (OUT / "SOURCE_RISK_REGISTER.json").write_text(json.dumps(risks, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"status": "SUBMITTED", "counts": counts, "self_checks": self_checks}, indent=2))


if __name__ == "__main__":
    main()
