from __future__ import annotations

import hashlib
import json
import re
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

OUT = Path(__file__).resolve().parents[1]
P1 = OUT.parents[5]
WORKSPACE = P1.parents[2]
STAGE0 = P1 / "stage-0/evidence/a2/SOURCE_MANIFEST.json"
VALIDATOR = P1 / "stage-1/scripts/validate_batch.py"
VALIDATOR_RESULT = OUT / "VALIDATOR_RESULT.json"
HANDOFF = OUT / "HANDOFF_CHECK.json"
SNAPSHOT = OUT / "SNAPSHOT_MANIFEST.json"


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for block in iter(lambda: f.read(1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()


def artifact(path: Path) -> dict:
    return {"path": path.relative_to(OUT).as_posix(), "sha256": sha256(path), "byte_count": path.stat().st_size}


def run_validator() -> dict:
    completed = subprocess.run(
        [sys.executable, str(VALIDATOR), str(OUT), str(STAGE0), str(WORKSPACE), str(VALIDATOR_RESULT)],
        cwd=WORKSPACE, capture_output=True, text=True, check=False,
    )
    if completed.stdout.strip():
        print(completed.stdout.strip())
    if completed.stderr.strip():
        print(completed.stderr.strip(), file=sys.stderr)
    if not VALIDATOR_RESULT.is_file():
        raise RuntimeError("Validator did not write VALIDATOR_RESULT.json")
    return json.loads(VALIDATOR_RESULT.read_text(encoding="utf-8"))


def build_handoff(validation: dict | None) -> dict:
    batch = json.loads((OUT / "BATCH_MANIFEST.json").read_text(encoding="utf-8"))
    self_check = json.loads((OUT / "SELF_CHECK.json").read_text(encoding="utf-8"))
    crossref = json.loads((OUT / "CROSS_REFERENCE_CHECK.json").read_text(encoding="utf-8"))
    mark_totals = json.loads((OUT / "MARK_TOTAL_CHECK.json").read_text(encoding="utf-8"))["pairs"]
    artifact_paths = [
        "BATCH_MANIFEST.json", "PAGE_INDEX.jsonl", "QUESTION_INDEX.jsonl", "MARKING_INDEX.jsonl",
        "VISUAL_MANIFEST.json", "EXTRACTION_QA.md", "UNRESOLVED.md", "CROSS_REFERENCE_CHECK.json",
        "SELF_CHECK.json", "MARK_TOTAL_CHECK.json", "GLYPH_EXTRACTION_REVIEW.json",
        "SOURCE_EXTRACTION_PROVENANCE.json", "VALIDATOR_RESULT.json",
        "CORRECTION_DELTA.json", "CORRECTION_CHECKS.json", "REVISION_NOTES.md",
    ]
    outputs = {name: artifact(OUT / name) for name in artifact_paths if (OUT / name).is_file()}
    if validation:
        validation_summary = {
            "status": "PASS" if validation.get("pass") else "FAIL",
            "path": "VALIDATOR_RESULT.json", "sha256": sha256(VALIDATOR_RESULT),
            "counts": validation.get("counts"), "errors": validation.get("errors", []),
        }
    else:
        validation_summary = {"status": "PENDING"}
    return {
        "work_order_id": "P1-S1-A2-B25-V2",
        "artifact_version": "B25-A2-v2",
        "gate_status": "A2_HANDOFF_FROZEN_PENDING_INDEPENDENT_REVIEW" if validation and validation.get("pass") else "A2_CANDIDATE_VALIDATION_PENDING",
        "frozen": bool(validation and validation.get("pass")),
        "author": "A2",
        "review_chain": ["A3-B25 independent review", "A4-B25 independent review", "A9-B25 review", "A0 batch decision"],
        "independent_review_complete": False,
        "scope": "Official 2025 Paper 1 QP/MS source extraction and indexing only; no app, tracker, lesson, translation, syllabus mapping, or taxonomy edits.",
        "input_pins": batch["revision_inputs"],
        "source_validation": batch["source_validation"],
        "counts": batch["record_counts"],
        "mark_total_status": {sid: {"cover_total": int(re.search(r"\b(\d+)\b", item["cover_total_source"]["excerpt_verbatim"]).group(1)) if re.search(r"\b(\d+)\b", item["cover_total_source"]["excerpt_verbatim"]) else None,
                                     "source_displayed_sum": item["displayed_mark_sum_from_source_transcript"],
                                     "indexed_sum": item["sum_of_indexed_question_and_part_marks"],
                                     "matches": item["matches"]}
                              for sid, item in mark_totals.items()},
        "structural_self_check": {"status": self_check["status"], "path": "SELF_CHECK.json",
                                  "sha256": sha256(OUT / "SELF_CHECK.json"),
                                  "performed_by": "A2; not independent review"},
        "cross_reference_check": {"status": crossref["status"], "path": "CROSS_REFERENCE_CHECK.json",
                                  "sha256": sha256(OUT / "CROSS_REFERENCE_CHECK.json")},
        "schema_validator": validation_summary,
        "visual_review": {
            "contact_sheets_screened_by_a2": len(json.loads((OUT / "VISUAL_MANIFEST.json").read_text(encoding="utf-8"))["contact_sheets"]),
            "full_page_renders": 178,
            "risk_regions": 144,
            "risk_region_state": "RENDERED_PENDING_INDEPENDENT_REVIEW",
        },
        "open_review_requirements": ["A3/A4 full-size source evidence and visual review", "A9 review of evidence and A3/A4 findings", "A0 acceptance decision"],
        "outputs": outputs,
        "snapshot_manifest_path": "SNAPSHOT_MANIFEST.json",
        "snapshot_self_hash_note": "The snapshot records every packet artifact except its own self-referential hash; exact snapshot SHA256 is supplied with this handoff.",
        "created_utc": datetime.now(timezone.utc).isoformat(),
    }


def write_handoff(data: dict) -> None:
    HANDOFF.write_text(json.dumps(data, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def main() -> None:
    write_handoff(build_handoff(None))
    validation = run_validator()
    if not validation.get("pass"):
        write_handoff(build_handoff(validation))
        raise SystemExit("Validator failed; candidate remains unfrozen for correction.")

    # Freeze candidate handoff with the successful validator result and verify again.
    write_handoff(build_handoff(validation))
    validation = run_validator()
    if not validation.get("pass"):
        write_handoff(build_handoff(validation))
        raise SystemExit("Validator failed after handoff assembly; candidate is not frozen.")
    write_handoff(build_handoff(validation))
    # The final handoff references a validator output that does not depend on handoff content.
    final_validation = run_validator()
    if not final_validation.get("pass"):
        write_handoff(build_handoff(final_validation))
        raise SystemExit("Final validator check failed; candidate is not frozen.")
    final_data = build_handoff(final_validation)
    write_handoff(final_data)
    # Re-run once after final handoff serialization; validator output is deterministic for this packet.
    confirmed = run_validator()
    if not confirmed.get("pass"):
        write_handoff(build_handoff(confirmed))
        raise SystemExit("Final post-handoff validator check failed; candidate is not frozen.")
    final_data = build_handoff(confirmed)
    write_handoff(final_data)

    if SNAPSHOT.exists():
        raise RuntimeError("Snapshot manifest already exists; do not mutate a frozen packet.")
    files = sorted(p for p in OUT.rglob("*") if p.is_file() and p != SNAPSHOT)
    entries = [artifact(path) for path in files]
    snapshot = {
        "artifact_version": "B25-A2-v2",
        "status": "FROZEN_A2_HANDOFF_PENDING_INDEPENDENT_REVIEW",
        "created_utc": datetime.now(timezone.utc).isoformat(),
        "root": ".",
        "file_count": len(entries),
        "total_bytes": sum(x["byte_count"] for x in entries),
        "declared_counts": final_data["counts"],
        "files": entries,
        "self_hash_exclusion": "SNAPSHOT_MANIFEST.json is excluded from its own file list; its exact SHA256 is reported to A0 with the handoff.",
    }
    SNAPSHOT.write_text(json.dumps(snapshot, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")

    # Verify the immutable snapshot inventory once; do not write again afterwards.
    actual_entries = {p.relative_to(OUT).as_posix(): (sha256(p), p.stat().st_size)
                      for p in OUT.rglob("*") if p.is_file() and p != SNAPSHOT}
    drift = [e["path"] for e in entries if actual_entries.get(e["path"]) != (e["sha256"], e["byte_count"])]
    if drift:
        raise RuntimeError(f"Snapshot drift detected: {drift[:5]}")
    print(json.dumps({
        "gate_status": final_data["gate_status"],
        "validator_pass": confirmed["pass"],
        "counts": final_data["counts"],
        "HANDOFF_CHECK_sha256": sha256(HANDOFF),
        "BATCH_MANIFEST_sha256": sha256(OUT / "BATCH_MANIFEST.json"),
        "SNAPSHOT_MANIFEST_sha256": sha256(SNAPSHOT),
        "snapshot_file_count": len(entries), "snapshot_total_bytes": snapshot["total_bytes"],
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
