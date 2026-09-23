# Source caveat carryover - Stage 4

Status: **DESIGN_REVIEWED**. This register preserves source risks and Lead decisions; it does not certify source listings as executable.

## Coverage

- 25 stable source-risk IDs and 62 retained occurrences across 61 distinct parts.
- 25 issue IDs retain explicit Stage 5 obligations.
- 2 of 2 source arithmetic decisions are Lead-resolved; unresolved source decisions: 0.
- 1 batch fidelity policy is retained outside the source-issue and occurrence counts.

| Batch | Stable issues | Occurrences | Source submission |
|---|---:|---:|---|
| S4-S1 (2021-2022) | 14 | 27 | `evidence/marking/2021-2022/SOURCE_RISK_REGISTER.json` |
| S4-S2 (2023-2024) | 5 | 29 | `evidence/marking/2023-2024/SOURCE_RISK_REGISTER.json` |
| S4-S3 (2025) | 6 | 6 | `evidence/marking/2025/SOURCE_RISK_REGISTER.json` |

## Batch fidelity policy

### S4-S2-POLICY-LAYOUT-CODE-FIDELITY

- Authority: `stage1_fidelity_policy`; applies to: 2023-2024.
- Policy: Tables, diagram edges, arrows, indentation and private-name underscores cannot be certified from plain-text extraction. Use original PDFs/facsimiles for layout-sensitive decisions and independently execute derived code in Stage 5.
- Source issue: `false`; per-part source refs: `false`.


## Lead-resolved source decisions

### S4-S1-DEC-001 - 9618_w21_41_2(e), 9618_w21_42_2(e)

- Finding: The page prints two exception bullets under '1 mark per bullet point', then nine implementation bullets under '1 mark per bullet point to Max 7', while the marks column gives 8.
- Canonical treatment: Retain all eleven criteria as official marking evidence, assign no independent atom values, and apply a single part-level holistic ceiling of 8. Do not add the printed bullet counts or imply that any specific criterion is worth a separate mark.
- Disposition: `HOLISTIC_PART_LEVEL`; arithmetic claim: `official_part_total_only`; official total: 8.
- Status: **RESOLVED**.

### S4-S1-DEC-002 - 9618_w22_41_1(b), 9618_w22_43_1(b)

- Finding: The page prints five file-processing bullets and two exception bullets, each section headed '1 mark per point', while the marks column gives 6.
- Canonical treatment: Retain all seven criteria as official marking evidence, assign no independent atom values, and apply a single part-level holistic ceiling of 6. Do not infer which two printed bullets combine unless Cambridge supplies a clarifying source.
- Disposition: `HOLISTIC_PART_LEVEL`; arithmetic claim: `official_part_total_only`; official total: 6.
- Status: **RESOLVED**.

## Stable issue register

### S21-1DI-FREE

- Batch: S4-S1; kind: `source_code_verification_required`; occurrences: 3.
- Risk: MS Python sample writes a new node with nextNode=-1 over the free node before reading linkedList[emptyList].nextNode to advance the free list. Requires independent execution and pointer-state verification before use as a teaching solution. No corrected code authored at Stage1.
- Stage 4 disposition: Preserve the source requirement and locator, exclude the source listing from any claim of verified correctness, and carry the identified discrepancy into the solution design contract.
- Stage 5 obligation: Independently implement and test the affected boundary, identifier, pointer, file, scope, or integration behaviour before learner-facing use.
- Locators: 9618_s21_qp_41 p.4; 9618_s21_ms_41 p.9; 9618_s21_qp_42 p.4; 9618_s21_ms_42 p.9; 9618_s21_qp_43 p.4; 9618_s21_ms_43 p.9

### S21-2C-NAME

