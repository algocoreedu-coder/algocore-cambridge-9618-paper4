from pathlib import Path
import json,pymupdf
from PIL import Image,ImageDraw,ImageChops
S=Path(__file__).resolve().parents[1];E=S/'evidence'
x=json.loads((E/'A2_EQUIVALENCE.json').read_text(encoding='utf-8'));r={p['paper_id']:p for p in x['sources']}
pairs=[('9618_s22_41','9618_s22_43','ms',2),('9618_s23_41','9618_s23_43','ms',22),('9618_w21_41','9618_w21_42','qp',9)]
stats=[]
for a,b,k,n in pairs:
    imgs=[]
    for pid in [a,b]:
        doc=pymupdf.open(r[pid]['sources'][k]['source_path']);page=doc[n-1];pix=page.get_pixmap()
        im=Image.frombytes('RGB',[pix.width,pix.height],pix.samples);draw=ImageDraw.Draw(im)
        for mask in r[pid]['sources'][k]['pages'][n-1].get('masked_render',{}).get('identifier_masks',[]):draw.rectangle(mask['display_mask_pixels'],fill='white')
        im.save(E/f'A2_{pid}_{k}_{n}.png');imgs.append(im)
    diff=ImageChops.difference(*imgs);bbox=diff.getbbox()
    stats.append({'pair':[a,b],'kind':k,'pdf_page':n,'different_pixel_bbox':bbox})
    print(a,b,k,n,'diff_bbox',bbox)
    diff.save(E/f'A2_diff_{a}_{k}_{n}.png')
    if bbox:
        box=(max(0,bbox[0]-12),max(0,bbox[1]-12),min(imgs[0].width,bbox[2]+12),min(imgs[0].height,bbox[3]+12))
        for pid,im in zip([a,b],imgs):im.crop(box).resize(((box[2]-box[0])*2,(box[3]-box[1])*2)).save(E/f'A2_detail_{pid}_{k}_{n}.png')
(E/'A2_RENDER_DIFFS.json').write_text(json.dumps(stats,indent=2),encoding='utf-8')
