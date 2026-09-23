from pathlib import Path
import hashlib
import json
import fitz

workspace = Path(__file__).resolve().parents[5]
out = Path(__file__).resolve().parent
syllabus = workspace / '697372-2026-syllabus.pdf'
book = workspace / 'dokumen.pub_cambridge-international-as-and-a-levels-computer-science-9781510457591.pdf'
records = []
for path, pages, prefix in [(syllabus, [0, 2, 10, 12, 36, 37, 38, 39], 'syllabus2026'), (book, [0, 1, 2, 6, 7, 8], 'coursebook')]:
    doc = fitz.open(path)
    excerpts = []
    for page in pages:
        excerpts.append(f'=== PDF PAGE {page + 1} ===\n{doc[page].get_text()}')
    (out / f'{prefix}_selected_pages.txt').write_text('\n\n'.join(excerpts), encoding='utf-8')
    if prefix == 'syllabus2026':
        for page in [10, 36, 37, 39]:
            doc[page].get_pixmap(matrix=fitz.Matrix(1.2, 1.2)).save(str(out / f'{prefix}_p{page + 1}.png'))
    records.append({'path': str(path), 'bytes': path.stat().st_size, 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'pages': len(doc), 'extracted_pdf_pages': [p+1 for p in pages]})
(out / 'LEAD_SOURCE_VERIFICATION.json').write_text(json.dumps(records, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps(records, ensure_ascii=False, indent=2))
