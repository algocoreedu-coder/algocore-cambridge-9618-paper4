# Gate checklist Stage 5

## Gate S5-0 — preflight

- [ ] Stage 4 release id, manifest hash and 25 locked files verify.
- [ ] Explicit variant-register hash and both Stage 1 source/facsimile manifest hashes verify; no upstream hash drift.
- [ ] Frozen obligation inventory contains the exact denominators in `BATCH_PLAN.json`; stable IDs are unique and all JSON-pointer/hash provenance resolves.
- [ ] `SOURCE_OCCURRENCE_OWNERSHIP.json` has exactly 62 rows, each issue-occurrence appears once, every row has one primary owner, secondary consumers and executable/documentary-facsimile/adjudication classification.
- [ ] Stage 4 final QA is PASS_RECOMMENDED; active findings are empty.
- [ ] Python 3 implementation/minor, OS, dependencies, run command and seed policy are recorded.
- [ ] Versioned harness lock is signed: runner/version, discovery and run commands, fresh-process/temp-directory policy, reset/cleared environment, encodings, stdout normalization, seed, per-test timeout, termination outcomes, dependencies and typed snapshot serializer.
- [ ] Batch-owned write paths, evidence schema, fixture authority, entry-point binding rule and event-trace/parity contract are locked.
- [ ] Every Stage 4 solution/example, variant, error and source-caveat ID is ingested exactly once.
- [ ] Stage 5 status is IN_PROGRESS only after Lead signs S5-0.

## Gate P0 — stack pilot

- [ ] Five stack patterns pass after signed S5-0: setup, push, pop, pair, reduce. `STACK_SETUP` has an executable factory/init entry point and returns a canonical snapshot; setup claims are not accepted from manual inspection.
- [ ] Both top-pointer conventions, capacity 1, empty/full and preservation cases run.
- [ ] `STACK_PAIR` tests all four required P0 cases: success/success commits both pops; success/empty restores the left pop exactly once; empty/success restores the right pop exactly once; empty/empty does not mutate either stack, restore anything or push a sentinel. Attribute each behavior to its located source contract where specified; the both-empty treatment is Lead-approved `AlgoCore_inference` / Stage 5 test policy because the MS does not specify it. Any authored message is labelled `AlgoCore_inference`, never a Cambridge literal.
- [ ] `STACK_REDUCE` tests a non-commutative left fold (`acc_before operator next`) and extrema initialized from the first live item, including an all-negative fixture. Malformed or initially empty inputs outside the source precondition are treated only under a separately labelled Stage 5 test-policy decision, never as a Cambridge requirement.
- [ ] Pair failure preservation compares canonical typed snapshots for both stacks, flags/results, storage, pointer and live range as required by the source contract. Reduction order has counterexample fixtures.
- [ ] Output/return types and exact source contract match their locators.
- [ ] Trace captures real event order, before/after state and invariant results.
- [ ] A5 reruns from clean state; A1 checks handoff; A8 reviews pilot schema and sample.
- [ ] Lead accepts or orders rework; no B1–B8 batch is accepted before P0 PASS.

## Gate for every batch

- [ ] Exact pattern set and all source constraints are present; no pattern/variant is silently removed.
- [ ] Candidate code is independently authored or adaptation is clearly labelled; no unverified source code is certified.
- [ ] Normal, boundary, counterexample and applicable source fixtures execute deterministically.
- [ ] All applicable variant IDs and source occurrence IDs map to one or more test IDs.
- [ ] Exact obligation IDs for solution, variant cases, worked-example microcases/evidence, marking atoms, error phases and visual scenario/events are present in coverage matrix; no missing/extra IDs.
- [ ] Every variant/source contract is bound to its exact entry point or adapter, representation and oracle; the fixture selects that binding explicitly.
- [ ] Every applicable error row maps separately to detection and repair assertion(s), or the exact phase has a reviewed disposition.
- [ ] Each pattern has at least one official source-anchor fixture; every method-changing variant has its own fixture or a Lead-reviewed disposition.
- [ ] Every marking atom applicable to the pattern retains its canonical owner/step join and maps to test assertion/evidence; no synthetic mark is assigned to an assertion.
- [ ] Output, return, state mutation, rejection preservation, termination and file side effects meet contract through canonical snapshots and the locked harness.
- [ ] Every event-driven visual brief has a run-based trace bundle covering all required scenarios/branches, with event/state/invariant fields. A visual brief may require multiple fixture traces.
- [ ] Traces record frozen/instrumented code hashes, execution-log hash and passing parity assertions; instrumentation is behavior-equivalent on locked parity fixtures.
- [ ] Runtime/command/stdout/stderr/exit code/termination outcome/elapsed time/hashes let another agent reproduce the run from clean state.
- [ ] Every no-code or non-executable exception has a schema-valid, Lead-approved disposition naming all obligation IDs and evidence hashes.
- [ ] A5 is independent from code author; A1 checks bilingual handoff; A8 finding status is clear.
- [ ] Lead reads report and samples source evidence; required findings closed before next dependency wave.

## Final aggregate gate

- [ ] 58/58 Stage 5-owned pattern verification records are `EXECUTION_VERIFIED`, each with implementation + run evidence or a schema-valid, Lead-approved pattern disposition.
- [ ] 60/60 variants and 167/167 variant cases have passing test coverage or an explicit Lead-reviewed disposition.
- [ ] 719/719 solution obligations (74 normal, 143 boundary, 108 counterexample, 394 source-fixture links / 368 unique source parts), 210/210 worked-example microcases and 261/261 evidence-capture items have passing evidence or approved dispositions.
- [ ] 2236/2236 marking atoms retain official locator/owner joins and map to test evidence or reviewed disposition; no assertion receives a synthetic mark value.
- [ ] 154/154 errors and 308/308 detection/repair phases have assertion evidence or approved phase-specific dispositions.
- [ ] 25/25 issue IDs and 62/62 owned source occurrences have applicable executable or documentary/facsimile/adjudication evidence; executable requirements are not waived by documentary disposition.
- [ ] 58/58 visual briefs, 174/174 scenarios and 331/331 proposed events have verified trace bundle coverage reproducing from frozen implementation and fixture hashes; report actual run-trace count without a fixed 58-trace assumption.
- [ ] Every applicable disposition is schema-valid, Lead-approved and included in the correct obligation denominator.
- [ ] All output format, source authority, holistic mark and stage-boundary checks pass.
- [ ] Stage 1–4 releases reverify and Stage 4 input hashes have not drifted.
- [ ] A8 final QA passes on release hashes; no required finding remains.
- [ ] Close order passes: candidate hashes → `A8_CANDIDATE_QA.json` → Lead pass 1 to Stage 5-owned records → refreshed hashes → `A8_FINAL_QA.json` hash/status recheck → Lead pass 2 and gate → release manifest → detached verifier record.
- [ ] `GATE_REVIEW=PASS`, manifest is locked, Stage 6/7/8 status is explicit.

A required criterion failure makes the affected batch `REWORK`; no aggregate percentage can offset it.
