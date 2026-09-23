# A5 — Learning experience planning review cho Stage 4

Ngày lập: 19/09/2026  
Vai trò: A5 — Learning experience planning  
Trạng thái: **SUBMITTED_FOR_LEAD_INTEGRATION**  

Tài liệu này đề xuất cách Lead điều phối Stage 4 để thiết kế phương pháp giải và trải nghiệm học tập cho Cambridge 9618 Paper 4, năm thi 2026, Python console, đủ VI/EN. Đây là kế hoạch sản xuất và gate; không phải bài học, lời giải, event chạy được hay thay đổi ứng dụng.

## 1. Kết luận sau khi đọc bàn giao

Stage 3 đã PASS đúng phạm vi **thiết kế và truy vết nguồn**: 58 pattern, 13 package, 26 lesson, 108 knowledge block, 37 assessment destination và 107 assessment requirement. Tất cả lesson, câu luyện, lời giải, Python, event động và route website vẫn là `NOT_AUTHORED` hoặc `NOT_IMPLEMENTED`. Stage 4 phải giữ ranh giới đó: biến mapping thành các bản thiết kế nội dung có thể giao cho Stage 5 trở đi, không nâng trạng thái thành nội dung đã kiểm chứng.

Nguồn điều khiển của kế hoạch này là:

- `stage-0/LEARNING_PAGE_CONTRACT.md`: 10 slot bắt buộc, parity VI/EN, event contract, nguồn và gate.
- `stage-3/LESSON_PACKAGES.json`: package/lesson/block/assessment IDs và routes dự kiến.
- `stage-3/BOOK_KNOWLEDGE_MAP.json`, `COVERAGE_MATRIX.json`, `PREREQUISITE_MAP.json`: chuỗi pattern → kỹ năng → kiến thức → nguồn → objective → lesson.
- `stage-3/GAP_REGISTER.json` và `LEAD_DECISIONS.md`: các giới hạn sách/corpus và nghĩa vụ tự biên soạn.
- `stage-3/GATE_REVIEW.md`, `QA_REPORT.md`: ý nghĩa và giới hạn của PASS.

Baseline app được giữ chỉ đọc. Nó hiện có một trang mẫu Paper 3 bằng TSX, `DocsLayout/DocsPage/DocsBody`, TOC/sidebar viết tay, root `lang=vi`, provider locale `vi`, một worked example tĩnh và lời giải qua `details`. Chưa có route Paper 4, pipeline nội dung, locale routing, event engine, Python runner, chấm điểm, tài khoản hay lưu tiến độ. Do đó Stage 4 chỉ thiết kế renderer-neutral; không giả định MDX/schema/runtime đã tồn tại và không dùng app build làm bằng chứng nội dung.

## 2. Phạm vi Stage 4 mà Lead cần khóa

Stage 4 tạo **authoring plans** đủ cụ thể để agent Stage 5 có thể viết và kiểm Python mà không phải tự đoán phương pháp. Mỗi plan phải chỉ rõ nội dung sẽ dạy, lý do của từng bước, trường hợp biên, bằng chứng chấm điểm, dữ liệu ví dụ, storyboard Action View và lộ trình luyện tập. Stage 4 không viết lesson body hoàn chỉnh, code lời giải, expected output thực thi, event implementation, route hoặc component.

Một package được xem là đã thiết kế khi cả 10 slot của ID Stage 3 đều trỏ tới lesson/block/pattern/assessment cụ thể và mỗi đích có brief VI/EN đồng nghĩa. Không bắt mỗi lesson lặp đủ 10 slot; contract áp dụng ở package level, nhưng link phải đến block chính xác để người học không rơi vào một trang hoặc chapter chung chung.

Đầu ra Stage 4 nên có hai lớp:

1. **Machine-readable planning registry**: IDs, joins, status, ownership, parity và storyboards để kiểm tự động.
2. **Human review views**: phương pháp, cue/confusable, worked-example brief, marking-pitfall map, practice ladder và quyết định visual để Lead đọc được mà không dò JSON.

