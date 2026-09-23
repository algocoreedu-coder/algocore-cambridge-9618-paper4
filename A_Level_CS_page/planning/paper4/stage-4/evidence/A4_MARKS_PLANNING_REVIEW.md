# A4 review kế hoạch Stage 4 — phương pháp và tránh mất điểm

**Trạng thái:** kế hoạch đề xuất, chưa phải sản phẩm Stage 4 và không phải quyết định PASS.  
**Phạm vi:** Cambridge 9618 Paper 4, syllabus 2026 v2, Python console, VI/EN.  
**Không thực hiện trong tài liệu này:** viết lesson, lời giải, code mẫu, rubric cụ thể cho từng câu, sửa output Stage 0–3 hoặc mở Stage 5.

## 1. Kết luận điều phối

Stage 4 nên chạy theo hai trục độc lập rồi mới join dưới quyền Lead:

1. **Trục nguồn theo lô năm:** đọc QP/MS cho đủ 672 `part_id`, tách yêu cầu đề và cấu trúc chấm nhưng không diễn giải thành phương pháp dạy.
2. **Trục phương pháp theo pattern/package:** thiết kế 58 pattern card, điều kiện áp dụng, invariant, các bước và cách tự kiểm; không tự gán điểm Cambridge.
3. **Join do Lead sở hữu:** nối `QP requirement -> MS marking point -> method step -> likely failure -> detection/repair`, giữ nguyên source locator và authority của từng mắt xích.
4. **Phản biện độc lập:** kiểm cách cài thay thế, biến thể, trường hợp chỉ đúng output nhưng sai cấu trúc được yêu cầu, và các tuyên bố về “mất điểm”.
5. **Hai lượt kiểm của Lead:** duyệt nội dung trước QA độc lập; sau khi đóng findings, kiểm lại bản hợp nhất và manifest trước khi kết thúc Stage 4.

Cấu trúc này ngăn ba lỗi hệ thống: chia 2.175 điểm theo `assessed_pattern_ids`, biến lời khuyên AlgoCore thành quy tắc Cambridge, và gộp các variant có cùng pattern nhưng khác contract.

## 2. Đầu vào đã đọc và ràng buộc phải giữ

- [Stage 0 scope](../../stage-0/SCOPE.md), [learning-page contract](../../stage-0/LEARNING_PAGE_CONTRACT.md), [definition of done](../../stage-0/DEFINITION_OF_DONE.md): khối “Tránh mất điểm” bắt buộc có chuỗi requirement–marking point–bước giải–lỗi–kiểm/sửa; code chạy đúng không tự chứng minh đủ điểm; nội dung tạo mới phải đủ VI/EN.
- [Stage 1 corpus QA](../../stage-1/CORPUS_QA.md), [extraction policy](../../stage-1/EXTRACTION_POLICY.md), [source issues](../../stage-1/SOURCE_ISSUES.json), [missing sources](../../stage-1/MISSING_SOURCES.md): 29 QP, 29 MS, 21 SF gốc và 8 SF khôi phục; 14 issue ID nguồn duy nhất xuất hiện 27 lần; code MS chưa được chứng nhận chạy đúng; ảnh/PDF gốc có quyền cao hơn text extraction cho code, bảng, mũi tên, indent và ngoặc nhóm điểm.
- [Stage 2 question map](../../stage-2/QUESTION_PATTERN_MAP.json), [catalog](../../stage-2/EXAM_PATTERN_CATALOG.md), [confusable patterns](../../stage-2/CONFUSABLE_PATTERNS.md), [Lead decisions](../../stage-2/LEAD_DECISIONS.md): 29 paper, 87 câu, 672 ý, 2.175 điểm và 58 pattern. `primary_pattern_id` chỉ phục vụ thống kê biên tập; co-tag không chia điểm Cambridge. Có 20 cặp dễ nhầm, trong đó 4 cặp là implementation variant phải giữ cùng pattern ID nhưng khác contract.
- [Stage 3 handoff](../../stage-3/README.md), [Lead decisions](../../stage-3/LEAD_DECISIONS.md), [lesson packages](../../stage-3/LESSON_PACKAGES.json), [coverage matrix](../../stage-3/COVERAGE_MATRIX.json), [gap register](../../stage-3/GAP_REGISTER.json): 13 package, 26 lesson, 108 knowledge block, 107 assessment requirement với 324 acceptance check. Tất cả vẫn `NOT_AUTHORED`; 65 capability mới/partial, 42 observed transfer check và 19 book-specific gap còn là nghĩa vụ sản xuất hoặc kiểm chứng.
- Playbook Stage 4: Lead ký từng pattern card; A3 lập QP↔MS, A4 diễn đạt phương pháp, A5 phản biện; không coi mọi cách cho cùng output là đáp ứng đề.

