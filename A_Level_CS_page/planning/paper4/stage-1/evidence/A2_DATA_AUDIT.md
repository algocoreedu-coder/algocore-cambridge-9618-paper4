# A2 — Source-file audit, Stage 1

**Trạng thái:** submitted for independent QA and Lead gate. 2026/Python/VI–EN; corpus29QP2021–2025.

Đã phục hồi8ZIP thiếu và kiểm CRC, đường dẫn thành viên, hash SHA-256, giải nén giữ byte của toàn bộ29ZIP. Không chạy code hoặc macro từ nguồn. Mọi file được nêu ở QP trang2 đều có mặt; evidence.doc được ghi riêng như tài liệu nộp bài.

## Kết quả theo paper

| Paper | File cần có → câu trực tiếp | Nguồn ZIP | Trạng thái |
|---|---|---|---|
| 9618_s21_41 | TreasureChestData.txt → 3(b) (PDF9) | local_baseline | CRC/required names/evidence.doc PASS |
| 9618_s21_42 | TreasureChestData.txt → 3(b) (PDF9) | local_baseline | CRC/required names/evidence.doc PASS |
| 9618_s21_43 | TreasureChestData.txt → 3(b) (PDF9) | local_baseline | CRC/required names/evidence.doc PASS |
| 9618_w21_41 | Pictures.txt → 2(e) (PDF5) | recovered_public_mirror | CRC/required names/evidence.doc PASS |
| 9618_w21_42 | Pictures.txt → 2(e) (PDF5) | recovered_public_mirror | CRC/required names/evidence.doc PASS |
| 9618_s22_41 | HighScore.txt → 1(b) (PDF2) | recovered_public_mirror | CRC/required names/evidence.doc PASS |
| 9618_s22_42 | CardValues.txt → 3(c) (PDF8) | recovered_public_mirror | CRC/required names/evidence.doc PASS |
| 9618_s22_43 | HighScore.txt → 1(b) (PDF2) | recovered_public_mirror | CRC/required names/evidence.doc PASS |
| 9618_w22_41 | IntegerData.txt → 1(b) (PDF2) | local_baseline | CRC/required names/evidence.doc PASS |
| 9618_w22_42 | Characters.txt → 2(d) (PDF6) | local_baseline | CRC/required names/evidence.doc PASS |
| 9618_w22_43 | IntegerData.txt → 1(b) (PDF2) | local_baseline | CRC/required names/evidence.doc PASS |
| 9618_s23_41 | Data.txt → 1(a)(ii) (PDF2); AnimalData.txt → 3(b)(iii) (PDF9); ColourData.txt → 3(b)(v) (PDF10) | local_baseline | CRC/required names/evidence.doc PASS |
| 9618_s23_42 | Employees.txt → 3(c) (PDF11); HoursWeek1.txt → 3(d) (PDF11) | local_baseline | CRC/required names/evidence.doc PASS |
| 9618_s23_43 | Data.txt → 1(a)(ii) (PDF2); AnimalData.txt → 3(b)(iii) (PDF9); ColourData.txt → 3(b)(v) (PDF10) | local_baseline | CRC/required names/evidence.doc PASS |
| 9618_w23_41 | QueueData.txt → 2(b) (PDF5) | recovered_public_mirror | CRC/required names/evidence.doc PASS |
| 9618_w23_42 | StackData.txt → 1(b)(ii) (PDF3) | recovered_public_mirror | CRC/required names/evidence.doc PASS |
| 9618_w23_43 | QueueData.txt → 2(b) (PDF5) | recovered_public_mirror | CRC/required names/evidence.doc PASS |
| 9618_s24_41 | Trees.txt → 2(b) (PDF7) | local_baseline | CRC/required names/evidence.doc PASS |
| 9618_s24_42 | Easy.txt → 1(a) (PDF2); Medium.txt → 1(a) (PDF2); Hard.txt → 1(a) (PDF2) | local_baseline | CRC/required names/evidence.doc PASS |
| 9618_s24_43 | Trees.txt → 2(b) (PDF7) | local_baseline | CRC/required names/evidence.doc PASS |
| 9618_w24_41 | Data.txt → 1(a) (PDF2) | local_baseline | CRC/required names/evidence.doc PASS |
| 9618_w24_42 | HighScoreTable.txt → 3(b) (PDF12) | local_baseline | CRC/required names/evidence.doc PASS |
| 9618_w24_43 | Data.txt → 1(a) (PDF2) | local_baseline | CRC/required names/evidence.doc PASS |
| 9618_s25_41 | TheData.txt → 2(a) (PDF4); Blue.txt → 2(d) (PDF5) [blank output]; Green.txt → 2(d) (PDF5) [blank output]; Orange.txt → 2(d) (PDF5) [blank output]; Pink.txt → 2(d) (PDF5) [blank output]; Red.txt → 2(d) (PDF5) [blank output]; Yellow.txt → 2(d) (PDF5) [blank output] | local_baseline | CRC/required names/evidence.doc PASS |
| 9618_s25_42 | StackData.txt → 1(d) (PDF3); SecondStack.txt → 1(f)(ii) (PDF5); HashData.txt → 2(e) (PDF7) | local_baseline | CRC/required names/evidence.doc PASS |
| 9618_s25_43 | QueueData.txt → 1(d) (PDF3) | local_baseline | CRC/required names/evidence.doc PASS |
| 9618_w25_41 | HashTableData.txt → 3(e) (PDF11) | local_baseline | CRC/required names/evidence.doc PASS |
| 9618_w25_42 | TreeData.txt → 3(c) (PDF11) | local_baseline | CRC/required names/evidence.doc PASS |
| 9618_w25_43 | BinaryData.txt → 2(d) (PDF10) | local_baseline | CRC/required names/evidence.doc PASS |

