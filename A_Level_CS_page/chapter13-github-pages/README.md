# AlgoCore · Chapter 13 Lab

An interactive Cambridge A Level Computer Science study companion for Chapter 13 and Paper 3.

**Website:** https://algocoreedu-coder.github.io/algocore-chapter13-lab/

## What is included

- 17 theory lessons in simple English, covering sections 13.1–13.3.
- 22 Paper 3 question patterns in section 13.4.
- 66 independent diagrams with an enlargement view.
- 15 interactive activities and 39 self-check questions.
- 30 question-paper and mark-scheme PDFs, linked to relevant pages.
- 39 Vietnamese teaching scripts available through the Teacher code.
- Student and Teacher entry, a pronunciation glossary, mobile layout and device-local review progress.

## Hosting and classroom codes

The entire website runs on GitHub Pages. It does not call an external application server. Its two classroom codes open separate encrypted content packages using Web Crypto, PBKDF2-SHA256 (600,000 iterations) and AES-256-GCM.

Plaintext teaching scripts, source lesson JSON, classroom codes and private environment files are excluded from this public repository. The student package does not contain teaching scripts. Changing the visible role or a saved role value does not decrypt the Teacher package with a Student key.

**Scope:** this is a shared classroom-code gate, not server-verified identity or strong access control. Four-digit codes can be guessed offline; browser-side code cannot enforce a server rate limit. Do not use this setup for grades, personal student records or confidential material. A successfully unlocked key is held in the current tab's session storage for up to eight hours; signing out clears it. Review progress is stored separately in local storage, and scratch answers are not submitted anywhere.

## Development

Requires Node.js 22.13 or later; the deployment workflow uses Node.js 24.

```sh
npm ci
npm run dev
npm run check:package
npm run build
npm run preview
```

The project base path is `/algocore-chapter13-lab/`. Lesson navigation uses URL fragments, so refreshing a lesson works on static hosting.

## Update lesson content

Keep the original `curriculum.json`, `teacher-scripts.vi.json`, and the classroom code values outside this public checkout. To regenerate the two encrypted packages locally:

```sh
node scripts/pack-content.mjs --source /private/path/to/data --codes-file /private/path/to/classroom.env
```

The private code file supplies `STUDENT_CODE` and `TEACHER_CODE`; environment variables with those names also work. The script writes only ciphertext, random salts/IVs and algorithm metadata into `public/content/`. It does not print codes. Update source diagrams and paper files in `public/` when needed, then build and push to `main`.

## Deployment

GitHub Actions builds the site and deploys `dist/` with the official GitHub Pages actions. Enable **Settings → Pages → Source → GitHub Actions**. Every push to `main` redeploys the site. No custom domain or deployment secret is required.

## Educational scope and attribution

The teaching materials are adapted from the supplied Chapter 13 book materials and the local exam-pattern collection. Original paper attribution remains inside the PDFs. This is an independent study companion, not an official Cambridge publication or a guarantee of exam results.

The UI uses React, Radix primitives, Tailwind CSS and Lucide icons. The included shadcn Tailwind stylesheet retains its license in `vendor/`. Optional WebMCP navigation is feature-detected; ordinary browser use does not require it.
