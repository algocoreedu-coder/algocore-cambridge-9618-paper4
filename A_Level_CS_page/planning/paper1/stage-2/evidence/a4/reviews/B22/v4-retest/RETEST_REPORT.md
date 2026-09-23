# Independent A4 final closure retest - B22-v4

Review ID: `P1-S2-A4-RETEST-B22-v4`  
Reviewer: independent A4 marking/pattern reviewer, distinct from the B22-v4 correction owner  
Date: 22/09/2026  
Decision: **PASS**

## Decision basis

All five open or previously recorded A4 findings are closed. B22-v4 points `9618_w22_qp_11-q2` to `9618_w22_ms_11` PDF page 4 and `9618_w22_qp_13-q3` to `9618_w22_ms_13` PDF page 5, with the same corrections propagated into marking evidence and provisional pattern source evidence. Direct inspection of the official QP/MS pages confirms both matching tasks and their four-mark answer rows.

The three corrected command observations now follow the complete official prompts: `State` for `9618_s22_qp_13-q5-pai`, `Explain` for `9618_w22_qp_12-q6-pbii`, and `Identify` for `9618_w22_qp_13-q4-pc`. The corresponding provisional patterns expose exactly `State`, `Explain`, and `Identify`. No stale command word remains in the affected pattern metadata.

The four findings first raised against B22-v2 were rechecked as a complete closure set. The 44 unique affected targets resolve to 61 distinct declared official QP/MS pages, and machine-assisted comparison found no frozen source excerpt below the 0.78 token-coverage review threshold against the accepted page transcript. The five pages that directly establish the v4 corrections - two MS pages and three QP pages - were rendered from the frozen PDFs and visually inspected. The 22 response-product/cognitive-action repairs, five grouped or row-atomic marking repairs, corrected circuit variant `VC-B22-V3-0033`, removal of the former false endpoint pair, and normalized `5(b)(iii)` locator remain intact. The v4 delta did not alter their accepted semantics.

## Integrity and reconciliation

- The issued review manifest is 2459 bytes with SHA256 `f75e272a2fe5595062bb560bf54b56815f31e39254291dad0c7911e1deebf277`; all nine issued inputs match their declared bytes and hashes.
- All nine author output-manifest pins, the author handoff manifest pin, all nine handoff content pins, the correction dispatch manifest and all eight correction inputs rehash exactly.
- All twelve official 2022 source PDFs match the hashes frozen in the prior independent retest packet.
- The A0 validator returns `PASS` for `B22 --version v4`.
- Exact populations are 188 atomic units, 78 non-scoring containers, 188 scoring marking rows, 32 unresolved context-only rows, 135 provisional patterns and 107 variant suggestions. Displayed marks total 450; each of the six papers totals 75.

## Drift and derived-artifact checks

The v3-to-v4 delta is limited to five atomic targets, two marking targets and five pattern records named in the correction handoff. `CONTAINER_MAP.jsonl`, `UNRESOLVED_DISPOSITION.jsonl` and `VARIANT_CANDIDATES.jsonl` are byte-identical to v3.

Across all 188 atomic rows, the A3-accepted scope status, primary and supporting requirements, context dependencies and visual/table dependencies are unchanged from B22-v2. Response product and cognitive action are unchanged from v3. Marking conditions, alternatives, marks and marking behaviour are unchanged from v3; only the two cited locator/transcript bindings changed.

All 188 atomic units reconstruct exactly into 135 provisional patterns. Pattern membership, response product, cognitive action, observed command words, marking-behaviour summary, requirements, source evidence, occurrence count and paper count reproduce with zero mismatch. Independent regeneration of the cross-paper, same-pattern, marks-within-one candidate rule produces exactly the frozen 107 variant pairs, with no missing, extra or duplicate pair and no equivalence decision at C2.

## Stop

This reviewer records a specialist retest `PASS` with zero new Critical, Major or Minor findings. The reviewer did not edit or accept the B22 author packet and did not open downstream work. A9 and A0 decisions remain separate.
