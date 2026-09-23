# S8-A runtime registry lead candidate

Status: **PASS candidate**, pending A0/Lead review.

The A1/A4 implementation aggregates the four Stage 7 visual event specifications into the runtime registry at `A_Level_CS_page/algocore-fumadocs/app/data/stage8-runtime-registry.json`. The registry preserves the Stage 7 batch, source path, source SHA-256, and JSON pointer locator on every pattern and event. Three deterministic scenario descriptors (`normal`, `boundary`, `failure`) reference each pattern's ordered event chain without duplicating event records.

Validation commands run from `A_Level_CS_page/algocore-fumadocs`:

```text
node scripts/build-stage8-registry.mjs
node scripts/verify-stage8-registry.mjs
```

Both commands completed successfully. The verifier wrote `S8A_SELF_VALIDATION.json` with no findings, matched all four source hashes, confirmed deterministic rebuild output, and rejected an in-memory mutation fixture with an unknown scenario event reference.

| Contract | Result |
| --- | ---: |
| Patterns | 58 |
| Scenarios | 174 |
| Unique events | 331 |

Locked inputs verified:

- release: `paper4-2026-s7-v1`
- Stage 7 handoff SHA-256: `a2ee707670513960980e610058dbd82dafa8f0d10ce8f7781e02d76e5ecb49df`
- Stage 7 manifest SHA-256: `3ed03798f614b22307e07034ec36326af13cda58fd68dc6fd65dd3feb73cb01f`
- registry SHA-256: `4a5a9b154d2b1de8197d42c7c900e2cd738238ddaddac9842ccd40246e2ffc34`

The package manifest was left unchanged. Stage 0–7 artifacts were read-only; this candidate does not claim Stage 8 UI verification or create a final release manifest/gate review.
