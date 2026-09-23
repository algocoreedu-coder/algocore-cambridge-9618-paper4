# Stage 7 work orders

## Shared contract

Inputs are read-only and must come from the signed Stage 6 handoff. Write only under `stage-7/evidence/<wave>/`. Every record has `schema_version`, `stage`, `wave`, `release_id`, stable IDs, locale, owner, reviewer, status and hash. VI/EN share event IDs, example state and control semantics.

## Agents

### A0 — Lead / visual editor

Owns entry lock, wave gates, ownership, rework and final release. Samples event traces and confirms no Stage 7 claim is presented as a Stage 8 runtime result.

### A1 — Event schema/state engineer

Defines event/state JSON schema, vocabulary, serialization, replay/reset and changed-input semantics. Validates before/delta/after parity and exact event order.

### A2 — Fumadocs visual-system architect

Maps state targets to diagram layers, code highlights, labels, output panels, static fallbacks and responsive layout tokens. Does not implement UI code.

### A3 — Pattern storyboard author

Authors batch-owned event specifications from Stage 6 storyboards and Stage 5 traces. Each event must name the same example, code line, state and invariant/criterion.

### A4 — Trace/source verifier

Checks event IDs, trace hashes, source/mark joins, branch/edge coverage and deterministic replay against Stage 5 evidence.

### A6 — Bilingual/accessibility editor

Provides VI/EN captions, alt text, accessible names, keyboard/focus sequence, reduced-motion behavior, non-colour redundancy and narrow-screen reading order.

### A7 — Pedagogy/UX reviewer

Checks prediction timing, cognitive load, event granularity, error feedback, static fallback and learner purpose. Reports concrete findings.

### A8 — Independent QA

Runs clean exact-set, schema, bilingual, replay, accessibility and hash checks. Never repairs its own findings.

## Required artifacts

`S7_INPUT_LOCK.json`, `EVENT_SCHEMA.json`, `STATE_MODEL.json`, `CONTROL_SEMANTICS.json`, `VISUAL_EVENT_SPECS.json`, `ACCESSIBILITY_MATRIX.json`, `COVERAGE_MATRIX.json`, `DISPOSITIONS.json` when applicable, `A8_FINAL_QA.json`, `GATE_REVIEW.json`, `RELEASE_MANIFEST.json`, `RELEASE_VERIFICATION.json`, `STAGE8_HANDOFF.json`.

## Rework ticket

```text
finding_id:
severity: required | advisory
wave/batch/lesson/pattern/event:
artifact + hash + locator:
observed behavior:
expected state/trace/contract:
required correction:
owner:
independent recheck command:
status: OPEN | RESUBMITTED | CLOSED_VERIFIED
```
