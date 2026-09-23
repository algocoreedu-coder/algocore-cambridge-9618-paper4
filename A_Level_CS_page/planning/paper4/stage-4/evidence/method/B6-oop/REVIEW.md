# B6 OOP method submission review

Status: **SUBMITTED** for Lead/A1/A5/A8 review.

## Exact scope

- Patterns: 8/8 — `OOP_CLASS, OOP_SUBCLASS, OOP_GET, OOP_SET, OOP_UPDATE, OOP_OVERRIDE, OOP_INSTANTIATE, OOP_CAPACITY_ADD`.
- Stage 2 assessed part-pattern links: 164; unique assessed parts: 152.
- Official marking atoms owned once inside B6 with exact QP/MS locators and award semantics: 559.
- Pattern cards: 8; method steps: 36; variant registers: 7; error rows: 31.
- Solution designs, worked-example specs and event-driven visual briefs: 8/8/8.

## Method decisions

1. `OOP_CLASS` begins with an exact class/constructor contract. Parameter order, defaults, composition, attribute spelling/case and Python double-underscore name mangling remain explicit. A source sample is never treated as executable authority.
2. `OOP_SUBCLASS` partitions parent and new parameters, declares the exact inheritance edge, calls the parent constructor once with the parent slice, then initialises subclass-only state.
3. `OOP_GET` is a non-mutating stored-member return. `OOP_SET` is direct replacement. `OOP_UPDATE` writes a before→candidate→bounded-after equation, preserving direction, percentage base, index and multi-field obligations.
4. `OOP_OVERRIDE` preserves the parent callable contract and chooses transform-then-parent, specialised replacement or result extension from the source side effects; every parent/subclass obligation happens exactly once.
5. `OOP_INSTANTIATE` maps source values→constructor arguments→object identity→storage destination. Distinct mutable instances are required per slot; record grouping, subtype selection, capacity/count and exact return/output remain source-specific.
6. `OOP_CAPACITY_ADD` uses guard→store-at-old-count→increment→exact Boolean. Full failure is non-mutating.

## Atom ownership

- A part with one B6 assessed pattern assigns its source atoms to that B6 owner while retaining external co-tags as source context.
- Multi-B6 compound parts are split by criterion: class vs getter, class vs constructed child objects, subclass construction vs update method, and override header vs state-update rule.
- The 559 atom IDs are unique across all eight B6 cards; assessed co-tag rows remain present even when their `ms_atoms` list is empty for that pattern.

## Source caveats and authority

- Stable caveats joined: `S21-3A-PARAM, S21-3B-COUNT, S25-41-MS31-INIT, S25-41-MS35-INIT, S25-42-Q3CI-NAME, W21-2E-RUBRIC, W22-42-2A-ATTRIBUTE`.
- `S21-3A-PARAM`, `W22-42-2A-ATTRIBUTE`, `S25-41-MS31-INIT` and `S25-41-MS35-INIT` block copying the affected constructor/identifier samples as verified Python. Stage 5 must independently implement and inspect field state.
- `S25-42-Q3CI-NAME` keeps QP `TerritorySize/SetTerritorySize` identifiers while retaining the MS semantic criterion and locator.
- `S21-3B-COUNT` preserves the five-object QP contract and the conflicting four-element MS bullet without teaching four as the QP capacity.
- Adjudicated `W21-2E-RUBRIC` preserves all criteria under official part total 8; no bullet arithmetic or independent atom values are invented.
- Lead pass-1 rework applies `S4-S1-DEC-001` inside every B6 source view: both W21 rows retain all 11 criteria, every atom value remains null, the condition states the resolved holistic ceiling 8, and all occurrence/disposition metadata is resolved. No stale pending-decision wording remains in any output artifact.
- `S4-S2-POLICY-LAYOUT-CODE-FIDELITY` remains only in `source_fidelity_policies`, never in `source_issue_refs`.
- Coursebook sections are foundations. General steps, invariants and repairs are AlgoCore inference/risk unless an exact official atom is cited. No error row claims a fixed number of marks lost.

## Downstream boundary

- All solution designs and worked examples remain `PENDING_STAGE5_EXECUTION_VERIFICATION`.
- No executable code, certified trace or final runtime output is claimed.
- All visuals remain `PENDING_STAGE5_TRACE_AND_STAGE7_STORYBOARD`; every pattern has unique normal, boundary and failure cases with a concrete event vocabulary.

## Self-review

The deterministic validator checks exact Stage 2 assessed sets, the explicit B6 atom-owner function, all source locators and award semantics, bilingual method/error fields, private/constructor/capacity caveat joins, pattern-specific decisions/visual cases, unique joins and downstream statuses. No Lead decision remains open in this submission.

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
