# P1-S2-A9-FINAL-v1 — Independent Stage 2 final review

Issued 23/09/2026 by A0. Owner: a fresh A9 who authored no Stage 2 artifact. A0 alone closes the gate.

## Inputs/version

- Exact manifest: `A_Level_CS_page/planning/paper1/stage-2/work-orders/c5/P1-S2-A9-FINAL-v1_INPUT_MANIFEST.json`; SHA256 `d57d625afbae5ce451b49a9996407508bb5abd53db40bc1747078a7f246d7115`; 408 files.
- C4c handoff SHA256 `69fb514e0e2de46e4ad7ec1d9107dc522ef4066c27d9ab2b868ee839b9838626`.
- Stage 2 manifest SHA256 `6af95171474fc75b5847963ab421b9c2bfe9028f3d25e905742e4c316e88979a`.
- A0 final integrity SHA256 `246cbe5b0195f85dbaef90e7334f4d1b4923c3cb2a995bc0ddf560ad962a6037`. Use it only for comparison; independently implement checks.
- Rehash every declared input before review. Any drift is a blocker and must be reported without substitution.

## Write allowlist and required outputs

Write only `A_Level_CS_page/planning/paper1/stage-2/evidence/a9/final-v1/`. Freeze exactly five files:

1. `FINAL_REVIEW_REPORT.md`
2. `FINAL_MACHINE_CHECKS.json`
3. `INPUT_MANIFEST.json` — byte-identical issued copy
4. `OUTPUT_MANIFEST.json` — pins outputs 1–3, excludes itself/handoff
5. `HANDOFF_FINAL.json` — pins output manifest and outputs 1–3

Do not edit canonical artifacts, accepted evidence, trackers, app files or Stage 3. Do not spawn another agent.

## Independent acceptance

- Reproduce all S2-M01 through S2-M14 with an independent implementation and verify every manifest/handoff hash.
- Verify exact populations: 99 objectives, 205 required children, 99 planned LUs, 893 assessment units, 379 containers, 893 unique scoring targets, 2,250 marks over 30 papers, 128 context-only unresolved, 504 patterns, 824 equivalence components, 96 glossary terms and 27 command words.
- Verify accepted role projection across 893 units: 1,153 PRIMARY, 174 SUPPORTING, zero overlap/drift; sole unmapped unit remains explicit.
- Verify pattern evidence/counts and source locators; inspect all three `NEEDS_REVIEW` patterns and representative ESTABLISHED/SINGLETON cases.
- Verify equivalence candidate universe, 72 positives, component split, zero detected positive/unresolved/unreviewed-likely cross-split relation, 586 complement audit and its non-exhaustive limitation.
- Verify split 701 AUTHOR_POOL / 1,800 marks and 192 CONTROLLED_CHECK / 450 marks across six whole 75-mark papers; confirm no controlled IDs enter author allowlist and the claim is not blind holdout/independent progress measurement.
- Verify every required requirement has planned teaching and assessment disposition; 15 AlgoCore-original briefs reconcile exactly and contain no full prompt, answer or solution.
- Verify 62 HARD edges and the 99-node topological order. Preserve Cambridge-versus-AlgoCore authority boundaries.
- Source-sample syllabus, coursebook, QP/MS and risk classes. Confirm 165 no-verified-book flags, 12 no-official, 3 controlled-only, 3 needs-review dependencies, 200 glossary candidate-status flags and the one unmapped accepted unit are not hidden.
- Confirm 128 unresolved records remain context-only/non-scoring, 78 derived files are not elevated as authority, and no lesson/app/translation/Stage 3 product was created.
- PASS requires zero unexplained drift and zero open Critical/Major/Minor findings. If CHANGES_REQUIRED, record exact evidence, owner, correction and retest; do not fix artifacts.

## Stop condition

Freeze the five-file handoff and stop. Do not close Stage 2 or dispatch Stage 3. A0 will rehash, rerun integrity, audit findings and issue PASS or CHANGES_REQUIRED, then set `WAITING_FOR_USER_STAGE_CHECK`.