Tên file chính thức do Lead chốt trong work order. A5 khuyến nghị tách registry lesson/method, storyboard Action View, parity matrix, QA findings và gate; không để nhiều agent cùng sửa một aggregate.

## 3. Hợp đồng 10 slot ở mức thiết kế Stage 4

| # | Slot Stage 3 | Brief tối thiểu phải có ở Stage 4 | Điều kiện review |
|---|---|---|---|
| 1 | `recognition` | Package/lesson/pattern/objective IDs, kết quả quan sát được, prerequisite bắt buộc, phạm vi 2026/Python | Không mang metadata Paper 3; kết quả có assessment destination hoặc retrieval check |
| 2 | `exam-cues` | Dữ kiện vào, dạng biểu diễn, yêu cầu đầu ra/evidence, command words, constraint, strong/weak/negative cue, pattern dễ nhầm, locator QP/MS | Cue dẫn tới pattern có lý do; không biến từ khóa thành bằng chứng duy nhất; English gốc được giữ khi cần |
| 3 | `knowledge` | Knowledge block IDs, khái niệm, quy ước, coursebook section + trang in/PDF, mức hỗ trợ và giới hạn nguồn, visual tĩnh nếu phù hợp | Không sao chép listing sách chưa kiểm; phân biệt direct foundation, component foundation và AlgoCore synthesis |
| 4 | `method` | Hợp đồng đầu vào/đầu ra, representation, precondition, invariant, các pha giải, quyết định/nhánh, termination/postcondition, edge cases, cách tự kiểm | Mỗi bước có “vì sao”; bao phủ biến thể thực sự cần, không dạy mẹo khớp một đề |
| 5 | `worked-example` | Example ID/version, yêu cầu, dữ liệu mới, thiết kế, kế hoạch Python/trace/output/test/evidence, checkpoint và expected obligations | Cùng dữ liệu với Action View; Stage 5 vẫn phải thực thi; không chép nguyên câu lịch sử hoặc ghi kết quả chưa chạy là verified |
| 6 | `action-view` | Quyết định dynamic/static, learning purpose, state model, event storyboard, visual targets, prediction checkpoints, controls và accessibility handoff | Mọi quá trình đổi state có storyboard hoặc exception do Lead duyệt; chưa có event code |
| 7 | `marking-pitfalls` | Requirement ↔ MS point/AlgoCore rubric ↔ method step ↔ lỗi ↔ dấu hiệu phát hiện ↔ sửa/kiểm lại | Chỉ gọi official khi có locator MS; không tự gán số điểm; code chạy không thay cho đủ requirement |
| 8 | `practice` | Guided → faded → independent tasks, hint levels, feedback/rubric refs, dữ liệu biến thể và boundary cases | Bài độc lập không chỉ đổi tên biến; mỗi task nói rõ bằng chứng người học phải tạo |
| 9 | `retrieval` | Recap ẩn đáp án, reconstruct method, repair faulty trace/design, viết lại từ đầu và mixed transfer | Kiểm tái tạo sau khi bỏ scaffold; không tính xem lại worked example là retrieval |
| 10 | `next-and-sources` | Link prerequisite/review/next đúng block, similar patterns, source/version/provenance và trạng thái handoff | Không đưa local source path thành public href; không quảng bá route dự kiến là route đang chạy |

Status hợp lệ cho Stage 4 nên là `PLANNED`, `NEEDS_REWORK` và `READY_FOR_STAGE5`. Cả 10 slot đều bắt buộc; một slot không được bỏ bằng `NOT_APPLICABLE`. Khi một khái niệm không cần animation, slot 6 vẫn phải chứa static diagram/comparison/self-check plan có mục đích. Không dùng `AUTHORED`, `VERIFIED`, `IMPLEMENTED` hoặc `PUBLISHED` trong gate Stage 4.

## 4. Thiết kế slot nhận diện và dấu hiệu đề

Mỗi pattern cần một cue card độc lập locale với các trường sau:

