# Phạm vi syllabus và sách - A3

Version: 1.0 | Work order: P1-S0-A3-01 | Author: A3 | 2026-09-19 | REVIEW_PENDING (A9).

## 1. Inputs và căn cứ

- Đã đọc `AGENT_TEAM_PLAN.md`, `LEAD_PLAYBOOK.md`, `STAGE0_WORK_ORDERS.md`; phạm vi chỉ Stage 0, Paper 1 năm 2026, hai bản VI/EN. Không viết bài, không sửa app.
- Syllabus canonical: `Computer_Science/697372-2026-syllabus.pdf`, 49 trang, version 2, published December 2025 (PDF 1 cover; PDF 3 và 48). SHA256 `bf1b77a2b765d10eb4b005ecae0412add35cf6113ba3218a517893abfc9f2470`.
- Bản tải ngày 2026-09-19 từ https://www.cambridgeinternational.org/Images/697372-2026-syllabus.pdf lưu tại `tmp/official-2026-syllabus.pdf`; SHA256 trùng tuyệt đối file local. Việc này xác minh bản local đúng bytes của bản official tại thời điểm kiểm; không suy từ filename. A2 đã đối chiếu hash độc lập.
- Sách: `Computer_Science/dokumen.pub_cambridge-international-as-and-a-levels-computer-science-9781510457591.pdf`, David Watson và Helen Williams, Hodder Education, first published 2019, ISBN 9781510457591; PDF 5 title, PDF 6 copyright, PDF 7–9 TOC, PDF 10 introduction; 576 trang. SHA256 `0deb94b92267f83e4afe39c48b9c01f1419989ec56b4520903a7c5fe234b70b1`. Không gán edition number vì chưa thấy nhãn số edition.
- `planning/PAPER_AND_BOOK_MAP.md` dựa syllabus 2027–2029: chỉ là bản đồ ứng viên. `curriculum/paper_1/README.md` là skeleton; không phải chứng cứ coverage đã đạt.

## 2. Chuẩn locator và mức kiểm

Số PDF là 1-based. Syllabus có số in bằng số PDF tại các trang nội dung đã đọc (11, 13–27, 41–42, 48). Cover PDF 1 không gán số in. Coursebook phần thân đã kiểm có PDF = số in + 16; front matter dùng roman (TOC PDF 7 = v; PDF 8 = vi; PDF 9 = vii; introduction PDF 10 = viii). Không áp offset vào cover/front matter.

Đã đọc đầy đủ văn bản Paper 1 §1–8 tại syllabus PDF/in 14–27 (p27 chỉ lấy §8.3 trước §9). Đã đọc assessment p11, AO p13, version/change p3/48 và command words p41–42. Đã kiểm hình render syllabus p15 và p24 để bảo toàn hai cột mục tiêu/guidance. Tài liệu nguồn không đánh số riêng từng learning objective: ID `AC26-...` trong coverage plan là ID nội bộ AlgoCore, không phải code Cambridge.

Sách: đã đọc title/copyright/TOC/introduction, phần pilot PDF31–36 (in15–20), PDF132–133 (in116–117), PDF185–190 (in169–174), và chapter1 opening PDF17/in1. Đã xem render sách PDF133/in117 Fig4.5 và RTN, PDF186/in170 phân loại validation/verification. Mapping dưới đây xác minh ở mức chapter/section từ TOC và các đoạn pilot; chưa chứng nhận toàn bộ nội dung chương hay mọi lời giải của sách. File text trích xuất trong `tmp` hỗ trợ audit; có file trích xuất chưa đọc và không được tính verified chỉ vì có file.

## 3. Assessment và ranh giới

Paper 1 Theory Fundamentals: sections 1–8, written, 90 phút, 75 điểm, trả lời mọi câu, 50% AS / 25% A Level; không dùng calculator (syllabus PDF/in11). AO1 khoảng 60%, AO2 khoảng 40%, AO3 0% (PDF/in13). Đây là cấu trúc assessment, không phải quota số bài học và không phải tần suất dạng câu lịch sử.

Required: toàn bộ mục tiêu và notes/guidance của sections 1–8, kể cả assembly/two-pass assembler/trace và bit manipulation của §4.2–4.3; không bỏ chúng chỉ vì có dạng code. SQL DDL/DML §8.3 vẫn required; DML làm việc trên tối đa hai bảng, với danh sách lệnh tại p26–27.

Supporting: kiến thức tiên quyết, giải thích trực quan, phép tính hoặc ngữ cảnh giúp hiểu required objective; phải có nhãn và không được tính như thêm objective chính thức. Ví dụ sound-size arithmetic hỗ trợ §1.2 Sound; type/consistency/uniqueness checks trong sách là ví dụ bổ trợ chứ không thay danh sách validation được nêu trong syllabus; grammar SQL ngoài subset chỉ dùng khi cần giải thích, không tạo yêu cầu thi mới.

