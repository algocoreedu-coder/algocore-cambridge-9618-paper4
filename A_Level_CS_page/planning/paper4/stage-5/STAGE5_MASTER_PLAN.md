# Master plan Stage 5

## 1. Mục tiêu và điều kiện hoàn thành

Stage 5 kiểm chứng 58 solution design ở `stage-4/SOLUTION_DESIGN_BRIEFS.json` và 58 worked-example spec. Mỗi pattern cần có implementation Python, bộ test theo hợp đồng, event trace được tạo từ lần chạy thật và evidence đủ để một agent khác tái lập kết quả.

Stage 5 PASS khi:

1. 58/58 pattern có implementation với binding rõ từ từng variant/source contract tới entry point hoặc adapter, hoặc một disposition được Lead duyệt nếu một phần chỉ kiểm output/evidence thay vì thuật toán.
2. 60/60 variant có fixture được gắn với entry point/adapter cụ thể hoặc disposition có schema và được Lead duyệt.
3. Coverage matrix khớp chính xác 719 solution obligations (74 normal, 143 boundary, 108 counterexample, 394 source-fixture links trên 368 source parts), 210 worked-example microcases và 261 evidence-capture items. Mỗi ID có run evidence hoặc disposition được duyệt; mỗi pattern còn có fixture anchor nguồn chính thức.
4. 154/154 error row được tách thành 308 obligation phases; cả detection và repair đều có assertion evidence hoặc disposition cụ thể được Lead duyệt.
5. 2236/2236 marking atom còn đúng owner/method join và được nối tới test assertion/evidence hoặc disposition được Lead duyệt; không biến assertion thành điểm giả.
6. 25 source issue ID/62 occurrence được ingest đúng một lần vào ownership registry; mỗi occurrence có một primary owner, các secondary consumer cần thiết và phân loại executable, documentary/facsimile hoặc adjudication. Mỗi applicable code requirement vẫn cần test.
7. Coverage matrix khớp đủ 58 visual brief, 174 normal/boundary/failure scenarios và 331 proposed event IDs bằng trace bundles run-based. Mỗi brief có thể cần nhiều execution trace; báo số run thực tế, không khóa cứng 58 trace. Trace phục vụ Stage 7–8, chưa phải storyboard.
8. QP/MS locator và official output contract được giữ nguyên; AlgoCore examples/rubric không gắn điểm Cambridge.
9. Không còn lỗi bắt buộc, source issue bị bỏ sót hoặc hash input drift; Lead và A8 đều ký PASS.

## 2. Input lock và toolchain

Input chuẩn là release `paper4-2026-s4-v1`, manifest SHA-256 `65988d6012a013ec33c94f5d65d1d3dd0a9aef27e140cf3765d210529b9b6a2a`; kèm Stage 1 `SOURCE_MANIFEST.json` hash `762563cdf7998ac2290f9c343d8f1b950a9817bb24c6e0a75103e9d4e82b1603` và `FACSIMILE_MANIFEST.json` hash `562e8ea1dbd4c117eef83b721fa70bfbdc05f5fcf4e8b6d00b64c612c829fbd7`. `VARIANT_INVARIANT_REGISTER.json` là input canonical tường minh. Canonical Stage 0–4 giữ read-only. Stage 5 ghi checksum artifact đầu vào theo manifest, cộng các source/QP/MS/PDF cần mở để xây fixture. S5-0 sinh inventory ID và ownership registry cố định từ các hash này; thay đổi đầu vào làm gate fail.

Preflight ghi rõ phiên bản Python 3 thực tế, OS, lệnh chạy và thư viện ngoài (mặc định chỉ dùng standard library). Không tự suy minor version sẽ có tại trung tâm thi; tương thích môi trường thi được chốt trước kỳ mock exam theo quyết định Stage 0. Seed random cố định, file test dùng thư mục tạm, ngày giờ và thứ tự collection phải deterministic.

## 3. Hợp đồng sản phẩm

Mỗi `pattern_id` có một implementation candidate, fixture set, run report, trace bundle và review record. Mỗi variant/case nối rõ tới callable/adapter, representation và oracle. Fixture dùng canonical typed snapshot và khóa harness để kiểm output, state mutation/preservation, termination và side effects. Implementation độc lập, dễ đọc trên console, dùng đúng identifier, signature, data layout, indexing, sentinel, return type, output text, mutation và termination của từng source contract. Không copy sample chưa xác minh từ MS/coursebook.

