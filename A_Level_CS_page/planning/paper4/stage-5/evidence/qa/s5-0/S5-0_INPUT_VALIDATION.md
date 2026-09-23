# S5-0 input and harness validation

- Validation: **PASS**
- Release: `paper4-2026-s4-v1`
- Stage 4 release manifest: `65988d6012a013ec33c94f5d65d1d3dd0a9aef27e140cf3765d210529b9b6a2a` (matches `INPUT_LOCK.json`)
- Stage 4 files checked: **25/25**
- Stage 1 authority manifests checked: **2/2**
- Planning hashes checked: **5/5**
- Runtime: **CPython 3.12.4** on **Windows-11-10.0.26200-SP0**
- Harness artifact: `stage-5/HARNESS_LOCK.json` (`906195919c3705ac6957edd0205b195cb039ac6a54609d008c68bdfea1a52350`)
- Validation artifact: `stage-5/evidence/qa/s5-0/S5-0_INPUT_VALIDATION.json` (`03867fef7208478d7d089e9bb6024c3001723174855da990b9a3a99ea6beab5f`)

The validation read all locked Stage 4 and Stage 1 inputs and wrote only Stage 5-owned artifacts. No source, Stage 1, or Stage 4 file was modified. The harness remains `READY_FOR_LEAD_SIGNATURE`; P0 must not begin until Lead approves the lock.

## Locked runtime policy

The runner uses a fresh Python process and fresh temporary directory per fixture, clears declared Python/test variables, records before/after directory inventories, captures UTF-8 stdin/stdout/stderr, records timeout/kill/crash outcomes, and compares canonical typed snapshots. Candidate implementations are expected to use Python's standard library only unless Lead approves a dependency exception.
