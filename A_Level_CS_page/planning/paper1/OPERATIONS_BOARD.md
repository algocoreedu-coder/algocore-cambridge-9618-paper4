# Bảng điều phối Paper 1

Cập nhật: 23/09/2026. Lead A0. Stage 0, Stage 1 và Stage 2 PASS; đang dừng tại `WAITING_FOR_USER_STAGE_CHECK`. Cấu hình: Cambridge 9618 / Paper 1 / 2026 / đầy đủ VI+EN.

| Task | Package / role / assignee | State | Dependencies | Input version | Write allowlist | Outputs / reviewer | Issues / next action |
|---|---|---|---|---|---|---|---|
| P1-S0-A1-01 | UI contract / A1 / /root/a1_learning_page | ACCEPTED | Kế hoạch | Planning 19/09/2026 | stage-0/evidence/a1/ | Audit, contract proposal, issues v1.0 / A9 | A9 PASS; A0 ACCEPTED |
| P1-S0-A2-01 | Source baseline / A2 / /root/a2_source_baseline | ACCEPTED | Kế hoạch | Nguồn hiện có, snapshot 19/09/2026 | stage-0/evidence/a2/ | Baseline, manifest, missing log v1.0 / A9 | A9 PASS; A0 ACCEPTED |
| P1-S0-A3-01 | Syllabus scope / A3 / /root/a3_syllabus_scope | ACCEPTED | Kế hoạch; đối chiếu A2 khi có | Syllabus local và official 2026 | stage-0/evidence/a3/ | Scope, coverage plan, pilot check, issues / A9 | A9 PASS; 99 groups/17 sections/8 domains PLANNED |
| P1-S0-A0-01 | Integration / A0 / /root | ACCEPTED | A1/A2/A3 cho bản tích hợp cuối | Cấu hình user-confirmed | Hồ sơ điều phối + stage-0/ top-level + evidence/a0/ | Settings, baseline, scope, contract, DoD, decisions, gate / A9 | Bộ v1.0.1 sau scope fix; A9 retest PASS |
| P1-S0-A9-01 | Independent review / A9 / /root/a9_independent_review | ACCEPTED | A1/A2/A3 + A0 nộp bản có version | A0 v1.0.0 + worker v1.0; REVIEW_INPUT_MANIFEST | stage-0/evidence/a9/ | Review, findings, retest nếu cần / A0 quyết định gate | S0-01–S0-13 PASS; M01 CLOSED |

Stage 0: PASS (20/09/2026). Stage 1: PASS (22/09/2026). Stage 2: PASS (23/09/2026) — `WAITING_FOR_USER_STAGE_CHECK`. Stage 3–7: NOT_STARTED. Không có lesson, bản dịch hay UI mới được nghiệm thu.

Quyền ghi: mọi allowlist trên tương đối với `planning/paper1/`. App và nguồn gốc chỉ đọc. Không worker nào có quyền sinh sub-agent khác. A9 phải là agent mới, không là tác giả A1/A2/A3/A0.

## Handoff log

- 23/09/2026: A0 added `TOKEN_EFFICIENT_RELEASE_PLAN.md`: keep five product gates but use compact source packets, Web drafts for simple editorial work, machine checks for deterministic controls, at most two workers by default and one independent reviewer per batch. Planning only; Stage 3 remains NOT_STARTED.
- 23/09/2026: A0 published `PROJECT_PROGRESS_AND_RELEASE_PLAN.md`. Roadmap has five remaining product stages (3–7) to release-ready plus a separate Release Gate for production publish. This is planning only; Stage 3 remains NOT_STARTED and no agent was dispatched.
- 23/09/2026: Stage 2 final gate PASS; fresh A9 408/408 rehash, 14/14 checks and zero findings; A0 audit/validator PASS. All agents stopped at `WAITING_FOR_USER_STAGE_CHECK`; no Stage 3 dispatch.
- 22/09/2026: Stage 1 aggregate v2 passed A9 final-v2 (21/21 groups, 0 drift, 0 findings) and A0 final audit/validator rerun. Gate decision SHA256 `43b794f3fd5850332ab6d0f6bfed883586a365f0357744a485eea6869f8b61ed`. All agents stopped; no Stage 2 dispatch.
- 22/09/2026: Stage 2 planning v1.1 passed independent A9 retest after six planning findings were corrected. State remains NOT_STARTED; no production worker dispatched.
- 22/09/2026: user authorized Stage 2 execution. A0 C0 rehash/validator PASS; 19 authority pins and five accepted batch decisions were frozen. A3 foundation, A4 calibration and A6 glossary-v1 were dispatched with separate write scopes. B21–B25 mapping remains closed pending C1 independent review.