- Batch: S4-S1; kind: `source_identifier_variation`; occurrences: 3.
- Risk: QP asks to sort arrayData but supplied pseudocode and MS examples use theArray. Preserve original identifier context; reconcile during solution authoring.
- Stage 4 disposition: Preserve the source requirement and locator, exclude the source listing from any claim of verified correctness, and carry the identified discrepancy into the solution design contract.
- Stage 5 obligation: Independently implement and test the affected boundary, identifier, pointer, file, scope, or integration behaviour before learner-facing use.
- Locators: 9618_s21_qp_41 p.7; 9618_s21_ms_41 p.19,20; 9618_s21_qp_42 p.7; 9618_s21_ms_42 p.19,20; 9618_s21_qp_43 p.7; 9618_s21_ms_43 p.19,20

### S21-3A-PARAM

- Batch: S4-S1; kind: `source_code_verification_required`; occurrences: 3.
- Risk: MS Python constructor receives pointsP but assigns self.__points = points. Also node declaration page4 uses Data while outputNodes page7 accesses data; preserve case and verify the assembled program independently.
- Stage 4 disposition: Preserve the source requirement and locator, exclude the source listing from any claim of verified correctness, and carry the identified discrepancy into the solution design contract.
- Stage 5 obligation: Independently implement and test the affected boundary, identifier, pointer, file, scope, or integration behaviour before learner-facing use.
- Locators: 9618_s21_qp_41 p.8; 9618_s21_ms_41 p.21; 9618_s21_qp_42 p.8; 9618_s21_ms_42 p.21; 9618_s21_qp_43 p.8; 9618_s21_ms_43 p.21

### S21-3B-COUNT

- Batch: S4-S1; kind: `source_inconsistency`; occurrences: 3.
- Risk: QP specifies five questions/objects; one MS bullet says arrayTreasure with 4 elements while subsequent bullets require all 5. Preserve both; never teach 4-element capacity as QP requirement.
- Stage 4 disposition: Preserve the source requirement and locator, exclude the source listing from any claim of verified correctness, and carry the identified discrepancy into the solution design contract.
- Stage 5 obligation: Independently implement and test the affected boundary, identifier, pointer, file, scope, or integration behaviour before learner-facing use.
- Locators: 9618_s21_qp_41 p.9; 9618_s21_ms_41 p.22; 9618_s21_qp_42 p.9; 9618_s21_ms_42 p.22; 9618_s21_qp_43 p.9; 9618_s21_ms_43 p.22

### S22-41-3C-DEQUEUE

- Batch: S4-S1; kind: `source_code_verification_required`; occurrences: 2.
- Risk: MS Python Dequeue uses lowercase false, Queue(Head), and resets Head when >=9 after increment, whereas the rubric says more than9 after increment. Preserve source; verify empty/full/wrap behaviour independently.
- Stage 4 disposition: Preserve the source requirement and locator, exclude the source listing from any claim of verified correctness, and carry the identified discrepancy into the solution design contract.
- Stage 5 obligation: Independently implement and test the affected boundary, identifier, pointer, file, scope, or integration behaviour before learner-facing use.
- Locators: 9618_s22_qp_41 p.9; 9618_s22_ms_41 p.30; 9618_s22_qp_43 p.9; 9618_s22_ms_43 p.30

### S22-41-PYTHON-INTEGRATION

- Batch: S4-S1; kind: `source_code_verification_required`; occurrences: 2.
- Risk: Python example snippets contain integration candidates requiring verification: File.close without call, OutputHighScore versus OutputHighScores, score/Score case, integer-score comparison with raw file strings, Arrange break indentation, filename leading space, and VhangeHealth versus ChangeHealth. This is an observation register, not an exhaustive solution audit.
- Stage 4 disposition: Preserve the source requirement and locator, exclude the source listing from any claim of verified correctness, and carry the identified discrepancy into the solution design contract.
- Stage 5 obligation: Independently implement and test the affected boundary, identifier, pointer, file, scope, or integration behaviour before learner-facing use.
- Locators: 9618_s22_qp_41 p.6; 9618_s22_ms_41 p.6,8,10,13,15,17,19,25; 9618_s22_qp_43 p.6; 9618_s22_ms_43 p.6,8,10,13,15,17,19,25

### S22-42-2CI-GUARD

