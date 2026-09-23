"""Prepare local, traceable sources and stable theory links for section 13.4."""
from pathlib import Path
import hashlib, json, re, shutil
import pymupdf

ROOT = Path(__file__).resolve().parents[1]
CSROOT = ROOT.parents[3]
SELECTION = {
    'w21_31': 'Q1, Q3, Q5', 's22_31': 'Q1', 's22_32': 'Q1',
    'w22_32': 'Q1, Q4', 's23_31': 'Q1, Q3', 's23_32': 'Q6',
    'w23_32': 'Q2, Q3', 's24_31': 'Q4', 's24_32': 'Q3, Q7',
    'w24_31': 'Q1, Q6', 'w24_32': 'Q2, Q3', 's25_31': 'Q1, Q2',
    's25_32': 'Q1, Q2, Q13', 's25_33': 'Q1, Q2, Q11', 'w25_33': 'Q1, Q2',
}

p = ROOT/'STUDENT_GUIDE.md'
t = p.read_text(encoding='utf-8')
for number in re.findall(r'^### (\d\.\d) ', t, re.M):
    anchor = 'theory-' + number.replace('.', '-')
    if f'id="{anchor}"' not in t:
        t = re.sub(r'(^### '+re.escape(number)+r' [^\n]+)', r'\1\n\n<a id="'+anchor+r'"></a>', t, flags=re.M)
p.write_text(t, encoding='utf-8')

p = ROOT/'EXAM_PATTERNS.md'
t = p.read_text(encoding='utf-8').replace('9618_s23_ms_32.pdf#page=6', '9618_s23_ms_32.pdf#page=7').replace('9618_w24_ms_32.pdf#page=4', '9618_w24_ms_32.pdf#page=5')
for before, after in {'mục13.4':'mục 13.4','mục13.1':'mục 13.1','giai đoạn2021':'giai đoạn 2021','có4':'có 4','đa2':'đa 2','đa1':'đa 1','đa3':'đa 3','cho5':'cho 5','chép50':'chép 50','có5':'có 5','có2':'có 2','gồm2':'gồm 2','và1':'và 1','từ12':'từ 12','xuống10':'xuống 10','lên6':'lên 6','giải thích2':'giải thích 2','Kiểm tra30':'Kiểm tra 30','Lab1':'Lab 1','Unit20':'Unit 20','MOD3':'MOD 3','word16':'word 16','trong8+4':'trong 8+4','trong8+8':'trong 8+8','Với8+8':'Với 8+8','là2^':'là 2^','phải2^':'phải 2^','dạng0.1':'dạng 0.1','đầu01/10':'đầu 01/10','đầu11':'đầu 11','mỗi2':'mỗi 2'}.items():
    t = t.replace(before, after)
t = re.sub(r'câu(?=\d)', 'câu ', t)
t = re.sub(r',(?=\d+ điểm)', ', ', t)
p.write_text(t, encoding='utf-8')

(ROOT/'exam_sources').mkdir(exist_ok=True)
files, rows = [], []
for code, questions in SELECTION.items():
    season, variant = code.split('_')
    year = '20'+season[1:]
    folder = 'May_June' if season[0]=='s' else 'Oct_Nov'
    label = ('M/J' if season[0]=='s' else 'O/N') + f' {year}/{variant}'
    links = []
    for kind in ('qp', 'ms'):
        name = f'9618_{season}_{kind}_{variant}.pdf'
        source = CSROOT/'Past_Papers'/year/folder/name
        target = ROOT/'exam_sources'/name
        shutil.copy2(source, target)
        pages = sorted(set(int(n) for n in re.findall(re.escape(name)+r'#page=(\d+)', t)))
        with pymupdf.open(target) as doc:
            count = len(doc)
        digest = hashlib.sha256(target.read_bytes()).hexdigest()
        files.append({'code':code,'kind':kind,'original_path':str(source),'local_path':'exam_sources/'+name,'sha256':digest,'page_count':count,'linked_pages':pages,'selected_questions':questions})
        page_links = ', '.join(f'[tr. {n}](exam_sources/{name}#page={n})' for n in pages)
        links.append(page_links or f'[PDF](exam_sources/{name})')
    rows.append(f'| {label} | {questions} | {links[0]} | {links[1]} |')

