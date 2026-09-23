# Issues hợp nhất — Paper 1 Stage 0

Cập nhật 22/09/2026. Stage0 PASS và Stage1 PASS; A9 đã review độc lập, A0 đã audit và đóng từng gate. Không còn finding Critical/Major/Minor mở đối với corpus Stage 1. Các PROD records và provenance/variant limits vẫn là downstream, không phải claim đã hoàn thành.

| ID | Trạng thái / impact | Evidence | Owner / điều kiện xử lý |
|---|---|---|---|
| CHECK-01 | CLOSED / VERIFIED_BY_A9 | A2 SOURCE_MANIFEST/SOURCE_BASELINE, A3 SYLLABUS_SCOPE: local/official hash match, sách 2019 ISBN xác minh | A9 kiểm lại nguồn và locators trước gate |
| CHECK-02 | CLOSED / VERIFIED_BY_A9 | A1 LEARNING_PAGE_AUDIT O01–O14, contract tích hợp | A9 kiểm observed/proposed trước gate |
| CHECK-03 | CLOSED / A9_PASS | Bộ Stage0 v1.0.0 và REVIEW_INPUT_MANIFEST | A9 review độc lập rồi A0 quyết định |
| SCOPE-01 | RESOLVED_FOR_SCOPE / A9_VERIFIED | A3-S0-02, syllabus24/book186–187; check digit validation | A0 khóa D12; A3/A4/A6/A9 kiểm lại lesson tương lai |
| SCOPE-02 | RESOLVED_FOR_SCOPE / A9_VERIFIED | A3-S0-03; bitmap core, sound arithmetic supporting | A0 D08; A4 chỉ claim marking sau có QP/MS |
| PROD-01 | OPEN_DOWNSTREAM; chặn sử dụng nguồn câu chưa verified | A2-U01/U02/U03/U07: per-question audit, visual fidelity, Poppler warning, variant grouping | A2/A4 Stage1; A9 nghiệm thu trước sử dụng. Không blocker baseline khi trạng thái rõ |
| PROD-02 | OPEN_DOWNSTREAM; chặn tái dùng derived như nguồn đã duyệt | A2-U04/U05/U06/U08: edition label, derived scope, không đề2026 local, provenance giới hạn | A0 chọn corpus; A2/A3/A4 xác minh trước tái dùng; không tự gán remote-certified |
| PROD-03 | OPEN_DOWNSTREAM; chặn model/claim liên quan | A3-S0-04/06/07: F-E trace/bus, bit-depth/arithmetic, checksum guarantee | A3/A4 kiểm model/calculation/limits trước Stage3; A7 chỉ vẽ sau nội dung đạt; A9 retest |
| PROD-04 | OPEN_DOWNSTREAM; chặn nghiệm thu future VI/EN UI | A1-01–06: fixed locale, routes, provenance, browser QA, pipeline/source delivery | A6/A8 triển khai, A1/A9 kiểm ở Stage3–4; không tính đã fixed nhờ contract |
| PROD-05 | PLANNED | A3-S0-08: 99 groups chưa có lesson/assessment/QP-MS IDs | A3/A4 Stage2 mở mapping thật; không bịa IDs để đủ coverage |

Chi tiết expected/observed/locator ở evidence/a1/ISSUES.md, evidence/a2/MISSING_OR_UNVERIFIED.md và evidence/a3/ISSUES.md. Finding chính thức A9 sẽ ghi riêng artifact/version, severity, owner, fix version và retest. A9 đã nộp review/findings/retest; không còn Critical/Major/Minor Stage0 mở. Các PROD records vẫn OPEN_DOWNSTREAM, không chuyển thành completed.

Stage 1 gate 22/09/2026: aggregate v2 đã qua A9 final-v2 21/21 checks và A0 final audit. Quyết định PASS nằm tại `stage-1/evidence/a0/final/STAGE1_GATE_DECISION.json`. Có 128 mapping unresolved được giữ rõ ràng; variant equivalence, remote authenticity, derived-source authority và historic evidence-digest limit tiếp tục là giới hạn downstream. Trạng thái điều phối là `WAITING_FOR_USER_STAGE_CHECK`; Stage 2 chưa bắt đầu.

## Finding độc lập trong lượt A9

| ID | Severity | Artifact/version/locator | Expected / observed | Owner / fix / retest |
|---|---|---|---|---|
| A9-M01 | Minor | SCOPE_AND_COVERAGE_PLAN v1.0.0, domain8 table | Giới hạn hai bảng áp dụng DML query/modify theo syllabus PDF27; wording cũ chỉ ghi SQL/tối đa hai tables, dễ hiểu quá rộng | A0 sửa v1.0.1; scope hash 1690445cb50d69bdd496227382495ec4f56729bf5aecf47f1658a2b9c9487ccb; CLOSED / A9 RETEST PASS; evidence/a9/RETEST.md |


Lead update 21/09/2026: B21 A2-v4 is submitted, A0 validator PASS. Handoff integrity audit is PASS for all declared outputs, inputs, source hashes/page counts, preserved v3 files, and all 16 target region/render metadata records; see vidence/a0/B21_A2_V4_A0_AUDIT.json. The correction covers 13 MS marking-item IDs on 12 source pages and four QP targets; B21_A2_V4_DISPATCH_ERRATA.md clarifies the dispatch count. S1-I15 remains open until independent A3/A4 retests and A9 batch retest pass.
