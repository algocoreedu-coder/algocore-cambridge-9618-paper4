# Resume state — Paper 1

## Current authoritative snapshot — 23/09/2026

**Stage0 PASS; Stage1 PASS; Stage2 PASS — WAITING_FOR_USER_STAGE_CHECK.** Stage 2 fresh A9 final-v1 rehashed 408/408 inputs, passed 14/14 independent checks and source sampling with zero findings. A0 final audit and validator rerun passed. Decision: `stage-2/evidence/a0/final/STAGE2_GATE_DECISION.json`, SHA256 `df835cafdc96a85528f8ef650f6ee3098c54c034fd113641cfffc806433cb79b`.

Exactly 128 unresolved records remain explicit and must not be inferred. Stage 2 establishes planning and traceability only; lessons, bilingual production and app work have not started. All agents are stopped and Stage 3 has not been dispatched. The dated entries below are retained as history and do not override this snapshot.

Release planning update 23/09/2026: `PROJECT_PROGRESS_AND_RELEASE_PLAN.md` records five remaining product stages (3–7) to a release candidate and a separate Release Gate for production publish. This plan does not authorize or start Stage 3.

Token-efficiency update 23/09/2026: `TOKEN_EFFICIENT_RELEASE_PLAN.md` is the operating strategy for future stages. Use compact work orders, `fork_turns=none`, at most two workers by default, one independent reviewer per batch, machine checks for deterministic work, delta manifests between rounds and ChatGPT Web drafts for simple editorial work. Stage 3 remains NOT_STARTED.

Stage 2 planning update 22/09/2026: plan v1.1 is `PLAN_READY` after independent A9 retest PASS with 0 Critical/Major/Minor. Execution is now active from `stage-2/LEAD_START_PROMPT.md`; resume from `stage-2/RESUME_STATE.md`.

Cập nhật 21/09/2026. **Stage0 PASS / hoàn thành; Stage1 IN_PROGRESS.** Settings 9618/Paper1/2026/full VI+EN, giữ AlgoCore learning structure/theme.

A1/A2/A3 v1.0 của Stage0 đã được A9 review độc lập và A0 ACCEPTED. Stage0 không có finding Critical/Major/Minor đang mở. Stage1 đang có worker chạy; chi tiết task, write scopes và gate nằm ở `stage-1/OPERATIONS_BOARD.md`.

Kết quả: source baseline 62 primary/30 cặp QP-MS, 78 derived inventory; syllabus official/local match; coverage PLAN 99 internal groups/17 sections/8 domains; learning-page contract full VI/EN, DoD và pilot scope đã khóa. Không có lesson/assessment mapping thực hoặc UI mới được nghiệm thu. App/source hashes kiểm trước/sau không đổi.

Bằng chứng chính: stage-0/GATE_REVIEW.md; stage-0/evidence/a9/STAGE0_REVIEW.md và RETEST.md; stage-0/FINAL_MANIFEST.json; stage-0/evidence/a0/INTEGRITY_CHECK.json. REVIEW_INPUT_MANIFEST ban đầu được giữ riêng để trace vòng sửa.

Stage1: A3/A4 hoàn tất review B21–B23 và đều yêu cầu sửa Major. A4 addendum đã reconcile B21 F04: 18/51 regions have links, 33/51 empty; Q1 visual targets on W21 QP p11 are semantically wrong. A2 v2 cho B21/B22/B23 đã qua A0 structural/provenance validator; A4 B21 retest và A3 B21 same-version retest đang chạy; B22 A4 v2 CHANGES_REQUIRED với 19 prefix-only locators, 8 parent links chưa ghi unresolved, marks bị thiếu/sai cấp, và stale hashes/manifest note; cần A2-v3 rồi mới A3/A4 cùng phiên bản. B23 A4 và A3 retest PASS, A9 đang review độc lập. A4 báo thêm lỗi B21: p16 của S21 QP11/13 phân loại nhầm Q7(c) thành Q8(c), gắn [3] vào child không tồn tại, thiếu [3] ở Q8 question-level, và thiếu p16 trong Q7 context. V1 snapshots được giữ nguyên. Chưa có batch ACCEPTED và chưa merge corpus. Không mở B24/B25 cho tới khi B21/B22 qua A9 batch gate. Giới hạn tối đa ba worker ngoài Lead và reviewer phải độc lập với tác giả được giữ nguyên.

