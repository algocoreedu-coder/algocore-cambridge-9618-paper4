# A8 independent planning preflight — Stage 6

**Decision: REWORK_REQUIRED**

Review scope: `stage-6/BATCH_PLAN.json`, `WORK_ORDERS.md`, `GATE_CHECKLIST.md`, `PLANNING_REVIEW.md`, with cross-checks against the Stage 6 master plan/status/README, locked Stage 5 release `paper4-2026-s5-v1`, canonical Stage 3 lesson inventory, and the Stage 0 learning-page contract. This is a planning-only, read-only review of Stage 0–5. No Stage 6 content or implementation was executed.

## Upstream facts independently verified

- Stage 5 is `EXECUTION_VERIFIED`; `RELEASE_VERIFICATION.json` records `PASS` for manifest SHA-256 `02b4c7c70059de381290e6682d310c469c5d19b8b8dd6e10e5cd6a4e3d57c3cc`.
- Stage 5 release denominators are internally consistent: 58 patterns; 719 solution obligations; 60 variants/167 cases; 154 errors/308 phases; 2236 marking atoms; 58 worked-example specs/210 microcases/261 evidence items; 58 visual briefs/174 scenarios/331 events; 25 source issues/62 occurrences. The frozen obligation inventory contains 4881 ID rows when parent and leaf obligation categories are all included.
- Canonical Stage 3 `LESSON_PACKAGES.json` contains 13 packages, 26 lessons, 58 pattern destinations, 107 assessment requirements and 37 planned assessment destinations.
- Scope is consistent with Stage 0: Cambridge 9618 Paper 4, target 2026, Python console, full VI/EN, with Stage 0–5 read-only.
- The plan correctly preserves official-source versus AlgoCore authority, marking/error joins, A8 independence and downstream Stage 7/8 boundaries.

## Required findings

### S6-PF-001 — Batch package identities do not resolve to the canonical Stage 3 package IDs

**Observed:** `BATCH_PLAN.json:9-14` assigns aliases such as `data-models`, `procedural-design`, `validation-rules`, `testing`, `queues-lists`, `hashing`, and `object-oriented`. These are not the canonical `package_id` values in Stage 3. The canonical set is:

1. `ac-9618-p4-2026-python.package.foundations`
2. `ac-9618-p4-2026-python.package.text`
3. `ac-9618-p4-2026-python.package.search-sort`
4. `ac-9618-p4-2026-python.package.stack`
5. `ac-9618-p4-2026-python.package.queue`
6. `ac-9618-p4-2026-python.package.linked-list`
7. `ac-9618-p4-2026-python.package.recursion`
8. `ac-9618-p4-2026-python.package.tree`
9. `ac-9618-p4-2026-python.package.dictionary`
10. `ac-9618-p4-2026-python.package.oop`
11. `ac-9618-p4-2026-python.package.files`
12. `ac-9618-p4-2026-python.package.support`
13. `ac-9618-p4-2026-python.package.integration`

The current aliases combine canonical units (`queues-lists`) and leave `recursion` and `support` without an explicit canonical identity. Consequently, `GATE_CHECKLIST.md:25` cannot prove that all Stage 3 packages and lessons are covered.

**Required correction:** use exact canonical package IDs in the batch plan, or add a frozen bijective mapping from every alias to one or more canonical package IDs and all 26 canonical lesson IDs. The union must equal the canonical Stage 3 package and lesson sets exactly, with no missing, duplicate primary owner or unexpected ID.

### S6-PF-002 — The wave model has two incompatible meanings

**Observed:**

- `BATCH_PLAN.json:9-15` and `PLANNING_REVIEW.md:7` define S6-A through S6-F as package batches and S6-G as final QA.
- `README.md:22-26` and `STAGE6_MASTER_PLAN.md:22-40` define S6-A through S6-E as sequential content layers: skeleton, methods/marks, retrieval, visuals, then QA/release.
- `STATUS.json:14-22` follows the A–G model.
- `STAGE6_MASTER_PLAN.md:24` assigns A6 to navigation/prerequisite/ID review, while `WORK_ORDERS.md:33-35` defines A6 as the visual/event storyboard author.

An artifact could therefore be called “S6-B complete” while meaning either a package skeleton batch or method/mark composition. Dependencies and gate ownership are not deterministic.

