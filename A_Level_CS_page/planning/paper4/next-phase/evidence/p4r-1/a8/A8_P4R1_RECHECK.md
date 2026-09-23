# A8 independent recheck — P4R-1

**Decision: `PASS`**  
**Scope:** schema and mapping foundation for `paper4-2026-s9-v2`  
**Next wave:** the six-lesson P4R-2 pilot may proceed without a schema exception. Every pilot record must pass schema v2 and `validateRegistry`; this report does not sign a release.

## Gate result

The active P4R-0 revision-2 lock remains intact: all 51 immutable inputs match, the two governance files remain outside the immutable set, and the previous lock, inventory and exact-denominator references resolve by hash.

Schema v2 exposes all seven required artifact types. Its positive contract passes and all 11 negative fixtures are rejected with the expected reasons under both the host Node 20.11.0 and required Node 24.19.0. The base checker reports zero files in `content/paper4/records`; that is expected at this foundation gate because the six promoted P4R-1 products are explicitly mapping inputs rather than v2 record envelopes. The six pilot `PythonArtifact` records were therefore passed directly through the exported cross-record validator in a separate read-only probe.

The six mapping files and manifest pass all output/source hash checks. Two isolated generator runs were byte-identical and reproduced the canonical files exactly under each tested Node runtime. No canonical file was changed by the A8 harness.

## Exact count and identity

| Set | Result |
|---|---:|
| Knowledge blocks | 108/108 |
| Lessons | 26/26 |
| Python lesson dispositions | 26/26 |
| Visual patterns | 58/58 |
| Visual scenarios | 174/174 |
| Visual events | 331/331 |
| Marking atoms | 2,236/2,236 |
| Marking chains / pattern identities | 58/58 |
| Assessment requirements | 107/107 |
| Assessment destinations | 37/37 |
| Assessment items | 78/78 |

All 11 count checks, identity-set comparisons and manifest identity hashes pass. The 15 IDs assigned by A0 are present unchanged and retain `A0_LEAD_ID_NORMALIZATION` authority.

## Sources and authority

A8 independently resolved 142 objective references to 107 unique syllabus objectives, 121 coursebook references to 55 unique sections, and all 108 knowledge blocks to their locked Stage 3 sources. Core locator fields match the upstream records. The objective inventory itself matches its entry in the locked Stage 3 release manifest.

All 2,236 marking atoms retain QP and MS locators and the `official_ms` authority policy. All assessment requirements, destinations, items and self-rubrics retain `official_marks: null`. Every promoted mapping keeps the claim `MAPPING_INPUT_ONLY_NOT_RELEASE_CONTENT`; no mapping has been elevated to released Cambridge-authored content.

## Python and pilot contract

The P4R-1 map correctly keeps all 26 lessons at `RERUN_REQUIRED`, permits zero execution claims and records zero exact full-source Stage 5 matches.

The first A8 probe of the newly produced P4R-2 pilot found 108 schema violations across the six lessons. The records had file paths in stable run-ID fields, stale code hashes, non-canonical fixture/output shapes and the wrong coverage shape. This was an implementation divergence in P4R-2, so A8 retained the P4R-1 contract and returned the pilot artifacts for correction.

The closure recheck now passes:

- `validateRegistry`: 6/6 artifacts;
- schema shape: 6/6;
- exact source bytes: 6/6;
- author and independent evidence resolution: 12/12;
- normal, boundary and failure fixtures/reruns: 18/18;
- A8 probe under Node 20.11.0 and Node 24.19.0: zero errors.

This proves that the P4R-1 contract can open the pilot without an exception. It does not close the remaining 20-lesson Python production work.

## Required carryovers

The manifest keeps all recovery work visible:

- P4R-2 owns 26 Python reruns and exact evidence joins.
- P4R-3 owns 36 requirement-to-pattern gaps, six patternless lessons, 18 patternless practice items, 15 missing legacy prompts, 42 generic rubrics and 33 missing pass rules.
- P4R-4 owns 328 unmapped event labels, three event-type mismatches, 331 non-Python code bindings and 58 cloned scenario traces.
- Later academic review must retain 293 marking atoms with source issue references and 68 atoms without an unambiguous atom-level source mark value.

These are open production work items. They are not P4R-1 schema/mapping defects and have not been hidden or marked complete.

## Reproduction

From the `Computer_Science` workspace root:

```powershell
node A_Level_CS_page/planning/paper4/next-phase/evidence/p4r-1/a8/independent-recheck.mjs
npx -y node@24.19.0 A_Level_CS_page/planning/paper4/next-phase/evidence/p4r-1/a8/independent-recheck.mjs
node A_Level_CS_page/planning/paper4/next-phase/evidence/p4r-1/a8/pilot-schema-probe.mjs
npx -y node@24.19.0 A_Level_CS_page/planning/paper4/next-phase/evidence/p4r-1/a8/pilot-schema-probe.mjs
```

The detailed machine-readable decision is in `A8_P4R1_RECHECK.json`.
