# A1 — Audit learning page

Version: 1.0. Task: P1-S0-A1-01. Author: A1. Date: 2026-09-19 (+07:00).
Status: SUBMITTED, pending independent A9 review. Scope: source audit only, Paper 1 exam 2026, full VI/EN. No application files edited; no browser, build or typecheck run.

## Inputs and method

All app locators below are relative to `D:/Private/_Lam_viec/AlgoCoreEduction/archive/legacy/algocore-teaching/Cambridge/A_Level_9618/Computer_Science/A_Level_CS_page/algocore-fumadocs`. Line numbers are one-based for the snapshots recorded below. Read required planning documents and Paper 4 contract as a comparison only; its Python and mandatory Action View requirements are not adopted.

Read all seven work-order app inputs with numbered lines, plus `app/page.tsx`, `next.config.mjs` and `tsconfig.json`. Enumerated app files using `rg --files`, excluding node_modules, .next and package-lock.json. There is one lesson page in the inspected app source tree; `app/page.tsx:1–2` redirects `/` to `/docs`. This is an inventory of application source, not evidence of a successful runtime deployment.

Input SHA256 snapshot:

| Path relative to app | SHA256 |
|---|---|
| README.md | B4716880E41792772A8F77F06BC62EFE318F44A4EB8783791A63674DEEEF87BE |
| app/docs/page.tsx | F65924ADD0AD83131CE4CC5CE876C2A6824924429FABE22222D4CC097E989C4A |
| app/docs/layout.tsx | 47E49079EBB02FB3C738AB634C06CE26DA2A039C1373A662FC204C96910AAE3E |
| app/layout.tsx | 9F197AA9551337E0A3D49F2D94157157F10686F559276C6C5E573C31266D89C6 |
| app/globals.css | BD834ACBEE34CB24EE762D5B3995092B3D425DC5F0514B8F58868C1FF1968A30 |
| styles/algocore-theme.css | A8AD722ACF69CB3C04ECA989C2E86616F5F9868E23A0E6DC3334DA5A8748471E |
| package.json | 96B0A7371E70210A8204875AE0BEC5C74ED4DA44640BE22FBEA3BA865614C2C5 |
| public/algocore-logo.png | B4A2564D13166EDA7A83015E8DBFA778BBEADAD25D7DC74FB7C5C10DB45D09C6 |

Planning input versions (relative to `A_Level_CS_page`):

| Input | Version / SHA256 |
|---|---|
| planning/paper1/AGENT_TEAM_PLAN.md | 2026-09-19 / 6D7D314CA61908EA196E1F5309E8818C1638F3C5572183DE52D3A30132710756 |
| planning/paper1/LEAD_PLAYBOOK.md | 1.0 / 47EB0F4495ED2BDC76E45638434EA851FC7F3DED5539E2F98348B4369A4CA8E3 |
| planning/paper1/STAGE0_WORK_ORDERS.md | 2026-09-19 / 43999B9D8AE4A0459B25F91C470F2C33A2C337A7C7E0B391BD10DD26981F6A0B |
| planning/paper4/stage-0/LEARNING_PAGE_CONTRACT.md | 1.0.0 / 2E592EA3A8BAD0AD852C51A08C30B85BC1A3601429D1441DA29CC3644EC4C547 |

## Observed baseline — checked against code

