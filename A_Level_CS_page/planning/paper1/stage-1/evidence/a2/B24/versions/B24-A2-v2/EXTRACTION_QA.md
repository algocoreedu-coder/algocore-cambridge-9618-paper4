# B24-A2-v2 correction and extraction QA

Status: **A2 v2 correction complete; independent A4-v2/A9-v2/A0 review pending.** This is not batch acceptance.

## Scope and pinned sources

This packet indexes the six official Cambridge 2024 Paper 1 QP/MS pairs for components 11, 12 and 13 in May/June and October/November. All 12 original PDFs were rehashed against the Stage 0 manifest and exact B24 dispatch pins; the source manifest SHA256 is `195a68ad98b4739dff0d3496dc93ba9e85d67d2dae0d88e3d4e4a088f1259c9c`. Total source length is 156 pages.

| Source ID | Pages | A2 all-page contact sheet | PDF SHA256 |
|---|---:|---|---|
| `9618_s24_ms_11` | 8 | [`renders/contact_sheets/9618_s24_ms_11-all-pages.jpg`](renders/contact_sheets/9618_s24_ms_11-all-pages.jpg) | `b53a8ca0d83d790364125ad0b74cef676204133d540c9c89f38404dd4d1fca69` |
| `9618_s24_ms_12` | 11 | [`renders/contact_sheets/9618_s24_ms_12-all-pages.jpg`](renders/contact_sheets/9618_s24_ms_12-all-pages.jpg) | `27327b88c438432d5af97553d3ac09dcfe42f0a35c8d2556fdc9bd90959c7ea0` |
| `9618_s24_ms_13` | 9 | [`renders/contact_sheets/9618_s24_ms_13-all-pages.jpg`](renders/contact_sheets/9618_s24_ms_13-all-pages.jpg) | `8d9b06f8ba8f9fba12b8cd725e39c5bda93fe14c1ba6c89912de801671762179` |
| `9618_s24_qp_11` | 16 | [`renders/contact_sheets/9618_s24_qp_11-all-pages.jpg`](renders/contact_sheets/9618_s24_qp_11-all-pages.jpg) | `2e39e6c2ee1e65d621df71b4b7fbe41a16f1e4ed8e252fb1612a6d14b13de063` |
| `9618_s24_qp_12` | 16 | [`renders/contact_sheets/9618_s24_qp_12-all-pages.jpg`](renders/contact_sheets/9618_s24_qp_12-all-pages.jpg) | `871b047e73c2ce0dd3c2dd1c47b7d4e176c886e61af08ffe12c6b9734285d3de` |
| `9618_s24_qp_13` | 16 | [`renders/contact_sheets/9618_s24_qp_13-all-pages.jpg`](renders/contact_sheets/9618_s24_qp_13-all-pages.jpg) | `79f3dbe24332c41b155e25ba48d3a8cb75399e98d5bb9cdf9a1e71de0f4645bd` |
| `9618_w24_ms_11` | 9 | [`renders/contact_sheets/9618_w24_ms_11-all-pages.jpg`](renders/contact_sheets/9618_w24_ms_11-all-pages.jpg) | `e9674e802b5b850509834b1ab1b84008740729d668ae844e9b0142607dbdf1a2` |
| `9618_w24_ms_12` | 10 | [`renders/contact_sheets/9618_w24_ms_12-all-pages.jpg`](renders/contact_sheets/9618_w24_ms_12-all-pages.jpg) | `42b8ef4e24bdd263e1a81b9ae34d332e77e34f7c7853ab411977410f1b43192e` |
| `9618_w24_ms_13` | 9 | [`renders/contact_sheets/9618_w24_ms_13-all-pages.jpg`](renders/contact_sheets/9618_w24_ms_13-all-pages.jpg) | `d3ee5286285e4611838cb9922a4fd9706a1a4e733ece048f24f89ee5cb48ec37` |
| `9618_w24_qp_11` | 16 | [`renders/contact_sheets/9618_w24_qp_11-all-pages.jpg`](renders/contact_sheets/9618_w24_qp_11-all-pages.jpg) | `94d1aed5bc14f0a3fd60da0e932cf5b8b40bd8342550ff0254c19afe89001ef7` |
| `9618_w24_qp_12` | 16 | [`renders/contact_sheets/9618_w24_qp_12-all-pages.jpg`](renders/contact_sheets/9618_w24_qp_12-all-pages.jpg) | `3d754f83188ee139c7ffd082496a3d0591e73714ec8787dc2b961f5aa2c744c6` |
| `9618_w24_qp_13` | 20 | [`renders/contact_sheets/9618_w24_qp_13-all-pages.jpg`](renders/contact_sheets/9618_w24_qp_13-all-pages.jpg) | `1633471ff692292618910635b391aef69624188ec30b72425738f8a46354cc04` |

## Indexed records

- 49 question roots and 194 printed part records, in schema 1.1; 170 exact MS marking items target 165 parts and 5 unparted whole-question records.
- 29 parent grouping labels with child parts remain `EXTRACTED` when the paired MS has no separate row. They have no fabricated MS allocation; their children are indexed and linked independently.
- Six printed QP cover statements and six sums of explicit `[n]` marks were checked. Every source sum and indexed sum is 75.
- 49 question context records cite page-level transcripts. Standalone blank pages and imprint-only pages are excluded; pages with question content plus an imprint remain referenced for the question content. Shared-page questions and legitimate continuations remain represented by the source PDF page number.
- 156 page transcripts and direct renders were generated from the pinned PDFs. The 12 contact sheets were screened by A2. 130 full-page visual-risk regions remain `RENDERED_PENDING_INDEPENDENT_REVIEW`.

## Extraction method and limits

Text is the PyMuPDF text layer in PDF reading order. Every page has a transcript; each rendered PNG comes directly from the same pinned source PDF at 1.15x. Source PDF page and visibly printed page locators are stored separately. Mark-scheme excerpts preserve extracted row text and the exact row locator; no answers, marking allocations, syllabus applicability, taxonomy, topic frequency, or lesson content were authored in this batch.

No U+FFFD replacement character was detected in transcripts (see `GLYPH_EXTRACTION_REVIEW.json`); non-ASCII symbol encoding and table alignment still need source-page confirmation. Full-page QP and MS renders are supplied so independent reviewers can verify symbols, row alignment, diagrams, tables, and text-order issues. A2 contact-sheet screening is a coarse page-presence/layout screen and does not claim full-size source matching.

## A9-B24-MS-01 correction

Exactly 19 marking excerpts had the generic 'Question / Answer / Marks' header of a following table removed. Only 'mark_or_condition_or_null' changed in those records; the other 151 marking items and all context, hierarchy, locator, visual, transcript, render and mark-total artifacts remain identical to v1. See CORRECTION_CHECK_V2.json, SEMANTIC_DELTA_V2.json and IMMUTABLE_CORE_CHECK_V2.json.

## Independent review gate

Next: A4 independently retests all 19 corrected boundaries and all 170 links; A9 reviews the same frozen version; A0 decides acceptance. A3 retest is unnecessary unless A0 finds context, hierarchy, locator or visual drift. Any correction must be issued as a new version, leaving B24-A2-v2 immutable after handoff. See `CROSS_REFERENCE_CHECK.json`, `SELF_CHECK.json`, `MARK_TOTAL_CHECK.json`, `VISUAL_MANIFEST.json`, and the validator result when generated.
