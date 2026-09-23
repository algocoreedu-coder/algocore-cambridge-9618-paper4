# P1-S2-A3-REVIEW-B22-v1 — independent scope/objective/context review

Reviewer: A3 independent specialist  
Review date: 22/09/2026  
Target: frozen `A4/B22/v1` author packet  
Decision: **CHANGES_REQUIRED**

## Basis

The issued review manifest was rehashed to SHA256 `6f62709db50592794e056afb66f784972c3fd0c722af8ce351c7f5351e664e3a`. All seven issued inputs, all ten files pinned by the author output manifest, and the nested 27-file author input manifest matched their declared byte sizes and SHA256 values before review.

Independent machine reconciliation passed for the frozen subset shape: 188 unique atomic targets, 78 unique non-scoring containers, 188 scoring marking rows, 450 marks, six paper totals of 75, and the exact 32 unresolved records. All requirement IDs resolve to accepted `foundation-v1`; every atomic record has a primary requirement; no unresolved record is promoted.

All 188 atomic rows were inspected against their normalized QP/MS evidence and accepted requirement wording. The ambiguous, context-dependent, visual/table-dependent, multi-objective and medium-confidence rows received targeted source review. Official rendered QP evidence was inspected for the findings below, including Summer 2022 component 13 page 2, Winter 2022 component 12 pages 13 and 17, and Summer 2022 component 12 pages 2–3.

## Findings

Two Critical mapping defects and one Major context/evidence defect prevent acceptance:

1. `9618_w22_qp_12-q7-pbiii` and `9618_w22_qp_12-q7-pbiv` have their operation families reversed. The former asks for `LSL #3` but is mapped to the AND/XOR/OR requirement; the latter asks for `OR 51` but is mapped to the shift requirement. The source QP page and official MS rows agree on the operations. Their provisional pattern assignments inherit the wrong requirement basis.
2. `9618_s22_qp_13-q1-paiii` and `9618_s22_qp_13-q1-paiv` ask about lossless/lossy text compression but are mapped to the character-set requirement `REQ-1.1-07-01`. The official QP/MS evidence instead supports the accepted compression requirements in section 1.3. Their provisional pattern assignments therefore also have the wrong requirement basis.
3. Context and stimulus dependencies are materially incomplete. `9618_s22_qp_12-q1-pbi` and `...-pbii` omit the part (b) bitmap context; `...-pbii` also omits its explicit dependency on the answer to part (b)(i), stores an excerpt beginning with the wrong part label, and records `Show` instead of the leading command `Calculate`. `9618_w22_qp_12-q10-pbi` cannot be interpreted from its stored excerpt without the LAN diagram in part (a), yet both dependency fields are empty. `9618_s22_qp_11-q4-pcii` likewise omits the table/field context needed to form the SQL response. These examples demonstrate a batch-level dependency audit is required rather than isolated field edits.

Exact IDs, source locators, affected fields and required correction/retest actions are in `FINDINGS.jsonl`.

## Acceptance result

`CHANGES_REQUIRED`: 2 Critical, 1 Major, 0 Minor. A corrected author version must rebuild affected atomic and provisional pattern records, audit all context/visual dependencies across B22, rerun complete structural checks, and receive a fresh independent A3 retest. This reviewer did not modify or accept the author artifact.