Stage 4 chỉ được dùng release Stage 0–3 đã khóa. Chạy validator trước khi giao việc; nếu checksum lệch thì dừng và xử lý như thay đổi đầu vào, không regenerate rồi tiếp tục dưới gate cũ.

## 3. Mô hình thẩm quyền: official và AlgoCore không được trộn

| Lớp | Nhãn bắt buộc | Được khẳng định | Không được khẳng định |
|---|---|---|---|
| QP | `CAMBRIDGE_QP_REQUIREMENT` | Dữ kiện, command word, output/evidence và ràng buộc của đúng part | Cách chấm không có trong MS |
| MS | `CAMBRIDGE_MS_MARKING_POINT` | Tiêu chí, alternative, dependency, max/group rule và tổng điểm đúng nguồn | Mỗi bullet = 1 điểm nếu bố cục không nói vậy; một criterion áp dụng cho mọi variant |
| ER | `CAMBRIDGE_ER_OBSERVATION` | Lỗi/khó khăn examiner nêu cho đúng kỳ/variant/section | “Lỗi phổ biến” cho năm hoặc variant khác |
| Syllabus/book | `SCOPE_OR_KNOWLEDGE_SUPPORT` | Phạm vi năng lực và kiến thức hỗ trợ | Điểm chấm của một câu cụ thể |
| Suy luận AlgoCore | `ALGOCORE_INFERENCE` | Một cách giải thích vì sao hành vi có thể không đạt criterion đã dẫn | Đây là lời examiner hoặc quy tắc chấm chính thức |
| Hướng dẫn AlgoCore | `ALGOCORE_GUIDANCE` | Checklist, self-check, repair task và khuyến nghị sư phạm | “Sẽ mất N điểm” |
| Rubric tự biên soạn | `ALGOCORE_ORIGINAL_RUBRIC` | Acceptance check cho bài AlgoCore, nguồn objective và mục tiêu học tập | Câu/điểm/rubric Cambridge |

Chỉ dùng từ **common examiner error / lỗi phổ biến theo examiner** khi có ER locator trực tiếp hoặc nhiều ER độc lập thực sự hỗ trợ cùng kết luận. Nếu chỉ suy ra từ mismatch với QP/MS, dùng **likely failure / rủi ro dễ mắc** và gắn `ALGOCORE_INFERENCE`. Không suy tần suất từ số lần xuất hiện trong corpus.

ER baseline chỉ có 5 file kỳ, 15 section Paper 4, trong đó 14 section có nội dung có nghĩa; không có ER cho w21, s24, w24, s25, w25. Không mượn nhận xét 41 cho 42/43 dù QP giống nhau.

## 4. Chuỗi dữ liệu chuẩn

Đơn vị nguồn là `part_id`, không phải pattern. Một part được tách thành một hoặc nhiều QP requirement; mỗi requirement nối với một hoặc nhiều marking point, hoặc có trạng thái giải thích rõ như `HOLISTIC_PART_LEVEL`, `NO_SEPARATE_POINT` hay `EVIDENCE_ONLY`. Marking point sau đó mới nối tới bước phương pháp.

```text
paper/question/shared context
  -> part_id + official part total
  -> qpr_id (QP requirement)
  -> mp_id (MS criterion/group/alternative)
  -> pattern_id + variant_contract_id
  -> method_step_id
  -> failure_id
  -> detection_check_id + repair_exercise_id
```

### 4.1 Schema tối thiểu cho `MARKING_MAP`

