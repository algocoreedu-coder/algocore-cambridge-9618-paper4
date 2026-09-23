# P4R-2 A2 bilingual theory pilot review

## Decision

**A2 self-check: PASS, pending Lead/A8 review.** This is not a gate signature.

The pilot now contains exactly 26 KnowledgeUnit envelopes for the six locked lessons:

| Lesson | Units |
|---|---:|
| data-models | 6 |
| binary-search | 3 |
| queue | 5 |
| recursion | 5 |
| hashing | 4 |
| object-files | 3 |
| **Total** | **26** |

Every unit preserves one Stage 3 stable block identity, the approved `publish` disposition, and the direct syllabus and coursebook locators promoted in P4R-1. Every required teaching field is independently authored in Vietnamese and English: title, explanation, Python connection, representation, invariant/rule, misconceptions, exam signals, micro-example, and hidden-answer self-check.

## Python evidence closure after A3 round 2

All 26 units cite at least two resolved stable Python line IDs. A2 was reworked against A3's `LINE_ID_MIGRATION.json`; no retired line ID remains. The three earlier knowledge-to-code gaps are closed:

- `binary-search/recursive-variant` now connects directly to `binary-search.v1.L048`–`L061` for recursive call, base/not-found, midpoint, left/right progress and return propagation. `L064`–`L067` execute and compare iterative and recursive results.
- `object-files/construct-from-record` and `subclass-records` now connect to the `BOOK`/`EBOOK` discriminator, base/subclass constructors, output override and invalid-type path at `object-files.v1.L063`–`L083`.
- `object-files/lookup-update` now connects to the validated setter and lookup paths at `object-files.v1.L056`–`L060` and `L086`–`L095`, explicitly teaching `UPDATED`, `INVALID_UPDATE` and `NOT_FOUND` state effects.

A6/A7 still need to join method steps and marking chains. The authored theory contains no Cambridge mark allocation or mark-scheme claim.

## Verification

- `node scripts/check-p4r2-theory-pilot.mjs`: PASS, 0 errors.
- Imported `validateEnvelope` and `validateRegistry`: 26/26 envelopes valid.
- Exact identities and lesson split: PASS.
- Direct syllabus locators: 26/26.
- Direct coursebook locators: 26/26.
- Concrete Python line links: 26/26.
- A3 stable-line migration checked: 6/6 lessons; no active reference uses a retired ID.
- Bilingual semantic minimums, placeholder scan, hidden-answer contract, and unsupported mark-claim scan: PASS.
- Rebuilding all 26 files produced the same aggregate SHA-256 before and after: `abaaa1f3ee53c19b898584d4c6a00afe4d816f00a9a23a2ff6ba581b12b5c1f2`.

## Files

- Canonical pilot theory: `content/paper4/lessons/pilot/<lesson>/*.knowledge-unit.json`
- Deterministic authoring build: `scripts/build-p4r2-theory-pilot.mjs`
- Read-only validation: `scripts/check-p4r2-theory-pilot.mjs`
