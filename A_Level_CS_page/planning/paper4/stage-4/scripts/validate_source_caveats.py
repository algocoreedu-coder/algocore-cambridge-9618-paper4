from __future__ import annotations

import hashlib
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CANONICAL_PATH = ROOT / "SOURCE_CAVEAT_CARRYOVER.json"
MARKDOWN_PATH = ROOT / "SOURCE_CAVEAT_CARRYOVER.md"
ADJUDICATION_PATH = ROOT / "SOURCE_ADJUDICATIONS.json"
BATCH_PATHS = {
    "S4-S1": ROOT / "evidence" / "marking" / "2021-2022" / "SOURCE_RISK_REGISTER.json",
    "S4-S2": ROOT / "evidence" / "marking" / "2023-2024" / "SOURCE_RISK_REGISTER.json",
    "S4-S3": ROOT / "evidence" / "marking" / "2025" / "SOURCE_RISK_REGISTER.json",
}
SOURCE_MANIFEST_PATH = ROOT.parent / "stage-1" / "SOURCE_MANIFEST.json"


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def locator_key(locator: dict):
    return locator["source_id"], tuple(locator["pdf_pages"])


canonical = load(CANONICAL_PATH)
adjudications = load(ADJUDICATION_PATH)
batches = {key: load(path) for key, path in BATCH_PATHS.items()}
markdown = MARKDOWN_PATH.read_text(encoding="utf-8")
source_manifest = load(SOURCE_MANIFEST_PATH)
checks = []


def check(name: str, passed: bool, detail) -> None:
    checks.append({"check": name, "passed": bool(passed), "detail": detail})


issues = {item["issue_id"]: item for item in canonical["issues"]}
occurrences = {item["occurrence_id"]: item for item in canonical["occurrences"]}

check("canonical_status", canonical["status"] == "LEAD_CANONICALIZED", canonical["status"])
check("unique_issue_ids", len(issues) == len(canonical["issues"]) == 25, len(issues))
check("unique_occurrence_ids", len(occurrences) == len(canonical["occurrences"]) == 62, len(occurrences))
check("affected_parts_unique", len({item["part_id"] for item in occurrences.values()}) == 61, canonical["counts"]["affected_parts_unique"])
check("batch_counts", canonical["counts"]["by_batch"] == {
    "S4-S1": {"unique_issue_ids": 14, "occurrences": 27},
    "S4-S2": {"unique_issue_ids": 5, "occurrences": 29},
    "S4-S3": {"unique_issue_ids": 6, "occurrences": 6},
}, canonical["counts"]["by_batch"])

expected_occurrences = set()
expected_issue_ids = set()
for item in batches["S4-S1"]["instances"]:
    expected_occurrences.add(item["issue_instance_id"])
    expected_issue_ids.add(item["source_issue_id"])
for item in batches["S4-S2"]["risks"]:
    expected_issue_ids.add(item["issue_id"])
    expected_occurrences.update(f"{item['issue_id']}::{part_id}" for part_id in item["part_ids"])
for item in batches["S4-S3"]["risks"]:
    expected_issue_ids.add(item["risk_id"])
    expected_occurrences.update(f"{item['risk_id']}::{part_id}" for part_id in item["affected_part_ids"])
check("issue_set_lossless", set(issues) == expected_issue_ids, sorted(expected_issue_ids - set(issues)))
check("occurrence_set_lossless", set(occurrences) == expected_occurrences, {
    "missing": sorted(expected_occurrences - set(occurrences)),
    "extra": sorted(set(occurrences) - expected_occurrences),
})

all_stage5_preserved = True
all_dispositions_preserved = True
all_locators_preserved = True
for item in batches["S4-S1"]["instances"]:
    target = issues[item["source_issue_id"]]
    all_stage5_preserved &= item["stage5_obligation"] in target["stage5_obligations"]
    all_dispositions_preserved &= item["stage4_disposition"] in target["stage4_dispositions"]
    target_locators = {locator_key(value) for value in target["source_locators"]}
    all_locators_preserved &= locator_key(item["qp_locator"]) in target_locators
    all_locators_preserved &= locator_key(item["ms_locator"]) in target_locators
for item in batches["S4-S2"]["risks"]:
    target = issues[item["issue_id"]]
    all_stage5_preserved &= item["stage5_obligation"] in target["stage5_obligations"]
    all_dispositions_preserved &= item["stage4_disposition"] in target["stage4_dispositions"]
    target_locators = {locator_key(value) for value in target["source_locators"]}
    all_locators_preserved &= all(locator_key(value) in target_locators for value in item["locators"])
for item in batches["S4-S3"]["risks"]:
    target = issues[item["risk_id"]]
    all_stage5_preserved &= item["stage5_obligation"] in target["stage5_obligations"]
    all_dispositions_preserved &= item["stage4_disposition"] in target["stage4_dispositions"]
    all_locators_preserved &= locator_key(item["source_locator"]) in {locator_key(value) for value in target["source_locators"]}
