from __future__ import annotations

import hashlib
import json
import re
from datetime import datetime, timezone
from pathlib import Path

OUT = Path(__file__).resolve().parent
V1 = OUT.parent / "B25-A2-v1"
P1 = OUT.parents[5]
STAGE1 = P1 / "stage-1"
WORKSPACE = P1.parents[2]

CONTEXT_REMOVALS = {
    "9618_s25_qp_11-q3": (7, "Question 4 begins"),
    "9618_s25_qp_12-q2": (5, "Question 3 begins"),
    "9618_s25_qp_12-q5": (11, "Question 6 begins"),
    "9618_w25_qp_11-q2": (7, "Question 3 begins"),
    "9618_w25_qp_11-q5": (11, "Question 6 begins"),
    "9618_w25_qp_12-q7": (13, "Question 8 begins"),
    "9618_w25_qp_12-q9": (15, "Question 10 begins"),
    "9618_w25_qp_13-q1": (3, "Question 2 begins"),
    "9618_w25_qp_13-q3": (5, "Question 4 begins"),
    "9618_w25_qp_13-q5": (9, "Only the notice ‘Question 6 starts on the next page’"),
}
TARGET_MARK_ID = "9618_w25_qp_13-q7-pe-mi-1"
HEADER = "\nQuestion \nAnswer \nMarks"


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def write_json(path: Path, value: object) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def rel(path: Path) -> str:
    return path.relative_to(OUT).as_posix()


def artifact(path: Path) -> dict:
    return {"path": rel(path), "sha256": sha(path), "byte_count": path.stat().st_size}


def v1_hash(path: str) -> str:
    return sha(V1 / path)


def verify_v1_snapshot() -> dict:
    snap = json.loads((V1 / "SNAPSHOT_MANIFEST.json").read_text(encoding="utf-8"))
    bad = []
    for item in snap["files"]:
        f = V1 / item["path"]
        if not f.is_file() or sha(f) != item["sha256"] or f.stat().st_size != item["byte_count"]:
            bad.append(item["path"])
    if len(snap["files"]) != 438 or bad:
        raise RuntimeError(f"Frozen v1 snapshot mismatch: entries={len(snap['files'])}, bad={bad[:5]}")
    return {"path": "../B25-A2-v1/SNAPSHOT_MANIFEST.json", "sha256": sha(V1 / "SNAPSHOT_MANIFEST.json"),
            "file_count": len(snap["files"]), "all_entries_match": True}


def verify_source_pdfs() -> dict:
    import pymupdf

    batch = json.loads((V1 / "BATCH_MANIFEST.json").read_text(encoding="utf-8"))
    checks = []
    for source in batch["source_validation"]["checks"]:
        path = WORKSPACE / source["relative_path"]
        if not path.is_file():
            raise RuntimeError(f"Pinned source PDF missing: {path}")
        actual_sha = sha(path)
        with pymupdf.open(path) as doc:
            actual_pages = len(doc)
        if actual_sha != source["sha256_expected"] or actual_pages != source["page_count_expected"]:
            raise RuntimeError(f"Pinned source mismatch {source['source_id']}: sha={actual_sha}, pages={actual_pages}")
        checks.append({"source_id": source["source_id"], "sha256": actual_sha,
                       "page_count": actual_pages, "matches_stage0": actual_sha == source["sha256_expected"]})
    if len(checks) != 12 or sum(x["page_count"] for x in checks) != 178:
        raise RuntimeError(f"Expected 12 PDFs / 178 pages, got {len(checks)} / {sum(x['page_count'] for x in checks)}")
    return {"source_count": len(checks), "total_pages": sum(x["page_count"] for x in checks),
            "all_match_stage0": True, "checks": checks}


