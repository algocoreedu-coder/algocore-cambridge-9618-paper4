# Lead mapping review — P4R-1

**Wave status:** `ACTIVE`  
**Gate status:** `NOT_READY`

## Knowledge and source decisions

Lead accepts the preservation-first disposition for all 108 Stage 3 knowledge blocks: each remains a separate `publish` unit. No block is merged, excluded or reduced to a prerequisite link in P4R-1. This decision preserves every stable block ID and leaves later authors no permission to collapse the 108 units back into 26 short summaries.

The 26 lesson source maps pass structural review: exact lesson identity, 107 referenced syllabus objectives, 55 referenced coursebook sections and no unresolved stored locator. These records carry upstream locators and authority limits; they do not claim a fresh PDF visual verification or certify Python execution.

## Python execution decisions

The A3 inventory is accepted as a disposition map, not execution evidence. All 26 displayed Python examples are locale-identical, but 0/26 has an exact full-source hash match with a Stage 5 implementation. Therefore all 26 remain `RERUN_REQUIRED`; candidate pattern proximity cannot be cited as proof that the displayed code was run.

## Visual migration decisions

The A5 inventory is accepted as the migration baseline. It confirms the exact legacy sets 58 patterns, 174 scenarios and 331 events. None can be promoted directly: all 58 patterns clone the normal/boundary/failure trace and event sequence; all 331 events lack a versioned Python line join; all 331 fail the vocabulary/type gate; and state/output evidence is incomplete.

## Gate blockers

P4R-1 remains open until:

1. A4 canonical schema, cross-document checker and negative fixtures pass.
2. A7 finishes exact marking/assessment disposition for 2,236 atoms, 107 requirements, 37 destinations and 78 stable practice items.
3. The four approved mapping sets are promoted into the nested repository as canonical P4R-1 inputs and a read-only exact-set checker passes twice.
4. An independent P4R-1 recheck confirms that the schema and maps are sufficient for the six-lesson pilot without per-lesson exceptions.
