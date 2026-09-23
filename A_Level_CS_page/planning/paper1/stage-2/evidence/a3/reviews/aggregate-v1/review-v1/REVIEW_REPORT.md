# Independent A3 review — C3a aggregate-v1

Work order: `P1-S2-A3-REVIEW-C3A-v1`  
Reviewer: fresh A3 independent of the A4 C3a author  
Review date: 2026-09-22  
Result: **CHANGES_REQUIRED**

## Decision basis

The frozen inputs, aggregate union, marking preservation, source locators, occurrence bijection and provisional-state controls pass. The provisional pattern catalog does not reproduce from its declared merge rule. Two Major findings remain open, so A3 cannot return PASS.

The catalog declares `accepted_requirement_set`, `response_product` and `cognitive_action` as required matches. Independent reconstruction from the pinned source-candidate rows produces 504 groups, while the artifact contains 498. Ten catalog patterns combine 40 occurrences drawn from different accepted source-candidate requirement sets. Six exact declared keys are also split across two catalog patterns. Several canonical definitions consequently say that all occurrences share a full requirement boundary when some occurrences do not carry that boundary.

## Frozen input and closure checks

- Rehashed all 86 entries in the issued input manifest. Missing files: 0; byte mismatches: 0; SHA256 mismatches: 0.
- Confirmed issued manifest SHA256 `ca2dce662d859f67228e858d524854a8914195f7bf03af4b8c3100c6238d2e3b`.
- Confirmed the author handoff SHA256 `32370c0b53d63f83d9ef244c9bde188f24e6efddf9da10d55dcc3a86633ca332`.
- Confirmed `aggregate-v1` contains exactly the nine required files and no extras.
- Parsed all 74 JSON/JSONL files among the frozen inputs, including empty JSONL files. Parse errors: 0.
- Rehashed every file pinned by the author output manifest and handoff. Closure mismatches: 0.
- Confirmed the aggregate `INPUT_MANIFEST.json` is byte-identical to the issued C3a author manifest.

## Independent union and lineage reconstruction

The accepted batch union was rebuilt from B21-v4, B22-v4, B23-v4, B24-v4 and B25-v2:

| Invariant | Rebuilt result |
|---|---:|
| Unique atomic assessment units | 893 |
| Unique non-scoring containers | 379 |
| Unresolved context-only records | 128 |
| Marking rows | 927 |
| Scoring links | 893 |
| B21 parent-context marking rows | 34 |
| Displayed marks | 2,250 |
| Papers | 30 |
| Marks per paper | 75 for every paper |

All 2,327 aggregate rows containing a preserved `source_record` were compared as parsed values with the exact pinned source line named by their lineage. Mismatches: 0. Atomic, container and unresolved source sets equal the five accepted batch sets. All containers, unresolved rows and parent-context marking rows remain non-scoring; none appears as a pattern occurrence. All official conditions, explicit alternatives, locators, context/visual dependencies and marking kinds remain equal to their accepted source records.

## Pattern and reference checks

- Atomic-to-occurrence relation: 893 to 893, exact bijection; duplicate or dangling occurrence references: 0.
- Atomic-to-scoring-link relation: 893 to 893, exact bijection.
- Catalog: 498 rows; every row remains `PROVISIONAL_PRE_EQUIVALENCE`, `NEEDS_REVIEW`, `PENDING`, with null equivalence-group count.
- Recomputed each catalog row's raw occurrence count and distinct-paper count from `PATTERN_EVIDENCE.jsonl`; count mismatches: 0.
- Recomputed command words, marking behaviours, evidence kinds, source-pattern IDs and source-candidate references; mismatches: 0.
- Named official examples and boundaries: 1,355 references, 857 unique assessment units; dangling IDs: 0; examples outside their occurrence set: 0; boundaries inside their occurrence set: 0.
- Single-occurrence patterns reviewed: 332. Each has a resolved occurrence, official example, actual boundary/counterexample and pinned source-candidate reference.
- Scope-state population reviewed: 12 `PARTIAL`, 3 `NEEDS_REVIEW`, 0 `SUPPORTING`, 0 `OUT_OF_SCOPE`. Their accepted quarantine/partial rationale is preserved.
- Mixed-scope patterns: 0. Atom-level mixed-requirement patterns inspected: 38. Ten of these breach the catalog's declared required-match rule and are reported as Major findings.
- All 34 B21 parent-context marking rows were reviewed; every row has null assessment unit and marks, `eligible_for_item_scoring=false`, and no occurrence.

