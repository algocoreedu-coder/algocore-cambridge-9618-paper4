# Stage 2 protocol freeze

Version 1.0. Owner A0. Frozen 22/09/2026 after C0 validation PASS.

This protocol applies only to Cambridge 9618 Paper 1 for the 2026 syllabus. Stage 2 produces planned traceability, objective and requirement maps, assessment classifications, pattern evidence, variant relations, split/holdout decisions, a terminology seed and learning-map planning. It does not produce lessons, complete solutions, bilingual lesson parity, visuals, application changes or publication artifacts.

## Authority and precedence

1. The 2026 syllabus determines examinable scope.
2. Frozen original QP/MS records and their locators determine historical question and marking evidence.
3. The coursebook supports explanation and sequencing; it cannot override syllabus scope.
4. Stage 0/1 derived artifacts may be reused only where they are pinned in `INPUT_BASELINE.json`.
5. `AC26-*` identifiers are AlgoCore management IDs, not Cambridge objective codes.

No worker may modify Stage 0 or Stage 1. A mismatch against the C0 baseline blocks the dependent package until A0 records a new version and review path.

## Ownership and review

- A0 owns the Stage 2 top level, dispatch packets, integration and gate decision.
- Each worker writes only to the allowlist in its issued work order and may not spawn agents.
- Every artifact is frozen with an output manifest and handoff before review.
- A reviewer may not edit the author artifact or review an artifact they authored.
- Critical or Major findings block downstream work. Corrections use a new version and independent retest.
- Self-reported completion and filenames containing `approved`, `final` or `pass` are not acceptance evidence.

## Evidence boundaries

- The 128 unresolved records stay `CONTEXT_ONLY`; they cannot become assessment units, marking claims, pattern occurrences or scores.
- A non-scoring container cannot be counted as an atomic unit or add marks.
- Historical counts remain descriptive and cannot be presented as predictions.
- Coursebook locators must name pages actually checked; otherwise use `NO_VERIFIED_BOOK_SUPPORT`.
- `OUT_OF_SCOPE` and `NEEDS_REVIEW` units are not forced into a 2026 objective. They require a source-backed rationale and quarantine.
- Original assessment briefs remain plans and must be labelled AlgoCore; Stage 2 does not write full questions, answers or rubrics.

## Dependency gates

Full B21–B25 mapping remains closed until A3 foundation and A4 calibration both pass independent review. Provisional patterns precede equivalence; the equivalence author must differ from the provisional/final-pattern author. Final pattern counts are rebuilt from frozen equivalence groups. Split/holdout precedes TRACE. A fresh A9 reviews the final integrated packet; only A0 decides the gate.

After A0 records `PASS` or `CHANGES_REQUIRED`, all agents stop and state becomes `WAITING_FOR_USER_STAGE_CHECK`. Stage 3 cannot be dispatched without a new user instruction.
