from __future__ import annotations

import hashlib
import json
import re
from collections import defaultdict
from pathlib import Path

OUT = Path(__file__).resolve().parents[1]
CACHE = OUT / "_extracted_text_cache.json"
QP_ROOT_COUNTS = {
    "9618_s24_qp_11": 8, "9618_s24_qp_12": 8, "9618_s24_qp_13": 7,
    "9618_w24_qp_11": 8, "9618_w24_qp_12": 9, "9618_w24_qp_13": 9,
}


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for block in iter(lambda: f.read(1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()


def write_jsonl(path: Path, rows: list[dict]) -> None:
    path.write_text("".join(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n" for row in rows), encoding="utf-8")


def norm(line: str) -> str:
    return " ".join(line.split())


def is_root_candidate(lines: list[str], idx: int, qmax: int) -> int | None:
    token = norm(lines[idx])
    direct_text = None
    m_inline = re.fullmatch(r"(\d{1,2})\s+(.+)", token)
    if m_inline:
        token = m_inline.group(1)
        direct_text = m_inline.group(2)
    if not re.fullmatch(r"\d{1,2}", token):
        return None
    qn = int(token)
    if not 1 <= qn <= qmax:
        return None
    previous = next((norm(lines[j]) for j in range(idx - 1, max(-1, idx - 5), -1) if norm(lines[j])), "")
    if not ("UCLES" in previous or re.search(r"\[\d+\]\s*$", previous) or previous.startswith("[Turn over")):
        return None
    # A question root is followed by an actual prompt/subpart, unlike numeric table data.
    following = [direct_text] if direct_text else []
    for line in lines[idx + 1:idx + 5]:
        s = norm(line)
        if s:
            following.append(s)
        if len(following) >= 2:
            break
    if not following:
        return None
    first = following[0]
    if re.match(r"^\([a-z]\)(?:\s|$)", first, re.I) or re.match(r"^\([ivx]+\)(?:\s|$)", first, re.I):
        return qn
    if re.fullmatch(r"\d+", first) or re.fullmatch(r"\[\d+\]", first):
        return None
    # Root prompts can start with an unlabelled sentence or a table/drawing instruction.
    return qn if re.search(r"[A-Za-z]", first) else None


def is_boilerplate(line: str) -> bool:
    s = norm(line)
    if not s:
        return True
    patterns = [
        r"^\d{1,2}$", r"^9618/\d{2}/", r"^© UCLES", r"^\[Turn over\]?$",
        r"^\*\s*\d{8,}", r"^DO NOT WRITE IN THIS MARGIN", r"^DFD$",
        r"^This document consists of", r"^Page \d+ of \d+$", r"^BLANK PAGE$",
        r"^Permission to reproduce", r"^Every reasonable effort", r"^To avoid the issue of disclosure",
        r"^publisher will be pleased", r"^reasonable effort has been made by the publisher",
        r"^Assessment International Education Copyright", r"^at www\.cambridgeinternational",
        r"^Local Examinations Syndicate \(UCLES\)",
        r"^Cambridge Assessment International Education is part of Cambridge Assessment",
    ]
    return any(re.search(p, s, re.I) for p in patterns)


def substantive(lines: list[str]) -> bool:
    if any("BLANK PAGE" in norm(line).upper() for line in lines):
        return False
    body = []
    for line in lines:
        if re.search(r"\*\s*0000\d{5,}", line):
            break
        if not is_boilerplate(line):
            body.append(norm(line))
    body = [x for x in body if not re.fullmatch(r"[\d\s.,:/+-]+", x)]
    return bool(body)


def command_from(lines: list[str]) -> str | None:
    verbs = ["Explain", "State", "Write", "Complete", "Identify", "Describe", "Give", "Convert", "Draw", "Calculate", "Name", "Define", "Show", "Outline", "Compare", "Discuss", "Evaluate", "Determine", "Construct", "Select", "List", "Suggest", "Justify", "State", "Indicate", "Explain"]
    for line in lines:
        s = norm(line)
        s = re.sub(r"^(?:\([a-z]\)\s*)?(?:\([ivx]+\)\s*)?", "", s, flags=re.I)
        if not s or is_boilerplate(s):
            continue
        for verb in verbs:
            m = re.match(rf"({re.escape(verb)})(?:\b|\s)", s, re.I)
            if m:
                return m.group(1)
        # Do not search arbitrarily inside explanatory prose; command is unclear.
        return None
    return None


def printed_page(sid: str, page: int, text: str) -> int | None:
    if "_qp_" in sid:
        first = next((norm(line) for line in text.splitlines() if norm(line)), "")
        return int(first) if first.isdigit() and int(first) == page else None
    m = re.search(r"\bPage\s+(\d+)\s+of\s+\d+\b", text, re.I)
    return int(m.group(1)) if m else None


def main() -> None:
    cache = json.loads(CACHE.read_text(encoding="utf-8"))
    pages = {}
    for key, text in cache.items():
        sid, ptxt = key.rsplit("|p", 1)
        pages[(sid, int(ptxt))] = text

    # Parse exact QP roots in source order. The known question count is a cross-check only;
    # the root/page locators are found from source text, not generated from the count.
    qps = sorted({sid for sid, _ in pages if "_qp_" in sid})
    questions = []
    question_segments: dict[str, list[tuple[int, list[str]]]] = {}
    for sid in qps:
        maxpage = max(p for source, p in pages if source == sid)
        qmax = QP_ROOT_COUNTS[sid]
        roots = []
        for pn in range(1, maxpage + 1):
            lines = pages[(sid, pn)].splitlines()
            # Only text after the page's UCLES copyright marker is eligible for roots.
            start = next((i for i, line in enumerate(lines) if "UCLES" in line), 0)
            for i in range(start + 1, len(lines)):
                qn = is_root_candidate(lines, i, qmax)
                if qn is not None:
                    roots.append((pn, i, qn))
        # Deduplicate accidental roots at the same spot, preserve same-page consecutive questions.
        roots = sorted(set(roots))
        if len(roots) != QP_ROOT_COUNTS[sid]:
            raise ValueError(f"root count mismatch for {sid}: expected {QP_ROOT_COUNTS[sid]}, found {len(roots)}; roots={roots}")
        for ri, (root_page, root_line, qn) in enumerate(roots):
            qid = f"{sid}-q{qn}"
            next_root = roots[ri + 1] if ri + 1 < len(roots) else (maxpage + 1, 0, 0)
            segs = []
            for pn in range(root_page, min(maxpage, next_root[0]) + 1):
                lines = pages[(sid, pn)].splitlines()
                lo = root_line if pn == root_page else 0
                hi = next_root[1] if pn == next_root[0] else len(lines)
                if hi <= lo:
                    continue
                selected = lines[lo:hi]
                # Page header/copyright before the root is already outside the first segment.
                if substantive(selected):
                    segs.append((pn, selected))
            if not segs:
                raise ValueError(f"no substantive QP context for {qid}")
            question_segments[qid] = segs
            body = [line for _, segment in segs for line in segment]
            question = {
                "id": qid, "source_qp_id": sid, "year": 2024,
                "session": "s" if "_s24_" in sid else "w",
                "component": sid.rsplit("_", 1)[1], "question_number": str(qn),
                "parent_id_or_null": None, "marks_displayed_or_null": None,
                "command_word_verbatim_or_null": command_from(body),
                "qp_locator": {"source_id": sid, "pdf_page_1_based": root_page,
                               "printed_page_or_null": printed_page(sid, root_page, pages[(sid, root_page)]),
                               "question": str(qn)},
                "prompt_transcript_ref": f"transcripts/{sid}-p{root_page:03d}.txt",
                "context_ref_or_null": f"contexts/{qid}.json", "status": "EXTRACTED",
                "_root_line_index": root_line,
            }
            questions.append(question)

    # Collect printed parts and their explicit bracket marks. A local stack preserves
    # alpha -> Roman nesting and resets only at a new printed question root.
    parts = []
    display_mark_rows = []
    for q in questions:
        qid = q["id"]
        sid = q["source_qp_id"]
        active_alpha = None
        active_path: list[str] = []
        part_by_path: dict[tuple[str, ...], dict] = {}
        first_page_lines = question_segments[qid][0][1]
        first_part = next((i for i, line in enumerate(first_page_lines)
                           if re.match(r"^\s*\([a-z]\)(?:\s|$)|^\s*\([ivx]+\)(?:\s|$)", line, re.I)),
                          len(first_page_lines))
        shared_preamble = substantive(first_page_lines[:first_part])
        for pn, lines in question_segments[qid]:
            for li, raw in enumerate(lines):
                s = norm(raw)
                if not s:
                    continue
                labels = re.match(r"^\(([a-z]+)\)\s*(?:\(([ivx]+)\))?\s*", s, re.I)
                token1 = labels.group(1).lower() if labels else None
                token2 = labels.group(2).lower() if labels and labels.group(2) else None
                roman_values = {"i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x"}
                alpha = None
                roman = None
                if token1 in roman_values:
                    roman = f"({token1})"
                elif token1 and len(token1) == 1:
                    alpha = f"({token1})"
                    roman = f"({token2})" if token2 else None
                if alpha:
                    a = alpha[1:-1].lower()
                    active_alpha = a
                    active_path = [a]
                    if tuple(active_path) not in part_by_path:
                        part_by_path[tuple(active_path)] = make_part(q, pn, active_path, shared_preamble)
                if roman:
                    r = roman[1:-1].lower()
                    active_path = ([active_alpha, r] if active_alpha else [r])
                    if tuple(active_path) not in part_by_path:
                        part_by_path[tuple(active_path)] = make_part(q, pn, active_path, shared_preamble)
                # Explicit displayed mark at line end; never infer an allocation.
                mm = re.search(r"\[(\d+)\]\s*$", raw)
                if mm:
                    marks = int(mm.group(1))
                    target = part_by_path.get(tuple(active_path)) if active_path else None
                    if target:
                        if target["marks_displayed_or_null"] is None:
                            target["marks_displayed_or_null"] = marks
                        else:
                            target["marks_displayed_or_null"] += marks
                    else:
                        q["marks_displayed_or_null"] = (q["marks_displayed_or_null"] or 0) + marks
                    display_mark_rows.append({"question_id": qid, "source_id": sid, "pdf_page_1_based": pn,
                                              "part_path": list(active_path), "marks_displayed": marks,
                                              "source_line_verbatim": raw.strip()})
        parts.extend(part_by_path.values())
    # The question-level locator line index is build-only metadata.
    for q in questions:
        q.pop("_root_line_index", None)

    # Build per-question context records from the exact source segments.
    for q in questions:
        qid = q["id"]
        sid = q["source_qp_id"]
        pages_used = [pn for pn, _ in question_segments[qid]]
        start = min(pages_used)
        cont = [p for p in pages_used if p > start]
        context = {
            "question_id": qid, "source_qp_id": sid,
            "question_number": q["question_number"], "question_start_page": start,
            "continuation_pages": cont, "all_context_pages": pages_used,
            "source_evidence": [{"source_id": sid, "pdf_page_1_based": p,
                                 "question": q["question_number"],
                                 "transcript_ref": f"transcripts/{sid}-p{p:03d}.txt"} for p in pages_used],
        }
        (OUT / q["context_ref_or_null"]).write_text(json.dumps(context, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")

    # Index exact MS question/part headings. Only pages after generic guidance are content pages.
    ms_by_source: dict[str, list[dict]] = defaultdict(list)
    for sid, pn in pages:
        # The 2024 papers begin question-specific marking rows on PDF page 3.
        if "_ms_" not in sid or pn < 3:
            continue
        lines = pages[(sid, pn)].splitlines()
        for i, raw in enumerate(lines):
            label = norm(raw)
            if re.fullmatch(r"\d{1,2}(?:\([a-z]\))?(?:\([ivx]+\))?", label, re.I):
                m = re.fullmatch(r"(\d{1,2})((?:\([a-z]\))?(?:\([ivx]+\))?)", label, re.I)
                qn = m.group(1)
                partpath = re.findall(r"\(([a-z]+|[ivx]+)\)", m.group(2), re.I)
                # A whole-question label is accepted only when immediately followed by marking language.
                following = [norm(x) for x in lines[i + 1:i + 4] if norm(x)]
                if not partpath and (not following or not re.search(r"\bmark", following[0], re.I)):
                    continue
                ms_by_source[sid].append({"question": qn, "part_path": [x.lower() for x in partpath],
                                          "page": pn, "line": i, "label": label,
                                          "lines": lines})

    # Match each printed part to its exact source row. Unmatched or ambiguous labels stay explicit.
    marking = []
    unresolved_details = []
    part_by_id = {p["id"]: p for p in parts}
    q_by_id = {q["id"]: q for q in questions}
    for target in [*parts, *[q for q in questions if not any(p["question_id"] == q["id"] for p in parts)]]:
        if "question_id" in target:
            q = q_by_id[target["question_id"]]
            target_id = target["id"]
            qn = q["question_number"]
            ppath = target["_path"]
            part_target = target_id
            question_target = None
        else:
            q = target
            target_id = q["id"]
            qn = q["question_number"]
            ppath = []
            part_target = None
            question_target = target_id
        ms_sid = q["source_qp_id"].replace("_qp_", "_ms_")
        candidates = [r for r in ms_by_source.get(ms_sid, []) if r["question"] == qn and r["part_path"] == ppath]
        status = "UNRESOLVED"
        locator = None
        excerpt = None
        transcript = None
        if len(candidates) == 1:
            row = candidates[0]
            following_rows = [r for r in ms_by_source[ms_sid] if r["line"] > row["line"] and r["page"] == row["page"]]
            next_row_line = min((r["line"] for r in following_rows), default=len(row["lines"]))
            # Stop this evidence excerpt at the next recognized row heading; retain exact line breaks.
            raw_excerpt = "\n".join(row["lines"][row["line"]:next_row_line]).strip()
            locator = {"source_id": ms_sid, "pdf_page_1_based": row["page"],
                       "printed_page_or_null": printed_page(ms_sid, row["page"], pages[(ms_sid, row["page"])]), "question": qn,
                       "part": "".join(f"({x})" for x in ppath) if ppath else None}
            transcript = f"transcripts/{ms_sid}-p{row['page']:03d}.txt"
            excerpt = raw_excerpt or None
            status = "MS_LINKED"
        elif len(candidates) > 1:
            reason = f"Multiple exact MS headings match {ms_sid} Q{qn} {ppath}; manual row review required."
            target["_unresolved_reason"] = reason
            unresolved_details.append({"id": target_id, "qp_source_id": q["source_qp_id"],
                                       "question_number": qn, "part_path": ppath,
                                       "paired_ms_source_id": ms_sid, "reason": reason})
        else:
            has_children = any(child.get("parent_part_id_or_null") == target_id for child in parts)
            if has_children:
                # A printed parent can group subparts without a distinct mark-scheme row.
                status = "EXTRACTED"
            else:
                reason = f"No exact MS heading for {ms_sid} Q{qn} {ppath}; inspect paired full MS source before reuse."
                target["_unresolved_reason"] = reason
                unresolved_details.append({"id": target_id, "qp_source_id": q["source_qp_id"],
                                           "question_number": qn, "part_path": ppath,
                                           "paired_ms_source_id": ms_sid, "reason": reason})
        if "question_id" in target:
            target["ms_locator_or_null"] = locator
            target["status"] = status
        else:
            target["status"] = status
        if locator:
            label = "".join(f"({x})" for x in ppath)
            marking.append({
                "id": f"{target_id}-mi-1", "part_id_or_null": part_target,
                "question_id_or_null": question_target, "ms_locator": locator,
                "transcript_ref": transcript, "mark_or_condition_or_null": excerpt,
                "table_row_ref_or_null": f"{qn}{label}",
                "visual_dependency_refs": [f"{ms_sid}-p{locator['pdf_page_1_based']:02d}-whole"],
                "status": "MS_LINKED",
            })

    # Remove internal parser fields and sort deterministically.
    for p in parts:
        p.pop("_path", None)
        p.pop("_unresolved_reason", None)
    for q in questions:
        q.pop("_unresolved_reason", None)
    questions.extend(parts)
    def question_sort_key(r: dict) -> tuple:
        qref = r if "question_number" in r else q_by_id[r["question_id"]]
        return (qref["source_qp_id"], int(qref["question_number"]),
                0 if "question_number" in r else 1,
                r["qp_locator"]["pdf_page_1_based"], r.get("label", ""))
    questions.sort(key=question_sort_key)
    write_jsonl(OUT / "QUESTION_INDEX.jsonl", questions)
    write_jsonl(OUT / "MARKING_INDEX.jsonl", marking)
    totals = {}
    for sid in qps:
        rows = [m for m in display_mark_rows if m["source_id"] == sid]
        total = sum(r["marks_displayed"] for r in rows)
        cover_text = pages[(sid, 1)]
        cover_match = re.search(r"The total mark for this paper is\s+(\d+)\.", cover_text, re.I)
        cover_total = int(cover_match.group(1)) if cover_match else None
        cover_excerpt = cover_match.group(0) if cover_match else None
        totals[sid] = {"displayed_mark_sum_from_source_transcript": total,
                       "printed_cover_total_or_null": cover_total,
                       "cover_total_source": {"source_id": sid, "pdf_page_1_based": 1,
                                              "transcript_ref": f"transcripts/{sid}-p001.txt",
                                              "excerpt_verbatim": cover_excerpt},
                       "matches": cover_total is not None and total == cover_total,
                       "mark_observation_count": len(rows), "observations": rows}
    (OUT / "MARK_TOTAL_CHECK.json").write_text(json.dumps({"method": "sum only explicit QP [n] tokens extracted from source page transcripts and compare with explicit cover total excerpt from PDF page 1", "pairs": totals}, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    (OUT / "_UNRESOLVED_ITEMS.json").write_text(json.dumps(unresolved_details, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"roots": {sid: sum(1 for q in questions if q.get("source_qp_id") == sid and "question_number" in q) for sid in qps},
                      "question_records": len(questions), "parts": len(parts), "marking_items": len(marking),
                      "unresolved": len(unresolved_details), "totals": {k: v["displayed_mark_sum_from_source_transcript"] for k, v in totals.items()}}, ensure_ascii=False))


def make_part(q: dict, page: int, path: list[str], context_required: bool) -> dict:
    qid = q["id"]
    sid = q["source_qp_id"]
    label_path = "".join(f"({x})" for x in path)
    pid = qid + "".join(f"-p{x}" for x in path)
    parent = qid if len(path) == 1 else qid + "".join(f"-p{x}" for x in path[:-1])
    return {
        "id": pid, "question_id": qid,
        "parent_part_id_or_null": None if len(path) == 1 else parent,
        "label": f"({path[-1]})", "marks_displayed_or_null": None,
        "qp_locator": {"source_id": sid, "pdf_page_1_based": page,
                       "printed_page_or_null": page if "_qp_" in sid else None,
                       "question": q["question_number"], "part": label_path},
        "prompt_transcript_ref": f"transcripts/{sid}-p{page:03d}.txt",
        "ms_locator_or_null": None, "dependency_refs": [],
        "context_required": context_required, "status": "EXTRACTED", "_path": list(path),
    }


if __name__ == "__main__":
    main()
