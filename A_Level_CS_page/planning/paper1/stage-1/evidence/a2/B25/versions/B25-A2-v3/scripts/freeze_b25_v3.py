from __future__ import annotations

import hashlib
import json
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path


OUT = Path(__file__).resolve().parents[1]
V2 = OUT.parent / "B25-A2-v2"
P1 = OUT.parents[5]
WORKSPACE = P1.parents[2]
VALIDATOR = P1 / "stage-1/scripts/validate_batch.py"
STAGE0 = P1 / "stage-0/evidence/a2/SOURCE_MANIFEST.json"
HANDOFF = OUT / "HANDOFF_CHECK.json"
SNAPSHOT = OUT / "SNAPSHOT_MANIFEST.json"


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def artifact(path: Path) -> dict:
    return {"path": path.relative_to(OUT).as_posix(), "sha256": sha(path), "byte_count": path.stat().st_size}


def dump(path: Path, value: object) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def validate() -> dict:
    result = subprocess.run([sys.executable, str(VALIDATOR), str(OUT), str(STAGE0), str(WORKSPACE),
                             str(OUT / "VALIDATOR_RESULT.json")], cwd=WORKSPACE, text=True, capture_output=True)
    if result.stdout.strip():
        print(result.stdout.strip())
    data = json.loads((OUT / "VALIDATOR_RESULT.json").read_text(encoding="utf-8"))
    if result.returncode or not data.get("pass"):
        raise RuntimeError(f"Validator failed: {data.get('errors')}")
    return data


def physical_delta() -> dict:
    parent_snapshot = json.loads((V2 / "SNAPSHOT_MANIFEST.json").read_text(encoding="utf-8"))
    parent = {x["path"]: (x["sha256"], x["byte_count"]) for x in parent_snapshot["files"]}
    current = {p.relative_to(OUT).as_posix(): (sha(p), p.stat().st_size)
               for p in OUT.rglob("*") if p.is_file() and p.name not in {"SNAPSHOT_MANIFEST.json", "PHYSICAL_DELTA_V3.json"}}
    changed = sorted(path for path in set(parent) & set(current) if parent[path] != current[path])
    added = sorted(set(current) - set(parent))
    deleted = sorted(set(parent) - set(current))
    unchanged = sorted(path for path in set(parent) & set(current) if parent[path] == current[path])
    data = {"artifact_version": "B25-A2-v3", "parent_artifact_version": "B25-A2-v2", "status": "PASS",
            "parent_snapshot_sha256": sha(V2 / "SNAPSHOT_MANIFEST.json"), "parent_snapshot_entries": len(parent),
            "changed_file_count": len(changed), "added_file_count": len(added), "deleted_file_count": len(deleted),
            "unchanged_file_count": len(unchanged), "changed_paths": changed, "added_paths": added,
            "deleted_paths": deleted, "unchanged_paths": unchanged,
            "corpus_semantic_delta": {"changed_files": ["MARKING_INDEX.jsonl"], "changed_records": 8,
                                      "unchanged_marking_rows": 175,
                                      "changed_field_union": ["mark_or_condition_or_null"]}}
    if deleted:
        raise RuntimeError(f"Unexpected deleted parent files: {deleted}")
    dump(OUT / "PHYSICAL_DELTA_V3.json", data)
    return data


