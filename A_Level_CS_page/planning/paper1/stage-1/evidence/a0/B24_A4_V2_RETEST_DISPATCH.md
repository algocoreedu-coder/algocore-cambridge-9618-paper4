# P1-S1-A4-B24-RETEST-V2 — Marking boundary and linkage retest

Date: 2026-09-21. Status: DISPATCHED. Owner: A4 independent of the B24-A2-v2 author and A0. Do not spawn agents. Freeze and stop after the specialist handoff; only A0 may accept the batch.

## Frozen inputs

- Candidate `evidence/a2/B24/versions/B24-A2-v2/`: handoff SHA256 `1deff03ac092aaec6bbaeed727dbfb62dfeeebd65b848d04723a27518b481328`; batch manifest SHA256 `88d4a354968210ce74d40af6aff25c06111855218630cc44df580423a0f3e6c7`; snapshot SHA256 `97bd0ed1f802a6f8d71dda39f8b30086f6e8d9e16e8a154d1c25f575eb5f94f5` with 400 entries; marking index SHA256 `331f66b5e614e69026a1b036c2b75fb63354bfea77901925c2fc4467a2b7dccd`.
- Candidate A0 audit `evidence/a0/B24_A2_V2_A0_AUDIT.json` SHA256 `d5b2bfb4c2706840984e8e7c63f3c9ed223a67c531d0e1aabf9c426f254b826f`.
- A9-v1 handoff `evidence/a9/B24/review_v1/HANDOFF_REVIEW_V1.json` SHA256 `ccb42b04231de24e29292fdd8404b72e6b9fb6f514efafccf685c7220535bf59`; findings `evidence/a9/B24/review_v1/FINDINGS_V1.json` SHA256 `f0cfa70f3d1981777494a13e99ef18232ae29f8b859fe2bb407a1241af403d48`.
- Prior A4-v1 handoff `evidence/a4/B24/review_v1/HANDOFF_REVIEW_V1.json` SHA256 `e145320c7805acd8e70a1d507a1f902e59e7d517e967cfb9314e47d909bcff3e`; output manifest SHA256 `092dea2479ced3be66f9e5bb71c120bfdf525c30b0c70fb7cf3938490c08dc4e`.
- Stage 0 source manifest SHA256 `195a68ad98b4739dff0d3496dc93ba9e85d67d2dae0d88e3d4e4a088f1259c9c`; schema SHA256 `9fe71d4719b0c8f9fd6d6fd6fb0316c7f9a840b6b964634889ea6d98245a1f1f`; extraction policy SHA256 `97bd6c69ea8d459ea99713e943c2d092a88999b6df7cb315d2820547789c11f2`.
- Twelve original 2024 QP/MS PDFs, 156 pages total, are authoritative and read-only.

## Write allowlist

Write only `A_Level_CS_page/planning/paper1/stage-1/evidence/a4/B24/retest_v2/`. Do not edit candidate, prior reviews, A0 evidence, sources, trackers, app, lessons, taxonomy or translations.

## Required retest

- Verify every frozen pin, all 400 candidate snapshot entries, all 12 source hashes/page counts, and candidate/A9/A0 identities before semantic work.
- Directly inspect the original MS row boundary for every one of the 19 IDs in `A9-B24-MS-01`. Confirm the following generic `Question / Answer / Marks` header is absent while the row's answer, mark/condition, table-row reference, MS locator, question/part target, transcript reference, visual dependencies and status remain source-backed.
- Re-run all 170 marking-item targets and locators, including whole-question versus part targets. Report missing, ambiguous, prefix-only, duplicated or cross-question links; do not infer marks.
- Verify the 29 structural parent groups retain no synthetic parent allocation and all six QP displayed-mark totals remain 75.
- Confirm no context, hierarchy, QP locator or visual relation changed from v1. A3 retest is not required unless this check identifies non-mechanical drift; report such drift as Major and stop without repair.
- Use direct source evidence for the 19 corrected cases and risk-focused samples across all sessions/components. A parser/search result alone is insufficient for PASS.

## Acceptance and stop

Produce a human-readable retest report, machine-readable finding dispositions/check matrix, frozen input/output/source manifests, direct source render evidence, and `HANDOFF_RETEST_V2.json` with checksum. Recommend `PASS_A4_ONLY` only if all 19 boundaries and all 170 links pass and no Critical/Major is open. Freeze and stop for A0 audit; A9-v2 and A0 decision remain mandatory.
