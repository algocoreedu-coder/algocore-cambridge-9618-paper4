"""Compile readable offline handbooks. All teaching diagrams are embedded."""
from pathlib import Path
from html import escape
import base64,json,re,zipfile
import markdown
ROOT=Path(__file__).resolve().parents[1]
visuals=json.loads((ROOT/'visuals/visual_manifest.json').read_text(encoding='utf-8'))['visuals']
exam_visuals=json.loads((ROOT/'exam_visuals/visual_manifest.json').read_text(encoding='utf-8'))['visuals']
exam_by_png={v['png'].split('/')[-1]:v for v in exam_visuals}
groups={'1.1':[1,2,3,4],'1.2':[5],'1.3':[6,7],'1.4':[8,9],'1.5':[10,11],'1.6':[12],
        '2.1':[13,14,15,16],'2.2':[17,18],'2.3':[19,20],'2.4':[21,22,23],
        '3.1':[24,25],'3.2':[26,27,28],'3.3':[29],'3.4':[30,31],'3.5':[32,33],
        '3.6':[34,35,36],'3.7':[37,38],'4':[39,40]}
def figure(n):
    v=visuals[n-1];raw=(ROOT/'visuals'/v['png']).read_bytes()
    data='data:image/png;base64,'+base64.b64encode(raw).decode()
    return f'<figure id="visual-{n:02d}"><img src="{data}" alt="{escape(v["visual_content"])}" width="{v["svg_width"]}" height="{v["svg_height"]}"><figcaption>{v["id"]} · {escape(v["title"])}</figcaption></figure>'
def convert(text,prefix):
    html=markdown.markdown(text,extensions=['tables','fenced_code','toc'],extension_configs={'toc':{'permalink':False}})
    def embed_exam(match):
        v=exam_by_png[match.group(2)]
        data='data:image/png;base64,'+base64.b64encode((ROOT/'exam_visuals'/v['png']).read_bytes()).decode()
        return f'<figure id="exam-visual-{v["number"]}"><img src="{data}" alt="{escape(v["visual_content"])}" width="{v["svg_width"]}" height="{v["svg_height"]}"><figcaption>{v["id"]} · {escape(v["title"])} · <a href="exam_visuals/{v["png"]}">Mở PNG đầy đủ</a> · <a href="exam_visuals/{v["svg"]}">SVG</a></figcaption></figure>'
    html=re.sub(r'<p><img alt="([^"]*)" src="exam_visuals/png/([^"]+)" /></p>',embed_exam,html)
    ids=re.findall(r'\bid="([^"]+)"',html)
    for old in ids:
        if old.startswith(('theory-','exam-')):continue
        html=html.replace(f'id="{old}"',f'id="{prefix}-{old}"').replace(f'href="#{old}"',f'href="#{prefix}-{old}"')
    html=re.sub(r'<table>(.*?)</table>',r'<div class="table-wrap"><table>\1</table></div>',html,flags=re.S)
    return html
def article(name,idx):
    text=(ROOT/name).read_text(encoding='utf-8')
    if name!='STUDENT_GUIDE.md':return convert(text,f'd{idx}')
    out=[]
    for k,part in enumerate(re.split(r'(?=^#{2,3} )',text,flags=re.M)):
        out.append(convert(part,f'd{idx}s{k}'))
        m=re.match(r'### (\d\.\d)|## (4)\.',part)
        if m:
            key=m.group(1) or m.group(2)
            out.extend(figure(n) for n in groups.get(key,[]))
    return ''.join(out)

student=[('PREREQUISITES.md','Ôn kiến thức AS'),('STUDENT_GUIDE.md','Bài học và 40 visual'),
         ('EXAM_PATTERNS.md','13.4 · Dạng bài trong đề thi'),
         ('PRACTICE.md','Câu 1–28'),('EXTENDED_PRACTICE.md','Câu 29–48'),('LABS.md','Ba bài thực hành'),('REVISION.md','Phiếu ôn tập')]
teacher=student+[('TEACHER_GUIDE.md','Kế hoạch dạy và chấm'),('ANSWERS.md','Đáp án 1–28'),
                 ('EXTENDED_ANSWERS.md','Đáp án 29–48'),('BOOK_ACTIVITY_MAP.md','Bản đồ sách'),
                 ('SOURCES_AND_TEACHER_NOTES.md','Nguồn và đề thi'),('EXAM_SOURCE_REGISTER.md','Nguồn của mục 13.4'),('BOOK_ALIGNMENT_REVIEW.md','Đối chiếu 46 tiêu chí')]
