# A7 planning review — Stage 6 / S6-0

Status: **REWORK — S6-0 is not ready to pass**.

Reviewer: **A7 — pedagogy, UX and accessibility**  
Review scope: Stage 6 planning documents against the immutable Stage 0 learning-page contract, Stage 3 package/lesson inventory and Stage 5 execution release.  
Boundary: this review does not modify or reinterpret Stage 0–5 evidence and does not claim that Stage 6 content or a production UI exists.

## Evidence reviewed

- `stage-6/README.md`
- `stage-6/STAGE6_MASTER_PLAN.md`
- `stage-6/WORK_ORDERS.md`
- `stage-6/BATCH_PLAN.json`
- `stage-6/GATE_CHECKLIST.md`
- `stage-6/PLANNING_REVIEW.md`
- `stage-6/STATUS.json`
- `stage-0/LEARNING_PAGE_CONTRACT.md`
- `stage-0/DEFINITION_OF_DONE.md`
- `stage-3/LESSON_PACKAGES.json` and `stage-3/README.md`
- `stage-5/STATUS.json`, `stage-5/SCHEMA_CONTRACTS.md`, `stage-5/RELEASE_MANIFEST.json`, `stage-5/RELEASE_VERIFICATION.json` and `stage-5/A8_FINAL_QA.json`

## What is already sound

- The entry evidence is valid: Stage 5 is `EXECUTION_VERIFIED`, release `paper4-2026-s5-v1` is locked and its release verifier is PASS.
- The plan keeps Stage 0–5 read-only and preserves the authority boundary between official source/marking evidence and AlgoCore teaching guidance.
- The intended learner journey follows the ten required blocks and includes recognition, reasoning, a verified example, mark protection, guided-to-independent practice and retrieval.
- VI/EN share stable content/example/event identities, and the plan explicitly includes UI labels, prompts, feedback, captions and glossary control.
- The visual review remit names keyboard/focus, reduced motion, captions, alt text, colour independence, mobile layout and static fallback.
- Stage 7 and Stage 8 remain blocked until a signed Stage 6 release.

These strengths do not close the required findings below because the current files cannot yet drive one unambiguous, checkable S6-0 gate.

## Required findings

### A7-S6-0-001 — Conflicting wave definitions

Severity: **required**  
Owner: **A0 Lead**

`README.md` and `STAGE6_MASTER_PLAN.md` define content phases: S6-A skeletons, S6-B method/marks, S6-C retrieval, S6-D visuals and S6-E final QA. `BATCH_PLAN.json`, `STATUS.json` and `PLANNING_REVIEW.md` instead define package cohorts S6-A through S6-F and final QA S6-G. The same wave identifiers therefore mean different work, owners, dependencies and gates. For example, S6-B means method/marks in the master plan but a skeleton batch for validation/testing in the batch plan; S6-E means final QA in the master plan but trees/hashing composition in the batch plan.

Impact: reviewers cannot determine which gate protects method accuracy, retrieval or accessibility, and a package can appear dependency-complete under one model while its required pedagogical phase has not occurred under the other.

Required correction:

1. Choose one canonical dimension for wave IDs.
2. If content phases and package cohorts are both needed, give them separate identifiers, for example `phase_id` and `batch_id`, and define their many-to-many relationship explicitly.
3. Align README, master plan, batch plan, work orders, status, planning review and gate checklist to the same dependency graph.
4. Name the A7 review point and block advancement while an A7 required finding is open.

PASS evidence: every Stage 6 planning artifact exposes the same phase/batch vocabulary and dependency graph; no ID carries two meanings.

### A7-S6-0-002 — Batch labels do not reconcile to the Stage 3 inventory

Severity: **required**  
Owner: **A0 Lead + A2 lesson architect**

Stage 3 contains 13 stable package IDs and 26 stable lesson IDs. `BATCH_PLAN.json` also lists 13 strings, but most are neither the Stage 3 package IDs nor a declared alias map. It splits the `foundations` package into four lesson-like labels, merges queue/list, renames several packages, and has no explicit assignment for the Stage 3 recursion or support lessons (`performance`, `graphs`). Direct dictionary coverage is also hidden behind the undeclared `hashing` label.

