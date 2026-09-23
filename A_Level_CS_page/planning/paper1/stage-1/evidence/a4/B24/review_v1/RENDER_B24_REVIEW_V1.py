import hashlib, json, re, subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[8]
STAGE1 = ROOT / "A_Level_CS_page/planning/paper1/stage-1"
OUT = STAGE1 / "evidence/a4/B24/review_v1"
CAND = STAGE1 / "evidence/a2/B24/versions/B24-A2-v1"

def hfile(p):
    h = hashlib.sha256()
    with p.open("rb") as f:
        for b in iter(lambda: f.read(1024 * 1024), b""): h.update(b)
    return h.hexdigest()

batch = json.loads((CAND / "BATCH_MANIFEST.json").read_text(encoding="utf-8"))
vis = json.loads((CAND / "VISUAL_MANIFEST.json").read_text(encoding="utf-8"))
snap = json.loads((CAND / "SNAPSHOT_MANIFEST.json").read_text(encoding="utf-8"))
hand = json.loads((CAND / "HANDOFF_CHECK.json").read_text(encoding="utf-8"))
dispatch = STAGE1 / "evidence/a0/B24_A4_V1_REVIEW_DISPATCH.md"
expected = {
    "dispatch": (dispatch, "c7ad46a03288a2bdf63a4ad29761761f577417ee305aaf2b9c849eb172464144"),
    "candidate_handoff": (CAND / "HANDOFF_CHECK.json", "d1946e1bd9c3a2b61bb8c3728873c860e3066240c990176649a2189902c145bd"),
    "candidate_batch_manifest": (CAND / "BATCH_MANIFEST.json", "1a18ace3982d37dd6da5288238d7ca3cb5010d3b5977fe9481c40a93968d4486"),
    "candidate_snapshot_manifest": (CAND / "SNAPSHOT_MANIFEST.json", "dbdc02935d5e8150019633e7138af1100b973cdcea7880116c4bdffcb417db97"),
    "a0_candidate_audit": (STAGE1 / "evidence/a0/B24_A2_V1_A0_AUDIT.json", "cc9563fd98aae568f6a6ee29ed9e8e83738e2ebde3089eb8440ee9c528d70ca1"),
    "stage0_source_manifest": (STAGE1.parent / "stage-0/evidence/a2/SOURCE_MANIFEST.json", "195a68ad98b4739dff0d3496dc93ba9e85d67d2dae0d88e3d4e4a088f1259c9c"),
    "schema": (STAGE1 / "CORPUS_SCHEMA.md", "9fe71d4719b0c8f9fd6d6fd6fb0316c7f9a840b6b964634889ea6d98245a1f1f"),
    "policy": (STAGE1 / "EXTRACTION_POLICY.md", "97bd6c69ea8d459ea99713e943c2d092a88999b6df7cb315d2820547789c11f2"),
}
pins = []
for name, (path, want) in expected.items():
    got = hfile(path)
    pins.append({"name": name, "path": path.relative_to(ROOT).as_posix(), "expected_sha256": want, "actual_sha256": got, "status": "PASS" if got == want else "FAIL"})

source_rows = []
for item in batch["source_validation"]["checks"]:
    pdf = ROOT / item["relative_path"]
    got = hfile(pdf)
    source_rows.append({"source_id": item["source_id"], "path": item["relative_path"], "page_count_expected": item["page_count_expected"], "page_count_candidate": item["page_count_actual"], "sha256_expected": item["sha256_expected"], "sha256_actual": got, "classification": item["source_classification"], "year_id_ok": bool(re.search(r"(?:s|w)24_", item["source_id"])), "status": "PASS" if got == item["sha256_expected"] and item["page_count_expected"] == item["page_count_actual"] and re.search(r"(?:s|w)24_", item["source_id"]) else "FAIL"})

snapshot_rows = []
for item in snap["files"]:
    f = CAND / item["path"]
    good = f.is_file() and f.stat().st_size == item["byte_count"] and hfile(f) == item["sha256"]
    if not good: snapshot_rows.append(item["path"])

