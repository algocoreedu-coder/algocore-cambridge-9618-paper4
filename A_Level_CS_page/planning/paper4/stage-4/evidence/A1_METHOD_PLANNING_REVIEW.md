# A1 planning review — Stage 4 phương pháp giải và tránh mất điểm

**Trạng thái:** `PLANNING_PROPOSAL_FOR_LEAD`  
**Phạm vi:** chỉ lập kế hoạch Stage 4; chưa viết bài học, lời giải, Python, trace, event hoặc mã ứng dụng.  
**Quyền quyết định:** A0 Lead trực tiếp thiết kế và ký duyệt phương pháp giải cùng bản đồ tránh mất điểm. Các agent khác chỉ chuẩn bị bằng chứng, kiểm nguồn, đề xuất cấu trúc hoặc review độc lập.

## 1. Kết luận sau khi đọc bàn giao

Stage 3 đã PASS ở phạm vi thiết kế và truy vết: 58 pattern, 672 ý chấm điểm của 29 paper, 108 knowledge block, 107 objective trong phạm vi, 107 assessment requirement, 26 lesson, 13 package, 20 cặp dễ nhầm, 19 khoảng trống sách và 65 nghĩa vụ cần bổ sung. Stage 4 chưa bắt đầu; lesson, rubric học sinh, lời giải, Python, fixture, trace, event và website vẫn chưa được sản xuất.

Kế hoạch Stage 4 phải dùng nguyên các phân biệt đã khóa:

- `primary_pattern_id`, `assessed_pattern_ids` và `context_pattern_ids` không thay thế nhau. Một thao tác được gọi hoặc được test không tự trở thành thao tác mới được cài đặt.
- Pattern là hành vi cần thực hiện; task mode là hình thức yêu cầu; variant là quy ước/biểu diễn/điều kiện. Không sinh pattern mới chỉ vì đổi tên biến, sức chứa hoặc bối cảnh.
- Corpus evidence, knowledge/source mapping, planned coverage và published readiness là bốn trạng thái khác nhau.
- Sách là căn cứ kiến thức, không tự chứng nhận listing hoặc lời giải. QP/MS là căn cứ yêu cầu thi cụ thể; rubric AlgoCore phải mang nhãn riêng.
- Dictionary không đồng nhất hash table; random file không được thay bằng hash table trong RAM; đọc tuần tự không đồng nghĩa file organisation có thứ tự; output đệ quy không phải call/return trace; class diagram được cung cấp không chứng minh năng lực tự thiết kế class.
- Python là ngôn ngữ đích, nhưng Stage 4 không được biến code chưa chạy thành `verified`, `correct`, `learner-ready` hoặc bằng chứng output/trace.

Đầu vào bắt buộc phải khóa checksum trước khi chạy Stage 4:

- `stage-0/LEARNING_PAGE_CONTRACT.md` và `stage-0/DEFINITION_OF_DONE.md`;
- release đã PASS của Stage 1, đặc biệt `QUESTION_INDEX.json`, `SOURCE_MANIFEST.json`, `SOURCE_ISSUES.json` và facsimile QP/MS;
- release Stage 2: `EXAM_PATTERN_CATALOG.json`, `QUESTION_PATTERN_MAP.json`, `CONFUSABLE_PATTERNS.json`;
- release Stage 3: `BOOK_KNOWLEDGE_MAP.json`, `COVERAGE_MATRIX.json`, `LESSON_PACKAGES.json`, `PREREQUISITE_MAP.json`, `GAP_REGISTER.json`, `LEAD_DECISIONS.md` và `RELEASE_MANIFEST.json`.

Playbook Paper 1 có thể tái dùng cho cơ chế điều phối: tối đa A0 + ba worker; quyền ghi không chồng nhau; `SUBMITTED` khác `ACCEPTED`; tác giả không tự review; finding phải sửa và retest; Lead mới là người đóng gate. Không tái dùng thứ tự stage hoặc ba pilot Paper 1 như quyết định học thuật cho Paper 4.

## 2. Mục tiêu và ranh giới Stage 4

### 2.1 Mục tiêu

Stage 4 biến chuỗi truy vết Stage 3 thành một đặc tả học thuật có thể chuyển cho Stage 5:

```text
QP/MS part
  → assessed task và source contract
  → canonical pattern
  → variant/representation contract
  → method steps + reasons + invariant
  → source-backed marking obligations
  → likely failure → detection → repair/check
  → worked-example specification
  → Python/trace/test handoff cho Stage 5
```

Kết quả Stage 4 phải giúp học sinh biết nhận đúng việc cần làm, chọn đúng biến thể, giữ trạng thái đúng, bao phủ các nghĩa vụ chấm và tự phát hiện lỗi. Nó chưa chứng minh một chương trình cụ thể chạy đúng.