- 19/09/2026: đã đọc chỉ dẫn ancestor/workspace (không tìm thấy AGENTS.md), kế hoạch và work orders. Chưa có board/resume/issues cũ. Working tree có thư mục app/planning chưa tracked; giữ nguyên, không commit/reset.
- 19/09/2026: dispatch A1/A2/A3 song song, tối đa 3 worker ngoài Lead.
- 19/09/2026: A1 nộp ba file v1.0 và dừng ghi; A0 đọc evidence, chưa ACCEPTED trước A9. A3 báo official/local syllabus byte-identical và các khác biệt scope cần ghi rõ.
- 19/09/2026: A2 nộp baseline/manifest/gaps v1.0; 62 nguồn chính/30 cặp QP-MS, hash/readability và cover checks tách khỏi question audit. A0 đọc và tích hợp; không coi self-review là PASS.

- 20/09/2026: khôi phục sau A3 gián đoạn do usage limit; A3 xác nhận bốn deliverables v1.0 và HANDOFF_CHECK. A0 tích hợp đủ tám file, integrity 15 app files/62 source hashes match, local links đạt; chưa đóng gate.


- 20/09/2026: dispatch /root/a9_independent_review; A1/A2/A3/A0 IN_REVIEW. Lead chỉ cập nhật operational docs/final integrity; nội dung candidate đóng băng trong thời gian review.


- 20/09/2026: A9-M01 Minor: Lead scope table có thể khiến giới hạn hai bảng áp dụng cho toàn SQL. A0 sửa chính xác DML query/modify, nâng scope lên1.0.1; giữ review manifest ban đầu, tạo RETEST_INPUT_MANIFEST, chờ A9 retest.

- 20/09/2026: A9 nộp review/findings/retest và dừng ghi. Không finding Stage0 mở; M01 CLOSED. A0 chấp nhận các gói, đóng Stage0 PASS và dừng trước Stage1. Xem stage-0/GATE_REVIEW.md.

