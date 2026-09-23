from pathlib import Path
import sys, json, hashlib, re
import pymupdf
sys.stdout.reconfigure(encoding='utf-8')
stage = Path(__file__).resolve().parents[1]
root = stage.parents[3]
baseline = json.loads((stage.parent/'stage-0/evidence/A2_SOURCE_BASELINE.json').read_text(encoding='utf-8-sig'))
sources = {}
for p in baseline['papers']:
    for item in [p['qp']] + p['ms'] + p['examiner_reports']:
        sources[item['path']] = item
for filename in ['697372-2026-syllabus.pdf','dokumen.pub_cambridge-international-as-and-a-levels-computer-science-9781510457591.pdf']:
    path = root/filename
    sources[str(path)] = {'path': str(path)}
out = stage/'extracted'
out.mkdir(parents=True,exist_ok=True)
manifest = []
for item in sources.values():
    path = Path(item['path'])
    sid = path.stem
    if path.name.startswith('697372'): sid='syllabus_2026_v2'
    if path.name.startswith('dokumen'): sid='coursebook_watson_williams'
    doc = pymupdf.open(path)
    pages=[]
    for i,page in enumerate(doc):
        lines=[]
        for block in page.get_text('dict')['blocks']:
            for line in block.get('lines',[]):
                text=''.join(s['text'] for s in line['spans'])
                visual_rect=pymupdf.Rect(line['bbox'])*page.rotation_matrix
                lines.append({'bbox':[round(v,2) for v in line['bbox']], 'display_bbox':[round(v,2) for v in visual_rect], 'direction':list(line.get('dir',(1,0))), 'text':text,
                    'spans':[{'text':s['text'],'font':s['font'],'size':round(s['size'],2),'bbox':[round(v,2) for v in s['bbox']]} for s in line['spans']]})
        lines.sort(key=lambda l:(round(l['bbox'][1],1),l['bbox'][0]))
        text=page.get_text(sort=False)
        pages.append({'pdf_page':i+1,'width':round(page.rect.width,2),'height':round(page.rect.height,2),
            'rotation':page.rotation,'text':text,'sorted_text_for_reference_only':page.get_text(sort=True),'lines':lines,'replacement_character_count':text.count('\ufffd')})
    record={'extraction_version':'1.1','text_order':'pymupdf-natural-order; geometry retained in bbox/display_bbox, sorted_text not authoritative for rotated pages','source_id':sid,'source_path':str(path),'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),
            'size_bytes':path.stat().st_size,'page_count':len(doc),'encrypted':doc.is_encrypted,'pages':pages}
    temp=out/f'{sid}.json.tmp'
    temp.write_text(json.dumps(record,ensure_ascii=False,indent=2),encoding='utf-8')
    temp.replace(out/f'{sid}.json')
    temp=out/f'{sid}.txt.tmp'
    temp.write_text('\n\n'.join(f'=== PDF PAGE {p["pdf_page"]} ===\n{p["text"]}' for p in pages),encoding='utf-8')
    temp.replace(out/f'{sid}.txt')
    manifest.append({k:v for k,v in record.items() if k!='pages'} | {'extraction_json':f'extracted/{sid}.json','extraction_text':f'extracted/{sid}.txt','blank_text_pages':[p['pdf_page'] for p in pages if not p['text'].strip()],'replacement_character_pages':[p['pdf_page'] for p in pages if p['replacement_character_count']],'status':'extracted_pending_content_review'})
    print(sid, len(doc))
(stage/'EXTRACTION_MANIFEST.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
print('TOTAL',len(manifest),'PAGES',sum(r['page_count'] for r in manifest))
