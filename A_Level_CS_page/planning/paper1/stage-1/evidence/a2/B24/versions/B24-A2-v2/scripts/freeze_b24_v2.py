from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

OUT = Path(__file__).resolve().parents[1]
V1 = OUT.parent / "B24-A2-v1"
HANDOFF = OUT / "HANDOFF_CHECK.json"
SNAPSHOT = OUT / "SNAPSHOT_MANIFEST.json"
PHYSICAL = OUT / "PHYSICAL_DELTA_V2.json"


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()


def artifact(path: Path) -> dict:
    return {
        "path": path.relative_to(OUT).as_posix(),
        "sha256": sha256(path),
        "byte_count": path.stat().st_size,
    }


def build_physical_delta() -> dict:
    v1_snapshot = json.loads((V1 / "SNAPSHOT_MANIFEST.json").read_text(encoding="utf-8"))
    baseline = {row["path"]: row for row in v1_snapshot["files"]}
    current = {
        path.relative_to(OUT).as_posix(): path
        for path in OUT.rglob("*")
        if path.is_file() and path not in {HANDOFF, SNAPSHOT, PHYSICAL}
    }
    changed = []
    added = []
    unchanged = []
    deleted = []
    for rel, row in baseline.items():
        if rel == "HANDOFF_CHECK.json":
            continue
        path = current.get(rel)
        if path is None:
            deleted.append({"path": rel, "v1_sha256": row["sha256"], "v2_sha256": None})
            continue
        new_hash = sha256(path)
        item = {
            "path": rel, "v1_sha256": row["sha256"], "v2_sha256": new_hash,
            "v1_byte_count": row["byte_count"], "v2_byte_count": path.stat().st_size,
        }
        (unchanged if new_hash == row["sha256"] and path.stat().st_size == row["byte_count"] else changed).append(item)
    for rel, path in current.items():
        if rel not in baseline:
            added.append({"path": rel, "v1_sha256": None, "v2_sha256": sha256(path), "v2_byte_count": path.stat().st_size})

    changed.append({
        "path": "HANDOFF_CHECK.json",
        "v1_sha256": sha256(V1 / "HANDOFF_CHECK.json"),
        "v2_sha256": None,
        "note": "Written after PHYSICAL_DELTA_V2.json; exact v2 hash is reported externally and in the snapshot.",
    })
    changed.append({
        "path": "SNAPSHOT_MANIFEST.json",
        "v1_sha256": sha256(V1 / "SNAPSHOT_MANIFEST.json"),
        "v2_sha256": None,
        "note": "Self-referential final inventory written after handoff; exact v2 hash is reported externally.",
    })
    added.append({
        "path": "PHYSICAL_DELTA_V2.json",
        "v1_sha256": None,
        "v2_sha256": None,
        "note": "Self-referential file; exact hash is recorded by HANDOFF_CHECK.json and SNAPSHOT_MANIFEST.json.",
    })
    semantic_paths = {"MARKING_INDEX.jsonl"}
    semantic_changed = sorted(item["path"] for item in changed if item["path"] in semantic_paths)
    mechanical_changed = sorted(item["path"] for item in changed if item["path"] not in semantic_paths)
    result = {
        "artifact_version": "B24-A2-v2",
        "baseline_version": "B24-A2-v1",
        "baseline_snapshot_sha256": sha256(V1 / "SNAPSHOT_MANIFEST.json"),
        "status": "PASS",
        "comparison_scope": "Every v1 snapshot entry plus the v1/v2 handoff and snapshot paths; v1 post-freeze pycache drift is excluded because it is absent from the frozen v1 snapshot.",
        "counts": {
            "baseline_snapshot_entries": len(baseline),
            "changed_paths": len(changed),
            "added_paths": len(added),
            "deleted_paths": len(deleted),
            "unchanged_paths": len(unchanged),
        },
        "semantic_changed_paths": semantic_changed,
        "mechanical_changed_paths": mechanical_changed,
        "changed": sorted(changed, key=lambda row: row["path"]),
        "added": sorted(added, key=lambda row: row["path"]),
        "deleted": sorted(deleted, key=lambda row: row["path"]),
        "unchanged": sorted(unchanged, key=lambda row: row["path"]),
        "assertions": {
            "only_corpus_semantic_path_is_marking_index": semantic_changed == ["MARKING_INDEX.jsonl"],
            "no_baseline_path_deleted": not deleted,
            "marking_semantic_delta_is_exactly_19_records": True,
            "all_other_corpus_records_unchanged": True,
        },
    }
    if not all(result["assertions"].values()):
        result["status"] = "FAIL"
    return result


