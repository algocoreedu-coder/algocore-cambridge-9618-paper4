import hashlib
import json
from collections import defaultdict
from pathlib import Path
from pypdf import PdfReader

ROOT = Path.cwd()
ST = ROOT / "A_Level_CS_page/planning/paper1/stage-1"
OUT = ST / "evidence/a3/B21/retest_v6"
C = ST / "evidence/a2/B21/versions/B21-A2-v6"
V5 = ST / "evidence/a2/B21/versions/B21-A2-v5"


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def rel(path):
    return Path(path).resolve().relative_to(ROOT.resolve()).as_posix()


def read_json(path):
    return json.loads(Path(path).read_text(encoding="utf-8-sig"))


def read_jsonl(path):
    return [json.loads(line) for line in Path(path).read_text(encoding="utf-8-sig").splitlines() if line.strip()]


EXPECTED = {
    "A_Level_CS_page/planning/paper1/stage-1/evidence/a0/B21_A3_V6_RETEST_DISPATCH.md": "81560a30b0f39c56884769df6829101574e78b55b5e4d53f223d169c0914b2aa",
    "A_Level_CS_page/planning/paper1/stage-1/evidence/a0/B21_A2_V6_A0_VALIDATE.json": "9b6a0792ffd4032d22c672272c45662f6c0f0ff162162fbd550730ab741e0c15",
    "A_Level_CS_page/planning/paper1/stage-1/evidence/a0/B21_A2_V6_A0_AUDIT.json": "8b7fffc4337f70f8abc6a662578686df88d18bd1174d317bbfda99b266e30652",
    "A_Level_CS_page/planning/paper1/stage-1/evidence/a9/B21/retest_v5/HANDOFF_RETEST_V5.json": "acecb8f4f383eb7283eee86a31a2abed35933564a8f37acd80eff55dbe1d7f34",
    "A_Level_CS_page/planning/paper1/stage-1/evidence/a9/B21/retest_v5/FINDINGS_V5.json": "e06d87ff05d475790b0d4a68d389128039d325356803e81a8ba214fbb4ad41d9",
    "A_Level_CS_page/planning/paper1/stage-1/evidence/a0/B21_A9_V5_HANDOFF_AUDIT.json": "5d61071743ad69374b1a30a634e749a0d5172f1bbbadaf3780e47e40640c07c4",
    "A_Level_CS_page/planning/paper1/stage-1/evidence/a3/B21/retest_v5/HANDOFF_RETEST_V5.json": "f490f55cb686c2b4393caa40a80f3da38ae24dc3bf9443c5ae0a04a71c5b23e5",
    "A_Level_CS_page/planning/paper1/stage-1/evidence/a3/B21/retest_v5/CONTEXT_SCOPE_FINDINGS_V5.json": "1ec9344aa45f302074b93a471fad75c1e8d9f163260460de9787f1c9f4ed60c7",
    "A_Level_CS_page/planning/paper1/stage-1/evidence/a2/B21/versions/B21-A2-v5/HANDOFF_CHECK.json": "d358cf79cc408cea36256a0a4f67be03b045b23ac59bd593dbb61c4c968014f2",
    "A_Level_CS_page/planning/paper1/stage-1/evidence/a2/B21/versions/B21-A2-v5/SNAPSHOT_MANIFEST.json": "63465d49de20bfeefd2151254126640679b60ceb7964ee6391b727f2a3b48581",
    "A_Level_CS_page/planning/paper1/stage-1/evidence/a2/B21/versions/B21-A2-v6/HANDOFF_CHECK.json": "9719395a5daf02b0a3aa37fdb54b4bf28e4eabeb4bc3da76e05d2ddaeff96c33",
    "A_Level_CS_page/planning/paper1/stage-1/evidence/a2/B21/versions/B21-A2-v6/BATCH_MANIFEST.json": "626f136e1ad3ba1b86191b9a2182892d326c69259408b53cb7a6b85bd8b1ba8e",
    "A_Level_CS_page/planning/paper1/stage-1/evidence/a2/B21/versions/B21-A2-v6/SNAPSHOT_MANIFEST.json": "fe0563b881affd4dc8d25ac2f3bd22fe0bec4a9e586cf6c5b5b3206a427b2117",
    "A_Level_CS_page/planning/paper1/stage-1/evidence/a2/B21/versions/B21-A2-v6/V5_TO_V6_SEMANTIC_DIFF.json": "d33e8037bad3e0e576c8e25858490797011e7e5f7d367a6675f7d0b514962b7d",
    "A_Level_CS_page/planning/paper1/stage-0/evidence/a2/SOURCE_MANIFEST.json": "195a68ad98b4739dff0d3496dc93ba9e85d67d2dae0d88e3d4e4a088f1259c9c",
    "697372-2026-syllabus.pdf": "bf1b77a2b765d10eb4b005ecae0412add35cf6113ba3218a517893abfc9f2470",
    "A_Level_CS_page/planning/paper1/stage-0/SCOPE_AND_COVERAGE_PLAN.md": "1690445cb50d69bdd496227382495ec4f56729bf5aecf47f1658a2b9c9487ccb",
    "A_Level_CS_page/planning/paper1/stage-0/evidence/a3/SYLLABUS_SCOPE.md": "87b909152c41ca460e7894079ed531652b6e63894d4657aee3e7af48a0b0515c",
    "A_Level_CS_page/planning/paper1/stage-1/CORPUS_SCHEMA.md": "9fe71d4719b0c8f9fd6d6fd6fb0316c7f9a840b6b964634889ea6d98245a1f1f",
    "A_Level_CS_page/planning/paper1/stage-1/EXTRACTION_POLICY.md": "97bd6c69ea8d459ea99713e943c2d092a88999b6df7cb315d2820547789c11f2",
}

