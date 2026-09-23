# A9 independent C1 correction retest

Review work order: `P1-S2-A9-C1-V2`. Review date: 22/09/2026. Reviewer role: A9, independent of the author and specialist-review artifacts.

## Recommendation

`PASS_RECOMMENDED`. Finding counts: **0 Critical, 0 Major, 0 Minor**.

Prior finding `S2-C1-A9-001` is **CLOSED for calibration-v2**. This recommendation is evidence for A0; it does not accept C1, open C2 or decide the Stage 2 gate.

## Integrity and accepted chain

- Rehashed all **57/57** entries in the issued V2 manifest with zero byte or SHA-256 mismatch.
- Rehashed all **31/31** authority, governing and accepted-batch pins nested in `INPUT_BASELINE.json`; Stage 0/1 authority has not drifted.
- Recomputed C0 invariants from the frozen corpus: 247 questions, 1,025 parts, 893 atomic assessment units, 379 non-scoring containers, 927 marking rows, 893 exact scoring links, 2,250 marks across 30 papers of 75 marks, 128 unresolved rows and 233 command-word observations.
- Reconfirmed foundation-v1: 99 unique parents, 205 requirements, 99 planned units, eight domains, 17 sections, all checked refs resolved and a 62-edge acyclic HARD graph.
- Reconfirmed glossary-v1-r1: 96 unique glossary rows, 27 command-register rows, 123 source refs, 69 corrected non-command rows, protected command content unchanged and `S2-GLO-A3-001` closed by the independent A3 retest.
- Rehashed 203 nested author/reviewer manifest entries without mismatch. The calibration correction author is A4 and the all-target retester is a fresh A3; the foundation and glossary review roles remain different from their authors.

## Calibration-v2 retest

All 25 frozen calibration target IDs remain in the original order. Every target resolves to one atomic unit and exactly one official marking item. I independently checked target ID, QP label and content, marking ID, MS label and content, displayed marks, source paths/hashes and classification for all 25 rows. The 24 unique QP/MS PDF files match the accepted corpus source hashes.

Only `CAL-14` and `CAL-15` changed semantically from calibration-v1; the other 23 records are identical.

- `CAL-14` remains bound to `9618_s24_qp_11-q5-pa` and `9618_s24_qp_11-q5-pa-mi-1`. Its source observation now describes Q5(a), the four-mark bank client/server role task. Its response classification is role description and its family fit is `MISMATCH`; the neighbouring five-mark parity task Q5(b) is no longer attributed to this target.
- `CAL-15` remains bound to `9618_w25_qp_12-q2-pa` and `9618_w25_qp_12-q2-pa-mi-1`. Its source observation now describes Q2(a), the four-row Copyright/Open Source/Shareware/Software Licence definition table. Its classification is term-definition rows and its family fit is `MISMATCH`; the neighbouring two-mark verification-method task Q1 is explicitly excluded.
- The independently recomputed fit distribution is **13 MATCH, 5 PARTIAL and 7 MISMATCH**. It agrees with calibration-v2 and the fresh A3 review.
- Twenty rows with null target command-word observations retain separate source-inspected command words. Source observation and analyst classification remain separate. No unresolved row was promoted and no predictive-frequency claim was introduced.

## Finding closure

`S2-C1-A9-001` required the two frozen targets to describe and classify their own QP/MS evidence, without replacing the frozen sample IDs or preserving the invalid 14/6/5 distribution. Calibration-v2 implements that correction, freezes the 23 unchanged rows, and records the resulting 13/5/7 distribution. The fresh A3 reviewer also reviewed all 25 source bindings and recommended closure. The Critical finding is therefore closed for calibration-v2.

## Gate boundary

The five V2 review outputs are frozen for A0 audit. A9 did not edit any author/reviewer/top-level artifact, close C1 or dispatch C2.
