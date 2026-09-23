from __future__ import annotations

import hashlib
import json
from copy import deepcopy
from pathlib import Path

OUT = Path(__file__).resolve().parents[1]
V1 = OUT.parent / "B24-A2-v1"

TARGETS = {
    "9618_s24_qp_12-q2-pd-piii-mi-1": ("9618_s24_ms_12", 5, "2(d)(iii)"),
    "9618_s24_qp_13-q1-pd-pii-mi-1": ("9618_s24_ms_13", 3, "1(d)(ii)"),
    "9618_s24_qp_13-q2-pc-mi-1": ("9618_s24_ms_13", 4, "2(c)"),
    "9618_s24_qp_13-q4-pd-mi-1": ("9618_s24_ms_13", 6, "4(d)"),
    "9618_s24_qp_13-q5-pd-mi-1": ("9618_s24_ms_13", 7, "5(d)"),
    "9618_w24_qp_11-q2-pc-mi-1": ("9618_w24_ms_11", 5, "2(c)"),
    "9618_w24_qp_11-q4-pd-pii-mi-1": ("9618_w24_ms_11", 8, "4(d)(ii)"),
    "9618_w24_qp_11-q7-pb-mi-1": ("9618_w24_ms_11", 9, "7(b)"),
    "9618_w24_qp_12-q1-pb-mi-1": ("9618_w24_ms_12", 3, "1(b)"),
    "9618_w24_qp_12-q2-pc-mi-1": ("9618_w24_ms_12", 4, "2(c)"),
    "9618_w24_qp_12-q3-pc-mi-1": ("9618_w24_ms_12", 5, "3(c)"),
    "9618_w24_qp_13-q1-pc-mi-1": ("9618_w24_ms_13", 3, "1(c)"),
    "9618_w24_qp_13-q4-pe-mi-1": ("9618_w24_ms_13", 5, "4(e)"),
    "9618_w24_qp_13-q5-pb-mi-1": ("9618_w24_ms_13", 6, "5(b)"),
    "9618_w24_qp_13-q6-pc-pii-mi-1": ("9618_w24_ms_13", 7, "6(c)(ii)"),
    "9618_w24_qp_13-q7-pb-mi-1": ("9618_w24_ms_13", 7, "7(b)"),
    "9618_w24_qp_13-q8-pc-mi-1": ("9618_w24_ms_13", 8, "8(c)"),
    "9618_w24_qp_11-q6-mi-1": ("9618_w24_ms_11", 9, "6"),
    "9618_w24_qp_13-q3-mi-1": ("9618_w24_ms_13", 4, "3"),
}


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def sha256(path: Path) -> str:
    return sha256_bytes(path.read_bytes())


