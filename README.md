# AlgoCore Cambridge 9618 Learning

Next.js 16 and Fumadocs learning application for Cambridge International AS & A Level Computer Science (9618). The current release includes bilingual Paper 2, Paper 3 and Paper 4 learning areas, interactive visuals, revision practice and the AlgoCore design system.

## Requirements

- Node.js 22 or later
- npm 10 or later

## Local setup

```bash
npm ci
cp .env.example .env.local
npm run dev
```

On Windows PowerShell, copy the environment template with:

```powershell
Copy-Item .env.example .env.local
```

Replace every placeholder in `.env.local`, then open `http://127.0.0.1:3018/login`.

## Authentication configuration

The application uses one teacher-managed student account and a signed 12-hour session cookie. Configure these server-side environment variables:

```text
ALGOCORE_STUDENT_USERNAME
ALGOCORE_STUDENT_PASSWORD
ALGOCORE_SESSION_SECRET
ALGOCORE_COOKIE_SECURE
ALGOCORE_BUILD_ID
```

Use a random session secret of at least 32 bytes. Set `ALGOCORE_COOKIE_SECURE=true` for an HTTPS deployment. Set `ALGOCORE_BUILD_ID` to the `buildId` in `app/lib/paper2/generated/evidence-lock.json` so reviewed Paper 2 lessons are available in that build. Never commit `.env.local`; it is excluded by `.gitignore`.

## Validation

```bash
npm run typecheck
npm run build:paper4
npm run check:student-auth
```

The full Paper 2 release gate is `npm run build` from the larger Computer Science workspace, where its sibling curriculum and review-evidence directories are available. `check:student-auth` expects a running production server. Override its default address with `STUDENT_AUTH_BASE_URL` when the server is not at `http://127.0.0.1:3041`.

## Production

```bash
npm ci
npm run build:paper4
npm start
```

The start command listens on `0.0.0.0` and respects the hosting platform's `PORT` environment variable. Add the authentication variables and `ALGOCORE_BUILD_ID` to the deployment platform before publishing.

Main routes:

- `/login`
- `/paper-2`
- `/paper-3`
- `/paper-4`
- `/docs`

The repository contains application source and generated learning data required at runtime. Local credentials, dependency folders, build output, preview artifacts and temporary agent files are excluded.
