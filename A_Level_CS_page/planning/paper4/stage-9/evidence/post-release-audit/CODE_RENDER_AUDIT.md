# Independent post-release audit — Python code rendering

Date: 2026-09-22  
Reviewer role: independent UI/render audit  
Scope: current Stage 9 registry, `LessonLearningPage` renderer and live localhost pages in VI/EN. No app files were changed by this audit.

## Verdict

**REWORK REQUIRED.** The learner's observation is valid. Python exists in the registry, but the released content model did not guarantee a visible semantic code block. The current workspace contains a partial renderer remediation: 21 of 26 lessons now have structured `python`/`code` values that can render as `<figure><pre><code>`. Five lessons still store the complete worked example, including fenced-looking backticks, in one scalar string, so they remain ordinary prose.

The five affected lessons are:

- `queue`
- `linked-list`
- `recursion`
- `dictionary`
- `hashing`

Both locales use the same shape, so this affects **10 of 52 VI/EN lesson routes**. The 21 structured lessons account for **198 Python source lines per locale** in their worked-example blocks. All 26 extracted snippets parse as Python, but parse success does not establish runtime correctness, exam completeness or adequate teaching depth.

## Evidence

### Registry shape

| Measure | Result |
|---|---:|
| Lessons | 26 |
| Lessons with a nested `python`, `code` or `pseudocode` field | 21 |
| Lessons whose Python remains inside one prose string | 5 |
| Structured Python lines in VI worked examples | 198 |
| Extracted snippets passing `ast.parse` | 26/26 |

The five scalar lessons embed code as text such as `Python: \`def enqueue(...)\``. Their block has no typed code child, so `ContentValue` reaches its generic string branch and produces a `<p>`. HTML collapses indentation and line breaks; the backticks are literal characters rather than Markdown syntax.

The current renderer recognizes code only when an object key is exactly `python`, `code` or `pseudocode` (`LessonLearningPage.tsx:127-159`). Structured arrays are joined with newline characters, then rendered in a focusable `<pre><code>`. Styles at `LessonLearningPage.module.css:157-195` preserve whitespace and provide horizontal overflow. This remediation makes code selectable and readable in 21 lessons, but it cannot detect the five scalar records.

### Live localhost inspection

Representative pages were checked at `http://127.0.0.1:3018`.

| Route | Observed worked-example rendering |
|---|---|
| `/paper-4/lessons/data-models?lang=vi#worked-example` | A labeled Python figure is now present. Six source lines appear in a semantic `<pre><code>` block. |
| `/paper-4/lessons/data-models?lang=en#worked-example` | Same code and structure as VI, with an English label. |
| `/paper-4/lessons/oop-model?lang=vi#worked-example` | A semantic Python block is present. |
| `/paper-4/lessons/testing?lang=vi#worked-example` | A semantic Python block is present. |
| `/paper-4/lessons/queue?lang=vi#worked-example` | The entire requirement, design, Python, trace and evidence are one paragraph. Backticks are visible literally; indentation is collapsed. No learner-facing code block is present. |

The accessibility tree for `queue` exposes only one text node for the worked example. It reads the function lines continuously after `Python:`. This confirms the problem is rendered structure, not only color or styling.

### Action View does not display the lesson's Python

The Action View panel titled “Mã lệnh / Code” currently shows symbolic Stage 7 identifiers such as `queue-dequeue.step.contract` and `array-append.step.contract`. The Stage 8 registry repeats these contract IDs in its source-line field. These are event references, not Python source lines. Consequently, the visual can animate state while giving learners no line-by-line connection to the Python solution.

### Stage 0 contract comparison

Stage 0 requires:

- worked example order `Requirement → design → Python → trace → output/test → evidence` (`LEARNING_PAGE_CONTRACT.md:19`);
- wide code and trace to scroll inside their own labeled region (`LEARNING_PAGE_CONTRACT.md:60`);
- selectable text code rather than code embedded in an image (`A1_LEARNING_PAGE_AUDIT.md:107`);
- narrow viewport, zoom, light/dark and horizontal overflow checks (`A1_LEARNING_PAGE_AUDIT.md:111`);
- Action View code highlighting and state/trace to share one verified execution model.

