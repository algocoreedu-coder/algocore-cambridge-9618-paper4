# AlgoCore · Chapter 13 Lab

Interactive Cambridge A Level Computer Science Paper 3 study companion, built from the existing Chapter 13 teaching materials in `../curriculum/paper_3/unit_13`.

## Classroom

- 17 English theory lessons covering 13.1–13.3.
- 22 exam question patterns in 13.4: 19 core patterns and 3 clearly labelled linked topics.
- 66 independent SVG diagrams, with English labels and an enlargement dialog.
- 15 interactive activities, reused where an exam pattern uses the same concept.
- 39 self-check questions with immediate explanations.
- 30 local source PDFs (question papers and matching mark schemes), with page links.
- 39 private Vietnamese teaching scripts, each with an introduction, explanation, example, checking question, expected response, error coaching and closing activity.

The Student and Teacher entry codes are configured as server secrets. These are shared classroom roles, not named individual user accounts. Review progress is stored only in the current browser. Scratch answers are temporary, and are not submitted or graded automatically.

## Run and edit

Use Node 22.13 or later and the locked dependencies. Copy the blank keys in `.env.example` into the ignored `.dev.vars`, then provide `STUDENT_CODE`, `TEACHER_CODE` and a random `SESSION_SECRET`.

```text
npm run install:ci
npm run dev
npm run build
```

Production secrets are managed in Sites. `.openai/hosting.json` identifies the existing Site; reuse it when publishing updates.

### Content sources

`data/theory.en.md` contains the English theory. `tools/write_exam_content.py` authors the English exam cards. `tools/prepare_content.py` compiles the course, maps source PDFs and makes English SVG copies from the existing visual collection. It preserves the original source materials.

`tools/write_teacher_scripts.py` authors the Vietnamese scripts; run `tools/polish_scripts.py` after regenerating them. Only the authenticated Teacher API returns these scripts. Do not import the private JSON into a client component.

The code examples use the Cambridge two's-complement mantissa/exponent teaching model, not IEEE 754. The rounding lab explicitly chooses nearest with ties to even, or dropping low bits. Negative truncation and zero are handled separately.

## Validation

- `tools/qa-numbers.mjs`: 2,064 numeric checks, including all normalised M8/E4 encode/decode round trips.
- `tools/qa-classroom.mjs`: browser journeys across all lessons, role restrictions, teaching scripts, interactive activities, sources and mobile layout.
- `tools/qa-visuals.mjs`: checks rendered text overlap and creates visual inspection sheets in ignored `qa/`.
- TypeScript: `node node_modules/typescript/bin/tsc --noEmit`.

The browser QA scripts use the local bundled Playwright and Chrome paths from the development machine; adjust those paths when running elsewhere. Browser screenshots and logs remain in the ignored `qa/` directory.

## Sources and scope

Teaching content is adapted from the user-provided Chapter 13 book material and the previous verified local handbooks and exam source register. Original papers remain attributed in their PDFs. This is a study companion, not an official Cambridge product or a guarantee of an exam grade. The course covers the 46 knowledge/method criteria in the existing book alignment checklist; it does not claim to reproduce every original exercise.

Optional WebMCP navigation is feature-detected. It reuses the visible lesson navigation and never returns a teaching script. Native WebMCP validation was unavailable in the local Chrome build; ordinary browser interaction is fully supported.
