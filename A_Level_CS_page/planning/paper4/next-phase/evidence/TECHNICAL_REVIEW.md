# Paper 4 technical review and remediation workstream

**Review date:** 2026-09-22  
**Scope:** `algocore-fumadocs`, Stage 7 event specifications, Stage 8 runtime, Stage 9 learning-page compiler, local workflow, testing and release reproducibility  
**Decision:** **REWORK_REQUIRED — do not relock Stage 9**

## Executive finding

The application shell is buildable and the local server is healthy, but the current Action View is not yet an execution view of the Python shown in the lessons. It is a deterministic viewer for Stage 7 editorial event records. Three defects combine to create a false impression of executable Python:

1. `build-stage8-registry.mjs` manufactures `normal`, `boundary` and `failure` scenarios from the same event list, trace and example (`scripts/build-stage8-registry.mjs:75-81`). All **58/58 patterns** therefore have three labels for one identical trace.
2. The Stage 8 registry has **331 code-line cells, 0 Python-like lines and only 58 unique values**. They contain contract tokens such as `algorithm-translate.step.contract` and `B2-BINARY_SEARCH-S01`. There is **0 exact line overlap** with the 213 unique Python lines in Stage 9 worked examples. The runtime renders these tokens as code (`Paper4VisualRuntime.tsx:382`).
3. The Stage 7 controlled vocabulary says unmapped labels fail S7-0 (`stage-7/evidence/s7-a/EVENT_SCHEMA.json:47`), but the released registry has **328/331 events with unmapped `source_event_label` values**. The other three use a mapped label but have the wrong `event_type` (`assign` instead of `read`, `branch` or `emit`).

The visual therefore changes an event index and displays associated editorial state text; changing the scenario does not change the executed path. This must be fixed before visual correctness, Python execution, or scenario coverage can be claimed.

## Verified baseline

| Check | Result | Evidence |
|---|---:|---|
| TypeScript | PASS | `npm run typecheck`, 2026-09-22 |
| Production build | PASS | `npm run build`, Next 16.3.5, 32 pages generated during build |
| Local dev server | PASS | PID 34976 listening on `127.0.0.1:3018`; `/paper-4` returned HTTP 200 |
| Stage 9 release state | Correctly reopened | `stage-9/STATUS.json` is `REWORK_REQUIRED` |
| Structured Python rendering | Present | 26/26 lessons and 52/52 locale routes were covered by the prior post-release audit |
| Theory/source gate | FAIL | 1/26 theory-depth pass; 0/26 Stage 5 execution joins; 0/26 direct coursebook and syllabus joins |
| Runtime registry size | Risk | `stage8-runtime-registry.json` is 4,932,709 bytes |
| Local dev HTML payload | Risk | `/paper-4` measured 2,042,420 bytes; representative lessons measured 306–359 KB. These are local uncompressed/dev measurements, not production transfer-size claims. |

The build was run with Node `v20.11.0`, while `package.json:37` requires Node `>=22`. The successful build does not remove that environment mismatch.

## Findings

### T-001 · Critical · Scenario selection is cosmetic

`build-stage8-registry.mjs:75-81` creates all three case kinds from `rows[0].entry.trace_id`, `rows[0].entry.example_id` and the same `eventIds`. `Paper4VisualRuntime.tsx:202` always reads `pattern.events[eventIndex]`; `activeScenario` at lines 206–209 only changes labels and data attributes. Quantitative check: **58/58 patterns have identical event IDs, trace ID and example ID across all three scenarios**.

**Impact:** the UI says it changed to boundary or failure, but code, state, output and invariant remain the normal trace. Existing gates validate references and counts, so this semantic defect passed.

### T-002 · Critical · Action View has no binding to lesson Python

`VisualEvent.code_lines` is only `string[]` (`paper4-visual/types.ts:18`); it has no `code_artifact_id`, stable line ID, line range or content hash. The current registry contains **331 entries, 58 unique contract tokens, 0 Python-like lines and 0 exact matches** with Stage 9 code. The renderer then numbers those tokens as if they were source code.

**Impact:** code, state, trace and output cannot be proven to describe the same program. Editing a lesson example cannot invalidate a stale visual trace.

### T-003 · Critical · Stage 7 schema policy was not enforced

