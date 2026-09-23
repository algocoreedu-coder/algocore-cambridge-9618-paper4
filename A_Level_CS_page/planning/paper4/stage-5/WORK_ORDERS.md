# Work orders Stage 5

## Điều phối chung

- Stage 4 release `paper4-2026-s4-v1` và `INPUT_LOCK.json` là read-only.
- Tối đa hai implementation batch chạy song song sau P0; agent ghi trong batch folder riêng.
- Submission phải kèm input SHA, pattern/variant/error/source IDs, test IDs và result, run command, runtime, artifact hashes, open findings và downstream status.
- Tác giả không tự review hoặc tự đóng finding. Chỉ Lead ghi canonical output/gate/release manifest.
- Không bịa source contract, output literal, mark value hay runtime assumption. Thiếu locator hoặc facsimile thì dừng đúng pattern/fixture đó và mở ticket.

## A0 — Lead / Tổng biên tập

Khóa input/runtime record và ký versioned harness/snapshot lock ở S5-0; duyệt pilot schema, chia batch và reviewer độc lập. Duyệt mọi disposition ngoại lệ, kiểm trực tiếp batch sau QA, phát/đóng rework ticket, đọc lại mọi finding và ký gate từng wave cùng final release. Giữ nguyên phạm vi 2026, Python console và song ngữ VI–EN.

## A3 — Source contract curator

Tạo fixture requirements từ QP/MS và original facsimile cho variant đang kiểm. Mỗi oracle có authority label, source ID/hash, PDF page/part, facsimile image path/hash, exact strings/types/indexing/capacity/sentinel/return/mutation/output và typed snapshots. Sinh frozen obligation inventory, gán một primary owner cùng secondary consumers cho 62 source occurrences, phân loại executable/documentary/facsimile/adjudication và nối từng variant case tới entry point. Không sửa PDF/code nguồn và không tự gán điểm cho criteria.

## A4 — Python implementation agent

Viết một candidate rõ ràng cho mỗi pattern theo solution design; giữ public signature/interface do source yêu cầu; chú thích AlgoCore adaptation khi khác source literal. Nộp module, dependency list, run command và hash. Không ghi `VERIFIED`.

## A5 — Independent test engineer

Nhận module đã freeze theo checksum và fixture contract độc lập. Chạy normal/boundary/counterexample/source/variant/regression tests trong clean state của harness lock; kiểm entry point, return/output, typed snapshots, termination/timeout, side effects và cả detection lẫn repair của error rows; lưu stdout/stderr, exit code, elapsed time, termination outcome, Python version và test IDs. Không chỉnh code tác giả; trả findings cụ thể để A4 sửa.

## A6 — Execution trace engineer

Thu một trace record cho mỗi executed fixture, từ run có hash; một visual brief có thể cần nhiều record cho các nhánh/biến thể. Liên kết scenario/event IDs, `step_id`, `visual_brief_id`, pre/post state, guard/action, invariant, output delta và source fixture. Gắn frozen/instrumented source hashes, execution-log hash, parity assertion IDs/result. So event vocabulary với Stage 4 visual brief. Không thiết kế storyboard hoặc animation.

## A1 — Learning handoff / bilingual QA

Kiểm stable IDs, source language boundary, exact identifiers/literals, paired VI–EN event labels/explanations, hợp đồng 10-slot handoff đã dùng ở Stage 4 và đủ state để Stage 6–8 dùng. Không thay đổi algorithm/source contract.

## A8 — Independent QA

Kiểm input/hash, harness clean rerun, test reproducibility, fixture-authority joins, variant-entrypoint bindings, exact coverage 58/719/60/167/58/210/261/154/308/2236/25/62/58/174/331, trace parity với executable result, disposition schema, state statuses và downstream boundary. A8 chỉ báo finding/PASS recommendation, không sửa artifact.

## Work order theo batch

```text
Stage/Batch: S5 / <P0|B1...B8>
Input release: paper4-2026-s4-v1 + exact manifest digest
Pattern IDs: exact set from BATCH_PLAN.json
Variants/errors/source issues: resolved IDs and expected coverage
Write scope: evidence/<agent>/<batch>/; batch-owned file paths only
Required artifacts: implementation with per-variant entry-point bindings, fixture contract with canonical snapshots, test run under locked harness, trace bundle with instrumentation parity evidence, bilingual handoff, approved dispositions if applicable, hashes
Read-only: Stage 0–4 canonical and other batch submissions
Independent tester: named A5 agent who did not author implementation
Required run metadata: OS, Python implementation/minor, command, runner/version, dependencies, seed, isolated workdir, timeout/termination and output-normalization policy
Authority: exact QP/MS/facsimile locators or labelled AlgoCore policy
PASS: relevant GATE_CHECKLIST entries; no unresolved required findings
Downstream: lesson/storyboard/interaction remain pending Stage 6/7/8
```

## Rework ticket

```text
finding_id:
severity: required | advisory
batch/pattern/variant/test/event/source occurrence:
artifact + hash + line/event/test locator:
observed behavior:
expected contract + source locator/invariant:
required correction:
owner:
downstream affected artifacts:
independent recheck command:
status: OPEN | RESUBMITTED | CLOSED_VERIFIED
```
