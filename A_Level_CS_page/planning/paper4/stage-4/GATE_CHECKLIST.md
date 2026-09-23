# Gate checklist Stage 4

## Gate P0 — khóa schema bằng pilot stack

- [x] 5/5 stack pattern có card và mọi assessed part được nối tới QP/MS.
- [x] Top-pointer conventions, empty/full, mutation order và rollback/reduction được tách đúng variant.
- [x] Mỗi official advice có marking locator; AlgoCore risk có nhãn.
- [x] Method steps có action, reason, invariant/check và điều kiện dừng.
- [x] Solution design mang trạng thái chờ Stage 5; không có code/run claim.
- [x] Preliminary visual brief nêu state/event/Predict nhưng không giả storyboard hoàn chỉnh.
- [x] VI/EN parity đạt ở trường student-facing.
- [x] A8 kiểm độc lập, Lead đóng finding và ký `PILOT_GATE=PASS`.

Nếu pilot FAIL, không nhân schema cho batch B1–B8.

## Gate từng batch

- [x] Pattern set đúng batch, không thiếu/lặp hoặc đổi taxonomy Stage 2.
- [x] Assessed part set bằng Stage 2; source examples và locators không bị thay.
- [x] Mọi requirement QP và marking point MS áp dụng được nối tới method step/evidence.
- [x] Alternative/conditional/dependent criteria không bị chuyển thành số điểm tuyệt đối.
- [x] Confusable pattern/implementation variant được giải thích bằng khác biệt quan sát được.
- [x] Source issue và book gap liên quan có disposition; không sao chép code chưa kiểm chứng.
- [x] Error row có consequence, detection và repair; authority label đúng.
- [x] Assessment requirement liên quan có observable evidence và brief VI/EN.
- [x] A5 phản biện normal/boundary/counterexample; A1 kiểm schema/parity; A8 recheck finding.
- [x] Lead đọc trực tiếp toàn bộ artifact của batch và ký PASS/REWORK.

## Final aggregate gate

- [x] 58/58 pattern card ở `DESIGN_REVIEWED`.
- [x] Mọi variant axis có disposition; 20/20 contrast được phản ánh; method-changing variant có decision rule và micro-case.
- [x] 672/672 part có marking-map disposition; tổng index vẫn 29 paper, 87 question, 2175 marks.
- [x] Mọi marking atom có MS locator hoặc được loại khỏi official map với lý do.
- [x] 20/20 contrast Stage 2 được phản ánh đúng.
- [x] 107/107 assessment requirement vào 37 assessment brief; 65 gap objective và 19 book gap có xử lý Stage 4.
- [x] 58 solution design, 58 primary anchor example spec và 58 visual decision tồn tại; trạng thái downstream đúng.
- [x] Mọi source issue/caveat liên quan có carryover disposition và Stage 5 obligation.
- [x] Không có nội dung low-level/declarative/graph-code bị đưa vào core.
- [x] VI/EN parity không thiếu ID/block; official English và AlgoCore translation/support phân biệt rõ.
- [x] Stage 1, 2, 3 release verification PASS; inputs không drift.
- [x] A8 final QA PASS/recommended PASS, không còn finding bắt buộc.
- [x] Lead pass 1 và pass 2 hoàn tất, có evidence và checksum các artifact A8 đã review.
- [x] `GATE_REVIEW=PASS`, release manifest khóa; Stage 5 ghi `NOT_STARTED`.

Build/schema checks không thay semantic review. Một tiêu chí bắt buộc FAIL làm toàn gate `REWORK`; không dùng tỷ lệ trung bình để bù.
