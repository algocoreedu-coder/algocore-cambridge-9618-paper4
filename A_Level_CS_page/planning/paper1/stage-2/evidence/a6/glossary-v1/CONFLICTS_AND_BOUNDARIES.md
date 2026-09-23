# Glossary v1 — conflicts and boundaries

Artifact: `P1-S2-A6-01`, version 1.0. Scope: Cambridge 9618 Paper 1, syllabus 2026. This is a terminology seed for specialist review. It is not lesson translation and does not establish VI/EN parity.

## Authority and status

The only definition authority used for this seed is `697372-2026-syllabus.pdf`, SHA256 `bf1b77a2b765d10eb4b005ecae0412add35cf6113ba3218a517893abfc9f2470`. Page locators below are PDF pages and printed syllabus pages. Every Vietnamese rendering is a candidate until independent A3/A4 review. Objective and pattern references are intentionally empty in v1 and all records remain `PENDING_RECONCILIATION`.

## Technical boundaries

- **bit / byte and symbols:** the syllabus uses *bit* in data representation, bit depth and bit manipulation, and uses *byte* in the phrase “parity check (byte and block)”; it does not define the bit-to-byte conversion or prescribe `b`/`B` symbols in the cited passages. The seed therefore records `bit`, `byte`, `b` and `B` as distinct entries, prohibits treating them as interchangeable, and leaves the numeric conversion and symbol convention for A3 source review before lesson use. Sources: syllabus pp.14–15, 22, 24.
- **binary / decimal prefixes:** kibi/mebi/gibi/tebi and kilo/mega/giga/tera are explicitly contrasted in §1.1. The seed does not infer numerical multipliers that are not printed in the cited syllabus passage. Source: syllabus p.14.
- **accuracy / precision:** §1.2 explicitly uses *accuracy* for the impact of sound sampling choices. It does not name *precision* there. `precision` is retained only as an ambiguity boundary, with no Vietnamese candidate and with a prohibition on using it as an automatic synonym for accuracy. Source: syllabus p.15.
- **validation / verification / check digit:** the 2026 syllabus places check digit under validation. Verification covers data entry and data transfer; transfer examples include parity checks and checksum. Validation does not prove that accepted data are correct, and verification is not a plausibility test. Source: syllabus p.24, §6.2. This overrides conflicting secondary classification noted in Stage 0.
- **check digit / checksum:** they are not synonyms in this syllabus. Check digit is listed as a validation method; checksum is listed under verification during transfer. Neither is represented as a guarantee that every error will be found. Source: syllabus p.24.
- **database vocabulary:** `record`/`tuple` and `field`/`attribute` are preserved as separate syllabus terms with contextual overlap, not collapsed into a single display label. Candidate, primary, secondary and foreign keys remain distinct. Relationship cardinalities and referential integrity are separate concepts. Source: syllabus p.25, §8.1.
- **database / DBMS / SQL / DDL / DML:** a database is the organised data resource; a DBMS provides management functions. SQL is identified as the industry standard used for both DDL and DML. DDL changes structure; DML queries or maintains data. The Paper 1 DML scope is limited to the listed subset and at most two tables. Sources: syllabus pp.26–27, §§8.2–8.3.
- **normalisation:** 1NF, 2NF and 3NF are ordered named forms in scope. This seed does not invent rule text for each form because those detailed definitions are not printed in the cited syllabus rows. Source: syllabus p.25.

## Command-word boundaries

The command words retain their English form in both language experiences. Vietnamese text is a candidate explanation of the expected response, not a replacement token for the exam command.

- `Identify`, `Give`, `State` and `Define` can all lead to short responses, but their required products differ: recognition/selection, production from source or recall, clear expression, and precise meaning.
- `Describe` presents characteristics or main features; `Explain` makes reasons, purposes or relationships clear and supports them with relevant evidence.
- `Compare` permits similarities and/or differences; `Contrast` is restricted to differences.
- `Assess`, `Evaluate` and `Justify` all require judgement or support, but they are not interchangeable: informed judgement, judgement/calculation of quality or value, and evidence/argument supporting a case.
- `Analyse`, `Examine` and `Discuss` all require developed treatment, with distinct emphasis on elements/relationships, close investigation, and structured depth.
- `Complete`, `Draw`, `Sketch` and `Write` specify different response products. `Draw` has a syllabus-specific matching-line meaning; `Sketch` is a freehand representation of key features and proportions.
- `Predict` uses available information to propose what may happen; `Suggest` applies knowledge where several valid proposals or considerations may exist.
- No command word is mapped to a fixed number of sentences, bullets or marks. Marking demand must come from the question and official mark scheme context.

## Items for independent review

1. A3: confirm the technical boundary records for bit/byte symbols, precision, database synonyms and normal forms; either add an approved authority in a later work order or retain the limitations.
2. A4: verify all 27 command-word paraphrases against syllabus pp.41–42 and confirm that no paraphrase narrows the official contextual meaning.
3. A3 and A4: decide which Vietnamese candidates may become controlled terms. Until then, every VI value stays `CANDIDATE_NEEDS_REVIEW` or null.
4. A6 reconciliation v2: populate objective and final-pattern IDs only from accepted Stage 2 artifacts and record every rename or removal.
