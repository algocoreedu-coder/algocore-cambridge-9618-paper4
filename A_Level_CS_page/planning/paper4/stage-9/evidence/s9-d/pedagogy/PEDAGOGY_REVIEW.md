# Stage 9 S9-D3 — Independent pedagogy review

**Decision: FAIL.** S9-D cannot close. The registry has the correct shell — 13 packages, 26 unique lessons, 58 patterns, 260 blocks, ten canonical blocks per lesson, stable nonempty VI/EN fields, and a valid navigation graph — but five required pedagogy findings remain open.

## Deterministic results

| Check | Result | Evidence |
|---|---|---|
| Exact set | PASS | 13 packages, 26 lessons, 58 pattern union, 260 blocks |
| Ten-block order | PASS | 26/26 lessons use the canonical order |
| IDs and references | PASS | lesson IDs/slugs unique; every prerequisite/next ID exists |
| Navigation graph | PASS | one root (`data-models`), 58 next edges, 26/26 reachable, no self-edge |
| Runtime Action View joins | PASS | 20/20 runtime lessons join exactly their lesson pattern IDs |
| VI/EN semantic parity | FAIL | 13 affected lessons; 16 blocks have identical VI and EN; 71 VI blocks retain detected English template wording |
| Worked-example contract | FAIL | 26/26 are scalar prose; 0/26 exposes the complete requirement → design → Python → trace → output/test → evidence sequence |
| Practice/retrieval | FAIL | no explicit practice rubric or feedback; 13 lessons use repeated generic prompt templates |
| Zero-pattern fallback | FAIL | `testing` and `dictionary` promise event controls/events that have no joined runtime pattern |
| Mark protection | FAIL | 13 lessons lack a QP/MS or explicitly authored-rubric join in the marking block |

The review used registry SHA-256 `c8fb8d38cc82a83164b88ebad6695819fa0742bf3a287422497bd91370fc8151`. Route behavior, browser rendering, runtime behavior, accessibility and source authenticity were outside this work order and were not assumed to pass.

## Required findings

### S9D-PED-F001 — incomplete Vietnamese learning copy

Owner: **A5 content author, A6 bilingual reviewer, A1 registry engineer**.

The affected lessons are `queue`, `linked-list`, `recursion`, `binary-tree`, `dictionary`, `hashing`, `oop-model`, `oop-state`, `oop-inheritance`, `oop-aggregation`, `text-files`, `object-files` and `exam-workflow`. Their VI copy contains generic English task templates. Sixteen `exam-cues`/`knowledge` blocks are identical in VI and EN across queue, linked-list, dictionary, hashing and four OOP lessons.

Replace the template language with real Vietnamese instruction while preserving identifiers, event data and official English literals. A semantic bilingual review must recheck the result.

### S9D-PED-F002 — worked examples are not complete worked examples

Owner: **A3/A5 content author, A1 registry engineer, A2 lesson renderer**.

Each worked-example is a single prose value. The learning page cannot present and verify the Stage 0 sequence of requirement, design, Python, trace, output/test and evidence. Short state narratives are useful, but they do not let the learner connect code to a trace and prove the output.

Provide the applicable sequence for every lesson, render each part distinctly, and independently check code/trace/output identity.

### S9D-PED-F003 — practice and retrieval cannot assess or repair learning

Owner: **A5 practice/retrieval author, A1 registry engineer, A2 lesson renderer**.

The legacy-composition lessons repeat generic `[predict]`, `[complete]`, `[transfer]`, `[explain]` and `[reconstruct]` templates. The other lessons describe a progression, but the registry does not provide a concrete learner artifact, expected evidence, ordered hints, reveal condition, diagnosis, repair feedback or rubric. No practice block carries an explicit rubric or feedback path.

Create stable assessment items for guided, faded and independent work, then add retrieval items that require hidden-answer reconstruction or trace repair.

### S9D-PED-F004 — conceptual fallback contradicts its available interaction

Owner: **A5 content author, A1 registry engineer, A2 lesson renderer**.

`testing` has no pattern but tells the learner to use Previous and Reset. `dictionary` has no pattern but asks for the next `HASH_SETUP` event. Either join an already verified Stage 8 pattern or convert each block into a conceptual diagram/table/self-check with controls that actually exist.

### S9D-PED-F005 — mark-loss guidance is not joined to marks or a rubric

Owner: **A4 source/marking reviewer, A5 content author, A1 registry engineer**.

The marking blocks for `data-models`, `procedural-design`, `validation-rules`, `testing`, `text-processing`, `search-collections`, `sorting`, `binary-search`, `stack`, `random-files`, `exceptions`, `performance` and `graphs` contain useful warnings, but no QP/MS authority or explicit AlgoCore rubric item. They do not expose the required requirement → mark/rubric → method → error → check/repair chain.

Join each warning to verified marking evidence where it exists. Where no official point applies, label and link an AlgoCore-authored rubric instead of implying an official mark.

## Package spotcheck

All 13 packages were sampled: foundations (`data-models`, `testing`), text (`text-processing`), search-sort (`sorting`, `binary-search`), stack, queue, linked-list, recursion, tree (`binary-tree`), dictionary (`dictionary`, `hashing`), OOP (all four lessons), files (`text-files`, `object-files`, `random-files`), support (`performance`, `graphs`) and integration (`exam-workflow`). The structural shell and topic flow are coherent. Every package is blocked by at least one required finding above, so a package-level PASS would be misleading.

After owners correct the five findings, A7 must re-run the same exact-set checks and semantic sampling. S9-D remains blocked until `required_open_findings` is zero.
