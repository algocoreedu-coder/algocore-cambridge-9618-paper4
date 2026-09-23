# A7 P4R-1 marking and assessment preparation review

**Review scope:** draft mapping/disposition only  
**P4R-0 dependency:** `PASS`  
**A7 prep decision:** `PASS_FOR_P4R1_REVIEW_WITH_REQUIRED_FINDINGS`  
**Gate authority:** none — this report does not sign P4R-1, promote canonical content, or close the findings below.

## Exact-set result

The draft maps retain the P4R-0 identities exactly:

| Entity | Expected | Draft | Identity |
|---|---:|---:|---|
| Marking atoms | 2,236 | 2,236 | PASS |
| Marking chains / patterns | 58 | 58 | PASS |
| Assessment requirements | 107 | 107 | PASS |
| Assessment destinations | 37 | 37 | PASS |
| Practice items | 78 | 78 | PASS |
| A0-normalized legacy IDs | 15 | 15 | PASS |

`MARKING_DISPOSITION_DRAFT.json` partitions every atom into exactly one pattern chain. Each atom preserves its Stage 4 pattern owner, lesson, part/question/paper identity, official QP locator, official MS locator, award semantics, dependency/group data, method-step references and source mark value. The union of the 58 chains is exactly the 2,236-atom set.

`ASSESSMENT_ITEM_MAP_DRAFT.json` retains every requirement, destination and practice identity. The 15 IDs assigned in `PRACTICE_ID_ASSIGNMENT.json` are present unchanged and are explicitly labelled with `A0_LEAD_ID_NORMALIZATION` authority.

## Authority result

- All 2,236 marking atoms have direct `official_qp` and `official_ms` locators. Their concise criterion text remains an editorial paraphrase bounded by the cited source context.
- 68 atoms have no unambiguous atom-level source mark value. Their value remains `null`; no value was inferred from a part total, group maximum, method step or wording.
- 293 atoms retain Stage 4 source issue references. They affect 24 chains and remain visible as carried source caveats; this draft does not silently remove or re-adjudicate them.
- All 107 assessment requirements, 37 destinations and 78 self-rubrics are labelled AlgoCore-authored. Their `official_marks` value is `null`. No practice rubric is presented as a Cambridge mark scheme.

## Required findings

1. **36 assessment requirements have no Stage 4 pattern-card link.** They remain linked to lesson, objective, knowledge block and destination, but their method/pattern join needs an authored or explicit no-pattern disposition.
2. **Six lessons have no Stage 4 pattern:** `testing`, `dictionary`, `random-files`, `exceptions`, `performance`, and `graphs`. Their 18 practice items therefore have no valid pattern join. No neighbouring pattern was assigned by inference.
3. **Fifteen legacy `practiceFlow` records have no explicit bilingual prompt.** The A0 IDs, fixtures, hints, feedback and topic rubric were retained; `prompt` remains `null` rather than being invented.
4. **All 78 current practice items lack source-authored requirement/destination semantics in Stage 9.** The draft records lesson-scope joins only and labels them `LESSON_SCOPE_ONLY_NOT_PROMPT_PROVEN`; prompt-level assessment alignment still needs A7 review after content authoring.
5. **Forty-two practice items use one of the broad requirement/state/code rubric signatures.** They require destination-specific success criteria before release.
6. **Thirty-three practice items have no explicit pass rule:** 18 regular `practiceItems` plus the 15 legacy `practiceFlow` records. The draft preserves `null`.

These findings make the assessment draft `DRAFT_REWORK_REQUIRED`. They do not invalidate the exact-set inventory; they define the work that content production must close.

## Required closure in the next production waves

- A1/A2/A7 must disposition the 36 requirement-to-pattern gaps and decide whether each needs a new pattern, a reviewed cross-lesson pattern join, or an explicit pattern-independent assessment contract.
- A2/A7 must write explicit bilingual prompts and pass rules for the 15 legacy items without changing their A0 IDs.
- A2/A7 must replace broad rubrics with requirement- and destination-specific evidence criteria and prove each item’s prompt-level requirement alignment.
- A7 must recheck guided → faded → independent progression after the final Python artifacts and fixtures exist. Lesson-scope joins in this draft are not sufficient evidence.
- Any public representative marking chain must retain direct QP/MS locators and the Stage 4 caveat/transfer limits. AlgoCore rubrics must remain visually and structurally separate from official source evidence.

## Reproduction and read-only evidence

Run from the `Computer_Science` workspace root:

```powershell
python A_Level_CS_page/planning/paper4/next-phase/evidence/p4r-1/a7/build-a7-drafts.py
python A_Level_CS_page/planning/paper4/next-phase/evidence/p4r-1/a7/check-a7-drafts.py
```

The builder was run twice and produced byte-identical outputs. The read-only checker was run twice and produced identical output while its before/after hash snapshot remained unchanged.

| Draft | SHA-256 |
|---|---|
| `MARKING_DISPOSITION_DRAFT.json` | `e7f38c44b6a45e051b47e3cc32c3d495287a41ada1bafd3964e49a17be3f0fa7` |
| `ASSESSMENT_ITEM_MAP_DRAFT.json` | `d4305d4aa716af6776535b3674f2cb836fc8e7a28c0b262f5981263701cedd24` |

Checker result: `PASS_WITH_REQUIRED_DRAFT_FINDINGS`. It validates exact identity, all lesson/pattern/requirement/destination references, authority labels, null official assessment marks, direct QP/MS locators, A0 ID preservation and read-only execution.
