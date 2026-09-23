# Independent review - AlgoCore Paper 1 Stage 0

Work order: P1-S0-A9-01. Reviewer: /root/a9_independent_review. Date: 20/09/2026 (+07:00). **Recommendation: PASS for Stage 0 content candidate after A9-M01 retest.** No Critical/Major/Minor findings remain open. A0 records the final gate decision and final preservation check; this is not an acceptance of Stage 1, lessons or UI.

## Independence and reviewed versions

A9 authored none of the submitted A0/A1/A2/A3 content. Only `stage-0/evidence/a9/` was written during review. Read the team plan, playbook and Stage 0 work orders, all submitted A0 top-level documents, A1/A2/A3 evidence and issue logs, and board/resume/issues. No applicable AGENTS.md was returned by the workspace/parent search; A0's recorded ancestor-instruction check was also read.

Initial candidate: A0 v1.0.0 and workers v1.0, the 19 artifacts in `../a0/REVIEW_INPUT_MANIFEST.json`. Final reviewed candidate: the 19 artifacts in `../a0/RETEST_INPUT_MANIFEST.json` v1.0.1. Only scope wording/version changed; other content versions remain as recorded. Fresh hashes of every final artifact match that manifest in [RETEST_CHECKS.json](RETEST_CHECKS.json). Operational board/resume/gate are live records, not frozen content assertions.

## Criterion results

| Criterion | Result | Independent evidence and limits |
|---|---|---|
| S0-01 Configuration | PASS | Read COURSE_SETTINGS and user authorization: 9618, Paper 1, 2026, full VI/EN, AlgoCore theme, Stage 0 only. No 2027–2029 or Paper 4 requirement is imported. |
| S0-02 App baseline | PASS | Read actual `app/docs/page.tsx`, layouts, globals/theme CSS, README/package; compared A1 O01–O14 with code. Paper3 labels, vi locale, manual TOC, native closed details, centralized tokens and absent source/locale pipeline agree. Proposed extensions and runtime NOT_RUN are explicit. |
| S0-03 Source baseline | PASS | Independently opened all 62 primary PDFs and checked page counts/hashes; 60 covers passed component/year/session/Paper1 checks; 30 1QP+1MS pairs; independently enumerated relevant Past_Papers and four derived roots. All 78 derived hashes match. Official download bytes match both local and A3 copy. These checks certify inventory/identity, not question correctness. |
| S0-04 Source versions | PASS | Original syllabus PDF1/3/48 states 2026 v2/December2025; book PDF5/6 gives Watson/Williams, Hodder, first published2019 and ISBN9781510457591. No numbered edition is claimed. Official/local hash equality independently re-established. |
| S0-05 Scope/boundaries | PASS after retest | Read original syllabus PDF11/13/14–27; Paper1 sections1–8, assessment/AO/calculator claims and required/supporting boundaries agree. Read book TOC PDF7/8: chapter intervals and numbering differences are correctly treated as source windows. A9-M01 corrected DML two-table wording; see RETEST. |
| S0-06 Coverage plan | PASS | Read every one of 99 internal rows against original syllabus §1–8 plus notes/tables/continuations. All 17 sections and eight domains represented; no missing primary requirement found. Guidance expansion is explicitly required downstream. Every coverage row remains PLANNED with null lesson/assessment/QP-MS refs; counts are not called Cambridge objective counts. See section reconciliation below. |
| S0-07 Pilots | PASS | Original syllabus15/19/24 and book excerpts confirm core bitmap calculation, required sound concepts with arithmetic supporting, required F-E/RTN, validation+verification. Check digit discrepancy is real and resolved to syllabus authority; pilot3 does not falsely claim all transfer checks covered. Source caveats remain gated before authoring. |
| S0-08 Learning contract | PASS | Read integrated B01–B11 and incorporated A1 schema: objective/source relationships, official/adapted/original, MS-backed marking vs AlgoCore rubric, worked steps, guided/faded/independent practice, separate reveal, error repair, retrieval and next/prerequisite links. No unsupported one-sentence-per-mark rule. |
| S0-09 Full VI/EN | PASS | Contract requires full parallel teaching/tasks/hints/solutions/rubrics/feedback/alt/captions/controls/navigation, shared IDs/data/answers/version, glossary and semantic parity, translated wording labelled AlgoCore. These are mandatory future acceptance requirements, not a claim translations exist. |
| S0-10 Visual/UI requirements | PASS | Contract specifies static/interactive choice by objective, approved models, independent fixtures/results for stateful visuals, keyboard/focus, non-colour-only meaning, localized controls, reduced motion/static path, light/dark/narrow/zoom and real browser checks at integration. No Paper4 runner requirement introduced. |
| S0-11 Stage/preservation | PASS at review snapshot | Independently compared 15 app file hashes and full app path set excluding dependency/build folders with A0 baseline: no changes/additions/missing files. All 62 primary +78 derived source hashes match. Submitted artifacts are planning/evidence; no authored course lesson, question corpus or UI change is claimed. A0 must repeat final preservation check after live gate close. |
| S0-12 Handoff | PASS | README and linked board/resume/issues/decisions identify owner, allowed writes, independent review, source limitations, next Stage1/2 responsibilities and stop after Stage0. Open downstream source/visual/model/parity checks are carried to explicit owners/gates; no stale approved filename substitutes for acceptance. |
| S0-13 Independent review | PASS for review prerequisite | This report covers the Lead's settings, baseline, scope, contract, DoD, decisions and handoff as well as workers. One Minor precision finding was returned to A0 and independently retested on updated hashes. No unverified mandatory Stage0 criterion remains; A0 can record final gate from this evidence. |

