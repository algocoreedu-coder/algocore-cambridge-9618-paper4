import type { Localized } from "./types";

// A colon is allowed only as a non-empty namespace separator. This keeps
// canonical IDs such as `book:B101-01` valid without admitting empty segments,
// trailing separators, paths, whitespace, or URL-like identifiers.
export const PAPER2_STABLE_ID_PATTERN = /^[A-Za-z0-9](?:[A-Za-z0-9._-]|:(?=[A-Za-z0-9])){0,119}$/;

export const PAPER2_COVERAGE_TAXONOMIES = [
  "book",
  "syllabus",
  "subskill",
  "past_paper_family",
  "pattern",
  "topic",
] as const;

export const PAPER2_COVERAGE_CLASSIFICATIONS = [
  "full",
  "partial",
  "missing",
  "not_applicable",
] as const;

export type Paper2CoverageTaxonomy = (typeof PAPER2_COVERAGE_TAXONOMIES)[number];
export type Paper2CoverageClassification = (typeof PAPER2_COVERAGE_CLASSIFICATIONS)[number];

export interface Paper2ReviewRecord {
  readonly author: string;
  readonly independentReviewer: string;
  readonly reviewedRevision: string;
  readonly decision: "approved" | "changes_required" | "blocked";
  readonly reviewedAt: string;
  readonly rationale?: string;
}

export interface Paper2EvidenceBinding {
  readonly kind: "content" | "visual" | "question" | "set" | "mock";
  readonly id: string;
  readonly version?: string;
}

export interface Paper2CoverageUnit {
  readonly coverageId: string;
  readonly taxonomy: Paper2CoverageTaxonomy;
  readonly title: Localized;
  readonly classification: Paper2CoverageClassification;
  readonly weight: number;
  readonly topicIds: readonly string[];
  readonly sourceIds: readonly string[];
  readonly evidenceBindings: readonly Paper2EvidenceBinding[];
  readonly review: Paper2ReviewRecord;
  readonly notApplicableRationale?: string;
}

export interface Paper2ContractIssue {
  readonly code: string;
  readonly path: string;
  readonly message: string;
}

export type Paper2ValidationResult<T> =
  | { readonly ok: true; readonly value: T; readonly issues: readonly [] }
  | { readonly ok: false; readonly issues: readonly Paper2ContractIssue[] };

export interface Paper2CoverageRegistryOptions {
  readonly exactBookCount?: number;
  readonly exactSyllabusCount?: number;
  readonly validTopicIds?: ReadonlySet<string>;
  readonly validSourceIds?: ReadonlySet<string>;
  readonly validEvidenceIds?: ReadonlySet<string>;
}

export interface Paper2CoverageScore {
  readonly numerator: number;
  readonly denominator: number;
  readonly percentage: number;
}

export function isPaper2StableId(value: unknown): value is string {
  return typeof value === "string" && PAPER2_STABLE_ID_PATTERN.test(value);
}

export function isPaper2Localized(value: unknown): value is Localized {
  if (!isRecord(value)) return false;
  return typeof value.en === "string" && value.en.trim().length > 0
    && typeof value.vi === "string" && value.vi.trim().length > 0;
}

export function isIsoDateTime(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0 && Number.isFinite(Date.parse(value));
}

export function validationSuccess<T>(value: T): Paper2ValidationResult<T> {
  return { ok: true, value, issues: [] };
}

export function validationFailure<T = never>(issues: readonly Paper2ContractIssue[]): Paper2ValidationResult<T> {
  return { ok: false, issues };
}

