# A1 — Issues and downstream requirements

Version: 1.0. Task: P1-S0-A1-01. Author: A1. Date: 2026-09-19 (+07:00).
Status: SUBMITTED; independent A9 review pending.

These records distinguish known future implementation work from a defect in Stage 0 delivery. No app change is requested during Stage 0. Locators are relative to the app root defined in LEARNING_PAGE_AUDIT.md. The current preview is not claimed to implement the future Paper 1 product.

| ID | Type / impact | Evidence | Owner / action | Closure or retest |
|---|---|---|---|---|
| A1-01 | Downstream required gap; blocks acceptance of future bilingual UI, not Stage 0 planning | `app/layout.tsx:12,14`; `app/docs/page.tsx:15–47`: vi fixed and no complete EN lesson | A8/A6, Stage 3–4: implement shared-ID full locales and locale-aware shell | Semantic parity review plus browser route/lang/provider/navigation checks |
| A1-02 | Downstream route/content gap | `app/docs/layout.tsx:5–20,30`; `app/docs/page.tsx:14–17`: hand-written single Paper 3 page | A8/A1, Stage 4: Paper 1 routes/tree/TOC without overwriting sample | Open sample and pilot routes; check deep links and both locale trees |
| A1-03 | Downstream provenance/assessment gap | `app/docs/page.tsx:14–49`: sample has no syllabus/book/QP/MS/rubric records | A2/A3/A4/A5, Stages 1–3; A8 render in Stage 4 | Review required locators, labels official/adapted/original and marking claim provenance |
| A1-04 | Verification limit, not a runtime defect claim | Only source was read; CSS at `app/globals.css:64–72` and `styles/algocore-theme.css:80` supplies responsive/focus intent | A8/A9, Stage 4: execute build/typecheck and browser matrix | Actual logs and visual/interaction evidence; do not turn CSS presence into PASS |
| A1-05 | Routine design decision remaining, no Stage 0 blocker | Inline TSX at `app/docs/page.tsx:14–49`; no lesson pipeline shown by inspected source inventory | A0/A1/A8, Stage 3–4: pick serialization/renderer and route scheme after pilot data | Demonstrate all three pilot packages render full contract and equivalent locales |
| A1-06 | Downstream source delivery decision | Current page has no citations; source citations proposed in contract B11 | A0/A2/A8, before Stage 4 acceptance: select legitimate available links or readable bibliographic locators | Resolve actual links; no local D:/ path as deployed href; no false claim that a source is accessible |

No confirmed Critical/Major defect in the Stage 0 A1 artifacts is self-reported; this is not an independent PASS. A9 may open findings against them. A1 academic scope assertions are intentionally deferred to A3 evidence, with no claimed syllabus coverage.

Self-review: every gap has evidence, impact, owner and closure check; future checks are marked future. A0 should carry these as planned downstream requirements and verification limits, not mark them fixed merely by accepting Stage 0.
