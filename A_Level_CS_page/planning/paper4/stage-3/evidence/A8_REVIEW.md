# A8 — Independent Stage 3 review

**Decision: PASS recommended to Lead after rework.** Lead owns the stage gate. Eight required findings are closed after independent reinspection; related A3-AGG-01 is also closed. No mandatory mapping issue remains open.

## What was checked

The assembled artifacts contain **58 pattern chains, 108 knowledge blocks, 55 book sections, 111 editorial objectives, 26 lessons, 13 packages, 37 assessment destinations and 107 concrete assessment requirements**. Four objectives are explicitly excluded. The other 107 have knowledge, book and planned assessment destinations.

The corpus status totals are 42 observed, 31 partial, 19 support-only, 15 absent and 4 excluded. These are objective-level evidence dispositions, not student mastery, predicted examination frequency or published lesson completion. The 65 partial/support/absent objectives have explicit future production obligations; observed objectives retain transfer checks.

The independent aggregate script completed **5,752 checks without errors**. It checks identity and join integrity, every Stage 2 assessed-part set, retained source examples and QP/MS locators, book-section copies, objective evidence copies, bilingual capability/task briefs, assessment provenance, planned status and both lesson and conditional block graphs. Required and review lesson relations remain separate; no cycles were found. Original syllabus/book hashes and all 139 unique book printed/PDF page pairs also pass the independent input checks.

`A8_FINAL_QA.json` records the hashes of the five reviewed JSON artifacts and their five Markdown companions. `A8_AGGREGATE_CHECK.json` and `A8_INPUT_CHECK.json` contain the reproducible check results.

## Independent source and semantic review

- Read the original syllabus pages 11, 27–33, 37, 38 and 40. Visually inspected pages 37 and 38, including the two-column capability/guidance relationship. Compared every scoped 19–20 capability with the inventory and read all 44 whole-syllabus dispositions. Selected AS bridges are appropriate; this is not a complete AS course.
- Read all 111 final objective evidence/status rows, all 108 Lead book-mapping rationales and all 107 assessment briefs with their 324 acceptance checks. Concrete capability requirements are separated from chosen implementation examples.
- Independently read coursebook printed pages 171–172, 243–244, 487–489, 494, 515–516 and 531–537. Inspected original renders of pages 489, 516 and 534 for dictionary activity/table labels, setter versus getter and random-file operations. This is targeted semantic sampling of 17 risky book pages, not a claim that A8 reread every line on all 139 cited pages.
- Checked selected original QP/MS content for append and exception criteria (s25/41 2(c), w22/41 1(b)) and heterogeneous SaleData (s23/42 2(a)). Viewed MS facsimiles s23/42 page 11 and s25/41 page 26. This does not claim a second complete semantic review of all 672 corpus parts.
- Read all 58 lesson dependency rationales and 7 conditional block dependency records. Composition uses the linked-list backend by default; its prerequisite operations are required for that block. A tree backend remains an optional, separately bounded alternative.

## Rework verified

| Finding | Verified result |
|---|---|
| S3-A8-01 | Separate ADT-from-another-ADT capability now has SYL-19.1-30, source anchor and executable composition assessment requirement. |
| S3-A8-02 | Recursive tracing is corpus-absent; unrelated list-output screenshots removed. Independent call/return prediction has a dedicated requirement. |
| S3-A8-03 | Heterogeneous record evidence now uses SaleData with STRING and INTEGER fields, verified against QP page 5 and MS page 11. |
| S3-A8-04 | Post-condition context no longer cites unrelated calls/single input. Partial evidence states the behavioural limitation explicitly. |
| S3-A8-05 | Append and exception-code evidence roles now match the exact directly assessed QP/MS capability. Broader explanation/selection remains partial. |
| S3-A8-06 | Dictionary composition has conditional prerequisites for the chosen component ADT; it does not require both backends. |
| S3-A8-07 | Broad topic-generated objective prerequisites were rejected and removed from operational outputs. Graph description no longer inherits coding prerequisites. |
| S3-A8-08 | Assessment requirements now explicitly test loop-choice justification and explanation of deterministic key-to-address mapping/collisions. |
| A3-AGG-01 | Final composition brief, assessment and default dependency consistently use a linked-list-backed dictionary. |

The explicit boundary decisions are preserved: dictionary is not every hash table; in-memory hashing is not random-file processing; final output is not a recursive trace; prescribed class construction is not independent class design; appending does not necessarily preserve key order; graph description does not require graph code. Book locators do not certify source code, and Python storage/cleanup choices are not presented as named syllabus rules.

## Meaning and limits of PASS

PASS certifies **the Stage 3 curriculum design and source traceability**. All lessons, assessment questions, solutions, fixtures, runnable Python, dynamic events and website routes remain planned. Full student-facing VI/EN content, feedback and rubric parity must be authored and reviewed in later stages; the present acceptance-check strings are editorial English, while capability/task briefs and stable destination IDs are bilingual.

No Stage 4 work or app changes were performed by A8. Lead separately reruns the immutable Stage 1 and Stage 2 releases before signing the gate. The present audit verifies retained local sources and source references; it does not authenticate mirror files against Cambridge-host bytes.
