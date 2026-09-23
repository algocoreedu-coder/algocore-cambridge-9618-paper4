# Schema contracts Stage 5

JSON artifacts use UTF-8, stable IDs, sorted keys where practical, no machine-specific absolute paths, and SHA-256 for code, fixtures and run records. The harness configuration and obligation inventory are frozen at S5-0; implementation-specific behavior must not silently override them. Artifact hashes use canonical UTF-8 bytes with LF newlines and stable JSON key order, excluding the artifact's own `sha256` property. Run and trace hashes cover immutable payloads with their digest fields omitted. Release manifest digest is detached in `RELEASE_VERIFICATION.json`; the manifest never hashes itself.

## Harness lock

The Lead signs one versioned harness lock before P0. Every run record references its `harness_lock_id` and hash.

```text
harness_lock_id, schema_version, runner_name, runner_version
discovery_command, run_command_template, working_directory_policy
clean_state_policy: fresh temp directory per fixture, cleared declared environment variables,
  no residual files or process state, deterministic collection order
environment_allowlist[], environment_clearlist[], random_seed_policy
stdin_encoding, stdout_encoding, stderr_encoding, newline_policy
stdout_normalization: exact|declared_transform; transform_rules[]
per_test_timeout_seconds, termination_policy, kill_grace_seconds
termination_outcomes: EXITED|TIMED_OUT|KILLED|CRASHED|SPAWN_FAILED
elapsed_time_capture, dependency_lock[], python_implementation, python_version, os
snapshot_serializer_id, snapshot_schema_version, frozen_at, approved_by
```

Use exact output comparison unless the official contract allows a documented transform. A timeout or controlled kill is a recorded test outcome, never a pass. A clean rerun starts a fresh process and fixture directory; the runner records the directory inventory before and after execution.

## Implementation record

```text
pattern_id, solution_design_id, variant_ids[], implementation_id
method_step_ids[], marking_point_refs[]
origin=AlgoCore_independent_implementation
source_constraints[]: part_id, QP locator, MS locator, authority
runtime: implementation, Python version, OS, dependencies
entry_point_bindings[]:
  variant_id|null, source_contract_id, entry_point_name, signature,
  adapter_id|null, representation, oracle_id, return/output contract
representation, indexing, sentinel, capacity, mutation and termination
source_file, source_sha256, run_command, status=SUBMITTED|REWORK
```

Each applicable variant/source contract is bound to the exact callable or adapter used by its fixture. A fixture selects one binding; parallel lists of variants and entry points do not establish coverage. Stack `top_pointer` conventions must point to their own adapter/entry point when signatures or indexing differ. Any adapter must preserve the official observable contract and document its representation mapping.

Executable source stays in the batch-owned evidence/source area until Lead gate. Keep educational identifiers and source exact literals when required. Any translated explanation is separate from the Python source.

## Canonical state snapshot

All expected and actual states use the versioned serializer from the harness lock. Comparisons are typed and name the comparison mode:

```text
snapshot: object_type, storage[], capacity, top_pointer, live_range,
  items_in_logical_order[], success_flags[], return_value, output,
  file_state[], additional_declared_fields{}
comparison_mode=logical|physical|both
```

`logical` compares the abstract contents, live range, result/flags, output and specified side effects. `physical` additionally compares backing storage, unused slots and pointer/index representation where the source contract makes those observable or the test is checking representation. `both` requires both comparisons. For a two-stack operation, serialize each stack separately and serialize both success flags/returned results in the same snapshot. Preservation fixtures must compare the required pre-state and post-failure snapshot field-by-field; never rely on a hand-inspection note.

## Fixture and test case

