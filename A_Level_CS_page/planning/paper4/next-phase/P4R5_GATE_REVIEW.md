# P4R-5 Lead app integration gate

**Decision:** `PASS`

Ứng dụng Paper 4 v2 đã tích hợp canonical corpus bằng compiler deterministic trên candidate `3849510defd1ca4a4b060daa6696348b8467d359`.

- Exact sets: 13 package, 26 lesson, 52 locale route, 10 section mỗi lesson.
- 108 KnowledgeUnit, 26 PythonArtifact, 78 fixture, 58 pattern, 174 scenario, 589 event, 58 MarkingChain, 2.236 marking atom và 78 practice item được nối vào DTO phát hành.
- 52/52 production route PASS; invalid slug trả 404.
- VI/EN dùng chung code, fixture, trace và stable IDs; đổi locale giữ đúng route và anchor.
- Learner DTO và rendered links không chứa local path, `file://` hoặc external insecure HTTP.
- TypeScript, production build, registry checker, route checker và deterministic rebuild đều PASS dưới runtime Node được hỗ trợ.
- Production không import các Stage 8/9 flat registry cũ.

App output semantic SHA-256: `858abaccfaa1a0f58a1eece62797f34249cd971a14690ac39ac0d4c5d17081bf`.

Bằng chứng quyết định:

- `evidence/p4r-5/a4/A4_APP_COMPILER_REVIEW.md`
- `evidence/p4r-5/a4/A4_APP_INTEGRATION_REVIEW.md`
- `evidence/p4r-6/a6/A6_LEARNER_VISIBLE_QA.md`
- app scripts `verify:p4r2`, `verify:p4r3-p4r4`, `verify:paper4:full-registry`, `verify:paper4:v2-app`

Required findings: **0**. P4R-5 được đóng.
