"""Verify numeric examples and package the standalone visual library."""
from pathlib import Path
from fractions import Fraction as F
from html import escape as esc
import json, zipfile

ROOT=Path(__file__).resolve().parents[1]
manifest=json.loads((ROOT/'visual_manifest.json').read_text(encoding='utf-8'))
layouts=json.loads((ROOT/'qa/layout.json').read_text(encoding='utf-8'))
technical=json.loads((ROOT/'qa/technical_checks.json').read_text(encoding='utf-8'))
assert len(layouts)==len(manifest['visuals'])==technical['count']==40
assert not technical['potential_text_overlaps']
def signed(bits):return int(bits,2)-(2**len(bits) if bits[0]=='1' else 0)
def decode(m,e):return F(signed(m),2**(len(m)-1))*F(2)**signed(e)
expected={25:[F(13,2)],26:[F(13,2)],27:[F(-13,2)],28:[F(5,32)],
          29:[F(13,2),F(-13,2)],30:[F(5),F(5)],31:[F(-6),F(-6),F(-1,2),F(-1,2)],
          33:[F(127),F(1,512),F(-128),F(-65,32768)],35:[F(13),F(27,2)],36:[F(51,512)],40:[F(13,2)]}
checks=[]
for entry in layouts:
    n=int(entry['id'][-2:]);pairs=entry['float_pairs']
    assert len(pairs)==len(expected.get(n,[]))
    for pair,want in zip(pairs,expected.get(n,[])):
        assert len(pair['mantissa'])==(6 if n==35 else 8) and len(pair['exponent'])==4
        got=decode(pair['mantissa'],pair['exponent']);assert got==want,(entry['id'],got,want)
        checks.append({'id':entry['id'],**pair,'exact_value':str(got),'passed':True})
# Exhaustively confirm the four normalised limits for the teaching format.
values=[decode(f'{m:08b}',f'{e:04b}') for m in range(256) for e in range(16) if f'{m:08b}'[:2] in ('01','10')]
assert [max(values),min(v for v in values if v>0),min(values),max(v for v in values if v<0)]==expected[33]
assert 127%10==7 and 1000+7*20==1140
assert (ord('A')+ord('C'))%10==(ord('C')+ord('A'))%10==2
slots=[None]*5
for key in [14,19,24,10]:
    address=key%5
    while slots[address] is not None:address=(address+1)%5
    slots[address]=key
assert slots==[19,24,10,None,14]
approx=decode('01100110','1101')
assert approx==F(51,512) and 3*approx-F(3,10)==F(-3,2560)
assert min(values,key=lambda v:abs(v-F(1,10)))==approx
assert [n*approx for n in (1,2,3)]==[F(51,512),F(51,256),F(153,512)]
assert F(107,8)-13==F(3,8) and F(27,2)-F(107,8)==F(1,8)
report={'status':'passed','drawn_float_pairs':checks,'normalised_values_enumerated':len(values),
        'hash_and_address_examples':'passed','linear_probing_slots':slots,
        'rounding_and_accumulated_error':'passed'}
