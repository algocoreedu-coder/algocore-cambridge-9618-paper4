# A4 linkage review — B23

Task: `P1-S1-A4-B23`  
Artifact version: `B23-A4-v1`  
Status: **CHANGES_REQUIRED**  
Inputs: `B23-A2-v1`, `B23-A3-v1`, and all 12 original B23 QP/MS PDFs.

## Result

Do not accept the submitted B23 index for item-level QP/MS reuse yet. Source identity and page-level lookup pass, but 28 parent-part records are marked `MS_LINKED` even though their MS pages contain only child labels. Six additional inline `(outer) (i)` labels were lost by A2's line-start parser, causing the first child marks to be recorded against the outer part. Q9(b) also loses a required QP context page and its displayed mark, and its conditional MS table has no visual dependency record.

No marking points have been inferred or allocated by this review. Where this report names a displayed mark, it is the number visibly printed in the cited original QP/MS source.

## Checks performed

- Independently rehashed all 12 source PDFs and opened them to verify page counts. All 12 SHA-256 values and page counts match Stage 0 and `B23-A2-v1`.
- Checked all 197 part records against their paired session/component MS source and indexed page. Every referenced page contains the indexed label string, but only 169 contain an exact standalone MS label. In 28 cases the label is only a prefix of child rows; those rows are page/context references, not exact item links. The full record and locator list is in `LINKAGE_FINDINGS.json`.
- Reviewed the source text around all six QP pages where two part labels occur on one line. The first nested `(i)` label is omitted in each case; the current outer-part record inherits the child's QP mark and an MS locator that matches only as a substring. Existing later children remain indexed.
- Inspected the original-derived render for `9618_w23_ms_12`, PDF p11, Q9(b). The MS specifies “1 mark for each set of shaded rows” and displays 4 in its marks column. The shading in its answer table carries the condition; the page is absent from `VISUAL_MANIFEST.json`, and `9618_w23_qp_12-q9-pb-mi-01` has no visual dependency.
- Confirmed A3's Q9(b) context flags against QP PDF pp14–15. Q9(b) on p14 directs candidates to program, memory, and ASCII data on p15. The p15 render contains the trace tables and printed `[4]`, but the indexed prompt references only p14 and `marks_displayed_or_null` is null.
- Retested A3's minor unit-precision note: QP `9618_w23_qp_12` p6 says “kibibyte” and “megabyte”; MS `9618_w23_ms_12` p4 lists the accepted comparisons using those exact prefixes. No normalization or answer allocation is needed.

## Findings and required retest

**Major — parent labels are linked by substring rather than exact MS row.** Twenty-eight records currently say `MS_LINKED`, although the cited MS pages show only nested child rows for the requested parent label. Preserve those parent records and their context, but do not present them as item-level links. A2 should either link the actual child records and represent the parent as context, or leave the parent MS item unresolved with a clear reason. Owner: A2 via A0. Retest all 28 IDs listed in F01, including the six overlaps in F02.

**Major — six inline nested parts are missing and their marks are misattached.** QP lines beginning `(c) (i)`, `(b) (i)`, or `(a) (i)` are parsed only at the first line-start token. The current outer IDs therefore carry the first child's displayed mark, while the `(i)` record and marking link are absent. Add the six expected child IDs in F02, correct the parent hierarchy/mark fields, and rebuild/check all B23 questions for multiple labels on one line. Owner: A2 via A0. Retest each original QP/MS locator in F02 and the full affected question index.

**Major — Q9(b) loses required QP context, its displayed mark, and the MS table dependency.** Keep `9618_w23_qp_12-q9-pb` linked to both QP pp14–15; p15 carries required input and the printed `[4]`. Keep `9618_w23_qp_12-q9-pb-mi-01` linked to MS p11, where the 4-mark shaded-row condition and answer table appear. Add page-level visual regions and item/context relations for QP p15 and MS p11, with the marking record's visual dependency pointing to the MS region. Leave per-row mark allocation null unless the source explicitly separates it. Owner: A2 via A0. A9 should retest both QP pages and MS p11 against the originals. This confirms A3 flags `B23-CTX-01` and `B23-VIS-02` and adds the MS visual omission.

The 2023-to-2026 scope guardrail remains intact. A4 verified only the source labels, locations, printed marks, and structural dependencies described above; no taxonomy, lesson mapping, or teaching suitability is approved.

## Handoff

The machine-readable findings and mark/context check carry the precise source identities, locators, record IDs, counts, and open owners. Freeze `B23-A2-v1`; after A2 submits a revised version, retest those records before A9 batch review. This batch is **not ready for A9 acceptance** until the Major findings are corrected and retested.