The partial semantic renderer meets selectability and overflow for the 21 structured lessons. The five scalar lessons fail these requirements. Action View also fails the shared Python-line requirement because it displays abstract contract identifiers.

## Findings

### CR-01 — Required — Five lessons have no semantic Python code block

**Trigger:** open any affected lesson and scroll to “Ví dụ có hướng dẫn”.  
**Actual:** code is part of a normal paragraph, with literal backticks and collapsed indentation.  
**Required:** normalize the worked example into structured requirement, design, Python, trace, expected output, tests and evidence fields. Render Python in a labeled `<pre><code class="language-python">` block in both locales.

### CR-02 — Required — The content schema does not model code as a first-class artifact

`LearningContent` is a recursive union of primitives, lists and arbitrary maps. Code semantics are inferred from three property names. This allowed two valid-looking content shapes to reach release with different behavior. Introduce a typed `CodeArtifact` with stable ID, language, source, caption, optional filename, line highlights, fixture refs, execution evidence and source refs. VI/EN must share code/fixtures and localize only caption and explanation.

### CR-03 — Required — Action View code lines are event contract IDs

Bind each event's `source_code_lines` to actual stable line IDs in the lesson's Python artifact. The code panel must show the full source, visually highlight the active lines and preserve the same code, fixtures and trace used by the worked example. A contract ID may remain provenance metadata, but must not be presented as source code.

### CR-04 — Major — Visual treatment is readable but incomplete

The current partial remediation provides monospace text, focus, preserved whitespace and horizontal scroll. It has no syntax token styling, line numbers, copy control, filename/example label, or direct execution-evidence link. The `language-python` class is present but no syntax highlighter is active. The fixed `#07111f` mixed into the background should become a shared theme token to keep the Stage 0 visual contract centralized.

### CR-05 — Required — Release QA did not assert rendered code coverage

A content-count gate can pass with 260 blocks while code remains visually absent. Add a detached browser gate that visits every lesson in both locales and inspects the worked example. Every core practical lesson must have at least one visible semantic Python block; a supporting-theory lesson needs an explicit exemption record. The gate must also check preserved indentation, identical VI/EN source, keyboard focus, selection/copy, 320 px overflow containment, dark theme and accessible caption.

### CR-06 — Major — One short snippet per lesson is not enough evidence of full Paper 4 code coverage

The registry presently concentrates Python in the worked example. Practice commonly requests “Python” as an expected artifact but does not supply a structured starter, skeleton, model solution or test harness. A separate academic/code audit must map each syllabus capability and exam pattern to executable examples, variants and tests. This UI audit does not certify topical completeness or runtime correctness.

## Recommended implementation contract

1. Define `CodeArtifact` independently from localized prose:

   ```text
   id, language=python, source, filename?, caption{vi,en},
   line_ids[], highlight_groups[], fixture_refs[], expected_output_refs[],
   execution_evidence_ref, source_refs[], version
   ```

2. Reference code artifacts from `worked-example`, `method`, `practice`, `retrieval` and Action View rather than copying source into arbitrary content maps.
3. Normalize the five scalar lessons first. Reject inline backtick Python during registry build.
4. Render a semantic figure with localized caption, `<pre tabindex="0">`, `<code>`, preserved newlines, horizontal scroll, visible focus and a copy action. Line numbers must remain outside the copied source.
5. Connect trace events to stable code line IDs. The worked example, highlighted visual source and executable verification must use the same artifact version and fixtures.
6. Require, for each core practical lesson, a full worked solution plus guided starter, faded scaffold and independent task. Model solutions may remain revealable, but the code artifact and expected evidence must be structured.
7. Add build checks for exact VI/EN code equality, parse success, no tabs/indent loss, no scalar `Python: \`...\`` form, and valid execution-evidence hashes.
8. Add browser checks over 52 locale routes and fail release when a required code figure is absent or when the page itself overflows at 320 px.

## Gate recommendation

Reopen the Stage 9 release gate for Python presentation and do not treat the current release as content-complete. CR-01, CR-02, CR-03 and CR-05 are release blockers. CR-04 and CR-06 should be assigned to the same remediation wave and the broader academic/code coverage review respectively.
