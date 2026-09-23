# A3 B22 v4 context and scope retest

**Recommendation: PASS for the A3 source/context/scope gate only, with two deferred MINOR evidence-metadata findings.** This is not batch acceptance. A4 same-version review, A9 independent batch review, and A0 batch decision remain required.

## Frozen target and method

Retested the frozen `B22-A2-v4` handoff, all 413 candidate snapshot artifacts, prior A3/A4 findings, Stage 0 authority, and the 12 original B22 QP/MS PDFs. Candidate `HANDOFF_CHECK.json` SHA-256 is `3a83c90b96ec716e8187ee37c71db1b700f14cc10b4aec6fabc5db57beb0164`; `SNAPSHOT_MANIFEST.json` is `74b65bdc167d33fe716755afcbe2d1fe21242c708b44bb7a2f50f6e7f494d02e`. Every snapshot artifact hash and all 34 pinned inputs recomputed without mismatch. The 12 source PDFs match Stage 0 and candidate baselines and their recorded page counts, totaling 166 pages. The A0 structural validator and handoff/integrity audit are separately pinned; their PASS does not substitute for this semantic source review.

I independently checked all seven changed mark rows and twelve changed nested-child QP locators against the original paper render pages. All seven candidate values now match the visible marks. Each of the six indexed QP totals sums to 75 and agrees with its cover. I did not infer or allocate any individual marks from the mark scheme. All twelve changed locator rows now point to the page containing the target and have a transcript reference to that same PDF page. The six prior whole-question targets retain question-level targets (no invented child parts), and the removed false W22/12 Q1(c) record remains absent. Prior hierarchy cases, unresolved-parent policy, cross-page contexts, visual-region/dependency linkage, and schema targets were rechecked as detailed in `CONTEXT_SCOPE_FINDINGS_V4.json`.

## Source-backed results

| QP source | Indexed displayed-mark rows | Indexed sum | Original cover total | Result |
|---|---:|---:|---:|---|
| `9618_s22_qp_11` | 25 | 75 | 75 | PASS |
| `9618_s22_qp_12` | 29 | 75 | 75 | PASS |
| `9618_s22_qp_13` | 27 | 75 | 75 | PASS |
| `9618_w22_qp_11` | 36 | 75 | 75 | PASS |
| `9618_w22_qp_12` | 36 | 75 | 75 | PASS |
| `9618_w22_qp_13` | 35 | 75 | 75 | PASS |

The seven corrected displayed marks independently visible in the source are: S22/11 Q4(c)(i), p8 `[5]`; S22/12 Q2(c), p4 `[1]`, Q4(b), p7 `[6]`, Q4(c), p7 `[2]`; W22/12 Q8(c)(ii), p16 `[2]`; W22/13 Q6(a)(i), p11 `[4]`, Q6(a)(ii), p12 `[2]`. The exact record IDs, render paths and render hashes are in `CONTEXT_SCOPE_FINDINGS_V4.json` and the source render manifest.

The twelve nested-child QP locator corrections independently resolve to: S22/11 Q2(c)(i)/(ii) → p5 and Q6(c)(i)/(ii) → p14; W22/11 Q1(d)(ii) → p3 and Q6(b)(i)/(ii) → p16; W22/12 Q8(c)(i)/(ii) → p16; W22/13 Q6(b)(i) → p12 and Q6(b)(ii)/(iii) → p13. Transcript references point to those same pages. For W22/13 Q6(b)(iii), keep the QP locator result separate from the evidence-note discrepancy described under Findings: the actual QP locator is correct.

The prior whole-question targets remain source-supported: S22/12 Q7 `[2]` and Q8 `[3]` → MS12 p8; W22/11 Q2 `[4]` → MS11 p3 and Q8 `[4]` → MS11 p10; W22/12 Q9 `[2]` → MS12 p10; W22/13 Q3 `[4]` → MS13 p3. The part target is null for each. Six original QP covers independently show 75 marks.

The two known multi-page contexts still retain their full spans: W22/11 Q4, six context parts across QP pp.6–8; W22/12 Q7, seven context parts across pp.10–14. There are 88 visual regions and 104 marking dependencies; all region related IDs resolve, all dependency references resolve to the matching MS source/page, and all designated region pages have a full-size render. Statuses remain 64 `A2_VISUALLY_INSPECTED_PENDING_INDEPENDENT_REVIEW` and 24 `RENDERED_PENDING_INDEPENDENT_REVIEW`; A3 did not upgrade candidate visual status. The 32 item-specific unresolved parent-container rows remain retained and match the unresolved register; there are no dangling parent IDs or cycles. Six-question/part counts remain 52 top question rows + 214 part rows = 266 question index rows, with 188 marking rows across the corpus.

