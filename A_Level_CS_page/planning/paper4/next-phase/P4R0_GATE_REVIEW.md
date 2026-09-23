# P4R-0 gate review

**Gate decision:** `PASS`  
**Release:** `paper4-2026-s9-v2`  
**Opened next wave:** `P4R-1`

P4R-0 is complete. A1 produced a 53-file input lock, verified the 8/8 handoff chain and resolved the practice-item identity gap. A8/Lead independently rechecked the locked hashes, Git baseline and all ten exact entity sets.

After the gate transition, Lead found that the first lock had included two intentionally mutable control-plane files: `PROGRAM_STATUS.json` and `GATE_CHECKLIST.md`. Revision 2 preserves lock v1 by hash, locks the remaining 51 immutable inputs, and records those two files as mutable governance baselines. Its read-only checker passed twice and A8/Lead rechecked it independently. Revision 2 is the active input authority.

The recovery programme now has a reviewable rollback point at commit `8aec6e5`, an active working branch `codex/paper4-recovery-v2`, exact denominators, owner/reviewer separation and immutable historical Stage 8/9 evidence.

Required carryover into later gates:

- Canonical assessment records must preserve all 78 stable practice IDs.
- Stage 8/9 v1 manifests remain historical and unchanged.
- Only a new `paper4-2026-s9-v2` manifest may reopen release.

Evidence: `evidence/p4r-0/a1/`, `evidence/p4r-0/a1-revision-2/` and `evidence/p4r-0/a8/`.