```text
pattern_id
destination lesson_id / block_ids
task_family: input shape, state representation, required output/evidence
strong_cues[]: tổ hợp dữ kiện có sức phân biệt
weak_cues[]: gợi ý nhưng không đủ kết luận
negative_cues[]: dấu hiệu loại trừ hoặc chuyển sang pattern gần giống
command_words[]: English gốc + giải nghĩa VI
confusable_pattern_ids[]: khác nhau ở representation, postcondition hoặc evidence
source_examples[]: assessed_part_id + QP/MS locator + cue rationale
novel_recognition_check_id
```

Quy tắc chống học mẹo:

- Cue phải mô tả **quan hệ** giữa dữ liệu, thao tác và output. Một từ như “stack”, “file”, “class” hoặc tên hàm không đủ tự xác định pattern.
- Strong cue cần được đối chiếu với ít nhất một source example đã giữ ở Stage 3. Cue tổng hợp thêm phải ghi `AlgoCore synthesis`.
- Confusable pair phải nêu câu hỏi phân biệt. Ví dụ: đọc tuần tự không tự chứng minh file được tổ chức theo key; dictionary không đồng nhất mọi hash table; scan mảng vật lý không phải linked-list traversal.
- Recognition check dùng dữ liệu và wording mới, yêu cầu chọn pattern kèm lý do; không hỏi “đề này thuộc pattern nào?” sau khi tiêu đề đã lộ đáp án.
- Bản VI giải thích command word nhưng không thay đổi câu trích tiếng Anh hay làm mờ yêu cầu chính thức.

## 5. Thiết kế phương pháp giải

Lead cần khóa một `method_plan_id` cho từng pattern/variant có hành vi khác nhau. Một knowledge block có thể phục vụ nhiều method; ngược lại không được ép các biến thể pointer, sentinel, collision hoặc file contract vào một cách làm duy nhất.

Mỗi method plan gồm:

```text
method_plan_id, version, pattern_id, variant_scope
lesson_id, block_ids, objective_ids, assessment_requirement_ids
input_contract, output_contract, required_evidence
representation_and_conventions
preconditions[]
invariants[]
phases[]: goal, action, reason, decision, state_fields_read/written
termination_and_postconditions[]
boundary_and_failure_cases[]
forbidden_shortcuts_or_common_wrong_models[]
marking_or_algocore_requirement_refs[]
worked_example_plan_id, practice_ids[], storyboard_id_or_static_visual_id
source_refs[], synthesis_note, stage5_verification_obligations[]
```

Review phương pháp theo bốn lớp:

1. **Đúng hợp đồng:** trả đúng kiểu kết quả, update đúng state, tạo đúng evidence và giữ quy ước được đề cho.
2. **Không mất điểm:** mọi yêu cầu có thể chấm được nối tới một phase/postcondition hoặc evidence step; không chỉ mô tả thuật toán chung.
3. **Chịu được trường hợp biên:** empty/full, first/last, absent/duplicate, bounds, stale slots, prefix/final token, collision, base case, file failure và các case phù hợp pattern.
4. **Có thể chuyển giao:** Stage 5 nhìn plan phải biết cần viết fixture nào, chạy gì và xác nhận invariant/postcondition nào mà không tự sửa lại ý đồ học thuật.

Các pattern nằm trong 19 giới hạn sách của `GAP_REGISTER` bắt buộc có `synthesis_note` rõ nguồn thành phần và phần AlgoCore tự tổng hợp. Với linked-list search, ADT composition, recursive trace, independent class design, sequential organisation, random file và graph support, giữ nguyên các ranh giới trong `LEAD_DECISIONS`; không dùng một ví dụ liên quan để tuyên bố năng lực rộng hơn.

## 6. Worked-example planning, chưa viết lời giải

Một worked-example plan là hợp đồng sản xuất, không chứa code đáp án hoặc kết quả thực thi chưa kiểm. Nó cần:

