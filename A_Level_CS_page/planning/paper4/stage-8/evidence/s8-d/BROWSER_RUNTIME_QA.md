# Stage 8 browser runtime QA

Lead tested the production `/paper-4` route in the Codex in-app browser. The page exposed all 58 pattern options and the locked runtime provenance. Next, Previous, Reset, one-step Play/Pause, VI/EN, correct and incorrect prediction, pattern selection and changed-input revision were exercised on `ALGORITHM_TRANSLATE` and `STACK_PUSH`.

The first visual inspection found the lab's negative inline margin allowed content beneath the fixed Fumadocs sidebar. Lead removed the negative margin, rebuilt the production app and rechecked the page. The final layout has no sidebar overlap. At 320 × 800, document width was 305 px for a 320 px viewport, controls remained at least 51 px high and no horizontal page overflow occurred.

Browser console errors: none. Required findings after correction: none.