```text
fixture_id, pattern_id, variant_id|null, variant_case_ids[], entry_point_binding_id, test_category
test_category=normal|boundary|counterexample|source_fixture|variant|error_detection|regression
input, initial_state_snapshot, comparison_mode
expected_return, expected_stdout, expected_final_state_snapshot
expected_side_effects[], invariant_checks[], oracle_authority
solution_obligation_ids[], method_step_refs[], marking_point_refs[]
worked_example_spec_id|null, worked_example_microcase_ids[], worked_example_evidence_ids[]
visual_scenario_ids[], visual_case_kind=null|normal|boundary|failure
error_obligation_refs[]: error_id, phase=detection|repair, expected_outcome, assertion_refs[]
expected_evidence[]
source_refs[]: part_id, source_id, source_sha256, pdf_pages, facsimile_refs[{page, image_path, sha256}], criterion/requirement locator
covered_source_occurrence_ids[], source_occurrence_evidence_kind=executable|documentary_facsimile|adjudication
timeout_seconds, test_command, termination_outcome, elapsed_time
actual_return, actual_stdout, actual_final_state_snapshot
exit_code, assertion_results[], run_sha256, status=PASS|FAIL|BLOCKED
```

Every expected value is traceable. If a source criterion is holistic, conditional, dependent or alternative, preserve that form in `oracle_authority` and notes; never turn it into a synthetic mark for an assertion. A fixture cannot use a timeout other than the locked harness value without a Lead-approved harness revision. Each of the 154 error rows expands to two inventory obligations (`<error_id>:detection` and `<error_id>:repair`, 308 total); a fixture can link both phases only when its assertions prove both recognition and correction.

## Executed event trace

One trace record represents one executed fixture. A visual brief may have a bundle of multiple trace records, including every distinct branch/state needed by the brief; do not assume one trace per brief is sufficient.

```text
trace_id, pattern_id, visual_brief_id, fixture_id, harness_lock_id
visual_scenario_id, visual_case_kind=normal|boundary|failure
frozen_source_sha256, instrumented_source_sha256, execution_log_sha256
instrumentation_method, parity_assertion_refs[], parity_result=PASS|FAIL
method_step_refs[], marking_point_refs[]
runtime_record, run_id, overall_result, initial_state_snapshot, final_state_snapshot, output
events[]:
  seq, event_id, visual_event_id, method_step_id, proposed_event_type
  pre_state, guard, action, post_state, invariant_result
  output_delta, learner_explanation.vi/en, source_refs[], test_assertion_refs[]
trace_sha256, captured_by, independently_reproduced_by
status=TRACE_CAPTURED|REWORK|TRACE_VERIFIED
```

Event values must be emitted from the instrumented execution or reconstructed from a deterministic execution log with a documented equivalence check. The frozen and instrumented implementations must pass the same parity fixtures and assertions; save both hashes, log hash, parity assertion IDs and outcome. A manually authored expected storyboard is not a run trace. All 58 Stage 4 visual briefs currently request `event_driven` evidence.

The batch report records `visual_scenarios_covered[]`, mapping each scenario ID to fixture and trace IDs, and `visual_briefs_covered[]`, mapping each brief to all required scenario/event IDs and one or more trace IDs. The inventory contains 58 briefs, 174 normal/boundary/failure scenario IDs and 331 proposed event-entry IDs. The final aggregate reports exact coverage for all three sets and the actual trace-run count; trace count is not fixed at 58.

## Reviewed disposition

Every approved no-code or non-executable obligation is recorded, never silently omitted:

```text
disposition_id, obligation_id, obligation_type, scope_ids[]
reason, applicability_decision, authority, authority_locator
affected_pattern_ids[], variant_ids[], variant_case_ids[], error_ids[], error_phases[]
solution_obligation_ids[], worked_example_microcase_ids[], worked_example_evidence_ids[]
marking_atom_refs[], source_issue_ids[], source_occurrence_ids[], visual_brief_ids[]
source_occurrence_evidence_kind=executable|documentary_facsimile|adjudication|null
reviewer, lead_reviewer, lead_decision, status=PROPOSED|APPROVED|REJECTED
evidence_refs[], evidence_hashes[], recheck_command_or_review_step, recheck_result, decided_at
```

