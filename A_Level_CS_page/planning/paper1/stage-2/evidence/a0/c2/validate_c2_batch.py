#!/usr/bin/env python3
"""A0 structural/manifest validator for a frozen Stage 2 C2 batch packet."""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path


REQUIRED = {
    "ATOMIC_ITEM_MAP.jsonl",
    "CONTAINER_MAP.jsonl",
    "MARKING_EVIDENCE_MAP.jsonl",
    "UNRESOLVED_DISPOSITION.jsonl",
    "PATTERN_CANDIDATES.jsonl",
    "VARIANT_CANDIDATES.jsonl",
    "QA.json",
    "ISSUES.md",
    "INPUT_MANIFEST.json",
    "OUTPUT_MANIFEST.json",
    "HANDOFF.json",
}


def sha(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8-sig"))


def read_jsonl(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8-sig").splitlines() if line.strip()]


def pinned_rows(obj: object) -> list[dict]:
    if not isinstance(obj, dict):
        return []
    for key in ("files", "outputs", "content_outputs"):
        if isinstance(obj.get(key), list):
            return [row for row in obj[key] if isinstance(row, dict) and "path" in row]
    return []


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("batch")
    parser.add_argument("--version", default="v1")
    parser.add_argument("--write-json")
    args = parser.parse_args()

    repo = Path.cwd()
    stage = repo / "A_Level_CS_page/planning/paper1/stage-2"
    batch = args.batch.upper()
    packet = stage / "evidence/a4" / batch / args.version
    subset = read_json(stage / "evidence/a0/c2/subsets" / f"{batch}_SUBSET_MANIFEST.json")
    requirements = {
        row["requirement_id"]
        for row in read_jsonl(stage / "evidence/a3/foundation-v1/OBJECTIVE_REQUIREMENTS.jsonl")
    }

    present = {p.name for p in packet.iterdir() if p.is_file()} if packet.exists() else set()
    atomic = read_jsonl(packet / "ATOMIC_ITEM_MAP.jsonl")
    containers = read_jsonl(packet / "CONTAINER_MAP.jsonl")
    marking = read_jsonl(packet / "MARKING_EVIDENCE_MAP.jsonl")
    unresolved = read_jsonl(packet / "UNRESOLVED_DISPOSITION.jsonl")
    patterns = read_jsonl(packet / "PATTERN_CANDIDATES.jsonl")

    pattern_ids = {
        value
        for row in patterns
        for value in (row.get("pattern_id"), row.get("proposed_pattern_id"))
        if value
    }
    atomic_ids = [row.get("assessment_unit_id") for row in atomic]
    target_ids = [row.get("corpus_target_id") for row in atomic]
    container_ids = [row.get("corpus_target_id") for row in containers]
    unresolved_ids = [row.get("corpus_record_id") for row in unresolved]
    marking_ids = [row.get("marking_item_id") for row in atomic]
    requirement_refs = [
        ref
        for row in atomic
        for ref in list(row.get("primary_requirement_ids") or []) + list(row.get("supporting_requirement_ids") or [])
    ]

    output_manifest = read_json(packet / "OUTPUT_MANIFEST.json")
    manifest_checks = []
    for row in pinned_rows(output_manifest):
        path = repo / row["path"]
        if not path.is_file():
            path = packet / row["path"]
        manifest_checks.append({
            "path": row["path"],
            "exists": path.is_file(),
            "bytes_match": path.is_file() and path.stat().st_size == row.get("bytes"),
            "sha256_match": path.is_file() and sha(path) == row.get("sha256"),
        })

    handoff = read_json(packet / "HANDOFF.json")
    handoff_pin_checks = []
    if isinstance(handoff.get("output_manifest"), dict):
        row = handoff["output_manifest"]
        path = packet / "OUTPUT_MANIFEST.json"
        handoff_pin_checks.append({
            "kind": "output_manifest",
            "bytes_match": path.stat().st_size == row.get("bytes"),
            "sha256_match": sha(path) == row.get("sha256"),
        })
    for row in handoff.get("content_outputs", []):
        path = repo / row["path"]
        handoff_pin_checks.append({
            "kind": "content_output",
            "path": row["path"],
            "exists": path.is_file(),
            "bytes_match": path.is_file() and path.stat().st_size == row.get("bytes"),
            "sha256_match": path.is_file() and sha(path) == row.get("sha256"),
        })

    scoring = [row for row in marking if row.get("eligible_for_item_scoring") is True]
    nonscoring = [row for row in marking if row.get("eligible_for_item_scoring") is False]
    marks = sum((row.get("displayed_marks") if row.get("displayed_marks") is not None else row.get("marks_displayed", 0)) or 0 for row in atomic)
    paper_marks: dict[str, float] = {}
    for row in atomic:
        paper = row.get("paper_id") or (row.get("qp_locator") or {}).get("source_id")
        displayed = row.get("displayed_marks") if row.get("displayed_marks") is not None else row.get("marks_displayed", 0)
        paper_marks[paper] = paper_marks.get(paper, 0) + (displayed or 0)

    checks = {
        "required_file_set_exact": present == REQUIRED,
        "output_manifest_all_pins_match": bool(manifest_checks) and all(
            row["exists"] and row["bytes_match"] and row["sha256_match"] for row in manifest_checks
        ),
        "handoff_all_declared_pins_match": (
            all(row.get("bytes_match") and row.get("sha256_match") for row in handoff_pin_checks)
            if handoff_pin_checks
            else any(Path(row["path"]).name == "HANDOFF.json" and row["exists"] and row["bytes_match"] and row["sha256_match"] for row in manifest_checks)
        ),
        "atomic_count": len(atomic) == subset["atomic_assessment_units"],
        "atomic_set_exact": set(target_ids) == set(subset["atomic_ids"]),
        "atomic_ids_unique": len(atomic_ids) == len(set(atomic_ids)),
        "target_ids_unique": len(target_ids) == len(set(target_ids)),
        "container_count": len(containers) == subset["non_scoring_containers"],
        "container_set_exact": set(container_ids) == set(subset["container_ids"]),
        "container_ids_unique": len(container_ids) == len(set(container_ids)),
        "atomic_container_disjoint": not set(target_ids).intersection(container_ids),
        "marking_count": len(marking) == subset["scoring_marking_rows"] + subset["parent_context_marking_rows"],
        "scoring_count": len(scoring) == subset["scoring_marking_rows"],
        "parent_context_count": len(nonscoring) == subset["parent_context_marking_rows"],
        "atomic_marking_ids_unique": len(marking_ids) == len(set(marking_ids)),
        "marks_total": marks == subset["marks"],
        "six_papers_75": len(paper_marks) == 6 and set(paper_marks.values()) == {75},
        "unresolved_count": len(unresolved) == subset["unresolved_total"],
        "unresolved_set_exact": set(unresolved_ids) == set(subset["unresolved_ids"]),
        "unresolved_not_promoted": all(
            row.get("stage2_role") == "CONTEXT_ONLY"
            and row.get("eligible_as_assessment_unit") is False
            and row.get("eligible_for_marking_claim") is False
            for row in unresolved
        ),
        "requirement_refs_resolve": all(ref in requirements for ref in requirement_refs),
        "primary_requirements_present_when_required": all(
            row.get("scope_2026_status") not in {"IN_SCOPE", "PARTIAL", "SUPPORTING"}
            or bool(row.get("primary_requirement_ids"))
            for row in atomic
        ),
        "primary_pattern_refs_resolve": all(row.get("primary_pattern_id") in pattern_ids for row in atomic),
    }
    report = {
        "schema_version": "1.0",
        "validator": "A0 C2 structural/manifest validator",
        "batch": batch,
        "artifact_version": args.version,
        "status": "PASS" if all(checks.values()) else "FAIL",
        "checks": checks,
        "counts": {
            "atomic": len(atomic),
            "containers": len(containers),
            "marking": len(marking),
            "scoring": len(scoring),
            "parent_context": len(nonscoring),
            "unresolved": len(unresolved),
            "marks": marks,
            "patterns_or_occurrences": len(patterns),
        },
        "paper_marks": paper_marks,
        "manifest_checks": manifest_checks,
        "handoff_pin_checks": handoff_pin_checks,
    }
    rendered = json.dumps(report, ensure_ascii=False, indent=2) + "\n"
    if args.write_json:
        Path(args.write_json).write_text(rendered, encoding="utf-8")
    print(rendered, end="")
    return 0 if report["status"] == "PASS" else 1


if __name__ == "__main__":
    raise SystemExit(main())
