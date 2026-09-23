from __future__ import annotations

import hashlib
import json
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[8]
OUT = ROOT / "A_Level_CS_page/planning/paper1/stage-1/evidence/a9/B22/retest_v5"
STAGE0 = ROOT / "A_Level_CS_page/planning/paper1/stage-0/evidence/a2/SOURCE_MANIFEST.json"
UNION = ROOT / "A_Level_CS_page/planning/paper1/stage-1/evidence/a2/B22/versions/B22-A2-v5/REVIEW_UNION_MANIFEST.json"


def sha(p: Path) -> str:
    return hashlib.sha256(p.read_bytes()).hexdigest()


OUT.mkdir(parents=True, exist_ok=True)
thumb_dir = OUT / "contact_thumbnails"
sheet_dir = OUT / "contact_sheets"
full_dir = OUT / "full_size_source_renders"
for directory in (thumb_dir, sheet_dir, full_dir):
    directory.mkdir(exist_ok=True)

stage0 = json.loads(STAGE0.read_text(encoding="utf-8"))
sources = [s for s in stage0["primary_sources"] if s["id"].startswith(("9618_s22_", "9618_w22_"))]
union = json.loads(UNION.read_text(encoding="utf-8"))
targets = union["pages"]
pdftoppm = "pdftoppm"
version = subprocess.run([pdftoppm, "-v"], capture_output=True, text=True).stderr.strip().splitlines()[0]
source_rows = []
sheet_rows = []
thumb_hashes = []
total_pages = 0

for source in sources:
    pdf = ROOT / source["path"]
    actual_hash = sha(pdf)
    page_count = len(PdfReader(str(pdf)).pages)
    if actual_hash != source["sha256"] or page_count != source["page_count"]:
        raise RuntimeError(f"Stage 0 source mismatch: {source['id']}")
    prefix = thumb_dir / source["id"]
    subprocess.run([pdftoppm, "-jpeg", "-scale-to", "360", str(pdf), str(prefix)], check=True, capture_output=True)
    thumbs = sorted(thumb_dir.glob(f"{source['id']}-*.jpg"))
    if len(thumbs) != page_count:
        raise RuntimeError(f"Expected {page_count} thumbnails for {source['id']}; found {len(thumbs)}")
    thumb_records = []
    images = [Image.open(p).convert("RGB") for p in thumbs]
    tile_w, tile_h, cols, gap, header = 360, 510, 4, 12, 28
    rows = (len(images) + cols - 1) // cols
    canvas = Image.new("RGB", (cols * tile_w + (cols + 1) * gap, rows * (tile_h + header) + (rows + 1) * gap), "white")
    draw = ImageDraw.Draw(canvas)
    for i, (path, im) in enumerate(zip(thumbs, images)):
        x = gap + (i % cols) * (tile_w + gap)
        y = gap + (i // cols) * (tile_h + header + gap)
        draw.text((x, y + 3), f"PDF p{i+1}", fill="black")
        im.thumbnail((tile_w, tile_h))
        canvas.paste(im, (x, y + header))
        digest = sha(path)
        row = {"pdf_page_1_based": i + 1, "path": path.relative_to(OUT).as_posix(), "sha256": digest}
        thumb_records.append(row)
        thumb_hashes.append(row)
    sheet_path = sheet_dir / f"{source['id']}-all-pages.jpg"
    canvas.save(sheet_path, quality=90)
    sheet_rows.append({"source_id": source["id"], "page_count": page_count, "path": sheet_path.relative_to(OUT).as_posix(), "sha256": sha(sheet_path)})
    source_rows.append({"source_id": source["id"], "path": source["path"], "sha256_stage0": source["sha256"], "sha256_actual": actual_hash,
                        "bytes": pdf.stat().st_size, "page_count_stage0": source["page_count"], "page_count_actual": page_count,
                        "page_hash_match": True, "page_count_match": True, "thumbnails": thumb_records})
    total_pages += page_count

full_rows = []
for item in targets:
    src, page = item["source_id"], item["pdf_page_1_based"]
    source = next(s for s in sources if s["id"] == src)
    pdf = ROOT / source["path"]
    dest = full_dir / f"{src}-p{page:02d}"
    subprocess.run([pdftoppm, "-png", "-r", "180", "-f", str(page), "-l", str(page), "-singlefile", str(pdf), str(dest)], check=True, capture_output=True)
    rendered = dest.with_suffix(".png")
    with Image.open(rendered) as im:
        dimensions = list(im.size)
    full_rows.append({"source_id": src, "pdf_page_1_based": page, "roles": item["roles"], "original_pdf_sha256": source["sha256"],
                      "path": rendered.relative_to(OUT).as_posix(), "sha256": sha(rendered), "bytes": rendered.stat().st_size,
                      "dimensions_px": dimensions, "dpi": 180, "rendered_directly_from_original": True})

manifest = {
    "schema_version": "1.0", "task_id": "P1-S1-A9-B22-RETEST-V5", "candidate_version": "B22-A2-v5",
    "renderer": version, "render_command_family": "Poppler pdftoppm", "full_size_render_dpi": 180, "overview_thumbnail_long_edge_px": 360,
    "source_pdf_count": len(source_rows), "source_pages_total": total_pages, "contact_sheet_count": len(sheet_rows), "contact_sheet_pages_total": sum(x["page_count"] for x in sheet_rows),
    "review_union_manifest_sha256": sha(UNION), "review_union_expected_counts": union["counts"],
    "source_pdfs": source_rows, "contact_sheets": sheet_rows, "all_page_thumbnails": thumb_hashes,
    "full_size_union_renders": full_rows, "full_size_union_page_count": len(full_rows),
}
manifest_path = OUT / "SOURCE_RENDER_MANIFEST_V5.json"
manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps({"source_pdfs": len(source_rows), "pages": total_pages, "contact_sheets": len(sheet_rows), "full_size_union_pages": len(full_rows), "manifest_sha256": sha(manifest_path)}, indent=2))