### 2.2 Việc thuộc Stage 4

- Thiết kế canonical method cho đủ 58 pattern và các method variant thực sự khác hành vi.
- Lập marking ledger cho đủ 672 ý nguồn, sau đó tổng hợp thành marking map theo pattern/variant.
- Lập loss-prevention map nối requirement/marking obligation với lỗi, tín hiệu phát hiện và cách sửa/kiểm tra.
- Phân loại toàn bộ variant axes của Stage 2, định nghĩa invariants và điều kiện chuyển variant.
- Chọn và đặc tả worked examples, contrast examples, boundary micro-cases và independent transfer tasks.
- Viết nội dung learner-facing của phương pháp/rubric theo VI/EN cùng ID/version nếu Stage 4 được thực thi đầy đủ.
- Chuẩn bị hợp đồng Python, fixture, trace và event để Stage 5–6 có đầu vào không mơ hồ.
- Giữ đủ 107 assessment requirement và nhãn `AlgoCore original` cho rubric tự biên soạn.

### 2.3 Việc không được dùng để PASS Stage 4

- Chạy hoặc chứng nhận Python; tạo expected output bằng việc đoán; tuyên bố edge cases đã qua.
- Chứng nhận trace/event khớp code; render Action View; sửa app/routes.
- Sao code sách/MS rồi coi là lời giải; chuẩn hóa typo nguồn mà không giữ caveat.
- Gán điểm Cambridge cho tiêu chí suy ra hoặc rubric AlgoCore.
- Dịch hai bản có logic/dữ liệu/IDs khác nhau.
- Đổi taxonomy, objective map, prerequisite hoặc Stage 0–3 để làm kế hoạch Stage 4 dễ hơn. Nếu phát hiện lỗi upstream, mở issue có locator và impact; không sửa âm thầm.

## 3. Pattern-to-method framework

Mỗi pattern có đúng một canonical method card. Card có thể tham chiếu primitive dùng chung, nhưng phải vẫn giải thích được hành vi riêng của pattern. Không ép 58 pattern thành 58 thuật toán độc lập nếu một số là workflow, evidence hoặc formatting.

### 3.1 Bảy lớp bắt buộc của một method card

1. **Nhận diện nhiệm vụ được chấm:** command words, output cần nộp, dấu hiệu dữ liệu, assessed operation và các thao tác chỉ là context.
2. **Khôi phục contract:** input, output/return, precondition, postcondition, side effects, mutation owner, error/sentinel/evidence contract và dependency từ ý trước.
3. **Khóa biểu diễn và quy ước:** indices, pointer meaning, empty/full convention, physical/logical order, record layout, class visibility, file mode, recursive/iterative form.
4. **Chọn method variant:** decision rule dựa trên dữ kiện đề; nêu alternative bị loại và lý do. Không chọn theo tên hàm.
5. **Thực hiện các bước có lý do:** ordered steps, state read/write, update order, termination/progress và invariant cần giữ sau mỗi bước quan trọng.
6. **Đối chiếu nghĩa vụ chấm:** mỗi step dẫn tới source-backed criterion hoặc rubric AlgoCore có nhãn; không chia điểm mới từ whole-part marks.
7. **Tự kiểm:** normal, boundary, failure/not-found/full/empty, return/output format và evidence requirements; chỉ định điều gì Stage 5 phải chạy hoặc trace.

### 3.2 Schema đề xuất cho `METHOD_CARDS.json`

```text
method_id, version, pattern_id, lesson_id, package_id, titles{vi,en}
status, authority, source_part_ids, knowledge_block_ids, objective_ids
recognition{vi,en}, assessed_vs_context_rule
contract{inputs, outputs, preconditions, postconditions, mutations,
         return_policy, failure_policy, evidence_policy}
representation{state_fields, conventions, physical_vs_logical}
variant_axes[], variant_decisions[], confusable_refs[]
invariants[], method_steps[], termination_or_progress
marking_obligation_ids[], loss_prevention_ids[]
worked_example_ids[], transfer_assessment_ids[]
python_handoff, trace_handoff, event_eligibility
source_labels, bilingual_parity, open_issues
```

`method_steps` cần có `step_id`, `reason`, `reads`, `writes`, `preserves_invariant_ids`, `marking_obligation_ids` và điều kiện áp dụng. Đây là cấu trúc thiết kế; không phải event trace và không chứa state snapshots giả.

### 3.3 Các họ phương pháp dùng chung

Canonical cards nên tham chiếu tám họ primitive để tránh chép cùng logic ở nhiều nơi:

