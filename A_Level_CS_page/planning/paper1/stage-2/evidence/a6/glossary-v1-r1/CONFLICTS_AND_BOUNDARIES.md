# Glossary v1-r1 — conflicts and source boundaries

Artifact: `P1-S2-A6-01-R1`, version `glossary-v1-r1`. This correction addresses Major `S2-GLO-A3-001`. It remains a terminology seed, not lesson translation, bilingual parity, or an accepted glossary.

## Correction policy

All 69 non-command rows were audited. A syllabus reference can support a term occurrence, a named category or an explicit scope limit without supporting a full technical definition. Therefore:

- every non-command meaning is now `TECHNICAL_CANDIDATE_PENDING_REVIEW`, except `precision`, which is `BOUNDARY_ONLY_NOT_SYLLABUS_TERM_PENDING_REVIEW`;
- each non-command `source_refs.claim_scope` states exactly that the syllabus supports occurrence/scope/classification, while technical meaning is not source-verified;
- all 27 command-word objects and `COMMAND_WORD_REGISTER.jsonl` are byte-identical to v1, preserving the independent A4 exam-language review;
- all VI text remains candidate/null, and all objective/pattern references remain empty with `PENDING_RECONCILIATION`.

`CORRECTION_DELTA.json` lists every changed term, its previous and new status, field-level changes and the finding closure target.

## Source-backed classifications retained

- Syllabus p.24 §6.2 lists **check digit** as a validation method.
- Syllabus p.24 §6.2 lists **parity check** and **checksum** under verification during data transfer.
- Syllabus pp.26–27 §8.3 distinguishes DDL and DML, identifies SQL for both, and limits the stated DML query/modify task to at most two tables.
- Syllabus p.15 §1.2 uses **accuracy** in the sound sampling requirement; it does not name **precision** there.
- Syllabus p.14 names binary/decimal prefix pairs but the cited row does not print numeric multipliers.
- Syllabus passages use **bit** and **byte** but do not define their conversion or prescribe `b`/`B` symbols in the cited text.

These are classification or boundary claims only. Any wider technical meaning in a row is explicitly an AlgoCore candidate awaiting A3 review.

## Command-word boundary retained

The 27 English command words and their paraphrases remain unchanged. They retain the subject-context qualifier and do not imply a fixed number of sentences, bullets or marks. The English command word remains visible in any future bilingual experience.

## Required independent decision

A fresh A3 reviewer must rehash the packet, verify all 69 non-command statuses and claim scopes, confirm the four protected classifications above, and decide whether `S2-GLO-A3-001` is closed. A0 performs the delta audit. A4 review may be reused only after byte-identity checks for all command objects and the command register.
