# P1-S2-A3-TRACE-v1 — Coverage and learning-map integration

Issued 23/09/2026 by A0. Owner: a fresh A3 traceability integrator. Reviewers: an independent A4 specialist and a fresh A9, followed by A0 gate authority.

## Inputs/version

- Exact input manifest: `A_Level_CS_page/planning/paper1/stage-2/work-orders/c4/P1-S2-A3-TRACE-v1_INPUT_MANIFEST.json`.
- Manifest SHA256: `376fa819312d555245cdfab900bcab4e2e8398f32c45d6fe4a9c4ada0ac0414c`; files: 121.
- Accepted sources: foundation-v1, five accepted batch maps, aggregate-v2 question bank, equivalence-v2, pattern-final-v1, glossary-v2-r2 and accepted split-v1, at exact hashes.
- Rehash every input first. Any drift is a blocker; do not substitute or reopen an accepted artifact.

## Write allowlist

Write only `A_Level_CS_page/planning/paper1/stage-2/evidence/a3/trace-v1/`. Do not edit accepted inputs, trackers, lessons, translations, the app or Stage 3. Do not spawn another agent.

## Required outputs

Freeze exactly ten files:

1. `COVERAGE_MATRIX.jsonl`
2. `OBJECTIVE_ASSESSMENT_MATRIX.jsonl`
3. `LEARNING_MAP.json`
4. `GAP_REGISTER.json`
5. `ORIGINAL_ASSESSMENT_BRIEFS.jsonl`
6. `SOURCE_FLAGS_REGISTER.md`
7. `QA.json`
8. `INPUT_MANIFEST.json` — byte-identical issued copy
9. `OUTPUT_MANIFEST.json` — pins outputs 1–8, excludes itself/handoff
10. `HANDOFF.json` — pins output manifest and outputs 1–8

## Contract and acceptance

- Produce exactly one coverage row for each of the 205 accepted `REQUIRED` atomic requirements and exactly one objective summary for each of 99 parent objectives. Never double-count parent and child as separate requirements.
- Preserve the 99 accepted planned learning units. Every required atomic row must have at least one resolved planned teaching destination and an assessment disposition. Enrich references; do not rewrite syllabus requirements or source locators.
- Join all 893 assessment units from the accepted question bank to their accepted primary/supporting requirements, final pattern, equivalence component and split. All forward/reverse refs must resolve; no unit, requirement, objective, pattern, term, learning unit or split ID may dangle.
- Distinguish official evidence in `AUTHOR_POOL` from `CONTROLLED_CHECK`. Controlled-check units may demonstrate historical official coverage but must not enter any future author-facing allowlist/example pool. If a requirement has no author-available assessment destination, create a reviewed AlgoCore original brief rather than exposing controlled-check content.
- `ORIGINAL_ASSESSMENT_BRIEFS.jsonl` must contain exactly the briefs required by coverage dispositions. Each brief must be explicitly `ALGCORE_ORIGINAL`, cite objective/requirement authority, define construct/response product/rubric authority and contain no full question, answer or solution.
- `GAP_REGISTER.json` must expose every required requirement with no official evidence, only controlled-check evidence, no verified book support, `NEEDS_REVIEW` pattern dependency, or other source/coverage limitation. Do not convert absence into inferred coverage.
- Build `LEARNING_MAP.json` as a valid topological order for every accepted `HARD` prerequisite edge. Preserve the distinction between Cambridge authority and AlgoCore pedagogy. Include objective, requirement, pattern, glossary and source packet references without lesson prose.
- Coursebook locators remain only as strong as the accepted foundation audit. Keep `NO_VERIFIED_BOOK_SUPPORT` and all source flags; do not present TOC inference or derived files as authority.
- Glossary integration references accepted English/VI candidate records and explicit statuses only; do not claim complete bilingual lesson parity.
- QA must rehash inputs; validate exact output contract; reproduce 99/205/99/893/504/824/96 and 701/192; check forward/reverse references; check hard-prerequisite acyclicity/topological order; reconcile gaps/briefs; preserve 128 unresolved context-only Stage 1 records and create no marking claim from them; confirm scope boundary.
- Stage 2 proves planned coverage only. Do not write lesson prose, full questions/solutions, translations, app changes or Stage 3 artifacts.

## Review and stop

After exact ten-file freeze, stop and hand off. Do not accept TRACE, update trackers, integrate top-level Stage 2 or dispatch downstream work. A4 and A9 review independently; A0 decides C4b.
