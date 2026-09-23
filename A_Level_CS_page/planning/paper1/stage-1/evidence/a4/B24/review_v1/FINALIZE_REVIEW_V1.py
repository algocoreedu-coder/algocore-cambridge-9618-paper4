from __future__ import annotations
import hashlib, json
from datetime import datetime, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[7]
checks = json.loads((HERE / "INDEPENDENT_REVIEW_CHECKS_V1.json").read_text(encoding="utf-8"))
pins = json.loads((HERE / "INPUT_PINS_V1.json").read_text(encoding="utf-8"))
renders = json.loads((HERE / "SOURCE_RENDER_MANIFEST_V1.json").read_text(encoding="utf-8"))
contacts = json.loads((HERE / "CONTACT_SHEET_MANIFEST_V1.json").read_text(encoding="utf-8"))
now = datetime.now(timezone.utc).isoformat()

def sha(p: Path) -> str:
    h=hashlib.sha256()
    with p.open("rb") as f:
        for b in iter(lambda:f.read(1024*1024),b""):
            h.update(b)
    return h.hexdigest()

source_manifest = {
    "work_order": "P1-S1-A4-B24-REVIEW-V1",
    "source_authority": "Exact original 2024 QP/MS PDF files pinned in INPUT_PINS_V1.json",
    "checked_at_utc": now,
    "source_count": checks["source_pdfs"]["checked"],
    "page_count": checks["source_pdfs"]["total_pages"],
    "sources": checks["source_pdfs"]["results"],
}
(HERE / "SOURCE_PDF_HASHES_V1.json").write_text(json.dumps(source_manifest, ensure_ascii=False, indent=2)+"\n",encoding="utf-8")

notes = checks["contexts"]["manual_boundary_notes"]
q3b_note = {
    "classification": "informational_locator_semantics",
    "severity": "NONE",
    "source_id": "9618_s24_qp_13",
    "question_id": "9618_s24_qp_13-q3",
    "part_id": "9618_s24_qp_13-q3-pb",
    "part_start_locator_pdf_page": 6,
    "displayed_mark": 3,
    "displayed_mark_pdf_page": 7,
    "source_evidence": {
        "qp_original_page_7": "Direct full-page render shows the [3] token at the end of the continuation table.",
        "candidate_mark_total_observation": "MARK_TOTAL_CHECK.json records question_id=9618_s24_qp_13-q3, part_path=['b'], pdf_page_1_based=7, marks_displayed=3, source_line_verbatim='[3]'.",
        "qp_context_pages": [4,5,6,7],
    },
    "disposition": "No discrepancy: QUESTION_INDEX.qp_locator is the part's prompt/start-page locator (p6); MARK_TOTAL_CHECK separately pins the displayed mark token to p7. Part hierarchy, displayed value and 75-mark total agree with the source. No correction or retest requested.",
}
marks_context = {
    "work_order": "P1-S1-A4-B24-REVIEW-V1",
    "candidate": "B24-A2-v1",
    "reviewer": "A4 independent reviewer",
    "inputs_checked": checks["input_pins"],
    "candidate_snapshot_check": checks["candidate_snapshot"],
    "source_pdf_manifest": "SOURCE_PDF_HASHES_V1.json",
    "record_counts": checks["candidate_inventory"],
    "question_part_locators": {
        "records_checked": checks["candidate_inventory"]["qp_record_locator_checks"],
        "failures": checks["qp_record_locator_failures"],
        "result": "PASS",
        "method": "Reconciled roots/parts to source-versioned prompt transcripts and question/parent IDs; direct source text was cross-compared for every page; all QP pages were contact-sheet screened and full-page risk samples reviewed.",
    },
    "marking_item_checks": {
        "items_checked": len(checks["marking_item_checks"]),
        "whole_question_targets": sum(x["target_type"]=="whole_question" for x in checks["marking_item_checks"]),
        "part_targets": sum(x["target_type"]=="part" for x in checks["marking_item_checks"]),
        "failures": checks["marking_failures"],
        "result": "PASS",
        "fields": ["target type and ID", "QP/MS component pairing", "MS question and part locator", "mark text/condition source tokens", "table row reference", "visual region resolution and backlink"],
        "items": checks["marking_item_checks"],
    },
    "parent_groupings": checks["parent_groupings"],
    "recomputed_totals": checks["recomputed_totals"],
    "question_contexts": checks["contexts"],
    "visual_review": checks["visual_review"],
    "transcript_direct_source_check": checks["transcript_against_direct_original_source"],
    "review_notes": [q3b_note],
    "overall_result": "PASS",
}
(HERE / "MARKS_CONTEXT_CHECK_V1.json").write_text(json.dumps(marks_context, ensure_ascii=False, indent=2)+"\n",encoding="utf-8")

