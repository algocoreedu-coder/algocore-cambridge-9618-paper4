# Work orders — Paper 1 Stage 2

Version 1.1. Date 22/09/2026. Đây là packet kế hoạch sau A9 findings; tất cả work order ở trạng thái `PLANNED_NOT_DISPATCHED`.

Mọi work order khi phát hành phải có input manifest với path/bytes/SHA256 hiện hành, artifact version, read scope, write allowlist, outputs, acceptance, reviewer và stop condition. Input manifest luôn pin Stage 2 schema/work-order version và mọi upstream handoff trực tiếp. Worker không spawn agent, không sửa Stage 0/1, không ghi top-level Stage 2 và dừng sau handoff.

### Reusable independent review contract — P1-S2-RVW-<ARTIFACT>-<VERSION>

- **Inputs/version:** frozen author handoff, output manifest, exact artifact hashes, applicable schema, source authority and prior findings.
- **Reviewer:** named role/agent who did not author the reviewed artifact or its correction.
- **Write:** `stage-2/evidence/<reviewer>/reviews/<artifact-id>/<review-version>/` only.
- **Outputs:** `REVIEW_REPORT.md`, `FINDINGS.json`, `INPUT_MANIFEST.json`, `OUTPUT_MANIFEST.json`, `HANDOFF.json`.
- **Acceptance:** rehash every declared input/output; execute artifact-specific DoD; findings include severity, locator, evidence, owner and required fix/retest; self-report is not evidence.
- **Stop:** freeze handoff and stop; reviewer never edits author artifact or closes gate.

Required instances: A4 review A3 foundation; A3 review A4 calibration; A3+A4 reviews A6 glossary v1/v2; A3 and separate A4 reviews each BYY; A3 review provisional/final patterns; A9 review equivalence/complement audit; A4 review traceability. A0 audits every review handoff before accepting the specialist gate.

## P1-S2-A0-00 — Input freeze và protocol

- **Owner:** A0.
- **Inputs/version:** all authority paths, bytes and hashes in playbook v1.1, including corpus schema, extraction policy, final integrity, A9 report/machine/handoff, A0 audit and Stage 1 gate.
- **Write:** `stage-2/` top-level và `stage-2/evidence/a0/bootstrap/`.
- **Outputs:** `INPUT_BASELINE.json`, protocol/schema freeze, validator skeleton, board/resume/issues, exact batch work orders.
- **Acceptance:** rehash không mismatch; validator tái tạo 99 parents, 893 atomic, 379 containers, 927 marking rows, 2.250 marks và 128 unresolved; Stage 0/1 unchanged.
- **Reviewer:** A9 trong calibration/final review.
- **Stop:** freeze packet; chưa classify, chưa chọn holdout.

## P1-S2-A3-01 — Objective, book và prerequisite foundation

- **Owner:** A3 foundation author.
- **Inputs/version:** A0 C0 freeze v1; syllabus PDF; 99-row Stage 0 coverage; coursebook; learning contract, all exact hashes.
- **Write:** `stage-2/evidence/a3/foundation-v1/` only.
- **Outputs:** `SYLLABUS_OBJECTIVES.jsonl`, `OBJECTIVE_REQUIREMENTS.jsonl`, `COURSEBOOK_MAP.jsonl`, `PREREQUISITE_GRAPH.jsonl`, `LEARNING_UNIT_PROPOSAL.jsonl`, `SOURCE_FLAGS.md`, manifests/handoff.
- **Acceptance:** 99 parents exactly; atomic guidance complete without double count; all §1–8 and §8.3 continuation; book locator reflects pages actually read; four Stage 0 academic flags resolved or explicitly carried; HARD graph acyclic; no Paper3/4 or 2027–2029 scope.
- **Reviewer:** A4 not author; A9 calibration review.
- **Stop:** handoff and freeze; no lesson prose.

## P1-S2-A4-00 — Taxonomy calibration

- **Owner:** A4 calibration author.
- **Inputs/version:** A0 C0 schema v1 plus a frozen stratified-sample manifest covering text, calculation, table, visual, trace, diagram, SQL and pilots P1–P3.
- **Write:** `stage-2/evidence/a4/calibration-v1/` only.
- **Outputs:** taxonomy proposal, marking-evidence rules, calibrated sample rows, boundaries/counterexamples, QA/handoff.
- **Acceptance:** source/analyst fields separated; container/atomic rules pass; null command words inspected from source; frequency is descriptive only; no unresolved promotion.
- **Reviewer:** A3 scope reviewer and fresh A9.
- **Stop:** calibration handoff; full batch mapping remains closed until review PASS.