Update 21/09/2026: A9 đang kiểm B23 và đã ghi nhận ban đầu 10 visual relations đến deleted marking-parent IDs, thiếu region/dependencies cho MS S23/11 p3 table, không có W23/11 Q9(a,b) records ở p16, và thiếu mark/MS locator cho S23/11 Q6 [5] ở QP p13/MS p9. A9 chưa hoàn tất kiểm scope, nên đây là preliminary findings trong S1-I13.

Update 21/09/2026: A9 định mức lỗi ảnh render W23 QP13 p13 là Minor (record text đúng, nhưng ảnh dẫn xuất mất chữ và không dùng làm bằng chứng). Bốn Major vẫn giữ B23 gate mở; final review artifacts đang chờ.

Update 21/09/2026: A9 nêu thêm render-fidelity concern ở W23 QP13 p13 (mất phần mở đầu Q9 và nhãn (a)(i)); bản A9 render lại từ PDF gốc hiển thị đầy đủ. A2 B22-v3 đã bắt đầu, giữ nguyên v1/v2 và sửa toàn bộ finding A4-v2. A3/A4 B22 retest phải đợi cùng phiên bản v3.

Issues downstream vẫn mở, có owners/gates: per-question/visual audit, variants/derived/source provenance; F-E trace/bus, book bitmap/numeric/checksum flags; VI/EN authoring, content pipeline/routes, UI tests. Xem ISSUES.md. Không cần hỏi lại cấu hình đã xác nhận; không làm lại Stage0 trừ khi nguồn/scope đổi hoặc có finding mới.

Latest status 21/09/2026: A9 final B23 report is CHANGES_REQUIRED (4 Major/1 Minor), not a pending review. A3/A4 v2 retests for B21 are CHANGES_REQUIRED; A4 B22-v2 is CHANGES_REQUIRED and A3 waits on a corrected version. A2-v3 for B21, B22 and B23 is in progress in separate write areas. No batch is accepted and no corpus is merged; next gate after each A0 validator is same-version A3/A4, then A9 retest.

Protocol update: schema, extraction policy and work orders are v1.1; decision S1-D09 adds explicit whole-question marking targets. The A0 validator compiles and B23-v2 passes under its frozen schema 1.0. New A2-v3 batches must declare schema 1.1 and use the explicit nullable question/part target pair.

Freeze verification: A0 independently recomputed 12 core artifact hashes across B21/B22/B23 v2 snapshots and matched all 12 against the corresponding A3/A4/A9 input manifests. Three versioned A2 corrections are in progress; no batch is accepted or merged.

Latest status 21/09/2026: B21 A2-v3 passed A0 validation; A3 and A4 v3 recommend PASS for their specialist gates. S1-I14 records the unavailable historic digest in the A3-v2 handoff as a non-blocking provenance limit; A9 v3 review remains pending. B22 A2-v3 passed A0 validation and Lead hash checks; A3 is queued after B23 A2-v3 handoff, A4 after B21 A4-v3, then A9. B23 A2-v3 is submitted after A9 CHANGES_REQUIRED; A0 validation/source/hash checks and extra visual cross-reference check pass, while A3/A4/A9 v3 reviews remain pending. No batch is accepted, and Stage 1 remains IN_PROGRESS.

21/09/2026: A3 B22-v3 submitted CHANGES_REQUIRED (two Major mark/locator findings); A4 is finishing its independent handoff. Lead evidence confirms all six cover totals of 75, candidate sums 74/71/75/75/77/72, seven mark-value discrepancies, and 12 child-page locator errors. See `stage-1/evidence/a0/B22_MARK_SOURCE_SPOTCHECK_V3.json`, `B22_LOCATOR_SOURCE_SPOTCHECK_V3.json`, and `B22_A3_HANDOFF_AUDIT_V3.json`. Keep v3 frozen; correct in v4 and repeat A0/A3/A4 before A9. Stage 1 remains in progress.

