import {
  isIsoDateTime,
  isPaper2StableId,
  isRecord,
  type Paper2ContractIssue,
  type Paper2ReviewRecord,
  type Paper2ValidationResult,
  validationFailure,
  validationSuccess,
} from "./coverage-types";

export const PAPER2_SOURCE_KINDS = [
  "syllabus",
  "pseudocode_guide",
  "question_paper",
  "mark_scheme",
  "published_book",
  "teacher_guide",
  "algocore_authored",
] as const;

export const PAPER2_RIGHTS_DISPOSITIONS = [
  "licensed",
  "permitted-excerpt",
  "external-link",
  "internal-reference-only",
  "teacher-created",
  "blocked",
] as const;

export const PAPER2_RIGHTS_REVIEW_STATUSES = ["pending", "approved", "rejected", "revoked"] as const;
export const PAPER2_ALLOWED_USES = [
  "learner-display",
  "learner-adaptation",
  "learner-excerpt",
  "external-link",
  "teacher-material",
  "internal-analysis",
] as const;

export type Paper2SourceKind = (typeof PAPER2_SOURCE_KINDS)[number];
export type Paper2RightsDisposition = (typeof PAPER2_RIGHTS_DISPOSITIONS)[number];
export type Paper2RightsReviewStatus = (typeof PAPER2_RIGHTS_REVIEW_STATUSES)[number];
export type Paper2AllowedUse = (typeof PAPER2_ALLOWED_USES)[number];

export interface Paper2OfficialLocator {
  readonly type: "official-paper";
  readonly year: number;
  readonly session: "f/m" | "m/j" | "o/n" | "specimen";
  readonly component: string;
  readonly question: string;
  readonly subpart?: string;
  readonly page: number;
}

export interface Paper2DocumentLocator {
  readonly type: "document";
  readonly documentId: string;
  readonly pageStart: number;
  readonly pageEnd: number;
  readonly section?: string;
}

export interface Paper2AuthoredLocator {
  readonly type: "authored";
  readonly artifactId: string;
  readonly revision: string;
}

export type Paper2SourceLocator = Paper2OfficialLocator | Paper2DocumentLocator | Paper2AuthoredLocator;

export interface Paper2SourceRecord {
  readonly sourceId: string;
  readonly kind: Paper2SourceKind;
  readonly authority: string;
  readonly title: string;
  readonly locator: Paper2SourceLocator;
  readonly publicLabel: string;
  readonly rightsId: string;
  readonly contentFingerprint: string;
  readonly review: Paper2ReviewRecord;
}

export interface Paper2RightsAttribution {
  readonly creditLine: string;
  readonly publicUrl?: string;
  readonly licenceLabel?: string;
}

export interface Paper2RightsRecord {
  readonly rightsId: string;
  readonly disposition: Paper2RightsDisposition;
  readonly reviewStatus: Paper2RightsReviewStatus;
  readonly allowedUses: readonly Paper2AllowedUse[];
  readonly attribution: Paper2RightsAttribution;
  readonly owner: string;
  readonly reviewedAt: string;
  readonly evidenceRef: string;
  readonly expiresAt?: string;
  readonly affectedItemIds?: readonly string[];
}

export interface Paper2LearnerEligibilityRequest {
  readonly requestedUse: Paper2AllowedUse;
  readonly embedsSourceContent: boolean;
}

export type Paper2LearnerEligibilityResult =
  | { readonly eligible: true; readonly code: "RIGHTS_ELIGIBLE" }
  | { readonly eligible: false; readonly code: string; readonly reason: string };

const LEARNER_DISPOSITIONS: ReadonlySet<Paper2RightsDisposition> = new Set([
  "licensed",
  "permitted-excerpt",
  "external-link",
  "teacher-created",
]);

const CLIENT_FORBIDDEN_SOURCE_FIELDS = new Set([
  "localPath",
  "fileUri",
  "sha256",
  "reviewerPrivateName",
  "unpublishedSourceFile",
]);