## Source reading and reproducible checks

[verify_inputs.py](verify_inputs.py) writes only A9 evidence. [INDEPENDENT_CHECKS.json](INDEPENDENT_CHECKS.json) records primary parser/hash/cover checks, derived inventory/hash checks, app baseline/path checks, pair cardinality and coverage counts. All 62 primary PDFs opened with matching page counts and hashes; all 60 automated cover identities matched; all 78 derived hashes matched. Inventory differences and pairing errors are empty. Hashes do not imply semantic correctness or variant independence.

A9 independently fetched `https://www.cambridgeinternational.org/Images/697372-2026-syllabus.pdf` on this review run: 746673 bytes, SHA256 `bf1b77a2b765d10eb4b005ecae0412add35cf6113ba3218a517893abfc9f2470`, equal to local and A3 copies. The official URL was also opened through web for public identity. Book SHA256 is `0deb94b92267f83e4afe39c48b9c01f1419989ec56b4520903a7c5fe234b70b1`; this verifies the local copy used, not publisher byte authenticity.

Direct human text reading from fresh pypdf extraction: syllabus PDF1/3/11/13/14–27/39/41/42/48; book PDF5/6/7/8/32/33/36/133/186/187/188; QP s25/11 PDF2. Automated extraction of covers for all QP/MS is not recorded as manual reading. App inputs were read directly. No assertion is made that the rest of the book, entire QP/MS bodies or derived content was reviewed.

A9 rendered and visually inspected source pages with Poppler: syllabus PDF24; book PDF133/in117 and PDF186/in170; QP s25/11 PDF2/in2. Images remain in `renders/`. They confirm the two-column scope classification, actual book discrepancy, F-E sequence layout and the lost circuit geometry in text extraction. Book render repeated the dictionary-key warnings at offsets17606450/17606730 but both selected pages rendered legibly. This agrees with A2's limited risk statement; it neither proves all pages safe nor proves the whole PDF unusable.

No build/typecheck/browser/UI tests were run by A9; those are Stage4 requirements. The temporary first script syntax error and console encoding error were corrected before successful evidence generation; they did not mutate or validate source content.

