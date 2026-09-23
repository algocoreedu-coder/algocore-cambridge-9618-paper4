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
CANDIDATE = STAGE1 / "evidence/a2/B24/versions/B24-A2-v1"
A3 = STAGE1 / "evidence/a3/B24/review_v1"
A4 = STAGE1 / "evidence/a4/B24/review_v1"


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


def manifest_check(root: Path, manifest_path: Path, list_key: str, bytes_key: str):
    manifest = load_json(manifest_path)
    failures = []
    checked = 0
    total_bytes = 0
    for item in manifest[list_key]:
        path = root / item["path"]
        checked += 1
        actual_bytes = path.stat().st_size if path.is_file() else None
        actual_hash = sha256(path) if path.is_file() else None
        total_bytes += actual_bytes or 0
        if actual_bytes != item[bytes_key] or actual_hash != item["sha256"]:
            failures.append(
                {
                    "path": item["path"],
                    "expected_bytes": item[bytes_key],
                    "actual_bytes": actual_bytes,
                    "expected_sha256": item["sha256"],
                    "actual_sha256": actual_hash,
                }
            )
    return {
        "checked": checked,
        "mismatches": len(failures),
        "total_bytes": total_bytes,
        "failures": failures,
    }


expected_pins = {
    "dispatch": (
        STAGE1 / "evidence/a0/B24_A9_V1_REVIEW_DISPATCH.md",
        "f6748ed993e0050b78d386989e74b78dc8047c34be1bc216c05643377ce7694a",
    ),
    "candidate_handoff": (
        CANDIDATE / "HANDOFF_CHECK.json",
        "d1946e1bd9c3a2b61bb8c3728873c860e3066240c990176649a2189902c145bd",
    ),
    "candidate_batch_manifest": (
        CANDIDATE / "BATCH_MANIFEST.json",
        "1a18ace3982d37dd6da5288238d7ca3cb5010d3b5977fe9481c40a93968d4486",
    ),
    "candidate_snapshot_manifest": (
        CANDIDATE / "SNAPSHOT_MANIFEST.json",
        "dbdc02935d5e8150019633e7138af1100b973cdcea7880116c4bdffcb417db97",
    ),
    "a0_candidate_audit": (
        STAGE1 / "evidence/a0/B24_A2_V1_A0_AUDIT.json",
        "cc9563fd98aae568f6a6ee29ed9e8e83738e2ebde3089eb8440ee9c528d70ca1",
    ),
    "a3_handoff": (
        A3 / "HANDOFF_REVIEW_V1.json",
        "8da881280e8e09f55bdc1d9e19e827ecbce56d5c4df3df418050ab42d60a22cf",
    ),
    "a3_output_manifest": (
        A3 / "OUTPUT_MANIFEST_V1.json",
        "3d3d8983e4a0c651a397d1559fd9cc1439a5fbe3c47d7a0d9163aa7f17e24f4b",
    ),
    "a0_a3_audit": (
        STAGE1 / "evidence/a0/B24_A3_V1_HANDOFF_AUDIT.json",
        "62d3784778c719cb8747146a0627b8726d36b23e0f45e0dcdda7ba4cba68bb83",
    ),
    "a4_handoff": (
        A4 / "HANDOFF_REVIEW_V1.json",
        "e145320c7805acd8e70a1d507a1f902e59e7d517e967cfb9314e47d909bcff3e",
    ),
    "a4_output_manifest": (
        A4 / "OUTPUT_MANIFEST_V1.json",
        "092dea2479ced3be66f9e5bb71c120bfdf525c30b0c70fb7cf3938490c08dc4e",
    ),
    "a4_output_sums": (
        A4 / "OUTPUT_SHA256SUMS.txt",
        "9e89e3020b9f71c238fcebad545d7cd8c4e0854f840e744f303d06906c2a5ce9",
    ),
    "a0_a4_audit": (
        STAGE1 / "evidence/a0/B24_A4_V1_HANDOFF_AUDIT.json",
        "3a085ed2cc214f002f771af1a238f36facd75c0a7e7a814d0c70f5666c881867",
    ),
    "stage0_source_manifest": (
        STAGE0 / "evidence/a2/SOURCE_MANIFEST.json",
        "195a68ad98b4739dff0d3496dc93ba9e85d67d2dae0d88e3d4e4a088f1259c9c",
    ),
    "schema": (
        STAGE1 / "CORPUS_SCHEMA.md",
        "9fe71d4719b0c8f9fd6d6fd6fb0316c7f9a840b6b964634889ea6d98245a1f1f",
    ),
    "policy": (
        STAGE1 / "EXTRACTION_POLICY.md",
        "97bd6c69ea8d459ea99713e943c2d092a88999b6df7cb315d2820547789c11f2",
    ),
}

