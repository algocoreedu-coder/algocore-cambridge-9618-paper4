# P1-S1-A9-FINAL-V2 — independent aggregate and Stage 1 gate review

Issued 22/09/2026 by A0. State: ACTIVE_ON_DISPATCH. This work order supersedes `A9_FINAL_REVIEW_WORK_ORDER.md` (historical SHA256 `ca73bb2fc1d8db436991e8e94d2735c7ac8a2fb5121e1bd53532c8efeef2b1e8`) before any final-review handoff.

## Role and independence

Act as a new A9 independent final reviewer. You did not author the accepted A2 candidates or the A0 aggregate. Do not edit A0/A2/A3/A4 artifacts, accepted candidates, corpus files or trackers. Do not spawn agents.

## Frozen inputs

| Input | Bytes | SHA256 |
|---|---:|---|
| `stage-1/CORPUS_INDEX.jsonl` | 2,328,319 | `9f5a2f45430234c67a780f50c82134654f60d49bca911d5b5d40b381acd8b92d` |
| `stage-1/CORPUS_MANIFEST.json` | 6,751 | `0c053152796cd539a833d8a91dbdf2954539e413824f9b961b5f522047076e0a` |
| `stage-1/UNRESOLVED_REGISTER.md` | 5,511 | `35dfb66a70c9c2922485e18a4240170b33bc37da81ae7e5e274b738d91f4d0d0` |
| `stage-1/FINAL_INTEGRITY_CHECK.json` | 4,826 | `1f81e4a20a3fe99f48d67b4aaec927d54b89213c3d3f174aed6e693f2f455e2d` |
| `stage-1/STAGE1_SUMMARY.md` | 4,284 | `e6468960552a2d1418d5131ae8d9ddb1519effd7062a30ec5df0f9e9a9ef9495` |
| `stage-1/evidence/a0/final/validate_aggregate.py` | 16,737 | `7e674f9998dcecd4b2e33830564212d1613f7d4aad0bc8bfa443dc2c8630d040` |
| Stage 0 `SOURCE_MANIFEST.json` | 121,886 | `195a68ad98b4739dff0d3496dc93ba9e85d67d2dae0d88e3d4e4a088f1259c9c` |
| `stage-1/CORPUS_SCHEMA.md` | 3,675 | `9fe71d4719b0c8f9fd6d6fd6fb0316c7f9a840b6b964634889ea6d98245a1f1f` |
| `stage-1/EXTRACTION_POLICY.md` | 2,535 | `97bd6c69ea8d459ea99713e943c2d092a88999b6df7cb315d2820547789c11f2` |

Accepted decision pins:

- B21 `B21_BATCH_DECISION_V6.json`: `15ae3f00d8920c38a0a55e1ebc282cc6f77a93010043b41740eab80b31c64645`.
- B22 `B22_BATCH_DECISION_V5.json`: `fc5f990ad9e22d42b7409aad504ea0ce2255f0bf9e0c7905a14fe2506a1f887a`.
- B23 `B23_BATCH_DECISION_V3.json`: `653ea257ab0d78a16a2fc7771f5f95a63d6fc925df08b3085f45b235ac975bca`.
- B24 `B24_BATCH_DECISION_V2.json`: `76797cebe4aae2932751a60a7886d4a63ded5d943d469d5fd66961b475bbe101`.
- B25 `B25_BATCH_DECISION_V3.json`: `0d4a0b6725df45638f2ba5efca0f7a548ec20ff1ae77e9b5657788b34fda1ca6`.

## Write allowlist

Write only under `A_Level_CS_page/planning/paper1/stage-1/evidence/a9/final-v2/`. All other paths are read-only.

## Required independent checks

1. Recompute every frozen input and decision hash before reviewing content; any drift is blocking.
2. Parse the aggregate independently and prove exactly 3,604 records: 60 source files, 811 pages, 247 questions, 1,025 parts, 927 marking items and 534 visual regions.
3. Prove that only B21-A2-v6, B22-A2-v5, B23-A2-v3, B24-A2-v2 and B25-A2-v3 occur and every aggregate record has `batch_gate=ACCEPTED`.
4. Remove only the five aggregate metadata fields and independently compare canonical multisets with PAGE/QUESTION/MARKING/VISUAL records from all five accepted candidates; require all 20 comparisons to match.
5. Match the 60 source records to the Stage 0 QP/MS set; rehash all 60 original PDFs; reconcile 811 page records and reject duplicate source/page keys or out-of-range locators.
6. Check typed-ID uniqueness, question/part parents and cycles, QP/MS locators, exactly-one target per marking item, all 927 targets, all 534 visual relations/dependencies and every referenced transcript/context/render file.
7. Recompute displayed-mark totals for all 30 QPs and require 75 for every paper.
8. Reconcile exactly 128 `UNRESOLVED` records: B21 34 parts + 34 marking items, B22 32 parts, B23 28 parts, B24/B25 zero. Verify that B24's 29 and B25's 27 extracted parent-group labels are not silently classified unresolved and their child mappings exist.
9. Validate status values, years 2021–2025, candidate roots, manifest per-batch counts and all decision/authority pins. Reject superseded candidate content.
10. Review summary/limits for scope honesty. Reject Stage 2, lesson, translation, app, publication, variant-equivalence or remote-authenticity claims.
11. Use an independent checker. A0's validator may be run only as comparison evidence.

## Required outputs

Create exactly these gate artifacts, plus supporting scripts/evidence if useful:

- `FINAL_REVIEW_REPORT.md`
- `FINAL_MACHINE_CHECKS.json`
- `INPUT_MANIFEST.json`
- `OUTPUT_MANIFEST.json`
- `HANDOFF_FINAL.json`

`HANDOFF_FINAL.json` must state `PASS` or `CHANGES_REQUIRED`, list all findings with severity and affected IDs/paths, pin all review inputs and outputs, report whether frozen inputs drifted, and distinguish reviewer recommendation from A0 acceptance.

## Acceptance and stop condition

Recommend PASS only when every required check passes and no Critical/Major finding remains. Record any Minor with impact and disposition. Freeze outputs, report the SHA256 of `HANDOFF_FINAL.json`, and stop. Do not modify corpus/trackers, close the Stage 1 gate, begin Stage 2, or continue after handoff.
