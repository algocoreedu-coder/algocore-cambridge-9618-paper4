# A8 independent clean-room QA — P4R-3/P4R-4/A4

**Recommendation:** `PASS`

**Candidate:** `0b2e8c91aacea70406a616e6a1fa7e7ab7016a01`

**Authority:** A8 independent QA only. This review does not sign the final release, update a gate, or change program status.

## Exact-set result

The candidate contains exactly 13 packages, 26 lessons, 108 KnowledgeUnits, 26 PythonArtifacts, 58 patterns, 174 VisualScenarioTraces, 589 VisualEventBindings, 58 MarkingChains, 2,236 unique marking atoms, 78 AssessmentItems, and 26 LessonReleaseRecords. Every release record carries the ten canonical sections in canonical order.

The 2,236 marking atoms retain an explicit disposition: 1,916 are `RETAIN_DIRECT_OFFICIAL_ATOM` and 320 are `RETAIN_WITH_SOURCE_CAVEAT`. No atom is missing a disposition and no atom ID is duplicated.

## Schema, joins, sources, and hashes

The full-registry checker passed under Node `20.11.0` and Node `24.19.0` with zero errors. It resolved all 26 source hashes, 78 fixtures, 78 expected outputs, 52 execution-evidence references, 174 trace-to-artifact/fixture/output/evidence joins, 2,691 event line references, 206 syllabus-objective references, 200 coursebook references, and 263 release source locators.

A separate clean-room manifest hashed 266 compiler inputs. Its aggregate is `71a9a5782bd9af3e16cc72c5228f190f613b27cfb6032d73693dbfc80397407b`. The deterministic registry aggregate is `e9fe687c79e23d3a6d0ec844c5e8ca83fca473fbc800623836be61b5a439f827`.

Two independent in-memory rebuilds were byte-identical, the stored registry matched the rebuilt bytes, and the SHA-256 manifest matched. The checker did not invoke a write-generating build.

## Python execution and content QA

Frozen author/independent evidence matched for all 78 fixtures. A separate A8 harness then launched two fresh Python processes per fixture: 156 executions across 26 normal, 26 boundary, and 26 failure cases. Every live result exactly matched its frozen expected output, every trace was non-empty, and all 26 failure cases retained explicit rejection or preserved-state evidence.

Production theory and Python checks passed on both Node runtimes. The A6 content checker also passed on both runtimes: 6,141 bilingual pairs, 105 terminology occurrences, 82 knowledge-to-line bindings, 351 visual accessibility contracts, and 351 focus sequences passed with zero hard finding groups and zero local-path leaks.

## Gap authority boundary

The six Lead-approved gap lessons retain only AlgoCore representational workflow authority. Their 18 assessments have `official_marks: null`; they own no Cambridge MarkingChain and no official VisualScenarioTrace. The boundary passed without exception.

## Negative tests

All seven mutations were rejected with the intended validator codes:

1. unknown active line;
2. stale expected output;
3. cross-lesson knowledge reference;
4. unknown execution evidence;
5. missing source locator;
6. premature release;
7. official marks injected into a gap assessment.

## Read-only proof

The app repository was clean at `0b2e8c9` immediately before A8 and remained clean at the same commit after every check. Both index and worktree diffs were empty before and after.

Before this clean-room baseline was captured, the shared tree briefly contained staged pilot-registry changes and unstaged schema/checker changes. Lead restored those files to `0b2e8c9` before A8 ran. Attribution is `UNDETERMINED`: Git does not record which process edited or staged a file, no command provenance tied the changes to an agent, A8 had not run any generator or mutation, and the UI-preflight agent reported no edits to those files. The incident therefore did not affect this candidate or its QA evidence.

## Release boundary

All 26 Lead gates remain `PENDING`, and zero records have `release_allowed: true`. A8 recommends the candidate for Lead gate closure while leaving the final release decision to the Lead.
