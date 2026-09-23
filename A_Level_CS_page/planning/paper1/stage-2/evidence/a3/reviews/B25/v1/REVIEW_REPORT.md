# Independent A3 review — B25-v1

Decision: **CHANGES_REQUIRED**.

All seven issued inputs, all nine author outputs, and all 27 pins in the nested author input manifest rehash exactly. The A0 validator passes: 183 atomic units, 75 containers, 183 scoring links, zero unresolved rows, 450 marks, and six papers at 75 marks. Requirement, pattern, transcript and visual references resolve; all 60 nested atomic rows include their immediate parent part.

The semantic gate does not pass. Review of all 183 mappings against the exact QP/MS evidence and accepted 2026 requirements found two Critical, one Major and one Minor findings:

1. Two response demands are presented as direct 2026 coverage although they exceed the cited requirements: RAM amount as a performance factor, and cost/capacity/longevity reasons for choosing magnetic rather than solid-state storage. The cited requirements control RAM applications and principal storage-device operations, not those comparative performance demands.
2. W25/11 Q5(c) hides an accepted auto-indentation/auto-formatting route under `IN_SCOPE/HIGH`; the controlled 2026 presentation examples are prettyprint and expand/collapse code blocks.
3. Command provenance is materially incomplete. 181 of 183 atomic rows and their pattern occurrences use a null command with `SOURCE_INSPECTED_NO_ATOMIC_COMMAND_CAPTURED`, including rows whose exact QP clearly begins Explain, Complete, Identify, Describe, Write or Trace.
4. W25/11 Q6(c) maps the DRAM/SRAM comparison only to the distinction requirement although the official alternatives include their main-memory/cache applications, which also reach the accepted use requirement.

Rendered pages inspected directly include S25/11 page 10, W25/11 page 10 and W25/13 page 13; official MS transcripts were checked at the frozen locators. Full evidence and correction criteria are in `FINDINGS.jsonl`.

This reviewer did not repair the A4 packet, perform the separate marking review, accept B25, or open downstream work. A corrected author version requires a fresh independent A3 retest.
