# A8 Final QA — S6-D

Decision: **REWORK_REQUIRED**

Reviewer: **A8 independent QA**  
Input release: **paper4-2026-s5-v1** (`EXECUTION_VERIFIED`)  
Scope: recursion and binary-tree composition, Python console, VI/EN.

## Verified checks

| Check | Result | Evidence |
|---|---|---|
| Stage 5 obligation joins | **PASS** | 296 IDs, exact-once against the Stage 5 inventory |
| Stage 3 requirement joins | **PASS** | 12 IDs, unique and exact against the two S6-D lessons |
| Method schema | **PASS** | 5 patterns; trigger, representation, invariant, action, termination/output, check and joins |
| Retrieval practice | **PASS** | 30 items; six modes and cue fading 3,3,2,2,1,1 per pattern |
| Visual/event storyboards | **PASS** | 15 storyboards; Stage 5 trace IDs; required controls and static fallback |
| Bilingual parity | **PASS** | 20 blocks; VI/EN flags, shared example/pattern/source state |
| Marking authority | **PASS** | Official marks are join-only; no synthetic/recomputed marks |
| Requirement hash provenance | **REWORK_REQUIRED** | 12 fallback-object hashes detected |

## Required finding

**A8-S6D-001 — blocker — OPEN**

`COVERAGE_MATRIX.json` contains the correct 12 Stage 3 requirement IDs, but each `hash` is the SHA-256 of a synthetic fallback object. `build_s6d.py` searches for `assessment_requirement_id`; the authoritative `LESSON_PACKAGES.json` field is `requirement_id`. This breaks source-backed hash provenance even though the ID join itself is exact.

Required correction: patch the lookup, regenerate S6-D, document the canonical source hash policy, and rerun A8 in a fresh process. Until then Lead must keep S6-D at **REWORK_REQUIRED**.

No upstream Stage 0/3/5 files or Stage 6 `STATUS.json` were modified by this QA.
