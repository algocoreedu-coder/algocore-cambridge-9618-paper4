# B23 A3 context and scope retest — A2-v3

Task: `P1-S1-A3-B23-RETEST-V3`  
Disposition: **PASS for A3 retest criteria only.** The batch remains open pending the independent A4/A9/A0 gates. This report retests the frozen B23-A2-v3; it does not accept A2 extraction or mark interpretation.

## Basis and integrity

The active A2 version is `B23-A2-v3`, schema 1.1. Its manifest declares 12 original sources, 157 PDF pages, 47 questions, 205 parts, 178 marking items and 95 visual regions. I recomputed every hash in its 364-entry active artifact manifest: all 364 match, with no missing or mismatched file. I independently recomputed all 12 original QP/MS PDF SHA-256 values and opened/count-checked all pages. Every source hash and page count agrees with the Stage 0 source manifest and A2 manifest (157 pages total). The official local 2026 syllabus SHA-256 is `bf1b77a2b765d10eb4b005ecae0412add35cf6113ba3218a517893abfc9f2470`, matching Stage 0.

The 2026 syllabus controls scope; the 2023 QPs/MSs are historical source evidence, not a claim of 2026 coverage or frequency. No question/marking interpretation or lesson text is authored here.

## Retest matrix

| Criterion / prior finding | Result | Evidence and limit |
|---|---|---|
| Historical-source / syllabus scope guardrail (B23-SCOPE-01) | PASS | Batch remains location extraction for 2023 Paper 1, without 2026 coverage or frequency claims. Syllabus version 2, §§1–8, PDF pp.14–27, remains the scope authority. |
| Prefix wording and syllabus alignment (B23-SCOPE-02) | PASS | Original W23/12 QP PDF p.6 says “kibibyte” and “megabyte”; original W23/12 MS PDF p.4 supplies accepted comparisons; syllabus §1.1 PDF p.14 includes binary/decimal prefixes. Exact source pages were rendered and checked. |
| W23/11 Q8(c)(iii) visual context (B23-VIS-01) | PASS | Original QP PDF pp.14–15: instruction-set context on p.14 and eight boxed ACC bits plus XOR B00100101 on p.15. The A2 question/part context refs include both pages; the p.15 visual region relates to the exact part. Source renders inspected. |
| W23/12 Q9(b) context (B23-CTX-01) | PASS | Original QP PDF pp.14–15: p.14 points to p.15 for the initial memory/ASCII values; p.15 contains instructions, values, trace grid and printed [4]. A2 retains primary and context locators, the four-mark printed value and both page transcript refs. Source renders inspected. |
| W23/12 Q9(b) QP/MS dependency (B23-VIS-02) | PASS | A2 QP region on PDF p.15 and MS region on MS PDF p.11 target the question/marking item and preserve the dependency without inferred mark allocation. Source renders inspected. |
| A9 F01: 28 unresolved parent relationships | PASS for A3 scope; unresolved retained | All 28 are explicit, keyed unresolved parent relations; A2 does not invent a parent or lesson claim. Their source ambiguity remains for batch disposition; A4/A9 should independently inspect the exact hierarchy evidence. |
| A9 F02: six child-question corrections | PASS | Six corrections are present with their parent relation, marks and exact source locator. Direct QP PDF page renders were checked for W23/11 pp.7, 11, 13; W23/12 pp.6, 10; W23/13 p.13. Values/labels match the visible question pages; A4 independently retests linkage. |
| A9 F03: visual/context risks | PASS for A3 checks | No dangling visual targets were found. All 178 marking items have dependency refs to an existing visual region that also targets the item; each item is associated with one region on its exact MS source/page, with no cross-paper reference. This checks reference consistency, not correctness of every extracted marking-row boundary. |
| A9 F04: complete MS page screen | PASS | All 61 MS PDF pages were rendered into 11 screening sheets and visually screened. The 49 answer pages have regions; each of 178 marking items has an exact-page region, including 30 pages previously uncovered by A9 v2. The remaining 12 pages are six covers and six generic marking-principles pages. A4 must still independently validate row/item boundaries. |
| A9 F05: corrected W23/13 p.13 render | PASS | Corrected A2 render SHA-256 `f0f5d1c0537818b8e1596eeeb6d0dcf28dbc0bca86913814bbfdb57ae542e0d3` matches its correction provenance. Direct original QP PDF p.13 render was compared: the question heading and (a)(i) label are visible. |
| Schema 1.1 and hierarchy | PASS for retested constraints | A2 uses schema 1.1 nullable target fields; records checked for exactly one populated target. All question/part IDs are unique, part parents resolve where marked resolved, and unresolved relations are explicit. Counts match the indexes and manifest. |
| Source-risk and visual evidence | PASS with limitation | 61 MS pages were visually screened; all stated risk-page renders were compared to the original. I did not full-resolution inspect every A2 QP page render; those rely on A2 evidence and remain subject to independent A4/A9 checks. |

## Gate result

**A3 B23 retest: PASS.** This is a narrow A3 context/scope/source-risk retest against the frozen A2-v3. It is not batch acceptance. Keep the batch gate open until A4’s independent source/linkage review, A9’s full batch review and A0’s gate decision are recorded against the same hashes.

Detailed original-page renders and the 61-page MS screen sheets are in `retest_v3_renders/`; `RENDER_MANIFEST.json` lists each asset and its recomputable SHA-256.