`obligation_type` identifies the source register (solution obligation, variant case, worked-example microcase/evidence item, error phase, marking atom, source issue/occurrence, visual scenario/event, pattern deliverable, or support concept). A disposition must name all affected IDs and supporting evidence. A source occurrence may be classified as executable test coverage, documentary/facsimile evidence, or an adjudication reference; this classification is explicit and cannot waive an applicable code test. Only `APPROVED` with Lead decision and a passing recheck counts toward aggregate coverage.

## Frozen inventory and ownership registers

S5-0 creates immutable `OBLIGATION_INVENTORY.json`, `SOURCE_OCCURRENCE_OWNERSHIP.json` and an empty `COVERAGE_MATRIX.json` from the locked Stage 4 hashes. Each inventory row contains `obligation_id`, `obligation_type`, source path + JSON pointer, source hash, primary batch/owner, `secondary_consumers[]`, authority class and expected evidence kind. Generated IDs are deterministic from the source stable ID plus category/case ID; array-order obligations additionally retain their source JSON pointer and ordinal. A8 checks unique IDs, exact counts, no missing/unexpected references and frozen hashes before P0.

Required inventory denominators are: 58 patterns; 719 solution obligations (74 normal, 143 boundary, 108 counterexample, 394 source-fixture links, representing 368 unique source parts); 60 variants / 167 variant cases; 58 worked-example specs / 210 microcases / 261 evidence-capture items; 154 error rows / 308 detection-and-repair phase obligations; 2236 marking atoms; 25 source issue IDs / 62 occurrence IDs; 58 visual briefs / 174 scenario IDs / 331 proposed event-entry IDs. These are independent denominator sets; many-to-many fixture/test coverage is allowed, but the union must equal each frozen ID set exactly with zero missing IDs and no unapproved extras.

For each source occurrence, the ownership registry assigns exactly one primary owner and zero or more secondary consumers. Primary batch selection uses the earliest matching batch in canonical `BATCH_PLAN.json` order from `pattern_ids`; if absent, use `context_pattern_ids`. If neither yields a Stage 5 pattern, A3 owns it in `SOURCE_REGISTER` for documentary/facsimile or adjudication evidence. Cross-batch occurrences retain one primary owner while all other applicable batches are listed as secondary consumers. Every occurrence is classified executable, documentary/facsimile, or adjudication with an explicit authority locator and disposition/recheck if it has no runnable pattern. Issue-level completion is the union of all occurrence rows.

## Canonical Stage 5 outputs and close order

Canonical registries are Stage 5-owned: `IMPLEMENTATION_REGISTRY.json`, `FIXTURE_REGISTRY.json`, `RUN_REGISTRY.json`, `TRACE_REGISTRY.json`, `DISPOSITION_REGISTER.json`, `COVERAGE_MATRIX.json`, `GATE_RECORDS/`, `A8_CANDIDATE_QA.json`, `A8_FINAL_QA.json`, `LEAD_PASS1.json`, `LEAD_PASS2.json`, `GATE_REVIEW.json`, `RELEASE_MANIFEST.json`, and detached `RELEASE_VERIFICATION.json`. Stage 0–4 remains immutable; Stage 5 stores verification records keyed to upstream IDs/hashes and never edits upstream status rows.

Canonical aggregate record contracts:

