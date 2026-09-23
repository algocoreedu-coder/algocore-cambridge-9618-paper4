# Kiểm phạm vi ba pilot - A3

Version: 1.0 | Work order P1-S0-A3-01 | Author A3 | 2026-09-19 | REVIEW_PENDING (A9).

Các pilot dưới là đề xuất scope có căn cứ syllabus, chưa là bài hoàn chỉnh, chưa có official question/marking points được chọn. Nguồn/version/hash và page conventions theo `SYLLABUS_SCOPE.md`; ID nội bộ theo `COVERAGE_PLAN.md`.

## Pilot 1 - Bitmap file size và ảnh hưởng lấy mẫu âm thanh

**Required core:** syllabus §1.2 Graphics PDF/in15, AC26-1.2-01/02/03 (encoding, estimate bitmap size, quality/file-size impact); prerequisites §1.1 PDF/in14, AC26-1.1-01 về binary/decimal prefixes. Sách §1.2.1 PDF31–33/in15–17 và header PDF34/in18. Chọn tên core là “Tính dung lượng bitmap”; không gộp hai phép tính thành hai objective Cambridge explicit.

**Required Sound concepts:** §1.2 Sound PDF/in15, AC26-1.2-06/07 yêu cầu encoding và impact của sampling rate/resolution lên file size/accuracy. Sách §1.2.3 PDF35–36/in19–20 hỗ trợ giải thích. **Supporting application:** phép tính rate × resolution × duration (và channels nếu đề cho) có thể minh họa tác động, nhưng syllabus không viết một objective sound-size calculation riêng; không gọi đó là trích yêu cầu Cambridge. Chọn QP/MS liên quan ở Stage1/2 mới được nói về cách chấm của câu cụ thể.

Giới hạn: không video calculations/codec implementation. Book §1.2.4 ở PDF36/in20 tự nhận vượt syllabus. Mọi bài tự soạn phải nói rõ bits/bytes, SI/binary prefix, uncompressed/compressed, có/không header, duration/channels. Không tự giả channel count hoặc overhead trong câu official; nếu thiếu dữ kiện cần quay QP/MS. Không mặc định đổi KB=1024 khi đề không dùng quy ước đó.

Tiêu chí Stage3: A3/A4 tính độc lập kết quả từ đề gốc hoặc dữ kiện original, xác nhận dimensions/units/rounding; A6 kiểm VI/EN parity; A9 kiểm bài không vượt scope. Thực hiện bằng tay được để phù hợp calculator rule. Hình minh họa thể hiện được thay đổi dữ kiện, không chỉ trang trí. Hiện không có phép tính/đáp án pilot nào được nghiệm thu.

## Pilot 2 - Fetch-decode-execute / Fetch-Execute cycle

**Required:** syllabus §4.1 PDF/in19, AC26-4.1-07; nền AC26-4.1-01/02/03/04 (Von Neumann, registers, ALU/CU/clock/IAS, buses), và interrupts AC26-4.1-08 chỉ khi có trong outline được chọn. Tên official là Fetch-Execute (F-E), trong diễn giải phải giữ bước decode. Sách §4.1.6 PDF132–133/in116–117, Fig4.5 và RTN box p117. Chưa có QP/MS cụ thể.

Không nhập pipeline/parallel processing từ chương15; không dựng ISA tùy ý rồi gọi là Cambridge. Nếu cần lệnh ví dụ, A3/A4 kiểm semantics theo syllabus p21 và xác định instruction/address/contents rõ ràng. UI mô phỏng phải có state model và fixtures được review sau khi nội dung ổn định.

Rủi ro nguồn: sách Fig4.5 trên PDF133/in117 đặt PC increment sau CIR, trong RTN box cùng trang đặt increment sớm hơn. Không biến một thứ tự minh họa thành ràng buộc chấm duy nhất; không kết luận tương đương cho mọi trace mà chưa xác minh dependencies. Câu mô tả PC→MAR “using the address bus” trong hình cũng cần A3/A4 kiểm khi mô hình hóa đường truyền, tránh đồng nhất internal register transfer với external bus operation. Stage0 chỉ ghi rủi ro, không sửa kiến thức/đáp án thiếu QP/MS.

Tiêu chí Stage3: trace được kiểm độc lập, có trạng thái trước/sau, phân biệt địa chỉ với nội dung, chỉ rõ PC update phù hợp model; diagram và RTN nhất quán; interrupts nếu xuất hiện phải phù hợp mục tiêu. Chỉ dùng animation sau kiểm model. Hiện scope đủ căn cứ để tiếp tục theo gate; chưa có mô phỏng/trace được nghiệm thu.

## Pilot 3 - Validation và verification trong tình huống

**Required:** syllabus §6.2 PDF/in24, AC26-6.2-01/02/03. Định nghĩa integrity dựa §6.1 AC26-6.1-01. Sách §6.2 PDF185–190/in169–174, đặc biệt PDF186/in170 Table6.1 và §6.2.2; PDF187/in171 double entry/visual/check digit.

Pilot core: phân biệt mục đích, chọn check phù hợp và giải thích theo dữ liệu đầu vào; visual check/double entry; hiểu validation có thể chấp nhận dữ liệu hợp lệ về quy tắc nhưng sai sự thật. Required full-course còn có parity byte/block và checksum, cần một bài/nhánh tiếp nối riêng hoặc nằm trong outline mở rộng. Không tuyên bố pilot tình huống đã bao phủ trọn §6.2 nếu chưa dạy data transfer.

**Quyết định khi sách khác syllabus:** check digit thuộc danh sách validation ở syllabus p24. Sách p170–171 xếp check digits trong verification during data entry. Dùng phân loại syllabus cho khóa 2026; ghi provenance của thay đổi, không sao nguyên bảng/phân loại sách. Visual evidence `tmp/syllabus-p24.png` và `tmp/book-p186.png` đã được A3 xem. Type/consistency/uniqueness trong Table6.1 là bổ trợ; không thay bảy checks syllabus liệt kê.

Tiêu chí Stage3: mọi câu scenario đủ điều kiện/bounds/format; giải thích theo nhiệm vụ thay vì học thuộc nhãn; không hứa validation/verification đảm bảo dữ liệu luôn đúng. Đề tự soạn gắn original + rubric AlgoCore; dịch đề official gắn adapted, giữ tiếng Anh gốc và QP/MS locators. A3/A4 kiểm phân loại/logic, A6 kiểm ngôn ngữ và A9 độc lập nghiệm thu.

## Handoff và self-review

Cả ba pilot đều có core trong syllabus 2026; phần supporting và phần chưa phủ được ghi rõ. Required bitmap/required sound impacts không bị tráo; F-E ghi rủi ro nguồn; validation/check digit đã có authority rõ. Không gán số điểm, câu đề, frequency hoặc lời giải chưa đọc. Stage0 không triển khai lesson, visual assets hay app. A4 phải chọn QP/MS có locator trước khi authoring; A9 review scope này và quyết định Lead trước chuyển gate.