The Stage 7 contract lists a controlled event vocabulary and requires unknown labels to fail. The Stage 8 builder checks release ID, batch, status, uniqueness and sequence, but it does not validate event labels against `EVENT_TYPE_MAPPING.json`. The Stage 8 verifier likewise checks shape and references, not the mapping semantics.

**Measured result:** 310 unique labels are outside the vocabulary, covering 328 events. The three events using accepted labels have inconsistent `event_type` values.

### T-004 · High · Runtime state data is largely templated

Across 331 events:

- 62 have an empty structured `before.state`; 62 have an empty `after.state`;
- only 37 unique `before` objects, 36 unique `after` objects and 58 unique `delta` objects exist;
- 260 events contain a generic “Compare the … Stage 5 trace” delta;
- 268 events have `output_delta: null`;
- event types collapse to 324 `assign` and seven `branch`.

**Impact:** the visual cannot reliably teach pointer movement, call frames, file position, object mutation or branch-specific output. Counts such as “331 events” exaggerate the amount of distinct verified behavior.

### T-005 · Critical · The Stage 9 compiler loses content depth

`build-stage9-lessons.mjs:256-266` flattens representation, invariant, action, checks and visual fields into newline-joined strings. The compiler does not consume the 108 Stage 3 knowledge blocks as a structured knowledge model. The post-release gate consequently reports theory depth passing in only 1/26 lessons.

The compiler also uses files under `stage-9/evidence/s9-r*` and `post-release-audit` as authoring inputs (`build-stage9-lessons.mjs:45-76`). This mixes source artifacts, review evidence and generated output in one dependency graph.

### T-006 · High · Types do not validate imported JSON

`LearningContent` accepts arbitrary recursive maps (`paper4-learning/types.ts:35-41`), and source references/lessons include open-ended unknown keys. JSON is cast using `as unknown as LearningRegistry` and `RuntimeRegistry` in both route files (`paper-4/page.tsx:10-11`, lesson route lines 18-19). TypeScript therefore cannot detect a malformed generated registry.

**Impact:** builders and renderer can disagree without compilation failure. Key-specific rendering and pedagogy checks depend on string names scattered across code.

### T-007 · High · Gates verify tokens and counts more than behavior

The pedagogy verifier searches for words such as “requirement”, “Python”, “trace” and “rubric” (`verify-stage9-pedagogy.mjs:19,83-99`). The Python/theory audit tests renderer implementation using source-text `includes` checks (`audit-stage9-python-theory.mjs:101-104`). The reducer script covers pure state transitions, but no test asserts that selecting a boundary scenario produces a different trace or that an event highlights the actual Python line.

There is no test framework, Playwright dependency, axe check or CI configuration in the app. A useful CDP browser harness exists under Stage 9 evidence, but it is not part of `npm run verify:stage9` and depends on a separately launched debug browser.

### T-008 · High · Verification mutates the artifacts it claims to verify

`npm run verify:stage9` starts with `stage9:registry`, and that command rebuilds `stage9-learning-pages.json` and writes evidence. The Stage 8 registry verifier also calls the builder in place. A failed verify can therefore leave new generated artifacts in the worktree.

**Impact:** a verifier is not read-only; reviewers cannot distinguish “checked release” from “release regenerated during checking”. Clean-room reproducibility is weaker than the gate names imply.

### T-009 · High · Release manifest composition is unstable and incomplete

`release_stage9.mjs:22-39` combines a hand-maintained explicit list with a recursive walk of the entire Stage 9 planning directory. Adding an unrelated evidence file changes the release manifest, while build-critical files such as `next.config.mjs`, `tsconfig.json`, `postcss.config.mjs`, `styles/algocore-theme.css`, `scripts/audit-stage9-python-theory.mjs` and the imported Stage 8 runtime registry are absent from the Stage 9 manifest.

The detached verifier checks stored QA decisions and file hashes (`verify_stage9_release.mjs:41-47`); it does not rebuild from a clean checkout or execute the behavior gates.

### T-010 · High · Payload and rendering architecture will not scale

The full runtime registry is 4.93 MB and is imported into the hub. A single `hashing` pattern subset serializes to roughly 973 KB before framework overhead. The local dev hub response was about 2.04 MB. Every pattern also repeats source metadata and templated event content.

**Impact:** slow first load, costly hydration, long mobile parsing time and larger build/release artifacts. Expanding theory and real traces without partitioning data will worsen this materially.

