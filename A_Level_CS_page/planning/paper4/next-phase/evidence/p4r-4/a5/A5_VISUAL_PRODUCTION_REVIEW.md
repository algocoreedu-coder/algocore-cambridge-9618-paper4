# A5 visual production review

**Decision: PASS — ready for independent A8 review; no gate signature is claimed here.**

The production visual set contains exactly 42 remaining official patterns and three scenarios per pattern: 126 `VisualScenarioTrace` records. Their independently rerun production-v1 executions produce 351 `VisualEventBinding` records. The checker reads all 20 production Python artifacts while allowing only the 14 lessons that own official patterns to create visual records. The six lessons with provisional cross-lesson associations remain excluded from pattern identity production.

Every event preserves the exact independent rerun trace event, binds existing line IDs in the matching production-v1 artifact, uses the controlled event vocabulary, carries non-empty before/delta/after/output state, and includes bilingual prediction, criterion, feedback, keyboard, focus and live-region metadata. Normal, boundary and failure signatures differ for all 42 patterns.

The migration disposition covers the exact remaining legacy set: 42 patterns, 126 legacy scenarios and 241 legacy event specifications. All legacy cloned traces, non-Python contract tokens and placeholder states are superseded by execution-backed records. Reused integrated execution paths include an explicit equivalence justification in every scenario record.

Both Node.js 20.11.0 and 24.19.0 passed the read-only checker. A second deterministic generation reproduced all 14 canonical visual files byte-for-byte with aggregate SHA-256 `7d1ad61977843fcd74ae91fe9206941773536f5f0a8cea79ae2e2aaf6af10775`.

Canonical outputs:

- `content/paper4/visuals/production/<slug>/visuals.json`
- `scripts/generate-p4r4-visual-production.mjs`
- `scripts/check-p4r4-visual-production.mjs`
- `PRODUCTION_VISUAL_MANIFEST.json`
- `MIGRATION_DISPOSITION.json`
- `LINE_BINDING_AUDIT.json`
- `A5_INDEPENDENT_CHECK_v20_11_0.json`
- `A5_INDEPENDENT_CHECK_v24_19_0.json`
- `DETERMINISM_CHECK.json`
