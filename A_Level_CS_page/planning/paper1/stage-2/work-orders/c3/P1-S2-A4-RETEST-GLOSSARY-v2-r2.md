# P1-S2-A4-RETEST-GLOSSARY-v2-r2 — Semantic identity and metadata closure retest

Separate fresh independent retest of `glossary-v2-r2`. Exact input manifest: `P1-S2-A4-RETEST-GLOSSARY-v2-r2_INPUT_MANIFEST.json`, 330 files, SHA256 `5790088df92b3baecc3424c4964ce956c66533d731d4c3853055c2fe73529577`. Author handoff SHA256 `ecd68234324b52e079e59d7daf030377a981d390296fc2c855b6675dca2b5543`. A0 pre-retest audit SHA256 `9c61053979ff0217a6ca7b2357cf2e3c06bd042fb811e2ca65d818ac272e52b2`.

## Owner and write allowlist

Owner: fresh A4 pattern/exam-language reviewer, independent of A6. Do not spawn agents. Write only:

`A_Level_CS_page/planning/paper1/stage-2/evidence/a4/reviews/glossary-v2-r2/retest-v1/`

Do not edit author, prior review, A0, tracker, accepted patterns/equivalence or downstream artifacts.

## Review contract

1. Rehash all 330 inputs and the exact eight-file r2 packet; any drift is Critical.
2. Prove `GLOSSARY_SEED_V2.jsonl`, `COMMAND_WORD_REGISTER.jsonl` and `CONFLICTS_AND_BOUNDARIES.md` are byte-identical to independently reviewed r1.
3. Revalidate the full semantic set: 874/874 links, 547 exact semicolon-token command pairs with zero missing/extra, 29/29 no-link rows, `+63/-9`, Justify four links, check-digit focus and 27 command meanings.
4. Independently reproduce 28 reconciliation-field changed rows and 10 pattern-membership rows; validate scopes `10 + 18 + 68` and every delta before/after state.
5. Confirm delta, QA and handoff agree on `28/10`, all evidence paths/hashes resolve, text controls are clean and no prohibited claim appears.

## Exactly six outputs

`RETEST_REPORT.md`, `FINDINGS.json`, `MACHINE_CHECKS.json`, exact-copy `INPUT_MANIFEST.json`, `OUTPUT_MANIFEST.json`, `HANDOFF.json`.

PASS requires 330/330 inputs, exact closure, full semantic identity/count review, truthful metadata and 0 open Critical/Major/Minor. Findings must include severity, locator, evidence, owner, fix and retest.

Freeze six files and stop. A0 audits; A9 and C4 remain blocked.
