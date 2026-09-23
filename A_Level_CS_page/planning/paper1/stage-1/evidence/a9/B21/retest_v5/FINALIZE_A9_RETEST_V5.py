from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[8]
EVIDENCE = ROOT / "A_Level_CS_page/planning/paper1/stage-1/evidence"
OUT = EVIDENCE / "a9/B21/retest_v5"
CAND = EVIDENCE / "a2/B21/versions/B21-A2-v5"


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def dump(path: Path, data):
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


checks = json.loads((OUT / "INTEGRITY_AND_CROSSREF_CHECKS_V5.json").read_text(encoding="utf-8"))
render_manifest = json.loads((OUT / "SOURCE_RENDER_MANIFEST_V5.json").read_text(encoding="utf-8"))
candidate_handoff = json.loads((CAND / "HANDOFF_CHECK.json").read_text(encoding="utf-8"))
snapshot = json.loads((CAND / "SNAPSHOT_MANIFEST.json").read_text(encoding="utf-8"))
source_manifest = json.loads((ROOT / "A_Level_CS_page/planning/paper1/stage-0/evidence/a2/SOURCE_MANIFEST.json").read_text(encoding="utf-8"))
sources = {x["id"]: x for x in source_manifest["primary_sources"]}
questions = [json.loads(x) for x in (CAND / "QUESTION_INDEX.jsonl").read_text(encoding="utf-8").splitlines() if x.strip()]
roots = {q["id"]: q for q in questions if "source_qp_id" in q}
contexts = {c["question_id"]: c for c in [json.loads(x) for x in (CAND / "CONTEXT_INDEX.jsonl").read_text(encoding="utf-8").splitlines() if x.strip()]}
visual = json.loads((CAND / "VISUAL_MANIFEST.json").read_text(encoding="utf-8"))["regions"]
visual_by_page = {(r["source_id"], r["pdf_page_1_based"]): r for r in visual}
render_by_page = {(r["source_id"], r["pdf_page_1_based"]): r for r in render_manifest["full_size_target_renders"]}

manual_target_pages = {
    ("9618_s21_ms_11", 4), ("9618_s21_ms_11", 5), ("9618_s21_ms_11", 6),
    ("9618_s21_ms_12", 5),
    ("9618_s21_ms_13", 4), ("9618_s21_ms_13", 5), ("9618_s21_ms_13", 6),
    ("9618_w21_ms_11", 3), ("9618_w21_ms_11", 8), ("9618_w21_ms_12", 8),
    ("9618_w21_ms_13", 3), ("9618_w21_ms_13", 8),
    ("9618_s21_qp_12", 2), ("9618_w21_qp_12", 2), ("9618_w21_qp_12", 6), ("9618_w21_qp_12", 12),
    ("9618_w21_ms_12", 3),
}
q7q8_pages = {
    ("9618_s21_qp_11", 15), ("9618_s21_qp_11", 16),
    ("9618_s21_qp_12", 13), ("9618_s21_qp_12", 14), ("9618_s21_qp_12", 15), ("9618_s21_qp_12", 16),
    ("9618_s21_qp_13", 15), ("9618_s21_qp_13", 16),
    ("9618_w21_qp_11", 14), ("9618_w21_qp_11", 15), ("9618_w21_qp_11", 16),
    ("9618_w21_qp_12", 12), ("9618_w21_qp_12", 13), ("9618_w21_qp_12", 14), ("9618_w21_qp_12", 15), ("9618_w21_qp_12", 16),
    ("9618_w21_qp_13", 14), ("9618_w21_qp_13", 15), ("9618_w21_qp_13", 16),
}

visual_rows = []
for key in sorted(manual_target_pages):
    src, page = key
    region = visual_by_page[key]
    asset = CAND / region["rendered_asset_ref"]
    visual_rows.append({"source_id": src, "pdf_page_1_based": page, "role": "VIS-01 target" if key != ("9618_w21_ms_12", 3) else "S1-I16 paired MS source page",
                        "candidate_region_id": region["id"], "candidate_region_asset": region["rendered_asset_ref"],
                        "candidate_asset_sha256": sha(asset), "candidate_asset_opened_full_size": True,
                        "source_render": render_by_page[key]["path"], "source_render_sha256": render_by_page[key]["render_sha256"],
                        "review_result": "Page is complete and readable; target structure is legible; no clipping observed."})

