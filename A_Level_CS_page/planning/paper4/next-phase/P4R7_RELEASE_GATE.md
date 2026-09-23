# P4R-7 Lead release gate

**Decision:** `PASS`  
**Release:** `paper4-2026-s9-v2`  
**Candidate:** `3849510defd1ca4a4b060daa6696348b8467d359`

Lead double-check xác nhận mọi gate P4R-0 đến P4R-7 đã PASS và required open findings bằng 0.

## Clean-room và independent QA

- A8 checkout sạch đúng candidate, dùng Node 24.19.0 sau khi kiểm `.node-version` = 22 và engine `>=22`.
- Clean `npm ci`, full verifier, TypeScript và production build PASS.
- 52/52 live VI/EN route PASS, invalid slug = 404, full Python có trong 52/52 server responses.
- axe 52/52 PASS, 0 violation.
- Exact sets PASS: 13 package, 26 lesson, 108 KnowledgeUnit, 26 PythonArtifact, 78 fixture, 58 pattern, 174 scenario, 589 event, 58 MarkingChain, 2.236 atom, 78 AssessmentItem, 26 release record và 108 retrieval loop.
- A6 và A7 cùng PASS trên exact candidate, không còn required finding.

## Manifest và rollback

- Release manifest: `release-v2/RELEASE_MANIFEST.json`.
- Manifest SHA-256: `53c96afbcf9ff1071ce59c9f4931d3787161aab3e9c26264af794e5b622b4674`.
- App BOM: 477 tracked files, aggregate SHA-256 `a28dcaceb6a11ec6e365e690eea0ad5316839cfc41495805c4facce613cef8d4`.
- Detached verification: `PASS`, 477/477 files và 15/15 attestations, 0 failure.
- `paper4-2026-s9-v1` được supersede nhưng giữ nguyên làm lịch sử. Rollback chỉ về exact detached-verified v2 commit nêu trên.

Known non-scope được công bố trong release notes: accounts, learner progress persistence, arbitrary Python execution và public deployment.

Lead ký phát hành `paper4-2026-s9-v2`.