### T-011 · Medium · Build/deployment behavior is not explicitly chosen

The lesson route declares `generateStaticParams()` and `dynamicParams = false`, yet the production build reports all Paper 4 routes as dynamic because locale is handled through query parameters and server search params. This is valid Next.js behavior, but it means the course currently requires a Next server; it is not a self-contained static export.

**Impact:** deployment and offline/classroom hosting requirements remain ambiguous. The README only describes local `npm start`.

### T-012 · Medium · Accessibility foundation is useful but coverage is incomplete

Positive implementation includes a skip link, focus styles, reduced-motion CSS, mobile grid collapse, `aria-live`, progress semantics and keyboard-operable native controls. Remaining issues:

- On a lesson the runtime heading is `h3`, while its internal panels also use `h3`, weakening hierarchy.
- Prediction requires learners to type internal event labels/types and reveals another internal token on failure.
- The code region cannot expose a current real source line because no binding exists.
- Automated checks cover selected pages/interactions; there is no axe scan across 52 routes, no high-zoom check and no screen-reader-oriented name/state audit for every runtime control.

### T-013 · Medium · Local workflow is not reproducibly pinned

The app declares Node 22 but has no `.node-version`, `.nvmrc`, Volta setting, container or CI runner. The current machine uses Node 20.11.0. The server is healthy, but the launch process is an ad hoc persistent `next dev` process and there is no scripted health check, PID/log location or port-conflict recovery.

## Target architecture

Use four explicit artifact layers:

1. **Authoring sources:** reviewed bilingual theory, Python source files, tests, coursebook/syllabus/exam citations. These are editable source, never stored under an `evidence` folder.
2. **Execution evidence:** immutable run manifests generated from Python source and test fixtures. Each record holds code hash, Python version, command, exit code, stdout/stderr hash and test result.
3. **Visual specifications:** scenario-specific event traces bound to one code artifact and exact stable source spans. State snapshots and outputs derive from execution evidence or are explicitly marked conceptual.
4. **Application registries:** generated, schema-validated, partitioned runtime and lesson data. They are never edited by hand and can be reproduced byte-for-byte from layers 1–3.

Recommended core identities:

```text
lesson_id
  └─ example_id
      ├─ code_artifact_id + sha256 + language + source_path
      ├─ test_case_id / scenario_id + case_kind + concrete input
      ├─ run_id + interpreter + exit_code + observed_output
      └─ trace_id
          └─ event_id + event_type + code_span(start_line,end_line,line_hash)
```

## Prioritized remediation plan

### Phase 0 · Freeze and baseline — 0.5 day

**Owner:** Lead + release engineer  
**Dependencies:** none

- Keep Stage 9 `REWORK_REQUIRED`; label the old Stage 7/8 visual releases as structurally valid but semantically superseded.
- Capture hashes of the current source and generated registries.
- Add a read-only audit that reproduces T-001 through T-004 without rewriting any input.
- Split commands into `generate:*` and `check:*`; reserve `verify:*` for read-only checks.

**Gate G0:** audit reports 58 cloned-scenario patterns, 0 Python line bindings and the event-vocabulary mismatch; running it twice leaves `git diff` unchanged.

### Phase 1 · Schema v2 and source boundary — 1–2 days

**Agent A-T1: schema/provenance engineer**  
**Reviewer:** Lead  
**Dependencies:** G0

- Create JSON Schema or Zod contracts for lesson, code artifact, run evidence, scenario, trace and event.
- Replace arbitrary `code_lines: string[]` with `code_artifact_id` plus `code_span` and optional display snapshot.
- Give every scenario concrete input, expected outcome, trace ID and explicit support status.
- Model knowledge as sections with syllabus locator, coursebook locator, concepts, Python semantics, invariants and exam-pattern joins.
- Move editable remediation content out of `evidence/` into a dedicated `content/paper4` or `authoring/paper4` tree.
- Generate TypeScript types from the same schema or validate JSON at import/build boundaries.

**Gate G1:** all source artifacts validate; intentional unknown fields, unknown event types, stale code hashes, missing locale fields and missing source locators fail with a precise JSON pointer.

### Phase 2 · Canonical Python and execution evidence — 3–5 days

