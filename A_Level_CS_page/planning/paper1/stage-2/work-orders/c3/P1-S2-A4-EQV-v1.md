# P1-S2-A4-EQV-v1 — Variant equivalence and candidate completeness

Issued by A0 after C3a PASS. The exact 177-file input manifest, including 60 original QP/MS PDFs, has SHA256 `a72d3a65d834ed0ad5196dfdd5b33790add4ee72450de95af8decd6bba1487a4`. C3a gate decision SHA256 is `1a0b79580db88b3925ff87456a8a40302c03c666d47cd07b4a6d10b7d40516d9`.

## Owner, independence and write allowlist

Owner: a fresh A4 equivalence author who is different from the C3a/C3c author. This author cannot later own split/holdout or review this artifact. Do not spawn agents. Write only:

`A_Level_CS_page/planning/paper1/stage-2/evidence/a4/equivalence-v1/`

Do not modify C3a, C2, A0/reviewer evidence, trackers, Stage 0/1, app, lessons or translations.

## Exactly twelve outputs

1. `CANDIDATE_PAIR_UNIVERSE.jsonl`
2. `CANDIDATE_GENERATION_MANIFEST.json`
3. `CANDIDATE_GENERATION_CONFIG.json`
4. `generate_candidate_pairs.py`
5. `VARIANT_RELATION_REGISTER.jsonl`
6. `EQUIVALENCE_GROUPS.json`
7. `REJECTED_PAIR_AUDIT.json`
8. `CONTRADICTION_UNRESOLVED_REPORT.md`
9. `QA.json`
10. `INPUT_MANIFEST.json` — exact issued copy
11. `OUTPUT_MANIFEST.json`
12. `HANDOFF.json`

The output manifest pins files 1–10. The handoff pins files 1–11 without circular self-hash. The generator must support `--verify-universe` to recompute and compare the generation-owned projection without overwriting human review fields.

## Eligible universe and deterministic identity

Rehash all inputs before work; drift is Critical. Eligible nodes are exactly the 893 `ASSESSMENT_UNIT` rows. Exclude all 379 containers and 128 unresolved context records. The complete unordered pair space is 398,278 pairs. Canonicalize `left_id < right_id` by Unicode code-point order; reject self/reversed duplicates. `pair_id` is `eqp-` plus the first 24 hex characters of SHA256(`left_id + "|" + right_id`).

Use UTF-8/LF, stable field and row ordering and locale-independent sorting. Normalize QP text from the atomic prompt plus required parent/context text and MS text only from linked official evidence. Use NFKC, lowercase, normalized quotes/dashes/whitespace, preserve negation/operators, replace standalone decimal/hex/binary numeric literals with typed placeholders and quoted identifiers with `<id>`. Retain both strict and skeleton fingerprints. Pin normalization version, field paths, runtime/library versions and thresholds in config.

## Eight mandatory high-recall channels

Store every triggered channel and metric for every candidate.

1. `QP_EXACT_STRICT`: same strict normalized-prompt SHA256.
2. `QP_EXACT_SKELETON`: same skeleton SHA256.
3. `SAME_SESSION_CROSS_COMPONENT`: same year and session, different component; include every such pair.
4. `REQ_RESPONSE_MARKS_OR_STIMULUS`: nonempty primary-requirement intersection, identical response product, and either equal displayed marks or nonempty normalized stimulus-signature overlap.
5. `MS_STRUCTURAL`: identical MS structural fingerprint or MS-token Jaccard at least 0.60. Signature includes evidence kind, claim precision, marking behaviour, grouped/capped/threshold flags, alternative count, marks and normalized official-condition tokens.
6. `QP_TEXT_STRUCTURE`: QP word-token Jaccard at least 0.55 or character-trigram Dice at least 0.70.
7. `STRUCTURE_COMPOSITE`: at least four of response product, marks, command word, primary-requirement overlap, stimulus overlap and dependency/visual class match, plus QP word Jaccard at least 0.35 or MS Jaccard at least 0.40.
8. `SAME_PROVISIONAL_PATTERN`: identical accepted C3a provisional pattern ID.

