# Stage 2 C4a split policy — split-v1

Status: **AUTHOR COMPLETE — INDEPENDENT REVIEW REQUIRED**. This artifact creates procedural isolation only. It does not create or claim a blind holdout.

## Frozen inputs

The issued 49-file manifest `P1-S2-A2-SPLIT-v1_INPUT_MANIFEST.json` was rehashed byte-for-byte before analysis; 49/49 entries passed and the manifest SHA256 is `15a808c7e3f886a2c7f7238d49b58b0fdba063e461f894793332b548320fe4d3`.

The split uses all 893 accepted assessment units, 824 accepted equivalence components, 30 papers and 2,250 marks. Containers and unresolved-context records are outside the split population.

## Labels

- `AUTHOR_POOL`: components available to future lesson/item authors through `AUTHOR_ALLOWLIST.json` after A0 acceptance.
- `CONTROLLED_CHECK`: components reserved for later controlled checks. This is procedural isolation in a shared workspace, not blind holdout evidence.
- `QUARANTINE`: mandatory for an unresolved, quarantined, or unreviewed-likely component. The accepted frozen universe contains zero such relations/components, so split-v1 assigns zero units to this label.

## Deterministic method

Method version: `P1-S2-C4A-BALANCED-WHOLE-PAPER-1.0`.

1. Construct the paper graph from all accepted equivalence components; two papers are connected when one component contains units from both. This yields 23 indivisible paper-closure clusters from 30 papers.
2. Enumerate every cluster subset containing exactly six whole papers (20% of 30 papers, exactly 450/2,250 marks). There are 29,945 feasible subsets.
3. For each subset, calculate distinct-primary-requirement coverage, distinct-final-pattern coverage, and normalized L1 count error against a 20% corpus target for both dimensions.
4. Rank lexicographically by: maximize the lower of the two coverage ratios; maximize their sum; minimize the combined normalized L1 error; minimize requirement L1 error. Break an exact tie by the lexicographically smallest SHA256 of `P1-S2-C4A-SPLIT-v1|<comma-sorted-paper-ids>`.
5. Assign the chosen paper clusters to `CONTROLLED_CHECK`, all remaining resolved components to `AUTHOR_POOL`, and any mandatory quarantine to `QUARANTINE`.

## Selected controlled-check set

The unique winning set is:

- `9618_s23_qp_11`
- `9618_s24_qp_13`
- `9618_w23_qp_11`
- `9618_w23_qp_13`
- `9618_w25_qp_11`
- `9618_w25_qp_12`

Selection tie digest: `45272695d598576abc8ea2223428442cfb8c13c51641eea9f721cdc828b94600`. It contains 192 units, 192 equivalence components, 450 marks, 138/192 distinct primary requirements and 159/504 distinct final patterns. Component closure adds zero partial-paper units and zero extra papers. The result follows the recorded score, not a preselected year.

## Leakage interpretation

All 36,416 frozen candidate dispositions and all 72 accepted positive relations were recomputed. The 586-pair stratified complement audit was regenerated exactly and retained zero observed false negatives. No detected/reviewed positive, unresolved, or unreviewed-likely relation crosses a split.

The candidate universe and its 586-pair complement sample do not exhaustively prove that no possible false negative exists outside the reviewed universe/sample. `CONTROLLED_CHECK` is therefore the strongest permitted label. Future Stage 3 authors may receive only the author allowlist after A0 accepts this gate.
