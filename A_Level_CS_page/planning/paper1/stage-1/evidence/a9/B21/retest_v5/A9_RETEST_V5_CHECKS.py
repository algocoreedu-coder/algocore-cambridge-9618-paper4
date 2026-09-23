from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path

from pypdf import PdfReader


ROOT = Path(__file__).resolve().parents[8]
EVIDENCE = ROOT / "A_Level_CS_page/planning/paper1/stage-1/evidence"
OUT = EVIDENCE / "a9/B21/retest_v5"
CAND = EVIDENCE / "a2/B21/versions/B21-A2-v5"
STAGE0 = ROOT / "A_Level_CS_page/planning/paper1/stage-0/evidence/a2/SOURCE_MANIFEST.json"


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def load_jsonl(path: Path):
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def record(checks, name, passed, evidence):
    checks.append({"id": name, "status": "PASS" if passed else "FAIL", "evidence": evidence})


checks = []
issues = []
source_manifest = load_json(STAGE0)
manifest_sources = {x["id"]: x for x in source_manifest["primary_sources"]}
paper_sources = [x for x in source_manifest["primary_sources"] if x["id"].startswith(("9618_s21_", "9618_w21_"))]

# Verify direct dispatch/version authority and retained independent reviews.
pin_paths = {
    "dispatch_work_order": (EVIDENCE / "a0/B21_A9_V5_RETEST_DISPATCH.md", "024e83cdad53ff000236e2583eb9c7deda17275bbbe70fd31b724e5f3ad6ad68"),
    "dispatch_record": (EVIDENCE / "a0/B21_A9_V5_RETEST_DISPATCH_RECORD.json", None),
    "candidate_handoff": (CAND / "HANDOFF_CHECK.json", "d358cf79cc408cea36256a0a4f67be03b045b23ac59bd593dbb61c4c968014f2"),
    "candidate_batch_manifest": (CAND / "BATCH_MANIFEST.json", "61d26d27e51727ecfa7d1517149e78716e6323cb236a122423979347eaedafc7"),
    "candidate_snapshot_manifest": (CAND / "SNAPSHOT_MANIFEST.json", "63465d49de20bfeefd2151254126640679b60ceb7964ee6391b727f2a3b48581"),
    "candidate_a0_audit": (EVIDENCE / "a0/B21_A2_V5_A0_AUDIT.json", "6a68292017550ef9b5cb78a84071d1d46a5dd1ddcc7a740871167359d9e6a9e8"),
    "candidate_validator": (EVIDENCE / "a0/B21_A2_V5_A0_VALIDATE.json", "a89c4b2ad2a9b223a3575d00441d366f8ce7ac8b92ce20840f82ef7036929054"),
    "a3_handoff": (EVIDENCE / "a3/B21/retest_v5/HANDOFF_RETEST_V5.json", "f490f55cb686c2b4393caa40a80f3da38ae24dc3bf9443c5ae0a04a71c5b23e5"),
    "a3_a0_audit": (EVIDENCE / "a0/B21_A3_V5_HANDOFF_AUDIT.json", "1c554facc4e4af58fac0fce98fd2130b80396f1d3d046e300fa32bffcd5e3c24"),
    "a4_handoff": (EVIDENCE / "a4/B21/retest_v5/HANDOFF_RETEST_V5.json", "55fe2d6b5bc6dc9e9a6e4f3ec049dae11da323ff0c31c1671198fd092f9fd365"),
    "a4_a0_audit": (EVIDENCE / "a0/B21_A4_V5_HANDOFF_AUDIT.json", "84fae5c592ade69dc0253c0ed60df543742d6794d4bb9d60eddd44dc7f31b7db"),
    "prior_a9_review": (EVIDENCE / "a9/B21/BATCH_REVIEW.md", "0604695e57500e5b945beeffa952706a8638752f256db406037e853b4b926ab7"),
    "prior_a9_findings": (EVIDENCE / "a9/B21/FINDINGS.md", "f514e1a7e40ed0c359dbaca2262969788fa4d060772ac0324234f032ee28c6b6"),
    "stage0_source_manifest": (STAGE0, "195a68ad98b4739dff0d3496dc93ba9e85d67d2dae0d88e3d4e4a088f1259c9c"),
    "corpus_schema": (ROOT / "A_Level_CS_page/planning/paper1/stage-1/CORPUS_SCHEMA.md", "9fe71d4719b0c8f9fd6d6fd6fb0316c7f9a840b6b964634889ea6d98245a1f1f"),
    "extraction_policy": (ROOT / "A_Level_CS_page/planning/paper1/stage-1/EXTRACTION_POLICY.md", "97bd6c69ea8d459ea99713e943c2d092a88999b6df7cb315d2820547789c11f2"),
}
pin_results = {}
for name, (path, expected) in pin_paths.items():
    actual = sha(path) if path.is_file() else None
    pin_results[name] = {"path": path.relative_to(ROOT).as_posix(), "exists": path.is_file(), "expected_sha256": expected, "actual_sha256": actual, "match": (actual == expected if expected else path.is_file())}
