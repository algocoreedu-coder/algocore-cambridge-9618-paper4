# Stage 2 schema và Definition of Done

Version 1.1. Owner A0. Date 22/09/2026. State: planning contract; chưa có output Stage 2.

## Record contracts

### Objective và requirement

`SYLLABUS_OBJECTIVES.jsonl` giữ đúng 99 parent rows:

```text
objective_id, domain_id, syllabus_section, authority_source_id, authority_locator,
controlled_requirement, scope_class(REQUIRED|SUPPORTING|OUT_OF_SCOPE),
atomic_requirement_ids, book_map_ids, prerequisite_ids,
planned_learning_unit_ids, coverage_state, review_status
```

`OBJECTIVE_REQUIREMENTS.jsonl` tách notes/guidance đa mục mà không ấn định trước số child:

```text
requirement_id, parent_objective_id, ordinal, authority_locator,
requirement_kind, controlled_requirement, scope_class,
planned_learning_unit_ids, official_assessment_unit_ids,
original_blueprint_id_or_null, coverage_disposition, evidence_refs
```

Parent chỉ PASS khi mọi required child PASS; validator không cộng parent và child như hai objective.

### Prerequisite và learning map

```text
edge_id, from_id, to_id, edge_type(HARD|RECOMMENDED|SHARED_CONCEPT),
rationale, evidence_ref, authority(ALGOCORE_PEDAGOGY|SYLLABUS_EXPLICIT), review_status
```

Learning unit là planned container: `learning_unit_id, objective_ids, requirement_ids, prerequisite_unit_ids, pattern_ids, source_packet_refs, pilot_id_or_null, state=PLANNED`. Không chứa prose bài học.

### Assessment unit

Một row ứng với đúng một leaf part hoặc whole question không có child:

```text
assessment_unit_id, corpus_target_id, marking_item_id, qp_locator, ms_locator,
context_dependency_ids, command_word_observed_or_null,
response_product, primary_requirement_ids, supporting_requirement_ids,
primary_pattern_id, secondary_pattern_ids,
scope_2026_status(IN_SCOPE|PARTIAL|SUPPORTING|OUT_OF_SCOPE|NEEDS_REVIEW),
classification_confidence, classification_evidence,
stimulus_tags, visual_or_table_dependency_ids, usage_state, review_status
```

`command_word_observed_or_null` là observation; analyst-derived action phải lưu trường riêng và evidence. Không phân loại bằng keyword đơn lẻ.

`primary_requirement_ids` bắt buộc không rỗng cho `IN_SCOPE`, `PARTIAL`, `SUPPORTING`. Với `OUT_OF_SCOPE` hoặc `NEEDS_REVIEW`, trường này được rỗng nhưng phải có source-backed rationale, quarantine disposition và reviewer sign-off. Không gán AC26 chỉ để vượt completeness check.

### Container và marking evidence

Container record có `usage=CONTEXT_ONLY_NONSCORING`. Marking evidence phân biệt:

```text
evidence_kind=OFFICIAL_EXACT|OFFICIAL_GROUPED|UNRESOLVED|ALGOCORE_GUIDANCE_REQUIRED
claim_precision, marking_item_ids, official_conditions, alternatives_if_explicit,
source_locators, eligible_for_item_scoring, review_status
```

Không suy một MS row bằng một mark, không sáng tạo alternative answer và không tách grouped condition khi nguồn không cho phép.

### Pattern

```text
pattern_id, canonical_name, defining_features, exclusions,
response_product, cognitive_action, command_words_observed,
marking_behaviour_summary, requirement_ids,
official_example_unit_ids, boundary_or_counterexample_ids,
raw_occurrence_count, distinct_paper_count, distinct_equivalence_group_count_or_null,
catalog_phase(PROVISIONAL_PRE_EQUIVALENCE|FINAL_POST_EQUIVALENCE),
status(ESTABLISHED|SINGLETON|NEEDS_REVIEW)
```

Provisional catalog phải để equivalence-group count null. Final catalog được rebuild sau equivalence freeze. `ESTABLISHED` cần ít nhất hai independent equivalence groups. Singleton vẫn được giữ và không làm objective biến mất.

### Variant relation và split

```text
relation_id, left_unit_or_paper_id, right_unit_or_paper_id,
relation(DUPLICATE|PARALLEL_EQUIVALENT|RELATED_NOT_EQUIVALENT|DISTINCT|UNRESOLVED),
construct_match, response_demand_match, stimulus_semantics_match,
marks_match, marking_conditions_match, qp_evidence, ms_evidence, reviewer_status
```