input_pins = []
for path, expected in EXPECTED.items():
    p = ROOT / path
    actual = sha(p)
    assert actual == expected, (path, actual, expected)
    input_pins.append({"path": path, "sha256": actual, "bytes": p.stat().st_size, "expected_sha256": expected, "matches_expected": True})

dispatch_record = ST / "evidence/a0/B21_A3_V6_RETEST_DISPATCH_RECORD.json"
dispatch_record_pin = {"path": rel(dispatch_record), "sha256": sha(dispatch_record), "bytes": dispatch_record.stat().st_size}
dispatch = read_json(dispatch_record)
assert dispatch["work_order_sha256"] == EXPECTED["A_Level_CS_page/planning/paper1/stage-1/evidence/a0/B21_A3_V6_RETEST_DISPATCH.md"]
assert dispatch["candidate_handoff_sha256"] == EXPECTED["A_Level_CS_page/planning/paper1/stage-1/evidence/a2/B21/versions/B21-A2-v6/HANDOFF_CHECK.json"]

# Rehash every frozen candidate artifact and independently recompute the complete v5-to-v6 path delta.
snap = read_json(C / "SNAPSHOT_MANIFEST.json")
candidate_files = []
for row in snap["files"]:
    p = C / row["path"]
    actual = sha(p)
    assert actual == row["sha256"], (row["path"], actual, row["sha256"])
    candidate_files.append({"path": rel(p), "sha256": actual, "bytes": p.stat().st_size})
assert snap["file_count"] == len(snap["files"]) == 313
assert len([p for p in C.rglob("*") if p.is_file()]) == 314

old_map = {p.relative_to(V5).as_posix(): sha(p) for p in V5.rglob("*") if p.is_file()}
new_map = {p.relative_to(C).as_posix(): sha(p) for p in C.rglob("*") if p.is_file()}
added = sorted(new_map.keys() - old_map.keys())
deleted = sorted(old_map.keys() - new_map.keys())
changed = sorted(k for k in old_map.keys() & new_map.keys() if old_map[k] != new_map[k])
assert (len(changed), len(added), len(deleted)) == (10, 3, 0)
diff = read_json(C / "V5_TO_V6_SEMANTIC_DIFF.json")
fd = diff["file_level_delta"]
assert added == sorted(fd["added"]) == sorted(["A2_VALIDATION_V6.json", "V5_TO_V6_SEMANTIC_DIFF.json", "V6_SELF_CHECK.json"])
assert deleted == sorted(fd["deleted"]) == []
changed_rows = fd["changed_existing"]
updated_rows = sorted(x["path"] for x in changed_rows if x.get("change_type") == "updated")
repeated_added_rows = sorted(x["path"] for x in changed_rows if x.get("change_type") == "added")
assert updated_rows == changed
assert repeated_added_rows == added

a0_audit = read_json(ST / "evidence/a0/B21_A2_V6_A0_AUDIT.json")
assert a0_audit["status"] == "PASS"
assert a0_audit["recomputed_integrity"]["file_delta"] == {"changed": 10, "added": 3, "deleted": 0, "unexpected": 0}
assert sorted(a0_audit["allowed_changed_files"]) == changed
assert sorted(a0_audit["allowed_added_files"]) == added

