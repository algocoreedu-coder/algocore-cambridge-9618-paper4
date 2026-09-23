# P1-S2-A4-CORRECT-EQV-v2 — Correct equivalence graph completeness

Issued by A0 after `C3B_GATE_DECISION_V1.json` returned `CHANGES_REQUIRED`. Exact input manifest: `P1-S2-A4-CORRECT-EQV-v2_INPUT_MANIFEST.json`, 203 files, SHA256 `793261ca6e674e48a9ffad3c4c44c89032961c2f761a5932e8c4fffcfe148afd`. Controlling decision SHA256 `b33890189908d875f876a4cf9e7d9c4b2bf249ccc38013016eaf51f46fcc33c5`. A9 review handoff SHA256 `dcd2db25c8f5f24bcec9963c1d55aa27597efaf7cdfa8b87c0a2c5121afe6064`.

## Owner, write allowlist and independence

Owner: the same A4 equivalence author who produced `equivalence-v1`. Do not spawn agents. Write only:

`A_Level_CS_page/planning/paper1/stage-2/evidence/a4/equivalence-v2/`

Do not modify `equivalence-v1`, A9 review-v1, A0 evidence, accepted C2/C3a packets, trackers, Stage 0/1, app, lessons or translations. A fresh A9 who did not author either equivalence packet must independently retest v2.

## Inputs/version

Rehash every entry in the adjacent manifest before work. Any missing file, byte mismatch or SHA256 mismatch is Critical and stops the package. Treat `equivalence-v1` as superseded correction history. Preserve all accepted C3a node identities and source locators.

## Finding to close

Close `A9-C3B-003` (Major). The v1 generator uses a global `matched` endpoint set at lines 440, 444 and 445, allowing each unit into at most one positive edge. Valid equivalence components may contain more than two nodes; the restriction suppressed six source-confirmed positive edges and fragmented three intended three-member groups.

## Correction contract

1. Remove global endpoint one-to-one suppression. A reviewed unit may participate in every source-confirmed `DUPLICATE` or `PARALLEL_EQUIVALENT` edge.
2. Preserve evidence-led relation assignment. Similarity/proposal alone never promotes a pair. Every positive keeps QP and MS locator evidence and all five equivalence dimensions.
3. Build connected components from the complete positive-edge graph. Every one of 893 units appears in exactly one component/group and split guard.
4. Detect contradictions explicitly: a negative reviewed edge inside a proposed positive component, incompatible marks/response demand/stimulus semantics, or conflicting source verdict must be recorded and resolved from source evidence. Never silently overwrite the negative row.
5. Regenerate the complete 398,278 unordered-pair accounting: candidate universe, complement, relation register, groups, split guards, rejected-pair audit, QA, manifests and handoff. Re-run the generator deterministically and publish the new projection hash.
6. Preserve the v1 candidate channels and high-recall complement method unless a source-backed correction requires a documented versioned change. No pair may disappear from candidate plus complement accounting.
7. Keep all existing source-confirmed v1 positives unless source evidence specifically invalidates one; any such change must be explicit and independently reviewed.

### Required positive regression assertions

- `eqp-d39e691ca61aabc170ff29e2`: `AU-9618_w21_qp_11-q6-pb` ↔ `AU-9618_w21_qp_12-q8-pb-pi` → `PARALLEL_EQUIVALENT`.
- `eqp-b1bd1bbd61ce999a284fdc1c`: `AU-9618_w21_qp_12-q8-pb-pi` ↔ `AU-9618_w21_qp_13-q6-pb` → `PARALLEL_EQUIVALENT`.
- `eqp-58a9faed083abf812245f18d`: `AU-9618_w22_qp_11-q6-pbi` ↔ `AU-9618_w22_qp_13-q6-pbi` → `PARALLEL_EQUIVALENT`.
- `eqp-17921c83caef754451c7c38d`: `AU-9618_w22_qp_11-q6-pbii` ↔ `AU-9618_w22_qp_13-q6-pbii` → `PARALLEL_EQUIVALENT`.
- `eqp-164f851361ce8691ce982686`: `AU-9618_w22_qp_12-q7-pbi` ↔ `AU-9618_w22_qp_13-q6-pbi` → `PARALLEL_EQUIVALENT`.
- `eqp-1d450f0e4947672e1b239cad`: `AU-9618_w22_qp_12-q7-pbii` ↔ `AU-9618_w22_qp_13-q6-pbii` → `PARALLEL_EQUIVALENT`.