record(checks, "A9-01-frozen-pins", all(x["match"] for x in pin_results.values()), pin_results)

dispatch = load_json(pin_paths["dispatch_record"][0])
candidate_handoff = load_json(CAND / "HANDOFF_CHECK.json")
snapshot = load_json(CAND / "SNAPSHOT_MANIFEST.json")

# Re-hash every frozen candidate output, not only the spot-check targets.
snapshot_errors = []
for item in snapshot["files"]:
    p = CAND / item["path"]
    if not p.is_file() or p.stat().st_size != item["bytes"] or sha(p) != item["sha256"]:
        snapshot_errors.append(item["path"])
declared_errors = []
for item in candidate_handoff["declared_output_hashes"]:
    p = CAND / item["path"]
    if not p.is_file() or p.stat().st_size != item["bytes"] or sha(p) != item["sha256"]:
        declared_errors.append(item["path"])
record(checks, "A9-02-candidate-all-hashes", not snapshot_errors and not declared_errors and len(snapshot["files"]) == 310 and len(candidate_handoff["declared_output_hashes"]) == 309,
       {"snapshot_file_count": len(snapshot["files"]), "snapshot_errors": snapshot_errors, "handoff_declared_count": len(candidate_handoff["declared_output_hashes"]), "handoff_errors": declared_errors})

# Re-hash specialist output inventories and verify their audited status.
specialist_checks = {}
for role, handoff_rel, audit_rel, expected_handoff, expected_audit, expected_outputs in [
    ("A3", "a3/B21/retest_v5/HANDOFF_RETEST_V5.json", "a0/B21_A3_V5_HANDOFF_AUDIT.json", pin_paths["a3_handoff"][1], pin_paths["a3_a0_audit"][1], 49),
    ("A4", "a4/B21/retest_v5/HANDOFF_RETEST_V5.json", "a0/B21_A4_V5_HANDOFF_AUDIT.json", pin_paths["a4_handoff"][1], pin_paths["a4_a0_audit"][1], 53),
]:
    hpath, apath = EVIDENCE / handoff_rel, EVIDENCE / audit_rel
    h, a = load_json(hpath), load_json(apath)
    entries = h["output_files_excluding_this_handoff_and_checksum"] if role == "A3" else h["output_files_excluding_handoff_and_checksum"]
    errors = []
    for item in entries:
        p = ROOT / item["path"]
        if not p.is_file() or p.stat().st_size != item["bytes"] or sha(p) != item["sha256"]:
            errors.append(item["path"])
    specialist_checks[role] = {"handoff_sha256": sha(hpath), "handoff_pin_match": sha(hpath) == expected_handoff,
                               "a0_audit_sha256": sha(apath), "a0_audit_pin_match": sha(apath) == expected_audit,
                               "audit_status": a.get("audit_status"), "recommendation": h.get("recommendation"),
                               "declared_output_count": len(entries), "expected_output_count": expected_outputs, "output_hash_errors": errors}
