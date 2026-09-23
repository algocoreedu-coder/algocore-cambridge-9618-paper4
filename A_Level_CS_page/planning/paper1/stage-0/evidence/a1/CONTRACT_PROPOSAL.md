# A1 — Proposed learning-page contract, Paper 1

Version: 1.0. Task: P1-S0-A1-01. Author: A1. Date: 2026-09-19 (+07:00).
Status: PROPOSED, pending A0 integration and independent A9 review. This document specifies a future product contract; it does not claim these features exist or have passed runtime tests.

## Boundaries

Cambridge 9618 Paper 1, exam 2026; complete Vietnamese and English versions. Syllabus scope and source editions must come from A3/A2 accepted evidence. The current Paper 3 preview supplies the learning sequence and AlgoCore shell only. Do not import Paper 3 depth, Paper 4 programming requirements, or 2027–2029 scope.

Keep DocsLayout/DocsPage/DocsBody, existing logo and centralized AlgoCore theme as verified in audit O01/O09/O10. Keep existing sample reachable when routes are added. This contract does not require accounts, saved progress, grading service, search, publication or PDF ingestion. Reading and extracting PDFs for authoring is a separate source workflow, not a claimed app capability.

## Lesson-package blocks

Every required learning function must be present in each accepted lesson package. A package may span linked pages; combining adjacent functions is allowed when their IDs and acceptance evidence remain explicit. Do not repeat meaningless blocks to meet a quota.

| ID / function | Required content | Acceptance evidence |
|---|---|---|
| B01 Identify and orient | Paper/year/topic, title, short description, observable objectives and useful prerequisites | Objectives resolve to verified syllabus IDs; prerequisites link to exact lesson/block or are explicitly none |
| B02 Understand the concept | Concise explanation, relevant English terms with VI explanation, a diagram/table/example where it clarifies the concept | Explanation/source mapping reviewed; visual appears at the point it is used |
| B03 Remember the rule | Definitions/rules, conditions, units and conventions needed for the task | A3 checks accuracy and applicable limits; no unsupported universal shortcuts |
| B04 Recognize the exam task | Command word, relevant data, requested response, distinguishing features of similar tasks | QP locator for official/adapted examples; original examples labeled accordingly; no unsupported exam-frequency claims |
| B05 Worked example | Interpret → choose method → show steps with reasons → check answer | A3/A4 independent validation; numerical examples independently recalculated; no skipped information necessary for replication |
| B06 Make the response sufficient | Link requested response to evidence/ideas that earn marks; compare an incomplete answer with a corrected one when useful | Official marking requirements resolve to MS; local advice/rubrics visibly labeled AlgoCore; no one-sentence-equals-one-mark rule |
| B07 Detect and repair errors | Concrete error → how to detect → correction | Error guidance checked against the example; attribution to examiner only with examiner-report locator |
| B08 Practice with fading support | Guided, reduced-hint and independent opportunities across the package | Tasks precede hidden support/solutions; learner can attempt independently; quantity follows coverage, not a fixed quota |
| B09 Check and explain | Answers, reasons, steps and official marking points or AlgoCore rubric as applicable | Correctness and point totals reviewed; same data/answers for VI/EN; alternative answers and conditions preserved |
| B10 Recall and continue | Retrieval prompts, recap and useful next/revisit links | Answers can remain hidden during recall; links resolve and do not falsely imply completion tracking |
| B11 Trace sources | Readable citations and accessible source references appropriate to the claim | Internal manifest links syllabus/book/QP/MS to exact page/question/part; public links use a verified delivery mechanism |

Reviewer/version/status metadata belongs in internal manifests except information needed by a learner. No file-system paths such as D:/ in published hrefs. A source citation must not claim access to an unavailable PDF: until a delivery mechanism is verified, show bibliographic identity and exact locator rather than a broken link.

## Proposed logical schema

Format and renderer remain undecided; these are relationships to preserve in JSON/TS/MDX or another later implementation. They are not a claim that the repository has a schema pipeline. Stable IDs must survive translation and reorderings.

```text
course: id, version, syllabus_year=2026, paper=1, required_locales=[vi,en], settings_ref
source: id, kind, path_or_url, sha256, edition_or_version, verified_status
locator: source_id, pdf_page_1_based, printed_page_or_null, chapter_or_section,
         exam_year, session, component, variant, question, part
objective: id, syllabus_locator, requirement, prerequisite_ids, coverage_status
lesson: id, version, course_ref, topic_id, objective_ids, prerequisite_refs,
        block_ids, exercise_ids, source_refs, next_refs
block: id, type, order, content_refs, source_refs, example_or_question_refs
localized_content: id, locale, content_version, body, parity_status
question: id, version, origin, objective_ids, pattern_ids, prompt_refs, marks_or_null,
          qp_locator_or_null, ms_locator_or_null, dependency_ids, variant_group, split,
          verification_status
solution: id, version, question_ref, step_ids, answer, verification_ref
marking_point: id, question_ref, claim_kind, text_refs, source_locator_or_null,
               conditions, acceptable_alternatives, solution_step_refs
visual: id, version, purpose, block_ref, asset_or_model_ref, caption_refs, alt_refs, qa_ref
review: id, artifact_id, artifact_version, hash_or_revision, reviewer, findings,
        checks, evidence_refs, status
```

