# Resume state — Paper 1 Stage 2

Date 23/09/2026. **STAGE2_PASS — WAITING_FOR_USER_STAGE_CHECK.** Fresh A9 final-v1 and A0 final audit passed; all agents are stopped and Stage 3 has not started.

Authoritative input pins and invariants are recorded in `LEAD_PLAYBOOK.md`. Planning inspection independently reproduced 893 atomic units, 379 containers, 893 one-to-one scoring targets, 927 marking rows, 2.250 marks, 128 unresolved and 233 populated command-word observations from the frozen corpus.

Completed C0:

1. `INPUT_BASELINE.json` froze 19 authority inputs and five accepted batch decisions with exact hashes.
2. `evidence/a0/bootstrap/C0_VALIDATION.json` is PASS and reproduces 99 parents, 893 atomic units, 379 containers, 927 marking rows, 2.250 marks, 128 unresolved and 233 command-word observations.
3. A3 foundation, A4 calibration and A6 glossary v1 are author-frozen. A0 machine/manifest audits pass. A3 now reviews calibration plus glossary scope; A4 reviews foundation plus glossary exam language.

Current state: C1 PASS by A0 decision `evidence/a0/c1/C1_GATE_DECISION.json`; accepted candidates are foundation-v1, calibration-v2 and glossary-v1-r1. Both C1 findings are closed after independent retest.

C2 snapshot:

- B21: consolidated v3 closed all A4 findings and three A3 findings. A3 retest left one Major limited to four wrong command-provenance page pointers; B21-v4 correction is active, followed by A3 final retest and A4 protected-field/provenance check.
- B22-v4: accepted by A0. A3 retest PASS remains applicable; independent A4 final retest closed all five findings, verified two MS locators and three command observations; A0 validator/rehash audit PASS. Authority: `evidence/a0/c2/decisions/B22_ACCEPTANCE.json`.
- B23-v4: accepted by A0. A3 retest PASS remains applicable, different-A4 final retest PASS closed all three Major findings, A0 validator/rehash audit PASS. Authority: `evidence/a0/c2/decisions/B23_ACCEPTANCE.json`.
- B24-v4: accepted by A0. Independent A3 closure retest PASS closed both findings; prior different-A4 PASS remains applicable because all protected fields and PC-B24-143 were independently proven stable; A0 validator/rehash audit PASS. Authority: `evidence/a0/c2/decisions/B24_ACCEPTANCE.json`.
- B25-v2: accepted by A0. A3 and A4 closure retests PASS; reviewer accepted the BYY occurrence-ledger versus C3a catalog authority boundary. One typo in frozen `ISSUES.md` cites VC-B25-0021 while ledger/QA correctly cite VC-B25-0041; A0 deferred it as non-gating metadata to avoid invalidating both PASS reviews, and C3a/A9 must carry/check it. Authority: `evidence/a0/c2/decisions/B25_ACCEPTANCE.json`.

All five C2 candidates are accepted: B21-v4, B22-v4, B23-v4, B24-v4 and B25-v2. Authority: `evidence/a0/c2/decisions/C2_GATE_DECISION.json`.

C3a `aggregate-v1` is author-frozen with exactly nine files. Handoff SHA256: `32370c0b53d63f83d9ef244c9bde188f24e6efddf9da10d55dcc3a86633ca332`; output manifest SHA256: `12d97309fa932978131995ddea4a4c97c5e1a552f19a55b85a84319d80386403`. A0 pre-review audit PASS independently reproduces 893 atomic units, 379 containers, 128 unresolved, 927 marking rows, 2,250 marks, 30 papers, 893 pattern occurrences and 498 provisional patterns, and confirms source-value identity. Fresh A3 review-v1 is active under exact 86-file manifest SHA256 `ca2dce662d859f67228e858d524854a8914195f7bf03af4b8c3100c6238d2e3b`.

