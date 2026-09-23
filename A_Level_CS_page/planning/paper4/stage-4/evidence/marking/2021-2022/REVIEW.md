# S4-S1 review - marking source batch 2021-2022

Status: **SUBMITTED**. This is an agent submission for Lead review, not a canonical Stage 4 gate decision.

## Coverage and integrity

- Scope matches the locked baseline: 11 papers, 33 questions, 228 scored parts and 825 original marks.
- `QUESTION_REQUIREMENTS.json` has exactly one row per `part_id`; `MARKING_SUBMISSION.json` has the same exact set with no duplicates or omissions.
- All assessed-pattern, context-pattern and dependency relations are carried from the frozen Stage 2 map. Marks remain owned by the part row and are never divided among patterns.
- The submission contains 863 editorial marking atoms. Every atom has `authority=official_ms`, an MS source ID and one-based PDF page locator. QP requirements likewise retain official QP source IDs and page locators.
- Award modelling uses the controlled semantics `discrete`, `group_max`, `alternative`, `dependent`, `holistic`, `evidence` and `accept_equivalent`. For every unambiguous part, the modelled award upper bound equals its official part total. This is an integrity check, not a claim that each bullet always earns an independent mark.
- The Stage 1 risk baseline is preserved as 14 unique issue IDs and 27 paper-specific occurrences. Listings implicated by those issues remain unverified and carry a Stage 5 obligation.
- `validate_submission.py` reports PASS for 18/18 checks. Four rows remain visibly marked `PENDING_SOURCE_DECISION`; the PASS does not close those decisions.

## Lead adjudication required

### S4-S1-DEC-001 - W21 ReadData rubric grouping

Affected parts: `9618_w21_41_2(e)` and `9618_w21_42_2(e)`.

The MS prints two exception-related bullets followed by an implementation group headed `max 7`, while the official part total is 8. Stage 1 already records this as `W21-2E-RUBRIC`. The submission retains every criterion, sets the atom values/group arithmetic to unresolved, and keeps the official part total at 8. Lead must decide the canonical grouping after direct facsimile inspection; summing the displayed bullets to 9 is expressly disallowed.

### S4-S1-DEC-002 - W22 ReadFile seven bullets under six marks

Affected parts: `9618_w22_41_1(b)` and the equivalent variant `9618_w22_43_1(b)`.

The MS prints five file-reading bullets and two exception-handling continuation bullets under repeated one-mark-per-point headings, but the official part total is 6. The submission retains all seven criteria without assigning an arithmetic atom total. The likely interpretation is one combined exception-handling point, but that is an inference and requires Lead approval before canonical merge.

## Source-risk carryover

`SOURCE_RISK_REGISTER.json` preserves all 27 Stage 1 occurrences, including the linked-list free-list overwrite order, TreasureChest capacity/constructor discrepancies, queue wrap/dequeue examples, recursive binary-search midpoint/guard, file/OOP integration snippets, array boundary, attribute spelling and missing-global issues. Stage 4 does not repair or certify these listings. The register states the design disposition and the exact Stage 5 execution obligation for every occurrence.

## Semantic and visual review evidence

The submission was built from the frozen Stage 1 `QUESTION_INDEX.json`, `SOURCE_ISSUES.json`, per-paper MS candidate cells, and Stage 2 `QUESTION_PATTERN_MAP.json`. The following existing Stage 1 facsimiles were visually inspected for high-risk structures:

- `9618_s21_41_ms_p22.png`: TreasureChest read-data max-8 group and the 4-versus-5 source inconsistency.
- `9618_s22_41_ms_p29.png`: circular queue enqueue listing and pointer/wrap state.
- `9618_s22_42_ms_p22.png`: recursive binary-search completed statements and additional criteria.
- `9618_w21_41_ms_p18.png`: six completed AddNode statements plus two further marking points.
- `9618_w22_41_ms_p5.png`: FindValues boundary discrepancy (`range(0,99)` versus all 100 values).
- `9618_w22_42_ms_p21.png`: six distinct queue-enqueue points and the Python scope caveat.

All page numbers in the JSON are one-based PDF pages. Text extraction is used for compact editorial paraphrase; the original PDF/facsimile remains authoritative for geometry, indentation, tables and printed grouping.

## Files submitted

- `QUESTION_REQUIREMENTS.json` - one QP requirement row per part.
- `MARKING_SUBMISSION.json` - one marking row per part with official-MS atoms.
- `SOURCE_RISK_REGISTER.json` - canonical Stage 1 issue definitions, occurrences and carryover.
- `VALIDATION.json` - reproducible 18-check result.
- `build_submission.py` and `validate_submission.py` - deterministic builder and validator.

No method card, canonical solution method, executable Python, expected trace or learner-facing content was authored in this work order.
