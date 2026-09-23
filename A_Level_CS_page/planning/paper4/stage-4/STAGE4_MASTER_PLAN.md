# Master plan Stage 4

## 1. Mục tiêu và định nghĩa hoàn thành

Stage 4 biến hệ thống dạng bài của Stage 3 thành một đặc tả phương pháp có thể dùng để viết bài học và kiểm chứng ở các stage sau. Mỗi dạng phải trả lời được sáu câu hỏi:

1. Học sinh nhận ra dạng này bằng dấu hiệu nào và phân biệt với dạng gần giống ra sao?
2. Điều kiện, representation và convention nào phải xác định trước khi giải?
3. Trình tự giải gồm những bước nào, vì sao từng bước đúng, invariant và điều kiện dừng là gì?
4. QP thực sự yêu cầu gì, MS chấm điều gì, và bước/phần evidence nào đáp ứng tiêu chí đó?
5. Lỗi thường gặp gây hậu quả gì, phát hiện bằng cách nào và luyện sửa ra sao?
6. Visual sau này cần giúp học sinh quan sát hoặc dự đoán state nào?

Đầu ra canonical dự kiến:

- `PATTERN_CARDS.json/.md`: 58 card, một card cho mỗi `pattern_id` đã khóa.
- `VARIANT_INVARIANT_REGISTER.json/.md`: mọi variant axis của 58 pattern, 20 contrast dễ nhầm, decision rule và invariant/case cần kiểm.
- `MARKING_MAP.json/.md`: mọi `part_id` trong 672 part có disposition; tiêu chí chính thức được tách thành marking-point atom có locator, điều kiện và liên kết tới method step/evidence.
- `ERROR_PREVENTION_MATRIX.json/.md`: requirement → marking point → method step → lỗi → phát hiện → sửa/luyện lại.
- `SOLUTION_DESIGN_BRIEFS.json/.md`: hợp đồng lời giải, invariant, biến thể, điều kiện dừng, test obligations; chưa xác nhận code/trace.
- `WORKED_EXAMPLE_SPECS.json/.md`: ít nhất một anchor spec mà pattern là primary, cùng contrast/boundary micro-case khi biến thể làm đổi phương pháp; code/output/trace vẫn chờ Stage 5.
- `ASSESSMENT_DESIGN_BRIEFS.json/.md`: 37 destination bao phủ đủ 107 assessment requirement; nội dung tự biên soạn ghi `AlgoCore original` và không gắn điểm Cambridge.
- `PRELIMINARY_VISUAL_BRIEFS.json/.md`: câu hỏi học tập, state/event dự kiến, Predict và trường hợp thường/biên/lỗi cho 58 dạng hoặc quyết định static visual có lý do.
- `SOURCE_CAVEAT_CARRYOVER.json/.md`: mọi issue nguồn Stage 1 và cảnh báo sách Stage 3 liên quan, disposition ở Stage 4 và nghĩa vụ chuyển Stage 5.
- `INPUT_LOCK.json`, `STAGE4_COVERAGE_AUDIT.json/.md`, `QA_REPORT`, `GATE_REVIEW`, `RELEASE_MANIFEST`.

PASS của Stage 4 chỉ xác nhận **thiết kế phương pháp và marking/error traceability**. Nó không xác nhận Python chạy đúng, output đúng, event trace đúng, lesson đã viết hoặc route đã hoạt động.

Stage 4 không đưa candidate Python vào artifact learner-facing. Nếu reviewer cần sketch để chỉ ra một rủi ro thì sketch chỉ nằm trong evidence, mang `DRAFT_UNEXECUTED` và không được merge làm solution. Canonical output dùng solution blueprint/Python contract; Stage 5 mới tạo hoặc chốt executable source.

## 2. Pilot bắt buộc

Pilot dùng package **stack** với 5 pattern: `STACK_SETUP`, `STACK_PUSH`, `STACK_POP`, `STACK_PAIR`, `STACK_REDUCE`.

Stack được chọn vì một pilot duy nhất có thể kiểm tra:

- hai convention của top pointer và điều kiện full/empty;
- state mutation, invariant và boundary;
- thao tác đơn, phối hợp hai stack/rollback và reduction;
- phân biệt output đúng với cấu trúc/operation bắt buộc trong MS;
- yêu cầu event rõ nhưng chưa cần triển khai visual;
- pattern phổ biến lẫn pattern có corpus hạn chế.

