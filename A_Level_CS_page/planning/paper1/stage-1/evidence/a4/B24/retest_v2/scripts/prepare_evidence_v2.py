from pathlib import Path
import json,hashlib
import pymupdf
from PIL import Image,ImageDraw,ImageOps
root=Path.cwd(); p1=root/'A_Level_CS_page/planning/paper1'; st=p1/'stage-1'; out=st/'evidence/a4/B24/retest_v2'; cand=st/'evidence/a2/B24/versions/B24-A2-v2'; v1=st/'evidence/a2/B24/versions/B24-A2-v1'; rd=out/'source_renders'; sd=out/'contact_sheets'
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def rel(p): return p.relative_to(root).as_posix()
# Explicit retest dispatch pins and every digest-bearing candidate-handoff input.
expected={
 'work_order':(st/'evidence/a0/B24_A4_V2_RETEST_DISPATCH.md','ed31d41204831c0ba53e3138b279a2e65a64923afab0aabb78fcda7ead7ca874'),
 'dispatch_record':(st/'evidence/a0/B24_A4_V2_RETEST_DISPATCH_RECORD.json','e4a71e4a411263fd72aa77a3c61d56606ce8211888f22f7f5ffed50428c9aa4f'),
 'candidate_handoff':(cand/'HANDOFF_CHECK.json','1deff03ac092aaec6bbaeed727dbfb62dfeeebd65b848d04723a27518b481328'),
 'candidate_batch_manifest':(cand/'BATCH_MANIFEST.json','88d4a354968210ce74d40af6aff25c06111855218630cc44df580423a0f3e6c7'),
 'candidate_snapshot_manifest':(cand/'SNAPSHOT_MANIFEST.json','97bd0ed1f802a6f8d71dda39f8b30086f6e8d9e16e8a154d1c25f575eb5f94f5'),
 'candidate_marking_index':(cand/'MARKING_INDEX.jsonl','331f66b5e614e69026a1b036c2b75fb63354bfea77901925c2fc4467a2b7dccd'),
 'a0_candidate_audit':(st/'evidence/a0/B24_A2_V2_A0_AUDIT.json','d5b2bfb4c2706840984e8e7c63f3c9ed223a67c531d0e1aabf9c426f254b826f'),
 'a9_v1_handoff':(st/'evidence/a9/B24/review_v1/HANDOFF_REVIEW_V1.json','ccb42b04231de24e29292fdd8404b72e6b9fb6f514efafccf685c7220535bf59'),
 'a9_v1_findings':(st/'evidence/a9/B24/review_v1/FINDINGS_V1.json','f0cfa70f3d1981777494a13e99ef18232ae29f8b859fe2bb407a1241af403d48'),
 'a4_v1_handoff':(st/'evidence/a4/B24/review_v1/HANDOFF_REVIEW_V1.json','e145320c7805acd8e70a1d507a1f902e59e7d517e967cfb9314e47d909bcff3e'),
 'a4_v1_output_manifest':(st/'evidence/a4/B24/review_v1/OUTPUT_MANIFEST_V1.json','092dea2479ced3be66f9e5bb71c120bfdf525c30b0c70fb7cf3938490c08dc4e'),
 'stage0_source_manifest':(p1/'stage-0/evidence/a2/SOURCE_MANIFEST.json','195a68ad98b4739dff0d3496dc93ba9e85d67d2dae0d88e3d4e4a088f1259c9c'),
 'schema':(st/'CORPUS_SCHEMA.md','9fe71d4719b0c8f9fd6d6fd6fb0316c7f9a840b6b964634889ea6d98245a1f1f'),
 'extraction_policy':(st/'EXTRACTION_POLICY.md','97bd6c69ea8d459ea99713e943c2d092a88999b6df7cb315d2820547789c11f2'),
 'candidate_v1_handoff':(v1/'HANDOFF_CHECK.json','d1946e1bd9c3a2b61bb8c3728873c860e3066240c990176649a2189902c145bd'),
 'candidate_v1_batch':(v1/'BATCH_MANIFEST.json','1a18ace3982d37dd6da5288238d7ca3cb5010d3b5977fe9481c40a93968d4486'),
 'candidate_v1_snapshot':(v1/'SNAPSHOT_MANIFEST.json','dbdc02935d5e8150019633e7138af1100b973cdcea7880116c4bdffcb417db97'),
}
pins=[]
for name,(p,expected_hash) in expected.items():
 got=sha(p); pins.append({'name':name,'path':rel(p),'expected_sha256':expected_hash,'actual_sha256':got,'pass':got==expected_hash})
handoff=json.loads((cand/'HANDOFF_CHECK.json').read_text(encoding='utf8'))
for name,entry in handoff.get('input_pins',{}).items():
 p=p1/entry['path']; got=sha(p); pins.append({'name':'candidate_input:'+name,'path':rel(p),'expected_sha256':entry['sha256'],'actual_sha256':got,'pass':got==entry['sha256']})
# Candidate complete snapshot.
snap=json.loads((cand/'SNAPSHOT_MANIFEST.json').read_text(encoding='utf8'))
snapshot=[]
for e in snap['files']:
 p=cand/e['path']; exists=p.is_file(); got=sha(p) if exists else None
 snapshot.append({'path':e['path'],'expected_bytes':e['byte_count'],'actual_bytes':p.stat().st_size if exists else None,'expected_sha256':e['sha256'],'actual_sha256':got,'pass':bool(exists and p.stat().st_size==e['byte_count'] and got==e['sha256'])})
