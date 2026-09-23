# A0 errata — B21 A2 v4 visual target count

Date: 2026-09-21. Applies to the frozen `B21_A2_V4_DISPATCH.md` (SHA256 `d143d29dfc93e524045325ad98b6934f0881eeb6febdedd24b950d438bb4849d`). This note clarifies the count without changing the pinned dispatch.

The dispatch names 12 MS source pages but its prose says 12 marking rows; the page/target table actually lists 13 distinct marking-item IDs because `9618_s21_ms_12` p5 has two separate answer rows. The frozen v4 handoff records all 13 target IDs and the A0 audit resolves each one to a dependency on the same source/page region. It also records the four QP page targets. In retests, use the table and ID list as authoritative: verify 13 MS marking-item dependencies across 12 source pages, plus four QP targets across those 16 pages.

A0 independently recomputed all 305 declared v4 output hashes and sizes, all 15 frozen input hashes, all 12 source PDF hashes/page counts (154 pages), and the v4 structural validator PASS. A0 also checked all 16 new source/page-to-region/render references; all 13 MS IDs and all four QP targets are present, and previous transcripts, contexts, and 61 v3 renders are byte-identical. See `B21_A2_V4_A0_AUDIT.json` (SHA256 `d14f9937055783814c90d20989aafca163bb59a756e1bc8c2444658350c4f5b3`). This is an integrity/metadata check only; it does not substitute for A3/A4 visual review or A9's independent batch review.

**Disposition:** no new A2 correction is required for the count discrepancy; all 13 IDs in the table were included. A3/A4/A9 reviewers must explicitly test the 13-ID count and the affected source pages. The original work order remains unchanged and hash-pinned.