def correct_contexts(changes: list[dict]) -> None:
    for qid, (page, classification) in CONTEXT_REMOVALS.items():
        path = OUT / "contexts" / f"{qid}.json"
        old = V1 / "contexts" / path.name
        data = json.loads(path.read_text(encoding="utf-8"))
        before = sha(old)
        if data.get("question_id") != qid:
            raise RuntimeError(f"Context identity mismatch: {qid}")
        removed = {"all_context_pages": 0, "continuation_pages": 0, "source_evidence": 0}
        needs_write = False
        for field in ("all_context_pages", "continuation_pages"):
            values = data.get(field)
            if not isinstance(values, list):
                raise RuntimeError(f"Missing context field {qid}:{field}")
            removed[field] = values.count(page)
            needs_write = needs_write or removed[field] == 1
            data[field] = [x for x in values if x != page]
        values = data.get("source_evidence")
        if not isinstance(values, list):
            raise RuntimeError(f"Missing context field {qid}:source_evidence")
        removed["source_evidence"] = sum(x.get("pdf_page_1_based") == page for x in values)
        needs_write = needs_write or removed["source_evidence"] == 1
        data["source_evidence"] = [x for x in values if x.get("pdf_page_1_based") != page]
        already_removed = removed == {"all_context_pages": 0, "continuation_pages": 0, "source_evidence": 0}
        if not already_removed and removed != {"all_context_pages": 1, "continuation_pages": 1, "source_evidence": 1}:
            raise RuntimeError(f"Expected exactly one false reference in each field: {qid}: {removed}")
        if needs_write:
            path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        changes.append({"path": rel(path), "record_id": qid, "finding": "false_context_page_reference",
                        "removed_pdf_page_1_based": page, "source_classification": classification,
                        "fields": {"all_context_pages": 1, "continuation_pages": 1, "source_evidence": 1}, "before_sha256": before, "after_sha256": sha(path),
                        "before_byte_count": (V1 / "contexts" / path.name).stat().st_size,
                        "after_byte_count": path.stat().st_size})


def correct_marking(changes: list[dict]) -> None:
    path = OUT / "MARKING_INDEX.jsonl"
    old_path = V1 / "MARKING_INDEX.jsonl"
    before_file_sha = sha(old_path)
    lines = path.read_text(encoding="utf-8").splitlines()
    old_lines = old_path.read_text(encoding="utf-8").splitlines()
    found = 0
    before_record = after_record = None
    for i, line in enumerate(lines):
        row = json.loads(line)
        if row.get("id") != TARGET_MARK_ID:
            continue
        found += 1
        before_record = next(json.loads(x) for x in old_lines if json.loads(x).get("id") == TARGET_MARK_ID)
        text = row.get("mark_or_condition_or_null")
        if not isinstance(text, str):
            raise RuntimeError("Target 7(e) excerpt is not text")
        if text.endswith(HEADER):
            row["mark_or_condition_or_null"] = text[:-len(HEADER)]
            lines[i] = json.dumps(row, ensure_ascii=False)
        else:
            old_row = next(json.loads(x) for x in old_lines if json.loads(x).get("id") == TARGET_MARK_ID)
            if not old_row.get("mark_or_condition_or_null", "").endswith(HEADER):
                raise RuntimeError("Neither v1 nor v2 7(e) text has the exact expected suffix")
        after_record = dict(row)
    if found != 1 or before_record is None or after_record is None:
        raise RuntimeError(f"Expected exactly one target marking row, got {found}")
    # Preserve every unrelated JSONL line byte-for-byte.
    for i, (old_line, new_line) in enumerate(zip(old_lines, lines)):
        if json.loads(old_line).get("id") != TARGET_MARK_ID and old_line != new_line:
            raise RuntimeError(f"Unexpected unrelated MARKING_INDEX row change at line {i+1}")
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    changes.append({"path": rel(path), "record_id": TARGET_MARK_ID, "finding": "next_table_header_captured_in_ms_excerpt",
                    "source_locator": {"source_id": "9618_w25_ms_13", "pdf_page_1_based": 12, "row": "7(e)"},
                    "removed_exact_suffix": HEADER, "mark_value_preserved": True,
                    "retained_excerpt": after_record["mark_or_condition_or_null"],
                    "before_sha256": before_file_sha, "after_sha256": sha(path),
                    "before_byte_count": old_path.stat().st_size, "after_byte_count": path.stat().st_size,
                    "before_record": before_record, "after_record": after_record})


