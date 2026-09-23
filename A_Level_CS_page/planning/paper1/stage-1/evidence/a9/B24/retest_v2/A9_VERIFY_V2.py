from __future__ import annotations

import hashlib
import json
import re
from collections import Counter, defaultdict
from pathlib import Path

from pypdf import PdfReader


ROOT = Path(__file__).resolve().parents[8]
STAGE1 = ROOT / "A_Level_CS_page/planning/paper1/stage-1"
STAGE0 = ROOT / "A_Level_CS_page/planning/paper1/stage-0"
CANDIDATE = STAGE1 / "evidence/a2/B24/versions/B24-A2-v2"
PARENT = STAGE1 / "evidence/a2/B24/versions/B24-A2-v1"
A4 = STAGE1 / "evidence/a4/B24/retest_v2"


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8-sig"))


def load_jsonl(path: Path):
    return [json.loads(line) for line in path.read_text(encoding="utf-8-sig").splitlines() if line.strip()]


def manifest_check(root: Path, manifest_path: Path):
    manifest = load_json(manifest_path)
    failures = []
    total_bytes = 0
    for item in manifest["files"]:
        path = root / item["path"]
        expected_bytes = item.get("byte_count", item.get("bytes"))
        actual_bytes = path.stat().st_size if path.is_file() else None
        actual_hash = sha256(path) if path.is_file() else None
        total_bytes += actual_bytes or 0
        if actual_bytes != expected_bytes or actual_hash != item["sha256"]:
            failures.append({"path": item["path"], "actual_bytes": actual_bytes, "actual_sha256": actual_hash})
    return {"checked": len(manifest["files"]), "mismatches": len(failures), "total_bytes": total_bytes, "failures": failures}


expected_pins = {
    "dispatch": (STAGE1 / "evidence/a0/B24_A9_V2_RETEST_DISPATCH.md", "c7161e1456cff2eb57a7b3f895bab12536d9877f68748cb6c303a31ed5956b71"),
    "dispatch_record": (STAGE1 / "evidence/a0/B24_A9_V2_RETEST_DISPATCH_RECORD.json", "16cf149fbac4d152858c4cdd6b349e116de12046fde10e22055e6eb0f25e6ad1"),
    "candidate_handoff": (CANDIDATE / "HANDOFF_CHECK.json", "1deff03ac092aaec6bbaeed727dbfb62dfeeebd65b848d04723a27518b481328"),
    "candidate_batch_manifest": (CANDIDATE / "BATCH_MANIFEST.json", "88d4a354968210ce74d40af6aff25c06111855218630cc44df580423a0f3e6c7"),
    "candidate_snapshot": (CANDIDATE / "SNAPSHOT_MANIFEST.json", "97bd0ed1f802a6f8d71dda39f8b30086f6e8d9e16e8a154d1c25f575eb5f94f5"),
    "candidate_marking_index": (CANDIDATE / "MARKING_INDEX.jsonl", "331f66b5e614e69026a1b036c2b75fb63354bfea77901925c2fc4467a2b7dccd"),
    "a0_candidate_audit": (STAGE1 / "evidence/a0/B24_A2_V2_A0_AUDIT.json", "d5b2bfb4c2706840984e8e7c63f3c9ed223a67c531d0e1aabf9c426f254b826f"),
    "a4_handoff": (A4 / "HANDOFF_RETEST_V2.json", "c2d81d6fc0e0a7f06e8229b84de659688c562edba51f5d2cc357e3bbfaa76810"),
    "a4_output_manifest": (A4 / "OUTPUT_MANIFEST_V2.json", "c9113e62c7621828a76a4fae6e046aa1e19beb8ef05e19ce074f24458c24c5f9"),
    "a0_a4_audit": (STAGE1 / "evidence/a0/B24_A4_V2_HANDOFF_AUDIT.json", "d3e552a382d81f48b8ac25543bbedd6f1082741b1037cbba55c0dec7e8973d68"),
    "a9_v1_handoff": (STAGE1 / "evidence/a9/B24/review_v1/HANDOFF_REVIEW_V1.json", "ccb42b04231de24e29292fdd8404b72e6b9fb6f514efafccf685c7220535bf59"),
    "a9_v1_findings": (STAGE1 / "evidence/a9/B24/review_v1/FINDINGS_V1.json", "f0cfa70f3d1981777494a13e99ef18232ae29f8b859fe2bb407a1241af403d48"),
    "a3_v1_handoff": (STAGE1 / "evidence/a3/B24/review_v1/HANDOFF_REVIEW_V1.json", "8da881280e8e09f55bdc1d9e19e827ecbce56d5c4df3df418050ab42d60a22cf"),
    "stage0_source_manifest": (STAGE0 / "evidence/a2/SOURCE_MANIFEST.json", "195a68ad98b4739dff0d3496dc93ba9e85d67d2dae0d88e3d4e4a088f1259c9c"),
    "schema": (STAGE1 / "CORPUS_SCHEMA.md", "9fe71d4719b0c8f9fd6d6fd6fb0316c7f9a840b6b964634889ea6d98245a1f1f"),
    "policy": (STAGE1 / "EXTRACTION_POLICY.md", "97bd6c69ea8d459ea99713e943c2d092a88999b6df7cb315d2820547789c11f2"),
}

