# A9 independent review — split-v1

**Result: PASS.** This review independently reconstructed the accepted population, equivalence closure, deterministic whole-paper selection, complete relation/candidate space, seeded complement sample and author allowlist. The A0 audit was comparison evidence only.

## Frozen inputs

- Issued manifest `5455eca03f4b20be54b9d6a81a8bc615a631c8611ea78eb30e1f3ee7d7368cb7`: 62/62 files rehashed, zero drift.
- Author handoff `2c857fdb0ed14c699b0b9455ff980849d1db0bb3c5b1521519eebd13373b778f`: exact nine-file closure.
- Reviewer input manifest is byte-identical to the issued copy.

## Results

- 893 units and 824 components reconstructed from 72 positives; every unit occurs once and zero components cross the split.
- Source identities and pattern/requirement/group references resolve.
- AUTHOR_POOL: 701 units / 632 components / 1,800 marks. CONTROLLED_CHECK: 192 / 192 / 450. QUARANTINE: 0. Overall: 893 / 824 / 2,250.
- All 30 papers are whole 75-mark papers. From 23 closure clusters and 29,945 feasible sets, the declared six-paper set is the unique winner; digest `45272695d598576abc8ea2223428442cfb8c13c51641eea9f721cdc828b94600`; zero closure spill.
- Recomputed all 36,416 candidates and dispositions: 33,942 DISTINCT; 2,402 RELATED_NOT_EQUIVALENT; 60 PARALLEL_EQUIVALENT; 12 DUPLICATE. Rechecked all 72 positives; zero positive, unresolved or unreviewed-likely leakage.
- Regenerated the 361,862-pair complement, its exact 586-pair seeded sample and zero observed false negatives. The non-exhaustive limitation remains explicit.
- The author allowlist equals AUTHOR_POOL, excludes controlled/quarantine IDs and remains NOT_DISPATCHED_TO_A5.
- CONTROLLED_CHECK with procedural isolation is the only permitted claim; blind holdout and independent measurement are prohibited.

## Findings

No open Critical, Major or Minor findings.

## Recommendation

A9 recommends **PASS** to A0. A9 does not accept C4a, edit trackers, dispatch TRACE or begin downstream work.