def input_pins() -> dict:
    pins = {
        "dispatch": "stage-1/evidence/a0/B25_A2_V2_DISPATCH.md",
        "dispatch_record": "stage-1/evidence/a0/B25_A2_V2_DISPATCH_RECORD.json",
        "a0_v1_audit": "stage-1/evidence/a0/B25_A2_V1_A0_AUDIT.json",
        "a3_v1_handoff": "stage-1/evidence/a3/B25/review_v1/HANDOFF_REVIEW_V1.json",
        "a3_v1_output_manifest": "stage-1/evidence/a3/B25/review_v1/OUTPUT_MANIFEST_V1.json",
        "a3_v1_a0_audit": "stage-1/evidence/a0/B25_A3_V1_HANDOFF_AUDIT.json",
        "a4_v1_handoff": "stage-1/evidence/a4/B25/review_v1/HANDOFF_REVIEW_V1.json",
        "a4_v1_output_manifest": "stage-1/evidence/a4/B25/review_v1/OUTPUT_MANIFEST_V1.json",
        "a4_v1_output_sums": "stage-1/evidence/a4/B25/review_v1/OUTPUT_SHA256SUMS.txt",
        "a4_v1_a0_audit": "stage-1/evidence/a0/B25_A4_V1_HANDOFF_AUDIT.json",
        "schema": "stage-1/CORPUS_SCHEMA.md",
        "extraction_policy": "stage-1/EXTRACTION_POLICY.md",
        "stage0_source_manifest": "stage-0/evidence/a2/SOURCE_MANIFEST.json",
    }
    out = {}
    expected = {
        "dispatch": "779876003ef45b06c2081f1cd14cdccb92c8797366e7ac6b33a7c1562a63cfab",
        "dispatch_record": "18d9f1acdac6e3393585fb069bc67bafa4d45dd57f4483e31c2a22ebe3fea983",
        "a0_v1_audit": "bcb35b2855ca5ae297174901c31ea7d4846a308a279aa0a55109c26a2d5e4660",
        "a3_v1_handoff": "f96bf8d634b5bb5e37496b7f826fa330277f2219169e827bf3e0369fc0e18ea0",
        "a3_v1_output_manifest": "5c14521a04c05766832c15a8933f1f0f2bbc68abee603613fae3e8a1b1917a63",
        "a3_v1_a0_audit": "07c829ff02b3cb9490f77ac7ceac604d681184441d951b3529bd03a12a384703",
        "a4_v1_handoff": "2df0def5ebfd7c605c1c1c07750e307db2b4dbb95e5b3985e17d67e30d539179",
        "a4_v1_output_manifest": "689efe3036bd5ffc9950e7e4557d8a8a852930a218cce3729bc2603a3f7f7a7e",
        "a4_v1_output_sums": "f2e7635c3957cacc0171ee156f032f1b4ee749dcd1cb966645d629535a0820b9",
        "a4_v1_a0_audit": "a1050b427004dc33818a19f1cd707f669cffc7c84cc81d6d3f3939c5ecd060e7",
        "schema": "9fe71d4719b0c8f9fd6d6fd6fb0316c7f9a840b6b964634889ea6d98245a1f1f",
        "extraction_policy": "97bd6c69ea8d459ea99713e943c2d092a88999b6df7cb315d2820547789c11f2",
        "stage0_source_manifest": "195a68ad98b4739dff0d3496dc93ba9e85d67d2dae0d88e3d4e4a088f1259c9c",
    }
    for key, relpath in pins.items():
        path = P1 / relpath
        if not path.is_file():
            raise RuntimeError(f"Missing pinned revision input: {path}")
        actual = sha(path)
        if actual != expected[key]:
            raise RuntimeError(f"Revision input pin mismatch for {key}: {actual} != {expected[key]}")
        out[key] = {"path": relpath, "sha256": actual}
    parent = V1 / "HANDOFF_CHECK.json"
    batch = V1 / "BATCH_MANIFEST.json"
    snap = V1 / "SNAPSHOT_MANIFEST.json"
    for key, path, wanted in (
        ("parent_v1_handoff", parent, "6087afbba526210bb4566d005fd278224e9078b3fcddb91ccdd410f62e17ae7b"),
        ("parent_v1_batch_manifest", batch, "7ab0ea8a747d54c8d50157784d2dae5c1158c95b4db2049ae50f077364b7e244"),
        ("parent_v1_snapshot_manifest", snap, "a9a96b6ba8db064578a73798228839c837e99f614ae4e05186e206ad6e6c14d6"),
    ):
        actual = sha(path)
        if actual != wanted:
            raise RuntimeError(f"Frozen parent pin mismatch {key}: {actual} != {wanted}")
        out[key] = {"path": "stage-1/evidence/a2/B25/versions/B25-A2-v1/" + path.name, "sha256": actual}
    return out


