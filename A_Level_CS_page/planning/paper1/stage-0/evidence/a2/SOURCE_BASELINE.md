# Baseline nguồn Paper 1 - A2

Version 1.0 | 2026-09-19 | P1-S0-A2-01 | Author: A2 | SUBMITTED, chờ A9 review độc lập.

## 1. Phạm vi và kết quả

Baseline cho Cambridge 9618 Paper 1 năm thi 2026, đầu ra học tập VI/EN. Đây là kiểm kê và đánh giá rủi ro nguồn Stage 0; chưa phải question index, marking map hoặc audit đầy đủ corpus.

| Loại | Tồn tại và SHA-256 | Mở bằng pypdf / lấy page count | Đã kiểm nội dung toàn bộ |
|---|---:|---:|---:|
| Syllabus địa phương | 1 | 1 | 0 bởi A2; A3 chịu scope audit |
| Coursebook địa phương | 1 | 1 | 0 |
| Paper 1 QP | 30 | 30 | 0 |
| Paper 1 MS | 30 | 30 | 0 |
| Derived trong 4 thư mục chỉ định | 78 | Không kiểm đọc nội dung | 0 |

30 QP + 30 MS có 30 cặp cùng mã tên file, 6 cặp/năm 2021-2025; mỗi năm gồm May/June và October/November, variants 11/12/13. Không có cặp thiếu hoặc trùng mã trong tập này. Tất cả 60 cover-text qua kiểm máy có mã component, năm, session và nhãn Paper 1 đúng tên file. **Đây là kiểm nhận diện cover, không phải đối chiếu toàn bộ câu/ý QP với MS.** Chưa đếm câu, ý, marking points; chưa xác định variants tương đương hoặc số mẫu độc lập. Không có SHA-256 trùng giữa 62 nguồn chính; khác hash không chứng minh độc lập về nội dung.

Danh sách từng file, kích thước, hash, page count, trang đã extract/đã xem và pair key nằm trong [SOURCE_MANIFEST.json](SOURCE_MANIFEST.json). Đây là danh sách authoritative cho các file đã mở bằng parser.

## 2. Hai nguồn nền đã nhận diện

| Nguồn | Bằng chứng bản gốc | SHA-256 |
|---|---|---|
| `697372-2026-syllabus.pdf`, 49 trang PDF | Cover PDF p1: Computer Science 9618, exams in 2026, Version 2. A3 tải official và chịu evidence acquisition/scope audit; A2 tính lại hash bản tải của A3, khớp local. | `bf1b77a2b765d10eb4b005ecae0412add35cf6113ba3218a517893abfc9f2470` |
| `dokumen.pub_cambridge-international-as-and-a-levels-computer-science-9781510457591.pdf`, 576 trang PDF | Title PDF p5 và copyright PDF p6: David Watson, Helen Williams; Hodder Education; first published 2019; ISBN 9781510457591. | `0deb94b92267f83e4afe39c48b9c01f1419989ec56b4520903a7c5fe234b70b1` |

Sách được định danh bằng ISBN và năm xuất bản 2019. Không thấy nhãn số edition trên các trang front matter đã kiểm; **không gọi là “second edition” hoặc edition 2026**. Hai trang title/copyright không có số trang in học thuật rõ để gán; dùng locator PDF p5/p6, `printed_page: null`. Footer sản xuất `.indd 3/4` không được dùng như số trang nội dung. A3 sở hữu mapping chương/trang nội dung.

Nguồn official syllabus do A3 kiểm: https://www.cambridgeinternational.org/Images/697372-2026-syllabus.pdf. Manifest ghi path bản tải riêng của A3 và hash do A2 tái tính. Với sách và QP/MS, baseline hiện xác nhận nhận diện nội dung trong bản local; chưa so byte với một bản tải publisher/Cambridge. Tên file có `dokumen.pub` không thay thế bằng chứng edition và cũng không xác nhận nguồn phân phối gốc.

## 3. Log đọc và xem trực quan

Tất cả số trang dưới đây là **PDF 1-based**. `text_pages_extracted_1_based` khác `human_text_reviewed_pages_1_based` và `visually_reviewed_pages_1_based` trong manifest.

| File / tập | Máy mở / extract | A2 đọc text | A2 xem hình render |
|---|---|---|---|
| Syllabus local | p1 | p1 | Không; visual syllabus do A3 |
| Coursebook | p1-6 | p1-6 (p1 không có text) | p5-6 |
| `Past_Papers/2025/May_June/9618_s25_qp_11.pdf` | p1-4 | p1-4 | p2-3 |
| `Past_Papers/2025/May_June/9618_s25_ms_11.pdf` | p1-4 | p1-4 | p4-5 |
| 58 QP/MS còn lại, liệt kê riêng trong manifest | p1 của từng file | Không đọc thủ công từng cover; chỉ kiểm máy identity | Không |

