from pathlib import Path
import json,hashlib
import pymupdf
from PIL import Image,ImageDraw,ImageOps
workspace=Path.cwd(); p1=workspace/'A_Level_CS_page/planning/paper1'; out=p1/'stage-1/evidence/a4/B25/retest_v2'; rd=out/'source_renders'; sd=out/'contact_sheets'
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def rel(p): return p.relative_to(workspace).as_posix()
sm=json.loads((p1/'stage-0/evidence/a2/SOURCE_MANIFEST.json').read_text(encoding='utf-8'))
qp=[s for s in sm['primary_sources'] if s.get('id','').startswith(('9618_s25_qp_','9618_w25_qp_'))]
texts=[]; rows=[]
for s in sorted(qp,key=lambda x:x['id']):
 p=workspace/s['path']; d=pymupdf.open(p); page=d[0]; txt=page.get_text('text',sort=True)
 nm=s['id']+'-p001.png'; dest=rd/nm; pix=page.get_pixmap(matrix=pymupdf.Matrix(2,2),alpha=False); pix.save(dest)
 texts.append(f"=== {s['id']} p1 ===\n{txt}")
 rows.append({'source_id':s['id'],'pdf_path':s['path'],'pdf_page_1_based':1,'render_path':rel(dest),'dpi':144,'width_px':pix.width,'height_px':pix.height,'sha256':sha(dest),'original_pdf_sha256':s['sha256'],'direct_cover_total_text':txt})
 d.close()
(out/'COVER_TOTAL_SOURCE_TEXT_V2.txt').write_text('\n\n'.join(texts),encoding='utf-8')
manifest=json.loads((out/'SOURCE_RENDER_MANIFEST_V2.json').read_text(encoding='utf-8'))
manifest['pages'] += rows; manifest['page_count']=len(manifest['pages']); manifest['direct_cover_pages_added']=6
(out/'SOURCE_RENDER_MANIFEST_V2.json').write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
# refresh contact sheets so all 20 are represented (2 pages per sheet to retain detail)
for p in sd.glob('RETEST_PAGES_*.jpg'): p.unlink()
images=[rd/(r['render_path'].split('/')[-1]) for r in manifest['pages']]
for ix in range(0,len(images),2):
 group=images[ix:ix+2]; canvas=Image.new('RGB',(1568,2212),'#e8e8e8')
 for pos,p in enumerate(group):
  im=Image.open(p).convert('RGB'); im.thumbnail((760,1050)); tile=Image.new('RGB',(780,1100),'white'); tile.paste(im,((780-im.width)//2,35)); ImageDraw.Draw(tile).text((12,8),p.stem,fill='black'); tile=ImageOps.expand(tile,border=2,fill='#777777'); canvas.paste(tile,(pos*784,0))
 dest=sd/f'RETEST_PAGES_{ix//2+1:02d}.jpg'; canvas.save(dest,quality=92)
summary=json.loads((out/'RETEST_AUTOMATION_SUMMARY_V2.json').read_text(encoding='utf-8'))
summary['direct_source_render_count']=len(manifest['pages'])
summary['direct_source_renders']=[{'source_id':r['source_id'],'page':r['pdf_page_1_based'],'sha256':r['sha256']} for r in manifest['pages']]
(out/'RETEST_AUTOMATION_SUMMARY_V2.json').write_text(json.dumps(summary,indent=2)+'\n',encoding='utf-8')
print('cover count',len(rows),'total render',len(manifest['pages']))
for x in rows: print(x['source_id'], 'The total mark for this paper is 75.' in x['direct_cover_total_text'], x['sha256'])
