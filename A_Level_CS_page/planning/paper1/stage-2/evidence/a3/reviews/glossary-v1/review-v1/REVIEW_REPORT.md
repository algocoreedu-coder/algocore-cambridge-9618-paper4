# Independent A3 scope review — glossary-v1

Review work order: `P1-S2-RVW-GLOSSARY-A3-V1`. Reviewer role: A3 syllabus specialist, independent of the A6 glossary author. Review date: 22/09/2026.

## Recommendation

`CHANGES_REQUIRED`. The artifact must not pass the glossary specialist gate in its current version.

Findings: **0 Critical, 1 Major, 0 Minor**.

## Evidence checked

- Rehashed all 11 issued inputs. Bytes and SHA256 match the review manifest.
- Parsed 96 unique glossary rows and 27 unique command-word rows. Together they contain the required 123 source-reference instances, all pointing to the frozen syllabus bytes and to valid pages 14–27 or 41–42.
- Verified all 96 objective and pattern reference lists are empty, all 96 rows remain `PENDING_RECONCILIATION`, and all Vietnamese values are candidates or null. No VI/EN parity claim is made.
- Checked the bit/byte and `b`/`B` distinctions, binary/decimal prefixes, accuracy/precision boundary, validation/verification/check-digit/checksum classification, database vocabulary and normal-form boundaries against syllabus 2026.
- Compared all 27 English command-word paraphrases to syllabus PDF/print pages 41–42. They preserve the official contextual qualifier and do not attach a fixed response length or mark count.

## Blocking source-boundary issue

Finding `S2-GLO-A3-001` records that several technical rows go beyond term occurrence and scope boundary into a substantive definition, while the only cited authority merely names the term and the row reports `en_status=SOURCE_BOUNDARY_VERIFIED`. Representative examples are the rules/correctness claim for data validation, the independently-entered comparison for double entry, and the identifying/reference semantics for primary, candidate and foreign keys. Those meanings may be valid, but the cited syllabus passages do not establish them. The work order states that unsupported definitions or false syllabus attribution are Major.

A6 must either pin a permitted, reviewed technical authority that supports each substantive definition, or rewrite the row as a syllabus-occurrence/scope boundary and downgrade its English status to a technical candidate pending review. A fresh independent A3 retest must rehash and recheck all affected rows and source claims; unchanged command-word rows may be reused only if their hashes remain fixed.

