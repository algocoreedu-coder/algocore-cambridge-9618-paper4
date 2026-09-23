# Lead review — Paper 4 theory and Python

**Decision: `REWORK_REQUIRED`; Stage 9 release gate is reopened.**

The user's visual check was correct. Stage 0 specified a full Requirement → design → Python → trace → output/test → evidence learning chain, but Stage 9 did not test the visible semantic form of Python or the depth and provenance of theory.

## Verified findings

- Stage 3 provides 108 knowledge blocks, 55 coursebook sections and 139 verified print/PDF page pairs. Stage 9 compressed these into 26 short plain-text summaries. No published knowledge block directly joins the coursebook or syllabus.
- Stage 5 contains execution logs and independent reruns. None of the 26 published worked examples points directly to Stage 5 execution evidence.
- Before remediation, 21 lessons stored source lines in arrays that rendered as bullets and five lessons embedded Python in prose. This explains why a learner could scan the pages without recognizing a Python solution.
- Stage 7/8 Action View replays state transitions; its displayed identifiers are event contracts rather than full Python source. It cannot substitute for the worked code.
- The original Stage 9 gates verified counts, routes and keyword-bearing content. They did not verify semantic `<pre><code>`, execution joins, source joins or theory disposition.

## Immediate repair completed

- `LessonLearningPage` now renders `python`, `code` and `pseudocode` as a labeled, selectable, keyboard-focusable `<pre><code>` region with preserved indentation and horizontal overflow.
- The five prose lessons (`queue`, `linked-list`, `recursion`, `dictionary`, `hashing`) now use structured bilingual worked examples with runnable Python, trace, expected output and normal/boundary/failure tests.
- Detached HTTP inspection confirms semantic Python on 52/52 VI/EN lesson routes. TypeScript and the production build pass.
- A new deterministic gate rejects missing/short/unparseable Python, shallow theory, missing Stage 5 execution evidence and missing coursebook/syllabus joins. It is now part of `npm run verify:stage9`.

## Remaining release blockers

1. Publish a reviewed disposition for all 108 Stage 3 knowledge blocks into the 26 lessons. Each lesson needs concept explanation, Python semantics, representation/invariant, misconception and exam application in both locales.
2. Add direct coursebook section/page and 2026 syllabus objective refs to every knowledge block.
3. Bind 26/26 Python examples to Stage 5 run/rerun locators and verification hashes; re-run any example changed after Stage 5.
4. Bind Action View highlights to stable Python line IDs rather than displaying event contract IDs as code.
5. Run independent browser QA after the content registry changes, then create a replacement release manifest. The existing manifest remains historical evidence only.

Current deterministic result after the immediate UI repair: structured semantic Python **26/26 lessons and 52/52 locale routes**; theory-depth **1/26** under the new minimum; Stage 5 execution joins **0/26**; direct coursebook/syllabus joins **0/26 / 0/26**.

Independent reports: `PYTHON_THEORY_AUDIT.md` and `CODE_RENDER_AUDIT.md`. Machine gate: `PYTHON_THEORY_GATE.json`.