| Họ | Pattern tiêu biểu | Trọng tâm phương pháp |
|---|---|---|
| Representation/setup | DATA_STORAGE, DATA_RECORD, STACK/QUEUE/LIST/TREE/HASH_SETUP | state fields, sentinel, pointer/index conventions, valid initial state |
| Search/select/aggregate | LINEAR_SEARCH, BINARY_SEARCH, FILTER_RECORDS, COUNT_OCCURRENCES, GROUP_AGGREGATE | predicate, scan/traversal domain, stop/all-match contract, accumulator |
| Ordered transform | BUBBLE_SORT, INSERTION_SORT, ORDERED_INSERT, STRING/RLE | comparison/unit of progress, preserved prefix/suffix/run, final flush |
| ADT mutation | PUSH/POP, ENQUEUE/DEQUEUE, LIST/TREE/HASH_INSERT/REMOVE | precondition, capacity, update order, reachability, success/failure |
| OOP model/state | OOP_CLASS, GET/SET/UPDATE/OVERRIDE/INSTANTIATE/CAPACITY_ADD | responsibility, visibility, stored vs computed value, inheritance/containment |
| File/persistence | FILE_READ_ARRAY, FILE_READ_OBJECTS, FILE_WRITE | record layout, mode, lifecycle, exception boundary, persistent order |
| Translation/orchestration | ALGORITHM_TRANSLATE, ALGORITHM_REWRITE, MAIN_FLOW, RULE_COMPUTE | preserve observable behaviour, call/data flow, base/loop progress, branch table |
| Output/evidence | OUTPUT_FORMAT, EVIDENCE_RUN | exact requested representation, prescribed run set, provenance and visibility |

Họ dùng chung chỉ là tái sử dụng. Acceptance vẫn đòi 58/58 pattern có card và đường nối riêng.

## 4. Quy tắc variants và invariants

### 4.1 Phân loại từng variant axis

Mọi `variant_axes_to_preserve` trong 58 pattern phải được ghi một trong bốn mức:

- `parameter_only`: thay capacity, tên, literal hoặc dữ liệu nhưng không đổi state transition;
- `representation_choice`: cùng hành vi ngoài nhưng đổi state fields/sentinel/traversal;
- `contract_change`: đổi return, mutation, missing/full/empty, output/evidence hoặc precondition;
- `algorithm_change`: đổi progress, termination, update order hoặc nhánh chính.

Chỉ tạo `method_variant_id` khi thuộc ba mức cuối và khác biệt ảnh hưởng bước giải. `parameter_only` dùng fixture/parameter, không nhân bản method.

Mỗi axis phải có:

```text
axis_id, pattern_id, observed_values, source_part_ids
classification, decision_signal, affected_contract_fields
affected_steps, preserved_invariant_ids, variant_specific_invariant_ids
worked_example_or_microcase_ids, stage5_required_cases
```

Không được gộp mất bốn implementation contrasts đã khóa: hash Spare/bucket; queue linear/circular; stack next-free/current-top; linked list free-list/object-reference. Mười sáu contrast còn lại phải xuất hiện như rule nhận diện nhiệm vụ, không chỉ link tham khảo.

### 4.2 Loại invariant

- `representation_invariant`: vùng sống, head/tail/top/root/free pointer, reachability, capacity/count.
- `operation_invariant`: điều luôn đúng trước/sau một mutation, gồm không mất node/item và đúng owner của state.
- `loop_invariant`: phần đã xử lý/sắp/xét và phần còn lại; dùng khi thực sự giúp lý giải thuật toán.
- `recursion_invariant`: bài toán nhỏ hơn, base case, pending work và kết hợp khi return.
- `resource_invariant`: file mode/lifecycle/record boundary; exception không che lỗi ngoài phạm vi cần bắt.
- `evidence_invariant`: run/filename/input/output được yêu cầu phải hiện rõ và khớp chương trình đang nộp.

Không ép invariant thuật toán vào khái niệm tĩnh. Card tĩnh dùng `decision_rule` hoặc `representation_rule`. Mọi invariant learner-facing cần có một thao tác kiểm tra được, không chỉ câu khẩu hiệu.

### 4.3 Ma trận bắt buộc trước khi viết method

Lead duyệt `VARIANT_INVARIANT_REGISTER` theo thứ tự:

1. 58 pattern đều có mọi axis từ catalog.
2. Giá trị axis quan trọng được lấy từ các source examples/part rows, không suy từ một ví dụ duy nhất.
3. 20 confusable contrasts đều có disposition.
4. Các book gap và caveat Stage 3 được gắn vào đúng pattern.
5. Mỗi variant thay đổi phương pháp có ít nhất một contrast example hoặc boundary micro-case.

