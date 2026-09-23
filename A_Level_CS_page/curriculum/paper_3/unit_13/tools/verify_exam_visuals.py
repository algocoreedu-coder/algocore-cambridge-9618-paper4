"""Validate teaching numbers, transparent image exports, layout and map coverage."""
from pathlib import Path
from fractions import Fraction
from PIL import Image,ImageDraw,ImageFont
import json,re,xml.etree.ElementTree as ET

UNIT=Path(__file__).resolve().parents[1];ROOT=UNIT/'exam_visuals'
manifest=json.loads((ROOT/'visual_manifest.json').read_text(encoding='utf-8'))
layouts=json.loads((ROOT/'qa/layout.json').read_text(encoding='utf-8'))
assert len(manifest['visuals'])==len(layouts)==26
assert [v['number'] for v in manifest['visuals']]==list(range(41,67))
anchors={v['anchor'] for v in manifest['visuals']}
assert {f'exam-e{i:02}' for i in range(1,20)}|{f'exam-x{i:02}' for i in range(1,4)}<=anchors

def signed(bits):return int(bits,2)-(1<<len(bits) if bits[0]=='1' else 0)
def value(m,e):return Fraction(signed(m),1<<(len(m)-1))*Fraction(2)**signed(e)
expected={54:[Fraction(-13,2)],55:[Fraction(-1,2),Fraction(-1,2)],56:[Fraction(-5,32)],57:[Fraction(3),Fraction(3)],58:[Fraction(3,32)],59:[Fraction(-128),Fraction(-65,32768),Fraction(1,512),Fraction(127)],66:[Fraction(-13,2)]}
pairs=[];overlaps=[];outputs=[]
for v,l in zip(manifest['visuals'],layouts):
    assert v['id']==l['id']
    svg=ET.parse(ROOT/v['svg'])
    assert svg.getroot().get('viewBox')
    im=Image.open(ROOT/v['png'])
    assert im.mode=='RGBA' and im.getchannel('A').getextrema()==(0,255),v['id']
    assert im.size==(v['svg_width']*2,v['svg_height']*2),v['id']
    for index,p in enumerate(l['float_pairs']):
        actual=value(p['mantissa'],p['exponent'])
        assert actual==expected[v['number']][index],(v['id'],actual)
        if not(v['number']==55 and index==0) and not(v['number']==57 and index==0):
            assert p['mantissa'][:2] in ['01','10'],v['id']
        pairs.append({'id':v['id'],**p,'value':str(actual)})
    for i,a in enumerate(l['labels']):
        for b in l['labels'][i+1:]:
            iw=min(a['x']+a['width'],b['x']+b['width'])-max(a['x'],b['x'])
            ih=min(a['y']+a['size'],b['y']+b['size'])-max(a['y'],b['y'])
            if iw>4 and ih>4:overlaps.append({'id':v['id'],'a':a['text'],'b':b['text'],'overlap':[round(iw,1),round(ih,1)]})
    outputs.append({'id':v['id'],'width':im.width,'height':im.height,'transparent':True})

assert 1030==343*3+1 and 1030%3==1 and 4096+1*64==4160
assert 27%10==37%10==7
assert int('01110001',2)==113 and int('01110010',2)==114
assert Fraction(455,4)==Fraction(int('111000111',2),4)
assert Fraction(455,4)-113==Fraction(3,4) and 114-Fraction(455,4)==Fraction(1,4)
assert 100*2>127 and Fraction(1,1024)<Fraction(1,512)
assert [k for k in [12,18,25,31] if k<=25]==[12,18,25]
assert 16-12==4 and 16-10==6

font=ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf',24)
for start in range(0,26,6):
    batch=manifest['visuals'][start:start+6]
    sheet=Image.new('RGB',(1800,1350),'#eaf0f3');draw=ImageDraw.Draw(sheet)
    for ix,v in enumerate(batch):
        im=Image.open(ROOT/v['png']);bg=Image.new('RGBA',im.size,'white');bg.alpha_composite(im)
        thumb=bg.convert('RGB');thumb.thumbnail((842,375),Image.Resampling.LANCZOS)
        x=(ix%2)*900+15;y=(ix//2)*450+12
        draw.rectangle((x,y,x+870,y+425),fill='white')
        draw.text((x+15,y+8),v['id']+' · '+v['anchor'],font=font,fill='#18364b')
        sheet.paste(thumb,(x+(870-thumb.width)//2,y+45+(375-thumb.height)//2))
    sheet.save(ROOT/'qa'/f'contact-{start+41}-{start+40+len(batch)}.jpg',quality=94)

report={'status':'passed' if not overlaps else 'layout_review_needed','visual_count':26,'core_patterns_illustrated':19,'crossover_patterns_illustrated':3,'drawn_float_pairs':pairs,'other_numeric_checks':['MOD and address','collision keys','113.75 truncation and rounding','range boundaries','sequential stop','bit allocation'],'outputs':outputs,'potential_text_overlaps':overlaps}
(ROOT/'qa/technical_checks.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'visual_count':26,'float_pairs_checked':len(pairs),'potential_text_overlaps':overlaps},ensure_ascii=True))
