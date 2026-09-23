# P4R-1 A4 — canonical schema and validator review

**Decision:** `PASS` for the schema foundation.  
**Release:** `paper4-2026-s9-v2`  
**Runtime impact:** none; Stage 8/9 registries and application runtime were not changed.

The P4R-0 input lock is signed. A4 therefore promoted the seven-record draft into a canonical `2.0.0` typed-envelope contract at `algocore-fumadocs/content/paper4/schema/paper4-v2.schema.json`.

The contract covers `KnowledgeUnit`, `PythonArtifact`, `VisualScenarioTrace`, `VisualEventBinding`, `LessonReleaseRecord`, `MarkingChain` and `AssessmentItem`. It requires stable IDs, shared bilingual structure, ordered and uniquely identified Python lines, exact source hashes, shaped fixtures and outputs, precise source locators, explicit authority and the assessment disclosure contract.

`scripts/check-paper4-v2-schema.mjs` exports two read-only APIs:

- `validateEnvelope(envelope)` checks one typed canonical record.
- `validateRegistry(documents)` checks individual records plus cross-document joins.

Cross-document checks resolve exact Python artifact versions, fixtures, expected outputs, execution evidence, event sequences and active line IDs. They also join lesson releases to knowledge, Python, marking and assessment records, and join assessment requirements back to a marking chain for the same lesson and pattern.

## Negative proof

Eleven fixtures were rejected with their exact expected error sets:

1. duplicate Python `line_id`;
2. duplicate Python line order;
3. missing VI/EN locale;
4. unresolved source locator;
5. stale artifact version;
6. invalid event-to-line binding;
7. hidden-answer disclosure violation;
8. forged Cambridge authority;
9. stale code SHA-256;
10. unresolved fixture/output join;
11. unresolved execution evidence.

## Read-only proof

`npm run check:paper4-v2-schema` ran twice with exit code `0`. Both outputs were byte-identical. The validated tree digest remained `78e5fe63114396193baaad58edefb721e199dc85d64ab6c32bd3ca5f8d91688d`, and Git status did not change between runs.

## Carryover

No authored canonical records exist under `content/paper4/records/` yet. This is expected until A1 promotes the reviewed source maps and lesson records. The checker already discovers that directory recursively and will validate all envelopes and joins when promotion occurs; this A4 pass must not be interpreted as content or release approval.
