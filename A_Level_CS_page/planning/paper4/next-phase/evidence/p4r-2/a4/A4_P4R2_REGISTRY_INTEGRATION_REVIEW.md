# A4 P4R-2 canonical registry integration review

## Decision

**PASS** for the six-lesson P4R-2 pilot registry. The generated registry uses the revised v2 schema without a per-lesson exception and remains separate from the Next.js runtime.

## Canonical output

The deterministic compiler `scripts/build-p4r2-pilot-registry.mjs` writes seven typed record sets under `content/paper4/records/pilot/` and a detached `SHA256SUMS.txt`. The read-only checker is `scripts/check-p4r2-pilot-registry.mjs`.

Exact integrated set:

- 26 `KnowledgeUnit`
- 6 `PythonArtifact`
- 48 `VisualScenarioTrace`
- 238 `VisualEventBinding`
- 16 `MarkingChain`
- 18 `AssessmentItem`
- 6 `LessonReleaseRecord`
- 358 total records

Registry aggregate SHA-256: `de2541505668302592d4aa8de75482eaefd3d068545a1c7b837d34c2c01b7e95`.

All six candidate release records retain `lead_gate: PENDING`. Academic, execution and UX reviews are recorded as `PASS`; only A8 and Lead may move the final gate to `PASS`.

## Join and authority checks

The checker resolves each release record to its exact lesson/package/slug, ten canonical section IDs, knowledge units, Python artifact, patterns, method steps, marking chains, error references and assessment items. It also verifies:

- Python source bytes and `code_sha256` against the displayed stable-line registry;
- author-run and independent-rerun IDs, evidence files, evidence-file hashes, code hashes and execution-log hashes;
- normal/boundary/failure fixture JSON and auxiliary fixture files;
- trace → artifact version → fixture → expected output → execution evidence;
- event order and every active line ID against the exact artifact version;
- KnowledgeUnit objective/coursebook references against the promoted lesson source map;
- safe public source metadata with no local filesystem path;
- bilingual event criterion/accessibility metadata and bilingual assessment expected artifacts.

`retrieval_refs` is empty in this pilot because the approved A7 pilot contains the required guided/faded/independent 18-item set and no canonical `retrieval` item. The field is retained as an exact empty set; no unresolved placeholder is inserted.

## Determinism and negative checks

Two consecutive compiler runs were byte-identical across all eight generated files. The checker changed no generated file. Five independent mutations were rejected with the intended error:

- unknown active line → `LINE_BINDING_INVALID`
- stale expected output → `TRACE_OUTPUT_UNRESOLVED`
- cross-lesson knowledge reference → `RELEASE_KNOWLEDGE_JOIN_INVALID`
- unknown execution evidence → `EXECUTION_EVIDENCE_UNRESOLVED`
- removed source locator → `SOURCE_LOCATOR_UNRESOLVED`

The canonical schema checker validated all 358 records and rejected all 11 schema-negative fixtures. Both integration and schema checks passed under Node `v24.19.0`.

## Evidence

- `BUILD_RESULT.json` records exact type counts and per-file/generated aggregate hashes.
- `CHECK_RESULT.json` records the read-only PASS and mutation-test results.
- `content/paper4/records/pilot/SHA256SUMS.txt` is the detached generated-record hash list.

No Next.js runtime, route, renderer or UI file was modified in this work order.