## 5. Thiết kế worked example

### 5.1 Bộ ví dụ tối thiểu

Mỗi pattern phải là `primary_pattern_id` của ít nhất một worked-example spec. Có thể dùng một scenario chung cho nhiều card, nhưng không dùng co-pattern/context để tuyên bố pattern đã được dạy.

Với mỗi pattern:

- **Anchor example:** thể hiện canonical contract và toàn bộ method steps.
- **Variant contrast:** bắt buộc khi representation/contract/algorithm đổi phương pháp; chỉ ra bước nào đổi và invariant nào giữ.
- **Boundary micro-case:** tối thiểu case bình thường và case biên/failure phù hợp contract.
- **Transfer task:** dữ liệu/bối cảnh mới, giảm gợi ý, nối tới assessment requirement tương ứng.

Các pattern cùng family có thể chia sẻ một dataset để Action View sau này nhất quán. Ví dụ tích hợp phải ghi rõ phần nào đang được viết mới và phần nào được gọi sẵn.

### 5.2 Cấu trúc một worked-example spec

1. Metadata và nhãn nguồn: `AlgoCore original`, `adapted constraint set` hoặc `historical source locator`; không tái tạo nguyên một câu thi lịch sử làm bài tự biên soạn.
2. Requirement strip: dữ kiện bắt buộc, output/return/evidence và các giới hạn; tách story khỏi contract.
3. Design checkpoint: representation, conventions, chosen variant, rejected alternative và invariant.
4. Step table: requirement → state/decision → method step → reason → marking obligation.
5. Candidate Python handoff: signature/API, permitted built-ins, mutation/return contract, line-tag plan; code nếu được viết ở Stage 4 phải mang trạng thái `DRAFT_UNEXECUTED`.
6. Trace specification: initial state, required observations, branches, call frames/pointers và invariant checkpoints; chưa điền state-after từ code chưa chạy.
7. Test oracle specification: case purpose/input/expected property; expected exact output chỉ được chấp nhận ở Stage 4 nếu suy ra độc lập và được đánh dấu `MANUAL_ORACLE_PENDING_EXECUTION`.
8. Mark/loss review: obligation nào được thể hiện, lỗi nào cố tình tránh và cách người học tự kiểm.
9. Transfer prompt và rubric AlgoCore VI/EN.
10. Stage 5/6 handoff: fixtures, dynamic event needs, visual targets, unresolved API/platform choices.

### 5.3 Chọn ví dụ theo rủi ro

Ưu tiên contrast đầy đủ cho các cụm đã có nguy cơ cao:

- linear/circular queue và quy ước head/tail/count;
- stack next-free/current-top;
- linked list array/free-list so với object references, gồm head/interior/not-found/recycle;
- tree array/object và iterative/recursive;
- hash Spare/bucket và ranh giới với dictionary/random file;
- recursive/iterative rewrite, call/return/unwinding;
- physical array output so với logical traversal;
- write/append, sequential organisation và random access;
- getter/setter/update/computed rule/formatting;
- RLE final run, grouped aggregation và bounded insertion;
- implementation/main flow/evidence run.

## 6. Marking map và tránh mất điểm

### 6.1 Hai tầng dữ liệu

`MARKING_MAP` cần hai tầng để không biến pattern tag thành marking scheme:

1. **Part ledger — 672/672:** giữ `part_id`, QP/MS locators, task mode, dependencies/shared context, primary/assessed/context patterns, whole-part marks và paraphrase từng obligation có nguồn. Không chia whole-part mark cho pattern trừ khi MS thực sự có điểm tách được và locator rõ.
2. **Pattern/variant aggregate — 58/58:** nhóm obligation tương đồng, giữ danh sách part IDs làm evidence, nêu điều kiện variant. Aggregate không được gắn nhãn là wording chính thức của Cambridge.

Mỗi obligation có `authority_kind`:

- `cambridge_source_backed`: paraphrase/short locator-grounded criterion từ đúng MS;
- `algocore_normalised_check`: tổng hợp nhiều nguồn, không có số điểm chính thức;
- `algocore_original_rubric`: tiêu chí cho assessment tự biên soạn;
- `coursebook_foundation`: kiến thức hỗ trợ, không phải marking point.

### 6.2 Cấu trúc loss-prevention row

```text
loss_id, pattern_id, variant_conditions, requirement_signal
marking_obligation_ids, source_part_ids, authority_kind
likely_failure{vi,en}, why_it_loses_credit{vi,en}
detection_check{vi,en}, repair_action{vi,en}
worked_example_ids, severity, status
```