C3a A3 review-v1 is frozen with `CHANGES_REQUIRED` (0 Critical, 2 Major, 0 Minor), handoff SHA256 `76f4a35c7e6c36533d8fef81646f911894f9b6fc730b924e12ab10bfa49f7f2d`. The review found ten heterogeneous-requirement merges and six duplicate exact-key partitions; the declared key reconstructs 504 groups instead of the artifact's 498. A0 handoff audit PASS and decision `C3A_GATE_DECISION_V1.json` keep C3b blocked. The same C3a author is assigned `aggregate-v2` under manifest SHA256 `098af507aaa09bec83bf8bc28480f37db548a0387dfde596438fdb046e423502`, followed by a fresh A3 retest.

Aggregate-v2 is now frozen with exactly 504 deterministic canonical-key patterns and 893 occurrences. Handoff SHA256: `c8052aa622ef28e1c53175a51ec98cf8515b95d686afc2f9ebf118e9da3fdc3d`. A0 `V2_PRE_RETEST_AUDIT.json` PASS 17/17, including zero split keys, zero heterogeneous patterns and deterministic IDs. A fresh A3 reviewer is executing the complete retest under 106-file manifest SHA256 `fb3c0de007ffafbbb920a5a9cbf173661987443ae15a006363d53b08bd74e2df`.

C3a is accepted by A0 decision `evidence/a0/c3a/C3A_GATE_DECISION_V2.json` (SHA256 `1a0b79580db88b3925ff87456a8a40302c03c666d47cd07b4a6d10b7d40516d9`) after fresh A3 PASS and A0 17/17 validation. Both v1 Major findings are closed. Accepted C3a invariants: 1,400 QBI rows, 893 atomic/occurrences, 379 containers, 128 unresolved, 927 marking rows, 2,250 marks, 30 papers and 504 provisional canonical-key patterns.

C3b `equivalence-v1` is author-frozen under a different A4 author. Handoff SHA256: `59babf0add264e8de9e628ecffd407594cc6b43dfcb7b102ae029c71ebf48414`. It accounts for 398,278 pairs as 36,416 candidates and 361,862 complement pairs, with 66 positive edges, zero unresolved, 827 positive/split-guard groups and a 586-pair complement sample. A0 reran `--verify-universe` and independently passed 12 machine controls. Fresh A9 review is active under 193-file manifest SHA256 `0d437d28732cfcf72c391cadb50560fee28c06f27aaee6b1196ed3adc37eff86`, including source review of every positive and all complement samples.

C3b A9 review-v1 is frozen with `CHANGES_REQUIRED` (0 Critical, 1 Major, 0 Minor), handoff SHA256 `dcd2db25c8f5f24bcec9963c1d55aa27597efaf7cdfa8b87c0a2c5121afe6064`. A9 found six source-confirmed `PARALLEL_EQUIVALENT` edges suppressed by the v1 generator's global one-to-one `matched` set. A0 rehashed the exact eight outputs and 193 inputs, confirmed all six wrong relation rows, the generator mechanism and four negative regression guards; audit SHA256 `132534132c41086c6fd88092dfd51e71c43b3148d35b4f95fc324a1edd914936`. A0 decision `C3B_GATE_DECISION_V1.json` SHA256 `b33890189908d875f876a4cf9e7d9c4b2bf249ccc38013016eaf51f46fcc33c5` requires `equivalence-v2` and fresh independent A9 retest.

Equivalence-v2 is author-frozen with exactly twelve files. Handoff SHA256 `0b551382d2b567f4914faca6adbbdf9bba6abbe84c238d4b34e70b1004065cad`; output manifest SHA256 `32a0d8ed6218aaad956234536651825838d52f00b5c91087540b2d7ffb5ff688`. A0 `V2_PRE_RETEST_AUDIT.json` passed 14/14 and independently reproduced 893 nodes, 36,416 candidate relations, 361,862 complement pairs, 72 positive edges, 824 components, zero unresolved and exactly six intended relation deltas. All four source-confirmed negative guards remain negative.

Fresh A9 equivalence-v2 retest passed with handoff SHA256 `fffc3988e696a7c6fdc1efd89e20a99bf96ac5241fbd3f0544beb7aa54b679b3`: 217/217 input hashes, 72/72 positives, 586/586 complement samples and all ten regression controls passed with zero findings. A0 audit `A9_V2_RETEST_HANDOFF_AUDIT.json` passed 9/9; A0 decision `C3B_GATE_DECISION_V2.json` SHA256 `ad3af80991b9fa3671cf3f484ba0db4dc5978a1f3603001e8cdae44dcb70f248` accepts equivalence-v2 and closes A9-C3B-003.

