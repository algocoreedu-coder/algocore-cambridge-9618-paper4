from __future__ import annotations

import hashlib
import json
from collections import defaultdict
from pathlib import Path

import pymupdf

ROOT = Path.cwd()
PAPER = ROOT / "A_Level_CS_page" / "planning" / "paper1"
STAGE1 = PAPER / "stage-1"
OUT = STAGE1 / "evidence" / "a3" / "B25" / "review_v1"
CAND = STAGE1 / "evidence" / "a2" / "B25" / "versions" / "B25-A2-v1"
DISPATCH = STAGE1 / "evidence" / "a0" / "B25_A3_V1_REVIEW_DISPATCH.md"
DISPATCH_RECORD = STAGE1 / "evidence" / "a0" / "B25_A3_V1_REVIEW_DISPATCH_RECORD.json"
A0_AUDIT = STAGE1 / "evidence" / "a0" / "B25_A2_V1_A0_AUDIT.json"
STAGE0_MANIFEST = PAPER / "stage-0" / "evidence" / "a2" / "SOURCE_MANIFEST.json"
SYLLABUS_PDF = PAPER / "stage-0" / "evidence" / "a3" / "tmp" / "official-2026-syllabus.pdf"
SCOPE_MD = PAPER / "stage-0" / "evidence" / "a3" / "SYLLABUS_SCOPE.md"
PILOT_MD = PAPER / "stage-0" / "evidence" / "a3" / "PILOT_SCOPE_CHECK.md"
SCHEMA = STAGE1 / "CORPUS_SCHEMA.md"
POLICY = STAGE1 / "EXTRACTION_POLICY.md"

PINNED = {
    "dispatch": "9ff88ccb410d8df9c7e23de884d409095004760f48a067f9589e0b73ba0141bb",
    "dispatch_record": "46e18f334647dd437484a80e26aafb9553821bd63073983ed9e2b1e380b7c15d",
    "candidate_handoff": "6087afbba526210bb4566d005fd278224e9078b3fcddb91ccdd410f62e17ae7b",
    "candidate_batch_manifest": "7ab0ea8a747d54c8d50157784d2dae5c1158c95b4db2049ae50f077364b7e244",
    "candidate_snapshot_manifest": "a9a96b6ba8db064578a73798228839c837e99f614ae4e05186e206ad6e6c14d6",
    "a0_candidate_audit": "bcb35b2855ca5ae297174901c31ea7d4846a308a279aa0a55109c26a2d5e4660",
    "stage0_source_manifest": "195a68ad98b4739dff0d3496dc93ba9e85d67d2dae0d88e3d4e4a088f1259c9c",
    "syllabus_pdf_2026": "bf1b77a2b765d10eb4b005ecae0412add35cf6113ba3218a517893abfc9f2470",
    "syllabus_scope": "87b909152c41ca460e7894079ed531652b6e63894d4657aee3e7af48a0b0515c",
    "pilot_scope_check": "619a575cfaa3c3a516b192e0f32f8fe8b55b18fa0230285ac9442ccc64e0905a",
    "schema": "9fe71d4719b0c8f9fd6d6fd6fb0316c7f9a840b6b964634889ea6d98245a1f1f",
    "extraction_policy": "97bd6c69ea8d459ea99713e943c2d092a88999b6df7cb315d2820547789c11f2",
}

