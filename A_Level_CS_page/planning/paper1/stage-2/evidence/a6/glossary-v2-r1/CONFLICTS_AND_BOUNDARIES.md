# Glossary v2-r1 conflicts and terminology boundaries

This correction reconciles accepted glossary identities to accepted Stage 2 objective and final-pattern IDs. It does not revise technical definitions, approve Vietnamese candidates, translate learning content, or claim VI/EN parity.

## Linking rule

- Technical objective links require an exact canonical term or accepted alias in an accepted atomic requirement and a matching cited syllabus section.
- Technical pattern links require that focus-bearing requirement to occur in the accepted final pattern requirement_ids.
- Command-word pattern links are reconstructed by splitting each accepted command_words_observed value on semicolons, trimming each token and matching an exact canonical command word from the frozen register.
- No stemming, synonym, fuzzy or inferred command-word match is accepted.
- A missing exact bridge is recorded as NO_VERIFIED_FINAL_ID_LINK. It does not mean that the concept is outside the syllabus.

## Protected boundaries

- validation and verification remain distinct. A shared objective or pattern context does not assert synonymy or equivalence.
- check digit and checksum remain distinct mechanisms. A repeated classification qualifier cannot turn a sibling validation pattern into check-digit evidence.
- The check-digit objective link is supported only by focus-bearing REQ-6.2-02-07; qualifier-only REQ-6.2-02-01 through REQ-6.2-02-06 are excluded.
- bit and byte remain distinct. lower-case b and upper-case B remain separate symbols and require explicit case-sensitive context.
- accuracy and precision remain distinct. No synonym expansion or wider measurement-theory claim is introduced.
- Database labels table, record, field, attribute and relationship are section-guarded to their cited syllabus scope.
- primary key, candidate key and secondary key remain without reconstructed phrase links when accepted evidence only lists the modifiers.
- normalisation remains distinct from indexing. A morphological occurrence of normalised is not accepted as an exact normalisation link.

## Correction closure

- A4-GLO-V2-001: exactly 63 source-supported command-word term-pattern pairs were added after exact semicolon tokenization.
- A4-GLO-V2-002: exactly nine qualifier-leakage pattern links were removed from check digit, and six qualifier-only objective-evidence records were removed.
- A3-C3C-GLO-001 and A4-GLO-V2-003: the boundary text was regenerated with printable literal tokens and no prohibited ASCII controls.

Fresh A3 and A4 reviewers must independently retest the full packet. A fresh A9 review remains required before C4.