**Required correction:** choose one canonical wave model and make `BATCH_PLAN`, `WORK_ORDERS`, `GATE_CHECKLIST`, `PLANNING_REVIEW`, `MASTER_PLAN`, `README`, and `STATUS` use the same wave IDs, purpose, package/lesson ownership, agent ownership, dependencies and deliverables. If package batches remain A–F, each package must explicitly pass every content layer before S6-G; if content phases remain A–E, package parallelism must be a separate field rather than reusing the same wave IDs.

### S6-PF-003 — No machine-checkable Stage 6 contract can prove exact coverage or dispositions

**Observed:** `STAGE6_MASTER_PLAN.md:20` says S6-0 will create a package inventory, denominator registry and write ownership, but `WORK_ORDERS.md:45-47` does not require these artifacts, a Stage 6 schema contract, a coverage matrix, an ownership registry, or a disposition register. The common artifact fields in `WORK_ORDERS.md:5` do not define record shapes, allowed statuses, foreign-key rules, uniqueness, or exact-set validation.

`GATE_CHECKLIST.md:26` permits an explicit Lead-approved disposition, but there is no disposition schema defining authority, reason, affected obligation IDs, evidence, expiry/recheck, approval or restrictions. There is also no rule preventing one disposition from silently removing an executable/source/marking obligation.

**Required correction:** add to the required S6-0 artifact set and define schemas for at least:

- immutable input lock with upstream paths and hashes;
- canonical package/lesson/block inventory and ownership;
- frozen Stage 6 obligation inventory seeded from upstream stable IDs;
- coverage matrix using exact `expected_ids`, evidence IDs and disposition IDs;
- disposition register with scope, authority, rationale, evidence, Lead approval and independent recheck;
- bilingual content-ID/version joins and ten-block status records;
- allowed status transitions and per-wave gate records.

Missing, duplicate-owner and unexpected IDs must fail the gate. A disposition must remain inside its denominator and may not waive executable evidence, official authority, bilingual parity or a mandatory Stage 0 block without a source-backed inapplicability decision.

### S6-PF-004 — Aggregate acceptance does not freeze all required upstream ID universes

**Observed:** `GATE_CHECKLIST.md:25-26` says “all” Stage 3 packages/lessons and Stage 5 denominators, but does not state the exact sets or totals. `STAGE6_MASTER_PLAN.md:42-44` lists Stage 5 totals but omits the 4881-row exact-ID union and does not lock Stage 3's 58 pattern destinations, 107 assessment requirements and 37 planned assessment destinations. Stage 0 Definition of Done requires every mandatory objective to have knowledge, example, assessment and evidence; a 13-package/26-lesson shell alone does not prove that requirement.

**Required correction:** freeze and gate the following exact identity sets:

- Stage 3: 13 packages, 26 lessons, 58 pattern destinations, 107 assessment requirements and 37 planned assessment destinations;
- Stage 5: the complete 4881-row obligation identity set, with the published category totals retained as reconciliation checks;
- each required ten-block record for every canonical lesson/package policy selected by the Lead.

The aggregate gate must compare set equality, not percentages or prose totals. Each ID must resolve to a specific lesson/block evidence row or a schema-valid disposition. Parent records and leaf obligations must remain distinguishable so that the 4881 total is not double-counted as 4881 independent teaching claims.

### S6-PF-005 — The Action View/storyboard gate is weaker than the Stage 0 contract

**Observed:** `WORK_ORDERS.md:35`, `STAGE6_MASTER_PLAN.md:36`, and `GATE_CHECKLIST.md:21` cover before/delta/after, invariant, prediction, reset and edge/failure behavior. They do not require the complete control and replay contract at `stage-0/LEARNING_PAGE_CONTRACT.md:20,50`: `Predict`, `Next`, `Previous`, `Play`, `Pause`, `Reset`, and change-input behavior; exact Previous/Reset state restoration; Play not skipping events; and input changes resetting to the matching trace. The Stage 0 contract also requires the diagram, trace, code highlight, variables and output to share the same state engine.

**Required correction:** extend the storyboard schema, A6 work order and per-lesson gate to require all applicable Stage 0 controls and state semantics, including a reasoned `not_applicable` disposition only for static concepts. Require canonical event IDs, before/delta/after state, state-engine/trace reference, code lines, invariant, prediction/feedback, forward/back replay, reset, input-change reset, boundary/failure branch, reduced-motion behavior and static fallback. These are Stage 6 specifications for Stage 7; they are not claims that the UI already exists.

### S6-PF-006 — Final QA, promotion and release/hash close order is under-specified

