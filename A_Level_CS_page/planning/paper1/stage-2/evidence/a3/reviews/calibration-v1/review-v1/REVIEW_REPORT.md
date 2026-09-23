# Independent A3 review — calibration-v1

Review work order: `P1-S2-RVW-CALIBRATION-V1`. Reviewer role: A3 syllabus specialist, independent of the A4 calibration author. Review date: 22/09/2026.

## Recommendation

`PASS_RECOMMENDED` for the calibration specialist gate. This recommendation does not accept the package or close C1; A0 and the fresh A9 retain those decisions.

Findings: **0 Critical, 0 Major, 0 Minor**.

## Evidence checked

- Rehashed all 13 work-order inputs. Bytes and SHA256 match the issued input manifest.
- Parsed all 25 unique calibration records and resolved every `corpus_target_id` plus its one declared `marking_item_id` against the frozen Stage 1 corpus.
- Confirmed every target is a leaf part, is `MS_LINKED`, is not a container, and has exactly one official marking link.
- Re-inspected the target QP and MS pages. Visual/layout-sensitive checks included the matching lines in CAL-02, CAL-07 and CAL-15, the relational structure in CAL-19, the truth table in CAL-24 and the circuit/output expressions in CAL-25.
- Checked the five family mismatches: CAL-07 is IDE matching rather than F-E trace; CAL-19 is schema design rather than SQL; CAL-20 is normalisation explanation rather than SQL; CAL-21 is database comparison rather than logic; CAL-23 is a foreign-key/table pair rather than logic. Each remains explicit and was not silently replaced.
- Checked the six partial fits: CAL-01, CAL-02 and CAL-03 cover bitmap terminology/layout without calculation; CAL-09 covers register purposes without a trace; CAL-10 corrects F-E statements rather than tracing execution; CAL-14 is an ordered F-E register sequence rather than a validation/verification scenario. The source-derived classification is preserved.
- Confirmed all 20 target null/absent command-word fields triggered a separate `source_inspected_command_word`; the observation remains separate from analyst response-product and cognitive-action fields.
- Confirmed grouped/threshold/capped/row-atomic/structural conditions are preserved. In particular, CAL-02, CAL-07 and CAL-15 do not become one-mark-per-line claims; CAL-10 keeps statement number plus correction as one row; CAL-12 keeps its subset caps; CAL-19 stays a linked structural design.
- Compared taxonomy boundaries with syllabus 2026 §§1–8. The proposal classifies response form and evidence behaviour without narrowing required syllabus scope. It makes no unresolved promotion, full-corpus pattern claim or predictive-frequency claim.

## Result against work order

All work-order acceptance checks passed. `FINDINGS.json` is an empty findings set. Output hashes are frozen in the review manifest and handoff.

