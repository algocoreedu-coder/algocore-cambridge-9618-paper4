# A9 independent C1 gate review

Review work order: `P1-S2-A9-C1-V1`. Review date: 22/09/2026. Reviewer role: fresh A9, independent of C0, foundation-v1, calibration-v1, glossary-v1/glossary-v1-r1 and the specialist reviews.

## Recommendation

`CHANGES_REQUIRED`. Finding counts: **1 Critical, 0 Major, 0 Minor**. A0 must keep C2 closed.

The foundation package and glossary-v1-r1 satisfy the reviewed C1 requirements, and the frozen Stage 0/1 authority has not drifted. Calibration-v1 contains two source-binding errors that invalidate its claimed 25-row evidence review and its reported family-fit counts.

## Input and baseline integrity

- Rehashed all **65/65** entries in the issued input manifest: zero missing files, byte mismatches or SHA-256 mismatches.
- Rehashed all **31/31** authority, governing and accepted-batch pins nested in `INPUT_BASELINE.json`: zero drift.
- Recomputed the corpus invariants from `CORPUS_INDEX.jsonl`: 247 questions; 1,025 parts; 875 leaf parts plus 18 whole questions = 893 atomic assessment units; 379 non-scoring containers; 927 marking rows; 893 scoring links; 34 parent-context rows; 2,250 marks across 30 papers, each totalling 75; 128 unresolved rows; and 233 populated command-word observations. All 893 atomic targets have exactly one official marking target.

## Foundation and glossary results

- Foundation-v1 has 99 unique parent objectives, 205 requirements and 99 planned learning units across 8 domains and 17 sections. All checked references resolve. The 62 HARD prerequisite edges form an acyclic graph over all 99 units.
- Coursebook dispositions reconcile to 83 `NO_VERIFIED_BOOK_SUPPORT`, 14 `VERIFIED_EXCERPT`, one authority conflict and one caution. The four required source flags retain the syllabus-first boundaries for fetch–decode–execute/register/bus, bitmap arithmetic/bit depth, checksum certainty and check-digit classification.
- Glossary-v1-r1 has 96 unique terms and 27 command-register rows, with 123 source-reference instances. Exactly 69 non-command rows changed from v1 and reconcile to the 69-row correction delta. All 27 command objects and the command register are byte-identical to the A4-reviewed v1. Objective/pattern arrays remain empty and all 123 objects remain pending reconciliation. Vietnamese values remain candidate or null; no parity acceptance is claimed.
- The A3 retest closes `S2-GLO-A3-001` for glossary-v1-r1. Nested author/reviewer manifests rehashed without mismatch. Reviewer roles are different from the authors recorded in the packets.

## Blocking finding

### S2-C1-A9-001 — Critical — two calibration records bind neighbouring-question evidence to the frozen target

**Locators**

- `CALIBRATED_SAMPLE.jsonl`, `CAL-14`, target `9618_s24_qp_11-q5-pa`, marking target `9618_s24_qp_11-q5-pa-mi-1`.
- `CALIBRATED_SAMPLE.jsonl`, `CAL-15`, target `9618_w25_qp_12-q2-pa`, marking target `9618_w25_qp_12-q2-pa-mi-1`.

**Evidence**

- `CAL-14` is pinned to Q5(a), four marks. The frozen corpus marking row is Q5(a), identifying and describing the bank scenario's server and client. The calibration row instead summarises and classifies Q5(b), the five-mark parity/parity-block cloze task, and states a five-mark marking summary while retaining the Q5(a) locator and marking ID.
- `CAL-15` is pinned to Q2(a), four marks. The frozen corpus marking row is Q2(a), definitions of copyright, Open Source, shareware and software licence. The calibration row instead summarises and classifies Q1, the two-mark matching task for verification methods, while retaining the Q2(a) locator and marking ID. Its own `mark_or_condition_observed_or_null` starts with the Q2(a) software-term scheme and therefore contradicts its prompt/marking summaries and analyst classification.
- The frozen calibration sample manifest explicitly requires these exact target IDs and permits an observed family mismatch without silent replacement. The two records therefore cannot be repaired by switching to Q5(b) and Q1 under the same frozen calibration target set. They must describe and classify the actual frozen targets. This will change the current `MATCH=14, PARTIAL=6, MISMATCH=5` distribution, so the A9 acceptance packet must not keep those counts as a normative requirement after correction.

**Impact**

The two records attribute prompt, response-product and marking behaviour claims to the wrong atomic assessment units. This is a wrong-target/source claim under the Stage 2 severity rules. Using calibration-v1 to open C2 would train the mapping workflow on false source associations and would falsely report full QP/MS verification of all 25 targets.

**Owner and required fix**

Owner: A4 calibration author; A0 owns the dependent packet revision.

A4 must issue a new calibration artifact version that keeps the frozen target IDs, re-reads their exact QP/MS items, and rewrites `CAL-14` and `CAL-15` source observations, marking summaries and analyst classifications for Q5(a) server/client and Q2(a) software terminology. It must recompute family-fit counts rather than preserve the current 14/6/5 result. A fresh A3 reviewer must rehash and retest all 25 bindings, explicitly checking target ID, QP label/content, marking ID, MS label/content, displayed marks and classification. A0 must issue a new A9 review packet with corrected expected counts and a new exact input manifest.

## Gate boundary

This review does not edit calibration-v1, accept any author package, close C1 or dispatch C2. Outputs are frozen for A0 audit and correction assignment.
