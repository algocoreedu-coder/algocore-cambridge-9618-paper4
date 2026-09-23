# P4R-6 A7 independent pedagogy and exam review

**Decision: `REWORK_REQUIRED`**  
**Candidate:** `ff05d5a0198c086d827f0b39778433b8858b822f`  
**Required findings open:** 2

The canonical v2 candidate fixes the Stage 9 Python/theory failure. All 26 lesson DTOs and all 52 rendered VI/EN routes now carry the complete ten-section learning flow, 108 structured knowledge units, one verified full Python artifact per lesson, normal/boundary/failure fixtures, official trace or approved representational support, marking/error guidance, three progressive practice levels, retrieval and safe source citations. The candidate cannot pass A7 yet because the learner-facing disclosure behavior contradicts its own assessment contract and the v2 retrieval model drops the diagnosis–repair–self-assessment loop previously required to close Stage 9.

## Exact scope and passing results

| Check | Result |
|---|---:|
| Packages / lessons / rendered locale routes | 13 / 26 / 52 |
| Canonical sections | 10/10 on 26/26 lessons and 52/52 rendered routes |
| Structured KnowledgeUnits | 108/108 |
| Python artifacts / rendered full-source routes | 26/26 / 52/52 |
| Python source lines checked | 1,144 |
| Normal/boundary/failure fixture sets | 26/26; 78 fixtures and 78 expected outputs |
| Official visual patterns | 58/58, each with normal/boundary/failure trace support |
| MarkingChain | 58/58 |
| Canonical marking-atom dispositions | 2,236/2,236: 1,916 direct official atoms + 320 source-caveated atoms |
| Assessment requirement / destination dispositions | 107/107 / 37/37 |
| Progressive practice | 26 guided + 26 faded + 26 independent = 78/78 |
| Retrieval self-checks | 108/108 present with prompt, hidden answer and rationale |
| Hidden initial disclosures | 78/78 practice hints and 108/108 retrieval answers; 52/52 routes render disclosures closed |
| Source safety | 0 unsafe public DTO locators; 0 local/repository/file hrefs on 52 routes |

The six association-only lessons are exactly `dictionary`, `exceptions`, `graphs`, `performance`, `random-files` and `testing`. They own zero official patterns, zero Cambridge MarkingChains and zero numeric official marks. Their 18 assessments keep `AlgoCore_authored_rubric`, `official_marks: null` and `AlgoCore_representational_workflow_only`. The remaining 20 lessons own the exact 58 official patterns and 58 source-linked MarkingChains.

Normal/boundary/failure reasoning is present at all required layers. Every lesson has the three Python fixtures and expected outputs. Every official pattern has three scenario-specific traces. Guided items join the normal fixture, faded items join the boundary fixture, and independent items join all three cases.

## Required findings

### P4R6-A7-F001 — Practice feedback is not gated by an attempt

All 78 assessment records declare `feedback_after_attempt: true`. The current `Practice` renderer exposes feedback as an always-enabled native `<details>` and has no attempted/submitted state. It is closed initially, but a learner can reveal it immediately, before doing any work.

**Required correction:** add an explicit attempt/submission state per practice item. Keep feedback and repair disabled or absent until that state is reached. Add a browser check that feedback cannot open before an attempt and can open afterwards.

### P4R6-A7-F002 — Retrieval regresses the Stage 9 diagnosis–repair loop

All 108 v2 retrieval items provide a question, hidden answer and rationale. None provides a learner response or trace, misconception diagnosis, repair action, retry rule or self-rubric. This reopens the retrieval part of `S9D-RC-F002`; progressive practice itself is complete.

**Required correction:** extend the canonical retrieval contract and renderer with a concrete recall/trace response, diagnosis, repair/retry guidance and an AlgoCore self-rubric. Preserve hidden-answer behavior, rebuild all 26 DTOs and recheck 108/108 items.

## Stage 9 finding recheck

| Earlier finding | Current result | Evidence |
|---|---|---|
| `PTA-001` code semantics lost | CLOSED | 26/26 typed `PythonArtifact` records render as semantic pre/code line rows. |
| `PTA-002` execution evidence stranded | CLOSED | 26/26 lessons show author run, independent rerun and execution-log hash with canonical fixtures. |
| `PTA-003` theory flattened | CLOSED | 108/108 KnowledgeUnits are published with syllabus and coursebook locators. |
| `PTA-004` five prose-embedded code lessons | CLOSED | queue, linked-list, recursion, dictionary and hashing all use typed full Python artifacts. |
| `PTA-005` count-only QA | CLOSED BY V2 SCOPE | This review deep-checks 26/26 DTOs and 52/52 rendered routes. |
| `S9D-RC-F001` incomplete worked chain | CLOSED | Page flow joins theory, method, micro-example, full Python, outputs/tests, evidence and trace/static support. |
| `S9D-RC-F002` practice/retrieval loop | **REOPENED IN PART** | Three-level practice is complete; feedback gating and retrieval repair/self-assessment remain open. |
| `S9D-RC-F003` marking authority | CLOSED | 58 chains and 2,236 atom dispositions resolve; gap lessons have explicit AlgoCore-only authority. |
| `S9D-RC-F004` English nested UI keys | CLOSED | Typed sections use explicit VI/EN labels instead of arbitrary key humanisation. |
| `S9D-RC-F005` half-scope verifier | CLOSED | Current detached audit covers all 26 lessons and both locales. |

The reproducible exact-set, canonical join, renderer-source and 52-route checks are in `check-a7-pedagogy.mjs`. Full machine-readable results, the per-lesson matrix and the 52-route matrix are in `A7_PEDAGOGY_REVIEW.json`. The review did not modify production code, content, status, gates or release records.
