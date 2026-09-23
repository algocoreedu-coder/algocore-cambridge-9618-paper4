# A4 canonical Paper 4 registry review

**Decision:** PASS for A4 canonical integration. The release remains blocked pending A8 and Lead sign-off.

## Exact canonical set

The deterministic compiler produced one full registry covering 13 packages and 26 lessons:

- 108 `KnowledgeUnit`
- 26 `PythonArtifact`
- 174 `VisualScenarioTrace`
- 589 `VisualEventBinding`
- 58 `MarkingChain`
- 78 `AssessmentItem`
- 26 `LessonReleaseRecord`

Total: 1,059 records. Registry aggregate SHA-256: `e9fe687c79e23d3a6d0ec844c5e8ca83fca473fbc800623836be61b5a439f827`.

All 26 releases retain `lead_gate: PENDING` and `release_allowed: false`. The UX review is also `PENDING` until learner-visible browser QA is complete.

## Joins and authority boundary

The read-only checker resolved 26 source hashes, 78 fixtures, 78 expected outputs, 52 execution evidence references, 174 trace/artifact/fixture/output/evidence joins and 2,691 event-to-line bindings. It also resolved 206 syllabus objective references, 200 coursebook references and 263 safe release source references.

The six approved lessons without direct Stage 4 pattern ownership remain representational only: `testing`, `dictionary`, `performance`, `graphs`, `random-files` and `exceptions`. Their 18 assessment items retain `AlgoCore_authored_rubric`, `official_marks: null` and `AlgoCore_representational_workflow_only`. They own no Cambridge marking chain and no official visual trace.

## Determinism and negative proof

Two in-memory rebuilds were byte-identical under Node 20.11.0 and Node 24.19.0, and both runtimes matched the checked-in SHA-256 manifest. Seven mutations were rejected at the intended boundary: unknown active line, stale expected output, cross-lesson knowledge, unknown execution evidence, missing source locator, premature release and a forged official-marks claim on a representational-only assessment.

The schema checker validates the pilot and full registries as separate canonical sets, preventing duplicate IDs across the retained pilot evidence and the full replacement registry.

## Evidence

- `BUILD_RESULT.json`
- `CHECK_NODE20.json`
- `CHECK_NODE24.json`
- `SCHEMA_CHECK_NODE20.json`
- `SCHEMA_CHECK_NODE24.json`
- `DETERMINISM_AND_MUTATION_PROOF.json`

Required findings: **0**.