record(checks, "A9-03-specialist-handoffs", all(v["handoff_pin_match"] and v["a0_audit_pin_match"] and v["audit_status"] == "PASS" and v["declared_output_count"] == v["expected_output_count"] and not v["output_hash_errors"] for v in specialist_checks.values()), specialist_checks)

# Verify all 12 B21 PDF hashes and page counts directly from Stage 0 authority.
source_checks = []
for entry in paper_sources:
    p = ROOT / entry["path"]
    actual_hash = sha(p) if p.is_file() else None
    pages = len(PdfReader(str(p)).pages) if p.is_file() else None
    source_checks.append({"source_id": entry["id"], "path": entry["path"], "expected_sha256": entry["sha256"], "actual_sha256": actual_hash,
                          "expected_page_count": entry["page_count"], "actual_page_count": pages,
                          "hash_match": actual_hash == entry["sha256"], "page_count_match": pages == entry["page_count"]})
record(checks, "A9-04-source-pdf-integrity", len(source_checks) == 12 and all(x["hash_match"] and x["page_count_match"] for x in source_checks),
       {"source_pdf_count": len(source_checks), "source_pages_total": sum(x["actual_page_count"] or 0 for x in source_checks), "sources": source_checks})

pages = load_jsonl(CAND / "PAGE_INDEX.jsonl")
questions = load_jsonl(CAND / "QUESTION_INDEX.jsonl")
markings = load_jsonl(CAND / "MARKING_INDEX.jsonl")
contexts = load_jsonl(CAND / "CONTEXT_INDEX.jsonl")
visual = load_json(CAND / "VISUAL_MANIFEST.json")["regions"]
pages_by_key = {(x["source_id"], x["pdf_page_1_based"]): x for x in pages}
questions_by_id = {x["id"]: x for x in questions}
markings_by_id = {x["id"]: x for x in markings}
visual_by_id = {x["id"]: x for x in visual}

# Source-backed exact risk targets from the frozen A9 VIS-01 finding.
ms_page_targets = {
    ("9618_s21_ms_11", 4): ["9618_s21_qp_11-q2-pa-mi-1"],
    ("9618_s21_ms_11", 5): ["9618_s21_qp_11-q3-pb-mi-1"],
    ("9618_s21_ms_11", 6): ["9618_s21_qp_11-q3-pc-pi-mi-1"],
    ("9618_s21_ms_12", 5): ["9618_s21_qp_12-q3-pa-mi-1", "9618_s21_qp_12-q3-pb-mi-1"],
    ("9618_s21_ms_13", 4): ["9618_s21_qp_13-q2-pa-mi-1"],
    ("9618_s21_ms_13", 5): ["9618_s21_qp_13-q3-pb-mi-1"],
    ("9618_s21_ms_13", 6): ["9618_s21_qp_13-q3-pc-pi-mi-1"],
    ("9618_w21_ms_11", 3): ["9618_w21_qp_11-q1-pa-mi-1"],
    ("9618_w21_ms_11", 8): ["9618_w21_qp_11-q6-pb-mi-1"],
    ("9618_w21_ms_12", 8): ["9618_w21_qp_12-q7-pa-mi-1"],
    ("9618_w21_ms_13", 3): ["9618_w21_qp_13-q1-pa-mi-1"],
    ("9618_w21_ms_13", 8): ["9618_w21_qp_13-q6-pb-mi-1"],
}
qp_targets = {
    ("9618_s21_qp_12", 2): ["9618_s21_qp_12-q1-pa"],
    ("9618_w21_qp_12", 2): ["9618_w21_qp_12-q1"],
    ("9618_w21_qp_12", 6): ["9618_w21_qp_12-q4"],
    ("9618_w21_qp_12", 12): ["9618_w21_qp_12-q7-pa"],
}
region_errors = []
target_regions = []
for key, ids in {**ms_page_targets, **qp_targets}.items():
    source_id, pdf_page = key
    matches = [r for r in visual if r["source_id"] == source_id and r["pdf_page_1_based"] == pdf_page]
    if len(matches) != 1:
        region_errors.append({"source_id": source_id, "pdf_page_1_based": pdf_page, "error": f"expected one region, found {len(matches)}"})
        continue
    r = matches[0]
    asset = CAND / r["rendered_asset_ref"]
    for rel_id in ids:
        if rel_id not in r["relates_to_ids"]:
            region_errors.append({"source_id": source_id, "pdf_page_1_based": pdf_page, "error": f"region missing relates_to {rel_id}"})
        if rel_id in markings_by_id and r["id"] not in markings_by_id[rel_id]["visual_dependency_refs"]:
            region_errors.append({"source_id": source_id, "pdf_page_1_based": pdf_page, "error": f"marking row {rel_id} missing dependency {r['id']}"})
    page_entry = pages_by_key.get(key)
    if page_entry is None:
        region_errors.append({"source_id": source_id, "pdf_page_1_based": pdf_page, "error": "missing PAGE_INDEX row"})
    target_regions.append({"source_id": source_id, "pdf_page_1_based": pdf_page, "region_id": r["id"], "kind": r["kind"],
                           "relates_to_ids": r["relates_to_ids"], "reviewer_status": r["reviewer_status"],
                           "asset_path": r["rendered_asset_ref"], "asset_exists": asset.is_file(), "candidate_asset_sha256": sha(asset) if asset.is_file() else None,
                           "expected_ids": ids})
    if not asset.is_file():
        region_errors.append({"source_id": source_id, "pdf_page_1_based": pdf_page, "error": "missing region asset"})
