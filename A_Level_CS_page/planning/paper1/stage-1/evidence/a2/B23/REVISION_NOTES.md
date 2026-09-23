# B23 A2 revision notes — v3 candidate

Status: SUBMITTED_RETEST_PENDING. Supersedes active B23-A2-v2 root. The complete v2 set is frozen at versions/B23-A2-v2/; v1 remains unchanged.

- F01: indexed W23/11 Q9 on QP p16 with printed (a)[2] and (b)[3], exact MS11 p10 links.
- F02: preserved S23/11 Q6 as unparted, recorded visible [5], and linked the exact whole-question MS11 p9 row using question_id_or_null.
- F03: rebuilt visual relations from live source-page records; deleted parent marking-item IDs were not restored.
- F04: visually screened all 61 MS pages. Added regions for the 30 A9-screened pages and S23 MS11 p9; updated existing W23 MS11 p10 for Q9. All 49 answer pages have a page-level region, live relations, dependencies, and synchronized PAGE_INDEX status.
- F05: replaced W23 QP13 p13 render from the hash-verified source PDF using Poppler; v2 image remains in frozen snapshot.
- Migrated all active marking rows to schema 1.1 explicit nullable targets; exactly one target per row.

Counts: 12 sources; 157 pages; 47 question starts; 205 parts; 178 marking items; 95 visual regions; 28 unresolved parent-context records. QP_INVENTORY_AUDIT_V3.json records all six question sequences, final pages, and 75 marks per paper.

A3 and A4 must retest these hashes; A9 independently retests all five findings. A2 validation is not gate acceptance.
