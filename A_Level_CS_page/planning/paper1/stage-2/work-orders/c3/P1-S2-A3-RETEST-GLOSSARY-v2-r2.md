# P1-S2-A3-RETEST-GLOSSARY-v2-r2 — Full source/term/objective closure retest

Fresh independent retest of `glossary-v2-r2`. Exact input manifest: `P1-S2-A3-RETEST-GLOSSARY-v2-r2_INPUT_MANIFEST.json`, 330 files, SHA256 `7e8c494ae3d36e3cee1efc5492209b0934fa60ba828ed7face0be5224ec2f9f6`. Author handoff SHA256 `ecd68234324b52e079e59d7daf030377a981d390296fc2c855b6675dca2b5543`. A0 pre-retest audit SHA256 `9c61053979ff0217a6ca7b2357cf2e3c06bd042fb811e2ca65d818ac272e52b2`.

## Owner and write allowlist

Owner: fresh A3 reviewer, independent of A6. Do not spawn agents. Write only:

`A_Level_CS_page/planning/paper1/stage-2/evidence/a3/reviews/glossary-v2-r2/retest-v1/`

Do not edit author, prior review, A0, tracker, upstream or downstream artifacts.

## Review contract

1. Rehash all 330 inputs and the exact eight-file r2 packet; any drift is Critical.
2. Repeat the full 96-row source, terminology, objective-evidence, command-authority and text-integrity review. Do not limit review to changed metadata.
3. Confirm the three semantic artifacts are byte-identical to r1 and all prior accepted semantic invariants remain: 96 terms, 27 byte-identical command rows, 69 objective links, 80 objective-evidence records, 874 pattern links, 547 exact command pairs and 29 no-link rows.
4. Independently compare all seven reconciliation fields against glossary-v2 and reproduce exactly 28 changed rows. Separately compare `pattern_ids` and reproduce exactly 10 pattern-membership changed rows.
5. Verify delta scopes classify exactly 10 membership+reconciliation changes, 18 other reconciliation-field changes and 68 unchanged rows. Verify every before/after value.
6. Verify delta, QA and handoff each distinguish and report `28/10`; no ambiguous `changed_rows=10` remains.
7. Recheck check-digit evidence, Justify, boundaries, UTF-8/control bytes and prohibited claims.

## Exactly six outputs

`RETEST_REPORT.md`, `FINDINGS.json`, `MACHINE_CHECKS.json`, exact-copy `INPUT_MANIFEST.json`, `OUTPUT_MANIFEST.json`, `HANDOFF.json`.

PASS requires 330/330 inputs, exact closure, full-packet review, counts/scopes `28/10/18/68`, zero semantic drift and 0 open Critical/Major/Minor. Findings must include severity, locator, evidence, owner, fix and retest.

Freeze six files and stop. A0 audits; A9 and C4 remain blocked.
