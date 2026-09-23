from __future__ import annotations
import hashlib, json, subprocess, shutil, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
from pypdf import PdfReader

ROOT=Path.cwd()
S1=ROOT/'A_Level_CS_page/planning/paper1/stage-1'
S0=ROOT/'A_Level_CS_page/planning/paper1/stage-0'
OUT=S1/'evidence/a9/B23/retest_v3'
STAGE0=json.loads((S0/'evidence/a2/SOURCE_MANIFEST.json').read_text(encoding='utf-8'))
A2=S1/'evidence/a2/B23'
HAND=json.loads((A2/'HANDOFF_CHECK.json').read_text(encoding='utf-8'))
MAN=json.loads((A2/'BATCH_MANIFEST.json').read_text(encoding='utf-8'))
A9CHECK=json.loads((S1/'evidence/a9/B23/CHECK_RESULTS.json').read_text(encoding='utf-8'))
SOURCES=[s for s in STAGE0['primary_sources'] if s['id'].startswith(('9618_s23_','9618_w23_')) and s.get('kind') in ('qp','ms')]
assert len(SOURCES)==12
assert not (OUT/'FULL_RENDERS_COMPLETE.json').exists()
POPPLER=shutil.which('pdftoppm')
if not POPPLER:
    POPPLER=str(Path.home()/'.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/Library/bin/pdftoppm.exe')
if not Path(POPPLER).exists(): raise RuntimeError('pdftoppm unavailable')

def sha(p):
    h=hashlib.sha256()
    with p.open('rb') as f:
        for b in iter(lambda:f.read(1024*1024),b''): h.update(b)
    return h.hexdigest()

def run_render(pdf, dest_prefix, dpi=None, scale=None, page=None, fmt='png'):
    cmd=[POPPLER]
    if fmt=='jpg': cmd += ['-jpeg','-jpegopt','quality=82']
    else: cmd += ['-png']
    if dpi is not None: cmd += ['-r',str(dpi)]
    if scale is not None: cmd += ['-scale-to',str(scale)]
    if page is not None: cmd += ['-f',str(page),'-l',str(page),'-singlefile']
    cmd += [str(pdf),str(dest_prefix)]
    cp=subprocess.run(cmd,capture_output=True,text=True)
    if cp.returncode: raise RuntimeError(f"render failed {pdf} p{page}: {cp.stderr}")
    return cp.stdout,cp.stderr

full_dir=OUT/'full_renders'
thumb_dir=OUT/'contact_thumbnails'
sheet_dir=OUT/'source_contact_sheets'
for d in (full_dir,thumb_dir,sheet_dir): d.mkdir(parents=True,exist_ok=True)
# Hash and page-count all twelve original batch sources before review.
source_rows=[]
source_by_id={}
for src in SOURCES:
    path=ROOT/src['path']
    if not path.exists(): raise FileNotFoundError(path)
    reader=PdfReader(str(path))
    rec={'source_id':src['id'],'relative_path':src['path'],'sha256_stage0':src['sha256'],'sha256_actual':sha(path),'page_count_stage0':src['page_count'],'page_count_actual':len(reader.pages),'sha256_match':sha(path)==src['sha256'],'page_count_match':len(reader.pages)==src['page_count']}
    source_rows.append(rec); source_by_id[src['id']]=(src,path,len(reader.pages))
if not all(x['sha256_match'] and x['page_count_match'] for x in source_rows): raise AssertionError('Source hash/page mismatch')
# Fresh high-resolution renders for all 30 prior-F04 risk pages.
risk_pages=[(x[0],int(x[1])) for x in A9CHECK['ms_pages_with_marking_records_without_region']]
assert len(risk_pages)==30, len(risk_pages)
render_rows=[]
for sid,page in risk_pages:
    src,pdf,pages=source_by_id[sid]
    assert page<=pages
    dest=full_dir/f'{sid}-p{page:02d}'
    run_render(pdf,dest,dpi=160,page=page)
    img=dest.with_suffix('.png')
    if not img.exists(): raise FileNotFoundError(img)
    render_rows.append({'source_id':sid,'pdf_page_1_based':page,'source_sha256':sha(pdf),'path':img.relative_to(OUT).as_posix(),'render_sha256':sha(img),'width_height':list(Image.open(img).size),'purpose':'full-size independent inspection of prior A9 F04 risk page'})
