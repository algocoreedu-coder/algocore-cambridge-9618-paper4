# Independent A4 review — glossary-v2

Result: **CHANGES_REQUIRED**

Reviewer role: independent A4 pattern/exam-language reviewer, separate from the A6 author. This review does not edit or accept the author packet and does not open C4.

## Frozen-input verification

- Issued work order SHA256: `1accd2c843feca5afd6bc50399b40e165e16708d628a4aa01e602e92cb196032`.
- Issued 280-file manifest SHA256: `d30643da40eb2d1426a78234e78f6b7daadef28b9297e1156f5cf13a9a5b82a8`.
- Rehash result: 280/280 files match bytes and SHA256; zero missing files and zero drift.
- Author handoff SHA256: `85f3b26e6139afa9d90fcfdfe6859aec9da85b7f714190f42e03a1cfbe38b4e6`.
- A0 pre-review audit SHA256: `7e495247151d5623139d0e50e50db53197e6dd9e65482030de6c4ba965b2677b`.
- The author directory contains exactly eight expected files. Every entry in the author output manifest resolves to the current bytes and hash.

## Complete link review

All 96 glossary rows parse and have unique IDs: 59 technical, 8 unit, 2 symbol, and 27 command-word rows. Protected fields match `glossary-v1-r1`; the command-word register is byte-identical to the accepted v1-r1 register. The reconciliation delta has one consistent row for each of the 96 terms.

All **820 declared pattern-link instances** were checked against the accepted 504-row final pattern catalog, the cited accepted requirements or command observations, and the reconciliation evidence. The structural checks found no dangling pattern IDs, missing evidence records, stale evidence hashes, or requirement-to-pattern subset mismatch. The declared-link digest is `4692f518bb2701ddfe3965de26294877c424a6e93df1a9837f86be3fa68d6eeb`.

The semantic disposition is 811 supported declared links and 9 rejected declared links. The rejected links all belong to `TERM-VAL-CHECK-DIGIT`: `PAT-C3A2-0362`, `PAT-C3A2-0394` through `PAT-C3A2-0401`. None contains `REQ-6.2-02-07`, the accepted requirement that actually assesses check digit. Their official examples assess presence/double-entry association or range, format, length, presence and existence checks. The links arose because the phrase “check digit is classified as validation” is repeated as a qualifier in `REQ-6.2-02-01` through `REQ-6.2-02-06`. Exact token presence in that qualifier does not make those sibling patterns check-digit patterns. Six surplus objective-evidence records have the same cause; the objective link itself remains supported by `REQ-6.2-02-07`.

The command-word reconciliation also omits **63 supported term-to-pattern pairs** across nine commands. Accepted pattern observations such as `Give; Justify`, `Complete; Identify`, and `Identify; Explain` record multiple exact command words in one semicolon-delimited value. The author matched only whole array values, so the individual terms were not linked. This is not fuzzy matching: the command tokens are verbatim observations. It leaves `TERM-CW-JUSTIFY` incorrectly classified as `RECONCILED_NO_LINK` despite four accepted patterns with an observed `Justify` command.

## No-link and exam-language review

All **30 no-link rows** were reviewed. Twenty-nine are supported by their source/section guard and explicit `NO_VERIFIED_FINAL_ID_LINK` disposition. `TERM-CW-JUSTIFY` is not supported as no-link because `Justify` appears verbatim in four accepted pattern observations. The no-link row-set digest is `f1ad89e748c5ef9c7ed339bb1547ca2e6653bc1a7f72b9d8f8b1579f3532d14d`.

The 27 command-word meanings were independently compared with syllabus PDF pages 41–42. All 23 page-41 and four page-42 locators are correct; the English summaries preserve the official response demand and every row retains the question-and-subject-context boundary. No row claims a fixed response length, sentence count, bullet count, or mark value. Vietnamese values remain candidates and no VI/EN parity is claimed.

Validation and verification remain separate: their only shared pattern links are the four patterns whose accepted requirement explicitly asks about both concepts; verification does not inherit the validation-method patterns. Check digit and checksum remain distinct IDs, but the check-digit links to sibling validation methods must be removed. Bit/byte, accuracy/precision, and database term guards otherwise remain conservative.

The required `CONFLICTS_AND_BOUNDARIES.md` contains escape-sequence corruption. Fifteen intended initial characters were converted into carriage return, line feed, tab, backspace, vertical-tab, form-feed, or bell controls. This damages labels including `requirement_ids`, `validation`, `verification`, `bit`, `byte`, `accuracy`, `table`, `record`, `field`, `attribute`, `relationship`, `normalisation`, and `normalised`. The JSON/JSONL data are not affected, but the human-readable boundary artifact is not acceptable in its frozen form.

## Findings and stop

Open findings: 0 Critical, 2 Major, 1 Minor. A6 must issue a new version that corrects the 63 missing command-word links, removes the 9 unsupported check-digit pattern links and surplus qualifier-only evidence, and repairs the boundary markdown. A fresh independent A4 retest must rehash the corrected packet and repeat the complete link/no-link review.

This six-file review handoff is frozen. A0 remains gate authority. C3c glossary acceptance, C4, split, trace, lessons, app work, and Stage 3 remain blocked.
