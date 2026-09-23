"""Independent B21-A2-v5 source, linkage, visual-risk and context checks.

Run from the Computer_Science workspace root. Writes only below evidence/a4/B21/retest_v5/.
"""
from __future__ import annotations

import hashlib
import json
import math
import re
import subprocess
from pathlib import Path

import pymupdf
from PIL import Image, ImageDraw, ImageFont
from pypdf import PdfReader

ROOT = Path.cwd()
PAPER = ROOT / "A_Level_CS_page/planning/paper1"
S1 = PAPER / "stage-1"
S0 = PAPER / "stage-0"
EVID = S1 / "evidence"
CAND = EVID / "a2/B21/versions/B21-A2-v5"
CAND4 = EVID / "a2/B21/versions/B21-A2-v4"
OUT = EVID / "a4/B21/retest_v5"
POPPLER = Path(r"C:/Users/Nguyen/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/Library/bin/pdftoppm.exe")

PINS = {
    "A4_DISPATCH": (EVID / "a0/B21_A4_V5_RETEST_DISPATCH.md", "952c2c4e2c434459dee0bbb3f6f8b9f0d89fadb7b7a6425566a665bd6eeda23d"),
    "A4_DISPATCH_RECORD": (EVID / "a0/B21_A4_V5_RETEST_DISPATCH_RECORD.json", "7f9ff8d1bd7382f91e9c85274013941bd906a3072e2bc0e89a5ec4d73e6e16ef"),
    "A3_V5_HANDOFF": (EVID / "a3/B21/retest_v5/HANDOFF_RETEST_V5.json", "f490f55cb686c2b4393caa40a80f3da38ae24dc3bf9443c5ae0a04a71c5b23e5"),
    "A3_V5_A0_AUDIT": (EVID / "a0/B21_A3_V5_HANDOFF_AUDIT.json", "1c554facc4e4af58fac0fce98fd2130b80396f1d3d046e300fa32bffcd5e3c24"),
    "A3_V5_REPORT": (EVID / "a3/B21/retest_v5/SOURCE_RISK_RETEST_V5.md", "f09a51ece1872174835e1e721ece17898336b5efefc12c3a6395e183a810a320"),
    "A3_V5_SCOPE_FLAGS": (EVID / "a3/B21/retest_v5/SCOPE_FLAGS_RETEST_V5.json", "f810f49148cc8601ca2d7aa788f90284b72b34256d9bea56f754482ef4df0c72"),
    "A2_DISPATCH": (EVID / "a0/B21_A2_V5_DISPATCH.md", "751ebb858754e8ee6eff6bec8ac3b33822bf0bd970be3cda6425aa7d04d743b1"),
    "A2_DISPATCH_RECORD": (EVID / "a0/B21_A2_V5_DISPATCH_RECORD.json", ""),
    "A2_HANDOFF": (CAND / "HANDOFF_CHECK.json", "d358cf79cc408cea36256a0a4f67be03b045b23ac59bd593dbb61c4c968014f2"),
    "A2_BATCH": (CAND / "BATCH_MANIFEST.json", "61d26d27e51727ecfa7d1517149e78716e6323cb236a122423979347eaedafc7"),
    "A2_SNAPSHOT": (CAND / "SNAPSHOT_MANIFEST.json", "63465d49de20bfeefd2151254126640679b60ceb7964ee6391b727f2a3b48581"),
    "A0_VALIDATOR": (EVID / "a0/B21_A2_V5_A0_VALIDATE.json", "a89c4b2ad2a9b223a3575d00441d366f8ce7ac8b92ce20840f82ef7036929054"),
    "A0_A2_AUDIT": (EVID / "a0/B21_A2_V5_A0_AUDIT.json", "6a68292017550ef9b5cb78a84071d1d46a5dd1ddcc7a740871167359d9e6a9e8"),
    "A2_V5_CORRECTION_ORDER": (EVID / "a0/B21_A2_V5_DISPATCH.md", "751ebb858754e8ee6eff6bec8ac3b33822bf0bd970be3cda6425aa7d04d743b1"),
    "A2_V4_HANDOFF": (CAND4 / "HANDOFF_CHECK.json", "a96fe020eb22b9336d9172c16855e200ae34b98e62f0337bb6c08a3659b2585f"),
    "A3_V4_REPORT": (EVID / "a3/B21/retest_v4/CONTEXT_SCOPE_RETEST_V4.md", "1d737e1afcf7c35fca45c83dc02dbf1c60e330d40129be72729ee28558505de8"),
    "A3_V4_FINDINGS": (EVID / "a3/B21/retest_v4/CONTEXT_SCOPE_FINDINGS_V4.json", "23bc0b56cfd7aa46519829005948e0cba8ea6da6ba1bd45ad0483c93afb9685c"),
    "A3_V4_HANDOFF": (EVID / "a3/B21/retest_v4/HANDOFF_RETEST_V4.json", "551a2e875239c8ead27988044e43de59ba6029260ca4e8d2d5845a40e14bc11e"),
    "A3_V4_A0_AUDIT": (EVID / "a0/B21_A3_V4_HANDOFF_AUDIT.json", "1f008a0eb88e92173f62b010dee47fa8e6c96d4437c6f6350e45bee114076173"),
    "A4_V4_REPORT": (EVID / "a4/B21/retest_v4/RETEST_V4.md", "375711c02d59aad460d04bc910c07173d157eb66f8e90a72331f720a2b97c73b"),
    "A4_V4_FINDINGS": (EVID / "a4/B21/retest_v4/RETEST_FINDINGS_V4.json", "922031cac6e7c3b6e9567ec9ac02296d02b5dafdbffeedcd3fb7dd04cf670c7e"),
    "A4_V4_HANDOFF": (EVID / "a4/B21/retest_v4/HANDOFF_RETEST_V4.json", "0ee6293e60b99ce456b2ea66d68459935bcfa4344b9df63346b47a12283651d9"),
    "A4_V4_A0_AUDIT": (EVID / "a0/B21_A4_V4_HANDOFF_AUDIT.json", "4ebd25ee5326168255443d0ef14372645fbbee7747d93ce774374b7aeb7967eb"),
    "STAGE0_SOURCE_MANIFEST": (S0 / "evidence/a2/SOURCE_MANIFEST.json", "195a68ad98b4739dff0d3496dc93ba9e85d67d2dae0d88e3d4e4a088f1259c9c"),
    "STAGE1_SCHEMA": (S1 / "CORPUS_SCHEMA.md", "9fe71d4719b0c8f9fd6d6fd6fb0316c7f9a840b6b964634889ea6d98245a1f1f"),
    "STAGE1_POLICY": (S1 / "EXTRACTION_POLICY.md", "97bd6c69ea8d459ea99713e943c2d092a88999b6df7cb315d2820547789c11f2"),
    "A9_B21_FINDINGS": (EVID / "a9/B21/FINDINGS.md", ""),
    "A2_V4_COVERAGE_SWEEP": (CAND4 / "COVERAGE_SWEEP_MANIFEST.json", ""),
}

