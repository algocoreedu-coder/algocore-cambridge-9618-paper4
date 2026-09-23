# A8 independent QA — P0 Stack pilot

**Recommendation: PASS_RECOMMENDED.** This review is against author rework round 2 and the hashes recorded in `A8_PILOT_QA.json`. All independent structural, source, method, authority and boundary checks pass.

## What passed

- Exact pattern set: `STACK_SETUP`, `STACK_PUSH`, `STACK_POP`, `STACK_PAIR`, `STACK_REDUCE`.
- Exact Stage 2 ownership: 27 part-pattern relations, 25 unique assessed parts and 91 official atom ownership relations. Each official source reference matches the current marking submission for QP/MS locator, criterion, award semantics, condition, alternatives, dependency, value and group metadata.
- Five cards, 14 error rows, five solution designs, five example specs and five visual briefs have the required joins and VI/EN fields.
- Both top-pointer conventions preserve their correct empty/full predicates and Push/Pop order.
- `STACK_PAIR` now carries the resolved four-case decision: both successes commit; exactly one success rolls back to its origin; both-empty performs no restore, no mutation and no sentinel Push. The both-empty adaptation remains `AlgoCore_inference`.
- `STACK_REDUCE` preserves `total_before operator next_number`, consumes complete operator-number pairs and terminates at empty; extrema initialise from the first live value.
- The stale S2/S3 hashes were replaced. The former layout/code-fidelity item is no longer a source issue, and all seven `9618_s25_42_1(e)` one-mark atoms match the live S3 resubmission.
- Solution designs remain pending Stage 5 execution verification. Visuals remain pending Stage 5 trace and Stage 7 storyboard. No artifact claims executable code, passing tests, certified traces or verified runtime output.

## Closed finding

### A8-P0-VIS-001 — all five visual case triples are generic

The first submission repeated one generic `normal_case`, `boundary_case` and `failure_case` template in all five rows. Rework round 2 replaces it with five concrete, pattern-specific triples.

Affected IDs:

- `p0.stack.visual.stack-setup`
- `p0.stack.visual.stack-push`
- `p0.stack.visual.stack-pop`
- `p0.stack.visual.stack-pair`
- `p0.stack.visual.stack-reduce`

The corrected fields now cover:

- Setup: compare the two empty conventions; include capacity 1 and cell-initialisation boundaries; demonstrate mixed-convention/capacity-index failure.
- Push: successful transitions under both conventions; one-free-slot/full boundaries; full non-mutation, wrong order and wrong result contract.
- Pop: successful transitions with distinct items; one-item/empty boundaries; exact sentinel, unchanged empty state and wrong read index.
- Pair: both-live commit, both one-sided rollbacks, and both-empty no-restore/no-mutation/no-sentinel with the inference boundary.
- Reduce: non-commutative left fold and extrema scan; single value, one complete pair and all-negative boundaries; reversed operands, sentinel-as-data and malformed-input-outside-source-contract distinctions.

All ten bilingual fields preserve parity. Visual status remains pending and the briefs add no traces or runtime claims. `A8-P0-VIS-001` is closed against `VISUAL_BRIEFS.json` SHA-256 `ca38a8d009a3b0cc3f51f8cdc051d55a3a6071383fe845345e71e6b22a2614cd`.

## Independent validation

Run:

```powershell
$env:PYTHONIOENCODING='utf-8'
& 'C:/Users/Nguyen/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe' 'A_Level_CS_page/planning/paper4/stage-4/evidence/qa/pilot/validate_pilot_independent.py'
```

Current result: **71/71 PASS; 0 FAIL**.

A8 recommends `PILOT_GATE=PASS` for these reviewed hashes. Final gate authority remains with Lead.
