# P0 stack pilot evidence

This directory is Stage 5-owned. It contains the executable pilot implementation, typed fixtures, author run, independent clean-process rerun, real event traces, bilingual handoff check and gate report for the five stack patterns.

Run the pilot from this directory with:

```text
python run_p0.py
python independent_rerun.py
python build_artifacts.py
python hash_artifacts.py
```

The current decision is `PASS_RECOMMENDED`, subject to the Lead/A8 pilot gate. The code is an AlgoCore verification adaptation and carries no claim that it is an official Cambridge source literal.