## Source checks

Original QP/MS PDFs under `Past_Papers` were used. All named official-example and boundary/counterexample units were resolved to their cited QP and MS source IDs and 1-based pages. Across 857 unique units, 632 distinct QP/MS pages were extracted; missing PDF/page failures: 0. Four long excerpts had less than 0.70 token overlap with the single cited QP page because their preserved excerpt includes context from the preceding page. Those four locators were manually read; the cited page contains the target part and mark allocation, so no source error was recorded.

The deterministic sample used seed `P1-S2-C3A-A3-v1`. Two units per paper were selected by sorting SHA256 of `seed + "|" + assessment_unit_id`. All 60 QP/MS locator checks passed:

| Paper | Sampled assessment units |
|---|---|
| 9618_s21_qp_11 | `AU-9618_s21_qp_11-q8`; `AU-9618_s21_qp_11-q1-pc-pi` |
| 9618_s21_qp_12 | `AU-9618_s21_qp_12-q8-pc`; `AU-9618_s21_qp_12-q6-pc-pii` |
| 9618_s21_qp_13 | `AU-9618_s21_qp_13-q3-pb`; `AU-9618_s21_qp_13-q1-pa-pii` |
| 9618_s22_qp_11 | `AU-9618_s22_qp_11-q4-pa`; `AU-9618_s22_qp_11-q5-pc` |
| 9618_s22_qp_12 | `AU-9618_s22_qp_12-q1-pbii`; `AU-9618_s22_qp_12-q1-pd` |
| 9618_s22_qp_13 | `AU-9618_s22_qp_13-q6-pbii`; `AU-9618_s22_qp_13-q5-paii` |
| 9618_s23_qp_11 | `AU-9618_s23_qp_11-q3-pd-pvi`; `AU-9618_s23_qp_11-q2-pb-piii` |
| 9618_s23_qp_12 | `AU-9618_s23_qp_12-q4-pa`; `AU-9618_s23_qp_12-q5-pa` |
| 9618_s23_qp_13 | `AU-9618_s23_qp_13-q5-pa-pi`; `AU-9618_s23_qp_13-q5-pa-pii` |
| 9618_s24_qp_11 | `AU-9618_s24_qp_11-q6-pc-pii`; `AU-9618_s24_qp_11-q2-pa` |
| 9618_s24_qp_12 | `AU-9618_s24_qp_12-q3-pb`; `AU-9618_s24_qp_12-q6` |
| 9618_s24_qp_13 | `AU-9618_s24_qp_13-q2-pc`; `AU-9618_s24_qp_13-q3-pb` |
| 9618_s25_qp_11 | `AU-9618_s25_qp_11-q7-pb`; `AU-9618_s25_qp_11-q5-pc` |
| 9618_s25_qp_12 | `AU-9618_s25_qp_12-q2-pc`; `AU-9618_s25_qp_12-q7-pb-pii` |
| 9618_s25_qp_13 | `AU-9618_s25_qp_13-q7-pb`; `AU-9618_s25_qp_13-q2-pb` |
| 9618_w21_qp_11 | `AU-9618_w21_qp_11-q3-pb`; `AU-9618_w21_qp_11-q4-pd` |
| 9618_w21_qp_12 | `AU-9618_w21_qp_12-q8-pa-pii`; `AU-9618_w21_qp_12-q2-pa` |
| 9618_w21_qp_13 | `AU-9618_w21_qp_13-q8-pa`; `AU-9618_w21_qp_13-q7-pa-pii` |
| 9618_w22_qp_11 | `AU-9618_w22_qp_11-q1-pdi`; `AU-9618_w22_qp_11-q3-pa` |
| 9618_w22_qp_12 | `AU-9618_w22_qp_12-q8-pci`; `AU-9618_w22_qp_12-q7-pbiii` |
| 9618_w22_qp_13 | `AU-9618_w22_qp_13-q9-pb`; `AU-9618_w22_qp_13-q8-pai` |
| 9618_w23_qp_11 | `AU-9618_w23_qp_11-q6-pa`; `AU-9618_w23_qp_11-q6-pc-pi` |
| 9618_w23_qp_12 | `AU-9618_w23_qp_12-q6-pa`; `AU-9618_w23_qp_12-q4-pb` |
| 9618_w23_qp_13 | `AU-9618_w23_qp_13-q1-pb`; `AU-9618_w23_qp_13-q8-pb` |
| 9618_w24_qp_11 | `AU-9618_w24_qp_11-q4-pb-pi`; `AU-9618_w24_qp_11-q2-pb-pii` |
| 9618_w24_qp_12 | `AU-9618_w24_qp_12-q5-pa`; `AU-9618_w24_qp_12-q7-pa-pi` |
| 9618_w24_qp_13 | `AU-9618_w24_qp_13-q4-pe`; `AU-9618_w24_qp_13-q5-pb` |
| 9618_w25_qp_11 | `AU-9618_w25_qp_11-q6-pc`; `AU-9618_w25_qp_11-q1-pb-pii` |
| 9618_w25_qp_12 | `AU-9618_w25_qp_12-q7-pb`; `AU-9618_w25_qp_12-q5-pc` |
| 9618_w25_qp_13 | `AU-9618_w25_qp_13-q2-pb`; `AU-9618_w25_qp_13-q7-pa` |