```text
part_id, paper_id, question_id, source_part, primary_pattern_id
assessed_pattern_ids, context_pattern_ids, dependency_part_ids
official_part_marks
qp_requirement[]:
  qpr_id, summary_en, summary_vi, command_word, required_product
  qp_source_id, qp_pdf_pages, source_region, shared_context_refs
marking_point[]:
  mp_id, summary_en, summary_vi
  authority=CAMBRIDGE_MS_MARKING_POINT
  ms_source_id, ms_pdf_pages, source_region, facsimile_checked
  award_semantics
  explicit_mark_value|null, group_id|null, group_max|null
  alternative_group_id|null, dependency_refs[], carry_forward_note|null
  source_issue_ids[], interpretation_status
links[]:
  qpr_id, mp_id, mapping_role, pattern_id, variant_contract_id
  method_step_ids[], evidence_location, mapping_rationale
review:
  author, reviewer, lead_pass_1, independent_qa, lead_pass_2
```

`award_semantics` phải phân biệt ít nhất `DISCRETE`, `GROUP_MAX`, `ALTERNATIVE`, `DEPENDENT`, `HOLISTIC`, `EVIDENCE`, `ACCEPT_EQUIVALENT`. Nếu source không ghi số cho một bullet, `explicit_mark_value=null`; không tự điền 1.

### 4.2 Schema tối thiểu cho `PATTERN_CARDS`

```text
pattern_id, titles.vi/en, status, package_ids, lesson/block/objective refs
recognition_cues.vi/en, command_words, required_products
applicability, preconditions, invariants, termination
confusable_pattern_refs[], variant_contracts[]
method_steps[]:
  method_step_id, sequence, purpose.vi/en, action.vi/en
  precondition, invariant_preserved, completion_check
  qpr_refs[], mp_refs[], authority_note
solution_designs[]:
  design_id, variant_contract_id, outline_only
  status=DESIGN_ONLY_UNVERIFIED_STAGE5_REQUIRED
  accepted_by_source|proposed_equivalent, limits
evidence_requirements, source_refs, assessment_requirement_refs
```

Stage 4 không đưa executable code hoặc output đã “verified” vào card. Alternative do A5 đề xuất chỉ được ghi `PROPOSED_EQUIVALENT`; Stage 5 mới được nâng trạng thái sau khi chạy và đối chiếu requirement.

### 4.3 Schema tối thiểu cho `ERROR_PREVENTION_MATRIX`

Giữ tối thiểu các trường playbook, dùng `part_id` làm khóa cụ thể hơn `question_id`:

```text
failure_id, part_id, question_id, pattern_id, variant_contract_id
qpr_id, mp_id, ms_locator
method_step_id, code_or_evidence_location
failure_label.vi/en, consequence.vi/en
claim_authority, claim_source_refs[], prevalence_claim
detection_check.vi/en, repair_action.vi/en, repair_exercise_id
exact_mark_loss_claim|null, review_status
```

`exact_mark_loss_claim` mặc định `null`. Chỉ được có giá trị khi MS thể hiện phân bổ trực tiếp và không bị alternative/group max/dependency làm kết luận sai. Ngay cả khi một criterion có một mark rõ, nội dung học sinh nên nói “có thể không đạt criterion MP-x” thay cho cam kết máy móc “mất đúng 1 điểm”.

### 4.4 Schema riêng cho rubric AlgoCore

```text
assessment_requirement_id, objective_id, assessment_id
criterion_id, description.vi/en, observable_evidence
knowledge_block_ids, pattern_ids, acceptance_check_refs
authority=ALGOCORE_ORIGINAL_RUBRIC
official_marks=null, cambridge_question_ref=null
scoring_mode=CHECKLIST|LEVEL_DESCRIPTOR
status=PLANNED_NOT_AUTHORED
```

Nếu sau này cần điểm số nội bộ, dùng trường `algocore_score` và nhãn hiển thị “AlgoCore practice score”; không tái sử dụng `official_marks` và không tạo paper code giả.

## 5. Quy tắc chống “điểm giả”

