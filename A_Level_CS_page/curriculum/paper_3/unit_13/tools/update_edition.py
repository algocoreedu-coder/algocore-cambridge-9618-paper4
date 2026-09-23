"""Apply the documented content revision; preserve the original audit."""
from pathlib import Path
import json,re,shutil
ROOT=Path(__file__).resolve().parents[1]
history=ROOT/'audit';history.mkdir(exist_ok=True)
for name in ['BOOK_ALIGNMENT_REVIEW.md','BOOK_ALIGNMENT_CHECKS.json']:
    dest=history/(Path(name).stem+'_INITIAL'+Path(name).suffix)
    if not dest.exists():shutil.copyfile(ROOT/name,dest)

# Place additions within the topic they extend, before the next topic heading.
p=ROOT/'STUDENT_GUIDE.md';s=p.read_text(encoding='utf-8')
for heading,marker in [
 ('### 1.3 Record: lưu một đối tượng có nhiều field','```text\nTYPE TStudent\n'),
 ('### 2.3 Hashing: từ key đến vị trí','Một mô hình đơn giản có N slot'),
 ('### 3.3 Chuyển denary thành floating-point','**Số dương 6.5:**'),
 ('### 3.4 Normalisation: chuẩn hóa nhưng giữ nguyên giá trị','Với số khác 0 trong mô hình này:'),
 ('### 3.6 Vì sao có sai số?','Hai lý do cần phân biệt:'),
 ('### 3.7 Overflow và underflow','Vẫn dùng hệ 8+4 chuẩn hóa ở trên:')]:
    s=s.replace(heading+'\n\n','',1)
    s=s.replace(marker,heading+'\n\n'+marker,1)
s=s.replace('Trước khi sang record, luyện thao tác','Luyện thao tác')
p.write_text(s,encoding='utf-8')

description='Mô hình chỉ làm tròn đầu vào: nearest của 0.1 trong 8+4 là 0.099609375 (M=01100110, E=1101). Ba tổng chính xác của đầu vào đã xấp xỉ: 0.099609375; 0.19921875; 0.298828125. Không làm tròn tổng về 8+4; ghi rõ sai số có dấu.'
mp=ROOT/'visuals/visual_manifest.json';manifest=json.loads(mp.read_text(encoding='utf-8'))
v=next(x for x in manifest['visuals'] if x['id']=='U13-V36');v['visual_content']=description;v['practice_questions']='27, 45; Lab 3'
mp.write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
ip=ROOT/'visuals/VISUAL_INVENTORY.md';inv=ip.read_text(encoding='utf-8')
lines=inv.splitlines()
for i,line in enumerate(lines):
    if line.startswith('| U13-V36 |'):
        cells=line.split('|');cells[3]=' '+description+' ';cells[6]=' Bài 7; Guide 3.6; câu 27,45; Lab 3 ';lines[i]='|'.join(cells)
ip.write_text('\n'.join(lines)+'\n',encoding='utf-8')

for name,addition in [
 ('PRACTICE.md','\n## Tiếp tục ôn thi\n\nLàm [20 câu bổ sung 29–48](EXTENDED_PRACTICE.md) để luyện phương pháp khác, định dạng M/E thay đổi, làm tròn số âm và sai số tích lũy.\n'),
 ('ANSWERS.md','\n## Đáp án phần mở rộng\n\n[Đáp án và thang chấm câu 29–48](EXTENDED_ANSWERS.md), tổng 100 điểm luyện nội bộ.\n'),
 ('SOURCES_AND_TEACHER_NOTES.md','\n## Bản hoàn thiện cho giảng dạy và ôn tập\n\nBản cập nhật bổ sung 20 câu (29–48), ba lab có lời giải chạy được, ôn AS, kế hoạch dạy, phiếu ôn và bản đồ các hoạt động/câu cuối chương. Kết quả hiện hành nằm trong [BOOK_ALIGNMENT_REVIEW](BOOK_ALIGNMENT_REVIEW.md); báo cáo 87% trước sửa được giữ ở thư mục audit. V36 đã sửa nearest của 0.1 về 0.099609375 và nêu rõ chỉ làm tròn đầu vào.\n\nĐối chiếu lại syllabus 2027–2029 version 2 và mục user-defined types của Pseudocode Guide vào 15/09/2026. Sách đã đọc toàn bộ Chapter 13 ở lần đối chiếu trước; bản cập nhật dùng checklist và trang nguồn đã xác minh.\n')]:
    p=ROOT/name;t=p.read_text(encoding='utf-8')
    if addition.strip().splitlines()[0] not in t:p.write_text(t+addition,encoding='utf-8')