- 21/09/2026: người dùng giao Lead thực hiện Stage1. A0 khóa schema/policy/register; dispatch A2 batches B21/B22/B23 trong các vùng evidence riêng. Stage1 chưa có batch ACCEPTED hoặc corpus merged.
- 21/09/2026: hoàn tất A3/A4 vòng đầu B21–B23 và cập nhật review findings. A4 addendum B21 sửa count F04; B21 vẫn CHANGES_REQUIRED. A2 đang sửa B21 v2 và B23 v2; B22 v2 đã nộp structural/provenance PASS, A4 đang retest. B24/B25 vẫn đóng gate.
- 21/09/2026: B23-A2-v2 nộp và qua A0 validator (12/12 hashes; 157 pages; 46 questions; 203 parts; 175 MS records; 64 visual regions). A4 retest B23 và A4 retest B22 đang chạy; A2 B21-v2 vẫn đang sửa. A3 retests B22/B23 đang chờ slot. Không có batch gate PASS.
- 21/09/2026: B21-A2-v2 cũng đã nộp và qua A0 validator (154 pages; 48 questions; 203 parts; 167 exact MS links; 34 parent-context unresolved; 59 visual regions). A4 retest B21/B22/B23 đang chạy; A3 retests ba batch chờ slot. Không batch nào được ACCEPTED; A9 chưa bắt đầu.
- 21/09/2026: B23 A4 và A3 same-version retest v2 PASS; B23-A2-v2 sẵn sàng cho A9 độc lập. B21 A4 retest phát hiện thêm Major: tại p16 của cả S21 QP11/13, Q7(c) bị gán thành Q8(c), [3] gắn vào c-part không tồn tại thay vì câu hỏi bảng Q8 không nhãn; p16 cũng thiếu trong Q7 context. A3 B21 retest cùng phiên bản đang chạy để kiểm chứng hierarchy/mark/context. B21/B22 còn gate; chưa batch nào được nhận.
- 21/09/2026: A4 B22 retest v2 CHANGES_REQUIRED. Đã sửa đúng 16 MS page locator và 2 context case; còn 19 prefix-only link, 8 parent relation chưa khai báo unresolved, 133 mark null với ví dụ sai cấp, stale handoff hash và mô tả manifest cũ. Giữ A3 B22 trên phiên bản kế tiếp sau A2-v3. A9 B23 được giao sau khi A3/A4 cùng phiên bản PASS.
- 21/09/2026: A3 B21-A2-v2 retest CHANGES_REQUIRED; both S21 QP11/13 p16 contain Q7(b)(iii)[1], Q7(c)[3] and separate Q8 table [3]. V2 omits the two Q7 leaves, attaches Q7(c) as Q8(c), omits shared p16 context/visual relation for Q7, misses the Q8 root mark and its MS p10 visual dependency; A4 is documenting exact MS evidence. B21 needs A2-v3, then same-version A3/A4 retests.
- 21/09/2026: A9 B23 review is active with preliminary Major findings recorded in S1-I13. It is checking deleted-parent visual references, an unflagged S23/11 MS p3 table, missing W23/11 Q9 records on p16, and missing S23/11 Q6 [5]/MS locator; final scope remains pending reviewer handoff.
- 21/09/2026: A9 B23 added a render-fidelity concern for `9618_w23_qp_13-p13`: the A2 render loses the Q9 opening and `(a)(i)` label, while a fresh render from the original PDF is complete. B22 A2-v3 has been dispatched; it must freeze v2 and repair all A4-v2 findings before same-version specialist retests.
- 21/09/2026: A9 classifies the W23 QP13 p13 derived-render defect as Minor because indexed text/child content is intact; four separate corpus/visual Major findings keep B23 gated. The frozen review handoff is still pending.
- 21/09/2026: A2 B21/B22/B23 nộp v1; A0 validator kiểm JSONL, source IDs/SHA/page counts và visual manifests đạt cấu trúc/provenance. Đây không phải semantic acceptance.
- 21/09/2026: A3/A4 hoàn tất review cho B22 và B23, đều CHANGES_REQUIRED. B22 có sai 16 MS locators, 110 parts không có item locator/unresolved, thiếu marks/context và dangling parent IDs. B23 có parent-only MS links, sáu nested labels/marks sai cấp và thiếu context/visual records. A2 đang tạo v2 có lưu v1.
- 21/09/2026: A3 B21 nộp 3 Major + 1 Minor; xác nhận Q1 W21 QP11/13 bị trỏ nhầm sang p11/Q6, continuation pages/visual regions thiếu, và 18/51 visual regions liên kết (33/51 rỗng). A4 B21 có F04 count discrepancy; A4 addendum độc lập đang chạy. B21 chưa vào A9 gate.
- 21/09/2026: các review agents đầu tiên dừng do usage limit; đã retry trong giới hạn 3 worker. B24/B25 tiếp tục bị chặn tới khi B21/B22 batch gate PASS. Stage1 vẫn IN_PROGRESS, không có batch ACCEPTED hay corpus merge.
- 21/09/2026: A9 submitted B23 CHANGES_REQUIRED with four Major and one Minor findings; source hashes/page counts and same-version specialist evidence were checked. A2 B23-v3 and A2 B21-v3 corrections are dispatched alongside B22-v3. All three corrected candidates require A0 validation, then fresh same-version A3/A4 reviews and A9 retests. No batch accepted or corpus merge.
- 21/09/2026: A0 updated schema/policy/work orders to v1.1 and decision S1-D09 so whole-question marks/MS rows can be indexed without fabricated part labels; validator enforces exactly one question/part target. B23-v2 v1.0 compatibility validation reran PASS; new v3 batches must use 1.1.
- 21/09/2026: A0 independently recomputed 12 core hashes across the B21/B22/B23 v2 snapshots; all 12 match the A3/A4/A9 frozen-input manifests. A2-v3 authors are working against these immutable snapshots.
- 21/09/2026: B21-A2-v3 passes A0 schema 1.1 validation; A3 and A4 same-version v3 retests recommend PASS, with a historical A3-v2 input digest limit recorded. B21 awaits independent A9 review. B22-A2-v3 passes A0 validation and all eight active artifact hashes match; A3/A4 retests are queued behind current work. B23-A2-v3 is submitted, passes A0 validation/source/hash checks, and has zero dangling visual relations/dependencies and invalid targets in an additional check. No batch is accepted; A9 remains required after specialist gates.
- 21/09/2026: B23-A2-v3 is submitted and passes A0 schema 1.1 validation; Lead verified all 12 source/page and 12 candidate hashes, with zero dangling visual references/dependencies and zero invalid targets in an additional check. A3/A4 same-version review and A9 retest remain required.

