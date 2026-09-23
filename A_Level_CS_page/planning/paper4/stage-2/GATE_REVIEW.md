# Lead gate — Stage 2

**Quyết định: PASS sau sửa và kiểm lại.** Ngày 19/09/2026. Lead chịu trách nhiệm quyết định; A8 đã chấp thuận QA độc lập. **Stage 3: NOT_STARTED.**

## Điều kiện nghiệm thu

| Điều kiện của playbook | Kết quả và bằng chứng |
|---|---|
| Lead trực tiếp xây, hợp nhất/tách hệ thống dạng từ QP/MS | PASS — 58 dạng có căn cứ, tên Việt–Anh, nhận diện, ranh giới, biến thể; LEAD_DECISIONS và batch Lead 2025 |
| Mọi câu/ý có phân loại đã review | PASS — 29 paper, 87 câu, 672 ý; đủ và duy nhất tất cả ID của Stage 1 |
| Ý hỗn hợp có nhiều tag đúng phạm vi | PASS — 99 ý có nhiều assessed tags; phân biệt việc mới với gọi hàm hoặc kiểm thử |
| Giữ context và phụ thuộc câu trước | PASS — source_part được giữ nguyên, context cấp câu/paper và source files đầy đủ; graph không cycle/self-link; hai parent refs được mở rộng có giải thích |
| Tách chủ đề, kỹ năng, dạng và biến thể | PASS — contract trong catalog/LEAD_DECISIONS; kỹ năng là chỉ mục, không giả làm rubric hoặc điểm riêng |
| Danh sách dạng dễ nhầm | PASS — 20 cặp, 40 tham chiếu, 39 part ID; 4 cặp biến thể giữ cùng taxonomy ID |
| Thống kê số paper, câu/ý và điểm với mẫu số | PASS — 58 dạng × 3 cách đếm × 3 vai trò × 4 chỉ số = 2.088 đối chiếu độc lập khớp |
| Không cộng trùng điểm khi nhiều tag | PASS — primary đúng 2.175 điểm gốc; 9 truy vấn hợp tập ID độc lập không đếm lại ý |
| Không suy phổ biến từ vài ví dụ | PASS — 20 dạng ít bằng chứng được gắn cờ ≤2 nhóm; không có xác suất ra đề hoặc cam kết phủ syllabus |
| Câu chưa phân loại được báo rõ | PASS — 0 ID thiếu, 0 dạng không xác định, 0 taxonomy issue cần sửa còn mở |
| Agent sửa khi Lead/QA chưa chấp thuận | PASS — 6 finding bắt buộc đã được sửa và A8 kiểm lại; lịch sử bên dưới |
| Corpus đầu vào không bị thay đổi | PASS — kiểm release Stage 1 vẫn khớp 1.809 artifact và 94 nguồn gốc |

## Vòng sửa đã đóng

1. **S2-TAX-01:** tách STRING_ROUTE khỏi STRING_SPLIT; làm rõ TYPE/record so với class OOP.
2. **S2-MAP-01:** giữ random_generation là kỹ năng trực tiếp khi main sinh số để gọi Push.
3. **S2-MAP-02:** recursive pseudocode được cung cấp là completion/translation, không phải tự thiết kế rewrite.
4. **S2-MODE-01:** thống nhất output/adapt/mixed giữa các batch, ghi rõ output có thể yêu cầu viết routine mới.
5. **S2-CO-01:** đồng nhất co-tag khai báo storage và tạo instance trong các file loader; mở rộng kiểm constructor/Board và mảng random có criterion rõ.
6. **S2-JOIN-01:** sửa liên kết báo cáo vấn đề nguồn sang SOURCE_ISSUES.json và kiểm lại target.

A8 kiểm cơ học toàn bộ 672 dòng, đọc semantic toàn bộ 140 dòng năm 2025 và các trường hợp độc lập được chọn trong lô 2021–2024. Lead đọc toàn bộ mapping của các đề đại diện, các quyết định MS và các ranh giới khó. Không tuyên bố đã có lượt kiểm ảnh độc lập thứ hai cho mọi ý, hoặc đã chạy chứng minh code nguồn.

## Bàn giao đã chấp thuận

- [EXAM_PATTERN_CATALOG](EXAM_PATTERN_CATALOG.md) và bản JSON.
- [QUESTION_PATTERN_MAP](QUESTION_PATTERN_MAP.json).
- [CONFUSABLE_PATTERNS](CONFUSABLE_PATTERNS.md) và bản JSON.
- [PATTERN_STATISTICS](PATTERN_STATISTICS.md) và bản JSON.
- [UNCLASSIFIED_REPORT](UNCLASSIFIED_REPORT.json).
- [A8_REVIEW](evidence/A8_REVIEW.md), [quyết định Lead](LEAD_DECISIONS.md), scripts và dữ liệu kiểm chứng.

Mẫu số báo cáo chính là 29 đề / 87 câu / 672 ý / 2.175 điểm. Hai cách gom nhóm 21 và 23 chỉ phục vụ kiểm tra độ nhạy. Các lỗi code xuất bản, khác biệt render, SF từ mirror và ER thiếu giữ nguyên caveat, không cản trở nhận diện dạng khi QP/MS đủ căn cứ. Chúng tiếp tục ràng buộc công việc đối chiếu rubric và kiểm lời giải ở các stage sau.

Gate này cho phép dùng sản phẩm Stage 2 làm đầu vào Stage 3; không có nghĩa toàn bộ khóa học đã hoàn tất. Stage 3 chưa triển khai trong lượt làm việc này. Chưa tạo bài học, lời giải hay minh họa động trong app.
