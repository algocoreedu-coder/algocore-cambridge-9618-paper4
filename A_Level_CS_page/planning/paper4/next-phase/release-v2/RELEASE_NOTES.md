# Paper 4 recovery v2 release notes

**Release:** `paper4-2026-s9-v2`  
**Candidate:** `3849510defd1ca4a4b060daa6696348b8467d359`  
**Supersedes:** `paper4-2026-s9-v1`

V2 thay thế bản v1 sau audit phát hiện phần Python, theory depth và canonical visual/runtime evidence chưa đạt chuẩn phát hành. Bản mới cung cấp 26 learning page song ngữ Việt–Anh cho 13 package Paper 4, với Python đầy đủ, fixture thực thi và trải nghiệm học theo 10 section thống nhất.

## Nội dung phát hành

- 108 KnowledgeUnit nối trực tiếp syllabus/coursebook và stable Python line.
- 26 PythonArtifact, 78 fixture normal/boundary/failure đã parse, chạy và rerun độc lập.
- 58 pattern, 174 scenario, 589 visual event và 2.691 active-line binding.
- 58 MarkingChain disposition đủ 2.236 atom; 78 practice item có stable joins.
- 78 attempt-gated practice loop và 108 retrieval loop đầy đủ response, answer, diagnosis, repair/retry và self-rubric.
- 52 route VI/EN, 10 section mỗi lesson, một full Python artifact mỗi route.

## Kiểm chứng phát hành

- Canonical registry aggregate: `e9fe687c79e23d3a6d0ec844c5e8ca83fca473fbc800623836be61b5a439f827`.
- App output semantic SHA-256: `858abaccfaa1a0f58a1eece62797f34249cd971a14690ac39ac0d4c5d17081bf`.
- Node pin: 22; clean-room validation runtime: Node 24.19.0.
- Clean `npm ci`, full verifier, TypeScript, production build, 52/52 live route, invalid 404 và 52/52 axe scan PASS.
- A6 learner-visible QA, A7 academic/pedagogy QA và A8 clean-room QA đều PASS trên cùng candidate; required findings = 0.

## Rollback

Rollback target là exact candidate v2 đã detached-verify trong `RELEASE_MANIFEST.json`. Bản v1 được giữ làm lịch sử nhưng không còn là content-complete release.

## Known non-scope

- accounts;
- learner progress persistence;
- arbitrary Python execution;
- public deployment.

Các mục này cần workstream riêng và không ảnh hưởng tính đầy đủ của nội dung/learning flow Paper 4 v2 chạy local.
