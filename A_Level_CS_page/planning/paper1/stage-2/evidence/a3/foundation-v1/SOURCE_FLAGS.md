# Source flags — P1-S2-A3-01 foundation-v1

State: `READY_FOR_INDEPENDENT_REVIEW`. These decisions control planning only; they do not constitute lesson prose, a marking claim or a Stage 2 gate decision.

## F1 — Fetch–decode–execute, registers and buses

**Disposition: CARRIED_WITH_EVIDENCE.** The syllabus authority is PDF/print 19, §4.1: candidates describe the F-E cycle, use register-transfer notation and understand address/data/control buses. The checked coursebook excerpt is PDF 132–133 / print 116–117. Its narrative says PC is incremented after the fetch into CIR, while its figure/RTN presents a specific illustrated sequence. Stage 2 therefore records the model and locator but does not turn the position of PC increment in one diagram into a universal marking rule. Any later trace must distinguish an address from the contents stored at that address and must be reviewed against its stated model and the applicable QP/MS.

## F2 — Bitmap arithmetic and bit/colour depth

**Disposition: RESOLVED FOR FOUNDATION SCOPE.** Syllabus PDF/print 15 explicitly requires estimating bitmap file size and explaining effects of image resolution and colour/bit depth. The checked book pages are PDF 31–33 / print 15–17. The usable planning boundary is `width × height × bits per pixel`, followed by explicit bit/byte and prefix conversion; headers/compression/rounding assumptions must be stated when a later task uses them. The book's pixel-density calculation is not promoted into a separate required objective. `AC26-1.2-01..03` and pilot P1 preserve these boundaries.

## F3 — Checksum guarantee

**Disposition: CARRIED_WITH ACADEMIC CAUTION.** Syllabus PDF/print 24 requires describing and using checksum during data transfer. The checked book page PDF 188 / print 172 states that equal checksums mean transmission without errors. Foundation-v1 does not adopt this as an absolute guarantee: `REQ-6.2-03-04` requires checksum use without claiming that equality proves no error. A later learning/assessment artifact must source-review its precise wording and must not claim stronger certainty than the method supports.

## F4 — Check-digit classification

**Disposition: RESOLVED BY AUTHORITY PRECEDENCE.** Syllabus PDF/print 24 lists check digit under validation. The checked coursebook pages PDF 186–187 / print 170–171 place check digits within verification during data entry. For Cambridge 9618 Paper 1 in 2026, the syllabus classification controls. `REQ-6.2-02-07` therefore treats check digit as validation and retains the book discrepancy in provenance; the source PDF is not altered.

## Deferred evidence boundary

Coursebook body support is claimed only for the page excerpts named in `COURSEBOOK_MAP.jsonl`. Every other objective has `book_locator=NO_VERIFIED_BOOK_SUPPORT`. This does not create a scope gap because the syllabus is the controlling authority; it prevents an unchecked TOC window from being represented as a page-level content audit.