- 21/09/2026: B22 A3/A4-v5 specialist reviews and A0 audits PASS; independent A9-v5 is active. B21 A9-v5 returned CHANGES_REQUIRED on four false Q8 context page references across three records. A0 hash-audited the full review chain and visually confirmed the source pages. B21-A2-v6 correction is active; B24 remains gated.

- 21/09/2026: B22-A2-v5 is A0 ACCEPTED after A3/A4/A9 PASS and A0 audits; decision `stage-1/evidence/a0/B22_BATCH_DECISION_V5.json`. B25-A2-v1 is released for 12 source PDFs/178 pages. B21-A2-v6 passes A0 candidate audit and is under A3/A4 retest; B24 remains gated.

- 21/09/2026: B22-A2-v3 is held for correction after A3 submitted CHANGES_REQUIRED (two Major) and A4 found the same source-backed mark/locator classes. Lead checked all six printed 75-mark totals; indexed sums are 74/71/75/75/77/72, and seven specific displayed-mark values disagree with source QP pages. A0 also source-checked 12 shifted child locators. Evidence: `A_Level_CS_page/planning/paper1/stage-1/evidence/a0/B22_MARK_SOURCE_SPOTCHECK_V3.json`, `.../B22_LOCATOR_SOURCE_SPOTCHECK_V3.json`, and `.../B22_A3_HANDOFF_AUDIT_V3.json`. Freeze v3, correct as v4, rerun A0/A3/A4, then A9.

- 21/09/2026: A9 B21-v3 is CHANGES_REQUIRED on Major visual coverage: 16 pages in the complete source sweep need regions (12 MS dependency pages and 4 QP prompt pages). A0 independently matched all 16 A2 hashes and all 30 A9 rendered-evidence hashes; validator PASS. A2 B21-v4 visual correction is dispatched in `stage-1/evidence/a0/B21_A2_V4_DISPATCH.md`; A0/A3/A4/A9 retests remain gates.


- 21/09/2026: Tiếp tục Stage 1: B21 A2-v4 visual correction đang tích hợp 16 source-page regions/dependencies sau khi quét đủ 154 trang; B23 A3/A4 v3 independent retests đang chạy; B22 A2-v4 order đã hash-pin bảy sai mark và 12 locator, READY_QUEUED tới khi reviewer B23 A3 freeze handoff. Không batch nào được nhận; A9/A0 gates vẫn theo playbook.

- 21/09/2026: B21-A2-v4 submitted; A0 handoff audit and schema validator PASS for 305/305 output hashes, 15/15 pinned inputs, 12/12 source hash/page checks (154 pages), 77 visual regions. A3 v4 retest dispatched independently; A4 v4 waits on B23 A4 slot; A9 retest still gated on both. B22 A2-v4 dispatched after B23 A3 froze; B23 A3 v3 PASS for A3 only, A4 v3 pending.

