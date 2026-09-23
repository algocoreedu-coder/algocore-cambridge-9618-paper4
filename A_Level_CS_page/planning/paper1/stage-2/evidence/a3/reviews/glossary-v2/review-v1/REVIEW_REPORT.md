# Independent A3 review — glossary-v2

- Work order: `P1-S2-A3-REVIEW-GLOSSARY-v2`
- Reviewer: fresh independent A3, separate from the A6 author
- Review date: 2026-09-23
- Recommendation: **CHANGES_REQUIRED**

## Decision basis

The issued 280-file manifest was rehashed with zero byte or SHA256 drift. The eight-file A6 packet is closed against its output manifest and handoff. All 96 glossary rows and all 27 command-register rows were reviewed.

The substantive reconciliation checks pass:

- all 96 accepted term identities are present once;
- protected fields are unchanged from accepted glossary-v1-r1;
- the 96-row reconciliation delta reproduces every before/after state and reports no protected-field change;
- all 69 unique objective links were independently reconstructed from the exact term/alias, section guard and accepted requirement; all 86 supporting objective-evidence records resolve and agree with the accepted requirement text and locator;
- all 820 pattern links were independently rebuilt from the accepted requirement bridge or exact command-word observation, with zero missing, extra or dangling link;
- all 30 `RECONCILED_NO_LINK` rows have an explicit disposition and agree with the conservative exact-match rule;
- source and status boundaries remain explicit: 68 non-command rows are technical candidates, `precision` remains a boundary-only non-syllabus-term candidate, and all 27 command words retain source-boundary status while Vietnamese values remain candidates or null;
- the syllabus source hash is exact and the cited pages 14–16, 22, 24–27 and 41–42 were visually checked for the relevant terminology, classifications and command-word table;
- validation/verification, bit/byte and `b`/`B`, check digit/checksum, accuracy/precision and the database boundaries remain distinct in the structured glossary rows;
- the command register is byte-identical to accepted glossary-v1-r1 and all 27 English summaries preserve the official command-word meanings; no positive response-length/mark rule or bilingual-parity claim is present.

## Open finding

`A3-C3C-GLO-001` is an open **Minor** finding. `CONFLICTS_AND_BOUNDARIES.md` contains 13 non-line-feed ASCII control characters and two additional escape-produced line feeds inside intended tokens. They corrupt the rendered text for `requirement_ids`, `b`, `validation`, `verification`, `bit`, `byte`, `accuracy`, `table`, `record`, `field`, `attribute`, `relationship`, `normalisation` and `normalised`.

The structured glossary, reconciliation links, source claims and command register remain correct, so this is classified as presentation corruption rather than a semantic-link or provenance defect. It still blocks PASS because the review work order requires zero open Critical, Major and Minor findings.

## Required correction and retest

A6 should issue a new immutable correction version, replace every control/escape-corrupted token in the conflicts-and-boundaries document with printable literal text, and regenerate the affected QA, output manifest and handoff hashes. The accepted structured glossary and command register should remain unchanged unless a separately sourced correction is introduced. A fresh independent retest must rehash the new packet, require zero disallowed control characters, compare the repaired text against the structured boundaries, and confirm the substantive reconciliation digests remain unchanged.

This review does not repair author files, accept C3c, update trackers, or start downstream work.