### Required negative regression assertions

These four proposal-triggered validation/verification comparisons were source-confirmed negative and must not be promoted by removing `matched`:

- `eqp-398f9f24aaf0d181531da38d`: `AU-9618_w21_qp_11-q2-pb-pi` ↔ `AU-9618_w21_qp_11-q2-pb-pii` stays `RELATED_NOT_EQUIVALENT`.
- `eqp-a1af49a090b3288101ca79be`: `AU-9618_w21_qp_11-q2-pb-pi` ↔ `AU-9618_w21_qp_13-q2-pb-pii` stays `RELATED_NOT_EQUIVALENT`.
- `eqp-b44849bf9cbe4b759853492d`: `AU-9618_w21_qp_11-q2-pb-pii` ↔ `AU-9618_w21_qp_13-q2-pb-pi` stays `RELATED_NOT_EQUIVALENT`.
- `eqp-efd733a739b48623e8096ea2`: `AU-9618_w21_qp_13-q2-pb-pi` ↔ `AU-9618_w21_qp_13-q2-pb-pii` stays `RELATED_NOT_EQUIVALENT`.

## Exactly twelve outputs

1. `CANDIDATE_GENERATION_CONFIG.json`
2. `generate_candidate_pairs.py`
3. `CANDIDATE_GENERATION_MANIFEST.json`
4. `CANDIDATE_PAIR_UNIVERSE.jsonl`
5. `VARIANT_RELATION_REGISTER.jsonl`
6. `EQUIVALENCE_GROUPS.json`
7. `REJECTED_PAIR_AUDIT.json`
8. `CONTRADICTION_UNRESOLVED_REPORT.md`
9. `QA.json`
10. `INPUT_MANIFEST.json` — exact copy of the issued correction manifest
11. `OUTPUT_MANIFEST.json`
12. `HANDOFF.json`

## Acceptance

- Exact output set is twelve files; manifests and handoff close by bytes and SHA256 with no extra output.
- All manifest inputs rehash; 893 eligible units are unchanged; 379 containers and 128 unresolved context records remain excluded.
- Candidate plus complement equals all 398,278 unordered pairs without duplicate, reversed or dangling pair identity.
- Every candidate has exactly one reviewed relation; unresolved/contradiction state is explicit and quarantined.
- All six required positive regression pairs are `PARALLEL_EQUIVALENT`; all four required negative guards remain `RELATED_NOT_EQUIVALENT`.
- Equivalence components rebuild from all positive edges and contain all nodes exactly once; split guards equal components.
- No positive edge lacks QP+MS evidence or any of the five dimensions. No negative relation exists inside a positive component without an explicit, unresolved contradiction that blocks C3b.
- Complement audit is deterministic and reports zero observed false negatives. Generator rerun reproduces the published projection.
- QA compares v1/v2 counts and explains every relation/group delta; `A9-C3B-003` is explicitly covered.
- No final pattern, frequency forecast, split/holdout decision, glossary reconciliation, traceability, lesson, translation, app or Stage 3 output is produced.

## Reviewer and stop condition

After handoff, A0 rehashes the packet and issues a new exact-hash retest order to a fresh independent A9. A9 must review the full v2 relation/group integrity, all positives, the complete complement sample, all ten regression pairs and any new/changed relation. A0 alone accepts C3b.

Freeze the twelve-file handoff and stop. Do not update trackers, accept C3b, start C3c or perform downstream work.