1. Tổng `official_part_marks` phải khớp đúng 672 row và 2.175 điểm của Stage 2; không phân bổ lại theo primary/co-tag.
2. `assessed_pattern_ids` cho biết thao tác được đánh giá, không cho biết mỗi pattern nhận bao nhiêu điểm.
3. Không cộng số bullet, dòng code mẫu hoặc checkbox để suy ra mark total. Trường hợp `W21-2E-RUBRIC` giữ tổng 8, hai bullet exception và nhóm `max 7`; không được biến thành 9.
4. Marking point chỉ là official khi có `ms_source_id + pdf page + facsimile_checked`. Suy luận từ code mẫu, sách hoặc syllabus không được đổi authority.
5. QP/MS tiếng Anh được giữ nguyên danh tính nguồn. `summary_vi` là diễn giải hỗ trợ AlgoCore, không phải bản đề/mark scheme tiếng Việt chính thức.
6. Rubric cho 107 assessment requirement Stage 3 là AlgoCore original, `official_marks=null`; 324 acceptance check không được gọi là 324 marking point Cambridge.
7. Không hứa “full marks”, “guaranteed marks” hoặc “mất N điểm” khi source không hỗ trợ. Không dùng tỷ lệ xuất hiện của pattern để dự báo đề.
8. Một output đúng chưa đủ nếu QP/MS yêu cầu cấu trúc, algorithm, evidence, file operation, object method, pointer update hoặc cách trình bày cụ thể.

## 6. Xử lý variant và câu tương đương

Giữ ba lớp variant riêng:

- `source_variant`: year/session/component 41/42/43 và source locator riêng;
- `task_variant`: dữ liệu, command word, mode completion/adapt/output, dependency và evidence;
- `implementation_variant`: next-free/current-top, linear/circular queue, free-list/object-reference list, Spare/bucket hash, iterative/recursive, destructive/non-destructive reduction.

Quy tắc:

1. Không gộp 672 part thành một hàng canonical. Mỗi part giữ requirement, MS, mark total và issue refs riêng dù Stage 2 xác định text-equivalent.
2. Có thể dùng chung `method_step_id` khi invariant và contract giống nhau; mọi khác biệt đi vào `variant_delta` và link ngược tới từng part.
3. Một pattern card phải có `variant_contracts`; không viết một phương pháp mặc định ngầm bao phủ mọi cài đặt.
4. 20 cặp trong `CONFUSABLE_PATTERNS` phải có đối chiếu rõ. Bốn cặp same-pattern implementation variant bắt buộc được kiểm đầy đủ, không chỉ lấy mẫu.
5. Dependency và shared question context phải đi theo part. Không dạy một subpart như bài độc lập nếu nó dùng hàm, dữ liệu hoặc state từ part trước.
6. Alternative implementation chỉ được gọi accepted khi MS cho phép hoặc Lead chứng minh nó đáp ứng toàn bộ requirement; trước Stage 5 chỉ là design proposal cần kiểm chứng.
7. Khi QP và MS bất nhất, lưu cả hai, link `SOURCE_ISSUES`, nêu quyết định Lead và giới hạn; không “sửa sạch” source. Ví dụ năm 2021: năm object trong QP so với một bullet MS ghi bốn phải giữ caveat, không dạy capacity bốn như requirement.

## 7. Xử lý bằng chứng và lỗi nguồn

Thứ tự bằng chứng cho Stage 4:

1. QP facsimile/PDF: requirement và context.
2. MS facsimile/PDF: award structure, alternative, max/group và evidence.
3. Source files: input/output file contract; tám SF mirror giữ provenance và không được mô tả là đã byte-verified với Cambridge host.
4. ER đúng section: nhận xét examiner; không mở rộng sang variant khác.
5. Syllabus: scope/capability, không phải marking point câu lịch sử.
6. Coursebook: kiến thức/phương pháp nền, không phải official solution hoặc rubric.
7. AlgoCore inference/guidance: giải thích và repair, luôn có nhãn.

Mọi issue trong `SOURCE_ISSUES.json` phải được đưa vào `SOURCE_EXCEPTION_REGISTER` bằng occurrence theo paper và một record canonical theo 14 ID duy nhất. Hai occurrence `source_marking_interpretation` của một canonical issue `W21-2E-RUBRIC` bắt buộc Lead adjudicate ở Stage 4. Mười chín occurrence `source_code_verification_required`, thuộc 11 canonical ID, tiếp tục chặn nhãn verified solution tới Stage 5; chúng không được giải quyết bằng cách sao code MS vào card.

Text extraction chỉ dùng tìm kiếm và bootstrap. Reviewer phải xem ảnh/PDF khi có code, underscore/case, assignment arrow, indent, bảng hoặc cấu trúc group/max. Nếu locator không đọc được, trạng thái là `BLOCKED_SOURCE`, không điền nội dung suy đoán.

## 8. Artifacts Stage 4 đề xuất

