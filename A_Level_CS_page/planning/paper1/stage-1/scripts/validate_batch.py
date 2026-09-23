"""Validate Stage 1 batch structure and source provenance without changing batch data."""
from __future__ import annotations

import hashlib
import json
import sys
from pathlib import Path


REQUIRED = {
    "BATCH_MANIFEST.json", "PAGE_INDEX.jsonl", "QUESTION_INDEX.jsonl",
    "MARKING_INDEX.jsonl", "VISUAL_MANIFEST.json", "EXTRACTION_QA.md",
    "UNRESOLVED.md", "HANDOFF_CHECK.json",
}
VALID_STATUS = {
    "EXTRACTED", "VISUAL_CHECK_REQUIRED", "MS_LINKED", "UNRESOLVED",
    "REVIEWED", "ACCEPTED",
}


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def jsonl(path: Path) -> list[dict]:
    records = []
    for number, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        if line.strip():
            value = json.loads(line)
            if not isinstance(value, dict):
                raise ValueError(f"{path.name}:{number} is not an object")
            records.append(value)
    return records


def main() -> int:
    if len(sys.argv) != 5:
        print("usage: validate_batch.py BATCH_DIR STAGE0_SOURCE_MANIFEST WORKSPACE_ROOT OUTPUT_JSON")
        return 2
    batch = Path(sys.argv[1]).resolve()
    source_manifest = json.loads(Path(sys.argv[2]).read_text(encoding="utf-8"))
    workspace_root = Path(sys.argv[3]).resolve()
    output = Path(sys.argv[4]).resolve()
    errors: list[str] = []
    counts: dict[str, int] = {}
    missing = sorted(name for name in REQUIRED if not (batch / name).exists())
    if missing:
        errors.extend(f"missing required file: {name}" for name in missing)
    source_by_id = {item["id"]: item for item in source_manifest["primary_sources"]}
    manifest = {}
    if not missing:
        manifest = json.loads((batch / "BATCH_MANIFEST.json").read_text(encoding="utf-8"))
        sources = manifest.get("sources") or manifest.get("inputs_verified") or manifest.get("inputs") or []
        counts["sources"] = len(sources)
        for source in sources:
            source_id = source.get("source_id")
            expected = source_by_id.get(source_id)
            if not expected:
                errors.append(f"unknown source_id in batch manifest: {source_id}")
                continue
            declared_hash = source.get("sha256") or source.get("sha256_verified") or source.get("sha256_baseline")
            if declared_hash != expected["sha256"]:
                errors.append(f"source hash differs from Stage 0 manifest: {source_id}")
            relative_path = source.get("relative_path", "")
            actual = Path(source.get("absolute_path", ""))
            if not actual.is_file() and relative_path:
                actual = workspace_root / relative_path
            if not actual.is_file():
                errors.append(f"source path unreadable: {source_id}")
            elif sha256(actual) != expected["sha256"]:
                errors.append(f"source file hash mismatch: {source_id}")
    ids: set[str] = set()
    records_by_file: dict[str, list[dict]] = {}
    if not missing:
        for filename in ("PAGE_INDEX.jsonl", "QUESTION_INDEX.jsonl", "MARKING_INDEX.jsonl"):
            try:
                records = jsonl(batch / filename)
            except (ValueError, json.JSONDecodeError) as exc:
                errors.append(str(exc))
                continue
            counts[filename] = len(records)
            records_by_file[filename] = records
            for record in records:
                item_id = record.get("id")
                if item_id:
                    if item_id in ids:
                        errors.append(f"duplicate record id: {item_id}")
                    ids.add(item_id)
                if "status" in record and record["status"] not in VALID_STATUS:
                    errors.append(f"invalid status for {item_id or filename}: {record['status']}")
                locator = record.get("qp_locator") or record.get("ms_locator")
                if filename != "PAGE_INDEX.jsonl" and not locator:
                    errors.append(f"missing primary locator for {item_id or filename}")
        schema_version = str(manifest.get("schema_version", "1.0"))
        try:
            major, minor = (int(part) for part in schema_version.split(".")[:2])
        except (TypeError, ValueError):
            major, minor = 1, 0
            errors.append(f"invalid schema_version: {schema_version}")
        if (major, minor) >= (1, 1):
            question_rows = records_by_file.get("QUESTION_INDEX.jsonl", [])
            question_ids = {r.get("id") for r in question_rows if "question_number" in r}
            part_ids = {r.get("id") for r in question_rows if "question_id" in r and "label" in r}
            for record in records_by_file.get("MARKING_INDEX.jsonl", []):
                part_id = record.get("part_id_or_null")
                question_id = record.get("question_id_or_null")
                if bool(part_id) == bool(question_id):
                    errors.append(
                        f"marking item {record.get('id')} must target exactly one part_id_or_null or question_id_or_null"
                    )
                elif part_id and part_id not in part_ids:
                    errors.append(f"marking item {record.get('id')} references unknown part_id_or_null: {part_id}")
                elif question_id and question_id not in question_ids:
                    errors.append(f"marking item {record.get('id')} references unknown question_id_or_null: {question_id}")
        visual = json.loads((batch / "VISUAL_MANIFEST.json").read_text(encoding="utf-8"))
        if isinstance(visual, dict):
            visual_records = visual.get("visual_regions", visual.get("regions", []))
        elif isinstance(visual, list):
            visual_records = visual
        else:
            errors.append("VISUAL_MANIFEST.json must be an object or list")
            visual_records = []
        counts["visual_regions"] = len(visual_records)
        for region in visual_records:
            if not region.get("source_id") or not region.get("pdf_page_1_based"):
                errors.append(f"visual region missing source/page: {region.get('id')}")
    result = {
        "batch": batch.name,
        "validator": "stage-1/scripts/validate_batch.py",
        "pass": not errors,
        "errors": errors,
        "counts": counts,
        "source_count": counts.get("sources", 0),
    }
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(result, ensure_ascii=False))
    return 0 if not errors else 1


if __name__ == "__main__":
    raise SystemExit(main())