pin_results = []
for name, (path, expected) in expected_pins.items():
    actual = sha256(path)
    pin_results.append({"name": name, "path": path.relative_to(ROOT).as_posix(), "expected_sha256": expected, "actual_sha256": actual, "pass": actual == expected})

snapshot_result = manifest_check(CANDIDATE, CANDIDATE / "SNAPSHOT_MANIFEST.json")
a4_output_result = manifest_check(A4, A4 / "OUTPUT_MANIFEST_V2.json")

stage0 = load_json(STAGE0 / "evidence/a2/SOURCE_MANIFEST.json")
source_items = [item for item in stage0["primary_sources"] if item.get("year") == 2024 and item.get("kind") in {"qp", "ms"}]
source_results = []
source_pages = {}
for item in sorted(source_items, key=lambda row: row["id"]):
    path = ROOT / item["path"]
    pages = len(PdfReader(str(path)).pages)
    actual_hash = sha256(path)
    source_pages[item["id"]] = pages
    source_results.append({
        "source_id": item["id"],
        "path": item["path"],
        "sha256": actual_hash,
        "page_count": pages,
        "pass": actual_hash == item["sha256"] and pages == item["page_count"],
    })

pages = load_jsonl(CANDIDATE / "PAGE_INDEX.jsonl")
records = load_jsonl(CANDIDATE / "QUESTION_INDEX.jsonl")
marking = load_jsonl(CANDIDATE / "MARKING_INDEX.jsonl")
visuals = load_json(CANDIDATE / "VISUAL_MANIFEST.json")["visual_regions"]
roots = [row for row in records if "source_qp_id" in row]
parts = [row for row in records if "question_id" in row]
roots_by_id = {row["id"]: row for row in roots}
parts_by_id = {row["id"]: row for row in parts}
records_by_id = {row["id"]: row for row in records}
marking_by_id = {row["id"]: row for row in marking}
visuals_by_id = {row["id"]: row for row in visuals}
page_keys = {(row["source_id"], row["pdf_page_1_based"]) for row in pages}
allowed_statuses = {"EXTRACTED", "VISUAL_CHECK_REQUIRED", "MS_LINKED", "UNRESOLVED", "REVIEWED", "ACCEPTED"}
failures = []


def fail(check: str, record: str, detail: str):
    failures.append({"check": check, "record": record, "detail": detail})


for label, rows in (("question_part", records), ("marking", marking), ("visual", visuals)):
    for value, count in Counter(row["id"] for row in rows).items():
        if count > 1:
            fail("unique_" + label, value, f"count={count}")

for page in pages:
    key = (page["source_id"], page["pdf_page_1_based"])
    if page["source_id"] not in source_pages or not 1 <= page["pdf_page_1_based"] <= source_pages[page["source_id"]]:
        fail("page_locator", str(key), "outside source")
    transcript = page.get("transcript_ref_or_null")
    if transcript and not (CANDIDATE / transcript).is_file():
        fail("page_transcript", str(key), transcript)

