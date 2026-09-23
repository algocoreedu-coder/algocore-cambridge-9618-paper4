# P1-S1-A3-B21-RETEST-V6 — Context/scope retest

Status: READY_FOR_DISPATCH. Owner: A3 independent of A2-v6 author. Stop after frozen A3-only recommendation; A9 and A0 remain mandatory.

## Frozen inputs

- Candidate `evidence/a2/B21/versions/B21-A2-v6/`.
- Handoff SHA256 `9719395a5daf02b0a3aa37fdb54b4bf28e4eabeb4bc3da76e05d2ddaeff96c33`.
- Batch manifest SHA256 `626f136e1ad3ba1b86191b9a2182892d326c69259408b53cb7a6b85bd8b1ba8e`.
- Snapshot manifest SHA256 `fe0563b881affd4dc8d25ac2f3bd22fe0bec4a9e586cf6c5b5b3206a427b2117` (313 entries).
- Semantic diff SHA256 `d33e8037bad3e0e576c8e25858490797011e7e5f7d367a6675f7d0b514962b7d`.
- A0 validation SHA256 `9b6a0792ffd4032d22c672272c45662f6c0f0ff162162fbd550730ab741e0c15`.
- A0 audit SHA256 `8b7fffc4337f70f8abc6a662578686df88d18bd1174d317bbfda99b266e30652`.
- A9-v5 blocking handoff SHA256 `acecb8f4f383eb7283eee86a31a2abed35933564a8f37acd80eff55dbe1d7f34`.
- Original 12 B21 PDFs, syllabus 2026 and Stage 0 scope evidence remain read-only authority.

## Write allowlist

Write only `A_Level_CS_page/planning/paper1/stage-1/evidence/a3/B21/retest_v6/`. Do not edit candidate, source, A0 trackers, app, lessons, or translations.

## Required review

- Recompute all frozen input, candidate snapshot and source hashes/page counts.
- Independently inspect Q8 context for `9618_s21_qp_12-q8`, `9618_w21_qp_11-q8`, and `9618_w21_qp_13-q8` against the original PDFs. Confirm the four false references are absent and each Q8 retains its true page.
- Confirm all legitimate Q7/Q8 continuation/context records remain intact, including shared/continued cases already reviewed in v5.
- Verify the semantic delta contains no unrelated scope/context changes; recheck the Q1 whole-question correction, visual-risk targets, 34 explicit unresolved parent-context rows, and source/syllabus flag authority.
- Screen all source pages at reduced scale and inspect all affected/risk pages full-size. Preserve exact page/hash provenance.

## Outputs and acceptance

Produce a context/scope retest report, findings/flags, source-risk evidence, render/contact-sheet manifest, frozen input/output manifest, and `HANDOFF_RETEST_V6.json` plus checksum. PASS_A3_ONLY requires zero open context/scope Major or Critical findings, exact four-reference correction, no unrelated semantic drift, 12 source hashes/154 pages, and all evidence hash-pinned. Stop for A0 audit.