(ROOT/'EXAM_SOURCE_REGISTER.json').write_text(json.dumps({'section':'13.4','reviewed_date':'2026-09-15','scope':'Selected questions; not a complete frequency analysis','files':files},ensure_ascii=False,indent=2),encoding='utf-8')
register = '''# Nguồn đối chiếu của mục 13.4

Mục [Chapter 13 in Past Papers](EXAM_PATTERNS.html) sử dụng **15 cặp đề–mark scheme**, Cambridge 9618 Paper 3, các kỳ 2021–2025. Các câu được chọn để minh họa 19 dạng cốt lõi và 3 dạng giao thoa; không phải khảo sát tần suất toàn bộ kho đề. Ngày đối chiếu: 15/09/2026.

## Mở đề và mark scheme

Các link mở trang PDF theo số trang của tệp; câu dài có thể tiếp tục ở trang sau. Bản PDF được sao chép nguyên trạng từ kho Past_Papers người dùng cung cấp, giữ nguyên thông tin nguồn và bản quyền. Để dùng offline, giữ thư mục `exam_sources` cạnh HTML; trình xem PDF cần hỗ trợ `#page=` để nhảy trang tự động.

| Kỳ / component | Câu đã dùng | QP — trang bắt đầu | MS — trang bắt đầu |
|---|---|---|---|
''' + '\n'.join(rows) + '''

## Lưu ý khi dạy và đối chiếu

- “13.4” là số mục ôn thi thêm trong bộ tài liệu này; không phải mục mới được Cambridge công bố trong sách hoặc syllabus.
- M/J 2022/31 Q1(b) hỏi subrange và array field, không phải SET. Mục X01 sửa cách phân loại nhầm trong danh mục cũ.
- M/J 2023/31 Q3(b) và sách dùng nhãn open/closed hashing không nhất quán. Dạy cơ chế lưu/tìm, so khóa và xử lý va chạm; không chấm chỉ dựa vào việc học sinh nhớ một nhãn.
- M/J 2023/31 Q1 minh họa mất precision khi mantissa thiếu bit; đáp án 8-bit mantissa thể hiện truncation. Tách rõ trường hợp này khỏi bài được yêu cầu làm tròn.
- X01–X03 có kiến thức nối sang array, OOP và Further Programming. Các câu này xuất hiện trong Paper 3 nhưng không nên gán toàn bộ điểm câu cho riêng Chapter 13.
- Một trang MS có thể chứa nhiều câu; chỉ các câu ghi trong bảng là nguồn của mục này. Đọc đủ câu hỏi, ràng buộc và MS của đúng variant trước khi chấm.
- Lời hướng dẫn, cách nhận diện và ví dụ nhỏ trong mục 13.4 được biên soạn để học; điểm nêu bên cạnh một ví dụ chỉ áp dụng cho câu/ý được dẫn, không phải thang điểm chung cho dạng đó.

[EXAM_SOURCE_REGISTER.json](EXAM_SOURCE_REGISTER.json) lưu đường dẫn gốc, đường dẫn bản sao, số trang và SHA-256 của từng PDF để kiểm tra tính nguyên vẹn.
'''
(ROOT/'EXAM_SOURCE_REGISTER.md').write_text(register,encoding='utf-8')

additions = {
    'README.md': '\n## 13.4 — Chapter 13 in Past Papers\n\n[Mở mục 13.4](EXAM_PATTERNS.html) · [Bản có thể chỉnh sửa](EXAM_PATTERNS.md) · [Nguồn đề và MS](EXAM_SOURCE_REGISTER.md). Gồm 19 dạng cốt lõi + 3 dạng giao thoa: dấu hiệu nhận diện, cách giải, liên kết lý thuyết và kiểm tra tránh mất điểm. Đã tích hợp vào cả hai handbook; ZIP kèm 30 PDF nguồn để mở offline.\n',
    'REVISION.md': '\n## Ôn theo dạng đề — mục 13.4\n\nMở [bản đồ 22 dạng bài](EXAM_PATTERNS.html): nhận diện E/X → giải QP trước khi xem MS → ghi ý còn thiếu → quay về link lý thuyết → làm lại một câu khác. Dùng checklist 30 giây ở cuối mục 13.4 để kiểm tra tên biến, số bit, working và nguyên nhân–hệ quả.\n',
    'TEACHER_GUIDE.md': '\n## Dạy mục 13.4 — Chapter 13 in Past Papers\n\nDùng [22 dạng bài](EXAM_PATTERNS.html) và [bảng nguồn](EXAM_SOURCE_REGISTER.md). Mỗi lượt: 3 phút nhận diện và giải thích vì sao; học viên tự giải một ý theo thời gian phù hợp số điểm; đối chiếu MS đúng variant; sửa lỗi và quay lại G tương ứng. Che MS trước khi làm. Tách X01–X03 để bổ sung array/OOP/file pseudocode khi cần. Lỗi cần ghi: nhận sai dạng, thiếu kiến thức, sai thao tác, thiếu working, thiếu ý theo đề. Điểm của câu nguồn chỉ là ví dụ cho cách chấm câu đó.\n',
    'SOURCES_AND_TEACHER_NOTES.md': '\n## Nguồn bổ sung cho 13.4\n\nXem [danh sách 15 cặp QP/MS](EXAM_SOURCE_REGISTER.md), kèm bản PDF nguyên trạng trong `exam_sources` và SHA-256 trong JSON. Dùng mục [13.4](EXAM_PATTERNS.html) để phân loại câu; lưu ý hiệu chỉnh subrange/array ở M/J 2022/31 và khác biệt nhãn hashing ở M/J 2023/31.\n',
}
for name, addition in additions.items():
    p = ROOT/name
    old = p.read_text(encoding='utf-8')
    if addition.strip().splitlines()[0] not in old:
        old += addition
    if name=='README.md':
        old = old.replace('**Phiên bản 2:', '**Phiên bản 3:')
    p.write_text(old,encoding='utf-8')
print(json.dumps({'source_pairs':len(SELECTION),'pdf_files':len(files),'stable_theory_anchors':len(re.findall('id="theory-',(ROOT/'STUDENT_GUIDE.md').read_text(encoding='utf-8')))}))