Pattern-final-v1 is author-frozen with handoff SHA256 `42e0796c2b795980b77abfcfc34ed14bc0dab10560005a6dd57a50806089bf7c`: 504 stable pattern IDs, 893 stable assignments, status distribution 127 ESTABLISHED / 374 SINGLETON / 3 NEEDS_REVIEW. A0 `PATTERN_FINAL_PRE_REVIEW_AUDIT.json` SHA256 `b7c7532bbee70431f63f3a8fa70b75d2796310e30cf84125a63af02631918887` passed 12/12.

A3 independent review passed with handoff SHA256 `6047c7ddb6244556fa473585f12648a92084e7c37f1fb5878bbc2b9edd7ac7a2`: 237/237 inputs, all 504 pattern and 893 ledger rows reconstructed, zero findings; all three NEEDS_REVIEW cases are source-supported. A0 `A3_PATTERN_REVIEW_HANDOFF_AUDIT.json` SHA256 `ea80975e3846546cfc634eabbcbcd12b90000f2cd6945e34d6c3b07c06732f47` passed 7/7.

Fresh A9 pattern review passed with handoff SHA256 `6de3b877b7eee3bdd38ccedf40a8ad589a43a0a22be917c1a499e60529fd9876`: 244/244 inputs, 224/224 source cases and zero findings. A0 audit `A9_PATTERN_REVIEW_HANDOFF_AUDIT.json` passed 6/6; decision `PATTERN_FINAL_GATE_DECISION.json` SHA256 `05be88b9b6443de831dad7c3c4fc516dd2a881a1d237297151926e7c05d01ef0` accepts pattern-final-v1.

Glossary-v2 is author-frozen with handoff SHA256 `85f3b26e6139afa9d90fcfdfe6859aec9da85b7f714190f42e03a1cfbe38b4e6`: 96 terms, 27 byte-stable command rows, 69 objective-link and 820 pattern-link instances, 30 explicit no-link dispositions and zero dangling IDs. A0 `GLOSSARY_V2_PRE_REVIEW_AUDIT.json` SHA256 `7e495247151d5623139d0e50e50db53197e6dd9e65482030de6c4ba965b2677b` passed 10/10.

Current dispatch: fresh A3 reviews source/term/objective boundaries under work order SHA256 `9d74cfcc0d7ed1170868b71343e408016e896c487d71e7b61a399d5675a83f67`; independent A4 reviews every pattern link and exam-language boundary under SHA256 `1accd2c843feca5afd6bc50399b40e165e16708d628a4aa01e602e92cb196032`. A9 and C4 remain blocked.

Both glossary-v2 reviews are now frozen and A0-audited. A3 handoff SHA256 `30ebfb5e6c24972a99b34f61b450db1d78fab25f328dbd4289298294a16adbc5` reports one Minor text-corruption finding. A4 handoff SHA256 `3bffc6e6a170867f440264f5da0380e15dd5e0fb5b309f99cfb5126c15697f1f` reports two Major semantic findings and the same Minor text defect: 63 missing exact semicolon-token command links, nine unsupported check-digit pattern links, six qualifier-only objective-evidence records, and 15 corrupted token sites. A0 audits PASS; `GLOSSARY_V2_GATE_DECISION_V1.json` SHA256 `1d9b27c585ba4b8fc5a4313e3a8aeb2098c3f9a85690e6afcda724ada05c418c` is `CHANGES_REQUIRED`.

Current dispatch is `P1-S2-A6-CORRECT-GLOSSARY-v2-r1` under exact 295-file manifest SHA256 `5b9a4fb99a002957159871a22479f434b3d79b9c4633891d1e18be5a90a1da57`. A6 writes only `evidence/a6/glossary-v2-r1/`, preserves v2 history and must stop after eight-file handoff. Fresh independent A3 and A4 retests, then fresh A9 review, remain required. C4 and all later rounds remain blocked.

