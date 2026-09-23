# Independent A4 full retest — TRACE v2

**Recommendation: PASS.** The exact review packet rehashed `169/169 PASS`. This retest independently reconstructed the complete TRACE population and all v1 acceptance controls; it was not limited to the corrected rows.

## Protected role identity and correction

All 893 assessment units match the accepted question bank by role: **1,153 PRIMARY**, **174 SUPPORTING**, zero additions/removals and zero PRIMARY/SUPPORTING overlap. The independently serialized projection is `7bd1ff8d4134293562b6ffa2be158139805e6d8f03a18fb4fcc511e366b06cb2`, matching the frozen expected hash.

The v1→v2 delta is exact: 18 unauthorized PRIMARY links were removed across ten units, and the duplicate PRIMARY use of `REQ-3.1-06-02` on `AU-9618_w25_qp_11-q6-pc` was removed while its accepted SUPPORTING link remained. There are no added PRIMARY links or SUPPORTING changes, and the corrected trace introduces no remaining role drift.

## Full population and cross-reference replay

The retest reproduced 99 objectives, 205 atomic requirements, 99 learning units, 893 assessment units, 504 final patterns, 824 equivalence components, 96 glossary terms, 27 command words, the 701/192 split, 62 HARD prerequisite edges and 128 context-only records. All 205 requirement rows, 99 objective summaries and 99 learning-unit rollups reconcile bidirectionally. The sole unmapped accepted unit remains `AU-9618_s23_qp_12-q5-pd-pii` and is exposed as a source limitation rather than assigned fabricated coverage.

Gap flags replay exactly to 12 no-official-evidence, 3 controlled-check-only, 165 no-verified-book-support, 3 needs-review-pattern-dependency and 200 glossary-candidate-status-only rows. All 15 original assessment briefs remain metadata-only AlgoCore placeholders with no prompt, answer, solution or rubric authored in Stage 2. Controlled-check units never enter author-pool lists.

## Source and prerequisite review

Source-bound sampling covered all 11 corrected units against their QP prompt excerpt, official MS evidence record, locator and accepted role; all passed. Five syllabus/coursebook objective packets (`AC26-1.1-04`, `AC26-2.1-03`, `AC26-4.1-07`, `AC26-6.2-02`, `AC26-8.3-05`) retained exact syllabus locators, coursebook support status and explicit claim boundaries. The 62-edge HARD graph is byte-semantic-identical to the accepted foundation graph, remains labelled `ALGOCORE_PEDAGOGY`, and every edge runs forward in the 99-node topological order.

All ten author files close against their manifests and handoff. UTF-8/control checks passed. The applicable A0 TRACE-v2 validator was rerun only as corroboration and returned PASS after the independent reconstruction.

## Findings and stop

Open Critical: 0. Open Major: 0. Open Minor: 0. Exactly six review outputs are frozen for A0 audit. A4 stops here without editing TRACE, source or tracker artifacts and without starting C4c, lesson, translation, app or Stage 3 work.
