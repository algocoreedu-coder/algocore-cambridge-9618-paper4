# Stage 6 — Biên soạn trải nghiệm học và nhớ cách giải

Stage 6 turns the locked Stage 5 execution release into bilingual AlgoCore learning experiences for Cambridge 9618 Paper 4, 2026, Python console. It owns lesson composition, retrieval and memory scaffolds, worked-example narration, visual/event storyboards and pedagogical QA. It does not alter Stage 0–5 canonical evidence and does not implement the production website; Stage 7 owns interaction implementation and Stage 8 owns final release integration.

## Entry gate

Lead must verify `stage-5/STATUS.json` is `EXECUTION_VERIFIED`, `stage-5/RELEASE_MANIFEST.json` and `stage-5/RELEASE_VERIFICATION.json` pass, and the Stage 0 learning-page contract is available. Stage 5 is read-only input.

## Learning-page outcome

Every accepted lesson package preserves the ten learning blocks: identify the task, recognise question signals, required knowledge, method, verified worked example, state prediction/action view brief, mark protection, guided-to-independent practice, retrieval and reconstruction, and next study/source links. Each block has stable locale-independent IDs and complete VI/EN parity. Dynamic views explain meaningful state changes with events; static concepts use purposeful diagrams or comparisons.

## Gate rule

The Lead reviews each wave's manifest, samples source joins and checks the gate checklist. A required finding returns the wave to its owner with a rework ticket. No dependent wave starts while a required finding is open. Stage 6 closes only after independent A8 QA, Lead double-check, and a locked release handoff to Stage 7.

## Planned waves

| Wave | Purpose | Gate |
|---|---|---|
| S6-0 | Freeze input, schema, lesson inventory and editorial rules | Lead entry PASS |
| S6-A | Skeleton: `foundations` + `text` | A1/A2 review PASS |
| S6-B | Skeleton: `search-sort` + `stack` | A1/A2 review PASS |
| S6-C | Composition: `queue` + `linked-list` (method, marks, retrieval, visuals) | A3–A7 review PASS |
| S6-D | Composition: `recursion` + `tree` | A3–A7 review PASS |
| S6-E | Composition: `dictionary` + `oop` | A3–A7 review PASS |
| S6-F | Composition: `files` + `support` | A3–A7 review PASS |
| S6-G | Composition: `integration` | A3–A7 review PASS |
| S6-H | Cross-package independent QA and release handoff | A8 + Lead PASS |

The first production waves run in exact Stage 3 package order, with a maximum of two open packages. The package `support` has no Stage 5 pattern IDs; it uses an explicit support-only disposition and cannot create coverage. All packages must use the Stage 5 pattern, solution, marking, error, worked-example and visual IDs rather than invented coverage counts. Stage 3 also has 107 capability requirements grouped into 37 assessment destinations; both denominators are tracked separately from the 4,881 Stage 5 obligations.
