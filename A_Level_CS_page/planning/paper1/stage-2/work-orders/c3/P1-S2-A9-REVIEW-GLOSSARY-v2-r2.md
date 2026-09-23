# P1-S2-A9-REVIEW-GLOSSARY-v2-r2 — Final independent glossary review

Fresh A9 review of the corrected C3c glossary packet. Exact input manifest: `P1-S2-A9-REVIEW-GLOSSARY-v2-r2_INPUT_MANIFEST.json`, 344 files, SHA256 `6e7c19d558e53035812aaa40b7e0e539cea6e96fd82d775ed11f7f895625be50`. Author handoff SHA256 `ecd68234324b52e079e59d7daf030377a981d390296fc2c855b6675dca2b5543`. A3 PASS handoff SHA256 `5371e83a3e7bf557cebfed6b774db6afdf28799b8a6cb74724182548167d64a6`; A4 PASS handoff SHA256 `2c76c7b0a7661a7966db4c92351691def815bfd50030e1810fab129c46a6e3c6`.

## Owner and write allowlist

Owner: fresh A9 reviewer who did not author any glossary packet. Do not spawn agents. Write only:

`A_Level_CS_page/planning/paper1/stage-2/evidence/a9/reviews/glossary-v2-r2/review-v1/`

Do not edit A6/A3/A4/A0 evidence, trackers, accepted upstream artifacts or downstream work. A9 recommends `PASS` or `CHANGES_REQUIRED`; A0 alone accepts C3c.

## Review contract

1. Rehash all 344 inputs and verify exact closure of the eight-file author packet and both six-file specialist packets. Any drift is Critical.
2. Independently reproduce 96 unique terms, 27 byte-identical command rows, 69 objective links, 80 objective-evidence records, 874 pattern links, 547 exact command pairs and 29 no-link rows.
3. Review the complete pattern-link set and exact semicolon-token projection, or independently rerun equivalent complete checks. Require zero missing/extra/dangling pairs and preserve `+63/-9`, Justify four links and check-digit focus `REQ-6.2-02-07`.
4. Independently compare all seven reconciliation fields against glossary-v2 and reproduce 28 changed rows; separately reproduce 10 pattern-membership rows. Verify scopes exactly `10 + 18 + 68` and every delta before/after state.
5. Confirm glossary, command register and boundary document are byte-identical to independently reviewed r1. Confirm no source/objective/command meaning, protected field or boundary drift.
6. Verify closure of `A4-GLO-V2-001`, `A4-GLO-V2-002`, `A3-C3C-GLO-001 / A4-GLO-V2-003`, and `A3-C3C-GLO-R1-001` from evidence rather than status labels.
7. Scan all text outputs for UTF-8/control integrity and prohibit fixed response/mark rules, bilingual parity, approved translation, historical prediction, lesson, split, trace, app or Stage 3 claims.

## Exactly six outputs

1. `REVIEW_REPORT.md`
2. `FINDINGS.json`
3. `MACHINE_CHECKS.json`
4. `INPUT_MANIFEST.json` — exact copy of the issued manifest
5. `OUTPUT_MANIFEST.json`
6. `HANDOFF.json`

## Acceptance and stop

PASS requires 344/344 inputs, exact packet closure, complete independent semantic/count validation, all findings closed and 0 open Critical/Major/Minor. Each finding must include severity, locator, evidence, owner, required fix and retest.

Freeze exactly six outputs and stop. Do not accept C3c, update trackers or start C4/downstream work.