context_rows = []
page_observations = {
    ("9618_s21_qp_11", 15): "Question 7 begins.",
    ("9618_s21_qp_11", 16): "Question 7 continues and Question 8 begins on the same page.",
    ("9618_s21_qp_12", 13): "Question 7 appears.",
    ("9618_s21_qp_12", 14): "Question 8 begins and completes on this page.",
    ("9618_s21_qp_12", 15): "Printed BLANK PAGE; no Question 8 content.",
    ("9618_s21_qp_12", 16): "Copyright/imprint and series matter; no Question 8 content.",
    ("9618_s21_qp_13", 15): "Question 7 begins.",
    ("9618_s21_qp_13", 16): "Question 7 continues and Question 8 begins on the same page.",
    ("9618_w21_qp_11", 14): "Question 7 appears.",
    ("9618_w21_qp_11", 15): "Question 8 appears and completes on this page.",
    ("9618_w21_qp_11", 16): "Copyright/imprint and series matter; no Question 8 content.",
    ("9618_w21_qp_12", 12): "Question 7 appears.",
    ("9618_w21_qp_12", 13): "Question 8 begins.",
    ("9618_w21_qp_12", 14): "Question 8 continues.",
    ("9618_w21_qp_12", 15): "Question 8 continues.",
    ("9618_w21_qp_12", 16): "Question 8 continues.",
    ("9618_w21_qp_13", 14): "Question 7 appears.",
    ("9618_w21_qp_13", 15): "Question 8 appears and completes on this page.",
    ("9618_w21_qp_13", 16): "Copyright/imprint and series matter; no Question 8 content.",
}
for src, page in sorted(q7q8_pages):
    source = sources[src]
    render = render_by_page[(src, page)]
    pdf = ROOT / source["path"]
    raw_text = (PdfReader(str(pdf)).pages[page - 1].extract_text() or "").strip()
    is_blank = "BLANK PAGE" in raw_text
    context_rows.append({"source_id": src, "pdf_page_1_based": page, "render": render["path"], "render_sha256": render["render_sha256"],
                         "full_size_source_page_opened": True, "direct_text_excerpt": raw_text[:700],
                         "visual_observation": page_observations[(src, page)],
                         "used_by_affected_context": any(page in contexts[qid]["continuation_pages"] and contexts[qid]["source_qp_id"] == src for qid in ["9618_s21_qp_12-q8", "9618_w21_qp_11-q8", "9618_w21_qp_13-q8"])})

visual_log = {
    "task_id": "P1-S1-A9-B21-RETEST-V5", "candidate": "B21-A2-v5",
    "whole_source_screen": {"source_pdfs": 12, "source_pages": 154, "contact_sheets": 12, "contact_sheet_overview_only": True,
                             "contact_sheet_pages": 154, "full_size_target_render_count": 35,
                             "reduced_scale_limit": "Contact sheets were used for all-page visual-risk discovery only; they are not claimed as full-size content validation."},
    "candidate_visual_target_assets": visual_rows,
    "full_size_q7_q8_source_pages": context_rows,
    "q7_q8_summary": "Q7 continuation pages in the S21/11 and S21/13 papers and the W21/12 Q8 p13-p16 sequence are supported by full-size source pages. Three Q8 context records additionally attach four non-question page references: one explicit blank and three copyright/imprint pages.",
}
dump(OUT / "VISUAL_REVIEW_LOG_V5.json", visual_log)

issue = checks["blocking_findings"][0]
findings = {
    "schema_version": "1.0", "task_id": "P1-S1-A9-B21-RETEST-V5", "candidate": "B21-A2-v5",
    "candidate_handoff_sha256": candidate_handoff["handoff_self_hash"], "recommendation": "CHANGES_REQUIRED",
    "findings": [issue],
    "criterion_status": [{"id": c["id"], "status": c["status"]} for c in checks["checks"]],
    "non_blocking_limitations": [checks["known_nonblocking_limit"], checks["remote_authenticity_limit"],
                                 "All-page contact sheets are a reduced-scale screen. 35 designated pages were rendered full size; this is not a full-size visual audit of every page."],
    "batch_acceptance_claimed": False, "A0_decision_required": True,
}
dump(OUT / "FINDINGS_V5.json", findings)

