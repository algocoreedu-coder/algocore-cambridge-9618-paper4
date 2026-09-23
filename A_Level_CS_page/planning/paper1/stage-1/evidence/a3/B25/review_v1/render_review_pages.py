from __future__ import annotations

import hashlib
import json
from pathlib import Path

import pymupdf


WORKSPACE = Path.cwd()
PAPER = WORKSPACE / "A_Level_CS_page" / "planning" / "paper1"
OUT = PAPER / "stage-1" / "evidence" / "a3" / "B25" / "review_v1"
STAGE0_SOURCES = json.loads(
    (PAPER / "stage-0" / "evidence" / "a2" / "SOURCE_MANIFEST.json").read_text(encoding="utf-8")
)

# Risk-based full-size review, with every Lead-preflight orphan page and nearby
# question-boundary pages included. PDF page numbers are 1-based.
PAGES = {
    "9618_s25_qp_11": [1, 2, 6, 7, 8, 14, 15, 16, 17],
    "9618_s25_qp_12": [1, 4, 5, 6, 8, 10, 11, 12, 14, 15, 16],
    "9618_s25_qp_13": [1, 8, 10, 12, 13, 14, 15, 16, 17],
    "9618_w25_qp_11": [1, 2, 4, 6, 7, 8, 10, 11, 12, 13, 14, 15],
    "9618_w25_qp_12": [1, 2, 3, 4, 5, 12, 13, 14, 15, 16],
    "9618_w25_qp_13": [1, 2, 3, 4, 5, 6, 8, 9, 10, 12, 13, 14, 15],
    # Tables, formula/logic layouts and marking-condition rows across all six MS.
    "9618_s25_ms_11": [4, 8, 12],
    "9618_s25_ms_12": [4, 9],
    "9618_s25_ms_13": [4, 8],
    "9618_w25_ms_11": [7, 11],
    "9618_w25_ms_12": [4, 9],
    "9618_w25_ms_13": [4, 10],
}


def sha(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


source_records = {
    entry["id"]: entry
    for entry in STAGE0_SOURCES["primary_sources"]
    if entry.get("kind") in {"qp", "ms"} and entry.get("year") == 2025
}
render_root = OUT / "source_renders"
render_root.mkdir(parents=True, exist_ok=True)
records = []
for source_id, pages in PAGES.items():
    rec = source_records[source_id]
    original = WORKSPACE / rec["path"]
    actual_sha = sha(original)
    if actual_sha != rec["sha256"]:
        raise RuntimeError(f"Source pin mismatch: {source_id}: {actual_sha} != {rec['sha256']}")
    doc = pymupdf.open(original)
    if doc.page_count != rec["page_count"]:
        raise RuntimeError(f"Page-count mismatch: {source_id}: {doc.page_count} != {rec['page_count']}")
    if pages != sorted(set(pages)) or pages[-1] > doc.page_count:
        raise RuntimeError(f"Invalid review page selection for {source_id}: {pages}")
    for page_no in pages:
        output = render_root / f"{source_id}-p{page_no:02}.png"
        pix = doc[page_no - 1].get_pixmap(matrix=pymupdf.Matrix(2, 2), alpha=False)
        pix.save(output)
        records.append(
            {
                "source_id": source_id,
                "source_pdf": rec["path"],
                "source_pdf_sha256": actual_sha,
                "pdf_page_1_based": page_no,
                "render_path": output.relative_to(OUT).as_posix(),
                "render_sha256": sha(output),
                "width_px": pix.width,
                "height_px": pix.height,
                "scale": 2.0,
                "renderer": f"PyMuPDF {pymupdf.VersionBind}",
            }
        )

manifest = {
    "artifact_version": "B25-A3-REVIEW-v1",
    "source_rendering": "Fresh direct render from exact local Stage 0-pinned original PDFs; 2x matrix; PDF page numbering is 1-based.",
    "full_size_page_count": len(records),
    "source_count": len(PAGES),
    "pages": records,
}
(OUT / "SOURCE_RENDER_EVIDENCE_V1.json").write_text(
    json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
)
print(json.dumps({"sources": len(PAGES), "full_size_pages": len(records), "render_manifest": str(OUT / 'SOURCE_RENDER_EVIDENCE_V1.json')}, indent=2))
