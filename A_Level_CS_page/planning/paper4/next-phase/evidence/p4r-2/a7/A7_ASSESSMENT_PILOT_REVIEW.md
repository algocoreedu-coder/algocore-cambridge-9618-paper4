# P4R-2 A7 assessment and marking pilot review

**Recommendation:** `PASS_TO_LEAD_A8_GATE`  
**Gate signature:** none — A7 does not sign the Lead/A8 gate.

## Delivered canonical records

- 16 `MarkingChain` envelopes covering the exact 16 pilot patterns.
- 406 context-bound QP/MS atoms; 91 retain explicit source caveats.
- 18 `AssessmentItem` envelopes: exactly three per lesson (`guided`, `faded`, `independent`).
- 18/18 `expected_artifact` fields satisfy the strict non-empty `{vi,en}` contract.
- All nine A0 IDs for queue, recursion and hashing remain unchanged.
- Every practice rubric is AlgoCore-authored and keeps `official_marks=null`; no new Cambridge mark allocation was asserted.

## Validation

`node scripts/check-p4r2-assessment-pilot.mjs` returned `PASS` on the latest A2/A3/A5 artifacts:

| Check | Result |
|---|---:|
| KnowledgeUnits | 26/26 |
| PythonArtifacts | 6/6 |
| Pilot patterns / MarkingChains | 16/16 |
| Visual scenarios | 48/48 |
| Visual events | 238 |
| AssessmentItems | 18/18 |
| Bilingual `expected_artifact` | 18/18 |
| A0 IDs retained | 9/9 |
| `validateRegistry` errors | 0 |
| A7 checker errors | 0 |

The builder was run twice and produced byte-identical canonical output hashes. The final assessment registry hash is `ccc6916f7089f3d0bd98f6111b10b7bd9b37fa36962a52257632d40ebebb803f`.

The final checker also pins the current Python and post-A6 visual hashes in `CHECK_RESULT.json`. The six current visual hashes begin `9ba6e82f`, `53d6c92c`, `1bf90d75`, `d3149d7b`, `7d57a803`, and `ee20dbd4`; these are the records used by the zero-error registry result.

## Authority and caveat review

Each marking atom keeps its original source identity in `locator.bullet_locator`, the MS source and first PDF page as the primary locator, and the corresponding QP source/page/requirement in `anchor_text`. Criterion text states that it is a context-bound editorial paraphrase. Disposition, award semantics, group/dependency data and source-issue references are retained where present.

All 16 chains explicitly prohibit adding their atoms into a newly inferred mark total. New lesson exercises use an AlgoCore self-rubric and never present it as Cambridge marking authority.

## Learning-flow review

The complete pilot registry validates the intended chain:

1. **Theory:** every lesson resolves 3–6 canonical KnowledgeUnits.
2. **Python:** every lesson resolves an executed PythonArtifact.
3. **Trace:** every pattern resolves normal, boundary and failure execution-backed traces.
4. **Avoiding lost marks:** every pattern resolves an error reference, detection check and repair check.
5. **Practice:** each prompt names concrete work, joins only prompt-proven requirement/pattern pairs, references canonical code/fixture/output IDs, and defines expected evidence, hint, feedback and a specific pass rule.

Guided tasks use normal evidence, faded tasks remove support and use boundary evidence, and independent tasks require actual normal/boundary/failure outputs plus assertions. This progression is present for all six lessons.

## Lesson results

| Lesson | Knowledge | Patterns | Atoms | Scenarios | Events | Practice | Result |
|---|---:|---:|---:|---:|---:|---:|---|
| data-models | 6 | 4 | 78 | 12 | 36 | 3 | PASS |
| binary-search | 3 | 1 | 34 | 3 | 15 | 3 | PASS |
| queue | 5 | 5 | 149 | 15 | 95 | 3 | PASS |
| recursion | 5 | 1 | 14 | 3 | 11 | 3 | PASS |
| hashing | 4 | 4 | 24 | 12 | 72 | 3 | PASS |
| object-files | 3 | 1 | 107 | 3 | 9 | 3 | PASS |

There are no A7 blocking findings. The 91 caveated atoms remain advisory evidence that reviewers must open the cited QP/MS for the original context. Lead/A8 must independently verify current hashes before signing the pilot gate.