(ROOT/'qa/numeric_checks.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
for entry,layout,output in zip(manifest['visuals'],layouts,technical['outputs']):
    assert entry['id']==layout['id']==output['id']
    entry.update(status='generated',asset_kind='standalone_diagram',background='transparent',
                 svg=f"svg/{entry['slug']}.svg",png=f"png/{entry['slug']}.png",
                 svg_width=layout['width'],svg_height=layout['height'],
                 png_width=output['png_width'],png_height=output['png_height'])
manifest.update(status='generated_and_checked',completed_on='2026-09-15',
                delivery_rule='Each file is an independent teaching diagram. Do not turn an entire slide into an image.',
                gallery='index.html',checks=['qa/technical_checks.json','qa/numeric_checks.json'])
(ROOT/'visual_manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
cards=[]
for entry in manifest['visuals']:
    cards.append(f'''<article data-group="{esc(entry['group'])}" data-search="{esc(entry['id']+' '+entry['title']+' '+entry['visual_content'])}">
<header><span>{esc(entry['id'])} · {esc(entry['group'])}</span><h2>{esc(entry['title'])}</h2></header>
<a class="visual" href="{entry['svg']}" target="_blank"><img loading="lazy" src="{entry['svg']}" alt="{esc(entry['visual_content'])}" width="{entry['svg_width']}" height="{entry['svg_height']}"></a>
<p>{esc(entry['visual_content'])}</p><p class="source">Tham khảo: {esc(entry['book_reference'])} · Câu luyện: {esc(entry['practice_questions'])}</p>
<nav><a href="{entry['png']}" download>PNG · {entry['png_width']} × {entry['png_height']}</a><a href="{entry['svg']}" download>SVG chỉnh sửa</a></nav></article>''')
groups=list(dict.fromkeys(v['group'] for v in manifest['visuals']))
options=''.join(f'<option>{esc(g)}</option>' for g in groups)
html='''<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Chapter 13 · Thư viện 40 hình minh họa</title><style>
*{box-sizing:border-box}body{margin:0;background:#eef3f5;color:#18364b;font:16px/1.55 "Segoe UI",sans-serif}
main{max-width:1440px;margin:auto;padding:30px}h1{margin:0;font-size:30px}h2{font-size:20px;margin:4px 0 16px}a{color:#007f83}
.intro{max-width:950px}form{display:flex;gap:12px;flex-wrap:wrap;margin:24px 0}input,select{font:inherit;padding:10px 14px;border:1px solid #9baeb7;border-radius:8px}input{flex:1;min-width:220px}
#count{align-self:center}#grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px}article{background:white;padding:24px;border-radius:12px;border:1px solid #d9e3e8}article[hidden]{display:none}
header span,.source{color:#586f7b;font-size:14px}.visual{display:flex;align-items:center;justify-content:center;min-height:230px;background:white}img{display:block;width:100%;height:auto;max-height:480px;object-fit:contain}
nav{display:flex;gap:20px;flex-wrap:wrap}nav a{font-weight:600}article p{font-size:14px}footer{margin:30px 0;color:#586f7b}
@media(max-width:850px){#grid{grid-template-columns:1fr}main{padding:16px}article{padding:18px}}@media print{form{display:none}article{break-inside:avoid}#grid{display:block}article{margin-bottom:20px}}
</style><main><h1>Chapter 13 · Thư viện hình minh họa</h1>
<p class="intro">40 hình độc lập cho Data representation. Mỗi hình có PNG nền trong suốt và SVG chỉnh sửa được. Tiêu đề, mô tả và nút tải trên trang này nằm ngoài file ảnh. Nhấp vào hình để xem bản đầy đủ.</p>
<form onsubmit="return false"><input id="search" type="search" aria-label="Tìm hình" placeholder="Tìm mã, chủ đề hoặc nội dung…"><select id="group" aria-label="Chọn nhóm"><option value="">Tất cả nhóm</option>'''+options+'''</select><span id="count">40 / 40 hình</span></form>
<section id="grid">'''+''.join(cards)+'''</section><footer>Nhóm: Tổng quan 2 · 13.1: 10 · 13.2: 11 · 13.3: 15 · Ôn tập: 2. Quy ước floating-point theo mô hình giảng dạy trong chương; không mặc định là IEEE 754. Nên đặt ảnh trên nền sáng.</footer></main>
<script>const query=document.querySelector('#search'),group=document.querySelector('#group');function filter(){let n=0;document.querySelectorAll('article').forEach(a=>{a.hidden=!(a.dataset.search.toLocaleLowerCase('vi').includes(query.value.toLocaleLowerCase('vi'))&&(!group.value||a.dataset.group===group.value));if(!a.hidden)n++});document.querySelector('#count').textContent=n+' / 40 hình'}query.addEventListener('input',filter);group.addEventListener('change',filter);</script></html>'''
(ROOT/'index.html').write_text(html,encoding='utf-8')
readme='''# Chapter 13 — Bộ 40 hình minh họa độc lập

Hoàn thành: 15/09/2026. **40 SVG + 40 PNG nền trong suốt**, mã U13-V01 đến U13-V40.

## Mở và sử dụng

- Mở [index.html](index.html) để xem, tìm kiếm và tải từng hình. Tiêu đề/mô tả của thư viện nằm ngoài ảnh.
- [png/](png/): ảnh raster xuất ở kích thước gấp đôi SVG, phù hợp chèn vào trang bài học hoặc slide.
- [svg/](svg/): hình vector có thể phóng to và chỉnh sửa chữ, đường nối, dữ liệu.
- [visual_manifest.json](visual_manifest.json): bảng mã, kích thước, bài học, câu luyện và tham khảo sách.
- [VISUAL_INVENTORY.md](VISUAL_INVENTORY.md): brief nội dung cho 40 hình.

PNG có nền trong suốt; các ô dữ liệu có màu nền riêng để phân biệt nội dung. Nên đặt hình trên nền trắng hoặc sáng. SVG dùng Segoe UI và Consolas; PNG đã cố định cách hiển thị chữ.

## Quy tắc hình ảnh của bộ này

Mỗi file là một sơ đồ hoặc hình minh họa học tập độc lập, cắt gọn theo nội dung. Không có khung slide, tiêu đề bài giảng lớn, logo, footer hay số trang. Tỷ lệ ảnh thay đổi theo nội dung. Các nhãn kiến thức nằm trong hình; tên hình và phần hướng dẫn nằm trong thư viện hoặc tài liệu.

**Các lần tạo và sửa tiếp theo phải giữ quy tắc này: không tự ý biến toàn bộ slide thành một hình ảnh.**

## Phạm vi

| Nhóm | Mã | Số hình |
|---|---|---:|
| Tổng quan và kiến thức nền | V01–V02 | 2 |
| 13.1 User-defined data types | V03–V12 | 10 |
| 13.2 File organisation and access | V13–V23 | 11 |
| 13.3 Floating-point | V24–V38 | 15 |
| Ôn tập và tổng hợp | V39–V40 | 2 |

Nhãn trong hình dùng thuật ngữ tiếng Anh của môn học; thư viện và mô tả dùng tiếng Việt. Hình được vẽ mới dựa trên nội dung đã chuẩn bị và tham khảo sách, dùng ví dụ lớp học. Các ví dụ floating-point dùng mô hình mantissa/exponent bù hai của chương, với số bit ghi trên hình; không phải sơ đồ chuẩn IEEE 754. V36 minh họa cộng các giá trị đã xấp xỉ; V37 xét số được chuẩn hóa.

## Kiểm tra

- Đủ 40 cặp SVG/PNG, SVG đọc được, PNG có alpha và đúng kích thước xuất.
- Đã xem 5 bảng kiểm tra bao phủ 40 hình và xem riêng các hình có nhãn/công thức dày.
- Kiểm tra vị trí nhãn không phát hiện chồng chữ theo hộp đo font.
- Giải mã chính xác 20 cặp mantissa/exponent đã vẽ; duyệt 2.048 tổ hợp chuẩn hóa để kiểm tra bốn giới hạn và giá trị gần nhất của 0.1; kiểm tra hashing, linear probing, rounding và sai số tích lũy.

Kết quả trong [qa/technical_checks.json](qa/technical_checks.json) và [qa/numeric_checks.json](qa/numeric_checks.json). Mã dựng ảnh trong [tools/](tools/). Các ảnh contact sheet trong qa chỉ phục vụ kiểm tra, không phải visual đưa vào bài học.
'''
(ROOT/'README.md').write_text(readme,encoding='utf-8')
inventory=ROOT/'VISUAL_INVENTORY.md'
old=inventory.read_text(encoding='utf-8')
old=old.replace('# Chapter 13 - Danh mục visual cần sản xuất','# Chapter 13 - Danh mục 40 visual')
old=old.replace('Ngày lập: 15/09/2026. Trạng thái: danh sách đề xuất, chưa tạo bộ ảnh.',
                'Ngày lập và hoàn thành: 15/09/2026. **Đã tạo đủ 40 hình độc lập (SVG + PNG).** Xem [thư viện ảnh](index.html) và [hướng dẫn sử dụng](README.md). Nội dung bên dưới là brief tham chiếu cho bộ ảnh.')
inventory.write_text(old,encoding='utf-8')
unit=ROOT.parent/'README.md';content=unit.read_text(encoding='utf-8')
if 'visuals/index.html' not in content:
    content+='\n## Bộ hình minh họa\n\nĐã tạo đủ **40 hình độc lập**, mỗi hình có SVG và PNG nền trong suốt. Mở [thư viện hình Chapter 13](visuals/index.html), [hướng dẫn](visuals/README.md) hoặc [gói tải toàn bộ](visuals/chapter-13-visuals.zip).\n'
    unit.write_text(content,encoding='utf-8')
with zipfile.ZipFile(ROOT/'chapter-13-visuals.zip','w',zipfile.ZIP_DEFLATED) as z:
    for folder in ['svg','png','tools']:
        for p in sorted((ROOT/folder).glob('*')):
            if p.is_file():z.write(p,p.relative_to(ROOT))
    for name in ['index.html','README.md','VISUAL_INVENTORY.md','visual_manifest.json','qa/technical_checks.json','qa/numeric_checks.json']:
        z.write(ROOT/name,name)
with zipfile.ZipFile(ROOT/'chapter-13-visuals.zip') as z:
    assert z.testzip() is None
    assert len([n for n in z.namelist() if n.endswith('.svg')])==40
    assert len([n for n in z.namelist() if n.endswith('.png')])==40
print(json.dumps({'visuals':40,'numeric_pairs_checked':len(checks),'normalised_cases':len(values),'zip_bytes':(ROOT/'chapter-13-visuals.zip').stat().st_size}))