Allowed `origin`: official/adapted/original. `claim_kind`: official_marking_requirement/algocore_guidance. An adapted question carries its parent locator and explicit changes; its own solution must be revalidated. A translation is identified as an AlgoCore translation and retains its English source reference. Original questions have original rubric; a similar official MS is not their official answer. Unavailable values use null plus a verification issue, never invented locators. A required academic locator still missing blocks acceptance of the affected teaching package.

Separate parent questions and child parts; retain shared context/dependencies and avoid double-counting marks. A historical exam year is distinct from the course syllabus year. Variant grouping requires content comparison, not filename similarity. Academic/source owners determine the records; UI must not simplify away these distinctions.

## Full bilingual behavior

- Both locales contain all B01–B11 learning functions, prompts, hints, answers, explanations, captions/alt text, feedback, navigation and course UI. Vietnamese is a complete teaching version, not short annotations on English content.
- Shared lesson/block/question/example IDs, data, units, conditions, answers, marks and references. Translation cannot silently change a response requirement. Glossary has English exam terminology and reviewed Vietnamese equivalents.
- Locale affects html lang, provider labels, page title/description, content, TOC and sidebar. Locale switch preserves corresponding lesson and block. For a future stateful visual, preserve equivalent state if safe; otherwise reset visibly with localized explanation and identical initial data.
- Source QP/MS remain English originals. VI translation is labeled; official origin is never attributed to translated wording. English exam-style practice may emulate exam conditions, with full VI/EN explanations available separately.
- Parity review compares block IDs and versions, then semantic equivalence; equal item counts alone are insufficient. Missing required translation blocks bilingual acceptance.

## Revealed answers and navigation

Practice prompts must be visible before answers. A distinct localized hint disclosure precedes answer disclosure when hints exist. Native details/summary is acceptable if verified with keyboard and browser. All disclosures start closed for a fresh practice view; activation, focus and open state must be perceivable without relying only on color. Solutions remain available without account creation. Hidden details are pedagogical reveal, not secure exam delivery.

TOC is derived from or checked against actual block IDs. Sidebar and next/prerequisite links point to the same locale and the correct course/topic/lesson; switching locale has a deterministic equivalent target. Route shape is an A8 decision, with no hard-coded Paper 3/Unit 13 carryover in new Paper 1 pages. Do not copy the sample's fixed 8-minute estimate onto all lessons.

## Visual and theme contract

Use the current logo asset and AlgoCore theme tokens. Keep semantic colors centralized; topic authors do not scatter new hard-coded palettes. A diagram/table should show labels, units, direction and relevant state clearly, with caption and accessible equivalent. Meaning must remain available without color alone.

For a dynamic process, A7 proposes a state model only when it supports an observable objective. If implemented, initial state, transitions, reset, inputs and final result must agree with the approved explanation and fixtures; controls require localized names, keyboard access and a usable reduced-motion/static alternative. A static teaching figure is valid when sufficient. No mandatory Python runner, code tracing panel or Paper 4 Action View is inherited.

## Verification at the stage where evidence is available

| Gate / owner | Required check and evidence | Current status |
|---|---|---|
| Stage 0 / A1 then A9 | Source observations with locators; proposed features distinct; schema preserves provenance/parity; full contract reviewed independently | Submitted proposal, not yet reviewed |
| Stages 1–2 / A2/A3/A4 | Source identifiers and locators, verified scope and source packet for each future lesson | Outside this package |
| Stage 3 / A3/A4/A6/A9 | All B01–B11 functions; source claims; worked answers and marks; full semantic VI/EN parity; visual storyboard checks | Not executed |
| Stage 4 / A8 then A1/A9 | `npm run typecheck`, `npm run build`, with revision and logs | Not executed |
| Stage 4 / A9 | Actual desktop/mobile, VI/EN and light/dark browser review: text/controls fit; wide tables scroll locally; logo clear; answer/hint disclosures closed initially and keyboard-operable; focus visible; headings/TOC/next/prerequisite/locale links correct; source delivery works | Not executed |
| Stage 4 / A9 | Check representative text and controls for readable contrast; figures have accessible equivalent; no color-only meanings; reduced motion/static path and state fixtures when applicable | Not executed |

Build success cannot stand in for content or browser review. Record viewport/browser/revision and specific checks when executed. Critical/Major failures block the affected package; review must apply to current versions. Stage 0 may pass its planning gate without Stage 4 tests, but must not label them PASS.

## Self-review and handoff

Checked that contract covers metadata, source provenance, VI/EN, hidden answers, navigation, theme preservation and verifiable UI behavior. Checked that app availability claims appear only in the companion audit, that no unverified syllabus objective or marking point is asserted, and that no app edits are needed for this work order. A0 must integrate with A2/A3; A9 must review both this proposal and A0's final contract independently.
