# Schema contracts cho Stage 4

Đây là hợp đồng trước khi pilot. JSON Schema thực thi sẽ được tạo ở bước kickoff, kiểm bằng pilot rồi khóa version `s4-schema-v1`.

## Pattern card

Mỗi `pattern_id` có đúng một canonical card và các variant con:

```text
card_id, pattern_id, version, status
package_id, lesson_ids, knowledge_block_ids, objective_ids
titles.vi/en, recognition.vi/en
source_scope: assessed_part_ids, representative_parts, corpus_limit
confusable_pattern_refs, source_issue_refs
applicability: preconditions, representation, conventions, variant_axes
method_steps[]: step_id, action.vi/en, why.vi/en, reads, writes,
                invariant, guard, termination_role, check
marking_point_refs[], error_refs[], solution_design_ref
assessment_requirement_refs[], visual_brief_ref
authority_labels, downstream_status
```

`method_steps` mô tả logic và kiểm tra, không mang nhãn executable/verified. Khi một variant đổi convention và làm đổi thứ tự bước, tạo variant steps hoặc override rõ; không dùng một bước mơ hồ cho mọi convention.

## Marking map

Đơn vị nguồn là `part_id`; đơn vị chấm là `marking_point_id` biên tập nhưng phải có locator chính thức:

```text
part_id, question_id, paper_id, pattern_ids
qp_requirement: paraphrase, source_id, pdf_pages, constraint_refs
marking_points[]:
  marking_point_id, ms_source_id, ms_pdf_pages, criterion_paraphrase
  authority=official_ms, condition, alternatives, dependency
  award_semantics=discrete|group_max|alternative|dependent|holistic|evidence|accept_equivalent
  source_mark_value_if_unambiguous, group_id, group_max, method_step_refs
  code_or_evidence_obligation, source_issue_refs
part_disposition, review_status
```

Không sao chép dài mark scheme. `criterion_paraphrase` giữ nghĩa và locator. Nếu không thể tách số điểm do alternative/dependency, để `source_mark_value_if_unambiguous = null` và ghi cấu trúc điều kiện.

## Error prevention row

Trường tối thiểu theo playbook:

```text
question_part_id | requirement_id | marking_point_id | method_step_id
error_id | likely_error.vi/en | consequence.vi/en
detection_check.vi/en | repair_action.vi/en | repair_exercise_ref
basis = official_qp_ms | examiner_observation | source_issue | algocore_risk
source_locator_if_official | authority_note | status
```

Không gắn số điểm mất cho row nếu nguồn không chứng minh. Lỗi do AlgoCore dự đoán phải có phản ví dụ hoặc invariant hợp lý và nhãn `algocore_risk`.

## Solution design brief

```text
solution_design_id, pattern_id, variant_id
input_contract, output_contract, state_model, representation
preconditions, postconditions, invariants
ordered_method_step_ids, mutation_and_preservation_rules
termination_argument, failure_paths, alternative_designs
stage5_test_obligations: normal, boundary, counterexample, source fixture
source_constraints, source_issue_dispositions
status=PENDING_STAGE5_EXECUTION_VERIFICATION
```

Stage 4 không chứa claim “tests pass”, run log, final expected trace hoặc code đã chứng nhận.

## Assessment design brief

Mỗi trong 37 destination có:

```text
assessment_id, requirement_ids, objective_ids, knowledge_block_ids
origin = official_source_selection_pending | AlgoCore_original
task_intent.vi/en, observable_evidence.vi/en
progression: guided, faded, independent, retrieval_repair
rubric_dimensions.vi/en, boundary_cases, misconceptions
official_source_refs[], authority_note
status=DESIGNED_NOT_AUTHORED
```

107 requirement phải xuất hiện đúng trong coverage join; một assessment có thể chứa nhiều requirement, nhưng mỗi requirement vẫn có observable evidence riêng.

## Preliminary visual brief

```text
visual_brief_id, pattern_id, method_step_refs, error_refs
learning_question.vi/en, visual_mode=event_driven|static|comparison
state_to_show, proposed_event_types, predict_prompt.vi/en
normal_case, boundary_case, failure_case
representation_and_convention, static_fallback, accessibility_notes
status=PENDING_STAGE5_TRACE_AND_STAGE7_STORYBOARD
```

`event_driven` bắt buộc khi state thay đổi. `static` cần lý do gắn với câu hỏi học tập. Brief không chứa asset giả hoặc tuyên bố visual đã hoàn thành.

## Authority và trạng thái chuẩn

- `official_qp`, `official_ms`, `official_syllabus`: chỉ dùng với locator thật.
- `official_er_observation`: chỉ dùng với examiner report đúng section; không tự mở rộng sang variant khác.
- `coursebook_foundation`: kiến thức, không phải marking authority.
- `AlgoCore_original`: task/rubric tự biên soạn.
- `AlgoCore_inference` / `AlgoCore_risk`: diễn giải hoặc khuyến nghị phòng lỗi có lý do, không phải lời examiner hay điểm chấm chính thức.
- `DESIGN_REVIEWED`: thiết kế đã qua Stage 4; vẫn không đồng nghĩa code/trace verified.
- `PENDING_STAGE5_EXECUTION_VERIFICATION`: bắt buộc cho solution và transition assumptions.