**Agent A-T2: Python execution engineer**  
**Content partner:** Python subject reviewer  
**Reviewer:** independent QA  
**Dependencies:** G1

- Extract each worked example into a runnable canonical `.py` artifact while preserving the code displayed in VI and EN.
- Add normal, boundary and failure fixtures appropriate to the algorithm. Record expected return/output/state/error.
- Run syntax compilation plus executable tests in an isolated temporary directory; file examples must use per-run temporary paths.
- Emit immutable run manifests joined by `example_id`, `code_artifact_id` and hash.
- Reject teaching snippets that cannot run by marking them explicitly as `fragment` and supplying a runnable harness.

**Gate G2:** 26/26 lessons have a canonical Python artifact or an approved fragment+harness; hashes match displayed code; syntax is valid; required fixtures pass; 26/26 worked examples link to run evidence.

### Phase 3 · Re-author scenario traces and code-line bindings — 4–7 days

**Agents A-T3A/B: event specification engineers by pattern batch**  
**Reviewer:** Lead + Python subject reviewer  
**Dependencies:** G1 and G2

- Rebuild Stage 7 event specs from the canonical code and run evidence.
- Give normal, boundary and failure their own trace/event list. If a case is not meaningful, mark it `not_applicable` with a reason instead of cloning a normal trace.
- Populate concrete before/delta/after snapshots, call frames/pointers, output deltas and invariant checks.
- Enforce controlled `event_type`; preserve a human-facing bilingual action label separately.
- Bind each event to exact source line span and hash.

**Gate G3:** 0 unmapped or mismatched event types; 0 contract-token “code lines”; 100% events resolve to a current code span; every supported scenario has case-specific input and trace; no two case kinds share an identical complete trace unless an approved equivalence reason is recorded.

### Phase 4 · Runtime v2 and data partitioning — 3–5 days

**Agent A-T4: React/Next runtime engineer**  
**Reviewer:** accessibility engineer  
**Dependencies:** G3

- Make scenario selection choose scenario events, not `pattern.events`.
- Render the canonical code artifact once and highlight the current bound line range; keep selectable text and stable line numbers.
- Show concrete scenario input and expected/observed output.
- Preserve/reset pattern, scenario, event and locale according to an explicit state-machine contract.
- Correct heading levels and create component-local IDs with `useId`.
- Partition the registry by pattern or lesson; load hub metadata without all events, and lazy-load the chosen runtime trace.
- Keep a meaningful static fallback generated from the same trace.

**Gate G4:** changing normal/boundary/failure changes trace/state/output as specified; highlighted code span hash matches the source; keyboard and screen-reader announcements name human-readable actions; no page overflow at 320 px and 400% zoom.

**Performance gate G5:** production budgets agreed before implementation; proposed initial budgets are hub initial HTML <250 KB uncompressed, initial client data <300 KB uncompressed, per-pattern trace chunk <150 KB, and no full 4.93 MB registry in the hub client payload. Adjust only with measured justification.

### Phase 5 · Stage 9 compiler v2 and theory preservation — 3–6 days

**Agent A-T5: learning-content compiler engineer**  
**Content partners:** theory/coursebook and exam-mapping agents  
**Dependencies:** G1; can run in parallel with Phases 2–3, integrates after G2

- Compile structured knowledge sections instead of joining fields into prose.
- Preserve all accepted Stage 3 knowledge units and explicit coursebook/syllabus/exam joins.
- Link the worked example to canonical Python, run evidence and visual trace using IDs rather than copied strings.
- Add schema-driven renderers for known block variants; reject an unknown learner-facing key.
- Generate into a temporary directory and atomically promote only after all gates pass.

**Gate G6:** 26/26 lessons pass theory-depth and source-authority gates; no Stage 3 accepted knowledge unit disappears without a disposition; 26/26 code/evidence/visual joins resolve; generated registry is byte-identical across two clean runs.

### Phase 6 · Test pyramid and accessibility — 2–4 days

**Agent A-T6: test/accessibility engineer**  
**Reviewer:** independent QA  
**Dependencies:** G2–G6

- Add unit tests for schemas, builders, reducer transitions, scenario selection, line binding and source resolver.
- Add mutation fixtures for cloned scenarios, stale hashes, wrong event type, missing source, invalid Python and copied VI/EN text.
- Add Playwright tests to the package scripts for 52 routes plus all 58 runtime patterns and every supported case kind.
- Add axe checks, keyboard flow, focus visibility, 320 px, 400% zoom, dark mode and reduced motion.
- Test production `npm start`, not only `next dev`.

