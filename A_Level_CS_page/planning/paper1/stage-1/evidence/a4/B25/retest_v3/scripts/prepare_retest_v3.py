from pathlib import Path
import hashlib, json
import pymupdf
from PIL import Image, ImageDraw, ImageOps

ROOT = Path.cwd()
P1 = ROOT / 'A_Level_CS_page/planning/paper1'
STAGE = P1 / 'stage-1'
CAND = STAGE / 'evidence/a2/B25/versions/B25-A2-v3'
PARENT = STAGE / 'evidence/a2/B25/versions/B25-A2-v2'
OUT = STAGE / 'evidence/a4/B25/retest_v3'
RENDERS = OUT / 'source_renders'
SHEETS = OUT / 'contact_sheets'
for d in (OUT, RENDERS, SHEETS):
    d.mkdir(parents=True, exist_ok=True)

def sha(path):
    h = hashlib.sha256()
    with path.open('rb') as f:
        for chunk in iter(lambda: f.read(1 << 20), b''):
            h.update(chunk)
    return h.hexdigest()

def readjson(path):
    return json.loads(path.read_text(encoding='utf-8'))

def rel(path):
    return path.relative_to(ROOT).as_posix()

work = STAGE / 'evidence/a0/B25_A4_V3_RETEST_DISPATCH.md'
dispatch_record = STAGE / 'evidence/a0/B25_A4_V3_RETEST_DISPATCH_RECORD.json'
handoff = readjson(CAND / 'HANDOFF_CHECK.json')
expected = {
    'work_order': (work, '903445b487b41080dcc02360432b53b7cefeb0c150f44c5fd040496fe30eef97'),
    'dispatch_record': (dispatch_record, 'DISPATCH_RECORD_SHA256_TO_BE_REPLACED'),
    'candidate_handoff': (CAND / 'HANDOFF_CHECK.json', 'e498e1f978bc038e98de3551d5dffe061b1f71fce866d86744ec24e3a82d02c5'),
    'candidate_batch_manifest': (CAND / 'BATCH_MANIFEST.json', '4a9e64a05d6205e4f3cae6e2b8c013e34d5176f757ecffbe66a1c58171c98489'),
    'candidate_snapshot_manifest': (CAND / 'SNAPSHOT_MANIFEST.json', 'e78a8b8f8f2b399ed6f442de614abdd494b4d357494524c3f0c4cc9150cc3957'),
    'candidate_marking_index': (CAND / 'MARKING_INDEX.jsonl', 'a200dabddd320b94aaf159c4b5742a63de5a4c0f0b936584bb9794fdc0616eef'),
    'candidate_a0_audit': (STAGE / 'evidence/a0/B25_A2_V3_A0_AUDIT.json', '355a8c024ece148cf365f7d443cf59fe39046e5a9988f35515a01faf9c4f3abe'),
    'a9_v2_handoff': (STAGE / 'evidence/a9/B25/review_v2/HANDOFF_REVIEW_V2.json', 'c01a3453afed6095a0948fb29d98e5d9e3639e261da956dd89334b3eadc0108d'),
    'a9_v2_findings': (STAGE / 'evidence/a9/B25/review_v2/FINDINGS_V2.json', 'd3b50d623011aba5dfc0f2189052a41c06d868c75cd305621285d38abd062ce9'),
    'a4_v2_handoff': (STAGE / 'evidence/a4/B25/retest_v2/HANDOFF_RETEST_V2.json', 'fadda1eeb35560ef52d5a134ea5b595dbf0b8566fc119ab6c1b58db6f21994a1'),
    'a3_v2_handoff': (STAGE / 'evidence/a3/B25/retest_v2/HANDOFF_RETEST_V2.json', 'e190a65d00eb9a5a4c67babc03580e3427340b138b6a36566972327f2f420112'),
    'stage0_source_manifest': (P1 / 'stage-0/evidence/a2/SOURCE_MANIFEST.json', '195a68ad98b4739dff0d3496dc93ba9e85d67d2dae0d88e3d4e4a088f1259c9c'),
    'schema': (STAGE / 'CORPUS_SCHEMA.md', '9fe71d4719b0c8f9fd6d6fd6fb0316c7f9a840b6b964634889ea6d98245a1f1f'),
    'extraction_policy': (STAGE / 'EXTRACTION_POLICY.md', '97bd6c69ea8d459ea99713e943c2d092a88999b6df7cb315d2820547789c11f2'),
}
expected['dispatch_record'] = (dispatch_record, sha(dispatch_record))
pins = []
for name, (path, expected_hash) in expected.items():
    actual = sha(path)
    pins.append({'name': name, 'path': rel(path), 'expected_sha256': expected_hash,
                 'actual_sha256': actual, 'pass': actual == expected_hash})