export function validateSourceRecord(value: unknown, path = "source"): Paper2ValidationResult<Paper2SourceRecord> {
  const issues: Paper2ContractIssue[] = [];
  if (!isRecord(value)) return validationFailure([{ code: "SOURCE_NOT_OBJECT", path, message: "Source must be an object." }]);
  requireId(value.sourceId, `${path}.sourceId`, issues);
  if (!PAPER2_SOURCE_KINDS.includes(value.kind as Paper2SourceKind)) issues.push(issue("SOURCE_KIND_INVALID", `${path}.kind`, "Unknown source kind."));
  requireText(value.authority, `${path}.authority`, "SOURCE_AUTHORITY_REQUIRED", issues);
  requireText(value.title, `${path}.title`, "SOURCE_TITLE_REQUIRED", issues);
  validateSourceLocator(value.locator, value.kind, `${path}.locator`, issues);
  requireText(value.publicLabel, `${path}.publicLabel`, "SOURCE_PUBLIC_LABEL_REQUIRED", issues);
  requireId(value.rightsId, `${path}.rightsId`, issues);
  if (typeof value.contentFingerprint !== "string" || !/^[a-f0-9]{64}$/i.test(value.contentFingerprint)) {
    issues.push(issue("SOURCE_FINGERPRINT_INVALID", `${path}.contentFingerprint`, "Content fingerprint must be a SHA-256 hex string."));
  }
  validateReviewShape(value.review, `${path}.review`, issues);
  scanForbiddenFields(value, path, issues);
  return issues.length === 0 ? validationSuccess(value as unknown as Paper2SourceRecord) : validationFailure(issues);
}

export function validateRightsRecord(value: unknown, path = "rights"): Paper2ValidationResult<Paper2RightsRecord> {
  const issues: Paper2ContractIssue[] = [];
  if (!isRecord(value)) return validationFailure([{ code: "RIGHTS_NOT_OBJECT", path, message: "Rights record must be an object." }]);
  requireId(value.rightsId, `${path}.rightsId`, issues);
  if (!PAPER2_RIGHTS_DISPOSITIONS.includes(value.disposition as Paper2RightsDisposition)) issues.push(issue("RIGHTS_DISPOSITION_INVALID", `${path}.disposition`, "Unknown rights disposition."));
  if (!PAPER2_RIGHTS_REVIEW_STATUSES.includes(value.reviewStatus as Paper2RightsReviewStatus)) issues.push(issue("RIGHTS_REVIEW_STATUS_INVALID", `${path}.reviewStatus`, "Unknown rights review status."));
  if (!Array.isArray(value.allowedUses) || new Set(value.allowedUses).size !== value.allowedUses.length) {
    issues.push(issue("RIGHTS_ALLOWED_USES_INVALID", `${path}.allowedUses`, "Allowed uses must be a unique array."));
  } else {
    value.allowedUses.forEach((entry, index) => {
      if (!PAPER2_ALLOWED_USES.includes(entry as Paper2AllowedUse)) issues.push(issue("RIGHTS_ALLOWED_USE_INVALID", `${path}.allowedUses[${index}]`, "Unknown allowed use."));
    });
  }
  if (!isRecord(value.attribution)) {
    issues.push(issue("RIGHTS_ATTRIBUTION_INVALID", `${path}.attribution`, "Attribution must be an object."));
  } else {
    requireText(value.attribution.creditLine, `${path}.attribution.creditLine`, "RIGHTS_ATTRIBUTION_INCOMPLETE", issues);
    if (value.disposition === "external-link" && !isHttpUrl(value.attribution.publicUrl)) issues.push(issue("RIGHTS_EXTERNAL_URL_REQUIRED", `${path}.attribution.publicUrl`, "External-link disposition requires an HTTP(S) URL."));
  }
  requireText(value.owner, `${path}.owner`, "RIGHTS_OWNER_REQUIRED", issues);
  if (!isIsoDateTime(value.reviewedAt)) issues.push(issue("RIGHTS_REVIEW_DATE_INVALID", `${path}.reviewedAt`, "Review date must be an ISO-compatible timestamp."));
  requireText(value.evidenceRef, `${path}.evidenceRef`, "RIGHTS_EVIDENCE_REQUIRED", issues);
  if (value.expiresAt !== undefined && !isIsoDateTime(value.expiresAt)) issues.push(issue("RIGHTS_EXPIRY_INVALID", `${path}.expiresAt`, "Expiry must be an ISO-compatible timestamp."));
  if (value.affectedItemIds !== undefined) validateIdArray(value.affectedItemIds, `${path}.affectedItemIds`, issues);
  return issues.length === 0 ? validationSuccess(value as unknown as Paper2RightsRecord) : validationFailure(issues);
}

