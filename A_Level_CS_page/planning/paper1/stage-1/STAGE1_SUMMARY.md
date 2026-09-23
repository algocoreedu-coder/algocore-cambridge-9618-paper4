# Stage 1 summary — Paper 1 source corpus

Version 1.1. Date 21/09/2026. Owner A0. **State: FROZEN_FOR_FINAL_A9_REVIEW_V2.**

## Result prepared for the gate

The accepted 2021–2025 batches have been merged into one provenance-preserving corpus for Cambridge 9618 Paper 1. Every aggregate record names its accepted batch, exact candidate version, candidate root and gate state. This artifact is source evidence for later bilingual lesson authoring; it does not contain lessons or modify the Fumadocs app.

| Measure | Result |
|---|---:|
| Accepted batches | 5 |
| Exam papers | 30 |
| Original QP/MS PDFs | 60 |
| Indexed source pages | 811 |
| Question roots | 247 |
| Parts | 1,025 |
| Marking items | 927 |
| Visual-risk regions | 534 |
| Aggregate JSONL records | 3,604 |
| QP totals independently recomputed as 75 | 30/30 |
| Explicit unresolved records | 128 |

The unresolved set is deliberate and contains 94 question/part parent containers plus 34 B21 parent-context marking rows. No standalone mark or locator was inferred. B24's 29 and B25's 27 extracted parent-group labels are distinguished from unresolved records because their accepted evidence shows that child rows hold the mappings and no separate MS row is expected.

## Accepted inputs

| Batch | Accepted candidate | A0 decision |
|---|---|---|
| B21 | B21-A2-v6 | `15ae3f00d8920c38a0a55e1ebc282cc6f77a93010043b41740eab80b31c64645` |
| B22 | B22-A2-v5 | `fc5f990ad9e22d42b7409aad504ea0ce2255f0bf9e0c7905a14fe2506a1f887a` |
| B23 | B23-A2-v3 | `653ea257ab0d78a16a2fc7771f5f95a63d6fc925df08b3085f45b235ac975bca` |
| B24 | B24-A2-v2 | `76797cebe4aae2932751a60a7886d4a63ded5d943d469d5fd66961b475bbe101` |
| B25 | B25-A2-v3 | `0d4a0b6725df45638f2ba5efca0f7a548ec20ff1ae77e9b5657788b34fda1ca6` |

## Frozen aggregate artifacts

| Artifact | SHA256 | Bytes |
|---|---|---:|
| `CORPUS_INDEX.jsonl` | `9f5a2f45430234c67a780f50c82134654f60d49bca911d5b5d40b381acd8b92d` | 2,328,319 |
| `CORPUS_MANIFEST.json` | `0c053152796cd539a833d8a91dbdf2954539e413824f9b961b5f522047076e0a` | 6,751 |
| `UNRESOLVED_REGISTER.md` | `35dfb66a70c9c2922485e18a4240170b33bc37da81ae7e5e274b738d91f4d0d0` | 5,511 |
| `FINAL_INTEGRITY_CHECK.json` | `1f81e4a20a3fe99f48d67b4aaec927d54b89213c3d3f174aed6e693f2f455e2d` | 4,826 |
| `evidence/a0/final/validate_aggregate.py` | `7e674f9998dcecd4b2e33830564212d1613f7d4aad0bc8bfa443dc2c8630d040` | 16,737 |

## A0 verification

`FINAL_INTEGRITY_CHECK.json` is PASS. A0 parsed all 3,604 JSONL records, rehashed all 60 original PDFs, reconciled 811 page rows to source page counts, checked 2,733 typed IDs for uniqueness, validated question/part hierarchy and cycles, locator targets, exact marking-target cardinality, visual relations/dependencies, referenced transcript/context/render files, allowed status values and all five decision/authority pins. It also removes only aggregate metadata and proves canonical multiset identity against every accepted PAGE, QUESTION, MARKING and VISUAL artifact; all 20 comparisons pass. The 30 QP mark totals each recompute to 75. There are no validator errors.

The v2 freeze corrects one A0 manifest-only count from 207 to 208 B21 marking items. The B21 candidate and `CORPUS_INDEX.jsonl` already contained all 208 records, the corpus-wide total was already 927, and no corpus record changed. The earlier A9 work order was stopped before a gate decision and superseded by the v2 review packet.

## Limits carried forward

- The Stage 0 local-source provenance limit remains. Hash identity is verified; this stage adds no new remote authenticity certification.
- Variant equivalence is not assessed; all variants remain separate.
- Coursebook warnings and the 78 derived files remain outside this primary exam corpus pending separate audit.
- Historic evidence-only notes S1-I14, S1-I19 and S1-I20 remain in the issue register and do not change corpus content.
- Lesson correctness, Vietnamese/English translation, taxonomy, app behavior and publication are later-stage gates.

## Remaining gate

An independent A9 reviewer must reproduce the aggregate hashes/counts and validate the merge, unresolved reconciliation and scope boundary. A0 may mark Stage 1 complete only after that reviewer returns PASS and the final handoff itself passes A0 integrity audit.
