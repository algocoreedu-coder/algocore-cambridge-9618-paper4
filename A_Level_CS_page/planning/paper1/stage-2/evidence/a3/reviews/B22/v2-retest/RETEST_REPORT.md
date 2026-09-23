# P1-S2-A3-RETEST-B22-v2 — independent closure retest

Reviewer: A3 independent specialist  
Retest date: 22/09/2026  
Target: frozen `A4/B22/v2` correction packet  
Decision: **PASS**

## Integrity and reconciliation

The issued retest manifest matched the A0 dispatch SHA256 `7d963e551789b432479fe266f94d3fdbc9e11ca84abf5503352f7a6489661954`. All eight issued inputs, all ten author outputs, and all seven correction inputs plus the correction dispatch manifest matched their declared bytes and SHA256 values.

Independent reconciliation confirmed the exact B22 subset: 188 unique atomic targets, 78 unique non-scoring containers, 188 scoring marking rows, 32 unresolved context-only records, 450 marks, and six paper totals of 75. All requirement and primary-pattern references resolve; all 188 pattern occurrences map back to exactly one atomic unit; no unresolved record is promoted. The A0 C2 validator independently returned `PASS` for B22-v2.

## Finding closure

All three original findings are closed:

- `S2-B22-A3-001`: Winter 2022 component 12 Q7(b)(iii) now maps `LSL #3` to `REQ-4.3-03-03`; Q7(b)(iv) maps `OR 51` to `REQ-4.3-03-01`. Rebuilt patterns `PC-B22-V2-091` and `PC-B22-V2-090` contain the correct examples and requirement families.
- `S2-B22-A3-002`: Summer 2022 component 13 Q1(a)(iii) now maps lossless/RLE text compression to `REQ-1.3-03-01`; Q1(a)(iv) maps lossy/lossless suitability to `REQ-1.3-02-01` with `REQ-1.3-02-02` as supported context. The character-set mapping has been removed and affected patterns rebuilt.
- `S2-B22-A3-003`: all 188 rows carry a recorded dependency audit. Every nested target contains its question root and immediate parent where applicable; all 275 context references and 91 visual references resolve to the accepted question index, declared Stage 1 context refs, or visual manifest. The four named cases now contain their required parent/prior-part/schema/diagram links. Q1(b)(ii) starts with `Calculate`, records that leading command, and includes its dependency on Q1(b)(i).

The cited QP/MS sources were independently reread. Direct source checks agree with the corrected operation families, compression requirements, bitmap dimensions and prior-answer dependency, LAN diagram dependency, and STUDENT_TEST schema dependency. No new Critical or Major finding was found.

## Result

Retest `PASS`: 3 original findings closed; 0 open; 0 new Critical/Major/Minor findings. This specialist result does not accept the batch. A different-A4 review and A9 review remain required before A0 can make the batch decision.
