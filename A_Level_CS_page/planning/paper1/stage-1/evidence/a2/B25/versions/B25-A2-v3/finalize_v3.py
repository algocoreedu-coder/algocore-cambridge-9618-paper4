from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path


OUT = Path(__file__).resolve().parent
V2 = OUT.parent / "B25-A2-v2"
P1 = OUT.parents[5]
STAGE1 = P1 / "stage-1"
WORKSPACE = P1.parents[2]

PINS = {
    "dispatch": ("stage-1/evidence/a0/B25_A2_V3_DISPATCH.md", "5743015d0f8660382740cd54e9d6ba41aedb999aad7ad3fd7446b40105e75d8e"),
    "dispatch_record": ("stage-1/evidence/a0/B25_A2_V3_DISPATCH_RECORD.json", "2a03ba0fd31b64fb3f20eaa41580f1df35bcd1a69a2d36b56937acf6390b987b"),
    "parent_v2_handoff": ("stage-1/evidence/a2/B25/versions/B25-A2-v2/HANDOFF_CHECK.json", "e76a1dd54350d237b76cd5c50fa3fbcb2de515b2e46b6f60c074bf83812027f5"),
    "parent_v2_batch_manifest": ("stage-1/evidence/a2/B25/versions/B25-A2-v2/BATCH_MANIFEST.json", "063e47ee4726c310d63646a4b777a61fd5054ee4d47c3c00b7e290592609fca8"),
    "parent_v2_snapshot_manifest": ("stage-1/evidence/a2/B25/versions/B25-A2-v2/SNAPSHOT_MANIFEST.json", "56374136cee31b62382c44f8e26fb31b2e6319bc689373e938b077493161be94"),
    "a9_v2_handoff": ("stage-1/evidence/a9/B25/review_v2/HANDOFF_REVIEW_V2.json", "c01a3453afed6095a0948fb29d98e5d9e3639e261da956dd89334b3eadc0108d"),
    "a9_v2_findings": ("stage-1/evidence/a9/B25/review_v2/FINDINGS_V2.json", "d3b50d623011aba5dfc0f2189052a41c06d868c75cd305621285d38abd062ce9"),
    "a0_a9_v2_audit": ("stage-1/evidence/a0/B25_A9_V2_HANDOFF_AUDIT.json", "0d81b5d0c7bfb190b8438f00ea9b0cdb0a81465348eaecf648dae06beeeb23a0"),
    "a3_v2_handoff": ("stage-1/evidence/a3/B25/retest_v2/HANDOFF_RETEST_V2.json", "e190a65d00eb9a5a4c67babc03580e3427340b138b6a36566972327f2f420112"),
    "a4_v2_handoff": ("stage-1/evidence/a4/B25/retest_v2/HANDOFF_RETEST_V2.json", "fadda1eeb35560ef52d5a134ea5b595dbf0b8566fc119ab6c1b58db6f21994a1"),
    "stage0_source_manifest": ("stage-0/evidence/a2/SOURCE_MANIFEST.json", "195a68ad98b4739dff0d3496dc93ba9e85d67d2dae0d88e3d4e4a088f1259c9c"),
    "schema": ("stage-1/CORPUS_SCHEMA.md", "9fe71d4719b0c8f9fd6d6fd6fb0316c7f9a840b6b964634889ea6d98245a1f1f"),
    "extraction_policy": ("stage-1/EXTRACTION_POLICY.md", "97bd6c69ea8d459ea99713e943c2d092a88999b6df7cb315d2820547789c11f2"),
}
EXCLUDED_ACTIVE = {"BATCH_MANIFEST.json", "HANDOFF_CHECK.json", "SNAPSHOT_MANIFEST.json", "VALIDATOR_RESULT.json", "PHYSICAL_DELTA_V3.json"}


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def dump(path: Path, value: object) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def verify_snapshot() -> dict:
    snap_path = V2 / "SNAPSHOT_MANIFEST.json"
    snap = json.loads(snap_path.read_text(encoding="utf-8"))
    bad = []
    for item in snap["files"]:
        path = V2 / item["path"]
        if not path.is_file() or sha(path) != item["sha256"] or path.stat().st_size != item["byte_count"]:
            bad.append(item["path"])
    if len(snap["files"]) != 442 or bad:
        raise RuntimeError(f"Parent snapshot mismatch: entries={len(snap['files'])}, bad={bad[:5]}")
    return {"path": PINS["parent_v2_snapshot_manifest"][0], "sha256": sha(snap_path), "entry_count": 442, "all_entries_match": True}