# Materialize named evidence pins for dispatch, corpus, specialist handoffs, prior A9, and source authority.
frozen_names = [
    ("dispatch_work_order", EVIDENCE / "a0/B21_A9_V5_RETEST_DISPATCH.md"),
    ("dispatch_record", EVIDENCE / "a0/B21_A9_V5_RETEST_DISPATCH_RECORD.json"),
    ("candidate_handoff", CAND / "HANDOFF_CHECK.json"), ("candidate_batch_manifest", CAND / "BATCH_MANIFEST.json"),
    ("candidate_snapshot_manifest", CAND / "SNAPSHOT_MANIFEST.json"),
    ("candidate_a0_audit", EVIDENCE / "a0/B21_A2_V5_A0_AUDIT.json"), ("candidate_validator", EVIDENCE / "a0/B21_A2_V5_A0_VALIDATE.json"),
    ("a3_handoff", EVIDENCE / "a3/B21/retest_v5/HANDOFF_RETEST_V5.json"), ("a3_a0_audit", EVIDENCE / "a0/B21_A3_V5_HANDOFF_AUDIT.json"),
    ("a4_handoff", EVIDENCE / "a4/B21/retest_v5/HANDOFF_RETEST_V5.json"), ("a4_a0_audit", EVIDENCE / "a0/B21_A4_V5_HANDOFF_AUDIT.json"),
    ("prior_a9_review", EVIDENCE / "a9/B21/BATCH_REVIEW.md"), ("prior_a9_findings", EVIDENCE / "a9/B21/FINDINGS.md"),
    ("stage0_source_manifest", ROOT / "A_Level_CS_page/planning/paper1/stage-0/evidence/a2/SOURCE_MANIFEST.json"),
    ("corpus_schema", ROOT / "A_Level_CS_page/planning/paper1/stage-1/CORPUS_SCHEMA.md"),
    ("extraction_policy", ROOT / "A_Level_CS_page/planning/paper1/stage-1/EXTRACTION_POLICY.md"),
]
named_inputs = [{"name": name, "path": path.relative_to(ROOT).as_posix(), "sha256": sha(path), "bytes": path.stat().st_size} for name, path in frozen_names]
candidate_outputs = [{"path": x["path"], "sha256": x["sha256"], "bytes": x["bytes"]} for x in candidate_handoff["declared_output_hashes"]]
specialist_outputs = {}
for role, rel in [("A3", "a3/B21/retest_v5/HANDOFF_RETEST_V5.json"), ("A4", "a4/B21/retest_v5/HANDOFF_RETEST_V5.json")]:
    handoff = json.loads((EVIDENCE / rel).read_text(encoding="utf-8"))
    key = "output_files_excluding_this_handoff_and_checksum" if role == "A3" else "output_files_excluding_handoff_and_checksum"
    specialist_outputs[role] = handoff[key]
input_manifest = {
    "schema_version": "1.0", "task_id": "P1-S1-A9-B21-RETEST-V5", "review_target": "B21-A2-v5",
    "frozen_named_inputs": named_inputs,
    "candidate_declared_output_count": len(candidate_outputs), "candidate_declared_outputs": candidate_outputs,
    "candidate_snapshot_file_count": len(snapshot["files"]), "candidate_snapshot_manifest_entries": snapshot["files"],
    "same_version_specialist_outputs": specialist_outputs,
    "source_pdfs": [{"source_id": s["id"], "path": s["path"], "sha256": s["sha256"], "bytes": s["bytes"], "page_count": s["page_count"]}
                    for s in source_manifest["primary_sources"] if s["id"].startswith(("9618_s21_", "9618_w21_"))],
    "direct_source_render_inventory": render_manifest,
}
dump(OUT / "INPUT_MANIFEST_V5.json", input_manifest)

