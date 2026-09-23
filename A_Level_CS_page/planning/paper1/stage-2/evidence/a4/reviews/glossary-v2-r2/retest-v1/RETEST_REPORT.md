# Independent A4 retest — glossary-v2-r2

Result: **PASS**

Reviewer role: separate fresh independent A4 pattern/exam-language reviewer, independent of the A6 author. This retest does not edit the author packet, decide the C3c gate, or start C4.

## Frozen-input verification

- Work order SHA256: `0a15e83dacd0f36a1ceeaab2136efc9fe6d65282fb9b530983e12b5711974a01`.
- Issued 330-file manifest SHA256: `5790088df92b3baecc3424c4964ce956c66533d731d4c3853055c2fe73529577`.
- Rehash result: 330/330 files match their declared bytes and SHA256; zero missing files and zero drift.
- Author handoff SHA256: `ecd68234324b52e079e59d7daf030377a981d390296fc2c855b6675dca2b5543`.
- A0 pre-retest audit SHA256: `9c61053979ff0217a6ca7b2357cf2e3c06bd042fb811e2ca65d818ac272e52b2`.
- The author directory contains exactly eight files. All six content entries in its output manifest resolve to current bytes and SHA256.

## Semantic identity and full link retest

`GLOSSARY_SEED_V2.jsonl`, `COMMAND_WORD_REGISTER.jsonl`, and `CONFLICTS_AND_BOUNDARIES.md` are byte-identical to the independently reviewed `glossary-v2-r1` artifacts. Their current SHA256 values are respectively `564135a7250155c52583764c1fd46867c814b8140b2d4e92521f5656d8be95b2`, `2d0693bd9a370b080c2ea35a17468f7d9ccedb998900dedc529da70276474b56`, and `5be5b26d0b23882800200ce80ddd563e68da32e0df373516a2d4cb2e301b94ca`.

All 96 glossary rows parse and have unique term IDs: 59 technical, 8 unit, 2 symbol, and 27 command-word rows. The packet has 69 objective links backed by 80 objective-evidence records and 874 pattern links backed by 874 pattern-evidence records. Every pattern ID resolves in the accepted 504-pattern catalog. Every declared link has its corresponding evidence; every cited evidence path and hash resolves; every technical/unit requirement bridge is a subset of the target pattern requirements. Result: **874/874 supported, 0 rejected**.

The exact command projection was independently rebuilt from all 504 accepted patterns. Each raw `command_words_observed` value was split on semicolons, each token was trimmed, and only exact matches to the 27 canonical command words were retained. This produces 547 pairs, identical to the glossary command-word pairs: zero missing and zero extra. Comparison with frozen `glossary-v2` reproduces exactly 63 added pairs and 9 removed pairs. Added pairs are distributed as Calculate 1, Complete 17, Describe 10, Explain 1, Give 4, Identify 13, Justify 4, State 4, and Write 9. No fuzzy, stemmed, synonym, or inferred command link was found.

`TERM-CW-JUSTIFY` is `RECONCILED` and links exactly `PAT-C3A2-0028`, `PAT-C3A2-0075`, `PAT-C3A2-0142`, and `PAT-C3A2-0192`, each supported by an exact `Justify` semicolon token. `TERM-VAL-CHECK-DIGIT` has no pattern links and no pattern evidence. It retains only objective `AC26-6.2-02`, with objective evidence restricted to focus-bearing `REQ-6.2-02-07`; qualifier-only `REQ-6.2-02-01` through `REQ-6.2-02-06` are absent.

All 29 explicit no-link rows were reviewed: 16 command-word rows and 13 technical/symbol rows. The command rows have no exact canonical token in the accepted pattern observations; the other rows preserve guarded, conservative no-link dispositions. Result: **29/29 supported, 0 rejected**.

## Metadata closure

The seven reconciliation fields were independently compared between the delta's frozen `glossary-v2` baseline and the byte-identical r2 semantic output. The result is exactly 28 reconciliation-field changed rows, of which 10 change pattern membership and 18 change reconciliation metadata without changing membership; 68 rows are unchanged. Every one of the 96 delta rows reproduces its before state, after state, changed-field list, membership flag, scope, and added/removed objective and pattern IDs. The delta, QA, and handoff all report the same `28 / 10 / 18 / 68` partition and the same `+63 / -9` link delta.

## Exam language, boundaries, and text integrity

All 27 command meanings were checked against the 2026 syllabus command-word table and its subject-context rule: 23 entries resolve to PDF page 41 and four to page 42. The paraphrases preserve the official response demand; every row retains the question-and-subject-context boundary and does not assert a fixed response length, sentence count, marks-per-sentence rule, or mark value.

The validation/verification, check-digit/checksum, bit/byte, accuracy/precision, and database/normalisation boundaries remain distinct and conservative. All eight author files decode as UTF-8 and contain no prohibited BEL, BS, TAB, VT, FF, CR, DEL, or mid-token line-feed corruption. No bilingual parity, historical prediction, lesson, holdout, trace, app, Stage 3, or gate-acceptance claim appears.

## Decision and stop

Open findings: 0 Critical, 0 Major, 0 Minor. `glossary-v2-r2` passes the separate fresh A4 semantic-identity and metadata-closure retest. This six-file handoff is frozen. A0 remains gate authority; A9 review and all downstream work remain outside this reviewer scope.
