from pathlib import Path
import json
import pymupdf
ROOT=Path.cwd(); B=ROOT/'A_Level_CS_page/planning/paper1/stage-1/evidence/a2/B22'
man=json.loads((B/'BATCH_MANIFEST.json').read_text(encoding='utf-8'))
sources={x['source_id']:x for x in man['inputs'] if x['kind']=='qp'}
out=B/'renders/a2-v3-qp-review';out.mkdir(parents=True,exist_ok=True)
pages=[]
for sid,s in sorted(sources.items()):
 doc=pymupdf.open(ROOT/s['relative_path'])
 for pn,page in enumerate(doc,1):
  pix=page.get_pixmap(matrix=pymupdf.Matrix(1.55,1.55),alpha=False)
  fn=f'{sid}-p{pn:02}.png';pix.save(out/fn)
  pages.append({'source_id':sid,'pdf_page_1_based':pn,'file':f'renders/a2-v3-qp-review/{fn}'})
 doc.close()
(B/'a2-v3-qp-review-render-index.json').write_text(json.dumps({'method':'PyMuPDF 1.28.2, all pages of six Stage 0-matched original QP PDFs rendered at 1.55 scale, RGB PNG','rendered_source_pages':pages},indent=2),encoding='utf-8')
print('rendered',len(pages),'total QP pages')
