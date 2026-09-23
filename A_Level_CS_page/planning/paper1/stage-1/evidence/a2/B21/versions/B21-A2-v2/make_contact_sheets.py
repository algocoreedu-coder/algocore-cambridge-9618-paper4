"""Create internal contact sheets for visual review of already-rendered risk pages."""
import sys
from pathlib import Path

base = Path(__file__).resolve().parent
sys.path.insert(0, str(base / "vendor"))
from PIL import Image, ImageDraw

files = sorted((base / "renders").glob("*.png"))
out = base / "review_sheets"; out.mkdir(exist_ok=True)
for start in range(0, len(files), 4):
    chosen = files[start:start+4]
    thumbs=[]
    for p in chosen:
        im=Image.open(p).convert("RGB")
        im.thumbnail((900,1200))
        canvas=Image.new("RGB", (920,1240), "white")
        canvas.paste(im,((920-im.width)//2,30))
        ImageDraw.Draw(canvas).text((10,10),p.name,fill="black")
        thumbs.append(canvas)
    sheet=Image.new("RGB",(1840,2480),"#ddd")
    for i,im in enumerate(thumbs): sheet.paste(im,((i%2)*920,(i//2)*1240))
    sheet.save(out/f"risk-review-{start//4+1:02}.jpg",quality=90)