Same topic/component alone is never a channel or equivalence decision.

## Candidate and relation review

Every candidate row contains `schema_version`, canonical pair IDs, all channels/metrics, risk stratum, `review_required=true`, review disposition, relation ID, exact reviewed QP/MS references, `author_review_status=COMPLETE` and notes. Every candidate must link to exactly one relation; insufficient evidence becomes reviewed `UNRESOLVED`, never unreviewed.

Allowed relations are `DUPLICATE`, `PARALLEL_EQUIVALENT`, `RELATED_NOT_EQUIVALENT`, `DISTINCT` and `UNRESOLVED`. Each relation records construct, response demand, stimulus/dependency semantics, marks and marking-condition comparisons; primary-requirement comparison; exact QP and MS evidence; rationale; quarantine flag; and completion state.

`DUPLICATE` and `PARALLEL_EQUIVALENT` are positive. A positive relation requires all five comparison dimensions true and both QP/MS evidence. `DUPLICATE` additionally requires strict QP+MS identity apart from formatting/source identity. `PARALLEL_EQUIVALENT` permits wording/data changes only when construct, response demand, dependency/stimulus semantics, marks and marking conditions remain equivalent. `RELATED_NOT_EQUIVALENT` shares construct/objective but fails at least one equivalence dimension. `DISTINCT` has no material equivalence after source review. `UNRESOLVED` records incomplete/ambiguous evidence and requires quarantine.

## Groups and contradiction controls

`EQUIVALENCE_GROUPS.json` covers all 893 units exactly once. Positive connected components form equivalence groups and cite positive relation IDs. Split-guard components are formed from positive plus unresolved edges and carry quarantine state. Reject negative/unresolved relations inside a positive component, incompatible marks/conditions inside a positive component, dangling units and multi-group membership.

## Reproducible complement audit

The complement is all 398,278 eligible pairs minus the candidate universe. Use seed `P1-S2-C3B-COMPLEMENT-v1` and rank SHA256(`seed + "|" + stratum + "|" + pair_id`) ascending without replacement.

Use mutually exclusive priority strata:

- R1: QP word similarity 0.45–<0.55 or trigram 0.60–<0.70.
- R2: MS similarity 0.45–<0.60.
- R3: shared primary requirement but response differs or no marks/stimulus trigger.
- R4: same response product and marks with no other channel.
- R5: remainder.

Sample `min(N,100)` from R1–R4 and `min(N,200)` from R5, maximum 600. Store population, target, exact sampled pair IDs, QP/MS refs, decision, rationale and false-negative flag. Zero observed false negatives is required. Any false negative invalidates universe/groups/audit: widen rules, issue a new artifact version, regenerate the full universe, review every candidate and rerun the audit.

## Machine acceptance

`QA.json` must independently show PASS for:

1. all 177 input hashes/bytes;
2. parse and exact twelve-output contract;
3. exactly 893 nodes and 398,278 pairs accounted by candidate plus complement;
4. generator/config rerun projection hash-identical;
5. all eight channels executed with raw/overlap counts reconciled;
6. canonical unique pair IDs, no self/reverse duplicates;
7. every candidate complete with exactly one relation;
8. every positive/unresolved relation has exact QP+MS evidence;
9. every positive satisfies all five equivalence dimensions;
10. all 893 units occur in exactly one positive group;
11. no graph contradiction or incompatible positive component;
12. split-guard components cover every positive/unresolved edge and unresolved implies quarantine;
13. complement sample reproduces from seed/strata with zero false negatives;
14. no container/unresolved-context promotion;
15. no final pattern/frequency, split/holdout, lesson, translation, app or Stage 3 claim;
16. manifest/handoff closure and write boundary.

## Reviewer and stop condition

A fresh A9 will rerun the generator, review 100% of positive/unresolved relations and the complete complement sample, sample negatives, and audit group consistency. A0 alone accepts C3b. Freeze the twelve-file handoff and stop; do not choose holdout, rebuild final patterns, reconcile glossary, integrate traceability or perform later work.
