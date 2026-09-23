# S8-B Lead candidate — runtime visual system

## Submission

`Paper4VisualRuntime` is ready for independent A6/A7/A8 and Lead recheck. It consumes the generated registry directly and does not copy or rewrite Stage 7 content. The production build includes the statically rendered `/paper-4` route.

Public integration:

```tsx
import registry from "@/app/data/stage8-runtime-registry.json";
import { Paper4VisualRuntime } from "@/app/components/paper4-visual";

<Paper4VisualRuntime registry={registry} initialLocale="vi" />
```

Props are `registry`, optional `initialPatternId`, `initialLocale`, `autoplayDelayMs` and `className`. The compile-time registry assertion covers the exact A1 artifact with 58 patterns, 174 scenarios and 331 unique events.

## Runtime behaviour

- The pure reducer implements all nine contracted actions: `SELECT_PATTERN`, `PREVIOUS`, `NEXT`, `PLAY`, `PAUSE`, `RESET`, `SET_LOCALE`, `SUBMIT_PREDICTION`, and `CHANGE_INPUT`.
- `PLAY` advances one event after the configured delay and pauses at the next prediction checkpoint. `RESET` returns to event zero and clears prediction and input revision. Locale changes preserve the exact pattern and event identity.
- Code, state, trace, output and invariant derive from the same current event. Code and state repeat the same textual step/event cue as a non-colour join.
- Prediction feedback names the expected next event; changed input creates a deterministic new revision and resets the source trace.
- The registry remains the source of event identity, ordering, bilingual instructional text and provenance.

## Accessibility and responsive behaviour

All interactive controls are native buttons, inputs or selects with visible focus. The runtime has a polite atomic announcer, semantic panel headings, progress ARIA, non-colour current/completed trace labels, forced-colour handling, reduced-motion handling and one-column narrow-screen flow. DOM reading order places the learning panels and prediction feedback before the control bar. A bilingual memory cue and a substantive `noscript` fallback are present.

Stable browser selectors include the root, pattern selector, nine action surfaces, seven panel/status surfaces, control bar, progress identity, announcer, memory cue and static fallback.

## Validation

- `npm run typecheck`: PASS.
- Pure reducer contract: PASS, nine actions and 26 assertions.
- `npm run build`: PASS; Next.js generated `/paper-4` as static content.
- Registry contract import: PASS against SHA-256 `4a5a9b154d2b1de8197d42c7c900e2cd738238ddaddac9842ccd40246e2ffc34`.

Seven required A6/A7/QA observations have corrections in this submission. They remain `RESUBMITTED` until a reviewer other than A2 closes them, following the Stage 8 rework policy.
