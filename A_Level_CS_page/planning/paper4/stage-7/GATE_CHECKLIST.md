# Stage 7 gate checklist

## S7-0 entry

- [ ] Stage 6 release manifest, detached verification and Stage 7 handoff are PASS and hash-locked.
- [ ] Stage 6 source storyboards are final, not candidate/pending artifacts.
- [ ] Stage 0–6 hashes, 58 briefs/174 scenarios/331 event entries and write ownership are frozen.

## Per-batch specification gate

- [ ] Every event has exact Stage 5 trace/event join and unique owner.
- [ ] Before/delta/after state, code lines, invariant/criterion, pointers/call frames and output delta agree.
- [ ] All seven controls have accessible semantics; replay, Previous, Reset and change-input are deterministic.
- [ ] VI/EN caption, alt, prediction and feedback IDs are bijective.
- [ ] Reduced-motion, keyboard/focus, non-colour, mobile order and static fallback are specified.
- [ ] `Stage7_specified` is not confused with `Stage8_UI_verified`.

## Aggregate release gate

- [ ] 58 visual briefs, 174 scenarios and 331 proposed events reconcile exactly.
- [ ] No duplicate/missing/unexpected Stage 5 trace event IDs.
- [ ] A8 clean QA passes after final hashes.
- [ ] Lead signs gate review, manifest, detached verifier and Stage 8 handoff.
- [ ] Stage 8 remains blocked until the signed release.