pin_results = []
for name, (path, expected) in expected_pins.items():
    actual = sha256(path)
    pin_results.append(
        {
            "name": name,
            "path": path.relative_to(ROOT).as_posix(),
            "expected_sha256": expected,
            "actual_sha256": actual,
            "pass": actual == expected,
        }
    )

snapshot = load_json(CANDIDATE / "SNAPSHOT_MANIFEST.json")
snapshot_result = manifest_check(CANDIDATE, CANDIDATE / "SNAPSHOT_MANIFEST.json", "files", "byte_count")

a3_output_result = manifest_check(A3, A3 / "OUTPUT_MANIFEST_V1.json", "files", "bytes")
a4_output_result = manifest_check(A4, A4 / "OUTPUT_MANIFEST_V1.json", "files", "bytes")

stage0_manifest = load_json(STAGE0 / "evidence/a2/SOURCE_MANIFEST.json")
source_items = [
    item
    for item in stage0_manifest["primary_sources"]
    if item.get("year") == 2024 and item.get("kind") in {"qp", "ms"}
]
source_results = []
source_pages = {}
for item in sorted(source_items, key=lambda row: row["id"]):
    path = ROOT / item["path"]
    actual_hash = sha256(path)
    actual_pages = len(PdfReader(str(path)).pages)
    source_pages[item["id"]] = actual_pages
    source_results.append(
        {
            "source_id": item["id"],
            "path": item["path"],
            "sha256_expected": item["sha256"],
            "sha256_actual": actual_hash,
            "page_count_expected": item["page_count"],
            "page_count_actual": actual_pages,
            "pass": actual_hash == item["sha256"] and actual_pages == item["page_count"],
        }
    )

pages = load_jsonl(CANDIDATE / "PAGE_INDEX.jsonl")
questions_and_parts = load_jsonl(CANDIDATE / "QUESTION_INDEX.jsonl")
marking_items = load_jsonl(CANDIDATE / "MARKING_INDEX.jsonl")
visual_manifest = load_json(CANDIDATE / "VISUAL_MANIFEST.json")
visual_regions = visual_manifest["visual_regions"]

roots = [row for row in questions_and_parts if "source_qp_id" in row]
parts = [row for row in questions_and_parts if "question_id" in row]
records_by_id = {row["id"]: row for row in questions_and_parts}
roots_by_id = {row["id"]: row for row in roots}
parts_by_id = {row["id"]: row for row in parts}
marking_by_id = {row["id"]: row for row in marking_items}
visual_by_id = {row["id"]: row for row in visual_regions}
page_keys = {(row["source_id"], row["pdf_page_1_based"]) for row in pages}
allowed_statuses = {"EXTRACTED", "VISUAL_CHECK_REQUIRED", "MS_LINKED", "UNRESOLVED", "REVIEWED", "ACCEPTED"}

failures = []


def fail(check: str, record: str, detail: str):
    failures.append({"check": check, "record": record, "detail": detail})


all_ids = [row["id"] for row in questions_and_parts]
for dup, count in Counter(all_ids).items():
    if count > 1:
        fail("unique_question_part_ids", dup, f"count={count}")
for dup, count in Counter(row["id"] for row in marking_items).items():
    if count > 1:
        fail("unique_marking_ids", dup, f"count={count}")
for dup, count in Counter(row["id"] for row in visual_regions).items():
    if count > 1:
        fail("unique_visual_ids", dup, f"count={count}")

for page in pages:
    sid = page["source_id"]
    n = page["pdf_page_1_based"]
    if sid not in source_pages or not 1 <= n <= source_pages[sid]:
        fail("page_locator", f"{sid}:{n}", "source/page out of range")
    transcript = page.get("transcript_ref_or_null")
    if transcript and not (CANDIDATE / transcript).is_file():
        fail("page_transcript", f"{sid}:{n}", transcript)