record(checks, "A9-05-visual-targets", len(target_regions) == 16 and not region_errors, {"target_page_count": len(target_regions), "ms_page_count": len(ms_page_targets), "ms_item_id_count": sum(map(len, ms_page_targets.values())), "qp_page_count": len(qp_targets), "errors": region_errors, "regions": target_regions})

# Whole-corpus schema and cross-reference checks.
crossref_errors = []
if len(pages) != 154 or len({(x["source_id"], x["pdf_page_1_based"]) for x in pages}) != 154:
    crossref_errors.append("PAGE_INDEX does not contain 154 unique source/page rows")
for p in pages:
    if p["source_id"] not in manifest_sources or p["pdf_page_1_based"] > manifest_sources[p["source_id"]]["page_count"]:
        crossref_errors.append(f"PAGE_INDEX page outside Stage 0 source: {p['source_id']} p{p['pdf_page_1_based']}")
    tref = p["transcript_ref_or_null"]
    if tref and not (CAND / tref).is_file():
        crossref_errors.append(f"missing PAGE_INDEX transcript: {p['source_id']} p{p['pdf_page_1_based']}")
if len(questions_by_id) != len(questions) or len(markings_by_id) != len(markings) or len(visual_by_id) != len(visual):
    crossref_errors.append("duplicate question, marking, or visual ID")
for q in questions:
    loc = q["qp_locator"]
    q_source = q.get("source_qp_id") or loc["source_id"]
    if q_source != loc["source_id"] or (loc["source_id"], loc["pdf_page_1_based"]) not in pages_by_key:
        crossref_errors.append(f"bad QP locator/page ref: {q['id']}")
    if q["prompt_transcript_ref"] and not (CAND / q["prompt_transcript_ref"]).is_file():
        crossref_errors.append(f"missing prompt transcript: {q['id']}")
    if "source_qp_id" in q:
        parent = q.get("parent_id_or_null")
        if parent and (parent not in questions_by_id or questions_by_id[parent].get("source_qp_id", questions_by_id[parent]["qp_locator"]["source_id"]) != q_source):
            crossref_errors.append(f"bad root parent ref/source: {q['id']}")
        cref = q.get("context_ref_or_null")
        if cref and not (CAND / cref).is_file():
            crossref_errors.append(f"missing context file: {q['id']}")
    else:
        root_id = q["question_id"]
        if root_id not in questions_by_id or "source_qp_id" not in questions_by_id[root_id] or questions_by_id[root_id]["source_qp_id"] != q_source:
            crossref_errors.append(f"bad part question/root ref: {q['id']}")
        parent_part = q.get("parent_part_id_or_null")
        if parent_part and (parent_part not in questions_by_id or questions_by_id[parent_part].get("question_id") != root_id):
            crossref_errors.append(f"bad nested part ref: {q['id']}")
        for dep in q.get("dependency_refs", []):
            if dep in questions_by_id:
                continue
            if dep.startswith("contexts/") and (CAND / dep).is_file():
                continue
            crossref_errors.append(f"unresolved part dependency: {q['id']} -> {dep}")
