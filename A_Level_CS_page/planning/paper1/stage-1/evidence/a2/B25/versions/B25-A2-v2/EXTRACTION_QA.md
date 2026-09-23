# B25-A2-v2 extraction QA

Status: **A2 v2 corrections complete; A0 validation and independent same-version A3/A4/A9/A0 review pending.** This is not batch acceptance.

## Scope and pinned sources

This packet indexes the six official Cambridge 2025 Paper 1 QP/MS pairs for components 11, 12 and 13 in May/June and October/November. All 12 original PDFs were rehashed against the Stage 0 manifest and exact B25 dispatch pins; the source manifest SHA256 is `195a68ad98b4739dff0d3496dc93ba9e85d67d2dae0d88e3d4e4a088f1259c9c`. Total source length is 178 pages.

| Source ID | Pages | A2 all-page contact sheet | PDF SHA256 |
|---|---:|---|---|
| `9618_s25_ms_11` | 12 | [`renders/contact_sheets/9618_s25_ms_11-all-pages.jpg`](renders/contact_sheets/9618_s25_ms_11-all-pages.jpg) | `8bf543ddd26e74224f40fd909152e300b9b711eb3644d7e8d07c1d5c3f07521b` |
| `9618_s25_ms_12` | 12 | [`renders/contact_sheets/9618_s25_ms_12-all-pages.jpg`](renders/contact_sheets/9618_s25_ms_12-all-pages.jpg) | `0b0c41c4a7930853aaaaa00729d4ffd3a3e971948800220344c6ae6a31ec957a` |
| `9618_s25_ms_13` | 12 | [`renders/contact_sheets/9618_s25_ms_13-all-pages.jpg`](renders/contact_sheets/9618_s25_ms_13-all-pages.jpg) | `a334bec016c753451ae53c56fdfc0b0758b8f2b5a7a06a86307ac100bb7ebd8e` |
| `9618_s25_qp_11` | 20 | [`renders/contact_sheets/9618_s25_qp_11-all-pages.jpg`](renders/contact_sheets/9618_s25_qp_11-all-pages.jpg) | `bdf74d4f15c620bde7e6fe65f17828bc85c89490ebb9a1a337e2cd0596f4b39a` |
| `9618_s25_qp_12` | 16 | [`renders/contact_sheets/9618_s25_qp_12-all-pages.jpg`](renders/contact_sheets/9618_s25_qp_12-all-pages.jpg) | `607722293452744ee7107b7365cac73664d51e0eb0f7487587d038e22467826e` |
| `9618_s25_qp_13` | 20 | [`renders/contact_sheets/9618_s25_qp_13-all-pages.jpg`](renders/contact_sheets/9618_s25_qp_13-all-pages.jpg) | `b341d6829ba4baf47dbd8d272cb7fd49b448d04a2a16a028e4fb3178c3c64554` |
| `9618_w25_ms_11` | 15 | [`renders/contact_sheets/9618_w25_ms_11-all-pages.jpg`](renders/contact_sheets/9618_w25_ms_11-all-pages.jpg) | `64b2928b1348598cd0be2cda8014405264f0a4303b73665633e4e297217056f4` |
| `9618_w25_ms_12` | 11 | [`renders/contact_sheets/9618_w25_ms_12-all-pages.jpg`](renders/contact_sheets/9618_w25_ms_12-all-pages.jpg) | `4fd455f74ae4abf71a8796095c912a06c77239d6d5a6679ce05ceff1032e7dd8` |
| `9618_w25_ms_13` | 12 | [`renders/contact_sheets/9618_w25_ms_13-all-pages.jpg`](renders/contact_sheets/9618_w25_ms_13-all-pages.jpg) | `d4bf99da2ca289430a18709d483892df85646dc5a90d5fb6697eb6d13c10481b` |
| `9618_w25_qp_11` | 16 | [`renders/contact_sheets/9618_w25_qp_11-all-pages.jpg`](renders/contact_sheets/9618_w25_qp_11-all-pages.jpg) | `2fe1691a0eff789ac686121aac0ae4e7cb3852f9bd321a6542dc6b82fbedf616` |
| `9618_w25_qp_12` | 16 | [`renders/contact_sheets/9618_w25_qp_12-all-pages.jpg`](renders/contact_sheets/9618_w25_qp_12-all-pages.jpg) | `ea65e75a4182f991cb2117827ee5c6734365b2c5e78686c6d6ef1e00d48fe65b` |
| `9618_w25_qp_13` | 16 | [`renders/contact_sheets/9618_w25_qp_13-all-pages.jpg`](renders/contact_sheets/9618_w25_qp_13-all-pages.jpg) | `9b5d7e33de24afb406ddc00c253ebf37b4240e6b21f3c1a7f6f1eb82aba78cc6` |

## Indexed records

- 51 question roots and 207 printed part records, in schema 1.1; 183 exact MS marking items target 180 parts and 3 unparted whole-question records.
- 27 parent grouping labels with child parts remain `EXTRACTED` when the paired MS has no separate row. They have no fabricated MS allocation; their children are indexed and linked independently.
- Six printed QP cover statements and six sums of explicit `[n]` marks were checked. Every source sum and indexed sum is 75.
- 51 question context records cite page-level transcripts. The ten context-boundary false references identified by independent review have been removed from all three context fields; source-page evidence remains in the page transcript/render inventory. Shared-page questions and legitimate continuations remain represented by the source PDF page number.
- 178 page transcripts and direct renders were generated from the pinned PDFs. The 12 contact sheets were screened by A2. 144 full-page visual-risk regions remain `RENDERED_PENDING_INDEPENDENT_REVIEW`.


## Version 2 correction record

B25-A2-v2 applies exactly ten context-page removals from the independent source-boundary findings and trims the following generic `Question / Answer / Marks` header from the 7(e) MS excerpt (`9618_w25_ms_13`, PDF page 12, row 7(e)). The six mark totals remain 75. The 7(e) answer and displayed mark value are preserved. See `CORRECTION_DELTA.json`, `CORRECTION_CHECKS.json`, and `REVISION_NOTES.md`.

## Extraction method and limits

Text is the PyMuPDF text layer in PDF reading order. Every page has a transcript; each rendered PNG comes directly from the same pinned source PDF at 1.15x. Source PDF page and visibly printed page locators are stored separately. Mark-scheme excerpts preserve extracted row text and the exact row locator; no answers, marking allocations, syllabus applicability, taxonomy, topic frequency, or lesson content were authored in this batch.

No U+FFFD replacement character was detected in transcripts (see `GLYPH_EXTRACTION_REVIEW.json`); non-ASCII symbol encoding and table alignment still need source-page confirmation. Full-page QP and MS renders are supplied so independent reviewers can verify symbols, row alignment, diagrams, tables, and text-order issues. A2 contact-sheet screening is a coarse page-presence/layout screen and does not claim full-size source matching.

## Independent review gate

Next: A3 and A4 independently inspect the evidence and visual regions; A9 reviews their findings and the frozen packet; A0 decides acceptance. This correction is issued as B25-A2-v2; frozen B25-A2-v1 remains immutable. See `CROSS_REFERENCE_CHECK.json`, `SELF_CHECK.json`, `MARK_TOTAL_CHECK.json`, `VISUAL_MANIFEST.json`, and the validator result when generated.