- `example_id` ổn định, version và shared fixture ID cho VI/EN.
- Một yêu cầu tự biên soạn ngắn, có nhãn AlgoCore original; nếu dùng phần nguồn, giữ locator và phạm vi trích dẫn.
- Input đủ nhỏ để trace bằng tay nhưng có nhánh phân biệt và một case biên quan trọng.
- Chuỗi `requirement → design decision → planned implementation responsibility → trace obligation → output/test obligation → evidence obligation`.
- Checkpoint nơi người học phải dự đoán trước khi lộ bước kế tiếp.
- Danh sách fixture Stage 5 phải chạy: normal, boundary/failure và regression case liên quan.
- `python_solution_status: PLANNED_FOR_STAGE5`, `execution_status: NOT_RUN`, `trace_status: NOT_VERIFIED`.
- Liên kết cùng `example_id`, `example_version` và fixture tới Action View storyboard; nếu đổi input hoặc quy ước thì tăng version và invalidates storyboard cũ.

Không dùng output tự tính trong prose làm oracle cho chính nó. Stage 5 phải sinh/đối chiếu trace và output từ Python độc lập; Stage 4 chỉ nêu expected properties và acceptance obligations.

## 7. Action View storyboard handoff

Stage 4 giao storyboard, không xây event engine. Mỗi method được phân loại:

- `DYNAMIC_REQUIRED`: có thay đổi state theo bước, pointer/index/link/call frame, file position hoặc output accumulation cần quan sát.
- `STATIC_PURPOSEFUL`: khái niệm/so sánh không có transition đáng dạy; dùng diagram, table, before/after hoặc self-check.

### 7.1 Schema storyboard tối thiểu

```text
storyboard_id, version, method_plan_id, example_id, example_version
classification, learning_purpose, prediction_question
initial_state_schema[]
visible_regions[]: code, variables, structure, call frames, input/output, evidence
legend[]: read, compare, write, assign, pointer move, swap, link change, call, return
algorithm_events[]:
  id, sequence_index, type, phase_ref, planned_code_region,
  precondition, state_fields_before, delta, state_fields_after,
  invariant_checkpoint, explanation_vi, explanation_en,
  visual_targets, prediction_gate, feedback_ref, requirement_refs
terminal_states[]
control_contract: Predict, Next, Previous, Play, Pause, Reset, ChangeInput
accessibility_handoff: text equivalent, focus order, labels, reduced motion, static steps
stage5_trace_ref: pending
stage6_or_integration_status: NOT_IMPLEMENTED
```

Event thuật toán và event điều khiển người học phải tách riêng. `Next` là đúng một bước có ý nghĩa; `Previous` yêu cầu snapshot hoặc deterministic replay; `Reset` trả về initial state của input hiện tại; `ChangeInput` dừng playback và tạo trace mới; `Play/Pause` không bỏ/lặp event. Đây là acceptance contract cho stage triển khai, chưa phải cam kết rằng baseline app đã hỗ trợ.

### 7.2 Storyboard theo archetype

| Archetype | State/visual tối thiểu | Event/case bắt buộc xét |
|---|---|---|
| Array/string/search/sort | indices, bounds, current item, comparisons, writes/swaps, logical length | first/last/absent, duplicate, prefix/final token, already sorted/reverse khi liên quan |
| Stack/queue | storage, logical live region, pointer convention, returned item, overflow/underflow | empty, one free slot/full, wrap-around, stale physical slots, rollback nếu pattern yêu cầu |
| Linked list/tree/hash | physical slots, live links, head/root/free, current/parent, bucket/overflow | empty, found/not found, first node, no free slot, collision/full bucket, traversal order |
| Recursion | call frames, arguments, pending operations, return values, output | base case, descent, return/unwind, wrong trace repair |
| OOP | objects, attributes, constructor/method call, containment/inheritance relation | valid/invalid state change, capacity, overriding/interface contract khi trong scope |
| File/exception | logical records, file position/mode, current record, operation/result/error boundary | EOF, missing/unreadable file, ordered/random organisation, update/retrieval address |
| Static support | labelled comparison/diagram/table and a prediction/self-check | Big O choice, graph features/use; không tạo graph algorithm animation |

Storyboards không được tự gắn mark vào mọi event. `requirement_refs` chỉ có khi QP/MS hoặc rubric AlgoCore đã xác lập; event giải thích cơ chế có thể không mang điểm riêng.