# Source identity and page counts against frozen Stage 0 authority.
source_manifest = read_json(ROOT / "A_Level_CS_page/planning/paper1/stage-0/evidence/a2/SOURCE_MANIFEST.json")
sources = {x["id"]: x for x in source_manifest["primary_sources"] if x["id"].startswith(("9618_s21_", "9618_w21_"))}
assert len(sources) == 12
source_integrity = []
for sid, row in sorted(sources.items()):
    p = ROOT / row["path"]
    actual = sha(p)
    pages = len(PdfReader(str(p)).pages)
    assert actual == row["sha256"] and pages == row["page_count"]
    source_integrity.append({"source_id": sid, "path": row["path"], "sha256": actual, "bytes": p.stat().st_size, "page_count": pages, "matches_stage0": True, "remote_publisher_authenticity_checked": False})
assert sum(x["page_count"] for x in source_integrity) == 154

# Exact four-reference correction and retained legitimate Q7/Q8 context.
target_ids = ["9618_s21_qp_12-q8", "9618_w21_qp_11-q8", "9618_w21_qp_13-q8"]
false_pages = {
    "9618_s21_qp_12-q8": [15, 16],
    "9618_w21_qp_11-q8": [16],
    "9618_w21_qp_13-q8": [16],
}
true_pages = {"9618_s21_qp_12-q8": [14], "9618_w21_qp_11-q8": [15], "9618_w21_qp_13-q8": [15]}
ctx_findings = []
for qid in target_ids:
    v5row = read_json(V5 / "contexts" / f"{qid}.json")
    v6row = read_json(C / "contexts" / f"{qid}.json")
    idx5 = next(x for x in read_jsonl(V5 / "CONTEXT_INDEX.jsonl") if x["question_id"] == qid)
    idx6 = next(x for x in read_jsonl(C / "CONTEXT_INDEX.jsonl") if x["question_id"] == qid)
    assert v6row["question_start_page"] == true_pages[qid][0]
    assert v6row["continuation_pages"] == [] and v6row["all_context_pages"] == true_pages[qid]
    assert [x["pdf_page_1_based"] for x in v6row["source_evidence"]] == true_pages[qid]
    assert idx6 == v6row
    removed = sorted(set(v5row["all_context_pages"]) - set(v6row["all_context_pages"]))
    assert removed == false_pages[qid]
    ctx_findings.append({"question_id": qid, "source_id": v6row["source_qp_id"], "v5_pages": v5row["all_context_pages"], "v6_pages": v6row["all_context_pages"], "removed_false_pages": removed, "context_index_matches_record": True, "true_question_pages": true_pages[qid]})
assert sum(len(x["removed_false_pages"]) for x in ctx_findings) == 4

# All 45 non-target context records stay byte-identical. The five core corpus indexes, including the
# 34 parent-context marking records, are preserved exactly from v5.
v5_contexts = {p.name: sha(p) for p in (V5 / "contexts").glob("*.json")}
v6_contexts = {p.name: sha(p) for p in (C / "contexts").glob("*.json")}
changed_context_names = {f"{qid}.json" for qid in target_ids}
assert len(v5_contexts) == len(v6_contexts) == 48
assert all(v5_contexts[k] == v6_contexts[k] for k in v5_contexts.keys() - changed_context_names)
protected = ["QUESTION_INDEX.jsonl", "MARKING_INDEX.jsonl", "PAGE_INDEX.jsonl", "VISUAL_MANIFEST.json", "UNRESOLVED.md"]
protected_checks = []
for name in protected:
    same = (V5 / name).read_bytes() == (C / name).read_bytes()
    assert same
    protected_checks.append({"file": name, "sha256_v5": sha(V5 / name), "sha256_v6": sha(C / name), "byte_identical": True})

mark_rows = read_jsonl(C / "MARKING_INDEX.jsonl")
parent_rows = [x for x in mark_rows if x.get("link_type") == "PARENT_CONTEXT_ONLY"]
assert len(parent_rows) == 34
assert all(x["status"] == "UNRESOLVED" and x["mark_or_condition_or_null"] is None and x["table_row_ref_or_null"] is None for x in parent_rows)
old_parent_rows = [x for x in read_jsonl(V5 / "MARKING_INDEX.jsonl") if x.get("link_type") == "PARENT_CONTEXT_ONLY"]
assert parent_rows == old_parent_rows

# Recheck inherited whole-question Q1 correction without allocating its MS conditions to separate marks.
qrows = read_jsonl(C / "QUESTION_INDEX.jsonl")
q1 = next(x for x in qrows if x["id"] == "9618_w21_qp_12-q1")
mi = next(x for x in mark_rows if x["id"] == "9618_w21_qp_12-q1-mi-1")
assert q1["marks_displayed_or_null"] == 2 and q1["parent_id_or_null"] is None
assert q1["qp_locator"]["source_id"] == "9618_w21_qp_12" and q1["qp_locator"]["pdf_page_1_based"] == 2
assert mi["ms_locator"]["source_id"] == "9618_w21_ms_12" and mi["ms_locator"]["pdf_page_1_based"] == 3
assert mi["question_id_or_null"] == q1["id"] and mi["part_id_or_null"] is None and mi["table_row_ref_or_null"] is None
assert mi["visual_dependency_refs"] == ["9618_w21_ms_12-p3-whole-page"]
assert "3 correct lines only from Data Security" in mi["mark_or_condition_or_null"] and "2 correct lines only from Data Integrity" in mi["mark_or_condition_or_null"]