| Artifact | Nội dung | Chủ sở hữu |
|---|---|---|
| `README.md` | Cách dùng, trạng thái và giới hạn Stage 4 | Lead |
| `SCHEMA.md` + `schemas/*.json` | Enum, required fields, authority và validation | Lead |
| `WORK_ORDERS.md` | Batch, file ownership, input digest, QA/gate | Lead |
| `QUESTION_REQUIREMENTS.json` | QP requirements cho đủ 672 part | Exam analysts |
| `MARKING_MAP.json/.md` | Official QP↔MS và link tới method step | Exam analysts + Lead join |
| `PATTERN_CARDS.json/.md` | 58 card VI/EN, variant contracts, method design | Method authors + Lead |
| `ERROR_PREVENTION_MATRIX.json/.md` | Lỗi/rủi ro, authority, detection, repair | Method authors + exam analyst review |
| `ALGOCORE_RUBRIC.json/.md` | 107 requirement, 324 acceptance check, official marks null | Lead/A4 |
| `VARIANT_REGISTER.json/.md` | Source/task/implementation variants và delta | A5 + Lead |
| `SOURCE_EXCEPTION_REGISTER.json/.md` | 14 canonical issue, 27 occurrence và disposition | A3 + Lead |
| `SOLUTION_DESIGN_BRIEFS.json/.md` | Outline/alternative cần Stage 5 kiểm, không có verified code | A5 + Lead |
| `VISUAL_BRIEFS.json/.md` | Sơ bộ state/predict/error focus, chưa có storyboard/event | A4/A5 |
| `evidence/<batch>/...` | Submission, self-check, finding, correction | Mỗi agent, file riêng |
| `evidence/A8_REVIEW.*` | QA độc lập | A8 |
| `QA_REPORT.md`, `GATE_REVIEW.*`, `RELEASE_MANIFEST.json` | Kết quả cuối, checksum, input digest | Lead |

Markdown là bản đọc; JSON là source of truth. Builder/validator tạo aggregate từ file batch; agent không cùng sửa file aggregate trong lúc chạy song song.

## 9. Chia lô và ownership

### 9.1 Trục nguồn QP/MS

| Lô | Phạm vi đã khóa | Khối lượng baseline | Output riêng |
|---|---|---:|---|
| S1 | 2021–2022 | 11 paper, 33 câu, 228 part, 825 điểm | `batches/source-2021-2022/` |
| S2 | 2023–2024 | 12 paper, 36 câu, 304 part, 900 điểm | `batches/source-2023-2024/` |
| S3 | 2025 | 6 paper, 18 câu, 140 part, 450 điểm | `batches/source-2025/` |

Mỗi lô có một exam analyst chịu trách nhiệm end-to-end, không chia cùng paper cho hai người. A3 Lead analyst thống nhất cách split requirement/marking point trên pilot và review chéo các group/max/alternative trước merge.

### 9.2 Trục pattern/method

| Lô | Pattern | Baseline primary parts tham chiếu | Ghi chú |
|---|---:|---:|---|
| P0 pilot — linked list | 4 | 21 | Có pointer/free-list, dependency, source caveat; đủ khó để thử schema |
| M1 foundations + text | 13 | 80 | Validation, rule, record/string; khóa ranh giới record/OOP |
| M2 search + sort | 8 | 44 | Điều kiện sorted, bounds, stable/ordered distinctions |
| M3 stack + queue | 10 | 63 | Pointer convention, linear/circular, destructive/non-destructive |
| M4 recursion + tree + dictionary/hash | 9 | 31 | Base/return, representation variants, dictionary/hash boundary |
| M5 OOP | 8 | 132 | Class/record, set/update, override/instantiate distinctions |
| M6 files + integration | 6 | 301 | Chia evidence theo source-year subfolder để tránh một submission quá lớn |

Package `support` không có pattern card riêng; các objective của nó được xử lý qua `ALGOCORE_RUBRIC` và link vào card liên quan. Lô M6 có nhiều part vì `MAIN_FLOW`/`EVIDENCE_RUN`; cần chia nội bộ theo S1/S2/S3 nhưng vẫn chỉ có một card canonical cho mỗi pattern.