for m in markings:
    loc = m["ms_locator"]
    if (loc["source_id"], loc["pdf_page_1_based"]) not in pages_by_key:
        crossref_errors.append(f"bad MS locator/page ref: {m['id']}")
    if not (CAND / m["transcript_ref"]).is_file():
        crossref_errors.append(f"missing MS transcript: {m['id']}")
    targets = [m["part_id_or_null"], m["question_id_or_null"]]
    if sum(x is not None for x in targets) != 1:
        crossref_errors.append(f"target cardinality not one: {m['id']}")
    target = targets[0] if targets[0] is not None else targets[1]
    if target not in questions_by_id:
        crossref_errors.append(f"target not in QUESTION_INDEX: {m['id']} -> {target}")
    for dep in m["visual_dependency_refs"]:
        if dep not in visual_by_id:
            crossref_errors.append(f"unresolved visual dep: {m['id']} -> {dep}")
        elif (visual_by_id[dep]["source_id"], visual_by_id[dep]["pdf_page_1_based"]) != (loc["source_id"], loc["pdf_page_1_based"]):
            crossref_errors.append(f"visual dep source/page mismatch: {m['id']} -> {dep}")
for r in visual:
    if r["page_ref"] != {"source_id": r["source_id"], "pdf_page_1_based": r["pdf_page_1_based"]}:
        crossref_errors.append(f"visual page_ref mismatch: {r['id']}")
    if (r["source_id"], r["pdf_page_1_based"]) not in pages_by_key:
        crossref_errors.append(f"visual has no PAGE_INDEX page: {r['id']}")
    if not (CAND / r["rendered_asset_ref"]).is_file():
        crossref_errors.append(f"visual asset missing: {r['id']}")
    for rel_id in r["relates_to_ids"]:
        if rel_id not in questions_by_id and rel_id not in markings_by_id:
            crossref_errors.append(f"visual relation target missing: {r['id']} -> {rel_id}")
for ctx in contexts:
    if ctx["question_id"] not in questions_by_id or "source_qp_id" not in questions_by_id[ctx["question_id"]]:
        crossref_errors.append(f"context root missing: {ctx['question_id']}")
    if ctx["all_context_pages"] != sorted(set([ctx["question_start_page"], *ctx["continuation_pages"]])):
        crossref_errors.append(f"context page lists inconsistent: {ctx['question_id']}")
    for ev in ctx["source_evidence"]:
        if ev["source_id"] != ctx["source_qp_id"] or ev["pdf_page_1_based"] not in ctx["all_context_pages"] or (ev["source_id"], ev["pdf_page_1_based"]) not in pages_by_key:
            crossref_errors.append(f"context evidence source/page mismatch: {ctx['question_id']}")
record(checks, "A9-06-schema-crossrefs", not crossref_errors, {"page_rows": len(pages), "question_rows": len(questions), "marking_rows": len(markings), "visual_regions": len(visual), "errors": crossref_errors})

