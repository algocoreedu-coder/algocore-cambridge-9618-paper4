# B22 A2 v5 — A9 independent batch retest

**Recommendation: PASS.** This is A9's recommendation for the frozen B22-A2-v5 package. A0 retains the batch decision. No Critical or Major finding was identified; `FINDINGS_V5.json` is empty.

Reviewed the frozen candidate `B22-A2-v5`. Exact pins: candidate handoff SHA256 `93dd40c9fe8172d07df01be9e9134ef3893ea1e29bd4f2a0b2524e37968c485e`; batch manifest `adf4f8fd9a465aac4dee9bd52e9b39ea15ca3a541757dc7d42acf0592402bfd3`; snapshot manifest `85dbffa1e2068b3baa49cd8cf99e0a6ed0729f2c10bae7438424babd14dd744a`. All 420 frozen candidate artifact hashes were recomputed and matched. All 12 original QP/MS PDFs matched the Stage 0 hashes and page counts, totaling 166 pages.

The same-version A3 and A4 handoffs and A0 audits were pinned and inspected: A3 `PASS_A3_ONLY` / A0 `PASS`; A4 `PASS_A4_ONLY` / A0 `PASS`. Their reports are supporting evidence; the A9 checks below were independently recomputed.

- Recomputed six QP mark totals from non-null marks on question-root and part rows. Each total is 75 and each original cover states 75. Checked all seven corrected displayed marks and twelve corrected nested locators against full-page original and candidate renders, index rows, source page labels and transcript pins.
- Confirmed original W22/13 QP PDF p13 prints `(iii)` before the Q6(b)(iii) prompt; candidate evidence, locator and label agree.
- Recomputed count meanings: 19 correction rows, 18 records, 11 correction source pages, 12 changed-visual pages, 6 covers, 7 overlaps, 22 union pages, 18 legacy assets (17 inside the union and one outside), and 5 new direct renders. All 22 page roles and render hashes agree.
- Rehashed the 200 reviewer-generated rendering assets: 166 page thumbnails, 12 contact sheets and 22 full-size source renders. Screened every original source page in the contact sheets. Visually inspected all 22 frozen candidate union renders alongside their full-size renders made directly from the originals. Sampled both visual-risk classes, including source and candidate MS p7 for nested answer labels and adjacent marks.
- Recomputed the question/part hierarchy, 32 unresolved parent containers, 188 marking targets, 104 marking visual dependencies, 88 visual regions, 13 context-required parts and 53 explicit context page references. No dangling or inconsistent question, part, page, transcript, marking, context-page, visual-region or render references were found. The two named context cues are descriptors; their explicit source/page references resolve in PAGE_INDEX.
- Recomputed the complete v4-to-v5 filesystem delta; changed, added and deleted paths match the frozen semantic-diff allowlist exactly. `PAGE_INDEX.jsonl`, `QUESTION_INDEX.jsonl`, `MARKING_INDEX.jsonl`, `VISUAL_MANIFEST.json` and `UNRESOLVED.md` remain byte-identical to v4.

Detailed check results and per-record evidence are in `INTEGRITY_AND_CROSSREF_CHECKS_V5.json`; the page-by-page visual log is in `VISUAL_REVIEW_LOG_V5.json`.

The 166-page contact-sheet screen is reduced scale, not full-page semantic review of every page. Full-page manual inspection covers the 22-page review union plus the MS p7 risk-class sample. Source authenticity was checked against local Stage 0 SHA256 pins; remote Cambridge distribution authenticity is outside this retest.

**A9 recommendation: PASS.** No A9 finding remains open. A0 must audit this handoff and make the batch gate decision.
