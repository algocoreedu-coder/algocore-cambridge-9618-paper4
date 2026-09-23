# A3 context and scope review — B22 (2022)

**Review status:** Submitted with two open Major source-record findings. This is a source observation review, not a batch acceptance decision.

## Version and sources checked

- A2 input manifest: `stage-1/evidence/a2/B22/BATCH_MANIFEST.json`, SHA256 `89caa46370684bd4d46c68c304150040b91af08826fb04a302421f23e6d9891e`.
- The 12 source PDFs in the manifest were re-hashed against Stage 0 `evidence/a2/SOURCE_MANIFEST.json`. All 12 IDs, SHA256 values, and page counts match. The QP/MS corpus contains 2022 May/June and Oct/Nov variants 11, 12, and 13.
- A2 indexes declare 166 source pages, 52 question records, 156 part records, 46 MS references, and 87 visual regions. A0's `evidence/a0/B22_VALIDATION.json` reports structural PASS with no errors. That validator checks file structure, source hashes, and counts; it does not validate whether semantic metadata such as context references or displayed marks matches the PDFs.
- Scope authority: local `697372-2026-syllabus.pdf`, Cambridge 9618, 2026 v2, 49 pages. Stage 0 records the local copy byte-matching the official Cambridge copy, SHA256 `bf1b77a2b765d10eb4b005ecae0412add35cf6113ba3218a517893abfc9f2470`. Scope source: `stage-0/SCOPE_AND_COVERAGE_PLAN.md` v1.0.1 and `stage-0/evidence/a3/SYLLABUS_SCOPE.md`.

## Context and section-level scope observations

I reviewed the A2 question prompts at source-topic level against syllabus PDF/in pages 14–27 and the Stage 0 scope boundaries. The observed topics fall within syllabus sections 1–8: number systems and image/sound representation; networks and cloud computing; memory, embedded systems and logic; processor registers, assembly and bit manipulation; operating systems, utilities, translators and IDEs; security, privacy, validation and verification; software licensing and AI applications; relational databases, normalisation and DBMS topics. I did not identify a prompt about sections 9–20 or a confirmed out-of-scope topic in the material reviewed. This is not a claim that the historical questions have been classified as teaching coverage.

Keep all historical questions and variants. The sound-size task below is retained and flagged as a boundary for later teaching labels; it is not removed or called definitively out of scope.

## Context preservation finding

The A2 QUESTION_INDEX has `context_required=false` on all 156 part records, and no part has populated dependency references. Two source examples show why the default loses necessary context across pages:

- `9618_w22_qp_11`, Q4: the PHOTOGRAPHS database scenario and tables begin on PDF p6; parts continue on pp7–8. Parts `...-q4-pb`, `...-q4-pc`, `...-q4-pi`, and `...-q4-pd` have no context/dependency reference and `context_required=false`.
- `9618_w22_qp_12`, Q7: the processor instruction set is on PDF p10; the execution tasks continue on pp11–14. The part records have `context_required=false` and empty dependency references.

The prompt transcript references identify pages, but do not encode these cross-page parent/context dependencies as required by the schema and extraction policy. See Major finding `A3-B22-R01` in `SOURCE_RISK_REVIEW.md`. A2 must repair the records and A4/A9 must retest before B22 can pass its batch gate.

## Scope boundary

`9618_w22_qp_13`, Q1(b), PDF p3 asks candidates to calculate a sound recording's file size from its sampling rate, sampling resolution, and duration. Syllabus §1.2 Sound at PDF/in p15 requires understanding sound representation/encoding and the impact of changing sampling rate and resolution, including impact on file size and accuracy. It does not explicitly list calculating a sound file size. Stage 0 therefore treats sound-size arithmetic as a supporting application, while sound concepts remain in scope. Preserve the QP item and attach the boundary flag in `SCOPE_FLAGS.json`; the Lead owns the later course-label decision.

## Visual/source context sampled

The visual manifest contains 87 rendered risk pages; all referenced render files exist and are marked `A2_VISUALLY_INSPECTED_PENDING_INDEPENDENT_REVIEW`. I independently viewed representative pages for logic geometry/truth table (`9618_s22_qp_13`, PDF p14), sound units/table (`9618_w22_qp_13`, PDF p3), processor instruction/bit rows (`9618_s22_qp_12`, PDF p5), and an MS answer table with mark column (`9618_w22_ms_12`, PDF p3). These samples are legible, and the corresponding regions are present in the A2 manifest. The batch still needs A9 review of the visual risk classes; these samples do not establish that all 87 regions are independently verified.

## Disposition

Two Major A2 record defects remain open: missing context/dependency metadata and missing displayed marks on all part records. The source/version baseline is sound, and the scope edge is recorded for Lead review. A3 makes no batch acceptance decision; A9 should review corrected A2 evidence and retest the cited classes.
