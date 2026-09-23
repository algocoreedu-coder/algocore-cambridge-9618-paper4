# Paper 4 canonical content v2

This directory is the authored source for `paper4-2026-s9-v2`. Files under `app/data/` are generated release outputs and must not be edited as the canonical source.

## Layout

- `schema/`: v2 record contracts and validation fixtures.
- `mappings/`: locked Stage 3–9 disposition maps promoted through P4R-1.
- `lessons/`: bilingual KnowledgeUnit and method content, owned by lesson batch.
- `python/`: versioned PythonArtifact sources, fixtures and execution evidence.
- `visuals/`: scenario-specific traces and event-to-line bindings.
- `assessments/`: MarkingChain and AssessmentItem records with explicit authority.
- `generated/`: deterministic compiler output only; never an authoring input.

## Required workflow

1. Edit the appropriate canonical source record.
2. Run the relevant read-only checker.
3. Generate a candidate into a temporary output directory.
4. Run cross-document and learner-visible checks.
5. Promote only a reviewed candidate.

VI and EN share IDs, Python source, fixtures, traces and event state. Cambridge/coursebook locators support only the claim recorded with them. AlgoCore-authored guidance and rubrics must remain visibly distinct from official marking evidence.
