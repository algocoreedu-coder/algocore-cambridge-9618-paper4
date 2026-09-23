# Schema v2 draft notes

## Status and authority

This is an A1/A4 preparation draft under `evidence/p4r-1/a1-a4`. It is non-canonical because P4R-0 was not signed at creation time. Promotion requires P4R-0 PASS, A1 source review, A4 validator/negative tests, Lead approval and A8 concurrence for the pilot.

## Design decisions

- IDs and joins are explicit. Python source is an ordered array of stable line IDs; visual events may only bind those IDs in the referenced artifact version.
- Bilingual prose is paired in `{vi,en}`; executable source, fixtures, raw outputs, traces and state are shared across locales.
- Cambridge syllabus, coursebook, QP/MS and AlgoCore-authored statements remain separate authorities. A locator supports only the claim recorded with it.
- Generator and checker roles are separated. Generated registries are release outputs, never authoring inputs.
- Marking evidence allows either direct QP/MS locators or an explicitly labelled AlgoCore-authored rubric; it must not manufacture Cambridge marks.
- Scenario traces require normal/boundary/failure disposition. Equivalent event sets need a reviewed justification.

## Validation still required before canonical use

1. Split the suite into per-artifact schemas or add a typed envelope so arrays can validate without trying the root `oneOf` manually.
2. Add cross-document validation for stable IDs, versions, line bindings, code hashes, fixtures and execution logs. JSON Schema alone cannot enforce every join.
3. Add negative fixtures for duplicate line order, missing locale, unresolved source locator, stale artifact version, hidden-answer contract violation and forged Cambridge authority.
4. Confirm payload partition and public source-safety fields with A4/A5 before compiler implementation.
5. Freeze canonical enumerations for status, authority, event types and section IDs only after P4R-0.

## Upstream locator handling

`LESSON_SOURCE_MAP_DRAFT.json` copies the reviewed Stage 3 syllabus locator fields and coursebook page arrays without modification. No page was inferred. Missing upstream records would be emitted as `UNRESOLVED`; see `SELF_CHECK.json` for the current result.