- Batch: S4-S1; kind: `source_code_verification_required`; occurrences: 1.
- Risk: MS Python sample uses Upper >= 0 whereas QP uses Upper >= Lower; also capital If is printed in the Python example. Preserve source and verify independently.
- Stage 4 disposition: Preserve the source requirement and locator, exclude the source listing from any claim of verified correctness, and carry the identified discrepancy into the solution design contract.
- Stage 5 obligation: Independently implement and test the affected boundary, identifier, pointer, file, scope, or integration behaviour before learner-facing use.
- Locators: 9618_s22_qp_42 p.6; 9618_s22_ms_42 p.22

### S22-42-2CI-MID

- Batch: S4-S1; kind: `source_code_verification_required`; occurrences: 1.
- Risk: Supplied BinarySearch midpoint uses Lower + (Upper - 1), followed by integer division. Preserve source exactly; boundary/termination behaviour must be independently tested in Stage5 before producing teaching code.
- Stage 4 disposition: Preserve the source requirement and locator, exclude the source listing from any claim of verified correctness, and carry the identified discrepancy into the solution design contract.
- Stage 5 obligation: Independently implement and test the affected boundary, identifier, pointer, file, scope, or integration behaviour before learner-facing use.
- Locators: 9618_s22_qp_42 p.6; 9618_s22_ms_42 p.22,23

### S22-42-CARD-SNIPPETS

- Batch: S4-S1; kind: `source_code_verification_required`; occurrences: 1.
- Risk: Python card examples require integration verification: read-file block indentation/File.close, chooseCard versus ChooseCard case, lowercase true, and NumbersChosen(...) rather than list subscription occur in the extracted source. No executable solution is certified in Stage1.
- Stage 4 disposition: Preserve the source requirement and locator, exclude the source listing from any claim of verified correctness, and carry the identified discrepancy into the solution design contract.
- Stage 5 obligation: Independently implement and test the affected boundary, identifier, pointer, file, scope, or integration behaviour before learner-facing use.
- Locators: 9618_s22_qp_42 p.8; 9618_s22_ms_42 p.29,32,34

### S25-41-MS31-INIT

- Batch: S4-S3; kind: `source_defect_and_extraction_loss`; occurrences: 1.
- Risk: The Python constructor name is visibly printed with a single underscore on each side, while extracted text loses the underscores.
- Stage 4 disposition: Treat the rubric criteria as marking authority; do not copy or silently repair the sample listing in Stage 4.
- Stage 5 obligation: Verify an independently authored Python implementation and boundary fixtures; do not certify the MS sample as executable source.
- Locators: 9618_s25_ms_41 p.31

### S25-41-MS35-INIT

- Batch: S4-S3; kind: `source_defect_and_extraction_loss`; occurrences: 1.
- Risk: The Tree Python constructor is visibly printed as def _init_(self, FirstNode), with a single underscore on each side; plain-text extraction can additionally lose underscores.
- Stage 4 disposition: Treat the rubric criteria as marking authority; do not copy or silently repair the sample listing in Stage 4.
- Stage 5 obligation: Verify an independently authored Python implementation and boundary fixtures; do not certify the MS sample as executable source.
- Locators: 9618_s25_ms_41 p.35

### S25-41-Q1C-CASE

- Batch: S4-S3; kind: `source_code_verification_required`; occurrences: 1.
- Risk: The Python sample uses both X and x in the same loop/output fragment.
- Stage 4 disposition: Preserve the official criteria and require an independent case-consistent implementation test in Stage 5.
- Stage 5 obligation: Verify an independently authored Python implementation and boundary fixtures; do not certify the MS sample as executable source.
- Locators: 9618_s25_ms_41 p.12

### S25-42-Q2A-CLASSNAME

- Batch: S4-S3; kind: `source_identifier_variation`; occurrences: 1.
- Risk: The QP requests NewRecord, while the Python example instantiates a class named Record.
- Stage 4 disposition: Keep NewRecord as the QP contract; record the example-name discrepancy for Stage 5 fixture review.
- Stage 5 obligation: Verify an independently authored Python implementation and boundary fixtures; do not certify the MS sample as executable source.
- Locators: 9618_s25_ms_42 p.19,20

### S25-42-Q3CI-NAME

