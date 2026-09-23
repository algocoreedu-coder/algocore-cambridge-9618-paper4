# B24 v3 correction disposition

Artifact state: `AUTHOR_CORRECTION_COMPLETE_PENDING_INDEPENDENT_RETEST`.

## Corrected in this candidate

- `B24-A4-R2-MAJ-001`: `9618_w24_qp_13-q4-pa` now uses `ROW_ATOMIC`. Each foreign-key and referenced-table pair remains one indivisible scoring condition.
- `PC-B24-143` now carries `ROW_ATOMIC` in `marking_behaviour_summary`.

## Preserved from v2

- All 15 response-demand corrections for `B24-A4-R1-MAJ-001` remain unchanged.
- All four SQL targets remain `CODE` for `B24-A4-R1-MAJ-002`.
- Both sensor-use rows remain `ROW_ATOMIC` for `B24-A4-R1-MAJ-003`.
- Atomic, container, unresolved and variant files are byte-identical to v2. Only the cited marking row and its derived pattern row changed semantically.

## Review boundary

A different A4 reviewer must independently rehash and retest v3. A3 scope review, A9 risk/final review and A0 acceptance remain separate. This correction owner does not review, accept or aggregate B24.
