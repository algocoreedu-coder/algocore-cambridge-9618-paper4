from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path

import pymupdf

OUT = Path(__file__).resolve().parents[1]
PROVENANCE = json.loads((OUT / "SOURCE_EXTRACTION_PROVENANCE.json").read_text(encoding="utf-8"))


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for block in iter(lambda: f.read(1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()


def write_jsonl(path: Path, rows: list[dict]) -> None:
    path.write_text("".join(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n" for row in rows), encoding="utf-8")


def printed_page(sid: str, page: int, text: str) -> int | None:
    if "_qp_" in sid:
        first = next((line.strip() for line in text.splitlines() if line.strip()), "")
        return int(first) if first.isdigit() and int(first) == page else None
    m = re.search(r"\bPage\s+(\d+)\s+of\s+\d+\b", text, re.I)
    return int(m.group(1)) if m else None


def main() -> None:
    transcripts = {}
    for p in (OUT / "transcripts").glob("*.txt"):
        m = re.fullmatch(r"(.+)-p(\d{3})\.txt", p.name)
        if m:
            transcripts[(m.group(1), int(m.group(2)))] = p.read_text(encoding="utf-8")

    source_meta = {item["source_id"]: item for item in PROVENANCE["sources"]}
    page_index = []
    rendered_pages = []
    for sid, meta in source_meta.items():
        source = Path(meta["relative_path"])
        doc = pymupdf.open(source)
        if len(doc) != meta["page_count"]:
            raise ValueError(f"Page count changed: {sid}")
        for pn, page in enumerate(doc, 1):
            key = (sid, pn)
            text = transcripts[key]
            render_rel = f"renders/full_pages/{sid}-p{pn:02d}.png"
            render_abs = OUT / render_rel
            pix = page.get_pixmap(matrix=pymupdf.Matrix(1.15, 1.15), alpha=False)
            pix.save(render_abs)
            rendered_pages.append({"source_id": sid, "pdf_page_1_based": pn,
                                   "rendered_asset_ref": render_rel,
                                   "sha256": sha256(render_abs), "byte_count": render_abs.stat().st_size})
            page_index.append({
                "source_id": sid, "pdf_page_1_based": pn,
                "printed_page_or_null": printed_page(sid, pn, text),
                "extraction_status": "EXTRACTED" if text.strip() else "EMPTY_TEXT_REVIEW_REQUIRED",
                "visual_status": "A2_CONTACT_SHEET_SCREENED_FULL_RENDER_PENDING_INDEPENDENT_REVIEW",
                "transcript_ref_or_null": f"transcripts/{sid}-p{pn:03d}.txt",
            })
        doc.close()

    write_jsonl(OUT / "PAGE_INDEX.jsonl", page_index)
    question_rows = [json.loads(line) for line in (OUT / "QUESTION_INDEX.jsonl").read_text(encoding="utf-8").splitlines() if line.strip()]
    mark_rows = [json.loads(line) for line in (OUT / "MARKING_INDEX.jsonl").read_text(encoding="utf-8").splitlines() if line.strip()]

    q_context_pages: dict[str, set[int]] = {}
    for p in (OUT / "contexts").glob("*.json"):
        context = json.loads(p.read_text(encoding="utf-8"))
        q_context_pages[context["question_id"]] = set(context["all_context_pages"])

    regions = []
    for sid, meta in source_meta.items():
        for pn in range(1, meta["page_count"] + 1):
            q_refs = []
            m_refs = []
            if "_qp_" in sid:
                roots_here = {row["id"] for row in question_rows
                              if row.get("source_qp_id") == sid and "question_number" in row
                              and pn in q_context_pages.get(row["id"], set())}
                part_ids_here = {row["id"] for row in question_rows
                                 if row.get("question_id") in roots_here
                                 and row.get("qp_locator", {}).get("source_id") == sid
                                 and row.get("qp_locator", {}).get("pdf_page_1_based") == pn}
                q_refs = sorted(roots_here | part_ids_here)
                # Contact sheets show every page; risk regions are limited to actual question-content pages.
                is_risk = bool(q_refs)
                kind = "question_paper_page_layout"
                risk = "Verify prompt reading order, diagram/table geometry, labels, and displayed-mark placement against the source page."
            else:
                m_refs = sorted(row["id"] for row in mark_rows if row["ms_locator"]["source_id"] == sid
                                and row["ms_locator"]["pdf_page_1_based"] == pn)
                is_risk = pn >= 4
                kind = "mark_scheme_scoring_table_page"
                risk = "Verify table row boundaries, criterion-to-mark alignment, and diagram/answer geometry against the source page."
            if not is_risk:
                continue
            render = next(item for item in rendered_pages if item["source_id"] == sid and item["pdf_page_1_based"] == pn)
            refs = q_refs if "_qp_" in sid else m_refs
            region_id = f"{sid}-p{pn:02d}-whole"
            regions.append({
                "id": region_id, "source_id": sid, "pdf_page_1_based": pn,
                "page_ref": f"transcripts/{sid}-p{pn:03d}.txt", "kind": kind,
                "relates_to_ids": refs, "extraction_risk": risk,
                "rendered_asset_ref": render["rendered_asset_ref"],
                "reviewer_status": "RENDERED_PENDING_INDEPENDENT_REVIEW",
                "render_sha256": render["sha256"], "render_byte_count": render["byte_count"],
            })

    (OUT / "VISUAL_MANIFEST.json").write_text(json.dumps({
        "method": "Direct full-page PyMuPDF renders at 1.15x from pinned originals; one contact sheet per PDF generated at 0.5x and screened by A2. Risk regions cover all question-content QP pages and every MS content/table page (p4 onward). Full-size visual verification remains pending independent review.",
        "contact_sheets": [{
            "source_id": s["source_id"], "page_count": s["page_count"],
            "asset_ref": s["contact_sheet"],
            "sha256": sha256(OUT / s["contact_sheet"]),
            "byte_count": (OUT / s["contact_sheet"]).stat().st_size,
            "a2_contact_sheet_screened": True,
            "screening_note": "All thumbnail tiles were visually screened; low-resolution contact-screening does not replace independent full-page source matching.",
        } for s in PROVENANCE["sources"]],
        "full_page_render_count": len(rendered_pages),
        "full_page_renders": rendered_pages,
        "visual_regions": regions,
    }, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps({"page_index_rows": len(page_index), "full_page_renders": len(rendered_pages),
                      "visual_regions": len(regions), "contact_sheets": len(PROVENANCE["sources"])}))


if __name__ == "__main__":
    main()
