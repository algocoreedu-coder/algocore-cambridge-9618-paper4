import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[8]  # Computer_Science workspace root
STAGE1 = ROOT / "A_Level_CS_page/planning/paper1/stage-1"
OUT = STAGE1 / "evidence/a4/B25/review_v1"
CAND = STAGE1 / "evidence/a2/B25/versions/B25-A2-v1"

def sha(path):
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()

def dump(name, obj):
    (OUT / name).write_text(json.dumps(obj, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

pre = json.loads((OUT / "PRELIMINARY_AUDIT_V1.json").read_text(encoding="utf-8"))
pins = json.loads((OUT / "INPUT_PINS_V1.json").read_text(encoding="utf-8"))
render = json.loads((OUT / "SOURCE_RENDER_MANIFEST_V1.json").read_text(encoding="utf-8"))
contacts = json.loads((OUT / "SOURCE_CONTACT_SHEET_MANIFEST_V1.json").read_text(encoding="utf-8"))
batch = json.loads((CAND / "BATCH_MANIFEST.json").read_text(encoding="utf-8"))
totals = json.loads((CAND / "MARK_TOTAL_CHECK.json").read_text(encoding="utf-8"))

ctx_rows = [
    ("9618_s25_qp_11-q3", 7, 4, "s25_qp_11-p007.txt", "A shop installs a new system"),
    ("9618_s25_qp_12-q2", 5, 3, "s25_qp_12-p005.txt", "A computer program uses a digital camera"),
    ("9618_s25_qp_12-q5", 11, 6, "s25_qp_12-p011.txt", "A company has multiple sites"),
    ("9618_w25_qp_11-q2", 7, 3, "w25_qp_11-p007.txt", "Draw a logic circuit"),
    ("9618_w25_qp_11-q5", 11, 6, "w25_qp_11-p011.txt", "The processor uses several registers"),
    ("9618_w25_qp_12-q7", 13, 8, "w25_qp_12-p013.txt", "A restaurant accesses software"),
    ("9618_w25_qp_12-q9", 15, 10, "w25_qp_12-p015.txt", "A programmer is developing a computer program"),
    ("9618_w25_qp_13-q1", 3, 2, "w25_qp_13-p003.txt", "Data in a computer system is represented in binary"),
    ("9618_w25_qp_13-q3", 5, 4, "w25_qp_13-p005.txt", "A network engineer is setting up a Local Area Network"),
]
context_findings = []
for qid, page, next_q, transcript_suffix, excerpt in ctx_rows:
    source_id = qid.rsplit("-q", 1)[0]
    transcript = CAND / "transcripts" / (source_id + f"-p{page:03}.txt")
    text = transcript.read_text(encoding="utf-8", errors="replace")
    context = json.loads((CAND / "contexts" / f"{qid}.json").read_text(encoding="utf-8"))
    assert page in context["continuation_pages"]
    assert str(next_q) in text[:500]
    context_findings.append({
        "question_id": qid,
        "source_id": source_id,
        "pdf_page_1_based": page,
        "indexed_as": "continuation_page of " + qid.rsplit("-q", 1)[1],
        "observed_page_start": f"Question {next_q}",
        "source_evidence": {"transcript": f"transcripts/{source_id}-p{page:03}.txt", "opening_text": excerpt},
        "visual_evidence": f"source_renders/{source_id}-p{page:03}.png",
        "finding": "A new numbered question starts on this page; it is not continuation content of the preceding indexed question."
    })

findings = {
    "work_order": "P1-S1-A4-B25-REVIEW-V1",
    "candidate": "B25-A2-v1",
    "scope": "A4 linkage/mark/source/visual review only; the six 2025 Paper 1 variants, no 2022 sources",
    "recommendation": "CHANGES_REQUIRED",
    "findings": [
        {
            "finding_id": "A4-B25-CTX-01", "severity": "MAJOR", "owner": "A2", "retest": "Correct the nine context records in a new frozen candidate version; rerun context/page-boundary validation and A4 against that exact version.",
            "summary": "Nine continuation_pages entries include pages where the next numbered question begins. This makes the question-context boundary/linkage wrong and may cause study content to attach to the preceding question.",
            "instances": context_findings
        },
        {
            "finding_id": "A4-B25-CTX-02", "severity": "MINOR", "owner": "A2", "retest": "Remove PDF p9 from continuation_pages for 9618_w25_qp_13-q5 in a new candidate version; retain p7-p8 as actual Q5 continuations.",
            "summary": "W25/13 Q5 context marks PDF p9 as continuation although the page only says “Question 6 starts on the next page.” Q5 does continue on p7-p8; p9 is a boundary notice, not Q5 content.",
            "evidence": {"source_id": "9618_w25_qp_13", "pdf_page_1_based": 9, "candidate_context": "contexts/9618_w25_qp_13-q5.json", "transcript": "transcripts/9618_w25_qp_13-p009.txt", "visual": "source_renders/9618_w25_qp_13-p009.png", "observed_text": "Question 6 starts on the next page."}
        },
        {
            "finding_id": "A4-B25-MS-01", "severity": "MINOR", "owner": "A2", "retest": "In a new candidate version, keep 7(e) answer/mark text scoped to the 7(e) row and exclude the following table header.",
            "summary": "The 7(e) marking item includes the following generic table header (“Question Answer Marks”) after its source mark value. The header belongs to the next table, not the 7(e) answer row.",
            "evidence": {"record_id": "9618_w25_qp_13-q7-pe-mi-1", "source_id": "9618_w25_ms_13", "pdf_page_1_based": 12, "table_row_ref": "7(e)", "candidate_suffix": "3 Question Answer Marks", "source_visual": "source_renders/9618_w25_ms_13-p012.png", "source_transcript": "transcripts/9618_w25_ms_13-p012.txt", "note": "The candidate accurately preserves the published source phrase “Programming time is saved as code does not have to written from scratch”; the original MS PDF has the same wording, so this is not reported as a candidate discrepancy."}
        }
    ],
    "non_findings": [
        {"id": "A4-B25-CONTEXT-VALID-01", "record_id": "9618_s25_qp_11-q8", "source_id": "9618_s25_qp_11", "pdf_page_1_based": 15, "assessment": "Valid continuation: Q8's memory-table content continues on p15; excluded from the false-context findings."},
        {"id": "A4-B25-MS-SOURCE-TYPO-01", "record_id": "9618_w25_qp_13-q8-pb-mi-1", "source_id": "9618_w25_ms_13", "pdf_page_1_based": 12, "assessment": "No candidate discrepancy: source PDF and candidate both read “does not have to written from scratch”; this is a source-published grammatical typo, not an A2 omission."}
    ],
    "automated_normalized_text_exceptions": {
        "count": 16,
        "method": "Whitespace-normalized candidate mark_or_condition compared to extracted transcript of the pinned MS source page; non-contiguous differences manually reviewed against direct source page render.",
        "adjudication": "14 exceptions visually correspond to the same source marking content despite PDF text extraction/line order/glyph serialization. The remaining two are represented by finding A4-B25-MS-01 and the no-discrepancy source typo assessment above.",
        "exception_records": [x["id"] for x in pre["mark_failures"]]
    }
}
dump("LINKAGE_FINDINGS_V1.json", findings)

checks = {
    "work_order": "P1-S1-A4-B25-REVIEW-V1",
    "candidate_version": "B25-A2-v1",
    "source_scope": {"year": 2025, "variants": ["s25/11", "s25/12", "s25/13", "w25/11", "w25/12", "w25/13"], "source_pdf_count": 12, "total_pdf_pages": 178, "all_source_ids_contain_s25_or_w25": True},
    "frozen_input_verification": {"pin_count": len(pins["pins"]), "pin_pass_count": sum(p["status"] == "PASS" for p in pins["pins"]), "candidate_snapshot_declared_and_verified": 438, "snapshot_failures": 0, "candidate_handoff_sha256": "6087afbba526210bb4566d005fd278224e9078b3fcddb91ccdd410f62e17ae7b", "candidate_batch_manifest_sha256": "7ab0ea8a747d54c8d50157784d2dae5c1158c95b4db2049ae50f077364b7e244"},
    "index_counts": pre["counts"],
    "linkage": {"invalid_question_part_locator_or_parent_links": len(pre["linkage_failures"]), "all_183_marking_items_and_question_part_targets_checked": True, "marking_item_invalid_or_dangling_targets": 0, "visual_dependencies": {"regions": 144, "qp_regions": 88, "ms_regions": 56, "dangling_or_wrong_page_dependencies": len(pre["visual_failures"]), "direct_original_source_renders": len(render["pages"])}, "parent_groups": {"count": 27, "each_group_has_direct_children": True, "all_children_ms_linked": True, "inferred_parent_mark_allocation": False}},
    "marks": {"six_qp_cover_totals": [{"source_id": x["source_id"], "cover_total": x["printed_cover_total"], "index_sum": x["index_displayed_mark_sum"], "status": x["status"]} for x in pre["mark_totals"]], "all_six_equal_75": all(x["printed_cover_total"] == 75 and x["index_displayed_mark_sum"] == 75 for x in pre["mark_totals"]), "independent_source_mark_observations": sum(x["mark_observation_count"] for x in totals["pairs"].values()), "observations_reconciled_to_candidate_by_question_part_page_and_value": 183, "whole_question_root_mark_rows": 3, "whole_question_rows_use_question_targets_no_synthetic_part": True},
    "context": {"records_reviewed": 51, "confirmed_next_question_starts_misclassified_as_continuation": context_findings, "count_major": len(context_findings), "boundary_notice_only_minor": {"question_id": "9618_w25_qp_13-q5", "page": 9}, "verified_valid_continuation": {"question_id": "9618_s25_qp_11-q8", "page": 15}},
    "visual_review": {"all_ms_dependency_pages_directly_visual_reviewed": 56, "qp_region_pages_screened_on_contact_sheets": 88, "qp_full_size_risk_sample_pages": pre["qp_full_size_sample"], "qp_full_size_sample_count": len(pre["qp_full_size_sample"]), "renders": {"dpi": 144, "format": "PNG direct from pinned PDF via pdftoppm", "unique_pages": 144, "source_render_manifest": "SOURCE_RENDER_MANIFEST_V1.json", "contact_sheet_count": len(contacts["contact_sheets"]), "contact_sheet_manifest": "SOURCE_CONTACT_SHEET_MANIFEST_V1.json"}},
    "automated_source_text_check": {"normalized_noncontiguous_exceptions": 16, "visually_adjudicated_exceptions": 16, "confirmed_candidate_row_boundary_contamination": "9618_w25_qp_13-q7-pe-mi-1", "candidate_matches_original_on_w25_qp_13_q8b_ungrammatical_phrase": True},
    "recommendation": "CHANGES_REQUIRED"
}
dump("MARKS_CONTEXT_CHECK_V1.json", checks)

report = """# B25 A4 independent linkage review — v1\n\n**Recommendation: CHANGES_REQUIRED.** This review is limited to linkage/source evidence in B25-A2-v1 and the six exact 2025 Paper 1 QP/MS pairs. It is not a batch release decision.\n\n## Frozen inputs and scope\n\nAll 14 recorded input pins pass, including the dispatch, candidate handoff, batch manifest, snapshot, A0 audit, Stage 0 source manifest, schema and extraction policy. The 438-entry candidate snapshot matches. The 12 original PDFs are all 2025 sources (`s25` or `w25`), total 178 pages, and match the pinned Stage 0/candidate hashes and page counts. No 2022 source was used. The detailed pins are in `INPUT_PINS_V1.json`; direct render hashes are in `SOURCE_RENDER_MANIFEST_V1.json`.\n\n## Linkage, marks and hierarchy\n\nThe candidate has 51 roots, 207 parts, 258 question/part rows, 183 marking items, 27 parent groups and 51 context records. Structural checks found no invalid question/part locator scope, parent relation, marking target or visual dependency. All 27 grouping parents have direct children, those children are MS-linked, and no score allocation is inferred at the parent. Reconciliation of the source mark observations found 183/183 matching the indexed question/part path, PDF page and mark value. All six printed cover totals and indexed sums are 75/75. Whole-question marks use question targets and no synthetic part was found.\n\n## Findings\n\n**A4-B25-CTX-01 — MAJOR:** nine context records include a page on which the next numbered question begins, while marking that page as continuation of the previous question. These are s25/11 Q3 p7→Q4; s25/12 Q2 p5→Q3; s25/12 Q5 p11→Q6; w25/11 Q2 p7→Q3; w25/11 Q5 p11→Q6; w25/12 Q7 p13→Q8; w25/12 Q9 p15→Q10; w25/13 Q1 p3→Q2; and w25/13 Q3 p5→Q4. For each, the indexed context record lists the page under `continuation_pages`; its transcript opening and direct original page render show the next question. This is a boundary/linkage issue with a material risk of attaching content to the wrong question. A2 should correct these records in a new frozen candidate version and A4 should retest it.\n\n**A4-B25-CTX-02 — MINOR:** w25/13 Q5 context includes p9 as a continuation page, but p9 only contains “Question 6 starts on the next page.” Q5 content continues on p7–p8; p9 is a boundary notice.\n\n**A4-B25-MS-01 — MINOR:** `9618_w25_qp_13-q7-pe-mi-1`, source `9618_w25_ms_13` PDF p12, incorporates the next generic “Question / Answer / Marks” table header after the 7(e) answer and mark. Keep the row content bounded to the 7(e) row.\n\nA text-normalization script reported 16 non-contiguous candidate/MS transcript comparisons. All 16 affected source pages were reviewed visually. Fourteen are extraction/line-serialization differences whose marking content matches the page visually. Two needed careful distinction: 7(e) contains the row-boundary header reported above; for W25/13 Q8(b), both candidate and original PDF read “does not have to written from scratch,” so this is a source-published grammatical typo and **not** a candidate discrepancy.\n\n## Visual/source evidence\n\nAll 56 MS visual dependency pages were viewed from direct PDF renders; all 88 QP region pages were screened across contact sheets; the risk-based full-size QP sample contains 25 pages across all six variants and includes the 11 context-risk pages. In total, 144 unique original pages were rendered at 144 DPI from the pinned PDFs. Dimensions, source/page identities, byte counts and hashes are frozen in the render manifest. The dependency structure has zero dangling/wrong-page references.\n\n## Gate\n\nThe MAJOR context-boundary finding fails the A4 gate; the recommendation is **CHANGES_REQUIRED**. This is A4-only evidence and does not accept the batch. A2 should provide a new frozen candidate handoff and snapshot for the context fixes and row-boundary correction; then dispatch a fresh independent A4 retest. A3, A9 and A0 remain separate gates.\n"""
(OUT / "LINKAGE_REVIEW_V1.md").write_text(report, encoding="utf-8")

# Hash every frozen input source PDF and every rendered page for an independently inspectable source record.
source_rows = []
for item in batch["source_validation"]["checks"]:
    pdf = ROOT / item["relative_path"]
    source_rows.append({"source_id": item["source_id"], "relative_path": item["relative_path"], "page_count": item["page_count_actual"], "sha256": sha(pdf), "matches_pinned": sha(pdf) == item["sha256_expected"]})
dump("SOURCE_PDF_HASHES_V1.json", {"sources": source_rows, "count": len(source_rows), "total_pages": sum(x["page_count"] for x in source_rows), "all_match": all(x["matches_pinned"] for x in source_rows)})

# Output manifest excludes itself and the final handoff/checksum to avoid recursive hashes.
exclude = {"OUTPUT_MANIFEST_V1.json", "OUTPUT_SHA256SUMS.txt", "HANDOFF_REVIEW_V1.json", "HANDOFF_REVIEW_V1.sha256"}
files = []
for p in sorted(OUT.rglob("*")):
    if p.is_file() and p.name not in exclude:
        rel = p.relative_to(OUT).as_posix()
        files.append({"path": rel, "bytes": p.stat().st_size, "sha256": sha(p)})
dump("OUTPUT_MANIFEST_V1.json", {"work_order": "P1-S1-A4-B25-REVIEW-V1", "manifest_excludes": sorted(exclude), "file_count": len(files), "files": files})

# Conventional checksum list covers the frozen evidence and output manifest, excluding
# itself and the handoff (whose hash is independently pinned by its sidecar).
sum_exclude = {"OUTPUT_SHA256SUMS.txt", "HANDOFF_REVIEW_V1.json", "HANDOFF_REVIEW_V1.sha256"}
sum_lines = []
for p in sorted(OUT.rglob("*")):
    if p.is_file() and p.name not in sum_exclude:
        sum_lines.append(f"{sha(p)}  {p.relative_to(OUT).as_posix()}")
(OUT / "OUTPUT_SHA256SUMS.txt").write_text("\n".join(sum_lines) + "\n", encoding="ascii")

handoff = {
    "work_order": "P1-S1-A4-B25-REVIEW-V1",
    "candidate_version": "B25-A2-v1",
    "candidate_handoff_sha256": pins["pins"][1]["actual_sha256"],
    "candidate_batch_manifest_sha256": pins["pins"][2]["actual_sha256"],
    "candidate_snapshot_manifest_sha256": pins["pins"][3]["actual_sha256"],
    "a0_candidate_audit_sha256": pins["pins"][4]["actual_sha256"],
    "dispatch_sha256": pins["pins"][0]["actual_sha256"],
    "source_pdf_hash_manifest": {"path": "evidence/a4/B25/review_v1/SOURCE_PDF_HASHES_V1.json", "sha256": sha(OUT / "SOURCE_PDF_HASHES_V1.json"), "source_count": len(source_rows), "page_count": sum(x["page_count"] for x in source_rows)},
    "input_pin_report": {"path": "evidence/a4/B25/review_v1/INPUT_PINS_V1.json", "sha256": sha(OUT / "INPUT_PINS_V1.json"), "pin_count": len(pins["pins"]), "all_pass": all(p["status"] == "PASS" for p in pins["pins"])},
    "outputs": {"manifest_path": "evidence/a4/B25/review_v1/OUTPUT_MANIFEST_V1.json", "manifest_sha256": sha(OUT / "OUTPUT_MANIFEST_V1.json"), "sha256sums_path": "evidence/a4/B25/review_v1/OUTPUT_SHA256SUMS.txt", "sha256sums_sha256": sha(OUT / "OUTPUT_SHA256SUMS.txt"), "sha256sums_entries": len(sum_lines), "file_count": len(files), "rendered_source_pages": len(render["pages"]), "visual_regions": 144, "findings": 3},
    "recommendation": "CHANGES_REQUIRED",
    "gate_scope": "A4 independent QP/MS linkage/source review only; not batch acceptance",
    "finding_ids": ["A4-B25-CTX-01", "A4-B25-CTX-02", "A4-B25-MS-01"],
    "comparison_to_A3": "Not in A4 remit; independent A3 gate remains separate.",
    "stop": "Frozen handoff submitted for A0 audit; candidate, prior evidence, trackers and app were not modified."
}
dump("HANDOFF_REVIEW_V1.json", handoff)
(OUT / "HANDOFF_REVIEW_V1.sha256").write_text(sha(OUT / "HANDOFF_REVIEW_V1.json") + "  HANDOFF_REVIEW_V1.json\n", encoding="ascii")
print(json.dumps({"handoff_sha256": sha(OUT / "HANDOFF_REVIEW_V1.json"), "output_manifest_sha256": sha(OUT / "OUTPUT_MANIFEST_V1.json"), "output_sha256sums_sha256": sha(OUT / "OUTPUT_SHA256SUMS.txt"), "sha256sums_entries": len(sum_lines), "files_in_output_manifest": len(files), "source_pages": len(render["pages"]), "source_pdfs": len(source_rows), "source_pdf_pages": sum(x["page_count"] for x in source_rows), "recommendation": handoff["recommendation"]}, indent=2))