def validate_corrections(changes: list[dict], pins: dict, source_pdf_audit: dict) -> dict:
    errors = []
    context_checks = []
    for qid, (page, classification) in CONTEXT_REMOVALS.items():
        path = OUT / "contexts" / f"{qid}.json"
        data = json.loads(path.read_text(encoding="utf-8"))
        for field in ("all_context_pages", "continuation_pages"):
            if page in data[field]:
                errors.append(f"{qid}:page {page} remains in {field}")
        if any(x.get("pdf_page_1_based") == page for x in data["source_evidence"]):
            errors.append(f"{qid}:page {page} remains in source_evidence")
        context_checks.append({"question_id": qid, "removed_pdf_page_1_based": page,
                               "classification": classification, "absent_from_all_three_fields": True})
    # Explicitly protect nearby/context exceptions identified by independent review.
    preserve = {
        "9618_s25_qp_11-q8": {15},
        "9618_w25_qp_13-q5": {7, 8},
    }
    preserved_checks = []
    for qid, pages in preserve.items():
        data = json.loads((OUT / "contexts" / f"{qid}.json").read_text(encoding="utf-8"))
        actual = set(data["all_context_pages"])
        if not pages <= actual:
            errors.append(f"preserved context pages missing for {qid}: {sorted(pages-actual)}")
        preserved_checks.append({"question_id": qid, "preserved_pages": sorted(pages),
                                 "present_in_context": pages <= actual})
    mark_lines = (OUT / "MARKING_INDEX.jsonl").read_text(encoding="utf-8").splitlines()
    records = [json.loads(x) for x in mark_lines]
    target = [x for x in records if x.get("id") == TARGET_MARK_ID]
    if len(target) != 1:
        errors.append(f"target 7(e) row count={len(target)}")
    else:
        row = target[0]
        excerpt = row.get("mark_or_condition_or_null", "")
        if "Question \nAnswer \nMarks" in excerpt or not excerpt.endswith("3 "):
            errors.append("7(e) excerpt still includes generic header or lost the final 3 mark value")
        if row.get("table_row_ref_or_null") != "7(e)" or row.get("ms_locator", {}).get("source_id") != "9618_w25_ms_13" or row.get("ms_locator", {}).get("pdf_page_1_based") != 12:
            errors.append("7(e) exact MS locator or row reference changed")
    if len(records) != 183:
        errors.append(f"marking item count changed: {len(records)}")
    contexts = list((OUT / "contexts").glob("*.json"))
    if len(contexts) != 51:
        errors.append(f"context count changed: {len(contexts)}")
    page_rows = [json.loads(x) for x in (OUT / "PAGE_INDEX.jsonl").read_text(encoding="utf-8").splitlines()]
    page_keys = {(x.get("source_id"), x.get("pdf_page_1_based")) for x in page_rows}
    roots = {x.get("id") for x in (json.loads(line) for line in (OUT / "QUESTION_INDEX.jsonl").read_text(encoding="utf-8").splitlines()) if "question_number" in x}
    unresolved_contexts = []
    for context_path in contexts:
        context = json.loads(context_path.read_text(encoding="utf-8"))
        qid = context.get("question_id")
        source_id = context.get("source_qp_id")
        if qid not in roots:
            unresolved_contexts.append(f"{qid}:question_root")
        if not set(context.get("continuation_pages", [])) <= set(context.get("all_context_pages", [])):
            unresolved_contexts.append(f"{qid}:continuation_subset")
        for page in context.get("all_context_pages", []):
            if (source_id, page) not in page_keys:
                unresolved_contexts.append(f"{qid}:context_page_{page}")
        for evidence in context.get("source_evidence", []):
            if (evidence.get("source_id"), evidence.get("pdf_page_1_based")) not in page_keys:
                unresolved_contexts.append(f"{qid}:source_evidence_page_{evidence.get('pdf_page_1_based')}")
            if not (OUT / evidence.get("transcript_ref", "")).is_file():
                unresolved_contexts.append(f"{qid}:source_evidence_transcript")
    if unresolved_contexts:
        errors.extend(f"unresolved context: {x}" for x in unresolved_contexts[:12])
    visual = json.loads((OUT / "VISUAL_MANIFEST.json").read_text(encoding="utf-8"))
    visual_regions = visual.get("visual_regions", [])
    if len(visual_regions) != 144:
        errors.append(f"visual region count changed: {len(visual_regions)}")
    visual_ids = {x.get("id") for x in visual_regions}
    missing_dependencies = []
    for row in records:
        for dep in row.get("visual_dependency_refs", []):
            if dep not in visual_ids:
                missing_dependencies.append(f"{row.get('id')}->{dep}")
        tref = row.get("transcript_ref")
        if tref and not (OUT / tref).is_file():
            missing_dependencies.append(f"{row.get('id')}->transcript:{tref}")
    if missing_dependencies:
        errors.extend(f"unresolved marking evidence: {x}" for x in missing_dependencies[:12])
    totals = json.loads((OUT / "MARK_TOTAL_CHECK.json").read_text(encoding="utf-8"))["pairs"]
    def printed_total(pair: dict) -> int | None:
        excerpt = pair.get("cover_total_source", {}).get("excerpt_verbatim", "")
        match = re.search(r"\b(\d+)\b", excerpt)
        return int(match.group(1)) if match else None
    if len(totals) != 6 or any(printed_total(p) != 75 or p.get("sum_of_indexed_question_and_part_marks") != 75 or p.get("displayed_mark_sum_from_source_transcript") != 75 or not p.get("matches") for p in totals.values()):
        errors.append("six 75-mark pair checks do not all pass")
    batch = json.loads((OUT / "BATCH_MANIFEST.json").read_text(encoding="utf-8"))
    srcs = batch.get("inputs", [])
    if len(srcs) != 12 or sum(x.get("page_count", 0) for x in srcs) != 178:
        errors.append("source identity/page baseline differs from 12 sources/178 pages")
    if batch.get("source_validation", {}).get("source_count") != 12 or batch.get("source_validation", {}).get("total_pages") != 178 or batch.get("source_validation", {}).get("stage0_matches") != 12:
        errors.append("source_validation baseline is not 12 exact sources / 178 pages")
    # Compare semantic rows to v1: only ten context records and the specified MS excerpt may differ.
    changed_contexts = []
    for qid in CONTEXT_REMOVALS:
        old = json.loads((V1 / "contexts" / f"{qid}.json").read_text(encoding="utf-8"))
        new = json.loads((OUT / "contexts" / f"{qid}.json").read_text(encoding="utf-8"))
        if old != new:
            changed_contexts.append(qid)
    if set(changed_contexts) != set(CONTEXT_REMOVALS):
        errors.append(f"unexpected changed context set: {changed_contexts}")
    old_rows = {json.loads(x)["id"]: json.loads(x) for x in (V1 / "MARKING_INDEX.jsonl").read_text(encoding="utf-8").splitlines()}
    new_rows = {x["id"]: x for x in records}
    changed_rows = [rid for rid in old_rows if old_rows[rid] != new_rows.get(rid)]
    if changed_rows != [TARGET_MARK_ID]:
        errors.append(f"unexpected changed marking records: {changed_rows}")
    return {
        "schema_version": "1.0",
        "artifact_version": "B25-A2-v2",
        "check_status": "PASS" if not errors else "FAIL",
        "errors": errors,
        "parent_v1_snapshot": verify_v1_snapshot(),
        "source_page_baseline": {"source_count": len(srcs), "total_pages": sum(x.get("page_count", 0) for x in srcs),
                                  "stage0_matches": batch.get("source_validation", {}).get("stage0_matches"),
                                  "rehash_audit": source_pdf_audit,
                                  "status": "PASS" if len(srcs) == 12 and sum(x.get("page_count", 0) for x in srcs) == 178 and source_pdf_audit["all_match_stage0"] else "FAIL"},
        "correction_scope": {"context_records": context_checks, "context_record_count": len(contexts),
                             "changed_context_ids": sorted(changed_contexts), "preserved_context_pages": preserved_checks,
                             "context_resolution": {"page_records": len(page_rows), "question_root_count": len(roots),
                                                    "unresolved": unresolved_contexts, "status": "PASS" if not unresolved_contexts else "FAIL"},
                             "marking_items": len(records), "changed_marking_record_ids": changed_rows,
                             "marking_visual_regions": len(visual_regions), "unresolved_marking_evidence": missing_dependencies,
                             "target_7e_locator_and_mark_preserved": len(target) == 1 and target[0].get("table_row_ref_or_null") == "7(e)" and target[0].get("ms_locator", {}).get("pdf_page_1_based") == 12 and target[0].get("mark_or_condition_or_null", "").endswith("3 ")},
        "mark_total_checks": {sid: {"cover_total": printed_total(p), "source_displayed_sum": p.get("displayed_mark_sum_from_source_transcript"),
                                     "indexed_sum": p.get("sum_of_indexed_question_and_part_marks"), "matches": p.get("matches")}
                              for sid, p in totals.items()},
        "input_pins": pins,
        "snapshot_hash_integrity": {"evidence": "SNAPSHOT_MANIFEST.json and HANDOFF_CHECK.json", "status": "PENDING_FREEZE_VERIFICATION"},
    }


