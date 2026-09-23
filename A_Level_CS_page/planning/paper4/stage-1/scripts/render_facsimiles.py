from pathlib import Path
import json, hashlib
import pymupdf
stage = Path(__file__).resolve().parents[1]
rows = json.loads((stage/'EXTRACTION_MANIFEST.json').read_text(encoding='utf-8'))
items = []
for row in rows:
    if '_qp_' not in row['source_id'] and '_ms_' not in row['source_id']: continue
    doc = pymupdf.open(row['source_path'])
    out = stage/'facsimiles'/row['source_id']
    out.mkdir(parents=True,exist_ok=True)
    pages = []
    for i,page in enumerate(doc):
        path = out/f'p{i+1:03}.png'
        if not path.exists(): page.get_pixmap(dpi=110, alpha=False).save(path)
        pages.append({'pdf_page':i+1,'image':path.relative_to(stage).as_posix(),'sha256':hashlib.sha256(path.read_bytes()).hexdigest()})
    items.append({'source_id':row['source_id'],'source_sha256':row['sha256'],'pages':pages})
    print(row['source_id'],len(pages),flush=True)
(stage/'FACSIMILE_MANIFEST.json').write_text(json.dumps({'schema_version':'1.0','method':'PyMuPDF rendering at 110 dpi, all QP/MS pages, no source edits','review_boundary':'Images mechanically generated; selected visual inspections recorded separately. Original PDF at higher zoom remains authoritative.','sources':items},indent=2),encoding='utf-8')
print('TOTAL',sum(len(x['pages']) for x in items),flush=True)
