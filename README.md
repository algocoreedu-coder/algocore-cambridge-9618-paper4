# AlgoCore × Fumadocs

Runnable theme preview using real Fumadocs UI `DocsLayout` and `DocsPage`, Next.js 16 and Tailwind 4. Created separately from the existing Chapter 13 websites.

## Run

Use Node.js 22 or later. Run `npm install`, then `npm run dev`. Open http://localhost:3018/docs. `npm run build` builds the production app; `npm start` serves it. `npm run typecheck` checks TypeScript.

## Reuse the theme

Copy `styles/algocore-theme.css` and import it after the Fumadocs neutral theme and preset in your main CSS. It supplies all Fumadocs color tokens, light/dark modes, a navy sidebar, active navigation and focus rings. `app/globals.css` adds the optional sample lesson styling. Keep color changes centralized in the theme file.

Brand evidence: `assets/hash_tables_visuals_v2/PROMPTS.md` in the parent Computer_Science workspace specifies navy #0B1F33, teal #11B5AE and orange #FF9F1C. The existing logo was copied from `tmp/paper1_rebuild/algocore_logo.png`. UI teal #007C83 is a darker derivative for readable text and white button labels. Dark mode uses #45D6C9. The logo remains unmodified.

## Paper 4 learning course

Open `http://localhost:3018/paper-4` for the bilingual 2026 Paper 4 course hub. Stage 9 provides 13 packages, 26 lesson routes and 260 canonical learning blocks. The 58 Stage 8 visual patterns are embedded in the relevant lessons; lessons outside the executable pattern scope use an explicit static academic fallback.

Run `npm run stage9:registry` to rebuild and verify the learning-page registry, `npm run stage9:pedagogy` to run the deterministic pedagogy guards, or `npm run verify:stage9` for the complete registry, pedagogy, TypeScript and production-build chain. Stage 8 commands remain available for the visual-runtime input.

## Scope

This workspace contains the theme preview, the Paper 4 learning course and its event visual runtime. It does not include accounts, automated grading or progress persistence. No external publication is configured.
