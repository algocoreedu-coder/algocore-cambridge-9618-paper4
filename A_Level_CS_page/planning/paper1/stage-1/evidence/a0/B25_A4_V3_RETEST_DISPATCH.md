# P1-S1-A4-B25-RETEST-V3 — Marking boundary and linkage retest

Date: 2026-09-21. Status: DISPATCHED. Owner: A4 independent of the B25-A2-v3 author and A0. Do not spawn agents. Freeze and stop after the specialist handoff; only A0 may accept B25.

## Frozen inputs

- Candidate `evidence/a2/B25/versions/B25-A2-v3/`: handoff SHA256 `e498e1f978bc038e98de3551d5dffe061b1f71fce866d86744ec24e3a82d02c5`; batch manifest SHA256 `4a9e64a05d6205e4f3cae6e2b8c013e34d5176f757ecffbe66a1c58171c98489`; snapshot SHA256 `e78a8b8f8f2b399ed6f442de614abdd494b4d357494524c3f0c4cc9150cc3957` with 450 entries; marking index SHA256 `a200dabddd320b94aaf159c4b5742a63de5a4c0f0b936584bb9794fdc0616eef`.
- Candidate A0 audit `evidence/a0/B25_A2_V3_A0_AUDIT.json` SHA256 `355a8c024ece148cf365f7d443cf59fe39046e5a9988f35515a01faf9c4f3abe`.
- A9-v2 handoff `evidence/a9/B25/review_v2/HANDOFF_REVIEW_V2.json` SHA256 `c01a3453afed6095a0948fb29d98e5d9e3639e261da956dd89334b3eadc0108d`; findings SHA256 `d3b50d623011aba5dfc0f2189052a41c06d868c75cd305621285d38abd062ce9`.
- Prior A4-v2 handoff SHA256 `fadda1eeb35560ef52d5a134ea5b595dbf0b8566fc119ab6c1b58db6f21994a1`; A3-v2 handoff SHA256 `e190a65d00eb9a5a4c67babc03580e3427340b138b6a36566972327f2f420112` remains applicable only to unchanged context/scope evidence.
- Stage 0 source manifest SHA256 `195a68ad98b4739dff0d3496dc93ba9e85d67d2dae0d88e3d4e4a088f1259c9c`; schema/policy v1.1 and 12 original 2025 PDFs/178 pages remain authoritative.

## Write allowlist

Write only `A_Level_CS_page/planning/paper1/stage-1/evidence/a4/B25/retest_v3/`. Do not edit candidate, prior reviews, A0 evidence, sources, trackers, app, lessons, taxonomy or translations.

## Required retest

- Verify all frozen pins, all 450 candidate snapshot entries and all 12 source hashes/page counts.
- Directly inspect the eight `A9-B25-MS-01` records against W25/12 MS pp4,5,8,9,10,11 and W25/13 MS p6. Confirm the unrelated next-table header is absent and every source-backed answer, marking condition, terminal mark, target, locator, transcript, table row, visual dependency and status remains intact.
- Re-run all 183 marking-item targets, locators and row boundaries, including three whole-question targets and 180 part targets. Explicitly scan for all terminal generic headers.
- Verify 27 parent groups retain no synthetic allocation, six QP totals remain 75, and no context, hierarchy, QP locator or visual relation drifted from v2.
- Use direct source evidence for all eight corrected records and risk-focused samples across every session/component. Parser/search evidence alone is insufficient.

## Deliverables and stop

Produce a report, machine-readable checks/findings/dispositions, frozen input/output/source manifests, direct-source evidence and `HANDOFF_RETEST_V3.json` with checksum. Recommend `PASS_A4_ONLY` only if all eight boundaries and all 183 links pass and no Critical/Major remains. Freeze and stop for A0 audit; A9-v3 and A0 decision remain mandatory.
