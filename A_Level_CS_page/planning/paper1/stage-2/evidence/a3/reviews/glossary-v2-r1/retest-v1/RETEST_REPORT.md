# Fresh independent A3 retest — glossary-v2-r1

- Work order: `P1-S2-A3-RETEST-GLOSSARY-v2-r1`
- Reviewer: fresh independent A3 source/term/objective reviewer
- Review date: 2026-09-23
- Recommendation: **CHANGES_REQUIRED**

## Decision basis

The issued 305-file manifest was rehashed with zero missing files, byte drift or SHA256 drift. The A6 author directory contains exactly the required eight files. Its six manifest-listed outputs and all handoff-pinned files close by byte length and SHA256. The author handoff is `aaea630bdde0d775adc4d9062a90f1bd35bc91c21d53e377d6545ded117013a5`.

The full corrected packet was reviewed, not only the previously disputed rows:

- all 96 term IDs are unique and every glossary-v1-r1 protected field is unchanged; the independent protected-field digest remains `48cabe220830af2a558d8a2915592cb415149b35e034e26e73c9ddf44a01e1c8`;
- all 96 source references resolve to the pinned 2026 syllabus hash and preserve a non-empty locator and claim boundary;
- all 69 term-objective pairs and all 80 remaining objective-evidence records resolve to accepted objectives and atomic requirements, with exact parent objective, controlled requirement text, authority locator, matched term/alias and foundation hash;
- `TERM-VAL-CHECK-DIGIT` retains objective `AC26-6.2-02` through exactly `REQ-6.2-02-07`; `REQ-6.2-02-01` through `REQ-6.2-02-06` are absent and its nine rejected pattern links remain absent;
- all 874 term-pattern pairs reconstruct exactly from accepted atomic-requirement bridges or exact trimmed semicolon command tokens, with zero missing, extra or dangling pair; this structural check does not replace A4's independent pattern-semantic retest;
- all 29 `RECONCILED_NO_LINK` rows have no objective/pattern/evidence record and retain an explicit no-link disposition;
- all 27 command-register rows are byte-identical to accepted glossary-v1-r1 (`2d0693bd9a370b080c2ea35a17468f7d9ccedb998900dedc529da70276474b56`). The English summaries and locators were visually checked against syllabus pages 41–42 and retain no fixed response-length or mark rule;
- syllabus pages 14–16, 22, 24–27 and 41–42 were visually inspected. The validation/verification and check digit/checksum classifications, bit/byte scope, accuracy boundary, database labels, normalisation scope and DML two-table limit remain source-bounded;
- every one of the eight author outputs decodes as UTF-8 and contains zero prohibited ASCII controls or U+FFFD replacement characters. All repaired tokens in the boundary document are printable and the statements are consistent with the structured rows;
- no bilingual-parity, approved-translation, lesson, split, app, Stage 3 or fixed-mark claim was introduced.

## Open finding

`A3-C3C-GLO-R1-001` is an open **Minor** evidence-consistency finding. `RECONCILIATION_DELTA.json#/summary/changed_rows` and QA check `GLO-R1-Q09` report `changed_rows=10`, but a field-by-field comparison of every delta `before` and `after` state finds 28 modified rows: `TERM-VAL-CHECK-DIGIT` plus all 27 command-word rows. Ten rows change pattern membership; another 18 command rows still change `reconciliation_methods` and `reconciliation_disposition`, with two of those also changing reconciliation evidence.

The 96 delta rows reproduce the actual old and new values, so the corrected glossary links and source meaning are not damaged. The summary/QA count is nevertheless false against the packet it describes. This violates the correction acceptance requirement that delta and QA agree with independently recomputed source counts, and PASS requires zero open Minor findings.

## Required correction and retest

A6 should issue a new immutable correction packet. It should report `reconciliation_field_changed_rows=28` and, if the narrower count is useful, label `pattern_membership_changed_rows=10` separately. The author must regenerate QA, output-manifest and handoff hashes without changing the accepted 96 glossary rows or byte-identical command register unless a separately sourced correction is documented.

A fresh independent A3 retest must rehash the new packet, recompute both counts from the actual before/after values, and repeat the full source, terminology, objective and text-integrity checks. This handoff does not repair author files, update trackers, accept C3c or start downstream work.