Mẫu QP s25/11 p2-3 (printed 2-3): câu 1(a)/(b) có logic gates, điểm nối/dây và truth table. Text extraction chỉ giữ nhãn, làm mất hình học mạch; không thể dùng text đơn lẻ để phục dựng câu. MS s25/11 p4 (printed 4) có bảng đáp án câu 1 và điều kiện chấm theo nhóm hàng; p5 (printed 5) có bảng câu 2 với các mức điểm tối đa và điều kiện. Đã xem để đánh giá fidelity/rủi ro, chưa audit lời giải hay đánh dấu bất kỳ câu nào “accepted”.

Hình đọc được ở độ dài cạnh 1500 px: `renders/book-005.png`, `book-006.png`, `qp-02.png`, `qp-03.png`, `ms-04.png`, `ms-05.png`. Poppler báo `Dictionary key must be a name object` ở hai offset của sách; tái chạy p6 lưu nguyên stderr trong [poppler_book_stderr.txt](poppler_book_stderr.txt). Trang p5-6 render thành công và đọc rõ, nhưng cảnh báo không cho phép kết luận toàn bộ sách không lỗi. Không sửa/repair bản gốc.

## 4. Derived inventory và ranh giới

Quét tất cả file bên dưới `Topical_Papers`, `Solved_Papers`, `output/markdown`, `output/docx`: 78 file, gồm 28 candidate Paper 1/AS theory theo tên, 39 file paper khác theo tên, 11 chưa rõ scope theo tên. Tất cả có path/bytes/hash và `content_audit: not_performed`; 28 không có nghĩa 28 nguồn đã được chấp nhận. File `approved`/`final`, self-audit cũ hoặc solved answer chưa được cấp trạng thái PASS.

Ứng viên đáng xét sau này: topical AS theory; `Solved_Papers/Paper_1_QP.pdf` và `Paper_1_MS Solved.pdf`; `output/markdown/chapter2_paper1`; tài liệu chương 1-3, formula/logic/database guides và master guide trong `output/docx`. `Solved_Papers` là bản tổng hợp/đã xử lý, không được dùng thay QP/MS gốc. Các file chưa rõ tên cần đọc scope trước khi tái sử dụng.

Không inventory sâu các render/cache/copy trong `tmp`, `output/qa`, `output/pdf`, `output/html`, `output/sites`, `Workbook`, `assets` hoặc các project/curriculum khác; manifest ghi rõ exclusions. Không kế thừa nội dung Paper 2/3/4 hoặc syllabus 2027-2029. Inventory hiện có `A_Level_CS_page/sources/past_papers_inventory.json` và README được đọc làm tham chiếu; số mới được tính từ file thực tế.

## 5. Quy tắc handoff Stage 1

- Giữ nguồn gốc immutable; mọi extraction/crop/notes lưu riêng, nối source ID + SHA-256.
- Mỗi câu/ý phải có `pdf_page_1_based`, `printed_page_or_null`, `question`, `part`, component/year/session, QP locator và MS locator riêng. Chưa có locator thì ghi unknown, không suy từ số câu hoặc offset cố định.
- Gắn `origin: official / adapted / original` ở nội dung học tập. “Official document local copy” trong baseline chỉ là loại tài liệu gốc được nhận diện, không biến bản dịch/đề sửa/đáp án tác giả sách thành official marking requirement.
- Hình, bảng, dấu phủ định, đơn vị, công thức và điều kiện chấm phải so render gốc trước khi sử dụng. OCR chỉ khi cần và phải qua đối chiếu; Stage 0 chưa OCR.
- So QP/MS tới từng ý, kiểm context cha/con, tổng điểm, sự phù hợp syllabus 2026 và variant equivalence trước khi đếm coverage hoặc chọn holdout.
- A4/A3 kiểm chéo phần nguồn; A9 độc lập nghiệm thu. Các giới hạn đã biết không được chuyển thành accepted claims.

## 6. Self-review và kiểm chứng

[CHECK_RESULTS.json](CHECK_RESULTS.json) ghi kết quả thực: 62 hash tính lại trùng manifest; 0 lỗi mở parser; 30 cặp đúng cardinality 1 QP/1 MS; 0 lỗi cover identity checks trên 60 file; 0 nhóm primary byte-hash trùng. Script tái tạo: `build_baseline.py` rồi `finalize_baseline.py` (lần sau chạy sẽ ghi đè manifest/excerpts trong vùng A2; chỉ chạy khi A0 giao cập nhật phiên bản).

Self-review: đủ ba deliverable; giữ mọi output trong allowlist; không sửa nguồn/app; không sinh worker; không extract từng câu toàn corpus; không tuyên bố full-content PASS. Tồn tại riêng log rủi ro [MISSING_OR_UNVERIFIED.md](MISSING_OR_UNVERIFIED.md). Đây là **SUBMITTED**, A9 mới là reviewer độc lập; mọi số liệu dưới đây không thay quyết định gate của A0.
