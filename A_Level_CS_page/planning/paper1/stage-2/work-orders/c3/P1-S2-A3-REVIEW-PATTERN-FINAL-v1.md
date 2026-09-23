# P1-S2-A3-REVIEW-PATTERN-FINAL-v1 — Independent final-pattern review

Exact input manifest: `P1-S2-A3-REVIEW-PATTERN-FINAL-v1_INPUT_MANIFEST.json`, 237 files, SHA256 `403ac53d53dd3bb71c76ee875c6b3dd5fa31264e4cc64a4efa9872fb0f9064a4`. Author handoff SHA256 `42e0796c2b795980b77abfcfc34ed14bc0dab10560005a6dd57a50806089bf7c`; A0 pre-review audit SHA256 `b7c7532bbee70431f63f3a8fa70b75d2796310e30cf84125a63af02631918887`.

## Owner and write allowlist

Owner: a fresh independent A3 reviewer who did not author aggregate-v2, pattern-final-v1 or equivalence-v2. Do not spawn agents. Write only:

`A_Level_CS_page/planning/paper1/stage-2/evidence/a3/reviews/pattern-final-v1/review-v1/`

Do not modify author packets, A0 evidence, trackers or downstream artifacts.

## Review contract

- Rehash all 237 inputs first; drift is Critical.
- Reconstruct the complete 893 occurrence-to-pattern-to-equivalence-group join independently. Check exactly 504 patterns, 824 groups and no duplicate/dangling/cross-pattern component.
- Recompute every raw occurrence, distinct-paper and distinct-equivalence-group count; compare all 504 rows and the 893-row ledger.
- Compare all accepted aggregate-v2 protected semantic/source fields and all occurrence assignments; any identity drift is Major or Critical if source evidence changed.
- Review the deterministic status rule for every pattern: `ESTABLISHED` needs at least two groups; `SINGLETON` has one group; `NEEDS_REVIEW` needs a concrete evidence conflict/gap. Inspect all three declared NEEDS_REVIEW patterns against accepted source/scope evidence.
- Verify examples/boundaries/reverse refs, delta completeness, QA truthfulness, manifest/handoff closure, B25 deferred note and scope boundary.
- Reject predictive frequency language or any lesson/split/holdout/glossary/trace claim.

## Exactly six outputs

1. `REVIEW_REPORT.md`
2. `FINDINGS.json`
3. `MACHINE_CHECKS.json`
4. `INPUT_MANIFEST.json` — exact issued copy
5. `OUTPUT_MANIFEST.json`
6. `HANDOFF.json`

## Acceptance and stop

Return PASS only with zero input drift, all required checks complete, zero open Critical/Major/Minor findings and independently reproduced counts/statuses. A fresh A9 review remains required after A3, and A0 alone accepts final patterns.

Freeze six outputs and stop. Do not repair author files, update trackers, reconcile glossary, start split/trace, or perform lesson/app/Stage 3 work.