- Batch: S4-S3; kind: `source_identifier_variation`; occurrences: 1.
- Risk: A criterion uses Territory/SetTerritory while the QP and example use TerritorySize/SetTerritorySize.
- Stage 4 disposition: Preserve QP identifiers in the design and treat the MS wording as an accepted semantic criterion, pending Stage 5 assembly checks.
- Stage 5 obligation: Verify an independently authored Python implementation and boundary fixtures; do not certify the MS sample as executable source.
- Locators: 9618_s25_ms_42 p.40,41

### S4-S2-S23-QP-ARROW-EXTRACTION

- Batch: S4-S2; kind: `extraction_fidelity`; occurrences: 6.
- Risk: Assignment arrows visible in s23 QP 41/43 PDF page 9 are absent from extracted text.
- Stage 4 disposition: Treat original PDF/facsimile as authoritative for assignment direction; summaries remain navigation only.
- Stage 5 obligation: Transcribe/implement from the facsimile and verify state changes, not from plain extraction alone.
- Locators: 9618_s23_qp_41 p.9; 9618_s23_qp_43 p.9

### S4-S2-S24-1B-BULLET-MARK-MISMATCH

- Batch: S4-S2; kind: `source_marking_interpretation`; occurrences: 2.
- Risk: s24 41/43 MS 1(b) shows three displayed bullets but the Marks column and QP allocate five marks.
- Stage 4 disposition: Retain total five and holistic/unallocated semantics; do not convert bullets to five invented points.
- Stage 5 obligation: Use the full official row as the acceptance contract; do not claim a per-line score split.
- Locators: 9618_s24_ms_41 p.5; 9618_s24_ms_43 p.5

### S4-S2-S24-CHOOSETREE-NAME

- Batch: S4-S2; kind: `source_identifier_variation`; occurrences: 2.
- Risk: s24 41/43 QP 2(e)(iii) says ChooseTrees() although the defined procedure is ChooseTree().
- Stage 4 disposition: Preserve both official spellings; method join must identify the mismatch rather than silently repair it.
- Stage 5 obligation: Choose one internally consistent identifier in tested code and document the source discrepancy.
- Locators: 9618_s24_qp_41 p.9,10; 9618_s24_qp_43 p.9,10

### S4-S2-W23-41-43-MS-CONTINUATIONS

- Batch: S4-S2; kind: `unlabelled_ms_continuation`; occurrences: 18.
- Risk: Several w23 41/43 MS pages continue a preceding row without repeating its label; they are not extra marking rows.
- Stage 4 disposition: Use Stage 1 page ownership; continuation content stays with the preceding part and creates no duplicate mark.
- Stage 5 obligation: Verify any assembled example code independently; continuation layout is not executable proof.
- Locators: 9618_w23_ms_41 p.5,6,7,8,21,22,23; 9618_w23_ms_43 p.5,6,7,8,21,22,23

### S4-S2-W23-42-MS-LABEL-TYPO