## P1-S2-A6-01 — Glossary và command-word seed

- **Owner:** A6 terminology editor.
- **Inputs/version:** A0 C0 freeze v1, syllabus/command-word authority only. Objective/pattern refs are deliberately unavailable in v1.
- **Write:** `stage-2/evidence/a6/glossary-v1/` only.
- **Outputs:** `GLOSSARY_SEED_V1.jsonl`, `COMMAND_WORD_REGISTER.jsonl`, conflicts/boundaries report, manifest/handoff; objective/pattern refs empty with `PENDING_RECONCILIATION`.
- **Acceptance:** canonical EN, VI candidate/status, aliases, boundary and source; bit/byte, accuracy/precision, validation/verification/check digit, database and command-word distinctions explicit; no lesson translation or parity claim.
- **Reviewer:** A3 for scope/terms, A4 for exam language, A9 final.
- **Stop:** handoff and freeze.

## P1-S2-A4-BYY — Exam-item mapping batches

Phát hành năm instance: `B21`, `B22`, `B23`, `B24`, `B25`. Mỗi instance pin exact accepted candidate và corpus subset. Có thể chạy tối đa ba instance cùng lúc.

- **Owner:** A4 batch author; không review batch mình viết.
- **Inputs/version:** C0 baseline/schema v1.1; accepted A3 foundation handoff; accepted A4 calibration handoff; exact `CORPUS_INDEX.jsonl` hash; exact BYY subset manifest; applicable accepted candidate and A0 decision: B21=`B21-A2-v6`/`15ae3f00d8920c38a0a55e1ebc282cc6f77a93010043b41740eab80b31c64645`, B22=`B22-A2-v5`/`fc5f990ad9e22d42b7409aad504ea0ce2255f0bf9e0c7905a14fe2506a1f887a`, B23=`B23-A2-v3`/`653ea257ab0d78a16a2fc7771f5f95a63d6fc925df08b3085f45b235ac975bca`, B24=`B24-A2-v2`/`76797cebe4aae2932751a60a7886d4a63ded5d943d469d5fd66961b475bbe101`, B25=`B25-A2-v3`/`0d4a0b6725df45638f2ba5efca0f7a548ec20ff1ae77e9b5657788b34fda1ca6`. Dispatch must replace role-level references with exact upstream path/bytes/SHA.
- **Write:** `stage-2/evidence/a4/BYY/v1/` only.
- **Outputs:** `ATOMIC_ITEM_MAP.jsonl`, `CONTAINER_MAP.jsonl`, `MARKING_EVIDENCE_MAP.jsonl`, `UNRESOLVED_DISPOSITION.jsonl`, pattern candidates, variant candidates, `QA.json`, issues, manifest/handoff.
- **Acceptance:** mọi atomic target của batch đúng một lần; mọi container đúng một lần và non-scoring; per-paper totals 75; marking refs/context/visual refs resolve; 128-set subset preserved. `IN_SCOPE|PARTIAL|SUPPORTING` units require primary requirement mapping; `OUT_OF_SCOPE|NEEDS_REVIEW` may leave it empty only with source-backed rationale, quarantine and reviewer sign-off. Mỗi unit có primary pattern candidate/evidence; source-derived fields không bị analyst rewrite.
- **Reviewers:** A3 độc lập kiểm scope/objective/context; A4 reviewer khác tác giả kiểm marking/pattern; A9 review risk/final.
- **Stop:** handoff; không sửa corpus, foundation hay batch khác.

Expected aggregate invariants sau năm batch: 893 atomic, 379 containers, 893 scoring links, 34 parent-context marking rows, 2.250 marks và 128 unresolved.

## P1-S2-A3-RBYY — Scope cross-review

- **Owner:** A3 reviewer không là A4 batch author.
- **Inputs/version:** frozen A4 BYY handoff/version + accepted A3 foundation/version + exact originals/context evidence pins.
- **Write:** `stage-2/evidence/a3/reviews/BYY/v1/` only.
- **Outputs:** review report/findings/handoff.
- **Acceptance:** 2026 scope, atomic requirement selection, context dependency, partial/supporting/out-of-scope rows and pilot mappings reviewed; no taxonomy edits.
- **Reviewer:** A0 audit; A9 final.
- **Stop:** report handoff.

