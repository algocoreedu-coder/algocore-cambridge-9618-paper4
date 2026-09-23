# A8 final aggregate QA — Stage 4

Status: **PASS_RECOMMENDED**.

A8 recommends retaining the closed Stage 4 PASS gate and refreshing its gate/release records with the final `A8_FINAL_QA.json` hash. No required finding remains open on the recorded canonical hashes. This review certifies the design and traceability layer. Python execution, runtime output, event traces, learner-facing lessons and completed storyboards remain downstream work.

## Verified corpus and product set

| Area | Independently verified result |
|---|---:|
| Pattern cards / method steps | 58 / 272 |
| Variants / error rows | 60 / 154 |
| Solution designs / worked examples / visuals | 58 / 58 / 58 |
| Papers / questions / parts | 29 / 87 / 672 |
| Official marks / marking atoms | 2,175 / 2,236 |
| Assessment requirements / designs | 107 / 37 |
| Objective obligations | 65 authored capability + 42 transfer |
| Book gaps | 19 |
| Cross-batch duplicate resolutions | 182, including 8 reviewed semantic overrides |
| Source caveats | 25 IDs / 62 occurrences / 61 affected parts |
| Stage 2 confusable contrasts | 20/20 |

The 2,236 marking atoms are evidence units, not a second mark total. Alternative, group-max, dependent and holistic award semantics remain intact, including the Lead-adjudicated W21 and W22 ceilings.

## Semantic review result

Every one of the 58 cards, 154 error rows, 58 solution briefs, 58 worked-example specs, 37 assessment designs and 58 visual briefs was included in semantic checks. The review also covered all 182 duplicate ownership decisions.

- The 58-card set and all 790 assessed part-pattern relations match Stage 2 exactly.
- All 20 confusable contrasts are present in both the card and variant layers. The previously missing set/update, circular/linear queue and free-list/object-list contrasts are now explicit.
- All 2,236 atoms have one owner and one card method. The eight atom-level owner corrections are present; the other 174 duplicate resolutions remain stable.
- VI/EN meaning is complete across the reviewed artifacts. B1/B2/B5 error consequence, detection and repair text now names the actual error, method checkpoint and boundary case in both languages.
- The 58 visual briefs retain event-driven normal, boundary and failure cases; their case triples are distinct by pattern.
- Assessment QA passes all 37 designs and all 107 requirements. The 14 concept/model destinations now use topic-valid evidence criteria, and dictionary/OOP misconception sets match their actual subtopics.
- All 25 source caveats remain traceable. There is no unresolved source decision and no fake per-part use of the layout/code-fidelity policy.

## Scope and authority checks

Graph coding, low-level programming and declarative programming stay outside the core Stage 4 scope. Official QP/MS locators and source mark values remain the assessment authority; method ownership and method-step links are labeled as AlgoCore coordination guidance.

Lead pass 2 promoted all canonical document headers, 58 card rows and 154 error rows to `DESIGN_REVIEWED`. Row-level downstream boundaries remain unchanged: solutions and examples await Stage 5 execution verification, assessments are designed but unauthored, and visuals await Stage 5 traces plus Stage 7 storyboards. No artifact claims that code ran, output was verified, a lesson was authored or a storyboard was completed.

## Closed findings

- `A8-FINAL-BILINGUAL-001`: closed after pattern-specific VI/EN rewrites.
- `A8-FINAL-CONTRAST-002`: closed at 20/20 Stage 2 contrasts.
- `A8-FINAL-LEAD-003`: closed after all affected batch and Lead PASS1 hashes were refreshed.
- `A8-FINAL-ERROR-004`: closed after 62 generic error-prevention rows were rewritten in English as well as Vietnamese.
- `A8-FINAL-OWNERSHIP-005`: closed after eight atom-level owner overrides.
- `A8-FINAL-AUTHORITY-006`: closed after correcting the marking-map authority boundary.
- `A8-FINAL-ASSESSMENT-007`: closed after topic-level rework and a 30/30 assessment/gap recheck.

## Validator evidence

The release-closed aggregate validator passes **53/53** checks. This includes requiring `LEAD_PASS2.status = PASS`, exact matching against its final hashes, current coverage-audit hashes and all final status boundaries. The supporting ownership validator passes **17/17**, assessment/gap QA passes **30/30**, source QA passes **18/18**, and pilot QA passes **71/71**.

Run the aggregate check with:

```powershell
python A_Level_CS_page/planning/paper4/stage-4/evidence/qa/final/validate_stage4_final.py
```

The Stage 4 Lead remains the acceptance authority. Lead pass 2 is closed as `PASS`; the remaining bookkeeping action is to refresh `GATE_REVIEW` and `RELEASE_MANIFEST` with this final A8 report hash.