## Các phân biệt bắt buộc

- `s25/41`: Blue/Green/Orange/Pink/Red/Yellow.txt là sáu file đầu ra rỗng được cung cấp; QP2(d), PDF5 xác nhận. Giữ nguyên file rỗng, không coi là hỏng/thiếu.
- `s22/41,43`: NewHighScore.txt do học sinh tạo, QP1(f), PDF4; không cần tải SF cho tên này.
- `w25/42`: Tree.txt do học sinh tạo, QP3(d), PDF11 nói rõ không cung cấp.
- `s25/42`: HashData.txt có199 dòng, phù hợp “up to200” trong QP2(e), PDF7.
- Tên trùng như Data.txt, QueueData.txt, StackData.txt được tách theo paper ID.
- evidence.doc: tài liệu trả lời, được bảo toàn và kiểm CRC/signature; không phải input cho thuật toán. Không mở macro.

## Provenance và tái lập

[A2_DATA_AUDIT.json](A2_DATA_AUDIT.json) có mọi đường dẫn gốc, hashZIP/member, CRC, encoding, số dòng, source locator và trích đoạn QP. [A2_DATA_RECOVERY.json](A2_DATA_RECOVERY.json) có URL chính xác, UTC tải, HTTPstatus, hash và nguồn public mirror của8bundle.

Tìm file trên [QualifiedQuest](https://qualifiedquest.com/past-papers/a-level/computer-science-9618/); byte tải về giữ trong `../data/recovered`, bản giải nén nằm trong `../data/extracted/<paper_id>`. Không tuyên bố đã đối chiếu chữ ký/hash với máy chủ Cambridge.

[RAR listing](A2_DATA_RAR_LISTING.txt) xác nhận archive chỉ có21SF trong baseline; không có8ZIP thiếu. RAR chưa được full integrity test vì không dùng làm nguồn bổ sung.

Chạy từ workspace: `python A_Level_CS_page/planning/paper4/stage-1/scripts/a2_data_audit.py` rồi `python A_Level_CS_page/planning/paper4/stage-1/scripts/a2_finalize_data.py`. Thêm `--recover` cho audit script để tải thiếu (không tải lại khi file/provenance đã có).

## Phần còn mở

**Không còn nguồn dữ liệu bắt buộc bị thiếu trong29paper đã khóa.** Gate toàn Stage1 thuộc Lead; A2 không tự phê duyệt corpus. Không tính nguồn dữ liệu đúng là lời giải đã đúng. Không thực hiện stage kế tiếp.