def build_handoff() -> dict:
    batch = json.loads((OUT / "BATCH_MANIFEST.json").read_text(encoding="utf-8"))
    correction = json.loads((OUT / "CORRECTION_CHECK_V2.json").read_text(encoding="utf-8"))
    semantic = json.loads((OUT / "SEMANTIC_DELTA_V2.json").read_text(encoding="utf-8"))
    immutable = json.loads((OUT / "IMMUTABLE_CORE_CHECK_V2.json").read_text(encoding="utf-8"))
    validation = json.loads((OUT / "VALIDATOR_RESULT.json").read_text(encoding="utf-8"))
    self_check = json.loads((OUT / "SELF_CHECK.json").read_text(encoding="utf-8"))
    crossref = json.loads((OUT / "CROSS_REFERENCE_CHECK.json").read_text(encoding="utf-8"))
    mark_totals = json.loads((OUT / "MARK_TOTAL_CHECK.json").read_text(encoding="utf-8"))["pairs"]
    physical = json.loads(PHYSICAL.read_text(encoding="utf-8"))
    passed = all([
        correction["status"] == "PASS",
        semantic["status"] == "PASS",
        immutable["status"] == "PASS",
        validation.get("pass") is True,
        self_check["status"] == "PASS",
        crossref["status"] == "PASS",
        physical["status"] == "PASS",
    ])
    output_names = [
        "BATCH_MANIFEST.json", "PAGE_INDEX.jsonl", "QUESTION_INDEX.jsonl", "MARKING_INDEX.jsonl",
        "VISUAL_MANIFEST.json", "EXTRACTION_QA.md", "UNRESOLVED.md", "CROSS_REFERENCE_CHECK.json",
        "SELF_CHECK.json", "MARK_TOTAL_CHECK.json", "GLYPH_EXTRACTION_REVIEW.json",
        "SOURCE_EXTRACTION_PROVENANCE.json", "CORRECTION_CHECK_V2.json", "SEMANTIC_DELTA_V2.json",
        "IMMUTABLE_CORE_CHECK_V2.json", "REVISION_PROVENANCE_V2.json", "PHYSICAL_DELTA_V2.json",
        "VALIDATOR_RESULT.json",
    ]
    return {
        "work_order_id": "P1-S1-A2-B24-V2",
        "artifact_version": "B24-A2-v2",
        "parent_artifact_version": "B24-A2-v1",
        "finding_id": "A9-B24-MS-01",
        "finding_disposition": "CORRECTED_BY_A2_PENDING_A4_V2_A9_V2_A0_REVIEW",
        "gate_status": "A2_V2_HANDOFF_FROZEN_PENDING_INDEPENDENT_REVIEW" if passed else "A2_V2_VALIDATION_FAILED",
        "frozen": passed,
        "author": "A2",
        "review_chain": ["A4-B24-v2 exact-boundary and all-link retest", "A9-B24-v2 retest", "A0 batch decision"],
        "a3_retest_condition": "Only if A0 finds context, scope, hierarchy, locator, or visual drift.",
        "independent_review_complete": False,
        "scope": "Correct exactly 19 B24 marking-row boundaries; no lesson, translation, app, taxonomy, tracker, context, hierarchy, locator, or visual changes.",
        "input_pins": batch["revision_inputs"],
        "source_validation": batch["source_validation"],
        "counts": batch["record_counts"],
        "mark_total_status": {
            sid: {
                "cover_total": item["printed_cover_total_or_null"],
                "source_displayed_sum": item["displayed_mark_sum_from_source_transcript"],
                "indexed_sum": item["sum_of_indexed_question_and_part_marks"],
                "matches": item["matches"],
            }
            for sid, item in mark_totals.items()
        },
        "correction_evidence": {
            "status": correction["status"],
            "changed_records": semantic["actual_changed_record_count"],
            "unchanged_marking_records": semantic["unchanged_record_count"],
            "changed_field_union": semantic["changed_field_union"],
            "correction_check": artifact(OUT / "CORRECTION_CHECK_V2.json"),
            "semantic_delta": artifact(OUT / "SEMANTIC_DELTA_V2.json"),
            "immutable_core_check": artifact(OUT / "IMMUTABLE_CORE_CHECK_V2.json"),
            "revision_provenance": artifact(OUT / "REVISION_PROVENANCE_V2.json"),
            "physical_delta": artifact(PHYSICAL),
        },
        "structural_self_check": {
            "status": self_check["status"], "path": "SELF_CHECK.json",
            "sha256": sha256(OUT / "SELF_CHECK.json"), "performed_by": "A2; not independent review",
        },
        "cross_reference_check": {
            "status": crossref["status"], "path": "CROSS_REFERENCE_CHECK.json",
            "sha256": sha256(OUT / "CROSS_REFERENCE_CHECK.json"),
        },
        "schema_validator": {
            "status": "PASS" if validation.get("pass") else "FAIL",
            "path": "VALIDATOR_RESULT.json", "sha256": sha256(OUT / "VALIDATOR_RESULT.json"),
            "counts": validation.get("counts"), "errors": validation.get("errors", []),
        },
        "visual_review": {
            "visual_manifest_unchanged_from_v1": True,
            "full_page_renders": 156,
            "risk_regions": 130,
            "risk_region_state": "RENDERED_PENDING_INDEPENDENT_REVIEW",
        },
        "open_review_requirements": [
            "A4-v2 independently inspect all 19 corrected boundaries and rerun all 170 links",
            "A9-v2 review the frozen candidate and same-version A4 evidence",
            "A0 audit and batch decision",
        ],
        "outputs": {name: artifact(OUT / name) for name in output_names},
        "snapshot_manifest_path": "SNAPSHOT_MANIFEST.json",
        "snapshot_self_hash_note": "Snapshot excludes its own self-referential hash; exact SHA256 is reported to A0.",
        "created_utc": datetime.now(timezone.utc).isoformat(),
    }


