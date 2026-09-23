# Baseline nguồn được tích hợp — Paper 1 Stage 0

Version 1.0.0. Owner A0. Tích hợp 20/09/2026 từ evidence kiểm ngày 19/09/2026; chờ A9 review. Danh mục từng file và trạng thái nằm trong [manifest A2](evidence/a2/SOURCE_MANIFEST.json); không thay các giới hạn kiểm tra bằng kết luận toàn corpus đã đạt.

## Nguồn điều khiển

| Nguồn | Định danh đã kiểm | SHA256 |
|---|---|---|
| Syllabus địa phương | Cambridge 9618, exams 2026, version 2; 49 trang. Bản official A3 tải khớp byte với local, A2 tính lại hash độc lập | `bf1b77a2b765d10eb4b005ecae0412add35cf6113ba3218a517893abfc9f2470` |
| Coursebook | David Watson và Helen Williams, Hodder Education, first published 2019, ISBN 9781510457591; 576 trang. Đọc title/copyright PDF5–6; không thấy nhãn số edition | `0deb94b92267f83e4afe39c48b9c01f1419989ec56b4520903a7c5fe234b70b1` |

Syllabus URL: [Cambridge 2026](https://www.cambridgeinternational.org/Images/697372-2026-syllabus.pdf). Bản tải giữ trong `evidence/a3/tmp/official-2026-syllabus.pdf`; bản local ở workspace root `697372-2026-syllabus.pdf`. Coursebook filename tại root: `dokumen.pub_cambridge-international-as-and-a-levels-computer-science-9781510457591.pdf`.

Syllabus quyết định phạm vi; QP/MS quyết định yêu cầu/điểm của từng câu; sách là nguồn diễn giải cần kiểm chứng. Không tự gọi sách là edition 2026 hoặc second edition. Sách và QP/MS local chưa được chứng nhận byte-identical với bản publisher/Cambridge mới tải; cover identity không chứng minh mọi byte chính thức.

## Inventory và các mức kiểm

| Tập nguồn | Inventory/hash/parser open | Kiểm nhận diện | Giới hạn |
|---|---|---|---|
| Syllabus + coursebook | 2/2 | Version, title/copyright, phạm vi do A3 đọc | Sách chưa audit toàn nội dung |
| Paper1 QP/MS local 2021–2025 | 60/60; 30 cặp theo mã | 60 cover-text qua kiểm máy component/năm/session/Paper1 | Chưa audit câu/ý, marking points hoặc variant equivalence |
| Derived trong Topical_Papers, Solved_Papers, output/markdown, output/docx | 78 file có path/bytes/hash | 28 candidate P1/AS theory, 39 other-paper, 11 chưa rõ, chỉ dựa tên | Chưa đọc nội dung; không được dùng trạng thái approved/final cũ như nghiệm thu mới |

Mỗi năm có 6 cặp June/November variants11/12/13; không có cặp thiếu/trùng mã. Không có hash trùng trong 62 nguồn chính, nhưng hash khác không chứng minh 30 dạng đề độc lập. Không có đề 2026 trong tập này; corpus lịch sử không thay scope 2026.

Các mức `exists`, `hash`, `parser-readable`, `cover-identity`, `text-extracted`, `human-text-reviewed`, `visually-reviewed`, `question-verified` phải tách riêng. Source audit Stage0 không làm xuất hiện question-verified record.

## Ledger và rủi ro cần bàn giao

- [A2 baseline](evidence/a2/SOURCE_BASELINE.md) và [check results](evidence/a2/CHECK_RESULTS.json): 62 nguồn chính mở bằng pypdf; hash tái tính match. A2 xem render book PDF5–6, QP s25/11 PDF2–3, MS s25/11 PDF4–5. Các cover còn lại kiểm tự động, không ghi là đọc thủ công.
- [A3 scope](evidence/a3/SYLLABUS_SCOPE.md) và [issues](evidence/a3/ISSUES.md): đọc syllabus §1–8 PDF14–27, assessment/AO/version/command words; đọc front matter/TOC và các đoạn pilot của sách. Render đã xem gồm syllabus PDF15/24, book PDF133/186. Text extraction lưu sẵn của các trang khác không chứng minh đã đọc.
- QP logic gates/wires mất cấu trúc trong text extraction: Stage1 phải đối chiếu visual khi sử dụng hình, bảng, công thức. Poppler có dictionary warnings ở sách, nhưng trang mẫu render đọc được; kiểm từng vùng sử dụng thay vì tuyên bố toàn sách hỏng hoặc hoàn hảo.
- Xung đột check digit, các câu khẳng định về bit depth/checksum và thứ tự F-E được giữ trong [A3 issues](evidence/a3/ISSUES.md). Lead khóa phân loại theo syllabus; các mô hình/ví dụ chưa kiểm phải cách ly khỏi authoring đến khi A3/A4 xác minh.
- Các corpus gaps/derived scope/authenticity/holdout chưa chọn nằm trong [A2 gaps](evidence/a2/MISSING_OR_UNVERIFIED.md), có owner và stage xử lý. Chưa có ngân hàng câu hỏi, taxonomy hoặc đáp án được nghiệm thu.

## Quy tắc Stage1 dự kiến

Giữ nguồn gốc chỉ đọc, hash định danh; extraction/crop/OCR là bản dẫn xuất có source refs. Mỗi câu/ý giữ đủ context, parent/dependency, marks, QP/MS locator và trang PDF một-based/trang in riêng. Kiểm hình/bảng/đơn vị và điều kiện chấm trực tiếp. Gộp variants và chọn holdout sau so sánh nội dung, trước giao nguồn cho tác giả bài. Stage1 chưa được thực thi trong task này.
