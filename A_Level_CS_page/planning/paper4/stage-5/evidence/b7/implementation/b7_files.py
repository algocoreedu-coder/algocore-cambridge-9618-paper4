"""Independent Stage 5 B7 candidate for source-bound file operations.

The API is deliberately data driven so the fresh-process harness can execute
the same fixture without importing the builder's state.
"""
from __future__ import annotations
from pathlib import Path


def _convert(value, kind):
    if kind in ("int", "integer"):
        return int(value.strip())
    if kind in ("float", "real"):
        return float(value.strip())
    return value.rstrip("\r\n")


def read_array(spec):
    lines = list(spec.get("lines", []))
    size = int(spec.get("record_size", 1))
    types = list(spec.get("field_types", ["str"] * size))
    capacity = int(spec.get("capacity", 999999))
    if capacity < 0:
        raise ValueError("capacity must be non-negative")
    records = []
    error = None
    for start in range(0, len(lines), size):
        group = lines[start:start + size]
        if len(group) < size:
            break
        try:
            row = [_convert(v, types[i] if i < len(types) else "str") for i, v in enumerate(group)]
        except (ValueError, TypeError) as exc:
            error = "READ_ERROR"
            break
        if len(records) >= capacity:
            break
        records.append(row)
        if spec.get("fixed_count") and len(records) >= int(spec["fixed_count"]):
            break
    return {"records": records, "count": len(records), "error": error, "closed": True}


def read_objects(spec):
    lines = list(spec.get("lines", []))
    size = int(spec.get("record_size", 3))
    capacity = int(spec.get("capacity", 999999))
    if capacity < 0:
        raise ValueError("capacity must be non-negative")
    objects = list(spec.get("existing", []))
    error = None
    for start in range(0, len(lines), size):
        group = lines[start:start + size]
        if len(group) < size:
            break
        try:
            question, answer, points = group[:3]
            candidate = {"question": question.rstrip("\r\n"), "answer": int(str(answer).strip()), "points": int(str(points).strip())}
        except (ValueError, TypeError):
            error = "READ_ERROR"
            break
        route = spec.get("route", "create")
        if route == "lookup_update":
            key = candidate.get("question")
            target = next((o for o in objects if o.get("question") == key), None)
            if target is None:
                error = "OBJECT_NOT_FOUND"
                break
            target.update(candidate)
        else:
            if len(objects) >= capacity:
                break
            candidate["class_name"] = spec.get("class_name", "TreasureChest")
            if spec.get("subclass"):
                candidate["class_name"] = spec["subclass"]
            objects.append(candidate)
    return {"objects": objects, "count": len(objects), "error": error, "closed": True}


def write_records(spec):
    mode = spec.get("mode", "w")
    prefix = str(spec.get("existing_text", "")) if mode == "a" else ""
    fields = list(spec.get("fields", ["username", "score"]))
    lines = []
    for row in spec.get("records", []):
        values = [str(row.get(field, "")) for field in fields]
        lines.append(spec.get("separator", " ").join(values) + spec.get("newline", "\n"))
    text = prefix + "".join(lines)
    target = Path(spec.get("target", "output.txt"))
    if target.is_absolute() or any(part == ".." for part in target.parts):
        raise ValueError("target must be a local relative file")
    target.write_text(text, encoding="utf-8", newline="")
    return {"text": text, "line_count": len(lines), "mode": mode, "closed": True, "target": target.name}


def execute(row):
    operation = row.get("operation") or row.get("pattern_id")
    spec = row.get("input", row.get("args", {}))
    if operation in ("FILE_READ_ARRAY", "read_array"):
        return read_array(spec)
    if operation in ("FILE_READ_OBJECTS", "read_objects"):
        return read_objects(spec)
    if operation in ("FILE_WRITE", "write_records"):
        return write_records(spec)
    raise ValueError(f"unknown B7 operation: {operation}")