## 8. Practice và retrieval

Mỗi assessment destination có một ladder, và 107 assessment requirement phải xuất hiện ít nhất một lần ở `practice`, `retrieval` hoặc một assessment plan chính xác. Một task có thể phục vụ nhiều requirement nếu acceptance checks tách được; không gom quá nhiều mục tiêu khiến không biết học sinh sai ở đâu.

| Mức | Scaffold | Nhiệm vụ | Evidence |
|---|---|---|---|
| Guided | representation, phases, một phần trace và hint theo bước | hoàn thành quyết định/trace/đoạn còn thiếu và giải thích invariant | câu trả lời + tự đối chiếu từng requirement |
| Faded | chỉ giữ contract, cue và một checkpoint | chọn phương pháp, hoàn thành phần lớn thiết kế/code plan và test | design/trace/test table với rubric AlgoCore hoặc MS refs rõ |
| Independent | scenario và constraints mới, không lộ pattern/method | nhận diện, thiết kế, triển khai ở stage sau và tạo evidence | artifact hoàn chỉnh; solution chỉ reveal sau attempt |
| Retrieval/repair | không nhìn mẫu; hoặc cung cấp phương pháp/trace sai | tái tạo phase/invariant, tìm lỗi, sửa và giải thích regression | explanation + corrected design/trace + rerun obligation |
| Mixed transfer | trộn pattern dễ nhầm hoặc ghép kỹ năng | chọn/ghép phương pháp, nêu interface giữa phần | rationale cho decomposition và evidence của từng phần |

Hint dùng mức ổn định, ví dụ `H1 cue`, `H2 representation/invariant`, `H3 next decision`, `H4 partial structure`; không để hint cuối vô tình là toàn lời giải. Feedback có VI/EN, nói lỗi vi phạm contract/invariant nào và hành động sửa; không chỉ báo đúng/sai.

Retrieval phải gồm ít nhất: một câu nhận diện không lộ tiêu đề, một lần viết lại các phase/invariant từ trí nhớ, một faulty trace/design repair và một transfer item. Recap là dữ liệu học; retrieval là hành động không nhìn đáp án.

## 9. IDs, version và bilingual parity

Giữ nguyên mọi ID Stage 3. Stage 4 chỉ thêm namespace con ổn định, ví dụ:

```text
...pattern.<pattern>.method.<variant>
...example.<slug>
...storyboard.<slug>
...practice.<slug>
...question.<slug>
...rubric.<slug>.item.<n>
...asset.<slug>
```

Không đưa locale vào ID logic. Nội dung hiển thị dùng `(content_id, locale, version)`; code/data/event/fixture/source refs dùng chung. `translation_group_id` hoặc join tương đương phải nối đúng một cặp VI/EN cùng version.

Parity gate kiểm cả cấu trúc và nghĩa:

- Cùng slot target, objective, pattern, requirement, method phase, edge case, example data, prediction point, hint level, rubric item và source ref.
- VI/EN có đầy đủ title, explanation, visual label/caption/alt, prompt, hint, feedback, recap và control copy.
- Identifiers, filenames, literals, official English excerpts và expected data không bị dịch làm đổi hành vi.
- Thuật ngữ English nhất quán với glossary; bản VI giải nghĩa chứ không tạo taxonomy mới.
- Thay đổi một method/example/storyboard tăng version hoặc đánh dấu bản dịch/consumer cũ cần cập nhật; không cho một locale ở version khác vẫn PASS.

Mỗi record cần `provenance`, `author`, `reviewer`, `status` và `last_reviewed_version`. Đây là metadata sản xuất, không nhất thiết hiển thị cho học sinh.

## 10. Batching và ownership

Phân batch theo dependency và archetype, đồng thời giữ khối lượng gần nhau:

