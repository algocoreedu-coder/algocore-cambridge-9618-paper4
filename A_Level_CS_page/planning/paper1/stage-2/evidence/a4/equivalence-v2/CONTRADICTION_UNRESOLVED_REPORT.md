# C3b equivalence-v2 contradiction and unresolved report

- Eligible assessment units: 893
- Candidate relations reviewed: 36416
- Positive relations: 72
- Unresolved relations: 0
- Positive-component contradictions: 0
- Complement sample false negatives: 0
- A9-C3B-003 required positive assertions passed: 6/6
- Required negative guard assertions passed: 4/4

All candidates received an author disposition using the exact QP and MS locators carried by the accepted C3a index. Positive groups are built only from reviewed positive relations. Unresolved edges, if any, are carried into quarantined split-guard components.

## Disposition counts

- DISTINCT: 33942
- DUPLICATE: 12
- PARALLEL_EQUIVALENT: 60
- RELATED_NOT_EQUIVALENT: 2402

## v1 to v2 delta

- Changed relations: 6 (all six source-confirmed additions)
- Positive edges: 66 -> 72
- Positive groups: 827 -> 824
- Explanation: Six A9 source-confirmed PARALLEL_EQUIVALENT edges replace six RELATED_NOT_EQUIVALENT dispositions. They merge one pair plus one singleton into a three-member component in each of three cases, reducing the component count by three. Candidate, complement and all other relation counts remain unchanged.

## Result

PASS: no graph contradiction, dangling unit, multi-group membership, or observed complement false negative.