## Sensitive boundaries

- Fetch/decode/execute, registers and buses: the 35 relevant units and their 26 patterns preserve separate requirement, response and action boundaries except where Major findings identify a declared-key mismatch (`PAT-C3A-0222`, `PAT-C3A-0223`).
- Bitmap arithmetic and bit depth: source locators and marking evidence are correct. `PAT-C3A-0004` is a Major boundary defect because it combines two accepted requirement sets and overlaps the exact key already represented by `PAT-C3A-0010`.
- Checksum: four relevant units preserve `REQ-6.2-03-04`; no catalog text promotes checksum to an absolute guarantee.
- Check digit: the frozen corpus has no accepted occurrence for `REQ-6.2-02-07`; no unit was misclassified as direct check-digit coverage.
- Syllabus 8.3 continuation: 50 units across nine catalog patterns were reviewed. `PAT-C3A-0490` and `PAT-C3A-0493` contain heterogeneous accepted requirement sets and overlap the declared keys of `PAT-C3A-0491` and `PAT-C3A-0494`.
- B24 IDE partial scope: `AU-9618_w24_qp_11-q4-pd-pi` remains `PARTIAL`; expand/collapse is retained as in-scope and auto-indentation/formatting remains quarantined. No scope promotion occurred.

## Conflict carry-forward and prohibited claims

`GAP_CONFLICT_REPORT.md` carries both the frozen wrong B25 documentation ID `VC-B25-0021` and the controlling ledger/QA identity `VC-B25-0041`, explicitly describing the former as documentation-only and non-gating.

No final equivalence, final `ESTABLISHED`/`SINGLETON`, predictive-frequency, split/holdout, lesson, translation, app or Stage 3 claim was found.

## Required correction and retest

A4 C3a must rebuild the provisional catalog and occurrence assignments under one reproducible rule. Under the currently declared exact required-match rule, the ten heterogeneous patterns must be split and the six duplicate exact-key partitions must be merged; catalog IDs/counts, examples, boundaries, evidence, QA, manifests and handoff must then be regenerated. If A0 authorizes a different semantic override rule, that rule must be explicit, reproducible, source-backed and reflected truthfully in each definition and exclusion before independent retest.

After correction, a fresh independent reviewer must rerun all count, set, source, catalog-key and sensitive-boundary checks. A0 alone may accept C3a or open C3b.
