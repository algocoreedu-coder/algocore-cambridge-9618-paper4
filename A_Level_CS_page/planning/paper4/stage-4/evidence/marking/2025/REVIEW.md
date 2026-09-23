# S4-S3 review — marking corpus 2025

Status: **SUBMITTED**. This is an agent submission for Lead review, not a batch gate or canonical method artifact.

## Coverage

- 6 papers / 18 questions / 140 scored parts / 450 indexed marks.
- 458 editorial marking-point atoms, each with an official MS locator.
- 18 multi-assessed rows retain all pattern references while marks remain owned by one part row.
- Award semantics: alternative=6, dependent=89, discrete=275, evidence=31, group_max=57.
- 0 rows intentionally have an atom count different from the part mark total outside a `to max` group; these are listed in `MARKING_SUBMISSION.json.ambiguities` and are not force-balanced.

## Method

The submission uses the frozen Stage 1 2025 index for part identity, marks, QP/MS pages and evidence workflow; the frozen Stage 2 map for assessed/context patterns; and the six Stage 1 page-bounded QP/MS review extracts for criterion semantics. Every source row was parsed at the part boundary and retained as a single ledger row. Bullets beginning with an ellipsis are marked dependent; `to max` groups retain a cap; evidence rows remain evidence semantics. No claim is made that bullet count always equals marks.

`method_step_refs` are empty by design and carry `PENDING_LEAD_METHOD_JOIN`. This agent did not invent canonical method IDs or write solutions. All code/evidence obligations remain design inputs, and code examples remain unexecuted.

## Source risks and decisions needed

Six concrete source risks are carried in `SOURCE_RISK_REGISTER.json`: the two s25/41 constructor underscore occurrences, s25/41 X/x case mismatch, s25/42 Record/NewRecord mismatch, s25/42 Territory naming variation, and the w25/43 queue full-guard contradiction between criterion and sample listing. In every case, the QP/MS criterion contract is retained and sample code requires independent Stage 5 verification.

## Precise ambiguity list

- `9618_s25_41_1(c)`, MS PDF 12: three marks are printed in two bullets; the second bullet contains two credited actions. Resolved as three one-mark atoms after facsimile review.
- `9618_w25_41_1(d)`, MS PDF 11: four marks are printed in three bullets; the last bullet contains the Push-return action and the FALSE/full-message/break action. Resolved as four one-mark atoms.
- `9618_w25_41_3(d)`, MS PDF 29-30: four marks are printed in three bullets; the last bullet separates no-collision storage from collision-bucket search/storage. Resolved as four one-mark atoms.
- `9618_s25_43_2(f)(ii)`, MS PDF 32: the extraction boundary left only the example marker; facsimile review restored the single evidence criterion, locations for the first three searches and not-found for the fourth.
- Six source/example-code ambiguities remain deliberately carried forward under IDs `S25-41-MS31-INIT`, `S25-41-MS35-INIT`, `S25-41-Q1C-CASE`, `S25-42-Q2A-CLASSNAME`, `S25-42-Q3CI-NAME`, and `W25-43-Q2B-FULL-GUARD`. Their official criteria are usable for Stage 4, while code/example resolution is a Stage 5 obligation.

There are no unresolved part-allocation anomalies in this submission. Lead should still review the four resolved rows and six carried source risks before canonical join. A bullet count is never used as a substitute for the Marks column or explicit allocation language.

## A8 required rework

- `A8-SRC-REQ-005`: restored a meaningful, bounded evidence criterion for `9618_s25_42_2(f)(iii)` without transcribing the screenshot.
- `A8-SRC-REQ-006`: all seven `9618_s25_42_1(e)` atoms now carry an explicit one-mark value; mp.05 is discrete and has no alternative-route note.
- `A8-SRC-REQ-007`: page 35 constructor defect is recorded as `S25-41-MS35-INIT` and joined to part `9618_s25_41_3(c)(i)` and both atoms.
- `A8-SRC-REQ-008`: `W25-43-Q2B-FULL-GUARD` now names empty, 99-occupied and 100-occupied Stage 5 fixtures in JSON.

## Self-check result

PASS for the submission boundary: exact 140 parts and 450 marks; six paper totals are each 75; all part IDs are unique and equal the Stage 2 2025 set; all official atoms have an MS locator; no co-tag duplicates marks; no canonical method refs or executable claims were created.