Mỗi row phải trả lời được: học sinh bỏ sót điều gì, điều đó được yêu cầu ở nguồn nào, dấu hiệu tự phát hiện là gì, sửa bằng thao tác nào. Câu chung như “đọc kỹ đề”, “kiểm tra code” hoặc “tránh lỗi syntax” không đủ.

### 6.3 Các nhóm lỗi bắt buộc kiểm

- Nhầm assessed operation với context/call/test; nhầm implementation với evidence screenshot.
- Không giữ đúng representation/pointer/sentinel/return convention của đề.
- Thiếu empty/full/not-found/first/root/head/final-run/capacity case.
- Update state sai thứ tự làm mất dữ liệu, link, item hoặc count.
- Duyệt physical storage thay vì logical live structure, hoặc ngược lại.
- Viết một match khi đề cần all matches/count, hoặc đếm toàn chuỗi khi cần consecutive run.
- Dùng getter/setter/update/computed method sai ranh giới.
- Chọn write thay append, đóng/mở file sai lifecycle, bắt exception quá rộng.
- Không giữ behaviour khi translate/rewrite giữa pseudocode, recursion và iteration.
- Sai exact output/record order/labels hoặc thiếu prescribed evidence run.
- Dùng output cuối thay trace calls/locals/returns; dùng prescribed tests thay independent test design.

Mười sáu pattern-boundary contrasts của Stage 2 phải có ít nhất một loss row. Bốn implementation-variant contrasts phải có row theo từng convention.

## 7. Python boundary giữa Stage 4 và Stage 5

### 7.1 Stage 4 được phép quyết định

- Python interface contract: function/class name policy, parameters, return type/policy, mutability, global/local state và file/record format.
- Representation choice và những built-in được phép hoặc bị hạn chế theo requirement.
- Candidate control flow, state transitions, invariant checkpoints và line-tag plan.
- Fixture specification, test purposes, expected properties và manual oracle.
- Với random files: đề xuất record encoding/record length/offset scheme phải ghi là lựa chọn AlgoCore; không giả thành yêu cầu duy nhất của syllabus.
- Với parameters: mô tả chính xác caller-visible mutation/rebinding của Python; không nói Python có chế độ pass-by-reference lựa chọn được.

### 7.2 Stage 5 mới được chứng nhận

- Runtime và minor version thực tế; source file thực thi được.
- Syntax/import/API/file-mode compatibility.
- Kết quả normal/boundary/failure fixtures và run logs.
- Exact expected output, mutation, return và persistent file state.
- Trace/state snapshots, call frames, pointer movements và invariant checks khớp code.
- Candidate code khắc phục được caveat sách/MS hoặc issue nguồn đã biết.

Nếu Stage 4 chứa candidate code để làm rõ phương pháp, code nằm trong vùng draft riêng, không được dùng trong learner-facing “verified worked example”; mọi output/trace phụ thuộc code mang `PENDING_STAGE5_EXECUTION`. Khuyến nghị an toàn là Stage 4 ưu tiên solution blueprint + Python contract, còn Stage 5 tạo hoặc chốt executable source từ đó.

### 7.3 Caveat bắt buộc chuyển sang handoff

Các method/card liên quan phải link issue cho: Boolean typo trang in 239; bubble-sort flag trang 245; binary-search termination trang 455–457; tree objects/recursion overstatement trang 487; Java/Python label trang 489; typesetting underscore trang 516; tree search `self.item` trang 520; binary serialisation contract trang 526–528; sequential insertion loop/EOF trang 532; bare `except` trang 536. Không copy listing làm baseline đã đúng.

## 8. Artifact đề xuất cho Stage 4

| Artifact | Owner | Nội dung tối thiểu | Trạng thái gate |
|---|---|---|---|
| `README.md` | A0 | scope, cách dùng, giới hạn Stage 4/5 | bắt buộc |
| `INPUT_LOCK.json` | A0 | checksum release Stage 0–3 và source IDs | bắt buộc |
| `WORK_ORDERS.md` | A0 | owner, dependency, allowlist, reviewer, acceptance | bắt buộc |
| `METHOD_FRAMEWORK.md` | A0 | framework, authority rules, schema/version | bắt buộc |
| `METHOD_CARDS.json/.md` | A0 | 58 canonical cards + variants | bắt buộc |
| `VARIANT_INVARIANT_REGISTER.json/.md` | A3 đề xuất, A0 chốt | tất cả axes, contrasts, invariants, case needs | bắt buộc |
| `MARKING_LEDGER.json` | A4 evidence agents, A0 merge | 672 part rows có locator/authority | bắt buộc |
| `MARKING_MAP.json/.md` | A0 | aggregate theo pattern/variant | bắt buộc |
| `LOSS_PREVENTION_MAP.json/.md` | A0 | requirement ↔ mark ↔ failure ↔ detect/repair | bắt buộc |
| `WORKED_EXAMPLE_SPECS.json/.md` | A0 chốt; A1 kiểm contract | anchor/contrast/boundary/transfer coverage | bắt buộc |
| `ASSESSMENT_RUBRICS.json/.md` | A0 | 107 requirement, AlgoCore labels, method links | bắt buộc |
| `PYTHON_STAGE5_HANDOFF.json/.md` | A0 | interfaces, fixtures, oracle status, open choices | bắt buộc |
| `SOURCE_CAVEAT_CARRYOVER.json` | A2/A4 đề xuất, A0 chốt | Stage 1 issues + 19 book gaps + code warnings | bắt buộc |
| `QA_REPORT.md`, `GATE_REVIEW.md/.json` | A9 review, A0 gate | findings, retests, Lead double-check | bắt buộc |
| `RELEASE_MANIFEST.json` | A0 | hashes, locked inputs, gate scope | bắt buộc |