Pilot phải hoàn thành đủ 5 loại artifact, qua A3/A4/A5/A1 review, A8 kiểm độc lập và Lead gate riêng. Chỉ sau `PILOT_GATE = PASS` mới nhân schema cho 53 pattern còn lại. Nếu schema thay đổi sau pilot, phải migrate và kiểm lại 5 pilot card trước khi tiếp tục.

## 3. Thứ tự batch

Stage 4 chạy hai trục rồi Lead mới join:

- **Trục nguồn/marking theo năm:** S1 = 2021–2022 (11 paper, 228 part, 825 marks); S2 = 2023–2024 (12 paper, 304 part, 900 marks); S3 = 2025 (6 paper, 140 part, 450 marks). Mỗi `part_id` có đúng một owner/ledger row; part nhiều assessed pattern giữ mọi cross-reference nhưng không bị sao chép hoặc chia điểm.
- **Trục phương pháp theo package:** pilot P0 và B1–B8 dưới đây tạo 58 canonical card. Một method batch chỉ dùng marking rows đã được A3/Lead chấp nhận, không tự đoán criterion còn chờ source review.

Hai trục được phép chạy cuốn chiếu, nhưng canonical join chỉ do Lead ghi. Tổng trục nguồn luôn phải khớp 29 paper, 87 question, 672 part và 2175 marks trước final gate.

| Batch | Package/pattern | Số pattern | Mục tiêu kiểm soát chính |
|---|---|---:|---|
| P0 | stack | 5 | Convention, mutation, rollback/reduction, schema pilot |
| B1 | foundations + text | 13 | Kiểu dữ liệu, validation, translation, manual string/RLE synthesis |
| B2 | search-sort | 8 | Preconditions, comparator/order, invariant, algorithm confusions |
| B3 | queue + linked-list | 9 | FIFO conventions, destructive/non-destructive use, pointer/free-list changes |
| B4 | recursion + tree | 5 | Base/progress/return, call-stack design, tree representation/traversal variants |
| B5 | dictionary/hash | 4 | Dictionary boundary, collision schemes, hash table vs random file |
| B6 | OOP | 8 | Class/record boundary, state, constructor, inheritance/override/containment |
| B7 | files | 3 | File mode/layout, record boundaries, exception/cleanup and evidence |
| B8 | integration | 3 | Main flow, exact output format and examination evidence |

Package `support` không có pattern riêng. Các objective Big O, graph, ADT abstraction, recursion stack và file organisation được sản xuất qua 37 assessment design brief và knowledge/method supplement trong card liên quan; graph không được biến thành bài code. Coverage audit phải chứng minh đủ 107 assessment requirement, không chỉ đủ 58 pattern.

Batch đi theo thứ tự trên để giảm rework; Lead có thể cho hai batch độc lập chạy song song chỉ khi mỗi artifact có owner/file riêng và không dùng output chưa PASS làm input. Tối đa ba agent chuyên môn chạy đồng thời cùng Lead.

## 4. Pipeline trong mỗi batch

### Round A — nguồn và bản nháp phương pháp

- A3 lập requirement/marking atoms từ QP/MS trong source batch S1/S2/S3, giữ locator và alternative/conditional logic.
- A4 viết recognition, applicability và method steps VI/EN từ Stage 3 mapping.
- A2 rà source issues, SF dependency, examiner evidence và locator rủi ro; không sửa nguồn.

Ba agent ghi file submission riêng, không cùng sửa canonical artifact.

### Round B — phản biện và learning contract

- A5 thử convention khác, counterexample, mutation/preservation, termination và alternative implementation. A5 tạo test obligations cho Stage 5, không chứng nhận code.
- A1 kiểm stable ID, VI/EN parity, 10-slot handoff và ranh giới stage.
- A6 viết preliminary visual brief từ điểm khó/lỗi đã xác nhận; không dựng storyboard hoặc asset.

A4/A3 sửa finding cụ thể, nộp lại; reviewer kiểm lại finding đã sửa.

### Round C — Lead review theo batch

Lead hợp nhất và trực tiếp đọc toàn bộ card, marking atoms, error rows, assessment requirement coverage và visual decision của batch. Lead đối chiếu QP/MS ở mọi điểm có lời khuyên “mất điểm”; lời khuyên không có tiêu chí chính thức phải mang nhãn `AlgoCore risk/recommendation`.

