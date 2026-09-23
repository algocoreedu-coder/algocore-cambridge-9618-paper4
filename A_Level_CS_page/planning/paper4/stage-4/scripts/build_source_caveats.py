from __future__ import annotations

import hashlib
import json
import re
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
INPUTS = [
    ("S4-S1", "2021-2022", ROOT / "evidence" / "marking" / "2021-2022" / "SOURCE_RISK_REGISTER.json"),
    ("S4-S2", "2023-2024", ROOT / "evidence" / "marking" / "2023-2024" / "SOURCE_RISK_REGISTER.json"),
    ("S4-S3", "2025", ROOT / "evidence" / "marking" / "2025" / "SOURCE_RISK_REGISTER.json"),
]
ADJUDICATIONS = ROOT / "SOURCE_ADJUDICATIONS.json"


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def uniq(values):
    out = []
    seen = set()
    for value in values:
        key = json.dumps(value, sort_keys=True, ensure_ascii=False)
        if key not in seen:
            seen.add(key)
            out.append(value)
    return out


def locator(source_id: str, pdf_pages: list[int], role: str = "source", **extra):
    return {
        "source_id": source_id,
        "pdf_pages": pdf_pages,
        "page_numbering": "one_based_pdf_page" if pdf_pages else "not_applicable_review_boundary",
        "role": role,
        **extra,
    }


def paper_from_part(part_id: str) -> str:
    pieces = part_id.split("_")
    return "_".join(pieces[:3])


def paper_from_source(source_id: str) -> str | None:
    match = re.fullmatch(r"(9618_[sw]\d{2})_(?:qp|ms)_(4[123])", source_id)
    return f"{match.group(1)}_{match.group(2)}" if match else None


