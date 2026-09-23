# P4R-3 A2 theory production review

**Status:** `PASS`  
**Authority:** A2 author evidence; this is not a Lead gate signature.

## Delivered scope

A2 authored exactly **82 KnowledgeUnit envelopes for the 20 non-pilot lessons** in batches C1-C7. Every unit preserves its Stage 3 `knowledge_unit_id` one-to-one and lives under `content/paper4/lessons/production/<lesson>/`.

Each unit contains:

- direct 2026 syllabus locators and coursebook section/page locators copied from the approved P4R-1 source maps;
- independently authored Vietnamese and English title, explanation, Python connection, representation and invariant/rule;
- two bilingual misconceptions and two bilingual exam signals;
- a normal, boundary or failure micro-example;
- a hidden bilingual self-check;
- the approved production PythonArtifact ID and a semantic code-link intent.

The content introduces no Cambridge mark claim. Teaching explanations, examples and self-checks are labelled AlgoCore-authored.

## Verification

The read-only checker passed with:

| Check | Result |
|---|---:|
| Stage 3 IDs | 82/82 |
| Lesson counts | 20/20 |
| Objective locators | 167 |
| Coursebook locators | 150 |
| Explanation semantic parity | 82/82 |
| Python-connection semantic parity | 82/82 |
| Representation semantic parity | 82/82 |
| Concrete fixture-scenario parity | 82/82 |
| Semantic code-link intents | 82/82 resolved |
| Active line bindings | 82/82 |
| Bound production artifacts | 20/20 |
| A3 line-role map matches | 82/82 |
| Local path leaks | 0 |
| Schema/registry errors | 0 |
| Determinism check | PASS |
| Node 20.11.0 | PASS |
| Node 24.19.0 | PASS |
| A6 bilingual pairs checked | 6,141 |
| A6 terminology occurrences | 105 |
| A6 hard findings | 0 |
| A6 content decision | PASS |

The deterministic aggregate SHA-256 is `134400d136f1db71fc058942a116622a32ec29c48721681d3973d4987d1bccb1`.

Commands:

```text
node scripts/build-p4r3-theory-production.mjs --check
node scripts/check-p4r3-theory-production.mjs
```

## Frozen Python line resolution

All 82 units now carry at least one real `active_line_id` from the exact `production-v1` PythonArtifact. Their code-link records use `status = RESOLVED_A3_FROZEN_LINE_ROLE_MAP` and preserve the lesson, semantic role, artifact version, matched code text and resolved IDs from A3's frozen map.

The strengthened checker reads all 20 current `artifact.json` files and A3's `LINE_ROLE_MAP.json`. It requires each KnowledgeUnit binding to equal the map, each line ID to exist in the correct artifact, the mapped code text to occur at a bound line, and artifact ID, lesson ID and version to match. There is no remaining A2/A3 line-binding carryover.

## Bilingual parity remediation

The deterministic generator now builds the four reviewed fields from the same facts in both languages:

- `explanation` uses the same unit title and per-unit invariant;
- `python_connection` uses the same artifact ID, bound line IDs, matched code text and invariant;
- `representation` uses the same semantic role, bound decision lines, before/change/after state and invariant;
- `micro_example.scenario` uses the same real fixture ID, exact JSON input and expected rule.

The Vietnamese text consistently uses **cây nhị phân**, **danh sách liên kết** and **tệp truy cập ngẫu nhiên** when the English peer refers to binary trees, linked lists or random files. Stable technical tokens and numeric constraints are mirrored. The corrected A6 checker passes all 6,141 bilingual pairs and 105 terminology occurrences with zero hard findings.
