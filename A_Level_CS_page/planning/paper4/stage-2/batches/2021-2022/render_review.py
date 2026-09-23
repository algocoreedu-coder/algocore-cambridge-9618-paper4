from pathlib import Path
import json
import pymupdf as fitz

HERE=Path(__file__).resolve().parent
S1=HERE.parents[2]/'stage-1'
PAGES={'s21_41':[7], 's22_41':[2,5], 's22_42':[4,7], 'w21_41':[2,4], 'w22_41':[4,5,6,7], 'w22_42':[5,7,9]}
(HERE/'renders').mkdir(exist_ok=True)
manifest=[]
for paper,pages in PAGES.items():
    season,variant=paper.split('_')
    sid=f'9618_{season}_qp_{variant}'
    meta=json.loads((S1/'extracted'/f'{sid}.json').read_text(encoding='utf-8'))
    with fitz.open(meta['source_path']) as doc:
        for n in pages:
            path=HERE/'renders'/f'{sid}_p{n:02}.png'
            doc[n-1].get_pixmap(matrix=fitz.Matrix(1.25,1.25)).save(path)
            manifest.append({'source_id':sid,'pdf_page':n,'image':f'renders/{path.name}'})
(HERE/'VISUAL_REVIEW_MANIFEST.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
print(f'Rendered {len(manifest)} read-only QP facsimiles')
