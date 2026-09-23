# Stage 6 master plan

## Objective

Create a reviewable, bilingual learning experience that helps a student recognise a Paper 4 question, reconstruct the method, execute it in Python, preserve marking evidence, and retrieve the method later under exam time pressure.

## Immutable inputs

- Stage 0 learning-page contract and scope (VI/EN, 2026, Python console).
- Stage 3 lesson packages and blueprint (13 packages, 26 lessons, stable IDs).
- Stage 4 pattern cards, marking map, error-prevention matrix, assessment design briefs and preliminary visual briefs.
- Stage 5 release `paper4-2026-s5-v1`, including 58 patterns, 719 solution obligations, 2236 marking atoms, 154 error rows, 58 worked-example specs and 58 visual briefs, with all run/trace evidence.

All inputs are read-only. Every authored block must cite the relevant stable IDs and source locator; a source or marking claim may not be inferred from executable success alone.

## Work sequence

### S6-0 — Freeze the editorial contract

Lead records input hashes, package inventory, denominator registry, locale policy, terminology glossary, evidence paths and write ownership. A1 checks the learning-page contract and A2 checks that every Stage 3 destination is accounted for. Lead signs `S6-0` before writing begins.

### S6-A/B — Compose lesson skeletons by canonical package

A2 maps each of the exact 13 Stage 3 `package_id` values to the ten required blocks. A1 writes the bilingual block metadata and glossary joins. A6 reviews navigation, prerequisites and IDs. Deliverables are skeleton manifests and a parity report; no unverified prose is accepted as complete. Package names must be bijective with Stage 3: foundations, text, search-sort, stack, queue, linked-list, recursion, tree, dictionary, oop, files, support and integration.

### S6-C/G — Explain method, marks, retrieval and visuals

A3 converts Stage 5 solution designs into short, numbered reasoning steps: trigger → representation → invariant → action → termination/output → check. A4 joins each step to marking atoms, error phases, counterexamples and examiner-safe wording. Each worked example includes requirement, design, Python, trace, output/tests, and evidence links. The package waves S6-C through S6-G each deliver the same composition set: method, marks/errors, retrieval, bilingual copy and visual storyboard.

### Retrieval and visual controls (required in every composition wave)

A5 adds cue cards, minimal-recall prompts, worked-example fading, misconception diagnosis, interleaved variants and independent reconstruction. Practice feedback states the missing reasoning or mark evidence. VI and EN prompts have identical IDs, data and expected state.

### S6-D — Specify visual learning

A6 turns Stage 4 visual briefs and Stage 5 traces into event storyboards: before/delta/after, invariant, code highlight, prediction, feedback, reset and edge/failure branch. Each storyboard explicitly defines `Previous`, `Next`, `Play`, `Pause`, `Reset`, `change_input`, replay determinism and static fallback. A7 reviews cognitive load, keyboard/focus, reduced motion, captions, alt text, colour independence and mobile layout.

### S6-H — Verify and hand off

A8 independently checks ID coverage, source/mark joins, bilingual parity, Python/trace alignment, retrieval progression, visual contract and absence of unsupported claims. Lead samples every package family, closes findings, freezes hashes and writes a Stage 7 handoff. Any failed check is reworked and rechecked before release.

## Acceptance denominators

The release must account for all 58 patterns, 719 solution obligations, 60 variants/167 variant cases, 154 errors/308 detection-repair phases, 2236 marking atoms, 58 worked-example specs/210 microcases/261 evidence items, 58 visual briefs/174 scenarios/331 event entries, and 25 source issues/62 occurrences. These are joins to Stage 5 evidence, not permission to fabricate lesson prose. It must also account for all 107 Stage 3 assessment requirements grouped into 37 planned assessment destinations, with original-assessment authority labels.

## Lead operating rule

At each gate Lead records PASS, REWORK or BLOCKED with findings, owner, exact artifact/ID locator and independent recheck command. A PASS is valid only when required findings are empty and the next wave's inputs are hash-stable.