review_md = f'''# Independent A9 batch retest — B21 A2 v5

Task: `P1-S1-A9-B21-RETEST-V5`  
Candidate: `B21-A2-v5`  
Recommendation: **CHANGES_REQUIRED** for the B21 batch gate. This is A9's recommendation only; A0 makes the batch decision.

## Gate result

The frozen candidate and specialist handoffs match all dispatched hashes. Candidate integrity checks passed for all {len(snapshot['files'])} snapshot entries and {len(candidate_handoff['declared_output_hashes'])} declared outputs. The 12 Stage 0 Paper 1 PDFs match their hashes and page counts ({sum(x['page_count'] for x in input_manifest['source_pdfs'])} pages total). I independently screened all pages using 12 direct-source contact sheets and inspected all {render_manifest['full_size_target_render_count']} designated full-page source renders. All 13 VIS-01 MS marking items across 12 MS pages and all four QP target regions have exact source/page relations, candidate assets, and matching MS dependencies where required; the candidate assets are readable and unclipped. The W21/12 Q1 correction is exact and does not invent a child part. All six QP displayed-mark sums independently match the printed cover total 75. All 34 explicit parent-context unresolved marking rows preserve null mark/condition/table-row allocations. Whole-candidate schema and cross-reference checks found no other broken reference.

One source-context defect blocks the batch gate:

| Affected root record | Candidate context pages | Source evidence | Required correction |
|---|---|---|---|
| `9618_s21_qp_12-q8` | p.14, 15, 16 | Q8 completes on p.14; p.15 is explicitly `BLANK PAGE`; p.16 is copyright/imprint matter. | Keep Q8 p.14 only. |
| `9618_w21_qp_11-q8` | p.15, 16 | Q8 is on p.15; p.16 is copyright/imprint matter. | Keep Q8 p.15 only. |
| `9618_w21_qp_13-q8` | p.15, 16 | Q8 is on p.15; p.16 is copyright/imprint matter. | Keep Q8 p.15 only. |

Finding **A9-B21-CTX-01** is **MAJOR / OPEN_BLOCKING**, owner **A2-B21 via A0**. The four false page references occur in `continuation_pages` and `source_evidence` of the three context records; `all_context_pages` includes the same non-question pages. Remove those page entries in a new immutable candidate version and regenerate dependent manifests. Require A0 integrity/schema validation followed by same-version A3, A4, and independent A9 retests.

## Evidence and limits

- [Criterion checks](INTEGRITY_AND_CROSSREF_CHECKS_V5.json) — frozen pins, candidate and specialist file hashes, source hashes/page counts, target/cross-reference checks, totals, unresolved rows, and Q7/Q8 context check.
- [Findings](FINDINGS_V5.json) — the blocker, exact affected records/pages, owner, and retest requirements.
- [Input manifest](INPUT_MANIFEST_V5.json) — frozen candidate snapshot, specialist outputs, 12 original PDFs, and direct render/contact-sheet hashes.
- [Visual review log](VISUAL_REVIEW_LOG_V5.json) and [source render manifest](SOURCE_RENDER_MANIFEST_V5.json) — {render_manifest['contact_sheet_pages_total']} reduced-scale page views, target and Q7/Q8 full-size page evidence, and asset hashes.
- Historic S1-I14 remains open as a non-blocking provenance limitation; this review does not recover the A4-v2 digest. Local source hashes were verified against Stage 0; remote Cambridge authenticity was not independently checked. Contact sheets are an overview screen only, not full-size validation of all pages.

The candidate, earlier evidence, trackers, source PDFs, and app were not changed. A9 does not claim batch acceptance or Stage 1 completion.
'''
(OUT / "BATCH_REVIEW_V5.md").write_text(review_md, encoding="utf-8")

# Freeze the evidence directory, excluding only the handoff and checksum sidecar.
output_files = []
for path in sorted(p for p in OUT.rglob("*") if p.is_file() and p.name not in {"HANDOFF_RETEST_V5.json", "HANDOFF_RETEST_V5.sha256"}):
    output_files.append({"path": path.relative_to(ROOT).as_posix(), "sha256": sha(path), "bytes": path.stat().st_size})