Part có nhiều assessed pattern có đúng một owner theo `primary_pattern_id`; owner lưu toàn bộ official row. Pattern co-tag nhận `cross_pattern_ref`, không tạo bản sao điểm. Lead validator phải báo lỗi nếu một `part_id` xuất hiện hai lần hoặc mất link tới assessed pattern.

## 10. Pipeline agent với tối đa bốn slot

### Pilot bắt buộc

1. Lead khóa schema, enum authority, cách group/max/alternative và chọn toàn bộ linked-list package làm P0.
2. A3 lập QP/MS map cho mọi part liên quan P0 và source exceptions.
3. A4 viết bốn method card VI/EN và error/repair draft chỉ từ map đã nộp.
4. A5 phản biện invariant, free-list/object-reference variant, cách thay thế và output-only trap.
5. Lead adjudicate, yêu cầu sửa, kiểm lại; A8 kiểm độc lập pilot. Chỉ khi P0 PASS mới nhân rộng.

### Pipeline nhân rộng

- Slot Lead: khóa input, giải quyết ambiguity, join, review và gate; không làm QA độc lập thay A8.
- Slot A3-source: xử lý lô nguồn kế tiếp; nộp `SUBMITTED`, không tự đặt `PASS`.
- Slot A4-method: làm lô method đã có source map ổn định.
- Slot A5-review hoặc A8-QA: A5 phản biện lô vừa nộp; A8 chỉ vào sau correction để giữ độc lập.

Có thể chạy kiểu cuốn chiếu: A3 làm S2 khi A4 viết M1 từ phần đã chấp nhận, A5 review P0; nhưng không để A4 đoán marking point chưa được A3/Lead chấp nhận. A8 không đồng tác giả file sẽ kiểm.

Mỗi work order phải ghi: input digest; paper/pattern/objective IDs; file được sửa và file read-only; nguồn/facsimile phải xem; output; self-check; independent reviewer; PASS criteria; cấm mở Stage 5.

## 11. QA toàn phần và QA lấy mẫu

### 11.1 Kiểm toàn phần bắt buộc

Máy và reviewer phải kiểm 100%:

- 672/672 `part_id`, 29 paper, 87 question; tổng `official_part_marks=2175` và khớp input.
- 58/58 pattern card; mọi pattern có recognition, applicability, variant, method, check, error/repair và source link.
- Mọi QP requirement có disposition; mọi official marking point có MS locator và nối tới requirement; orphan/missing link bằng 0.
- Mọi link marking point→method step có rationale; step không có official ref không được render như marking point.
- 107/107 AlgoCore assessment requirement và 324/324 acceptance check có criterion/link; `official_marks=null` toàn bộ.
- 20/20 confusable pair và 4/4 same-pattern implementation variant được phản ánh trong card/variant register.
- 14/14 source issue ID canonical và 27/27 occurrence được kế thừa; mọi affected part có link/disposition.
- Mọi `CAMBRIDGE_*` claim có locator; mọi failure/prevalence claim có authority; `exact_mark_loss_claim` không có giá trị vô căn cứ.
- VI/EN parity theo cùng ID/version; source English, identifiers và official data không bị dịch đổi.
- Dependency/context links còn nguyên; duplicate `part_id`, duplicate official mark allocation và broken ID đều bằng 0.

A3 phải đọc source cho toàn bộ 672 row; A4/A5 phải review đủ 58 card. Automated validation không thay cho semantic review.

### 11.2 QA độc lập theo mẫu rủi ro

A8 thực hiện kiểm cơ học 100% như trên, rồi semantic sample là **hợp tập** sau:

- toàn bộ group max, alternative, holistic, dependency/carry-forward và evidence requirement phức tạp;
- toàn bộ part bị ảnh hưởng bởi 14 source issue ID, gồm mọi occurrence theo variant;
- toàn bộ 20 confusable pair và bốn implementation-variant contrast;
- ít nhất hai part cho mỗi pattern nếu có, nếu pattern chỉ có một thì kiểm part đó;
- ít nhất một question cho mỗi 29 paper, đủ 41/42/43 và mọi year/session;
- toàn bộ claim gắn ER và toàn bộ claim có `exact_mark_loss_claim` khác null;
- thêm mẫu xác định bằng hash tối thiểu 10% phần còn lại để tránh chọn mẫu thuận tiện.

