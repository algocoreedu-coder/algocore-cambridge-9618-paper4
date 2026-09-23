# A4 linkage review — B21

Artifact version: 1.0.0. Reviewer: A4. Input: A2 B21 artifact version 0.1.0 and the 12 original QP/MS PDFs listed in its batch manifest.

## Result

**CHANGES_REQUIRED.** The submitted records are useful for source navigation, but they do not yet preserve the nested part hierarchy or displayed-mark associations required for a reliable question-to-mark-scheme corpus. Do not treat the current `MS_LINKED` rows as item-level marking links.

## Checks performed

- Independently recomputed SHA-256 and page count for all 12 original PDFs. All 12 match the A2 batch manifest and the listed source identity.
- Checked all 94 `MARKING_INDEX.jsonl` links against their corresponding MS transcript pages and rendered MS evidence. Each uses the matching session/component MS source, and each page contains the referenced question/part label or its nested descendants. No wrong source-file pair or impossible page locator was found.
- Identified 43 of the 94 links whose cited parent label expands into roman-numbered child entries in the MS. Those are valid as parent-section/page references only; they do not identify individual child marking rows.
- Checked the 21 `UNRESOLVED` part records against the original QPs/MSs. They are all bare roman `i` records with no parent part. In sampled source pages the printed structure is nested, such as Q1(a)(i)/(ii), Q4(c)(i)/(ii), and Q7(b)(i)/(ii)/(iii). The current records cannot be linked safely without correcting their hierarchy. Keep these rows unresolved pending A2 correction; do not infer their marks.
- Inspected rendered source pages containing QP answer tables, logic diagrams/truth tables, instruction tables, and MS matching/ER tables. The visible layout carries meaning that is not represented in the current link rows.

## Findings

1. **Major — nested QP part hierarchy is flattened.** All 115 part records have `parent_part_id_or_null: null`. The 21 roman `i` records are represented as siblings of `(a)`, `(b)`, etc.; further visible child labels such as `(ii)` are not indexed as child records. Evidence includes 9618_s21_qp_11 pages 2, 11 and 15 and the corresponding mark-scheme pages 3, 7 and 9. See F-01.
2. **Major — displayed marks are absent from the index.** All 48 question records and 115 part records have null displayed-mark fields. The QP pages visibly print mark brackets beside parts and nested parts; for example 9618_s21_qp_11 page 2. All 94 marking records also have null mark/condition values. No item-level allocation should be inferred from this review. See F-02.
3. **Major — most linked rows stop at the parent label.** The 94 MS locators identify a page and parent question/part label, but 43 point to parents whose MS section contains distinct nested entries. For example, 9618_s21_ms_11 page 3 contains separate Q1(a)(i) and Q1(a)(ii) entries, while the current index has a single Q1(a) marking link. These rows need child-level locators or an explicit parent-context link type. See F-03.
4. **Major — visual/table dependencies are not connected to records.** All 51 visual-region records have empty `relates_to_ids`; all 94 marking records have empty visual dependencies and table-row references. Rendered evidence includes structured MS tables and diagram/truth-table answers, for example 9618_w21_ms_12 pages 3–7 and 9618_w21_ms_13 page 5. See F-04.

The detailed counts, sample locators, and source integrity checks are in `MARKS_CONTEXT_CHECK.json`; machine-readable findings are in `LINKAGE_FINDINGS.json`.

## Required retest

A2 should rebuild the part index from the visible labels, preserve parent/child relationships, record only marks visibly attached to the relevant QP item, and distinguish parent-context MS references from leaf marking-item references. Add visual dependencies/row references where the source layout carries answer conditions. A4 can retest the updated batch version; A9 remains the independent batch reviewer.