**Gate G7:** all mutation fixtures fail for the intended reason; all real data passes; zero serious/critical axe findings; every control has an accessible name/state; all 52 routes return 200 and invalid slugs return 404; no console/hydration errors.

### Phase 7 · Clean release and deployment decision — 1–2 days

**Agent A-T7: release/reproducibility engineer**  
**Reviewer:** Lead + independent QA  
**Dependencies:** G0–G7

- Pin Node 22 in a version file and CI; use `npm ci` from a clean checkout.
- Decide and document Next server deployment versus static export/offline package.
- Build a complete allow-listed release bill of materials from actual build inputs; never recursively include mutable evidence directories.
- Make release verification read-only. In CI: generate to temp, diff expected outputs, run schemas/tests/typecheck/build, launch production server and run browser smoke, then create manifest.
- Record tool versions and hashes. Verify a copied release in a separate directory.

**Gate G8:** one command on a clean checkout reproduces registries and build; worktree remains clean after verification; manifest covers every build input; detached copy passes hashes and production smoke; release status can only change to locked when G1–G8 are all green.

## Agent coordination and review gates

| Workstream | Agent | May start | Lead review before |
|---|---|---|---|
| Baseline/read-only audits | A-T7 | immediately | any source migration |
| Schema/source boundary | A-T1 | immediately after baseline | Python and event authoring |
| Canonical Python/runs | A-T2 | after schema | trace authoring |
| Event batches | A-T3A, A-T3B | after code/run identity exists | runtime integration |
| Runtime and partitioning | A-T4 | after representative traces, then full set | E2E QA |
| Lesson compiler/theory preservation | A-T5 | after schema; parallel content work | E2E QA |
| Accessibility/E2E | A-T6 | test scaffolding early; final after integration | release |
| Release/CI | A-T7 | baseline early; final after all gates | relock |

Lead should use representative vertical slices before bulk work:

1. `binary-search` for loop/branch and not-found boundary;
2. `queue` for pointers, empty/full and wraparound;
3. `recursion` for call frames/base case;
4. `hashing` for collision/probing and current payload hot spot;
5. `object-files` for file I/O and exception path.

Each slice must pass G1–G7 before agents replicate the pattern across the remaining lessons. Failed slices return to the owning agent; the Lead must not advance a batch based only on counts.

## Release-blocking acceptance matrix

| Gate | Release condition |
|---|---|
| G0 Read-only baseline | Verification causes zero tracked/source changes |
| G1 Schema | 100% source/generated JSON validates; negative fixtures rejected |
| G2 Python | 26/26 canonical examples compile/run with linked evidence |
| G3 Events | 100% events bind to current source spans; vocabulary clean |
| G4 Scenarios/runtime | Case selection changes real trace; code/state/output synchronized |
| G5 Performance | Hub and chunks remain within agreed measured budgets |
| G6 Theory/compiler | 26/26 lessons preserve source joins and theory depth |
| G7 UX/accessibility | 52 routes + 58 patterns pass browser, axe, keyboard and mobile checks |
| G8 Reproducibility | Clean checkout rebuild and detached release verification pass |

## Files that should be treated as generated

- `algocore-fumadocs/app/data/stage8-runtime-registry.json`
- `algocore-fumadocs/app/data/stage9-learning-pages.json`
- gate reports, build summaries, release manifests and release verification files

Editable Python, lesson theory, fixtures and visual specs should have a separate source location. Generated files should contain a header field with schema version, generator version, source-manifest hash and generation command. Application code must not silently treat evidence reports as authoring sources.

## Immediate next actions for the Lead

1. Assign A-T1 and A-T7 first; keep Stage 9 blocked.
2. Approve schema v2 and the authoring/generated directory boundary.
3. Commission the five vertical slices and require actual run evidence plus source-span bindings.
4. Let A-T4 implement runtime v2 against those slices while A-T5 preserves full theory structure.
5. Run A-T6 independent QA; return any failed gate to its owner.
6. Scale the approved slice patterns to all 26 lessons/58 patterns.
7. Relock only after a clean Node 22 build, production-server E2E and detached manifest verification.