# Verify context index and context files for continued/shared Q7/Q8 cases stay the same as v5.
retained_qids = [
    "9618_s21_qp_11-q7", "9618_s21_qp_11-q8", "9618_s21_qp_13-q7", "9618_s21_qp_13-q8",
    "9618_s21_qp_12-q7", "9618_w21_qp_12-q7", "9618_w21_qp_12-q8",
]
retained_contexts = []
for qid in retained_qids:
    a = read_json(V5 / "contexts" / f"{qid}.json")
    b = read_json(C / "contexts" / f"{qid}.json")
    assert a == b
    retained_contexts.append({"question_id": qid, "all_context_pages": b["all_context_pages"], "continuation_pages": b["continuation_pages"], "byte_identical_to_v5": sha(V5 / "contexts" / f"{qid}.json") == sha(C / "contexts" / f"{qid}.json")})
assert read_json(C / "contexts/9618_s21_qp_11-q7.json")["all_context_pages"] == [15, 16]
assert read_json(C / "contexts/9618_s21_qp_11-q8.json")["all_context_pages"] == [16]
assert read_json(C / "contexts/9618_s21_qp_13-q7.json")["all_context_pages"] == [15, 16]
assert read_json(C / "contexts/9618_s21_qp_13-q8.json")["all_context_pages"] == [16]
assert read_json(C / "contexts/9618_w21_qp_12-q8.json")["all_context_pages"] == [13, 14, 15, 16]

# QP question-root/part display marks sum independently to each full-page cover's printed total.
totals = defaultdict(int)
for row in qrows:
    mark = row.get("marks_displayed_or_null")
    if mark is not None:
        totals[row["qp_locator"]["source_id"]] += int(mark)
totals = dict(sorted(totals.items()))
assert len(totals) == 6 and set(totals.values()) == {75}

# Build page-class metadata from the previous A3 page map plus this retest's added Q8 pages.
old_a3_manifest = read_json(ST / "evidence/a3/B21/retest_v5/SOURCE_EVIDENCE_MANIFEST_V5.json")
full_by_pair = {(x["source_id"], x["pdf_page_1_based"]): {**x, "review_classes": [x.get("review_class", "prior_v5_target")] } for x in old_a3_manifest["full_size_renders"]}
for sid in ["9618_s21_qp_12", "9618_w21_qp_11", "9618_w21_qp_13"]:
    for pn in [14, 15, 16]:
        full_by_pair.setdefault((sid, pn), {"source_id": sid, "pdf_page_1_based": pn, "review_classes": []})
        full_by_pair[(sid, pn)]["review_classes"].append("v6_q8_false_reference_source_page_retest")
for pn in [13, 14, 15, 16]:
    sid = "9618_w21_qp_12"
    full_by_pair.setdefault((sid, pn), {"source_id": sid, "pdf_page_1_based": pn, "review_classes": []})
    full_by_pair[(sid, pn)]["review_classes"].append("legitimate_q8_continuation_context_retest")
assert len(full_by_pair) == 44
full_renders = []
for (sid, pn), meta in sorted(full_by_pair.items()):
    name = f"{sid}-p{pn:02d}.png"
    p = OUT / "source_renders" / name
    assert p.is_file()
    source = sources[sid]
    assert source["sha256"] == next(x["sha256"] for x in source_integrity if x["source_id"] == sid)
    full_renders.append({
        "source_id": sid,
        "pdf_page_1_based": pn,
        "source_pdf_path": source["path"],
        "source_pdf_sha256": source["sha256"],
        "render_path": f"source_renders/{name}",
        "render_sha256": sha(p),
        "bytes": p.stat().st_size,
        "dimensions_px": [1191, 1684],
        "scale": "2x",
        "method": "PyMuPDF direct render from the SHA256-pinned original PDF; Matrix(2,2), RGB",
        "review_classes": sorted(set(meta["review_classes"])),
        "visual_review": "PASS_FULL_SIZE_SOURCE_PAGE_INSPECTED",
    })
assert len(list((OUT / "source_renders").glob("*.png"))) == len(full_renders) == 44

