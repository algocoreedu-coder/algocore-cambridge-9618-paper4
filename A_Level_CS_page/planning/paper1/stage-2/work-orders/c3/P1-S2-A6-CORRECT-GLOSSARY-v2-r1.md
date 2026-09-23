# P1-S2-A6-CORRECT-GLOSSARY-v2-r1 — Correct glossary reconciliation

Issued by A0 after `GLOSSARY_V2_GATE_DECISION_V1.json` returned `CHANGES_REQUIRED`. Exact input manifest: `P1-S2-A6-CORRECT-GLOSSARY-v2-r1_INPUT_MANIFEST.json`, 295 files, SHA256 `5b9a4fb99a002957159871a22479f434b3d79b9c4633891d1e18be5a90a1da57`. Controlling decision SHA256 `1d9b27c585ba4b8fc5a4313e3a8aeb2098c3f9a85690e6afcda724ada05c418c`. A3 review handoff SHA256 `30ebfb5e6c24972a99b34f61b450db1d78fab25f328dbd4289298294a16adbc5`; A4 review handoff SHA256 `3bffc6e6a170867f440264f5da0380e15dd5e0fb5b309f99cfb5126c15697f1f`.

## Owner, write allowlist and independence

Owner: the same A6 terminology editor who produced `glossary-v2`. Do not spawn agents. Write only:

`A_Level_CS_page/planning/paper1/stage-2/evidence/a6/glossary-v2-r1/`

Preserve `glossary-v2` as immutable review history. Do not modify A3/A4 review evidence, A0 evidence, accepted C1/C2/C3 artifacts, trackers, Stage 0/1, lessons, translations, visuals, app or Stage 3. Fresh independent A3 and A4 reviewers who did not author either glossary packet must retest `glossary-v2-r1`; a fresh A9 review remains required before C4.

## Inputs/version

Rehash every entry in the adjacent manifest before work. Any missing file, byte mismatch or SHA256 mismatch is Critical and stops the package. Use accepted `foundation-v1`, `pattern-final-v1`, `glossary-v1-r1`, frozen `glossary-v2`, both specialist reviews, and A0's gate decision exactly as pinned.

## Findings to close

### A4-GLO-V2-001 — missing command-word links (Major)

Split each accepted `command_words_observed` value on semicolons, trim each token, and match only exact canonical command words from the frozen 27-row register. Add exactly 63 supported term-pattern pairs and corresponding evidence records:

- Calculate 1
- Complete 17
- Describe 10
- Explain 1
- Give 4
- Identify 13
- Justify 4
- State 4
- Write 9

`TERM-CW-JUSTIFY` must change from `RECONCILED_NO_LINK` to `RECONCILED` and link exactly `PAT-C3A2-0028`, `PAT-C3A2-0075`, `PAT-C3A2-0142`, and `PAT-C3A2-0192`. Do not add stems, synonyms, fuzzy matches or inferred command words.

### A4-GLO-V2-002 — check-digit qualifier leakage (Major)

Remove exactly these nine unsupported pattern links and their evidence from `TERM-VAL-CHECK-DIGIT`:

`PAT-C3A2-0362`, `PAT-C3A2-0394`, `PAT-C3A2-0395`, `PAT-C3A2-0396`, `PAT-C3A2-0397`, `PAT-C3A2-0398`, `PAT-C3A2-0399`, `PAT-C3A2-0400`, `PAT-C3A2-0401`.

Keep objective `AC26-6.2-02` for check digit only through focus-bearing requirement `REQ-6.2-02-07`. Remove qualifier-only objective-evidence records `REQ-6.2-02-01` through `REQ-6.2-02-06`. Do not link sibling validation patterns merely because their repeated classification qualifier mentions check digit.

### A3-C3C-GLO-001 / A4-GLO-V2-003 — corrupted boundary text (Minor)

Regenerate `CONFLICTS_AND_BOUNDARIES.md` with printable literal text. Repair all 15 intended token sites reported by the reviewers, including `requirement_ids`, `validation`, `verification`, `bit`, `byte`, `accuracy`, database labels and normalisation labels. Scan every text output for prohibited ASCII controls. LF is allowed only as a line separator; reject BEL, BS, TAB, VT, FF, CR and mid-token LF corruption.

## Preservation and regeneration contract

1. Preserve all 96 term IDs and every protected glossary-v1-r1 field.
2. Preserve all 27 command-register rows byte-for-byte unless a separately sourced correction is documented. This work order does not authorize such a correction.
3. Rebuild `RECONCILIATION_DELTA.json` so its before/after state exactly matches the corrected glossary.
4. Rebuild `QA.json` with explicit closure assertions for 63 additions, nine removals, six objective-evidence removals, `TERM-CW-JUSTIFY`, the check-digit focus guard, protected-field identity and clean text bytes.
5. Recompute every manifest and handoff hash. Record old/new counts and digests. Do not copy prior PASS statements without rerunning them.
6. Do not create lesson text, assessment questions/solutions, VI/EN parity claims, frequency forecasts, split/holdout, traceability, app or Stage 3 artifacts.

## Exactly eight outputs

1. `GLOSSARY_SEED_V2.jsonl`
2. `COMMAND_WORD_REGISTER.jsonl`
3. `RECONCILIATION_DELTA.json`
4. `CONFLICTS_AND_BOUNDARIES.md`
5. `QA.json`
6. `INPUT_MANIFEST.json` — exact copy of the issued correction manifest
7. `OUTPUT_MANIFEST.json`
8. `HANDOFF.json`

## Acceptance

- All 295 inputs rehash with zero drift; output set is exactly eight files with manifest and handoff closure.
- Glossary has 96 unique term IDs; command register has 27 byte-identical rows; protected v1 fields have zero drift.
- Exact semicolon tokenization reconstructs zero missing and zero extra command-word term-pattern pairs; the correction adds exactly 63 supported pairs.
- `TERM-CW-JUSTIFY` is `RECONCILED`, has exactly four required pattern links, and no longer has a no-link disposition.
- The nine listed check-digit links and their evidence are absent; no other accepted pattern link is removed without explicit source evidence.
- `TERM-VAL-CHECK-DIGIT` objective evidence contains `REQ-6.2-02-07` and excludes `REQ-6.2-02-01` through `REQ-6.2-02-06`; its objective link remains valid.
- Every text output is valid UTF-8 and contains no prohibited ASCII control character or mid-token line-feed corruption.
- Delta, QA, output manifest and handoff agree on every count, path, byte length and SHA256.
- Open findings are claimed closed only with machine-readable evidence; author self-report does not close the gate.

## Reviewers and stop condition

After handoff, A0 rehashes the packet and issues exact-hash retests to a fresh A3 source/term/objective reviewer and a separate independent A4 pattern/exam-language reviewer. Both must review the corrected full packet, not only the changed rows. If both pass, A0 dispatches a fresh A9 review before accepting C3c.

Freeze the eight-file handoff and stop. Do not update trackers, accept C3c, start C4 or perform downstream work.