# Preserve all 34 deliberately unresolved parent-context rows exactly as null allocations.
unresolved = [m for m in markings if m["link_type"] == "PARENT_CONTEXT_ONLY"]
unresolved_errors = [m["id"] for m in unresolved if m["status"] != "UNRESOLVED" or m["mark_or_condition_or_null"] is not None or m["table_row_ref_or_null"] is not None]
record(checks, "A9-07-unresolved-preservation", len(unresolved) == 34 and not unresolved_errors,
       {"parent_context_only_count": len(unresolved), "unresolved_status_count": sum(m["status"] == "UNRESOLVED" for m in unresolved), "allocation_errors": unresolved_errors})

# Verify the Q1 correction against direct original PDFs and candidate rows.
q1_id = "9618_w21_qp_12-q1"
q1 = questions_by_id[q1_id]
children = [q for q in questions if q.get("question_id") == q1_id or q.get("parent_id_or_null") == q1_id]
q1_mi = [m for m in markings if m["id"] == "9618_w21_qp_12-q1-mi-1"]
qp12 = ROOT / manifest_sources["9618_w21_qp_12"]["path"]
ms12 = ROOT / manifest_sources["9618_w21_ms_12"]["path"]
qp_text = PdfReader(str(qp12)).pages[1].extract_text() or ""
ms_text = PdfReader(str(ms12)).pages[2].extract_text() or ""
q1_mi_ok = len(q1_mi) == 1 and q1_mi[0]["question_id_or_null"] == q1_id and q1_mi[0]["part_id_or_null"] is None and q1_mi[0]["ms_locator"] == {"source_id": "9618_w21_ms_12", "pdf_page_1_based": 3, "question": "1"}
q1_mi_ok = q1_mi_ok and "3 correct lines only from Data Security" in q1_mi[0]["mark_or_condition_or_null"] and "2 correct lines only from Data Integrity" in q1_mi[0]["mark_or_condition_or_null"] if q1_mi else False
record(checks, "A9-08-S1-I16-Q1-correction", q1["marks_displayed_or_null"] == 2 and not children and q1_mi_ok and "[2]" in qp_text and "3 correct lines only from Data Security" in ms_text and "2 correct lines only from Data Integrity" in ms_text,
       {"root_id": q1_id, "root_mark": q1["marks_displayed_or_null"], "synthetic_children": [x["id"] for x in children], "exact_whole_question_ms_row": q1_mi[0] if q1_mi else None,
        "qp_p2_text_contains_mark_2": "[2]" in qp_text, "ms_p3_text_excerpt": [x for x in ms_text.splitlines() if "Question 1" in x or "Data Security" in x or "Data Integrity" in x]})

# Independently sum all indexed displayed marks and inspect source covers.
total_checks = []
for src in sorted(x["id"] for x in paper_sources if x["id"].endswith("qp_11") or x["id"].endswith("qp_12") or x["id"].endswith("qp_13")):
    rows = [q for q in questions if q.get("source_qp_id", q["qp_locator"]["source_id"]) == src and q["marks_displayed_or_null"] is not None]
    total = sum(q["marks_displayed_or_null"] for q in rows)
    p = ROOT / manifest_sources[src]["path"]
    cover_text = PdfReader(str(p)).pages[0].extract_text() or ""
    printed = 75 if re.search(r"(?<!\d)75(?!\d)", cover_text) else None
    total_checks.append({"source_id": src, "indexed_nonnull_mark_rows": len(rows), "indexed_sum": total, "cover_pdf_page": 1, "cover_extracted_total_75_present": printed == 75, "cover_text_excerpt": cover_text[:600]})
record(checks, "A9-09-six-displayed-mark-sums", len(total_checks) == 6 and all(x["indexed_sum"] == 75 and x["cover_extracted_total_75_present"] for x in total_checks), total_checks)

