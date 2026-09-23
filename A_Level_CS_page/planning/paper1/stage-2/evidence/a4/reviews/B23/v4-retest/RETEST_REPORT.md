# Independent A4 final closure retest — B23-v4

Review ID: `P1-S2-A4-RETEST-B23-v4`  
Reviewer: independent A4 marking/pattern reviewer, distinct from the B23-v4 correction owner  
Date: 22/09/2026  
Decision: **PASS**

## Decision basis

All three original Major findings are `CLOSED`, with zero new Critical, Major or Minor findings. The one finding left open by the v3 retest, `B23-A4-V2-MAJ-003`, is corrected at `9618_w23_qp_11-q8-pb-piii`. The marking row now records one mark for one acceptable response and makes `Indirect (addressing)` and `Relative (addressing)` explicit alternatives. Its linked pattern occurrence preserves the same OR boundary and no longer implies one mark for each alternative.

The official QP page asks the candidate to identify **one other** addressing mode, provides one response area and displays `[1]`. The official MS page states `1 mark for` and lists `Indirect (addressing)` and `Relative (addressing)` under the single-mark row. The v4 normalization agrees with both source pages.

## Integrity and bounded delta

- The issued work order rehashes to `abc34b4b70fe620261a03b9b95d785c0605c3a43358ddf7ba21ef4942aafabcf`; the adjacent issued manifest rehashes to `5a5d321dd0de7a091bb7424e62968f616c458608532dc49ede586dd3d2663aa5`. All nine issued input pins match their declared byte counts and SHA256 values.
- All nine B23-v4 output-manifest pins, the handoff manifest pin and all nine handoff content pins match. The correction work order, correction dispatch manifest and all four correction inputs also rehash exactly.
- The v3-to-v4 content delta is limited to one row in `MARKING_EVIDENCE_MAP.jsonl` and one linked occurrence in `PATTERN_CANDIDATES.jsonl`, both for `9618_w23_qp_11-q8-pb-piii`. Atomic, container, unresolved and variant files are byte-identical to v3.
- The A0 C2 validator returns `PASS` for B23-v4. Populations remain 178 atomic units, 74 containers, 178 scoring marking rows, 28 unresolved context-only records and 450 marks. Each of the six papers totals 75.
- The packet contains 178 pattern occurrences across 134 proposed pattern IDs and 36 variant suggestions.

## Prior-finding closure and A3 stability

`B23-A4-V2-MAJ-001` remains closed because the four layout-response targets are in the byte-identical atomic map and retain the independently retested classifications: two `MATCHED_ASSOCIATIONS/CLASSIFY_AND_MATCH`, one `STRUCTURED_TABLE/APPLY` and one `CLOZE_SEQUENCE/APPLY_SEQUENCE`.

`B23-A4-V2-MAJ-002` remains closed because the three SQL targets are in the same byte-identical atomic map and retain `CODE/CONSTRUCT`. No v4 semantic delta touches those targets or their previously retested source evidence.

Across all 178 atomic rows, B23-v4 has zero differences from the A3-accepted B23-v2 baseline in scope status, primary/supporting requirement IDs, stimulus tags, context dependencies, observed command word, command provenance, authority requirements or topic boundary.

## Review boundary

This PASS is an independent A4 closure retest. It does not accept B23, aggregate C2, open downstream work or replace the separate A9 and A0 gates. The reviewer did not edit the author packet. The five review outputs are frozen after handoff.