css='''*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:#eef3f5;color:#18364b;font:17px/1.7 "Segoe UI",sans-serif}
a{color:#007b80;text-underline-offset:3px}aside{position:fixed;width:255px;inset:0 auto 0 0;padding:25px 22px;background:#18364b;color:white;overflow:auto}aside a{color:#ddf2f0;display:block;padding:8px 0;text-decoration:none;font-size:15px}aside b{font-size:21px}aside small{display:block;margin:15px 0;color:#b9d2dc}main{max-width:1100px;margin-left:285px;padding:30px 42px 70px;background:white;min-height:100vh}.cover{padding:26px 0 34px;border-bottom:4px solid #007f83}.eyebrow{color:#007f83;font-weight:700;letter-spacing:.06em}h1{line-height:1.25;font-size:32px}h2{font-size:27px;margin-top:38px;border-bottom:1px solid #cddde3;padding-bottom:9px}h3{font-size:23px;margin-top:30px;color:#006f74}h1,h2,h3{scroll-margin-top:20px}a[id]{scroll-margin-top:140px}section.book-part{padding-top:30px;margin-top:30px;border-top:3px solid #d9e7eb}p,li{max-width:95ch}li{margin:5px 0}.table-wrap{overflow-x:auto;margin:20px 0}table{width:100%;border-collapse:collapse;font-size:15px;line-height:1.5}td,th{padding:10px 12px;vertical-align:top;border:1px solid #cadbe1}th{background:#eaf5f4;text-align:left}tr:nth-child(even) td{background:#f8fafb}pre{padding:18px 20px;background:#f0f5f7;border-left:4px solid #007f83;overflow:auto;line-height:1.55;font-size:15px}code{font-family:Consolas,monospace;font-size:.94em}p code,li code{background:#eef4f6;padding:1px 3px}figure{margin:28px 0 36px;padding:18px 0;border-top:1px solid #d8e5e9;border-bottom:1px solid #d8e5e9}figure img{display:block;width:100%;height:auto;max-height:720px;object-fit:contain;background:white}figcaption{font-size:14px;color:#586f7b;margin-top:12px}.badges{display:flex;gap:10px;flex-wrap:wrap}.badges span{padding:5px 12px;border-radius:5px;background:#eaf5f4;color:#007378;font-size:14px}button{font:inherit;border:0;border-radius:5px;padding:8px 18px;background:#007f83;color:white;cursor:pointer;margin-top:18px}.screen-note{font-size:14px;color:#586f7b}blockquote{margin:20px 0;padding:8px 20px;background:#fff1e2;border-left:4px solid #b85b16}
@media(max-width:950px){aside{position:static;width:auto}aside nav{display:flex;gap:12px;flex-wrap:wrap}aside a{padding:3px 0}main{margin:0;padding:22px}h1{font-size:28px}}
@media print{@page{size:A4;margin:15mm}body,main{background:white;font-size:10.5pt;line-height:1.5}aside,button,.screen-note{display:none}main{margin:0;padding:0;max-width:none}.cover{break-after:page}section.book-part{break-before:page;margin:0;padding:0;border:0}h1{font-size:23pt}h2{font-size:18pt}h3{font-size:14pt}h1,h2,h3{break-after:avoid}pre{white-space:pre-wrap;overflow:visible;font-size:9pt;break-inside:avoid}table{font-size:9pt}tr,figure{break-inside:avoid}thead{display:table-header-group}.table-wrap{overflow:visible}figure img{max-height:175mm}a{color:inherit;text-decoration:none}p{orphans:3;widows:3}}
'''
for role,items,filename in [('Học viên',student,'STUDENT_HANDBOOK.html'),('Giáo viên',teacher,'TEACHER_HANDBOOK.html')]:
    lookup={name:f'#part-{i}' for i,(name,_) in enumerate(items)}
    nav=''.join(f'<a href="#part-{i}">{escape(label)}</a>' for i,(_,label) in enumerate(items))
    body=[]
    for i,(name,label) in enumerate(items):
        content=article(name,i)
        content=re.sub(r'href="STUDENT_GUIDE\.md#(theory-[^"]+)"',r'href="#\1"',content)
        for target,anchor in lookup.items():content=content.replace(f'href="{target}"',f'href="{anchor}"')
        body.append(f'<section class="book-part" id="part-{i}" data-source="{name}">{content}</section>')
    html=f'''<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Chapter13 · {role} · A Level CS</title><style>{css}</style></head><body>
<aside><b>Chapter13</b><small>DATA REPRESENTATION<br>BẢN {role.upper()}</small><nav>{nav}</nav><button onclick="window.print()">In tài liệu</button></aside><main>
<header class="cover"><p class="eyebrow">A LEVEL COMPUTER SCIENCE · PAPER3</p><h1>Chapter13<br>Data Representation</h1><p>Bản {role.lower()} · Tài liệu giảng dạy và ôn tập · Phiên bản2</p><div class="badges"><span>3 phần kiến thức</span><span>40 hình minh họa</span><span>48 câu luyện chính</span><span>3 lab</span></div><p>Hiểu kiểu dữ liệu, tổ chức tệp và biểu diễn floating-point; luyện giải thích, truy vết và tính toán theo từng bước.</p><p class="screen-note">Ảnh đã nhúng để đọc offline. Dùng mục lục để chuyển phần; Ctrl+F để tìm thuật ngữ. Nút In cho phép in hoặc lưu PDF bằng trình duyệt.</p></header>
{''.join(body)}<footer><p>Biên soạn lại từ nguồn và ví dụ đã đối chiếu; dùng cùng QP/MS đúng năm thi. Đây là tài liệu Chapter13, không phải tài liệu do Cambridge phát hành.</p></footer></main></body></html>'''
    html=html.replace('Chapter13','Chapter 13').replace('PAPER3','PAPER 3').replace('Phiên bản2','Phiên bản 3').replace('<span>3 lab</span>','<span>3 lab</span><span>13.4 · 22 dạng bài thi</span>')
    html=html.replace('<span>40 hình minh họa</span>','<span>40 hình lý thuyết + 26 hình giải đề</span>')
    (ROOT/filename).write_text(html,encoding='utf-8')