Impact: a count of 13 can pass while learners lose entire destinations, prerequisites, next-study routes or accessibility reviews. The current plan cannot prove the claimed 13-package/26-lesson coverage.

Required correction:

1. Create an exact inventory keyed by the 13 Stage 3 `package_id` values and 26 `lesson_id` values.
2. Give each package and lesson exactly one primary batch owner and list any secondary phase consumers.
3. If friendly aliases are retained, map each alias to stable IDs and validate set equality with Stage 3.
4. Explicitly assign recursion, performance, graphs and direct dictionary lessons.
5. Record prerequisite and next-study edges so a batch boundary cannot break the learner route.

PASS evidence: machine-checkable equality for the package and lesson ID sets, zero missing/extra IDs and no duplicate primary owner.

### A7-S6-0-003 — S6-0 outputs are described but not contracted

Severity: **required**  
Owner: **A0 Lead + A1 bilingual editor + A2 lesson architect**

The master plan says S6-0 records the input hashes, package inventory, denominator registry, locale policy, glossary, evidence paths and write ownership. The required artifact list names only `S6_INPUT_LOCK.json` from this preflight work, and no Stage 6 schema defines the required keys, foreign keys, completeness checks or hash policy for the other S6-0 records.

Impact: later authors can create structurally incompatible lesson, practice and storyboard artifacts while still claiming compliance in prose. A7 and A8 would have no deterministic way to check block order, locale parity, answer separation or accessibility fields.

Required correction: freeze and list, at minimum:

- input lock with paths and hashes;
- canonical package/lesson/pattern inventory;
- Stage 5 denominator registry and disposition policy;
- phase/batch/agent write-ownership registry;
- ten-block lesson skeleton schema and stable-ID policy;
- VI/EN glossary and locale/source-language policy;
- retrieval/practice schema;
- visual/accessibility storyboard schema;
- rework-ticket registry and gate-report schema.

Each contract must specify required fields, stable-ID joins, nullable fields, status vocabulary, validation command and output path. Self-hashes must use one documented rule rather than placing an unverifiable SHA-256 field inside arbitrary content.

PASS evidence: S6-0 artifacts exist, are named in the required artifact set, validate against frozen schemas and cover the exact Stage 0/3/5 inputs.

### A7-S6-0-004 — Accessibility review has topics but no measurable acceptance contract

Severity: **required**  
Owner: **A7 reviewer + A6 storyboard author**, approved by A0

The plans list keyboard/focus, reduced motion, captions, alt text, colour independence, mobile layout and static fallback, but they do not define what a storyboard must contain for any of these checks. The gate can currently pass from an “accessibility notes” field without specifying operable controls or an equivalent learning path.

Impact: Stage 7 can receive a visually detailed storyboard that has no keyboard sequence, focus behavior, spoken state-change equivalent, reduced-motion behavior or narrow-screen reading order. Retrofitting these after interaction implementation risks changing the pedagogy and event model.

Required correction: the visual/accessibility schema must require, when applicable:

- learning purpose and choice of `event`, `static diagram`, `comparison` or `self-check` mode;
- accessible name, role and state for every learner control;
- keyboard operation and deterministic focus entry, progression and return after feedback/reset;
- textual before/delta/after equivalent and announcement policy for state or feedback changes;
- caption and instructional alt text in VI/EN, with decorative assets explicitly marked;
- information redundancy through label/shape/pattern as well as colour;
- reduced-motion behavior that preserves every event and prediction checkpoint;
- static fallback with the same states, order, invariant/criterion and outcome;
- narrow-screen reading order, local overflow behavior for code/tables and no dependence on hover;
- explicit `Stage6_specified` versus `Stage7_UI_verified` status so planning evidence is not reported as a runtime test.

For static or conceptual material, `invariant` must be replaceable by a topic-valid decision criterion; the plan must not force an algorithmic invariant or animation onto a graph concept, Big-O comparison or class relationship.

PASS evidence: one accepted schema plus representative dynamic and static fixtures demonstrate every applicable field, and the Stage 7 handoff carries the deferred runtime checks.

### A7-S6-0-005 — No learner-facing information architecture or cognitive-load budget

Severity: **required**  
Owner: **A2 lesson architect + A7 reviewer**