21/09/2026 Stage 1 continuation: B21 A3 v4 handoff integrity audit PASS (41 outputs, 19 inputs, 12 source PDFs/154 pages), but its recommendation is CHANGES_REQUIRED for W21/12 QP p2 Q1 [2] missing from the candidate; A4 v4 retest dispatched. B22 A2 v4 A0 integrity/validator audit PASS (411/411 handoff artifacts; 34 inputs; 12 sources/166 pages; six sums 75); A3 v4 retest dispatched. B23 A3/A4 v3 specialist gates PASS and A9 v3 retest remains active. No batch accepted. Detailed records are in Stage 1 `OPERATIONS_BOARD.md`, `BATCH_REGISTER.md`, and `ISSUES.md`.

21/09/2026 Stage 1 continuation: B23-A2-v3 accepted by A0 after independent A3/A4/A9 PASS and hash/source audits. B21 A3/A4 v4 both require a new A2 correction for W21/12 Q1 `[2]` at QP p2; B22 A3/A4 v4 reviews active. Stage 1 remains in progress with B21/B22/B24/B25 and aggregate final gate outstanding.

21/09/2026 Stage 1 continuation: B21-A2-v5 is frozen and passes A0 validator/hash/source review; A3 same-version v5 is dispatched. B22 A3-v4 recommends PASS for its gate with two deferred Minor metadata findings and its A0 handoff audit passes; B22 A4-v4 is finalizing the independent comparison. B23 remains accepted per batch. Stage 1 stays IN_PROGRESS; B24/B25 and aggregate merge/final A9 remain gated.

21/09/2026 Stage 1 continuation: B22 A4-v4 now agrees with A3-v4 and passes its specialist gate with the same two deferred Minor evidence-metadata findings; A0 audited 28 inputs, 81 outputs, 413 candidate files, 12 PDFs/166 pages and 117 A3 outputs. B22-A2-v5 metadata-only correction is dispatched. B21 A3-v5 remains active. Stage 1 remains IN_PROGRESS.

21/09/2026 Stage 1 continuation: B22-A2-v5 and B23-A2-v3 are accepted per batch. B21-A2-v6 now passes A3-v6 and A4-v6 with A0 audits; independent A9-v6 is active, and B24 remains gated until its PASS plus A0 decision. B25-A2-v1 is active after completing a 12-PDF/178-page baseline. Aggregate merge/final A9 remain unstarted; Stage 1 is IN_PROGRESS.

21/09/2026 Stage 1 continuation: B21-A2-v6 is now accepted after A3/A4/A9 v6 PASS and A0 audits; decision `stage-1/evidence/a0/B21_BATCH_DECISION_V6.json`. B24-A2-v1 is active. B25-A2-v1 is frozen, passes A0 integrity/structure/source audit and is under independent A3/A4 review. B21/B22/B23 are accepted; B24/B25 and aggregate final A9 remain open, so Stage 1 is IN_PROGRESS.

21/09/2026 Stage 1 continuation: B24-A2-v1 is frozen and passes A0 audit (392 snapshot entries, 12 PDFs/156 pages, 49 questions, 194 parts, 170 marking items, 130 regions, six totals 75). B24 A3/A4 work orders are queued behind the active B25 reviews. B25 remains under specialist review with a context-boundary risk under direct source verification. Stage 1 remains IN_PROGRESS.

21/09/2026 Stage 1 continuation: B25 A3/A4-v1 froze `CHANGES_REQUIRED`; A0 audited both handoffs. Ten context pages cross question boundaries and one W25/13 Q7(e) marking row absorbs the next table header. B25-A2-v2 is active under hash-pinned work order `stage-1/evidence/a0/B25_A2_V2_DISPATCH.md`. B24 A3/A4-v1 reviews are both active. Stage 1 remains IN_PROGRESS pending B24/B25, aggregate merge and final A9.

21/09/2026 Stage 1 continuation: B25-A2-v2 is frozen and passes A0 identity/schema/delta audit; A3-v2 retest is active and A4-v2 is queued. B24 A3-v1 PASS with A0 audit; B24 A4-v1 remains active. B21/B22/B23 stay accepted; aggregate merge remains gated.
