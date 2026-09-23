# P1-S1-A4-B21-RETEST-V6 — Linkage/context retest

Status: READY_FOR_DISPATCH. Owner: A4 independent of A2-v6 author. Stop after frozen A4-only recommendation; A9 and A0 remain mandatory.

## Frozen inputs

- Candidate `evidence/a2/B21/versions/B21-A2-v6/`.
- Handoff SHA256 `9719395a5daf02b0a3aa37fdb54b4bf28e4eabeb4bc3da76e05d2ddaeff96c33`.
- Batch manifest SHA256 `626f136e1ad3ba1b86191b9a2182892d326c69259408b53cb7a6b85bd8b1ba8e`.
- Snapshot manifest SHA256 `fe0563b881affd4dc8d25ac2f3bd22fe0bec4a9e586cf6c5b5b3206a427b2117` (313 entries).
- Semantic diff SHA256 `d33e8037bad3e0e576c8e25858490797011e7e5f7d367a6675f7d0b514962b7d`.
- A0 validation SHA256 `9b6a0792ffd4032d22c672272c45662f6c0f0ff162162fbd550730ab741e0c15`.
- A0 audit SHA256 `8b7fffc4337f70f8abc6a662578686df88d18bd1174d317bbfda99b266e30652`.
- A9-v5 blocking handoff SHA256 `acecb8f4f383eb7283eee86a31a2abed35933564a8f37acd80eff55dbe1d7f34`.
- A3-v6 handoff may be compared after it freezes, but A4 must perform its own source review.
- Original 12 B21 QP/MS PDFs remain read-only authority.

## Write allowlist

Write only `A_Level_CS_page/planning/paper1/stage-1/evidence/a4/B21/retest_v6/`. Do not edit candidate, source, A0 trackers, app, lessons, or translations.

## Required review

- Recompute all frozen input, candidate snapshot and source hashes/page counts.
- Independently verify the three corrected Q8 context records against original QPs: Q8 stays on S21/12 p14, W21/11 p15 and W21/13 p15; the four non-question page references are absent.
- Confirm exact QP/MS linkage, labels, parent-child/context dependencies, 208 marking items, 34 explicit unresolved parent-context rows, 77 visual regions, and no dangling IDs.
- Recompute all six displayed-mark totals; recheck W21/12 Q1 `[2]` plus exact question-level MS row and all prior B21 visual targets.
- Compare v5→v6 files to ensure only the allowed context correction and derived metadata changed. Inspect affected/risk pages from original PDFs, not derived text alone.

## Outputs and acceptance

Produce linkage/context retest report, findings/checks, source-render evidence, frozen input/output manifest, and `HANDOFF_RETEST_V6.json` plus checksum. PASS_A4_ONLY requires zero open linkage/context Major or Critical findings, the exact four-reference correction, six totals of 75, all sources/snapshot hashes matching, and no unrelated semantic drift. Stop for A0 audit.
