"""Make non-public contact sheets of the rendered visual-risk pages for inspection."""
from pathlib import Path
import json
from PIL import Image, ImageDraw

OUT=Path(__file__).resolve().parent
regions=json.loads((OUT/'VISUAL_MANIFEST.json').read_text(encoding='utf-8'))
by={}
for r in regions: by.setdefault(r['source_id'],[]).append(r)
contacts=OUT/'renders'/'risk_contacts'; contacts.mkdir(exist_ok=True)
for sid,rs in by.items():
    for start in range(0,len(rs),4):
        group=rs[start:start+4]
        canvas=Image.new('RGB',(1400,2020),'white')
        for i,r in enumerate(group):
            im=Image.open(OUT/r['rendered_asset_ref']).convert('RGB'); im.thumbnail((680,950))
            x=(i%2)*700+(700-im.width)//2; y=(i//2)*1010+35
            canvas.paste(im,(x,y)); ImageDraw.Draw(canvas).text((x, y+im.height+5),r['id'],fill='black')
        canvas.save(contacts/f'{sid}-risk-{start//4+1:02d}.jpg',quality=88)