contact_sheets = []
for sid, source in sorted(sources.items()):
    p = OUT / "contact_sheets" / f"{sid}-all-pages.png"
    assert p.is_file()
    contact_sheets.append({"source_id": sid, "source_pdf_path": source["path"], "source_pdf_sha256": source["sha256"], "page_count": source["page_count"], "contact_sheet_path": f"contact_sheets/{p.name}", "contact_sheet_sha256": sha(p), "bytes": p.stat().st_size, "scale": 0.36, "visual_review": "PASS_REDUCED_SCALE_ALL_PAGES_SCREEN"})
assert len(contact_sheets) == len(list((OUT / "contact_sheets").glob("*.png"))) == 12

source_evidence = {
    "schema_version": "1.0",
    "task_id": "P1-S1-A3-B21-RETEST-V6",
    "reviewer_role": "Independent A3 source/context/scope reviewer",
    "work_order_sha256": EXPECTED["A_Level_CS_page/planning/paper1/stage-1/evidence/a0/B21_A3_V6_RETEST_DISPATCH.md"],
    "dispatch_record": dispatch_record_pin,
    "source_count": 12,
    "source_page_count_total": 154,
    "source_integrity": source_integrity,
    "full_size_page_count": len(full_renders),
    "full_size_renders": full_renders,
    "contact_sheet_count": len(contact_sheets),
    "contact_sheets": contact_sheets,
    "visual_coverage_statement": "All 154 pages were screened on the 12 reduced-scale contact sheets; full-size inspection is claimed only for the enumerated 44 source pages.",
    "limits": ["Reduced-scale contact sheets are a broad screen, not full-page semantic validation.", "Local Stage 0 source hashes were verified; remote Cambridge publisher authenticity was not independently rechecked.", "The 2021 past papers do not establish 2026 syllabus coverage, topic frequency or variant equivalence."],
}
(OUT / "SOURCE_EVIDENCE_MANIFEST_V6.json").write_text(json.dumps(source_evidence, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

render_manifest = {"schema_version": "1.0", "task_id": "P1-S1-A3-B21-RETEST-V6", "full_size_render_count": len(full_renders), "full_size_renders": full_renders, "contact_sheet_count": len(contact_sheets), "contact_sheets": contact_sheets, "all_page_total": 154, "contact_sheet_screen_status": "PASS_REDUCED_SCALE_ONLY"}
(OUT / "RENDER_CONTACT_SHEET_MANIFEST_V6.json").write_text(json.dumps(render_manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

findings = {
    "schema_version": "1.0",
    "artifact_version": "B21-A3-RETEST-v6",
    "task_id": "P1-S1-A3-B21-RETEST-V6",
    "reviewer_role": "Independent A3 same-version source/context/scope reviewer",
    "recommendation": "PASS_A3_ONLY",
    "gate_scope": "A3 source fidelity, context/scope accuracy and source-risk only. A9 and A0 batch decision remain required.",
    "candidate": {"artifact_version": "B21-A2-v6", "handoff_sha256": sha(C / "HANDOFF_CHECK.json"), "batch_manifest_sha256": sha(C / "BATCH_MANIFEST.json"), "snapshot_manifest_sha256": sha(C / "SNAPSHOT_MANIFEST.json"), "snapshot_file_count": len(candidate_files)},
    "criteria": [
        {"id": "A3-B21-V6-01", "criterion": "Four source-backed false Q8 context references removed; each correct root page retained", "status": "PASS", "records": ctx_findings},
        {"id": "A3-B21-V6-02", "criterion": "Legitimate Q7/Q8 shared and continuation contexts preserved", "status": "PASS", "records": retained_contexts},
        {"id": "A3-B21-V6-03", "criterion": "No unrelated semantic/context/scope drift; exact v5-to-v6 file delta", "status": "PASS_WITH_MINOR_METADATA_NOTE", "recomputed_file_delta": {"changed_existing": changed, "added": added, "deleted": deleted}, "A0_independent_file_delta": a0_audit["recomputed_integrity"]["file_delta"], "semantic_diff_metadata_note": {"status": "MINOR_DUPLICATED_ADDED_ROWS", "repeated_added_rows_in_changed_existing": repeated_added_rows, "top_level_added_list": sorted(fd["added"]), "content_impact": "none", "owner": "A0 aggregate manifest clarification"}},
        {"id": "A3-B21-V6-04", "criterion": "Inherited W21/12 whole-question Q1 correction retested without inferred MS allocation", "status": "PASS", "question_record": q1, "whole_question_ms_record": mi, "evidence_pages": [{"source_id": "9618_w21_qp_12", "pdf_page_1_based": 2, "render_sha256": next(x["render_sha256"] for x in full_renders if x["source_id"] == "9618_w21_qp_12" and x["pdf_page_1_based"] == 2)}, {"source_id": "9618_w21_ms_12", "pdf_page_1_based": 3, "render_sha256": next(x["render_sha256"] for x in full_renders if x["source_id"] == "9618_w21_ms_12" and x["pdf_page_1_based"] == 3)}]},
        {"id": "A3-B21-V6-05", "criterion": "All 34 explicit parent-context unresolved marking records remain unallocated", "status": "PASS", "count": len(parent_rows), "all_unresolved": True, "all_mark_condition_null": True, "all_table_row_null": True, "byte_identical_to_v5": True},
        {"id": "A3-B21-V6-06", "criterion": "Original source PDFs match Stage 0; all source pages screened", "status": "PASS", "source_count": 12, "source_pages": 154, "contact_sheets": 12},
        {"id": "A3-B21-V6-07", "criterion": "Displayed mark totals independently recomputed", "status": "PASS", "qp_totals": totals},
        {"id": "A3-B21-V6-08", "criterion": "Five protected corpus records and all non-target contexts preserved byte-for-byte", "status": "PASS", "protected_corpus_files": protected_checks, "non_target_context_records_byte_identical": 45},
        {"id": "A3-B21-V6-09", "criterion": "Source and syllabus scope flags remain governed by pinned Stage 0 authority", "status": "PASS", "flags": [{"id": "S1-I14", "severity": "MINOR", "status": "RETAINED_NONBLOCKING", "description": "Historic A3-v2 recorded A4-v2 digest remains unrecovered."}, {"id": "B21-SCOPE-01", "severity": "LOW", "status": "RETAINED", "description": "2021 sources do not prove 2026 lesson coverage, frequency or variant equivalence."}]},
    ],
    "source_integrity": source_integrity,
    "review_union": {"total_full_size_pages": len(full_renders), "includes_prior_v5_targets_context_continuity_and_covers": 31, "added_three_q8_page_triads": 9, "added_w21_12_q8_root_and_continuation_pages": 4, "contact_sheet_pages_screened": 154},
    "candidate_snapshot_files_verified": candidate_files,
    "candidate_untouched": True,
    "limits": source_evidence["limits"],
}
(OUT / "CONTEXT_SCOPE_FINDINGS_V6.json").write_text(json.dumps(findings, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

flags = {
    "schema_version": "1.0",
    "artifact_version": "B21-A3-RETEST-v6",
    "task_id": "P1-S1-A3-B21-RETEST-V6",
    "recommendation": "PASS_A3_ONLY",
    "flags": [
        {"id": "A9-B21-CTX-01", "severity": "MAJOR_PRIOR_FINDING", "status": "RESOLVED_V6", "description": "Four false Q8 context page references were removed from three Q8 context records and matching CONTEXT_INDEX records; each correct Q8 root page is retained."},
        {"id": "A3-B21-V6-META-01", "severity": "MINOR", "status": "OPEN_NONBLOCKING", "description": "V5_TO_V6_SEMANTIC_DIFF.file_level_delta.changed_existing repeats the three added artifacts with change_type=added, while the top-level added list correctly contains the same three paths. A3 and A0 both independently recompute 10 changed / 3 added / 0 deleted; no candidate content impact.", "owner": "A0 aggregate manifest clarification", "gate_impact": "No A3 content/context/scope blocker; retain for aggregate handoff clarity."},
        {"id": "S1-I14", "severity": "MINOR", "status": "RETAINED_NONBLOCKING", "description": "Historic A3-v2 recorded A4-v2 digest remains unrecovered."},
        {"id": "B21-SCOPE-01", "severity": "LOW", "status": "RETAINED", "description": "2021 sources do not prove 2026 lesson coverage, frequency or variant equivalence."},
    ],
    "limits": ["PASS applies to the A3 gate only.", "A9 v6 and A0 batch decision remain mandatory.", "Remote Cambridge publisher authenticity was not independently rechecked."],
}
(OUT / "SCOPE_FLAGS_RETEST_V6.json").write_text(json.dumps(flags, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

report = f'''# B21 A3 v6 context, source and scope retest

Task: P1-S1-A3-B21-RETEST-V6. Candidate: frozen B21-A2-v6. **Recommendation: PASS for the A3 gate only.** A9 v6 and A0's batch decision remain required; this is not batch acceptance.

## Exact Q8 context correction

I rehashed the 12 original B21 Paper 1 QP/MS PDFs against Stage 0 and rendered the relevant original question pages at 2x. The three corrected Q8 records now retain exactly their true prompt pages: S21/12 Q8 on PDF p.14; W21/11 Q8 on p.15; and W21/13 Q8 on p.15. S21/12 p.15 is headed BLANK PAGE and p.16 carries copyright/imprint matter; W21/11 p.16 and W21/13 p.16 are likewise blank/imprint pages. Those four pages are not part of the respective Q8 prompts. Candidate context JSON and matching CONTEXT_INDEX entries both carry only the source-backed Q8 page and no false continuation pages. Their full-size render hashes are pinned in SOURCE_EVIDENCE_MANIFEST_V6.json.

## Legitimate continued context and Q1

S21/11 and S21/13 Q7 each starts on p.15 and continues on p.16, with Q8 beginning on p.16 as a shared-page case. Their Q7/Q8 context records are unchanged from v5; matching MS p.9 Q7 and p.10 Q8 pages were inspected full-size. W21/12 Q7 remains on p.12 and Q8 starts p.13 with continuation through pp.14–16; I inspected the full Q8 sequence. Its context and all other legitimate Q7/Q8 shared or continuation records remain byte-identical to v5.

The inherited W21/12 whole-question Q1 correction also remains exact: the original QP p.2 prints Q1 [2], and the MS p.3 contains one Q1 row totalling 2 marks across the Data Security and Data Integrity conditions. The candidate stores mark 2 on the unparted Q1 root and links one exact-label whole-question MS item to p.3 and its whole-page visual dependency. It does not assign an inferred mark to either condition.

## Semantic delta, unresolved parents and scope flags

I independently rehashed all {len(candidate_files)} candidate snapshot files and recomputed the v5-to-v6 directory delta: {len(changed)} existing files changed, {len(added)} files added, and {len(deleted)} deleted. The ten changed files are the three target context records, CONTEXT_INDEX, correction evidence and revision/validation handoff metadata. No question, marking, page, visual, transcript, source, dependency, unresolved or unrelated context data changed; all 45 non-target context records and the five protected corpus files are byte-identical to v5. A0's pinned independent audit separately recomputes 10/3/0 and lists the same allowed paths.

There is one MINOR evidence-metadata note: the candidate's V5_TO_V6_SEMANTIC_DIFF `changed_existing` array also repeats the three newly added files, each with `change_type: added`, while its top-level `added` list correctly lists those same three files. This is duplicated presentation in the diff manifest only; the actual path delta is 10/3/0, independently confirmed by A0, with no candidate content impact. Owner for aggregate manifest clarification: A0. It does not block the A3 source/context/scope gate.

All 34 `PARENT_CONTEXT_ONLY` marking records remain `UNRESOLVED`, with mark/condition and table-row fields null; the 34 records are byte-identical to v5. Scope authority remains the pinned 2026 syllabus and Stage 0 scope artifacts. The retained S1-I14 historic digest note stays MINOR/nonblocking. The 2021 source corpus does not prove 2026 lesson coverage, frequency, or variant equivalence, and no such claim is made here.

## Source and visual review

All 12 local QP/MS PDFs match the Stage 0 SHA256 pins and total 154 pages. Twelve contact sheets were screened at reduced scale for all 154 pages. I inspected 44 full-size original-page renders: the prior 31 risk/context/cover pages, nine pages covering p.14–16 of the three corrected QP sources, and four pages p.13–16 for the retained W21/12 Q8 sequence. The 44 page/render hashes, 12 contact-sheet hashes, and source pins are listed in SOURCE_EVIDENCE_MANIFEST_V6.json. Contact sheets are a broad screen, not full-page semantic validation. Remote publisher authenticity was not independently rechecked.

I independently summed all displayed QP root/part marks; all six papers total 75, matching the visible full-size cover statement. These sums are integrity checks only; no mark was inferred from the total.

## A3 gate disposition

The four false Q8 references are source-backed and removed; legitimate continued/shared Q7/Q8 context and the inherited whole-question Q1 correction are preserved. No A3 Major or Critical context/scope finding remains. Recommendation: **PASS_A3_ONLY**, with the MINOR diff-manifest duplication retained as a nonblocking A0 clarification item. A9 v6 and A0 batch decision remain open. Candidate, sources, tracker and app were not edited.
'''
(OUT / "CONTEXT_SCOPE_RETEST_V6.md").write_text(report, encoding="utf-8")

risk = f'''# B21 A3 v6 source-risk retest

## Integrity and exact context pages

- Verified 12 original Paper 1 QP/MS PDFs against Stage 0: {sum(x['page_count'] for x in source_integrity)} pages total, all SHA256 and page counts match.
- S21/12 Q8 is on PDF p.14 only; p.15 is blank and p.16 is copyright/imprint. W21/11 and W21/13 Q8 are on p.15 only; each p.16 is blank/imprint. Candidate records and CONTEXT_INDEX match these page sets.
- W21/12 Q8 is a real four-page sequence on pp.13–16. S21/11 and S21/13 each have Q7 on pp.15–16 and Q8 beginning on p.16; paired MS pages p.9 and p.10 distinguish Q7 from Q8. These legitimate contexts remain unchanged.

## Inherited risk targets and Q1

Rechecked the 13 distinct MS marking-item IDs across 12 MS pages and the four QP target IDs using full-size original-page renders. The W21/12 Q1 root remains marked 2 from QP p.2; the corresponding single MS Q1 row is on p.3 and remains an exact whole-question link with both mark conditions preserved as wording, without splitting or allocating marks to the conditions. Independently recomputed six paper totals: all are 75 and match the printed cover total. Totals were used only as integrity checks.

All 34 parent-context-only marking records remain unresolved and null for mark/condition and table-row fields. Source/scope notes continue to distinguish historical 2021 papers from 2026 syllabus coverage.

## Delta and residual metadata note

Independent path hashing plus the pinned A0 audit yield 10 changed existing paths, three added paths, and zero deleted paths; only three Q8 context files and their correction/index/metadata records changed. A MINOR duplicated listing repeats the three added files inside the candidate semantic-diff `changed_existing` array, each explicitly labelled `added`, and again in the accurate top-level added list. There is no content or locator impact. A0 owns aggregate manifest clarification.

## Review limits and disposition

All 154 pages were screened on 12 reduced-scale contact sheets; 44 exact pages received full-size inspection. The contact sheets do not replace page-level validation. Local Stage 0 source hashes were checked; remote Cambridge publisher authenticity was not rechecked. A3 recommendation is PASS for this gate only; A9 v6 and A0 batch decision remain mandatory.
'''
(OUT / "SOURCE_RISK_RETEST_V6.md").write_text(risk, encoding="utf-8")

# Freeze complete evidence and output inventory. Handoff/checksum are excluded from their own output hash list.
output_files = []
for p in sorted(x for x in OUT.rglob("*") if x.is_file() and x.name not in {"HANDOFF_RETEST_V6.json", "HANDOFF_RETEST_V6.sha256"}):
    output_files.append({"path": rel(p), "sha256": sha(p), "bytes": p.stat().st_size})
handoff = {
    "schema_version": "1.0",
    "artifact_version": "B21-A3-RETEST-v6",
    "task_id": "P1-S1-A3-B21-RETEST-V6",
    "status": "FROZEN_FOR_A0_INTEGRITY_AUDIT",
    "recommendation": "PASS_A3_ONLY",
    "gate_scope": "A3 source/context/scope only; A9 v6 and A0 batch decision remain mandatory.",
    "write_allowlist": "A_Level_CS_page/planning/paper1/stage-1/evidence/a3/B21/retest_v6/",
    "candidate_untouched": True,
    "dispatch_record": dispatch_record_pin,
    "frozen_input_pins": input_pins,
    "candidate_snapshot_files_verified": candidate_files,
    "source_integrity": source_integrity,
    "source_page_total": 154,
    "full_size_pages_reviewed": 44,
    "contact_sheets_screened": 12,
    "independent_delta_recompute": {"changed_existing": changed, "added": added, "deleted": deleted, "A0_audit_delta": a0_audit["recomputed_integrity"]["file_delta"]},
    "context_retest": ctx_findings,
    "retained_q7_q8_contexts": retained_contexts,
    "parent_context_unresolved_count": len(parent_rows),
    "whole_question_q1_retest": {"question_id": q1["id"], "displayed_mark": 2, "qp_page": 2, "ms_page": 3, "no_child_mark_allocation": True},
    "six_qp_totals": totals,
    "minor_metadata_note": {"id": "A3-B21-V6-META-01", "owner": "A0 aggregate manifest clarification", "content_impact": "none"},
    "limits": source_evidence["limits"],
    "output_files_excluding_handoff_and_checksum": output_files,
    "output_file_count_excluding_handoff_and_checksum": len(output_files),
    "stop_point": "Stop for A0 handoff integrity audit. A9 v6 and A0 batch decision remain mandatory.",
}
handoff_path = OUT / "HANDOFF_RETEST_V6.json"
handoff_path.write_text(json.dumps(handoff, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
handoff_sha = sha(handoff_path)
(OUT / "HANDOFF_RETEST_V6.sha256").write_text(f"{handoff_sha}  HANDOFF_RETEST_V6.json\n", encoding="utf-8")
print(json.dumps({"handoff_sha256": handoff_sha, "recommendation": handoff["recommendation"], "candidate_files": len(candidate_files), "source_pdfs": len(source_integrity), "source_pages": 154, "full_size_pages": 44, "contact_sheets": 12, "parent_context_unresolved": len(parent_rows), "delta": {"changed": len(changed), "added": len(added), "deleted": len(deleted)}, "minor_metadata_note": "A0 aggregate manifest clarification", "output_pins": len(output_files)}, indent=2))