for name, item in handoff['input_pins'].items():
    path = P1 / item['path']
    actual = sha(path)
    pins.append({'name': 'candidate_input:' + name, 'path': rel(path),
                 'expected_sha256': item['sha256'], 'actual_sha256': actual,
                 'pass': actual == item['sha256']})

snapshot = readjson(CAND / 'SNAPSHOT_MANIFEST.json')
snapshot_checks = []
for entry in snapshot['files']:
    path = CAND / entry['path']
    exists = path.is_file()
    actual_hash = sha(path) if exists else None
    actual_bytes = path.stat().st_size if exists else None
    snapshot_checks.append({'path': entry['path'], 'expected_sha256': entry['sha256'],
                            'actual_sha256': actual_hash, 'expected_bytes': entry['byte_count'],
                            'actual_bytes': actual_bytes,
                            'pass': bool(exists and actual_hash == entry['sha256'] and actual_bytes == entry['byte_count'])})

source_manifest = readjson(P1 / 'stage-0/evidence/a2/SOURCE_MANIFEST.json')
source_rows = []
source_by_id = {}
for source in source_manifest['primary_sources']:
    if not source.get('id', '').startswith(('9618_s25_', '9618_w25_')):
        continue
    path = ROOT / source['path']
    doc = pymupdf.open(path)
    pages = len(doc)
    doc.close()
    source_by_id[source['id']] = source
    source_rows.append({'source_id': source['id'], 'path': source['path'],
                        'expected_sha256': source['sha256'], 'actual_sha256': sha(path),
                        'expected_bytes': source['bytes'], 'actual_bytes': path.stat().st_size,
                        'expected_page_count': source['page_count'], 'actual_page_count': pages,
                        'pass': sha(path) == source['sha256'] and pages == source['page_count'] and path.stat().st_size == source['bytes']})

# Eight A9 row-boundary cases: seven unique source pages, with two rows on W25/12 MS p11.
corrected = [
 ('9618_w25_qp_12-q1-mi-1', '9618_w25_ms_12', 4, '1', '2'),
 ('9618_w25_qp_12-q2-pb-mi-1', '9618_w25_ms_12', 5, '2(b)', '2'),
 ('9618_w25_qp_12-q5-pe-mi-1', '9618_w25_ms_12', 8, '5(e)', '3'),
 ('9618_w25_qp_12-q6-pd-mi-1', '9618_w25_ms_12', 9, '6(d)', '2'),
 ('9618_w25_qp_12-q8-pb-pii-mi-1', '9618_w25_ms_12', 10, '8(b)(ii)', '2'),
 ('9618_w25_qp_12-q9-pb-mi-1', '9618_w25_ms_12', 11, '9(b)', '2'),
 ('9618_w25_qp_12-q10-pc-mi-1', '9618_w25_ms_12', 11, '10(c)', '1'),
 ('9618_w25_qp_13-q3-pb-mi-1', '9618_w25_ms_13', 6, '3(b)', '2'),
]
# Risk pages plus all six official covers, covering every 2025 session/component.
selected = {(sid, page, 'corrected-ms-row') for _, sid, page, _, _ in corrected}
for sid in sorted(s for s in source_by_id if s.endswith(('_qp_11', '_qp_12', '_qp_13'))):
    selected.add((sid, 1, 'qp-cover-total'))
for sid, page in [
    ('9618_s25_qp_11', 7), ('9618_s25_qp_12', 5), ('9618_s25_qp_13', 5),
    ('9618_w25_qp_11', 7), ('9618_w25_qp_12', 13), ('9618_w25_qp_13', 5),
]:
    selected.add((sid, page, 'risk-focused-qp-sample'))
