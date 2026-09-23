from pathlib import Path
import json, hashlib, datetime
import pymupdf
from PIL import Image, ImageOps, ImageDraw

workspace = Path.cwd()
paper1 = workspace / 'A_Level_CS_page/planning/paper1'
stage = paper1 / 'stage-1'
cand = stage / 'evidence/a2/B25/versions/B25-A2-v2'
out = stage / 'evidence/a4/B25/retest_v2'
render_dir = out / 'source_renders'
sheet_dir = out / 'contact_sheets'
for d in (render_dir, sheet_dir): d.mkdir(parents=True, exist_ok=True)

def sha(p):
    h=hashlib.sha256()
    with p.open('rb') as f:
        for b in iter(lambda:f.read(1<<20),b''): h.update(b)
    return h.hexdigest()

def readjson(p): return json.loads(p.read_text(encoding='utf-8'))

def rel(p): return p.relative_to(workspace).as_posix()

# Check pinned inputs, including every input declared by frozen candidate handoff.
expected = {
 'work_order': (stage/'evidence/a0/B25_A4_V2_RETEST_DISPATCH.md','13f618043e433f092255f2e83625ba70298bef2b9fce865dddf24934ae268ce0'),
 'dispatch_record': (stage/'evidence/a0/B25_A4_V2_RETEST_DISPATCH_RECORD.json','68cc1d23b41b73130b9ae0d5f401e08ae867867e9245bc6ecc36e51f53b8adc3'),
 'candidate_handoff': (cand/'HANDOFF_CHECK.json','e76a1dd54350d237b76cd5c50fa3fbcb2de515b2e46b6f60c074bf83812027f5'),
 'candidate_batch_manifest': (cand/'BATCH_MANIFEST.json','063e47ee4726c310d63646a4b777a61fd5054ee4d47c3c00b7e290592609fca8'),
 'candidate_snapshot_manifest': (cand/'SNAPSHOT_MANIFEST.json','56374136cee31b62382c44f8e26fb31b2e6319bc689373e938b077493161be94'),
 'a0_candidate_audit': (stage/'evidence/a0/B25_A2_V2_A0_AUDIT.json','72c73ab452386f56f5a07d8392a641ba7024d455608d10a90a4823ffc6cdca73'),
 'a0_validator': (stage/'evidence/a0/B25_A2_V2_A0_VALIDATE.json','e2a33361079a98adb183ff4114ada2345e5cdf3dc2e9886eb8cc67811c3a8866'),
 'a4_v1_handoff': (stage/'evidence/a4/B25/review_v1/HANDOFF_REVIEW_V1.json','2df0def5ebfd7c605c1c1c07750e307db2b4dbb95e5b3985e17d67e30d539179'),
 'a4_v1_output_manifest': (stage/'evidence/a4/B25/review_v1/OUTPUT_MANIFEST_V1.json','689efe3036bd5ffc9950e7e4557d8a8a852930a218cce3729bc2603a3f7f7a7e'),
 'a4_v1_output_sums': (stage/'evidence/a4/B25/review_v1/OUTPUT_SHA256SUMS.txt','f2e7635c3957cacc0171ee156f032f1b4ee749dcd1cb966645d629535a0820b9'),
 'a3_v1_handoff': (stage/'evidence/a3/B25/review_v1/HANDOFF_REVIEW_V1.json','f96bf8d634b5bb5e37496b7f826fa330277f2219169e827bf3e0369fc0e18ea0'),
 'a3_v1_output_manifest': (stage/'evidence/a3/B25/review_v1/OUTPUT_MANIFEST_V1.json','5c14521a04c05766832c15a8933f1f0f2bbc68abee603613fae3e8a1b1917a63'),
 'stage0_source_manifest': (paper1/'stage-0/evidence/a2/SOURCE_MANIFEST.json','195a68ad98b4739dff0d3496dc93ba9e85d67d2dae0d88e3d4e4a088f1259c9c'),
 'schema': (stage/'CORPUS_SCHEMA.md','9fe71d4719b0c8f9fd6d6fd6fb0316c7f9a840b6b964634889ea6d98245a1f1f'),
 'extraction_policy': (stage/'EXTRACTION_POLICY.md','97bd6c69ea8d459ea99713e943c2d092a88999b6df7cb315d2820547789c11f2'),
 'prior_candidate_v1': (stage/'evidence/a2/B25/versions/B25-A2-v1/HANDOFF_CHECK.json','6087afbba526210bb4566d005fd278224e9078b3fcddb91ccdd410f62e17ae7b'),
}
pin_rows=[]
for name,(p,want) in expected.items():
    got=sha(p)
    pin_rows.append({'name':name,'path':rel(p),'expected_sha256':want,'actual_sha256':got,'pass':got==want})
