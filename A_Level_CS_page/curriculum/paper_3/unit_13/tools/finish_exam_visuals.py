"""Publish the visual inventory/gallery and integrate diagrams into the editable guide."""
from pathlib import Path
from html import escape
import json,re,zipfile

UNIT=Path(__file__).resolve().parents[1];ROOT=UNIT/'exam_visuals'
manifest=json.loads((ROOT/'visual_manifest.json').read_text(encoding='utf-8'))
visuals=manifest['visuals']
rows=[];cards=[]
for v in visuals:
    code=v['anchor'].replace('exam-','').upper()
    label={'START':'Nhận diện','REVIEW':'Kiểm tra'}.get(code,code)
    rows.append(f'| {v["id"]} | {label} | {v["title"]} | {v["visual_content"]} | [PNG]({v["png"]}) · [SVG]({v["svg"]}) |')
    refs=' · '.join(f'<a href="../{escape(ref)}">{escape(ref.split("/")[-1].replace(".pdf#page=", " · tr. "))}</a>' for ref in v['exam_references'])
    cards.append(f'<article id="{v["id"]}"><header><span>{v["id"]} · {label}</span><h2>{escape(v["title"])}</h2></header><a class="image-link" href="{v["png"]}"><img src="{v["png"]}" width="{v["svg_width"]}" height="{v["svg_height"]}" alt="{escape(v["visual_content"])}" loading="lazy"></a><p>{escape(v["visual_content"])}</p><p class="actions"><a href="{v["png"]}" download>PNG 2×</a><a href="{v["svg"]}" download>SVG chỉnh sửa</a><a href="../EXAM_PATTERNS.html#{v["anchor"]}">Đọc dạng bài</a></p><details><summary>Đề / MS của dạng liên quan</summary><p>{refs or "Sơ đồ phương pháp chung; xem các dạng E/X trong mục 13.4."}</p></details></article>')

intro='''# Danh sách visual — 13.4 Chapter 13 in Past Papers

**Đã tạo 26 hình độc lập: U13-V41–U13-V66**, tiếp nối 40 visual lý thuyết. Mỗi hình có SVG chỉnh sửa và PNG 2× nền trong suốt; kích thước theo nội dung, không có khung slide, logo, tiêu đề bài giảng hoặc đoạn hướng dẫn dài nằm trong ảnh.

[Mở thư viện hình](index.html) · [Mở mục 13.4 có hình](../EXAM_PATTERNS.html) · [ZIP riêng của 26 hình](chapter-13-4-visuals.zip).

## Phạm vi

- V41–V48: nhận diện và 7 dạng kiểu dữ liệu.
- V49–V53: 5 dạng tổ chức/truy cập tệp.
- V54–V62: 9 hình cho 7 dạng floating-point; tách riêng bẫy -0.5 và hai đầu vào chuẩn hóa.
- V63–V65: 3 dạng giao thoa — subrange/array, PRIVATE, file pseudocode.
- V66: sơ đồ đọc ngược kiểm tra đáp án.

## Danh sách đầy đủ

| ID | Dạng | Hình | Thao tác được minh họa | Tệp |
|---|---|---|---|---|
'''
notes='''

## Dùng khi giảng và ôn tập

Đọc đề trước → gọi tên dạng → dùng hình để truy vết từng bước → tự viết working → đối chiếu đúng MS. Hình minh họa phương pháp, không thay đáp án đầy đủ. Nhãn bit, tên biến và tên câu lệnh giữ tiếng Anh; chú thích ngắn bằng tiếng Việt.

Các sơ đồ là ví dụ do bộ tài liệu biên soạn, không phải ảnh chụp hoặc bản sao hình trong đề thi. Link đề/MS trong [manifest](visual_manifest.json) và thư viện chỉ dẫn tới câu có dạng liên quan. V52 dùng ví dụ địa chỉ bổ sung; V59/V62 giả định M8/E4 bù hai chuẩn hóa, không dùng mô hình IEEE 754/subnormal. V61 tách rõ truncation và round-to-nearest. V63 bám cú pháp subrange của câu lịch sử được dẫn ở X01. Mũi tên trong V65 chỉ luồng dữ liệu; khi viết pseudocode, dùng cú pháp GETRECORD/PUTRECORD đầy đủ trong bài học.

ZIP hình chứa thư viện và 52 tệp ảnh; để mở thêm bài học hoặc đề/MS từ thư viện, dùng ZIP toàn bộ Chapter 13 hoặc giữ thư mục `exam_visuals` cạnh EXAM_PATTERNS.html và exam_sources như cấu trúc gốc.

## Cách tạo và kiểm tra

Mở rộng thư viện SVG hiện có bằng `tools/build_exam_visuals.py`; xuất PNG bằng Sharp. Hình được dựng từ bit, record, slot, đường nối và nhãn chính xác, không tạo bằng mô hình ảnh. Danh sách mô tả trong bảng là đặc tả cho từng hình; mã nguồn tái tạo được nằm trong thư mục tools của bộ Chapter 13.

Kiểm tra gồm: giá trị floating-point, bit chuẩn hóa, phép MOD/địa chỉ, đường dò collision, kích thước/alpha PNG, chồng chữ, link tới mục E/X và hiển thị handbook. Kết quả lưu tại `qa`.
'''
(ROOT/'VISUAL_INVENTORY.md').write_text(intro+'\n'.join(rows)+notes,encoding='utf-8')
css='''*{box-sizing:border-box}body{margin:0;background:#eef3f5;color:#18364b;font:17px/1.65 "Segoe UI",sans-serif}main{max-width:1280px;margin:auto;padding:32px}a{color:#007f83;text-underline-offset:3px}h1{font-size:34px;line-height:1.25}h2{font-size:23px;margin:4px 0 20px;line-height:1.4}header>span{font-size:14px;font-weight:700;color:#007f83}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px}article{background:white;padding:24px;border:1px solid #cadbe1;border-radius:8px}article:target{outline:3px solid #007f83}.image-link{display:flex;align-items:center;justify-content:center;min-height:340px;border-block:1px solid #edf1f4;padding:18px 0}img{max-width:100%;width:auto;height:auto;max-height:510px}.actions{display:flex;gap:18px;flex-wrap:wrap;font-size:15px}details{font-size:14px;overflow-wrap:anywhere}summary{cursor:pointer}.intro{margin-bottom:30px;max-width:85ch}nav{display:flex;gap:20px;flex-wrap:wrap;margin:24px 0 35px}@media(max-width:850px){main{padding:18px}.grid{grid-template-columns:1fr}h1{font-size:28px}.image-link{min-height:0}article{padding:18px}}@media print{.grid{display:block}article{break-inside:avoid;margin:20px 0}nav,.actions,details{display:none}}'''
(ROOT/'index.html').write_text(f'<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>26 visual · Chapter 13.4</title><style>{css}</style></head><body><main><h1>Visual cho 13.4 · Chapter 13 in Past Papers</h1><p class="intro">26 hình độc lập cho thao tác giải bài. PNG nền trong suốt để chèn vào tài liệu; SVG để chỉnh sửa. Nhấn vào hình để mở kích thước đầy đủ.</p><nav><a href="../EXAM_PATTERNS.html">Học mục 13.4</a><a href="VISUAL_INVENTORY.md">Danh sách và đặc tả</a><a href="chapter-13-4-visuals.zip">Tải 26 hình</a></nav><div class="grid">{"".join(cards)}</div></main></body></html>',encoding='utf-8')