Batch không được đóng nếu còn `PENDING_SOURCE_DECISION`, locator thiếu, method step không giải thích lý do, variant bị gộp sai hoặc solution design ngầm tuyên bố code đã chạy.

### Round D — A8 và rework

A8 kiểm độc lập identity/join bằng máy và semantic theo rủi ro. A8 không tự sửa canonical output. Lead phát hành finding có ID, owner và cách kiểm lại; agent sửa, A8/Lead recheck. Chỉ batch PASS mới được đưa vào aggregate cuối.

## 5. Quy tắc học thuật bắt buộc

- QP, MS, SF, syllabus và coursebook có vai trò riêng. MS quyết định tiêu chí chấm của câu nguồn; sách cung cấp kiến thức; AlgoCore cung cấp sư phạm và bài tự biên soạn.
- Chỉ gọi một lỗi là nhận xét/lỗi phổ biến của examiner khi có ER đúng section làm nguồn. Thiếu ER không chặn method design, nhưng bắt buộc dùng nhãn `AlgoCore risk/inference` và không suy tần suất.
- Mỗi marking point phải có MS locator. Suy luận sư phạm không được gắn nhãn official hoặc cấp số điểm.
- Không nói học sinh “mất chính xác N điểm” nếu MS dùng alternative, dependency, level hoặc cách phân bổ không cho phép kết luận đó.
- Cùng output không đủ nếu câu yêu cầu structure, function, recursion, ADT operation, file mode, evidence hay format cụ thể.
- Mỗi card giữ representation/convention riêng của source variant: index base, sentinel, top/head/tail meaning, fixed capacity, ordering, duplicate policy, mutation và output contract.
- `observed` không có nghĩa phủ mọi variant. Pattern ít dữ liệu vẫn có card nhưng giới hạn corpus phải hiện rõ.
- Giữ các quyết định Stage 3: dictionary khác hash; in-memory hash khác random file; sequential read khác key-ordered organisation; recursive output khác recursive trace; supplied class skeleton khác independent class design; append khác ordered insertion; graph không code.
- Source issues Stage 1 và cảnh báo code sách Stage 3 phải có disposition trước khi dùng ví dụ. Stage 4 chỉ ghi design resolution; Stage 5 mới xác minh thực thi.
- Student-facing plan có VI/EN dùng chung ID, source English giữ nguyên. Không dịch identifier/required string nếu điều đó làm sai contract của câu.

## 6. Phủ syllabus và corpus

Ba mẫu số phải được kiểm riêng:

1. **Pattern:** 58/58 có card và solution/visual decision.
2. **Corpus:** 672/672 part có marking-map disposition; các part nhiều pattern giữ mọi assessed relation, không chia điểm giả giữa pattern.
3. **Curriculum:** 107/107 assessment requirement đi tới một trong 37 assessment design brief và tới block/card hoặc supplement phù hợp. Cả 65 mục corpus chưa đủ và 19 khoảng trống sách có kế hoạch sản xuất rõ.

Không dùng một mẫu số để suy ra mẫu số khác. Tổng 2175 marks của corpus chỉ dùng kiểm tính toàn vẹn index; tổng marking atoms không bắt buộc cộng bằng 2175 khi MS có alternative/conditional/dependent criteria.

## 7. Double-check của Lead trước khi kết thúc

Lead thực hiện hai lượt độc lập về thời điểm:

- **Lead pass 1 — trước A8:** đọc 100% của 58 card, 37 assessment brief, mọi marking-map row và error row; đối chiếu exact source locator, method coverage, variant boundary và authority label. Kiểm đủ 20 contrast dễ nhầm và mọi source issue instance có disposition.
- **Lead pass 2 — sau rework/A8:** chạy lại checks từ Stage 1–3, so checksum đầu vào; đọc lại mọi finding và artifact bị ảnh hưởng; kiểm lại 100% card/brief ở trạng thái final và các marking/error row đã thay đổi; đối chiếu hash mà A8 đã review.

Nếu pass 2 phát hiện lỗi, gate trở lại `REWORK`; không ký PASS trước khi agent sửa và reviewer kiểm lại. Sau PASS, Lead khóa manifest, ghi Stage 5 `NOT_STARTED` và không tự chạy code/trace như một phần của Stage 4.
