# A3 context and syllabus retest — B21 A2-v2

Task: `P1-S1-A3-B21-RETEST-V2`  
Input: active `B21-A2-v2` (`SUBMITTED_FOR_RETEST`)  
A3 result: **CHANGES_REQUIRED**. This is an A3 retest only; A9 batch review remains a separate required gate.

## Evidence basis and integrity

I read the Stage 1 A3 work order/playbook and corpus schema, the Stage 0 source baseline and 2026 syllabus scope, the frozen A2-v1 snapshot, the active A2-v2 manifest/indexes/context files/visual manifest/revision notes, the original source PDFs, and A4's B21 A2-v2 retest report. I did not modify A2, A4, source PDFs, or app files.

I independently recomputed hashes for the active A2-v2 manifest and core indexes. Exact SHA-256 values are recorded in `HANDOFF_RETEST_V2.json`. I independently opened all 12 source PDFs and compared actual SHA-256 and PDF page counts against both Stage 0 `SOURCE_MANIFEST.json` and the active A2 manifest: **12/12 matched, 154 pages total**. The local official 2026 syllabus PDF hash is `bf1b77a2b765d10eb4b005ecae0412add35cf6113ba3218a517893abfc9f2470`, matching Stage 0 and its recorded official-copy comparison.

The active batch reports 48 question starts, 203 parts, 201 marking records, 48 context records and 59 visual regions. These counts do not establish correct attribution or completeness. All 48 question-start rows remain present; the specific defect below is a misattributed child and omitted Q7 parts, not deletion of a root question.

## Scope result

The source prompt on `9618_s21_qp_11` and `9618_s21_qp_13`, PDF p16, is within the topic scope at the level observed: Q7(c), data dictionary, relates to 2026 syllabus §8.2 DBMS, PDF p26 (“data management, including maintaining a data dictionary”); Q8's logic-gate truth-table task relates to §3.2 Logic Gates and Logic Circuits, PDF p18. The index's mistaken Q8(c) label does not change the source topic or justify removing either historical item. No clearly out-of-scope prompt was confirmed in this targeted retest.

These are 2021 historical questions. Their presence is not evidence of 2026 lesson coverage, exam frequency, variant equivalence, or current marking requirements. Keep the source year/session/component and require a separate 2026 objective citation for any later reuse.

## Context and hierarchy findings

**Major — S21 Q7 continues from p15 to p16, but both active Q7 contexts stop at p15.** The source on `9618_s21_qp_11` and `_13` PDF p15 starts printed Q7; p16 starts with the continuation `(iii)` under Q7(b), then prints Q7(c) with `[3]`, and only then starts Question 8. Active `contexts/9618_s21_qp_11-q7.json` and `...qp_13-q7.json` each list `all_context_pages: [15]` and no continuation page. Their matching Q8 context files correctly list p16, but p16 is shared context for both questions. This leaves Q7(b)(iii) and Q7(c) outside Q7's declared span. See `A3-B21-CTX-02` and `A3-B21-CTX-03`.

**Major — Q7(c) is indexed as Q8(c), and the printed question-level marks are not attached to their printed levels.** The two original p16 renders show Q7(b)(iii) `[1]`, Q7(c) `[3]`, followed by a separate, unlettered Q8 logic-gate table `[3]`. Active IDs `9618_s21_qp_11-q8-pc` and `9618_s21_qp_13-q8-pc` label the Q7(c) prompt as part `c` of Q8 and carry marks 3 with `UNRESOLVED` status and no MS locator. Conversely, the Q8 root records `...-q8` have `marks_displayed_or_null: null`, despite Q8's own displayed `[3]`. The active Q7 hierarchy has Q7(a), Q7(b)(i), and Q7(b)(ii), but no record for the printed Q7(b)(iii) `[1]` or Q7(c) `[3]`. Do not infer a Q8(c) from the table: the source prints no `(c)` label for Q8. This is a source-attribution/hierarchy observation, not a marking-point approval. See `A3-B21-CTX-03`.

The page-16 visual regions exist and render correctly, but `9618_s21_qp_11-p16-whole-page` and `...qp_13-p16-whole-page` each relate only to the Q8 root. Since the page visibly contains the Q7 continuation and Q7(c) as well as Q8, each region omits its Q7 relation. The Q8 context and Q8 visual target themselves are supported by p16. See `A3-B21-VIS-01`.

## Retest of prior A3 flags

- `A3-B21-CTX-01`: **resolved for the cited W21 Q1/Q6 locator defect.** In both `9618_w21_qp_11` and `_13`, active Q1 points to p2 and Q6 to p11; the corresponding question contexts point to those pages. This targeted retest does not certify every other source locator.
- `A3-B21-CTX-02`: **still open.** Previously cited continuation spans now include the evidence pages: S21 QP11/13 Q1 pp2–4 and Q3 pp6–10; S21 QP12 Q1 pp2–3; W21 QP11/13 Q6 pp11–13; W21 QP12 Q8 pp13–16. The new S21 QP11/13 Q7 omission on p16 remains a material gap.
- `A3-B21-VIS-01`: **partial.** The eight previously missing pages are now in the active manifest, their renders exist, and their targets match the listed questions: S21 QP11/13 pp3, 5, 10 and W21 QP11/13 p2. The separate p16 Q7 relation defect remains open.
- `A3-B21-REV-01`: **count reconciled only.** Frozen v1 contains 51 regions / 18 non-empty relations / 33 empty / 20 relation occurrences. Active v2 contains 59 / 48 / 11 / 48. All 59 listed render paths exist. These counts do not establish that every relation is semantically complete; A9 must independently review adequacy.

All eight new `*-v2` regions still carry `reviewer_status: RENDER_REQUIRED_V2` although their render files exist. This is a stale state requiring A2 reconciliation; it does not itself mean their source images failed. See `A3-B21-VIS-02`.

## Disposition

The source integrity checks and the targeted scope mapping pass. A3 cannot recommend batch acceptance while the Q7/Q8 attribution, displayed-mark level, Q7 continuation span, and p16 visual relation remain incorrect. Preserve all historical questions and unresolved records; have A2 issue a new immutable version, then retest against that version. A9's independent batch review is still required after A2, A3 and A4 evidence refers to the same version.