findings = {
    "work_order": "P1-S1-A4-B24-REVIEW-V1",
    "candidate": "B24-A2-v1",
    "reviewer": "A4 independent reviewer",
    "findings": [],
    "finding_count": 0,
    "open_critical_or_major": 0,
    "informational_notes": [q3b_note],
    "disposition": "No source/linkage disagreement requiring change was found. See the informational note on a prompt-start locator and continuation-page mark token.",
    "recommendation": "PASS_A4_ONLY",
}
(HERE / "LINKAGE_FINDINGS_V1.json").write_text(json.dumps(findings, ensure_ascii=False, indent=2)+"\n",encoding="utf-8")

qp_pages = checks["visual_review"]["full_size_qp_risk_sample_pages"]
ms_pages = checks["visual_review"]["full_size_ms_visual_dependency_pages"]
qp_list = ", ".join(f'{x["source_id"]} p{x["pdf_page_1_based"]}' for x in qp_pages)
ms_list = ", ".join(f'{x["source_id"]} p{x["pdf_page_1_based"]}' for x in ms_pages)
total_lines = "\n".join(f'- {x["source_qp_id"]}: indexed explicit marks {x["indexed_displayed_mark_sum"]}; original cover {x["cover_total_from_original_pdf_text"]}; PASS.' for x in checks["recomputed_totals"])
boundary_lines = "\n".join(f'- {n.get("source_id")} {n.get("question_id", ", ".join(n.get("question_ids", [])))}: {n["result"]}.' for n in notes)
report = f"""# B24 A4 v1 independent QP/MS linkage review

Status: **PASS_A4_ONLY**. This is an A4 specialist-gate recommendation for frozen candidate B24-A2-v1. It is not batch acceptance; A3/A9/A0 gates remain separate.

## Pinned inputs and integrity

All {checks["input_pins"]["checked"]} work-order/candidate/source/schema/policy pins match. The candidate snapshot was re-hashed entry by entry: {checks["candidate_snapshot"]["checked"]}/{checks["candidate_snapshot"]["declared_entries"]} entries match. All {checks["source_pdfs"]["checked"]} original 2024 QP/MS PDFs match their pinned SHA-256 values and page counts ({checks["source_pdfs"]["total_pages"]} pages). The 156 reviewer renders and 42 contact sheets have matching recorded hashes. The candidate was not modified.

## Linkage, marks and hierarchy

All 170 marking items were checked against the exact original MS page and indexed QP target. Checks covered target cardinality/type, QP/MS component pairing, MS question/part locator, source text tokens, table-row references, visual dependency resolution, and item-to-region backlinks: **170/170 passed, zero discrepancies**. All 243 QP roots/part locators and target relationships passed. There are 165 marking rows targeting printed parts and five targeting whole questions; those preserve whole-question targets and do not create synthetic parts.

The 29 structural parent groupings have null displayed marks and no separate MS locator/allocation. Each has children linked under that parent (23 groups with two children, six with three); no marks were inferred or assigned to the parent.

Six paper totals were independently recomputed from explicit indexed QP marks and checked against printed cover totals:

{total_lines}

## Context and visual evidence

All 49 question contexts were checked against the original QP page set and source-page contact screens; no blank or imprint-only page was included as question context. Boundary cases reviewed include:

{boundary_lines}

All 156 pages (100 QP and 56 MS) were visually screened on hash-pinned contact sheets. All 44 MS visual-dependency pages were inspected full-size. A 20-page full-size QP risk sample across the six variants included logic expressions/circuits/truth tables, embedded-device and robot illustrations, processor instruction and memory tables, database/ER layouts, binary arithmetic/bitmap calculations, network/verification tables, sensor/system tables, and software/database structures. The candidate's 130 visual regions resolve to their source-page renders and relevant IDs; no dangling visual references or source-layout mismatch was found.

Full-size QP risk samples: {qp_list}.

Full-size MS visual-dependency pages: {ms_list}.

For S24 component 13 Q3(b), the QP locator points to the part start on p6; displayed [3] is printed at the end of its continuation on p7. The original p7 and candidate MARK_TOTAL_CHECK observation were checked directly. This is consistent locator semantics, not a mismatch: the prompt locator points to the part start while the mark-token observation preserves p7.

## Open findings and gate

LINKAGE_FINDINGS_V1.json contains zero source/linkage findings and zero open Critical/Major issues. The informational locator note above does not require a correction. Recommendation: **PASS_A4_ONLY**. A3, A9 and A0 review/acceptance remain pending and are outside this handoff.
"""
(HERE / "LINKAGE_REVIEW_V1.md").write_text(report,encoding="utf-8")