A9_MS_TARGETS = [
    ("9618_s21_qp_11-q2-pa-mi-1", "9618_s21_ms_11", 4),
    ("9618_s21_qp_11-q3-pb-mi-1", "9618_s21_ms_11", 5),
    ("9618_s21_qp_11-q3-pc-pi-mi-1", "9618_s21_ms_11", 6),
    ("9618_s21_qp_12-q3-pa-mi-1", "9618_s21_ms_12", 5),
    ("9618_s21_qp_12-q3-pb-mi-1", "9618_s21_ms_12", 5),
    ("9618_s21_qp_13-q2-pa-mi-1", "9618_s21_ms_13", 4),
    ("9618_s21_qp_13-q3-pb-mi-1", "9618_s21_ms_13", 5),
    ("9618_s21_qp_13-q3-pc-pi-mi-1", "9618_s21_ms_13", 6),
    ("9618_w21_qp_11-q1-pa-mi-1", "9618_w21_ms_11", 3),
    ("9618_w21_qp_11-q6-pb-mi-1", "9618_w21_ms_11", 8),
    ("9618_w21_qp_12-q7-pa-mi-1", "9618_w21_ms_12", 8),
    ("9618_w21_qp_13-q1-pa-mi-1", "9618_w21_ms_13", 3),
    ("9618_w21_qp_13-q6-pb-mi-1", "9618_w21_ms_13", 8),
]
QP_TARGETS = [
    ("9618_s21_qp_12-p2-whole-page", "9618_s21_qp_12", 2, ["9618_s21_qp_12-q1-pa"]),
    ("9618_w21_qp_12-p2-whole-page", "9618_w21_qp_12", 2, ["9618_w21_qp_12-q1"]),
    ("9618_w21_qp_12-p6-whole-page", "9618_w21_qp_12", 6, ["9618_w21_qp_12-q4"]),
    ("9618_w21_qp_12-p12-whole-page", "9618_w21_qp_12", 12, ["9618_w21_qp_12-q7-pa"]),
]


