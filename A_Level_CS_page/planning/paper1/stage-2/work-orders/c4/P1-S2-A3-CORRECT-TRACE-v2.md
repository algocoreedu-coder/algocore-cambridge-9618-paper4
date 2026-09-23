# P1-S2-A3-CORRECT-TRACE-v2 — Protected requirement-role correction

Issued 23/09/2026 by A0 to the TRACE author. Reviewers after handoff: fresh independent A4 and fresh A9; A0 remains gate authority.

## Inputs/version

- Exact manifest: `A_Level_CS_page/planning/paper1/stage-2/work-orders/c4/P1-S2-A3-CORRECT-TRACE-v2_INPUT_MANIFEST.json`; SHA256 `4450415533a0a0173a31916d13f85a571a845411431de9fa09ecf41f1063655c`; 155 files.
- Gate authority: `C4B_GATE_DECISION_V1.json` SHA256 `bf07128639c6997466940af16af160a74b82259593ff1b87317cbbed368406b6`.
- Rehash all inputs. Any drift is a blocker. Preserve trace-v1 and review history unchanged.

## Write allowlist and outputs

Write only `A_Level_CS_page/planning/paper1/stage-2/evidence/a3/trace-v2/`. Freeze exactly the same ten output names as v1: `COVERAGE_MATRIX.jsonl`, `OBJECTIVE_ASSESSMENT_MATRIX.jsonl`, `LEARNING_MAP.json`, `GAP_REGISTER.json`, `ORIGINAL_ASSESSMENT_BRIEFS.jsonl`, `SOURCE_FLAGS_REGISTER.md`, `QA.json`, byte-identical `INPUT_MANIFEST.json`, `OUTPUT_MANIFEST.json`, `HANDOFF.json`. Do not spawn another agent or edit trackers/upstream artifacts.

## Required correction

- For every one of 893 units, use only accepted `QUESTION_BANK_INDEX.primary_requirement_ids` and `supporting_requirement_ids` as requirement-role authority. Preserve each list exactly and keep roles disjoint.
- Remove all 18 unauthorized PRIMARY associations on ten units and remove the duplicate PRIMARY role for `AU-9618_w25_qp_11-q6-pc` → `REQ-3.1-06-02`, retaining that association only as accepted SUPPORTING. No accepted role may be removed or added.
- `accepted_candidate_primary_requirement_ids` is pattern-partition metadata only. It may never create coverage authority or change primary/supporting roles.
- Recompute all derived coverage rows, objective summaries, learning-unit assessment links, pattern/component/glossary joins, gap flags, original brief reconciliation, counts, QA, manifests and handoff from corrected roles. Do not copy v1 derived counts without recomputation.
- Preserve 99 objectives, 205 required requirements, 99 learning units, 893 units, 504 patterns, 824 components, 96 glossary terms, split 701/192, 62 HARD edges and 128 context-only records unless exact accepted inputs prove otherwise.
- Keep the sole accepted source limitation `AU-9618_s23_qp_12-q5-pd-pii` explicit and unmapped; do not invent a requirement link.
- Re-evaluate all assessment gaps and briefs after removing drift. A9's independent simulation indicated headline 12 no-official + 3 controlled-only and 15 briefs remain, but the regenerated evidence is authoritative and any difference must be explained, not forced.
- Add an explicit QA check that compares primary and supporting sets for all 893 units byte/role-semantically against accepted question-bank fields, reports zero added/removed/overlapping roles and pins association totals.
- Preserve source boundaries, controlled-check isolation, context-only rule and no-full-question/answer/solution rule.

## Acceptance and stop

All v1 controls plus the upgraded A0 protected-role validator must PASS. After exact ten-file handoff, stop. Do not accept C4b, edit trackers, integrate top-level artifacts, or start lessons, translation, app work or Stage 3. Fresh A4 and A9 full retests are mandatory.