export function validateCoverageUnit(value: unknown, path = "coverageUnit"): Paper2ValidationResult<Paper2CoverageUnit> {
  const issues: Paper2ContractIssue[] = [];
  if (!isRecord(value)) {
    return validationFailure([{ code: "COVERAGE_NOT_OBJECT", path, message: "Coverage unit must be an object." }]);
  }

  requireStableId(value.coverageId, `${path}.coverageId`, issues);
  if (!PAPER2_COVERAGE_TAXONOMIES.includes(value.taxonomy as Paper2CoverageTaxonomy)) {
    issues.push(issue("COVERAGE_TAXONOMY_INVALID", `${path}.taxonomy`, "Unknown coverage taxonomy."));
  } else if (isPaper2StableId(value.coverageId) && !coverageNamespaceMatches(value.coverageId, value.taxonomy as Paper2CoverageTaxonomy)) {
    issues.push(issue("COVERAGE_NAMESPACE_MISMATCH", `${path}.coverageId`, "Coverage ID must use the taxonomy namespace."));
  }
  if (!isPaper2Localized(value.title)) issues.push(issue("COVERAGE_TITLE_INVALID", `${path}.title`, "English and Vietnamese titles are required."));
  if (!PAPER2_COVERAGE_CLASSIFICATIONS.includes(value.classification as Paper2CoverageClassification)) {
    issues.push(issue("COVERAGE_CLASSIFICATION_INVALID", `${path}.classification`, "Unknown coverage classification."));
  }
  if (typeof value.weight !== "number" || !Number.isFinite(value.weight) || value.weight <= 0) {
    issues.push(issue("COVERAGE_WEIGHT_INVALID", `${path}.weight`, "Coverage weight must be a positive finite number."));
  }
  validateIdArray(value.topicIds, `${path}.topicIds`, issues, false);
  validateIdArray(value.sourceIds, `${path}.sourceIds`, issues, false);
  if ((value.taxonomy === "book" || value.taxonomy === "syllabus") && (!Array.isArray(value.sourceIds) || value.sourceIds.length === 0)) {
    issues.push(issue("COVERAGE_SOURCE_REQUIRED", `${path}.sourceIds`, "Book and syllabus claims require at least one source."));
  }
  if (!Array.isArray(value.evidenceBindings)) {
    issues.push(issue("COVERAGE_EVIDENCE_INVALID", `${path}.evidenceBindings`, "Evidence bindings must be an array."));
  } else {
    value.evidenceBindings.forEach((binding, index) => validateEvidenceBinding(binding, `${path}.evidenceBindings[${index}]`, issues));
  }
  validateReview(value.review, `${path}.review`, issues);
  if (value.taxonomy === "syllabus" && value.classification === "not_applicable") {
    if (typeof value.notApplicableRationale !== "string" || value.notApplicableRationale.trim().length === 0) {
      issues.push(issue("COVERAGE_NA_RATIONALE_REQUIRED", `${path}.notApplicableRationale`, "A Teacher-signed rationale is required for a syllabus exclusion."));
    }
    const review = isRecord(value.review) ? value.review : null;
    if (!review || review.decision !== "approved" || typeof review.independentReviewer !== "string" || review.independentReviewer.trim().length === 0) {
      issues.push(issue("COVERAGE_NA_REVIEW_REQUIRED", `${path}.review`, "A syllabus exclusion requires an approved independent review."));
    }
  }

  return issues.length === 0 ? validationSuccess(value as unknown as Paper2CoverageUnit) : validationFailure(issues);
}

export function validateCoverageRegistry(
  value: unknown,
  options: Paper2CoverageRegistryOptions = {},
): Paper2ValidationResult<readonly Paper2CoverageUnit[]> {
  if (!Array.isArray(value)) {
    return validationFailure([{ code: "COVERAGE_REGISTRY_NOT_ARRAY", path: "coverage", message: "Coverage registry must be an array." }]);
  }
  const issues: Paper2ContractIssue[] = [];
  const units: Paper2CoverageUnit[] = [];
  const seen = new Set<string>();
  value.forEach((candidate, index) => {
    const result = validateCoverageUnit(candidate, `coverage[${index}]`);
    if (!result.ok) {
      issues.push(...result.issues);
      return;
    }
    if (seen.has(result.value.coverageId)) issues.push(issue("COVERAGE_ID_DUPLICATE", `coverage[${index}].coverageId`, "Coverage IDs must be unique."));
    seen.add(result.value.coverageId);
    units.push(result.value);
  });

  checkExpectedCount(units, "book", options.exactBookCount, issues);
  checkExpectedCount(units, "syllabus", options.exactSyllabusCount, issues);
  for (const [index, unit] of units.entries()) {
    checkReferences(unit.topicIds, options.validTopicIds, `coverage[${index}].topicIds`, "COVERAGE_TOPIC_UNRESOLVED", issues);
    checkReferences(unit.sourceIds, options.validSourceIds, `coverage[${index}].sourceIds`, "COVERAGE_SOURCE_UNRESOLVED", issues);
    checkReferences(unit.evidenceBindings.map((binding) => binding.id), options.validEvidenceIds, `coverage[${index}].evidenceBindings`, "COVERAGE_EVIDENCE_UNRESOLVED", issues);
  }
  return issues.length === 0 ? validationSuccess(units) : validationFailure(issues);
}