Artifact learner-facing ở Stage 4 dùng cùng IDs/version/data và đủ `vi`/`en`. Internal machine keys có thể là English; giải thích học sinh, hint, failure, repair, rubric và example narrative phải có parity. Thiếu một locale là Major, không được defer sang tích hợp UI.

## 9. Gói việc và lịch điều phối

### Wave 0 — Lead khóa đầu vào và schema

**S4-A0-00 — Bootstrap**

- Chạy verify release Stage 1, 2, 3; ghi checksum, working-tree scope và source issues.
- Tạo operations board, issue register, artifact version policy và write allowlists.
- Chốt schema `MARKING_LEDGER`, `METHOD_CARD`, variant/invariant, worked example và authority labels trước khi giao nguồn.
- Không giao agents cùng ghi aggregate files.

Điều kiện ra Wave 1: schema có sample giả lập tối thiểu, validation rules và Lead ký `READY`. Sample không được là lời giải bài thi.

### Wave 1 — ba agent lập bằng chứng marking theo lô

Chạy tối đa ba worker, mỗi worker chỉ ghi evidence riêng:

| Work order | Read scope | Write scope | Kết quả |
|---|---|---|---|
| `S4-A4-01` | QP/MS + map 2021–2022 | `evidence/marking/2021-2022/*` | ledger rows và source caveats của lô |
| `S4-A4-02` | QP/MS + map 2023–2024 | `evidence/marking/2023-2024/*` | ledger rows và source caveats của lô |
| `S4-A4-03` | QP/MS + map 2025 | `evidence/marking/2025/*` | ledger rows và source caveats của lô |

Mỗi agent phải đọc shared context/dependencies, giữ assessed/context distinction, không sửa Stage 1–3, không thiết kế canonical method và không tự gán điểm. A0 kiểm schema, uniqueness và locator khi nhận; trả `REWORK` nếu row chỉ sao skill tags hoặc thiếu MS basis.

### Wave 2 — ba gói chuẩn bị độc lập

| Work order | Vai trò | Outcome | Quyền quyết định bị giới hạn |
|---|---|---|---|
| `S4-A3-04` | Curriculum/variant analyst | đề xuất variant/invariant register, đủ 58 axes + 20 contrasts + 19 gaps | không ký method; không đổi taxonomy |
| `S4-A1-05` | Learning architect | kiểm schema worked example, 10-block contract, VI/EN/event handoff | không viết solution hay app |
| `S4-A4-06` | Exam analyst | cross-batch normalization proposal và authority labels | không biến aggregate thành official MS |

A0 song song merge `MARKING_LEDGER`, giải quyết trùng/xung đột bằng cách mở QP/MS gốc và ghi decision. Nếu locator/source không đủ, claim bị cách ly chứ không suy đoán.

### Wave 3 — Lead thiết kế phương pháp

A0 trực tiếp viết/chốt:

1. `METHOD_FRAMEWORK` và variant decision rules.
2. 58 `METHOD_CARDS`, ưu tiên theo dependency layers của Stage 3.
3. `MARKING_MAP` và `LOSS_PREVENTION_MAP` từ ledger đã được kiểm.
4. Worked-example selection/specs; bảo đảm mỗi pattern là primary ít nhất một lần.
5. Mapping 107 assessment requirements/rubrics và Python Stage 5 handoff.

Agents không chia nhau viết canonical method cards, vì yêu cầu sản phẩm cần một authority nhất quán và user chỉ định Lead thiết kế phương pháp. Agent có thể gửi finding/proposal trong evidence riêng.

Thứ tự authoring nên theo dependency và rủi ro:

