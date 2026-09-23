# P1-S2-A4-RETEST-GLOSSARY-v2-r1 — Pattern and exam-language retest

Fresh independent retest of corrected `glossary-v2-r1`. Exact input manifest: `P1-S2-A4-RETEST-GLOSSARY-v2-r1_INPUT_MANIFEST.json`, 305 files, SHA256 `17e947d09dccccaa902fe3c77d75bfed0cc9c1972491f0d525a6f35db8a2ffae`. Author handoff SHA256 `aaea630bdde0d775adc4d9062a90f1bd35bc91c21d53e377d6545ded117013a5`. A0 pre-retest audit SHA256 `c2902fdb01672d1e03f86bf348252c5d6b63118ce36f01cfd4598012f9cedf54`.

## Owner, write allowlist and independence

Owner: a fresh A4 reviewer who did not author `glossary-v2` or `glossary-v2-r1`. Do not spawn agents. Write only:

`A_Level_CS_page/planning/paper1/stage-2/evidence/a4/reviews/glossary-v2-r1/retest-v1/`

Do not edit A6 artifacts, prior A3/A4 review packets, A0 evidence, trackers, accepted patterns/equivalence, lessons, translations, app or downstream work.

## Inputs/version

Rehash all 305 manifest entries before review. Any missing file, byte mismatch or hash mismatch is Critical and stops the review. Confirm the A6 directory has exactly eight files and that its output manifest and handoff close by bytes and SHA256.

Review the complete corrected packet, not only changed rows. Retest all declared links and no-link dispositions against accepted `pattern-final-v1`, source evidence and the 27-row command authority.

## Required review

1. Review all 874 declared term-pattern links and all 29 explicit no-link dispositions. Record supported/rejected counts; do not sample this set.
2. Independently reconstruct command-word pairs from all 504 accepted patterns: split every raw `command_words_observed` string on semicolons, trim exact tokens and compare only with the 27 canonical command words. Do not use fuzzy, stemming or synonym expansion.
3. Require zero missing and zero extra command-word pairs. Confirm the correction added exactly 63 supported pairs in the required distribution: Calculate 1, Complete 17, Describe 10, Explain 1, Give 4, Identify 13, Justify 4, State 4 and Write 9.
4. Confirm `TERM-CW-JUSTIFY` is `RECONCILED` and links exactly `PAT-C3A2-0028`, `PAT-C3A2-0075`, `PAT-C3A2-0142`, and `PAT-C3A2-0192` with exact raw-observation evidence.
5. Inspect every `TERM-VAL-CHECK-DIGIT` bridge. Confirm the nine rejected v2 patterns and their evidence are absent, no other supported link was lost, and objective evidence contains only focus-bearing `REQ-6.2-02-07`.
6. Confirm the net pattern-link total is 874 from 820 + 63 − 9, with no dangling pattern or evidence path/hash mismatch.
7. Review all 27 command meanings/locators and all protected exam-language boundaries. Scan the eight outputs for prohibited controls and inspect the repaired boundary document.
8. Reconcile all 96 delta rows and QA claims from primary data. Reject unsupported response-length, marks-per-sentence, historical prediction, parity, lesson or downstream claims.

## Exactly six outputs

1. `RETEST_REPORT.md`
2. `FINDINGS.json`
3. `MACHINE_CHECKS.json`
4. `INPUT_MANIFEST.json` — exact copy of the issued manifest
5. `OUTPUT_MANIFEST.json`
6. `HANDOFF.json`

## Acceptance

- 305/305 inputs and exact eight-file author packet rehash with zero drift; output closure is exact.
- 874/874 declared links and 29/29 no-link dispositions receive a review verdict.
- Independent exact-token projection across 504 patterns equals the command-word links with zero missing/extra pairs.
- Exactly 63 additions and nine check-digit removals are reproduced; `Justify` and check-digit focus guards pass.
- All pattern IDs resolve, all evidence paths/hashes match and no keyword-only/fuzzy link remains.
- All 27 command rows retain correct official meaning/locator; text-integrity scan passes.
- Findings include severity, locator, evidence, owner, required fix and retest. PASS requires 0 open Critical/Major/Minor.

## Reviewer and stop condition

A0 audits this handoff. A fresh A3 source/term/objective retest runs separately and is not replaced by this review. A9 remains blocked until both specialist retests PASS and A0 accepts their handoffs.

Freeze exactly six outputs and stop. Do not repair author files, update trackers, accept C3c or start C4/downstream work.
