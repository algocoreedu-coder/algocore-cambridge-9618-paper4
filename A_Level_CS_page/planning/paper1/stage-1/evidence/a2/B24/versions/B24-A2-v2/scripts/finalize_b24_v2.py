from __future__ import annotations

import hashlib
import json
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

OUT = Path(__file__).resolve().parents[1]
V1 = OUT.parent / "B24-A2-v1"
P1 = OUT.parents[5]
WORKSPACE = P1.parents[2]
STAGE0 = P1 / "stage-0/evidence/a2/SOURCE_MANIFEST.json"
SCHEMA = P1 / "stage-1/CORPUS_SCHEMA.md"
POLICY = P1 / "stage-1/EXTRACTION_POLICY.md"
DISPATCH = P1 / "stage-1/evidence/a0/B24_A2_V2_DISPATCH.md"
DISPATCH_RECORD = P1 / "stage-1/evidence/a0/B24_A2_V2_DISPATCH_RECORD.json"
VALIDATOR = P1 / "stage-1/scripts/validate_batch.py"
VALIDATOR_RESULT = OUT / "VALIDATOR_RESULT.json"

PIN_SPECS = {
    "v2_dispatch": (DISPATCH, "0959c409de09ed1e4c51f70be51a39c588221a052485e6518641294813976e66"),
    "v2_dispatch_record": (DISPATCH_RECORD, "3c2801838b2f4b7f34d11c478a7497528a312ca85cd1732f1ba5f0466a5e8f04"),
    "v1_handoff": (V1 / "HANDOFF_CHECK.json", "d1946e1bd9c3a2b61bb8c3728873c860e3066240c990176649a2189902c145bd"),
    "v1_batch_manifest": (V1 / "BATCH_MANIFEST.json", "1a18ace3982d37dd6da5288238d7ca3cb5010d3b5977fe9481c40a93968d4486"),
    "v1_snapshot": (V1 / "SNAPSHOT_MANIFEST.json", "dbdc02935d5e8150019633e7138af1100b973cdcea7880116c4bdffcb417db97"),
    "a0_v1_audit": (P1 / "stage-1/evidence/a0/B24_A2_V1_A0_AUDIT.json", "cc9563fd98aae568f6a6ee29ed9e8e83738e2ebde3089eb8440ee9c528d70ca1"),
    "a3_v1_handoff": (P1 / "stage-1/evidence/a3/B24/review_v1/HANDOFF_REVIEW_V1.json", "8da881280e8e09f55bdc1d9e19e827ecbce56d5c4df3df418050ab42d60a22cf"),
    "a0_a3_v1_audit": (P1 / "stage-1/evidence/a0/B24_A3_V1_HANDOFF_AUDIT.json", "62d3784778c719cb8747146a0627b8726d36b23e0f45e0dcdda7ba4cba68bb83"),
    "a4_v1_handoff": (P1 / "stage-1/evidence/a4/B24/review_v1/HANDOFF_REVIEW_V1.json", "e145320c7805acd8e70a1d507a1f902e59e7d517e967cfb9314e47d909bcff3e"),
    "a4_v1_output_manifest": (P1 / "stage-1/evidence/a4/B24/review_v1/OUTPUT_MANIFEST_V1.json", "092dea2479ced3be66f9e5bb71c120bfdf525c30b0c70fb7cf3938490c08dc4e"),
    "a0_a4_v1_audit": (P1 / "stage-1/evidence/a0/B24_A4_V1_HANDOFF_AUDIT.json", "3a085ed2cc214f002f771af1a238f36facd75c0a7e7a814d0c70f5666c881867"),
    "a9_v1_handoff": (P1 / "stage-1/evidence/a9/B24/review_v1/HANDOFF_REVIEW_V1.json", "ccb42b04231de24e29292fdd8404b72e6b9fb6f514efafccf685c7220535bf59"),
    "a9_v1_findings": (P1 / "stage-1/evidence/a9/B24/review_v1/FINDINGS_V1.json", "f0cfa70f3d1981777494a13e99ef18232ae29f8b859fe2bb407a1241af403d48"),
    "a0_a9_v1_audit": (P1 / "stage-1/evidence/a0/B24_A9_V1_HANDOFF_AUDIT.json", "85caefde79759a8f6466829dc63ca93f5dea5c0104d29a93d7f5b99817fd7684"),
    "stage0_source_manifest": (STAGE0, "195a68ad98b4739dff0d3496dc93ba9e85d67d2dae0d88e3d4e4a088f1259c9c"),
    "schema": (SCHEMA, "9fe71d4719b0c8f9fd6d6fd6fb0316c7f9a840b6b964634889ea6d98245a1f1f"),
    "extraction_policy": (POLICY, "97bd6c69ea8d459ea99713e943c2d092a88999b6df7cb315d2820547789c11f2"),
}


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()


