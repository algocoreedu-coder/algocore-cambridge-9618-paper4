# Kế hoạch tiếp tục Stage 1 — A0 Lead

Ngày 22/09/2026. Trạng thái: PLANNED_FROM_EXISTING_EVIDENCE. Phạm vi: chỉ hoàn tất gate Stage 1 đang dở; không mở Stage 2, không viết lesson, không dịch nội dung và không sửa `algocore-fumadocs`.

## 1. Điểm xuất phát đã được chấp nhận

A0 không làm lại năm batch đã qua gate. Các candidate bất biến được dùng làm đầu vào duy nhất:

| Batch | Candidate | Decision SHA256 |
|---|---|---|
| B21 | B21-A2-v6 | `15ae3f00d8920c38a0a55e1ebc282cc6f77a93010043b41740eab80b31c64645` |
| B22 | B22-A2-v5 | `fc5f990ad9e22d42b7409aad504ea0ce2255f0bf9e0c7905a14fe2506a1f887a` |
| B23 | B23-A2-v3 | `653ea257ab0d78a16a2fc7771f5f95a63d6fc925df08b3085f45b235ac975bca` |
| B24 | B24-A2-v2 | `76797cebe4aae2932751a60a7886d4a63ded5d943d469d5fd66961b475bbe101` |
| B25 | B25-A2-v3 | `0d4a0b6725df45638f2ba5efca0f7a548ec20ff1ae77e9b5657788b34fda1ca6` |

Aggregate v2 hiện có:

| Artifact | SHA256 |
|---|---|
| `CORPUS_INDEX.jsonl` | `9f5a2f45430234c67a780f50c82134654f60d49bca911d5b5d40b381acd8b92d` |
| `CORPUS_MANIFEST.json` | `0c053152796cd539a833d8a91dbdf2954539e413824f9b961b5f522047076e0a` |
| `UNRESOLVED_REGISTER.md` | `35dfb66a70c9c2922485e18a4240170b33bc37da81ae7e5e274b738d91f4d0d0` |
| `FINAL_INTEGRITY_CHECK.json` | `1f81e4a20a3fe99f48d67b4aaec927d54b89213c3d3f174aed6e693f2f455e2d` |
| `STAGE1_SUMMARY.md` | `e6468960552a2d1418d5131ae8d9ddb1519effd7062a30ec5df0f9e9a9ef9495` |
| `evidence/a0/final/validate_aggregate.py` | `7e674f9998dcecd4b2e33830564212d1613f7d4aad0bc8bfa443dc2c8630d040` |

Corpus có 3.604 record: 60 source, 811 page, 247 question, 1.025 part, 927 marking item và 534 visual region. Có đúng 128 record `UNRESOLVED`; 30 QP đều tái tính 75. S1-I24 đã sửa lỗi count riêng trong manifest từ 207 thành 208 marking items của B21; corpus chưa từng thiếu record.

## 2. Việc còn thiếu để Stage 1 PASS

Chỉ còn chuỗi gate cuối:

```text
A0 tái đóng băng packet v2
→ A9 mới review aggregate độc lập
→ nếu có finding: đúng owner sửa version mới, A9 retest
→ A0 kiểm integrity của handoff và tự duyệt gate
→ dừng toàn bộ đội, báo người dùng kiểm tra
```

Không dùng work order A9 v1 SHA256 `ca73bb2fc1d8db436991e8e94d2735c7ac8a2fb5121e1bd53532c8efeef2b1e8`; nó đã bị supersede sau S1-I24. Không tuyên bố Stage 1 hoàn thành dựa trên A0 self-check.

## 3. Các work order tiếp tục

### P1-S1-A0-CONT-01 — Reconcile và phát hành final packet v2

- Owner: A0.
- Inputs: sáu aggregate artifact v2 ở bảng trên; năm batch decisions; Stage 0 source manifest/schema/policy.
- Write allowlist: `stage-1/` top-level, `stage-1/evidence/a0/final/`, trackers Stage 1 và trackers cấp cha.
- Việc làm: rehash toàn bộ packet; chạy validator; đối chiếu canonical multiset của PAGE/QUESTION/MARKING/VISUAL với từng accepted candidate; xác nhận 60 PDF hash, 811 page, 30 totals, 128 unresolved; tạo `A9_FINAL_REVIEW_WORK_ORDER_V2.md`; đánh dấu work order v1 `SUPERSEDED`, không xóa.
- Acceptance: mọi hash/count nhất quán; work order v2 có input version, write allowlist, outputs, tiêu chí nghiệm thu, reviewer và stop condition.
- Reviewer: A9 mới.
- Stop: sau dispatch A9; A0 không sửa frozen inputs khi A9 đang review.

### P1-S1-A9-FINAL-V2 — Review độc lập aggregate

- Owner: một A9 mới, không phải tác giả A0/A2/A3/A4 và không dùng self-report của reviewer batch làm bằng chứng thay kiểm tra.
- Inputs: packet v2 hash-pinned và năm accepted decisions.
- Write allowlist duy nhất: `stage-1/evidence/a9/final-v2/`.
- Outputs: `FINAL_REVIEW_REPORT.md`, `FINAL_MACHINE_CHECKS.json`, `INPUT_MANIFEST.json`, `OUTPUT_MANIFEST.json`, `HANDOFF_FINAL.json`.
- Bắt buộc kiểm độc lập: hash packet/decisions; exact accepted versions; semantic identity với 20 candidate files; record counts; 60 source hashes; 811 page keys; unique IDs; hierarchy/cycles; locators; 927 marking targets; 534 visual relations/dependencies; referenced files; 30 totals bằng 75; exact unresolved set 128; scope boundary không lẫn Stage 2.
- Acceptance: PASS chỉ khi không còn Critical/Major và không có input drift. Minor phải có impact, owner và disposition rõ.
- Stop: đóng băng output, báo SHA256 của `HANDOFF_FINAL.json`, không tự sửa aggregate và không tự đóng gate.