context_rows = []
for root in roots:
    locator = root["qp_locator"]
    sid = root["source_qp_id"]
    page = locator["pdf_page_1_based"]
    if (sid, page) not in page_keys:
        fail("root_locator", root["id"], f"{sid}:{page}")
    if root.get("status") not in allowed_statuses:
        fail("root_status", root["id"], str(root.get("status")))
    context_ref = root.get("context_ref_or_null")
    if not context_ref or not (CANDIDATE / context_ref).is_file():
        fail("root_context", root["id"], str(context_ref))
        continue
    context = load_json(CANDIDATE / context_ref)
    context_rows.append(context)
    if context.get("question_id") != root["id"] or context.get("source_qp_id") != sid:
        fail("context_identity", root["id"], context_ref)
    if context.get("question_start_page") != page:
        fail("context_start", root["id"], f"locator={page}; context={context.get('question_start_page')}")
    all_pages = context.get("all_context_pages", [])
    if page not in all_pages:
        fail("context_start_in_pages", root["id"], str(all_pages))
    expected_continuation = all_pages[1:]
    if context.get("continuation_pages") != expected_continuation:
        fail("context_continuation", root["id"], f"expected {expected_continuation}")
    evidence = context.get("source_evidence", [])
    evidence_pages = [x.get("pdf_page_1_based") for x in evidence]
    if evidence_pages != all_pages:
        fail("context_evidence_pages", root["id"], f"{evidence_pages} != {all_pages}")
    for evidence_row in evidence:
        ref = evidence_row.get("transcript_ref")
        if evidence_row.get("source_id") != sid or not ref or not (CANDIDATE / ref).is_file():
            fail("context_evidence_ref", root["id"], str(evidence_row))

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
    n = loc["pdf_page_1_based"]
    if loc.get("source_id") != sid or (sid, n) not in page_keys:
        fail("part_locator", part["id"], str(loc))
    context = load_json(CANDIDATE / roots_by_id[qid]["context_ref_or_null"])
    if n not in context["all_context_pages"]:
        fail("part_context_page", part["id"], f"page={n}")
    for dependency in part.get("dependency_refs", []):
        if dependency not in records_by_id and dependency not in visual_by_id:
            fail("part_dependency", part["id"], dependency)
    if part.get("status") not in allowed_statuses:
        fail("part_status", part["id"], str(part.get("status")))

for item in marking_items:
    part_id = item.get("part_id_or_null")
    question_id = item.get("question_id_or_null")
    if (part_id is None) == (question_id is None):
        fail("mark_target_cardinality", item["id"], f"part={part_id}; question={question_id}")
    if part_id is not None and part_id not in parts_by_id:
        fail("mark_part_target", item["id"], part_id)
    if question_id is not None and question_id not in roots_by_id:
        fail("mark_question_target", item["id"], question_id)
    loc = item["ms_locator"]
    key = (loc["source_id"], loc["pdf_page_1_based"])
    if key not in page_keys or "_ms_" not in loc["source_id"]:
        fail("mark_ms_locator", item["id"], str(loc))
    if not (CANDIDATE / item["transcript_ref"]).is_file():
        fail("mark_transcript", item["id"], item["transcript_ref"])
    for visual_id in item.get("visual_dependency_refs", []):
        if visual_id not in visual_by_id:
            fail("mark_visual_dependency", item["id"], visual_id)
    if item.get("status") not in allowed_statuses:
        fail("mark_status", item["id"], str(item.get("status")))
    mark_text = item.get("mark_or_condition_or_null") or ""
    if re.search(r"Question\s+Answer\s+Marks\s*$", mark_text, flags=re.IGNORECASE):
        fail(
            "marking_row_boundary",
            item["id"],
            "mark_or_condition_or_null ends with the generic header of the following MS table",
        )

for region in visual_regions:
    key = (region["source_id"], region["pdf_page_1_based"])
    if key not in page_keys:
        fail("visual_page", region["id"], str(key))
    render = CANDIDATE / region["rendered_asset_ref"]
    if not render.is_file() or sha256(render) != region["render_sha256"] or render.stat().st_size != region["render_byte_count"]:
        fail("visual_render", region["id"], region["rendered_asset_ref"])
    for related in region.get("relates_to_ids", []):
        if related not in records_by_id and related not in marking_by_id:
            fail("visual_related_id", region["id"], related)

children = defaultdict(list)
for part in parts:
    if part.get("parent_part_id_or_null"):
        children[part["parent_part_id_or_null"]].append(part["id"])
mark_targets = {item.get("part_id_or_null") for item in marking_items if item.get("part_id_or_null")}
parent_groupings = []
for parent_id, child_ids in sorted(children.items()):
    parent = parts_by_id[parent_id]
    record = {
        "id": parent_id,
        "child_count": len(child_ids),
        "marks_displayed_or_null": parent.get("marks_displayed_or_null"),
        "ms_locator_or_null": parent.get("ms_locator_or_null"),
        "has_marking_item": parent_id in mark_targets,
    }
    parent_groupings.append(record)
    if record["marks_displayed_or_null"] is not None or record["ms_locator_or_null"] is not None or record["has_marking_item"]:
        fail("parent_grouping_allocation", parent_id, str(record))