Mẫu phải ghi seed/algorithm và danh sách ID. Finding trên mẫu kéo theo rà lại toàn bộ lớp liên quan, ví dụ sai authority phải quét mọi claim cùng authority; không chỉ sửa row bị bắt gặp.

## 12. Hai lượt kiểm bắt buộc của Lead

### Lead pass 1 — trước QA độc lập

- đọc và ký từng P0 card trước khi cho nhân rộng;
- đọc đủ 58 pattern card và variant contracts;
- đọc đủ 672 chuỗi part-level QP↔MS↔method ở bản hợp nhất, ưu tiên facsimile cho vùng nhạy cảm;
- adjudicate mọi `AMBIGUOUS`, `GROUP_MAX`, `ALTERNATIVE`, `SOURCE_CONFLICT` và cả hai occurrence của source marking interpretation;
- xác nhận mọi lời khuyên “mất điểm” có authority đúng và không có điểm giả.

### Lead pass 2 — sau correction và A8

- đọc A8 findings và bằng chứng correction, không chỉ trạng thái self-check;
- re-run validator trên toàn release; kiểm lại toàn bộ row bị sửa và toàn bộ lớp bị finding tác động;
- kiểm lại 58 card ở bản render/aggregate cuối, đặc biệt variant delta và official/AlgoCore label;
- đối chiếu lại số lượng 672/2.175/58/107/324/20/14/27 và input digests;
- freeze checksum rồi mới ký `GATE_REVIEW`; Stage 5 vẫn `NOT_STARTED` cho tới lúc này.

Hai pass phải lưu timestamp, reviewer, artifact checksum và danh sách ID đã đọc. Một chữ ký chung không đủ chứng minh double-check.

## 13. Gate criteria

| Gate | PASS khi | FAIL/REWORK khi |
|---|---|---|
| G4-0 Input lock | Stage 0–3 verify PASS và digest khớp | Input bị sửa/regenerate hoặc source không truy được |
| G4-1 Pilot | P0 đủ source→method→failure→repair; A5/A8 và Lead chấp thuận | Schema không biểu diễn được variant/group/dependency |
| G4-2 Source map | 672 part, 2.175 điểm, locator/disposition đủ | Thiếu part, suy bullet marks, gộp variant làm mất source truth |
| G4-3 Pattern methods | 58 card VI/EN, điều kiện/invariant/check đầy đủ | Hướng dẫn chung chung, chỉ đúng output, thiếu biến thể |
| G4-4 Authority | Official và AlgoCore tách máy đọc/hiển thị được | AC advice mang nhãn Cambridge; official locator thiếu |
| G4-5 Error prevention | Failure có căn cứ, detection và repair | Gọi “common” không có ER; tuyên bố mất điểm vô căn cứ |
| G4-6 Coverage | 107 requirement/324 check và mọi assessed link có đích | Khoảng trống bị che bởi card hoặc rubric giả |
| G4-7 QA | Full checks sạch; A8 sample sạch sau correction | Finding bắt buộc còn mở hoặc chỉ có self-check |
| G4-8 Lead final | Hai pass có evidence, checksum freeze, gate ký | Lead chưa đọc bản sau sửa hoặc aggregate khác bản đã review |

`BLOCKED_SOURCE` chỉ dùng khi QP/MS cần thiết không đọc/định vị được. Thiếu ER không chặn Stage 4; nó chặn tuyên bố examiner/common. Code MS chưa chạy không chặn method design nhưng bắt buộc giữ `STAGE5_VERIFICATION_REQUIRED` và cấm nhãn verified solution.

## 14. Tiêu chí bàn giao sang Stage 5

Stage 4 chỉ được kết thúc khi tất cả gate trên PASS và không còn placeholder, ambiguous authority hoặc source conflict chưa adjudicate. Bàn giao sang Stage 5 gồm method/variant contract đã ký, solution design ở trạng thái chưa kiểm chứng, requirement/marking links, edge cases cần test và source issue refs. Stage 5 phải chạy/trace độc lập; không được coi code MS hoặc outline Stage 4 là ground truth thực thi.

Kế hoạch này không thay đổi trạng thái `NOT_AUTHORED`/`NOT_IMPLEMENTED` của Stage 3. Nó chỉ định cách sản xuất và kiểm Stage 4 mà không mất điểm do hiểu sai QP/MS, không tạo điểm Cambridge giả và không kết thúc stage trước lượt kiểm lại của Lead.
