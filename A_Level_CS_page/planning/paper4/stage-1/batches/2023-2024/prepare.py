import json,re,sys
from pathlib import Path
import pymupdf
sys.stdout.reconfigure(encoding='utf-8')
OUT=Path(__file__).parent
ROOT=Path.cwd()
allpapers=[]
for qp in sorted(ROOT.glob('Past_Papers/202[34]/*/*_qp_4*.pdf')):
    ms=qp.with_name(qp.name.replace('_qp_','_ms_'))
    pid=qp.stem.replace('_qp','')
    d=pymupdf.open(qp); m=pymupdf.open(ms)
    qpages=[p.get_text() for p in d]
    mpages=[p.get_text() for p in m]
    rows={}
    for pn,p in enumerate(m,1):
        words=[(pymupdf.Rect(w[:4])*p.rotation_matrix,w[4]) for w in p.get_text('words')]
        labels=[(r,t) for r,t in words if r.x0<120 and re.fullmatch(r'[123](?:\([a-zivx]+\))+',t)]
        for r,t in labels:
            marks=[tx for rr,tx in words if rr.x0>740 and abs(rr.y0-r.y0)<3 and tx.isdigit()]
            row=rows.setdefault(t,{'part':t,'ms_pages':[],'ms_marks':None,'criteria':[]})
            row['ms_pages'].append(pn)
            if marks: row['ms_marks']=int(marks[0])
    for name,pages in [('qp',qpages),('ms',mpages)]:
        (OUT/f'{pid}_{name}_readable.txt').write_text('\n'.join(f'=== PDF PAGE {n} ===\n{t}' for n,t in enumerate(pages,1)),encoding='utf-8')
    allpapers.append({'paper_id':pid,'qp_source_id':qp.stem,'ms_source_id':ms.stem,'qp_page_count':len(d),'ms_page_count':len(m),'declared_total_marks':75,'rows':list(rows.values()),'qp_pages_text':qpages,'ms_pages_text':mpages,'qp_path':str(qp),'ms_path':str(ms)})
(OUT/'prepared.json').write_text(json.dumps(allpapers,ensure_ascii=False,indent=2),encoding='utf-8')
for p in allpapers:
    print(p['paper_id'],[(r['part'],r['ms_marks'],r['ms_pages']) for r in p['rows']],sum(r['ms_marks'] or 0 for r in p['rows']))