content=convert((ROOT/'EXAM_PATTERNS.md').read_text(encoding='utf-8'),'exam')
content=content.replace('href="STUDENT_GUIDE.md#','href="STUDENT_HANDBOOK.html#')
nav=''.join(f'<a href="#exam-{code.lower()}">{escape(code+" · "+title)}</a>' for code,title in re.findall(r'^### ([EX]\d{2}) — (.+)$',(ROOT/'EXAM_PATTERNS.md').read_text(encoding='utf-8'),re.M))
(ROOT/'EXAM_PATTERNS.html').write_text(f'<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>13.4 · Chapter 13 in Past Papers</title><style>{css}</style></head><body><aside><b>13.4 · Past Papers</b><small>19 dạng cốt lõi · 3 giao thoa</small><nav>{nav}</nav><a href="STUDENT_HANDBOOK.html">Mở toàn bộ bài học</a><button onclick="window.print()">In tài liệu</button></aside><main>{content}</main></body></html>',encoding='utf-8')

def package():
    target=ROOT/'chapter-13-teaching-revision.zip'
    with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED) as z:
        for p in sorted(ROOT.rglob('*')):
            if not p.is_file():continue
            rel=p.relative_to(ROOT)
            if any(x in rel.parts for x in ['__pycache__','preview','audit']):continue
            if p.suffix=='.zip':
                if rel.as_posix() in ['exam_visuals/chapter-13-4-visuals.zip','visuals/chapter-13-visuals.zip']:z.write(p,rel)
                continue
            if 'qa' in rel.parts and p.suffix in ('.jpg','.png'):continue
            if p.suffix in ['.md','.html','.json','.py','.cjs','.svg','.png','.pdf']:z.write(p,rel)
    with zipfile.ZipFile(target) as z:assert z.testzip() is None
    return target.stat().st_size
print(json.dumps({'handbooks':2,'exam_guide':1,'embedded_visuals_per_book':40+len(exam_visuals),'exam_visuals':len(exam_visuals),'zip_bytes':package()}))
