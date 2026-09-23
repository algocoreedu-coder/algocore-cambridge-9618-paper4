# Stage 2 C3b equivalence-v2 — independent A9 retest

Status: **PASS**  
Work order: `P1-S2-A9-RETEST-EQV-v2`  
Candidate: `equivalence-v2`

## Decision

The correction closes `A9-C3B-003`. The six omitted source-confirmed edges are now `PARALLEL_EQUIVALENT`; the four validation-versus-verification guards remain `RELATED_NOT_EQUIVALENT`. No Critical, Major, or Minor finding remains open.

## Evidence completed

- Rehashed all 217 issued inputs: 217 PASS, zero missing/drifted files.
- Re-ran the frozen generator: exact projection SHA256 `f1b3867f9a4335d296b205edbaafa09d063bb855a3ad97eb7990f871a4bd25cf`.
- Independently rebuilt the all-pairs universe from the 893 accepted assessment units: 398,278 unordered pairs, 36,416 candidates, 361,862 complement pairs, all eight channel counts and the overlap histogram reproduced. A separate pair engine compared the complete 36,416-row projection field-for-field with the frozen projection.
- Parsed every candidate and relation. Pair IDs are canonical and unique; candidate/relation sets are identical; there are zero reversed, dangling, duplicate, or unresolved rows.
- Source-reviewed all 72 positive relations using both QP and MS locators and the equivalence dimensions. Fresh extraction covered 107 unique official PDF pages; all locators matched accepted units and all pages were in range and non-empty.
- Rebuilt the positive graph: 893 nodes in exactly 824 components (758 singletons, 63 pairs, three triads). Published groups and split guards match the rebuild. No negative edge occurs inside a positive component and there are zero contradictions.
- Compared v1/v2 independently: exactly six relations changed, all from `RELATED_NOT_EQUIVALENT` to `PARALLEL_EQUIVALENT`; every other relation is stable.
- Rechecked all six positive regressions and four negative guards against QP/MS. The negative guards distinguish data validation from data verification even though their coarse structural dimensions match.
- Reproduced and source-reviewed all 586 deterministic complement samples. Fresh extraction covered 563 unique official PDF pages; ranks, strata, metrics, and page text hashes match; zero false negatives were observed.
- Verified the exact twelve-file author packet, output/handoff closure, input copy, QA statements, contradiction report, and Stage 2 scope boundary.

## Counts

| Measure | Result |
|---|---:|
| Eligible nodes | 893 |
| Complete unordered pairs | 398,278 |
| Candidate/relation rows | 36,416 |
| Complement pairs | 361,862 |
| Positive relations | 72 |
| Duplicate / parallel | 12 / 60 |
| Unresolved / contradictions | 0 / 0 |
| Components | 824 |
| Complement samples reviewed | 586 |
| Observed complement false negatives | 0 |

The packet is suitable for A0's C3b acceptance decision. A9 has not edited the candidate, accepted the gate, updated trackers, or started C3c/downstream work.
