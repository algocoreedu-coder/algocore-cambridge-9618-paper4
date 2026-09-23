# P1-S2-A6-CORRECT-GLOSSARY-v2-r2 — Correct reconciliation delta counts

Issued by A0 after `GLOSSARY_V2_R1_GATE_DECISION.json` returned `CHANGES_REQUIRED`. Exact input manifest: `P1-S2-A6-CORRECT-GLOSSARY-v2-r2_INPUT_MANIFEST.json`, 320 files, SHA256 `5d48747242b0ff6aa0fe0aa017919546cd505b93495ee8bc0166d9dd74786120`. Controlling decision SHA256 `233a0761b041614bd430d0f22b6548bbe4aabc98091e449e494194881a603139`. A3 retest handoff SHA256 `2afab471f6520d06ebc30d4522d97ddb38745e018decc8eb55d6d9890a5af051`; A4 retest PASS handoff SHA256 `5341d5260a96af5f912bc682f15d2d6fe6d49fe53a8aee7d22917c8e29436a6d`.

## Owner, write allowlist and independence

Owner: the same A6 terminology editor. Do not spawn agents. Write only:

`A_Level_CS_page/planning/paper1/stage-2/evidence/a6/glossary-v2-r2/`

Preserve all prior glossary packets and reviews as immutable history. Do not modify A0/reviewer evidence, trackers, upstream stages, patterns, lessons, translations, app or downstream work.

## Inputs/version

Rehash all 320 manifest entries before work. Any missing file, byte mismatch or SHA256 mismatch is Critical and stops the package.

Close `A3-C3C-GLO-R1-001` (Minor). `glossary-v2-r1` truthfully contains:

- 28 rows whose values differ across the seven reconciliation fields: `TERM-VAL-CHECK-DIGIT` plus all 27 `TERM-CW-*` rows.
- 10 rows whose `pattern_ids` membership changed: check digit plus the nine command rows receiving added pairs.
- 18 additional command rows whose methods/disposition changed while pattern membership remained unchanged.

The r1 delta summary and QA report only `changed_rows=10`, conflating pattern-membership changes with all reconciliation-field changes.

## Correction contract

1. Preserve these three semantic artifacts byte-for-byte from `glossary-v2-r1`:
   - `GLOSSARY_SEED_V2.jsonl`
   - `COMMAND_WORD_REGISTER.jsonl`
   - `CONFLICTS_AND_BOUNDARIES.md`
2. Regenerate `RECONCILIATION_DELTA.json` so:
   - `summary.reconciliation_field_changed_rows` is exactly 28;
   - `summary.pattern_membership_changed_rows` is exactly 10;
   - every one of the 28 changed rows has a truthful non-unchanged `change_scope`;
   - the remaining 68 rows alone use an unchanged scope;
   - before/after values remain exact, with `+63/-9`, six evidence removals and no semantic drift.
3. Regenerate `QA.json` to compute both row counts across all seven reconciliation fields and explicitly distinguish them. Remove or replace the ambiguous `changed_rows=10` claim.
4. Preserve 96 term IDs, 69 objective links, 80 objective evidence records, 874 pattern links, 29 no-link dispositions, Justify closure, check-digit focus and clean text.
5. Recompute input/output manifests and handoff hashes. The new input manifest must be an exact copy of the issued 320-file manifest.
6. Do not create lesson, translation, assessment solution, parity, split/holdout, traceability, app or Stage 3 output.

## Exactly eight outputs

1. `GLOSSARY_SEED_V2.jsonl`
2. `COMMAND_WORD_REGISTER.jsonl`
3. `RECONCILIATION_DELTA.json`
4. `CONFLICTS_AND_BOUNDARIES.md`
5. `QA.json`
6. `INPUT_MANIFEST.json` — exact copy of the issued manifest
7. `OUTPUT_MANIFEST.json`
8. `HANDOFF.json`

## Acceptance

- 320/320 inputs rehash; exact eight outputs and closure pass.
- The three named semantic artifacts are byte-identical to r1.
- Independent comparison of all seven reconciliation fields reproduces exactly 28 changed rows; independent comparison of `pattern_ids` reproduces exactly 10 membership-changed rows.
- Delta row scopes classify 28 changed and 68 unchanged rows truthfully; before/after values have zero mismatch.
- All accepted semantic counts and checks from A4 PASS remain unchanged, including 874/874 links, 547 exact command pairs, 29 no-link rows, `+63/-9`, Justify and check digit.
- QA, delta, output manifest and handoff agree on both count concepts and all hashes.
- All text outputs pass UTF-8/prohibited-control scan.

## Reviewers and stop condition

After handoff, A0 rehashes the packet. A fresh A3 reviewer must repeat the full source/term/objective/text review and recompute both counts. A separate fresh A4 reviewer must verify semantic byte identity, all accepted link counts and corrected metadata closure. A9 remains blocked until both PASS and A0 audits them.

Freeze exactly eight outputs and stop. Do not update trackers, accept C3c or start C4/downstream work.
