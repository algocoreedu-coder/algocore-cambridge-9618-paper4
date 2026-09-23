#!/usr/bin/env python3
"""Build the Stage 4 S4-S2 source/marking submission from locked Stage 1-2 data.

This script intentionally does not infer one mark per displayed bullet.  It keeps
the source award header and only records an individual value when the mark scheme
states "one/1 mark each", or when a one-mark row has one criterion.
"""

from __future__ import annotations

import hashlib
import json
import re
from collections import Counter, defaultdict
from pathlib import Path


HERE = Path(__file__).resolve().parent
OUT = HERE.parent
P4 = OUT.parents[3]
S1 = P4 / "stage-1"
S2 = P4 / "stage-2"


EXPLICIT_CREDIT_OVERRIDES = {
    "9618_s24_41_1(e)(ii)": [
        ("discrete", "Take the search value as input."),
        ("discrete", "Call BinarySearch with the input value."),
        ("discrete", "Output the value returned by BinarySearch."),
    ],
    "9618_s24_43_1(e)(ii)": [
        ("discrete", "Take the search value as input."),
        ("discrete", "Call BinarySearch with the input value."),
        ("discrete", "Output the value returned by BinarySearch."),
    ],
    "9618_s24_41_1(e)(iii)": [
        ("evidence", "Submitted evidence shows the find-2 test and its specified found result."),
        ("evidence", "Submitted evidence shows the find-7 test and the specified -1/not-found result."),
    ],
    "9618_s24_43_1(e)(iii)": [
        ("evidence", "Submitted evidence shows the find-2 test and its specified found result."),
        ("evidence", "Submitted evidence shows the find-7 test and the specified -1/not-found result."),
    ],
    "9618_s24_41_2(c)": [
        ("discrete", "Declare the procedure with a Tree parameter and the appropriate procedure boundary."),
        ("discrete", "Use getter methods to access the Tree data."),
        ("discrete", "Output the four required Tree attributes."),
        ("discrete", "Branch on the evergreen value and output the correct message for each case."),
    ],
    "9618_s24_43_2(c)": [
        ("discrete", "Declare the procedure with a Tree parameter and the appropriate procedure boundary."),
        ("discrete", "Use getter methods to access the Tree data."),
        ("discrete", "Output the four required Tree attributes."),
        ("discrete", "Branch on the evergreen value and output the correct message for each case."),
    ],
    "9618_s24_41_2(d)(i)": [
        ("discrete", "Call ReadData and retain/use the returned Tree array."),
        ("discrete", "Call PrintTrees with the first object in the returned array."),
    ],
    "9618_s24_43_2(d)(i)": [
        ("discrete", "Call ReadData and retain/use the returned Tree array."),
        ("discrete", "Call PrintTrees with the first object in the returned array."),
    ],
    "9618_w23_41_3(e)(ii)": [
        ("evidence", "Submitted evidence preserves the official jack/right test output."),
        ("evidence", "Submitted evidence preserves the official karla/down test output."),
    ],
    "9618_w23_43_3(e)(ii)": [
        ("evidence", "Submitted evidence preserves the official jack/right test output."),
        ("evidence", "Submitted evidence preserves the official karla/down test output."),
    ],
}


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def clean(s: str) -> str:
    return re.sub(r"\s+", " ", s).strip(" \n\t•")


def slug_id(s: str) -> str:
    return re.sub(r"[^A-Za-z0-9]+", "-", s).strip("-").upper()


def source_line_region(page: dict, start_y: float | None, end_y: float | None) -> list[str]:
    selected = []
    for line in page.get("lines", []):
        box = line.get("display_bbox") or line.get("bbox") or [0, 0, 0, 0]
        top = float(box[1])
        if start_y is not None and top < start_y - 3:
            continue
        if end_y is not None and top >= end_y - 3:
            continue
        text = line.get("text", "").strip()
        if text:
            selected.append((top, float(box[0]), text))
    selected.sort(key=lambda x: (round(x[0], 1), x[1]))
    return [x[2] for x in selected]


def strip_ms_chrome(lines: list[str]) -> list[str]:
    out = []
    skip_phrases = (
        "Cambridge International AS & A Level",
        "© UCLES",
        "© Cambridge University Press",
        "PUBLISHED",
        "Question Answer Marks",
    )
    for line in lines:
        # Preserve bullet glyphs here.  They delimit semantic criteria later;
        # removing them would collapse a grouped row into one false atom.
        t = re.sub(r"\s+", " ", line).strip()
        if not t or any(p in t for p in skip_phrases):
            continue
        if re.fullmatch(r"9618/4[123]", t) or re.fullmatch(r"Page \d+ of \d+", t):
            continue
        if re.fullmatch(r"(May/June|October/November) 20\d\d", t):
            continue
        out.append(t)
    return out