## Coverage reconciliation against original syllabus

This is a Stage0 completeness review of required groups, not a lesson coverage certification. The count check is 99 unique internal IDs, 17 sections, eight domains. Semantic comparison was performed separately, using all notes/guidance and table continuations at the locators below.

| Sections / internal rows | Original syllabus locator | Items specifically checked |
|---|---|---|
| 1.1 / 7 | PDF/in14 | Prefix pairs, bases/BCD/complements, conversion, signed arithmetic, overflow, applications, character sets. |
| 1.2 / 7; 1.3 / 3 | PDF/in15 | Bitmap terms/calculation/impact, vector representation/choice, sound encoding/impact; compression need/method selection/media/RLE. |
| 2.1 / 15 | PDF/in16–17 | Both models/thin-thick, four topologies, cloud, media/LAN hardware/router/Ethernet/bit streaming, internet/WWW, full IP guidance and URL/DNS continuation. |
| 3.1 / 8; 3.2 / 5 | PDF/in17–18 | Listed devices, buffers, memory types, sensors/control/feedback; six gate types, two-input limit except NOT, three conversions among statement/circuit/table/expression. |
| 4.1 / 8 | PDF/in19 | Seven named registers, ALU/CU/clock/IAS, three buses, performance/ports, F-E and RTN, interrupt guidance. |
| 4.2 / 6; 4.3 / 3 | PDF/in20–22 | Two-pass apply/describe, trace, instruction groups/addressing, example instruction table; shift directions/types, device control, masking and operation table. Table details and single-ACC convention remain source constraints for Stage2/3 material. |
| 5.1 / 4; 5.2 / 4 | PDF/in23 | Management/utilities/libraries/DLL; translators and choice, partial compile/interpret, IDE coding/detection/presentation/debug features. |
| 6.1 / 6; 6.2 / 3 | PDF/in24 | Privacy/security/integrity and listed threats/measures, seven named validation checks including check digit, verification entry and byte/block parity/checksum transfer. |
| 7.1 / 5; 8.1 / 7 | PDF/in25 | Professional ethics, copyright/licences, AI applications/impacts; file limitations, relational terminology, E-R and normalization/design. |
| 8.2 / 2; 8.3 / 6 | PDF/in26–27 | DBMS features/tools, DDL/DML purpose, data types/keys/DDL subset, DML queries+maintenance including continuation before §9 and two-table restriction. |

All required rows have future teaching/assessment destinations specified as responsibilities, not invented IDs. The planned child checklist is necessary for grouped guidance, e.g. every device/register/instruction/type/SQL operation; no group is being declared delivered because its row exists.

## Academic decisions and controlled limitations

- Check digit: original syllabus PDF24 lists it under validation; original book PDF186–187 places it under entry verification. A0 D12 follows the correct scope authority and preserves provenance. Book-only type/consistency/uniqueness checks are not substituted for syllabus checks.
- Pilot1: PDF15 explicitly names bitmap size estimation while sound objectives cover encoding and rate/resolution impact. Labelling sound arithmetic supporting avoids claiming an explicit separate objective or banning sound applications. Sound concepts remain required in the whole course.
- F-E: book PDF133 diagram and RTN place PC increment differently, and the address-bus phrasing warrants model review. The contract retains required F-E and prevents unreconciled simulation/trace use. Stage0 does not need to invent a single official marking order.
- Numeric/checksum flags: book PDF32/33/188 contain the statements flagged by A3. They are quarantined from use as answer authority pending independent calculations/model checks. No Stage0 worked answer rests on those statements.
- Book mapping: TOC page7 and chapter9 start at page8 support chapter1–8 windows. The documents clearly limit this to mapping, not content audit of every mapped page. PDF and printed locators are separated.

The remaining production checks have owners and stop conditions. They do not weaken S0 criteria and are not silently certified by this PASS recommendation. Stage1 remains outside the user's current execution scope.
