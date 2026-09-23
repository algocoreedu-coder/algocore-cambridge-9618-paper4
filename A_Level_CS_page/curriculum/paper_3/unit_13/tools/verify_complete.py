"""Independent arithmetic, evidence and deliverable checks for edition 3."""
from pathlib import Path
from fractions import Fraction as F
from html.parser import HTMLParser
import importlib.util,json,re,xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('lab_answers',ROOT/'labs/reference_solutions.py')
lab=importlib.util.module_from_spec(spec);spec.loader.exec_module(lab)
def signed(bits):return int(bits,2)-(2**len(bits) if bits[0]=='1' else 0)
def decode(m,e):return F(signed(m),2**(len(m)-1))*F(2)**signed(e)
cases=[
 ('01101000','00000011',F(13,2)),('01011010','00000100',F(45,4)),
 ('10110000','11111110',F(-5,32)),('01011000','00000011',F(11,2)),
 ('01011000','11111110',F(11,64)),('101111010000','000100',F(-67,8)),
 ('1011000000000000','11111110',F(-5,32)),
 ('00011000','11111110',F(3,64)),('01100000','11111100',F(3,64)),
 ('11110000','11111111',F(-1,16)),('10000000','11111100',F(-1,16)),
 ('0111111111','011111',F(511,512)*2**31),('0100000000','100000',F(1,2**33)),
 ('1000000000','011111',F(-2**31)),('1011111111','100000',F(-257,512)*F(2)**-32),
 ('0101110000','000010',F(23,8)),('0101110001','000010',F(369,128)),
 ('1010101000','000011',F(-43,8)),('1010100111','000011',F(-345,64)),
 ('01100110','1101',F(51,512)),('010010100000','000100',F(37,4)),
 ('10101000','00000011',F(-11,2))]
source='\n'.join((ROOT/n).read_text(encoding='utf-8') for n in ['STUDENT_GUIDE.md','EXTENDED_PRACTICE.md','EXTENDED_ANSWERS.md','BOOK_ACTIVITY_MAP.md'])
for m,e,want in cases:
    assert decode(m,e)==want,(m,e,want)
    assert m in source and e in source,(m,e)
assert F(72,25)-F(23,8)==F(1,200)
assert F(369,128)-F(72,25)==F(9,3200)
assert abs(F(-269,50)-F(-43,8))==F(1,200)
assert abs(F(-269,50)-F(-345,64))==F(17,1600)
assert 500+(9354%1000)*5==2270 and 500+355*5==2275
assert F(12,2400)*100==F(1,2)
# Separate derivation of nearest mantissa, including sign.
assert round(F(72,25)/4*512)==369
assert round(F(-269,50)/8*512)==-344
assert (F(-269,50)/8*512).__floor__()==-345

candidates=lab.representations()
v=lab.nearest(F(1,10),candidates)
assert v==(F(51,512),'01100110','1101')
exact=[i*v[0] for i in (1,2,3)]
assert exact==[F(51,512),F(51,256),F(153,512)]
total=F(0);rounded=[]
for _ in range(3):total=lab.nearest(total+v[0],candidates)[0];rounded.append(total)
assert rounded==[F(51,512),F(51,256),F(19,64)]
assert 3*v[0]-F(3,10)==F(-3,2560)
outputs={'lab1':lab.lab1(),'lab2':lab.lab2(),'lab3':lab.lab3()}
assert outputs['lab1']['union']==[1,3,4,5] and outputs['lab1']['intersection']==[3,5]
assert outputs['lab1']['difference']==[1] and outputs['lab1']['after_duplicate']==[1,3,5]
assert outputs['lab2']['hashes'][0]['address']==4640
assert outputs['lab2']['find_CA']==[2,3]
for invalid in ['', 'A'*11, '\u0103']:
    try:lab.hash_name(invalid)
    except ValueError:pass
    else:raise AssertionError(invalid)
assert lab.hash_name('A')['slot']==65 and lab.hash_name('A'*10)['total']==650
(ROOT/'labs/reference_results.json').write_text(json.dumps(outputs,ensure_ascii=False,indent=2),encoding='utf-8')

svg=ET.parse(ROOT/'visuals/svg/u13-v36.svg')
labels=[t.text or '' for t in svg.iter('{http://www.w3.org/2000/svg}text')]
assert '0.1 → 0.099609375' in labels and 'Input rounded once; sums computed exactly' in labels
for text in ['0.099609375','0.19921875','0.298828125','-0.001171875']:assert text in labels
assert not any('0.1015625' in t for t in labels)
layout=json.loads((ROOT/'visuals/qa/layout.json').read_text(encoding='utf-8'))
assert next(x for x in layout if x['id']=='U13-V36')['float_pairs']==[{'mantissa':'01100110','exponent':'1101'}]
numeric=json.loads((ROOT/'visuals/qa/numeric_checks.json').read_text(encoding='utf-8'))
assert len(numeric['drawn_float_pairs'])==20
extended=(ROOT/'EXTENDED_PRACTICE.md').read_text(encoding='utf-8')
answers=(ROOT/'EXTENDED_ANSWERS.md').read_text(encoding='utf-8')
assert re.findall(r'^\*\*(\d+)\.',extended,re.M)==[str(i) for i in range(29,49)]
assert re.findall(r'^\*\*(\d+)\.',answers,re.M)==[str(i) for i in range(29,49)]
basic=(ROOT/'PRACTICE.md').read_text(encoding='utf-8')
assert re.findall(r'^(\d+)\. ',basic,re.M)==[str(i) for i in range(1,29)]
review=(ROOT/'BOOK_ALIGNMENT_REVIEW.md').read_text(encoding='utf-8')
rows=re.findall(r'^\| ([TFR]\d\d) \|.*\| ([01](?:\.5)?) \|$',review,re.M)
assert len(rows)==46 and sum(float(v) for _,v in rows)==46

class Reader(HTMLParser):
    def __init__(self):super().__init__();self.figures=0;self.ids=[];self.links=[];self.images=0;self.sections=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if 'id' in a:self.ids.append(a['id'])
        if tag=='a' and a.get('href','').startswith('#'):self.links.append(a['href'][1:])
        if tag=='figure':self.figures+=1
        if tag=='img':assert a['src'].startswith('data:image/png;base64,');self.images+=1
        if tag=='section' and 'data-source' in a:self.sections.append(a['data-source'])
for name in ['STUDENT_HANDBOOK.html','TEACHER_HANDBOOK.html']:
    r=Reader();r.feed((ROOT/name).read_text(encoding='utf-8'))
    assert r.figures==r.images==66,(name,r.figures)
    assert len(r.ids)==len(set(r.ids)),name
    assert all(x in r.ids for x in r.links),name
    if name.startswith('STUDENT'):assert not any('ANSWERS' in x for x in r.sections)

report={'edition':3,'date':'2026-09-15','status':'passed','coverage_criteria':46,'coverage_points':46,
        'coverage_percent':100,'extended_numeric_cases':len(cases),'visual_float_pairs':20,
        'v36_nearest_candidates':len(candidates)-1,'v36_mantissa':v[1],'v36_exponent':v[2],
        'v36_value':float(v[0]),'round_each_third_sum':float(rounded[-1]),
        'practice_questions':48,'extended_practice_marks':100,'labs_checked':3,
        'handbooks_checked':2,'embedded_figures_each':66,'theory_figures':40,'exam_figures':26,
        'meaning':'100% coverage of the documented 46-item Chapter 13 checklist; not an exam score guarantee.'}
(ROOT/'BOOK_ALIGNMENT_CHECKS.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report))