| Batch | Package/lesson | Quy mô | Phụ thuộc/gate vào |
|---|---|---:|---|
| B1 Foundations | 4 lesson: data models, procedural design, validation, testing | 23 block | Bắt đầu trước; khóa glossary, method template, test/evidence vocabulary |
| B2 Text + search/sort | 4 lesson | 15 block | Sau B1; calibrate array/string trace, comparison và loop invariants |
| B3 Stateful structures | stack, queue, linked list, recursion, binary tree | 5 lesson / 24 block | Sau B1; khóa pointer conventions và dynamic storyboard archetypes |
| B4 Dictionary + OOP | dictionary, hashing và 4 OOP lesson | 6 lesson / 23 block | Dictionary composition sau linked-list plan mặc định; OOP dùng foundation contracts |
| B5 Files + support + integration | 4 file lesson, performance, graphs, exam workflow | 7 lesson / 23 block | Sau B1 và phần OOP cần cho object files; integration đợi B2–B4 |

Trong mỗi batch, một lesson plan chỉ có **một production owner**. Reviewers ghi finding vào file riêng hoặc review register; không sửa trực tiếp canonical plan khi owner đang làm. Lead là người duy nhất merge aggregate và đổi status `READY_FOR_STAGE5`.

### 10.1 Vai trò agent

| Vai trò | Quyền và nhiệm vụ | Không được tự ký |
|---|---|---|
| Lead | Khóa template, variant policy, batch order; đọc nguồn rủi ro; merge; giải quyết xung đột; ký gate | Không dùng self-review của mình thay independent QA |
| Content/recognition owner | Slot 1–3 và 10; exact block/source links, cue/confusable, glossary và VI/EN draft brief | Không suy ra official marking hoặc tự mở rộng scope |
| Method owner | Slot 4–5; method plans, invariant/edge cases, worked-example contracts và Stage 5 obligations | Không viết/claim Python solution đã chạy |
| Learning/assessment owner | Slot 7–9; pitfall links, practice ladder, hints, feedback, retrieval và transfer | Không gắn Cambridge marks cho rubric AlgoCore |
| Visual storyboard owner | Slot 6; phân loại dynamic/static, shared fixture/state fields, event storyboard và accessibility handoff | Không code event hoặc tự xác nhận trace đúng |
| Bilingual reviewer | Kiểm semantic parity, glossary, official-English handling và version joins | Không chỉ đếm trường/text để kết luận parity |
| Independent QA | Chạy mechanical checks, đọc mẫu rủi ro, mở findings và recheck closure | Không ký thay Lead |

Với giới hạn bốn agent đồng thời gồm Lead, chạy tối đa ba owner song song. Một nhịp đề xuất:

1. Lead khóa schema và duyệt calibration packet gồm một method tuần tự, một cấu trúc pointer, một OOP và một file/static support plan.
2. B1 được làm và review trước; template chỉ được nhân rộng sau khi findings calibration đóng.
3. B2 và B3 chạy song song; agent thứ ba cross-review cues/method theo archetype.
4. B4 chạy sau khi linked-list composition convention được Lead khóa; phần OOP có thể song song với dictionary/hash.
5. B5 chạy cuối; exam workflow chỉ tổng hợp sau khi các upstream method/evidence contracts ổn định.
6. Visual owner rà toàn registry sau mỗi batch, không đợi cuối stage mới phát hiện thiếu shared fixture hoặc state field.
7. Bilingual reviewer làm parity theo batch và recheck toàn bộ sau merge; A8 chỉ bắt đầu khi mọi production owner đã nộp và Lead đã freeze candidate.

Mỗi batch bàn giao: inventory IDs, 10-slot target matrix phần liên quan, method/worked-example plans, storyboard/static-visual decisions, practice/retrieval plans, parity report, self-check và open findings. Batch sau không được dùng status PASS của batch trước để bỏ qua recheck join khi aggregate thay đổi.

## 11. QA và Stage 4 gate

### 11.1 Mechanical checks bắt buộc