handoff=readjson(cand/'HANDOFF_CHECK.json')
for name, pin in handoff['input_pins'].items():
    p=paper1/pin['path']; got=sha(p)
    pin_rows.append({'name':'candidate_input:'+name,'path':rel(p),'expected_sha256':pin['sha256'],'actual_sha256':got,'pass':got==pin['sha256']})
# Exact snapshot verification.
snap=readjson(cand/'SNAPSHOT_MANIFEST.json')
snapshot_rows=[]
for e in snap['files']:
    p=cand/e['path']; exists=p.is_file(); got=sha(p) if exists else None
    snapshot_rows.append({'path':e['path'],'expected_bytes':e['byte_count'],'actual_bytes':p.stat().st_size if exists else None,'expected_sha256':e['sha256'],'actual_sha256':got,'pass':bool(exists and p.stat().st_size==e['byte_count'] and got==e['sha256'])})
# Compare context records to frozen parent; only the ten intended context entries may change.
parent=cand.parent/'B25-A2-v1'
ctx_diffs=[]
for f in sorted((cand/'contexts').glob('*.json')):
    v1=parent/'contexts'/f.name
    if not v1.exists(): ctx_diffs.append({'path':f.name,'state':'added'}); continue
    h1,h2=sha(v1),sha(f)
    if h1!=h2: ctx_diffs.append({'path':f.name,'v1_sha256':h1,'v2_sha256':h2})
# Source PDFs from Stage 0 manifest: independently rehash all 12 2025 docs and open/count pages.
source_manifest=readjson(paper1/'stage-0/evidence/a2/SOURCE_MANIFEST.json')
source_rows=[]
for s in source_manifest['primary_sources']:
    if not s.get('id','').startswith(('9618_s25_','9618_w25_')): continue
    p=workspace/s['path']
    got=sha(p)
    doc=pymupdf.open(p)
    pages=len(doc)
    source_rows.append({'source_id':s['id'],'path':s['path'],'expected_sha256':s['sha256'],'actual_sha256':got,'expected_bytes':s['bytes'],'actual_bytes':p.stat().st_size,'expected_page_count':s['page_count'],'actual_page_count':pages,'pass':got==s['sha256'] and pages==s['page_count'] and p.stat().st_size==s['bytes']})
    doc.close()
# Original pages selected for direct page-level context/linkage and known-valid-continuation check.
selected={
 '9618_s25_qp_11':[7,15],
 '9618_s25_qp_12':[5,11],
 '9618_w25_qp_11':[7,11],
 '9618_w25_qp_12':[13,15],
 '9618_w25_qp_13':[3,5,9],
 '9618_w25_qp_13_q5_valid':[7,8],
 '9618_w25_ms_13':[12],
}
# 2025 source-id -> path metadata
source_by_id={s['id']:s for s in source_manifest['primary_sources'] if s.get('id','').startswith(('9618_s25_','9618_w25_'))}
render_rows=[]; transcript_rows=[]
for key, pages in selected.items():
    sid='9618_w25_qp_13' if key=='9618_w25_qp_13_q5_valid' else key
    sid='9618_w25_ms_13' if key=='9618_w25_ms_13' else sid
    s=source_by_id[sid]; pdf=workspace/s['path']; doc=pymupdf.open(pdf)
    for page_no in pages:
        page=doc[page_no-1]
        filename=f'{sid}-p{page_no:03d}.png'
        target=render_dir/filename
        pix=page.get_pixmap(matrix=pymupdf.Matrix(2,2),alpha=False)
        pix.save(target)
        text=page.get_text('text',sort=True)
        transcript_rows.append({'source_id':sid,'pdf_page_1_based':page_no,'text':text})
        render_rows.append({'source_id':sid,'pdf_path':s['path'],'pdf_page_1_based':page_no,'render_path':rel(target),'dpi':144,'width_px':pix.width,'height_px':pix.height,'sha256':sha(target),'original_pdf_sha256':s['sha256']})
    doc.close()
