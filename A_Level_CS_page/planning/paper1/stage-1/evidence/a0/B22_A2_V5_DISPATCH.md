# A0 dispatch — B22 A2 v5 evidence-metadata correction

Date: 2026-09-21. Task: `P1-S1-A2-B22-V5`. Owner: A2 author. State: DISPATCHED.

## Frozen inputs and write boundary

- Candidate to supersede: `evidence/a2/B22/versions/B22-A2-v4/`; handoff SHA256 `3a83c90b96ec7166e8187ee37c71db1b700f14cc10b4aec6fabc5db57beb0164`; batch manifest SHA256 `de2c9642d9d0687a67ee7452dc57e7c1c40780006f2f92e2c3c928f91858f9d4`; snapshot manifest SHA256 `74b65bdc167d33fe716755afcbe2d1fe21242c708b44bb7a2f50f6e7f494d02e`; correction evidence SHA256 `205a246f4f05bbfb0573678e5f58b14c9f0169c86869698e942482c417978626`.
- Candidate A0 validator/audit SHA256: `c0dcfebe4be4e4880bf459abf40991d0f29b67527e8da629e5e88ad00a0074a7` and `ca763bf550aa4526b04f97fccd8fceb7318b9872a508ca619633ce17afe6910d`.
- A3 v4 report/findings/handoff SHA256: `a15326d5a2ab15917e76908942124882fc629042a67f88f809d5e45c52124e07`, `a7cad28426d9b24cb217cec38aef31d29516262870e5b2d9dc5f7d9a0b54d3bf`, `84eb0edb3488586a1f31bae5fd08e9e44b690be224b6115d852dec38c855c1a7`; A0 A3 audit SHA256 `cba4b80390cda9e51852f6702d75eaf17cad603970f7f93719e2d6b89b3b292f`.
- A4 v4 report/findings/handoff SHA256: `faf31cb4bf56f763f970967b855e43e2a86ddc22092d8d5666655afdfa091def`, `acb876f36d2d918a9d80cde8818ccf27cf5a93035e50de292b6bc22751de5407`, `40e891f892c83e1e4b258eb625d173f2e7250d648da98597e3c1fce0dbf05a32`; A0 A4 audit SHA256 `921f8293b27965641a855170bc72f1bac2420120c47f2a5535939389a4c0281a`.
- Authority/policy: Stage 0 source manifest SHA256 `195a68ad98b4739dff0d3496dc93ba9e85d67d2dae0d88e3d4e4a088f1259c9c`; schema SHA256 `9fe71d4719b0c8f9fd6d6fd6fb0316c7f9a840b6b964634889ea6d98245a1f1f`; extraction policy SHA256 `97bd6c69ea8d459ea99713e943c2d092a88999b6df7cb315d2820547789c11f2`.
- Source PDFs are the exact 12 B22 QP/MS originals pinned in Stage 0 and the v4 handoff. Rehash them and confirm 166 pages before editing derived evidence.
- Write only a new `evidence/a2/B22/versions/B22-A2-v5/`. That path must not exist before work starts. Keep v1–v4, active-root artifacts, reviewers' evidence, trackers, app, lessons and translations read-only.

## Exact correction scope

Create v5 by copying the complete frozen v4 packet, then correct only the two evidence-metadata findings jointly confirmed by A3 and A4:

1. In `CORRECTION_EVIDENCE.json`, row `9618_w22_qp_13-q6-pbiii` must record the source-visible final label token as `(iii)` or an equivalently exact normalized field value that unambiguously represents `(iii)`. The original W22/13 QP PDF p.13 and the pinned transcript are controlling. Keep its QP locator at PDF p.13. Do not change question hierarchy, prompt transcript, displayed mark or MS mapping.
2. Replace the ambiguous page-count meaning. The packet must separately and truthfully state: 19 correction rows covering 18 distinct records; 11 unique source pages occupied by those correction rows; 12 changed visual-region source pages; six QP cover pages; seven correction/region overlaps; a 22-page deduplicated expanded review union; and 18 legacy v4 correction-render assets consisting of the 11 correction pages, six covers and one supplementary S22/12 p.16 page. Do not label the 18 assets as unique correction source pages.

Provide a v5 review-union manifest that enumerates all 22 required `(source_id, pdf_page_1_based)` pairs and their roles. Every listed page must resolve to a source-backed render. Existing valid candidate renders may be reused byte-for-byte when their source/page identity and hash are pinned; add new v5 evidence renders only for union pages not already represented in the dedicated set. Keep any supplementary page explicitly outside the 22-page union.

The seven corrected displayed marks, twelve corrected nested QP locators, all six 75-mark sums, 32 unresolved parent-container links, 188 marking items, 104 visual dependencies, 88 visual regions and all question/context/index data must remain unchanged from v4 unless manifest/hash metadata must change because of the new evidence files. Preserve the six whole-question targets. Do not infer marks, locators, parent links or coverage.

## Deliverables, acceptance and stop

Update correction/revision/QA documentation and rebuild a consistent batch manifest, handoff and snapshot manifest for `B22-A2-v5`. Include a machine-readable v4-to-v5 semantic diff proving that corpus/index files are byte-identical and that only the two evidence metadata findings plus necessary manifest/documentation/render-set files changed. Run `scripts/validate_batch.py`; independently recompute all six totals; verify all 12 source hashes/page counts; freeze every input and output hash.

This A2 work ends at an immutable candidate handoff. A0 validation/audit, same-version A3 and A4 v5 retests, A9 independent batch review and A0 batch decision remain mandatory. Do not claim B22 acceptance.

Freeze `HANDOFF_CHECK.json` and `SNAPSHOT_MANIFEST.json`, then stop and report their exact SHA256 values to A0. Do not edit v5 after handoff.
