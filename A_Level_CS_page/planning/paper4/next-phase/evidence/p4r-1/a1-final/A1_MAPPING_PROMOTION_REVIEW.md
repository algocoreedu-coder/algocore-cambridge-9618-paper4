# P4R-1 canonical mapping promotion review

**Decision:** `PASS_WITH_REQUIRED_CARRYOVERS`  
**Promotion status:** `APPROVED_FOR_P4R2_INPUT_WITH_CARRYOVER`  
**Authority boundary:** mapping input only; this review does not claim that lesson content, Python execution, visuals or assessments are release-ready.

## Promoted exact sets

| Mapping | Canonical count | Result |
|---|---:|---|
| Knowledge dispositions | 108 | All retain their stable IDs; all 108 have Lead final disposition `publish` |
| Lesson source maps | 26 | All knowledge, syllabus, coursebook and assessment requirement joins retained |
| Python execution maps | 26 | All 26 remain `RERUN_REQUIRED`; zero execution claims were promoted |
| Visual migration inventory | 58 patterns / 174 scenarios / 331 events | Identities retained with migration defects still open |
| Marking disposition | 2,236 atoms / 58 chains | Exact atom partition retained with direct QP/MS locators |
| Assessment map | 107 requirements / 37 destinations / 78 items | Exact identities retained; all official assessment marks remain `null` |
| A0-normalized practice IDs | 15 | IDs and `A0_LEAD_ID_NORMALIZATION` authority retained |

The canonical package is at `algocore-fumadocs/content/paper4/mappings/`. `manifest.json` records each output hash, each source-draft hash, exact counts and identity-set hashes.

## Determinism and independent checking

- `npm run generate:paper4-p4r1-mappings` was run twice. All seven generated files were byte-identical.
- `npm run check:paper4-p4r1-mappings` was run twice. Both runs returned `PASS_WITH_REQUIRED_CARRYOVERS`, stdout was identical and the mapping tree was unchanged.
- The checker reads only canonical files under `content/paper4/mappings`; it has no runtime dependency on the planning sibling.
- Canonical tree SHA-256: `af969535468f5cc06c127e4bf9f74adae384957aefad91e1fb4170647d3522d9`.
- `npm run check:paper4-v2-schema` also passed with all 11 negative fixtures rejected as expected.

## Carryovers that remain open

This promotion does not convert gaps into passes. P4R-2 and P4R-3 must close these recorded findings:

- 26/26 displayed Python artifacts still require exact-source author runs and independent reruns.
- 328 visual event labels remain unmapped, three mapped labels have type mismatches, all 331 events lack a verified Python artifact/version line join, and all 58 patterns reuse cloned scenario traces.
- 293 marking atoms retain source issue references; 68 atom-level source mark values remain intentionally `null`.
- 36 assessment requirements lack a Stage 4 pattern link; six lessons are patternless; 18 practice items lack a valid pattern link.
- 15 legacy items lack explicit bilingual prompts, 42 regular items use broad rubrics, and 33 items lack an explicit pass rule.

There are no blockers to using these mappings as P4R-2 input. The carryovers above remain release blockers until their own evidence gates pass.