export function calculateCoverageScore(units: readonly Paper2CoverageUnit[]): Paper2CoverageScore {
  let numerator = 0;
  let denominator = 0;
  for (const unit of units) {
    if (unit.classification === "not_applicable") continue;
    denominator += unit.weight;
    if (unit.classification === "full") numerator += unit.weight;
    if (unit.classification === "partial") numerator += unit.weight * 0.5;
  }
  return {
    numerator,
    denominator,
    percentage: denominator === 0 ? 0 : Math.round((numerator / denominator) * 1000) / 10,
  };
}

function coverageNamespaceMatches(id: string, taxonomy: Paper2CoverageTaxonomy) {
  const prefixes: Record<Paper2CoverageTaxonomy, readonly string[]> = {
    book: ["book:"],
    syllabus: ["syllabus:"],
    subskill: ["subskill:"],
    past_paper_family: ["family:"],
    pattern: ["F"],
    topic: ["T"],
  };
  return prefixes[taxonomy].some((prefix) => id.startsWith(prefix));
}

function validateEvidenceBinding(value: unknown, path: string, issues: Paper2ContractIssue[]) {
  if (!isRecord(value)) {
    issues.push(issue("COVERAGE_EVIDENCE_NOT_OBJECT", path, "Evidence binding must be an object."));
    return;
  }
  if (!["content", "visual", "question", "set", "mock"].includes(String(value.kind))) {
    issues.push(issue("COVERAGE_EVIDENCE_KIND_INVALID", `${path}.kind`, "Unknown evidence binding kind."));
  }
  requireStableId(value.id, `${path}.id`, issues);
  if (value.version !== undefined && (typeof value.version !== "string" || value.version.trim().length === 0)) {
    issues.push(issue("COVERAGE_EVIDENCE_VERSION_INVALID", `${path}.version`, "Evidence version must be a non-empty string."));
  }
}

function validateReview(value: unknown, path: string, issues: Paper2ContractIssue[]) {
  if (!isRecord(value)) {
    issues.push(issue("REVIEW_NOT_OBJECT", path, "Review metadata must be an object."));
    return;
  }
  for (const key of ["author", "independentReviewer", "reviewedRevision"] as const) {
    if (typeof value[key] !== "string" || value[key].trim().length === 0) issues.push(issue("REVIEW_FIELD_REQUIRED", `${path}.${key}`, `${key} is required.`));
  }
  if (!["approved", "changes_required", "blocked"].includes(String(value.decision))) issues.push(issue("REVIEW_DECISION_INVALID", `${path}.decision`, "Unknown review decision."));
  if (!isIsoDateTime(value.reviewedAt)) issues.push(issue("REVIEW_DATE_INVALID", `${path}.reviewedAt`, "Review date must be an ISO-compatible timestamp."));
}

function validateIdArray(value: unknown, path: string, issues: Paper2ContractIssue[], requireNonEmpty: boolean) {
  if (!Array.isArray(value) || (requireNonEmpty && value.length === 0)) {
    issues.push(issue("ID_ARRAY_INVALID", path, "Expected an array of stable IDs."));
    return;
  }
  value.forEach((id, index) => requireStableId(id, `${path}[${index}]`, issues));
  if (new Set(value).size !== value.length) issues.push(issue("ID_ARRAY_DUPLICATE", path, "IDs within this array must be unique."));
}

function requireStableId(value: unknown, path: string, issues: Paper2ContractIssue[]) {
  if (!isPaper2StableId(value)) issues.push(issue("ID_INVALID", path, "ID does not satisfy the Paper 2 stable-ID contract."));
}

function checkExpectedCount(units: readonly Paper2CoverageUnit[], taxonomy: Paper2CoverageTaxonomy, expected: number | undefined, issues: Paper2ContractIssue[]) {
  if (expected === undefined) return;
  const actual = units.filter((unit) => unit.taxonomy === taxonomy).length;
  if (actual !== expected) issues.push(issue("COVERAGE_COUNT_MISMATCH", "coverage", `Expected ${expected} ${taxonomy} records, found ${actual}.`));
}

function checkReferences(values: readonly string[], valid: ReadonlySet<string> | undefined, path: string, code: string, issues: Paper2ContractIssue[]) {
  if (!valid) return;
  values.forEach((value) => {
    if (!valid.has(value)) issues.push(issue(code, path, `Unresolved reference: ${value}.`));
  });
}

function issue(code: string, path: string, message: string): Paper2ContractIssue {
  return { code, path, message };
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
