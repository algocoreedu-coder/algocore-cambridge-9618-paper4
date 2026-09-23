# A3 source risk retest — B21 A2-v2

Input snapshot: active A2 B21-v2 manifest SHA-256 `db21bde326d1b4b487b6424b5fd210c19fd415835e2d8aa52523a36524b94612`; question index `72435a2f2b16b994b47348d139eddf05986a4e1968a45e0613bbb5572269c00d`; context index `766959b872a0ad6e6ec013c98a07ef772aa09c49e442590cf5aa9d99fb60c96a8`; visual manifest `a9ed2fd95f2dc45f83afcce963b577b737020078cdd1cd3cefc46ae2ab827f65`. The full input-hash list and all twelve source hashes/page counts are in `HANDOFF_RETEST_V2.json`.

## Source identity and scope

Recomputed each original PDF SHA-256 and opened each PDF to count pages. All 12 QP/MS files match the corresponding Stage 0 manifest and active A2-v2 source entries: 12/12 hashes and page counts, 154 pages total. The active syllabus PDF hash also matches Stage 0's 2026 v2 authority and the recorded official-copy hash. The source papers are historical 2021 documents; the review preserves that distinction and makes no frequency, equivalence, coverage, or current-marking claim.

The S21 p16 topics are within current scope at topic level: data dictionary under syllabus §8.2, PDF p26; logic gates/truth tables under §3.2, PDF p18. This check does not approve the extracted question IDs or marks; those currently disagree with the source structure.

## Page/context and visual risks

I checked active context records for the continuation cases raised in A3-v1. The specific previously flagged spans now include their cited pages: S21 QP11/13 Q1 pp2–4 and Q3 pp6–10; S21 QP12 Q1 pp2–3; W21 QP11/13 Q6 pp11–13; W21 QP12 Q8 pp13–16. W21 QP11/13 Q1 records now point to p2 and Q6 to p11. These targeted corrections pass.

The new S21 QP11/13 p15–16 case remains a major source-context risk. Each Q7 source prompt begins on p15, continues on p16 with Q7(b)(iii) and Q7(c), then p16 begins Q8. Yet each active Q7 context lists only p15; each Q8 context correctly lists p16. The p16 whole-page visual regions and renders exist, but their `relates_to_ids` arrays contain only the Q8 root. The page should remain shared between Q7 and Q8 in context and visual relationships.

The two page-16 renders were inspected. Each visibly shows Q7(b)(iii) `[1]`, Q7(c) `[3]`, followed by a distinct unlettered Q8 logic-gate table with its own `[3]`. The active part index instead has `9618_s21_qp_11-q8-pc` and `9618_s21_qp_13-q8-pc` with label `c`, page 16, displayed marks 3, `UNRESOLVED`, and null MS locator. Those rows correspond to preceding Q7(c), not a printed Q8(c). The Q8 root rows have null displayed marks, and there are no Q7(b)(iii) or Q7(c) child records. Preserve the exact printed hierarchy and both separate marks; do not infer an unprinted Q8(c). A4's `RETEST_V2.md` independently reports the same source-attribution issue and keeps its result `CHANGES_REQUIRED`.

I also checked all active visual target references against the question roots and context files: all target IDs exist, no target crosses source IDs, each existing target's context includes the region's PDF page, and no render reference is missing. That structural/context check does not catch an omitted target by itself; the p16 regions each target Q8 only, so they still omit the Q7 root even though Q7 is visibly on that page.

The eight visual entries added for prior A3-VIS-01 pages now have existing render files and source-matching question-root targets. Their `reviewer_status` remains `RENDER_REQUIRED_V2`, so status/evidence reconciliation is still needed. The frozen v1 visual count (51 total; 18 non-empty relations; 33 empty; 20 relation occurrences) is reconciled. Active v2 has 59 total; 48 non-empty relations; 11 empty; 48 relation occurrences; all 59 referenced renders exist. These inventory checks do not demonstrate complete risk coverage or sufficient row-level visual dependencies.

## Findings and owners

| ID | Severity | Evidence / risk | Owner and retest |
|---|---|---|---|
| `A3-B21-CTX-02` | Major | Q7 p16 missing from both S21 Q7 context spans. | A2-B21 via A0 repairs both Q7 spans while retaining Q8 p16; A3/A4 compare next frozen version to both originals. |
| `A3-B21-CTX-03` | Major | Q7(b)(iii)/Q7(c) omitted or attributed under Q8(c); both question-level displayed `[3]` marks not represented at the correct levels. | A2-B21 via A0 restores source hierarchy and marks; A4 checks QP/MS and A3 checks context before A9 review. |
| `A3-B21-VIS-01` | Major | Both p16 page regions point only to Q8 despite containing Q7 continuation and Q8. | A2-B21 via A0 records both source-supported roots; A3/A9 retest relation targets. |
| `A3-B21-VIS-02` | Minor | Eight new visual records remain `RENDER_REQUIRED_V2` while renders exist. | A2-B21 via A0 aligns status with actual evidence; A9 verifies claims. |
| `A3-B21-REV-01` | Minor | Counts reconcile, visual adequacy does not. | A9 checks row-level relations and missing-risk coverage on the same frozen version. |

No source PDF or A2/A4 artifact was changed. All questions remain in the historical corpus; unresolved attribution stays unresolved pending a new A2 version and independent retest.