1. foundations + representation contracts;
2. stack/queue/list/tree/hash/dictionary;
3. search/sort/string/rules;
4. OOP và files;
5. recursion/translation/main flow/output/evidence;
6. integrated contrasts và gap assessments.

Sau mỗi batch, A0 chạy validation và đóng `METHOD_DRAFT_READY`; chưa gọi là accepted trước review.

### Wave 4 — review chuyên môn chéo

- A4 kiểm 100% learner-facing marking/loss claims về locator, authority và điều kiện variant.
- A3 kiểm 100% methods/invariants về scope syllabus, representation, prerequisite và 19 book gaps.
- A1 kiểm worked-example specs, 10-block contract, VI/EN parity, giảm gợi ý và handoff event/Python.
- Tác giả finding không sửa aggregate trực tiếp. A0 sửa; đúng reviewer retest đúng `fix_version`.

Không mở thêm authoring batch nếu có ba gói `SUBMITTED/IN_REVIEW` tồn đọng hoặc có Critical/Major chưa xử lý.

### Wave 5 — A9 review độc lập và Lead double-check

A9 nhận snapshot hash cố định, kiểm aggregate, source samples rủi ro và toàn bộ acceptance checks. Sau khi A0 sửa mọi Critical/Major và A9 retest, Lead bắt buộc tự làm vòng thứ hai ở mục 11 trước khi ký gate.

## 10. Acceptance criteria đề xuất

| ID | Điều kiện PASS Stage 4 | Bằng chứng |
|---|---|---|
| S4-01 | Stage 0–3 đúng release; không file upstream bị đổi | verify logs + `INPUT_LOCK.json` |
| S4-02 | 58/58 pattern có một canonical method card, ID duy nhất, lesson/block/source links hợp lệ | aggregate validator |
| S4-03 | Tất cả variant axes có disposition; mọi method-changing variant có decision rule và case | variant register checks |
| S4-04 | 20/20 confusable contrasts được thể hiện; 4 implementation variants không bị gộp sai | contrast coverage report |
| S4-05 | 672/672 scored parts có ledger row; assessed/context/dependency/shared context giữ đúng | marking ledger validation |
| S4-06 | Mọi learner-facing marking claim có locator/authority; không gán điểm Cambridge cho aggregate/original rubric | A4 review + automated policy checks |
| S4-07 | 58/58 pattern có loss-prevention coverage cụ thể; mỗi failure có detect + repair/check | loss map validation |
| S4-08 | 58/58 pattern là primary của ít nhất một example spec; variant/boundary coverage theo policy | example coverage matrix |
| S4-09 | 107/107 assessment requirements nối method, rubric và example/transfer destination; AlgoCore labels đúng | assessment cross-reference check |
| S4-10 | VI/EN parity đầy đủ cho nội dung learner-facing, cùng IDs/version/data | parity report |
| S4-11 | 19 book gaps, Stage 1 source issues và các caveat code được carry over tới method/Python handoff liên quan | caveat closure matrix |
| S4-12 | Không artifact nào tuyên bố Python/output/trace/event đã verified; mọi phần đó có Stage 5/6 status rõ | status vocabulary check |
| S4-13 | A3/A4/A1 review xong; Critical/Major = 0 sau retest | review reports |
| S4-14 | A9 review độc lập trên snapshot cuối; findings đóng hoặc Minor defer có owner/impact hợp lệ | A9 final QA |
| S4-15 | Lead hoàn tất double-check sau A9 và ký scope gate chính xác | Lead checklist + `GATE_REVIEW` |

Số file, số dòng hoặc JSON parse không thay cho semantic acceptance. `PASS` chỉ chứng nhận thiết kế phương pháp, marking/loss map, example/rubric specification và Stage 5 handoff; không chứng nhận executable solutions.

## 11. Double-check bắt buộc của Lead trước khi kết thúc Stage 4

Lead thực hiện sau lần retest cuối, trên đúng hash dự định release:

