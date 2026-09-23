from __future__ import annotations

import hashlib
import json
from pathlib import Path


OUT = Path(__file__).resolve().parent
V2 = OUT.parent / "B25-A2-v2"
INDEX = OUT / "MARKING_INDEX.jsonl"
TARGETS = {
    "9618_w25_qp_12-q1-mi-1": ("9618_w25_ms_12", 4, "1", "2"),
    "9618_w25_qp_12-q2-pb-mi-1": ("9618_w25_ms_12", 5, "2(b)", "2"),
    "9618_w25_qp_12-q5-pe-mi-1": ("9618_w25_ms_12", 8, "5(e)", "3"),
    "9618_w25_qp_12-q6-pd-mi-1": ("9618_w25_ms_12", 9, "6(d)", "2"),
    "9618_w25_qp_12-q8-pb-pii-mi-1": ("9618_w25_ms_12", 10, "8(b)(ii)", "2"),
    "9618_w25_qp_12-q9-pb-mi-1": ("9618_w25_ms_12", 11, "9(b)", "2"),
    "9618_w25_qp_12-q10-pc-mi-1": ("9618_w25_ms_12", 11, "10(c)", "1"),
    "9618_w25_qp_13-q3-pb-mi-1": ("9618_w25_ms_13", 6, "3(b)", "2"),
}
HEADER = ["Question", "Answer", "Marks"]


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def dump(path: Path, value: object) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def main() -> None:
    before_lines = (V2 / "MARKING_INDEX.jsonl").read_text(encoding="utf-8").splitlines()
    if len(before_lines) != 183:
        raise RuntimeError(f"Expected 183 parent rows, got {len(before_lines)}")
    before_rows = [json.loads(line) for line in before_lines]
    ids = [row["id"] for row in before_rows]
    if len(ids) != len(set(ids)):
        raise RuntimeError("Parent marking IDs are not unique")
    by_id = {row["id"]: row for row in before_rows}
    missing = sorted(set(TARGETS) - set(by_id))
    if missing:
        raise RuntimeError(f"Missing targets: {missing}")

    after_rows: list[dict] = []
    evidence: list[dict] = []
    for line, original in zip(before_lines, before_rows):
        row = dict(original)
        if row["id"] in TARGETS:
            source, page, table_row, terminal_mark = TARGETS[row["id"]]
            loc = row["ms_locator"]
            expected = (source, page, table_row)
            actual = (loc["source_id"], loc["pdf_page_1_based"], row["table_row_ref_or_null"])
            if actual != expected:
                raise RuntimeError(f"Locator mismatch for {row['id']}: expected {expected}, got {actual}")
            text = row.get("mark_or_condition_or_null")
            if not isinstance(text, str):
                raise RuntimeError(f"Missing text for {row['id']}")
            text_lines = text.splitlines()
            if len(text_lines) < 4 or [x.strip() for x in text_lines[-3:]] != HEADER:
                raise RuntimeError(f"Exact terminal generic header absent for {row['id']}")
            corrected = "\n".join(text_lines[:-3]).rstrip()
            if not corrected or corrected.splitlines()[-1].strip() != terminal_mark:
                raise RuntimeError(f"Terminal mark not retained for {row['id']}")
            row["mark_or_condition_or_null"] = corrected
            changed_fields = sorted(k for k in set(original) | set(row) if original.get(k) != row.get(k))
            if changed_fields != ["mark_or_condition_or_null"]:
                raise RuntimeError(f"Unexpected fields for {row['id']}: {changed_fields}")
            evidence.append({
                "id": row["id"],
                "source_locator": {
                    "source_id": source,
                    "pdf_page_1_based": page,
                    "table_row_ref": table_row,
                    "transcript_ref": row["transcript_ref"],
                    "visual_dependency_refs": row["visual_dependency_refs"],
                },
                "changed_fields": changed_fields,
                "before_value": text,
                "after_value": corrected,
                "removed_terminal_lines": HEADER,
                "retained_terminal_mark_token": terminal_mark,
                "all_nontext_fields_preserved": True,
            })
        after_rows.append(row)

    if len(evidence) != 8:
        raise RuntimeError(f"Expected 8 corrected rows, got {len(evidence)}")
    after_lines = [json.dumps(row, ensure_ascii=False, sort_keys=True) for row in after_rows]
    unchanged = [before_rows[i]["id"] for i in range(183) if before_lines[i] == after_lines[i]]
    changed = [before_rows[i]["id"] for i in range(183) if before_lines[i] != after_lines[i]]
    if set(changed) != set(TARGETS) or len(unchanged) != 175:
        raise RuntimeError(f"Exact delta failed: changed={changed}, unchanged={len(unchanged)}")
    # Semantic equality is stricter than serialized-line equality for all unaffected rows.
    if any(before_rows[i] != after_rows[i] for i in range(183) if before_rows[i]["id"] not in TARGETS):
        raise RuntimeError("An unaffected record changed semantically")

    residual = []
    for row in after_rows:
        text = row.get("mark_or_condition_or_null")
        if isinstance(text, str) and len(text.splitlines()) >= 3 and [x.strip() for x in text.splitlines()[-3:]] == HEADER:
            residual.append(row["id"])
    if residual:
        raise RuntimeError(f"Terminal generic headers remain: {residual}")

    INDEX.write_text("\n".join(after_lines) + "\n", encoding="utf-8")
    dump(OUT / "SEMANTIC_DELTA_V3.json", {
        "artifact_version": "B25-A2-v3",
        "parent_artifact_version": "B25-A2-v2",
        "status": "PASS",
        "parent_marking_index_sha256": sha(V2 / "MARKING_INDEX.jsonl"),
        "corrected_marking_index_sha256": sha(INDEX),
        "row_count_before": 183,
        "row_count_after": 183,
        "changed_record_count": 8,
        "changed_record_ids": changed,
        "changed_field_union": ["mark_or_condition_or_null"],
        "unchanged_serialized_line_count": len(unchanged),
        "unchanged_semantic_record_count": len(unchanged),
        "unexpected_added_ids": [],
        "unexpected_removed_ids": [],
        "per_record": sorted(evidence, key=lambda x: x["id"]),
    })
    dump(OUT / "CORRECTION_CHECK_V3.json", {
        "artifact_version": "B25-A2-v3",
        "status": "PASS",
        "expected_target_count": 8,
        "corrected_target_count": 8,
        "marking_row_count": 183,
        "unaffected_rows_serialized_byte_identical": 175,
        "remaining_terminal_generic_header_count": 0,
        "remaining_terminal_generic_header_ids": [],
        "all_target_terminal_marks_retained": True,
        "all_target_locator_target_transcript_visual_status_fields_preserved": True,
        "changed_field_union": ["mark_or_condition_or_null"],
        "target_ids": sorted(TARGETS),
    })
    print(json.dumps({"changed": len(changed), "unchanged": len(unchanged), "residual_headers": len(residual), "marking_sha256": sha(INDEX)}))


if __name__ == "__main__":
    main()
