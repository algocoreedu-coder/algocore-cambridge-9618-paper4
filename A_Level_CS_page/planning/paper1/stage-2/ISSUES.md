# Issues and risks — Paper 1 Stage 2 planning

Version 1.0. Date 22/09/2026. These are planned controls, not active production findings.

| ID | Risk / state | Required control / owner |
|---|---|---|
| S2-R01 | 99 `AC26-*` IDs are AlgoCore management IDs, not official Cambridge codes | A3 preserves official section/locator separately; A9 checks wording |
| S2-R02 | Parent/child atomization can double-count objectives | Parent PASS depends on child rows; validator counts required leaves once |
| S2-R03 | 128 unresolved may be mistaken for missing questions/marks | Exact disposition register; context-only, non-scoring, no marking claim |
| S2-R04 | Only 233/1.272 records have extracted command words | A4 reads prompt/context; null is not a classification |
| S2-R05 | 568/927 marking rows have null condition text; tables/visuals are common | Read MS locator/render; no row-to-mark or alternative inference |
| S2-R06 | Variant equivalence is unknown | Compare QP+MS; unresolved pairs quarantined; no similarity-only merge |
| S2-R07 | Holdout leakage in a shared workspace | Component-level split and author allowlist; label controlled/mixed if blindness cannot be preserved |
| S2-R08 | Coursebook first published 2019 may conflict with 2026 syllabus classification | Syllabus controls scope; A3 records actual pages and known flags |
| S2-R09 | Local source authenticity has no new remote certification | Preserve Stage 1 provenance limit; do not overclaim |
| S2-R10 | 78 derived files may look authoritative | Exclude unless separately audited; never substitute for QP/MS/syllabus |
| S2-R11 | Historical frequency may be treated as prediction | Report raw/paper/equivalence counts separately and prohibit predictive language |
| S2-R12 | Planned learning units may be described as finished lessons | State `PLANNED`; Stage 3 owns lesson/solution production |
| S2-R13 | Glossary seed may be mistaken for bilingual parity | A6 records term status; full VI/EN parity remains Stage 3+ |
| S2-R14 | Historic Stage 1 evidence notes S1-I14/I19/I20 | Carry as provenance notes; reopen corpus only on concrete source drift/error |
| S2-R15 | Candidate-pair generation can miss a duplicate/equivalent pair | Multi-channel universe, reproducible manifest, rejected-complement audit; false negative forces regeneration; quarantine uncertainty |
| S2-R16 | Pattern counts can be frozen before equivalence groups exist | Enforce provisional → equivalence → final rebuild dependency |
| S2-R17 | Glossary IDs can drift as objective/pattern IDs change | Freeze glossary v1 on authority only; mandatory v2 reconciliation after final IDs |

The planning risks above predate execution. Active findings created from dispatched artifacts are tracked below.

## Active execution findings

