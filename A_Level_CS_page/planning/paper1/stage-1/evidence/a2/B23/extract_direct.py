"""Direct, read-only extraction of B23 primary PDFs.

Outputs are internal evidence only.  The script checks the Stage 0 SHA-256
baseline before reading each PDF, then records page text and raster previews.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

import pymupdf

ROOT = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent
MANIFEST = ROOT / "A_Level_CS_page/planning/paper1/stage-0/evidence/a2/SOURCE_MANIFEST.json"


def digest(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for block in iter(lambda: f.read(1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()


def main() -> None:
    stage0 = json.loads(MANIFEST.read_text(encoding="utf-8"))
    sources = [x for x in stage0["primary_sources"]
               if __import__("re").fullmatch(r"9618_[sw]23_(?:qp|ms)_1[123]", x["id"])]
    (OUT / "transcripts").mkdir(parents=True, exist_ok=True)
    (OUT / "renders").mkdir(parents=True, exist_ok=True)
    result = []
    for source in sorted(sources, key=lambda x: x["id"]):
        path = ROOT / source["path"]
        actual = digest(path)
        if actual != source["sha256"]:
            raise RuntimeError(f"hash mismatch for {source['id']}: {actual}")
        doc = pymupdf.open(path)
        pages = []
        for no, page in enumerate(doc, 1):
            text = page.get_text("text")
            transcript = f"transcripts/{source['id']}-p{no:02d}.txt"
            (OUT / transcript).write_text(text, encoding="utf-8")
            # Low-resolution whole-page render provides stable evidence for later
            # visual review without altering the primary PDF.
            render = f"renders/{source['id']}-p{no:02d}.png"
            pix = page.get_pixmap(matrix=pymupdf.Matrix(1.5, 1.5), alpha=False)
            pix.save(OUT / render)
            pages.append({"pdf_page_1_based": no, "transcript_ref": transcript,
                          "rendered_asset_ref": render, "text_chars": len(text)})
        result.append({"source_id": source["id"], "relative_path": source["path"],
                       "sha256_stage0": source["sha256"], "sha256_verified": actual,
                       "page_count_stage0": source["page_count"], "page_count_direct": len(doc),
                       "pages": pages})
        doc.close()
    (OUT / "direct_extraction_provenance.json").write_text(
        json.dumps({"method": "pymupdf 1.28.2", "source": "primary PDFs",
                    "sources": result}, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