def sha(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()

def jload(path: Path):
    return json.loads(path.read_text(encoding="utf-8-sig"))

def jdump(path: Path, data):
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

def pin(name: str, path: Path, expected: str | None = None):
    actual = sha(path)
    if expected and actual != expected:
        raise SystemExit(f"PIN MISMATCH {name}: {actual} != {expected}")
    return {"name": name, "path": path.relative_to(ROOT).as_posix(), "sha256": actual, "matches_expected": (actual == expected if expected else None)}

dispatch_record = jload(DISPATCH_RECORD)
assert sha(DISPATCH) == PINNED["dispatch"]
assert dispatch_record["work_order_sha256"] == PINNED["dispatch"]
assert dispatch_record["status"] == "DISPATCHED"
assert sha(CAND / "BATCH_MANIFEST.json") == PINNED["candidate_batch_manifest"]
assert sha(CAND / "SNAPSHOT_MANIFEST.json") == PINNED["candidate_snapshot_manifest"]
assert sha(A0_AUDIT) == PINNED["a0_candidate_audit"]
assert sha(STAGE0_MANIFEST) == PINNED["stage0_source_manifest"]
assert sha(SYLLABUS_PDF) == PINNED["syllabus_pdf_2026"]
assert sha(SCOPE_MD) == PINNED["syllabus_scope"]
assert sha(PILOT_MD) == PINNED["pilot_scope_check"]
assert sha(SCHEMA) == PINNED["schema"]
assert sha(POLICY) == PINNED["extraction_policy"]

batch = jload(CAND / "BATCH_MANIFEST.json")
snapshot = jload(CAND / "SNAPSHOT_MANIFEST.json")
if snapshot["file_count"] != 438 or len(snapshot["files"]) != 438:
    raise SystemExit("Candidate snapshot does not have 438 pinned artifacts")
snapshot_checks = []
for item in snapshot["files"]:
    path = CAND / item["path"]
    actual = sha(path)
    byte_count = path.stat().st_size
    if actual != item["sha256"] or byte_count != item["byte_count"]:
        raise SystemExit(f"Candidate snapshot artifact mismatch: {item['path']}")
    snapshot_checks.append({"path": item["path"], "sha256": actual, "byte_count": byte_count, "matches": True})

stage0 = jload(STAGE0_MANIFEST)
source_records = [x for x in stage0["primary_sources"] if x.get("kind") in {"qp", "ms"} and x.get("year") == 2025]
source_checks = []
for source in source_records:
    src = ROOT / source["path"]
    doc = pymupdf.open(src)
    actual_sha = sha(src)
    actual_pages = doc.page_count
    doc.close()
    if actual_sha != source["sha256"] or actual_pages != source["page_count"]:
        raise SystemExit(f"Source pin/page count mismatch: {source['id']}")
    source_checks.append({
        "source_id": source["id"], "path": source["path"], "sha256": actual_sha,
        "page_count": actual_pages, "kind": source["kind"], "classification": "official_cambridge_source_pdf",
        "matches_stage0": True,
    })
if len(source_checks) != 12 or sum(x["page_count"] for x in source_checks) != 178:
    raise SystemExit("Unexpected source count/page total")

render_manifest_path = OUT / "SOURCE_RENDER_EVIDENCE_V1.json"
render_manifest = jload(render_manifest_path)
if render_manifest["full_size_page_count"] != 77 or len(render_manifest["pages"]) != 77:
    raise SystemExit("Unexpected full-size render evidence page count")
render_checks = []
for item in render_manifest["pages"]:
    source = next(x for x in source_checks if x["source_id"] == item["source_id"])
    if item["source_pdf_sha256"] != source["sha256"]:
        raise SystemExit(f"Render source hash mismatch: {item['source_id']}")
    render_path = OUT / item["render_path"]
    if sha(render_path) != item["render_sha256"]:
        raise SystemExit(f"Render output hash mismatch: {item['render_path']}")
    render_checks.append({"source_id": item["source_id"], "pdf_page_1_based": item["pdf_page_1_based"], "render_path": item["render_path"], "render_sha256": item["render_sha256"], "matches_source_and_render_manifest": True})

def jsonl(path: Path):
    return [json.loads(line) for line in path.read_text(encoding="utf-8-sig").splitlines() if line.strip()]

qrecs = jsonl(CAND / "QUESTION_INDEX.jsonl")
markings = jsonl(CAND / "MARKING_INDEX.jsonl")
pages = jsonl(CAND / "PAGE_INDEX.jsonl")
visual = jload(CAND / "VISUAL_MANIFEST.json")
roots = [r for r in qrecs if "question_number" in r]
parts = [r for r in qrecs if "question_id" in r]
assert len(roots) == 51 and len(parts) == 207 and len(markings) == 183 and len(pages) == 178
assert len(visual.get("visual_regions", [])) == 144

# Structural reconciliation of every root, part and marking locator.
roots_by_id = {r["id"]: r for r in roots}
parts_by_id = {p["id"]: p for p in parts}
source_by_id = {x["source_id"]: x for x in source_checks}

def full_part_label(part):
    labels = []
    current = part
    while current:
        labels.append(current["label"])
        current = parts_by_id.get(current.get("parent_part_id_or_null"))
    return "".join(reversed(labels))

locator_issues = []
for root in roots:
    loc = root["qp_locator"]
    source = source_by_id[root["source_qp_id"]]
    if loc["source_id"] != root["source_qp_id"] or loc["question"] != root["question_number"] or not 1 <= loc["pdf_page_1_based"] <= source["page_count"]:
        locator_issues.append({"record_id": root["id"], "kind": "root_qp_locator"})
for part in parts:
    root = roots_by_id[part["question_id"]]
    loc = part["qp_locator"]
    source = source_by_id[root["source_qp_id"]]
    if loc["source_id"] != root["source_qp_id"] or loc["question"] != root["question_number"] or loc["part"] != full_part_label(part) or not 1 <= loc["pdf_page_1_based"] <= source["page_count"]:
        locator_issues.append({"record_id": part["id"], "kind": "part_qp_locator"})
    ms = part.get("ms_locator_or_null")
    if ms:
        expected_ms = f"9618_{root['session']}25_ms_{root['component']}"
        ms_source = source_by_id.get(ms["source_id"])
        if ms["source_id"] != expected_ms or ms["question"] != root["question_number"] or ms["part"] != full_part_label(part) or not ms_source or not 1 <= ms["pdf_page_1_based"] <= ms_source["page_count"]:
            locator_issues.append({"record_id": part["id"], "kind": "part_ms_locator"})
for item in markings:
    has_part = item.get("part_id_or_null") is not None
    has_question = item.get("question_id_or_null") is not None
    if has_part == has_question:
        locator_issues.append({"record_id": item["id"], "kind": "marking_item_target_exclusivity"})
        continue
    target = parts_by_id.get(item.get("part_id_or_null")) if has_part else roots_by_id.get(item.get("question_id_or_null"))
    if not target:
        locator_issues.append({"record_id": item["id"], "kind": "marking_item_target_exists"})
        continue
    root = roots_by_id[target["question_id"]] if has_part else target
    loc = item["ms_locator"]
    expected_ms = f"9618_{root['session']}25_ms_{root['component']}"
    ms_source = source_by_id.get(loc["source_id"])
    if loc["source_id"] != expected_ms or loc["question"] != root["question_number"] or not ms_source or not 1 <= loc["pdf_page_1_based"] <= ms_source["page_count"]:
        locator_issues.append({"record_id": item["id"], "kind": "marking_item_ms_locator"})
    if has_part and loc.get("part") != full_part_label(target):
        locator_issues.append({"record_id": item["id"], "kind": "marking_item_ms_part_path"})
if locator_issues:
    raise SystemExit(f"Locator consistency checks failed: {locator_issues[:5]}")
locator_audit = {
    "artifact_version": "B25-A3-REVIEW-v1",
    "method": "Reconcile source ID, question, full part path and 1-based page range to the Stage 0-pinned source inventory; check marking-item target exclusivity and existence.",
    "root_qp_locators_checked": len(roots), "part_qp_locators_checked": len(parts),
    "part_ms_locators_checked": sum(p.get("ms_locator_or_null") is not None for p in parts),
    "marking_item_ms_locators_checked": len(markings), "locator_consistency_issues": locator_issues,
    "status": "PASS_STRUCTURAL_CONSISTENCY",
    "limit": "Structural identity/page-range checks are not a full-size semantic transcription audit; source visual review is risk-based and described in SOURCE_RISK_REVIEW_V1.md.",
}
jdump(OUT / "LOCATOR_AUDIT_V1.json", locator_audit)

children = defaultdict(list)
for part in parts:
    if part.get("parent_part_id_or_null"):
        children[part["parent_part_id_or_null"]].append(part)
groups = [p for p in parts if children[p["id"]] and p.get("marks_displayed_or_null") is None and p.get("ms_locator_or_null") is None]
group_checks = []
for parent in groups:
    child_rows = children[parent["id"]]
    direct_items = [m for m in markings if m.get("part_id_or_null") == parent["id"]]
    group_checks.append({
        "parent_part_id": parent["id"], "child_count": len(child_rows), "parent_marks_null": parent.get("marks_displayed_or_null") is None,
        "parent_ms_locator_null": parent.get("ms_locator_or_null") is None, "direct_marking_items": len(direct_items),
        "children_have_explicit_ms_locators": all(c.get("ms_locator_or_null") is not None for c in child_rows),
        "child_ids": [c["id"] for c in child_rows],
    })
if len(groups) != 27 or not all(g["children_have_explicit_ms_locators"] and g["direct_marking_items"] == 0 for g in group_checks):
    raise SystemExit("Parent grouping structure changed or failed checks")

totals = defaultdict(int)
for record in roots + parts:
    value = record.get("marks_displayed_or_null")
    if value is None:
        continue
    source_id = record.get("source_qp_id")
    if not source_id:
        root = next(x for x in roots if x["id"] == record["question_id"])
        source_id = root["source_qp_id"]
    totals[source_id] += int(value)
cover_observations = jload(CAND / "MARK_TOTAL_CHECK.json")["pairs"]
cover_checks = []
for source_id in sorted(cover_observations):
    cover = cover_observations[source_id]["cover_total_source"]
    record = {
        "source_id": source_id, "indexed_explicit_mark_sum_recomputed": totals[source_id],
        "cover_total_in_source_check": cover_observations[source_id]["printed_cover_total_or_null"],
        "displayed_sum_from_source_transcript": cover_observations[source_id]["displayed_mark_sum_from_source_transcript"],
        "cover_page": cover["pdf_page_1_based"], "cover_excerpt": cover["excerpt_verbatim"],
        "matches": totals[source_id] == cover_observations[source_id]["printed_cover_total_or_null"] == cover_observations[source_id]["displayed_mark_sum_from_source_transcript"] == 75,
    }
    if not record["matches"]:
        raise SystemExit(f"Mark total mismatch: {source_id}")
    cover_checks.append(record)

source_by_id = {x["id"]: x for x in source_records}
render_by_key = {(x["source_id"], x["pdf_page_1_based"]): x for x in render_manifest["pages"]}
context_files = sorted((CAND / "contexts").glob("*.json"))
if len(context_files) != 51:
    raise SystemExit("Expected 51 context files")

issue_specs = [
    ("9618_s25_qp_11-q3", 7, "next_question_only", "The whole page carries Question 4; it contains no continuation of Question 3.", "9618_s25_qp_11-q4"),
    ("9618_s25_qp_12-q2", 5, "next_question_only", "The whole page starts Question 3 and contains no continuation of Question 2.", "9618_s25_qp_12-q3"),
    ("9618_s25_qp_12-q5", 11, "next_question_only", "The whole page starts Question 6 and carries its WAN-driver scenario; Question 5 ends on page 10.", "9618_s25_qp_12-q6"),
    ("9618_w25_qp_11-q2", 7, "next_question_only", "The whole page is Question 3's logic-circuit/truth-table prompt, not Question 2.", "9618_w25_qp_11-q3"),
    ("9618_w25_qp_11-q5", 11, "next_question_only", "The whole page starts Question 6's processor-register prompt; Question 5 is on page 10.", "9618_w25_qp_11-q6"),
    ("9618_w25_qp_12-q7", 13, "next_question_only", "Question 8 starts on this page; Question 7's indexed parts finish on page 12.", "9618_w25_qp_12-q8"),
    ("9618_w25_qp_12-q9", 15, "next_question_only", "Question 10 starts on this page; Question 9's indexed parts are on page 14.", "9618_w25_qp_12-q10"),
    ("9618_w25_qp_13-q1", 3, "next_question_only", "The page begins Question 2; Question 1 is located on page 2.", "9618_w25_qp_13-q2"),
    ("9618_w25_qp_13-q3", 5, "next_question_only", "The page begins Question 4; Question 3's indexed parts are on page 4.", "9618_w25_qp_13-q4"),
    ("9618_w25_qp_13-q5", 9, "navigation_notice_only", "The page is otherwise a turn/page notice stating Question 6 starts on the next page; it is not Question 5 content or a continuation.", "9618_w25_qp_13-q6"),
]
issues = []
for n, (qid, page_no, classification, observation, next_qid) in enumerate(issue_specs, 1):
    root = next(r for r in roots if r["id"] == qid)
    cpath = CAND / root["context_ref_or_null"]
    ctx = jload(cpath)
    source_id = root["source_qp_id"]
    render = render_by_key[(source_id, page_no)]
    src = source_by_id[source_id]
    if page_no not in ctx["all_context_pages"] or page_no not in ctx["continuation_pages"]:
        raise SystemExit(f"Expected bad page not present in both page arrays: {qid} p{page_no}")
    evidence = next(e for e in ctx["source_evidence"] if e["pdf_page_1_based"] == page_no)
    issue = {
        "finding_id": f"A3-B25-CONTEXT-{n:02d}", "severity": "Major", "status": "OPEN_CHANGES_REQUIRED",
        "candidate_record_id": qid, "candidate_context_file": root["context_ref_or_null"],
        "candidate_context_file_sha256": sha(cpath), "candidate_root_locator": root["qp_locator"],
        "misassigned_pdf_page_1_based": page_no, "candidate_source_evidence_entry": evidence,
        "candidate_child_locator_pages": sorted({p["qp_locator"]["pdf_page_1_based"] for p in parts if p["question_id"] == qid}),
        "source_id": source_id, "source_pdf": src["path"], "source_pdf_sha256": src["sha256"],
        "source_render_path": render["render_path"], "source_render_sha256": render["render_sha256"],
        "source_classification": classification, "source_visual_observation": observation,
        "next_question_id_for_boundary": next_qid,
        "exact_candidate_fields_to_correct": ["all_context_pages", "continuation_pages", "source_evidence"],
        "correction": f"Remove PDF page {page_no} from these three fields in a new immutable A2 version. Keep the source page and QP locators unchanged. Do not move the page to another context unless the source itself supports that context.",
        "owner": "A2", "independent_retest_owner": "A3", "retest_gate": "A3 context retest plus A4 comparison; then A9 and A0 remain required",
        "gate_impact": "A3 cannot PASS while the wrong page is represented as this question's context/continuation; B25 batch remains gated.",
    }
    issues.append(issue)

valid_shared = {
    "question_id": "9618_s25_qp_11-q8", "page": 15,
    "classification": "legitimate_shared_scenario_context",
    "observation": "Full-size page 15 contains the processor question's memory/instruction state needed by its indexed work, although no child part locator is on that page. Preserve this page in Q8 context; do not apply a locator-only deletion rule.",
    "source_id": "9618_s25_qp_11",
}

matrix = []
issue_lookup = {(x["candidate_record_id"], x["misassigned_pdf_page_1_based"]): x for x in issues}
for cpath in context_files:
    ctx = jload(cpath)
    root = next(r for r in roots if r["id"] == ctx["question_id"])
    child_rows = [p for p in parts if p["question_id"] == ctx["question_id"]]
    loc_pages = sorted({root["qp_locator"]["pdf_page_1_based"], *(p["qp_locator"]["pdf_page_1_based"] for p in child_rows)})
    page_rows = []
    for pno in ctx["all_context_pages"]:
        issue = issue_lookup.get((ctx["question_id"], pno))
        is_valid_shared = valid_shared["question_id"] == ctx["question_id"] and valid_shared["page"] == pno
        page_rows.append({
            "pdf_page_1_based": pno,
            "same_question_root_or_child_locator_on_page": pno in loc_pages,
            "classification": issue["source_classification"] if issue else ("legitimate_shared_scenario_context" if is_valid_shared else "no_boundary_exception_flagged"),
            "finding_id": issue["finding_id"] if issue else None,
        })
    matrix.append({
        "question_id": ctx["question_id"], "context_file": root["context_ref_or_null"],
        "context_file_sha256": sha(cpath), "question_start_page": ctx["question_start_page"],
        "all_context_pages": ctx["all_context_pages"], "continuation_pages": ctx["continuation_pages"],
        "root_locator_page": root["qp_locator"]["pdf_page_1_based"], "child_locator_pages": sorted({p["qp_locator"]["pdf_page_1_based"] for p in child_rows}),
        "same_question_locator_page_union": loc_pages, "unlocated_context_pages": sorted(set(ctx["all_context_pages"]) - set(loc_pages)),
        "source_evidence_pages": [e["pdf_page_1_based"] for e in ctx["source_evidence"]],
        "review_method": "All 12 candidate contact sheets visually screened (all 178 PDF pages); all context arrays structurally reconciled against root/child QP locator pages; full-size review performed for all unlocated pages and risk-selected boundaries/continuations, with direct source render hashes in SOURCE_RENDER_EVIDENCE_V1.json.",
        "page_review": page_rows,
    })

inputs = [
    pin("A3 work order", DISPATCH, PINNED["dispatch"]),
    pin("A3 dispatch record", DISPATCH_RECORD, PINNED["dispatch_record"]),
    {"name": "B25-A2-v1 parent handoff", "path": CAND.relative_to(ROOT).as_posix(), "sha256": PINNED["candidate_handoff"], "verification": "Pinned handoff identity as named by the frozen A3 dispatch; packet snapshot and all 438 files recomputed below."},
    pin("B25-A2-v1 batch manifest", CAND / "BATCH_MANIFEST.json", PINNED["candidate_batch_manifest"]),
    pin("B25-A2-v1 snapshot manifest", CAND / "SNAPSHOT_MANIFEST.json", PINNED["candidate_snapshot_manifest"]),
    pin("A0 candidate audit", A0_AUDIT, PINNED["a0_candidate_audit"]),
    pin("Stage 0 source manifest", STAGE0_MANIFEST, PINNED["stage0_source_manifest"]),
    pin("Official 2026 syllabus PDF", SYLLABUS_PDF, PINNED["syllabus_pdf_2026"]),
    pin("Stage 0 syllabus scope", SCOPE_MD, PINNED["syllabus_scope"]),
    pin("Stage 0 pilot scope check", PILOT_MD, PINNED["pilot_scope_check"]),
    pin("Stage 1 corpus schema", SCHEMA, PINNED["schema"]),
    pin("Stage 1 extraction policy", POLICY, PINNED["extraction_policy"]),
]

pin_report = {
    "artifact_version": "B25-A3-REVIEW-v1", "dispatch_id": "P1-S1-A3-B25-REVIEW-V1", "status": "PINS_VERIFIED",
    "inputs": inputs, "candidate_snapshot": {"expected_file_count": 438, "actual_file_count": len(snapshot_checks), "all_hashes_and_byte_counts_match": True, "checked_files": snapshot_checks},
    "sources": source_checks, "source_total_pages": 178,
    "scope_authority": "2026 Cambridge syllabus 9618, sections 1-8 for Paper 1; no 2027-2029 inheritance.",
}
jdump(OUT / "PINNED_INPUTS_V1.json", pin_report)
jdump(OUT / "CONTEXT_AUDIT_MATRIX_V1.json", {
    "artifact_version": "B25-A3-REVIEW-v1", "context_files_checked": len(matrix), "pages_structurally_reconciled": sum(len(x["all_context_pages"]) for x in matrix),
    "unlocated_context_page_count": sum(len(x["unlocated_context_pages"]) for x in matrix), "rows": matrix,
})
jdump(OUT / "CONTEXT_SCOPE_FINDINGS_V1.json", {
    "artifact_version": "B25-A3-REVIEW-v1", "candidate": "B25-A2-v1", "recommendation": "CHANGES_REQUIRED",
    "critical_findings": 0, "major_findings": len(issues), "minor_findings": 0,
    "findings": issues,
    "valid_unlocated_context_retained": valid_shared,
    "scope_conclusion": "No observed out-of-scope standalone objective. The historical 2025 items remain retained. This review does not establish 2026 syllabus coverage, frequency, teaching coverage, question correctness, final taxonomy, or translation quality.",
})

scope_flags = {
    "artifact_version": "B25-A3-REVIEW-v1", "authority": {"syllabus": "Cambridge 9618 2026 syllabus v2", "sha256": PINNED["syllabus_pdf_2026"], "paper1_sections": "1-8", "scope_document_sha256": PINNED["syllabus_scope"]},
    "observed_candidate_scope": "2025 official 9618 Paper 1 variants 11, 12 and 13; all 51 roots retained as historical evidence.",
    "out_of_scope_flags": [],
    "review_flags": [
        {"id": "SF-01", "status": "observation_only", "question_id": "9618_w25_qp_11-q10", "observation": "The prompt uses a 3D printer as an application context (model printing and buffer). Treat it as a question context, not a standalone 2026 syllabus objective; map only the assessed knowledge if this source is adapted for learning content.", "authority_note": "The 2026 scope authority is sections 1-8; this review does not certify a question-to-objective coverage map."},
        {"id": "SF-02", "status": "historical_evidence_only", "observation": "Paper identity/year and a topic appearing in a 2025 question do not establish 2026 syllabus coverage or frequency.", "authority_note": "Stage 0 SYLLABUS_SCOPE.md explicitly separates required objectives, supporting explanation and out-of-scope material; no coverage claim is made here."},
    ],
    "reviewed_scope_documents": [
        {"path": SCOPE_MD.relative_to(ROOT).as_posix(), "sha256": PINNED["syllabus_scope"]},
        {"path": PILOT_MD.relative_to(ROOT).as_posix(), "sha256": PINNED["pilot_scope_check"]},
        {"path": SYLLABUS_PDF.relative_to(ROOT).as_posix(), "sha256": PINNED["syllabus_pdf_2026"]},
    ],
    "limitations": ["No objective-level mapping or frequency estimate is produced.", "No 2027-2029 scope is imported.", "This is not lesson coverage or a claim that all question content is examinable in 2026."],
}
jdump(OUT / "SCOPE_FLAGS_V1.json", scope_flags)

source_risk_md = f"""# B25 A3 source-risk review v1

Status: **CHANGES_REQUIRED for A3 context gate only.** Candidate: `B25-A2-v1`. Candidate extraction, source PDFs, tracker and app were not edited.

## Source and render integrity

The frozen Stage 0 source manifest SHA256 is `{PINNED['stage0_source_manifest']}` and the 2026 syllabus PDF SHA256 is `{PINNED['syllabus_pdf_2026']}`. All 12 original 2025 QP/MS PDFs independently matched Stage 0 by SHA256 and page count (178 total pages). The candidate's 438 snapshot artifacts were rehashed and byte-count checked. The twelve candidate all-page contact sheets were screened, covering all 178 source pages. Direct 2x PyMuPDF renders were produced from the exact original PDFs for 77 risk-selected pages; each render and its source hash is listed in `SOURCE_RENDER_EVIDENCE_V1.json`.

The 77-page sample contains all six QP covers, all 11 preflight context pages lacking same-question root/child locators, question boundaries and multi-page continuations across all six QP variants, plus 13 MS pages spanning tables, logical expressions/truth tables, processor traces and marking rows across all six MS variants. Each of the 11 orphan context pages was classified at full size. Ten are false additions; `9618_s25_qp_11` PDF p15 in Q8 is legitimate shared processor-state context and is retained.

Structural locator reconciliation passed for all 51 root QP locators, 207 part QP locators, populated part MS locators and 183 marking-item MS locators: source IDs, question IDs, full part paths, target exclusivity and page ranges are consistent. This is distinct from semantic full-size review of every printed item.

## Independent count checks

The candidate index recomputes to 51 roots, 207 parts, 183 marking items, 178 page records and 144 visual regions. All 27 unmarked/null-MS parent labels have indexed children, no marking item attached directly to the parent, and explicit child MS locators; this supports their structural-parent interpretation without inferring an allocation. The six QP covers state 75 marks each; the independently summed explicit root/part marks are 75 for each variant.

The 11 populated `command_word_verbatim_or_null` values were checked against original QP pages and kept as verbatim short observations, not taxonomy labels. Structural source/question/full-part/page-range reconciliation passed for every QP/MS locator; no other locator consistency or mark-total discrepancy surfaced. This is not a full-size semantic transcription check and does not replace A4's independent extraction/visual review or A9's package review.

## Risk and limits

The main risk is repeatable question-boundary leakage: ten pages belonging only to a subsequent question or a page-turn notice are listed as continuation/context evidence for an earlier root across five QP variants. Downstream lesson assembly or retrieval could associate the wrong question with content. Exact records and render witnesses are in `CONTEXT_SCOPE_FINDINGS_V1.json`; A2 must correct a new immutable version and A3 must retest those rows.

Scope was reviewed against the pinned 2026 syllabus authority (Paper 1 sections 1-8) and Stage 0 scope decisions. No standalone out-of-scope objective was flagged. This review does not claim 2026 coverage, frequency, lesson coverage, question correctness, translation quality or final taxonomy. W25/11 Q10's 3D-printer prompt is noted as an application context only.

Visual review limits: this was an A3 risk-based full-size sample plus all-page contact-sheet screen, not a 178-page full-resolution inspection or a complete semantic proof of every QP/MS transcription. Copyright-sensitive prompt content is described only enough to locate findings; no source page was edited or published.
"""
(OUT / "SOURCE_RISK_REVIEW_V1.md").write_text(source_risk_md, encoding="utf-8")

finding_rows = "\n".join(
    f"| {i['finding_id']} | `{i['candidate_record_id']}` | p.{i['misassigned_pdf_page_1_based']} | {i['source_visual_observation']} | Major |"
    for i in issues
)
context_md = f"""# B25 A3 context and scope review v1

**A3 recommendation: CHANGES_REQUIRED.** This is an A3-only recommendation; A4, A9 and A0 gates remain open. Candidate `B25-A2-v1` is frozen and was not edited.

## Evidence reviewed

- Frozen dispatch, candidate handoff identity, candidate batch manifest and snapshot; all 438 snapshot files were rehashed and byte counts matched.
- Stage 0 source manifest, pinned 2026 syllabus PDF/scope, pilot scope check, Stage 1 schema and extraction policy.
- All 12 original official 2025 QP/MS PDFs: hashes and page counts match Stage 0 (178 pages total); all 12 candidate contact sheets were screened.
- All 51 context JSON records were structurally reconciled against root and child QP locator pages. The 11 context pages with no same-question root/child locator were individually rendered at 2x from their exact source and classified. One is legitimate shared context; ten are false inclusions.
- 77 direct source renders were inspected for boundary/context, command-word, cover-total and MS layout risks. Details, hashes and limits are in `SOURCE_RENDER_EVIDENCE_V1.json` and `SOURCE_RISK_REVIEW_V1.md`.

## Findings

The context records include 10 pages that the source shows belong only to the next question or to a page-turn notice. Each is listed below with the candidate root, PDF page, original source hash, render witness, exact context-file hash, owner and retest requirement in `CONTEXT_SCOPE_FINDINGS_V1.json`. Remove the listed page from that root's `all_context_pages`, `continuation_pages` and `source_evidence` in a new immutable A2 version. Do not alter original PDFs, marks, question locators or next-question content.

| Finding | Candidate question row | False page | Full-page observation | Severity |
|---|---|---:|---|---|
{finding_rows}

The full-size review also confirmed `9618_s25_qp_11-q8` page 15 is legitimate shared processor-state context even though no indexed child locator is on that page. Retain it. This positive control matters: page removal must be source-semantic, not based only on locator inequality.

## Supporting checks and scope limits

Recomputed counts: 51 roots, 207 parts, 183 marking items, 144 visual regions and 178 source pages. Independently summed explicit indexed marks and the six source cover totals agree at 75 for all six QP variants. The 27 parents with null marks and null MS locators have children, zero direct parent marking items and MS locators on every child; no mark allocation was inferred.

The populated command-word observations were checked against the original QP pages and kept as verbatim short observations, not taxonomy labels. The candidate's 2025 Paper 1 question set was reviewed against the pinned 2026 syllabus boundary of sections 1-8. No standalone out-of-scope objective was flagged; the review makes no objective-coverage, frequency, teaching-coverage, question-correctness, translation or final-taxonomy claim. W25/11 Q10's 3D printer is recorded as an application context, not a separate syllabus objective.

## Gate decision and retest

**CHANGES_REQUIRED — A3 context gate does not pass** until A2 publishes a new pinned candidate version that removes exactly the ten false page records and preserves the valid S25/11 Q8 page 15. A3 retest must re-open each corresponding original full page, verify all three context arrays, preserve question/part locators and source hashes, rerun counts/validator/snapshot checks, and confirm all six QP totals remain unchanged. Then A4, A9 and A0 remain mandatory. See `CONTEXT_SCOPE_FINDINGS_V1.json` for owner and per-finding criteria.
"""
(OUT / "CONTEXT_SCOPE_REVIEW_V1.md").write_text(context_md, encoding="utf-8")

counts = batch["record_counts"]
review_result = {
    "artifact_version": "B25-A3-REVIEW-v1", "task_id": "P1-S1-A3-B25-REVIEW-V1",
    "candidate_version": "B25-A2-v1", "candidate_handoff_sha256": PINNED["candidate_handoff"],
    "recommendation": "CHANGES_REQUIRED", "gate": "A3_ONLY", "gate_status": "A3_CONTEXT_GATE_FAIL_OPEN_CHANGES_REQUIRED",
    "independent_review": True, "candidate_edited": False, "source_files_edited": False, "app_or_tracker_edited": False,
    "reviewer": "A3 independent reviewer", "frozen_work_order_sha256": PINNED["dispatch"],
    "pins_verified": True, "candidate_snapshot_file_count": 438, "candidate_snapshot_all_files_match": True,
    "source_pdf_count": len(source_checks), "source_pdf_page_total": sum(x["page_count"] for x in source_checks), "source_hash_pagecount_matches": True,
    "contact_sheets_screened": 12, "all_source_pages_contact_sheet_screened": 178,
    "direct_source_fullsize_renders": len(render_checks), "context_files_checked": len(matrix),
    "context_unlocated_pages_checked_fullsize": 11, "confirmed_false_context_inclusions": 10,
    "confirmed_legitimate_unlocated_context_pages": 1,
    "counts_recomputed": {"question": len(roots), "part": len(parts), "marking_item": len(markings), "visual_region": len(visual.get("visual_regions", [])), "page": len(pages), "context": len(context_files)},
    "mark_total_checks": cover_checks, "parent_grouping_review": {"count": len(groups), "all_have_children": True, "no_parent_ms_allocation_inferred": True, "all_children_have_ms_locator": True, "rows": group_checks},
    "major_findings": [i["finding_id"] for i in issues], "critical_findings": [], "minor_findings": [],
    "scope_review": "2026 Paper 1 syllabus sections 1-8 authority used; no unsupported coverage/frequency claim; no standalone out-of-scope objective observed.",
    "open_gate_dependencies": ["A2 versioned correction and A3 retest", "A4 independent review", "A9 independent package review", "A0 acceptance decision"],
    "outputs_manifest": "OUTPUT_MANIFEST_V1.json", "output_manifest_sha256": None,
    "handoff_sha256_note": "SHA256 is written to HANDOFF_REVIEW_V1.sha256 after this JSON is frozen; the handoff does not include its own digest.",
}

# Initial handoff is written before the manifest. Output manifest excludes itself and the
# handoff/checksum to avoid a circular digest; the handoff pins the manifest digest.
jdump(OUT / "HANDOFF_REVIEW_V1.json", review_result)
output_paths = [
    OUT / "build_review_handoff.py", OUT / "render_review_pages.py", OUT / "PINNED_INPUTS_V1.json",
    OUT / "CONTEXT_AUDIT_MATRIX_V1.json", OUT / "CONTEXT_SCOPE_FINDINGS_V1.json", OUT / "LOCATOR_AUDIT_V1.json", OUT / "SCOPE_FLAGS_V1.json",
    OUT / "CONTEXT_SCOPE_REVIEW_V1.md", OUT / "SOURCE_RISK_REVIEW_V1.md", OUT / "SOURCE_RENDER_EVIDENCE_V1.json",
    *(OUT / x["render_path"] for x in render_manifest["pages"]),
]
output_manifest = {
    "artifact_version": "B25-A3-REVIEW-v1", "status": "FROZEN_REVIEW_EVIDENCE",
    "self_hash_exclusion": "This output manifest excludes itself, HANDOFF_REVIEW_V1.json and HANDOFF_REVIEW_V1.sha256; the handoff pins this manifest and all its listed output hashes.",
    "outputs": [{"path": p.relative_to(OUT).as_posix(), "byte_count": p.stat().st_size, "sha256": sha(p)} for p in sorted(set(output_paths))],
    "source_render_count": len(render_checks), "all_source_render_hashes_match": True,
}
jdump(OUT / "OUTPUT_MANIFEST_V1.json", output_manifest)
review_result["output_manifest_sha256"] = sha(OUT / "OUTPUT_MANIFEST_V1.json")
jdump(OUT / "HANDOFF_REVIEW_V1.json", review_result)
handoff_sha = sha(OUT / "HANDOFF_REVIEW_V1.json")
(OUT / "HANDOFF_REVIEW_V1.sha256").write_text(f"{handoff_sha}  HANDOFF_REVIEW_V1.json\n", encoding="ascii")

print(json.dumps({
    "recommendation": review_result["recommendation"], "context_files": len(matrix),
    "false_context_pages": len(issues), "valid_unlocated_context_pages": 1,
    "source_pdfs": len(source_checks), "source_pages": 178, "fullsize_renders": len(render_checks),
    "candidate_snapshot_files_verified": len(snapshot_checks), "output_manifest_sha256": review_result["output_manifest_sha256"],
    "handoff_sha256": handoff_sha,
}, indent=2))
