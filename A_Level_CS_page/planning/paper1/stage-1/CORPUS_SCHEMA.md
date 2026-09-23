# Corpus schema — Stage 1

Version 1.1. Owner A0. Date 21/09/2026. New submissions and corrected batch versions must use 1.1; frozen v1.0 artifacts remain valid historical snapshots.

All JSON is UTF-8. JSONL has exactly one object per line. IDs use lower-case ASCII, hyphen separators and source identity; IDs never depend on text wording.

```text
source_file: source_id, sha256, relative_path, kind(qp|ms), year, session(s|w),
             component(11|12|13), page_count
page: source_id, pdf_page_1_based, printed_page_or_null, extraction_status,
      visual_status, transcript_ref_or_null
question: id, source_qp_id, year, session, component, question_number,
          parent_id_or_null, marks_displayed_or_null, command_word_verbatim_or_null,
          qp_locator, prompt_transcript_ref, context_ref_or_null, status
part: id, question_id, parent_part_id_or_null, label, marks_displayed_or_null,
      qp_locator, prompt_transcript_ref, ms_locator_or_null, dependency_refs,
      context_required, status
marking_item: id, part_id_or_null, question_id_or_null, ms_locator, transcript_ref,
              mark_or_condition_or_null, table_row_ref_or_null,
              visual_dependency_refs, status
visual_region: id, source_id, pdf_page_1_based, page_ref, kind, relates_to_ids,
               extraction_risk, rendered_asset_ref, reviewer_status
```

### ID and locator rules

- Source IDs equal Stage 0 manifest IDs, e.g. `9618_s21_qp_11`.
- Question IDs: `<source_qp_id>-q<decimal>`. Part IDs append `-p<lemma>` using the printed part label normalized to lower case; nested parts retain parent IDs.
- `qp_locator` and `ms_locator` include `source_id`, `pdf_page_1_based`, and `question`/`part` when known. `printed_page_or_null` is null unless visibly printed.
- `marks_displayed_or_null` copies only an explicit displayed mark. `mark_or_condition_or_null` is null when MS gives a grouped/table condition with no separable allocation.
- A `marking_item` targets exactly one indexed record: set `part_id_or_null` for a printed part, or `question_id_or_null` for an unparted whole-question item. The other target is null. This preserves whole-question marks and MS rows without inventing a lettered part; the item ID is `<target_id>-mi-<n>`. Existing v1.0 part records with `part_id` remain frozen as historical inputs; corrected/new v1.1 records use the explicit nullable target fields.
- `visual_region.reviewer_status` must describe evidence state, not just file existence: use `RENDER_REQUIRED` only if no render exists; use `RENDERED_PENDING_INDEPENDENT_REVIEW` when the asset exists but has not been source-checked; use `A2_VISUALLY_INSPECTED_PENDING_INDEPENDENT_REVIEW` only when A2 compared it to the original; reserve `A9_REVIEWED_SOURCE_MATCH` for actual A9 verification; use `UNUSABLE` only with a replacement path or explicit reason. Never leave a region as render-required when its asset exists, or mark it independently verified because it rendered.
- `command_word_verbatim_or_null` is a short source observation, not translated and not a pattern tag. Use null if unclear.
- `status` is one of `EXTRACTED`, `VISUAL_CHECK_REQUIRED`, `MS_LINKED`, `UNRESOLVED`, `REVIEWED`, `ACCEPTED`; a record cannot jump to ACCEPTED before A9 batch review.

### Required files per batch

`BATCH_MANIFEST.json`, `PAGE_INDEX.jsonl`, `QUESTION_INDEX.jsonl`, `MARKING_INDEX.jsonl`, `VISUAL_MANIFEST.json`, `EXTRACTION_QA.md`, `UNRESOLVED.md` and `HANDOFF_CHECK.json`.

The batch manifest lists input SHA256, source pages, record counts, schema version and every derived transcript/render path. It must not claim all visual regions verified merely because a page rendered.
