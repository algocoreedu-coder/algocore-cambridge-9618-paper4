# B21 extraction QA — A2 v2

Status: `SUBMITTED_FOR_RETEST`; reviewer acceptance is pending.

- Frozen v1 required artifacts are stored in `versions/B21-A2-v1/`.
- Stage 0 hashes were recomputed for all 12 original PDFs and match. The active
  page index covers all 154 source pages.
- All 48 printed question headings have a reconciled start page. In particular,
  W21 components 11 and 13 now record Q1 at p2 and Q6 at p11.
- The active hierarchy has 203 QP part records with parent IDs and 48 complete
  question context spans. The validator found no duplicate IDs or hierarchy
  cycles.
- 59 visual regions are rendered; the eight pages required by A3 were added and
  visually inspected. Existing v1 visual counts are retained as a baseline in
  the manifest, not restated as v2 counts.
- Mark-scheme links distinguish `EXACT_PRINTED_LABEL` leaf evidence from
  `PARENT_CONTEXT_ONLY` unresolved evidence. No scoring allocation, mark-scheme
  condition, answer, or table row is inferred.

The CFF/font extraction warnings remain in `extraction-warnings-v2.log`. Text
transcripts are navigational evidence; the original PDF/render is required for
symbols, geometry, layout, bracketed marks, and table conditions.
