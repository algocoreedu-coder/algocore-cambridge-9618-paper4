# A8 Candidate QA — S5-0/P0

Decision: **REWORK_REQUIRED**

The independent run returned 20/20 PASS and exit code 0, but the pilot does not satisfy the locked Stage 5 evidence contract yet.

Required blockers:

- `A8-P0-001`: the locked fresh process/temp directory harness is not applied per fixture.
- `A8-P0-002`: five source anchors are metadata only; no executable anchor fixture rows or runs exist.
- `A8-P0-003`: failure preservation is not asserted field by field with the canonical snapshot serializer.
- `A8-P0-004`: visual event IDs are declared but are not mapped to actual run events.
- `A8-P0-005`: the both empty pair oracle is labelled official source authority despite being `AlgoCore_inference`.
- `A8-P0-006`: `P0_HASHES.json` is stale for `AUTHOR_RUN.json` and `A5_INDEPENDENT_RERUN.json` after the rerun.

The complete machine readable evidence is in `A8_CANDIDATE_QA.json`. A8 recommends a fresh review after all findings are closed and hashes are regenerated after artifact freeze.
