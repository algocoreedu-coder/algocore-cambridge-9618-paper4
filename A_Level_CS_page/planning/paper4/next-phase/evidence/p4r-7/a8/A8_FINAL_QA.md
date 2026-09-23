# P4R-7 A8 independent clean-room QA

**Decision:** `PASS_TO_LEAD_RELEASE_GATE`  
**Candidate:** `3849510defd1ca4a4b060daa6696348b8467d359`  
**Runtime:** Node `v24.19.0` (project requirement `>=22`)  
**Required findings open:** `0`

A8 recommends that Lead proceed with the allow-listed `paper4-2026-s9-v2` manifest build, detached verification and final signature. This review does not change gate files, program status, canonical release records or release state.

## Clean-room result

The candidate was checked from a detached Windows worktree created from the exact commit. The host Git configuration has `core.autocrlf=true`. `npm ci` completed with 285 packages and zero vulnerabilities, all verifier commands ran under Node `v24.19.0`, the production build passed, and the Git tree remained clean.

The first candidate exposed a real clean-checkout defect: Windows converted byte-hashed Python sources to CRLF and `verify:p4r2` rejected their hashes. Candidate `3849510` closes that finding with `* text=auto eol=lf`. A fresh default checkout retained LF, all 26 Python source files matched their declared SHA-256 values, and the full verifier passed.

## Exact scope verified

| Set | Result |
|---|---:|
| Packages / lessons / locale routes | 13 / 26 / 52 |
| Knowledge units / Python artifacts / fixtures | 108 / 26 / 78 |
| Patterns / visual scenarios / visual events | 58 / 174 / 589 |
| Marking chains / marking atoms / assessment items | 58 / 2,236 / 78 |
| Lesson release records / retrieval loops | 26 / 108 |

The canonical registry digest is `e9fe687c79e23d3a6d0ec844c5e8ca83fca473fbc800623836be61b5a439f827`. The deterministic app compiler output is `858abaccfaa1a0f58a1eece62797f34249cd971a14690ac39ac0d4c5d17081bf`.

## Learner-visible and pedagogy result

- All 52 VI/EN lesson routes passed; the invalid slug returned 404.
- Every server route contained the complete canonical Python artifact. A6 independently confirmed exactly one full Python source after hydration on 52/52 routes.
- Practice feedback is attempt-gated for 78/78 items. Retrieval review is response-gated for 108/108 items and includes answer, diagnosis, repair, retry and a three-criterion AlgoCore self-rubric.
- The 108 retrieval contracts all provide a response mode, evidence references, bilingual diagnosis, repair and retry guidance, and `official_marks: null`.
- Authority boundaries passed: 20 official pattern-owner lessons and six `AlgoCore_representational_workflow_only` lessons. No AlgoCore rubric claims Cambridge marks.
- Local-path leaks, unsafe rendered links, console errors, hydration errors and chunk-load errors were all zero.
- The Node 24 axe audit passed 52/52 routes with zero violations. Color contrast remains covered by A6's real-browser light/dark computed-color checks because JSDOM has no paint engine.

The superseding A6 and A7 reviews both target the exact candidate and report zero required findings. A7 independently closed `P4R6-A7-F001` and `P4R6-A7-F002` after 78 practice and 108 retrieval browser interactions.

## Commands and evidence

The clean-room run executed:

```text
npm ci
npm run verify:p4r2
npm run verify:p4r3-p4r4
npm run verify:paper4:full-registry
npm run verify:paper4:v2-app
node scripts/check-paper4-v2-routes.mjs
node scripts/check-paper4-v2-axe.mjs
node evidence/p4r-7/a8/clean-room-check.mjs --app-root <detached-worktree> --base-url http://127.0.0.1:3029 --expected-commit 3849510defd1ca4a4b060daa6696348b8467d359
```

Primary evidence:

- `A8_CLEAN_ROOM_CHECK.json` — independent exact-set, Python, route, disclosure, authority, leak and release-contract check.
- `FULL_VERIFIER_NODE24.log` — complete verifier, typecheck and production build log.
- `LIVE_ROUTES_NODE24.json` — 52/52 live routes and invalid-slug result.
- `AXE_NODE24.json` — 52/52 axe result with zero violations.
- `clean-room-check.mjs` — reproducible read-only checker.
- `../../p4r-6/a6/A6_LEARNER_VISIBLE_QA.json` — superseding A6 browser review.
- `../../p4r-6/a7/A7_PEDAGOGY_RECHECK_FINAL.json` and `A7_BROWSER_RECHECK.json` — superseding A7 review.

## Release recommendation

The release builder contract uses `git ls-files -z` to create a complete tracked-app BOM with per-file size and SHA-256 plus an aggregate digest. Planning attestations come from an explicit allow-list, avoiding recursive inclusion of mutable evidence directories. The detached verifier checks the candidate commit, clean tree, every BOM file, the BOM aggregate, every attestation and the dependency snapshot.

Lead should now build the manifest so it can include this final A8 attestation, run detached verification, verify the supersession and rollback fields, then sign `paper4-2026-s9-v2`. A8 recommends that final action and has not promoted the release itself.
