# A1 P4R-2 independent source review

**Status: PASS**  
**Recommendation: PASS_TO_LEAD_GATE**  
**Required findings: 0**

## Scope and method

This review independently compared the completed six-lesson pilot against the locked Stage 3 authority sources, the promoted P4R-1 maps, all 26 canonical `KnowledgeUnit` records, all six `LessonReleaseRecord` records, and the A8 final QA result at commit `314af8acf1b508779a14dd5dd2627f4fcb8c24df`.

The comparison used exact stable IDs and structured locator fields. For syllabus locators, the public record is expected to preserve `source_id`, PDF page, printed page, heading, bullet locator, and anchor text. The upstream-only `verification` note is audit metadata and is intentionally not copied into the public locator contract.

## Results

| Check | Result |
| --- | --- |
| Stage 3 knowledge ID set | PASS — 26/26, no missing or extra IDs |
| One-to-one `stage3_block_ids` identity | PASS — 26/26 |
| Stage 3 lesson-package membership | PASS — 26/26 |
| Objective sets | PASS — 26/26 units |
| Syllabus locators | PASS — 39/39 references |
| Coursebook section sets | PASS — 26/26 units |
| Coursebook chapter and printed/PDF pages | PASS — 50/50 references |
| Release-record unit membership | PASS — 6/6 lessons |
| Release coursebook source refs | PASS — 30/30 |
| Release syllabus source refs | PASS — 28/28 |
| AlgoCore micro-example authority | PASS — 26/26 |
| AlgoCore self-check authority | PASS — 26/26 |
| Unsupported Cambridge claims | PASS — zero found |

Lesson totals are internally consistent: binary-search 3 units, data-models 6, hashing 4, object-files 3, queue 5, and recursion 5.

## Authority decision

The source boundaries are correctly preserved:

- The 2026 Cambridge syllabus controls scope. Every released syllabus reference uses `Cambridge_syllabus` with `public-citation` access and matches the reviewed Stage 3 locator.
- The Cambridge coursebook supplies the stated knowledge foundation. Every released coursebook reference uses `Cambridge_coursebook` with `licensed-internal` access and matches Stage 3 section and page evidence.
- Coursebook evidence does not claim to certify Python execution, exam marks, or complete syllabus coverage.
- QP/MS authority remains attached to specific exam tasks. The pilot does not manufacture an official mark, mark-scheme statement, examiner report, or Cambridge endorsement.
- All teaching micro-examples and self-checks identify AlgoCore as the authoring authority.

A8 independently reported source/coursebook locators passing for 26/26 knowledge units and 6/6 release records. Its target commit matches this A1 review target.

## Gate recommendation

There is no source-authority blocker for P4R-2. A1 recommends passage to the Lead gate. Lead remains the only role permitted to change the six pending `lead_gate` values.

This result covers source fidelity and authority separation for the six-lesson pilot. Browser, responsive, accessibility and release verification remain in their later governed stages.
