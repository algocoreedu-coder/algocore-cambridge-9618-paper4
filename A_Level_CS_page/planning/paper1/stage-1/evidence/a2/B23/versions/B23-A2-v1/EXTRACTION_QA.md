# B23 extraction QA

Status: `SUBMITTED` by A2. This is source-location evidence only.

## Checks completed

- Read the 12 primary PDFs directly after verifying each SHA-256 against the Stage 0 manifest; all 12 matched and all 157 page counts matched.
- Produced a direct, page-scoped transcript and whole-page render for every source page.
- Indexed 46 QP question records, 197 part records and 197 source-located MS records. A marking record is a location pointer only; `mark_or_condition_or_null` remains `null` so this artifact does not infer allocations or rewrite marking content.
- Rendered and self-inspected all 61 keyword-screened visual-risk pages, including QP tables, truth tables, circuits, diagrams, formulas/instruction layouts and MS tables/conditions. Contact sheets are internal evidence under `renders/risk_contacts/`.
- Checked JSONL ID uniqueness, part-parent references, source/page totals and that each visual-risk record has a render and linked source items.

## Limits carried to review

- Whole-page visual regions intentionally retain `SELF_VISUALLY_INSPECTED_PENDING_INDEPENDENT_REVIEW`; A2 cannot mark them accepted.
- MS locations were matched by the printed Q/part identifiers. A4 must independently test cardinality, grouping, displayed marks and conditional table structure.
- QP parts carry the question ID as context dependency. This records the parent scenario but makes no claim about pedagogic prerequisites.