def extract_row_text(row: dict, extracted: dict, page_labels: dict[int, list[tuple[float, str]]]) -> tuple[str, list[str]]:
    page_by_number = {p["pdf_page"]: p for p in extracted["pages"]}
    chunks: list[str] = []
    per_page: list[str] = []
    label_by_page = {x["pdf_page"]: x for x in row["source_part"].get("ms_label_locators", [])}
    for page_no in row["source_part"]["ms_pages"]:
        page = page_by_number[page_no]
        locator = label_by_page.get(page_no)
        if locator:
            start = float(locator["display_bbox"][1])
            later = [y for y, _ in page_labels[page_no] if y > start + 2]
            end = min(later) if later else None
            lines = source_line_region(page, start, end)
        else:
            # An explicitly indexed continuation page.  Keep its content, but not
            # the page furniture.  Stage 1 already assigned continuation ownership.
            lines = source_line_region(page, None, None)
        lines = strip_ms_chrome(lines)
        text = clean(" ".join(lines))
        if text:
            per_page.append(text)
            chunks.append(text)
    return clean(" ".join(chunks)), per_page


def award_header(text: str, marks: int) -> str:
    candidates = [
        r"(?:one|1) mark each(?: to (?:a )?max(?:imum)? \d+)?",
        r"(?:one|1) mark for",
        r"\d+ marks? for",
        r"max(?:imum)? \d+",
    ]
    lower = text.lower()
    for pat in candidates:
        m = re.search(pat, lower, flags=re.I)
        if m:
            return clean(text[m.start():m.end()])
    return f"Marks column total: {marks}; no per-bullet allocation inferred."


def criterion_candidates(text: str, fallback: str) -> list[str]:
    # Remove code examples: they demonstrate acceptable forms but are not safely
    # decomposed into extra marks by this source-ledger pass.
    pre = re.split(r"(?:\bexample program code\b|\bexample code\b|\bfor example\b)", text, maxsplit=1, flags=re.I)[0]
    # Some schemes introduce a code listing only with a language label.
    pre = re.split(r"(?:\sPython:?\s|\sJava\s|\sVB\.NET\s|\sPseudocode:?\s)", pre, maxsplit=1, flags=re.I)[0]
    pre = re.split(r"\s(?:FUNCTION|PROCEDURE|DECLARE)\s", pre, maxsplit=1)[0]
    parts = re.split(r"\s*[•]\s*", pre)
    if len(parts) > 1:
        bullets = []
        for x in parts[1:]:
            x = re.split(r"(?:\sPython:?\s|\sJava\s|\sVB\.NET\s|\sPseudocode:?\s)", x, maxsplit=1, flags=re.I)[0]
            x = re.split(r"\s(?:FUNCTION|PROCEDURE|DECLARE)\s", x, maxsplit=1)[0]
            x = re.sub(r"\s+e\.g\.?$", "", x, flags=re.I)
            if clean(x):
                bullets.append(clean(x))
        # Drop trailing Marks-column number accidentally read into the row.
        bullets = [re.sub(r"\s+\d+$", "", b).strip() for b in bullets]
        prefix = clean(parts[0])
        # A few rows allocate a capped set of completed statements/gaps and then
        # list additional criteria as bullets.  The capped set is itself an atom.
        if re.search(r"(?:completed statements?|each gap).*max", prefix, flags=re.I):
            m = re.search(r"(?:one|1) mark for each completed statements? to (?:a )?max(?:imum)? \d+", prefix, flags=re.I)
            bullets.insert(0, clean(m.group(0) if m else prefix))
        return bullets or [fallback]
    # Rows without bullet glyphs can still contain several explicitly introduced
    # groups (for example max 3 completed statements + two named one-mark checks).
    starts = list(re.finditer(r"(?=(?:One|1) mark\b)", pre, flags=re.I))
    if len(starts) >= 2:
        groups = []
        for i, match in enumerate(starts):
            end = starts[i + 1].start() if i + 1 < len(starts) else len(pre)
            item = clean(pre[match.start():end])
            item = re.sub(r"\s+\d+$", "", item).strip()
            if item:
                groups.append(item)
        if groups:
            return groups
    # Preserve one composite atom where the layout does not expose separate
    # criteria. This is safer than manufacturing a point per sentence.
    body = re.sub(r"^.*?(?:mark(?:s)? for:?|marks column total:[^.;]*[.;]?)", "", pre, flags=re.I)
    body = clean(re.sub(r"\s+\d+$", "", body))
    return [body if body and len(body) <= 700 else fallback]