# Inspect 12 Q7/Q8 context roots and detect false page membership against direct source text.
context_records = load_jsonl(CAND / "CONTEXT_INDEX.jsonl")
context_by_q = {x["question_id"]: x for x in context_records}
q7q8_roots = [q for q in questions if "source_qp_id" in q and q["parent_id_or_null"] is None and q["question_number"] in {"7", "8"}]
context_errors = []
false_context_refs = [
    {"question_id": "9618_s21_qp_12-q8", "source_id": "9618_s21_qp_12", "pdf_page_1_based": 15, "classification": "literal BLANK PAGE", "why_false": "Q8 is complete on p14; p15 contains only the printed BLANK PAGE notice."},
    {"question_id": "9618_s21_qp_12-q8", "source_id": "9618_s21_qp_12", "pdf_page_1_based": 16, "classification": "copyright/imprint matter", "why_false": "Q8 is complete on p14; p16 contains publisher/copyright notices and exam-series footer, not Q8."},
    {"question_id": "9618_w21_qp_11-q8", "source_id": "9618_w21_qp_11", "pdf_page_1_based": 16, "classification": "copyright/imprint matter", "why_false": "Q8 is complete on p15; p16 contains publisher/copyright notices, not Q8."},
    {"question_id": "9618_w21_qp_13-q8", "source_id": "9618_w21_qp_13", "pdf_page_1_based": 16, "classification": "copyright/imprint matter", "why_false": "Q8 is complete on p15; p16 contains publisher/copyright notices, not Q8."},
]
for q in q7q8_roots:
    ctx = context_by_q.get(q["id"])
    if not ctx or ctx["source_qp_id"] != q["source_qp_id"] or ctx["question_start_page"] != q["qp_locator"]["pdf_page_1_based"]:
        context_errors.append(f"missing/mismatched root context: {q['id']}")
    else:
        cfile = CAND / "contexts" / f"{q['id']}.json"
        cdata = load_json(cfile)
        if cdata != ctx:
            context_errors.append(f"CONTEXT_INDEX vs context JSON mismatch: {q['id']}")
for issue in false_context_refs:
    ctx = context_by_q[issue["question_id"]]
    page = issue["pdf_page_1_based"]
    if page not in ctx["continuation_pages"] or not any(x["pdf_page_1_based"] == page and x["source_id"] == issue["source_id"] for x in ctx["source_evidence"]):
        context_errors.append(f"declared false page ref not found as expected: {issue['question_id']} p{page}")
    pdf = ROOT / manifest_sources[issue["source_id"]]["path"]
    page_text = (PdfReader(str(pdf)).pages[page - 1].extract_text() or "").strip()
    if "8" in page_text and issue["classification"] == "literal BLANK PAGE":
        # The page label includes its printed page number; only the explicit notice matters.
        pass
    if issue["classification"] == "literal BLANK PAGE" and "BLANK PAGE" not in page_text:
        context_errors.append(f"blank-page evidence mismatch: {issue['source_id']} p{page}")
    if issue["classification"] == "copyright/imprint matter" and "Permission to reproduce" not in page_text:
        context_errors.append(f"copyright-page evidence mismatch: {issue['source_id']} p{page}")
for q in q7q8_roots:
    q["context_reviewed"] = True
record(checks, "A9-10-Q7-Q8-context", len(q7q8_roots) == 12 and not context_errors and not false_context_refs,
       {"root_count": len(q7q8_roots), "root_ids": [q["id"] for q in q7q8_roots], "cross_reference_errors": context_errors,
        "false_context_references": false_context_refs, "finding": "A9-B21-CTX-01"})
