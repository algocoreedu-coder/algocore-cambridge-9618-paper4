# P1-S1-A9-B25-REVIEW-V2 — Independent batch gate review

Date: 2026-09-21. Status: DISPATCHED. Owner: A9 independent of B25 A2/A3/A4 authors and A0. Stop after a frozen PASS/CHANGES_REQUIRED recommendation; only A0 may accept B25. Do not spawn agents.

## Frozen inputs

- Candidate `evidence/a2/B25/versions/B25-A2-v2/`: handoff SHA256 `e76a1dd54350d237b76cd5c50fa3fbcb2de515b2e46b6f60c074bf83812027f5`; batch manifest SHA256 `063e47ee4726c310d63646a4b777a61fd5054ee4d47c3c00b7e290592609fca8`; snapshot SHA256 `56374136cee31b62382c44f8e26fb31b2e6319bc689373e938b077493161be94` with 442 entries.
- Candidate A0 audit `evidence/a0/B25_A2_V2_A0_AUDIT.json` SHA256 `72c73ab452386f56f5a07d8392a641ba7024d455608d10a90a4823ffc6cdca73`; validator evidence `evidence/a0/B25_A2_V2_A0_VALIDATE.json` SHA256 `e2a33361079a98adb183ff4114ada2345e5cdf3dc2e9886eb8cc67811c3a8866`.
- A3-v2 handoff `evidence/a3/B25/retest_v2/HANDOFF_RETEST_V2.json` SHA256 `e190a65d00eb9a5a4c67babc03580e3427340b138b6a36566972327f2f420112`; output manifest SHA256 `b27625e80a484e44bb6e79808144f9fdb9c53e09fe3e45b77d6e44879eae29ea`; A0 audit SHA256 `987d664c9ff058c5810a53e04b5d563a7e93e65c0ae42f5b953c8675d5891cc5`.
- A4-v2 handoff `evidence/a4/B25/retest_v2/HANDOFF_RETEST_V2.json` SHA256 `fadda1eeb35560ef52d5a134ea5b595dbf0b8566fc119ab6c1b58db6f21994a1`; output manifest SHA256 `c5ed4e8c9bcab7916fb76022011745922ab80337bb0933f08c413284aff8b605`; output sums SHA256 `2107eca988386bddf516f8b809867b8bfa403176215e4f1588d3e1e1e6940b5b`; A0 audit SHA256 `fe6de339da5dad19b8ecc35ed5a98cf3539b51d7ac2eae09139f33c9f8a9d379`.
- Stage 0 source manifest SHA256 `195a68ad98b4739dff0d3496dc93ba9e85d67d2dae0d88e3d4e4a088f1259c9c`; schema and extraction policy under Stage 1 remain authoritative; 2026 syllabus/scope artifacts define scope limits.
- Twelve original 2025 QP/MS PDFs, 178 pages total, are authoritative and read-only.

## Write allowlist

Write only `A_Level_CS_page/planning/paper1/stage-1/evidence/a9/B25/review_v2/`. Do not edit A2/A3/A4/A0 artifacts, sources, trackers, app, lessons, taxonomy or translations.

## Required independent review

- Verify all frozen pins, all 442 candidate snapshot entries, A3/A4 evidence identities, and all 12 original PDF hashes/page counts.
- Independently evaluate the complete Stage 1 batch gate: aggregate counts, unique IDs, hierarchy, locators, source/transcript/context references, visual dependencies, unresolved records, allowed statuses and six displayed-mark totals.
- Sample every risk class and every session/component against direct original source pages. Include blank/imprint/next-question boundaries, shared-page context, multi-page prompts, diagrams/tables/formulas, MS alternatives/conditions and whole-question versus part targets.
- Explicitly retest all ten v1 context-boundary findings: each removed page must be a next-question/boundary page and no required question page may be lost. Confirm S25/11 Q8 PDF p15 and W25/13 Q5 PDF pp7–8 remain, while W25/13 Q5 p9 remains excluded.
- Explicitly retest `9618_w25_qp_13-q7-pe-mi-1`: the trailing generic `Question / Answer / Marks` header must be absent while the source-backed answer, mark/condition, locator and target remain intact.
- Verify all 27 structural parent groups have no inferred allocations and child records retain source-backed linkage. Check all 183 marking targets/locators and 144 visual regions/dependencies, using risk-focused source samples in addition to structural checks.
- Report each criterion and every finding with exact source locator, severity, owner and retest. Do not silently repair candidate or specialist evidence. Do not claim lesson correctness, teaching coverage, taxonomy, translation quality or app behavior.

## Acceptance and stop

Produce `BATCH_REVIEW_V2.md`, machine-readable findings/check matrix, frozen input/output/source manifests, and `HANDOFF_REVIEW_V2.json` with checksum. Recommend PASS only if no Critical/Major is open and evidence suffices for the whole batch gate. Freeze and stop for A0 audit and decision.