def rows(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def canonical(row: dict) -> str:
    return json.dumps(row, ensure_ascii=False, sort_keys=True)


def main() -> None:
    v1_path = V1 / "MARKING_INDEX.jsonl"
    v2_path = OUT / "MARKING_INDEX.jsonl"
    old_rows = rows(v1_path)
    if len(old_rows) != 170 or len(TARGETS) != 19:
        raise RuntimeError("Unexpected baseline or target count.")

    old_by = {row["id"]: row for row in old_rows}
    if len(old_by) != len(old_rows) or set(TARGETS) - set(old_by):
        raise RuntimeError("Target ID missing or duplicate.")

    new_rows = deepcopy(old_rows)
    new_by = {row["id"]: row for row in new_rows}
    changes = []
    for record_id, (source_id, page, table_ref) in TARGETS.items():
        old = old_by[record_id]
        new = new_by[record_id]
        value = old["mark_or_condition_or_null"]
        if not isinstance(value, str):
            raise RuntimeError(f"{record_id}: expected string excerpt")
        lines = value.splitlines()
        if len(lines) < 4 or [line.strip() for line in lines[-3:]] != ["Question", "Answer", "Marks"]:
            raise RuntimeError(f"{record_id}: exact generic header suffix not present")
        kept = lines[:-3]
        if not kept or not any(line.strip() for line in kept):
            raise RuntimeError(f"{record_id}: removing header would empty excerpt")
        new_value = "\n".join(kept)
        final_token_before = next(line.strip() for line in reversed(kept) if line.strip())
        final_token_after = next(line.strip() for line in reversed(new_value.splitlines()) if line.strip())
        if final_token_before != final_token_after:
            raise RuntimeError(f"{record_id}: final mark token changed")
        locator = old["ms_locator"]
        if (locator["source_id"], locator["pdf_page_1_based"], old["table_row_ref_or_null"]) != (
            source_id, page, table_ref
        ):
            raise RuntimeError(f"{record_id}: locator does not match dispatch")
        new["mark_or_condition_or_null"] = new_value
        changed_fields = sorted(key for key in old if old.get(key) != new.get(key))
        if changed_fields != ["mark_or_condition_or_null"]:
            raise RuntimeError(f"{record_id}: unexpected changed fields {changed_fields}")
        changes.append({
            "record_id": record_id,
            "source_id": source_id,
            "pdf_page_1_based": page,
            "table_row_ref": table_ref,
            "changed_fields": changed_fields,
            "removed_suffix_lines": ["Question ", "Answer ", "Marks"],
            "source_answer_condition_prefix_preserved": new_value == "\n".join(lines[:-3]),
            "final_source_mark_token_preserved": final_token_after,
            "old_field_sha256": sha256_bytes(value.encode("utf-8")),
            "new_field_sha256": sha256_bytes(new_value.encode("utf-8")),
            "old_record_sha256": sha256_bytes(canonical(old).encode("utf-8")),
            "new_record_sha256": sha256_bytes(canonical(new).encode("utf-8")),
            "locator_preserved": old["ms_locator"] == new["ms_locator"],
            "target_preserved": (
                old.get("part_id_or_null") == new.get("part_id_or_null")
                and old.get("question_id_or_null") == new.get("question_id_or_null")
            ),
            "transcript_ref_preserved": old["transcript_ref"] == new["transcript_ref"],
            "visual_dependencies_preserved": old["visual_dependency_refs"] == new["visual_dependency_refs"],
            "status_preserved": old["status"] == new["status"],
            "generic_following_table_header_absent": [
                line.strip() for line in new_value.splitlines()[-3:]
            ] != ["Question", "Answer", "Marks"],
        })

    v2_path.write_text("".join(canonical(row) + "\n" for row in new_rows), encoding="utf-8")
    final_rows = rows(v2_path)
    final_by = {row["id"]: row for row in final_rows}
    actual_changed = [row["id"] for row in old_rows if old_by[row["id"]] != final_by[row["id"]]]
    untouched = [row["id"] for row in old_rows if row["id"] not in TARGETS]
    untouched_semantic = all(old_by[record_id] == final_by[record_id] for record_id in untouched)
    untouched_line_bytes = all(
        (canonical(old_by[record_id]) + "\n").encode("utf-8")
        == (canonical(final_by[record_id]) + "\n").encode("utf-8")
        for record_id in untouched
    )
    exact_target_set = set(actual_changed) == set(TARGETS)
    only_field = all(item["changed_fields"] == ["mark_or_condition_or_null"] for item in changes)
    suffix_absent = all(item["generic_following_table_header_absent"] for item in changes)
    preserved = all(
        item["source_answer_condition_prefix_preserved"]
        and
        item["locator_preserved"]
        and item["target_preserved"]
        and item["transcript_ref_preserved"]
        and item["visual_dependencies_preserved"]
        and item["status_preserved"]
        for item in changes
    )
    passed = (
        len(final_rows) == 170
        and len(actual_changed) == 19
        and exact_target_set
        and only_field
        and suffix_absent
        and preserved
        and untouched_semantic
        and untouched_line_bytes
    )
    semantic = {
        "artifact_version": "B24-A2-v2",
        "baseline_version": "B24-A2-v1",
        "finding_id": "A9-B24-MS-01",
        "status": "PASS" if passed else "FAIL",
        "baseline_marking_index_sha256": sha256(v1_path),
        "corrected_marking_index_sha256": sha256(v2_path),
        "declared_target_count": len(TARGETS),
        "actual_changed_record_count": len(actual_changed),
        "actual_changed_record_ids": sorted(actual_changed),
        "unchanged_record_count": len(untouched),
        "changed_field_union": sorted({field for item in changes for field in item["changed_fields"]}),
        "changes": sorted(changes, key=lambda item: item["record_id"]),
    }
    (OUT / "SEMANTIC_DELTA_V2.json").write_text(
        json.dumps(semantic, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8"
    )
    correction = {
        "artifact_version": "B24-A2-v2",
        "finding_id": "A9-B24-MS-01",
        "status": "PASS" if passed else "FAIL",
        "checks": {
            "marking_item_count_preserved_170": len(final_rows) == 170,
            "exactly_19_records_changed": len(actual_changed) == 19,
            "changed_id_set_equals_dispatch": exact_target_set,
            "only_mark_or_condition_changed": only_field,
            "generic_following_table_header_absent_from_19": suffix_absent,
            "locator_target_transcript_visual_status_preserved": preserved,
            "source_answer_condition_and_final_mark_token_preserved": all(
                item["source_answer_condition_prefix_preserved"]
                and bool(item["final_source_mark_token_preserved"])
                for item in changes
            ),
            "other_151_records_semantically_identical": untouched_semantic,
            "other_151_serialized_lines_byte_identical": untouched_line_bytes,
        },
        "semantic_delta_path": "SEMANTIC_DELTA_V2.json",
        "semantic_delta_sha256": sha256(OUT / "SEMANTIC_DELTA_V2.json"),
    }
    (OUT / "CORRECTION_CHECK_V2.json").write_text(
        json.dumps(correction, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8"
    )
    if not passed:
        raise SystemExit("B24-A2-v2 correction check failed")
    print(json.dumps({
        "status": "PASS",
        "changed_records": len(actual_changed),
        "unchanged_records": len(untouched),
        "marking_index_sha256": sha256(v2_path),
        "semantic_delta_sha256": sha256(OUT / "SEMANTIC_DELTA_V2.json"),
        "correction_check_sha256": sha256(OUT / "CORRECTION_CHECK_V2.json"),
    }))


if __name__ == "__main__":
    main()
