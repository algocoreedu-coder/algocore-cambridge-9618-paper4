# P4R-2 A6 bilingual, accessibility and UX review

## Decision

**PASS** for the canonical content layer. The current six-lesson pilot contains 26 KnowledgeUnits, six Python artifacts, 48 visual scenarios, 238 visual events and 18 assessment items. The same independent A6 checker returns PASS on Node 20.11.0 and Node 24.19.0.

A6 does not sign the Lead gate or release. Browser-level keyboard, screen-reader, 320 px, 400% zoom, light/dark, reduced-motion and copy-interaction testing remains a separate later gate.

## Evidence

| Area | Result |
|---|---:|
| VI/EN pairs | 2,658/2,658 valid; 0 missing; 0 identical prose pairs |
| Controlled `binary search` terminology occurrences | 8/8 consistent |
| Copyable Python source | 6/6 ordered line collections reconstruct the source |
| Python source hash | 6/6 exact |
| Knowledge → code identity | 26/26 |
| Visual → artifact/version/line/trace identity | 238/238 |
| Knowledge hidden-answer contract | 26/26 |
| Assessment disclosure contract | 18/18 |
| Assessment shared code/fixture/output/trace identity | 18/18 |
| Bilingual event criterion | 238/238 |
| Bilingual assessment expected artifact | 18/18 |
| Explicit bilingual accessibility contract | 238/238 |
| Unique contiguous event-relative focus sequence | 238/238 |
| Local path leaks / insecure remote references | 0 / 0 |

The A7 assessment result was also read as a cross-check: PASS for 16 MarkingChains, 406 marking atoms and 18 AssessmentItems, with zero registry or checker errors.

## Runtime matrix

The following existing read-only checks passed on both Node runtimes:

- `scripts/check-paper4-v2-schema.mjs`
- `scripts/check-p4r2-theory-pilot.mjs`
- `scripts/check-p4r2-python-pilot.mjs`
- `scripts/check-p4r2-visual-pilot.mjs`
- `evidence/p4r-2/a6/check-a6-content.mjs`

Node 20.11.0 and Node 24.19.0 produced identical A6 counts and zero hard findings. Node 24 remains the package-supported runtime; Node 20 was included only as a compatibility observation requested by the work order.

## Closed findings

1. **`A6-VISUAL-CRITERION-LOCALE` — CLOSED.** All 238 event criteria changed from one English string to required `{vi,en}` content.
2. **`A6-ASSESSMENT-EXPECTED-ARTIFACT-LOCALE` — CLOSED.** All 18 expected-artifact descriptions changed from a mixed-language string to required `{vi,en}` content.
3. **`A6-VISUAL-A11Y-CONTRACT` — CLOSED.** All 238 events now define bilingual accessible labels, action descriptions, keyboard instructions and polite live-status messages, plus a typed interaction role and stable focus target/order.
4. **`A6-TERMINOLOGY-MISMATCH` — CLOSED.** Four field occurrences across three learner records now use the established Vietnamese term `tìm kiếm nhị phân`.

## Reproduction

Run from `A_Level_CS_page/algocore-fumadocs`:

```powershell
node ..\planning\paper4\next-phase\evidence\p4r-2\a6\check-a6-content.mjs
& 'C:\Users\Nguyen\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' ..\planning\paper4\next-phase\evidence\p4r-2\a6\check-a6-content.mjs
```

Machine-readable results are `A6_CONTENT_CHECK_NODE20.json`, `A6_CONTENT_CHECK_NODE24.json` and `A6_FINAL_REVIEW.json` in this directory.
