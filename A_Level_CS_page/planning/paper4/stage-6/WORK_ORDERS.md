# Stage 6 work orders

## Common contract

Input is the immutable Stage 5 release `paper4-2026-s5-v1`. Write only under `stage-6/evidence/<wave>/<agent>/` and batch-owned lesson output directories. Every artifact carries `schema_version`, `stage`, `release_id`, locale, stable IDs, source/mark/error/visual joins, author, reviewer, status and SHA-256. VI/EN are parallel views over one content ID and one example/event state. Do not silently fill a missing source join; raise a rework ticket.

## Agent roles

### A0 — Lead / tổng biên tập

Own the gates, input hashes, package inventory, denominator reconciliation, editorial decisions and rework. At every gate inspect the reports and representative lessons; sign only after required findings are closed. Keep Stage 0–5 read-only.

### A1 — Learning-page contract and bilingual editor

Convert the ten-block contract into a lesson schema, enforce VI/EN parity, glossary consistency, locale-aware labels and source-language boundaries. Report missing blocks or translation drift; do not change algorithm evidence.

### A2 — Lesson architect

Build the 13-package/26-lesson skeleton from Stage 3 destinations. Join prerequisites, pattern cards, coursebook/syllabus links and next-study routes. Ensure each lesson has a coherent progression from recognition to reconstruction.

### A3 — Method and worked-example author

Write the trigger-to-check solution explanations and verified worked-example narration from Stage 5 evidence. Include normal, boundary and counterexample reasoning, Python code references, trace steps and output tests. Never invent a Cambridge requirement.

### A4 — Marking and error-prevention editor

Join method steps to marking atoms and error phases. Add examiner-safe wording, common wrong turns, detection/repair checks and source locator labels. Distinguish official mark-scheme language from AlgoCore teaching guidance.

### A5 — Retrieval/practice designer

Design cue cards, predict-before-reveal prompts, fading hints, interleaving, reconstruction tasks and feedback rubrics. Cover recognition, explanation, code completion and independent timed transfer while preserving answer separation.

### A6 — Visual/event storyboard author

Translate Stage 4 visual briefs and Stage 5 trace bundles into event storyboards with before/delta/after state, invariants, code highlights, prediction feedback, reset and edge/failure branches. Keep visuals purposeful and tied to the same example state.

### A7 — Pedagogy, UX and accessibility reviewer

Review cognitive load, sequencing, mobile/desktop layout assumptions, keyboard/focus, reduced motion, captions, alt text, colour independence and static fallback. Return concrete findings; do not approve on aesthetics alone.

### A8 — Independent final QA

Run clean checks against Stage 5 hashes and Stage 6 manifests. Verify all denominators, ID joins, locale parity, trace/code/output consistency, marking/error links, retrieval progression and downstream boundary. A8 does not author or repair its own findings.

## Required artifact set

`S6_INPUT_LOCK.json`, `LESSON_SKELETON_MANIFEST.json`, `METHOD_EXPLANATIONS.json`, `MARKING_ERROR_GUIDE.json`, `RETRIEVAL_PRACTICE.json`, `VISUAL_EVENT_STORYBOARDS.json`, `BILINGUAL_PARITY.json`, `COVERAGE_MATRIX.json`, `DISPOSITIONS.json` when needed, `A8_FINAL_QA.json`, `GATE_REVIEW.json`, `RELEASE_MANIFEST.json`, and `STAGE7_HANDOFF.json`. The close order is candidate hash → A8 candidate → Lead pass 1 → re-hash → A8 final → Lead pass 2 → gate → manifest → detached verifier.

## Rework ticket

```text
finding_id:
severity: required | advisory
wave/package/pattern/block/event:
artifact + hash + locator:
observed behavior:
expected contract + source locator:
required correction:
owner:
independent recheck command:
status: OPEN | RESUBMITTED | CLOSED_VERIFIED
```