# F01/F02/F05 QP and MS source pages required by dispatch.
extra_pages=[('9618_w23_qp_11',16),('9618_w23_ms_11',10),('9618_s23_qp_11',13),('9618_s23_ms_11',9),('9618_w23_qp_13',13)]
extra_rows=[]
for sid,page in extra_pages:
    src,pdf,pages=source_by_id[sid]
    dest=full_dir/f'{sid}-p{page:02d}'
    run_render(pdf,dest,dpi=160,page=page)
    img=dest.with_suffix('.png')
    extra_rows.append({'source_id':sid,'pdf_page_1_based':page,'source_sha256':sha(pdf),'path':img.relative_to(OUT).as_posix(),'render_sha256':sha(img),'width_height':list(Image.open(img).size),'purpose':'F01/F02/F05 direct original-source evidence'})
# Fresh low-resolution renders of every page in all 12 PDFs for contact-sheet sweep.
contact_rows=[]
font=ImageFont.load_default()
for src in SOURCES:
    sid=src['id']; pdf=source_by_id[sid][1]; pages=source_by_id[sid][2]
    prefix=thumb_dir/sid
    run_render(pdf,prefix,scale=350,fmt='jpg')
    paths=sorted(thumb_dir.glob(sid+'-*.jpg'))
    if len(paths)!=pages:
        raise AssertionError(f'{sid}: expected {pages} thumbnails, found {len(paths)}')
    ims=[]
    for i,path in enumerate(paths,1):
        im=Image.open(path).convert('RGB')
        canvas=Image.new('RGB',(im.width,im.height+26),'white')
        canvas.paste(im,(0,26))
        ImageDraw.Draw(canvas).text((5,6),f'{sid} PDF p{i}',fill='black',font=font)
        ims.append((path,canvas))
    cols=4; cellw=max(im.width for _,im in ims)+12; cellh=max(im.height for _,im in ims)+12
    rows=(len(ims)+cols-1)//cols
    sheet=Image.new('RGB',(cols*cellw,rows*cellh),'#dddddd')
    draw=ImageDraw.Draw(sheet)
    draw.text((8,3),f'{sid} | {pages} original PDF pages | fresh Poppler contact sheet',fill='black',font=font)
    for j,(_,im) in enumerate(ims): sheet.paste(im,((j%cols)*cellw+6,(j//cols)*cellh+22))
    out=sheet_dir/f'{sid}-contact.jpg'; sheet.save(out,quality=90)
    contact_rows.append({'source_id':sid,'page_count':pages,'contact_sheet_path':out.relative_to(OUT).as_posix(),'contact_sheet_sha256':sha(out),'thumbnail_paths':[p.relative_to(OUT).as_posix() for p,_ in ims],'thumbnail_sha256':[sha(p) for p,_ in ims]})
# Output manifest summary.
manifest={'review_task':'P1-S1-A9-B23-RETEST-V3','render_method':'Poppler pdftoppm via fresh direct renders of hash-verified original PDFs; full risk pages at 160 dpi; all-page contact thumbnails with -scale-to 350; PIL contact sheets 4 columns','source_checks':source_rows,'f04_risk_pages_expected':30,'f04_full_size_renders':render_rows,'f01_f02_f05_original_page_renders':extra_rows,'source_contact_sheets':contact_rows,'source_pages_contact_sheet_total':sum(x['page_count'] for x in SOURCES)}
(OUT/'RENDER_MANIFEST_V3.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'source_count':len(source_rows),'source_pages':sum(x['page_count_actual'] for x in source_rows),'risk_renders':len(render_rows),'special_renders':len(extra_rows),'contact_sheets':len(contact_rows),'contact_pages':sum(x['page_count'] for x in contact_rows),'manifest':str((OUT/'RENDER_MANIFEST_V3.json').relative_to(ROOT))},indent=2))
