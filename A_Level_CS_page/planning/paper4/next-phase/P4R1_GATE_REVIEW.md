# P4R-1 gate review

**Gate decision:** `PASS_WITH_REQUIRED_CARRYOVERS`  
**Release:** `paper4-2026-s9-v2`  
**Opened next wave:** `P4R-2`

P4R-1 is complete. The nested repository now contains the canonical v2 schema, eleven negative fixtures, six exact mapping datasets and a mapping manifest. Read-only checks pass on Node 20.11 and the compliant Node 24.19 runtime.

Exact count and identity are preserved for 108 knowledge blocks, 26 lessons, 26 Python execution dispositions, 58 patterns, 174 scenarios, 331 legacy events, 2,236 marking atoms, 58 marking chains, 107 assessment requirements, 37 destinations and 78 practice items. All 15 Lead-normalized practice IDs remain unchanged.

A8 independently verified the active P4R-0 lock revision, schema, source locators, authority boundaries, generator determinism and canonical-only mappings. Its first pilot probe found 108 schema errors in the six A3 Python records. Lead returned the work to A3; after rework, the same probe validates 6/6 records with zero errors and 18/18 fixture reruns match. This demonstrates that the pilot can use schema v2 without an exception.

P4R-2 opens with these release blockers still explicit:

- author, execute and independently rerun the remaining Python artifacts;
- replace cloned visual traces and bind events to versioned Python line IDs;
- resolve assessment pattern, prompt, rubric and pass-rule gaps;
- preserve 293 marking source caveats and 68 intentionally null atom-level mark values;
- author and review bilingual KnowledgeUnit content before app integration.

Evidence: `evidence/p4r-1/a1-a4/`, `a3-a5/`, `a4/`, `a7/`, `a1-final/` and `a8/`.