## P1-S2-A4-RBYY — Marking/pattern cross-review

- **Owner:** A4 reviewer khác tác giả BYY.
- **Inputs/version:** frozen batch-map version + exact QP/MS evidence pins + applicable calibration/schema version.
- **Write:** `stage-2/evidence/a4/reviews/BYY/v1/` only.
- **Outputs:** review report, exact findings, samples/manifest/handoff.
- **Acceptance:** marking target/conditions, response product, primary/secondary pattern, visual/table dependency and container exclusion verified; no self-review.
- **Reviewer:** A0 audit; A9 final.
- **Stop:** report handoff.

## P1-S2-A4-PREAGG — Question bank và provisional patterns

- **Owner:** A4 integrator after all five batch maps and specialist reviews PASS.
- **Inputs/version:** five accepted BYY handoffs at exact hashes, reviewed A3 foundation version, calibration PASS packet and Stage 2 schema version.
- **Write:** `stage-2/evidence/a4/aggregate-v1/` only.
- **Outputs:** `QUESTION_BANK_INDEX.jsonl`, `PATTERN_CATALOG_PROVISIONAL.json`, `PATTERN_EVIDENCE.jsonl`, `MARKING_EVIDENCE_CATALOG.jsonl`, gap/conflict report, manifest/handoff.
- **Acceptance:** union identity with accepted batches; every provisional pattern has evidence/boundary; raw/paper counts present; equivalence-group count null/PENDING; no established/singleton final decision and no frequency prediction.
- **Reviewer:** A3 and A9.
- **Stop:** provisional handoff; no equivalence, final counts or split decision.

## P1-S2-A4-EQV — Variant equivalence

- **Owner:** A4 author bắt buộc khác PREAGG/PATTERN-FINAL author.
- **Inputs/version:** accepted `QUESTION_BANK_INDEX.jsonl`, provisional pattern/evidence handoff, five accepted BYY maps, source QP/MS pins and schema version.
- **Write:** `stage-2/evidence/a4/equivalence-v1/` only.
- **Outputs:** `CANDIDATE_PAIR_UNIVERSE.jsonl`, `CANDIDATE_GENERATION_MANIFEST.json`, reproducible generator/config, `VARIANT_RELATION_REGISTER.jsonl`, `EQUIVALENCE_GROUPS.json`, `REJECTED_PAIR_AUDIT.json`, contradiction/unresolved report, manifest/handoff.
- **Acceptance:** high-recall channels cover normalized prompt fingerprints, same-session cross-component pairs, shared requirement+response+marks/stimulus, MS signatures and text/structure similarity; every candidate reviewed; QP+MS evidence for positive relations; no contradictory component; unresolved/unreviewed likely pairs quarantined; stratified complement audit has reproducible seed and zero observed false negative. Any false negative forces widened rules and full regeneration/review.
- **Reviewer:** A9 kiểm 100% positive/unresolved; A0 audit.
- **Stop:** handoff; không chọn holdout.

## P1-S2-A4-PATTERN-FINAL — Final pattern catalog

- **Owner:** PREAGG author; must differ from EQV author.
- **Inputs/version:** accepted PREAGG handoff and accepted EQV groups/completeness-audit handoff at exact hashes.
- **Write:** `stage-2/evidence/a4/pattern-final-v1/` only.
- **Outputs:** `PATTERN_CATALOG.json`, rebuilt count evidence, delta from provisional, manifest/handoff.
- **Acceptance:** evidence identity preserved; raw, distinct-paper and distinct-equivalence-group counts recomputed; ESTABLISHED needs at least two groups; singleton/gap retained; no frequency prediction.
- **Reviewer:** A3 via reusable review packet, then A9.
- **Stop:** final catalog handoff; no split.

## P1-S2-A6-RECON — Glossary v2 reconciliation

