from __future__ import annotations
import hashlib,json,re
from pathlib import Path
import pymupdf
from PIL import Image,ImageDraw,ImageFont
P1=Path('A_Level_CS_page/planning/paper1')
OUT=P1/'stage-1/evidence/a2/B25/versions/B25-A2-v1'
MANIFEST=P1/'stage-0/evidence/a2/SOURCE_MANIFEST.json'
EXPECTED={
'9618_s25_ms_11':('8bf543ddd26e74224f40fd909152e300b9b711eb3644d7e8d07c1d5c3f07521b',12,'Past_Papers/2025/May_June/9618_s25_ms_11.pdf'),
'9618_s25_ms_12':('0b0c41c4a7930853aaaaa00729d4ffd3a3e971948800220344c6ae6a31ec957a',12,'Past_Papers/2025/May_June/9618_s25_ms_12.pdf'),
'9618_s25_ms_13':('a334bec016c753451ae53c56fdfc0b0758b8f2b5a7a06a86307ac100bb7ebd8e',12,'Past_Papers/2025/May_June/9618_s25_ms_13.pdf'),
'9618_s25_qp_11':('bdf74d4f15c620bde7e6fe65f17828bc85c89490ebb9a1a337e2cd0596f4b39a',20,'Past_Papers/2025/May_June/9618_s25_qp_11.pdf'),
'9618_s25_qp_12':('607722293452744ee7107b7365cac73664d51e0eb0f7487587d038e22467826e',16,'Past_Papers/2025/May_June/9618_s25_qp_12.pdf'),
'9618_s25_qp_13':('b341d6829ba4baf47dbd8d272cb7fd49b448d04a2a16a028e4fb3178c3c64554',20,'Past_Papers/2025/May_June/9618_s25_qp_13.pdf'),
'9618_w25_ms_11':('64b2928b1348598cd0be2cda8014405264f0a4303b73665633e4e297217056f4',15,'Past_Papers/2025/Oct_Nov/9618_w25_ms_11.pdf'),
'9618_w25_ms_12':('4fd455f74ae4abf71a8796095c912a06c77239d6d5a6679ce05ceff1032e7dd8',11,'Past_Papers/2025/Oct_Nov/9618_w25_ms_12.pdf'),
'9618_w25_ms_13':('d4bf99da2ca289430a18709d483892df85646dc5a90d5fb6697eb6d13c10481b',12,'Past_Papers/2025/Oct_Nov/9618_w25_ms_13.pdf'),
'9618_w25_qp_11':('2fe1691a0eff789ac686121aac0ae4e7cb3852f9bd321a6542dc6b82fbedf616',16,'Past_Papers/2025/Oct_Nov/9618_w25_qp_11.pdf'),
'9618_w25_qp_12':('ea65e75a4182f991cb2117827ee5c6734365b2c5e78686c6d6ef1e00d48fe65b',16,'Past_Papers/2025/Oct_Nov/9618_w25_qp_12.pdf'),
'9618_w25_qp_13':('9b5d7e33de24afb406ddc00c253ebf37b4240e6b21f3c1a7f6f1eb82aba78cc6',16,'Past_Papers/2025/Oct_Nov/9618_w25_qp_13.pdf')}
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
 source_rows.append({'source_id':sid,'sha256':actual,'relative_path':rel,'kind':'qp' if '_qp_' in sid else 'ms','year':2025,'session':'s' if '_s25_' in sid else 'w','component':sid.rsplit('_',1)[1],'page_count':len(doc),'hash_matches_stage0':True})
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