# Text evidence transcribed directly from original PDFs.
(out/'DIRECT_SOURCE_TEXT_V2.txt').write_text('\n\n'.join(f"=== {x['source_id']} p{x['pdf_page_1_based']} ===\n{x['text']}" for x in transcript_rows),encoding='utf-8')
# Pin/source/render evidence artifacts.
input_verification={'artifact':'B25 A4 v2 retest input verification','generated_local':'2026-09-21','dispatch_work_order_sha256':'13f618043e433f092255f2e83625ba70298bef2b9fce865dddf24934ae268ce0','candidate_snapshot_entries_declared':snap['file_count'],'candidate_snapshot_entries_verified':sum(x['pass'] for x in snapshot_rows),'candidate_snapshot_failures':[x for x in snapshot_rows if not x['pass']],'pin_count':len(pin_rows),'pins_passed':sum(x['pass'] for x in pin_rows),'pin_failures':[x for x in pin_rows if not x['pass']],'pins':pin_rows,'snapshot_verification':snapshot_rows,'source_pdf_count':len(source_rows),'source_pdf_pages_verified':sum(x['actual_page_count'] for x in source_rows),'source_pdfs':source_rows,'context_diffs_vs_v1':ctx_diffs}
(out/'INPUT_VERIFICATION_V2.json').write_text(json.dumps(input_verification,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
(out/'SOURCE_RENDER_MANIFEST_V2.json').write_text(json.dumps({'renderer':'PyMuPDF 1.28.2','render_dpi':144,'page_count':len(render_rows),'pages':render_rows},indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
# Contact sheets, four pages per sheet, preserve labels.
paths=[render_dir/r['render_path'].split('/')[-1] for r in render_rows]
for si in range(0,len(paths),4):
    group=paths[si:si+4]
    tiles=[]
    for p in group:
        im=Image.open(p).convert('RGB')
        im.thumbnail((760,1050))
        tile=Image.new('RGB',(780,1100),'white')
        tile.paste(im,((780-im.width)//2,35))
        d=ImageDraw.Draw(tile); d.text((12,8),p.stem,fill='black')
        tile=ImageOps.expand(tile,border=2,fill='#777777')
        tiles.append(tile)
    canvas=Image.new('RGB',(1568,2212),'#e8e8e8')
    for j,im in enumerate(tiles): canvas.paste(im,((j%2)*784,(j//2)*1106))
    target=sheet_dir/f'RETEST_PAGES_{si//4+1:02d}.jpg'
    canvas.save(target,quality=92)
# Write summary with exact aggregate checks only; no findings conclusion yet.
summary={
 'dispatch_pins_pass':all(x['pass'] for x in pin_rows),
 'snapshot_442_pass':len(snapshot_rows)==442 and all(x['pass'] for x in snapshot_rows),
 'source_12_178_pass':len(source_rows)==12 and sum(x['actual_page_count'] for x in source_rows)==178 and all(x['pass'] for x in source_rows),
 'context_diff_count':len(ctx_diffs),
 'context_diff_paths':[x['path'] for x in ctx_diffs],
 'direct_source_render_count':len(render_rows),
 'direct_source_renders':[{'source_id':r['source_id'],'page':r['pdf_page_1_based'],'sha256':r['sha256']} for r in render_rows]
}
(out/'RETEST_AUTOMATION_SUMMARY_V2.json').write_text(json.dumps(summary,indent=2)+'\n',encoding='utf-8')
print(json.dumps(summary,indent=2))