1. Chạy lại verify Stage 1–3 và so `INPUT_LOCK`; xác nhận `git diff` không có sửa upstream ngoài phạm vi.
2. Đọc lại đủ 58 method cards, không chỉ summary; kiểm từng card có contract, variant rule, invariant/decision rule, steps, marking links, loss checks và Python status.
3. Đọc lại 20 contrast dispositions và toàn bộ method-changing variants; đặc biệt bốn convention contrasts.
4. Đọc lại đủ 58 pattern aggregates trong marking/loss map và mọi learner-facing claim bị A4/A9 từng nêu finding. Với part ledger, chạy completeness 672/672 và mở nguồn cho toàn bộ high-risk/source-issue rows cùng ít nhất một row mỗi pattern/mỗi distinct variant; ghi sample IDs và kết quả.
5. Đối chiếu 107 assessment requirements, 65 bổ sung, 19 book gaps và 14 assessment constraints; không để `observed` bị hiểu là đủ variant/transfer.
6. Kiểm primary example coverage 58/58 và VI/EN parity; một example co-tag/context không đóng coverage.
7. Kiểm mọi code/output/trace/event field vẫn đúng vocabulary `DRAFT_UNEXECUTED`, `MANUAL_ORACLE_PENDING_EXECUTION` hoặc `PENDING_STAGE5/6`; không có từ ngữ “verified/correct” vô căn cứ.
8. Đọc A9 report, kiểm từng Critical/Major có `fix_version` và `retest_result`; không ký trên artifact hash cũ.
9. Chạy validators cuối, freeze manifest, rồi mới viết `GATE_REVIEW`. Gate nêu rõ việc Stage 5 phải làm, không dùng “PASS có điều kiện” để bỏ lỗi chặn.

Nếu bất kỳ mục nào chưa xong, gate giữ `IN_PROGRESS` hoặc `CHANGES_REQUIRED`. Báo cáo `PASS` phải dẫn checksum của artifact Lead thực sự đọc lần cuối.

## 12. Rủi ro và phụ thuộc cần Lead quản

| Rủi ro/phụ thuộc | Tác động | Biện pháp trong kế hoạch |
|---|---|---|
| 672 part rows lớn, dễ dùng tag thay rubric | mất marking obligation hoặc gán sai thao tác | ba lô evidence độc lập, schema source-based, A0 merge, A4 review 100% claim learner-facing |
| Whole-part marks không tách theo pattern | thổi phồng/giả điểm | giữ marks ở part ledger; aggregate không có điểm trừ khi MS tách rõ |
| 20 pattern ít bằng chứng | overfit một đề/variant | dùng syllabus/book + micro-case/transfer; không suy xác suất thi |
| 65 nghĩa vụ bổ sung và 19 book gaps | method thiếu phần corpus/sách không cho sẵn | `AlgoCore synthesis/original` labels và Stage 5 handoff bắt buộc |
| Coursebook/MS có listing đáng ngờ | sao chép lỗi vào lời giải | carryover matrix; không dùng listing làm verified baseline |
| Stage 4/5 boundary mờ | code chưa chạy bị công bố là đúng | vocabulary và automated status check; gate scope rõ |
| Variant explosion | quá nhiều card trùng hoặc gộp mất khác biệt | bốn-level axis classification; chỉ tạo variant khi contract/state/algorithm đổi |
| VI/EN drift | hai bản khác logic, dữ liệu hoặc rubric | cùng IDs/version/data; parity trước content acceptance |
| Shared context/dependencies bị tách khỏi part | phương pháp thiếu input hoặc gọi sai operation | ledger giữ question/paper context và dependency refs |
| EVIDENCE_RUN lấn át năng lực thuật toán | screenshot bị dùng thay implementation/test design | implementation/evidence cards riêng và contrast A3C02 bắt buộc |
| Random file runtime/platform chưa khóa | chọn encoding/API không tương thích | Stage 4 chỉ chốt lựa chọn AlgoCore có issue; Stage 5 xác nhận runtime/fixtures |
| Nguồn mirror/SF và ER caveats | authority bị nói quá | giữ provenance/status Stage 1 trong mọi claim liên quan |
| Nhiều agent ghi aggregate | merge conflict và authority phân mảnh | evidence paths riêng; chỉ A0 ghi canonical aggregate |
| Review backlog | authoring nhanh nhưng chưa accepted | cap ba gói chờ; ưu tiên review/rework trước batch mới |

## 13. Đề nghị Lead chốt trước khi dispatch

Không cần hỏi người dùng thêm để bắt đầu Stage 4 theo phạm vi đã giao. Lead cần tự ghi ba quyết định nội bộ trong `METHOD_FRAMEWORK` trước khi giao Wave 1:

1. Có cho phép candidate Python xuất hiện trong Stage 4 hay chỉ solution blueprint; dù chọn cách nào, verification vẫn thuộc Stage 5.
2. Quy tắc số lượng example: đề xuất tối thiểu 58 anchor primary specs, cộng contrast/micro-case theo variant thay đổi phương pháp; không đặt quota trang.
3. Mức đọc nguồn của Lead khi double-check: đề xuất 100% aggregate learner-facing và risk-stratified original-source rows như mục 11, bên cạnh full-source review do A4 và review độc lập A9 thực hiện.

Ba quyết định này không đổi scope học thuật; chúng khóa cách sản xuất và tiêu chuẩn bằng chứng để agent không tự diễn giải khác nhau.