export function evaluateLearnerEligibility(
  rights: Paper2RightsRecord | null | undefined,
  request: Paper2LearnerEligibilityRequest,
  nowEpochMs = Date.now(),
): Paper2LearnerEligibilityResult {
  if (!rights) return ineligible("RIGHTS_MISSING", "No rights record resolved for the learner-facing item.");
  const validation = validateRightsRecord(rights);
  if (!validation.ok) return ineligible("RIGHTS_INVALID", "The rights record did not pass validation.");
  if (rights.reviewStatus !== "approved") return ineligible(`RIGHTS_${rights.reviewStatus.toUpperCase()}`, "Rights review is not approved.");
  if (!LEARNER_DISPOSITIONS.has(rights.disposition)) return ineligible("RIGHTS_DISPOSITION_BLOCKED", "The disposition is not learner eligible.");
  if (!rights.allowedUses.includes(request.requestedUse)) return ineligible("RIGHTS_USE_NOT_ALLOWED", "The requested learner use is not permitted.");
  if (rights.expiresAt && Date.parse(rights.expiresAt) <= nowEpochMs) return ineligible("RIGHTS_EXPIRED", "The rights approval has expired.");
  if (rights.attribution.creditLine.trim().length === 0) return ineligible("RIGHTS_ATTRIBUTION_INCOMPLETE", "Required attribution is incomplete.");
  if (request.embedsSourceContent && rights.disposition === "external-link") return ineligible("RIGHTS_EXTERNAL_LINK_EMBED_FORBIDDEN", "External-link rights allow linking only, not embedding source content.");
  if (request.embedsSourceContent && rights.disposition === "internal-reference-only") return ineligible("RIGHTS_INTERNAL_CONTENT_FORBIDDEN", "Internal-reference-only content cannot be embedded.");
  return { eligible: true, code: "RIGHTS_ELIGIBLE" };
}

export function toLearnerSourceDto(source: Paper2SourceRecord) {
  return {
    sourceId: source.sourceId,
    kind: source.kind,
    authority: source.authority,
    title: source.title,
    locator: source.locator,
    publicLabel: source.publicLabel,
    rightsId: source.rightsId,
  } as const;
}