initial=(history/'BOOK_ALIGNMENT_REVIEW_INITIAL.md').read_text(encoding='utf-8')
matrix=initial.split('## 2. Checklist có thể kiểm tra lại')[1].split('## 3. Lỗi cần sửa')[0]
evidence={
 'T05':'G1.2 thêm TDay, Today+1 và IF xử lý Sunday; P29/30',
 'F09':'G2.2 định nghĩa hit rate, ví dụ 100%/0.5%; P31',
 'R06':'G3.2 giải mã bằng dịch binary point, gồm M/E âm; P34–35',
 'R10':'G3.3 mã hóa qua phân số, điều chỉnh mẫu và E; P36',
 'R15':'G3.5 lời giải 8+8,12+6,16+8 và giới hạn10+6; P38–42; BOOK_ACTIVITY_MAP',
 'R18':'G3.3 bảng nhân2 của0.375 và chu kỳ0.1; P37',
 'R19':'G3.6 hai mô hình cộng, V36 đã sửa nearest và giả thiết; P45; Lab3',
 'R20':'G3.6 giải thích double/quadruple, giới hạn và hiển thị; P46; Lab3C'}
for code,where in evidence.items():
    pattern=rf'^\| {code} \|([^\n]+)$'
    match=re.search(pattern,matrix,re.M);assert match,code
    cells=match.group(0).split('|');cells[-3]=' '+where+' ';cells[-2]=' 1 '
    matrix=matrix[:match.start()]+'|'.join(cells)+matrix[match.end():]
