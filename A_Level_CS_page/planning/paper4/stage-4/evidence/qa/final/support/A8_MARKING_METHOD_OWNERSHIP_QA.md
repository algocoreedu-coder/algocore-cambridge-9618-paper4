# A8 marking-method ownership QA

Status: **PASS_RECOMMENDED**.

The registry contains exactly **182** cross-batch duplicate resolutions across 32 parts and 19 candidate-owner families. The structural layer is sound: all 2,236 atoms have one decision and one canonical top-level card owner; raw P0/B1-B8 references reproduce every candidate list; every owner is a Stage 2 assessed candidate; every `MARKING_MAP` method sequence exactly matches the selected card; and all 2,236 MS plus 672 QP locators remain unchanged.

Independent semantic review now accepts **182/182** resolutions. The rebuilt canonical layer retains the part-order rule for 174 atoms and applies the eight reviewed atom-level semantic overrides below.

| Atom | Reviewed owner | Directly assessed operation |
|---|---|---|
| `MP-9618-W24-41-2-C-II-01` | `OOP_INSTANTIATE` | Declare/use the Fence object container |
| `MP-9618-W24-41-2-C-II-03` | `OOP_INSTANTIATE` | Construct each Fence and store it |
| `MP-9618-W24-43-2-C-II-01` | `OOP_INSTANTIATE` | Duplicate-paper Fence container criterion |
| `MP-9618-W24-43-2-C-II-03` | `OOP_INSTANTIATE` | Duplicate-paper Fence construction criterion |
| `MP-9618-S24-42-2-B-I-01` | `OOP_CLASS` | Class header and end |
| `9618_s25_41_3(c)(i).mp.01` | `OOP_CLASS` | Tree class and constructor headers |
| `9618_s25_43_3(b)(i).mp.01` | `OOP_CLASS` | LinkedList class and constructor headers |
| `9618_w25_43_1(b)(i).mp.04` | `OOP_INSTANTIATE` | Construct/store a distinct BoardObject in every cell |

Finding **A8-OWN-REQ-001** is closed. The ownership registry, cards and marking map agree on all eight overrides; the other 174 cross-batch decisions remain unchanged.

Finding **A8-OWN-REQ-002** is closed. `MARKING_MAP.authority_boundary` now states that QP/MS locators and source values are official, while populated method joins are AlgoCore coordination guidance that does not create or reallocate marks.

Validator: `evidence/qa/final/support/validate_marking_method_ownership.py`. It passes **17/17** structural, Stage 2, semantic-owner, card-step, locator and authority checks on the current canonical hashes.
