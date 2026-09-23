# B21 A3 v6 context, source and scope retest

Task: P1-S1-A3-B21-RETEST-V6. Candidate: frozen B21-A2-v6. **Recommendation: PASS for the A3 gate only.** A9 v6 and A0's batch decision remain required; this is not batch acceptance.

## Exact Q8 context correction

I rehashed the 12 original B21 Paper 1 QP/MS PDFs against Stage 0 and rendered the relevant original question pages at 2x. The three corrected Q8 records now retain exactly their true prompt pages: S21/12 Q8 on PDF p.14; W21/11 Q8 on p.15; and W21/13 Q8 on p.15. S21/12 p.15 is headed BLANK PAGE and p.16 carries copyright/imprint matter; W21/11 p.16 and W21/13 p.16 are likewise blank/imprint pages. Those four pages are not part of the respective Q8 prompts. Candidate context JSON and matching CONTEXT_INDEX entries both carry only the source-backed Q8 page and no false continuation pages. Their full-size render hashes are pinned in SOURCE_EVIDENCE_MANIFEST_V6.json.

## Legitimate continued context and Q1

S21/11 and S21/13 Q7 each starts on p.15 and continues on p.16, with Q8 beginning on p.16 as a shared-page case. Their Q7/Q8 context records are unchanged from v5; matching MS p.9 Q7 and p.10 Q8 pages were inspected full-size. W21/12 Q7 remains on p.12 and Q8 starts p.13 with continuation through pp.14–16; I inspected the full Q8 sequence. Its context and all other legitimate Q7/Q8 shared or continuation records remain byte-identical to v5.

The inherited W21/12 whole-question Q1 correction also remains exact: the original QP p.2 prints Q1 [2], and the MS p.3 contains one Q1 row totalling 2 marks across the Data Security and Data Integrity conditions. The candidate stores mark 2 on the unparted Q1 root and links one exact-label whole-question MS item to p.3 and its whole-page visual dependency. It does not assign an inferred mark to either condition.

## Semantic delta, unresolved parents and scope flags

I independently rehashed all 313 candidate snapshot files and recomputed the v5-to-v6 directory delta: 10 existing files changed, 3 files added, and 0 deleted. The ten changed files are the three target context records, CONTEXT_INDEX, correction evidence and revision/validation handoff metadata. No question, marking, page, visual, transcript, source, dependency, unresolved or unrelated context data changed; all 45 non-target context records and the five protected corpus files are byte-identical to v5. A0's pinned independent audit separately recomputes 10/3/0 and lists the same allowed paths.

There is one MINOR evidence-metadata note: the candidate's V5_TO_V6_SEMANTIC_DIFF `changed_existing` array also repeats the three newly added files, each with `change_type: added`, while its top-level `added` list correctly lists those same three files. This is duplicated presentation in the diff manifest only; the actual path delta is 10/3/0, independently confirmed by A0, with no candidate content impact. Owner for aggregate manifest clarification: A0. It does not block the A3 source/context/scope gate.

All 34 `PARENT_CONTEXT_ONLY` marking records remain `UNRESOLVED`, with mark/condition and table-row fields null; the 34 records are byte-identical to v5. Scope authority remains the pinned 2026 syllabus and Stage 0 scope artifacts. The retained S1-I14 historic digest note stays MINOR/nonblocking. The 2021 source corpus does not prove 2026 lesson coverage, frequency, or variant equivalence, and no such claim is made here.

## Source and visual review

All 12 local QP/MS PDFs match the Stage 0 SHA256 pins and total 154 pages. Twelve contact sheets were screened at reduced scale for all 154 pages. I inspected 44 full-size original-page renders: the prior 31 risk/context/cover pages, nine pages covering p.14–16 of the three corrected QP sources, and four pages p.13–16 for the retained W21/12 Q8 sequence. The 44 page/render hashes, 12 contact-sheet hashes, and source pins are listed in SOURCE_EVIDENCE_MANIFEST_V6.json. Contact sheets are a broad screen, not full-page semantic validation. Remote publisher authenticity was not independently rechecked.

I independently summed all displayed QP root/part marks; all six papers total 75, matching the visible full-size cover statement. These sums are integrity checks only; no mark was inferred from the total.

## A3 gate disposition

The four false Q8 references are source-backed and removed; legitimate continued/shared Q7/Q8 context and the inherited whole-question Q1 correction are preserved. No A3 Major or Critical context/scope finding remains. Recommendation: **PASS_A3_ONLY**, with the MINOR diff-manifest duplication retained as a nonblocking A0 clarification item. A9 v6 and A0 batch decision remain open. Candidate, sources, tracker and app were not edited.