issues.append({
    "id": "A9-B21-CTX-01",
    "severity": "MAJOR",
    "status": "OPEN_BLOCKING",
    "owner": "A2-B21 via A0",
    "title": "Q8 context evidence includes non-question pages",
    "summary": "Three Q8 root context records claim four pages after or outside the actual question as continuation/source evidence. The source PDFs show Q8 is complete before those pages; one is explicitly BLANK PAGE and three are copyright/imprint pages. This makes the indexed context locators inaccurate.",
    "affected_records": [
        {"question_id": "9618_s21_qp_12-q8", "candidate_context_file": "contexts/9618_s21_qp_12-q8.json", "actual_q8_pages": [14], "false_pages": [15, 16]},
        {"question_id": "9618_w21_qp_11-q8", "candidate_context_file": "contexts/9618_w21_qp_11-q8.json", "actual_q8_pages": [15], "false_pages": [16]},
        {"question_id": "9618_w21_qp_13-q8", "candidate_context_file": "contexts/9618_w21_qp_13-q8.json", "actual_q8_pages": [15], "false_pages": [16]},
    ],
    "false_page_evidence": false_context_refs,
    "required_correction": "Remove the non-question pages from continuation_pages, all_context_pages, and source_evidence; retain only source pages that contain the question. Regenerate the affected context records and any derived indexes/manifests in a new immutable candidate version.",
    "retest_required": ["A0 candidate integrity/schema audit", "A3 same-version context/source retest", "A4 same-version corpus/source retest", "A9 independent exact-version retest"],
    "evidence": "Direct full-size renders generated from the Stage 0 hash-verified originals are in full_renders/; hashes and source/page pins are in SOURCE_RENDER_MANIFEST_V5.json. All 154 pages also appear in the 12 reduced-scale contact sheets.",
})

# Validate source rendering manifest and every fresh contact sheet/full-size render.
render_manifest_path = OUT / "SOURCE_RENDER_MANIFEST_V5.json"
render_manifest = load_json(render_manifest_path)
render_errors = []
for src in render_manifest["source_checks"]:
    if not src["sha256_match"] or not src["page_count_match"]:
        render_errors.append(f"source mismatch in render manifest: {src['source_id']}")
for sheet in render_manifest["contact_sheets"]:
    p = OUT / sheet["path"]
    if not p.is_file() or sha(p) != sheet["sha256"]:
        render_errors.append(f"contact-sheet mismatch: {sheet['path']}")
    for thumb, expected in zip(sheet["thumbnail_paths"], sheet["thumbnail_sha256"]):
        if not (OUT / thumb).is_file() or sha(OUT / thumb) != expected:
            render_errors.append(f"thumbnail mismatch: {thumb}")
for render in render_manifest["full_size_target_renders"]:
    p = OUT / render["path"]
    if not p.is_file() or sha(p) != render["render_sha256"]:
        render_errors.append(f"full render mismatch: {render['path']}")
record(checks, "A9-11-independent-render-evidence", not render_errors and len(render_manifest["contact_sheets"]) == 12 and render_manifest["contact_sheet_pages_total"] == 154 and len(render_manifest["full_size_target_renders"]) == 35,
       {"source_pdf_count": render_manifest["source_pdf_count"], "contact_sheets": len(render_manifest["contact_sheets"]), "contact_sheet_pages_total": render_manifest["contact_sheet_pages_total"],
        "full_size_render_count": len(render_manifest["full_size_target_renders"]), "render_hash_errors": render_errors})

result = {
    "schema_version": "1.0", "task_id": "P1-S1-A9-B21-RETEST-V5", "reviewed_candidate": "B21-A2-v5",
    "candidate_handoff_sha256": pin_paths["candidate_handoff"][1], "batch_manifest_sha256": pin_paths["candidate_batch_manifest"][1],
    "snapshot_manifest_sha256": pin_paths["candidate_snapshot_manifest"][1], "recommendation": "CHANGES_REQUIRED",
    "batch_acceptance_claimed": False, "checks": checks, "blocking_findings": issues,
    "known_nonblocking_limit": "Historic S1-I14 provenance limitation remains open and non-blocking; this review does not recover the A4-v2 digest.",
    "remote_authenticity_limit": "Local source PDF hashes match Stage 0; remote Cambridge publisher authenticity was not independently checked.",
}
(OUT / "INTEGRITY_AND_CROSSREF_CHECKS_V5.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps({"checks": [{"id": c["id"], "status": c["status"]} for c in checks], "candidate_snapshot_files": len(snapshot["files"]), "source_pdfs": len(source_checks), "source_pages": sum(x["actual_page_count"] or 0 for x in source_checks), "out": str(OUT)}, ensure_ascii=False, indent=2))
