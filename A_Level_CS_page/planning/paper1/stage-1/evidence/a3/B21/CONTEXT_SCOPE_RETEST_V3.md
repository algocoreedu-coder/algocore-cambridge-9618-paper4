# A3 context and scope retest — B21 A2-v3

Task: `P1-S1-A3-B21-RETEST-V3`  
Artifact under review: `B21-A2-v3`, corpus schema 1.1  
A3 result: **PASS for the A3 source/context gate**. This is not batch acceptance; A4 same-version retest and A9 independent batch review remain required.

## Version and source integrity

I independently recomputed every path/hash listed under active A2-v3 `HANDOFF_CHECK.json` → `output_hashes`: **16/16 match**. The frozen A2-v2 core/index artifacts match the hashes carried forward into v3; the A3-v2 handoff’s selected A2-v1 and A2-v2 frozen inputs also match their archived files. Current Stage 1 schema, extraction policy, work orders, Stage 0 source manifest/scope plan/gate review, A3-v2 review files and current A4-v2 retest files match the hashes recorded by the active A2-v3 handoff.

I independently hashed and opened all 12 batch source PDFs. All **12/12 hashes and PDF page counts** match Stage 0 and A2-v3: 154 pages total (six QP/MS pairs). The 154 active PAGE_INDEX rows are unique and within their corresponding source page counts. The active index has 48 question roots, 205 parts, 48 context records, 207 marking records and 61 visual regions; counts alone are not treated as proof of semantic completeness.

### Historical provenance limit

The frozen A3-v2 handoff records `a4_retest_report_sha256=f6f48f498317e4329867ff559c5161ff2dfd862c792678d0ae78dc9d56bb53a5`. That exact digest is not present in the current B21 A4 evidence folder. The current A4-v2 `RETEST_V2.md` has SHA-256 `1f99b585b9f69ee5761330e4d88b68fc7dc60c8b15f86d8bdd3ef4e9d02ab361`, and this current file and its findings/handoff/addendum hashes match the A2-v3 handoff. I cannot recover the earlier A4 report bytes to reconcile the old digest. This limits reproduction of the prior A3-v2 review input; it does not change the independently verified current A2-v3/source evidence or the A3-v3 findings below. A0 owns preserving/reconciling that historical snapshot for final batch review.

## Retest of prior A3 findings

| Prior finding | Result | Source-backed retest |
|---|---|---|
| `A3-B21-CTX-01` | **PASS for the cited W21 Q1/Q6 cases** | In both W21 QP components 11 and 13, Q1 is on PDF p2 and Q6 starts on p11. Active question locators and context records now agree. The source p11 continuation is visible in the original PDF; no broader question-locator completeness claim is made here. |
| `A3-B21-CTX-02` | **PASS for every previously flagged span and the new Q7 continuation** | Active contexts include S21 QP11/13 Q1 pp2–4 and Q3 pp6–10; S21 QP12 Q1 pp2–3; W21 QP11/13 Q6 pp11–13; W21 QP12 Q8 pp13–16. The corresponding original pages were checked by page identity and text extraction. For both S21 QP11 and QP13, Q7 starts p15 and continues p16; Q7 context spans [15,16], while Q8 independently starts and remains on p16. The p15/p16 source renders for both components are in `retest_v3_renders/`. |
| `A3-B21-CTX-03` | **PASS** | Original S21 QP11/13 p16 visibly prints Q7(b)(iii) `[1]`, then Q7(c) `[3]`, then separate unlettered Q8 `[3]`. A2-v3 now records `...-q7-pb-piii` (nested under `...-q7-pb`) and `...-q7-pc`, with their displayed marks at those printed levels; Q8 remains the root `...-q8` with its own displayed `[3]`. No false Q8(c) child remains. The rendered source pages show the distinction directly. |
| `A3-B21-VIS-01` | **PASS for the two p16 relations** | Each S21 QP p16 whole-page region relates to both its Q7 and Q8 root. Both roots’ context spans include p16. The active A2 p16 renders were independently compared with renders from the hash-verified original PDFs. |
| `A3-B21-VIS-02` | **PASS for the eight previously flagged regions** | The six S21 QP regions (components 11/13, pp3, 5, 10) and two W21 QP regions (components 11/13, p2) have existing active render files and the expected question-root relations. Their status is `RENDERED_PENDING_INDEPENDENT_REVIEW`, not render-required. I independently rendered and inspected the same original-source pages; these are layout/number/table risks, and the report makes no claim that rendering alone proves extraction accuracy. |
| `A3-B21-REV-01` | **DEFERRED TO A9** | The current 61-region inventory is structurally reconciled, but A3’s targeted retest does not establish adequacy of all visual dependencies. A9 must sample all risk classes on the same frozen version. |
| `B21-SCOPE-01` | **RETAINED** | These are historical 2021 papers. The targeted Q7(c) data-dictionary topic is within 2026 syllabus §8.2 (syllabus PDF p26); Q8 logic gates are within §3.2 (syllabus PDF p18). That is topic-level alignment only. It does not establish 2026 lesson coverage, frequency, variant equivalence or marking validity. All questions and variants remain retained. |

## Whole-question MS evidence and schema 1.1

Original MS11 and MS13 p9 visibly contain exact `7(b)(iii)` and `7(c)` rows. Original MS11 and MS13 p10 each contain the `Question 8` entry, `1 mark per correct row` and total 3. A2-v3 targets the two Q8 MS items at their respective Q8 question IDs; `table_row_ref_or_null` is null, so this review records no inferred per-row allocation. It adds no lettered Q8 part.

For all 207 active marking records, I independently checked schema-1.1 target exclusivity: exactly one of `part_id_or_null` or `question_id_or_null` is populated. The two whole-question items target the S21 QP11/13 Q8 roots. Visual dependencies connect to the MS p10 regions; QP regions instead resolve through QP question contexts. All 61 referenced render assets exist, and QP-page/context and MS-page/dependency relations resolve. These checks establish references and evidence state, not correctness of answers or scoring.

## Source risk evidence and limits

Source renders inside `retest_v3_renders/` cover both S21 QP11/13 pp15–16; both matching MS p9–10 pairs; all eight pages behind the prior `VIS-02` finding; the previously flagged continuation-page spans; and syllabus pp18 and 26. The key p16, MS p9/p10, eight visual-risk pages and syllabus pages were visually inspected. For the other previously flagged continuation pages, I checked the source PDF page text against the active context spans. The entire 154-page source inventory was hashed/opened and PAGE_INDEX coverage checked, but every paper page was not visually inspected. A9 remains responsible for the broader batch sample and overall gate.

No answer correctness, marking-point acceptance, paper-frequency, teaching-coverage or lesson-reuse claim is made. No source PDF, A2 artifact, shared A0 record or app file was modified.