| ID | Severity | State | Artifact | Evidence | Owner / required action |
|---|---|---|---|---|---|
| S2-GLO-A3-001 | Major | CLOSED — A3 RETEST PASS | glossary-v1 → accepted candidate `glossary-v1-r1` | A3 review found substantive definitions marked source-verified where the cited syllabus only names the term | A6 corrected 69 rows; A3 retest confirmed no non-command row retains false source-verified status |
| S2-C1-A9-001 | Critical | CLOSED — A3 AND A9 RETEST PASS | calibration-v1 → accepted candidate calibration-v2 | A9 source review found neighbouring-question content bound to the frozen target IDs and marking IDs | A4 corrected both rows; fresh A3 checked 25/25 bindings and A9 retest passed with zero findings |
| S2-C2-B21-QA-001 | Minor metadata/QA | CLOSED IN v2 — SPECIALIST REVIEWS PENDING | B21-v1 → B21-v2 | v1 QA checked visual refs against the wrong corpus identity field; A0 found 59/59 exact matches against `id` | Same author issued v2 with semantic maps byte-identical and truthful QA; A0 validator PASS |
| S2-C2-B23-A3-001 | 2 Critical + 3 Major | CLOSED — A3 v2 RETEST PASS | B23-v1 → v2 | `evidence/a3/reviews/B23/v2-retest/` | A3 accepted fields remain stable through v3; later A4 correction does not reopen this line unless scope fields drift |
| S2-C2-B22-A4-001 | 3 Major + 1 Minor, then exact residuals | CLOSED — v4 FINAL RETEST AND A0 AUDIT PASS | B22-v2 → v3 → v4 | `evidence/a4/reviews/B22/v4-retest/`; `evidence/a0/c2/decisions/B22_ACCEPTANCE.json` | No batch work remains; A9 final still applies at Stage 2 gate |
| S2-C2-B23-A4-001 | 3 Major, one residual | CLOSED — v4 FINAL RETEST AND A0 AUDIT PASS | B23-v2 → v3 → v4 | `evidence/a4/reviews/B23/v4-retest/`; `evidence/a0/c2/decisions/B23_ACCEPTANCE.json` | No batch work remains; A9 final still applies at Stage 2 gate |
| S2-C2-B24-A4-001 | 4 Major across review/retest | CLOSED — v3 A4 PASS CARRIED TO ACCEPTED v4 WITH PROTECTED-FIELD PROOF | B24-v1 → v4 | `evidence/a4/reviews/B24/v3-retest/`; `evidence/a3/reviews/B24/v4-retest/`; `evidence/a0/c2/decisions/B24_ACCEPTANCE.json` | A9 final remains |
| S2-C2-B21-A3-001 | 1 Critical + 3 Major plus A4 3 Major and one retest residual | CLOSED — v4 A3/A4 FINAL RETESTS AND A0 AUDIT PASS | B21-v2 → v4 | `evidence/a3/reviews/B21/v4-retest/`; `evidence/a4/reviews/B21/v4-retest/`; `evidence/a0/c2/decisions/B21_ACCEPTANCE.json` | No batch work remains; A9 final still applies |
| S2-C2-B24-A3-001 | 1 Critical + 1 Major | CLOSED — v4 RETEST AND A0 AUDIT PASS | B24-v3 → v4 | `evidence/a3/reviews/B24/v4-retest/`; `evidence/a0/c2/decisions/B24_ACCEPTANCE.json` | No batch work remains; A9 final still applies |
| S2-C2-B25-A3-001 | 2 Critical + 1 Major + 1 Minor plus A4 5 Major | CLOSED — v2 A3/A4 RETESTS AND A0 AUDIT PASS | B25-v1 → v2 | `evidence/a3/reviews/B25/v2-retest/`; `evidence/a4/reviews/B25/v2-retest/`; `evidence/a0/c2/decisions/B25_ACCEPTANCE.json` | No batch work remains; A9 final and deferred metadata check still apply |
| S2-C2-B25-META-001 | Minor | DEFERRED — NON-GATING, CORRECT MACHINE ID PRESERVED | B25-v2 `ISSUES.md` | A4 retest notes text cites VC-B25-0021; `VARIANT_CANDIDATES.jsonl` and `QA.json` correctly use VC-B25-0041 | C3a uses ledger/QA; include in conflict report and A9 final check; do not mutate frozen twice-reviewed packet |
| S2-C3A-A3-001 | Major | CLOSED — aggregate-v2 FRESH A3 RETEST AND A0 AUDIT PASS | aggregate-v1 → accepted aggregate-v2 | Ten patterns merged 40 occurrences with different accepted requirement sets despite the declared exact merge key | v2 independently proves zero heterogeneous patterns; C3a accepted |
| S2-C3A-A3-002 | Major | CLOSED — aggregate-v2 FRESH A3 RETEST AND A0 AUDIT PASS | aggregate-v1 → accepted aggregate-v2 | Six exact declared keys were split across two patterns; reviewer reconstructed 504 groups vs 498 artifact rows | v2 independently proves 504 one-to-one deterministic keys; C3a accepted |
| A9-C3B-003 | Major | CLOSED — equivalence-v2 FRESH A9 RETEST AND A0 AUDIT PASS | equivalence-v1 → accepted equivalence-v2 | A9 confirmed six missed `PARALLEL_EQUIVALENT` edges; global generator `matched` set restricted every unit to one positive edge and fragmented three valid three-member groups | v2 restores exactly six edges, preserves four negative guards, yields 824 components with zero contradiction; C3b accepted by A0 |
| A4-GLO-V2-001 | Major | CLOSED — glossary-v2-r2 A3/A4/A9 PASS, A0 C3c PASS | glossary-v2 → accepted glossary-v2-r2 | A4 reviewed all 820 declared links and reconstructed 63 missing exact command-token pairs across nine command words; `TERM-CW-JUSTIFY` had four supported patterns but was marked no-link | r2 contains exactly 874 links, including all 63 supported additions and four Justify links; independent reviews and A0 validator reproduced closure |
| A4-GLO-V2-002 | Major | CLOSED — glossary-v2-r2 A3/A4/A9 PASS, A0 C3c PASS | glossary-v2 `TERM-VAL-CHECK-DIGIT` → accepted glossary-v2-r2 | A4 rejected nine qualifier-derived pattern links and six qualifier-only objective-evidence records; only `REQ-6.2-02-07` carries check-digit focus | r2 removed the nine links and six evidence records; all reviewers reproduced check-digit focus only at `REQ-6.2-02-07` |
| A3-C3C-GLO-001 / A4-GLO-V2-003 | Minor | CLOSED — clean UTF-8/control scans PASS | accepted glossary-v2-r2 `CONFLICTS_AND_BOUNDARIES.md` | Both reviewers found 15 corrupted intended token sites caused by ASCII controls and mid-token line feeds; structured glossary was not affected | r1/r2 regenerated the text; A3, A4, A9 and A0 scans report zero prohibited controls |
| A3-C3C-GLO-R1-001 | Minor | CLOSED — glossary-v2-r2 metadata corrected and independently retested | glossary-v2-r1 → accepted glossary-v2-r2 | A3 and A0 reproduced 28 rows changed across seven reconciliation fields, while r1 delta/QA reported 10; ten was only pattern-membership changed rows | r2 reports and reproduces 28 reconciliation rows, 10 membership rows, 18 metadata-only rows and 68 unchanged rows; semantic artifacts remain byte-identical to r1 |
| S2-C4B-TRACE-001 | Major | CLOSED — trace-v2 A4/A9 FULL RETESTS AND A0 GATE PASS | trace-v1 → accepted trace-v2 | A4 and A9 independently found 18 unauthorized PRIMARY associations on ten units plus one accepted SUPPORTING association also promoted to PRIMARY; A0 role validator reproduced 19 drifts across 11 units | trace-v2 preserves 893/893 roles exactly with 1,153 PRIMARY / 174 SUPPORTING and zero overlap/drift; fresh A4/A9 retests and A0 audits PASS |

## Final gate status — 23/09/2026

Fresh A9 final review and A0 audit found no open Critical, Major or Minor gate findings. All execution findings above are closed except `S2-C2-B25-META-001`, which remains a documented non-gating frozen metadata note; canonical machine artifacts preserve `VC-B25-0041`. Planning limits S2-R01–S2-R17 remain disclosure boundaries for later stages and do not block the Stage 2 planning/traceability gate. Current state: `STAGE2_PASS — WAITING_FOR_USER_STAGE_CHECK`.
