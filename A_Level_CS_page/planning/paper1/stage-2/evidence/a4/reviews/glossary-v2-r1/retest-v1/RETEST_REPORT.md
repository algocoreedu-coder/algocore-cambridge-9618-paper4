# Independent A4 retest — glossary-v2-r1

Result: **PASS**

Reviewer role: fresh independent A4 pattern/exam-language reviewer, separate from the A6 author. This retest does not accept C3c, edit the author packet, or open C4.

## Frozen-input verification

- Issued work order SHA256: `d608b34a13eb53e244eee601b0a42511c918c01e5edd4b82986d5d87a5a07edb`.
- Issued 305-file manifest SHA256: `17e947d09dccccaa902fe3c77d75bfed0cc9c1972491f0d525a6f35db8a2ffae`.
- Rehash result: 305/305 files match bytes and SHA256; zero missing files and zero drift.
- Author handoff SHA256: `aaea630bdde0d775adc4d9062a90f1bd35bc91c21d53e377d6545ded117013a5`.
- A0 pre-retest audit SHA256: `c2902fdb01672d1e03f86bf348252c5d6b63118ce36f01cfd4598012f9cedf54`.
- The A6 directory contains exactly eight files. All six entries in its output manifest resolve to current bytes and SHA256; the handoff pins the same manifest and primary outputs.

## Complete link and no-link retest

All 96 glossary rows parse and have unique term IDs: 59 technical, 8 unit, 2 symbol, and 27 command-word rows. The 96-row reconciliation delta reproduces the prior and corrected reconciliation state after normalizing the legacy scalar/list representation of `reconciliation_methods`. The corrected packet preserves 1,056 protected v1 field values with zero mismatch, and its command-word register is byte-identical to the accepted v1-r1 register.

All **874 declared pattern links** were reviewed. The set consists of 279 technical links, 48 unit links, and 547 command-word links. Every pattern ID resolves in the accepted 504-pattern catalog; every declared link has exactly one corresponding pattern-evidence record; cited evidence paths and SHA256 values match; and every technical/unit bridge cites requirement IDs contained in the target pattern. Result: **874 supported, 0 rejected**. The frozen declared-link digest is `40f6cc82fe2330ac4fd1aa8609bdaf6edcbc7e9c11759c7b0d10563038b7cbb4`.

All **29 explicit `RECONCILED_NO_LINK` dispositions** were reviewed: 16 command-word rows and 13 technical/symbol rows. The command rows have no exact canonical token in the accepted pattern observations. The non-command rows retain their explicit source/section guards and conservative no-link rationale, without a newly introduced fuzzy or morphological bridge. Result: **29 supported, 0 rejected**. The no-link term-set digest is `30d97174e68f897d186ef158d2b7bf4e0a1645bd78352153ca3d6299c24c4226`.

## Exact command projection and correction closure

The command projection was independently rebuilt from all 504 accepted patterns by splitting every raw `command_words_observed` value on semicolons, trimming each token, and retaining exact matches to the 27 canonical command words. It produces 547 pairs. The glossary contains the same 547 pairs: zero missing and zero extra.

Comparison with frozen `glossary-v2` reproduces exactly 63 added command pairs and the required distribution: Calculate 1, Complete 17, Describe 10, Explain 1, Give 4, Identify 13, Justify 4, State 4, and Write 9. No fuzzy, stemmed, synonym, or inferred command pair was found.

`TERM-CW-JUSTIFY` is `RECONCILED` and links exactly `PAT-C3A2-0028`, `PAT-C3A2-0075`, `PAT-C3A2-0142`, and `PAT-C3A2-0192`. Its four evidence records preserve the accepted raw observations `Give; Justify`, `Identify; Justify`, `Circle; Justify`, and `Identify; Justify`.

The same comparison reproduces exactly the nine required removals from `TERM-VAL-CHECK-DIGIT`: `PAT-C3A2-0362` and `PAT-C3A2-0394` through `PAT-C3A2-0401`. The corrected term has no pattern link or pattern evidence. Its retained objective `AC26-6.2-02` has one objective-evidence record, using only focus-bearing `REQ-6.2-02-07`; qualifier-only `REQ-6.2-02-01` through `REQ-6.2-02-06` are absent.

## Exam language and text integrity

All 27 command meanings and locators were checked against the 2026 syllabus command-word tables: 23 rows on PDF page 41 and four rows on PDF page 42. The paraphrases preserve the official response demands, all rows retain the question-and-subject-context boundary, and no row introduces a fixed response length, sentence count, marks-per-sentence rule, or mark value.

The validation/verification, check-digit/checksum, bit/byte, accuracy/precision, and database/normalisation boundaries remain distinct and conservative. `CONFLICTS_AND_BOUNDARIES.md` contains all repaired literal tokens. All eight A6 outputs decode as UTF-8 and contain no prohibited BEL, BS, TAB, VT, FF, CR, DEL, or mid-token line-feed corruption. No VI/EN parity, historical prediction, lesson, holdout, trace, or downstream claim appears.

## Decision and stop

Open findings: 0 Critical, 0 Major, 0 Minor. The corrected packet passes the independent A4 pattern/exam-language retest. The previous findings `A4-GLO-V2-001`, `A4-GLO-V2-002`, and `A4-GLO-V2-003` are verified closed for this reviewer scope.

This six-file retest handoff is frozen. A0 remains gate authority. A9 review and any C3c/C4 decision remain outside this reviewer’s authority.
