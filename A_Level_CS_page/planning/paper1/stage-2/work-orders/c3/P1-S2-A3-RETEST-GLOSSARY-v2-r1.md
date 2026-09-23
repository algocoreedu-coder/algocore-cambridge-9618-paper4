# P1-S2-A3-RETEST-GLOSSARY-v2-r1 — Source, terminology and objective retest

Fresh independent retest of corrected `glossary-v2-r1`. Exact input manifest: `P1-S2-A3-RETEST-GLOSSARY-v2-r1_INPUT_MANIFEST.json`, 305 files, SHA256 `127abc71c61a282bf2b8c674de1d71bbfb66ffeac2381564ba61a6c6797f7bfd`. Author handoff SHA256 `aaea630bdde0d775adc4d9062a90f1bd35bc91c21d53e377d6545ded117013a5`. A0 pre-retest audit SHA256 `c2902fdb01672d1e03f86bf348252c5d6b63118ce36f01cfd4598012f9cedf54`.

## Owner, write allowlist and independence

Owner: a fresh A3 reviewer who did not author `glossary-v2` or `glossary-v2-r1`. Do not spawn agents. Write only:

`A_Level_CS_page/planning/paper1/stage-2/evidence/a3/reviews/glossary-v2-r1/retest-v1/`

Do not edit A6 artifacts, prior A3/A4 review packets, A0 evidence, trackers, upstream stages, lessons, translations, app or downstream work.

## Inputs/version

Rehash all 305 manifest entries before review. Any missing file, byte mismatch or hash mismatch is Critical and stops the review. Confirm the A6 directory has exactly eight files and that its output manifest and handoff close by bytes and SHA256.

Review the complete corrected packet, not only changed rows. The controlling findings are `A3-C3C-GLO-001`, `A4-GLO-V2-001`, `A4-GLO-V2-002`, and `A4-GLO-V2-003`; A3 owns source, terminology, objective and text-integrity closure. Pattern semantic closure remains independently owned by A4.

## Required review

1. Review all 96 glossary rows, all source references and all objective links/evidence against the accepted foundation and syllabus authority.
2. Confirm all 96 term IDs and every protected v1 field are unchanged; confirm all 27 command-register rows remain byte-identical and meanings/locators remain valid.
3. Inspect `TERM-VAL-CHECK-DIGIT`: objective `AC26-6.2-02` must remain supported by exactly `REQ-6.2-02-07`; qualifier-only evidence `REQ-6.2-02-01` through `REQ-6.2-02-06` must be absent.
4. Confirm the validation/verification, check digit/checksum, bit/byte, accuracy/precision and database/normalisation boundaries remain technically correct and source-bounded.
5. Scan every one of the eight author outputs as UTF-8 for prohibited ASCII controls. LF is permitted only as a line separator. Read every repaired boundary statement and confirm all 15 intended token sites are printable and semantically consistent with the structured rows.
6. Reconcile all 96 delta rows to the actual before/after state. Check QA and manifest claims from source data rather than trusting author self-report.
7. Check no fixed response-length/mark rule, bilingual parity, approved translation, lesson, split, app or Stage 3 claim was introduced.

## Exactly six outputs

1. `RETEST_REPORT.md`
2. `FINDINGS.json`
3. `MACHINE_CHECKS.json`
4. `INPUT_MANIFEST.json` — exact copy of the issued manifest
5. `OUTPUT_MANIFEST.json`
6. `HANDOFF.json`

## Acceptance

- 305/305 inputs and exact eight-file author packet rehash with zero drift; output closure is exact.
- 96/96 terms and every objective/evidence row have been reviewed; no source, scope, protected-field or dangling-reference defect remains.
- Check digit has exactly the focus-bearing `REQ-6.2-02-07` objective evidence and no qualifier-only evidence.
- All 27 command rows are byte-identical to accepted v1-r1 and remain accurate against syllabus pages 41–42.
- All eight outputs are valid UTF-8, contain no prohibited controls, and every repaired boundary statement is readable and technically consistent.
- Findings include severity, locator, evidence, owner, required fix and retest. PASS requires 0 open Critical/Major/Minor.

## Reviewer and stop condition

A0 audits this handoff. An independent fresh A4 retest runs separately and is not replaced by this review. A9 remains blocked until both specialist retests PASS and A0 accepts their handoffs.

Freeze exactly six outputs and stop. Do not repair author files, update trackers, accept C3c or start C4/downstream work.