| ID | Observation and exact locator | Implication for Paper 1 |
|---|---|---|
| O01 | `app/docs/page.tsx:1,13,18,48–50` uses DocsPage/DocsBody and DocsTitle/DocsDescription. `app/docs/layout.tsx:1,24–34` uses DocsLayout. | Preserve the Fumadocs shell; content extension belongs in later stages. |
| O02 | `app/docs/page.tsx:14–17` labels Unit 13, signed integers, Paper 3, 8-minute sample. Sidebar repeats Paper 3 at `app/docs/layout.tsx:30`. | Reuse pedagogical arrangement, not these subject labels or a fixed duration. A3 decides scope. |
| O03 | Goals are explicit learner actions at `app/docs/page.tsx:19–27`. Concept immediately precedes a diagram at `28–36`, followed by a key rule at `37`. | Retain goals → explanation → local illustration → rule, with prerequisites added where needed. |
| O04 | Three worked steps appear at `app/docs/page.tsx:38–44`; warning at `45`; practice and worked answer at `46–47`. | Retain explanation, steps, misconception and self-attempt. Extend to exam response/marking evidence. |
| O05 | `app/docs/page.tsx:47` uses native `<details><summary>` without `open`; answer is already in document markup. | Source supports a closed-by-default reveal affordance, not answer security or automated marking. Keyboard/runtime behavior still needs Stage 4 testing. |
| O06 | TOC is hand-authored at `app/docs/page.tsx:4–9`, with targets declared at `20,28,38,46`. Sidebar tree and anchor URLs are hand-authored at `app/docs/layout.tsx:5–20`. | Stable block IDs, locale-aware navigation and link checks must be designed; no generated course tree is established here. |
| O07 | `app/layout.tsx:12,14` hard-codes html lang and RootProvider locale to vi. Metadata is Vietnamese at `5–8`; the sample prose/navigation is Vietnamese at `app/docs/page.tsx:5–8,15–47` and `app/docs/layout.tsx:10–16,29–30`. | Full English route/content/UI and locale switching are new work. A bilingual label inside Vietnamese prose is not full EN coverage. |
| O08 | Search is disabled at `app/layout.tsx:14`. `README.md:17` explicitly excludes PDF ingestion, accounts, grading, progress tracking, search index and external publication. | Stage 0 does not promise those capabilities. Keep them outside the required course baseline unless separately scoped. |
| O09 | `app/globals.css:1–4` loads AlgoCore theme after Fumadocs CSS. `styles/algocore-theme.css:4–32,34–55,58–80` contains light/dark tokens, navy sidebar overrides, active state and focus-visible outline. | Retain centralized theme tokens and sidebar treatment. Declared colors/focus rules do not prove measured contrast or runtime focus visibility. |
| O10 | Logo is referenced at `app/docs/layout.tsx:26`, sized in `app/globals.css:8–11`. `README.md:13` documents its origin and unmodified status. | Preserve the current asset bytes; its hash is the baseline. Provenance statement is from README, not an independent comparison with the earlier logo source. |
| O11 | `app/globals.css:64–72` has small-screen adjustments and reduced-motion override for smooth scrolling. `app/docs/page.tsx:19–20,30,47` has aria-labelledby, diagram aria-label and native summary. | Useful foundations. Actual mobile overflow, contrast, screen-reader behavior and keyboard operation remain NOT_TESTED. |
| O12 | Content is inline TSX at `app/docs/page.tsx:14–49`; `package.json:12–28` declares Fumadocs/Next/React/Tailwind and types, with no MDX content pipeline declared there. Source inventory found no content schema/MDX lesson corpus. | Treat the schema in CONTRACT_PROPOSAL as a proposed logic model. Presence of `@types/mdx` at `package.json:22` does not establish an MDX ingestion pipeline. |
| O13 | Build/typecheck scripts exist at `package.json:6–10`, engine >=22 at `29`; README run guidance is at `7`. | These are available commands, not passed checks. Use them during app integration, with logs and reviewed revision. |
| O14 | Sample markup `app/docs/page.tsx:14–49` contains no syllabus objective IDs, book citations, QP/MS locators, prerequisites, rubric map or next-lesson links; Fumadocs footer is disabled at `13`. | These are additions needed for Paper 1 learning packages. Their absence in a theme preview does not invalidate the preview. |

## Proposed changes — not current capabilities

See [CONTRACT_PROPOSAL.md](CONTRACT_PROPOSAL.md), version 1.0. Propose a lesson-package contract with shared IDs and full locale bodies, explicit provenance and marking claims, progressive practice, next/prerequisite links and source-traceable review. Authoring storage/serialization, renderer and routes are Stage 3–4 implementation decisions owned by A0/A1/A8, after pilot content.

Keep the existing Paper 3 sample when adding Paper 1 routes. No automatic transfer of Paper 4 Python examples, event schema or compulsory Action View. For a Paper 1 concept, static diagram/table can suffice; a stateful model is justified only when it helps the objective and can be checked independently.

## Verification boundary and self-review

| Check | Result |
|---|---|
| Required source inputs read and observations tied to file/line | Completed; O01–O14 |
| Versioned inputs and baseline hashes recorded | Completed; tables above |
| Observed vs proposed kept distinct | Completed; proposal expressly future-facing |
| Theme/logo preservation constraint | Included, current logo hash recorded |
| Full VI/EN, reveal-answer, navigation, provenance and future UI criteria | Included in contract proposal |
| Browser / build / typecheck / accessibility execution | NOT_RUN; no pass claim |
| Syllabus/book/QP/MS academic validation | Outside A1 package; A3/A2 evidence required |
| Independent review | PENDING A9; this self-review is not acceptance |

No Stage 0 app mutation required. Known downstream gaps and owners are in [ISSUES.md](ISSUES.md). Stop after submission; A0 integrates, A9 reviews.