### P1-S1-FIX-XX — Chỉ mở khi A9 trả CHANGES_REQUIRED

- A0 phân loại finding theo artifact/ID/locator và xác định dependency bị ảnh hưởng.
- Nếu lỗi chỉ thuộc hồ sơ A0: A0 tạo aggregate v3, chạy lại toàn bộ integrity và giao A9 retest.
- Nếu lỗi thuộc record nguồn: mở lại đúng batch/version kế tiếp cho A2; A3/A4 review độc lập phần bị ảnh hưởng; A9 batch retest; A0 quyết định batch lại; sau đó mới merge aggregate mới.
- Không sửa trực tiếp accepted candidate cũ. Không giữ PASS của version cũ cho nội dung đã thay đổi.
- Tối đa ba worker ngoài Lead; reviewer không được là tác giả bản sửa.

### P1-S1-A0-GATE-02 — A0 audit và quyết định Stage 1

- Dependency: A9 final PASS trên đúng packet hiện hành.
- A0 rehash tất cả input/output A9, đọc report và findings, chạy lại validator, kiểm không có frozen-input drift và xác nhận output manifest tự nhất quán.
- A0 tạo `evidence/a0/final/STAGE1_FINAL_HANDOFF_AUDIT.json` và `evidence/a0/final/STAGE1_GATE_DECISION.json`.
- Chỉ khi audit PASS: cập nhật `GATE_REVIEW.md` thành PASS, đồng bộ `OPERATIONS_BOARD.md`, `BATCH_REGISTER.md`, `ISSUES.md`, `RESUME_STATE.md`, `README.md` và trackers cấp cha.
- Các issue lịch sử đã được batch acceptance khép lại phải được ghi CLOSED hoặc HISTORICAL; các giới hạn variant/authenticity/derived/coursebook phải carry forward, không giả vờ đã giải quyết.

## 4. Quy tắc dừng để người dùng kiểm tra

Sau khi A0 quyết định Stage 1 PASS hoặc CHANGES_REQUIRED:

1. Dừng mọi worker/reviewer; không dispatch Stage 2.
2. Ghi resume state với exact hashes, gate, issue mở, owner và ba bước tiếp theo.
3. Báo người dùng: gate có căn cứ, link corpus/manifest/review/handoff/audit, checks đã chạy, giới hạn còn lại.
4. Gắn trạng thái `WAITING_FOR_USER_STAGE_CHECK` vào operations board và resume state.
5. Chỉ bắt đầu Stage 2 khi người dùng đưa chỉ dẫn mới sau khi kiểm tra.

Nếu Stage 1 là CHANGES_REQUIRED, Lead vẫn dừng ở checkpoint sau khi ghi rõ blocker và work order sửa dự kiến; không tự chuyển stage. Nếu Stage 1 PASS, Lead cũng dừng; PASS không phải quyền tự động chạy Stage 2.

## 5. Thứ tự thực thi tối thiểu

| Round | Agent | Công việc | Trạng thái kết thúc |
|---|---|---|---|
| C0 | A0 | Freeze packet v2, phát hành work order A9 v2, đồng bộ tracker | READY_FOR_FINAL_REVIEW |
| C1 | A9 mới | Review độc lập, tạo 5 output và handoff | PASS hoặc CHANGES_REQUIRED |
| C2 | Owner + reviewer phù hợp | Chỉ chạy nếu có finding; sửa/retest theo dependency | RETEST_PASS hoặc vẫn CHANGES_REQUIRED |
| C3 | A0 | Audit handoff, quyết định gate, đồng bộ hồ sơ | PASS/CHANGES_REQUIRED |
| C4 | A0 | Dừng đội và bàn giao người dùng | WAITING_FOR_USER_STAGE_CHECK |

Điểm tiếp tục hiện tại là C0. Không quay lại extraction B21–B25 nếu A9 final không chỉ ra drift hoặc lỗi nguồn cụ thể.

## 6. Nợ đồng bộ tracker phải xử lý trong C0/C3

- `GATE_REVIEW.md` vẫn là bản R0 cũ; giữ IN_PROGRESS trong C0 và chỉ viết PASS sau A9/A0 final.
- Header `BATCH_REGISTER.md` còn `R1 READY`; cập nhật theo năm batch ACCEPTED và aggregate v2.
- `RESUME_STATE.md` cần current snapshot ở đầu thay vì buộc người khôi phục đọc hết lịch sử batch cũ.
- `ISSUES.md`: S1-I07, I08, I11, I12 và I15 còn trạng thái cũ mâu thuẫn với B21 đã accepted; đóng hoặc chuyển HISTORICAL bằng decision evidence. Giữ I02, I04, I05, I06, I14, I19 và I20 như giới hạn downstream/nonblocking khi phù hợp.
- `OPERATIONS_BOARD.md` phải ghi work order v1 superseded và A9 final-v2 READY/ACTIVE/PASS theo handoff thật.
- Tracker cấp cha `planning/paper1/OPERATIONS_BOARD.md` và `RESUME_STATE.md` phải phản ánh năm batch accepted, aggregate v2 và checkpoint người dùng.
- Không xóa lịch sử correction/retest; chỉ thêm current state rõ ràng và link tới bằng chứng quyết định.