- **Owner:** A6 glossary author.
- **Inputs/version:** accepted glossary v1, accepted A3 objective/requirement foundation and accepted final pattern catalog with exact hashes.
- **Write:** `stage-2/evidence/a6/glossary-v2/` only.
- **Outputs:** `GLOSSARY_SEED.jsonl`, reconciliation delta/conflicts, manifest/handoff.
- **Acceptance:** all objective/pattern refs resolve; removed/renamed IDs reconciled; terminology/source boundaries preserved; VI status explicit; no lesson translation/parity claim.
- **Reviewer:** A3 and A4 through separate reusable review packets; A9 final.
- **Stop:** v2 handoff and freeze.

## P1-S2-A2-SPLIT — Split và holdout

- **Owner:** A2 split curator hoặc A4 specialist không là equivalence author.
- **Inputs/version:** accepted equivalence groups + candidate-universe/complement-audit handoff, final pattern catalog, accepted question bank and accepted A3 objective/requirement foundation at exact hashes. Split does not consume the later TRACE coverage output.
- **Write:** `stage-2/evidence/a2/split-v1/` only.
- **Outputs:** `SPLIT_POLICY.md`, `SPLIT_ASSIGNMENTS.jsonl`, `HOLDOUT_DECISION.json`, `AUTHOR_ALLOWLIST.json`, `LEAKAGE_CHECK.json`, handoff.
- **Acceptance:** assignment ở connected-component level; no detected/reviewed positive, unresolved or unreviewed-likely pair crosses split; complement-audit limits cited; author allowlist không chứa holdout; whole-paper 75-mark preference được đánh giá nhưng không chọn cứng theo năm; blind/controlled/mixed label đúng khả năng cách ly thực tế.
- **Reviewer:** A9; A0 quyết định/freeze.
- **Stop:** handoff; không giao dữ liệu cho A5.

## P1-S2-A3-TRACE — Coverage và learning map

- **Owner:** A3 traceability integrator.
- **Inputs/version:** accepted foundation, five batch maps, final post-equivalence pattern catalog, glossary v2 and split decision at exact hashes.
- **Write:** `stage-2/evidence/a3/trace-v1/` only.
- **Outputs:** `COVERAGE_MATRIX.jsonl`, `OBJECTIVE_ASSESSMENT_MATRIX.jsonl`, `LEARNING_MAP.json`, `GAP_REGISTER.json`, `ORIGINAL_ASSESSMENT_BRIEFS.jsonl`, `SOURCE_FLAGS_REGISTER.md`, handoff.
- **Acceptance:** every required child has planned teaching + assessment disposition; reverse refs resolve; no official evidence gap hidden; original briefs labelled AlgoCore and contain no full question/solution; hard prerequisites topologically valid.
- **Reviewer:** A4 independent and A9.
- **Stop:** handoff; no lesson authoring.

## P1-S2-A0-INTEGRATE — Stage 2 aggregate

- **Owner:** A0.
- **Inputs/version:** every accepted specialist artifact and review handoff, exact hashes, schema/DoD v1.1 and C0 input baseline.
- **Write:** Stage 2 top-level + `evidence/a0/final/`.
- **Outputs:** accepted copies/indexes, `STAGE2_MANIFEST.json`, `FINAL_INTEGRITY_CHECK.json`, `STAGE2_SUMMARY.md`, A9 final work order with exact hashes.
- **Acceptance:** all specialist handoffs audited; validator S2-M01–S2-M14 PASS; findings/status reconciled; inputs unchanged.
- **Reviewer:** fresh A9.
- **Stop:** freeze final-review packet.

## P1-S2-A9-FINAL — Independent final review

- **Owner:** fresh A9, not author of Stage 2 artifact.
- **Inputs/version:** A0 final-review work order containing exact hashes for every integrated artifact, all accepted specialist/review handoffs, C0 baseline, schema/DoD and validator.
- **Write:** `stage-2/evidence/a9/final-v1/` only.
- **Outputs:** `FINAL_REVIEW_REPORT.md`, `FINAL_MACHINE_CHECKS.json`, `INPUT_MANIFEST.json`, `OUTPUT_MANIFEST.json`, `HANDOFF_FINAL.json`.
- **Acceptance:** independently reproduce DoD, audit sources/risk classes, zero unexplained drift, findings have owner/fix/retest.
- **Reviewer:** A0 audits the handoff; A9 cannot close gate.
- **Stop:** handoff and stop. A0 decides gate, updates `WAITING_FOR_USER_STAGE_CHECK`, stops all agents and does not dispatch Stage 3.
