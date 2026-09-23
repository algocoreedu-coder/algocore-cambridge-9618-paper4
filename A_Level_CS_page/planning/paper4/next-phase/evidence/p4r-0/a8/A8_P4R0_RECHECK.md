# A8/Lead independent recheck — P4R-0

**Decision:** `PASS`  
**Target:** `paper4-2026-s9-v2`  
**Next gate:** P4R-1 schema and mapping

The Lead independently recomputed all 53 locked file hashes and file sizes. All 53 match the A1 lock. The inventory and exact-denominator link hashes also match.

The application boundary is the nested repository `A_Level_CS_page/algocore-fumadocs`. Baseline commit `8aec6e5fc2e324f23c6c3a259424ea9e47c2ab95` exists; the observed reviewed HEAD is `58e6ce28df06bac88b67d4488dc201b0be6076de` on `codex/paper4-recovery-v2`, with 51 tracked files and a clean worktree.

Independent count and identity checks pass for all exact sets: 13 packages, 26 lessons, 108 knowledge blocks, 58 patterns, 174 scenarios, 331 events, 2,236 marking atoms, 107 assessment requirements, 37 destinations and 78 practice items. The 15 normalized legacy practice IDs are unique and bring the effective stable set to 78/78.

The eight Stage 8 and ten Stage 9 historical manifest mismatches remain recorded. They are immutable superseded evidence and cannot be used as the live release authority. Stage 9 remains `REWORK_REQUIRED` until a new v2 candidate passes the complete recovery programme.

No P4R-0 blocker remains. P4R-1 may proceed from the locked A1 snapshot.