# Rehash and reopen all 2024 QP/MS originals from Stage0 manifest.
source_manifest=json.loads((p1/'stage-0/evidence/a2/SOURCE_MANIFEST.json').read_text(encoding='utf8'))
sources=[s for s in source_manifest['primary_sources'] if s.get('id','').startswith(('9618_s24_','9618_w24_'))]
sources.sort(key=lambda x:x['id']); source_by_id={s['id']:s for s in sources}; source_checks=[]
for s in sources:
 p=root/s['path']; got=sha(p); doc=pymupdf.open(p); pages=len(doc); doc.close()
 source_checks.append({'source_id':s['id'],'path':s['path'],'expected_sha256':s['sha256'],'actual_sha256':got,'expected_bytes':s['bytes'],'actual_bytes':p.stat().st_size,'expected_page_count':s['page_count'],'actual_page_count':pages,'pass':got==s['sha256'] and p.stat().st_size==s['bytes'] and pages==s['page_count']})
# Risk page list: exact 19 source row pages, six covers, six cross-variant visual samples.
a9=json.loads((st/'evidence/a9/B24/review_v1/FINDINGS_V1.json').read_text(encoding='utf8'))
records=a9['findings'][0]['records']
source_pages=sorted({(r['source_id'],r['pdf_page_1_based']) for r in records})
qp_risk={('9618_s24_qp_11',2),('9618_s24_qp_12',7),('9618_s24_qp_13',3),('9618_w24_qp_11',4),('9618_w24_qp_12',9),('9618_w24_qp_13',9)}
for s in sources:
 if s['id'].startswith(('9618_s24_qp_','9618_w24_qp_')): source_pages.append((s['id'],1))
source_pages.extend(sorted(qp_risk)); source_pages=sorted(set(source_pages))
render_rows=[]; direct_text=[]
for sid,pn in source_pages:
 s=source_by_id[sid]; pdf=root/s['path']; doc=pymupdf.open(pdf)
 if not 1<=pn<=len(doc): raise ValueError((sid,pn,len(doc)))
 page=doc[pn-1]; dest=rd/f'{sid}-p{pn:03d}.png'; pix=page.get_pixmap(matrix=pymupdf.Matrix(2,2),alpha=False); pix.save(dest)
 txt=page.get_text('text',sort=True)
 render_rows.append({'source_id':sid,'pdf_path':s['path'],'pdf_sha256':s['sha256'],'pdf_page_1_based':pn,'render_path':dest.relative_to(out).as_posix(),'dpi':144,'width_px':pix.width,'height_px':pix.height,'sha256':sha(dest)})
 direct_text.append(f'=== {sid} p{pn} ===\n{txt}')
 doc.close()
(out/'DIRECT_SOURCE_TEXT_V2.txt').write_text('\n\n'.join(direct_text),encoding='utf-8')
(out/'INPUT_VERIFICATION_V2.json').write_text(json.dumps({'artifact':'B24 A4 v2 input verification','dispatch_sha256':expected['work_order'][1],'dispatch_record_sha256':expected['dispatch_record'][1],'pins_checked':len(pins),'pins_passed':sum(x['pass'] for x in pins),'pin_failures':[x for x in pins if not x['pass']],'pins':pins,'candidate_snapshot_declared':snap['file_count'],'candidate_snapshot_verified':sum(x['pass'] for x in snapshot),'candidate_snapshot_failures':[x for x in snapshot if not x['pass']],'snapshot_entries':snapshot,'source_count':len(source_checks),'total_source_pages':sum(x['actual_page_count'] for x in source_checks),'source_pdfs':source_checks},indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
(out/'SOURCE_PDF_HASHES_V2.json').write_text(json.dumps({'source_manifest_path':'stage-0/evidence/a2/SOURCE_MANIFEST.json','source_manifest_sha256':'195a68ad98b4739dff0d3496dc93ba9e85d67d2dae0d88e3d4e4a088f1259c9c','source_years':[2024],'source_count':len(source_checks),'page_count':sum(x['actual_page_count'] for x in source_checks),'sources':source_checks},indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
(out/'SOURCE_RENDER_MANIFEST_V2.json').write_text(json.dumps({'renderer':'PyMuPDF 1.28.2','dpi':144,'direct_page_render_count':len(render_rows),'purpose_counts':{'19-row-pages':len(source_pages)-12,'six-q.p.-covers':6,'six-q.p.-risk-samples':6},'pages':render_rows},indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
# Pair-page contact sheets to preserve text legibility.
for f in sd.glob('SOURCE_PAGES_*.jpg'): f.unlink()
for ix in range(0,len(render_rows),2):
 group=render_rows[ix:ix+2]; canvas=Image.new('RGB',(1568,2212),'#e8e8e8')
 for j,r in enumerate(group):
  image=Image.open(out/r['render_path']).convert('RGB'); image.thumbnail((760,1050)); tile=Image.new('RGB',(780,1100),'white'); tile.paste(image,((780-image.width)//2,35)); ImageDraw.Draw(tile).text((12,8),f"{r['source_id']} p{r['pdf_page_1_based']}",fill='black'); tile=ImageOps.expand(tile,border=2,fill='#777777'); canvas.paste(tile,(j*784,0))
 dest=sd/f'SOURCE_PAGES_{ix//2+1:02d}.jpg'; canvas.save(dest,quality=92)
print('pins',len(pins),sum(x['pass'] for x in pins),'snapshot',len(snapshot),sum(x['pass'] for x in snapshot),'sources',len(source_checks),sum(x['actual_page_count'] for x in source_checks),'renders',len(render_rows),'unique-MS-pages',len({x for x in source_pages if '_ms_' in x[0]}))