`CANDIDATE_PAIR_UNIVERSE.jsonl` có `pair_id, left_id, right_id, generation_channels, risk_stratum, review_required, review_disposition`. `CANDIDATE_GENERATION_MANIFEST.json` pin scripts/config/input hashes/counts. `REJECTED_PAIR_AUDIT.json` ghi sampling seed, strata, sample IDs, source review và false-negative result. False negative làm candidate universe stale và bắt buộc regenerate/review/retest.

Split record có `component_id, member_ids, assignment(AUTHOR_VISIBLE|PRACTICE|HOLDOUT|QUARANTINE), rationale`. Relation dương, unresolved-possible hoặc likely pair chưa review không được cắt qua split.

### Unresolved disposition

Phải có đúng 128 row:

```text
corpus_record_id, record_type, stage1_reason, stage2_role=CONTEXT_ONLY,
eligible_as_assessment_unit=false, eligible_for_marking_claim=false,
linked_child_unit_ids, new_evidence_ref_or_null, disposition
```

Stage 2 không sửa Stage 1 status. Nếu có nguồn mới, mở correction upstream riêng và independent retest trước khi rebuild.

### Glossary seed

```text
term_id, canonical_en, vi_candidate_or_null, aliases, prohibited_or_ambiguous_terms,
term_kind(TECHNICAL|COMMAND_WORD|UNIT|SYMBOL),
objective_ids, pattern_ids, definition_boundary, source_refs,
en_status, vi_status, reviewer_status
```

Glossary v1 dùng authority freeze và để objective/pattern refs rỗng với `PENDING_RECONCILIATION`. Glossary v2 được rebuild sau objective foundation và final pattern freeze. Vietnamese candidate ở đây chỉ là terminology seed do A6 đề xuất; không phải lesson translation hoặc parity PASS.

## Machine-check DoD

| ID | Check |
|---|---|
| S2-M01 | Tất cả input authority hash/bytes khớp packet freeze. |
| S2-M02 | 99 unique parent objectives, đủ 8 domains/17 sections; child refs resolve. |
| S2-M03 | Mọi required child có planned learning unit và assessment disposition. |
| S2-M04 | 893 atomic units, 379 containers, không overlap/duplicate. |
| S2-M05 | 893 atomic targets có đúng một official marking link; sum 2.250 và 30 paper totals 75. |
| S2-M06 | 927 marking rows được reconcile; 34 parent-context rows không scoring. |
| S2-M07 | 128 unresolved dispositions khớp exact Stage 1 ID set; không promoted claim. |
| S2-M08 | Mọi corpus/objective/pattern/marking/source ref tồn tại; locator không vượt page range. |
| S2-M09 | HARD prerequisite graph acyclic; learning order hợp lệ. |
| S2-M10 | Mọi pattern evidence resolve; provisional/final phase đúng; final counts raw/paper/equivalence tách riêng và rebuild từ frozen equivalence groups. |
| S2-M11 | Candidate universe/manifest tái lập được; mọi candidate reviewed; rejected-complement audit đạt; variant graph không contradiction. |
| S2-M12 | Positive/unresolved/unreviewed-likely pairs không cross split; holdout không có trong author allowlist; blind/controlled status và giới hạn false-negative trung thực. |
| S2-M13 | Glossary IDs unique; terms có source/boundary/status, không overclaim parity. |
| S2-M14 | Không có lesson, full translation, app change, asset hoặc Stage 3 claim. |

## Specialist review DoD

- A3 đối chiếu toàn bộ syllabus §1–8, continuation §8.3 và notes/guidance; audit lại FDE/register/bus, bitmap arithmetic/bit depth, checksum guarantee và check-digit classification.
- A4 đọc prompt/context/MS cho classification; visual/table-dependent item phải xem evidence tương ứng. Mọi positive/unresolved equivalence edge được source-reviewed 100%.
- A6 giữ nghĩa thuật ngữ và command-word boundary; không đặt luật “một câu văn = một mark”.
- A9 kiểm toàn bộ out-of-scope/partial/ambiguous rows, singleton patterns, original-assessment gaps, positive/unresolved variant edges, three pilots và mọi normalized marking-condition claim; phần routine được sampling phân tầng cộng machine checks 100%.

## Gate outcome

Critical: sai scope, target/marks, leakage hoặc claim nguồn. Major: thiếu objective/unit, dangling trace, pattern/equivalence không có evidence, prerequisite cycle, thiếu reviewer độc lập. Minor: metadata/trình bày không đổi ý.

Stage 2 chỉ PASS sau A9 độc lập và A0 audit. Dù PASS hay CHANGES_REQUIRED, Lead phải dừng ở `WAITING_FOR_USER_STAGE_CHECK` và không tự mở Stage 3.