```text
OBLIGATION_INVENTORY: inventory_id, source_release, input_hashes[], denominators{}, obligations[], inventory_sha256
SOURCE_OCCURRENCE_OWNERSHIP: occurrence_id, issue_id, primary_owner, primary_batch,
  secondary_consumers[], evidence_kind, authority_locators[], disposition_id|null
COVERAGE_MATRIX: inventory_id/hash, artifact_hashes[], coverage_sets[]:
  obligation_type, expected_ids[], evidence_refs_by_id{}, approved_disposition_refs_by_id[],
  missing_ids[], unexpected_ids[], duplicate_primary_owners[], count_expected, count_covered, status
GATE_RECORD: gate_id, input_hashes[], check_results[], findings[], artifacts_sha256[],
  reviewed_by, lead_decision, status=PASS|REWORK|BLOCKED, signed_at
A8_CANDIDATE_QA: candidate_hashes[], inventory_hash, coverage_matrix_hash, audit_tool/version,
  full_identity_audit, reproducibility_audit, risk_sample_refs[], findings[], recommendation, signed_at
LEAD_PASS1: candidate_hashes[], batch_gate_refs[], semantic_decisions[], promotions[], findings[], signed_at
A8_FINAL_QA: post_promotion_hashes[], candidate_qa_hash, hash_status_recheck, findings[], recommendation, signed_at
LEAD_PASS2: post_promotion_hashes[], a8_final_qa_hash, status_recheck, findings[], signed_at
GATE_REVIEW: input_release/hash, final_hashes[], coverage_matrix_hash, a8_candidate/final_refs,
  lead_pass1/pass2_refs, findings[], decision=PASS|REWORK, signed_at
RELEASE_MANIFEST: release_id, input_release, files[{path,sha256}], counts{}, gate_review_sha256,
  a8_final_qa_sha256, lead_pass2_sha256, status=LOCKED
RELEASE_VERIFICATION: release_manifest_path, release_manifest_sha256, verifier_path/hash,
  verifier_command, exit_code, result, verified_at
```

Coverage sets are ID-based, not percentages. `expected_ids` comes only from the frozen inventory; evidence/disposition references must resolve to hashed canonical artifacts. Missing, duplicate-owner or unexpected IDs make the matrix fail. The release manifest omits itself and the detached verifier sidecar, so its digest has no recursive self-hash.

Close in this order: freeze candidate artifacts/registries and compute their hashes; A8 writes `A8_CANDIDATE_QA.json` against those hashes; Lead pass 1 promotes only Stage 5-owned pattern/example verification records; recompute affected hashes; A8 writes `A8_FINAL_QA.json` with the post-promotion hash/status recheck and candidate-QA reference; Lead signs `LEAD_PASS2.json` and then `GATE_REVIEW.json`; generate `RELEASE_MANIFEST.json` last with all release files except itself and the detached verifier sidecar; compute its detached SHA-256; run the release verifier; record manifest hash and verifier result in `RELEASE_VERIFICATION.json`. Any content change after the relevant hash or QA step invalidates downstream signatures and repeats the affected close steps.

Status belongs to Stage 5 records: `PLANNING_READY -> IN_PROGRESS -> SUBMITTED -> PASS_RECOMMENDED -> EXECUTION_VERIFIED`, with `REWORK` on required findings and `BLOCKED` only for unresolved authority/input dependency. `EXECUTION_VERIFIED` is written only to Stage 5 pattern/example registry rows with upstream IDs and hashes; it does not promote or mutate Stage 4. Downstream lesson/storyboard/interaction statuses remain pending.

## Batch verification report

```text
batch_id, input_release, input_hashes[], harness_lock_id, runtime_record
pattern_results[]: pattern_id, implementation_ref/hash, variant_entry_point_bindings[]
fixture_ids[], test_counts_by_category, solution_obligation_ids_covered[], variant_case_ids_covered[]
worked_example_microcase_ids_covered[], worked_example_evidence_ids_covered[]
marking_atom_refs_covered[], error_obligation_ids_covered[], source_occurrence_records[]
trace_ids[], visual_scenarios_covered[], visual_event_ids_covered[], visual_briefs_covered[], disposition_ids[]
author, independent_reviewer, unresolved_findings[]
validator_results[], artifact_hashes{}, status=SUBMITTED|REWORK|PASS_RECOMMENDED
```

## Final canonical status

Only Lead promotes Stage 5-owned verification records to `EXECUTION_VERIFIED`, with upstream ID/hash, run evidence hash and independent reviewer reference. Stage 4 `PENDING_STAGE5_EXECUTION_VERIFICATION` rows remain untouched. A failed or blocked record remains `REWORK` or `BLOCKED`; it is never omitted from totals. Stage 6 lesson authoring and Stage 7/8 visual production states remain explicitly pending.
