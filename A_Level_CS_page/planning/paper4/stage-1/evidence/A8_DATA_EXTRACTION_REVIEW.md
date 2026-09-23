# A8 independent review: data and extraction

**Data: PASS after rework. Extraction integrity and fidelity controls: PASS after recheck.** This is a scoped QA report, not the Stage1 gate or a full question-index review.

## Independently checked

- All29ZIP archives: recalculated SHA-256, ZIP CRC, complete member enumeration, member byte/hash/size comparison with extracted copies, safe member paths and confinement to the paper folder. No failures.
- All44required text files across29papers: read QP descriptions/direct task pages, tested record shape/types/counts and stated examples. No failures. Examples include21Pictures records;10HighScore pairs sorted descending;30CardValues pairs;100lowercase StackData letters; variable3/4line Employees records with leading-zero IDs retained;199HashData rows permitted by “up to200”; six supplied empty colour files.
- All8recovered bundles: recovery metadata hash matches archive audit and individual provenance sidecars. These are public-mirror downloads; this review does not certify identity against a Cambridge-hosted hash/signature.
- All65PDFs/2255pages: raw hash/size, page counts,1-based locators, primary natural text equal fresh PyMuPDF reads, page dimensions/rotation, transformed display bounding boxes. All58QP/MS first-page component/year/session identities match their source IDs.
- Visually inspected11risk-targeted PDF renders, including landscape markscheme code, linked-list table, input-file examples, colour blank-output demand, assignment arrows and coursebook cover/contents. This does not claim every page was visually reviewed.

Machine evidence: [mechanical checks](A8_data_render/mechanical_checks.json), [data formats](A8_data_render/data_formats.json), [review JSON](A8_DATA_EXTRACTION_REVIEW.json). Independent audit scripts are retained beside the evidence.

## Findings and rework

**S1-DATA-01: CLOSED_AFTER_REWORK.** Initial A2JSON had `rar.sf_members=[]` while its Markdown claimed21. Lead repaired CRLF-sensitive parsing and metadata. A8 independently reparsed the saved7-Zip listing and confirmed exactly21distinct SF paths matching the repaired array. This does not assert full RAR CRC testing: RAR was only inspected as a potential recovery source and supplied no recovered bundle.

**S1-EXTRACT-01: CLOSED_AFTER_REWORK.** A correct text-layer extraction is still not a faithful standalone substitute for all visual content:

- `9618_s23_qp_41`, PDF9: two assignment arrows in `PopAnimal()` are visible in the PDF but missing from extracted text. Variant43 shares the same extraction issue.
- `9618_s25_ms_41`, PDF31: underscores in constructor/attributes are visible but lost in text. This also exposes a separate source defect: the PDF itself prints `_init_` with single underscores. `9618_w23_ms_41`, PDF16 has the same source/extraction distinction.
- `9618_s21_qp_41`, PDF2: two pointer values sit beside a three-column linked-list table. Linear text alone does not preserve the layout relationship.
- Coursebook PDF1 is a readable image cover with no text layer. Cover is not a missing chapter; authors/title can be checked visually.

Required control implemented and independently rechecked: `EXTRACTION_POLICY.md` requires raw PDF/facsimile with code, pseudocode, tables, diagrams and screenshots; extracted text and editorial summaries are navigation aids. Policy records source defects separately. A8 verified every source ID, page sequence and image hash in `FACSIMILE_MANIFEST.json`: all 58 QP/MS documents, 1,396 images, no missing or mismatched images. Additional representative facsimiles were visually inspected during the index review. Raw PDFs remain authoritative at higher zoom. This closes the corpus fidelity-control issue without pretending lost symbols have been restored in text.

## Scope limits

No input archive code/macros or markscheme solutions were executed. `evidence.doc` is retained with integrity/signature checks as the candidate-answer container, separate from algorithm input. Source sample code remains subject to Stage5 verification. Full question coverage, MS/QP scoring relationships and aggregate index require separate QA.
