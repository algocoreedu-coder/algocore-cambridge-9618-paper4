# A7 P4R-3 production marking and assessment review

Decision: **PASS**

The production package contains the exact P4R-3 complement:

- 42 `MarkingChain` envelopes for the 42 patterns outside the P4R-2 pilot;
- 1,830 production marking atoms and 2,236/2,236 atoms dispositioned globally when joined to the 406 pilot atoms;
- 60 `AssessmentItem` envelopes, three for each of the remaining 20 lessons;
- 6/6 production stable A0 practice IDs preserved (linked-list and dictionary);
- 82 KnowledgeUnits and 20 executable `production-v1` PythonArtifacts resolved by the checker.

## Authority controls

Every marking atom keeps its direct QP and MS locator, source bullet ID, disposition, award semantics, group/dependency information and source-issue caveat. Criteria are context-bound editorial paraphrases. They are not a replacement mark scheme and the atoms must not be summed into a new mark total.

All practice rubrics are AlgoCore-authored and have `official_marks: null`. For `testing`, `dictionary`, `performance`, `graphs`, `random-files` and `exceptions`, the approved kickoff pattern associations are labelled `AlgoCore_representational_workflow_only`. They describe execution or evidence flow only and transfer no Cambridge marks or domain claims.

Each assessment has bilingual prompt, expected artifact, hint and feedback; a hidden-answer disclosure contract; stable destination/requirement identity; and the exact `production-v1` artifact plus all normal, boundary and failure fixture/output references. Guided prompts focus on normal tracing, faded prompts focus on boundary repair, and independent prompts require all three cases.

## Verification

- Node 20.11.0: `PASS`, 0 schema-envelope errors, 0 checker errors.
- Node 24.19.0: `PASS`, 0 schema-envelope errors, 0 checker errors.
- Deterministic rebuild: PASS; all three canonical output hashes remained unchanged.
- Global atom partition: 406 pilot + 1,830 production = 2,236 unique promoted atom dispositions.
- Visual contract: 14/14 owner bundles, 42/42 official patterns, 126/126 scenarios, 351/351 events, 0 unresolved official joins and 0 false trace-ownership items.

Evidence files:

- `CHECK_RESULT.json`
- `CHECK_NODE20.json` and `CHECK_NODE20.log`
- `CHECK_NODE24.json` and `CHECK_NODE24.log`
- `A7_DETERMINISM.json`

## Visual join closure

`P4R3-A7-VISUAL-JOIN` is closed against A5's approved ownership contract: 14 official pattern-owner lesson bundles, 42/42 official patterns, 126 normal/boundary/failure scenarios and 351 events. Every production MarkingChain resolves to the correct lesson PythonArtifact and exact three-case trace set.

The six provisional lessons (`testing`, `dictionary`, `performance`, `graphs`, `random-files`, `exceptions`) correctly own no official visual trace. Their 18 assessments retain only `AlgoCore_representational_workflow_only` associations, AlgoCore-authored rubrics and `official_marks: null`; no Cambridge or trace ownership is transferred. Final carryovers: none.