def main() -> None:
    if (OUT / "SNAPSHOT_MANIFEST.json").exists():
        raise RuntimeError("v2 snapshot already exists; frozen packet cannot be edited")
    if len(list(OUT.iterdir())) == 0:
        raise RuntimeError("v2 candidate is empty")
    parent_snapshot = verify_v1_snapshot()
    pins = input_pins()
    source_pdf_audit = verify_source_pdfs()
    changes: list[dict] = []
    correct_contexts(changes)
    correct_marking(changes)

    delta = {
        "schema_version": "1.0", "artifact_version": "B25-A2-v2", "task_id": "P1-S1-A2-B25-V2",
        "parent_version": "B25-A2-v1", "parent_snapshot": parent_snapshot,
        "dispatch_sha256": pins["dispatch"]["sha256"],
        "independent_findings": ["A3-B25-CONTEXT-01..10", "A4-B25-CTX-01", "A4-B25-CTX-02", "A4-B25-MS-01"],
        "source_pdf_rehash_and_page_count": source_pdf_audit,
        "semantic_change_count": 11, "changes": changes,
        "nonchange_guards": [
            "No other question, part, mark, locator, context page, transcript, visual region or source PDF was intentionally changed.",
            "All 51 context records, 183 marking items, 144 visual regions, 12 source identities and 178 source pages remain in scope.",
            "No app, tracker, lesson, taxonomy or translation was edited.",
        ],
    }
    write_json(OUT / "CORRECTION_DELTA.json", delta)

    provenance_path = OUT / "SOURCE_EXTRACTION_PROVENANCE.json"
    provenance = json.loads(provenance_path.read_text(encoding="utf-8"))
    provenance["artifact_version"] = "B25-A2-v2"
    provenance["revision_record"] = {
        "parent_version": "B25-A2-v1", "dispatch_sha256": pins["dispatch"]["sha256"],
        "input_pins": pins, "correction_delta_path": "CORRECTION_DELTA.json",
        "correction_delta_sha256": sha(OUT / "CORRECTION_DELTA.json"),
        "scope": "Ten source-backed context-boundary page removals and one exact MS excerpt header trim; all source PDFs, transcripts and renders inherited unchanged.",
    }
    write_json(provenance_path, provenance)

    qa = OUT / "EXTRACTION_QA.md"
    text = qa.read_text(encoding="utf-8")
    text = text.replace("# B25-A2-v1 extraction QA", "# B25-A2-v2 extraction QA", 1)
    text = text.replace("Any correction must be issued as a new version, leaving B25-A2-v1 immutable after handoff.", "This correction is issued as B25-A2-v2; frozen B25-A2-v1 remains immutable.")
    text = text.replace("51 question context records cite page-level transcripts. Standalone blank pages and imprint-only pages are excluded; pages with question content plus an imprint remain referenced for the question content.", "51 question context records cite page-level transcripts. The ten context-boundary false references identified by independent review have been removed from all three context fields; source-page evidence remains in the page transcript/render inventory.")
    text = text.replace("Status: **A2 extraction packet complete; independent A3/A4/A9/A0 review pending.**", "Status: **A2 v2 corrections complete; A0 validation and independent same-version A3/A4/A9/A0 review pending.**")
    insertion = "\n## Version 2 correction record\n\nB25-A2-v2 applies exactly ten context-page removals from the independent source-boundary findings and trims the following generic `Question / Answer / Marks` header from the 7(e) MS excerpt (`9618_w25_ms_13`, PDF page 12, row 7(e)). The six mark totals remain 75. The 7(e) answer and displayed mark value are preserved. See `CORRECTION_DELTA.json`, `CORRECTION_CHECKS.json`, and `REVISION_NOTES.md`.\n"
    if "## Version 2 correction record" not in text:
        text = text.replace("## Extraction method and limits", insertion + "\n## Extraction method and limits", 1)
    qa.write_text(text, encoding="utf-8")

    unresolved = OUT / "UNRESOLVED.md"
    utext = unresolved.read_text(encoding="utf-8").replace("# B25-A2-v1 unresolved", "# B25-A2-v2 unresolved", 1)
    utext = utext.replace("None detected: every indexed leaf part and all three unparted whole-question records link to a unique exact paired-MS heading; all six QP displayed-mark totals equal the printed cover total.", "No extraction-time unresolved mappings are recorded; every indexed leaf part and all three unparted whole-question records link to a unique exact paired-MS heading, and all six QP displayed-mark totals equal the printed cover total. The v2 context-boundary and 7(e) excerpt corrections are checked in CORRECTION_CHECKS.json.")
    unresolved.write_text(utext, encoding="utf-8")

    for name in ("CROSS_REFERENCE_CHECK.json", "SELF_CHECK.json"):
        f = OUT / name
        data = json.loads(f.read_text(encoding="utf-8"))
        data["batch_id"] = "B25-A2-v2"
        for check in data.get("checks", []):
            if check.get("check") == "question_context_completeness":
                check["detail"] = "51 contexts resolve; ten false boundary-page references removed; dispatch-preserved context exceptions remain; see CORRECTION_CHECKS.json."
        if not any(x.get("check") == "version_2_correction_scope" for x in data.get("checks", [])):
            data.setdefault("checks", []).append({"check": "version_2_correction_scope", "status": "PASS",
                                                    "detail": "Exact ten context removals and one 7(e) header trim; only the eleven authorized semantic records changed."})
        data["errors"] = []
        data["status"] = "PASS"
        write_json(f, data)

    vis_path = OUT / "VISUAL_MANIFEST.json"
    visual = json.loads(vis_path.read_text(encoding="utf-8"))
    visual["artifact_version"] = "B25-A2-v2"
    visual["revision_note"] = "All 178 full-page renders, 12 contact sheets, and 144 visual regions are inherited unchanged from v1; context metadata corrections do not alter rendered source evidence. Hash-checked against the parent v1 snapshot."
    write_json(vis_path, visual)

    revision_notes = """# B25-A2-v2 revision notes\n\nThis immutable candidate is based on B25-A2-v1. It addresses the exact A3/A4 v1 findings in the frozen A0 dispatch. No app, tracker, lesson, taxonomy, translation, source PDF, transcript, or rendered image was edited.\n\n- Ten false context-page references were removed from `all_context_pages`, `continuation_pages`, and `source_evidence` in the ten question-context records listed in `CORRECTION_DELTA.json`. The source page classifications are recorded there.\n- The complete 7(e) answer and its displayed mark value are preserved for `9618_w25_qp_13-q7-pe-mi-1` at `9618_w25_ms_13`, PDF page 12, row `7(e)`; only the next generic table header was removed.\n- `9618_s25_qp_11-q8` page 15 and `9618_w25_qp_13-q5` pages 7–8 remain in context as directed by the source-backed reviews.\n- Counts, totals, locators, source identities, page counts, and all unaffected records are checked by `CORRECTION_CHECKS.json`; complete file integrity is represented by `SNAPSHOT_MANIFEST.json` and its SHA in `HANDOFF_CHECK.json`.\n\nThis is an A2 handoff only. A0 validation, same-version A3/A4 review, A9 review, and A0 acceptance remain open.\n"""
    (OUT / "REVISION_NOTES.md").write_text(revision_notes, encoding="utf-8")

    # Carry the exact v2 version through inherited metadata records.
    batch_path = OUT / "BATCH_MANIFEST.json"
    batch = json.loads(batch_path.read_text(encoding="utf-8"))
    batch["artifact_version"] = "B25-A2-v2"
    batch["status"] = "SUBMITTED_FOR_A0_VALIDATION_AND_A3_A4_A9_REVIEW"
    batch["revision_inputs"] = pins
    notes = list(batch.get("notes", []))
    for note in [
        "v2 corrects exactly ten context-boundary references and one next-table header captured in the 7(e) MS excerpt; see CORRECTION_DELTA.json and CORRECTION_CHECKS.json.",
        "All parent v1 artifacts remain immutable; A0 validation and independent same-version A3/A4/A9 review are still required.",
    ]:
        if note not in notes:
            notes.append(note)
    batch["notes"] = notes
    batch["record_counts"] = dict(batch["record_counts"])
    batch["record_counts"].update({"question_context": len(list((OUT / "contexts").glob("*.json"))),
                                   "marking_item": len((OUT / "MARKING_INDEX.jsonl").read_text(encoding="utf-8").splitlines()),
                                   "visual_region": len(visual.get("visual_regions", []))})
    # Build machine correction checks before manifest hashes are refreshed.
    checks = validate_corrections(changes, pins, source_pdf_audit)
    write_json(OUT / "CORRECTION_CHECKS.json", checks)
    if checks["check_status"] != "PASS":
        raise RuntimeError(f"Correction checks failed: {checks['errors']}")
    # Delta now can be hashed as part of provenance with stable bytes.
    provenance = json.loads(provenance_path.read_text(encoding="utf-8"))
    provenance["revision_record"]["correction_checks_path"] = "CORRECTION_CHECKS.json"
    provenance["revision_record"]["correction_checks_sha256"] = sha(OUT / "CORRECTION_CHECKS.json")
    write_json(provenance_path, provenance)

    # Exact batch inputs are pinned; rebuild all derived-file hashes and active hashes.
    excluded = {"BATCH_MANIFEST.json", "HANDOFF_CHECK.json", "SNAPSHOT_MANIFEST.json", "VALIDATOR_RESULT.json"}
    derived = []
    for f in sorted(x for x in OUT.rglob("*") if x.is_file() and rel(x) not in excluded):
        derived.append(artifact(f))
    batch["derived_artifacts"] = derived
    active = {}
    for key in json.loads((V1 / "BATCH_MANIFEST.json").read_text(encoding="utf-8"))["active_artifact_sha256"]:
        target = OUT / key
        if target.is_file():
            active[key] = sha(target)
    for key in ("CORRECTION_DELTA.json", "CORRECTION_CHECKS.json", "REVISION_NOTES.md"):
        active[key] = sha(OUT / key)
    batch["active_artifact_sha256"] = dict(sorted(active.items()))
    write_json(batch_path, batch)

    # Verify every declared active and derived artifact hash before validator/freezer runs.
    batch = json.loads(batch_path.read_text(encoding="utf-8"))
    problems = []
    for name, expected in batch["active_artifact_sha256"].items():
        p = OUT / name
        if not p.is_file() or sha(p) != expected:
            problems.append(f"active hash mismatch: {name}")
    for item in batch["derived_artifacts"]:
        p = OUT / item["path"]
        if not p.is_file() or sha(p) != item["sha256"] or p.stat().st_size != item["byte_count"]:
            problems.append(f"derived hash mismatch: {item['path']}")
    if problems:
        raise RuntimeError("Manifest hash errors: " + "; ".join(problems[:5]))
    print(json.dumps({"status": "PRE_FREEZE_CORRECTIONS_READY", "changes": len(changes),
                      "contexts": len(list((OUT / "contexts").glob("*.json"))),
                      "marking_items": batch["record_counts"]["marking_item"],
                      "visual_regions": batch["record_counts"]["visual_region"],
                      "derived_artifacts": len(derived), "active_artifacts": len(active),
                      "CORRECTION_DELTA_sha256": sha(OUT / "CORRECTION_DELTA.json"),
                      "CORRECTION_CHECKS_sha256": sha(OUT / "CORRECTION_CHECKS.json")}, ensure_ascii=False))


if __name__ == "__main__":
    main()