Glossary-v2-r1 is author-frozen with exact eight-file handoff SHA256 `aaea630bdde0d775adc4d9062a90f1bd35bc91c21d53e377d6545ded117013a5`. A0 reran a 13-check validator and passed all controls: 295/295 author inputs, exact packet closure, 96 stable terms, 27 byte-identical command rows, zero protected drift, exactly 63 supported additions, nine required removals, 874 final links, zero command projection mismatch, Justify four-pattern closure, check-digit evidence only `REQ-6.2-02-07`, 96-row delta closure and no prohibited controls. Audit SHA256 `c2902fdb01672d1e03f86bf348252c5d6b63118ce36f01cfd4598012f9cedf54`.

Current dispatch: a fresh A3 reviewer performs the full source/term/objective retest under 305-file manifest SHA256 `127abc71c61a282bf2b8c674de1d71bbfb66ffeac2381564ba61a6c6797f7bfd`; a separate fresh A4 reviewer performs the full 874-link and 29-no-link retest under manifest SHA256 `17e947d09dccccaa902fe3c77d75bfed0cc9c1972491f0d525a6f35db8a2ffae`. Fresh A9 and C4 remain blocked until both retests PASS and A0 audits them.

The r1 specialist retests are frozen: A4 PASS verified all 874 links, 547 command pairs, 29 no-link rows and semantic boundaries; A3 returned `CHANGES_REQUIRED` with one Minor `A3-C3C-GLO-R1-001`. The r1 packet reports `changed_rows=10`, but A3 and A0 independently reproduce 28 rows changed across all seven reconciliation fields; ten is only the number whose pattern membership changed. Both reviewer handoffs passed A0 authenticity/closure audits. A0 gate decision `GLOSSARY_V2_R1_GATE_DECISION.json` SHA256 `233a0761b041614bd430d0f22b6548bbe4aabc98091e449e494194881a603139` keeps C3c blocked.

Current dispatch is `P1-S2-A6-CORRECT-GLOSSARY-v2-r2` under exact 320-file manifest SHA256 `5d48747242b0ff6aa0fe0aa017919546cd505b93495ee8bc0166d9dd74786120`. A6 must preserve glossary, command register and boundary markdown byte-identical to r1, correct delta/QA to distinguish 28 reconciliation-field rows from 10 pattern-membership rows, freeze eight outputs and stop. Fresh A3 and separate A4 retests, then A9, remain required; C4 stays blocked.

Glossary-v2-r2 is author-frozen with handoff SHA256 `ecd68234324b52e079e59d7daf030377a981d390296fc2c855b6675dca2b5543`. A0 `GLOSSARY_V2_R2_PRE_RETEST_AUDIT.json` SHA256 `9c61053979ff0217a6ca7b2357cf2e3c06bd042fb811e2ca65d818ac272e52b2` passed all 11 checks. It independently confirms 320/320 inputs, exact eight-file closure, semantic byte identity to r1, 28 all-field changes, ten membership changes, truthful scopes 10+18+68, semantic counts 69 objective links / 80 evidence / 874 pattern links / 547 command pairs / 29 no-link rows, and clean text.

Current dispatch: fresh A3 full-packet retest under exact 330-file manifest SHA256 `7e8c494ae3d36e3cee1efc5492209b0934fa60ba828ed7face0be5224ec2f9f6`; separate fresh A4 semantic-identity and metadata-closure retest under SHA256 `5790088df92b3baecc3424c4964ce956c66533d731d4c3853055c2fe73529577`. A9 and C4 remain blocked until both PASS and A0 audits them.

Both glossary-v2-r2 specialist retests are frozen PASS with zero findings. A3 handoff SHA256 `5371e83a3e7bf557cebfed6b774db6afdf28799b8a6cb74724182548167d64a6`; A4 handoff SHA256 `2c76c7b0a7661a7966db4c92351691def815bfd50030e1810fab129c46a6e3c6`. A0 exact-six, input-rehash and closure audits PASS for both packets. Current dispatch is fresh A9 full glossary review under exact 344-file manifest SHA256 `6e7c19d558e53035812aaa40b7e0e539cea6e96fd82d775ed11f7f895625be50`. C4 remains blocked pending A9 handoff and A0 glossary/C3c gate decision.

