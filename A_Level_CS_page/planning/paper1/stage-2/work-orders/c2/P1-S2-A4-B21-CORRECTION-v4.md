# P1-S2-A4-B21-CORRECTION-v4 — Correct four command provenance pointers

Issued by A0 after B21-v3 A3 retest. Adjacent manifest is authoritative. Write only `evidence/a4/B21/v4/`; preserve earlier packets; do not spawn agents.

Copy v3, then correct only direct-command provenance for these four atomic rows and linked pattern occurrences:

- `9618_s21_qp_11-q3-pb` and `9618_s21_qp_13-q3-pb`: command `Complete` is on the command-bearing QP page 9, not context page 7.
- `9618_w21_qp_11-q6-pb` and `9618_w21_qp_13-q6-pb`: command `Complete` is on QP page 13, not context page 12.

Keep the already-correct command values and all other v3 semantics. Preserve all A4 PASS marking/response/pattern/variant fields except the linked provenance pointer required by this correction. Produce exactly 11 outputs, tight delta, exact 174/79/208/68, 450, 6×75 and A0 validator PASS. Fresh A3 closure retest plus independent A4 protected-field/provenance retest are required. Freeze and stop without self-review, acceptance or downstream work.
