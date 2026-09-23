# P1-S1-A9-FINAL — independent aggregate and Stage 1 gate review

Issued 21/09/2026 by A0. State: ACTIVE_ON_DISPATCH.

## Role and independence

Act as A9, independent final reviewer. You did not author the accepted A2 candidates or the A0 aggregate. Do not edit any A0, A2, A3 or A4 artifact. Do not spawn agents.

## Frozen inputs

| Input | SHA256 | Bytes |
|---|---|---:|
| `stage-1/CORPUS_INDEX.jsonl` | `9f5a2f45430234c67a780f50c82134654f60d49bca911d5b5d40b381acd8b92d` | 2,328,319 |
| `stage-1/CORPUS_MANIFEST.json` | `8e9b0a27b10a7dcf090067af338ad955f91ae502acadd70e631ed1426d724611` | 6,748 |
| `stage-1/UNRESOLVED_REGISTER.md` | `35dfb66a70c9c2922485e18a4240170b33bc37da81ae7e5e274b738d91f4d0d0` | 5,511 |
| `stage-1/FINAL_INTEGRITY_CHECK.json` | `2d4e30fbe04276c53057faab1ea33ea74024895c47279859d38ff4f1ade01e91` | 2,099 |
| `stage-1/STAGE1_SUMMARY.md` | `fd3317d38bc03b63e006125750e9cefacae64e36fa54cd391c5aae3544340fbf` | 3,807 |
| `stage-1/evidence/a0/final/validate_aggregate.py` | `6306815fc129ada5b2b71ddc372c4da0ec30fa3e0b82fc356b62e1a0c55cf4a4` | 13,125 |
| Stage 0 source manifest | `195a68ad98b4739dff0d3496dc93ba9e85d67d2dae0d88e3d4e4a088f1259c9c` | verify locally |
| Stage 1 schema | `9fe71d4719b0c8f9fd6d6fd6fb0316c7f9a840b6b964634889ea6d98245a1f1f` | verify locally |
| Stage 1 extraction policy | `97bd6c69ea8d459ea99713e943c2d092a88999b6df7cb315d2820547789c11f2` | verify locally |

Accepted decisions: B21 `15ae3f00d8920c38a0a55e1ebc282cc6f77a93010043b41740eab80b31c64645`; B22 `fc5f990ad9e22d42b7409aad504ea0ce2255f0bf9e0c7905a14fe2506a1f887a`; B23 `653ea257ab0d78a16a2fc7771f5f95a63d6fc925df08b3085f45b235ac975bca`; B24 `76797cebe4aae2932751a60a7886d4a63ded5d943d469d5fd66961b475bbe101`; B25 `0d4a0b6725df45638f2ba5efca0f7a548ec20ff1ae77e9b5657788b34fda1ca6`.

## Write allowlist

Write only under `A_Level_CS_page/planning/paper1/stage-1/evidence/a9/final/`. All other paths are read-only. Preserve frozen inputs byte-for-byte.

## Required checks

1. Recompute every frozen input and accepted-decision hash before content review.
2. Independently parse the JSONL and prove exact counts: 60 source files, 811 pages, 247 questions, 1,025 parts, 927 marking items, 534 visual regions and 3,604 total records.
3. Prove only B21-v6, B22-v5, B23-v3, B24-v2 and B25-v3 occur and every record has `batch_gate=ACCEPTED`. Reconcile aggregate record sets byte-semantically to those candidate indexes/visual manifests and the 60 Stage 0 QP/MS entries.
4. Rehash all 60 original PDFs, reconcile 811 page records and reject duplicate source/page keys.
5. Check typed-ID uniqueness, question/part parents and cycles, QP/MS locators, exactly-one target per marking item, all 927 target references, all 534 visual relations/dependencies and every referenced transcript/context/render file.
6. Recompute all 30 QP displayed-mark totals; each must equal 75.
7. Reconcile exactly 128 `UNRESOLVED` records: B21 34 parts + 34 marking items, B22 32 parts, B23 28 parts, B24/B25 zero. Confirm B24's 29 and B25's 27 extracted parent-group labels are not silently counted as unresolved and their child links exist.
8. Check status values, years 2021–2025, all candidate roots and all manifest decision/authority pins. Reject superseded content.
9. Check the summary and limits. Reject any Stage 2, lesson, bilingual-translation, app-behavior, publication or remote-authenticity claim.
10. Use an independent implementation. A0's validator may be run only as a comparison.

## Outputs

Create `FINAL_REVIEW_REPORT.md`, `FINAL_MACHINE_CHECKS.json`, `INPUT_MANIFEST.json`, `OUTPUT_MANIFEST.json`, and `HANDOFF_FINAL.json`. The handoff must state PASS or CHANGES_REQUIRED, list findings with severity and affected IDs/paths, list exact input/output hashes, and state whether any frozen input drifted.

## Acceptance and stopping point

Recommend PASS only if every required check passes and no Critical or Major finding remains. Minor evidence issues must be explicit. Stop after freezing the five outputs and report the handoff SHA256 to A0. A0 alone records the Stage 1 gate decision.
