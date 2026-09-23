# P1-S1-A9-B21-RETEST-V6 — Independent batch review

Status: READY_FOR_DISPATCH. Owner: A9 independent reviewer. Stop after a frozen PASS/CHANGES_REQUIRED recommendation; A0 alone decides the batch gate.

## Frozen inputs

- Candidate: `evidence/a2/B21/versions/B21-A2-v6/`.
- Candidate handoff SHA256: `9719395a5daf02b0a3aa37fdb54b4bf28e4eabeb4bc3da76e05d2ddaeff96c33`.
- Candidate batch manifest SHA256: `626f136e1ad3ba1b86191b9a2182892d326c69259408b53cb7a6b85bd8b1ba8e`.
- Candidate snapshot manifest SHA256: `fe0563b881affd4dc8d25ac2f3bd22fe0bec4a9e586cf6c5b5b3206a427b2117` (313 entries).
- Candidate v5-to-v6 semantic diff SHA256: `d33e8037bad3e0e576c8e25858490797011e7e5f7d367a6675f7d0b514962b7d`.
- A0 candidate audit SHA256: `8b7fffc4337f70f8abc6a662578686df88d18bd1174d317bbfda99b266e30652`.
- A0 candidate validator result SHA256: `9b6a0792ffd4032d22c672272c45662f6c0f0ff162162fbd550730ab741e0c15`.
- A3-v6 handoff SHA256: `8eade15a864597950e87db32f942555b154e9e4df723335e54b197a9846c9740`.
- A0 A3-v6 audit SHA256: `829c7fdba82caa5f52c1a57bbc6a39902cbedb87c7a520b99cdedac3e27a1f94`.
- A4-v6 handoff SHA256: `acbd08cc2be6a12dba0183b161274d11948ece217e1999fe259ef52141aaaf55`.
- A0 A4-v6 audit SHA256: `acbdf7810d24476890c85a4bd2ea7bccaad1d4149f63401e934a4b9bec4c0e4e`.
- Prior A9-v5 handoff SHA256: `acecb8f4f383eb7283eee86a31a2abed35933564a8f37acd80eff55dbe1d7f34`.
- Prior A9-v5 findings SHA256: `e06d87ff05d475790b0d4a68d389128039d325356803e81a8ba214fbb4ad41d9`.
- Original B21 source PDFs and Stage 0 hashes are authoritative and read-only.

## Write allowlist

Write only `A_Level_CS_page/planning/paper1/stage-1/evidence/a9/B21/retest_v6/`. Do not edit candidate, specialist evidence, trackers, source PDFs, app code, lessons, or translations. Do not spawn another agent.

## Required review and outputs

Produce `BATCH_REVIEW_V6.md`, `FINDINGS_V6.json` or `FINDINGS_V6.md`, an input/output hash manifest, independent source-render evidence, integrity/cross-reference checks, and a frozen `HANDOFF_RETEST_V6.json` with checksum.

Independently verify:

- all 12 source hashes and 154 pages; all 313 candidate snapshot entries;
- regression `A9-B21-CTX-01`: `9618_s21_qp_12-q8` has only page 14, `9618_w21_qp_11-q8` only page 15, and `9618_w21_qp_13-q8` only page 15; Q8 must not claim the following BLANK PAGE or imprint page;
- legitimate multi-page context remains attached to its owning Q7/Q8 records where the source supports it;
- `9618_w21_qp_12` Q1 root mark and exact QP/MS linkage remain correct;
- six QP totals independently sum to 75;
- 48 question roots, 205 part records, 208 marking items, 34 explicit unresolved parent-context rows, 77 visual regions, source/transcript provenance, and absence of dangling IDs;
- the physical v5-to-v6 delta is exactly 10 changed, 3 added, 0 deleted and 301 unchanged files, with 310/310 v5 snapshot files preserved unless explicitly changed;
- all prior A9-v5 risk classes and the corrected pages using full-page source renders, plus a reduced-scale screen of every source page;
- the semantic-diff metadata caveat: three added rows also appear in the field named `changed_existing`; assess its gate impact independently and do not infer the physical delta from that field name alone.

Sample every risk class and report each finding with exact locator, severity, owner, and retest. Do not treat A3/A4 self-reports as proof; pin and inspect their artifacts. Do not silently fix the corpus.

## Acceptance and stop point

Recommend PASS only if the whole B21 v6 batch meets the Stage 1 batch gate and no Critical/Major finding remains. A Minor may be deferred only with evidence that it cannot make the corpus inaccurate plus a named owner and retest/closure condition. Freeze the exact review version and stop for A0 audit and batch decision.
