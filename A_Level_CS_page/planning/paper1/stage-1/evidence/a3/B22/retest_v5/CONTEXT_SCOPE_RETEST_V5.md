# B22 A3 v5 context and source retest

Task: P1-S1-A3-B22-RETEST-V5. Candidate: frozen B22-A2-v5. **Recommendation: PASS for the A3 source/context/scope gate only.** A4 v5, A9 and A0 remain mandatory; this is not batch acceptance.

## W22/13 Q6(b)(iii)

Original W22/13 QP PDF p.13 visibly prints (iii). The pinned page transcript also contains “(iii)” before the LSR #2 prompt. Candidate CORRECTION_EVIDENCE.json now records source_page_label_token_verified as “(iii)”; the matching Question Index record remains Q6(b)(iii) with its QP locator on PDF p.13 and transcript p.13. This resolves the prior A3-B22-V4-01 annotation finding. The source locator itself was already correct in v4; the finding concerned the evidence token only. Page render hash and transcript hash are pinned in SOURCE_EVIDENCE_MANIFEST_V5.json and the findings JSON.

## Correction and review-union counts

I recomputed the distinct sets from the 7 mark-correction rows and 12 locator-correction rows. They are 19 rows across 18 corrected record IDs and 11 unique correction source pages. The declared changed-visual-region set has 12 source pages; six QP covers add six pages; seven correction pages overlap the changed-visual set. The deduplicated union is 22 unique (source_id, PDF page) pairs. The arithmetic matches the frozen REVIEW_UNION_MANIFEST and its enumerated page set.

The 18 legacy v4 PNG assets are a file count: 17 are members of the 22-page union and one is the S22/12 p.16 supplementary blank page outside it. Five additional pages were rendered directly in v5. Thus 18 is neither a correction-page count nor the union page count. All 22 union pages were full-page visually inspected; every candidate render hash matches its manifest and its v4 baseline where reused. The out-of-union supplement is separately identified in the source manifest.

## Source accuracy, mark totals and preservation

All 19 correction rows were checked against the original QP page renders and their page transcripts. The seven visible displayed-mark corrections match the candidate question/part rows. The twelve locator corrections point to the page showing the nested label, and transcript refs/hash pins resolve to that same PDF page. All twelve original QP/MS PDFs were independently rehashed and page-count checked against Stage 0, totaling 166 pages.

I independently summed the non-null question-root and part displayed marks for all six QPs. Each sum is 75, matching the printed total on its full-page original cover. Totals were used only as integrity checks; no mark was inferred from a cover total.

PAGE_INDEX.jsonl, QUESTION_INDEX.jsonl, MARKING_INDEX.jsonl, VISUAL_MANIFEST.json and UNRESOLVED.md are byte-identical to v4. I also recomputed the entire v4/v5 candidate file delta: changed, added and deleted paths exactly match the frozen semantic-diff allowlist. No context, transcript, question, mark, locator, dependency or unresolved record drift occurred. The v5 revision is metadata/evidence and source-render scope only.

## Source scope and page-screen limits

Authority remains the pinned Cambridge 9618 2026 v2 syllabus, Paper 1 sections 1–8, and Stage 0 scope review. The historical W22/13 Q1(b) sound-file-size arithmetic example remains labelled SUPPORTING under §1.2, not a separate required objective. No new out-of-scope record, coverage claim or frequency claim is introduced.

Twelve reviewer-generated contact sheets cover all 166 original source pages at reduced scale. They are a broad screen, not full-page semantic inspection. Full-page visual review for this retest covers the exact 22-page review union; no additional full-page coverage is claimed beyond the separately examined S22/12 p.16 supplement. Cambridge remote authenticity is not independently checked; source PDFs match the local Stage 0 SHA256 pins.

## Gate result

Both v4 MINOR evidence-metadata findings are resolved: A3-B22-V4-01 now has the correct (iii) token while the locator remains p.13; A3-B22-V4-02 uses the correct 19/18/11/12/6/7/22/18/5 set semantics. No new A3 defect was found. Recommendation: **PASS for A3 only**. A4 v5, A9 and A0 batch decision remain open. Candidate, source PDFs, tracker and app were not edited.