21/09/2026: A4 B22-v3 also submitted CHANGES_REQUIRED with the same seven mark-value and 12 page-locator defects; A0 recomputed 87/87 handoff-declared file/render hashes. A9 B21-v3 independently returned CHANGES_REQUIRED for 16 missing visual-risk page regions/dependencies; A0 matched 16 A2 and 30 A9 evidence hashes. A2 B21-v4 has been dispatched. B21/B22 remain gated; B23 still needs same-version A3/A4 and A9 review. Stage 1 remains IN_PROGRESS.


Update 21/09/2026: Tiếp tục Stage 1. B21 A2-v4 đã render đủ 16 trang A9 visual finding và quét 154 trang, chưa ghi nhận risk page bổ sung; vùng/dependency và handoff đang được hoàn thiện. B23 A3/A4 v3 retests vẫn đang chạy. B22 A2-v4 correction order đã chuẩn bị và hash-pin; chờ B23 A3 reviewer đóng handoff trước khi giao sửa để giữ độc lập. Stage 1 vẫn IN_PROGRESS, chưa batch nào được ACCEPTED.


Update 21/09/2026: Latest work completed: B23 A3-v3 retest PASS for its specialist gate; A0 verified 45/45 input hashes, 35/35 output/render hashes, 12/12 source PDF hash/page checks (157 pages). B21 A2-v4 is submitted and A0 integrity/structural checks pass; A3 v4 retest is assigned to an independent reviewer, A4 waits for the current B23 A4 handoff, then A9. B22 A2-v4 correction has been dispatched to the B22-v3 author after the B23 A3 handoff froze. Stage 1 remains IN_PROGRESS; no batch is ACCEPTED and no corpus merge has started.

21/09/2026 resume: active gates are B21 A3 CHANGES_REQUIRED on missing W21/12 Q1 [2] mark with A4 independent v4 retest dispatched; B22 A2 v4 A0 audit/validator PASS with same-version A3 retest dispatched; B23 A3/A4 v3 PASS and A9 retest active. No batch accepted; Stage 1 IN_PROGRESS. Resume from Stage 1 `OPERATIONS_BOARD.md`, `BATCH_REGISTER.md`, `ISSUES.md`, and current A0 audits.

21/09/2026 resume: per-batch B23 ACCEPTED against B23-A2-v3; A0 decision artifact `stage-1/evidence/a0/B23_BATCH_DECISION_V3.json`. B21 v4 A3/A4 both CHANGES_REQUIRED due missing displayed Q1 [2] at W21/12 QP p2; new v5 correction is next. B22 v4 A3/A4 retests are active. Overall Stage 1 remains IN_PROGRESS; aggregate A0 merge/A9 final review requires all five batches.

21/09/2026 resume: B21-A2-v5 is submitted and A0 audit PASS (17 inputs, 309 outputs, 310 snapshot entries, 12 PDFs/154 pages; six sums 75); A3 v5 is active, A4/A9 remain. B22 A3-v4 PASS_WITH_TWO_MINOR_DEFERRED and A0 handoff audit PASS (36 pins, 413 candidate files, 117 outputs, 12 PDFs/166 pages, 22-page union); await A4-v4 handoff before correction/gate decision. B23 is accepted per batch; overall Stage 1 remains IN_PROGRESS.

21/09/2026 resume: B22 A4-v4 also PASS_WITH_TWO_MINOR_DEFERRED and A0 handoff audit PASS; B22-A2-v5 is dispatched for metadata-only correction while keeping corpus indexes byte-identical. B21 A3-v5 is active. B23 remains accepted per batch; B24/B25 and aggregate final gates remain open.

21/09/2026 update: B21 A2 v5 correction work is active for the missing W21/12 Q1 `[2]` source mark, after A3/A4 v4 both returned CHANGES_REQUIRED. B22 A3/A4 v4 are inspecting correction-evidence metadata; B23 is accepted at per-batch gate. Aggregate Stage 1 remains open.

