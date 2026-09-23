# P4R-6 A6 independent learner-visible QA

**Candidate:** `3849510defd1ca4a4b060daa6696348b8467d359`  
**Production server:** `http://127.0.0.1:3018`  
**Recommendation:** **PASS**  
**Required findings:** **0**

The final browser matrix passed all 26 lessons in Vietnamese and English: **52/52 routes**. Every route rendered all 10 canonical learning sections, one complete focusable Python artifact after hydration, and the normal, boundary and failure fixture cards. The separate production HTML scan also found one Python artifact and full source lines on all 52 responses. Source length ranged from 28 to 88 lines.

Candidate `3849510` retains the attempt-gated practice feedback and response-gated retrieval review, and adds stable LF policy, an axe audit, semantic lesson-header cleanup, localized desktop table-of-contents navigation and a disabled duplicate mobile TOC popover. The full 52-route initial-state matrix and focused VI/EN disclosure interactions were rerun on this exact commit with Chrome 153 in headless CDP mode.

## Coverage

| Check | Result |
|---|---:|
| Production route checker | 52/52 PASS |
| Invalid slug | 404 |
| Browser VI/EN matrix | 52/52 PASS |
| One Python artifact after hydration | 52/52 |
| Full Python present in route HTML | 52/52 |
| 10 canonical sections | 52/52 |
| normal/boundary/failure fixtures | 52/52 |
| Official visual runtime routes | 40/40 |
| Declared representational fallback routes | 12/12 |
| Locale state | 52/52 |
| Unnamed buttons | 0 |
| Unlabelled inputs/selects | 0 |
| Desktop page-level horizontal overflow | 0 |
| Unsafe learner hrefs | 0 |
| Console/hydration/chunk warnings or errors | 0 |
| Practice items gated before feedback | 78/78 unique · 156/156 VI/EN renders |
| Retrieval items gated before review | 108/108 unique · 216/216 VI/EN renders |
| Disclosure controls initially disabled | 372/372 |
| Labelled practice/retrieval textareas | 372/372 |
| axe-core/JSDOM route audit | 52/52 PASS · 0 violations |
| Localized table-of-contents landmarks | 2/2 locales |
| Duplicate mobile TOC banners at 320px | 0 |

The 40 visual routes cover 20 official visual lessons × two locales. The 12 fallback routes cover the six lessons that have approved representational support without transferring official pattern or Cambridge-mark authority.

## Attempt and retrieval disclosure gate

All 52 routes were loaded in both locales before learner input. Across those renders, all 156 practice cards omitted feedback and all 216 retrieval cards omitted the answer, diagnosis, repair, retry control and self-rubric. Every one of the 372 record controls was disabled, and every corresponding textarea had a programmatic label. This covers the 78 unique practice items and 108 unique retrieval items in both locales.

Focused VI and EN interaction checks confirmed that whitespace does not enable a record control. A non-empty practice attempt enables recording; recording announces a polite localized status and adds a closed feedback disclosure. Editing the attempt removes that feedback again until the revised attempt is recorded.

For retrieval, Tab moved focus from the textarea to the record button with a visible 3-pixel outline, and Space recorded the response. Only then did the UI add the recorded response, closed model-answer disclosure, diagnosis, repair, retry action and AlgoCore self-rubric with `official_marks: null`. Retry removed the review, cleared the textarea and returned keyboard focus to it while preserving the attempt counter.

## Python and interactive runtime

The representative `data-models` route exposed exactly one Python artifact with 47 lines, matching the canonical line count. The source begins with `import json`; its `<pre>` is keyboard focusable and has the localized accessible name. Activating **Sao chép mã** announced **Đã sao chép mã.** through the polite live region.

Arrow Right moved the runtime from event index 0 to 1. The highlighted source changed from the validation block (`L005–L011`, `L015–L016`) to the capacity guard (`L018–L019`), and the live announcement changed with it. Changing the input to `boundary` and then `failure` reset the trace to event 0, incremented the input revision from 1 to 2, and moved focus to the new current trace step.

The locale control changed the route from Vietnamese to English while preserving `#action-view`. The document language, runtime language, H1, action-view heading and `aria-current` state all updated together. The hydrated route continued to expose one Python artifact.

## Responsive, themes and motion

At a 320 × 900 viewport, the document width was 305 CSS pixels, the runtime remained within the viewport, no control extended outside it, selects did not overflow, and the code panel collapsed to `span 12`. Wide code/state blocks kept local horizontal scrolling instead of widening the page. The same 320 CSS-pixel run is recorded as the approximation for a 1280-pixel desktop viewport at 400% zoom.

The final disclosure recheck measured a document width of 320 CSS pixels at the same viewport. No practice/retrieval card or response control extended outside the viewport, and textarea vertical resizing remained available.

The final 320 × 900 navigation recheck covered both Vietnamese and English. Neither locale exposed a duplicate mobile TOC landmark or TOC button, and neither page developed horizontal overflow. At desktop width, each locale exposed exactly one `main` landmark and one TOC navigation with the localized accessible name **Mục lục bài học** or **Lesson table of contents**. The former lesson-introduction `header` no longer creates a banner landmark; the accessibility tree reported zero banner landmarks.

Light and dark modes both produced explicit foreground/background pairs for the runtime and form controls. Three `prefers-reduced-motion: reduce` blocks were present; they disable smooth scrolling and clamp runtime transitions and animations to `0.01ms` with one animation iteration.

## Source and runtime safety

The production learner DTO tree `app/data/paper4-v2` contains no machine-local path, `file://` URL or insecure external `http://` reference. The 52-route browser matrix exposed no unsafe href. Internal canonical mappings retain local acquisition paths for provenance, but those fields are absent from the learner DTO and rendered page.

The browser console recorded no warning or error after the full route matrix and interaction checks. No hydration warning, failed trace/chunk request, runtime alert or stale legacy import was observed.

## Tool boundary

The browser clipboard bridge is isolated from the page clipboard. It returned an empty value even though the learner UI reported a successful `navigator.clipboard.writeText` call. Copy is therefore evidenced by the success live-region state together with exact DOM/canonical source-line parity.

The repository axe checker passed all 52 locale routes with zero violations using axe-core 4.13.0, JSDOM and Node 24.19.0. Its color-contrast rule is disabled because JSDOM has no visual layout; the separate browser light/dark computed-color checks remain recorded above. The repository declares Node >=22, so the local Node 20 shell's inability to load the current JSDOM dependency graph is outside the supported runtime. The zoom result is a documented viewport approximation rather than browser-native zoom emulation.

This review does not change `GATE_CHECKLIST.md`, `PROGRAM_STATUS.json`, release records or Lead/A8 sign-off.
