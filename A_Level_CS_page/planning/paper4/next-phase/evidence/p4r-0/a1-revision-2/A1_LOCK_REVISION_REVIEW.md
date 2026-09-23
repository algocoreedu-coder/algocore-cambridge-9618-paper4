# A1 input-lock revision 2

The original P4R-0 lock correctly captured the reviewed state, but it included `PROGRAM_STATUS.json` and `GATE_CHECKLIST.md` in the immutable set. Both are control-plane records that must change when a gate closes, so treating them as build inputs would make every legitimate transition invalidate the lock.

Revision 2 preserves the original lock and its hash, removes only those two files from the immutable input set, and records their baseline/current hashes as mutable governance evidence. The remaining 51 source, audit, handoff and historical inputs remain byte-identical to lock v1. The exact-denominator artifact remains locked by hash.

Run `node check-lock-revision.mjs` for a read-only verification. A8/Lead must recheck revision 2 before it replaces v1 as the active P4R-0 authority.
