# Source caveat carryover - A8 rework response

Status: **RESUBMITTED - VALIDATION PASS**

## Required corrections applied

- Rebuilt the canonical carryover from the current three batch submissions.
- Removed `S4-S2-LAYOUT-CODE-FIDELITY` from the source issue set and did not restore its former 304 per-part pseudo-occurrences.
- Preserved that content once as batch policy `S4-S2-POLICY-LAYOUT-CODE-FIDELITY`, with `is_source_issue=false` and `per_part_source_issue_refs=false`.
- Incorporated the new 2025 risk `S25-41-MS35-INIT` at `9618_s25_ms_41`, PDF page 35.
- Retained both Lead adjudications as resolved and kept unresolved source decisions at zero.
- Strengthened validation so every retained source locator has a non-empty page list, a source ID in the frozen Stage 1 manifest, and page numbers within that source's page count.

## Authoritative counts

| Batch | Stable issue IDs | Occurrences |
|---|---:|---:|
| S4-S1, 2021-2022 | 14 | 27 |
| S4-S2, 2023-2024 | 5 | 29 |
| S4-S3, 2025 | 6 | 6 |
| **Total** | **25** | **62** |

The 62 occurrences affect 61 distinct parts. All 25 stable issue IDs retain explicit Stage 5 obligations. One batch fidelity policy is carried outside the issue/occurrence denominator.

## Validation and reproducibility

- `validate_source_caveats.py`: **PASS, 28/28 checks**.
- A second builder run produced the same JSON and Markdown hashes, confirming deterministic generation from the locked inputs.
- `SOURCE_CAVEAT_CARRYOVER.json`: `ce6679219bc092c2c4054eb8f6f9528edecd3a3f577410f0f41fb614ba7763ef`
- `SOURCE_CAVEAT_CARRYOVER.md`: `64cc372719a1db6411877f1777c3b8b601e3b8b91f67616f7f3952fdb1748101`
- `SOURCE_CAVEAT_VALIDATION.json`: `cfc871aae735d082291c7d398a64a09fc70718e9aff717ea37e5c3d34619c771`
- `build_source_caveats.py`: `f21d219fe23d923052517ac1673f72d397119aaca015546c5262cc066b394b17`
- `validate_source_caveats.py`: `022e00fee61a8be346b9a74108a83d103a36260c13cd40d34c9694da677d1a23`

No Stage 0-3 file or agent evidence submission was edited during this rework.