(OUT / "INPUT_PINS_V1.json").write_text(json.dumps({"work_order": "P1-S1-A4-B24-REVIEW-V1", "pins": pins, "source_pdfs": source_rows, "candidate_snapshot": {"declared": snap["file_count"], "verified": len(snap["files"]) - len(snapshot_rows), "failures": snapshot_rows}}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

# Re-render every page of each exact source PDF directly (not from candidate renders).
render_dir = OUT / "source_renders"
render_dir.mkdir(parents=True, exist_ok=True)
pages = []
for item in source_rows:
    src = ROOT / item["path"]
    sid = item["source_id"]
    prefix = render_dir / sid
    run = subprocess.run(["pdftoppm", "-r", "120", "-png", str(src), str(prefix)], capture_output=True, text=True)
    if run.returncode != 0: raise RuntimeError(f"pdftoppm failed for {sid}: {run.stderr}")
    generated = sorted(render_dir.glob(sid + "-*.png"), key=lambda p: int(re.search(r"-(\d+)\.png$", p.name).group(1)))
    if len(generated) != item["page_count_expected"]: raise RuntimeError(f"render page count mismatch {sid}: {len(generated)}")
    for idx, f in enumerate(generated, 1):
        with Image.open(f) as im: width, height = im.size
        pages.append({"source_id": sid, "pdf_page_1_based": idx, "path": f"source_renders/{f.name}", "width": width, "height": height, "bytes": f.stat().st_size, "sha256": hfile(f), "source_sha256": item["sha256_actual"]})

# Contact sheets are for rapid whole-source screening. Full-size original renders remain available.
sheet_rows = []
try: font = ImageFont.truetype("arial.ttf", 18)
except OSError: font = ImageFont.load_default()
for item in source_rows:
    sid = item["source_id"]
    source_pages = [x for x in pages if x["source_id"] == sid]
    for start in range(0, len(source_pages), 4):
        group = source_pages[start:start + 4]
        thumb_w, thumb_h, label_h = 425, 601, 34
        canvas = Image.new("RGB", (2 * thumb_w, 2 * (thumb_h + label_h)), "#eeeeee")
        draw = ImageDraw.Draw(canvas)
        for j, row in enumerate(group):
            im = Image.open(OUT / row["path"]).convert("RGB")
            im.thumbnail((thumb_w - 10, thumb_h - 8))
            x, y = (j % 2) * thumb_w + 5, (j // 2) * (thumb_h + label_h) + label_h
            canvas.paste(im, (x, y))
            draw.text((x, y - label_h + 3), f"{sid} | PDF p{row['pdf_page_1_based']} | {row['sha256'][:12]}", fill="#111111", font=font)
        name = f"CONTACT_{sid}_{start // 4 + 1:02}.jpg"
        dest = OUT / name
        canvas.save(dest, quality=88)
        sheet_rows.append({"path": name, "source_id": sid, "first_pdf_page": group[0]["pdf_page_1_based"], "last_pdf_page": group[-1]["pdf_page_1_based"], "bytes": dest.stat().st_size, "sha256": hfile(dest)})

render_doc = {"work_order": "P1-S1-A4-B24-REVIEW-V1", "render_method": "Poppler pdftoppm, direct from hash-pinned original PDF, PNG 120 DPI; all source pages", "source_count": len(source_rows), "page_count": len(pages), "pages": pages}
(OUT / "SOURCE_RENDER_MANIFEST_V1.json").write_text(json.dumps(render_doc, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
(OUT / "CONTACT_SHEET_MANIFEST_V1.json").write_text(json.dumps({"page_count": len(pages), "sheet_count": len(sheet_rows), "sheets": sheet_rows, "review_note": "Contact sheets are screening aids; source PNGs are direct original-page renders."}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

print(json.dumps({"pins_pass": sum(x["status"] == "PASS" for x in pins), "pin_count": len(pins), "snapshot_count": snap["file_count"], "snapshot_verified": len(snap["files"]) - len(snapshot_rows), "source_count": len(source_rows), "source_pages": sum(x["page_count_expected"] for x in source_rows), "source_ids_2024": all(x["year_id_ok"] for x in source_rows), "render_pages": len(pages), "contact_sheets": len(sheet_rows)}, indent=2))
