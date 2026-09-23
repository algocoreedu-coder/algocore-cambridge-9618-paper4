# P1-S1-A9-B22-RETEST-V5 — Independent batch review

Status: READY_FOR_DISPATCH. Owner: A9 independent reviewer. Stop after a frozen PASS/CHANGES_REQUIRED recommendation; A0 alone decides the batch gate.

## Frozen inputs

- Candidate: `evidence/a2/B22/versions/B22-A2-v5/`.
- Candidate handoff SHA256: `93dd40c9fe8172d07df01be9e9134ef3893ea1e29bd4f2a0b2524e37968c485e`.
- Candidate batch manifest SHA256: `adf4f8fd9a465aac4dee9bd52e9b39ea15ca3a541757dc7d42acf0592402bfd3`.
- Candidate snapshot manifest SHA256: `85dbffa1e2068b3baa49cd8cf99e0a6ed0729f2c10bae7438424babd14dd744a` (420 entries).
- A0 candidate audit SHA256: `e00c6233efe0de36565456dffe9d3c59263aee75292c0614f1e469b7b2f62ca5`.
- A3-v5 handoff SHA256: `a85c4bab71fa0343c64e40295923b9a387c5bd74593eace9f46d427dca4667b9`.
- A0 A3-v5 audit SHA256: `766f3c8a02995f14ab706a909aa649ce0a1c977924b47ea856cac7d961058cd2`.
- A4-v5 handoff SHA256: `843cbbbe8d312a7fbdc0943ae92f34f9c2338215e0eca9c73a145ebe1a07ee3a`.
- A0 A4-v5 audit SHA256: `adaa34ddf2c035fb92502fcea1aa3d3b19be939bbd8d25b62502f90fa71c891c`.
- Original B22 source PDFs and Stage 0 hashes are authoritative and read-only.

## Write allowlist

Write only `A_Level_CS_page/planning/paper1/stage-1/evidence/a9/B22/retest_v5/`. Do not edit candidate, specialist evidence, trackers, source PDFs, app code, lessons, or translations.

## Required review and outputs

Produce `BATCH_REVIEW_V5.md`, `FINDINGS_V5.json` or `FINDINGS_V5.md`, an input/output hash manifest, independent source-render evidence, integrity/cross-reference checks, and a frozen `HANDOFF_RETEST_V5.json` with checksum.

Independently verify:

- all 12 source hashes and 166 pages; all 420 candidate snapshot entries;
- six QP totals of 75, seven corrected marks, twelve corrected nested locators, and exact QP/MS hierarchy;
- W22/13 Q6(b)(iii) uses source token `(iii)` at QP PDF page 13;
- the explicit count meanings: 19 correction rows, 18 corrected records, 11 correction-row pages, 12 changed-visual pages, 6 covers, 7 overlaps, 22-page union, 18 legacy assets (17 in union plus one outside), and 5 new renders;
- all 22 review-union source/render pairs at full-page scale plus a reduced-scale screen of every source page;
- 188 marking items, 32 explicit unresolved parent containers, 104 visual dependencies, 88 regions, source/transcript provenance, and absence of dangling IDs;
- the protected corpus indexes remain byte-identical to v4 and the v4-to-v5 delta stays within the metadata/evidence allowlist.

Sample every risk class and report each finding with exact locator, severity, owner, and retest. Do not treat A3/A4 self-reports as proof; pin and inspect their artifacts. Do not silently fix the corpus.

## Acceptance and stop point

Recommend PASS only if the whole B22 v5 batch meets the Stage 1 batch gate and no Critical/Major finding remains. Minor deferral requires evidence that it cannot make the corpus inaccurate plus owner/retest. Freeze the exact review version and stop for A0 audit and batch decision.
