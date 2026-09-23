# Stage 9 planning review — A7 pedagogy/contract audit

**Reviewer:** A7 Pedagogy / contract auditor  
**Review scope:** Stage 0 learning-page contract, Stage 6 release artifacts, Stage 8 handoff, and the Stage 9 planning set  
**Decision:** `REWORK_REQUIRED`  
**Required findings open:** 4

## Executive decision

The Stage 9 plan correctly locks the product boundary, exact denominators, route family, reviewer independence, and rework rule. It must not pass S9-0 yet because the plan assumes a learner-ready 26-lesson corpus that the released Stage 6 artifacts do not provide. It also lacks three implementation contracts required to make the 10-block pages verifiable: deterministic block-kind normalization, deployed source access, and full locale behavior.

## Evidence sampled

- `stage-0/LEARNING_PAGE_CONTRACT.md` and `stage-0/DEFINITION_OF_DONE.md`.
- `stage-6/README.md`, `stage-6/GATE_REVIEW.json`, `stage-6/STAGE7_HANDOFF.json`, all `LESSON_SKELETON_MANIFEST.json` files, and all `METHOD_EXPLANATIONS.json` files.
- `stage-8/STAGE9_HANDOFF.json` and `stage-8/STATUS.json`.
- Stage 9 `README.md`, `STAGE9_MASTER_PLAN.md`, `WORK_ORDERS.md`, `BATCH_PLAN.json`, `SCHEMA_CONTRACTS.md`, `GATE_CHECKLIST.md`, `S9_INPUT_LOCK.json`, and `STATUS.json`.
- All six hashes recorded in `S9_INPUT_LOCK.json` were recomputed and matched.

## Required findings

### S9-PLN-001 — P0 — Stage 6 is not learner-content ready for the promised 26 lessons

**Evidence.** Stage 6 contains 26 lesson IDs, but only 13 unique lesson IDs appear in released `METHOD_EXPLANATIONS.json` files. Nine lessons in S6-A/S6-B are explicitly `SKELETON_PLACEHOLDER`: `data-models`, `procedural-design`, `testing`, `text-processing`, `validation-rules`, `binary-search`, `search-collections`, `sorting`, and `stack`. Four more lessons have only skeleton records and no method entry: `exceptions`, `graphs`, `performance`, and `random-files`. A sampled S6-A block says `PLACEHOLDER_PENDING_S6-C` / “not student-facing content”; a sampled `exceptions` block has `body: null`.

**Contract impact.** `STAGE9_MASTER_PLAN.md` promises 26 × 10 semantic learning blocks, while WO-S9-A forbids writing prose to hide missing data. A deterministic builder cannot produce learner-facing recognition, signals, knowledge, method, worked example, mark protection, practice, retrieval, and next-study content from placeholders. Counting placeholder block IDs as 260 completed blocks would be a false PASS.

**Required correction.** Insert an explicit content-remediation wave before registry integration, or narrow the release scope and denominators. For the current 26-lesson commitment, assign owners to author and independently review all missing block semantics, reuse locked Stage 4–6 source/marking/visual IDs, and require a machine-readable readiness gate that rejects `PLACEHOLDER`, `PENDING`, `null`, and authoring-note-only content. WO-S9-A must depend on this gate.

### S9-PLN-002 — P1 — Stage 6 to Stage 9 block-kind normalization is undefined

**Evidence.** Stage 6 skeletons use `exam-cues`, `marking-pitfalls`, and `next-and-sources`; Stage 9 requires `signals`, `mark-loss`, and `next`. The plan says “normalize” but does not publish an exact mapping or reject unknown/multiple source kinds.

**Contract impact.** The exact 260-block test can pass with wrong semantics or duplicate/omitted source blocks.

**Required correction.** Add a normative mapping table for all ten kinds to `SCHEMA_CONTRACTS.md`, require exactly one normalized target block per lesson/kind, preserve source block IDs in provenance, and add negative verifier cases for unknown, duplicate, missing, and reordered kinds.

### S9-PLN-003 — P1 — Deployed source-access contract has no implementation owner

**Evidence.** Stage 0 requires a verified access/link mechanism at integration and forbids local source paths in deployed hrefs. Stage 9 only defines generic `sourceRefs`, says local paths belong in provenance, and assigns A4 as a review-only role that cannot fix data. No work order owns a public source resolver, authority labels, locator display, availability state, or editorial translation labeling.

**Contract impact.** Pages may expose unverifiable labels, silently drop sources, or leak workstation paths while still satisfying the present schema.

**Required correction.** Extend an implementation work order with a source-reference view model and resolver. At minimum specify `sourceId`, authority class, official/editorial label, human locator, access status, optional safe public href, support-translation label, and provenance-only local path. Add verifier and browser checks for every rendered source reference.

### S9-PLN-004 — P1 — Full VI/EN locale behavior is review-only in critical areas

**Evidence.** The route contract defines `?lang=vi|en`, and A2 owns a locale switch, but no implementation acceptance criterion names locale-aware `<html lang>`, Fumadocs/provider labels, navigation labels, or preservation of lesson, block anchor, selected pattern/scenario, and playback state. A6 is assigned to inspect these outcomes but cannot implement them.

**Contract impact.** Body copy can switch while document language, navigation, metadata, or Action View state remains stale, contrary to the Stage 0 bilingual contract.

**Required correction.** Extend WO-S9-B or WO-S9-C with explicit locale ownership and testable state-transition rules. Require browser tests for direct EN load, VI→EN→VI at a deep block anchor, metadata/document language, provider/navigation labels, and Action View identity/state preservation or a documented deterministic reset.

## Contract coverage that already passes planning review

| Area | Result | Evidence |
|---|---|---|
| Scope boundary | PASS | 2026, Paper 4, Python console, VI/EN; arbitrary Python execution, accounts, analytics, and persistence excluded |
| Exact denominators | PASS | 13 packages, 26 lessons, 58 patterns, 174 scenarios, 331 events, 260 blocks |
| Input immutability | PASS | Stage 0–8 read-only; all six S9 input hashes recomputed successfully |
| Route contract | PASS | `/paper-4/lessons/{slug}`, 26 static params, invalid slug 404 |
| Visual boundary | PASS | Stage 9 joins pattern IDs and reuses Stage 8 scenario/event state instead of copying traces |
| Accessibility planning | PASS | Keyboard, focus, headings/labels, 320 px, light/dark, and reduced-motion are assigned to A6/A8 |
| Reviewer independence | PASS | A4/A6/A7 are evidence-only reviewers; A8 is clean-room reviewer |
| Rework policy | PASS | Required/P0/P1 findings block gates; only reviewer or Lead can close after evidence |

## Gate recommendation

Keep `S9-0` at `REWORK_REQUIRED` and keep `S9-A` blocked. After the four corrections are committed, A7 should recheck the revised planning set. S9-0 may pass only when S9-PLN-001 through S9-PLN-004 are `CLOSED_VERIFIED` with file-and-field evidence.
