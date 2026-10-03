# AlgoCore Paper 4 mixed and timed rehearsal pack

This folder contains original AlgoCore-authored practice for Cambridge International AS & A Level Computer Science 9618 Paper 4 (Python, 2026 scope).

It is **not** an official Cambridge question paper or mark scheme. No item carries an official QP/MS locator or official marks. The allocated marks are an AlgoCore teaching rubric used to pace practice and self-review.

## Pack

- `diagnostic/`: untimed mixed diagnostic.
- `half-a/` and `half-b/`: 75-minute mixed rehearsals.
- `mock-a/` and `mock-b/`: complete 150-minute, 75-mark mock-equivalent rehearsals.
- `mock-pack.schema.json`: machine-readable contract.
- `manifest.json`: release inventory and file links.

Each rehearsal keeps the learner paper separate from `solution.json` and the reference implementations in `solutions/`. During an active attempt, a delivery layer must not expose either location.

Run `python scripts/check-paper4-mock-pack.py` from the `algocore-fumadocs` project root to validate structure, totals, source files, solution separation and executable reference Python.
