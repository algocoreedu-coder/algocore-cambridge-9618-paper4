import json,re,sys
from pathlib import Path
import pymupdf as fitz
sys.stdout.reconfigure(encoding='utf8')
HERE=Path(__file__).parent
EXT=HERE.parents[1]/'extracted'
ids=sorted(p.stem.replace('_qp_','_') for p in EXT.glob('9618_*_qp_4*.json') if p.stem[6:8] in ['21','22'])
for pid in ids:
    sid=pid[:-3]+'_ms_'+pid[-2:]
    d=json.loads((EXT/(sid+'.json')).read_text(encoding='utf8'))
    doc=fitz.open(d['source_path']); sections={}; current=None; full=[]
    for pg,pp in zip(doc,d['pages']):
        lines=[(list(fitz.Rect(l['bbox'])*pg.rotation_matrix),l['text']) for l in pp['lines'] if l['text'].strip()]
        lines.sort(key=lambda l:(round(l[0][1],1),l[0][0]))
        labels=[(b,t.strip()) for b,t in lines if b[0]<125 and re.fullmatch(r'[123](?:\([a-zivx]+\))+',t.strip())]
        if not labels: continue
        full.append(f'=== PDF PAGE {pp["pdf_page"]} ===\n'+'\n'.join(t for b,t in lines))
        for idx,(box,label) in enumerate(labels):
            lower=labels[idx+1][0][1]-1 if idx+1<len(labels) else pg.rect.height-40
            body=[(b,t) for b,t in lines if b[1]>=box[1]-1 and b[1]<lower]
            mark=[int(t.strip()) for b,t in body if b[0]>pg.rect.width-110 and re.fullmatch(r'\d{1,2}',t.strip())]
            sec=sections.setdefault(label,{'part':label,'pages':[],'mark_values':[],'rubric':[]})
            sec['pages'].append(pp['pdf_page']); sec['mark_values']+=mark
            # Retain complete normalized text locally. Compact rubric ends at example code.
            content_left=max(b[2] for b,t in labels)+5
            content='\n'.join(t for b,t in body if b[0]>=content_left and b[0]<pg.rect.width-110)
            content=re.split(r'Example (?:code|Code)|Example (?:program|Program)',content)[0]
            sec['rubric'].append(content)
    (HERE/(pid+'_ms_normalized.txt')).write_text('\n\n'.join(full),encoding='utf8')
    (HERE/(pid+'_ms_candidates.json')).write_text(json.dumps(list(sections.values()),ensure_ascii=False,indent=2),encoding='utf8')
    compact=[]
    for s in sections.values():
        compact.append(f'{s["part"]} MS pages{s["pages"]} marks{s["mark_values"]}\n'+ '\n'.join(s['rubric'])[:3500])
    (HERE/(pid+'_ms_rubrics.txt')).write_text('\n\n'.join(compact),encoding='utf8')
    print(pid,len(sections),sum(s['mark_values'][0] if s['mark_values'] else 0 for s in sections.values()))