Fresh A9 glossary-v2-r2 review is frozen PASS with handoff SHA256 `ff09a95230bfbb98a03321d1b63dd631afb210aa169342c1f37c787c9a31c954` and zero findings. A0 rehashed all 344 inputs and the six-file packet, reran `validate_glossary_v2_r2.py`, and issued PASS audit SHA256 `13290b899af8ff7e3e5fefec8ba6958be628654d61b656d06118d99042016653`. Glossary gate SHA256 `463173e1458f8ab0464673d20159d8ad064583d54deeb175053658ff7c032bd9`; combined C3c gate SHA256 `974daa30100c6c935bea225eb0441f8b2d2fa2b977ce86f9a7d2807c8fd859bc`.

Current dispatch is C4a split/holdout. A fresh A2 curator, independent of the equivalence author, writes only `evidence/a2/split-v1/` under work order SHA256 `eb33be8fb1c406e852dacea231d1fae21747e9651e5bd2de165a05554e9d2c5b` and exact 49-file manifest SHA256 `15a808c7e3f886a2c7f7238d49b58b0fdba063e461f894793332b548320fe4d3`. C4b TRACE remains blocked until A9 review and A0 acceptance of C4a.

C4a `split-v1` is frozen with exact nine-file handoff SHA256 `2c857fdb0ed14c699b0b9455ff980849d1db0bb3c5b1521519eebd13373b778f`. A0 independently passed 15/15 controls over 893 units, 824 components, split totals 701 AUTHOR_POOL / 192 CONTROLLED_CHECK, exact allowlist exclusion, six complete 75-mark papers, 36,416 relations, 72 positives and the 586-pair complement audit. Current dispatch is a fresh A9 review under exact 62-file manifest SHA256 `5455eca03f4b20be54b9d6a81a8bc615a631c8611ea78eb30e1f3ee7d7368cb7`. TRACE remains blocked pending A9 handoff and A0 C4a decision.

C4a is accepted. Fresh A9 handoff SHA256 `d3b86ddf8ce5ea772e7fd628650dcbf3ea8f147884aa35d8deff5188ba1c85b1` independently reproduced the split and returned zero findings; A0 handoff audit and validator PASS. Gate authority is `evidence/a0/c4a/C4A_GATE_DECISION.json` SHA256 `ea25ae9e84e6c275ed894b27a50270b107920f38264e56d648d76ac7ca654924`.

Current dispatch is C4b TRACE. A fresh A3 integrator writes only `evidence/a3/trace-v1/` under work order SHA256 `f802345a9ea52645f04dcc3a3e836f129017eb82794ecf7974fcbad7f531554a` and exact 121-file manifest SHA256 `376fa819312d555245cdfab900bcab4e2e8398f32c45d6fe4a9c4ada0ac0414c`. Independent A4 and fresh A9 reviews are required before A0 may accept C4b; top-level integration remains blocked.

TRACE-v1 is frozen with exact ten-file handoff SHA256 `c82f4e059fb8db4b4567184ee2845b676bb17ce1955c15740e57b28dc11f1e5d`. A0 independently passed 16/16 controls and confirmed the explicit unmapped-unit source limitation without fabricated coverage. Current dispatches are independent A4 review under exact 135-file manifest SHA256 `64c5d3d5e84032c89b0c23e06f76e5fcea672cd560d0e19e262b3892c2e13f5a` and fresh A9 review under exact 135-file manifest SHA256 `855acc7b7297d8c65d4f5ab41fc3a906f1c46fe4b5082fb3f68b01ba8a1de0e0`. C4c integration remains blocked until both handoffs and A0 decision.

Both TRACE-v1 reviewers returned `CHANGES_REQUIRED`. A4 and A9 independently confirmed 19 protected-role drifts: 18 PRIMARY associations added on ten units plus one accepted SUPPORTING association also promoted to PRIMARY. A0 rehash audits PASS and upgraded role validator reproduces 11 affected units. Gate `C4B_GATE_DECISION_V1.json` SHA256 `bf07128639c6997466940af16af160a74b82259593ff1b87317cbbed368406b6` keeps C4c blocked.

