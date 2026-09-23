# A8 independent clean-room QA — P4R-2

## Recommendation

**PASS_TO_LEAD_GATE** for commit `314af8acf1b508779a14dd5dd2627f4fcb8c24df`.

A8 found **0 required findings**. This is an independent recommendation, not a Lead signature. All six `LessonReleaseRecord.lead_gate` values remain `PENDING` exactly as required.

## Scope verified

The exact six-lesson pilot is present: `data-models`, `binary-search`, `queue`, `recursion`, `hashing`, and `object-files`.

| Record type | Exact count | Result |
|---|---:|---|
| KnowledgeUnit | 26 | PASS |
| PythonArtifact | 6 | PASS |
| VisualScenarioTrace | 48 | PASS |
| VisualEventBinding | 238 | PASS |
| MarkingChain | 16 | PASS |
| AssessmentItem | 18 | PASS |
| LessonReleaseRecord | 6 | PASS |
| **Total** | **358** | **PASS** |

The registry aggregate independently recomputes to `de2541505668302592d4aa8de75482eaefd3d068545a1c7b837d34c2c01b7e95` and matches `SHA256SUMS.txt`.

## Independent checks

- Canonical schema and registry validation: 0 errors.
- Canonical authored records and generated registry: exact identity for all six content record types.
- Python source reconstruction and `code_sha256`: 6/6 PASS.
- Fresh Python subprocess executions: 18/18 normal, boundary and failure cases exactly match the canonical output plus both A3 author and independent evidence.
- Knowledge source locators: direct syllabus and coursebook locators resolve for 26/26 units; release source records are complete and contain no local path.
- Trace joins: 48/48 resolve artifact version, fixture, expected output and execution evidence.
- Event joins: 238/238 resolve ordered trace membership and active Python line IDs.
- Bilingual review: 2,598 required VI/EN pairs independently checked.
- Accessibility metadata: 238/238 events contain bilingual labels, actions, keyboard guidance and live status plus typed role and focus metadata.
- Assessment disclosure: 18/18 require hidden initial answer/hint and feedback only after attempt.
- Authority boundary: 406/406 Cambridge atoms retain authority, QP/MS locator and no-inferred-mark caveat; 18/18 practice rubrics remain `AlgoCore_authored_rubric` with `official_marks: null`.
- Negative validation: all five mutations were rejected with the required codes: unknown line, stale output, cross-lesson knowledge, unknown execution evidence and removed source locator.

## Runtime and determinism

The independent harness and official read-only checkers pass on Node `v20.11.0` and bundled Node `v24.19.0`.

The theory, visual, assessment and registry generators were run twice on each runtime. A snapshot of 66 canonical/prior-evidence files remained byte-identical before and after every run:

`0a2f8aaf5f7a73243ee49dbd6e83a2730c3f93317e2dfc01ddc9b654aa4531a7`

No canonical file or A2–A7 evidence file was left changed.

## Evidence

- `A8_CLEAN_ROOM_NODE20.json`
- `A8_CLEAN_ROOM_NODE24.json`
- `A8_DETERMINISM_NODE20.json`
- `A8_DETERMINISM_NODE24.json`
- `OFFICIAL_CHECKS_NODE20.log`
- `OFFICIAL_CHECKS_NODE24.log`
- `clean-room-check.mjs`
- `determinism-check.mjs`

This recommendation closes A8's P4R-2 content/registry review. Browser interaction, responsive, zoom, theme, reduced-motion and screen-reader runtime testing remain under P4R-6.