check("stage5_obligations_lossless", all_stage5_preserved, "all source obligation strings retained")
check("stage4_dispositions_lossless", all_dispositions_preserved, "all source disposition strings retained")
check("source_locators_lossless", all_locators_preserved, "all source locator tuples retained")
manifest_sources = {item["source_id"]: item for item in source_manifest["sources"]}
canonical_locators = [
    locator_value
    for issue in issues.values()
    for locator_value in issue["source_locators"]
]
check("all_retained_locators_non_empty", all(item["pdf_pages"] for item in canonical_locators), len(canonical_locators))
check("all_retained_locators_real", all(
    item["source_id"] in manifest_sources
    and all(1 <= page <= manifest_sources[item["source_id"]]["page_count"] for page in item["pdf_pages"])
    for item in canonical_locators
), "source IDs exist in Stage 1 manifest and pages are in range")
check("all_occurrences_have_stage5_obligation", all(item["stage5_obligation"] for item in occurrences.values()), len(occurrences))
check("all_occurrences_join_issue", all(item["issue_id"] in issues for item in occurrences.values()), len(occurrences))
check("issue_occurrence_backrefs", all(
    set(item["occurrence_ids"]) == {key for key, value in occurrences.items() if value["issue_id"] == item["issue_id"]}
    for item in issues.values()
), "exact bidirectional join")

canonical_provenance = {item["batch_id"]: item for item in canonical["batch_provenance"]}
check("batch_provenance_hashes", all(
    canonical_provenance[batch_id]["sha256"] == sha256(path)
    for batch_id, path in BATCH_PATHS.items()
), canonical_provenance)
source_policy = batches["S4-S2"]["batch_fidelity_policy"]
check("batch_fidelity_policy_preserved", canonical["batch_fidelity_policies"] == [{
    **source_policy,
    "batch_id": "S4-S2",
    "source_path": "evidence/marking/2023-2024/SOURCE_RISK_REGISTER.json",
}], canonical["batch_fidelity_policies"])
check("batch_fidelity_policy_not_issue", source_policy["policy_id"] not in issues and all(
    item["issue_id"] != source_policy["policy_id"] for item in occurrences.values()
), source_policy["policy_id"])
check("adjudication_provenance_hash", canonical["adjudication_provenance"]["sha256"] == sha256(ADJUDICATION_PATH), canonical["adjudication_provenance"]["sha256"])

source_decisions = {item["decision_id"]: item for item in adjudications["decisions"]}
canonical_decisions = {item["decision_id"]: item for item in canonical["adjudications"]}
check("adjudication_set_exact", set(source_decisions) == set(canonical_decisions) == {"S4-S1-DEC-001", "S4-S1-DEC-002"}, sorted(canonical_decisions))
check("adjudications_lead_resolved", all(
    item["review_status"] == "LEAD_REVIEWED" and item["resolution_status"] == "RESOLVED"
    for item in canonical_decisions.values()
), {key: value["resolution_status"] for key, value in canonical_decisions.items()})
check("adjudication_treatment_lossless", all(
    canonical_decisions[key]["canonical_treatment"] == value["canonical_treatment"]
    and canonical_decisions[key]["part_ids"] == value["part_ids"]
    and canonical_decisions[key]["official_part_marks"] == value["official_part_marks"]
    for key, value in source_decisions.items()
), "part sets, official totals and treatment retained")
check("zero_unresolved_source_decisions", canonical["unresolved_source_decisions"] == [] and canonical["counts"]["unresolved_source_decisions"] == 0, canonical["unresolved_source_decisions"])
check("w21_issue_links_adjudication", issues["W21-2E-RUBRIC"]["adjudication_refs"] == ["S4-S1-DEC-001"], issues["W21-2E-RUBRIC"]["adjudication_refs"])
check("discovered_ambiguity_resolved", any(
    item["ambiguity_id"] == "S4-S1-DEC-002"
    and item.get("status") == "LEAD_RESOLVED"
    and item.get("resolution_status") == "RESOLVED"
    for item in canonical["discovered_ambiguities"]
), canonical["discovered_ambiguities"])
check("downstream_boundary", canonical["downstream_status"] == "PENDING_STAGE5_EXECUTION_VERIFICATION", canonical["downstream_status"])
check("markdown_issue_coverage", all(issue_id in markdown for issue_id in issues), len(issues))
check("markdown_decision_coverage", all(decision_id in markdown for decision_id in canonical_decisions), len(canonical_decisions))

report = {
    "schema_version": "1.0",
    "status": "PASS" if all(item["passed"] for item in checks) else "FAIL",
    "checks_total": len(checks),
    "checks_passed": sum(item["passed"] for item in checks),
    "canonical_sha256": sha256(CANONICAL_PATH),
    "markdown_sha256": sha256(MARKDOWN_PATH),
    "counts": canonical["counts"],
    "checks": checks,
}
report_path = ROOT / "evidence" / "SOURCE_CAVEAT_VALIDATION.json"
report_path.parent.mkdir(parents=True, exist_ok=True)
report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps(report, ensure_ascii=False, indent=2))
raise SystemExit(0 if report["status"] == "PASS" else 1)
