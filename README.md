# AlgoCore Cambridge 9618 Paper 4

Complete source snapshot for the AlgoCore Cambridge International A Level Computer Science 9618 Paper 4 learning experience, using Python and targeting the 2026 examination cycle.

The repository includes:

- the Next.js/Fumadocs learning application and Paper 4 Practice Lab;
- bilingual English–Vietnamese learning content;
- Python source, execution traces and dynamic visual event specifications;
- curriculum, assessments, registries and verification scripts;
- planning, stage evidence and QA records;
- the standalone Vietnamese Teacher Guide.

The canonical web application is located at `A_Level_CS_page/algocore-fumadocs`.

## Run locally

Requirements: Node.js 22 or later, npm, and Python 3.11 or later for Python artifact scripts.

```powershell
.\START_LOCAL.ps1
```

Or run manually:

```powershell
cd .\A_Level_CS_page\algocore-fumadocs
npm ci
npm run dev
```

Open <http://127.0.0.1:3018/paper-4>.

## Verify

```powershell
.\VERIFY_PROJECT.ps1
```

See [`HANDOVER_README.md`](HANDOVER_README.md) for the full handover notes and [`HANDOVER_MANIFEST.json`](HANDOVER_MANIFEST.json) for the file inventory and critical SHA-256 hashes.

## Snapshot

- Source branch: `codex/paper4-recovery-v2`
- Source commit: `a2bbfb90fa971e7aa9013506353e2b8508a131e8`
- Snapshot date: 2026-09-23