- Stage 3 `verify_release.py` PASS trước khi bắt đầu và sau khi Stage 4 candidate hoàn tất; digest Stage 0–3 không thay đổi.
- Giữ đúng 13 package, 26 lesson, 108 knowledge block, 58 pattern, 37 assessment destination và 107 assessment requirement.
- Đủ 130 package-slot records kế thừa (13 × 10), không trùng ID; mỗi record có target tồn tại. Slot 6 dùng `DYNAMIC_REQUIRED` hoặc `STATIC_PURPOSEFUL`, không được bỏ trống.
- Mọi pattern có cue card, method plan hoặc explicit static/support disposition và ít nhất một assessment/practice destination.
- Mọi state-changing method có storyboard; mọi static method có purposeful visual/self-check decision; không có visual chỉ để đạt quota.
- Mọi worked-example plan dùng shared example/fixture/version với storyboard tương ứng và có Stage 5 obligations.
- Mọi source/requirement/objective/block/method/example/practice/rubric/storyboard ref resolve; không dangling IDs hoặc route được ghi là live khi còn planned.
- VI/EN parity theo ID/version đạt 100% ở tất cả trường bắt buộc; không có local filesystem path trong public link field.
- Không có status `AUTHORED`, `VERIFIED`, `IMPLEMENTED`, `PUBLISHED` hoặc official marks vô căn cứ.

### 11.2 Semantic review bắt buộc

Lead/A8 đọc mọi plan thuộc 19 giới hạn sách, mọi synthesis/absent/partial capability rủi ro, và ít nhất một pattern + one practice ladder trong mỗi package còn lại. Các review sau không được thay bằng check đếm:

- Cue có phân biệt đúng pattern gần giống và không leak đáp án.
- Method giữ đúng representation/convention, invariant, termination, postcondition và edge cases.
- Marking/pitfall link có authority đúng; requirement chính thức và hướng dẫn AlgoCore được tách rõ.
- Worked example và practice dùng scenario mới, đủ transfer và không sao chép câu lịch sử.
- Storyboard có learning purpose, prediction và delta rõ; static alternative phù hợp.
- VI/EN đồng nghĩa học thuật, cùng constraints và cùng expected obligations.

### 11.3 Lead double-check trước khi kết thúc stage

Lead không ký ngay sau báo cáo aggregate. Trình tự cuối bắt buộc:

1. Freeze candidate và ghi digest của các artifact Stage 4.
2. Tự chạy lại Stage 3 release verification và Stage 4 mechanical checks từ checkout sạch về mặt artifact candidate.
3. Đọc 13 package summaries và kiểm từng slot có exact target; không duyệt package chỉ bằng tổng count.
4. Đối chiếu thủ công ít nhất một chain hoàn chỉnh cho mỗi archetype: source QP/MS → pattern → block/objective → method → marking/pitfall → worked example → storyboard → practice/retrieval.
5. Đọc toàn bộ high-risk/synthesis decisions nêu ở trên và so lại `LEAD_DECISIONS`/`GAP_REGISTER`.
6. Kiểm report parity, source authority, open findings và rework evidence; mọi finding bắt buộc phải `CLOSED` rồi được reviewer khác re-inspect.
7. Chỉ sau đó Lead mới ký `PASS` và gắn nghĩa chính xác: **Stage 4 design ready for Stage 5 authoring/execution**.

Gate phải `HOLD` nếu còn dangling ID, thiếu locale, thiếu edge case/requirement, cue sai nguồn, method không chỉ ra invariant/postcondition, dynamic method thiếu storyboard, rubric lẫn official/AlgoCore hoặc finding bắt buộc chưa recheck. Không dùng build/typecheck, số lượng trang, số event hay tự kiểm của owner để vượt gate.

## 12. Điều Stage 4 PASS không chứng nhận

PASS Stage 4 không chứng nhận lesson đã viết, Python chạy đúng, output/trace đúng, event engine hoạt động, UI hỗ trợ VI/EN, route tồn tại, accessibility đạt, assessment đã phát hành hay học sinh sẽ đạt điểm tối đa. Stage 5 phải viết/chạy/kiểm code và fixture; stage event/integration phải đối chiếu state engine với trace đã xác minh; stage bilingual/UI phải render và kiểm thực tế.

A5 khuyến nghị Lead chỉ nhận tài liệu này như review đầu vào cho work order tổng. Quyết định cuối, merge registry, đóng findings và chữ ký gate vẫn thuộc Lead.