contexts = []
for root in roots:
    loc = root["qp_locator"]
    sid = root["source_qp_id"]
    if (sid, loc["pdf_page_1_based"]) not in page_keys:
        fail("root_locator", root["id"], str(loc))
    if root.get("status") not in allowed_statuses:
        fail("root_status", root["id"], str(root.get("status")))
    ref = root.get("context_ref_or_null")
    if not ref or not (CANDIDATE / ref).is_file():
        fail("root_context", root["id"], str(ref))
        continue
    context = load_json(CANDIDATE / ref)
    contexts.append(context)
    all_pages = context.get("all_context_pages", [])
    if context.get("question_id") != root["id"] or context.get("source_qp_id") != sid:
        fail("context_identity", root["id"], ref)
    if context.get("question_start_page") != loc["pdf_page_1_based"] or loc["pdf_page_1_based"] not in all_pages:
        fail("context_start", root["id"], str(all_pages))
    if context.get("continuation_pages") != all_pages[1:]:
        fail("context_continuation", root["id"], str(context.get("continuation_pages")))
    evidence = context.get("source_evidence", [])
    if [x.get("pdf_page_1_based") for x in evidence] != all_pages:
        fail("context_evidence_pages", root["id"], str(evidence))
    for item in evidence:
        ref = item.get("transcript_ref")
        if item.get("source_id") != sid or not ref or not (CANDIDATE / ref).is_file():
            fail("context_evidence_ref", root["id"], str(item))

for part in parts:
    qid = part["question_id"]
    if qid not in roots_by_id:
        fail("part_question", part["id"], qid)
        continue
    parent = part.get("parent_part_id_or_null")
    if parent and parent not in parts_by_id:
        fail("part_parent", part["id"], parent)
    loc = part["qp_locator"]
    sid = roots_by_id[qid]["source_qp_id"]
    if loc.get("source_id") != sid or (sid, loc["pdf_page_1_based"]) not in page_keys:
        fail("part_locator", part["id"], str(loc))
    context = load_json(CANDIDATE / roots_by_id[qid]["context_ref_or_null"])
    if loc["pdf_page_1_based"] not in context["all_context_pages"]:
        fail("part_context_page", part["id"], str(loc))
    for dependency in part.get("dependency_refs", []):
        if dependency not in records_by_id and dependency not in visuals_by_id:
            fail("part_dependency", part["id"], dependency)
    if part.get("status") not in allowed_statuses:
        fail("part_status", part["id"], str(part.get("status")))

for item in marking:
    part_id = item.get("part_id_or_null")
    question_id = item.get("question_id_or_null")
    if (part_id is None) == (question_id is None):
        fail("mark_target_cardinality", item["id"], f"part={part_id}; question={question_id}")
    if part_id is not None and part_id not in parts_by_id:
        fail("mark_part_target", item["id"], part_id)
    if question_id is not None and question_id not in roots_by_id:
        fail("mark_question_target", item["id"], question_id)
    loc = item["ms_locator"]
    if (loc["source_id"], loc["pdf_page_1_based"]) not in page_keys or "_ms_" not in loc["source_id"]:
        fail("mark_ms_locator", item["id"], str(loc))
    if not (CANDIDATE / item["transcript_ref"]).is_file():
        fail("mark_transcript", item["id"], item["transcript_ref"])
    for visual in item.get("visual_dependency_refs", []):
        if visual not in visuals_by_id:
            fail("mark_visual_dependency", item["id"], visual)
    if item.get("status") not in allowed_statuses:
        fail("mark_status", item["id"], str(item.get("status")))
    if re.search(r"Question\s+Answer\s+Marks", item.get("mark_or_condition_or_null") or "", flags=re.I):
        fail("marking_row_boundary", item["id"], "contains generic following-table header")

for visual in visuals:
    if (visual["source_id"], visual["pdf_page_1_based"]) not in page_keys:
        fail("visual_page", visual["id"], str(visual))
    render = CANDIDATE / visual["rendered_asset_ref"]
    if not render.is_file() or render.stat().st_size != visual["render_byte_count"] or sha256(render) != visual["render_sha256"]:
        fail("visual_render", visual["id"], visual["rendered_asset_ref"])
    for related in visual.get("relates_to_ids", []):
        if related not in records_by_id and related not in marking_by_id:
            fail("visual_related_id", visual["id"], related)

children = defaultdict(list)
for part in parts:
    if part.get("parent_part_id_or_null"):
        children[part["parent_part_id_or_null"]].append(part["id"])
mark_targets = {item["part_id_or_null"] for item in marking if item.get("part_id_or_null")}
parent_groups = []
for parent_id, child_ids in sorted(children.items()):
    parent = parts_by_id[parent_id]
    row = {
        "id": parent_id,
        "child_count": len(child_ids),
        "marks_displayed_or_null": parent.get("marks_displayed_or_null"),
        "ms_locator_or_null": parent.get("ms_locator_or_null"),
        "has_marking_item": parent_id in mark_targets,
    }
    parent_groups.append(row)
    if row["marks_displayed_or_null"] is not None or row["ms_locator_or_null"] is not None or row["has_marking_item"]:
        fail("parent_group_allocation", parent_id, str(row))