The plan requires ten blocks across 58 patterns and 26 lessons, and Stage 0 permits those blocks to be split across linked pages. It does not define how blocks and patterns are chunked, the canonical reading order, how a learner returns to the same block/example, or how a page avoids becoming a long evidence dump. “Ten blocks present” is a completeness test, not a usability design.

Impact: a formally complete lesson may overload working memory, separate an explanation from its trace, bury practice feedback, or make the mobile route unusable.

Required correction: add to the lesson skeleton:

- block-to-page/section map and canonical reading order;
- observable objective and prerequisite checkpoint before the worked method;
- one declared anchor example state shared by explanation, code, trace and visual;
- chunking rationale when several patterns share a lesson;
- placement of Predict, reveal, explanation and practice feedback so answers are not exposed early;
- resume/deep-link identity at lesson, block and example level;
- navigation to prerequisite, next study and related/interleaved practice;
- a mobile reading-order review and an A7 cognitive-load disposition per lesson.

No universal word-count threshold is required, but every lesson must make its partition and scaffold-fading decisions reviewable.

PASS evidence: all 26 lesson skeletons have the fields above and A7 can trace a coherent recognition → explanation → prediction → practice → reconstruction path without duplicating example state.

### A7-S6-0-006 — Retrieval and feedback quality cannot be checked from the planned schema

Severity: **required**  
Owner: **A5 retrieval designer + A7 reviewer**

The work order correctly asks for cue cards, predict-before-reveal, fading hints, interleaving, reconstruction and timed transfer. It does not define the minimum record needed to distinguish a learning task from a prompt followed by an answer.

Impact: practice can satisfy the feature list without requiring retrieval, diagnosing a misconception or telling the learner what reasoning/mark evidence is missing.

Required correction: each retrieval/practice item must declare stable IDs, linked objective/pattern/method/error/marking refs, prompt type, learner response or observable artifact, expected evidence, reveal condition, ordered hint levels, misconception diagnosis, feedback/repair, rubric, independence level, transfer context and VI/EN parity over identical data. Guided, faded and independent items must be distinguishable in data; an independent item cannot expose the worked solution or completed trace before submission/reveal.

PASS evidence: schema validation plus representative recognition, explanation, code-completion and independent reconstruction fixtures show answer separation and actionable feedback.

### A7-S6-0-007 — Concurrency and ownership rules are internally ambiguous

Severity: **required**  
Owner: **A0 Lead**

The batch plan says `max_open_packages: 2`, while S6-F lists three package labels in one wave. The README separately says the first production wave may run in parallel with a maximum of two open packages. There is no state model defining whether “open” applies to packages, batches, phases or agent work orders.

Impact: three owners can edit shared glossary, navigation or lesson joins concurrently, or a gate can advance while one package in the same wave remains open.

Required correction: define the schedulable unit, open/closed states, ownership collision rule and whether a multi-package batch is processed serially or in bounded subwaves. Shared artifacts need a single owner and versioned merge/gate procedure.

PASS evidence: the ownership registry and batch graph make it impossible to have more than two active package owners and impossible for a dependent gate to consume a partially accepted batch.

## Advisory observations

1. The VI copy may keep established English technical terms, but the glossary should define when English stays visible and when Vietnamese leads. This prevents mixed labels such as `Predict`, `Reset`, `invariant`, `trace` and `evidence` from drifting across lessons.
2. The plan should reserve a short source/authority label near learner-facing mark guidance so students can distinguish Cambridge wording, a paraphrase and an AlgoCore rubric without opening implementation evidence.
3. Stage 6 should record accessibility assumptions, while actual contrast, focus, responsive layout and screen-reader behavior remain explicit Stage 7 verification obligations.

## Recheck gate

A7 recommends **PASS** only when:

- findings `A7-S6-0-001` through `A7-S6-0-007` are `CLOSED_VERIFIED`;
- the canonical wave/batch and ownership models agree across all Stage 6 planning files;
- exact joins prove 13/13 packages and 26/26 lessons;
- S6-0 schemas make pedagogy, answer separation, VI/EN parity and accessibility objectively reviewable;
- representative dynamic, static and retrieval fixtures validate successfully;
- the Lead records the corrected hashes and A7 recheck result before S6-A authoring begins.

Until then, the current Lead planning `PASS — PLANNING_READY` is not sufficient for the A7 S6-0 gate.
