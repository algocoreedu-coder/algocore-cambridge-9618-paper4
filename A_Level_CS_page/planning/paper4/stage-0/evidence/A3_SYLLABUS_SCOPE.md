# A3 — Paper 4 syllabus scope, 2026

Status: submitted to Lead for Stage 0 review. This document is a scope inventory, not a past-paper classification or a completed coursebook map.

## 1. Decisions supplied by the user

- Examination year: **2026**.
- Programming language: **Python, console mode** (latest user decision relayed by Lead).
- Every learning page: **two complete versions, Vietnamese and English**. This does not mean two different curricula or translating required program identifiers.
- June/November session: unspecified; no blocker for a year-wide syllabus scope. Session-specific mock papers or timetables require a later decision.

## 2. Source register and verification

Primary local input: `tmp/9618_2026_syllabus.txt`, labelled Version 2; its `===== PAGE n =====` markers match the printed syllabus page numbers cited below. Detailed inventory below is a transformation of this supplied local text.

Official links checked on 19 September 2026:

- [Cambridge 9618 official syllabus page](https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-international-as-and-a-level-computer-science-9618/) lists the 2026 syllabus and a separate update.
- [Official 2026 syllabus PDF](https://www.cambridgeinternational.org/Images/697372-2026-syllabus.pdf): the browsing parser failed; search indexing showed an older Version 1 cover. Do not treat that cached version as authoritative over the update.
- [Official 2026 syllabus update](https://www.cambridgeinternational.org/Images/747145-2026-syllabus-update.pdf), p.1: confirms Version 2, December 2025, and the restriction concerning binary source files. Its changes agree with local syllabus p.48.

The web evidence above verifies provenance and version; the detailed educational inventory uses the supplied local syllabus. A byte-for-byte match between a freshly downloaded official PDF and the local extraction has not been established by A3.

## 3. Assessment boundary

| Item | Locked interpretation | Local source |
|---|---|---|
| Component | Paper 4 Practical; all questions, computer-based | pp.11, 40 |
| Time and marks | 2 hours 30 minutes; 75 marks; 25% of full A Level | p.11 |
| Content | Practical application of sections 19–20, excluding low-level and declarative programming | pp.11, 40 |
| Assessment objective | AO3 accounts for 100% of P4: design, program and evaluate solutions with reasoned judgement | p.13 |
| Allowed languages | Python, Java or Visual Basic in console mode; this course implements Python only | pp.11, 39 |
| Visual Basic footnote | .NET versions, excluding VB6 and earlier; informational, not a course implementation target | p.11 |
| Environment | Computer without internet/email; calculators prohibited | pp.11, 40 |
| Work submitted | Complete code plus testing evidence; follow the requested program listings/screenshots in the supplied evidence document | pp.11, 40 |
| Evidence identity | Save evidence document with centre number, candidate name and candidate number | p.40 |
| Saving | Save regularly. Missing evidence in the evidence document means that work receives no marks | p.40 |
| Supplied files | The source files provided will not include binary files | pp.40, 48 |

Course implication (AlgoCore design decision): every exam practice needs a visible evidence checklist matched to the question, and a rehearsal of saving code, running the requested tests and capturing evidence. Do not invent a universal file-name pattern, screenshot count, or marking checklist before reading the actual question and mark scheme.

## 4. Inventory of sections 19–20

Codes below are local planning identifiers, not Cambridge objective numbers. **Core practical** means a programming capability to cover; **supporting understanding** means a concept used to understand, trace, choose or evaluate code. A supporting concept can matter to a practical question, but is not automatically a separate theory essay or guaranteed past-paper task.

| ID | Syllabus content | Classification and course deliverable | Source |
|---|---|---|---|
| P4-19-SEARCH | Linear and binary search | Core practical: implement, test and trace both. Supporting: sorted-input condition and binary-search performance as data size changes | 19.1, p.37 |
| P4-19-SORT | Insertion sort and bubble sort | Core practical: implement and test both. Supporting: effects of initial order and input size | 19.1, p.37 |
| P4-19-STACK | Stack insertion/deletion | Core practical: representation plus operations, with explicit pointer convention and boundary behaviour | 19.1, p.37 |
| P4-19-QUEUE | Queue insertion/deletion | Core practical: representation plus operations. Particular variants and frequency are for later corpus analysis | 19.1, p.37 |
| P4-19-LINKED | Linked-list search/insertion/deletion | Core practical: find, insert, delete and verify links. Allocation conventions must follow the specific task | 19.1, p.37 |
| P4-19-TREE | Binary-tree search/insertion | Core practical: find and insert; do not claim binary-tree deletion is explicitly required by this list | 19.1, p.37 |
| P4-19-ADT | ADTs implemented through built-in types or other ADTs | Core practical: stack, queue, linked list, dictionary and binary tree. Explain representation choices; Python convenience methods do not replace a requested manual algorithm | 19.1, p.37 |
| P4-19-GRAPH | Graph as ADT; features and suitable uses | Supporting understanding only for this practical course. Syllabus explicitly says graph-structure code is not required | 19.1, p.37 |
| P4-19-COMPLEXITY | Compare time/memory including Big O | Supporting understanding for analysing practical choices. No invented mandatory essay, formal proof or claim of measured past-paper frequency | 19.1, p.37 |
| P4-19-RECURSION | Recursive algorithms, tracing, uses, essential features | Core practical: implement and trace termination and recursive progress; supporting: when recursion helps | 19.2, p.37 |
| P4-19-CALLSTACK | Compiler support for recursion, stack/unwinding | Supporting understanding: call frames, pending work and return values. No compiler implementation requirement | 19.2, p.37 |
| P4-20-PROCEDURAL | Imperative/procedural code | Core practical: variables, control structures, procedures and functions; AS structural programming is assumed | 20.1, p.38 |
| P4-20-OOP | Classes and object-oriented programming | Core practical: design classes and write OOP code. Coverage includes objects, attributes, methods, classes, inheritance, polymorphism, aggregation, encapsulation, getters, setters and instances | 20.1, p.38 |
| P4-20-FILES | Read/write/append, close, records, serial/sequential/random files | Core practical: implement file-processing operations. Supplied binary files are excluded; random-file processing is not removed from the syllabus | 20.2, p.38; p.40 |
| P4-20-EXCEPTIONS | Meaning, purpose and appropriate exception handling | Core practical: handle appropriate exceptions in code; distinguish exception handling from ordinary validation logic in teaching examples | 20.2, p.38 |
| P4-20-EXCLUDED | Low-level and declarative programming | Explicitly excluded from P4; do not produce required assembly/addressing-mode or declarative facts/rules lessons for this course | pp.11, 38, 40 |

Coverage acceptance means every core capability has a teaching/testing destination, and every supporting item has an explanation or a justified link. It does **not** mean every row must become one separate learning page. Page boundaries follow later skill dependencies and question analysis.

## 5. Prerequisites and related material

### Required bridges, not a second complete AS course

Use focused checks and remedial links for:

- Decomposition, algorithms, refinement and translating a specification into steps: sections 9.1–9.2, pp.27–28.
- Data types, records, 1D/2D arrays and indices, text files, stack/queue/list concepts: sections 10.1–10.4, pp.28–29.
- Variables, expressions, console I/O, strings, selection, loops, procedures/functions and parameters: sections 11.1–11.3, pp.29–30. Section 20.1 explicitly points to AS structural programming.
- Locating syntax/logic/runtime faults, dry runs, test data and program amendments: relevant parts of 12.3, p.31. Evidence routines also come directly from P4 assessment p.40.

These are practical teaching dependencies, not a claim that all sections 9–12 are independent P4 assessed content. Do not automatically add full life-cycle, maintenance or software-testing-theory units.

### Boundary with Paper 3

Paper 3 covers 13–20; Paper 4 does not inherit all of 13–18. Hardware, networks, systems software, security, floating-point representation and AI are not separate core P4 modules simply because they appear in the A Level syllabus.

- File organisation and hashing appear in 13.2, p.32. Link the concepts when needed to understand 20.2 file processing; do not label hash tables/collision-resolution algorithms as an explicit separate 19.1 requirement. Any corpus-derived task is added only after direct question evidence and scope review.
- Random file access remains named in 20.2. The absence of supplied binary files is not an instruction to delete all random-access teaching or to assume every file is a simple text-line exercise.
- Dictionary ADT appears explicitly in 19.1. That fact alone does not require a full implementation of Python's internal hash table.
- Advanced tree balancing, graph traversal code, web development, GUI programming, database applications, machine learning, external packages, decorators and asynchronous programming are supplemental unless a concrete syllabus-aligned learning need is approved. They must not inflate required coverage.

## 6. Coursebook linkage rule

No chapter/page map is certified by this audit: A3 has not read the coursebooks. Stage 0 may register candidate books; Stage 3 must verify edition, chapter, section and printed/PDF page for each skill. A syllabus section number is not a coursebook chapter number. Endorsed books suitable for the syllabus do not automatically cover every required practical task in sufficient depth.

## 7. Bilingual and visual teaching implications

These are authoring decisions derived from the user's request, not Cambridge exam regulations:

- One skill ID, objective set, runnable Python solution, test dataset and event sequence shared by the VI/EN versions. Translate explanations, hints and feedback while retaining required identifiers, paths and expected outputs.
- Use events for comparisons/moves in search and sorting; pointer/data changes in ADTs; call/return in recursion; object state and dispatch in OOP; read/write/exception branches in file processing.
- A visual explains a specific program under explicit conventions. It cannot substitute for executable code or examination evidence.
- Quiz, trace, prediction and error-correction exercises should bridge from understanding to independent Python practice; marking advice remains provisional until a question's mark scheme is linked.

## 8. Open items and Lead review checks

- [ ] Lead confirms Python decision and full VI/EN output in the main Stage 0 scope contract.
- [ ] Independent QA checks the inventory against local pp.37–40; especially graph, tree deletion, dictionary, hashing and random-file boundaries.
- [ ] Source owner records the official PDF/version provenance in the common source register; A3 reports web-parser failure rather than claiming full web-PDF verification.
- [ ] Python runtime/IDE compatibility and offline practice environment are chosen by the implementation owner later; the syllabus alone does not provide an exact Python version here.
- [ ] No prediction of task frequency, marks per topic or guaranteed exam appearances is accepted before corpus analysis.

A3 self-review: scope, exclusions, assessment, evidence, prerequisites and uncertainties are recorded. Final Stage 0 PASS belongs to Lead after independent review; A3 does not authorise the next stage.
