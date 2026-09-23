# Decisions — Paper 1 Stage 0

Version 1.0.0. Ngày 19/09/2026. Owner A0; chờ review tổng hợp A9.

| ID | Quyết định | Căn cứ / giới hạn |
|---|---|---|
| D01 | Paper 1, thi 2026, đầy đủ VI/EN | User-confirmed; không kế thừa cấu hình Paper4 |
| D02 | Chỉ thực thi Stage0 | Prompt thực thi; Stage1 và thay đổi app ngoài phạm vi lần này |
| D03 | A1/A2/A3 song song; A9 là reviewer độc lập mới | User work orders; tối đa A0 + 3 worker, không worker tự sinh agent |
| D04 | Theme và cấu trúc học là baseline; source mapping/VIEN routes là extension cần xây | Source app và A1 audit; không coi mẫu Paper3 là khóa Paper1 sẵn có |
| D05 | Tách tiêu chí nghiệm thu Stage0 khỏi DoD bài học/UI tương lai | Stage0 có thể PASS khi scope/contract đúng; không tuyên bố cả khóa đã đủ hoặc UI đã QA |
| D06 | Nguồn xác minh theo nhiều mức | Inventory/hash/readability/trang đã xem/semantic verification riêng; file có MS chưa đủ để gọi đáp án verified |
| D07 | Tám chủ đề và objectives theo syllabus 2026; sách là bản đồ hỗ trợ | A3 đối chiếu; internal objective IDs không tự gọi là official codes |
| D08 | Pilot1 core là bitmap file-size calculation; âm thanh tính dung lượng là supporting application | A3 phát hiện khác biệt cách diễn đạt syllabus §1.2; cần nhãn rõ và không tự gán yêu cầu thi/mark |
| D09 | Bản gốc nguồn chỉ đọc, source app hash trước/sau | Bảo toàn working tree đang có; không commit/reset hoặc reformat app |
| D10 | Khóa schema logic trong contract; chọn renderer/storage cụ thể tại pilot UI | Source hiện có sample TSX; không mặc định đã có MDX pipeline |
| D11 | Trạng thái release khác với content/UI acceptance | Publish, tài khoản, backend và chấm tự động không thuộc Stage0 |
| D12 | Check digit thuộc validation; ghi khác biệt sách thay vì sao chép phân loại verification | Syllabus §6.2 PDF/in24 so book PDF186–187/in170–171; A3-S0-02 |
| D13 | Khóa 99 nhóm yêu cầu nội bộ ở trạng thái PLANNED, không gọi là số objective Cambridge hoặc bài đã có | A3 COVERAGE_PLAN v1.0: 17 sections, 8 domains; lesson/assessment/QP-MS refs còn null |
| D14 | F-E model, book numerical claims và checksum guarantee cần kiểm trước authoring | A3-S0-04/06/07 có locator, owner A3/A4 và gate Stage3; không dùng mô hình/chỉ dẫn chưa verified |

Ngày 20/09/2026 đã tích hợp evidence cụ thể trong SOURCE_BASELINE, SCOPE_AND_COVERAGE_PLAN và LEARNING_PAGE_CONTRACT. Nếu A9 phát hiện thiếu căn cứ, mở lại quyết định tương ứng trước PASS. Phạm vi 2026 và ngôn ngữ giữ nguyên khi tiếp tục sau gián đoạn.
