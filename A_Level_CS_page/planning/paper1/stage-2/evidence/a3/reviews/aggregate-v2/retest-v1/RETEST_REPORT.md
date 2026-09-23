# Fresh independent A3 closure retest - C3a aggregate-v2

Work order: `P1-S2-A3-RETEST-C3A-v2`  
Artifact reviewed: `evidence/a4/aggregate-v2/`  
Reviewer: fresh A3, independent of the A4 author and aggregate-v1 reviewer  
Review date: 2026-09-22  
Result: **PASS**

## Decision basis

The correction passes the full C3a contract with zero open Critical or Major findings. The reviewer independently reconstructed 504 canonical keys from the exact accepted source-candidate rows, sorted their UTF-8 JSON serializations, and reproduced IDs `PAT-C3A2-0001` through `PAT-C3A2-0504`. The 893 occurrences form an exact one-to-one partition: no key is split, no pattern contains multiple keys, every candidate binding resolves, and both QBI and occurrence references point to the same reconstructed pattern.

The ten heterogeneous aggregate-v1 patterns and their 40 affected occurrences were reproduced from frozen v1 evidence. The six aggregate-v1 duplicate-key partitions were also reproduced. Aggregate-v2 contains zero heterogeneous patterns and zero duplicate-key partitions, so `C3A-A3-MAJ-001` and `C3A-A3-MAJ-002` are closed.

## Frozen inputs and closure

- Rehashed all 106 issued inputs. Missing files: 0; byte mismatches: 0; SHA256 mismatches: 0.
- Issued manifest SHA256: `fb3c0de007ffafbbb920a5a9cbf173661987443ae15a006363d53b08bd74e2df`.
- Author handoff SHA256: `c8052aa622ef28e1c53175a51ec98cf8515b95d686afc2f9ebf118e9da3fdc3d`.
- Confirmed aggregate-v2 contains exactly its nine required files. Its output manifest, content hashes, handoff pins and author input-manifest identity all close.
- Parsed every JSON and JSONL input, including empty JSONL files, with zero parse failure.
- Confirmed aggregate-v1 and its review evidence remain byte-identical to their issued hashes.

## Independent union and source-value reconstruction

| Invariant | Rebuilt result |
|---|---:|
| Question-bank rows | 1,400 |
| Atomic scoring units | 893 |
| Non-scoring containers | 379 |
| Unresolved context-only rows | 128 |
| Marking rows | 927 |
| Scoring links | 893 |
| B21 parent-context marking rows | 34 |
| Displayed marks | 2,250 |
| Papers | 30 |
| Marks per paper | 75 for every paper |
| Pattern occurrences | 893 |
| Canonical keys / provisional patterns | 504 / 504 |

All 2,327 aggregate rows carrying `source_record` were compared as parsed values with the exact pinned accepted-source line named by their lineage; mismatches: 0. Atomic, container and unresolved identity sets reproduce the five accepted batch sets. The scoring links form an exact bijection with the atomic units. Every container, unresolved row and B21 parent-context marking row remains non-scoring and absent from pattern occurrences. Grouped, capped, threshold, row-atomic and structural marking data, official conditions and explicit alternatives remain equal to the accepted rows.

For corrected occurrence evidence, `atomic_source_primary_requirement_ids` reproduces the frozen atomic requirement set, while `accepted_candidate_primary_requirement_ids` and the occurrence key reproduce the exact accepted candidate requirement set. This explicit bridge accounts for the correction without changing an accepted `source_record`, locator, mark, scope, response product, cognitive action or marking semantic.

## Canonical partition and catalog semantics

