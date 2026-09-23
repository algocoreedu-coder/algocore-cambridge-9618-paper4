# Stage 8 accessibility and learning UX test plan

## Purpose and boundary

This plan verifies the running Paper 4 visual lab against the released Stage 7 accessibility contract. The source matrices contain 169 visual entries spanning all 58 patterns. Every entry requires VI/EN views, the same learner controls, a stable keyboard sequence, non-colour encoding, a static fallback, checkpoint-preserving reduced motion and the mobile reading order `code → state → output → prediction → feedback`.

This artifact defines observable acceptance tests. It does not mark runtime behavior as passed. A8 or Lead records the actual result after testing the production build.

## Required test surfaces

- Desktop: 1440 × 900, default text size.
- Narrow screen: 320 × 800, no horizontal page scrolling.
- Zoom: desktop viewport at 200% browser zoom.
- Motion: operating-system/browser `prefers-reduced-motion: reduce` and default motion.
- Input: keyboard only, pointer, and screen-reader accessibility tree inspection.
- Locales: Vietnamese (`vi`) and English (`en`) on the same pattern and event.
- Samples: event zero, a middle event and the final event in at least one pattern per domain; boundary-heavy patterns must include stack/queue, linked list/tree, file, OOP and algorithm traces.

## Stable selector contract

The runtime must expose equivalent accessible roles and the following stable selectors so tests do not depend on presentation classes:

| Surface | Required selector or role |
|---|---|
| Visual lab root | `[data-testid="paper4-visual-lab"]` |
| Pattern selector | `#pattern-select` or `[data-testid="pattern-select"]` |
| Locale controls | `[data-action="locale-vi"]`, `[data-action="locale-en"]` |
| Transport controls | `[data-action="previous"]`, `[data-action="next"]`, `[data-action="play"]`, `[data-action="pause"]`, `[data-action="reset"]` |
| Input mutation | `[data-action="change-input"]` |
| Synchronized panels | `[data-panel="code"]`, `[data-panel="state"]`, `[data-panel="trace"]`, `[data-panel="output"]`, `[data-panel="invariant"]` |
| Prediction and feedback | `[data-panel="prediction"]`, `[data-panel="feedback"]` |
| Event identity/progress | `[data-testid="event-progress"]` with machine-readable current index and event ID |
| Live announcement | `[data-testid="runtime-announcer"][aria-live]` |
| Static fallback | `[data-testid="static-fallback"]` |
| Memory cue | `[data-testid="memory-cue"]` |

If implementation uses another selector, the owner must document a one-to-one mapping in S8-C evidence before A8 runs the tests.

## Executable acceptance scenarios

### A. Bilingual parity

| ID | Action | Expected result |
|---|---|---|
| A11Y-L10N-01 | Select a pattern and middle event in `vi`; record pattern ID, event ID, event index, code line numbers and panel values. Activate `[data-action="locale-en"]`. | Pattern ID, event ID, event index, code line numbers and state values remain identical. Titles, instructions, prediction prompt, feedback, invariant explanation, control names and memory cue become English. |
| A11Y-L10N-02 | Activate every control once in Vietnamese, then English. | Every visible control has an accessible name in the active language; no mixed-language default label remains except Python identifiers and syllabus terminology intentionally shown in both languages. |
| A11Y-L10N-03 | Toggle VI → EN → VI at event zero, middle and final event. | No reset, timer restart, prediction disclosure or input revision occurs because of locale change. Returning to VI restores the same learner meaning. |

### B. Keyboard, focus and control state

| ID | Action | Expected result |
|---|---|---|
| A11Y-KBD-01 | From the page heading, press `Tab` through the lab without pointer input. | All interactive controls receive a visible focus indicator. Focus order follows reading/task order and reaches pattern, locale, code/state/output context, prediction, feedback and control bar without a trap. |
| A11Y-KBD-02 | Press `Enter` or `Space` on locale, prediction and transport buttons. Use arrow keys on `#pattern-select` if it is a native select. | Each control performs the same action as pointer activation; focus stays on the activated control unless a documented dialog opens. |
| A11Y-KBD-03 | At event zero inspect Previous; at final event inspect Next/Play; while playing inspect Play/Pause. | Unavailable actions are natively `disabled` or expose `aria-disabled="true"` and do nothing. State is not encoded by appearance alone. |
| A11Y-KBD-04 | Activate Reset after advancing, submitting prediction and changing input. | Focus remains predictable, event returns to zero, prediction and feedback reset, and an accessible reset announcement is emitted. |

### C. Live region and announcements

| ID | Action | Expected result |
|---|---|---|
| A11Y-LIVE-01 | Inspect `[data-testid="runtime-announcer"]`. | It has `aria-live="polite"` (or an equivalent status role), `aria-atomic="true"`, and is present before an update so assistive technology detects text changes. |
| A11Y-LIVE-02 | Activate Next, Previous, Reset, change input and locale once each. | One concise announcement describes the result, including current step for event changes. It does not read all code/state content or repeat unchanged text. |
| A11Y-LIVE-03 | Start Play for at least three steps, then Pause. | Announcements are rate-limited to useful checkpoints; Pause announces the stopped step. No overlapping assertive region is used for routine progress. |