def verify_pins() -> dict:
    checks = {}
    for name, (relative, expected) in PINS.items():
        path = P1 / relative
        actual = sha(path) if path.is_file() else None
        checks[name] = {"path": relative, "sha256_expected": expected, "sha256_actual": actual, "matches": actual == expected}
        if actual != expected:
            raise RuntimeError(f"Pin mismatch {name}: {actual} != {expected}")
    return checks


def verify_sources(batch: dict) -> dict:
    checks = []
    for item in batch["source_validation"]["checks"]:
        path = WORKSPACE / item["relative_path"]
        actual = sha(path)
        if actual != item["sha256_expected"]:
            raise RuntimeError(f"Source hash mismatch: {item['source_id']}")
        checks.append({"source_id": item["source_id"], "relative_path": item["relative_path"], "sha256": actual,
                       "page_count": item["page_count_expected"], "matches_stage0": True})
    if len(checks) != 12 or sum(x["page_count"] for x in checks) != 178:
        raise RuntimeError("Source baseline is not 12 PDFs / 178 pages")
    return {"status": "PASS", "source_count": 12, "total_pages": 178, "checks": checks}


def immutable_core() -> dict:
    fixed = ["PAGE_INDEX.jsonl", "QUESTION_INDEX.jsonl", "VISUAL_MANIFEST.json", "MARK_TOTAL_CHECK.json",
             "GLYPH_EXTRACTION_REVIEW.json", "SOURCE_EXTRACTION_PROVENANCE.json", "UNRESOLVED.md"]
    paths = fixed[:]
    for folder in ("contexts", "transcripts", "renders"):
        paths.extend(p.relative_to(OUT).as_posix() for p in sorted((OUT / folder).rglob("*")) if p.is_file())
    mismatches = []
    rows = []
    for rel in paths:
        left, right = V2 / rel, OUT / rel
        same = right.is_file() and sha(left) == sha(right) and left.stat().st_size == right.stat().st_size
        if not same:
            mismatches.append(rel)
        rows.append({"path": rel, "parent_sha256": sha(left), "candidate_sha256": sha(right) if right.is_file() else None,
                     "byte_identical": same})
    if mismatches:
        raise RuntimeError(f"Immutable core drift: {mismatches[:5]}")
    result = {"artifact_version": "B25-A2-v3", "parent_artifact_version": "B25-A2-v2", "status": "PASS",
              "compared_file_count": len(rows), "mismatch_count": 0, "mismatches": [],
              "scope": fixed + ["contexts/**", "transcripts/**", "renders/**"], "files": rows}
    dump(OUT / "IMMUTABLE_CORE_CHECK_V3.json", result)
    return result