def main() -> None:
    issues: dict[str, dict] = {}
    occurrences: list[dict] = []
    batch_provenance = []
    batch_fidelity_policies = []
    discovered_ambiguities = []

    def ensure_issue(issue_id, kind, description, batch_id, batch_name, source_path, disposition, obligation, locators):
        item = issues.setdefault(
            issue_id,
            {
                "issue_id": issue_id,
                "kind": kind,
                "description": description,
                "batch_provenance": [],
                "stage4_dispositions": [],
                "stage5_obligations": [],
                "source_locators": [],
                "occurrence_ids": [],
                "adjudication_refs": [],
                "status": "CARRIED_FORWARD",
            },
        )
        if item["kind"] != kind or item["description"] != description:
            raise ValueError(f"Conflicting definition for stable issue ID {issue_id}")
        item["batch_provenance"] = uniq(item["batch_provenance"] + [{
            "batch_id": batch_id,
            "batch": batch_name,
            "source_path": source_path,
        }])
        item["stage4_dispositions"] = uniq(item["stage4_dispositions"] + [disposition])
        item["stage5_obligations"] = uniq(item["stage5_obligations"] + [obligation])
        item["source_locators"] = uniq(item["source_locators"] + locators)
        return item

    for batch_id, batch_name, path in INPUTS:
        data = load(path)
        rel_path = path.relative_to(ROOT).as_posix()
        batch_provenance.append({
            "batch_id": batch_id,
            "batch": batch_name,
            "source_path": rel_path,
            "source_schema_version": data["schema_version"],
            "source_status": data["status"],
            "sha256": digest(path),
        })

        if batch_id == "S4-S1":
            definitions = {item["source_issue_id"]: item for item in data["issue_definitions"]}
            for source in data.get("stage4_discovered_ambiguities", []):
                discovered_ambiguities.append({
                    **source,
                    "source_submission_status": source["status"],
                    "status": "CARRIED_FORWARD_FOR_ADJUDICATION",
                    "batch_id": batch_id,
                    "batch": batch_name,
                    "source_path": rel_path,
                })
            for source in data["instances"]:
                definition = definitions[source["source_issue_id"]]
                locators = [
                    locator(source["qp_locator"]["source_id"], source["qp_locator"]["pdf_pages"], "official_qp"),
                    locator(source["ms_locator"]["source_id"], source["ms_locator"]["pdf_pages"], "official_ms"),
                ]
                issue = ensure_issue(
                    definition["source_issue_id"], definition["kind"], definition["description"],
                    batch_id, batch_name, rel_path, source["stage4_disposition"],
                    source["stage5_obligation"], locators,
                )
                occurrence = {
                    "occurrence_id": source["issue_instance_id"],
                    "issue_id": source["source_issue_id"],
                    "batch_id": batch_id,
                    "batch": batch_name,
                    "paper_id": source["paper_id"],
                    "part_id": source["part_id"],
                    "pattern_ids": source.get("pattern_ids", []),
                    "context_pattern_ids": source.get("context_pattern_ids", []),
                    "source_locators": locators,
                    "interpretation_risk": source["interpretation_risk"],
                    "stage4_disposition": source["stage4_disposition"],
                    "stage5_obligation": source["stage5_obligation"],
                    "source_submission_status": source["status"],
                    "status": "CARRIED_FORWARD",
                }
                occurrences.append(occurrence)
                issue["occurrence_ids"].append(occurrence["occurrence_id"])

        elif batch_id == "S4-S2":
            if data.get("batch_fidelity_policy"):
                batch_fidelity_policies.append({
                    **data["batch_fidelity_policy"],
                    "batch_id": batch_id,
                    "source_path": rel_path,
                })
            for source in data["risks"]:
                locators = [
                    locator(item["source_id"], item["pdf_pages"], "source_or_review_boundary")
                    for item in source["locators"]
                ]
                issue = ensure_issue(
                    source["issue_id"], source["kind"], source["description"], batch_id,
                    batch_name, rel_path, source["stage4_disposition"], source["stage5_obligation"], locators,
                )
                for part_id in source["part_ids"]:
                    paper_id = paper_from_part(part_id)
                    relevant = [
                        item for item in locators
                        if paper_from_source(item["source_id"]) in {None, paper_id}
                    ]
                    occurrence_id = f"{source['issue_id']}::{part_id}"
                    occurrence = {
                        "occurrence_id": occurrence_id,
                        "issue_id": source["issue_id"],
                        "batch_id": batch_id,
                        "batch": batch_name,
                        "paper_id": paper_id,
                        "part_id": part_id,
                        "pattern_ids": [],
                        "context_pattern_ids": [],
                        "source_locators": relevant,
                        "interpretation_risk": source["description"],
                        "stage4_disposition": source["stage4_disposition"],
                        "stage5_obligation": source["stage5_obligation"],
                        "source_submission_status": data["status"],
                        "status": "CARRIED_FORWARD",
                    }
                    occurrences.append(occurrence)
                    issue["occurrence_ids"].append(occurrence_id)

        else:
            for source in data["risks"]:
                source_locator = source["source_locator"]
                locators = [locator(
                    source_locator["source_id"], source_locator["pdf_pages"], "official_source",
                    part_label=source_locator.get("part_label"),
                )]
                issue = ensure_issue(
                    source["risk_id"], source["kind"], source["interpretation_risk"], batch_id,
                    batch_name, rel_path, source["stage4_disposition"], source["stage5_obligation"], locators,
                )
                for part_id in source["affected_part_ids"]:
                    occurrence_id = f"{source['risk_id']}::{part_id}"
                    occurrence = {
                        "occurrence_id": occurrence_id,
                        "issue_id": source["risk_id"],
                        "batch_id": batch_id,
                        "batch": batch_name,
                        "paper_id": paper_from_part(part_id),
                        "part_id": part_id,
                        "pattern_ids": source.get("affected_pattern_ids", []),
                        "context_pattern_ids": [],
                        "source_locators": locators,
                        "interpretation_risk": source["interpretation_risk"],
                        "stage4_disposition": source["stage4_disposition"],
                        "stage5_obligation": source["stage5_obligation"],
                        "source_submission_status": source["status"],
                        "status": "CARRIED_FORWARD",
                    }
                    occurrences.append(occurrence)
                    issue["occurrence_ids"].append(occurrence_id)

    adjudication_source = load(ADJUDICATIONS)
    adjudications = []
    for source in adjudication_source["decisions"]:
        resolved = {
            **source,
            "resolution_status": "RESOLVED",
            "provenance": {
                "source_path": ADJUDICATIONS.relative_to(ROOT).as_posix(),
                "sha256": digest(ADJUDICATIONS),
                "reviewed_by": adjudication_source["reviewed_by"],
                "review_basis": adjudication_source["review_basis"],
            },
        }
        adjudications.append(resolved)
        linked_issue = "W21-2E-RUBRIC" if source["decision_id"] == "S4-S1-DEC-001" else None
        if linked_issue:
            issues[linked_issue]["adjudication_refs"].append(source["decision_id"])
            issues[linked_issue]["status"] = "CARRIED_FORWARD_ADJUDICATED"
        for ambiguity in discovered_ambiguities:
            if ambiguity["ambiguity_id"] == source["decision_id"]:
                ambiguity["status"] = "LEAD_RESOLVED"
                ambiguity["resolution_status"] = "RESOLVED"
                ambiguity["resolution_ref"] = source["decision_id"]

    for item in issues.values():
        item["occurrence_ids"] = sorted(set(item["occurrence_ids"]))
        item["adjudication_refs"] = sorted(set(item["adjudication_refs"]))

    occurrences.sort(key=lambda item: (item["batch_id"], item["issue_id"], item["part_id"]))
    issue_list = sorted(issues.values(), key=lambda item: item["issue_id"])
    batch_occurrence_counts = Counter(item["batch_id"] for item in occurrences)
    batch_issue_counts = Counter(
        provenance["batch_id"]
        for item in issue_list
        for provenance in item["batch_provenance"]
    )
    counts = {
        "source_batches": 3,
        "unique_issue_ids": len(issue_list),
        "occurrences": len(occurrences),
        "affected_parts_unique": len({item["part_id"] for item in occurrences}),
        "stage5_obligation_issue_ids": sum(bool(item["stage5_obligations"]) for item in issue_list),
        "adjudications": len(adjudications),
        "resolved_source_decisions": sum(item["resolution_status"] == "RESOLVED" for item in adjudications),
        "unresolved_source_decisions": len(adjudication_source["unresolved_decisions"]),
        "batch_fidelity_policies": len(batch_fidelity_policies),
        "by_batch": {
            batch_id: {
                "unique_issue_ids": batch_issue_counts[batch_id],
                "occurrences": batch_occurrence_counts[batch_id],
            }
            for batch_id, _, _ in INPUTS
        },
    }
    output = {
        "schema_version": "s4-source-caveat-carryover-v1",
        "status": "LEAD_CANONICALIZED",
        "generation_policy": "Deterministic output from the locked batch registers and SOURCE_ADJUDICATIONS; no runtime timestamp is embedded.",
        "scope": "Cambridge 9618 Paper 4 corpus source risks from 2021-2025; Stage 4 design carryover to Stage 5.",
        "authority_boundary": "Source risks and Lead adjudications are preserved without silently correcting official materials. Stage 5 must independently verify executable behaviour.",
        "batch_provenance": batch_provenance,
        "adjudication_provenance": {
            "source_path": ADJUDICATIONS.relative_to(ROOT).as_posix(),
            "schema_version": adjudication_source["schema_version"],
            "source_status": adjudication_source["status"],
            "sha256": digest(ADJUDICATIONS),
        },
        "counts": counts,
        "issues": issue_list,
        "occurrences": occurrences,
        "batch_fidelity_policies": batch_fidelity_policies,
        "adjudications": adjudications,
        "discovered_ambiguities": discovered_ambiguities,
        "unresolved_source_decisions": [],
        "downstream_status": "PENDING_STAGE5_EXECUTION_VERIFICATION",
    }
    (ROOT / "SOURCE_CAVEAT_CARRYOVER.json").write_text(
        json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )

    lines = [
        "# Source caveat carryover - Stage 4",
        "",
        "Status: **LEAD_CANONICALIZED**. This register preserves source risks and Lead decisions; it does not certify source listings as executable.",
        "",
        "## Coverage",
        "",
        f"- {counts['unique_issue_ids']} stable source-risk IDs and {counts['occurrences']} retained occurrences across {counts['affected_parts_unique']} distinct parts.",
        f"- {counts['stage5_obligation_issue_ids']} issue IDs retain explicit Stage 5 obligations.",
        f"- {counts['resolved_source_decisions']} of {counts['adjudications']} source arithmetic decisions are Lead-resolved; unresolved source decisions: {counts['unresolved_source_decisions']}.",
        f"- {counts['batch_fidelity_policies']} batch fidelity policy is retained outside the source-issue and occurrence counts.",
        "",
        "| Batch | Stable issues | Occurrences | Source submission |",
        "|---|---:|---:|---|",
    ]
    for provenance in batch_provenance:
        batch_counts = counts["by_batch"][provenance["batch_id"]]
        lines.append(
            f"| {provenance['batch_id']} ({provenance['batch']}) | {batch_counts['unique_issue_ids']} | {batch_counts['occurrences']} | `{provenance['source_path']}` |"
        )
    lines += ["", "## Batch fidelity policy", ""]
    for policy in batch_fidelity_policies:
        lines += [
            f"### {policy['policy_id']}",
            "",
            f"- Authority: `{policy['authority']}`; applies to: {policy['applies_to_batch']}.",
            f"- Policy: {policy['statement']}",
            f"- Source issue: `{str(policy['is_source_issue']).lower()}`; per-part source refs: `{str(policy['per_part_source_issue_refs']).lower()}`.",
            "",
        ]
    lines += [
        "",
        "## Lead-resolved source decisions",
        "",
    ]
    for decision in adjudications:
        lines += [
            f"### {decision['decision_id']} - {', '.join(decision['part_ids'])}",
            "",
            f"- Finding: {decision['facsimile_finding']}",
            f"- Canonical treatment: {decision['canonical_treatment']}",
            f"- Disposition: `{decision['part_disposition']}`; arithmetic claim: `{decision['arithmetic_claim']}`; official total: {decision['official_part_marks']}.",
            f"- Status: **{decision['resolution_status']}**.",
            "",
        ]
    lines += ["## Stable issue register", ""]
    for item in issue_list:
        locators = "; ".join(
            f"{loc['source_id']} p.{','.join(map(str, loc['pdf_pages'])) if loc['pdf_pages'] else 'n/a'}"
            for loc in item["source_locators"]
        )
        batches = ", ".join(entry["batch_id"] for entry in item["batch_provenance"])
        lines += [
            f"### {item['issue_id']}",
            "",
            f"- Batch: {batches}; kind: `{item['kind']}`; occurrences: {len(item['occurrence_ids'])}.",
            f"- Risk: {item['description']}",
            f"- Stage 4 disposition: {' | '.join(item['stage4_dispositions'])}",
            f"- Stage 5 obligation: {' | '.join(item['stage5_obligations'])}",
            f"- Locators: {locators}",
            "",
        ]
    lines += [
        "## Boundary",
        "",
        "The register carries official-source defects, extraction/layout limits and interpretation decisions forward. It does not silently repair QP/MS text, treat an example listing as verified code, or remove the Stage 5 execution obligation.",
        "",
    ]
    (ROOT / "SOURCE_CAVEAT_CARRYOVER.md").write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps(counts, indent=2))


if __name__ == "__main__":
    main()