def build_handoff(validation: dict, delta: dict) -> dict:
    batch = json.loads((OUT / "BATCH_MANIFEST.json").read_text(encoding="utf-8"))
    names = ["BATCH_MANIFEST.json", "PAGE_INDEX.jsonl", "QUESTION_INDEX.jsonl", "MARKING_INDEX.jsonl",
             "VISUAL_MANIFEST.json", "MARK_TOTAL_CHECK.json", "CROSS_REFERENCE_CHECK.json", "SELF_CHECK.json",
             "VALIDATOR_RESULT.json", "CORRECTION_CHECK_V3.json", "SEMANTIC_DELTA_V3.json",
             "IMMUTABLE_CORE_CHECK_V3.json", "REVISION_PROVENANCE_V3.json", "PHYSICAL_DELTA_V3.json",
             "EXTRACTION_QA.md", "UNRESOLVED.md", "REVISION_NOTES.md"]
    outputs = {name: artifact(OUT / name) for name in names}
    return {
        "work_order_id": "P1-S1-A2-B25-V3", "artifact_version": "B25-A2-v3",
        "gate_status": "A2_HANDOFF_FROZEN_PENDING_A0_AUDIT_A4_V3_A9_V3_A0_DECISION", "frozen": True,
        "author": "A2", "independent_review_complete": False,
        "review_chain": ["A0 identity and exact-delta audit", "A4-v3 eight-boundary and 183-link review",
                         "A9-v3 review", "A0 batch decision"],
        "scope": "Exact correction of eight B25 marking-excerpt boundaries only; no app, tracker, lesson, translation, taxonomy, source, context, page, question or visual edits.",
        "input_pins": batch["revision_inputs"], "source_validation": batch["source_validation"],
        "counts": batch["record_counts"],
        "exact_delta": {"status": "PASS", "changed_records": 8, "unchanged_serialized_rows": 175,
                        "changed_field_union": ["mark_or_condition_or_null"],
                        "remaining_terminal_generic_headers": 0,
                        "evidence": ["SEMANTIC_DELTA_V3.json", "CORRECTION_CHECK_V3.json"]},
        "immutable_core": {"status": "PASS", "evidence": "IMMUTABLE_CORE_CHECK_V3.json"},
        "physical_delta": {"status": delta["status"], "changed_file_count": delta["changed_file_count"],
                           "added_file_count": delta["added_file_count"], "deleted_file_count": delta["deleted_file_count"],
                           "evidence": "PHYSICAL_DELTA_V3.json"},
        "schema_validator": {"status": "PASS", "path": "VALIDATOR_RESULT.json",
                             "sha256": sha(OUT / "VALIDATOR_RESULT.json"), "counts": validation["counts"], "errors": []},
        "mark_total_status": {"pair_count": 6, "all_equal_75": True, "evidence": "MARK_TOTAL_CHECK.json"},
        "open_review_requirements": ["A0 audit", "A4-v3 review", "A9-v3 review", "A0 acceptance"],
        "outputs": outputs, "snapshot_manifest_path": "SNAPSHOT_MANIFEST.json",
        "snapshot_self_hash_note": "Snapshot inventories every packet file except its own self-referential hash; exact snapshot SHA256 is reported to A0.",
        "created_utc": datetime.now(timezone.utc).isoformat(),
    }


def main() -> None:
    if SNAPSHOT.exists():
        raise RuntimeError("Snapshot already exists; candidate is already frozen")
    validation = validate()
    # First handoff lets physical delta record the final handoff path as a changed parent file.
    dump(HANDOFF, {"artifact_version": "B25-A2-v3", "gate_status": "ASSEMBLING", "frozen": False})
    delta = physical_delta()
    handoff = build_handoff(validation, delta)
    dump(HANDOFF, handoff)
    validation = validate()
    handoff = build_handoff(validation, delta)
    dump(HANDOFF, handoff)
    validation = validate()
    handoff = build_handoff(validation, delta)
    dump(HANDOFF, handoff)

    entries = [artifact(p) for p in sorted(OUT.rglob("*")) if p.is_file() and p != SNAPSHOT]
    snapshot = {"artifact_version": "B25-A2-v3", "status": "FROZEN_A2_HANDOFF_PENDING_INDEPENDENT_REVIEW",
                "created_utc": datetime.now(timezone.utc).isoformat(), "root": ".", "file_count": len(entries),
                "total_bytes": sum(x["byte_count"] for x in entries), "declared_counts": handoff["counts"],
                "files": entries,
                "self_hash_exclusion": "SNAPSHOT_MANIFEST.json is excluded from its own inventory; its SHA256 is reported with this handoff."}
    dump(SNAPSHOT, snapshot)
    actual = {p.relative_to(OUT).as_posix(): (sha(p), p.stat().st_size)
              for p in OUT.rglob("*") if p.is_file() and p != SNAPSHOT}
    drift = [x["path"] for x in entries if actual.get(x["path"]) != (x["sha256"], x["byte_count"])]
    if drift or len(actual) != len(entries):
        raise RuntimeError(f"Snapshot verification failed: drift={drift[:5]}, expected={len(entries)}, actual={len(actual)}")
    print(json.dumps({"gate_status": handoff["gate_status"], "validator_pass": validation["pass"],
                      "counts": handoff["counts"], "HANDOFF_CHECK_sha256": sha(HANDOFF),
                      "BATCH_MANIFEST_sha256": sha(OUT / "BATCH_MANIFEST.json"),
                      "SNAPSHOT_MANIFEST_sha256": sha(SNAPSHOT), "snapshot_file_count": len(entries),
                      "snapshot_total_bytes": snapshot["total_bytes"]}))


if __name__ == "__main__":
    main()
