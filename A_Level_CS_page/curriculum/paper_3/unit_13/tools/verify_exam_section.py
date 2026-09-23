"""Verify section topology, local references, source integrity and worked examples."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import unquote, urlsplit
from fractions import Fraction
import hashlib, json, re
import pymupdf

ROOT=Path(__file__).resolve().parents[1]
class Links(HTMLParser):
    def __init__(self,text):
        super().__init__();self.ids=[];self.links=[];self.feed(text)
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if 'id' in a:self.ids.append(a['id'])
        if tag=='a' and 'href' in a:self.links.append(a['href'])

text=(ROOT/'EXAM_PATTERNS.md').read_text(encoding='utf-8')
cards=re.split(r'^### (?=[EX]\d\d —)',text,flags=re.M)[1:]
assert len(cards)==22
assert len(re.findall(r'^E\d\d —', '\n'.join(cards),re.M))==19
for card in cards:
    assert all(word in card for word in ['**Nhận diện:**','**Giải nhanh:**','**Giữ điểm:**','STUDENT_GUIDE.md#theory-','_qp_','_ms_']),card[:50]

register=json.loads((ROOT/'EXAM_SOURCE_REGISTER.json').read_text(encoding='utf-8'))
assert len(register['files'])==30
for item in register['files']:
    p=ROOT/item['local_path']
    assert hashlib.sha256(p.read_bytes()).hexdigest()==item['sha256']
    assert hashlib.sha256(Path(item['original_path']).read_bytes()).hexdigest()==item['sha256']

pdf_links=0;theory_links=0;html_results=[]
for name in ['EXAM_PATTERNS.html','STUDENT_HANDBOOK.html','TEACHER_HANDBOOK.html']:
    parsed=Links((ROOT/name).read_text(encoding='utf-8'))
    assert len(parsed.ids)==len(set(parsed.ids)),f'Duplicate IDs: {name}'
    assert all(f'exam-e{i:02}' in parsed.ids for i in range(1,20))
    assert all(f'exam-x{i:02}' in parsed.ids for i in range(1,4))
    for href in parsed.links:
        u=urlsplit(href)
        if u.scheme or u.netloc:continue
        p=ROOT/unquote(u.path) if u.path else ROOT/name
        assert p.exists(),(name,href)
        if u.fragment.startswith('page='):
            with pymupdf.open(p) as d:assert 1<=int(u.fragment[5:])<=len(d),(name,href)
            pdf_links+=1
        elif u.fragment and p.suffix=='.html':
            target=parsed if p.name==name else Links(p.read_text(encoding='utf-8'))
            assert unquote(u.fragment) in target.ids,(name,href)
            if u.fragment.startswith('theory-'):theory_links+=1
    html_results.append({'name':name,'ids':len(parsed.ids),'links':len(parsed.links)})

# Semantic checks on references that previously pointed to a neighbouring question.
for name,page,term in [('9618_s23_ms_32.pdf',7,'6(b)'),('9618_w24_ms_32.pdf',5,'2(a)'),('9618_s24_qp_31.pdf',4,'sequential method'),('9618_s24_ms_32.pdf',5,'3(b)')]:
    with pymupdf.open(ROOT/'exam_sources'/name) as d:assert term in d[page-1].get_text()

assert Fraction(-104,128)*8==Fraction(-13,2)
assert Fraction(-80,128)*Fraction(1,4)==Fraction(-5,32)
assert Fraction(3,32)==Fraction(3,4)*Fraction(1,8)
assert Fraction(127,128)*128==127
assert Fraction(1,2)*Fraction(1,256)==Fraction(1,512)
assert 100*2>127 and Fraction(1,512)/2<Fraction(1,512)
report={'status':'passed','core_patterns':19,'crossover_patterns':3,'source_pairs':15,'source_pdf_files':30,'source_hashes_match':True,'pdf_page_links_checked':pdf_links,'theory_links_checked':theory_links,'worked_examples_checked':6,'html':html_results}
(ROOT/'qa/exam_section_checks.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps(report))