## Page set and review coverage

Per the frozen A0 page-set addendum, the correction-row set is derived from 19 correction rows (seven mark rows and twelve locator rows), which target 18 distinct record IDs on 11 unique source pages. The twelve changed QP visual-region pages and six QP covers yield a deduplicated union of **22 unique `(source_id, PDF page)` pairs**. The full page identities and roles are machine-listed in `CONTEXT_SCOPE_FINDINGS_V4.json` under `page_set_reconciliation` and in `SOURCE_RENDER_MANIFEST.json`.

The candidate has 18 correction PNG assets, not 18 distinct correction-row pages: 11 correction-row source pages + six covers + supplementary S22/12 QP p16. Its `CORRECTION_EVIDENCE.json.counts.unique_direct_source_pages` declares 18; the source-page count for correction rows is 11. This declaration is the subject of deferred MINOR finding `A3-B22-V4-02`.

A3 full-size inspected all 99 pages enumerated in `SOURCE_RENDER_MANIFEST.json`: all 88 visual-region pages, all six QP covers, and five additional pages (W22/11 QP p3 correction target; S22/12 QP p16 supplementary render; W22/11 QP p8 cross-page context; W22/11 QP p19 whole-question target; W22/11 MS p10 whole-question target). This includes all pages in the 22-page addendum union. The 12 contact sheets are a separate reduced-scale screen of all 166 source PDF pages; they are not claimed as full-resolution review. `SOURCE_RENDER_MANIFEST.json` records per-page source, render, dimensions and SHA-256, all 99 render hashes, all 12 contact-sheet hashes and source page coverage. The focused 4x crop is supplemental legibility evidence only; the page render remains authoritative.

## Scope boundary

Authority remains the Cambridge International 9618 2026 v2 syllabus, sections 1–8, under the pinned Stage 0 scope review and plan. The v3/v4 question IDs are identical; 18 changed records alter only displayed-mark or QP-locator/transcript-page metadata. The v4 delta introduces no new prompt topic and no new out-of-scope prompt was identified. Retain W22/13 Q1(b), PDF p3 sound-file-size arithmetic, as `SUPPORTING` under syllabus §1.2; do not present it as a standalone objective. This is an A3 source-scope observation, not a lesson coverage, frequency, or course completeness claim.

## Findings and gate disposition

1. **`A3-B22-V4-01` — MINOR, deferred.** In candidate `CORRECTION_EVIDENCE.json`, locator correction row for `9618_w22_qp_13-q6-pbiii` claims `source_page_label_token_verified: "ii)"`. Original `9618_w22_qp_13`, PDF p13, visibly prints `(iii)`; see the 2x render and 4x label crop in the source manifest. The v4 QUESTION_INDEX row label `(b)(iii)`, QP PDF p13 locator, and p13 transcript reference all match the original and pass. Defect is limited to the correction-evidence annotation. Owner A2; correct in a versioned evidence update and have A4 retest.
2. **`A3-B22-V4-02` — MINOR, deferred.** Candidate `CORRECTION_EVIDENCE.json.counts.unique_direct_source_pages` says 18, while its 19 correction rows occupy 11 unique `(source_id, PDF page)` pairs. Eighteen is the PNG asset count (11 correction pages + six covers + one supplement), not the correction-source-page count. A3 reviewed the actual 22-page union and all correction rows. Owner A2; correct the field/definition in a versioned update and have A4 retest.

Both are evidence metadata defects only; neither renders the corpus record or source locator incorrect. There are zero open Critical or Major A3 findings. The Stage 1 `LEAD_PLAYBOOK.md` allows a Minor finding to be deferred when it does not make the corpus incorrect and a named owner and retest are recorded. Accordingly the A3 gate recommendation is **PASS with two documented Minor deferrals**. Do not treat this as the B22 batch gate: A4 same-version retest, A9 independent batch/evidence review, and A0 batch decision are still mandatory.

See `SOURCE_RISK_RETEST_V4.md` for source-risk classes; `SCOPE_FLAGS_RETEST_V4.json` for the structured scope boundary; `CONTEXT_SCOPE_FINDINGS_V4.json` and `SOURCE_RENDER_MANIFEST.json` for criterion-level evidence and hashes; and `HANDOFF_RETEST_V4.json` for frozen input/output pins. Candidate files, source PDFs, app, and trackers were not edited. Stop here for A0 integrity verification.
