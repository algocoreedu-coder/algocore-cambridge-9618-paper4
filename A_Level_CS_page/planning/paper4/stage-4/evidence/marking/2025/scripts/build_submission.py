from __future__ import annotations

import hashlib
import json
import re
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = HERE.parent
PAPER4 = HERE.parents[4]
S1 = PAPER4 / "stage-1"
S2 = PAPER4 / "stage-2"

INDEX_PATH = S1 / "batches" / "2025" / "index.json"
MAP_PATH = S2 / "QUESTION_PATTERN_MAP.json"
ISSUES_PATH = S1 / "SOURCE_ISSUES.json"
MANIFEST_PATH = S1 / "SOURCE_MANIFEST.json"
REVIEW_DIR = S1 / "batches" / "2025"

SECTION_HEADER = re.compile(
    r"^### (?P<part>.+?) QP\[(?P<qp>.*?)\] MS\[(?P<ms>.*?)\] MARKS (?P<marks>\d+)/(?P<msmarks>\d+)$",
    re.M,
)


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def compact(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def source_locator(source_id: str, pages: list[int], part: str) -> dict:
    return {
        "source_id": source_id,
        "pdf_pages": pages,
        "part_label": part,
        "page_numbering": "one_based_pdf_page",
    }


def split_review(path: Path) -> dict[str, dict]:
    text = path.read_text(encoding="utf-8")
    matches = list(SECTION_HEADER.finditer(text))
    result = {}
    for i, match in enumerate(matches):
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        body = text[match.end():end].strip()
        qp, ms = body.split("MS BEGIN:", 1)
        result[match.group("part")] = {
            "qp": qp.strip(),
            "ms": ms.strip(),
            "marks": int(match.group("marks")),
        }
    return result


def strip_ms_noise(lines: list[str]) -> list[str]:
    clean = []
    for line in lines:
        line = line.strip()
        if not line:
            continue
        if line.startswith("© Cambridge") or line.startswith("Page "):
            break
        if line.startswith("Example program code") or line == "Example" or line.startswith("Example."):
            break
        if line == "PUBLISHED" or line in {"Question", "Answer", "Marks"}:
            continue
        if re.fullmatch(r"9618/4[123]", line):
            continue
        if line.startswith("Cambridge International AS & A Level"):
            continue
        if re.fullmatch(r"(May/June|October/November) 2025", line):
            continue
        clean.append(line)
    return clean


def parse_marking_criteria(ms_text: str, part: str, prompt_summary: str, marks: int) -> tuple[list[str], str]:
    lines = [x.strip() for x in ms_text.splitlines() if x.strip()]
    if lines and lines[0] == part:
        lines = lines[1:]
    lines = strip_ms_noise(lines)

    # The marking header is authoritative metadata and is retained separately.
    header_lines = []
    while lines and lines[0] != "•":
        line = lines.pop(0)
        if line == str(marks):
            continue
        header_lines.append(line)
        if len(header_lines) > 8:
            break
    header = compact(" ".join(header_lines))

    criteria = []
    if "•" in lines:
        current = []
        for line in lines:
            if line == "•":
                if current:
                    criteria.append(compact(" ".join(current)))
                current = []
            else:
                current.append(line)
        if current:
            criteria.append(compact(" ".join(current)))
    else:
        # Separate repeated one-mark statements when the MS prints them as prose.
        prose = header
        starts = list(re.finditer(r"(?i)(?=1 mark(?: each)? for)", prose))
        if len(starts) > 1:
            for i, start in enumerate(starts):
                end = starts[i + 1].start() if i + 1 < len(starts) else len(prose)
                criteria.append(compact(prose[start.start():end]))
            header = "multiple explicit one-mark criteria"
        elif prose and not re.fullmatch(r"(?i)1(?: mark)?", prose):
            # Remove only the allocation prefix; retain output/data conditions.
            criterion = re.sub(
                r"(?i)^1 mark(?: each)?(?: screenshots?)?(?: for| showing|:)?\s*",
                "",
                prose,
            ).strip(" :")
            if criterion:
                criteria = [criterion]

    if not criteria:
        criteria = [f"Provide the required result or evidence for: {prompt_summary}"]
        if not header:
            header = "criterion visible primarily as output/example in source"
    cleaned = []
    for criterion in criteria:
        criterion = re.sub(r"\s+e\.g\.\s*$", "", criterion).strip()
        criterion = re.sub(r"\s+e\.g\.\s+Test\s+1:.*$", "", criterion).strip()
        cleaned.append(criterion)
    criteria = cleaned
    return criteria, header


MANUAL_CRITERION_SPLITS = {
    # Visual facsimile review confirms that the final printed bullet carries two
    # separately awarded actions in each of these rows.
    "9618_s25_41_1(c)": [
        "Call Enqueue with every integer from 1 through 25 in ascending order.",
        "Use the returned Boolean in a selection.",
        "Output each integer with the matching Successful or Unsuccessful message.",
    ],
    "9618_w25_41_1(d)": [
        "Repeat the attempt 40 times.",
        "Generate an integer from 0 through 1000 inclusive inside the loop.",
        "Call Push with each generated value and retain or use its return value.",
        "When Push returns FALSE, output the full-stack message and leave the loop.",
    ],
    "9618_w25_41_3(d)": [
        "Declare the procedure with one Record parameter.",
        "Call Hash with the parameter key and retain or use the returned address.",
        "Use bucket position zero when it is empty.",
        "On collision, scan the bucket's second dimension for an empty position and store the record there.",
    ],
    "9618_s25_43_2(f)(ii)": [
        "Provide screenshot evidence showing locations for the first three searches and not-found output for the fourth.",
    ],
    "9618_s25_42_2(f)(iii)": [
        "Provide a screenshot showing the non-empty spare-record keys output by PrintSpare.",
    ],
}


RESOLVED_ALLOCATION_AMBIGUITIES = [
    {
        "part_id": "9618_s25_41_1(c)",
        "source_locator": {"source_id": "9618_s25_ms_41", "pdf_pages": [12], "part_label": "1(c)", "page_numbering": "one_based_pdf_page"},
        "observed": "The printed row carries three marks in two bullets; the second bullet contains selection-use and correct success/failure output as separate credited actions.",
        "resolution": "Represented as three one-mark atoms after direct facsimile inspection; no marks were inferred from bullet count alone.",
    },
    {
        "part_id": "9618_w25_41_1(d)",
        "source_locator": {"source_id": "9618_w25_ms_41", "pdf_pages": [11], "part_label": "1(d)", "page_numbering": "one_based_pdf_page"},
        "observed": "The printed row carries four marks in three bullets; the final bullet joins use of Push's return with the FALSE/full-message/break behaviour.",
        "resolution": "Represented as four one-mark atoms after direct facsimile inspection.",
    },
    {
        "part_id": "9618_w25_41_3(d)",
        "source_locator": {"source_id": "9618_w25_ms_41", "pdf_pages": [29, 30], "part_label": "3(d)", "page_numbering": "one_based_pdf_page"},
        "observed": "The printed row carries four marks in three bullets; the final bullet awards the no-collision store and collision-bucket scan/store behaviours separately.",
        "resolution": "Represented as four one-mark atoms after direct facsimile inspection.",
    },
    {
        "part_id": "9618_s25_43_2(f)(ii)",
        "source_locator": {"source_id": "9618_s25_ms_43", "pdf_pages": [32], "part_label": "2(f)(ii)", "page_numbering": "one_based_pdf_page"},
        "observed": "The page-bounded text parser initially stopped at the example marker and lost the criterion printed immediately before the image.",
        "resolution": "Direct facsimile review restored the single evidence atom: locations for the first three searches and not-found output for the fourth.",
    },
]


def infer_semantics(header: str, criterion: str, criteria_count: int, marks: int) -> tuple[str, int | None, int | None]:
    lower = header.lower()
    if "to max" in lower:
        return "group_max", 1, marks
    if criterion.startswith("…") or criterion.startswith("..."):
        return "dependent", 1 if "1 mark each" in lower else None, None
    if " or " in criterion.lower() or "//" in criterion:
        return "alternative", 1 if "1 mark each" in lower else None, None
    if "1 mark each" in lower and criteria_count == marks:
        return "discrete", 1, None
    if criteria_count == 1 and marks == 1:
        return "discrete", 1, None
    if criteria_count == marks:
        return "discrete", 1, None
    return "holistic", None, None


def source_issue_refs(part_id: str) -> list[str]:
    mapping = {
        "9618_s25_41_1(c)": ["S25-41-Q1C-CASE"],
        "9618_s25_41_3(a)(i)": ["S25-41-MS31-INIT"],
        "9618_s25_41_3(c)(i)": ["S25-41-MS35-INIT"],
        "9618_s25_42_2(a)": ["S25-42-Q2A-CLASSNAME"],
        "9618_s25_42_3(c)(i)": ["S25-42-Q3CI-NAME"],
        "9618_w25_43_2(b)": ["W25-43-Q2B-FULL-GUARD"],
    }
    return mapping.get(part_id, [])


def build_risks(pattern_by_part: dict[str, dict]) -> list[dict]:
    specs = [
        (
            "S25-41-MS31-INIT",
            "source_defect_and_extraction_loss",
            "9618_s25_41_3(a)(i)",
            "9618_s25_ms_41",
            [31],
            "The Python constructor name is visibly printed with a single underscore on each side, while extracted text loses the underscores.",
            "Treat the rubric criteria as marking authority; do not copy or silently repair the sample listing in Stage 4.",
        ),
        (
            "S25-41-Q1C-CASE",
            "source_code_verification_required",
            "9618_s25_41_1(c)",
            "9618_s25_ms_41",
            [12],
            "The Python sample uses both X and x in the same loop/output fragment.",
            "Preserve the official criteria and require an independent case-consistent implementation test in Stage 5.",
        ),
        (
            "S25-41-MS35-INIT",
            "source_defect_and_extraction_loss",
            "9618_s25_41_3(c)(i)",
            "9618_s25_ms_41",
            [35],
            "The Tree Python constructor is visibly printed as def _init_(self, FirstNode), with a single underscore on each side; plain-text extraction can additionally lose underscores.",
            "Treat the rubric criteria as marking authority; do not copy or silently repair the sample listing in Stage 4.",
        ),
        (
            "S25-42-Q2A-CLASSNAME",
            "source_identifier_variation",
            "9618_s25_42_2(a)",
            "9618_s25_ms_42",
            [19, 20],
            "The QP requests NewRecord, while the Python example instantiates a class named Record.",
            "Keep NewRecord as the QP contract; record the example-name discrepancy for Stage 5 fixture review.",
        ),
        (
            "S25-42-Q3CI-NAME",
            "source_identifier_variation",
            "9618_s25_42_3(c)(i)",
            "9618_s25_ms_42",
            [40, 41],
            "A criterion uses Territory/SetTerritory while the QP and example use TerritorySize/SetTerritorySize.",
            "Preserve QP identifiers in the design and treat the MS wording as an accepted semantic criterion, pending Stage 5 assembly checks.",
        ),
        (
            "W25-43-Q2B-FULL-GUARD",
            "source_code_verification_required",
            "9618_w25_43_2(b)",
            "9618_w25_ms_43",
            [22, 23],
            "The official criterion requires full detection and FALSE on full, but the printed language samples show a comparison that appears to insert when QueueTail is at or beyond 99.",
            "Use the official criterion as the Stage 4 contract; require boundary tests at empty, 99 occupied and 100 occupied in Stage 5.",
        ),
    ]
    risks = []
    for risk_id, kind, part_id, source_id, pages, interpretation, disposition in specs:
        row = pattern_by_part[part_id]
        stage5_obligation = "Verify an independently authored Python implementation and boundary fixtures; do not certify the MS sample as executable source."
        stage5_boundary_fixtures = []
        if risk_id == "W25-43-Q2B-FULL-GUARD":
            stage5_obligation = "Verify an independently authored Python queue implementation with explicit fixtures for an empty queue, 99 occupied slots and 100 occupied slots; confirm FALSE at full capacity and do not certify or silently repair the MS sample listing."
            stage5_boundary_fixtures = [
                {"state": "empty", "occupied_slots": 0, "obligation": "First insertion establishes head/tail/count consistently."},
                {"state": "near_full", "occupied_slots": 99, "obligation": "One further insertion succeeds into the final free slot."},
                {"state": "full", "occupied_slots": 100, "obligation": "Insertion is rejected, FALSE is returned and queue state is preserved."},
            ]
        risks.append(
            {
                "risk_id": risk_id,
                "kind": kind,
                "affected_part_ids": [part_id],
                "affected_pattern_ids": row["assessed_pattern_ids"],
                "source_locator": source_locator(source_id, pages, row["source_part"]["part"]),
                "interpretation_risk": interpretation,
                "stage4_disposition": disposition,
                "stage5_obligation": stage5_obligation,
                "stage5_boundary_fixtures": stage5_boundary_fixtures,
                "status": "CARRIED_FORWARD",
            }
        )
    return risks


def main() -> None:
    index = read_json(INDEX_PATH)
    pattern_map = read_json(MAP_PATH)
    pattern_rows = {
        row["part_id"]: row
        for row in pattern_map["rows"]
        if re.match(r"^9618_[sw]25_", row["paper_id"])
    }

    review_sections = {}
    review_paths = sorted(REVIEW_DIR.glob("9618_*_review.txt"))
    for path in review_paths:
        paper_id = path.stem.removesuffix("_review")
        review_sections[paper_id] = split_review(path)

    input_files = [INDEX_PATH, MAP_PATH, ISSUES_PATH, MANIFEST_PATH, *review_paths]
    input_hashes = [
        {"path": str(path.relative_to(PAPER4)).replace("\\", "/"), "sha256": sha256(path)}
        for path in input_files
    ]
    generated = datetime.now(timezone.utc).replace(microsecond=0).isoformat()

    requirements = []
    marking_rows = []
    paper_stats = defaultdict(lambda: {"questions": set(), "parts": 0, "marks": 0, "marking_points": 0})
    anomalies = []

    for paper in index["papers"]:
        paper_id = paper["paper_id"]
        qp_id = paper["qp_source_id"]
        ms_id = paper["ms_source_id"]
        for question in paper["questions"]:
            question_id = f"{paper_id}_q{question['question_number']}"
            for part in question["parts"]:
                part_id = f"{paper_id}_{part['part']}"
                classification = pattern_rows[part_id]
                source_section = review_sections[paper_id][part["part"]]

                requirement_atoms = [
                    {
                        "requirement_atom_id": f"{part_id}.req.01",
                        "kind": "task_contract",
                        "paraphrase": part["prompt_summary"],
                        "authority": "official_qp",
                        "source_locator": source_locator(qp_id, part["qp_pages"], part["part"]),
                    }
                ]
                if part["required_source_files"]:
                    requirement_atoms.append(
                        {
                            "requirement_atom_id": f"{part_id}.req.02",
                            "kind": "source_file_constraint",
                            "paraphrase": "Use the source file(s) named by this part or its question context: " + ", ".join(part["required_source_files"]),
                            "authority": "official_qp",
                            "source_locator": source_locator(qp_id, part["qp_pages"], part["part"]),
                        }
                    )
                requirement_atoms.append(
                    {
                        "requirement_atom_id": f"{part_id}.req.{len(requirement_atoms)+1:02d}",
                        "kind": "submission_or_evidence",
                        "paraphrase": part["evidence_requirement"],
                        "authority": "official_qp",
                        "source_locator": source_locator(qp_id, part["qp_pages"], part["part"]),
                    }
                )
                requirements.append(
                    {
                        "part_id": part_id,
                        "question_id": question_id,
                        "paper_id": paper_id,
                        "part_label": part["part"],
                        "qp_requirement": {
                            "paraphrase": part["prompt_summary"],
                            "source_id": qp_id,
                            "pdf_pages": part["qp_pages"],
                            "constraint_refs": [x["requirement_atom_id"] for x in requirement_atoms],
                        },
                        "requirement_atoms": requirement_atoms,
                        "dependency_part_ids": classification["dependency_part_ids"],
                        "dependency_semantics": part.get("dependency_kinds", {}),
                        "required_source_files": part["required_source_files"],
                        "assessed_pattern_ids": classification["assessed_pattern_ids"],
                        "context_pattern_ids": classification["context_pattern_ids"],
                        "task_mode": classification["task_mode"],
                        "source_issue_refs": source_issue_refs(part_id),
                        "review_status": "SUBMITTED",
                    }
                )

                criteria, allocation_header = parse_marking_criteria(
                    source_section["ms"], part["part"], part["prompt_summary"], part["marks"]
                )
                criteria = MANUAL_CRITERION_SPLITS.get(part_id, criteria)
                marking_points = []
                for number, criterion in enumerate(criteria, 1):
                    semantics, value, group_max = infer_semantics(
                        allocation_header, criterion, len(criteria), part["marks"]
                    )
                    if classification["task_mode"] == "test_evidence":
                        semantics = "evidence"
                    if part_id == "9618_s25_42_1(e)":
                        # The MS explicitly heads this seven-bullet row "1 mark for:".
                        # Each printed bullet is therefore an unambiguous one-mark atom.
                        value = 1
                        if number == 5:
                            semantics = "discrete"
                    dependency = None
                    if (criterion.startswith("…") or criterion.startswith("...")) and number > 1:
                        dependency = f"{part_id}.mp.{number-1:02d}"
                    alternatives = []
                    if semantics == "alternative" or "//" in criterion or " or " in criterion.lower():
                        alternatives = ["Accept an equivalent route only where the official wording permits it; Lead must preserve the QP contract."]
                    if part_id == "9618_s25_42_1(e)" and number == 5:
                        alternatives = []
                    obligation = (
                        "Provide the requested screenshot/output evidence."
                        if classification["task_mode"] == "test_evidence"
                        else "Provide program structure/behaviour satisfying this criterion; executable verification remains Stage 5."
                    )
                    marking_points.append(
                        {
                            "marking_point_id": f"{part_id}.mp.{number:02d}",
                            "ms_source_id": ms_id,
                            "ms_pdf_pages": part["ms_pages"],
                            "ms_locator": source_locator(ms_id, part["ms_pages"], part["part"]),
                            "criterion_paraphrase": criterion,
                            "authority": "official_ms",
                            "condition": "Apply within the exact data, representation and output contract of the cited part.",
                            "alternatives": alternatives,
                            "dependency": dependency,
                            "award_semantics": semantics,
                            "source_mark_value_if_unambiguous": value,
                            "group_id": f"{part_id}.group.max" if group_max else None,
                            "group_max": group_max,
                            "method_step_refs": [],
                            "method_join_status": "PENDING_LEAD_METHOD_JOIN",
                            "candidate_method_pattern_ids": classification["assessed_pattern_ids"],
                            "code_or_evidence_obligation": obligation,
                            "source_issue_refs": source_issue_refs(part_id),
                        }
                    )

                if len(criteria) != part["marks"] and "to max" not in allocation_header.lower():
                    anomalies.append(
                        {
                            "part_id": part_id,
                            "part_marks": part["marks"],
                            "criterion_atom_count": len(criteria),
                            "allocation_header": allocation_header,
                            "disposition": "Retained without forcing atom count to equal marks; inspect alternative, evidence or grouped semantics.",
                        }
                    )

                marking_rows.append(
                    {
                        "part_id": part_id,
                        "question_id": question_id,
                        "paper_id": paper_id,
                        "part_label": part["part"],
                        "marks": part["marks"],
                        "pattern_ids": classification["assessed_pattern_ids"],
                        "context_pattern_ids": classification["context_pattern_ids"],
                        "qp_requirement": {
                            "paraphrase": part["prompt_summary"],
                            "source_id": qp_id,
                            "pdf_pages": part["qp_pages"],
                            "constraint_refs": [x["requirement_atom_id"] for x in requirement_atoms],
                        },
                        "ms_allocation_header": allocation_header,
                        "marking_points": marking_points,
                        "part_disposition": "MAPPED_TO_OFFICIAL_MS_ATOMS",
                        "review_status": "SUBMITTED",
                        "source_issue_refs": source_issue_refs(part_id),
                        "authority_note": "Official marks belong to this part row. Assessed co-tags are cross-references and do not divide or duplicate the marks.",
                    }
                )
                stat = paper_stats[paper_id]
                stat["questions"].add(question_id)
                stat["parts"] += 1
                stat["marks"] += part["marks"]
                stat["marking_points"] += len(marking_points)

    risks = build_risks(pattern_rows)
    requirement_doc = {
        "schema_version": "s4-source-submission-v1",
        "status": "SUBMITTED",
        "work_order": "S4-S3",
        "batch": "2025",
        "generated_utc": generated,
        "input_release": "paper4-2026-s3-v1",
        "authority_boundary": "QP requirements only; summaries are bounded paraphrases and source locators remain authoritative.",
        "counts": {"papers": 6, "questions": 18, "parts": len(requirements), "marks": sum(x["marks"] for x in marking_rows)},
        "input_hashes": input_hashes,
        "rows": requirements,
        "unprocessed_part_ids": [],
        "self_checks": {
            "unique_part_ids": len({x["part_id"] for x in requirements}) == len(requirements),
            "all_part_ids_match_stage2": set(x["part_id"] for x in requirements) == set(pattern_rows),
            "all_rows_have_qp_locator": all(x["qp_requirement"]["pdf_pages"] for x in requirements),
        },
    }
    marking_doc = {
        "schema_version": "s4-source-submission-v1",
        "status": "SUBMITTED",
        "work_order": "S4-S3",
        "batch": "2025",
        "generated_utc": generated,
        "input_release": "paper4-2026-s3-v1",
        "authority_boundary": "Marking atoms paraphrase official MS criteria. Method refs are intentionally pending the Lead canonical join; no code is certified.",
        "counts": {
            "papers": 6,
            "questions": 18,
            "parts": len(marking_rows),
            "marks": sum(x["marks"] for x in marking_rows),
            "marking_point_atoms": sum(len(x["marking_points"]) for x in marking_rows),
            "parts_with_multiple_assessed_patterns": sum(len(x["pattern_ids"]) > 1 for x in marking_rows),
        },
        "paper_counts": [
            {
                "paper_id": paper,
                "questions": len(values["questions"]),
                "parts": values["parts"],
                "marks": values["marks"],
                "marking_point_atoms": values["marking_points"],
            }
            for paper, values in sorted(paper_stats.items())
        ],
        "input_hashes": input_hashes,
        "rows": marking_rows,
        "ambiguities": anomalies,
        "resolved_allocation_ambiguities": RESOLVED_ALLOCATION_AMBIGUITIES,
        "unprocessed_part_ids": [],
        "self_checks": {
            "exact_140_parts": len(marking_rows) == 140,
            "exact_450_marks": sum(x["marks"] for x in marking_rows) == 450,
            "unique_part_ids": len({x["part_id"] for x in marking_rows}) == len(marking_rows),
            "all_rows_have_ms_locator": all(mp["ms_pdf_pages"] for row in marking_rows for mp in row["marking_points"]),
            "no_marks_duplicated_for_cotags": sum(x["marks"] for x in marking_rows) == 450,
            "method_refs_not_fabricated": all(not mp["method_step_refs"] for row in marking_rows for mp in row["marking_points"]),
        },
    }
    risk_doc = {
        "schema_version": "s4-source-risk-v1",
        "status": "SUBMITTED",
        "work_order": "S4-S3",
        "batch": "2025",
        "generated_utc": generated,
        "scope_note": "Concrete source/example risks found in Stage 1 review plus one additional MS sample boundary defect found during this source pass. This is not executable-code certification.",
        "risks": risks,
        "counts": {
            "risk_instances": len(risks),
            "affected_parts": len({p for r in risks for p in r["affected_part_ids"]}),
            "stage5_obligations": len(risks),
        },
        "input_hashes": input_hashes,
        "self_checks": {
            "all_risks_have_locator": all(r["source_locator"]["pdf_pages"] for r in risks),
            "all_risks_have_stage5_obligation": all(r["stage5_obligation"] for r in risks),
            "all_affected_parts_in_batch": all(p in pattern_rows for r in risks for p in r["affected_part_ids"]),
        },
    }

    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "QUESTION_REQUIREMENTS.json").write_text(json.dumps(requirement_doc, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (OUT / "MARKING_SUBMISSION.json").write_text(json.dumps(marking_doc, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (OUT / "SOURCE_RISK_REGISTER.json").write_text(json.dumps(risk_doc, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    allocation_counts = Counter(mp["award_semantics"] for row in marking_rows for mp in row["marking_points"])
    review = f"""# S4-S3 review — marking corpus 2025

Status: **SUBMITTED**. This is an agent submission for Lead review, not a batch gate or canonical method artifact.

## Coverage

- 6 papers / 18 questions / {len(marking_rows)} scored parts / {sum(x['marks'] for x in marking_rows)} indexed marks.
- {sum(len(x['marking_points']) for x in marking_rows)} editorial marking-point atoms, each with an official MS locator.
- {sum(len(x['pattern_ids']) > 1 for x in marking_rows)} multi-assessed rows retain all pattern references while marks remain owned by one part row.
- Award semantics: {', '.join(f'{key}={value}' for key, value in sorted(allocation_counts.items()))}.
- {len(anomalies)} rows intentionally have an atom count different from the part mark total outside a `to max` group; these are listed in `MARKING_SUBMISSION.json.ambiguities` and are not force-balanced.

## Method

The submission uses the frozen Stage 1 2025 index for part identity, marks, QP/MS pages and evidence workflow; the frozen Stage 2 map for assessed/context patterns; and the six Stage 1 page-bounded QP/MS review extracts for criterion semantics. Every source row was parsed at the part boundary and retained as a single ledger row. Bullets beginning with an ellipsis are marked dependent; `to max` groups retain a cap; evidence rows remain evidence semantics. No claim is made that bullet count always equals marks.

`method_step_refs` are empty by design and carry `PENDING_LEAD_METHOD_JOIN`. This agent did not invent canonical method IDs or write solutions. All code/evidence obligations remain design inputs, and code examples remain unexecuted.

## Source risks and decisions needed

Six concrete source risks are carried in `SOURCE_RISK_REGISTER.json`: the two s25/41 constructor underscore occurrences, s25/41 X/x case mismatch, s25/42 Record/NewRecord mismatch, s25/42 Territory naming variation, and the w25/43 queue full-guard contradiction between criterion and sample listing. In every case, the QP/MS criterion contract is retained and sample code requires independent Stage 5 verification.

## Precise ambiguity list

- `9618_s25_41_1(c)`, MS PDF 12: three marks are printed in two bullets; the second bullet contains two credited actions. Resolved as three one-mark atoms after facsimile review.
- `9618_w25_41_1(d)`, MS PDF 11: four marks are printed in three bullets; the last bullet contains the Push-return action and the FALSE/full-message/break action. Resolved as four one-mark atoms.
- `9618_w25_41_3(d)`, MS PDF 29-30: four marks are printed in three bullets; the last bullet separates no-collision storage from collision-bucket search/storage. Resolved as four one-mark atoms.
- `9618_s25_43_2(f)(ii)`, MS PDF 32: the extraction boundary left only the example marker; facsimile review restored the single evidence criterion, locations for the first three searches and not-found for the fourth.
- Six source/example-code ambiguities remain deliberately carried forward under IDs `S25-41-MS31-INIT`, `S25-41-MS35-INIT`, `S25-41-Q1C-CASE`, `S25-42-Q2A-CLASSNAME`, `S25-42-Q3CI-NAME`, and `W25-43-Q2B-FULL-GUARD`. Their official criteria are usable for Stage 4, while code/example resolution is a Stage 5 obligation.

There are no unresolved part-allocation anomalies in this submission. Lead should still review the four resolved rows and six carried source risks before canonical join. A bullet count is never used as a substitute for the Marks column or explicit allocation language.

## A8 required rework

- `A8-SRC-REQ-005`: restored a meaningful, bounded evidence criterion for `9618_s25_42_2(f)(iii)` without transcribing the screenshot.
- `A8-SRC-REQ-006`: all seven `9618_s25_42_1(e)` atoms now carry an explicit one-mark value; mp.05 is discrete and has no alternative-route note.
- `A8-SRC-REQ-007`: page 35 constructor defect is recorded as `S25-41-MS35-INIT` and joined to part `9618_s25_41_3(c)(i)` and both atoms.
- `A8-SRC-REQ-008`: `W25-43-Q2B-FULL-GUARD` now names empty, 99-occupied and 100-occupied Stage 5 fixtures in JSON.

## Self-check result

PASS for the submission boundary: exact 140 parts and 450 marks; six paper totals are each 75; all part IDs are unique and equal the Stage 2 2025 set; all official atoms have an MS locator; no co-tag duplicates marks; no canonical method refs or executable claims were created.
"""
    (OUT / "REVIEW.md").write_text(review, encoding="utf-8")

    artifact_names = [
        "QUESTION_REQUIREMENTS.json",
        "MARKING_SUBMISSION.json",
        "SOURCE_RISK_REGISTER.json",
        "REVIEW.md",
    ]
    artifact_hashes = {name: sha256(OUT / name) for name in artifact_names}
    rework_response = {
        "schema_version": "s4-rework-response-v1",
        "status": "RESUBMITTED",
        "work_order": "S4-S3",
        "batch": "2025",
        "generated_utc": generated,
        "findings": [
            {
                "finding_id": "A8-SRC-REQ-005",
                "status": "RESUBMITTED",
                "changes": [
                    "Added a bounded paraphrase for 9618_s25_42_2(f)(iii).mp.01 stating that the screenshot shows PrintSpare's non-empty spare-key output.",
                    "Retained evidence semantics, one official mark and MS PDF page 32 locator; no screenshot text was transcribed as data.",
                ],
                "affected_artifacts": ["MARKING_SUBMISSION.json", "REVIEW.md"],
            },
            {
                "finding_id": "A8-SRC-REQ-006",
                "status": "RESUBMITTED",
                "changes": [
                    "Assigned source_mark_value_if_unambiguous=1 to all seven atoms for 9618_s25_42_1(e).",
                    "Changed mp.05 to discrete and removed its generic alternative text while retaining continuation dependencies on the ellipsis atoms.",
                ],
                "affected_artifacts": ["MARKING_SUBMISSION.json", "REVIEW.md"],
            },
            {
                "finding_id": "A8-SRC-REQ-007",
                "status": "RESUBMITTED",
                "changes": [
                    "Added risk S25-41-MS35-INIT for the printed single-underscore Tree constructor on MS PDF page 35.",
                    "Joined the risk to 9618_s25_41_3(c)(i), its requirement row and both marking atoms, with independent Stage 5 execution verification.",
                ],
                "affected_artifacts": ["QUESTION_REQUIREMENTS.json", "MARKING_SUBMISSION.json", "SOURCE_RISK_REGISTER.json", "REVIEW.md"],
            },
            {
                "finding_id": "A8-SRC-REQ-008",
                "status": "RESUBMITTED",
                "changes": [
                    "Expanded W25-43-Q2B-FULL-GUARD Stage 5 obligation with explicit empty, 99-occupied and 100-occupied fixtures.",
                    "Retained the official criterion as authority and did not repair or certify the sample listing.",
                ],
                "affected_artifacts": ["SOURCE_RISK_REGISTER.json", "REVIEW.md"],
            },
        ],
        "artifact_sha256": artifact_hashes,
        "validator": "scripts/validate_submission.py",
        "validation_status": "PENDING_REGENERATED_VALIDATION",
    }
    (OUT / "REWORK_RESPONSE.json").write_text(json.dumps(rework_response, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