Out-of-scope cho course Paper 1: học sâu sections 9–20 (Paper 2/3/4), floating point chương13, Boolean algebra/Karnaugh maps/flip-flops chuyên A Level, lập trình Python thực hành, OOP/recursion, ML/search algorithms; không đem sample Paper 3 Unit13 vào nội dung P1. AI về ứng dụng và tác động xã hội/kinh tế/môi trường §7.1 vẫn required. Encryption/digital signatures mức §6.1 vẫn required dù sách chương17 đi sâu hơn. Video production/calculations ở sách §1.2.4 tự ghi beyond syllabus (PDF36/in20), không đưa vào required P1. Supporting link tới chủ đề khác không mở rộng phạm vi kiểm tra.

## 4. Map sách đã xác minh ở mức section

Tất cả các khoảng dưới là cửa sổ tìm nguồn dự kiến, không tuyên bố mọi trang trong đó đã audit. In/PDF được tách rõ. TOC nguồn: sách PDF7/in v; điểm bắt đầu chương9 PDF8/in vi là in217, do đó khung chương8 kết thúc trước in217.

| Domain syllabus | Locator syllabus PDF/in | Book section và khoảng in | Khoảng PDF | Trạng thái |
|---|---|---|---|---|
| 1 Information representation | 14–15, §1.1–1.3 | Ch1 in1–26; §1.1 từ2, §1.2 từ15, §1.3 từ21 | 17–42 | Section map checked; pilot excerpts checked |
| 2 Communication | 16–17, §2.1 | Ch2 in27–67; §2.1 từ28; §2.2 internet từ54 | 43–83 | TOC map checked; chưa audit body toàn chương |
| 3 Hardware | 17–18, §3.1–3.2 | Ch3 in68–106; §3.1 từ68; §3.2 từ89 | 84–122 | TOC map checked |
| 4 Processor Fundamentals | 19–22, §4.1–4.3 | Ch4 in107–135; §4.1 từ107, §4.2 từ121, §4.3 từ130 | 123–151 | TOC map + F-E excerpt checked |
| 5 System Software | 23, §5.1–5.2 | Ch5 in136–158; §5.1 từ136; §5.2 từ149 | 152–174 | TOC map checked |
| 6 Security, privacy and data integrity | 24, §6.1–6.2 | Ch6 in159–177; §6.1 từ159; §6.2 từ169 | 175–193 | TOC map + pilot excerpt checked; discrepancy logged |
| 7 Ethics and Ownership | 25, §7.1 | Ch7 in178–195; §7.1 từ179, §7.2 từ186, §7.3 AI từ189 | 194–211 | TOC map checked; numbering khác syllabus |
| 8 Databases | 25–27, §8.1–8.3 | Ch8 in196–216; §8.1 từ196, §8.2 từ208, §8.3 từ211 | 212–232 | TOC map checked |

Coursebook §2.2 là internet, nhưng syllabus gộp vào §2.1. Coursebook §7.1–7.3 map vào syllabus §7.1. Không tự tạo syllabus §2.2 hoặc §7.2/7.3 từ heading sách.

## 5. Quyết định nguồn đề nghị Lead khóa

1. Syllabus v2 2026 là authority phạm vi. Sách là nguồn diễn giải cần kiểm, không thay QP/MS cho điểm chấm. Copyright page PDF6 của sách cũng phân biệt câu/trả lời do tác giả viết và đánh giá trong kỳ thi.
2. Check digit xếp validation theo syllabus §6.2 PDF/in24, dù sách PDF186–187/in170–171 xếp dưới verification. Ghi khác biệt trong provenance; không sửa nguồn gốc.
3. Không dùng sách để chứng minh một lời giải luôn đạt một số marks cụ thể. Stage1/2 phải có QP/MS tới câu/ý.
4. Mỗi bản VI/EN dùng cùng objective IDs/dữ kiện/logic. Tên tiếng Anh chuẩn và số section Cambridge được giữ; bản dịch/diễn giải AlgoCore gắn origin adapted/original thích hợp.

## 6. Self-review và handoff

Đã kiểm hash official/local, năm/version, toàn section1–8, phần tiếp §8.3 ở p27, offset locators, danh mục notes/guidance, ranh giới không kế thừa 2027–2029. Đã tách verified scope khỏi planned lesson coverage. Chưa có lesson/assessment mapping được nghiệm thu; chưa phân tích tần suất đề, chưa xác minh marking points. A9 phải review độc lập các kết luận quyết định và các hàng coverage plan. Các vấn đề/hành động downstream ở `ISSUES.md` không được hiểu là nội dung đã đạt.
