# A0 dispatch — B25 A2 v2 context-boundary and MS-row correction

Date: 2026-09-21. Task: `P1-S1-A2-B25-V2`. Owner: A2 curator independent of the B25 A3/A4 reviewers. State: DISPATCHED. Batch remains unaccepted.

## Frozen inputs and write boundary

- Start from immutable candidate `evidence/a2/B25/versions/B25-A2-v1/`: `HANDOFF_CHECK.json` SHA256 `6087afbba526210bb4566d005fd278224e9078b3fcddb91ccdd410f62e17ae7b`; `BATCH_MANIFEST.json` SHA256 `7ab0ea8a747d54c8d50157784d2dae5c1158c95b4db2049ae50f077364b7e244`; `SNAPSHOT_MANIFEST.json` SHA256 `a9a96b6ba8db064578a73798228839c837e99f614ae4e05186e206ad6e6c14d6` with 438 entries.
- Candidate A0 audit `evidence/a0/B25_A2_V1_A0_AUDIT.json` SHA256 `bcb35b2855ca5ae297174901c31ea7d4846a308a279aa0a55109c26a2d5e4660`.
- A3 review handoff `evidence/a3/B25/review_v1/HANDOFF_REVIEW_V1.json` SHA256 `f96bf8d634b5bb5e37496b7f826fa330277f2219169e827bf3e0369fc0e18ea0`; output manifest SHA256 `5c14521a04c05766832c15a8933f1f0f2bbc68abee603613fae3e8a1b1917a63`; A0 audit SHA256 `07c829ff02b3cb9490f77ac7ceac604d681184441d951b3529bd03a12a384703`.
- A4 review handoff `evidence/a4/B25/review_v1/HANDOFF_REVIEW_V1.json` SHA256 `2df0def5ebfd7c605c1c1c07750e307db2b4dbb95e5b3985e17d67e30d539179`; output manifest SHA256 `689efe3036bd5ffc9950e7e4557d8a8a852930a218cce3729bc2603a3f7f7a7e`; output sums SHA256 `f2e7635c3957cacc0171ee156f032f1b4ee749dcd1cb966645d629535a0820b9`; A0 audit SHA256 `a1050b427004dc33818a19f1cd707f669cffc7c84cc81d6d3f3939c5ecd060e7`.
- Authority: Stage 0 source manifest SHA256 `195a68ad98b4739dff0d3496dc93ba9e85d67d2dae0d88e3d4e4a088f1259c9c`; schema SHA256 `9fe71d4719b0c8f9fd6d6fd6fb0316c7f9a840b6b964634889ea6d98245a1f1f`; extraction policy SHA256 `97bd6c69ea8d459ea99713e943c2d092a88999b6df7cb315d2820547789c11f2`.
- Rehash all 12 original 2025 QP/MS PDFs and confirm 178 total pages before editing.
- New output `evidence/a2/B25/versions/B25-A2-v2/` must not exist at start. Copy the complete v1 packet there and write only within this v2 directory. Preserve v1 byte-for-byte. Do not edit source PDFs, A0/A3/A4/A9 evidence, trackers, other batches, app code, lessons, taxonomy or translations. Do not spawn agents.

## Exact source-backed corrections

Remove the specified false page from all three fields `all_context_pages`, `continuation_pages`, and `source_evidence` of each matching context record:

| Context record | Remove PDF page | Source-backed classification |
|---|---:|---|
| `9618_s25_qp_11-q3` | 7 | Question 4 begins |
| `9618_s25_qp_12-q2` | 5 | Question 3 begins |
| `9618_s25_qp_12-q5` | 11 | Question 6 begins |
| `9618_w25_qp_11-q2` | 7 | Question 3 begins |
| `9618_w25_qp_11-q5` | 11 | Question 6 begins |
| `9618_w25_qp_12-q7` | 13 | Question 8 begins |
| `9618_w25_qp_12-q9` | 15 | Question 10 begins |
| `9618_w25_qp_13-q1` | 3 | Question 2 begins |
| `9618_w25_qp_13-q3` | 5 | Question 4 begins |
| `9618_w25_qp_13-q5` | 9 | Only the notice “Question 6 starts on the next page” |

Preserve `9618_s25_qp_11-q8` page 15: both independent reviews confirmed it is legitimate Q8 scenario/table continuation context. Preserve pages 7 and 8 for `9618_w25_qp_13-q5`; they contain Q5 content.

In `MARKING_INDEX.jsonl`, correct only record `9618_w25_qp_13-q7-pe-mi-1`: keep the complete 7(e) answer and its mark value, but remove the following generic table header text `Question / Answer / Marks` that belongs to the next table. Retain its exact locator `9618_w25_ms_13.pdf`, PDF page 12, row `7(e)`, transcript and visual dependency. Do not “correct” the published phrase in `9618_w25_qp_13-q8-pb-mi-1`; A4 verified the same grammatical omission appears in the original marking scheme.

Do not change any other question, part, mark, locator, context page, transcript or visual region unless a validator-required manifest/provenance update follows mechanically from these eleven source-backed edits. Record every changed path and before/after hash in a delta manifest.

## Deliverables, validation and stop

Rebuild consistent revision/provenance/QA, batch, visual, handoff and snapshot manifests. Run `scripts/validate_batch.py` on v2. Add machine-readable correction checks proving the ten context pages are absent from all three fields, the preserved pages remain, the 7(e) row no longer contains the next table header, all 51 contexts still resolve, 183 marking items and 144 visual regions remain linked, all six indexed totals remain 75, all 12 source identities/page counts remain exact, and every frozen file hash matches.

Freeze v2 with a new `HANDOFF_CHECK.json` and snapshot manifest, then stop for A0 audit. Independent same-version A3 and A4 retests, A9 review and A0 acceptance remain mandatory. Do not claim a gate PASS or accept B25.