### D. Reduced motion and timing

| ID | Action | Expected result |
|---|---|---|
| A11Y-MOTION-01 | Emulate `prefers-reduced-motion: reduce`, load the lab and activate Play. | Checkpoints and event order remain intact. Decorative transitions/scroll animation stop or become effectively instantaneous; no event is auto-skipped. |
| A11Y-MOTION-02 | Compare default and reduced-motion runs from Reset to final event. | Both runs visit the same ordered event IDs and final code/state/output; reduced motion changes animation only. |
| A11Y-MOTION-03 | At a prediction checkpoint activate Play. | Playback pauses before revealing the target transition until the learner predicts or explicitly continues through an accessible action. |

### E. Non-colour meaning and contrast

| ID | Action | Expected result |
|---|---|---|
| A11Y-VIS-01 | Inspect current, changed, correct, incorrect, warning and invariant states in grayscale/high-contrast view. | Each state has a text label, icon/shape, border/pattern or position cue in addition to colour. Colour removal does not remove the meaning. |
| A11Y-VIS-02 | Inspect changed code line and changed state cell at the same event. | Both identify the transition using a persistent line number/key and a text or symbol cue; the learner can connect them without relying on matching colours. |
| A11Y-VIS-03 | Inspect focus, body text, buttons and status badges in light and dark themes. | Text and UI-component contrast meet WCAG AA targets; focus indication remains visible against adjacent colours. Any automated contrast exception has a manual measurement in evidence. |

### F. 320 px, zoom and reading order

| ID | Action | Expected result |
|---|---|---|
| A11Y-RESP-01 | Set viewport to 320 × 800 and traverse the whole route. | No horizontal page scrollbar. Controls wrap without overlap or clipping. Python code may scroll inside its labelled panel while the page itself stays within 320 px. |
| A11Y-RESP-02 | At 320 px inspect DOM/visual order. | Learning content appears `code → state/trace → output → prediction → feedback → controls`; invariant and memory cue remain adjacent to the state transition they explain. |
| A11Y-RESP-03 | At desktop width zoom to 200%. | All text and controls remain operable; no content or focus ring is clipped; two-dimensional scrolling is not required for ordinary prose and controls. |
| A11Y-RESP-04 | At 320 px switch VI/EN at the longest available labels. | Locale labels do not overflow, overlap or truncate essential meaning. Event identity stays visible. |

### G. Synchronized learning state

| ID | Action | Expected result |
|---|---|---|
| UX-SYNC-01 | Record event ID; activate Next once. Read code, state/trace, output and invariant panels. | All panels expose the same new event ID/current index. Highlighted code lines, before/delta/after values, output and invariant describe one transition, with no stale panel. |
| UX-SYNC-02 | Activate Previous, then Next; Reset; replay to the same event. | Revisited event values and order are deterministic. Previous and Reset clear feedback that belongs to a later event. |
| UX-SYNC-03 | Activate change input. | Input revision becomes visible, event returns to its documented start, stale prediction/feedback clears, and every panel uses the new input revision. |
| UX-SYNC-04 | Switch pattern while Play is active. | Old playback stops; new pattern begins at its documented start and no event from the old pattern appears. |

### H. Prediction, feedback and memory

| ID | Action | Expected result |
|---|---|---|
| UX-PED-01 | Enter a prediction checkpoint from the preceding event. | Prompt is visible before target output/state is disclosed; Play does not reveal the answer behind the prompt. |
| UX-PED-02 | Submit one correct and one incorrect prediction. | Feedback names the relevant state change/invariant and gives a next action. Correctness uses text/icon as well as colour; event identity does not change on submit. |
| UX-PED-03 | Inspect `[data-testid="memory-cue"]` at event zero, a boundary transition and final event. | Cue is short, bilingual and action-oriented: it identifies what to check before coding or what prevents a Paper 4 mark loss. It does not merely restate the current value. |
| UX-PED-04 | Pause at a boundary condition or structure mutation. | Learner can identify the changed code line, state delta, resulting output and invariant without opening another page. Information remains readable without autoplay. |

## Static fallback

Disable JavaScript or inspect the server-rendered/no-script fallback. `[data-testid="static-fallback"]` must provide a labelled before/delta/after table, guard/invariant, code locator and bilingual explanation for the selected representative example. It must not claim to be an interactive trace. The fallback remains available when reduced motion is enabled.

## Evidence record required from A8

For every test ID, record build/release ID, browser, viewport, locale, pattern ID, event ID, action sequence, observed result, expected result, screenshot or accessibility-tree locator where relevant, status (`PASS`, `FAIL`, `BLOCKED`) and finding ID. A required finding blocks S8-C and S8-D until an owner resubmits and A8 or Lead closes it as `CLOSED_VERIFIED`.

