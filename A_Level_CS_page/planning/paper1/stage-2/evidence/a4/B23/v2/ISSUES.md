# B23 v2 correction issues and boundaries

Artifact state: `AUTHOR_CORRECTION_COMPLETE_PENDING_INDEPENDENT_RETEST`.

## Findings addressed

- `B23-A3-001`: six mixed-route items are `PARTIAL`; every legacy route is exposed and quarantined.
- `B23-A3-002`: two adjacent historical demands are `NEEDS_REVIEW`, have no primary 2026 requirement and remain quarantined.
- `B23-A3-003`: DRAM selection traces were added; unsupported utility, backup and VGA claims were removed.
- `B23-A3-004`: every nested atomic row now includes its immediate parent part; zero omissions remain.
- `B23-A3-005`: all 14 recovered commands use direct-QP provenance with exact QP evidence.

## Remaining review dependencies

Independent A3 must retest the five findings. A different A4 must review marking/pattern semantics, A9 retains risk/final review, and A0 alone may accept the batch.

## Scope boundary

`NEEDS_REVIEW` rows and legacy answer routes do not provide 2026 requirement coverage or pattern-frequency evidence. Variant rows remain suggestions only.
