# Stage 9 final pedagogy recheck

**Decision: REWORK_REQUIRED.** Exact-set, bilingual registry payload, visual ownership and static fallback checks pass, but the complete learning contract passes for only 13 of 26 lessons. Five required findings remain open.

This review evaluates the rebuilt registry and the live lesson renderer. It relies on the independent PASS reviews for structures/tree and OOP/files instead of re-reviewing artifacts authored by this reviewer.

## Results

| Check | Result | Evidence |
|---|---|---|
| Exact scope and canonical order | PASS | 13 packages, 26 lessons, 260 blocks, 58 owned patterns; 26/26 lessons have ten blocks in order |
| VI–EN registry payload | PASS_WITH_RENDER_FINDING | 260/260 block payloads differ appropriately by locale; independent R2 reviews cover nested values for 13 structured lessons |
| Worked-example chain | **REWORK_REQUIRED** | 13/26 complete; 13 scalar examples lack the full requirement → design → Python → trace → output/tests → evidence chain |
| Practice progression | **REWORK_REQUIRED** | 13/26 provide assessable guided → faded → independent items with hints, feedback and authored rubric |
| Retrieval and repair | **REWORK_REQUIRED** | 13/26 provide hidden-answer reconstruction, diagnosis, repair and rubric |
| Marking authority | **REWORK_REQUIRED** | 13/26 join verified QP/MS or an explicit AlgoCore-authored rubric |
| Exact visual joins | PASS | 20 runtime lessons join exact lesson pattern sets; all 58 Stage 8 patterns have one owner |
| Zero-pattern fallback | PASS | `testing`, `dictionary`, `random-files`, `exceptions`, `performance`, and `graphs` use conceptual mode and render the static fallback |
| Invented official marks | PASS | No numeric official-mark claim pattern detected |
| Live structured rendering | **REWORK_REQUIRED** | Structured values render recursively, but object keys remain English on Vietnamese pages |
| Deterministic verifier | **REWORK_REQUIRED** | Existing verifier returns PASS while deep-checking only 13/26 lessons |

## Lessons needing content completion

`data-models`, `procedural-design`, `validation-rules`, `testing`, `text-processing`, `search-collections`, `sorting`, `binary-search`, `stack`, `random-files`, `exceptions`, `performance`, `graphs`.

For every lesson above, add a complete bilingual worked example; stable guided, faded and independent practice with fixtures, hints, reveal rules, feedback and rubric; retrieval reconstruction/repair with self-assessment; and a verified QP/MS or explicitly AlgoCore-authored marking chain.

## Renderer correction

`LessonLearningPage.tsx` passes nested object keys through `humaniseKey(key)` without locale. Vietnamese pages therefore show labels such as `requirement`, `design`, `expectedOutput`, `practiceItems`, `hint`, `feedback`, and `rubric` in English. Pass the locale into `ContentValue`, provide a VI/EN structural-label map, and add a rendered Vietnamese assertion for all four structured payload types.

## Verifier correction

The current deterministic pedagogy report declares `all_lessons_locale_check: 26` but `remediated_lessons_deep_check: 13`. Extend the deep checks to all 26 lessons. Recheck acceptance is:

- 26/26 complete worked-example chains.
- 26/26 complete practice and retrieval repair loops.
- 26/26 auditable marking authority.
- Localized nested renderer labels in both locales.
- Exact visual joins and six static fallbacks remain PASS.
- Zero required findings from the full-scope deterministic verifier.

Machine-readable counts, affected lessons, input hashes and all five findings are in `PEDAGOGY_RECHECK.json`.
