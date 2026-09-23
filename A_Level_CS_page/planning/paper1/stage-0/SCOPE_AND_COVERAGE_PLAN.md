# Scope và coverage plan — Paper 1 năm 2026

Version 1.0.1. Owner A0. Tích hợp 20/09/2026; chờ A9 review. Căn cứ: [A3 scope](evidence/a3/SYLLABUS_SCOPE.md), [coverage register](evidence/a3/COVERAGE_PLAN.md), [pilot scope](evidence/a3/PILOT_SCOPE_CHECK.md), [issues](evidence/a3/ISSUES.md).

## Scope điều khiển

Syllabus 2026 v2, sections1–8, là authority. Paper1 Theory Fundamentals: written 90 phút, 75 điểm, trả lời mọi câu, 50% AS/25% A Level và không calculator (syllabus PDF/in11). AO1 khoảng60%, AO2 khoảng40%, AO3 0% (PDF/in13). Đây không phải quota bài học hoặc dự báo tần suất đề.

Scope gồm toàn bộ mục tiêu và notes/guidance liên quan §1–8 tại PDF/in14–27; ở p27 chỉ lấy tiếp §8.3 trước §9. Book mapping được kiểm ở mức TOC/section và đoạn pilot, không phải audit toàn bộ chương. Số PDF một-based; thân sách có offset +16 ở những trang đã kiểm; không áp offset lên front matter.

| Syllabus domain | Syllabus PDF/in | Sách: trang in / PDF | Ranh giới cần giữ |
|---|---|---|---|
| 1 Information representation | 14–15, §1.1–1.3 | Ch1: 1–26 / 17–42 | Bao gồm integer one's/two's complement; không kéo floating point Ch13 vào |
| 2 Communication | 16–17, §2.1 | Ch2: 27–67 / 43–83 | Book §2.2 internet thuộc syllabus §2.1; không tự tạo mã syllabus2.2 |
| 3 Hardware | 17–18, §3.1–3.2 | Ch3: 68–106 / 84–122 | Đủ devices/sensors/gates/truth tables; không thêm chuyên đề A Level logic nâng cao |
| 4 Processor fundamentals | 19–22, §4.1–4.3 | Ch4: 107–135 / 123–151 | Assembly, two-pass assembler, trace/addressing và shifts/masks vẫn required Paper1 |
| 5 System software | 23, §5.1–5.2 | Ch5: 136–158 / 152–174 | OS/utilities/libraries/translators/IDE theo notes |
| 6 Security, privacy and data integrity | 24, §6.1–6.2 | Ch6: 159–177 / 175–193 | Check digit là validation theo syllabus; verification gồm entry và transfer |
| 7 Ethics and ownership | 25, §7.1 | Ch7: 178–195 / 194–211 | AI applications/impacts required; không AI algorithms Paper3; book§7.1–7.3 map vào syllabus§7.1 |
| 8 Databases | 25–27, §8.1–8.3 | Ch8: 196–216 / 212–232 | Relational design/normalisation/DBMS/SQL; giữ phần SQL tiếp p27: DML query/modify trên tối đa hai tables |

Chi tiết 99 hàng quản lý nội bộ được giữ nguyên trong coverage register A3; ID `AC26-...` là mã AlgoCore cho yêu cầu hoặc nhóm yêu cầu, không là mã bullet chính thức Cambridge. Toàn bộ `coverage_status=PLANNED`; lesson/assessment/QP-MS IDs chưa có, không được tính như bài đã hoàn thành. Các guidance nhiều mục phải mở checklist con Stage2, không cộng trùng parent/child.

## Phân loại nội dung

- **Required:** toàn bộ scope syllabus trên, cả notes/guidance. Không bỏ kỹ năng vì dạng code hoặc ít thấy trong kho đề.
- **Supporting:** tiên quyết và ví dụ hỗ trợ hiểu yêu cầu. Sound-size arithmetic, type/consistency/uniqueness checks ngoài danh sách syllabus cần nhãn và không thay required rows.
- **Out-of-scope:** học sâu sections9–20, floating point, advanced Boolean/Karnaugh/flip-flops, thực hành Python/OOP/recursion và AI algorithms. Video ở sách§1.2.4 PDF36/in20 tự ghi beyond syllabus. Không loại AI ethics, encryption/digital signatures hoặc assembly nằm trong scope Paper1 chỉ vì chủ đề cũng xuất hiện ở Paper khác.

## Ba pilot đã điều chỉnh

| Pilot | Core required | Supporting / giới hạn | Điều kiện trước authoring/integration |
|---|---|---|---|
| P1 Tính dung lượng bitmap | §1.2; AC26-1.2-01/02/03; prefixes §1.1 | Sound encoding/impact là required toàn khóa; công thức dung lượng âm thanh là supporting application, không objective calculation explicit riêng | Nêu bits/bytes/prefix/header/compression/rounding; tính độc lập, làm được bằng tay; QP/MS mới xác định marking |
| P2 Fetch–decode–execute | §4.1; AC26-4.1-07 và prerequisites registers/buses | Không pipeline Paper3; không coi vị trí PC increment trong một hình là thứ tự chấm duy nhất | Kiểm model/trace, address vs contents và register/bus transfers trước animation; book PDF133/in117 có hai thứ tự minh họa |
| P3 Validation/verification trong tình huống | §6.2; AC26-6.2-01/02/03, integrity §6.1 | Pilot data entry không đồng nghĩa phủ hết parity/checksum data transfer | Theo check digit under validation syllabus PDF/in24, khác book PDF186–187/in170–171; không hứa mọi check đảm bảo dữ liệu luôn đúng |

Book bit-depth claim PDF32/in16, arithmetic/rounding PDF33/in17 và checksum guarantee PDF188/in172 là audit flags, chưa làm oracle cho bài. A3/A4 xác minh độc lập trước sử dụng; A9 kiểm lại trong cả VI/EN. Quyết định authority không sửa bản PDF gốc.

## Handoff coverage

A2 chuẩn hóa source packets Stage1; A3/A4 tạo hai chiều objective→teaching/assessment và bài→required/supporting Stage2. Objective chưa có official QP phải có original task/rubric có nhãn, không bị loại hoặc bịa MS. Prerequisites theo A3 register là thiết kế AlgoCore, không phải thứ tự Cambridge bắt buộc.

VI/EN dùng chung IDs/constraints/data/answers; command words theo syllabus PDF/in41–42 và ngữ cảnh câu, không quy đổi số câu văn thành điểm. Sản phẩm tương lai chỉ ACCEPTED sau học thuật, nguồn, parity và UI gates; Stage0 hiện chỉ khóa phạm vi và kế hoạch.