Current dispatch is `P1-S2-A3-CORRECT-TRACE-v2` under exact 155-file manifest SHA256 `4450415533a0a0173a31916d13f85a571a845411431de9fa09ecf41f1063655c`. A3 must preserve accepted primary/supporting roles exactly for all 893 units, recompute every derived artifact and stop. Fresh A4 and A9 full retests are mandatory.

TRACE-v2 is frozen with exact ten-file handoff SHA256 `93bd88763ced5e3e573249f7b4aa39c616b694052867f96e03bcb6d8d3d3b5f8`. A0 independently passed 17/17 controls, including exact role projection across all 893 units: 1,153 PRIMARY, 174 SUPPORTING, zero additions/removals/overlap. Current dispatches are fresh A4 full retest under exact 169-file manifest SHA256 `e5020ad14b6a073d4f69845116ebc2760664a6fe0bce9364551581b18f205687` and fresh A9 full retest under `3d27a1f3ddbfcaad8aa312157691916bc195fd01844a7ff45f0c4c88b12eb240`. C4c remains blocked.

C4b is accepted. Fresh A4 and A9 full retests both PASS with zero findings; A0 audited both six-file packets and all 169 inputs. Gate authority is `evidence/a0/c4b/C4B_GATE_DECISION_V2.json` SHA256 `e456509ff12668b2537ba02acae13b819f52923106829380398f325f6ddc5ace`.

Current work is C4c A0 integration: freeze canonical top-level copies/indexes, combined unresolved disposition, coverage summary, Stage 2 manifest, integrity report and final-review packet. C5 is not dispatched until this integration passes A0 validation.

C4c integration is frozen with 27 canonical top-level artifacts. `STAGE2_MANIFEST.json` SHA256 `6af95171474fc75b5847963ab421b9c2bfe9028f3d25e905742e4c316e88979a`; `FINAL_INTEGRITY_CHECK.json` SHA256 `246cbe5b0195f85dbaef90e7334f4d1b4923c3cb2a995bc0ddf560ad962a6037` passes S2-M01–S2-M14; A0 handoff SHA256 `69fb514e0e2de46e4ad7ec1d9107dc522ef4066c27d9ab2b868ee839b9838626`.

Current dispatch is fresh A9 final review under work order SHA256 `e258836bad8fbc1d224b27b771ff52b08d9ec6a90ee03c0705d4f73c0851b444` and exact 408-file manifest SHA256 `d57d625afbae5ce451b49a9996407508bb5abd53db40bc1747078a7f246d7115`. A9 writes only `evidence/a9/final-v1/` and cannot close Stage 2. After handoff, A0 must rehash, rerun integrity and set `WAITING_FOR_USER_STAGE_CHECK` with no Stage 3 dispatch.

C3c and later rounds remain blocked pending equivalence-v2 handoff, fresh A9 retest and A0 C3b decision. Do not write lessons, translate lesson content, modify app or start Stage 3.

Recovery note: previous A3/A4 reviewers for B21/B24/B25 and B22 final retest hit their execution quota. Their incomplete directories are not PASS evidence. Fresh independent reviewers have been dispatched using the unchanged exact work-order manifests; B23 remains accepted and is not being repeated.

## Final Stage 2 checkpoint — 23/09/2026

Fresh A9 independently rehashed 408/408 frozen inputs, passed S2-M01–S2-M14 and source sampling, and reported zero findings. A0 rehashed the exact five-file handoff and all 408 inputs, verified both closure manifests, and reran the 14-check integrity validator. Authority: `evidence/a0/final/STAGE2_GATE_DECISION.json` SHA256 `df835cafdc96a85528f8ef650f6ee3098c54c034fd113641cfffc806433cb79b`; A0 audit SHA256 `86d309efaa6712793b764f47c84e4de09271c144cc5ba5e9c0e619a4186f5c35`; A9 handoff SHA256 `c802a5d4aad2d9768b739543338b6701451c95a7768f04feceafe05c8736683c`.

Resume only after the user inspects Stage 2 and gives a new instruction. Do not dispatch Stage 3 automatically.
