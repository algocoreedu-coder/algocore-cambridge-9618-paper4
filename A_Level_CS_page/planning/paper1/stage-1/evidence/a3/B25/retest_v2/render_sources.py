from pathlib import Path
import json, hashlib, subprocess, re
from pypdf import PdfReader
from PIL import Image, ImageOps, ImageDraw, ImageFont
root=Path.cwd()
stage=root/'A_Level_CS_page/planning/paper1/stage-1'
out=stage/'evidence/a3/B25/retest_v2'
cand=stage/'evidence/a2/B25/versions/B25-A2-v2'
source_root=root
render_root=out/'source_renders'
low=render_root/'all_pages_100dpi'; low.mkdir(parents=True,exist_ok=True)
contact=render_root/'contact_sheets'; contact.mkdir(parents=True,exist_ok=True)
target=render_root/'target_full_240dpi'; target.mkdir(parents=True,exist_ok=True)
manifest=json.loads((cand/'BATCH_MANIFEST.json').read_text(encoding='utf-8'))
# Direct target pages: ten previously false additions, Q8 p15 retained context, W25/13 Q5 p7-8 retained, p9 excluded.
target_pages={
 '9618_s25_qp_11':[7,15], '9618_s25_qp_12':[5,11],
 '9618_w25_qp_11':[7,11], '9618_w25_qp_12':[13,15], '9618_w25_qp_13':[3,5,9]
}
# Include every prior false finding page and controls; full-size target pages rendered afresh from pinned originals.
results=[]
for src in manifest['source_validation']['checks']:
    pdf=root/src['relative_path']
    raw=pdf.read_bytes(); sha=hashlib.sha256(raw).hexdigest(); reader=PdfReader(str(pdf)); page_count=len(reader.pages)
    assert sha==src['sha256_expected'] and page_count==src['page_count_expected'], (src['source_id'],sha,page_count)
    prefix=low/src['source_id']
    cmd=['pdftoppm','-png','-r','100',str(pdf),str(prefix)]
    subprocess.run(cmd,check=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    imgs=sorted(low.glob(src['source_id']+'-*.png'), key=lambda p:int(re.search(r'-(\d+)\.png$',p.name).group(1)))
    assert len(imgs)==page_count,(src['source_id'],len(imgs),page_count)
    # Contact sheet at legible thumbnail size, with exact 1-based PDF page labels.
    tile_w,tile_h,label_h,cols=420,560,34,3
    rows=(len(imgs)+cols-1)//cols
    sheet=Image.new('RGB',(cols*tile_w,rows*(tile_h+label_h)),(238,240,243))
    draw=ImageDraw.Draw(sheet)
    for i,img_path in enumerate(imgs):
        page_num=int(re.search(r'-(\d+)\.png$',img_path.name).group(1))
        im=Image.open(img_path).convert('RGB')
        im.thumbnail((tile_w-10,tile_h-10))
        x=(i%cols)*tile_w; y=(i//cols)*(tile_h+label_h)
        draw.rectangle((x,y,x+tile_w-1,y+label_h-1),fill=(35,49,70))
        draw.text((x+10,y+8),f"{src['source_id']} | PDF p. {page_num}",fill='white')
        sheet.paste(im,(x+(tile_w-im.width)//2,y+label_h+(tile_h-im.height)//2))
        sheet_hash=hashlib.sha256(img_path.read_bytes()).hexdigest()
        # page render evidence inventory
        if 'page_renders' not in locals(): page_renders=[]
        page_renders.append({'source_id':src['source_id'],'pdf_page_1_based':page_num,'path':str(img_path.relative_to(out)).replace('\\','/'),'sha256':sheet_hash,'dimensions_px':list(Image.open(img_path).size),'dpi':100})
    sheet_path=contact/f"{src['source_id']}-contact.png"; sheet.save(sheet_path,optimize=True)
    # Full-size render requested context pages only; page list defined above.
    if src['source_id'] in target_pages:
        for pnum in target_pages[src['source_id']]:
            prefix_t=target/f"{src['source_id']}-p{pnum:02d}"
            subprocess.run(['pdftoppm','-png','-r','240','-f',str(pnum),'-l',str(pnum),str(pdf),str(prefix_t)],check=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
            outs=sorted(target.glob(prefix_t.name+'-*.png'))
            assert len(outs)==1,(prefix_t,outs)
            img=outs[0]
            if 'target_renders' not in locals(): target_renders=[]
            target_renders.append({'source_id':src['source_id'],'pdf_page_1_based':pnum,'path':str(img.relative_to(out)).replace('\\','/'),'sha256':hashlib.sha256(img.read_bytes()).hexdigest(),'dimensions_px':list(Image.open(img).size),'dpi':240})
    results.append({'source_id':src['source_id'],'relative_path':src['relative_path'],'sha256_expected':src['sha256_expected'],'sha256_actual':sha,'page_count_expected':src['page_count_expected'],'page_count_actual':page_count,'matches':sha==src['sha256_expected'] and page_count==src['page_count_expected'],'contact_sheet_path':str(sheet_path.relative_to(out)).replace('\\','/'),'contact_sheet_sha256':hashlib.sha256(sheet_path.read_bytes()).hexdigest()})
evidence={'schema_version':'1.0','artifact_version':'B25-A3-RETEST-v2','source_count':len(results),'total_pages':sum(x['page_count_actual'] for x in results),'all_sources_match_candidate_and_stage0':all(x['matches'] for x in results),'sources':results,'page_render_count':len(page_renders),'page_renders':page_renders,'full_size_target_render_count':len(target_renders),'full_size_target_renders':target_renders,'contact_sheet_count':len(results),'contact_sheet_visual_screening':'pending human visual inspection'}
(out/'SOURCE_RENDER_EVIDENCE_V2.json').write_text(json.dumps(evidence,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'source_count':len(results),'total_pages':evidence['total_pages'],'contact_sheets':len(results),'page_renders':len(page_renders),'full_size_target_renders':len(target_renders),'target_pages':[(x['source_id'],x['pdf_page_1_based']) for x in target_renders]},indent=2))
