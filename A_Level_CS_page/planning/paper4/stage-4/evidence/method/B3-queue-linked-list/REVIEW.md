# B3 Queue and linked-list method submission review

Status: **SUBMITTED** for Lead/A1/A5/A8 review.

## Exact scope

- Patterns: 9/9 — `QUEUE_SETUP, QUEUE_ENQUEUE, QUEUE_DEQUEUE, QUEUE_INSPECT, QUEUE_REDUCE, LIST_SETUP, LIST_TRAVERSE, LIST_INSERT, LIST_REMOVE`.
- Stage 2 assessed part-pattern links: 60; unique assessed parts: 60.
- Official marking atoms joined with exact QP/MS locators and source award semantics: 266.
- Pattern cards: 9; method steps: 45; variant registers: 6; error rows: 25.
- Solution designs, worked-example specs and event-driven visual briefs: 9/9/9.

## Method decisions

1. Queue cards begin by locking linear/circular, head/tail role, count, empty/full equations and exact result type. Wrap is permitted only by the cited contract; failed Enqueue/Dequeue is non-mutating.
2. Enqueue separates full guard, write, pointer/count transition and exact result. Dequeue saves the FIFO item before moving head, then applies only the cited wrap/reset and sentinel policy. Inspect reads the live range without mutation.
3. Queue reduction preserves each source's destructive/read-only mode, traversal direction and termination signal. Sentinel values never become data; run-length work flushes the final run.
4. Linked-list cards keep array/free-list and object-reference models separate. Traversal follows Next to exact null. Array insertion saves the free node's old Next before overwrite; removal unlinks from the live chain before recycling.
5. Head, middle and tail mutations are explicit. Empty and not-found behaviour remains tied to each source's presence and return contract.

## Source caveats and authority

- 4 stable issue IDs join B3: `S21-1DI-FREE, S22-41-3C-DEQUEUE, W22-42-3B-SCOPE, W25-43-Q2B-FULL-GUARD`. Every disposition retains canonical source locators and Stage 5 obligations.
- `S21-1DI-FREE` is carried on three 2021 list-insert parts: the source sample is not treated as verified; Stage 5 must independently preserve the old free successor before overwrite.
- `S22-41-3C-DEQUEUE`, `W22-42-3B-SCOPE`, and `W25-43-Q2B-FULL-GUARD` remain source caveats, not silent corrections.
- `S4-S2-POLICY-LAYOUT-CODE-FIDELITY` remains in `source_fidelity_policies` only. It is absent from every `source_issue_refs` list.
- Coursebook references are foundations. Method steps, invariants, checks and repairs are AlgoCore inference/risk unless an exact QP/MS atom is cited. No error row claims a fixed number of marks lost.

## Downstream boundary

- All solution designs are `PENDING_STAGE5_EXECUTION_VERIFICATION`.
- All worked examples are specifications only; no code, trace or final runtime output is claimed.
- All visual briefs are `PENDING_STAGE5_TRACE_AND_STAGE7_STORYBOARD`; each pattern has a specific normal, boundary and failure case plus event vocabulary.

## Self-review

The deterministic validator checks exact B3 pattern order, Stage 2 assessed sets, all 60 official source rows, exact 266 atom ownership, locators, award metadata, bilingual method fields, variant coverage, method/error/design joins, source-caveat fidelity, status boundaries and absence of code/run claims. No Lead decision remains open in this submission.

## Input hashes

- `stage-2/EXAM_PATTERN_CATALOG.json` — `eaa7e50e87932b2aa58c5f1d9415d2b8a63ccd6da43c9f2b714d3ee74585dd95`
- `stage-2/QUESTION_PATTERN_MAP.json` — `2bc7a5fc2cd18eeb01e71c3b782f7c5ff0e6a7d780212f3e715e44a309c9318f`
- `stage-2/CONFUSABLE_PATTERNS.json` — `74e9c079979c439b09257e9564854682e1cdeabb0193e13338dcf66c8666c244`
- `stage-3/BOOK_KNOWLEDGE_MAP.json` — `5b81ed6a1b8028eeabbb9e44184dd9bab8864893893a6e0599a7fcf1043dd96a`
- `stage-3/COVERAGE_MATRIX.json` — `e47f52bc29703f8f0fa03d2777d021cd51935c2e30127759c2dbf6f802345b5f`
- `stage-3/LESSON_PACKAGES.json` — `01710c1a99028228bf5472ddf9457a4ac9c5df64ebd576785139d23d6fca0ad2`
- `stage-4/SOURCE_CAVEAT_CARRYOVER.json` — `ce6679219bc092c2c4054eb8f6f9528edecd3a3f577410f0f41fb614ba7763ef`
- `stage-4/evidence/marking/2021-2022/MARKING_SUBMISSION.json` — `431c3d6f520fae30852faa098b11e1f8a9210e8adc679cea99386431c8c321f4`
- `stage-4/evidence/marking/2021-2022/SOURCE_RISK_REGISTER.json` — `e2065152d043e63e802239b56d13742836552449a126cb67007ea57750abf5cd`
- `stage-4/evidence/marking/2023-2024/MARKING_SUBMISSION.json` — `796e20019b38f0e214f9c8d073caed490aee80b8f916dea9e1ee8c4bec2d51bb`
- `stage-4/evidence/marking/2023-2024/SOURCE_RISK_REGISTER.json` — `bd408ecb42a723923eb3b0b102b285e6046dfd27e414ae0aa521a3feb36591ef`
- `stage-4/evidence/marking/2025/MARKING_SUBMISSION.json` — `3c460504352ff601d0423c2070b383f7b48e1a5746f2786a05732849a4f99f99`
- `stage-4/evidence/marking/2025/SOURCE_RISK_REGISTER.json` — `35ab42f032dbcd7420f698c19024cc4d7361a73bf542b4e41263af9795494c18`
- `stage-4/schemas/pattern-card.schema.json` — `00f88fc719c21a2c0259fdf2275bee108152636dddca0126f4c95f7552410e48`
- `stage-4/schemas/error-prevention.schema.json` — `282ef2c7964a81cbb541d488ded8bf6439ebb75c8be9469021bc3f61f048294d`
- `stage-4/schemas/design-briefs.schema.json` — `30748518ea993b1d4da4ae239f69d89bf2d9195fe4601518e45e6dbe1e7703d4`