matrix=matrix.replace('### 13.1 — 9.5/10','### 13.1 — 10/10').replace('### 13.2 — 12.5/13','### 13.2 — 13/13').replace('### 13.3 — 18/23','### 13.3 — 23/23')
review='''# Chapter 13 — Đối chiếu sau cập nhật

Phiên bản 2, ngày 15/09/2026. **Đã đáp ứng 46/46 tiêu chí nội dung của checklist đối chiếu sách (100%).**

| Phần | Điểm | Bao phủ |
|---|---:|---:|
| 13.1 User-defined types | 10/10 | 100% |
| 13.2 File organisation/access | 13/13 | 100% |
| 13.3 Floating-point | 23/23 | 100% |

“100%” nghĩa là từng tiêu chí kiến thức/phương pháp trong checklist đã có bài học và bằng chứng tương ứng. Không phải bảo đảm đạt điểm thi, không phải chép giống câu chữ và không phải tái tạo mọi câu bài tập của sách. Giữ nguyên các sửa lỗi nguồn đã giải thích; không đưa lỗi sách trở lại bài học.

Nguồn đối chiếu: sách Watson & Williams, Chapter13, trang in304–327 (PDF320–343) do người dùng cung cấp. Phạm vi kiểm tra là bộ Unit13 trong folder này. Mục13 cũng được đối chiếu syllabus2026 và2027–2029; chưa chốt năm thi của lớp, nên không suy rộng thành chứng nhận cho mọi quy định của cả chương trình.

## Những phần đã bổ sung

- Enum successor và xử lý biên; high/low hit rate.
- Giải mã bằng dịch binary point; mã hóa qua phân số; bảng nhân2 tạo bit.
- Ví dụ và bài tập nhiều định dạng M/E; phối hợp dấu, giới hạn và làm tròn số âm.
- Double/quadruple precision; hai mô hình sai số cộng lặp; sửa V36 đồng bộ.
- 20 câu có hướng dẫn chấm, ngoài28 câu nền; chẩn đoán AS, ba lab chạy được, kế hoạch8 khối bài và phiếu ôn tập.
- [Bản đồ hoạt động sách](BOOK_ACTIVITY_MAP.md) bao phủ9 Activities,6 Extensions,3 khung kiến thức đầu vào và5 nhóm câu cuối chương bằng bài học/bài mới tương đương.

## Checklist sau cập nhật
'''+matrix+'''
## Sửa V36 và kiểm tra

Nearest của0.1 trong8+4 là M01100110/E1101 =0.099609375. V36 cộng chính xác các đầu vào đã xấp xỉ, không làm tròn lại tổng. Tổng thứ ba0.298828125 không được trình bày như giá trị được lưu chính xác trong8+4. G3.6, P45 và Lab3 còn giải thích mô hình làm tròn từng phép cộng, ties-to-even, cho tổng thứ ba0.296875.

QA bổ sung kiểm tra nearest bằng khoảng cách phân số chính xác trên toàn bộ2.048 số chuẩn hóa; V36 dùng bộ dựng bit như các hình khác để không lọt khỏi danh sách kiểm tra. Kết quả hiện hành: [BOOK_ALIGNMENT_CHECKS.json](BOOK_ALIGNMENT_CHECKS.json). Báo cáo trước sửa được giữ ở audit/BOOK_ALIGNMENT_REVIEW_INITIAL.md để truy nguyên, không dùng làm kết luận hiện hành.

## Phạm vi sử dụng

Học viên dùng STUDENT_HANDBOOK.html và bài tự luyện; giáo viên dùng TEACHER_HANDBOOK.html có thêm lời giải/hướng dẫn. Giữ liên kết QP/MS trong SOURCES_AND_TEACHER_NOTES cho bước luyện đề. Bộ này là tài liệu Chapter13; kết quả học tập thực tế còn cần được kiểm tra qua bài độc lập và đề đúng năm thi.
'''
(ROOT/'BOOK_ALIGNMENT_REVIEW.md').write_text(review,encoding='utf-8')
readme='''# Chapter 13 — Data Representation

**Phiên bản 2: tài liệu giảng dạy và ôn tập A Level.** Bao phủ46/46 tiêu chí trong checklist đối chiếu Chapter13 của sách; xem [báo cáo](BOOK_ALIGNMENT_REVIEW.md).

## Mở tài liệu

- [Bản học viên](STUDENT_HANDBOOK.html): bài học đầy đủ,40 visual,48 câu luyện chính, ôn AS, phiếu ôn và lab.
- [Bản giáo viên](TEACHER_HANDBOOK.html): thêm kế hoạch dạy, đáp án, thang chấm và hướng dẫn đối chiếu sách.
- [Tải cả bộ](chapter-13-teaching-revision.zip): hai bản HTML và tất cả tài liệu/ảnh/mã lab cần dùng offline.

Trong HTML, dùng mục lục để đi tới từng phần; nút In cho phép in hoặc lưu PDF bằng trình duyệt. Bản học viên không chèn đáp án vào nội dung chính; các file đáp án để riêng phục vụ giáo viên. Nhãn bài giảng tiếng Việt, thuật ngữ và pseudocode tiếng Anh.

## Tài liệu nguồn có thể chỉnh sửa

| Tài liệu | Công dụng |
|---|---|
| [STUDENT_GUIDE](STUDENT_GUIDE.md) | Kiến thức và lời giải từng bước |
| [PREREQUISITES](PREREQUISITES.md) | Chẩn đoán/ôn AS |
| [PRACTICE](PRACTICE.md) / [ANSWERS](ANSWERS.md) | 28 câu nền và đáp án |
| [EXTENDED_PRACTICE](EXTENDED_PRACTICE.md) / [EXTENDED_ANSWERS](EXTENDED_ANSWERS.md) | 20 câu mở rộng,100 điểm luyện nội bộ |
| [LABS](LABS.md) | Ba lab set,hash,sai số |
| [TEACHER_GUIDE](TEACHER_GUIDE.md) | Tiến trình8 khối bài, chấm và phản hồi |
| [REVISION](REVISION.md) | Phiếu ôn, từ khóa và bài theo lỗi |
| [BOOK_ACTIVITY_MAP](BOOK_ACTIVITY_MAP.md) | Ánh xạ activities/extensions/câu cuối chương |
| [SOURCES_AND_TEACHER_NOTES](SOURCES_AND_TEACHER_NOTES.md) | Nguồn, QP/MS và lưu ý sửa lỗi sách |

## Hình minh họa

[Thư viện40 hình](visuals/index.html) · [ZIP chỉ chứa visual](visuals/chapter-13-visuals.zip). Mỗi hình có SVG và PNG nền trong suốt; giữ quy tắc hình độc lập, không tự ý chuyển cả slide thành ảnh. V36 đã được sửa và kiểm tra lại.

## Cách học và giới hạn phạm vi

Chẩn đoán → học/giải thích → luyện độc lập → chấm theo ý → sửa lỗi → làm QP chọn lọc. Mục tiêu nội bộ80% mỗi nhóm giúp quyết định phần cần ôn, không quy đổi thành grade Cambridge. “100%” nói về bao phủ checklist Chapter13, không cam kết điểm thi hoặc thay thế toàn bộ chương trình A Level.
'''
(ROOT/'README.md').write_text(readme,encoding='utf-8')
print('Updated edition, source metadata and all 46 checklist rows')
