# Schema contracts cho bản v2

## `KnowledgeUnit`

Trường bắt buộc:

- `knowledge_unit_id`, `lesson_id`, `stage3_block_ids`, `disposition`, `version`.
- `objective_refs[]`: objective ID, syllabus version, section/page locator.
- `book_refs[]`: section ID, chapter, printed page, PDF page, relationship.
- `title{vi,en}`, `explanation{vi,en}`, `python_connection{vi,en}`.
- `representation{vi,en}`, `invariant_or_rule{vi,en}`, `misconceptions[]`.
- `exam_signals[]`, `micro_example`, `self_check`, `author`, `reviewer`, `status`.

Không dùng độ dài prose làm chứng cứ duy nhất. Gate semantic yêu cầu mỗi unit giải thích được khái niệm, Python consequence, invariant/rule, lỗi và cách tự kiểm.

## `PythonArtifact`

- `python_artifact_id`, `lesson_id`, `pattern_ids[]`, `version`, `filename`, `language: python`.
- `lines[]`: `{line_id, order, text}`; line ID ổn định trong một version.
- `entry_point`, `fixtures[]`, `expected_outputs[]`, `normal_boundary_failure_coverage`.
- `stage5_source_refs[]`, `author_run_ref`, `independent_rerun_ref`, `execution_log_sha256`.
- `syntax_status`, `execution_status`, `code_sha256`, `status`.
- `caption{vi,en}` và explanation được dịch; source, fixtures và expected raw output dùng chung VI/EN.

Không cho phép code nằm trong prose hoặc suy ra code type từ tên key tùy ý.

## `VisualScenarioTrace`

- `pattern_id`, `scenario_id`, `case_kind`, `trace_id`, `python_artifact_id`, `artifact_version`.
- `initial_state`, `event_ids[]`, `expected_output_ref`, `fixture_ref`, `execution_evidence_ref`.
- Nếu event set trùng scenario khác: `equivalence_justification` bắt buộc và reviewer phải chấp nhận.

## `VisualEventBinding`

- `event_id`, `trace_id`, `sequence`, `event_type`, `active_line_ids[]`.
- `before`, `delta`, `after`, `output_delta`, `invariant_or_criterion{vi,en}`.
- `prediction{vi,en}`, `feedback{vi,en}`, `visual_targets[]`.
- `accessibility`: nhãn và mô tả hành động song ngữ, interaction role, hướng dẫn bàn phím,
  focus target/order và live-status announcement song ngữ.
- Mọi `active_line_ids` phải tồn tại trong Python artifact/version được trace tham chiếu.

## `LessonReleaseRecord`

- Stable lesson/package/slug/version và 10 canonical section IDs.
- `knowledge_unit_ids[]`, `python_artifact_ids[]`, `pattern_ids[]`.
- `method_refs`, `marking_refs`, `error_refs`, `practice_refs`, `retrieval_refs`.
- `source_refs` có authority/access mode; public renderer chỉ nhận citation an toàn.
- `locale_parity`, `academic_review`, `execution_review`, `ux_review`, `lead_gate`.
- Các trường review dùng `PASS | FAIL | PENDING`; candidate phải giữ `lead_gate: PENDING`
  cho đến khi A8 hoàn tất và Lead ký gate.

## `MarkingChain`

- `marking_chain_id`, `pattern_id`, `lesson_id`, `requirement_ref`, `method_step_refs[]`.
- `error_ref`, `detection_check{vi,en}`, `repair_check{vi,en}`.
- `marking_atoms[]`: QP/MS locator và authority, hoặc `AlgoCore_authored_rubric` không có điểm Cambridge tự tạo.
- `limited_evidence`, `transfer_limit{vi,en}`, `reviewer`, `status`.

## `AssessmentItem`

- `assessment_item_id`, `lesson_id`, `pattern_ids[]`, `assessment_requirement_ids[]`, `destination_id`.
- `level`: `guided`, `faded`, `independent` hoặc `retrieval`.
- `prompt{vi,en}`, shared fixture/code/data IDs, `expected_artifact{vi,en}`, `hint`, `feedback`, `self_rubric`.
- Answer/hint phải tách khỏi initial render; feedback chỉ mở sau attempt theo contract.

## Invariants toàn hệ thống

1. VI/EN dùng chung lesson ID, knowledge unit ID, Python artifact, fixture, trace và event state.
2. Mọi nguồn Cambridge/coursebook phải có locator kiểm được; nội dung AlgoCore tự biên soạn phải gắn đúng authority.
3. Mọi output/trace claim phải nối tới execution evidence đúng code hash.
4. Event không được tham chiếu line ID từ artifact version khác.
5. Generated registry không phải nơi author trực tiếp; thay đổi phải đi từ canonical source rồi rebuild.
6. `generate:*` được phép ghi thư mục tạm; `check:*` phải read-only và chạy hai lần không làm đổi source/generated tree.
7. Hub chỉ tải course/pattern metadata; full trace phải partition theo pattern/lesson và lazy-load.