render_rows, text_rows = [], []
for sid, page_no, purpose in sorted(selected):
    source = source_by_id[sid]
    pdf = ROOT / source['path']
    doc = pymupdf.open(pdf)
    page = doc[page_no - 1]
    filename = f'{sid}-p{page_no:03d}.png'
    target = RENDERS / filename
    pix = page.get_pixmap(matrix=pymupdf.Matrix(2, 2), alpha=False)
    pix.save(target)
    text_rows.append({'source_id': sid, 'pdf_page_1_based': page_no,
                      'text': page.get_text('text', sort=True)})
    render_rows.append({'source_id': sid, 'pdf_path': source['path'],
                        'pdf_sha256': source['sha256'], 'pdf_page_1_based': page_no,
                        'purpose': purpose, 'render_path': rel(target), 'dpi': 144,
                        'width_px': pix.width, 'height_px': pix.height,
                        'sha256': sha(target)})
    doc.close()

(OUT / 'DIRECT_SOURCE_TEXT_V3.txt').write_text(
    '\n\n'.join(f"=== {r['source_id']} p{r['pdf_page_1_based']} ===\n{r['text']}" for r in text_rows),
    encoding='utf-8')
(OUT / 'SOURCE_PDF_HASHES_V3.json').write_text(json.dumps({
    'artifact': 'B25 A4 v3 retest original-source PDF verification',
    'source_pdf_count': len(source_rows), 'total_pages': sum(x['actual_page_count'] for x in source_rows),
    'sources': source_rows}, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
(OUT / 'SOURCE_RENDER_MANIFEST_V3.json').write_text(json.dumps({
    'renderer': f'PyMuPDF {pymupdf.VersionBind}', 'dpi': 144,
    'render_count': len(render_rows), 'pages': render_rows}, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')

# Labeled 4-up sheets to support direct visual page review.
for start in range(0, len(render_rows), 4):
    group = render_rows[start:start + 4]
    canvas = Image.new('RGB', (1568, 2212), '#e8e8e8')
    for i, row in enumerate(group):
        image = Image.open(ROOT / row['render_path']).convert('RGB')
        image.thumbnail((760, 1050))
        tile = Image.new('RGB', (780, 1100), 'white')
        tile.paste(image, ((780 - image.width) // 2, 38))
        ImageDraw.Draw(tile).text((12, 9), f"{row['source_id']} p{row['pdf_page_1_based']} | {row['purpose']}", fill='black')
        tile = ImageOps.expand(tile, border=2, fill='#777777')
        canvas.paste(tile, ((i % 2) * 784, (i // 2) * 1106))
    canvas.save(SHEETS / f'SOURCE_PAGES_{start // 4 + 1:02d}.jpg', quality=92)

verification = {
    'artifact': 'B25 A4 v3 input verification',
    'dispatch_sha256': pins[0]['expected_sha256'],
    'dispatch_record_sha256': pins[1]['actual_sha256'],
    'pins_checked': len(pins), 'pins_passed': sum(x['pass'] for x in pins),
    'pin_failures': [x for x in pins if not x['pass']], 'pins': pins,
    'snapshot_entries_declared': snapshot['file_count'],
    'snapshot_entries_passed': sum(x['pass'] for x in snapshot_checks),
    'snapshot_failures': [x for x in snapshot_checks if not x['pass']],
    'snapshot_checks': snapshot_checks,
    'source_pdf_count': len(source_rows), 'source_pages_total': sum(x['actual_page_count'] for x in source_rows),
    'source_failures': [x for x in source_rows if not x['pass']],
    'source_pdfs': source_rows,
}
(OUT / 'INPUT_VERIFICATION_V3.json').write_text(json.dumps(verification, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
(OUT / 'INPUT_PINS_V3.json').write_text(json.dumps({k: verification[k] for k in ('artifact','dispatch_sha256','dispatch_record_sha256','pins_checked','pins_passed','pin_failures','pins')}, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
print(json.dumps({'pins': (verification['pins_passed'], verification['pins_checked']),
                  'snapshot': (verification['snapshot_entries_passed'], verification['snapshot_entries_declared']),
                  'sources': (verification['source_pdf_count'], verification['source_pages_total']),
                  'renders': len(render_rows)}, indent=2))