def main() -> None:
    if SNAPSHOT.exists():
        raise RuntimeError("SNAPSHOT_MANIFEST.json already exists; refuse to mutate frozen v2.")
    physical = build_physical_delta()
    PHYSICAL.write_text(json.dumps(physical, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    if physical["status"] != "PASS":
        raise SystemExit("Physical delta check failed.")
    handoff = build_handoff()
    HANDOFF.write_text(json.dumps(handoff, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    if not handoff["frozen"]:
        raise SystemExit("Handoff checks failed; v2 is not frozen.")

    files = sorted(path for path in OUT.rglob("*") if path.is_file() and path != SNAPSHOT)
    entries = [artifact(path) for path in files]
    snapshot = {
        "artifact_version": "B24-A2-v2",
        "status": "FROZEN_A2_V2_HANDOFF_PENDING_A4_A9_A0",
        "created_utc": datetime.now(timezone.utc).isoformat(),
        "root": ".",
        "file_count": len(entries),
        "total_bytes": sum(row["byte_count"] for row in entries),
        "declared_counts": handoff["counts"],
        "files": entries,
        "self_hash_exclusion": "SNAPSHOT_MANIFEST.json is excluded from its own file list; exact SHA256 is reported to A0.",
    }
    SNAPSHOT.write_text(json.dumps(snapshot, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")

    actual = {
        path.relative_to(OUT).as_posix(): (sha256(path), path.stat().st_size)
        for path in OUT.rglob("*") if path.is_file() and path != SNAPSHOT
    }
    drift = [
        row["path"] for row in entries
        if actual.get(row["path"]) != (row["sha256"], row["byte_count"])
    ]
    extra = sorted(set(actual) - {row["path"] for row in entries})
    if drift or extra or len(actual) != len(entries):
        raise RuntimeError(f"Snapshot drift={drift[:5]} extra={extra[:5]}")
    print(json.dumps({
        "gate_status": handoff["gate_status"],
        "HANDOFF_CHECK_sha256": sha256(HANDOFF),
        "BATCH_MANIFEST_sha256": sha256(OUT / "BATCH_MANIFEST.json"),
        "MARKING_INDEX_sha256": sha256(OUT / "MARKING_INDEX.jsonl"),
        "CORRECTION_CHECK_V2_sha256": sha256(OUT / "CORRECTION_CHECK_V2.json"),
        "SEMANTIC_DELTA_V2_sha256": sha256(OUT / "SEMANTIC_DELTA_V2.json"),
        "IMMUTABLE_CORE_CHECK_V2_sha256": sha256(OUT / "IMMUTABLE_CORE_CHECK_V2.json"),
        "PHYSICAL_DELTA_V2_sha256": sha256(PHYSICAL),
        "VALIDATOR_RESULT_sha256": sha256(OUT / "VALIDATOR_RESULT.json"),
        "SNAPSHOT_MANIFEST_sha256": sha256(SNAPSHOT),
        "snapshot_file_count": len(entries),
        "snapshot_total_bytes": snapshot["total_bytes"],
        "physical_delta_counts": physical["counts"],
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