- Reconstructed keys: 504; catalog patterns: 504; occurrences: 893.
- Missing source-candidate bindings: 0; key splits: 0; heterogeneous patterns: 0; QBI/occurrence reference disagreements: 0.
- Pattern IDs reproduce the byte-sorted canonical key order exactly from `PAT-C3A2-0001` through `PAT-C3A2-0504`.
- Every pattern's canonical key, requirement list, response product, cognitive action, definition, defining features, source-pattern identities and candidate references agree with its occurrences.
- Recomputed raw occurrence and distinct-paper counts for all 504 patterns; mismatches: 0.
- Named example references: 857; named boundary/counterexample references: 504; dangling references: 0; examples outside their pattern: 0; boundaries inside their pattern: 0.
- Reviewed all 341 single-occurrence patterns. Every singleton has a resolved occurrence, a source-backed official example, a boundary/counterexample and exact candidate lineage.
- Every pattern remains `PROVISIONAL_PRE_EQUIVALENCE` / `NEEDS_REVIEW`, with `PENDING` equivalence state and null equivalence-group count.

No final equivalence, `ESTABLISHED`/final `SINGLETON`, predictive forecast, split/holdout, glossary reconciliation, traceability integration, lesson, translation, app or Stage 3 claim was found.

## Scope-risk and sensitive boundaries

The complete scope-risk population was reviewed: 12 `PARTIAL`, three `NEEDS_REVIEW`, zero `SUPPORTING`, and zero `OUT_OF_SCOPE` atomic units. Mixed-scope patterns: 0. All 34 B21 context marking rows remain non-scoring.

- Fetch/decode/execute, register and bus population: 37 units under the full selected 4.1 requirement boundary; their requirement, response and action keys remain separate.
- Bitmap arithmetic and bit-depth population: 32 units; arithmetic, representation and quality/effect requirement boundaries remain separate.
- Checksum: four units preserve `REQ-6.2-03-04`; no definition promotes checksum to an absolute guarantee.
- Check digit: zero accepted occurrences for `REQ-6.2-02-07`; no direct coverage is inferred.
- Syllabus 8.3 continuation: all 50 units were reviewed under the corrected key partition.
- B24 IDE partial scope: `AU-9618_w24_qp_11-q4-pd-pi` remains `PARTIAL`; no quarantined presentation feature is promoted.

The aggregate conflict report carries the frozen B25 documentation typo `VC-B25-0021` and identifies `VC-B25-0041` as the controlling variant-ledger/QA identity. This remains documentation-only and non-gating.

## QP/MS source verification

Original QP/MS PDFs under `Past_Papers` were inspected. All 857 unique units named as official examples or boundaries resolved to non-empty cited QP and MS pages across 634 distinct source pages. Missing PDFs/pages: 0; locator failures: 0. `AU-9618_s21_qp_12-q4-pa` contains a long excerpt spanning QP pages 6-7; both pages and MS page 6 were rendered and inspected, confirming the target trace table and four-mark row.

The deterministic sample used seed `P1-S2-C3A-A3-v2`. Two units per paper were selected by sorting SHA256 of `seed + "|" + assessment_unit_id`. Every cited QP page contained the target prompt and displayed mark, and every cited MS page contained the matching official row. Six continuation pages whose extracted text omitted the outer question number were rendered and inspected directly; all six passed. The full 60-unit sample passed:

| Paper | Sampled assessment units | QP/MS result |
|---|---|---|
| 9618_s21_qp_11 | `AU-9618_s21_qp_11-q6-pa`; `AU-9618_s21_qp_11-q4-pc-pii` | PASS |
| 9618_s21_qp_12 | `AU-9618_s21_qp_12-q7-pa`; `AU-9618_s21_qp_12-q5-pd` | PASS |
| 9618_s21_qp_13 | `AU-9618_s21_qp_13-q5-pa`; `AU-9618_s21_qp_13-q4-pd` | PASS |
| 9618_s22_qp_11 | `AU-9618_s22_qp_11-q6-pai`; `AU-9618_s22_qp_11-q1-pc` | PASS |
| 9618_s22_qp_12 | `AU-9618_s22_qp_12-q9-pa`; `AU-9618_s22_qp_12-q2-pc` | PASS |
| 9618_s22_qp_13 | `AU-9618_s22_qp_13-q6-pbi`; `AU-9618_s22_qp_13-q5-pbii` | PASS |
| 9618_s23_qp_11 | `AU-9618_s23_qp_11-q3-pd-pv`; `AU-9618_s23_qp_11-q3-pb` | PASS |
| 9618_s23_qp_12 | `AU-9618_s23_qp_12-q6-pa`; `AU-9618_s23_qp_12-q3-pa` | PASS |
| 9618_s23_qp_13 | `AU-9618_s23_qp_13-q4-pc`; `AU-9618_s23_qp_13-q2-pa` | PASS |
| 9618_s24_qp_11 | `AU-9618_s24_qp_11-q6-pb`; `AU-9618_s24_qp_11-q3-pa` | PASS |
| 9618_s24_qp_12 | `AU-9618_s24_qp_12-q7-pb`; `AU-9618_s24_qp_12-q1-pa` | PASS |
| 9618_s24_qp_13 | `AU-9618_s24_qp_13-q3-pb`; `AU-9618_s24_qp_13-q7-pe-pi` | PASS |
| 9618_s25_qp_11 | `AU-9618_s25_qp_11-q5-pb`; `AU-9618_s25_qp_11-q6-pa-pii` | PASS |
| 9618_s25_qp_12 | `AU-9618_s25_qp_12-q7-pb-pi`; `AU-9618_s25_qp_12-q4-pa` | PASS |
| 9618_s25_qp_13 | `AU-9618_s25_qp_13-q6-pb`; `AU-9618_s25_qp_13-q5-pa-pii` | PASS |
| 9618_w21_qp_11 | `AU-9618_w21_qp_11-q4-pa`; `AU-9618_w21_qp_11-q4-pb-pi` | PASS |
| 9618_w21_qp_12 | `AU-9618_w21_qp_12-q7-pb`; `AU-9618_w21_qp_12-q4-pe-pi` | PASS |
| 9618_w21_qp_13 | `AU-9618_w21_qp_13-q2-pa`; `AU-9618_w21_qp_13-q7-pb-pi` | PASS |
| 9618_w22_qp_11 | `AU-9618_w22_qp_11-q5-pbii`; `AU-9618_w22_qp_11-q1-pdi` | PASS |
| 9618_w22_qp_12 | `AU-9618_w22_qp_12-q2-pai`; `AU-9618_w22_qp_12-q6-pbi` | PASS |
| 9618_w22_qp_13 | `AU-9618_w22_qp_13-q10-pbii`; `AU-9618_w22_qp_13-q3` | PASS |
| 9618_w23_qp_11 | `AU-9618_w23_qp_11-q8-pb-pii`; `AU-9618_w23_qp_11-q5-pc-pii` | PASS |
| 9618_w23_qp_12 | `AU-9618_w23_qp_12-q6-pc`; `AU-9618_w23_qp_12-q2-pc` | PASS |
| 9618_w23_qp_13 | `AU-9618_w23_qp_13-q9-pb`; `AU-9618_w23_qp_13-q1-pb` | PASS |
| 9618_w24_qp_11 | `AU-9618_w24_qp_11-q6`; `AU-9618_w24_qp_11-q3-pd-pi` | PASS |
| 9618_w24_qp_12 | `AU-9618_w24_qp_12-q5-pb-pii`; `AU-9618_w24_qp_12-q8-pa` | PASS |
| 9618_w24_qp_13 | `AU-9618_w24_qp_13-q6-pb-pii`; `AU-9618_w24_qp_13-q8-pc` | PASS |
| 9618_w25_qp_11 | `AU-9618_w25_qp_11-q4-pb`; `AU-9618_w25_qp_11-q8-pb` | PASS |
| 9618_w25_qp_12 | `AU-9618_w25_qp_12-q3-pa-pi`; `AU-9618_w25_qp_12-q10-pc` | PASS |
| 9618_w25_qp_13 | `AU-9618_w25_qp_13-q1-pb`; `AU-9618_w25_qp_13-q2-pa` | PASS |

## Reviewer conclusion and stop

`aggregate-v2` passes the fresh independent A3 closure retest with zero open Critical, Major or Minor findings. This report does not accept the C3a gate and does not open C3b; A0 must rehash this frozen handoff and make the gate decision.
