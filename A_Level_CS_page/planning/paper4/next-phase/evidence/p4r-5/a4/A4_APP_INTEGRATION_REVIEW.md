# P4R-5 A4 app integration review

**Decision:** `PASS_WITH_P4R6_CARRYOVERS`

The production Paper 4 routes now read the canonical v2 manifest and static lesson loader. They have no production import of `stage8-runtime-registry.json` or `stage9-learning-pages.json`. The hub serializes only 58 pattern metadata records, and a selected trace chunk supplies its own verified Python artifact. Switching from one pattern owner to another therefore does not preload or reuse the wrong Python source.

Implementation commits: `8d1b1c3` (chunk artifact), `eaa732e` (runtime chunk loader), and `e684f36` (routes and learning renderer).

## Verified result

- 26 unique lesson slugs × VI/EN = 52/52 HTTP 200 on a production server.
- Every route renders 10 canonical sections, full Python source, normal/boundary/failure tests, marking/error content, three practice levels, retrieval and sources.
- An invalid slug returns 404 with `dynamicParams = false`.
- Runtime verifier passes 58 patterns, 174 scenario-specific sequences, 589 events, 2,691 active-line bindings and 1,178 bilingual accessibility bindings.
- TypeScript and Next production build pass on Node 20.11.0 and Node 24.19.0.
- Hub HTML is 108,385 uncompressed bytes. Manifest plus static loader is 43,346 bytes. The largest lazy trace chunk is 95,083 bytes.

## P4R-6 carryovers

Browser QA must still cover keyboard/focus, screen reader announcements, reduced motion, 320 px, 400% zoom, light/dark, console/hydration errors and failed trace requests. It must also verify locale state across a real navigation.

The complete `exam-workflow` marking evidence produces 795,011 bytes of uncompressed server HTML. This does not enter a Client Component as a lesson DTO, but P4R-6 must measure the actual RSC/client transfer and decide whether marking atoms require a separate server pagination or disclosure route before the payload gate closes.