21/09/2026 current resume: B21-A2-v5 passed A3/A4 but failed independent A9 on Major `A9-B21-CTX-01`, four false Q8 page references in three context records; A0 accepted the review evidence and dispatched a narrow immutable B21-A2-v6 correction. B22-A2-v5 passed A3/A4 with A0 audits and is now under independent A9 review. B23 remains accepted per batch. B24/B25 are still gated, and aggregate merge/final A9 have not started.

21/09/2026 current resume: B22-A2-v5 is accepted per batch after A9 PASS with zero findings and complete A0 audit; B25-A2-v1 is active. B21-A2-v6 passes A0 validation and is under independent A3/A4-v6 retest, with A9-v6 still required. B23 remains accepted. B24 waits for B21 acceptance; aggregate merge/final A9 remain unstarted.

21/09/2026 current resume: B21-A2-v6 passes independent A3-v6 and A4-v6 specialist gates and both A0 handoff audits; A9-v6 is active under a frozen hash-pinned work order. The only recorded v6 Minor is semantic-diff evidence metadata and has no corpus impact. B22-A2-v5 and B23-A2-v3 remain accepted. B25-A2-v1 is active with its 12-PDF/178-page baseline complete; B24 remains gated on B21 A9 PASS and A0 acceptance. Stage 1 and aggregate merge/final A9 remain open.

21/09/2026 current resume: B21-A2-v6 is accepted after A3/A4/A9 PASS and A0 audits; B21 decision SHA256 `15ae3f00d8920c38a0a55e1ebc282cc6f77a93010043b41740eab80b31c64645`. B24-A2-v1 is active under a 12-PDF/156-page hash-pinned order. B25-A2-v1 is frozen and passes A0 audit; independent A3/A4 reviews are active. B21/B22/B23 are accepted per batch. Stage 1 remains IN_PROGRESS pending B24/B25 acceptance, aggregate merge and final A9 review.

21/09/2026 current resume: B24-A2-v1 is frozen and passes A0 integrity/structure/source audit; A3/A4 B24 reviews are queued until the current B25 A3/A4 reviews freeze. B25 has a source-backed context-boundary risk under independent review and is not accepted. B21/B22/B23 are accepted. Stage 1 remains IN_PROGRESS pending B24/B25, aggregate merge and final A9.

21/09/2026 current resume: B25 A3/A4-v1 are frozen `CHANGES_REQUIRED` and their A0 evidence audits PASS. B25-A2-v2 is active for ten exact context-boundary removals and one MS-row boundary correction; the original-source Q8(b) wording is explicitly preserved. B24 A3-v1 and A4-v1 are active independently. B21/B22/B23 remain accepted; B24/B25 and aggregate final gates remain open, so Stage 1 is IN_PROGRESS.

21/09/2026 current resume: B25-A2-v2 is frozen and passes A0 candidate audit; A3-v2 retest is active and A4-v2 is queued. B24 A3-v1 PASS and A0 handoff audit PASS; B24 A4-v1 is active. Stage 1 remains IN_PROGRESS pending both batch A9 gates, A0 decisions, aggregate merge and final A9.

22/09/2026 final current state: all earlier active-review entries are historical. Stage 1 PASS after A9 final-v2 and A0 final audit; decision SHA256 `43b794f3fd5850332ab6d0f6bfed883586a365f0357744a485eea6869f8b61ed`. State is `WAITING_FOR_USER_STAGE_CHECK`; all agents are stopped and Stage 2 is NOT_STARTED.

Stage 2 final update 23/09/2026: fresh A9 rehashed 408/408 inputs, passed 14/14 independent checks and source sampling with zero findings. A0 final audit and validator rerun passed. Decision: `stage-2/evidence/a0/final/STAGE2_GATE_DECISION.json`, SHA256 `df835cafdc96a85528f8ef650f6ee3098c54c034fd113641cfffc806433cb79b`. All agents are stopped at `WAITING_FOR_USER_STAGE_CHECK`; Stage 3 is not started.
