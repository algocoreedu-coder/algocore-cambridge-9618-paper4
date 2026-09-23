# Findings - independent A9 review

Work order P1-S0-A9-01. Reviewer: /root/a9_independent_review. Date: 20/09/2026 (+07:00). A9 did not author A0/A1/A2/A3 artifacts and did not change them. Final disposition: no open Critical, Major or Minor Stage 0 findings.

## A9-M01 - clarify the two-table SQL limit

- Severity: **Minor**. Owner: A0. Affected criterion: S0-05.
- Initial artifact: `../../SCOPE_AND_COVERAGE_PLAN.md` v1.0.0, domain 8 table row (line 20); SHA256 `a8ddb7783a257ee3737c9116339ce165c92dd9150cdf45e40aabdf629ea7ad1c`.
- Expected: state that the two-table limitation applies to querying/modifying data using DML. Authority: local syllabus PDF/printed page 27, section 8.3 continuation, first row.
- Observed: the condensed scope row followed the broad label SQL with “tối đa hai tables”, potentially suggesting a limit on database design/DDL as a whole. A3's detailed scope and AC26-8.3-06 already correctly specified DML, so this was a precision issue, not missing required scope.
- Action requested: replace the condensed wording with “DML query/modify trên tối đa hai tables”; preserve all other database objectives.
- Owner fix: A0 changed only that wording and version of the scope artifact to v1.0.1; recorded a new retest input manifest.
- Retest: A9 read the changed row against original syllabus PDF27 and compared both manifests. Corrected file SHA256 `1690445cb50d69bdd496227382495ec4f56729bf5aecf47f1658a2b9c9487ccb`. Result **CLOSED / PASS**, see [RETEST.md](RETEST.md).

## Remaining production work is not accepted by this review

A2-U01/U02/U03/U05/U07/U08 and A3-S0-04/05/06/07 remain downstream source/academic checks. A1-01–06 remain future UI/content work. They have owners and gates in the reviewed issues logs; their existence does not invalidate a truthful Stage 0 baseline. In particular, no question/marking map, F-E simulation, numerical worked answer, checksum explanation, complete lesson translation or browser behavior is certified by this review. These checks cannot be marked fixed merely because Stage 0 passes.
