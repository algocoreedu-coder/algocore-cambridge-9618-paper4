# P1-S1-A2-B25-V3 — Exact marking-row boundary correction

Date: 2026-09-21. Status: DISPATCHED. Owner: A2. Do not spawn agents. Create a new immutable candidate and stop after a frozen handoff; A2 cannot accept the batch.

## Frozen inputs

- Parent candidate `evidence/a2/B25/versions/B25-A2-v2/`: handoff SHA256 `e76a1dd54350d237b76cd5c50fa3fbcb2de515b2e46b6f60c074bf83812027f5`; batch manifest SHA256 `063e47ee4726c310d63646a4b777a61fd5054ee4d47c3c00b7e290592609fca8`; snapshot SHA256 `56374136cee31b62382c44f8e26fb31b2e6319bc689373e938b077493161be94` with 442 entries.
- A9-v2 handoff `evidence/a9/B25/review_v2/HANDOFF_REVIEW_V2.json` SHA256 `c01a3453afed6095a0948fb29d98e5d9e3639e261da956dd89334b3eadc0108d`; findings SHA256 `d3b50d623011aba5dfc0f2189052a41c06d868c75cd305621285d38abd062ce9`; A0 audit SHA256 `0d81b5d0c7bfb190b8438f00ea9b0cdb0a81465348eaecf648dae06beeeb23a0`.
- Preserve the already-passed v2 context correction and specialist evidence: A3-v2 handoff SHA256 `e190a65d00eb9a5a4c67babc03580e3427340b138b6a36566972327f2f420112`; A4-v2 handoff SHA256 `fadda1eeb35560ef52d5a134ea5b595dbf0b8566fc119ab6c1b58db6f21994a1` is superseded only for marking-boundary sufficiency.
- Stage 0 source manifest SHA256 `195a68ad98b4739dff0d3496dc93ba9e85d67d2dae0d88e3d4e4a088f1259c9c`; schema SHA256 `9fe71d4719b0c8f9fd6d6fd6fb0316c7f9a840b6b964634889ea6d98245a1f1f`; extraction policy SHA256 `97bd6c69ea8d459ea99713e943c2d092a88999b6df7cb315d2820547789c11f2`.
- Twelve original 2025 QP/MS PDFs, 178 pages total, are authoritative and read-only.

## Write allowlist

Write only `A_Level_CS_page/planning/paper1/stage-1/evidence/a2/B25/versions/B25-A2-v3/`. Do not edit v1/v2, reviews, A0 evidence, sources, trackers, app, lessons, taxonomy or translations.

## Exact correction set

Remove only the trailing generic `Question / Answer / Marks` header from `mark_or_condition_or_null` for these eight records:

1. `9618_w25_qp_12-q1-mi-1`
2. `9618_w25_qp_12-q2-pb-mi-1`
3. `9618_w25_qp_12-q5-pe-mi-1`
4. `9618_w25_qp_12-q6-pd-mi-1`
5. `9618_w25_qp_12-q8-pb-pii-mi-1`
6. `9618_w25_qp_12-q9-pb-mi-1`
7. `9618_w25_qp_12-q10-pc-mi-1`
8. `9618_w25_qp_13-q3-pb-mi-1`

For each record preserve the complete source-backed answer, marking condition, terminal displayed mark, target type/ID, MS locator, transcript reference, table row, visual dependencies and status. Preserve all 175 other marking records byte-for-byte by serialized line. Preserve PAGE/QUESTION/context/visual content byte-for-byte. Do not modify the original source typo/non-finding or the eleven v2 corrections.

## Required evidence and acceptance

- Pin the work order, dispatch record, v2 handoff/manifest/snapshot, A9-v2 handoff/findings, A0 A9 audit, Stage 0 manifest/schema/policy and all 12 source PDFs.
- Produce a semantic delta proving exactly eight changed record IDs and a changed-field union of only `mark_or_condition_or_null`; compare the full 183-row marking index and prove the other 175 serialized lines are identical.
- Prove zero remaining terminal generic headers, while retaining the row's actual terminal mark token/content. Include per-record before/after/source locator evidence.
- Produce physical delta against v2, immutable-core comparison, cross-reference check, six mark totals, schema validator, snapshot manifest, batch manifest and frozen handoff with all output hashes/byte counts.
- Expected preserved counts: 178 pages, 51 roots, 207 parts, 183 marking items, 51 contexts, 144 visual regions, 27 parent groups; each of six QP totals is 75.

## Reviewer and stop

After freeze, A0 audits identity and exact delta. A4 must inspect all eight boundaries against the originals and rerun all 183 marking links. A9 then reviews the same v3 candidate and A4-v3 evidence. A3-v2 may be carried forward only if A0 proves no context/scope/hierarchy/locator/visual drift. Stop after the frozen A2 handoff.
