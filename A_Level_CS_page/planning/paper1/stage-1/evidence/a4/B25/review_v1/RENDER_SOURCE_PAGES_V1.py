import json, pathlib, hashlib, subprocess, shutil
from PIL import Image, ImageOps, ImageDraw, ImageFont
ROOT=pathlib.Path.cwd(); STAGE=ROOT/'A_Level_CS_page/planning/paper1/stage-1'; OUT=STAGE/'evidence/a4/B25/review_v1'; CAND=STAGE/'evidence/a2/B25/versions/B25-A2-v1'
batch=json.loads((CAND/'BATCH_MANIFEST.json').read_text(encoding='utf-8')); visual=json.loads((CAND/'VISUAL_MANIFEST.json').read_text(encoding='utf-8'))
source_paths={x['source_id']:ROOT/x['relative_path'] for x in batch['inputs']}
page_set=sorted({(v['source_id'],v['pdf_page_1_based']) for v in visual['visual_regions']})
qp_sample=set((x['source_id'],x['pdf_page_1_based']) for x in json.loads((OUT/'SOURCE_PAGE_REQUESTS_V1.json').read_text(encoding='utf-8'))['pages'] if x['source_id'].startswith('9618_') and '_qp_' in x['source_id'])
render_dir=OUT/'source_renders'; render_dir.mkdir(parents=True,exist_ok=True)
pdftoppm=shutil.which('pdftoppm')
if not pdftoppm: raise SystemExit('pdftoppm not found')
renders=[]
for sid,page in page_set:
 pref=render_dir/f'{sid}-p{page:03d}'
 dest=pref.with_suffix('.png')
 if not dest.exists():
  proc=subprocess.run([pdftoppm,'-f',str(page),'-l',str(page),'-singlefile','-png','-r','144',str(source_paths[sid]),str(pref)],capture_output=True,text=True)
  if proc.returncode: raise RuntimeError(f'{sid} p{page}: {proc.stderr}')
 im=Image.open(dest)
 renders.append({'source_id':sid,'pdf_page_1_based':page,'path':dest.relative_to(OUT).as_posix(),'width':im.width,'height':im.height,'bytes':dest.stat().st_size,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'kind':'MS visual dependency page' if '_ms_' in sid else 'QP visual region page','qp_full_size_sample':(sid,page) in qp_sample})
(OUT/'SOURCE_RENDER_MANIFEST_V1.json').write_text(json.dumps({'work_order':'P1-S1-A4-B25-REVIEW-V1','render_method':'Poppler pdftoppm direct from exact SHA-pinned source PDF; PNG 144 DPI; one page per file','page_count':len(renders),'pages':renders},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
# Source contact sheets for all MS dependencies (4/page sheet); QP region pages (6/page sheet)
def sheet(kind,items,cols,rows,thumb_w):
 tile_h=round(thumb_w*1.414); margin=28; label_h=34
 per=cols*rows
 for ix in range(0,len(items),per):
  group=items[ix:ix+per]; W=margin+(thumb_w+margin)*cols; H=margin+(tile_h+label_h+margin)*rows
  canvas=Image.new('RGB',(W,H),'white'); d=ImageDraw.Draw(canvas)
  for j,r in enumerate(group):
   im=Image.open(OUT/r['path']).convert('RGB'); im.thumbnail((thumb_w,tile_h))
   x=margin+(j%cols)*(thumb_w+margin); y=margin+(j//cols)*(tile_h+label_h+margin)
   canvas.paste(im,(x,y)); d.text((x,y+tile_h+4),f"{r['source_id']} p{r['pdf_page_1_based']} | {r['sha256'][:10]}",fill='black')
  fp=OUT/f'{kind}_CONTACT_{ix//per+1:02d}.jpg'; canvas.save(fp,quality=92)
  yield {'path':fp.relative_to(OUT).as_posix(),'sha256':hashlib.sha256(fp.read_bytes()).hexdigest(),'bytes':fp.stat().st_size,'pages':[f"{r['source_id']}:p{r['pdf_page_1_based']}" for r in group]}
ms=[r for r in renders if '_ms_' in r['source_id']]
qp=[r for r in renders if '_qp_' in r['source_id']]
contacts=list(sheet('MS',ms,2,2,690))+list(sheet('QP',qp,3,2,480))
(OUT/'SOURCE_CONTACT_SHEET_MANIFEST_V1.json').write_text(json.dumps({'render_sha_manifest':'SOURCE_RENDER_MANIFEST_V1.json','page_count':len(renders),'contact_sheets':contacts},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'page_count':len(renders),'ms_dependency_pages':len(ms),'qp_visual_region_pages':len(qp),'qp_full_size_sample':len(qp_sample),'contact_sheets':len(contacts),'render_bytes':sum(r['bytes'] for r in renders)},indent=2))
