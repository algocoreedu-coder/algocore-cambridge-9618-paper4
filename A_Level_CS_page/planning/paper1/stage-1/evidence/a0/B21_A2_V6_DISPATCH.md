# P1-S1-A2-B21-V6 — Q8 context-locator correction

Status: READY_FOR_DISPATCH. Owner: A2-B21. Reviewer chain: A3-B21-v6, A4-B21-v6, A9-B21-v6, then A0. Stop after freezing the v6 handoff; do not self-approve.

## Frozen inputs

- Candidate base: `evidence/a2/B21/versions/B21-A2-v5/`.
- Candidate handoff SHA256: `d358cf79cc408cea36256a0a4f67be03b045b23ac59bd593dbb61c4c968014f2`.
- Candidate batch manifest SHA256: `61d26d27e51727ecfa7d1517149e78716e6323cb236a122423979347eaedafc7`.
- Candidate snapshot manifest SHA256: `63465d49de20bfeefd2151254126640679b60ceb7964ee6391b727f2a3b48581`.
- A9-v5 handoff: `evidence/a9/B21/retest_v5/HANDOFF_RETEST_V5.json`, SHA256 `acecb8f4f383eb7283eee86a31a2abed35933564a8f37acd80eff55dbe1d7f34`.
- A0 A9-v5 audit: `evidence/a0/B21_A9_V5_HANDOFF_AUDIT.json`, SHA256 `5d61071743ad69374b1a30a634e749a0d5172f1bbbadaf3780e47e40640c07c4`.
- Original source PDFs and their Stage 0 hashes remain authoritative and read-only.
- Stage 1 schema/policy and the accepted A3/A4-v5 handoffs are read-only reference inputs.

## Write allowlist

Write only `A_Level_CS_page/planning/paper1/stage-1/evidence/a2/B21/versions/B21-A2-v6/`. Do not edit v5, source PDFs, trackers, app code, lessons, or translations.

## Required correction

Create an immutable v6 snapshot from v5 and remove exactly these false question-context page references:

1. `9618_s21_qp_12-q8`: remove PDF pages 15 and 16 from `continuation_pages`, `all_context_pages`, and `source_evidence`; Q8 remains on page 14.
2. `9618_w21_qp_11-q8`: remove PDF page 16 from those fields; Q8 remains on page 15.
3. `9618_w21_qp_13-q8`: remove PDF page 16 from those fields; Q8 remains on page 15.

The four removed pages are not question context. A0 visually confirmed that each is labelled `BLANK PAGE`; each p16 also carries copyright/imprint text. Preserve all legitimate Q7 continuation records and every unrelated corpus value.

## Outputs

- Complete immutable v6 copy with updated `CONTEXT_INDEX.jsonl`, the three per-question context JSON files, and every manifest/handoff/checksum or QA artifact whose hash/count/content is affected.
- `V5_TO_V6_SEMANTIC_DIFF.json` proving the semantic delta is restricted to the four false page references plus required derived metadata.
- `CORRECTION_EVIDENCE.json` or equivalent source-backed evidence with the exact three record IDs and four pages.
- Updated `BATCH_MANIFEST.json`, `SNAPSHOT_MANIFEST.json`, `HANDOFF_CHECK.json`, `REVISION_NOTES.md`, and validation output.

## Acceptance criteria

- All v5 files are copied and v5 remains byte-identical.
- The three corrected records contain only their true Q8 page; all four false references are absent from every active v6 context/index artifact.
- No valid Q7 continuation page, Q1 correction, visual region/dependency, marks, MS locator, unresolved row, source hash, or transcript changes.
- Six QP totals remain 75; validator passes; 12 source hashes and 154 pages match baseline.
- Snapshot and handoff enumerate every active v6 file with SHA256 and byte count; semantic diff declares every change/addition/deletion.
- Do not infer new context, edit primary PDFs, or claim batch acceptance.

## Stop point

Freeze the v6 handoff and report exact hashes/counts to A0. Fresh independent A3/A4/A9 retests are mandatory even if the correction appears mechanical.
