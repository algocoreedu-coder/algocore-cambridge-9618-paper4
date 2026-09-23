# A0 addendum — B22 A4 v4 dispatch hash erratum

Date: 2026-09-21. Frozen work order: `B22_A4_V4_RETEST_DISPATCH.md`, SHA256 `5607c31ac3e04fc4ac8245d1fd6495c9e4680a7b7aff140bcb82501b267508c4`.

The work order's B22-A2-v4 `BATCH_MANIFEST.json` pin contains a transcription error. It states `de2c9642d9d0687a67ee7452dc57e7c1c40780006f2f92e3c3c928f91858f9d4`. The correct SHA256 recomputed from the frozen candidate file is `de2c9642d9d0687a67ee7452dc57e7c1c40780006f2f92e2c3c928f91858f9d4`. The corrected digest is independently recorded in the already completed A0 audit `B22_A2_V4_A0_AUDIT.json`; the candidate's snapshot manifest and candidate handoff chain also verify this actual digest. The B22-A2-v4 HANDOFF_CHECK, SNAPSHOT_MANIFEST, A0 audit and A0 validator pins match; this erratum only corrects that one character in the work-order pin.

Reviewer direction: use `de2c9642d9d0687a67ee7452dc57e7c1c40780006f2f92e2c3c928f91858f9d4` for the frozen BATCH_MANIFEST input, retain the original work order unchanged, include this addendum as a pinned input, and record the erratum in the handoff. Candidate and source files remain immutable. No finding about candidate content is implied.
