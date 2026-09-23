# Fresh independent A3 retest — glossary-v2-r2

- Work order: `P1-S2-A3-RETEST-GLOSSARY-v2-r2`
- Reviewer: fresh independent A3 source/term/objective reviewer
- Review date: 2026-09-23
- Recommendation: **PASS**

## Decision basis

The issued 330-file manifest was independently rehashed with zero missing files, byte drift or SHA256 drift. The work-order hash is `2cc478ea4df626a78e7fe5fb3b7e93d7791602c79bc0a74f6c05ea59fd510bce`, the issued and exact-copy input-manifest hash is `7e8c494ae3d36e3cee1efc5492209b0934fa60ba828ed7face0be5224ec2f9f6`, and the frozen author handoff hash is `ecd68234324b52e079e59d7daf030377a981d390296fc2c855b6675dca2b5543`. The author directory contains exactly the required eight files; its output-manifest entries close by byte length and SHA256.

The full 96-row packet was reviewed, including all source, terminology, objective, command-authority and text-integrity checks:

- `GLOSSARY_SEED_V2.jsonl`, `COMMAND_WORD_REGISTER.jsonl` and `CONFLICTS_AND_BOUNDARIES.md` are byte-identical to glossary-v2-r1. The 96 term IDs match glossary-v2 exactly, and every non-reconciliation field is unchanged.
- All 96 source references resolve to the pinned 2026 syllabus SHA256 `bf1b77a2b765d10eb4b005ecae0412add35cf6113ba3218a517893abfc9f2470`, with a non-empty locator and claim boundary. Syllabus pages 14–16, 22, 24–27 and 41–42 were visually inspected.
- All 69 objective links and 80 objective-evidence records resolve to the accepted atomic requirements with exact parent objective, controlled requirement text, authority locator and foundation hash.
- All 874 pattern links resolve to accepted final patterns. Every pattern evidence target matches its row's `pattern_ids`, every cited requirement belongs to that pattern, and there are no dangling, duplicate, missing or extra structural links. This A3 structural check does not replace A4's independent pattern-semantic retest.
- All 29 `RECONCILED_NO_LINK` rows have no objective link, pattern link or reconciliation evidence, and retain an explicit no-link disposition.
- All 27 command-register rows are unique and byte-identical to accepted glossary-v1-r1 (`2d0693bd9a370b080c2ea35a17468f7d9ccedb998900dedc529da70276474b56`). Their English meanings and locators agree with the command-word table on syllabus pages 41–42, and no fixed response-length or mark-value rule is asserted.
- `TERM-VAL-CHECK-DIGIT` retains only objective `AC26-6.2-02`, no pattern link, and exactly focus-bearing evidence `REQ-6.2-02-07`. The six qualifier-only evidence records and nine rejected pattern links remain absent. `TERM-CW-JUSTIFY` retains exactly four accepted pattern links: `PAT-C3A2-0028`, `PAT-C3A2-0075`, `PAT-C3A2-0142`, and `PAT-C3A2-0192`.
- The validation/verification, check digit/checksum, bit/byte and `b`/`B`, accuracy/precision, database-label, normalisation/indexing, and DDL/DML boundaries remain explicit and source-bounded. The Paper 1 DML limit remains at most two tables.
- All eight author outputs decode as UTF-8 and contain zero prohibited ASCII controls, DEL bytes or U+FFFD replacement characters. No bilingual-parity, approved-translation, lesson, assessment, split, holdout, app, Stage 3, fixed-mark or fixed-response-length claim was introduced.

## Independent delta recomputation

Every `before` and `after` value was compared for all seven reconciliation fields: `objective_ids`, `pattern_ids`, `reconciliation_status`, `reconciliation_methods`, `reconciliation_evidence`, `reconciliation_disposition`, and `reconciliation_sources`. The 96 delta rows reproduce the actual glossary-v2 and glossary-v2-r2 values with zero mismatch.

The independently recomputed result is exactly:

- 28 rows with at least one reconciliation-field change;
- 10 rows with pattern-membership change;
- 18 other rows with reconciliation-field change and no pattern-membership change;
- 68 unchanged reconciliation rows.

`RECONCILIATION_DELTA.json`, `QA.json` and `HANDOFF.json` all distinguish `28` from `10`; no ambiguous `changed_rows=10` claim remains. The prior finding `A3-C3C-GLO-R1-001` is therefore closed by evidence.

## Recommendation and stop

The A3 retest has zero open Critical, Major or Minor findings and recommends PASS for this specialist review. This does not accept C3c or authorize C4. A0 must audit this frozen handoff, the separate fresh A4 review must pass, and A9 review remains required.
