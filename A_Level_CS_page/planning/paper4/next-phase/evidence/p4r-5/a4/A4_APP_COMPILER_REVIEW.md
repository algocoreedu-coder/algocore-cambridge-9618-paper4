# P4R-5 A4 canonical app compiler review

**Decision:** `PASS_WITH_REQUIRED_INTEGRATION_CARRYOVER`

Implementation commits: `3b2534b`, `fafbaae`, `5adfcbd`, `8d1b1c3` (final compiler head).

The v2 compiler now produces one metadata-only course manifest, a static loader map for 26 lessons, 26 complete lesson DTOs and 58 public trace chunks. It reads the seven full canonical record sets and the locked Stage 3 editorial registry. `LESSON_PACKAGES.json` supplies the real bilingual course, package and lesson titles; its SHA-256 is locked to `01710c1a99028228bf5472ddf9457a4ac9c5df64ebd576785139d23d6fca0ad2` and its 13-package/26-lesson identity is checked against canonical release records.

## Exact-set result

| Contract | Result |
|---|---:|
| Packages / lessons / sections per lesson | 13 / 26 / 10 |
| Official patterns / scenarios / events | 58 / 174 / 589 |
| KnowledgeUnits / PythonArtifacts | 108 / 26 |
| MarkingChains / AssessmentItems / LessonReleaseRecords | 58 / 78 / 26 |
| Full Python source hashes | 26/26 PASS |
| Static lesson loaders | 26/26 PASS |

The six limited-association lessons are exactly `dictionary`, `exceptions`, `graphs`, `performance`, `random-files` and `testing`. They receive no official visual ownership and no Cambridge marking chain. Their three assessment levels retain `AlgoCore_authored_rubric`, `official_marks: null` and `AlgoCore_representational_workflow_only`.

## Determinism, safety and payload

- The compiler validates the canonical registry authority `e9fe687c79e23d3a6d0ec844c5e8ca83fca473fbc800623836be61b5a439f827`; the separate parsed-input semantic hash is `7b7f2dbe7459a2c0b56d1f9504ef6c2eb4a966ffe42c94849d6e6215e79da7ff`.
- Two consecutive builds of the extended chunk contract produced the same output hash: `adf51574349a51a5adaa84adc47058cbc7d1950a9838d12ab139753338efb99a`. Every trace chunk carries its own verified public Python artifact so the hub can switch patterns without preloading 26 artifacts.
- Read-only registry and payload checks pass on Node `20.11.0` and Node `24.19.0`.
- Generated public data contains no drive path, `file://` URL, repository path or Stage 8/9 registry reference.
- The hub manifest is 40,678 bytes. Manifest plus static loader is 43,346 bytes, below the 300,000-byte metadata budget.
- The largest of 58 trace chunks is `queue-inspect.json` at 95,083 bytes, below the 150,000-byte limit after embedding the executed Python artifact.

## Required integration carryover

`exam-workflow.json` is 659,198 bytes because it contains the complete official marking evidence required by the lesson contract. The app integrator must load lesson DTOs on the server and avoid serializing the complete DTO into initial client data. Client components should receive only the interactive Python/trace subset. P4R-6 must measure the actual RSC/client response before the payload gate closes.