Fixture oracle phải được gắn authority: `official_qp_ms`, `official_source_adjudication`, `stage4_invariant` hoặc `AlgoCore_test_policy`. Không tự tạo expected mark split. Với hai adjudication holistic, giữ total cấp part và không gán điểm cho từng criterion.

Event trace được thu từ code đã chạy hoặc instrumented version đã chứng minh tương đương; mỗi event có pre-state, guard, action, post-state và invariant check. Không tự điền trace bằng tay rồi gọi là run output. Stage 5 không tạo asset, storyboard hoặc animation.

## 4. Thứ tự điều phối

### Gate S5-0 — preflight

Lead xác minh Stage 4 manifest/release verifier và checksum; ký harness lock có runner/version, discovery/run command, fresh-process/temp-directory clean state, environment reset, seed, encoding/newline, stdout normalization, timeout/termination policy, dependency lock và canonical snapshot serializer. Ghi Python/OS thực tế, artifact naming và nơi nộp. Nếu input/harness thay đổi thì dừng, xác định phạm vi re-run và ký revision trước khi chạy tiếp.

### Pilot P0 — stack

Thực hiện 5 pattern `STACK_SETUP`, `STACK_PUSH`, `STACK_POP`, `STACK_PAIR`, `STACK_REDUCE`. `STACK_SETUP` phải cung cấp factory/init entry point và canonical snapshot chạy được. Pilot thử cả `next_free` và `current_top`, empty/full/capacity 1, mutation/failure preservation, source fixture, exact stdout nếu có và event capture. `STACK_PAIR` phải thử đủ bốn nhánh P0: success/success commit cả hai pop; success/empty phục hồi left đúng một lần; empty/success phục hồi right đúng một lần; empty/empty không mutation, không restore và không push sentinel. Gắn từng nhánh với source contract khi nguồn quy định; trường hợp cả hai empty không được MS quy định nên xử lý là `AlgoCore_inference` / Stage 5 test policy đã được Lead duyệt. Mọi message tự viết cũng mang nhãn `AlgoCore_inference`, không gọi là literal Cambridge. `STACK_REDUCE` tách left-fold không giao hoán (`acc_before operator next`) khỏi phép tìm cực trị khởi tạo từ phần tử sống đầu tiên và có fixture toàn số âm. Input malformed/empty ngoài source precondition chỉ thuộc test policy riêng, không nâng thành yêu cầu Cambridge. Snapshot preserve so sánh typed storage, pointer, live range, cả hai stack, flags/result theo comparison mode đã khóa. Agent A5 độc lập chạy lại; A1 kiểm hợp đồng handoff và A8 kiểm schema/sample. Lead đóng pilot gate rồi mới scale.

### Batch B1–B7 — production

Giữ batch IDs và pattern IDs đã khóa ở `stage-4/BATCH_PLAN.json`. Sau pilot, chạy hai batch song song tối đa tại một thời điểm; mỗi batch có thư mục riêng. Một wave chỉ qua gate khi mọi batch trong wave PASS.

| Wave | Batch | Phạm vi | Quan hệ |
|---|---|---|---|
| 1 | B1 + B2 | foundations/text; search-sort | Có thể chạy song song sau P0 |
| 2 | B3 + B4 | queue/list; recursion/tree | Bắt đầu sau gate Wave 1 |
| 3 | B5 + B6 | dictionary/hash; OOP | Bắt đầu sau gate Wave 2 |
| 4 | B7 | files | Sau Wave 3; cần source/QP layout policy |
| 5 | B8 | integration/output/evidence | Cuối cùng vì gọi các operation đã kiểm ở B1–B7 |

### Lead batch gate

Với mỗi batch, Lead kiểm exact pattern set, all variant/error/source-caveat joins, locator/oracle authority, tất cả test result, trace hashes và unresolved finding. Nếu chưa PASS, phát rework ticket ghi ID, owner, evidence cần bổ sung và phép kiểm lại. Cấm chuyển wave phụ thuộc cho đến khi ticket required đã CLOSED_VERIFIED.

### Final Stage 5 gate

