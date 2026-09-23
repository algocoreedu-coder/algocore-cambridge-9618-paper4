# Definition of Done — Stage 0 và các gate nội dung tương lai

Version: 1.0.0. Owner A0. Ngày 19/09/2026. Tiêu chí dưới đây chưa phải kết quả kiểm tra; kết quả nằm trong GATE_REVIEW và báo cáo A9.

## Stage 0: các tiêu chí cần đạt ngay

| ID | Tiêu chí | Bằng chứng cần có | Người kiểm độc lập |
|---|---|---|---|
| S0-01 | Cấu hình 9618/Paper1/2026/đầy đủ VI+EN đúng yêu cầu | COURSE_SETTINGS và yêu cầu người dùng | A9 |
| S0-02 | Baseline app được đọc trực tiếp, observed/proposed tách rõ | A1 audit file/line, manifest app A0 | A9 |
| S0-03 | Nguồn chính được inventory/hash, trạng thái kiểm tra phân tầng | A2 manifest; pairing; file/trang đã xem; local/official syllabus comparison | A9 |
| S0-04 | Edition sách và version syllabus có bằng chứng | Front matter, official/local version/hash, source locators | A9 |
| S0-05 | Phạm vi Paper1 và boundary đúng 2026 | A3 scope, syllabus pages, book TOC/chapter mapping; required/supporting/out-of-scope | A9 |
| S0-06 | Coverage plan bao phủ yêu cầu syllabus đã chọn, không giả có lesson | A3 objective register/coverage plan; status và việc còn làm rõ | A9 |
| S0-07 | Ba pilot được kiểm tính phù hợp và giới hạn | A3 PILOT_SCOPE_CHECK; objective/locator | A9 |
| S0-08 | Contract dạy học có nguồn, rubric, luyện tập và ôn lại | LEARNING_PAGE_CONTRACT; block/objective/source IDs | A9 |
| S0-09 | VI/EN đầy đủ, chung dữ kiện/đáp án, parity có tiêu chí | Contract locale/IDs/glossary/controls/captions/feedback | A9 |
| S0-10 | Visual/UI có yêu cầu đúng cơ chế, accessibility và kiểm chứng | Contract chọn tĩnh/động theo mục tiêu, versioned fixtures nếu có state, UI QA kế hoạch | A9 |
| S0-11 | Giữ phạm vi Stage0 và bảo toàn app/nguồn | App hash comparison đầu/cuối; source hashes; không lesson/Stage1 mới | A9 + A0 final check |
| S0-12 | Bàn giao có thể tiếp tục, issues minh bạch | README, board/resume, decisions, source gaps với owner, work order tiếp theo dự kiến | A9 |
| S0-13 | Review độc lập cả tác phẩm Lead, không còn lỗi chặn | A9 review/findings/retest nếu cần + manifest version được review | A0 quyết định dựa review A9 |

Stage0 PASS chỉ khi S0-01–S0-13 đạt. Các câu hỏi chưa được giải ở Stage1 có thể còn mở nếu không làm sai baseline/scope/contract, được nhận diện đúng, có owner và điều kiện xử lý. Không defer lỗi bắt buộc của Stage0.

## Nội dung tương lai: cần kiểm ở stage sản xuất, chưa đánh giá PASS ở đây

- Từng objective có teaching và assessment destination; mọi claim chấm chính thức có MS locator tới câu/ý; adapted/original có nhãn và rubric đúng nguồn.
- Từng dữ kiện/hình/bảng/mark/đáp án sử dụng đã so bản gốc và kiểm độc lập phù hợp; không cộng trùng điểm parent/child hoặc gộp variant khi chưa kiểm.
- Khái niệm → worked example có lý do → guided/faded/independent practice → feedback/rubric → retrieval/next lesson đầy đủ theo package.
- Hai locale đủ và tương đương ý nghĩa, chung dữ kiện/ID/version; có glossary, alt/captions, controls/hints/feedback VI/EN.
- UI đúng metadata, route/anchor/locale, link nguồn dùng được; keyboard/focus, hẹp/zoom, light/dark kiểm bằng browser. Không dùng màu làm tín hiệu duy nhất.
- Tương tác có mô hình/fixtures/expected states, phép tính hoặc trace độc lập; change-input/reset/step đúng nếu có. Không thêm animation khi hình tĩnh đủ mục tiêu.
- Typecheck/build thành công ở phiên bản app tích hợp; test logic có ý nghĩa cho tính toán/tương tác; không yêu cầu build trong audit source Stage0.
- Critical/Major đóng và retest; mọi tiêu chí bắt buộc đạt trước ACCEPTED; chỉ coi review có hiệu lực cho version đã kiểm.

## Mức độ lỗi

Critical: scope/đáp án/điểm sai hoặc sai dữ kiện làm học sai. Major: thiếu evidence/requirement bắt buộc, thiếu locale, UI/mô phỏng không thực hiện được nhiệm vụ. Minor: lỗi không thay ý và không cản học. Reviewer ghi expected/observed/locator/owner; A0 không hạ severity để vượt gate.