**Observed:** `WORK_ORDERS.md:47` names only `A8_FINAL_QA.json`, `GATE_REVIEW.json`, `RELEASE_MANIFEST.json`, and `STAGE7_HANDOFF.json`. `GATE_CHECKLIST.md:28-31` says A8 runs after final hashes and that manifest/handoff are hash-locked, but does not define how hashes become final, how post-QA edits invalidate review, whether the manifest excludes itself, or whether the handoff is inside/outside the manifest. There is no candidate QA artifact or detached manifest verification record.

**Required correction:** define a non-recursive close order, for example: freeze candidate artifacts and hashes; A8 candidate QA; Lead closes/promotes only Stage 6-owned records; recompute affected hashes; A8 final hash/status recheck; Lead final gate; create manifest last excluding itself and its detached verifier; compute detached digest and run release verification; create/hash the Stage 7 handoff against the locked release identity. Any edit after its relevant QA/hash step must invalidate and repeat downstream steps. Preserve separate candidate and final A8 bytes so the audit is reproducible.

### S6-PF-007 — Planning approval status is premature relative to this independent preflight

**Observed:** `PLANNING_REVIEW.md:3` already states `PASS — PLANNING_READY`, while `STATUS.json` says S6-0 is in progress, its current gate is review-pending, and `a8_status` is `NOT_STARTED`. This A8 preflight finds required issues, so the Lead PASS is not currently supportable.

**Required correction:** set planning/gate status to `REWORK` or `INDEPENDENT_REVIEW_PENDING` until S6-PF-001 through S6-PF-006 are corrected and independently rechecked. Then update `PLANNING_REVIEW`, `BATCH_PLAN`, `STATUS`, and README atomically to one approved planning state. Do not start S6-A production while the S6-0 planning gate has required findings.

## Recheck acceptance

A8 can recommend PASS when all seven findings are closed and a clean validator demonstrates:

1. exact canonical package and lesson set equality;
2. one wave model across all planning files;
3. schema-valid ownership, coverage and dispositions;
4. exact Stage 3 and Stage 5 identity-set reconciliation;
5. full Stage 0 ten-block, bilingual and Action View contract coverage;
6. deterministic candidate/final QA and release close order; and
7. synchronized planning status with no execution claim beyond completed evidence.

## Reviewed file hashes

| File | SHA-256 |
|---|---|
| `stage-6/BATCH_PLAN.json` | `50d883e3df276720a83cab47c6d8dd9e4da597d139e89e46a34ef110b8d15711` |
| `stage-6/WORK_ORDERS.md` | `5ea07a1f4f948f1af1c0379c6c8127f2660ce4bd86a5d243edf368d40dda5f5e` |
| `stage-6/GATE_CHECKLIST.md` | `906df61ef1d3b703305406742606184cd408c743f61152cb27de4c1c0949985a` |
| `stage-6/PLANNING_REVIEW.md` | `ad510b1a71aea777ccfcb24ae84d86e33f701ce78546a9a4b4d0ff3e22613e8f` |
| `stage-6/STAGE6_MASTER_PLAN.md` | `9a8d7d37fdf9c3a39bdbbe65158a0dbe45afa93a6f8874881ef68bdb4edb2dcf` |
| `stage-6/README.md` | `b1773d749347788ab1a0194d2f0540be4979ab32d0ed5d7ad9522810b2204f6c` |
| `stage-6/STATUS.json` | `10ea1c0326e9681251e8909b95382e977e7a33979392929cecbb6202284448c7` |
| `stage-5/RELEASE_MANIFEST.json` | `02b4c7c70059de381290e6682d310c469c5d19b8b8dd6e10e5cd6a4e3d57c3cc` |
| `stage-5/RELEASE_VERIFICATION.json` | `20aaff9356c6a1d21ac478db565db512aa8ce742a505c8d05438bf0ba5b23462` |
| `stage-5/STATUS.json` | `87ac976d591be6ec30344aa31dd3cb550b74226f4852ec90ca7bd0f9e32359c5` |
| `stage-3/LESSON_PACKAGES.json` | `01710c1a99028228bf5472ddf9457a4ac9c5df64ebd576785139d23d6fca0ad2` |
| `stage-0/LEARNING_PAGE_CONTRACT.md` | `2e592ea3a8bad0ad852c51a08c30b85bc1a3601429d1441da29cc3644ec4c547` |
| `stage-0/DEFINITION_OF_DONE.md` | `0cbe5d17e52856af6ee3e4bf0f4972942cd65dfadf0c743368ff5bd515c388e1` |

