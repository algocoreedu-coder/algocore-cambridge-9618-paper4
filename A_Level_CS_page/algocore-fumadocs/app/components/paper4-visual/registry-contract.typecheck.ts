import lesson from "../../data/paper4-v2/lessons/data-models.json";

import type { PatternMetadata, PythonArtifactDto } from "./types";

// Compile-time sample assertions for the generated v2 DTO boundary. Runtime
// chunks are fetched lazily and validated by traceLoader instead of imported.
export const generatedPatternContractCheck: readonly PatternMetadata[] = lesson.visual.owned_patterns;
export const generatedPythonContractCheck: PythonArtifactDto = lesson.python;