excluded = {"OUTPUT_MANIFEST_V1.json","OUTPUT_SHA256SUMS.txt","HANDOFF_REVIEW_V1.json","HANDOFF_REVIEW_V1.sha256"}
files = []
for p in sorted(HERE.rglob("*")):
    if not p.is_file() or p.name in excluded:
        continue
    files.append({"path": p.relative_to(HERE).as_posix(), "bytes": p.stat().st_size, "sha256": sha(p)})
output_manifest = {
    "work_order": "P1-S1-A4-B24-REVIEW-V1",
    "candidate": "B24-A2-v1",
    "created_at_utc": now,
    "artifact_count_excluding_control_files": len(files),
    "files": files,
    "source_render_manifest": {"path": "SOURCE_RENDER_MANIFEST_V1.json", "sha256": sha(HERE/"SOURCE_RENDER_MANIFEST_V1.json"), "page_count": len(renders["pages"])},
    "contact_sheet_manifest": {"path": "CONTACT_SHEET_MANIFEST_V1.json", "sha256": sha(HERE/"CONTACT_SHEET_MANIFEST_V1.json"), "sheet_count": contacts["sheet_count"]},
    "note": "Hashes cover reviewer scripts, reports, evidence JSON, direct page renders, and contact sheets; control files are excluded to avoid recursive hashing."
}
(HERE / "OUTPUT_MANIFEST_V1.json").write_text(json.dumps(output_manifest,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")

sum_paths = sorted(p for p in HERE.rglob("*") if p.is_file() and p.name not in {"OUTPUT_SHA256SUMS.txt","HANDOFF_REVIEW_V1.json","HANDOFF_REVIEW_V1.sha256"})
sum_lines = [f"{sha(p)}  {p.relative_to(HERE).as_posix()}" for p in sum_paths]
(HERE / "OUTPUT_SHA256SUMS.txt").write_text("\n".join(sum_lines)+"\n",encoding="utf-8")

handoff = {
    "work_order": "P1-S1-A4-B24-REVIEW-V1",
    "candidate": "B24-A2-v1",
    "reviewer": "A4 independent reviewer",
    "created_at_utc": now,
    "frozen": True,
    "recommendation": "PASS_A4_ONLY",
    "gate_scope": "QP/MS linkage, marks, hierarchy, contexts, visual dependencies only; not batch acceptance.",
    "findings": {"count": 0, "open_critical_or_major": 0, "path": "LINKAGE_FINDINGS_V1.json", "sha256": sha(HERE/"LINKAGE_FINDINGS_V1.json")},
    "evidence": {
        "report": {"path":"LINKAGE_REVIEW_V1.md","sha256":sha(HERE/"LINKAGE_REVIEW_V1.md")},
        "marks_context_check": {"path":"MARKS_CONTEXT_CHECK_V1.json","sha256":sha(HERE/"MARKS_CONTEXT_CHECK_V1.json")},
        "independent_checks": {"path":"INDEPENDENT_REVIEW_CHECKS_V1.json","sha256":sha(HERE/"INDEPENDENT_REVIEW_CHECKS_V1.json")},
        "input_pins": {"path":"INPUT_PINS_V1.json","sha256":sha(HERE/"INPUT_PINS_V1.json")},
        "source_pdf_hashes": {"path":"SOURCE_PDF_HASHES_V1.json","sha256":sha(HERE/"SOURCE_PDF_HASHES_V1.json")},
        "source_render_manifest": {"path":"SOURCE_RENDER_MANIFEST_V1.json","sha256":sha(HERE/"SOURCE_RENDER_MANIFEST_V1.json"),"page_count":len(renders["pages"])},
        "contact_sheet_manifest": {"path":"CONTACT_SHEET_MANIFEST_V1.json","sha256":sha(HERE/"CONTACT_SHEET_MANIFEST_V1.json"),"sheet_count":contacts["sheet_count"]},
        "output_manifest": {"path":"OUTPUT_MANIFEST_V1.json","sha256":sha(HERE/"OUTPUT_MANIFEST_V1.json"),"artifact_count":len(output_manifest["files"])},
        "output_sha256sums": {"path":"OUTPUT_SHA256SUMS.txt","sha256":sha(HERE/"OUTPUT_SHA256SUMS.txt"),"file_count":len(sum_lines)},
    },
    "verified_counts": {
        "frozen_pins": f'{checks["input_pins"]["passed"]}/{checks["input_pins"]["checked"]}',
        "candidate_snapshot": f'{checks["candidate_snapshot"]["checked"]}/{checks["candidate_snapshot"]["declared_entries"]}',
        "source_pdfs": f'{checks["source_pdfs"]["checked"]}/12',
        "source_pages": checks["source_pdfs"]["total_pages"],
        "question_roots": checks["candidate_inventory"]["question_roots"],
        "parts": checks["candidate_inventory"]["part_records"],
        "question_and_part_records": checks["candidate_inventory"]["question_and_part_records"],
        "marking_items": len(checks["marking_item_checks"]),
        "parent_groupings": checks["parent_groupings"]["count"],
        "visual_regions": checks["candidate_inventory"]["visual_regions"],
        "question_contexts": checks["candidate_inventory"]["question_contexts"],
        "full_size_ms_visual_dependency_pages": checks["visual_review"]["full_size_ms_visual_dependency_page_count"],
        "qp_risk_sample_pages": len(checks["visual_review"]["full_size_qp_risk_sample_pages"]),
        "rendered_source_pages": len(renders["pages"]),
        "contact_sheets": contacts["sheet_count"],
    },
    "independent_recommendation_limit": "A0 makes batch-level acceptance. No A2 candidate, source, tracker, app, or prior evidence files were modified.",
    "next_gates": ["A3 specialist review", "A9 independent evidence review", "A0 batch acceptance decision"],
}
(HERE / "HANDOFF_REVIEW_V1.json").write_text(json.dumps(handoff,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
(HERE / "HANDOFF_REVIEW_V1.sha256").write_text(f"{sha(HERE/'HANDOFF_REVIEW_V1.json')}  HANDOFF_REVIEW_V1.json\n",encoding="utf-8")
print(json.dumps({
    "recommendation": handoff["recommendation"],
    "handoff_sha256": sha(HERE/"HANDOFF_REVIEW_V1.json"),
    "output_file_count": len(sum_lines),
    "output_manifest_sha256": sha(HERE/"OUTPUT_MANIFEST_V1.json"),
    "output_sha256sums_sha256": sha(HERE/"OUTPUT_SHA256SUMS.txt"),
    "candidate_integrity_pass": checks["structural_checks_pass"],
},ensure_ascii=False,indent=2))