mark_totals = defaultdict(int)
for row in records:
    mark = row.get("marks_displayed_or_null")
    if mark is None:
        continue
    sid = row["source_qp_id"] if "source_qp_id" in row else roots_by_id[row["question_id"]]["source_qp_id"]
    mark_totals[sid] += mark
for sid, total in mark_totals.items():
    if total != 75:
        fail("displayed_mark_total", sid, str(total))

starts = defaultdict(list)
for root in roots:
    starts[root["source_qp_id"]].append((int(root["question_number"]), root["qp_locator"]["pdf_page_1_based"], root["id"]))
for sid, values in starts.items():
    values.sort()
    for index, (_, _, qid) in enumerate(values):
        context = load_json(CANDIDATE / roots_by_id[qid]["context_ref_or_null"])
        next_start = values[index + 1][1] if index + 1 < len(values) else None
        if next_start is not None and max(context["all_context_pages"]) > next_start:
            fail("context_crosses_next_question", qid, f"max={max(context['all_context_pages'])}; next={next_start}")

v1_rows = {row["id"]: row for row in load_jsonl(PARENT / "MARKING_INDEX.jsonl")}
v2_rows = {row["id"]: row for row in marking}
v1_finding = load_json(STAGE1 / "evidence/a9/B24/review_v1/FINDINGS_V1.json")["findings"][0]
expected_corrected = [row["record_id"] for row in v1_finding["records"]]
changed_ids = [key for key in v2_rows if v1_rows[key] != v2_rows[key]]
correction_rows = []
for record_id in expected_corrected:
    before, after = v1_rows[record_id], v2_rows[record_id]
    changed_fields = sorted(key for key in set(before) | set(after) if before.get(key) != after.get(key))
    clean = not bool(re.search(r"Question\s+Answer\s+Marks", after.get("mark_or_condition_or_null") or "", flags=re.I))
    correction_rows.append({"id": record_id, "changed_fields": changed_fields, "clean": clean, "non_text_fields_preserved": changed_fields == ["mark_or_condition_or_null"]})
    if changed_fields != ["mark_or_condition_or_null"] or not clean:
        fail("correction_regression", record_id, str(correction_rows[-1]))
if set(changed_ids) != set(expected_corrected):
    fail("correction_delta", "MARKING_INDEX.jsonl", f"changed={changed_ids}")

result = {
    "work_order": "P1-S1-A9-B24-RETEST-V2",
    "candidate": "B24-A2-v2",
    "frozen_pins": {"checked": len(pin_results), "mismatches": sum(not row["pass"] for row in pin_results), "results": pin_results},
    "candidate_snapshot": snapshot_result,
    "a4_outputs": a4_output_result,
    "source_pdfs": {"checked": len(source_results), "total_pages": sum(row["page_count"] for row in source_results), "mismatches": sum(not row["pass"] for row in source_results), "results": source_results},
    "aggregate_counts": {"pages": len(pages), "question_roots": len(roots), "parts": len(parts), "combined": len(records), "marking_items": len(marking), "contexts": len(contexts), "visual_regions": len(visuals), "parent_groups": len(parent_groups)},
    "statuses": {"question_and_part": dict(Counter(row.get("status") for row in records)), "marking": dict(Counter(row.get("status") for row in marking)), "visual": dict(Counter(row.get("reviewer_status") for row in visuals))},
    "marking_targets": {"part": sum(row.get("part_id_or_null") is not None for row in marking), "whole_question": sum(row.get("question_id_or_null") is not None for row in marking)},
    "mark_totals": dict(sorted(mark_totals.items())),
    "correction_retest": {"expected": 19, "changed_ids": changed_ids, "rows": correction_rows, "all_pass": len(correction_rows) == 19 and all(row["clean"] and row["non_text_fields_preserved"] for row in correction_rows)},
    "structural_failures": failures,
    "overall_machine_result": "PASS" if not failures and all(row["pass"] for row in pin_results) and snapshot_result["mismatches"] == 0 and a4_output_result["mismatches"] == 0 and all(row["pass"] for row in source_results) else "FAIL",
}

print(json.dumps(result, ensure_ascii=False, indent=2))