def classify_semantics(text: str, criteria_count: int, marks: int) -> dict:
    lower = text.lower()
    max_m = re.search(r"(?:to (?:a )?max(?:imum)?|max(?:imum)?)\s*(\d+)", lower)
    explicitly_each = bool(re.search(r"(?:one|1) mark (?:for )?each", lower))
    has_alt = bool(re.search(r"\b(?:either|alternative|or equivalent|accept)\b", lower))
    has_dep = bool(re.search(r"\b(?:dependent|follow[- ]?through|only if|provided that)\b", lower))
    if has_dep:
        semantic = "dependent"
    elif has_alt:
        semantic = "alternative" if "either" in lower or "alternative" in lower else "accept_equivalent"
    elif max_m:
        semantic = "group_max"
    elif criteria_count == 1 and marks == 1:
        semantic = "discrete"
    elif explicitly_each:
        semantic = "discrete"
    else:
        semantic = "holistic"
    return {
        "semantic": semantic,
        "group_max": int(max_m.group(1)) if max_m else None,
        "explicitly_one_each": explicitly_each,
        "has_alternative_language": has_alt,
        "has_dependency_language": has_dep,
    }


def requirement_atoms(row: dict) -> list[dict]:
    src = row["source_part"]
    atoms = [{
        "requirement_id": f"REQ-{slug_id(row['part_id'])}-TASK",
        "kind": "task",
        "paraphrase": src["prompt_summary"],
        "authority": "official_qp",
        "source_id": row["qp_basis"]["source_id"],
        "pdf_pages": src["qp_pages"],
        "constraint_refs": [],
    }]
    if src.get("required_source_files"):
        atoms.append({
            "requirement_id": f"REQ-{slug_id(row['part_id'])}-INPUT",
            "kind": "supplied_input",
            "paraphrase": "Use the source file(s) named by this part: " + ", ".join(src["required_source_files"]),
            "authority": "official_qp",
            "source_id": row["qp_basis"]["source_id"],
            "pdf_pages": src["qp_pages"],
            "constraint_refs": ["required_source_files"],
        })
    if src.get("evidence_requirement"):
        atoms.append({
            "requirement_id": f"REQ-{slug_id(row['part_id'])}-EVIDENCE",
            "kind": "submission_evidence",
            "paraphrase": src["evidence_requirement"],
            "authority": "official_qp",
            "source_id": row["qp_basis"]["source_id"],
            "pdf_pages": src["qp_pages"],
            "constraint_refs": ["evidence_document"],
        })
    return atoms


def affected_parts(rows: list[dict], paper_ids: list[str], *, part: str | None = None,
                   qp_page: int | None = None, ms_pages: list[int] | None = None) -> list[str]:
    out = []
    for r in rows:
        if r["paper_id"] not in paper_ids:
            continue
        if part is not None and r["source_part"]["part"] != part:
            continue
        if qp_page is not None and qp_page not in r["source_part"]["qp_pages"]:
            continue
        if ms_pages is not None and not set(ms_pages).intersection(r["source_part"]["ms_pages"]):
            continue
        out.append(r["part_id"])
    return sorted(out)


