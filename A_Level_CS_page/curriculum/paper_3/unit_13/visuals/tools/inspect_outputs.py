from pathlib import Path
from PIL import Image,ImageOps,ImageDraw,ImageFont
import json, xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[1]
font=ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf',23)
layouts=json.loads((ROOT/'qa/layout.json').read_text(encoding='utf-8'))
overlaps=[];outputs=[]
for entry in layouts:
    labels=entry['labels']
    for i,a in enumerate(labels):
        for b in labels[i+1:]:
            iw=min(a['x']+a['width'],b['x']+b['width'])-max(a['x'],b['x'])
            ih=min(a['y']+a['size'],b['y']+b['size'])-max(a['y'],b['y'])
            if iw>4 and ih>4:overlaps.append({'id':entry['id'],'a':a['text'],'b':b['text'],'overlap':[round(iw,1),round(ih,1)]})
    n=entry['id'][-2:];file=ROOT/'png'/f'u13-v{n}.png';im=Image.open(file)
    assert im.mode=='RGBA',file
    assert im.getchannel('A').getextrema()==(0,255),file
    assert im.width==entry['width']*2 and im.height==entry['height']*2,file
    ET.parse(ROOT/'svg'/f'u13-v{n}.svg')
    outputs.append({'id':entry['id'],'png_width':im.width,'png_height':im.height,'transparent':True})
for start in range(0,40,8):
    sheet=Image.new('RGB',(1700,1400),'#edf1f4');draw=ImageDraw.Draw(sheet)
    for ix,entry in enumerate(layouts[start:start+8]):
        n=entry['id'][-2:];im=Image.open(ROOT/'png'/f'u13-v{n}.png')
        white=Image.new('RGBA',im.size,'white');white.alpha_composite(im)
        im=white.convert('RGB');im.thumbnail((790,282),Image.Resampling.LANCZOS)
        col=ix%2;row=ix//2;x=col*850+20;y=row*350+18
        draw.rounded_rectangle((x,y,x+810,y+320),radius=12,fill='white')
        draw.text((x+15,y+7),entry['id'],font=font,fill='#18364b')
        sheet.paste(im,(x+(810-im.width)//2,y+36+(282-im.height)//2))
    sheet.save(ROOT/'qa'/f'contact-{start+1:02d}-{start+8:02d}.jpg',quality=94)
# White-background previews are for checking and viewing on dark interfaces.
(ROOT/'preview').mkdir(exist_ok=True)
for n in [6,8,19,25,30,35,36]:
    im=Image.open(ROOT/'png'/f'u13-v{n:02d}.png');white=Image.new('RGBA',im.size,'white');white.alpha_composite(im)
    white.convert('RGB').save(ROOT/'preview'/f'u13-v{n:02d}.jpg',quality=95)
report={'count':len(outputs),'outputs':outputs,'potential_text_overlaps':overlaps}
(ROOT/'qa/technical_checks.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'count':len(outputs),'potential_text_overlaps':overlaps},ensure_ascii=True))