def main() -> None:
    parent_snapshot = verify_snapshot()
    pins = verify_pins()
    batch = json.loads((V2 / "BATCH_MANIFEST.json").read_text(encoding="utf-8"))
    source_check = verify_sources(batch)
    core = immutable_core()
    delta = json.loads((OUT / "SEMANTIC_DELTA_V3.json").read_text(encoding="utf-8"))
    correction = json.loads((OUT / "CORRECTION_CHECK_V3.json").read_text(encoding="utf-8"))
    if delta["status"] != "PASS" or correction["status"] != "PASS":
        raise RuntimeError("Correction evidence did not pass")

    provenance = {
        "artifact_version": "B25-A2-v3", "work_order_id": "P1-S1-A2-B25-V3", "status": "PASS",
        "created_utc": datetime.now(timezone.utc).isoformat(), "input_pins": pins,
        "parent_snapshot_verification": parent_snapshot, "source_pdf_rehash": source_check,
        "change_scope": {"changed_corpus_file": "MARKING_INDEX.jsonl", "changed_record_count": 8,
                         "changed_field_union": ["mark_or_condition_or_null"], "unchanged_marking_rows": 175,
                         "remaining_terminal_generic_headers": 0},
        "immutable_core": {"status": core["status"], "compared_file_count": core["compared_file_count"],
                           "evidence": "IMMUTABLE_CORE_CHECK_V3.json"},
        "nonclaim": "A2 authors and freezes extraction evidence; this is not independent review or batch acceptance.",
    }
    dump(OUT / "REVISION_PROVENANCE_V3.json", provenance)

    cross = json.loads((OUT / "CROSS_REFERENCE_CHECK.json").read_text(encoding="utf-8"))
    cross["artifact_version"] = "B25-A2-v3"
    cross["batch_id"] = "B25-A2-v3"
    cross["status"] = "PASS"
    cross["v3_boundary_check"] = {"status": "PASS", "marking_items_checked": 183, "changed_records": 8,
                                  "unchanged_serialized_rows": 175, "terminal_generic_headers_remaining": 0,
                                  "evidence": ["CORRECTION_CHECK_V3.json", "SEMANTIC_DELTA_V3.json"]}
    dump(OUT / "CROSS_REFERENCE_CHECK.json", cross)
    self_check = json.loads((OUT / "SELF_CHECK.json").read_text(encoding="utf-8"))
    self_check["artifact_version"] = "B25-A2-v3"
    self_check["batch_id"] = "B25-A2-v3"
    self_check["independent_review"] = "PENDING_A0_A4_V3_A9_V3_A0_DECISION"
    self_check["v3_exact_delta"] = cross["v3_boundary_check"]
    dump(OUT / "SELF_CHECK.json", self_check)

    (OUT / "REVISION_NOTES.md").write_text(
        "# B25-A2-v3 revision notes\n\n"
        "This candidate is a complete copy of frozen B25-A2-v2 with the exact A9 finding `A9-B25-MS-01` corrected. "
        "Only the terminal repeated `Question / Answer / Marks` table header was removed from eight named marking excerpts. "
        "Each answer, condition, terminal mark token, target, locator, transcript, table-row reference, visual dependency and status is preserved.\n\n"
        "`SEMANTIC_DELTA_V3.json` proves exactly eight changed rows and one changed field; the other 175 marking lines are byte-identical. "
        "`CORRECTION_CHECK_V3.json` proves the full 183-row index contains no remaining terminal generic header. "
        "`IMMUTABLE_CORE_CHECK_V3.json` proves PAGE, QUESTION, context, visual, transcript and render evidence has no drift from v2.\n\n"
        "This is an A2 frozen handoff pending A0 identity audit, A4-v3 full marking review, A9-v3 review and A0 decision.\n",
        encoding="utf-8",
    )
    qa = (OUT / "EXTRACTION_QA.md").read_text(encoding="utf-8")
    qa = qa.replace("# B25-A2-v1 extraction QA", "# B25-A2-v3 extraction QA", 1)
    qa += ("\n## V3 boundary correction\n\nEight A9-identified marking excerpts had only their terminal repeated table header removed. "
           "The exact 8/175 delta and the zero-residual full-index scan are recorded in `SEMANTIC_DELTA_V3.json` and "
           "`CORRECTION_CHECK_V3.json`. Independent A4-v3/A9-v3 review and A0 acceptance remain pending.\n")
    (OUT / "EXTRACTION_QA.md").write_text(qa, encoding="utf-8")

    batch["artifact_version"] = "B25-A2-v3"
    batch["revision_inputs"] = {name: {"path": item[0], "sha256": item[1]} for name, item in PINS.items()}
    batch["revision_summary"] = {"parent": "B25-A2-v2", "finding": "A9-B25-MS-01", "changed_marking_records": 8,
                                 "unchanged_marking_records": 175, "changed_field_union": ["mark_or_condition_or_null"],
                                 "remaining_terminal_generic_headers": 0, "immutable_core_status": "PASS"}
    batch["source_validation"]["v3_rehash"] = source_check
    # Generate a complete current inventory after every pre-freeze author artifact exists.
    active = {}
    for path in sorted(p for p in OUT.rglob("*") if p.is_file()):
        rel = path.relative_to(OUT).as_posix()
        if rel not in EXCLUDED_ACTIVE:
            active[rel] = sha(path)
    batch["active_artifact_sha256"] = active
    batch["active_artifact_hash_exclusions"] = [
        "BATCH_MANIFEST.json (self-referential; final hash is in HANDOFF_CHECK.json)",
        "HANDOFF_CHECK.json (assembled after validation)",
        "SNAPSHOT_MANIFEST.json (self-hash excluded)",
        "VALIDATOR_RESULT.json (validator output)",
        "PHYSICAL_DELTA_V3.json (assembled after final handoff state)",
    ]
    dump(OUT / "BATCH_MANIFEST.json", batch)
    print(json.dumps({"pins": len(pins), "sources": source_check["source_count"], "source_pages": source_check["total_pages"],
                      "immutable_files": core["compared_file_count"], "active_artifacts": len(active),
                      "batch_sha256": sha(OUT / "BATCH_MANIFEST.json")}))


if __name__ == "__main__":
    main()