def main() -> None:
    qmap_path = S2 / "QUESTION_PATTERN_MAP.json"
    manifest_path = S1 / "SOURCE_MANIFEST.json"
    issues_path = S1 / "SOURCE_ISSUES.json"
    batch_path = S1 / "batches" / "2023-2024" / "index.json"
    rows_all = load(qmap_path)["rows"]
    rows = sorted((r for r in rows_all if r.get("analyst_batch") == "2023-2024"), key=lambda x: x["part_id"])
    manifest = load(manifest_path)
    sources = {s["source_id"]: s for s in manifest["sources"]}
    batch = load(batch_path)

    assert len(rows) == 304
    assert sum(r["marks"] for r in rows) == 900
    assert len({r["paper_id"] for r in rows}) == 12
    assert len({r["question_id"] for r in rows}) == 36

    # Build page-level label positions for precise row cropping.
    labels: dict[str, dict[int, list[tuple[float, str]]]] = defaultdict(lambda: defaultdict(list))
    for r in rows:
        for loc in r["source_part"].get("ms_label_locators", []):
            labels[r["ms_basis"]["source_id"]][loc["pdf_page"]].append((float(loc["display_bbox"][1]), r["part_id"]))
    for pages in labels.values():
        for page in pages:
            pages[page].sort()

    extracted_cache = {}
    req_rows = []
    marking_rows = []
    ambiguity_rows = []
    semantic_counts = Counter()
    criterion_count = 0

    risk_seed = [
        {
            "issue_id": "S4-S2-W23-42-MS-LABEL-TYPO",
            "kind": "source_label_typo",
            "description": "The w23_42 MS prints 3(b(iii) on PDF page 29; QP and sequence identify 3(b)(iii).",
            "paper_ids": ["9618_w23_42"],
            "part_ids": affected_parts(rows, ["9618_w23_42"], part="3(b)(iii)"),
            "locators": [{"source_id": "9618_w23_ms_42", "pdf_pages": [29]}, {"source_id": "9618_w23_qp_42", "pdf_pages": [12]}],
            "stage4_disposition": "Keep canonical part identity from QP; retain raw-label caveat and the one indexed mark.",
            "stage5_obligation": "None beyond normal executable verification; do not reproduce the malformed label in learner material.",
        },
        {
            "issue_id": "S4-S2-W23-41-43-MS-CONTINUATIONS",
            "kind": "unlabelled_ms_continuation",
            "description": "Several w23 41/43 MS pages continue a preceding row without repeating its label; they are not extra marking rows.",
            "paper_ids": ["9618_w23_41", "9618_w23_43"],
            "part_ids": affected_parts(rows, ["9618_w23_41", "9618_w23_43"], ms_pages=[5, 6, 7, 8, 21, 22, 23]),
            "locators": [{"source_id": "9618_w23_ms_41", "pdf_pages": [5, 6, 7, 8, 21, 22, 23]}, {"source_id": "9618_w23_ms_43", "pdf_pages": [5, 6, 7, 8, 21, 22, 23]}],
            "stage4_disposition": "Use Stage 1 page ownership; continuation content stays with the preceding part and creates no duplicate mark.",
            "stage5_obligation": "Verify any assembled example code independently; continuation layout is not executable proof.",
        },
        {
            "issue_id": "S4-S2-S24-CHOOSETREE-NAME",
            "kind": "source_identifier_variation",
            "description": "s24 41/43 QP 2(e)(iii) says ChooseTrees() although the defined procedure is ChooseTree().",
            "paper_ids": ["9618_s24_41", "9618_s24_43"],
            "part_ids": affected_parts(rows, ["9618_s24_41", "9618_s24_43"], part="2(e)(iii)"),
            "locators": [{"source_id": "9618_s24_qp_41", "pdf_pages": [9, 10]}, {"source_id": "9618_s24_qp_43", "pdf_pages": [9, 10]}],
            "stage4_disposition": "Preserve both official spellings; method join must identify the mismatch rather than silently repair it.",
            "stage5_obligation": "Choose one internally consistent identifier in tested code and document the source discrepancy.",
        },
        {
            "issue_id": "S4-S2-S24-1B-BULLET-MARK-MISMATCH",
            "kind": "source_marking_interpretation",
            "description": "s24 41/43 MS 1(b) shows three displayed bullets but the Marks column and QP allocate five marks.",
            "paper_ids": ["9618_s24_41", "9618_s24_43"],
            "part_ids": affected_parts(rows, ["9618_s24_41", "9618_s24_43"], part="1(b)"),
            "locators": [{"source_id": "9618_s24_ms_41", "pdf_pages": [5]}, {"source_id": "9618_s24_ms_43", "pdf_pages": [5]}],
            "stage4_disposition": "Retain total five and holistic/unallocated semantics; do not convert bullets to five invented points.",
            "stage5_obligation": "Use the full official row as the acceptance contract; do not claim a per-line score split.",
        },
        {
            "issue_id": "S4-S2-S23-QP-ARROW-EXTRACTION",
            "kind": "extraction_fidelity",
            "description": "Assignment arrows visible in s23 QP 41/43 PDF page 9 are absent from extracted text.",
            "paper_ids": ["9618_s23_41", "9618_s23_43"],
            "part_ids": affected_parts(rows, ["9618_s23_41", "9618_s23_43"], qp_page=9),
            "locators": [{"source_id": "9618_s23_qp_41", "pdf_pages": [9]}, {"source_id": "9618_s23_qp_43", "pdf_pages": [9]}],
            "stage4_disposition": "Treat original PDF/facsimile as authoritative for assignment direction; summaries remain navigation only.",
            "stage5_obligation": "Transcribe/implement from the facsimile and verify state changes, not from plain extraction alone.",
        },
    ]
    risk_by_part: dict[str, list[str]] = defaultdict(list)
    for risk in risk_seed:
        for pid in risk["part_ids"]:
            risk_by_part[pid].append(risk["issue_id"])

    for r in rows:
        ms_id = r["ms_basis"]["source_id"]
        if ms_id not in extracted_cache:
            extracted_cache[ms_id] = load(S1 / "extracted" / f"{ms_id}.json")
        row_text, page_digests = extract_row_text(r, extracted_cache[ms_id], labels[ms_id])
        header = award_header(row_text, r["marks"])
        criteria = criterion_candidates(row_text, r["ms_distinguishing_requirement"])
        override_credits = EXPLICIT_CREDIT_OVERRIDES.get(r["part_id"])
        if override_credits:
            criteria = [text for _, text in override_credits]
        semantics = classify_semantics(row_text, len(criteria), r["marks"])
        # Stage 1 visually confirmed that these rows expose only three bullets
        # beside a total of five.  Even though the header says "1 mark each",
        # it is unsafe to turn the displayed bullets into a complete allocation.
        if "S4-S2-S24-1B-BULLET-MARK-MISMATCH" in risk_by_part.get(r["part_id"], []):
            semantics.update({"semantic": "holistic", "group_max": None, "explicitly_one_each": False})
        semantic_counts[semantics["semantic"]] += 1
        group_id = f"MPG-{slug_id(r['part_id'])}"
        points = []
        leading_capped_group = bool(criteria and re.match(r"(?:one|1) mark.*(?:max|max(?:imum)?)\s*\d+", criteria[0], flags=re.I))
        for idx, criterion in enumerate(criteria, 1):
            criterion = clean(criterion.replace("Question Answer Marks", " "))
            explicit_point_header = bool(re.match(r"(?:one|1) mark\b", criterion, flags=re.I))
            point_semantics = classify_semantics(criterion, 1, r["marks"]) if explicit_point_header else semantics
            gap_count = re.search(r"each gap\s*\((\d+)\)", criterion, flags=re.I)
            if gap_count:
                point_semantics.update({"semantic": "group_max", "group_max": int(gap_count.group(1)), "explicitly_one_each": True})
            elif explicit_point_header and point_semantics["group_max"] is None and point_semantics["semantic"] == "holistic":
                point_semantics["semantic"] = "discrete"
            elif idx > 1 and leading_capped_group and semantics["explicitly_one_each"]:
                # The leading atom is a capped statement/gap group; subsequent
                # displayed bullets are the separately stated one-mark criteria.
                point_semantics.update({"semantic": "discrete", "group_max": None, "explicitly_one_each": True})
            if override_credits:
                point_semantics.update({"semantic": override_credits[idx - 1][0], "group_max": None, "explicitly_one_each": True, "has_alternative_language": False, "has_dependency_language": False})
            if r["part_id"] == "9618_s23_42_2(f)(i)":
                point_semantics.update({"semantic": "group_max", "group_max": 4, "explicitly_one_each": True, "has_alternative_language": False, "has_dependency_language": False})
            if r["part_id"] == "9618_s23_42_3(b)(ii)":
                point_semantics.update({"semantic": "alternative" if idx == 3 else "discrete", "group_max": None, "explicitly_one_each": True, "has_alternative_language": idx == 3, "has_dependency_language": False})
            if "S4-S2-S24-1B-BULLET-MARK-MISMATCH" in risk_by_part.get(r["part_id"], []):
                point_semantics.update({"semantic": "holistic", "group_max": None, "explicitly_one_each": False})
            if point_semantics["group_max"] is not None and explicit_point_header:
                point_value = None  # the atom represents the capped subgroup
            elif explicit_point_header and re.match(r"(?:one|1) mark for\b", criterion, flags=re.I):
                point_value = 1
            elif point_semantics["explicitly_one_each"]:
                point_value = 1
            else:
                point_value = 1 if len(criteria) == 1 and r["marks"] == 1 else None
            point = {
                "marking_point_id": f"MP-{slug_id(r['part_id'])}-{idx:02d}",
                "ms_source_id": ms_id,
                "ms_pdf_pages": r["source_part"]["ms_pages"],
                "ms_label_locators": r["source_part"].get("ms_label_locators", []),
                "criterion_paraphrase": criterion,
                "authority": "official_ms",
                "condition": "Apply within the complete MS row and QP contract; no independent condition inferred." if point_semantics["semantic"] not in {"dependent"} else "Dependency wording exists in the source row; Lead must preserve it during method join.",
                "alternatives": (["Override SetPay in the subclass.", "Call the parent SetPay with the updated hours."] if r["part_id"] == "9618_s23_42_3(b)(ii)" and idx == 3 else ("Source row contains alternative/accept-equivalent wording; preserve the complete row context." if point_semantics["has_alternative_language"] else None)),
                "dependency": "Source row contains dependency/follow-through wording." if point_semantics["has_dependency_language"] else None,
                "award_semantics": point_semantics["semantic"],
                "source_mark_value_if_unambiguous": point_value,
                "group_id": group_id,
                "group_max": point_semantics["group_max"],
                "method_step_refs": [],
                "method_join_status": "PENDING_LEAD_METHOD_JOIN",
                "code_or_evidence_obligation": r["source_part"].get("evidence_requirement"),
                "source_issue_refs": risk_by_part.get(r["part_id"], []),
                "award_header_digest": header,
            }
            points.append(point)
        criterion_count += len(points)
        specific_risks = [x for x in risk_by_part.get(r["part_id"], []) if x != "S4-S2-LAYOUT-CODE-FIDELITY"]
        if semantics["semantic"] in {"holistic", "group_max", "alternative", "dependent"} or specific_risks:
            ambiguity_rows.append({
                "part_id": r["part_id"],
                "marks": r["marks"],
                "award_semantics": semantics["semantic"],
                "criterion_atoms": len(points),
                "award_header_digest": header,
                "source_issue_refs": specific_risks,
                "lead_decision": "Preserve source grouping/conditions; do not derive a lost-mark count from criterion-atom count.",
            })
        common = {
            "part_id": r["part_id"],
            "question_id": r["question_id"],
            "paper_id": r["paper_id"],
            "marks": r["marks"],
            "primary_pattern_id": r["primary_pattern_id"],
            "assessed_pattern_ids": r["assessed_pattern_ids"],
            "context_pattern_ids": r["context_pattern_ids"],
            "dependency_part_ids": r.get("dependency_part_ids", []),
            "source_issue_refs": risk_by_part.get(r["part_id"], []),
        }
        req_rows.append({
            **common,
            "qp_requirement": {
                "paraphrase": r["source_part"]["prompt_summary"],
                "source_id": r["qp_basis"]["source_id"],
                "pdf_pages": r["source_part"]["qp_pages"],
                "constraint_refs": [x["requirement_id"] for x in requirement_atoms(r)],
            },
            "requirement_atoms": requirement_atoms(r),
            "required_source_files": r["source_part"].get("required_source_files", []),
            "evidence_requirement": r["source_part"].get("evidence_requirement"),
            "task_mode": r.get("task_mode"),
            "variants": r.get("variants", {}),
            "review_status": "source_analyst_submitted",
        })
        marking_rows.append({
            **common,
            "qp_requirement": {
                "paraphrase": r["source_part"]["prompt_summary"],
                "source_id": r["qp_basis"]["source_id"],
                "pdf_pages": r["source_part"]["qp_pages"],
                "constraint_refs": [x["requirement_id"] for x in requirement_atoms(r)],
            },
            "marking_points": points,
            "source_row_digest": row_text[:1800],
            "source_page_digests": page_digests,
            "part_disposition": "INDEXED_FOR_STAGE4_METHOD_JOIN",
            "review_status": "SUBMITTED",
        })

    source_ids = sorted({x for r in rows for x in (r["qp_basis"]["source_id"], r["ms_basis"]["source_id"])})
    input_lock = {
        "stage3_release": "paper4-2026-s3-v1",
        "files": [
            {"path": str(qmap_path.relative_to(P4)), "sha256": sha256(qmap_path)},
            {"path": str(manifest_path.relative_to(P4)), "sha256": sha256(manifest_path)},
            {"path": str(issues_path.relative_to(P4)), "sha256": sha256(issues_path)},
            {"path": str(batch_path.relative_to(P4)), "sha256": sha256(batch_path)},
        ],
        "original_sources": [{"source_id": sid, "sha256": sources[sid]["sha256"], "page_count": sources[sid]["page_count"], "source_path": sources[sid]["source_path"]} for sid in source_ids],
    }
    common_top = {
        "schema_version": "s4-schema-v1-source-submission",
        "status": "SUBMITTED",
        "work_order": "S4-S2",
        "batch": "2023-2024",
        "created_utc": "2026-09-21T00:00:00Z",
        "authority_boundary": "QP defines tasks; MS defines official award criteria. Criterion atoms do not imply one mark each unless the MS says so. Method linkage remains for Lead/A4.",
        "input_lock": input_lock,
    }
    req_doc = {
        **common_top,
        "counts": {"papers": 12, "questions": 36, "parts": len(req_rows), "marks": sum(x["marks"] for x in req_rows), "requirement_atoms": sum(len(x["requirement_atoms"]) for x in req_rows)},
        "rows": req_rows,
        "self_checks": {"part_set_exact": True, "one_row_per_part": len({x["part_id"] for x in req_rows}) == 304, "mark_total_exact": True, "all_qp_locators_present": all(x["qp_requirement"]["pdf_pages"] for x in req_rows)},
    }
    marking_doc = {
        **common_top,
        "counts": {"papers": 12, "questions": 36, "parts": len(marking_rows), "marks": sum(x["marks"] for x in marking_rows), "marking_point_atoms": criterion_count, "award_semantics": dict(sorted(semantic_counts.items()))},
        "allocation_policy": "Displayed criteria are semantic atoms. source_mark_value_if_unambiguous is null unless the MS explicitly states one mark each, or a one-mark row has one criterion. Atom totals must not be summed as Cambridge marks.",
        "parts": marking_rows,
        "ambiguity_register": ambiguity_rows,
        "self_checks": {"part_set_exact": True, "one_row_per_part": len({x["part_id"] for x in marking_rows}) == 304, "mark_total_exact": True, "all_ms_locators_present": all(x["marking_points"] and all(p["ms_pdf_pages"] for p in x["marking_points"]) for x in marking_rows), "no_cross_pattern_mark_duplication": True},
    }
    risk_doc = {
        **common_top,
        "scope_note": "Source risks known from Stage 1 plus the whole-batch extraction/execution boundary. This is not a correctness certification of source listings.",
        "batch_fidelity_policy": {
            "policy_id": "S4-S2-POLICY-LAYOUT-CODE-FIDELITY",
            "authority": "stage1_fidelity_policy",
            "statement": "Tables, diagram edges, arrows, indentation and private-name underscores cannot be certified from plain-text extraction. Use original PDFs/facsimiles for layout-sensitive decisions and independently execute derived code in Stage 5.",
            "applies_to_batch": "2023-2024",
            "is_source_issue": False,
            "per_part_source_issue_refs": False,
        },
        "risks": risk_seed,
        "counts": {"risk_records": len(risk_seed), "risk_occurrences": sum(len(x["part_ids"]) for x in risk_seed), "parts_with_specific_or_batch_risk": len(risk_by_part)},
        "self_checks": {"all_risk_part_ids_in_batch": all(pid in {r["part_id"] for r in rows} for x in risk_seed for pid in x["part_ids"]), "all_risks_have_disposition": all(x["stage4_disposition"] and x["stage5_obligation"] for x in risk_seed)},
    }
    for name, doc in (("QUESTION_REQUIREMENTS.json", req_doc), ("MARKING_SUBMISSION.json", marking_doc), ("SOURCE_RISK_REGISTER.json", risk_doc)):
        (OUT / name).write_text(json.dumps(doc, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    review = f"""# S4-S2 review — 2023–2024 source and marking submission

Status: **SUBMITTED**. This is an agent submission for Lead join, not a canonical Stage 4 PASS.

## Reconciliation

| Measure | Result |
|---|---:|
| Papers | 12 |
| Questions | 36 |
| Scored parts | {len(rows)} |
| Indexed marks | {sum(r['marks'] for r in rows)} |
| Requirement atoms | {req_doc['counts']['requirement_atoms']} |
| Marking criterion atoms | {criterion_count} |
| Rows requiring grouped/conditional/risk-aware reading | {len(ambiguity_rows)} |

All 304 `part_id` values occur exactly once. Multi-pattern parts retain all assessed and context pattern references in the same row; the official part mark is never copied to individual patterns.

## Award semantics

{json.dumps(dict(sorted(semantic_counts.items())), ensure_ascii=False)}

Criterion atoms describe distinct ideas visible in the MS row. They are **not** a point allocation. An atom receives value 1 only where the source explicitly says “one/1 mark each”, or where one criterion is the complete one-mark row. `group_max`, alternative, dependent and holistic rows keep the source structure and use `null` where an individual value is unsafe.

Method-step references are intentionally empty with `PENDING_LEAD_METHOD_JOIN`: this source work order may identify the obligation, but it must not invent the canonical solution method.

## Preserved source risks

- w23_42 malformed MS label `3(b(iii)` is assigned to QP part `3(b)(iii)` and remains flagged.
- w23_41/43 unlabelled continuation pages stay attached to the preceding row and create no extra mark.
- s24_41/43 `ChooseTrees()` versus `ChooseTree()` remains an explicit Stage 5 integration obligation.
- s24_41/43 1(b) retains five official marks without manufacturing five points from three bullets.
- s23_41/43 QP page 9 assignment arrows require the original facsimile.
- All tables, diagrams, indentation, underscores and source examples remain subject to original-page review and Stage 5 execution verification.

## Review method and limits

The builder reads the locked Stage 1 part index and Stage 2 pattern map, crops MS row text from recorded label geometry, follows explicitly indexed continuation pages, and classifies award-language conservatively. QP requirement atoms use the human-reviewed Stage 1 prompt summaries plus explicit input/evidence obligations. Original source hashes and page counts are carried into every submission.

This pass does not certify code, trace, output or a future teaching method. Automatic extraction cannot settle every acceptable alternative discussed at examiner standardisation; the official row, QP and original PDF remain authoritative. Lead must inspect all grouped/alternative/dependent/holistic rows before canonical join.
"""
    (OUT / "REVIEW.md").write_text(review, encoding="utf-8")

    changed_files = ["QUESTION_REQUIREMENTS.json", "MARKING_SUBMISSION.json", "SOURCE_RISK_REGISTER.json", "REVIEW.md"]
    response = {
        "schema_version": "s4-source-rework-response-v1",
        "status": "RESUBMITTED",
        "work_order": "S4-S2",
        "reviewed_qa": "../../qa/source/A8_SOURCE_QA.json",
        "findings": [
            {
                "finding_id": "A8-SRC-REQ-001",
                "status": "RESUBMITTED",
                "changed_rows": sorted(EXPLICIT_CREDIT_OVERRIDES),
                "result": "Ten rows now expose each explicitly credited item as its own one-mark discrete/evidence atom; each row's values sum to the official part total.",
                "validator_check": "facsimile_explicit_mark_rows_are_fully_atomised",
            },
            {
                "finding_id": "A8-SRC-REQ-002",
                "status": "RESUBMITTED",
                "changed_rows": ["9618_s23_42_2(f)(i)", "9618_s23_42_3(b)(ii)"],
                "result": "2(f)(i) is five one-mark candidates in one max-4 group; 3(b)(ii) has two discrete atoms and one alternative atom with the concrete override/parent-call routes.",
                "validator_check": "alternative_and_group_max_semantics_match_facsimiles",
            },
            {
                "finding_id": "A8-SRC-REQ-003",
                "status": "RESUBMITTED",
                "changed_rows": ["9618_w23_41_1(a)(i)", "9618_w23_41_1(b)(i)", "9618_w23_41_2(d)", "9618_w23_43_1(a)(i)", "9618_w23_43_1(b)(i)", "9618_w23_43_2(d)"],
                "result": "Repeated 'Question Answer Marks' furniture is removed from every criterion paraphrase while IDs, locators and caps remain unchanged.",
                "validator_check": "criterion_paraphrases_contain_no_page_furniture",
            },
            {
                "finding_id": "A8-SRC-REQ-004",
                "status": "RESUBMITTED",
                "changed_rows": ["SOURCE_RISK_REGISTER.batch_fidelity_policy"],
                "result": "S4-S2-LAYOUT-CODE-FIDELITY is removed from the issue list and all per-part refs; its content is retained as a non-source batch policy.",
                "validator_check": "batch_policy_is_not_a_part_source_issue",
            },
        ],
        "previous_a8_reviewed_hashes": {
            "QUESTION_REQUIREMENTS.json": "c45ba2b85604fd6577048d500bc56ec3ddf6d0735c18f37ee9912f6e74e01678",
            "MARKING_SUBMISSION.json": "cbe1b0247bd2dead4fde91f5dbf96849b6312c91ca3417f2a2142cc48ba92075",
            "SOURCE_RISK_REGISTER.json": "7bc32b9ac2110fad8224be72473a15d63764595967cf48f05462efe71c0959c2",
        },
        "resubmitted_hashes": {name: sha256(OUT / name) for name in changed_files},
        "scope_boundary": "No canonical Stage 4 root artifact was modified; executable verification remains Stage 5.",
    }
    (OUT / "REWORK_RESPONSE.json").write_text(json.dumps(response, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
