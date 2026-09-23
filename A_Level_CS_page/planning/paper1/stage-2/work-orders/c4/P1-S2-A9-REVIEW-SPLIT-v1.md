# P1-S2-A9-REVIEW-SPLIT-v1 — Independent C4a review

Issued 23/09/2026 by A0. Owner: a fresh A9 reviewer independent of the A2 split author and the equivalence author.

## Inputs/version

- Exact input manifest: `A_Level_CS_page/planning/paper1/stage-2/work-orders/c4/P1-S2-A9-REVIEW-SPLIT-v1_INPUT_MANIFEST.json`.
- Manifest SHA256: `5455eca03f4b20be54b9d6a81a8bc615a631c8611ea78eb30e1f3ee7d7368cb7`; exact file count: 62.
- Author handoff SHA256: `2c857fdb0ed14c699b0b9455ff980849d1db0bb3c5b1521519eebd13373b778f`.
- A0 pre-review audit SHA256: `3ae9662169fd58e883df1c3c3fccfd1c42aa4a4f09929231172fc4f15dcd94f8`. This is comparison evidence, not a substitute for independent implementation.
- Rehash every input before reviewing. Stop and report drift if any path, byte count or SHA256 differs.

## Write allowlist

Write only `A_Level_CS_page/planning/paper1/stage-2/evidence/a9/reviews/split-v1/review-v1/`. Do not modify split-v1, accepted artifacts, trackers or downstream files. Do not spawn another agent.

## Required outputs

Freeze exactly six files: `REVIEW_REPORT.md`, `FINDINGS.json`, `MACHINE_CHECKS.json`, `INPUT_MANIFEST.json` (byte-identical issued copy), `OUTPUT_MANIFEST.json`, `HANDOFF.json`.

## Independent acceptance

- Reconstruct 893 accepted units and 824 equivalence components from accepted inputs; verify every unit occurs exactly once and every component is atomic.
- Independently verify source identity for paper ID, marks, final pattern and primary requirements; all references resolve.
- Recompute split totals: AUTHOR_POOL 701 units / 632 components / 1,800 marks; CONTROLLED_CHECK 192 / 192 / 450; QUARANTINE 0; overall 893 / 824 / 2,250.
- Confirm the six controlled-check papers are whole 75-mark papers and the deterministic selection method/tie-break can be reproduced from its declared method; verify no closure spill.
- Recompute all 36,416 relation dispositions and all 72 positive relations; require zero positive, unresolved or unreviewed-likely cross-split relations.
- Reproduce the 586-pair seeded complement audit with zero observed false negatives and confirm the artifact keeps the stated non-exhaustive limitation.
- Verify `AUTHOR_ALLOWLIST.json` equals exactly the AUTHOR_POOL and excludes all controlled-check/quarantine units and components; confirm it was not dispatched.
- Confirm `CONTROLLED_CHECK`, not blind holdout or independent measurement, is the only permitted claim in a shared workspace.
- Verify exact nine-file author closure and exact six-file reviewer closure. Record all findings with severity, evidence, owner/fix/retest; PASS requires zero open Critical/Major/Minor.
- No lesson, translation, app or Stage 3 work.

## Stop condition

Freeze the six-file handoff and stop. A9 may recommend PASS or CHANGES_REQUIRED but cannot accept C4a, update trackers or dispatch TRACE.