function validateSourceLocator(value: unknown, kind: unknown, path: string, issues: Paper2ContractIssue[]) {
  if (!isRecord(value)) {
    issues.push(issue("SOURCE_LOCATOR_INVALID", path, "Source locator must be an object."));
    return;
  }
  if (kind === "question_paper" || kind === "mark_scheme") {
    if (value.type !== "official-paper") issues.push(issue("SOURCE_OFFICIAL_LOCATOR_REQUIRED", `${path}.type`, "QP/MS records require an official-paper locator."));
    if (!Number.isInteger(value.year) || (value.year as number) < 2000 || (value.year as number) > 2100) issues.push(issue("SOURCE_YEAR_INVALID", `${path}.year`, "Official source year is invalid."));
    if (!["f/m", "m/j", "o/n", "specimen"].includes(String(value.session))) issues.push(issue("SOURCE_SESSION_INVALID", `${path}.session`, "Official source session is invalid."));
    requireText(value.component, `${path}.component`, "SOURCE_COMPONENT_REQUIRED", issues);
    requireText(value.question, `${path}.question`, "SOURCE_QUESTION_REQUIRED", issues);
    if (!Number.isInteger(value.page) || (value.page as number) < 1) issues.push(issue("SOURCE_PAGE_INVALID", `${path}.page`, "Official source page must be a positive integer."));
    return;
  }
  if (kind === "algocore_authored") {
    if (value.type !== "authored") issues.push(issue("SOURCE_AUTHORED_LOCATOR_REQUIRED", `${path}.type`, "AlgoCore-authored records require an authored locator."));
    requireId(value.artifactId, `${path}.artifactId`, issues);
    requireText(value.revision, `${path}.revision`, "SOURCE_REVISION_REQUIRED", issues);
    return;
  }
  if (value.type !== "document") issues.push(issue("SOURCE_DOCUMENT_LOCATOR_REQUIRED", `${path}.type`, "This source kind requires a document locator."));
  requireId(value.documentId, `${path}.documentId`, issues);
  if (!Number.isInteger(value.pageStart) || (value.pageStart as number) < 1) issues.push(issue("SOURCE_PAGE_START_INVALID", `${path}.pageStart`, "Page start must be a positive integer."));
  if (!Number.isInteger(value.pageEnd) || (value.pageEnd as number) < (Number(value.pageStart) || 1)) issues.push(issue("SOURCE_PAGE_END_INVALID", `${path}.pageEnd`, "Page end must not precede page start."));
}

function validateReviewShape(value: unknown, path: string, issues: Paper2ContractIssue[]) {
  if (!isRecord(value)) {
    issues.push(issue("SOURCE_REVIEW_INVALID", path, "Review metadata must be an object."));
    return;
  }
  for (const key of ["author", "independentReviewer", "reviewedRevision"] as const) requireText(value[key], `${path}.${key}`, "SOURCE_REVIEW_FIELD_REQUIRED", issues);
  if (!["approved", "changes_required", "blocked"].includes(String(value.decision))) issues.push(issue("SOURCE_REVIEW_DECISION_INVALID", `${path}.decision`, "Unknown review decision."));
  if (!isIsoDateTime(value.reviewedAt)) issues.push(issue("SOURCE_REVIEW_DATE_INVALID", `${path}.reviewedAt`, "Review date must be valid."));
}

function scanForbiddenFields(value: unknown, path: string, issues: Paper2ContractIssue[]) {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => scanForbiddenFields(entry, `${path}[${index}]`, issues));
    return;
  }
  if (!isRecord(value)) return;
  for (const [key, entry] of Object.entries(value)) {
    if (CLIENT_FORBIDDEN_SOURCE_FIELDS.has(key)) issues.push(issue("SOURCE_CLIENT_FIELD_FORBIDDEN", `${path}.${key}`, "Build-only source metadata cannot enter a learner DTO."));
    scanForbiddenFields(entry, `${path}.${key}`, issues);
  }
}

function validateIdArray(value: unknown, path: string, issues: Paper2ContractIssue[]) {
  if (!Array.isArray(value)) {
    issues.push(issue("RIGHTS_ITEM_IDS_INVALID", path, "Expected an array of stable IDs."));
    return;
  }
  value.forEach((entry, index) => requireId(entry, `${path}[${index}]`, issues));
}

function requireId(value: unknown, path: string, issues: Paper2ContractIssue[]) {
  if (!isPaper2StableId(value)) issues.push(issue("ID_INVALID", path, "Invalid stable ID."));
}

function requireText(value: unknown, path: string, code: string, issues: Paper2ContractIssue[]) {
  if (typeof value !== "string" || value.trim().length === 0) issues.push(issue(code, path, "A non-empty string is required."));
}

function isHttpUrl(value: unknown) {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function ineligible(code: string, reason: string): Paper2LearnerEligibilityResult {
  return { eligible: false, code, reason };
}

function issue(code: string, path: string, message: string): Paper2ContractIssue {
  return { code, path, message };
}
