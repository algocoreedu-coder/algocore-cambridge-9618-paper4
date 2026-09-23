# B21 unresolved register — A2 v2

## V2-UNR-01 — two leaf MS locator gaps

Two leaf QP parts have no full printed-label hit in the paired MS transcript.
They remain `UNRESOLVED` with correct QP locator and context evidence in
`QUESTION_INDEX.jsonl`; no MS row or mark is inferred. Owner: A4 to verify the
original MS layouts, otherwise retain unresolved. Retest: A4/A9.

## V2-UNR-02 — parent context versus leaf criterion

Parent parts that visibly contain child parts have `PARENT_CONTEXT_ONLY` MS
records and `UNRESOLVED` status. This prevents a parent-page locator from being
misread as a child marking point. Owner: A4 checks whether exact leaf rows can
be established visually. Retest: A4/A9.

## V2-UNR-03 — visible mark association limits

`marks_displayed_or_null` is populated only for a leaf segment where a visible
bracketed mark was found before the next part heading. Parent and ambiguous
fields remain null. Owner: A4. Retest: original QP render against each sampled
leaf and multi-part parent.

## V2-UNR-04 — visual/table dependency limits

Page-level visual dependencies are recorded where the cited MS page has a
region. No table row is claimed unless it can be isolated. A9 must test whether
the 59-region inventory and target relationships are sufficient for the source
layout; the corrected v1 baseline is 51 regions / 18 non-empty / 33 empty / 20
target occurrences.