Lead chạy close order đã khóa trong schema: freeze candidate registries + hashes; A8 ghi `A8_CANDIDATE_QA.json`; Lead pass 1 ghi trạng thái promotion vào Stage 5-owned verification records; tính lại hash; A8 ghi `A8_FINAL_QA.json` để recheck hash/status cuối; Lead ký pass 2 và `GATE_REVIEW.json`; tạo `RELEASE_MANIFEST.json`; chạy verifier và ghi detached manifest digest/result. Recheck toàn bộ finding bắt buộc và exact coverage của inventory trước khi khóa `paper4-2026-s5-v1`. Tuyệt đối không sửa hoặc đổi trạng thái Stage 4. Nếu artifact đổi sau chữ ký/hash liên quan, lặp lại các bước close bị ảnh hưởng.

## 5. Work stream trong một batch

1. **A3 source contract:** chọn source fixture và ghi expected contract dựa trên QP/MS/facsimile. Giữ alternative/dependency/holistic semantics; không phân bổ lại điểm.
2. **A4 implementation:** viết candidate code theo Stage 4 blueprint và stable pattern IDs. Nộp code, API và hash, không tự ký verification.
3. **A5 independent test:** tự chạy lại từ clean state; thực thi tests, kiểm output, state, boundary, error fixtures, termination và source issues. Tác giả không được tự làm reviewer duy nhất.
4. **A6 event trace:** tạo nhiều trace record nếu một visual brief cần nhiều fixture/nhánh; mỗi record gắn frozen/instrumented source hash, execution-log hash và parity assertions chạy đạt. Kiểm event mapping theo preliminary visual brief và checkpoint bilingual.
5. **A1 learning handoff:** kiểm identifiers, tiếng Việt/Anh, nguồn authority, input/output example, tính đủ dữ liệu để Stage 6–8 dùng và hợp đồng 10-slot handoff kế thừa từ Stage 4.
6. **A8 independent QA:** kiểm toàn bộ identity, denominator, joins, hashes, dispositions và reproducibility; semantic sampling theo rủi ro trên từng batch; không sửa output.
7. **Lead:** đọc evidence, duyệt finding và ký gate.

Lead giữ tối đa hai batch production mở cùng lúc, thêm tối đa một specialist reviewer/QA chạy song song; agent không cùng sửa một file. Mọi submission ở `evidence/<agent>/<batch>/`; canonical merge do Lead sở hữu. Ngoại lệ không-code phải dùng disposition schema, liệt kê obligation/scope/reason/authority/affected IDs/reviewer/Lead decision và evidence hashes; chỉ disposition `APPROVED` mới được tính.

## 6. Quy tắc kỹ thuật và học thuật

- Python console, ưu tiên standard library; không phụ thuộc UI/IDE.
- Test cả result lẫn side effect/state khi source yêu cầu cấu trúc hoặc thao tác cụ thể.
- Đúng empty/full, chỉ số cuối, live range, stable/tie rule, kiểu trả về, case sensitivity và exact string theo từng source.
- Randomness có seed và fixture cố định; không so sánh dữ liệu random không kiểm soát.
- Với file, cô lập working directory và kiểm file mode, record boundaries, pointer/cleanup/error path.
- Với lỗi nguồn, không chứng nhận sample code của nguồn. Dùng original PDF khi layout, arrow, underscore hoặc indentation làm đổi nghĩa.
- Với source ambiguity đã adjudicate, chỉ áp dụng canonical treatment trong `SOURCE_CAVEAT_CARRYOVER.json`.
- Mọi kết luận “đạt mark” phải chỉ vào QP/MS evidence; Stage 5 không dự đoán điểm từ số assertion/test.
- Không mở rộng core thành graph coding, low-level programming hoặc declarative programming.

## 7. Trạng thái chuẩn

- `PLANNING_READY`: kế hoạch/gate/schema được duyệt, chưa chạy execution.
- `IN_PROGRESS`: preflight hoặc batch đang chạy.
- `SUBMITTED`: tác giả đã nộp đủ artifacts, chưa độc lập kiểm.
- `REWORK`: có finding required hoặc thiếu evidence.
- `EXECUTION_VERIFIED`: Lead đã kiểm sau independent run và A8/QA recheck.
- `BLOCKED`: authority/input dependency chưa giải quyết; không được tính là coverage.
- `PENDING_STAGE6_AUTHORING`, `PENDING_STAGE7_STORYBOARD`, `PENDING_STAGE8_INTERACTION`: handoff boundaries, không phải lỗi Stage 5.