p=UNIT/'EXAM_PATTERNS.md';text=p.read_text(encoding='utf-8')
# Idempotent regeneration: remove only the entries owned by this builder.
text=re.sub(r'\n!\[U13-V(?:4[1-9]|5\d|6[0-6])[^\n]*\]\(exam_visuals/png/[^)]+\)\n','\n',text)
if '<a id="exam-review"></a>' not in text:
    text=text.replace('### Kiểm tra 30 giây trước khi chuyển câu','### Kiểm tra 30 giây trước khi chuyển câu\n\n<a id="exam-review"></a>')
grouped={}
for v in visuals:grouped.setdefault(v['anchor'],[]).append(v)
for anchor,items in grouped.items():
    marker=f'<a id="{anchor}"></a>'
    assert marker in text,anchor
    # Images live with their pattern; all prose remains selectable text.
    images='\n\n'.join(f'![{v["id"]} — {v["title"]}](exam_visuals/{v["png"]})' for v in items)
    text=text.replace(marker,marker+'\n\n'+images)
notice='[Thư viện 26 visual của mục 13.4](exam_visuals/index.html) · [Danh sách hình](exam_visuals/VISUAL_INVENTORY.md).'
if notice not in text:text=text.replace('## 13.4.1',notice+'\n\n## 13.4.1',1)
p.write_text(text,encoding='utf-8')

for name in ['README.md','REVISION.md']:
    p=UNIT/name;old=p.read_text(encoding='utf-8')
    heading='## Visual bổ sung cho 13.4'
    if heading not in old:old+='\n'+heading+'\n\n[26 hình độc lập V41–V66](exam_visuals/index.html) · [Danh sách](exam_visuals/VISUAL_INVENTORY.md) · [ZIP hình](exam_visuals/chapter-13-4-visuals.zip). Đã gắn vào từng dạng E/X và nhúng trong hai handbook. Tổng bộ Chapter 13: 40 hình lý thuyết + 26 hình thao tác giải đề.\n'
    p.write_text(old,encoding='utf-8')

with zipfile.ZipFile(ROOT/'chapter-13-4-visuals.zip','w',zipfile.ZIP_DEFLATED) as z:
    for p in sorted(ROOT.rglob('*')):
        if p.is_file() and p.suffix in ['.svg','.png','.json','.md','.html'] and 'qa' not in p.relative_to(ROOT).parts:
            z.write(p,p.relative_to(ROOT))
print(json.dumps({'inventory':26,'gallery':True,'images_inserted':26,'guide_updated':True}))
