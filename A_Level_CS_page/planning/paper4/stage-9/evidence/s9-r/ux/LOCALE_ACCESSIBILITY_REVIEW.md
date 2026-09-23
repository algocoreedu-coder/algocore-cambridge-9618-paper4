# Stage 9 S9-R locale and accessibility review

**Decision: REWORK_REQUIRED.** Static inspection and `npm run typecheck` completed successfully, but two implementation defects and one missing-runtime dependency block the locale/UX gate. This review does not treat the future registry or route as passed.

## What passed statically

- The lesson renderer, source cards and visual runtime use one component tree with paired VI/EN labels.
- Locale links retain the lesson slug and append the current section hash.
- The visual reducer's `SET_LOCALE` action retains pattern, event, scenario and input revision state.
- Semantic controls, skip navigation, focus-visible rules, responsive breakpoints, local code overflow and reduced-motion rules are present.
- Source cards use a native disclosure, localized labels, wrapping for long locators and a fixed internal source-conventions route.
- `npm run typecheck` exited 0.

## Required findings

1. **S9R-UX-REQ-001 — locale-aware document and provider chrome (P1, owner A2 with A6 review).** `app/layout.tsx` fixes both `<html lang>` and `RootProvider` locale to Vietnamese. `LocaleBoundary` corrects `document.documentElement.lang` only after hydration and cannot localize Fumadocs provider labels. The implementation must make EN navigation, TOC and provider chrome follow `?lang=en`, then A6 must recheck both locales.
2. **S9R-UX-REQ-002 — embedded heading hierarchy (P1, owner A2).** The action-view learning block has an `h2`, and its embedded visual runtime creates another `h2` as a child. Give the runtime an embedding-safe heading level or title contract and verify the rendered outline.
3. **S9R-UX-REQ-003 — route and registry browser acceptance (P1 dependency, owner A2 with A6 browser QA).** The dynamic lesson page and Stage 9 registry did not exist at this checkpoint. No claim is made for 26-route locale parity, state preservation, mobile, themes or real source cards.

## Deferred acceptance tests

- Direct-load VI and EN lessons and compare document language, provider chrome, title, TOC and all ten labels.
- Deep-link to a block; switch VI → EN → VI; confirm the same slug and anchor.
- Select a non-first pattern, boundary scenario and non-zero event; switch locale; confirm lesson, pattern, scenario, event index and input revision remain unchanged.
- Complete a keyboard-only pass covering skip link, locale links, TOC, source disclosure, visual controls and previous/next links; verify focus remains visible and logical.
- At 320 px, verify no page-level horizontal overflow and that code overflow remains local.
- Check light/dark contrast and state cues, especially the visual runtime's fixed light palette.
- Emulate reduced motion and confirm every state change remains understandable.
- Inspect registry-backed official, coursebook, editorial and internal source cards; confirm no local locator becomes an `href`.

The machine-readable finding owners, expected fixes and deferred test list are in `LOCALE_ACCESSIBILITY_REVIEW.json`.