def sha(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for block in iter(lambda: f.read(1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def save(path: Path, obj):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def records(path: Path):
    return [json.loads(x) for x in path.read_text(encoding="utf-8").splitlines() if x.strip()]


def page_key(source_id, page):
    return (source_id, int(page))


def main():
    if not OUT.exists():
        raise RuntimeError("Expected retest_v5 output folder is missing; create it only after dispatch verification")
    (OUT / "renders/full_size").mkdir(parents=True, exist_ok=True)
    (OUT / "contact_sheets").mkdir(parents=True, exist_ok=True)

    # Verify pinned instructions/evidence; recompute candidate dispatch record and baseline inputs.
    pins = []
    for name, (path, expected) in PINS.items():
        actual = sha(path)
        pins.append({"name": name, "path": str(path.relative_to(ROOT)).replace("\\", "/"), "expected_sha256": expected or None,
                     "actual_sha256": actual, "matches_pin": (not expected or actual == expected)})
    dispatch_record = load(PINS["A4_DISPATCH_RECORD"][0])
    dispatch_record_ok = dispatch_record["work_order"]["sha256"] == PINS["A4_DISPATCH"][1] and dispatch_record["write_allowlist"] == ["evidence/a4/B21/retest_v5/"]

    srcman_path = PINS["STAGE0_SOURCE_MANIFEST"][0]
    srcman = load(srcman_path)
    srcs = {x["id"]: x for x in srcman["primary_sources"]}
    sources = {k: v for k, v in srcs.items() if k.startswith(("9618_s21_", "9618_w21_"))}
    qp_sources = {k: v for k, v in sources.items() if "_qp_" in k}
    if len(sources) != 12 or len(qp_sources) != 6:
        raise RuntimeError(f"Unexpected Stage 0 source inventory: {len(sources)} sources, {len(qp_sources)} QPs")

    handoff = load(CAND / "HANDOFF_CHECK.json")
    batch = load(CAND / "BATCH_MANIFEST.json")
    snapshot = load(CAND / "SNAPSHOT_MANIFEST.json")
    handoff_sources = {x["source_id"]: x for x in handoff["source_integrity"]["sources"]}
    source_checks = []
    for sid, meta in sorted(sources.items()):
        source = ROOT / meta["path"]
        actual_hash = sha(source)
        page_count = len(PdfReader(str(source)).pages)
        hrow = handoff_sources[sid]
        ok = actual_hash == meta["sha256"] == hrow["sha256"] and page_count == meta["page_count"] == hrow["page_count"]
        source_checks.append({"source_id": sid, "path": meta["path"], "stage0_sha256": meta["sha256"], "actual_sha256": actual_hash,
                              "stage0_page_count": meta["page_count"], "actual_page_count": page_count,
                              "candidate_handoff_sha256": hrow["sha256"], "candidate_handoff_page_count": hrow["page_count"], "matches_all": ok})
        if not ok:
            raise RuntimeError(f"Source mismatch for {sid}")

    # Candidate chain: verify every handoff and snapshot hash/byte pin and exact file set.
    handoff_rows = {x["path"]: x for x in handoff["declared_output_hashes"]}
    snapshot_rows = {x["path"]: x for x in snapshot["files"]}
    actual_files = {str(p.relative_to(CAND)).replace("\\", "/") for p in CAND.rglob("*") if p.is_file()}
    handoff_checks = []
    for rel, row in sorted(handoff_rows.items()):
        f = CAND / Path(rel)
        actual = sha(f)
        size = f.stat().st_size
        handoff_checks.append({"path": rel, "expected_sha256": row["sha256"], "actual_sha256": actual, "expected_bytes": row["bytes"], "actual_bytes": size,
                              "matches": actual == row["sha256"] and size == row["bytes"]})
    snapshot_checks = []
    for rel, row in sorted(snapshot_rows.items()):
        f = CAND / Path(rel)
        actual = sha(f)
        size = f.stat().st_size
        snapshot_checks.append({"path": rel, "expected_sha256": row["sha256"], "actual_sha256": actual, "expected_bytes": row["bytes"], "actual_bytes": size,
                               "matches": actual == row["sha256"] and size == row["bytes"]})
    chain = {
        "declared_output_count": len(handoff_rows), "snapshot_file_count": len(snapshot_rows), "candidate_actual_file_count": len(actual_files),
        "handoff_output_set_matches_candidate_excluding_handoff_and_snapshot": set(handoff_rows) == actual_files - {"HANDOFF_CHECK.json", "SNAPSHOT_MANIFEST.json"},
        "snapshot_set_matches_candidate_excluding_snapshot": set(snapshot_rows) == actual_files - {"SNAPSHOT_MANIFEST.json"},
        "all_handoff_hashes_and_bytes_match": all(x["matches"] for x in handoff_checks),
        "all_snapshot_hashes_and_bytes_match": all(x["matches"] for x in snapshot_checks),
        "checks": {"handoff": handoff_checks, "snapshot": snapshot_checks},
    }

    # Validate the only semantic change: existing Q1 root mark and one exact whole-question MS row.
    qrows = records(CAND / "QUESTION_INDEX.jsonl")
    mrows = records(CAND / "MARKING_INDEX.jsonl")
    v4qrows = records(CAND4 / "QUESTION_INDEX.jsonl")
    v4mrows = records(CAND4 / "MARKING_INDEX.jsonl")
    q_by_id = {x["id"]: x for x in qrows}
    q4_by_id = {x["id"]: x for x in v4qrows}
    m_by_id = {x["id"]: x for x in mrows}
    m4_by_id = {x["id"]: x for x in v4mrows}
    q1_id = "9618_w21_qp_12-q1"
    q1 = q_by_id[q1_id]
    q1_child_ids = sorted(x["id"] for x in qrows if x.get("question_id") == q1_id)
    q1_children_v4 = sorted(x["id"] for x in v4qrows if x.get("question_id") == q1_id)
    q1_ms_id = "9618_w21_qp_12-q1-mi-1"
    q1_mi = m_by_id.get(q1_ms_id)
    q1_expected_condition = "1 mark for 3 correct lines only from Data Security; 1 mark for 2 correct lines only from Data Integrity"
    q1_check = {
        "question_id": q1_id, "candidate_root": q1, "v4_root": q4_by_id.get(q1_id),
        "root_mark_is_2": q1.get("marks_displayed_or_null") == 2,
        "root_qp_locator_is_w21_12_p2_q1": q1.get("qp_locator") == {"source_id": "9618_w21_qp_12", "pdf_page_1_based": 2, "question": "1"},
        "only_root_mark_changed_from_v4": {k: v for k, v in q1.items() if k != "marks_displayed_or_null"} == {k: v for k, v in q4_by_id[q1_id].items() if k != "marks_displayed_or_null"} and q4_by_id[q1_id].get("marks_displayed_or_null") is None,
        "child_record_ids_unchanged_from_v4": q1_child_ids == q1_children_v4,
        "child_ids": q1_child_ids,
        "whole_question_marking_item": q1_mi,
        "marking_item_has_question_root_only": bool(q1_mi and q1_mi.get("question_id_or_null") == q1_id and q1_mi.get("part_id_or_null") is None),
        "exact_whole_q1_ms_locator": bool(q1_mi and q1_mi["ms_locator"] == {"source_id": "9618_w21_ms_12", "pdf_page_1_based": 3, "question": "1"}),
        "exact_source_condition_preserved": bool(q1_mi and q1_mi.get("mark_or_condition_or_null") == q1_expected_condition),
        "no_part_or_table_row_allocation": bool(q1_mi and q1_mi.get("ms_locator", {}).get("part") is None and q1_mi.get("table_row_ref_or_null") is None),
        "visual_dependency_ref": q1_mi.get("visual_dependency_refs", []) if q1_mi else [],
    }

    # Ensure v4-to-v5 deltas contain only approved record and documentation/manifest updates.
    def tree_hashes(folder: Path):
        return {str(p.relative_to(folder)).replace("\\", "/"): sha(p) for p in folder.rglob("*") if p.is_file()}
    h4, h5 = tree_hashes(CAND4), tree_hashes(CAND)
    changed_paths = sorted(k for k in h4.keys() & h5.keys() if h4[k] != h5[k])
    added_paths = sorted(h5.keys() - h4.keys())
    removed_paths = sorted(h4.keys() - h5.keys())
    q_changed_ids = sorted(k for k in q_by_id.keys() & q4_by_id.keys() if q_by_id[k] != q4_by_id[k])
    m_changed_ids = sorted(k for k in m_by_id.keys() & m4_by_id.keys() if m_by_id[k] != m4_by_id[k])
    m_added_ids = sorted(m_by_id.keys() - m4_by_id.keys())
    m_removed_ids = sorted(m4_by_id.keys() - m_by_id.keys())
    byte_identical_files = ["PAGE_INDEX.jsonl", "CONTEXT_INDEX.jsonl", "VISUAL_MANIFEST.json", "UNRESOLVED.md"]
    identical_paths = {name: h4.get(name) == h5.get(name) for name in byte_identical_files}
    preservation = {
        "changed_candidate_paths": changed_paths, "added_candidate_paths": added_paths, "removed_candidate_paths": removed_paths,
        "question_index_rows_v4_v5": [len(v4qrows), len(qrows)], "question_index_changed_ids": q_changed_ids,
        "marking_index_rows_v4_v5": [len(v4mrows), len(mrows)], "marking_index_changed_ids": m_changed_ids,
        "marking_index_added_ids": m_added_ids, "marking_index_removed_ids": m_removed_ids,
        "expected_only_q1_root_and_whole_question_item": q_changed_ids == [q1_id] and m_changed_ids == [] and m_added_ids == [q1_ms_id] and m_removed_ids == [],
        "byte_identity_checks": identical_paths,
        "all_preservation_checks_claimed_by_candidate": handoff["preservation_checks"],
    }

    # Validate hierarchy, unresolved accounting and whole-question target invariants.
    duplicate_q_ids = len(q_by_id) != len(qrows)
    roots = [x for x in qrows if "question_number" in x]
    parts = [x for x in qrows if "label" in x]
    part_ids = {x["id"] for x in parts}
    root_ids = {x["id"] for x in roots}
    dangling = [x["id"] for x in parts if x.get("question_id") not in root_ids or (x.get("parent_part_id_or_null") and x["parent_part_id_or_null"] not in part_ids)]
    unresolved = {x["id"] for x in qrows if x.get("status") == "UNRESOLVED"}
    unresolved_text = (CAND / "UNRESOLVED.md").read_text(encoding="utf-8")
    unresolved_parent_rows = [x for x in qrows if x.get("status") == "UNRESOLVED"]
    unresolved_mark_rows = [x for x in mrows if x.get("link_type") == "PARENT_CONTEXT_ONLY"]
    unresolved_mark_by_part = {x.get("part_id_or_null"): x for x in unresolved_mark_rows}
    unresolved_mark_ids = {x["id"] for x in unresolved_mark_rows}
    unresolved_part_ids = {x["id"] for x in unresolved_parent_rows}
    v4_unresolved_marks = {x["id"] for x in v4mrows if x.get("link_type") == "PARENT_CONTEXT_ONLY"}
    unresolved_rows_are_parent_context_only = all(
        x.get("status") == "UNRESOLVED" and x.get("question_id_or_null") is None and
        x.get("part_id_or_null") in unresolved_part_ids and x.get("mark_or_condition_or_null") is None and
        x.get("table_row_ref_or_null") is None and bool(x.get("unresolved_reason"))
        for x in unresolved_mark_rows
    )
    unresolved_question_linkage_matches = set(unresolved_mark_by_part) == unresolved_part_ids
    unresolved_check = {
        "question_rows": len(qrows), "roots": len(roots), "parts": len(parts), "unique_ids": not duplicate_q_ids,
        "dangling_question_or_part_parents": dangling, "unresolved_parent_count": len(unresolved), "unresolved_register_count": len(unresolved_mark_rows),
        "unresolved_marking_record_count": len(unresolved_mark_rows),
        "unresolved_parent_context_marking_records": unresolved_mark_rows,
        "unresolved_rows_are_parent_context_only_with_null_allocation": unresolved_rows_are_parent_context_only,
        "unresolved_question_linkage_matches": unresolved_question_linkage_matches,
        "unresolved_marking_ids_unchanged_from_v4": unresolved_mark_ids == v4_unresolved_marks,
        "unresolved_ids_match_register": unresolved_question_linkage_matches and unresolved == set(unresolved_mark_by_part),
        "unresolved_register_statement_present": "34 `PARENT_CONTEXT_ONLY` marking records remain `UNRESOLVED`" in unresolved_text,
        "unresolved_rows": unresolved_parent_rows,
        "v4_unresolved_ids_unchanged": unresolved == {x["id"] for x in v4qrows if x.get("status") == "UNRESOLVED"},
    }

    # Every marking row must target one existing record; every dependency resolves to same MS source/page.
    target_errors = []
    dependency_errors = []
    region_manifest = load(CAND / "VISUAL_MANIFEST.json")
    regions = region_manifest["regions"]
    region_by_id = {r["id"]: r for r in regions}
    for row in mrows:
        qid, pid = row.get("question_id_or_null"), row.get("part_id_or_null")
        if (qid is None) == (pid is None) or (qid and qid not in root_ids) or (pid and pid not in part_ids):
            target_errors.append(row["id"])
        for ref in row.get("visual_dependency_refs", []):
            reg = region_by_id.get(ref)
            loc = row["ms_locator"]
            if not reg or reg["source_id"] != loc["source_id"] or reg["pdf_page_1_based"] != loc["pdf_page_1_based"]:
                dependency_errors.append({"marking_id": row["id"], "region_id": ref, "expected": loc, "region": reg})

    # Independently sum all displayed QP marks, resolve part->root source, and check six cover totals.
    total_rows = []
    cover_pages = set()
    for sid in sorted(qp_sources):
        marked_rows = []
        for row in qrows:
            source = row.get("source_qp_id")
            if not source and row.get("question_id"):
                root = q_by_id.get(row["question_id"], {})
                source = root.get("source_qp_id")
            if source == sid and row.get("marks_displayed_or_null") is not None:
                marked_rows.append(row)
        index_sum = sum(int(x["marks_displayed_or_null"]) for x in marked_rows)
        pdf = ROOT / qp_sources[sid]["path"]
        cover_text = PdfReader(str(pdf)).pages[0].extract_text() or ""
        printed_75_token = bool(re.search(r"\b75\b", cover_text))
        cover_pages.add((sid, 1))
        total_rows.append({"source_id": sid, "marked_row_count": len(marked_rows), "independent_indexed_sum": index_sum,
                           "cover_pdf_page_1_based": 1, "cover_has_75_text_token": printed_75_token,
                           "candidate_mark_total_check": next(x for x in load(CAND / "MARK_TOTAL_CHECK.json")["totals"] if x["source_id"] == sid),
                           "pass": index_sum == 75 and printed_75_token})

    # Verify the 13 original A9 marking IDs and the new whole-question Q1 item separately.
    a9_ms_checks = []
    for item_id, expected_source, expected_page in A9_MS_TARGETS:
        row = m_by_id.get(item_id)
        expected_region_id = f"{expected_source}-p{expected_page}-whole-page"
        reg = region_by_id.get(expected_region_id)
        loc = row.get("ms_locator") if row else None
        exact_locator = bool(row and loc.get("source_id") == expected_source and loc.get("pdf_page_1_based") == expected_page)
        has_dependency = bool(row and expected_region_id in row.get("visual_dependency_refs", []))
        render_path = reg.get("rendered_asset_ref") if reg else None
        render_file = CAND / render_path if render_path else None
        render_pin = next((x for x in snapshot["files"] if x["path"] == render_path), None)
        asset_ok = bool(render_file and render_file.is_file() and render_pin and sha(render_file) == render_pin["sha256"])
        a9_ms_checks.append({"marking_id": item_id, "expected_source_id": expected_source, "expected_pdf_page_1_based": expected_page,
                             "candidate_exists": bool(row), "actual_ms_locator": loc, "exact_locator": exact_locator,
                             "expected_region_id": expected_region_id, "region_exists": bool(reg),
                             "region_source_page_matches": bool(reg and reg["source_id"] == expected_source and reg["pdf_page_1_based"] == expected_page),
                             "marking_dependency_contains_region": has_dependency,
                             "region_relates_to_ids": reg.get("relates_to_ids") if reg else None,
                             "rendered_asset_ref": render_path, "render_sha256": sha(render_file) if asset_ok else None,
                             "asset_matches_candidate_snapshot": asset_ok, "reviewer_status": reg.get("reviewer_status") if reg else None,
                             "legibility_review": "pending full-size source/asset visual inspection"})
    q1_mi_check = None
    if q1_mi:
        q1_ms_source = "9618_w21_ms_12"
        q1_ms_page = 3
        q1_region_id = f"{q1_ms_source}-p{q1_ms_page}-whole-page"
        reg = region_by_id.get(q1_region_id)
        row = q1_mi
        asset_ref = reg.get("rendered_asset_ref") if reg else None
        asset_path = CAND / asset_ref if asset_ref else None
        pin = next((x for x in snapshot["files"] if x["path"] == asset_ref), None)
        q1_mi_check = {"marking_id": q1_ms_id, "expected_source_id": q1_ms_source, "expected_pdf_page_1_based": q1_ms_page,
                       "exact_locator": row.get("ms_locator") == {"source_id": q1_ms_source, "pdf_page_1_based": q1_ms_page, "question": "1"},
                       "question_root_only_target": row.get("question_id_or_null") == q1_id and row.get("part_id_or_null") is None,
                       "exact_condition": row.get("mark_or_condition_or_null") == q1_expected_condition,
                       "visual_dependency_refs": row.get("visual_dependency_refs"), "region_id": q1_region_id,
                       "region_exists": bool(reg), "region_source_page_matches": bool(reg and reg["source_id"] == q1_ms_source and reg["pdf_page_1_based"] == q1_ms_page),
                       "region_relates_to_ids": reg.get("relates_to_ids") if reg else None,
                       "rendered_asset_ref": asset_ref, "render_sha256": sha(asset_path) if asset_path and asset_path.exists() else None,
                       "asset_matches_candidate_snapshot": bool(asset_path and pin and asset_path.is_file() and sha(asset_path) == pin["sha256"]),
                       "reviewer_status": reg.get("reviewer_status") if reg else None,
                       "legibility_review": "pending full-size source/asset visual inspection"}

    # Check the four page-level QP regions added for A9-B21-VIS-01.
    qp_target_checks = []
    for rid, sid, page, expected_relations in QP_TARGETS:
        reg = region_by_id.get(rid)
        q_records = [q_by_id.get(qid) for qid in expected_relations]
        qp_target_checks.append({"region_id": rid, "source_id": sid, "pdf_page_1_based": page,
                                 "region_exists": bool(reg), "region_source_page_matches": bool(reg and reg["source_id"] == sid and reg["pdf_page_1_based"] == page),
                                 "expected_relates_to_ids": expected_relations, "actual_relates_to_ids": reg.get("relates_to_ids") if reg else None,
                                 "relations_match": bool(reg and reg.get("relates_to_ids") == expected_relations),
                                 "related_question_page_matches": all(bool(q and q["qp_locator"]["source_id"] == sid and q["qp_locator"]["pdf_page_1_based"] == page) for q in q_records),
                                 "rendered_asset_ref": reg.get("rendered_asset_ref") if reg else None,
                                 "reviewer_status": reg.get("reviewer_status") if reg else None,
                                 "render_legibility": "pending full-size source/asset visual inspection"})

    # Recheck Q7/Q8 hierarchy and S21 cross-page context repaired before v4.
    q7q8_ids = ["9618_s21_qp_11-q7", "9618_s21_qp_11-q8", "9618_s21_qp_13-q7", "9618_s21_qp_13-q8"]
    q7q8_rows = []
    for qid in q7q8_ids:
        qrow = q_by_id.get(qid)
        child_rows = [x for x in parts if x.get("question_id") == qid]
        q7q8_rows.append({"question_id": qid, "row": qrow, "child_parts": child_rows,
                          "context": load(CAND / qrow["context_ref_or_null"]) if qrow and qrow.get("context_ref_or_null") else None})

    # The rendered-source targets: 16 A9 visual-risk pages, W21/12 MS p3, eight Q7/Q8 context pages,
    # and six covers for displayed-mark sum comparison. Deduplicate by source id + PDF page.
    a9_fullsize = {(sid, page) for _, sid, page in A9_MS_TARGETS}
    a9_fullsize |= {(sid, page) for _, sid, page, _ in QP_TARGETS}
    q1_ms_page = {("9618_w21_ms_12", 3)}
    context_pages = {("9618_s21_qp_11", 15), ("9618_s21_qp_11", 16), ("9618_s21_qp_13", 15), ("9618_s21_qp_13", 16),
                     ("9618_s21_ms_11", 9), ("9618_s21_ms_11", 10), ("9618_s21_ms_13", 9), ("9618_s21_ms_13", 10)}
    covers = {(sid, 1) for sid in qp_sources}
    fullsize_pages = a9_fullsize | q1_ms_page | context_pages | covers
    if len(a9_fullsize) != 16 or len(fullsize_pages) != 31:
        raise RuntimeError(f"Unexpected full-size page set {len(a9_fullsize)} / {len(fullsize_pages)}")

    # Render full-size source pages directly from verified originals with Poppler.
    render_rows = []
    source_by_id = sources
    for sid, page in sorted(fullsize_pages):
        pdf = ROOT / source_by_id[sid]["path"]
        stem = f"{sid}-p{page:02d}"
        prefix = OUT / "renders/full_size" / stem
        output_png = prefix.with_suffix(".png")
        if output_png.exists():
            output_png.unlink()
        proc = subprocess.run([str(POPPLER), "-png", "-r", "150", "-f", str(page), "-l", str(page), "-singlefile", str(pdf), str(prefix)],
                              capture_output=True, text=True)
        if proc.returncode != 0 or not output_png.exists():
            raise RuntimeError(f"pdftoppm failed for {sid} p{page}: {proc.stderr}")
        im = Image.open(output_png)
        render_rows.append({"source_id": sid, "pdf_page_1_based": page, "source_pdf_path": source_by_id[sid]["path"],
                            "source_pdf_sha256": source_checks[[x["source_id"] for x in source_checks].index(sid)]["actual_sha256"],
                            "render_path": str(output_png.relative_to(OUT)).replace("\\", "/"), "render_sha256": sha(output_png),
                            "bytes": output_png.stat().st_size, "width": im.width, "height": im.height, "dpi": 150,
                            "purpose": "A9 visual-risk target" if (sid, page) in a9_fullsize else "Q1/MS, Q7/Q8 context or QP cover retest"})

    # Independent reduced-scale contact sheets: one sheet for every original PDF, all 154 pages covered.
    contact_rows = []
    contact_source_checks = []
    font = ImageFont.load_default()
    tile_w, tile_h, cols = 245, 322, 4
    for sid in sorted(sources):
        pdf = ROOT / sources[sid]["path"]
        doc = pymupdf.open(pdf)
        pages = len(doc)
        rows = math.ceil(pages / cols)
        sheet = Image.new("RGB", (cols * tile_w, rows * tile_h), "white")
        draw = ImageDraw.Draw(sheet)
        for i in range(pages):
            pix = doc.load_page(i).get_pixmap(matrix=pymupdf.Matrix(0.38, 0.38), alpha=False)
            thumb = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
            thumb.thumbnail((tile_w - 10, tile_h - 32), Image.Resampling.LANCZOS)
            cell_x, cell_y = (i % cols) * tile_w, (i // cols) * tile_h
            label = f"{sid}  PDF p{i+1}"
            draw.text((cell_x + 5, cell_y + 3), label, fill="black", font=font)
            sheet.paste(thumb, (cell_x + (tile_w - thumb.width) // 2, cell_y + 27))
            draw.rectangle((cell_x, cell_y, cell_x + tile_w - 1, cell_y + tile_h - 1), outline=(150, 150, 150), width=1)
        doc.close()
        image_path = OUT / "contact_sheets" / f"{sid}-all-pages.png"
        sheet.save(image_path, optimize=True)
        contact_rows.append({"source_id": sid, "source_pdf_path": sources[sid]["path"], "source_pdf_sha256": source_checks[[x["source_id"] for x in source_checks].index(sid)]["actual_sha256"],
                             "page_count": pages, "page_numbers_covered": list(range(1, pages + 1)), "contact_sheet_path": str(image_path.relative_to(OUT)).replace("\\", "/"),
                             "contact_sheet_sha256": sha(image_path), "width": sheet.width, "height": sheet.height, "render_scale": 0.38,
                             "limit": "reduced-scale visual sweep only; not a substitute for full-size target inspection"})
        contact_source_checks.append({"source_id": sid, "pdf_page_count": pages})
    if sum(x["page_count"] for x in contact_rows) != 154 or len(contact_rows) != 12:
        raise RuntimeError("Contact sheet sweep does not cover 12 PDFs / 154 pages")

    # Inspect exact target root, MS row, visual dependency and asset hashes.
    row_by_source_page = {(x["source_id"], x["pdf_page_1_based"]): x for x in render_rows}
    q1_qp_render = row_by_source_page[("9618_w21_qp_12", 2)]
    q1_ms_render = row_by_source_page[("9618_w21_ms_12", 3)]
    qp_direct_source_check = {
        "source_id": "9618_w21_qp_12", "pdf_page_1_based": 2, "pdf_sha256": q1_qp_render["source_pdf_sha256"],
        "direct_render_path": q1_qp_render["render_path"], "direct_render_sha256": q1_qp_render["render_sha256"],
        "source_text_has_q1_and_2_token": "[2]" in (PdfReader(str(ROOT / sources["9618_w21_qp_12"]["path"])).pages[1].extract_text() or ""),
        "source_visual_result": "pending full-size inspection",
        "candidate_root_record_id": q1_id, "candidate_mark": q1.get("marks_displayed_or_null"),
        "candidate_root_has_no_invented_child_for_q1_mark": q1_child_ids == q1_children_v4,
    }
    ms_p3_text = PdfReader(str(ROOT / sources["9618_w21_ms_12"]["path"])).pages[2].extract_text() or ""
    q1_ms_direct_source_check = {
        "source_id": "9618_w21_ms_12", "pdf_page_1_based": 3, "pdf_sha256": q1_ms_render["source_pdf_sha256"],
        "direct_render_path": q1_ms_render["render_path"], "direct_render_sha256": q1_ms_render["render_sha256"],
        "source_text_contains_q1": bool(re.search(r"Question\s+Answer\s+Marks\s+1", ms_p3_text)),
        "source_text_contains_exact_q1_conditions": all(x in ms_p3_text for x in ["3 correct lines only from Data Security", "2 correct lines only from Data Integrity"]),
        "source_visual_result": "pending full-size inspection",
        "candidate_marking_row_check": q1_check,
    }

    # Validate candidate output image assets against candidate snapshot for every A4-reviewed region.
    asset_checks = []
    for target in qp_target_checks + a9_ms_checks + [q1_mi_check]:
        if not target:
            continue
        rel = target.get("rendered_asset_ref")
        f = CAND / rel if rel else None
        pin = next((x for x in snapshot["files"] if x["path"] == rel), None)
        asset_checks.append({"region_id": target.get("region_id") or target.get("expected_region_id"), "rendered_asset_ref": rel,
                             "exists": bool(f and f.is_file()), "expected_sha256": pin["sha256"] if pin else None,
                             "actual_sha256": sha(f) if f and f.is_file() else None,
                             "matches_snapshot": bool(f and f.is_file() and pin and sha(f) == pin["sha256"]),
                             "legibility_status": "pending full-size original and candidate asset comparison"})

    # Targeted existing visual regions and all marking dependencies are structurally checked.
    all_dep_refs = [ref for row in mrows for ref in row.get("visual_dependency_refs", [])]
    all_dep_errors = []
    for row in mrows:
        for ref in row.get("visual_dependency_refs", []):
            reg = region_by_id.get(ref)
            loc = row["ms_locator"]
            if not reg or reg["source_id"] != loc["source_id"] or reg["pdf_page_1_based"] != loc["pdf_page_1_based"]:
                all_dep_errors.append({"marking_id": row["id"], "region_id": ref, "locator": loc, "region": reg})

    # Parent-context rows remain unallocated. Count context-required parent records and Q7/Q8 structure.
    context_index = records(CAND / "CONTEXT_INDEX.jsonl")
    context_required_items = [x for x in qrows if x.get("context_required")]
    unresolved_fields_nonnull = [x["id"] for x in unresolved_parent_rows if any(x.get(k) is not None for k in ["marks_displayed_or_null", "ms_locator_or_null", "command_word_verbatim_or_null"] if k in x)]

    # Prior A4 v4/current A3 v4 controls and candidate source and visual rows are pinned below.
    output = {
        "task_id": "P1-S1-A4-B21-RETEST-V5",
        "candidate_version": "B21-A2-v5",
        "work_order_pin": {"sha256": PINS["A4_DISPATCH"][1], "dispatch_record_matches": dispatch_record_ok},
        "input_pins": {"pins": pins, "all_match": all(x["matches_pin"] for x in pins), "count": len(pins)},
        "source_integrity": {"source_checks": source_checks, "source_count": len(source_checks), "page_count_total": sum(x["actual_page_count"] for x in source_checks),
                             "all_stage0_and_candidate_handoff_hashes_pages_match": all(x["matches_all"] for x in source_checks)},
        "candidate_integrity": {"chain_summary": {k: v for k, v in chain.items() if k != "checks"}, "candidate_file_hash_checks": chain},
        "v4_to_v5_preservation": preservation,
        "q1_whole_question_correction": {"question_index_check": q1_check, "direct_qp_source_check": qp_direct_source_check, "direct_ms_source_check": q1_ms_direct_source_check},
        "six_mark_total_recompute": {"totals": total_rows, "all_sums_equal_75_and_cover_prints_75": all(x["pass"] for x in total_rows)},
        "a9_visual_risk_target_ms_marking_items": {"count": len(a9_ms_checks), "unique_expected_ms_page_count": len({(sid,p) for _,sid,p in A9_MS_TARGETS}), "items": a9_ms_checks},
        "a9_visual_risk_target_qp_regions": {"count": len(qp_target_checks), "targets": qp_target_checks},
        "new_q1_ms_region": q1_mi_check,
        "visual_asset_hash_checks": asset_checks,
        "visual_region_count": len(regions),
        "all_marking_targets": {"marking_row_count": len(mrows), "all_targets_exist_and_are_exclusive": not target_errors, "target_errors": target_errors,
                                "dependency_ref_count": len(all_dep_refs), "dependency_errors": all_dep_errors, "unique_dependency_region_count": len(set(all_dep_refs))},
        "hierarchy_unresolved_context": {"hierarchy_unresolved": unresolved_check, "context_index_rows": len(context_index), "context_required_question_part_rows": len(context_required_items),
                                         "context_required_rows": context_required_items, "unresolved_container_allocations_nonnull": unresolved_fields_nonnull,
                                         "q7_q8_rows_and_context": q7q8_rows},
        "source_page_review_plan": {"a9_visual_risk_pages_count": len(a9_fullsize), "a9_visual_risk_pages": sorted([{"source_id":s,"pdf_page_1_based":p} for s,p in a9_fullsize],key=lambda x:(x["source_id"],x["pdf_page_1_based"])),
                                    "context_pages": sorted([{"source_id":s,"pdf_page_1_based":p} for s,p in context_pages],key=lambda x:(x["source_id"],x["pdf_page_1_based"])),
                                    "qp_cover_pages": sorted([{"source_id":s,"pdf_page_1_based":p} for s,p in covers],key=lambda x:x["source_id"]),
                                    "full_size_unique_page_count": len(fullsize_pages), "full_size_page_renders": render_rows,
                                    "contact_sheet_count": len(contact_rows), "contact_sheets": contact_rows, "contact_sheet_page_total": sum(x["page_count"] for x in contact_rows)},
    }
    save(OUT / "A4_REVIEW_CHECKS_V5.json", output)
    save(OUT / "SOURCE_RENDER_MANIFEST_V5.json", {"task_id": "P1-S1-A4-B21-RETEST-V5", "source_manifest_sha256": sha(srcman_path),
          "source_integrity": source_checks, "full_size_render_method": "Poppler pdftoppm at 150 dpi directly from originals after source hash/page-count verification",
          "full_size_page_count": len(render_rows), "full_size_pages": render_rows, "contact_sheet_method": "PyMuPDF 0.38 scale; labeled 4-column contact sheet; all pages per PDF",
          "contact_sheet_count": len(contact_rows), "contact_sheet_page_count": sum(x["page_count"] for x in contact_rows), "contact_sheets": contact_rows,
          "coverage_limit": "Contact sheets are reduced-scale only. The 31 listed direct source pages were rendered full size; no claim of full-size review for other pages."})
    save(OUT / "PINNED_INPUT_CHECKS_V5.json", {"task_id": "P1-S1-A4-B21-RETEST-V5", "pins": pins, "all_match": all(x["matches_pin"] for x in pins),
          "source_checks": source_checks, "all_sources_match": all(x["matches_all"] for x in source_checks),
          "candidate_output_count": len(handoff_checks), "candidate_snapshot_count": len(snapshot_checks), "candidate_chain_pass": chain["all_handoff_hashes_and_bytes_match"] and chain["all_snapshot_hashes_and_bytes_match"]})
    save(OUT / "V4_TO_V5_DELTA_CHECK.json", preservation)
    print(json.dumps({"source_count": len(source_checks), "source_pages": sum(x["actual_page_count"] for x in source_checks),
                      "full_size_pages": len(render_rows), "contact_sheets": len(contact_rows), "contact_sheet_pages": sum(x["page_count"] for x in contact_rows),
                      "candidate_chain_pass": chain["all_handoff_hashes_and_bytes_match"] and chain["all_snapshot_hashes_and_bytes_match"],
                      "q1_check": q1_check["root_mark_is_2"] and q1_check["exact_whole_q1_ms_locator"] and q1_check["exact_source_condition_preserved"],
                      "marks_75": all(x["pass"] for x in total_rows), "A9_ms_item_count": len(a9_ms_checks), "A9_qp_target_count": len(qp_target_checks),
                      "changed_paths": len(changed_paths), "output": str(OUT)}, indent=2))


if __name__ == "__main__":
    main()
