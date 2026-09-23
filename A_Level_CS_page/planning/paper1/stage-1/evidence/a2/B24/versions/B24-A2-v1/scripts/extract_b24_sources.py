from __future__ import annotations
import hashlib,json,re
from pathlib import Path
import pymupdf
from PIL import Image,ImageDraw,ImageFont
P1=Path('A_Level_CS_page/planning/paper1')
OUT=P1/'stage-1/evidence/a2/B24/versions/B24-A2-v1'
MANIFEST=P1/'stage-0/evidence/a2/SOURCE_MANIFEST.json'
EXPECTED={
'9618_s24_ms_11':('b53a8ca0d83d790364125ad0b74cef676204133d540c9c89f38404dd4d1fca69',8,'Past_Papers/2024/May_June/9618_s24_ms_11.pdf'),
'9618_s24_ms_12':('27327b88c438432d5af97553d3ac09dcfe42f0a35c8d2556fdc9bd90959c7ea0',11,'Past_Papers/2024/May_June/9618_s24_ms_12.pdf'),
'9618_s24_ms_13':('8d9b06f8ba8f9fba12b8cd725e39c5bda93fe14c1ba6c89912de801671762179',9,'Past_Papers/2024/May_June/9618_s24_ms_13.pdf'),
'9618_s24_qp_11':('2e39e6c2ee1e65d621df71b4b7fbe41a16f1e4ed8e252fb1612a6d14b13de063',16,'Past_Papers/2024/May_June/9618_s24_qp_11.pdf'),
'9618_s24_qp_12':('871b047e73c2ce0dd3c2dd1c47b7d4e176c886e61af08ffe12c6b9734285d3de',16,'Past_Papers/2024/May_June/9618_s24_qp_12.pdf'),
'9618_s24_qp_13':('79f3dbe24332c41b155e25ba48d3a8cb75399e98d5bb9cdf9a1e71de0f4645bd',16,'Past_Papers/2024/May_June/9618_s24_qp_13.pdf'),
'9618_w24_ms_11':('e9674e802b5b850509834b1ab1b84008740729d668ae844e9b0142607dbdf1a2',9,'Past_Papers/2024/Oct_Nov/9618_w24_ms_11.pdf'),
'9618_w24_ms_12':('42b8ef4e24bdd263e1a81b9ae34d332e77e34f7c7853ab411977410f1b43192e',10,'Past_Papers/2024/Oct_Nov/9618_w24_ms_12.pdf'),
'9618_w24_ms_13':('d3ee5286285e4611838cb9922a4fd9706a1a4e733ece048f24f89ee5cb48ec37',9,'Past_Papers/2024/Oct_Nov/9618_w24_ms_13.pdf'),
'9618_w24_qp_11':('94d1aed5bc14f0a3fd60da0e932cf5b8b40bd8342550ff0254c19afe89001ef7',16,'Past_Papers/2024/Oct_Nov/9618_w24_qp_11.pdf'),
'9618_w24_qp_12':('3d754f83188ee139c7ffd082496a3d0591e73714ec8787dc2b961f5aa2c744c6',16,'Past_Papers/2024/Oct_Nov/9618_w24_qp_12.pdf'),
'9618_w24_qp_13':('1633471ff692292618910635b391aef69624188ec30b72425738f8a46354cc04',20,'Past_Papers/2024/Oct_Nov/9618_w24_qp_13.pdf')}
def digest(p):
 h=hashlib.sha256()
 with p.open('rb') as f:
  for b in iter(lambda:f.read(1024*1024),b''): h.update(b)
 return h.hexdigest()
stage=json.loads(MANIFEST.read_text(encoding='utf-8')); stage_by={x['id']:x for x in stage['primary_sources']}
page_rows=[]; source_rows=[]; provenance=[]; all_text={}
for sid,(expected_hash,expected_pages,rel) in EXPECTED.items():
 p=Path(rel); actual=digest(p); assert actual==expected_hash==stage_by[sid]['sha256'],sid
 doc=pymupdf.open(p); assert len(doc)==expected_pages==stage_by[sid]['page_count'],sid
 source_rows.append({'source_id':sid,'sha256':actual,'relative_path':rel,'kind':'qp' if '_qp_' in sid else 'ms','year':2024,'session':'s' if '_s24_' in sid else 'w','component':sid.rsplit('_',1)[1],'page_count':len(doc),'hash_matches_stage0':True})
 source_pages=[]; thumbs=[]
 for n,page in enumerate(doc,1):
  tx=page.get_text('text') or ''; tx=tx.rstrip()+('\n' if tx else '')
  tref=f'transcripts/{sid}-p{n:03d}.txt'; (OUT/tref).write_text(tx,encoding='utf-8')
  pix=page.get_pixmap(matrix=pymupdf.Matrix(.5,.5),alpha=False)
  image=Image.frombytes('RGB',(pix.width,pix.height),pix.samples)
  thumbs.append((n,image.copy()))
  extraction='EXTRACTED' if tx.strip() else 'EMPTY_TEXT_REVIEW_REQUIRED'
  page_rows.append({'source_id':sid,'pdf_page_1_based':n,'printed_page_or_null':None,'extraction_status':extraction,'visual_status':'CONTACT_SHEET_SCREEN_REQUIRED','transcript_ref_or_null':tref})
  source_pages.append({'pdf_page_1_based':n,'transcript_ref':tref,'text_chars':len(tx),'extraction_status':extraction})
  all_text[(sid,n)]=tx
 # one all-page screen per PDF: 4 columns, labeled thumbnail tiles.
 cols=4; tile_w=255; tile_h=370; rows=(len(thumbs)+cols-1)//cols
 sheet=Image.new('RGB',(cols*tile_w,rows*tile_h),(238,240,243)); draw=ImageDraw.Draw(sheet)
 for i,(n,img) in enumerate(thumbs):
  col=i%cols; row=i//cols; x=col*tile_w; y=row*tile_h
  draw.text((x+6,y+4),f'{sid} p{n:02d}',fill=(20,30,45))
  img.thumbnail((tile_w-18,tile_h-34))
  sheet.paste(img,(x+(tile_w-img.width)//2,y+25))
 sref=f'renders/contact_sheets/{sid}-all-pages.jpg'; sheet.save(OUT/sref,quality=88)
 provenance.append({'source_id':sid,'relative_path':rel,'sha256':actual,'page_count':len(doc),'contact_sheet':sref,'pages':source_pages})
 doc.close()
# Store initial page inventory and extraction provenance, plus source pin table.
(OUT/'PAGE_INDEX.jsonl').write_text(''.join(json.dumps(x,ensure_ascii=False)+'\n' for x in page_rows),encoding='utf-8')
(OUT/'SOURCE_EXTRACTION_PROVENANCE.json').write_text(json.dumps({'method':'PyMuPDF page text and 0.5x all-page contact sheets','source_manifest_path':'A_Level_CS_page/planning/paper1/stage-0/evidence/a2/SOURCE_MANIFEST.json','source_manifest_sha256':digest(MANIFEST),'sources':provenance},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(OUT/'_extracted_text_cache.json').write_text(json.dumps({f'{sid}|p{n}':tx for (sid,n),tx in all_text.items()},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('sources',len(source_rows),'pages',len(page_rows),'texts',sum(1 for _ in (OUT/'transcripts').glob('*.txt')),'contacts',len(provenance))


