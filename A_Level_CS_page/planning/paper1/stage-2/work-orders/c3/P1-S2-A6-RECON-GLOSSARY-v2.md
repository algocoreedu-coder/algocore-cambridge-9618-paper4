# P1-S2-A6-RECON-GLOSSARY-v2 — Glossary final-ID reconciliation

Pattern-final-v1 accepted by A0 decision SHA256 `05be88b9b6443de831dad7c3c4fc516dd2a881a1d237297151926e7c05d01ef0`. Exact 271-file input manifest SHA256 `d50878bfd5fb471be47aa3afcc9b09d7851ee61cff37073fa8e03935bb2c6285`.

## Owner and write allowlist

Owner: A6 terminology editor. Do not spawn agents. Write only `stage-2/evidence/a6/glossary-v2/`. Do not modify glossary-v1-r1, foundation, patterns, reviews, A0 evidence or trackers.

## Reconciliation contract

- Rehash all inputs first. Preserve all 96 accepted term IDs, canonical English, Vietnamese candidate/status, aliases, prohibitions, definition boundaries and source refs unless an explicit source-backed correction is listed in the delta.
- Preserve the 27 command-word rows byte-for-byte unless a cited syllabus correction is necessary; any change requires exact before/after and source locator.
- Populate `objective_ids` only from accepted foundation-v1 IDs with a defensible exact term/alias occurrence, cited source relationship or reviewed domain mapping. Populate `pattern_ids` only from accepted pattern-final-v1 IDs with explicit definition/feature/requirement/evidence support. Do not keyword-link ambiguous homonyms.
- Every linked ID must resolve; every row records reconciliation method/evidence. Empty links are allowed only with an explicit `NO_VERIFIED_FINAL_ID_LINK` disposition.
- Set reconciliation status to `RECONCILED`, `RECONCILED_NO_LINK`, or `NEEDS_REVIEW`; every NEEDS_REVIEW has a concrete ambiguity/conflict. Preserve terminology boundaries for validation/verification, check digit/checksum, bit/byte, accuracy/precision and database terms.
- This is terminology metadata, not lesson/assessment translation. Do not claim full VI/EN parity.

## Exactly eight outputs

1. `GLOSSARY_SEED_V2.jsonl`
2. `COMMAND_WORD_REGISTER.jsonl`
3. `RECONCILIATION_DELTA.json`
4. `CONFLICTS_AND_BOUNDARIES.md`
5. `QA.json`
6. `INPUT_MANIFEST.json` — exact copy
7. `OUTPUT_MANIFEST.json`
8. `HANDOFF.json`

## Acceptance

96 unique term rows and 27 unique command-word rows; all objective/pattern refs resolve; v1 protected fields preserve identity; every final-ID link has evidence/method; every empty link and NEEDS_REVIEW has explicit disposition; delta covers all 96 terms; manifest/handoff closure passes; no unsupported authority or parity claim.

Fresh A3 and independent A4 review separate aspects, followed by A9 before C4. Freeze eight outputs and stop; do not update trackers or start split/trace/lesson/app/Stage 3 work.
