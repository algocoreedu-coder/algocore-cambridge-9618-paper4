# B23 v4 correction disposition

Artifact state: `AUTHOR_CORRECTION_COMPLETE_PENDING_INDEPENDENT_RETEST`.

## Corrected in this candidate

- `B23-A4-V2-MAJ-003`: `9618_w23_qp_11-q8-pb-piii` now preserves a single one-mark response. `Indirect (addressing)` and `Relative (addressing)` are explicit alternatives; they are not cumulative answers.
- The row remains source-supported `OFFICIAL_EXACT` and `POINT_BASED`, with precision limited to one accepted response for one mark.
- Linked occurrence `POCC-B23-9618_w23_qp_11-q8-pb-piii` now states the same one-mark OR-alternative boundary in `marking_behaviour_summary`.

## Preserved from v3

- All four layout-response corrections for `B23-A4-V2-MAJ-001` remain unchanged.
- All three SQL `CODE/CONSTRUCT` corrections for `B23-A4-V2-MAJ-002` remain unchanged.
- Atomic, container, unresolved and variant files are byte-identical to v3. Only the cited marking row and its linked pattern occurrence changed semantically.
- A3-accepted scope, requirement, context and command fields are byte-stable because `ATOMIC_ITEM_MAP.jsonl` is unchanged.

## Review boundary

A different A4 reviewer must independently rehash and final-retest v4. A9 risk/final review and A0 acceptance remain separate. This correction owner does not review, accept or aggregate B23.