mark_totals = defaultdict(int)
for row in questions_and_parts:
    marks = row.get("marks_displayed_or_null")
    if marks is None:
        continue
    if "source_qp_id" in row:
        sid = row["source_qp_id"]
    else:
        sid = roots_by_id[row["question_id"]]["source_qp_id"]
    mark_totals[sid] += marks
for sid, total in mark_totals.items():
    if total != 75:
        fail("displayed_mark_total", sid, str(total))

root_starts = defaultdict(list)
for root in roots:
    root_starts[root["source_qp_id"]].append((root["qp_locator"]["pdf_page_1_based"], int(root["question_number"]), root["id"]))
boundary_rows = []
for sid, items in sorted(root_starts.items()):
    items.sort(key=lambda x: x[1])
    for index, (start, qnum, qid) in enumerate(items):
        context = load_json(CANDIDATE / roots_by_id[qid]["context_ref_or_null"])
        next_start = items[index + 1][0] if index + 1 < len(items) else None
        max_context = max(context["all_context_pages"])
        passed = next_start is None or max_context <= next_start
        boundary_rows.append(
            {
                "question_id": qid,
                "start_page": start,
                "max_context_page": max_context,
                "next_question_start_page": next_start,
                "pass": passed,
            }
        )
        if not passed:
            fail("context_crosses_next_question", qid, f"max={max_context}; next={next_start}")

a3_handoff = load_json(A3 / "HANDOFF_REVIEW_V1.json")
a4_handoff = load_json(A4 / "HANDOFF_REVIEW_V1.json")
specialist_result = {
    "a3_recommendation": a3_handoff.get("recommendation"),
    "a3_open_findings": a3_handoff.get("finding_counts", {}).get("open"),
    "a4_recommendation": a4_handoff.get("recommendation"),
    "a4_open_critical_or_major": a4_handoff.get("findings", {}).get("open_critical_or_major"),
    "same_candidate": a3_handoff.get("candidate", {}).get("artifact_version") == "B24-A2-v1"
    and a4_handoff.get("candidate") == "B24-A2-v1",
}

result = {
    "work_order": "P1-S1-A9-B24-REVIEW-V1",
    "candidate": "B24-A2-v1",
    "frozen_pins": {
        "checked": len(pin_results),
        "mismatches": sum(not row["pass"] for row in pin_results),
        "results": pin_results,
    },
    "candidate_snapshot": snapshot_result,
    "specialist_outputs": {"a3": a3_output_result, "a4": a4_output_result},
    "source_pdfs": {
        "checked": len(source_results),
        "total_pages": sum(row["page_count_actual"] for row in source_results),
        "mismatches": sum(not row["pass"] for row in source_results),
        "results": source_results,
    },
    "aggregate_counts": {
        "pages": len(pages),
        "question_roots": len(roots),
        "parts": len(parts),
        "question_and_part_records": len(questions_and_parts),
        "marking_items": len(marking_items),
        "visual_regions": len(visual_regions),
        "question_contexts": len(context_rows),
        "parent_groupings": len(parent_groupings),
    },
    "statuses": {
        "question_and_part": dict(sorted(Counter(row.get("status") for row in questions_and_parts).items())),
        "marking_items": dict(sorted(Counter(row.get("status") for row in marking_items).items())),
        "visual_reviewer": dict(sorted(Counter(row.get("reviewer_status") for row in visual_regions).items())),
    },
    "target_counts": {
        "part_targets": sum(item.get("part_id_or_null") is not None for item in marking_items),
        "whole_question_targets": sum(item.get("question_id_or_null") is not None for item in marking_items),
    },
    "mark_totals": dict(sorted(mark_totals.items())),
    "parent_groupings": parent_groupings,
    "boundary_checks": boundary_rows,
    "specialist_handoffs": specialist_result,
    "structural_failures": failures,
    "overall_machine_result": "PASS"
    if not failures
    and all(row["pass"] for row in pin_results)
    and snapshot_result["mismatches"] == 0
    and a3_output_result["mismatches"] == 0
    and a4_output_result["mismatches"] == 0
    and all(row["pass"] for row in source_results)
    else "FAIL",
}

print(json.dumps(result, ensure_ascii=False, indent=2))
