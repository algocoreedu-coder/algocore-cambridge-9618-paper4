from __future__ import annotations

import json
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
EVIDENCE = ROOT / "evidence" / "marking"
OUT = ROOT / "MARKING_MAP.json"
OUT_MD = ROOT / "MARKING_MAP.md"


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def req_list(raw, part_id: str):
    source = raw.get("qp_requirements", raw.get("qp_requirement"))
    items = source if isinstance(source, list) else [source]
    out = []
    for index, item in enumerate(items, 1):
        value = dict(item)
        value.setdefault("requirement_id", f"req-{part_id.replace('_', '-')}-{index:02d}")
        value.setdefault("authority", "official_qp")
        out.append(value)
    return out


def normalize(raw, batch: str, overrides: dict[str, dict]):
    patterns = raw.get("pattern_ids") or raw.get("assessed_pattern_ids") or []
    primary = raw.get("primary_pattern_id")
    if primary and primary not in patterns:
        patterns = [primary, *patterns]
    patterns = list(dict.fromkeys(patterns))
    part_id = raw["part_id"]
    marks = raw.get("official_part_marks", raw.get("original_part_marks", raw.get("marks")))
    points = []
    for point in raw.get("marking_points", []):
        p = dict(point)
        p.setdefault("method_step_refs", [])
        p.setdefault("authority", "official_ms")
        p.setdefault("source_mark_value_if_unambiguous", None)
        points.append(p)
    disposition_map = {
        "official_qp_ms_mapped": "MAPPED",
        "mapped": "MAPPED",
        "holistic_part_level": "HOLISTIC_PART_LEVEL",
        "no_separate_point": "NO_SEPARATE_POINT",
        "evidence_only": "EVIDENCE_ONLY",
        "blocked_source": "BLOCKED_SOURCE",
    }
    disposition = disposition_map.get(str(raw.get("part_disposition", "mapped")).lower(), "MAPPED")
    review = "SUBMITTED"
    adjudication = overrides.get(part_id)
    if adjudication:
        disposition = adjudication["part_disposition"]
        review = adjudication["review_status"]
        for p in points:
            p["award_semantics"] = "holistic"
            p["source_mark_value_if_unambiguous"] = None
            p["group_id"] = f"holistic-{part_id}"
            p["group_max"] = marks
            p["condition"] = adjudication["canonical_treatment"]
    return {
        "part_id": part_id,
        "question_id": raw["question_id"],
        "paper_id": raw["paper_id"],
        "pattern_ids": patterns,
        "context_pattern_ids": raw.get("context_pattern_ids", []),
        "dependency_part_ids": raw.get("dependency_part_ids", []),
        "official_part_marks": marks,
        "qp_requirements": req_list(raw, part_id),
        "marking_points": points,
        "part_disposition": disposition,
        "review_status": review,
        "source_batch": batch,
        "source_issue_refs": raw.get("source_issue_refs", []),
        "authority_note": raw.get("authority_note", "Editorial paraphrases retain official QP/MS locators."),
    }


def main():
    qa_path = ROOT / "evidence" / "qa" / "source" / "A8_SOURCE_QA.json"
    qa = load(qa_path) if qa_path.exists() else {}
    source_closed = qa.get("status") in {"PASS", "PASS_RECOMMENDED"} and all(
        f.get("status") in {"CLOSED", "CLOSED_VERIFIED"} for f in qa.get("findings", [])
    )
    decisions = load(ROOT / "SOURCE_ADJUDICATIONS.json")["decisions"]
    overrides = {part_id: decision for decision in decisions for part_id in decision["part_ids"]}
    specs = [("2021-2022", "rows"), ("2023-2024", "parts"), ("2025", "rows")]
    rows = []
    source_counts = {}
    for batch, key in specs:
        data = load(EVIDENCE / batch / "MARKING_SUBMISSION.json")
        source_rows = data[key]
        source_counts[batch] = len(source_rows)
        rows.extend(normalize(row, batch, overrides) for row in source_rows)
    rows.sort(key=lambda r: r["part_id"])
    if source_closed:
        for row in rows:
            row["review_status"] = "CLOSED_VERIFIED"
    ids = [r["part_id"] for r in rows]
    total_marks = sum(r["official_part_marks"] for r in rows)
    payload = {
        "schema_version": "s4-marking-map-v1",
        "status": "CLOSED_VERIFIED_SOURCE_LAYER" if source_closed else "LEAD_REVIEWED_SOURCE_LAYER",
        "generated_utc": datetime.now(timezone.utc).isoformat(),
        "authority_boundary": "QP and MS locators are official; criterion wording is a concise editorial paraphrase. Method links remain empty until pattern-card merge.",
        "counts": {
            "parts": len(rows),
            "papers": len({r["paper_id"] for r in rows}),
            "questions": len({r["question_id"] for r in rows}),
            "official_marks": total_marks,
            "marking_points": sum(len(r["marking_points"]) for r in rows),
            "source_batches": source_counts,
            "lead_adjudicated_parts": len(overrides),
        },
        "integrity": {
            "unique_part_ids": len(ids) == len(set(ids)),
            "expected_parts_672": len(rows) == 672,
            "expected_marks_2175": total_marks == 2175,
            "unresolved_source_decisions": 0,
            "a8_source_qa_closed": source_closed,
        },
        "rows": rows,
    }
    if not (
        payload["integrity"]["unique_part_ids"]
        and payload["integrity"]["expected_parts_672"]
        and payload["integrity"]["expected_marks_2175"]
        and payload["integrity"]["unresolved_source_decisions"] == 0
        and payload["integrity"]["a8_source_qa_closed"]
    ):
        raise SystemExit(f"Integrity failure: {payload['integrity']}")
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    dispositions = Counter(r["part_disposition"] for r in rows)
    review = Counter(r["review_status"] for r in rows)
    md = f"""# Stage 4 marking map\n\nStatus: **{payload['status']}**. Method-step links are joined after the 58 pattern cards pass review.\n\n- Coverage: {len(rows)} parts across {payload['counts']['papers']} papers and {payload['counts']['questions']} questions.\n- Official total: {total_marks} marks.\n- Editorial marking atoms: {payload['counts']['marking_points']}.\n- Lead-adjudicated ambiguity rows: {len(overrides)}.\n- Dispositions: {dict(dispositions)}.\n- Review states: {dict(review)}.\n\nThe part row owns the official mark total. Pattern mappings and marking atoms must never duplicate that total. All atom text is an editorial paraphrase with official source locators; it is not a replacement for the mark scheme.\n"""
    OUT_MD.write_text(md, encoding="utf-8")
    print(json.dumps(payload["counts"], indent=2))


if __name__ == "__main__":
    main()