def read_jsonl(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def rel_p1(path: Path) -> str:
    return path.relative_to(P1).as_posix()


def artifact(path: Path) -> dict:
    return {"path": path.relative_to(OUT).as_posix(), "sha256": sha256(path), "byte_count": path.stat().st_size}


def main() -> None:
    pin_rows = {}
    for name, (path, expected) in PIN_SPECS.items():
        actual = sha256(path)
        if actual != expected:
            raise RuntimeError(f"Pin mismatch {name}: {actual}")
        pin_rows[name] = {"path": rel_p1(path), "sha256": actual}

    v1_batch = json.loads((V1 / "BATCH_MANIFEST.json").read_text(encoding="utf-8"))
    stage0 = json.loads(STAGE0.read_text(encoding="utf-8"))
    stage0_by = {row["id"]: row for row in stage0["primary_sources"]}
    source_checks = []
    for item in v1_batch["inputs"]:
        source_path = WORKSPACE / item["relative_path"]
        actual = sha256(source_path)
        baseline = stage0_by[item["source_id"]]
        ok = actual == item["sha256_baseline"] == baseline["sha256"] and item["page_count"] == baseline["page_count"]
        source_checks.append({
            "source_id": item["source_id"], "path": item["relative_path"],
            "sha256": actual, "page_count": item["page_count"], "matches_v1_and_stage0": ok,
        })
    if len(source_checks) != 12 or sum(row["page_count"] for row in source_checks) != 156 or not all(row["matches_v1_and_stage0"] for row in source_checks):
        raise RuntimeError("Source pin or page total mismatch.")

    correction = json.loads((OUT / "CORRECTION_CHECK_V2.json").read_text(encoding="utf-8"))
    semantic = json.loads((OUT / "SEMANTIC_DELTA_V2.json").read_text(encoding="utf-8"))
    if correction["status"] != "PASS" or semantic["status"] != "PASS":
        raise RuntimeError("Correction evidence is not PASS.")

    core_files = [
        "PAGE_INDEX.jsonl", "QUESTION_INDEX.jsonl", "VISUAL_MANIFEST.json",
        "MARK_TOTAL_CHECK.json", "GLYPH_EXTRACTION_REVIEW.json", "SOURCE_EXTRACTION_PROVENANCE.json",
    ]
    core_rows = []
    for name in core_files:
        old_hash = sha256(V1 / name)
        new_hash = sha256(OUT / name)
        core_rows.append({"path": name, "v1_sha256": old_hash, "v2_sha256": new_hash, "identical": old_hash == new_hash})
    for folder in ("contexts", "transcripts", "renders"):
        old_files = {p.relative_to(V1).as_posix(): sha256(p) for p in (V1 / folder).rglob("*") if p.is_file()}
        new_files = {p.relative_to(OUT).as_posix(): sha256(p) for p in (OUT / folder).rglob("*") if p.is_file()}
        core_rows.append({"path": folder + "/", "v1_file_count": len(old_files), "v2_file_count": len(new_files), "identical": old_files == new_files})
    if not all(row["identical"] for row in core_rows):
        raise RuntimeError("A context, visual, transcript, render, question, page, or total artifact changed.")

    qrows = read_jsonl(OUT / "QUESTION_INDEX.jsonl")
    mrows = read_jsonl(OUT / "MARKING_INDEX.jsonl")
    vmanifest = json.loads((OUT / "VISUAL_MANIFEST.json").read_text(encoding="utf-8"))
    roots = [row for row in qrows if "question_number" in row]
    parts = [row for row in qrows if "label" in row]
    parent_groups = [row for row in parts if row["status"] == "EXTRACTED"]
    contexts = list((OUT / "contexts").glob("*.json"))
    if (len(roots), len(parts), len(mrows), len(parent_groups), len(contexts), len(vmanifest["visual_regions"])) != (49, 194, 170, 29, 49, 130):
        raise RuntimeError("Corpus count drift.")
    totals = json.loads((OUT / "MARK_TOTAL_CHECK.json").read_text(encoding="utf-8"))["pairs"]
    if len(totals) != 6 or not all(
        row["matches"] and row["printed_cover_total_or_null"] == 75
        and row["displayed_mark_sum_from_source_transcript"] == 75
        and row["sum_of_indexed_question_and_part_marks"] == 75 for row in totals.values()
    ):
        raise RuntimeError("Displayed mark total drift.")

    immutable = {
        "artifact_version": "B24-A2-v2", "status": "PASS",
        "checks": {
            "source_pins_12_and_pages_156": True,
            "page_question_context_visual_artifacts_unchanged": True,
            "contexts_49": len(contexts) == 49,
            "visual_regions_130": len(vmanifest["visual_regions"]) == 130,
            "parent_groups_29": len(parent_groups) == 29,
            "all_six_totals_75": True,
        },
        "core_comparisons": core_rows, "source_checks": source_checks,
    }
    (OUT / "IMMUTABLE_CORE_CHECK_V2.json").write_text(
        json.dumps(immutable, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8"
    )
    provenance = {
        "artifact_version": "B24-A2-v2", "parent_version": "B24-A2-v1",
        "finding_id": "A9-B24-MS-01",
        "scope": "Remove only the trailing generic following-table header from 19 marking excerpts.",
        "created_utc": datetime.now(timezone.utc).isoformat(),
        "input_pins": pin_rows, "source_checks": source_checks,
        "correction_check": {"path": "CORRECTION_CHECK_V2.json", "sha256": sha256(OUT / "CORRECTION_CHECK_V2.json")},
        "semantic_delta": {"path": "SEMANTIC_DELTA_V2.json", "sha256": sha256(OUT / "SEMANTIC_DELTA_V2.json")},
        "immutable_core_check": {"path": "IMMUTABLE_CORE_CHECK_V2.json", "sha256": sha256(OUT / "IMMUTABLE_CORE_CHECK_V2.json")},
    }
    (OUT / "REVISION_PROVENANCE_V2.json").write_text(
        json.dumps(provenance, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8"
    )

    crossref = json.loads((OUT / "CROSS_REFERENCE_CHECK.json").read_text(encoding="utf-8"))
    crossref["batch_id"] = "B24-A2-v2"
    crossref["correction_scope"] = {
        "finding_id": "A9-B24-MS-01", "status": "PASS",
        "target_rows_changed": 19, "other_marking_rows_identical": 151,
        "correction_check_path": "CORRECTION_CHECK_V2.json",
        "semantic_delta_path": "SEMANTIC_DELTA_V2.json",
    }
    (OUT / "CROSS_REFERENCE_CHECK.json").write_text(
        json.dumps(crossref, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8"
    )
    self_check = json.loads((OUT / "SELF_CHECK.json").read_text(encoding="utf-8"))
    self_check["batch_id"] = "B24-A2-v2"
    self_check["correction_scope"] = crossref["correction_scope"]
    self_check["independent_review"] = "PENDING_A4_V2_A9_V2_A0"
    (OUT / "SELF_CHECK.json").write_text(
        json.dumps(self_check, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8"
    )

    qa = (OUT / "EXTRACTION_QA.md").read_text(encoding="utf-8")
    qa = qa.replace("# B24-A2-v1 extraction QA", "# B24-A2-v2 correction and extraction QA", 1)
    qa = qa.replace(
        "Status: **A2 extraction packet complete; independent A3/A4/A9/A0 review pending.** This is not batch acceptance.",
        "Status: **A2 v2 correction complete; independent A4-v2/A9-v2/A0 review pending.** This is not batch acceptance.", 1,
    )
    if "## A9-B24-MS-01 correction" not in qa:
        qa = qa.replace(
            "## Independent review gate",
            "## A9-B24-MS-01 correction\n\n"
            "Exactly 19 marking excerpts had the generic 'Question / Answer / Marks' header of a following table removed. "
            "Only 'mark_or_condition_or_null' changed in those records; the other 151 marking items and all context, "
            "hierarchy, locator, visual, transcript, render and mark-total artifacts remain identical to v1. "
            "See CORRECTION_CHECK_V2.json, SEMANTIC_DELTA_V2.json and IMMUTABLE_CORE_CHECK_V2.json.\n\n"
            "## Independent review gate", 1,
        )
    qa = qa.replace("leaving B24-A2-v1 immutable after handoff", "leaving B24-A2-v2 immutable after handoff")
    qa = qa.replace(
        "Next: A3 and A4 independently inspect the evidence and visual regions; A9 reviews their findings and the frozen packet; A0 decides acceptance.",
        "Next: A4 independently retests all 19 corrected boundaries and all 170 links; A9 reviews the same frozen version; A0 decides acceptance. A3 retest is unnecessary unless A0 finds context, hierarchy, locator or visual drift.",
    )
    (OUT / "EXTRACTION_QA.md").write_text(qa, encoding="utf-8")
    unresolved = (OUT / "UNRESOLVED.md").read_text(encoding="utf-8")
    unresolved = unresolved.replace("# B24-A2-v1 unresolved items and review risks", "# B24-A2-v2 unresolved items and review risks", 1)
    if "## A9-B24-MS-01 disposition" not in unresolved:
        unresolved = unresolved.replace(
            "## Independent visual review remains open",
            "## A9-B24-MS-01 disposition\n\n"
            "The 19 contaminated marking-row suffixes are corrected in v2 with exact semantic-delta evidence. "
            "Independent A4-v2 and A9-v2 retests remain open; this A2 packet does not close the batch gate.\n\n"
            "## Independent visual review remains open", 1,
        )
    (OUT / "UNRESOLVED.md").write_text(unresolved, encoding="utf-8")

    excluded = {"BATCH_MANIFEST.json", "HANDOFF_CHECK.json", "SNAPSHOT_MANIFEST.json", "VALIDATOR_RESULT.json", "PHYSICAL_DELTA_V2.json"}
    active_paths = sorted(path for path in OUT.rglob("*") if path.is_file() and path.name not in excluded)
    batch = {
        "batch_id": "B24", "artifact_version": "B24-A2-v2", "parent_artifact_version": "B24-A2-v1",
        "status": "SUBMITTED_FOR_A4_V2_A9_V2_A0_REVIEW", "schema_version": "1.1",
        "author": "A2", "finding_addressed": "A9-B24-MS-01",
        "inputs": v1_batch["inputs"], "record_counts": dict(v1_batch["record_counts"]),
        "revision_inputs": pin_rows,
        "source_validation": {
            "source_count": 12, "stage0_matches": 12, "total_pages": 156,
            "checks": source_checks, "stage0_source_manifest_sha256": sha256(STAGE0),
        },
        "correction_evidence": {
            "correction_check": artifact(OUT / "CORRECTION_CHECK_V2.json"),
            "semantic_delta": artifact(OUT / "SEMANTIC_DELTA_V2.json"),
            "immutable_core_check": artifact(OUT / "IMMUTABLE_CORE_CHECK_V2.json"),
            "revision_provenance": artifact(OUT / "REVISION_PROVENANCE_V2.json"),
        },
        "derived_artifacts": [{"path": path.relative_to(OUT).as_posix(), "byte_count": path.stat().st_size} for path in active_paths],
        "active_artifact_sha256": {path.relative_to(OUT).as_posix(): sha256(path) for path in active_paths},
        "active_artifact_hash_exclusions": [
            "BATCH_MANIFEST.json (self-referential; final hash is in HANDOFF_CHECK.json)",
            "HANDOFF_CHECK.json (written after validator and delta assembly)",
            "SNAPSHOT_MANIFEST.json (self-referential inventory; final hash reported to A0)",
            "VALIDATOR_RESULT.json (written after batch manifest)",
            "PHYSICAL_DELTA_V2.json (written after final non-snapshot artifact comparison)",
        ],
        "notes": [
            "Exactly 19 marking rows changed, and only mark_or_condition_or_null changed in those rows.",
            "The other 151 marking items are semantically and line-serialization identical to v1.",
            "Question, part, page, context, visual, source, transcript, render and mark-total artifacts remain identical to v1.",
            "A4-v2, A9-v2 and A0 review remain mandatory; this packet does not accept the batch.",
        ],
    }
    (OUT / "BATCH_MANIFEST.json").write_text(
        json.dumps(batch, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8"
    )
    completed = subprocess.run(
        [sys.executable, str(VALIDATOR), str(OUT), str(STAGE0), str(WORKSPACE), str(VALIDATOR_RESULT)],
        cwd=WORKSPACE, capture_output=True, text=True, check=False,
    )
    if completed.stdout.strip():
        print(completed.stdout.strip())
    if completed.stderr.strip():
        print(completed.stderr.strip(), file=sys.stderr)
    validation = json.loads(VALIDATOR_RESULT.read_text(encoding="utf-8"))
    if not validation.get("pass"):
        raise SystemExit("Stage 1 validator failed.")
    print(json.dumps({
        "status": "PASS", "artifact_version": "B24-A2-v2",
        "batch_manifest_sha256": sha256(OUT / "BATCH_MANIFEST.json"),
        "validator_result_sha256": sha256(VALIDATOR_RESULT),
        "marking_index_sha256": sha256(OUT / "MARKING_INDEX.jsonl"),
        "correction_check_sha256": sha256(OUT / "CORRECTION_CHECK_V2.json"),
        "semantic_delta_sha256": sha256(OUT / "SEMANTIC_DELTA_V2.json"),
        "immutable_core_check_sha256": sha256(OUT / "IMMUTABLE_CORE_CHECK_V2.json"),
        "revision_provenance_sha256": sha256(OUT / "REVISION_PROVENANCE_V2.json"),
    }))


if __name__ == "__main__":
    main()
