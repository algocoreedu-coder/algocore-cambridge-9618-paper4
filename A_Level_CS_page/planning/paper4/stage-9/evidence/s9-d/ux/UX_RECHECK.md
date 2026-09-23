# Stage 9 UX and accessibility recheck

**Decision: PASS. Required findings: 0.** A6 independently reran the S9-D locale, responsive, theme, motion, keyboard, heading, state-preservation and zero-pattern fallback matrix against the live server at `127.0.0.1:3018`. Two small defects were found, repaired and rechecked before this decision.

## Method

- Reviewed the Stage 9 gate, original S9-R locale/accessibility findings, S9-B evidence, current registry and current app implementation.
- Sent direct VI/EN HTTP requests to verify server-rendered document language and provider chrome.
- Ran `verify-ux-runtime.mjs` with installed Chrome in headless CDP mode at a 320 × 900 CSS-pixel viewport.
- Emulated `prefers-reduced-motion: reduce`, selected the dark theme, traversed focus with real Tab key events and exercised a non-default runtime state across a Next locale navigation.
- Ran `npm run typecheck` and `npm run stage8:reducer`.

## Rework completed

1. `AppProviders.tsx` now uses the exact Fumadocs 16 contextual translation keys. Direct VI rendering exposes `Trong bài này`, `Đổi giao diện sáng tối` and `Mở điều hướng`; EN exposes the corresponding English labels. Both initial `<html lang>` values are correct and no hydration error appeared.
2. `LocaleBoundary.tsx` now uses `display: contents`. Its previous wrapper displaced the nested Fumadocs `<main>` from the named grid area and compressed the 320 px page to 90 px. After rework, the main track is 320 px, the lesson/runtime content is 288 px, and `document.scrollWidth` remains 320 px.

## Verified outcomes

- **VI/EN initial render:** PASS. Correct `html lang`, metadata title, provider TOC/theme/sidebar labels and ten localized block labels.
- **320 px responsive:** PASS. Main 320 px, runtime 288 px from x=16 to x=304, no page-level horizontal overflow.
- **Dark theme:** PASS. Runtime uses dark tokens `--pv-ink: #edf8f4` and `--pv-paper: #111c18`; computed foreground/background are `rgb(237, 248, 244)` / `rgb(17, 28, 24)`.
- **Reduced motion:** PASS. The media query matches and computed transition/animation duration is `0.01ms`.
- **Keyboard/focus:** PASS. Tab traversal reaches app navigation, mobile sidebar, TOC, skip link, locale links and source disclosures. A second traversal covers runtime pattern/locale controls, prediction input and next/play/reset buttons. All 20 sampled stops show a visible outline.
- **Heading hierarchy:** PASS. One H1, exactly ten block H2 headings, and the embedded Action View title is H3.
- **Locale state:** PASS. Switching VI → EN at `#action-view` preserved slug, anchor, `TREE_SEARCH`, boundary scenario, event index `2` and input revision `1`; the runtime and document language changed to EN.
- **Zero-pattern fallback:** PASS on `testing`. No runtime is mounted; a localized `role=note` explains the static support and links to `/paper-4?lang=en#visual-lab`.
- **Reducer/type safety:** PASS. TypeScript exited 0; reducer verifier passed 9 actions and 27 assertions.

The reproducible CDP harness is `stage-9/evidence/s9-d/ux/verify-ux-runtime.mjs`.