dispatch = json.loads((EVIDENCE / "a0/B21_A9_V5_RETEST_DISPATCH_RECORD.json").read_text(encoding="utf-8"))
a3_handoff = json.loads((EVIDENCE / "a3/B21/retest_v5/HANDOFF_RETEST_V5.json").read_text(encoding="utf-8"))
a4_handoff = json.loads((EVIDENCE / "a4/B21/retest_v5/HANDOFF_RETEST_V5.json").read_text(encoding="utf-8"))
handoff = {
    "schema_version": "1.0", "task_id": "P1-S1-A9-B21-RETEST-V5", "status": "FROZEN_FOR_A0_AUDIT",
    "reviewer_role": "Independent A9; authored neither candidate nor A3/A4 specialist retests.",
    "candidate": {"version": "B21-A2-v5", "handoff_sha256": sha(CAND / "HANDOFF_CHECK.json"), "batch_manifest_sha256": sha(CAND / "BATCH_MANIFEST.json"),
                  "snapshot_manifest_sha256": sha(CAND / "SNAPSHOT_MANIFEST.json"), "declared_output_count": len(candidate_handoff["declared_output_hashes"]), "snapshot_file_count": len(snapshot["files"])},
    "dispatch": {"work_order_path": dispatch["work_order"]["path"], "work_order_sha256": sha(EVIDENCE / "a0/B21_A9_V5_RETEST_DISPATCH.md"),
                 "dispatch_record_path": "A_Level_CS_page/planning/paper1/stage-1/evidence/a0/B21_A9_V5_RETEST_DISPATCH_RECORD.json", "dispatch_record_sha256": sha(EVIDENCE / "a0/B21_A9_V5_RETEST_DISPATCH_RECORD.json"),
                 "write_allowlist": dispatch["write_allowlist"]},
    "same_version_specialist_reviews": {
        "A3": {"handoff_sha256": sha(EVIDENCE / "a3/B21/retest_v5/HANDOFF_RETEST_V5.json"), "a0_audit_sha256": sha(EVIDENCE / "a0/B21_A3_V5_HANDOFF_AUDIT.json"), "a0_audit_status": "PASS", "recommendation": a3_handoff["recommendation"]},
        "A4": {"handoff_sha256": sha(EVIDENCE / "a4/B21/retest_v5/HANDOFF_RETEST_V5.json"), "a0_audit_sha256": sha(EVIDENCE / "a0/B21_A4_V5_HANDOFF_AUDIT.json"), "a0_audit_status": "PASS", "recommendation": a4_handoff["recommendation"]},
    },
    "recommendation": "CHANGES_REQUIRED", "batch_acceptance_claimed": False, "a0_batch_decision": "PENDING",
    "criteria": [{"id": c["id"], "status": c["status"]} for c in checks["checks"]],
    "finding_ids": [f["id"] for f in checks["blocking_findings"]],
    "output_files_excluding_handoff_and_checksum": output_files,
    "output_file_count_excluding_handoff_and_checksum": len(output_files),
    "source_pdf_count": len(input_manifest["source_pdfs"]), "source_pages_total": sum(x["page_count"] for x in input_manifest["source_pdfs"]),
    "render_coverage": {"contact_sheets": len(render_manifest["contact_sheets"]), "contact_sheet_pages": render_manifest["contact_sheet_pages_total"], "full_size_source_renders": render_manifest["full_size_target_render_count"], "whole_size_semantic_validation_of_all_154_claimed": False},
    "stop_point": "Frozen A9 handoff submitted to A0 for integrity audit and batch decision. Do not infer acceptance or Stage 1 completion.",
}
dump(OUT / "HANDOFF_RETEST_V5.json", handoff)
handoff_sha = sha(OUT / "HANDOFF_RETEST_V5.json")
(OUT / "HANDOFF_RETEST_V5.sha256").write_text(f"{handoff_sha}  HANDOFF_RETEST_V5.json\n", encoding="ascii")
print(json.dumps({"handoff_sha256": handoff_sha, "output_files": len(output_files), "recommendation": handoff["recommendation"], "finding_ids": handoff["finding_ids"]}, indent=2))
