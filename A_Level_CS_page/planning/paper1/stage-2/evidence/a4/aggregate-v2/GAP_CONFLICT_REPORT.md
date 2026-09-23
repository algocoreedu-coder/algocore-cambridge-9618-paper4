# C3a aggregate-v2 correction report

State: AUTHOR CORRECTION FROZEN; fresh independent A3 retest and A0 decision required.

## Corrected partition

The partition was rebuilt from each occurrence's exact accepted candidate row. A nonempty canonical key contains the sorted unique accepted candidate primary requirement IDs, response product, and cognitive action. An empty requirement set also contains the exact accepted source-pattern identity. Canonical keys are serialized as UTF-8 JSON, sorted lexicographically by bytes, and assigned IDs PAT-C3A2-0001 through PAT-C3A2-0504.

The result has 893 occurrences and exactly 504 one-to-one canonical-key patterns. Every definition names the complete requirement key shared by its occurrences. All patterns remain PROVISIONAL_PRE_EQUIVALENCE / NEEDS_REVIEW with null equivalence-group count and PENDING equivalence state.

## Findings closed for retest

- C3A-A3-MAJ-001: the ten heterogeneous v1 patterns and their 40 occurrences were reproduced from frozen evidence. V2 has zero patterns containing more than one canonical key.
- C3A-A3-MAJ-002: the six v1 keys split across two patterns were reproduced. V2 has exactly one pattern for every canonical key.

## Protected union

The correction retains 893 atomic units, 379 non-scoring containers, 128 unresolved context-only rows, and 927 marking rows (893 scoring plus 34 B21 context). The corpus remains 2,250 marks across 30 papers at 75 each. Parsed source_record values for all accepted C2 atomic, container, unresolved, and marking rows are unchanged.

Grouped, capped, threshold, row-atomic, and structural marking conditions remain intact. No parent, container, unresolved row, or B21 parent-context marking row becomes scoring or a pattern occurrence.

## Deferred metadata

The frozen B25-v2 ISSUES.md documentation typo names VC-B25-0021. The controlling variant ledger and QA identity remains VC-B25-0041, which this correction carries without changing B25.

## Stop boundary

No equivalence, final ESTABLISHED/SINGLETON decision, forecast, split/holdout, glossary reconciliation, traceability integration, lesson, translation, app, or Stage 3 work is included. C3b remains blocked pending fresh A3 retest and A0 acceptance.