- Batch: S4-S2; kind: `source_label_typo`; occurrences: 1.
- Risk: The w23_42 MS prints 3(b(iii) on PDF page 29; QP and sequence identify 3(b)(iii).
- Stage 4 disposition: Keep canonical part identity from QP; retain raw-label caveat and the one indexed mark.
- Stage 5 obligation: None beyond normal executable verification; do not reproduce the malformed label in learner material.
- Locators: 9618_w23_ms_42 p.29; 9618_w23_qp_42 p.12

### W21-2E-RUBRIC

- Batch: S4-S1; kind: `source_marking_interpretation`; occurrences: 2.
- Risk: MS has 8 marks in Marks column, two exception bullets followed by a group headed max 7. Retain total 8; do not sum individual bullets into 9. Mark-point allocation belongs to Stage4 review.
- Stage 4 disposition: Keep the official part total at 8 and preserve the exception criteria plus the capped implementation group. Lead must adjudicate whether the two exception bullets sit inside or outside the printed max-7 group before canonical merge; do not sum them to 9.
- Stage 5 obligation: No execution implication; retain the Lead-approved group semantics in downstream rubric checks.
- Locators: 9618_w21_qp_41 p.5; 9618_w21_ms_41 p.12; 9618_w21_qp_42 p.5; 9618_w21_ms_42 p.12

### W21-3B-INDENT

- Batch: S4-S1; kind: `source_code_verification_required`; occurrences: 2.
- Risk: MS Python AddNode sample has visually uneven indentation near FreeNode increment and else; source PDF facsimile is authoritative, sample is not certified runnable code. Independent implementation verification required.
- Stage 4 disposition: Preserve the source requirement and locator, exclude the source listing from any claim of verified correctness, and carry the identified discrepancy into the solution design contract.
- Stage 5 obligation: Independently implement and test the affected boundary, identifier, pointer, file, scope, or integration behaviour before learner-facing use.
- Locators: 9618_w21_qp_41 p.8,9; 9618_w21_ms_41 p.18; 9618_w21_qp_42 p.8,9; 9618_w21_ms_42 p.18

### W22-41-1C-RANGE

- Batch: S4-S1; kind: `source_code_verification_required`; occurrences: 2.
- Risk: MS Python FindValues loops range(0,99) despite a 100-element array and the rubric requiring all100. The printed indentation is uneven. Preserve source and verify index99/boundary behaviour independently.
- Stage 4 disposition: Preserve the source requirement and locator, exclude the source listing from any claim of verified correctness, and carry the identified discrepancy into the solution design contract.
- Stage 5 obligation: Independently implement and test the affected boundary, identifier, pointer, file, scope, or integration behaviour before learner-facing use.
- Locators: 9618_w22_qp_41 p.2; 9618_w22_ms_41 p.5; 9618_w22_qp_43 p.2; 9618_w22_ms_43 p.5

### W22-42-2A-ATTRIBUTE

- Batch: S4-S1; kind: `source_code_verification_required`; occurrences: 1.
- Risk: MS Python constructor spells __XCoordiante, while getter and ChangePosition use __XCoordinate. Text extraction preserves underscores in this sample; this is a source identifier discrepancy, not a normalization instruction.
- Stage 4 disposition: Preserve the source requirement and locator, exclude the source listing from any claim of verified correctness, and carry the identified discrepancy into the solution design contract.
- Stage 5 obligation: Independently implement and test the affected boundary, identifier, pointer, file, scope, or integration behaviour before learner-facing use.
- Locators: 9618_w22_qp_42 p.5; 9618_w22_ms_42 p.11,12,13

### W22-42-3B-SCOPE

- Batch: S4-S1; kind: `source_code_verification_required`; occurrences: 1.
- Risk: MS Python Enqueue reads and assigns HeadPointer without declaring it global while global Queue and TailPointer are declared. Preserve source; assembled program must be independently verified before teaching use.
- Stage 4 disposition: Preserve the source requirement and locator, exclude the source listing from any claim of verified correctness, and carry the identified discrepancy into the solution design contract.
- Stage 5 obligation: Independently implement and test the affected boundary, identifier, pointer, file, scope, or integration behaviour before learner-facing use.
- Locators: 9618_w22_qp_42 p.8; 9618_w22_ms_42 p.21

### W25-43-Q2B-FULL-GUARD

- Batch: S4-S3; kind: `source_code_verification_required`; occurrences: 1.
- Risk: The official criterion requires full detection and FALSE on full, but the printed language samples show a comparison that appears to insert when QueueTail is at or beyond 99.
- Stage 4 disposition: Use the official criterion as the Stage 4 contract; require boundary tests at empty, 99 occupied and 100 occupied in Stage 5.
- Stage 5 obligation: Verify an independently authored Python queue implementation with explicit fixtures for an empty queue, 99 occupied slots and 100 occupied slots; confirm FALSE at full capacity and do not certify or silently repair the MS sample listing.
- Locators: 9618_w25_ms_43 p.22,23

## Boundary

The register carries official-source defects, extraction/layout limits and interpretation decisions forward. It does not silently repair QP/MS text, treat an example listing as verified code, or remove the Stage 5 execution obligation.
