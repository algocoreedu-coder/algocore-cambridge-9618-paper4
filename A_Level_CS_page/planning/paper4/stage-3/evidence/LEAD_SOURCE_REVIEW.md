# Lead — source and semantic review

The Lead used the frozen Stage 1 original PDFs and extracted text, with Stage 2 exact-part criteria as the historical exam index. This is a source/knowledge mapping review, not a new complete reread of all 29 papers and not a solution-execution review.

## Original facsimiles inspected

| Source | Printed / PDF page | Local image | Review focus |
|---|---|---|---|
| syllabus_2026_v2 | 37 / 37 | lead_views/syllabus_2026_v2_037.png | Two-column algorithm requirements, named ADTs, ADT composition, graph exception, complexity and recursion |
| syllabus_2026_v2 | 38 / 38 | lead_views/syllabus_2026_v2_038.png | Procedural/OOP, excluded paradigms, file organisation and exceptions |
| syllabus_2026_v2 | 40 / 40 | lead_views/syllabus_2026_v2_040.png | Practical scope, console languages, source-file restriction, evidence and saving |
| coursebook_watson_williams | 489 / 505 | lead_views/coursebook_watson_williams_505.png | Dictionary interface, activity, mixed-language table and complexity |
| coursebook_watson_williams | 515 / 531 | lead_views/coursebook_watson_williams_531.png | Containment and constructor section boundaries |
| coursebook_watson_williams | 534 / 550 | lead_views/coursebook_watson_williams_550.png | Random-file addressing and persistent record operations |

Text review additionally covered syllabus pp11,13,27–33,37–41,48 and the relevant book concepts in Chapters19–20. A2 supplies 24 visually checked anchor pages and textual printed-page checks for every locator; A3 supplies the wider syllabus-page review. A8 independently checked source hashes, locators, selected original facsimiles and final joins.

## Editorial decisions directly reviewed

The Lead authored all 108 block-to-book mappings and 107 non-excluded objective-to-block mappings in the two manual `lead_*_links.py` files. These are explicit editorial rows with relationship labels and rationale, not matching by keywords or chapter title. EVIDENCE_RUN primarily connects through assessment instructions; generic testing knowledge is a foundation rather than proof of the examination evidence contract.

The Lead read the full list of 107 task briefs and acceptance checks, then re-read the two changed requirements for loop choice and hashing explanation. The accepted requirement set has 324 checks. These specify what later authoring must demonstrate; they are not completed learner questions, verified code or official marking points.

All 58 lesson edges were reviewed with their reasons. Conditional blocks preserve representation/variant boundaries: iterative search before recursive revisit, recursive queue reduction, queue-based RLE, linked-list-backed dictionary, optional tree backend, object-backed tree, and hash-addressed random file. The broad inherited objective-level prerequisite suggestions were rejected after A8; none is operational in the final maps.

The default composition assessment is a dictionary using a linked-list ADT interface. The source analyst's two-stack queue suggestion remains only in the historical input evidence. Final coverage, gaps, assessment and conditional dependency use the selected linked-list backend consistently.
