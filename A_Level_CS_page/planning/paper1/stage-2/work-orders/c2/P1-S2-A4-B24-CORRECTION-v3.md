# P1-S2-A4-B24-CORRECTION-v3 — Close new ROW_ATOMIC finding

Issued by A0 on 22/09/2026 after B24-v2 retest closed the three original findings but opened `B24-A4-R2-MAJ-001`. Adjacent manifest is authoritative.

Write only `A_Level_CS_page/planning/paper1/stage-2/evidence/a4/B24/v3/`; preserve v1/v2. Copy v2 as baseline, change `9618_w24_qp_13-q4-pa` marking behaviour to `ROW_ATOMIC`, preserve each foreign-key/table pair as one condition, and rebuild `PC-B24-143` marking metadata. Do not alter unrelated mapping semantics. Produce exactly 11 outputs, run A0 validator, record a tight delta, freeze hashes and stop.

Acceptance: exact 170 atomic/scoring rows, 73 containers, 0 unresolved, 450 marks, 6×75; v2 original three findings remain closed; new finding closes; unrelated content byte/semantic stable where possible. A different A4 reviewer must retest v3. Do not self-review or accept.
