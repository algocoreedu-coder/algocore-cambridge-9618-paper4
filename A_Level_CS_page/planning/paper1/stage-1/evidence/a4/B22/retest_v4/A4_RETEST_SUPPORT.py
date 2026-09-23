"""Reproducible read-only integrity checks and direct source-page rendering for B22 A4 v4.

Run from the Computer_Science workspace root with Python 3, pypdf and Pillow.
The script reads frozen candidate/source files and writes only below this retest folder.
"""
from __future__ import annotations

import hashlib
import json
import re
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont
from pypdf import PdfReader

ROOT = Path.cwd()
PAPER = ROOT / "A_Level_CS_page/planning/paper1"
S1 = PAPER / "stage-1"
S0 = PAPER / "stage-0"
CAND = S1 / "evidence/a2/B22/versions/B22-A2-v4"
OUT = S1 / "evidence/a4/B22/retest_v4"
POPPLER = Path(r"C:/Users/Nguyen/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/Library/bin/pdftoppm.exe")


def sha(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, obj):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main():
    renders = OUT / "renders/direct_source"
    contacts = OUT / "contact_sheets"
    renders.mkdir(parents=True, exist_ok=True)
    contacts.mkdir(parents=True, exist_ok=True)

    srcman_path = S0 / "evidence/a2/SOURCE_MANIFEST.json"
    srcman = load(srcman_path)
    srcs = {x["id"]: x for x in srcman["primary_sources"]}
    paper_sources = {k: v for k, v in srcs.items() if k.startswith(("9618_s22_", "9618_w22_"))}
    qp_sources = {k: v for k, v in paper_sources.items() if "_qp_" in k}
    assert len(qp_sources) == 6, len(qp_sources)
    assert len(paper_sources) == 12, len(paper_sources)
    evidence = load(CAND / "CORRECTION_EVIDENCE.json")
    handoff = load(CAND / "HANDOFF_CHECK.json")
    batch = load(CAND / "BATCH_MANIFEST.json")
    snapshot = load(CAND / "SNAPSHOT_MANIFEST.json")
    handoff_sources = handoff["source_integrity"]["sources"]
    v3 = load(S1 / "evidence/a2/B22/versions/B22-A2-v3/VISUAL_MANIFEST.json")
    v4 = load(CAND / "VISUAL_MANIFEST.json")
    old_regions = {x["id"]: x for x in v3["regions"]}
    new_regions = {x["id"]: x for x in v4["regions"]}
    changed_regions = [new_regions[k] for k in sorted(new_regions) if k not in old_regions or old_regions[k] != new_regions[k]]

    question_index = [json.loads(line) for line in (CAND / "QUESTION_INDEX.jsonl").open(encoding="utf-8")]
    marking_index = [json.loads(line) for line in (CAND / "MARKING_INDEX.jsonl").open(encoding="utf-8")]
    targets: dict[str, set[int]] = {k: set() for k in paper_sources}
    for sid in qp_sources:
        targets[sid].add(1)  # covers
    for r in evidence["mark_corrections"]:
        targets[r["source_id"]].add(int(r["pdf_page_1_based"]))
    for r in evidence["locator_corrections"]:
        targets[r["source_id"]].add(int(r["v4_pdf_page_1_based"]))
    for r in changed_regions:
        targets[r["source_id"]].add(int(r["pdf_page_1_based"]))
    context_source_pages = set()
    for item in question_index:
        if item.get("context_required"):
            sid = item["qp_locator"]["source_id"]
            page = int(item["qp_locator"]["pdf_page_1_based"])
            targets[sid].add(page)
            context_source_pages.add((sid, page))
    regions_by_id = {r["id"]: r for r in v4["regions"]}
    for item in marking_index:
        for ref in item["visual_dependency_refs"]:
            region = regions_by_id.get(ref)
            if region:
                targets[region["source_id"]].add(int(region["pdf_page_1_based"]))
    whole_question_targets = [m for m in marking_index if m["question_id_or_null"] is not None and m["part_id_or_null"] is None]
    for item in whole_question_targets:
        targets[item["ms_locator"]["source_id"]].add(int(item["ms_locator"]["pdf_page_1_based"]))
    # Supplemental sanity check of W22/12 Q1 page 2; this page is outside the B22
    # mandated correction/visual/cover union and is reported separately.
    targets["9618_w22_qp_12"].add(2)

    source_checks = []
    render_rows = []
    by_source: dict[str, list[Path]] = {}
    for sid in sorted(paper_sources):
        meta = paper_sources[sid]
        source = ROOT / meta["path"]
        actual_hash = sha(source)
        reader = PdfReader(str(source))
        actual_pages = len(reader.pages)
        source_ok = actual_hash == meta["sha256"] and actual_pages == meta["page_count"]
        source_checks.append({"source_id": sid, "path": meta["path"], "expected_sha256": meta["sha256"], "actual_sha256": actual_hash,
                             "expected_page_count": meta["page_count"], "actual_page_count": actual_pages, "matches_stage0": source_ok})
        if not source_ok:
            raise RuntimeError(f"Source mismatch: {sid}")
        candidate_source = next(x for x in handoff_sources if x["source_id"] == sid)
        batch_source = next(x for x in batch["inputs"] if x["source_id"] == sid)
        source_ok &= candidate_source["sha256_actual"] == actual_hash == candidate_source["sha256_stage0"] == batch_source["sha256_baseline"] == batch_source["sha256_verified"]
        source_ok &= candidate_source["page_count_actual"] == actual_pages == candidate_source["page_count_stage0_v3"] == batch_source["page_count"]
        source_checks[-1]["matches_candidate_handoff_and_batch"] = bool(source_ok)
        if not source_ok:
            raise RuntimeError(f"Candidate/source manifest mismatch: {sid}")
        for page in sorted(targets[sid]):
            if not 1 <= page <= actual_pages:
                raise RuntimeError(f"Invalid target page {sid} p{page}")
            stem = f"{sid}-p{page:02d}"
            dest = renders / stem
            command = [str(POPPLER), "-f", str(page), "-l", str(page), "-png", "-r", "160", "-singlefile", str(source), str(dest)]
            subprocess.run(command, check=True, capture_output=True)
            image_path = dest.with_suffix(".png")
            render_rows.append({"source_id": sid, "source_path": meta["path"], "source_sha256": actual_hash,
                                "pdf_page_1_based": page, "render_path": str(image_path.relative_to(OUT)).replace("\\", "/"),
                                "render_sha256": sha(image_path), "width_height_px": list(Image.open(image_path).size),
                                "render_method": "Poppler pdftoppm 160 dpi directly from original PDF"})
            by_source.setdefault(sid, []).append(image_path)

    # One labeled contact sheet per QP source; use full-resolution pages for page-level visual review.
    for sid, paths in by_source.items():
        thumbs = []
        for p in paths:
            im = Image.open(p).convert("RGB")
            im.thumbnail((390, 510), Image.Resampling.LANCZOS)
            canvas = Image.new("RGB", (410, 550), "white")
            canvas.paste(im, ((410 - im.width) // 2, 26))
            d = ImageDraw.Draw(canvas)
            d.text((8, 6), p.stem, fill="black")
            thumbs.append(canvas)
        cols = 3
        rows = (len(thumbs) + cols - 1) // cols
        sheet = Image.new("RGB", (cols * 410, rows * 550), "#d8dde3")
        for i, im in enumerate(thumbs):
            sheet.paste(im, ((i % cols) * 410, (i // cols) * 550))
        out = contacts / f"{sid}-contact.png"
        sheet.save(out, optimize=True)

    # Pinned input checks. Dispatch hash typo is covered only by the independently pinned addendum.
    pins = {
        "A4_DISPATCH": (S1 / "evidence/a0/B22_A4_V4_RETEST_DISPATCH.md", "5607c31ac3e04fc4ac8245d1fd6495c9e4680a7b7aff140bcb82501b267508c4"),
        "A4_DISPATCH_HASH_ERRATUM": (S1 / "evidence/a0/B22_A4_V4_RETEST_DISPATCH_HASH_ERRATUM.md", "6c9eac93b4c0e56d4a02a112ae8b98393d78a3b8d6b96c22a282c3482a7301b1"),
        "A4_DISPATCH_PAGESET_ERRATUM": (S1 / "evidence/a0/B22_A4_V4_RETEST_PAGESET_ERRATUM.md", "e8284571777d23cba3cdcf0c6091a1552daf3139625a778e0e70deb8f3b85fae"),
        "A2_HANDOFF_CHECK": (CAND / "HANDOFF_CHECK.json", "3a83c90b96ec7166e8187ee37c71db1b700f14cc10b4aec6fabc5db57beb0164"),
        "A2_BATCH_MANIFEST": (CAND / "BATCH_MANIFEST.json", "de2c9642d9d0687a67ee7452dc57e7c1c40780006f2f92e2c3c928f91858f9d4"),
        "A2_SNAPSHOT_MANIFEST": (CAND / "SNAPSHOT_MANIFEST.json", "74b65bdc167d33fe716755afcbe2d1fe21242c708b44bb7a2f50f6e7f494d02e"),
        "A0_VALIDATOR": (S1 / "evidence/a0/B22_A2_V4_A0_VALIDATE.json", "c0dcfebe4be4e4880bf459abf40991d0f29b67527e8da629e5e88ad00a0074a7"),
        "A0_HANDOFF_AUDIT": (S1 / "evidence/a0/B22_A2_V4_A0_AUDIT.json", "ca763bf550aa4526b04f97fccd8fceb7318b9872a508ca619633ce17afe6910d"),
        "A2_PRIOR_A4_V3_REPORT": (S1 / "evidence/a4/B22/RETEST_V3.md", "edb0ce494a7ebdea009f7ed99d387ce7c7aff3a39debe17fe6688d473257672f"),
        "A2_PRIOR_A4_V3_FINDINGS": (S1 / "evidence/a4/B22/RETEST_FINDINGS_V3.json", "79f72c50bab8a706fda93efb1a477d071d5526b86f3a540c36391b228da4120f"),
        "A2_PRIOR_A4_V3_HANDOFF": (S1 / "evidence/a4/B22/RETEST_HANDOFF_V3.json", "095c03c3b2a52d4d534ace5968453d9613becbce841469eec9c1c2167013cdda"),
        "A2_CORRECTION_EVIDENCE": (CAND / "CORRECTION_EVIDENCE.json", "205a246f4f05bbfb0573678e5f58b14c9f0169c86869698e942482c417978626"),
        "A2_QUESTION_INDEX": (CAND / "QUESTION_INDEX.jsonl", "b2ae6b06c76fb3e88b6b782485aaf82e4aa5680edc1f09bad821d28d473e86b5"),
        "A2_MARKING_INDEX": (CAND / "MARKING_INDEX.jsonl", "bdb09a4a6a788ebfa6dc3dd47e1f393913a9ef2a181a780650cae80c4ba710df"),
        "A2_VISUAL_MANIFEST": (CAND / "VISUAL_MANIFEST.json", "7bc9cbcd25defed66c458a25e2493b646a13d66407736b80a15d7060decffa1c"),
        "A2_MARK_TOTAL_CHECK": (CAND / "MARK_TOTAL_CHECK.json", "3a9ed041e8f815c8ac9e5c5befb6ca28977a42b931924bae51d29bc326e25835"),
        "STAGE0_SOURCE_MANIFEST": (srcman_path, "195a68ad98b4739dff0d3496dc93ba9e85d67d2dae0d88e3d4e4a088f1259c9c"),
        "STAGE1_SCHEMA": (S1 / "CORPUS_SCHEMA.md", "9fe71d4719b0c8f9fd6d6fd6fb0316c7f9a840b6b964634889ea6d98245a1f1f"),
        "STAGE1_POLICY": (S1 / "EXTRACTION_POLICY.md", "97bd6c69ea8d459ea99713e943c2d092a88999b6df7cb315d2820547789c11f2"),
        "A0_MARK_SPOTCHECK": (S1 / "evidence/a0/B22_MARK_SOURCE_SPOTCHECK_V3.json", "04ea6cc6f5840ba9ba87fcac83b187e6ca33cf59b4334e01da4a92d904d92119"),
        "A0_LOCATOR_SPOTCHECK": (S1 / "evidence/a0/B22_LOCATOR_SOURCE_SPOTCHECK_V3.json", "410d7d691a3b4d6e75eda9669e9f4d8b4cc47207468f436b6404789c5c3dabba"),
    }
    input_pins = []
    for name, (path, expected) in pins.items():
        actual = sha(path)
        input_pins.append({"name": name, "path": str(path.relative_to(ROOT)).replace("\\", "/"), "expected_sha256": expected, "actual_sha256": actual, "matches_pin": actual == expected})

    correction_page_keys = {(r["source_id"], int(r["pdf_page_1_based"])) for r in evidence["mark_corrections"]}
    correction_page_keys |= {(r["source_id"], int(r["v4_pdf_page_1_based"])) for r in evidence["locator_corrections"]}
    changed_region_page_keys = {(r["source_id"], int(r["pdf_page_1_based"])) for r in changed_regions}
    cover_page_keys = {(sid, 1) for sid in qp_sources}
    mandated_page_union = correction_page_keys | changed_region_page_keys | cover_page_keys
    supplemental_scope_check = {("9618_w22_qp_12", 2)}
    # Cross-check handoff → batch → snapshot artifact hash chain and active file set.
    active_handoff = handoff["active_artifact_sha256_excluding_batch_manifest_handoff_and_snapshot_manifest"]
    active_batch = batch["active_artifact_sha256"]
    active_snapshot = snapshot["artifact_sha256"]
    handoff_check = [{"path": rel, "expected_sha256": hx, "actual_sha256": sha(CAND / rel), "matches": sha(CAND / rel) == hx} for rel, hx in active_handoff.items()]
    batch_check = [{"path": rel, "expected_sha256": hx, "actual_sha256": sha(CAND / rel), "matches": sha(CAND / rel) == hx} for rel, hx in active_batch.items()]
    snapshot_check = [{"path": rel, "expected_sha256": hx, "actual_sha256": sha(CAND / rel), "matches": sha(CAND / rel) == hx} for rel, hx in active_snapshot.items()]
    actual_files = {str(p.relative_to(CAND)).replace("\\", "/") for p in CAND.rglob("*") if p.is_file()}
    chain_check = {"handoff_listed_count": len(active_handoff), "handoff_hash_mismatches": [x for x in handoff_check if not x["matches"]],
                   "batch_listed_count": len(active_batch), "batch_hash_mismatches": [x for x in batch_check if not x["matches"]],
                   "snapshot_listed_count": len(active_snapshot), "snapshot_hash_mismatches": [x for x in snapshot_check if not x["matches"]],
                   "handoff_vs_batch_key_set_matches": set(active_handoff) | {"HANDOFF_CHECK.json"} == set(active_batch),
                   "batch_vs_snapshot_key_set_matches": set(active_batch) | {"BATCH_MANIFEST.json"} == set(active_snapshot),
                   "snapshot_matches_candidate_file_set": set(active_snapshot) | {"SNAPSHOT_MANIFEST.json"} == actual_files,
                   "batch_records_actual_handoff_hash": active_batch.get("HANDOFF_CHECK.json") == sha(CAND / "HANDOFF_CHECK.json"),
                   "all_chain_checks_pass": all(x["matches"] for x in handoff_check + batch_check + snapshot_check)
                   and (set(active_handoff) | {"HANDOFF_CHECK.json"} == set(active_batch))
                   and (set(active_batch) | {"BATCH_MANIFEST.json"} == set(active_snapshot))
                   and (set(active_snapshot) | {"SNAPSHOT_MANIFEST.json"} == actual_files)
                   and active_batch.get("HANDOFF_CHECK.json") == sha(CAND / "HANDOFF_CHECK.json")}
    write_json(OUT / "CANDIDATE_HASH_CHAIN_CHECK.json", chain_check)

    # Independent structural, linkage, visual-reference, correction and totals audit.
    q_by_id = {x["id"]: x for x in question_index}
    m_by_id = {x["id"]: x for x in marking_index}
    v_by_id = {x["id"]: x for x in v4["regions"]}
    pindex = [json.loads(line) for line in (CAND / "PAGE_INDEX.jsonl").open(encoding="utf-8")]
    page_keys = {(x["source_id"], int(x["pdf_page_1_based"])) for x in pindex}
    duplicate_q_ids = len(q_by_id) != len(question_index)
    roots = [x for x in question_index if "question_id" not in x]
    parts = [x for x in question_index if "question_id" in x]
    dangling_question_ids = [x["id"] for x in parts if x.get("question_id") not in q_by_id]
    dangling_parent_ids = [x["id"] for x in parts if x.get("parent_part_id_or_null") is not None and x["parent_part_id_or_null"] not in q_by_id]
    child_map: dict[str, list[str]] = {}
    for item in parts:
        if item.get("parent_part_id_or_null"):
            child_map.setdefault(item["parent_part_id_or_null"], []).append(item["id"])
    unresolved_text = (CAND / "UNRESOLVED.md").read_text(encoding="utf-8")
    unresolved_ids = set(re.findall(r"^## (9618_[^\s]+)$", unresolved_text, re.M))
    unresolved_status_ids = {x["id"] for x in question_index if x.get("status") == "UNRESOLVED"}
    v3q = [json.loads(line) for line in (S1 / "evidence/a2/B22/versions/B22-A2-v3/QUESTION_INDEX.jsonl").open(encoding="utf-8")]
    v3q_by = {x["id"]: x for x in v3q}
    parent_field = lambda x: x.get("parent_part_id_or_null") if "question_id" in x else x.get("parent_id_or_null")
    changed_parent_fields = [x["id"] for x in question_index if x["id"] in v3q_by and parent_field(x) != parent_field(v3q_by[x["id"]])]
    parent_containers = [x for x in question_index if x.get("status") == "UNRESOLVED"]
    no_child_containers = [x["id"] for x in parent_containers if not child_map.get(x["id"])]
    hierarchy_check = {"question_rows": len(question_index), "question_roots": len(roots), "part_rows": len(parts),
                       "unique_record_ids": not duplicate_q_ids, "dangling_question_parent_ids": dangling_question_ids,
                       "dangling_parent_part_ids": dangling_parent_ids, "unresolved_parent_container_count": len(parent_containers),
                       "unresolved_register_id_count": len(unresolved_ids), "unresolved_register_matches_index": unresolved_ids == unresolved_status_ids,
                       "unresolved_parent_ids_unchanged_from_v3": unresolved_ids == {x["id"] for x in v3q if x.get("status") == "UNRESOLVED"},
                       "unresolved_containers_without_child": no_child_containers, "parent_link_changes_from_v3": changed_parent_fields}

    correction_index_results = []
    for row in evidence["mark_corrections"]:
        qrow = q_by_id.get(row["record_id"])
        correction_index_results.append({"kind": "mark", "record_id": row["record_id"], "source_id": row["source_id"],
            "pdf_page_1_based": row["pdf_page_1_based"], "printed_label": row["printed_label"],
            "expected_candidate_mark": row["v4_mark"], "indexed_mark": qrow.get("marks_displayed_or_null") if qrow else None,
            "candidate_locator_matches_row": bool(qrow and qrow["qp_locator"]["source_id"] == row["source_id"] and qrow["qp_locator"]["pdf_page_1_based"] == row["pdf_page_1_based"]),
            "record_matches_candidate": bool(qrow and qrow.get("marks_displayed_or_null") == row["v4_mark"] and qrow["qp_locator"]["source_id"] == row["source_id"] and qrow["qp_locator"]["pdf_page_1_based"] == row["pdf_page_1_based"]),
            "source_pdf_sha256": row["source_pdf_sha256"], "candidate_render_sha256": row["direct_render_sha256"]})
    token_rows = []
    for row in evidence["locator_corrections"]:
        qrow = q_by_id.get(row["record_id"])
        printed_label = row["printed_label"]
        expected_token = re.findall(r"\(([^()]*)\)", printed_label)[-1] + ")" if re.findall(r"\(([^()]*)\)", printed_label) else printed_label
        claimed = row.get("source_page_label_token_verified")
        token_rows.append({"record_id": row["record_id"], "printed_label": printed_label,
            "expected_last_token_from_printed_label": expected_token, "candidate_claimed_token": claimed,
            "token_claim_matches_label": claimed in {expected_token, "(" + expected_token},
            "source_id": row["source_id"], "expected_source_page": row["source_prompt_pdf_page_1_based"],
            "candidate_source_page": qrow["qp_locator"]["pdf_page_1_based"] if qrow else None,
            "candidate_locator_matches_expected": bool(qrow and qrow["qp_locator"]["source_id"] == row["source_id"] and qrow["qp_locator"]["pdf_page_1_based"] == row["source_prompt_pdf_page_1_based"] and qrow["qp_locator"]["question"] == q_by_id.get(qrow.get("question_id"), {}).get("question_number") and qrow["qp_locator"]["part"] == qrow["label"]),
            "candidate_transcript_ref": qrow.get("prompt_transcript_ref") if qrow else None,
            "evidence_transcript_ref": row.get("transcript_ref"), "candidate_transcript_matches_evidence": bool(qrow and qrow.get("prompt_transcript_ref") == row.get("transcript_ref")),
            "source_pdf_sha256": row["source_pdf_sha256"], "source_render_sha256": row["direct_render_sha256"]})

    marks_by_source = {}
    for sid in qp_sources:
        def question_source(item):
            if item.get("source_qp_id"):
                return item["source_qp_id"]
            root = q_by_id.get(item.get("question_id"), {})
            return root.get("source_qp_id")
        marked = [x for x in question_index if question_source(x) == sid and x.get("marks_displayed_or_null") is not None]
        actual_sum = sum(int(x["marks_displayed_or_null"]) for x in marked)
        cover = PdfReader(str(ROOT / srcs[sid]["path"])).pages[0].extract_text() or ""
        cover_75_text = bool(re.search(r"75", cover))
        recorded = load(CAND / "MARK_TOTAL_CHECK.json")["papers"][sid]
        marks_by_source[sid] = {"indexed_marked_row_count": len(marked), "independent_indexed_sum": actual_sum,
            "candidate_recorded_sum": recorded["indexed_sum"], "source_cover_has_75_token": cover_75_text,
            "candidate_recorded_cover_total": recorded["printed_total_observed"],
            "cover_source_page": 1, "cover_source_pdf_sha256": sha(ROOT / srcs[sid]["path"]),
            "independent_sum_matches_candidate_and_75": actual_sum == recorded["indexed_sum"] == 75 and cover_75_text}

    marking_targets_missing = []
    marking_xor_errors = []
    marking_locator_errors = []
    for item in marking_index:
        part_id = item.get("part_id_or_null")
        qid = item.get("question_id_or_null")
        if (part_id is None) == (qid is None):
            marking_xor_errors.append(item["id"])
        target = q_by_id.get(part_id or qid)
        if not target:
            marking_targets_missing.append(item["id"])
            continue
        expected_ms = target.get("ms_locator_or_null") if part_id else item.get("ms_locator")
        if part_id and expected_ms and (item["ms_locator"]["source_id"] != expected_ms["source_id"] or item["ms_locator"]["pdf_page_1_based"] != expected_ms["pdf_page_1_based"] or item["ms_locator"]["question"] != expected_ms["question"] or item["ms_locator"].get("part") != expected_ms.get("part")):
            marking_locator_errors.append(item["id"])
        if item["ms_locator"]["source_id"] not in srcs or item["ms_locator"]["pdf_page_1_based"] < 1:
            marking_locator_errors.append(item["id"])
    marking_refs = [ref for item in marking_index for ref in item["visual_dependency_refs"]]
    dependency_errors = []
    for item in marking_index:
        for ref in item["visual_dependency_refs"]:
            region = v_by_id.get(ref)
            if not region or region["source_id"] != item["ms_locator"]["source_id"] or region["pdf_page_1_based"] != item["ms_locator"]["pdf_page_1_based"]:
                dependency_errors.append({"marking_id": item["id"], "region_id": ref, "expected_ms_locator": item["ms_locator"], "region": region})
    whole = [item for item in marking_index if item.get("question_id_or_null") and not item.get("part_id_or_null")]
    whole_errors = []
    for item in whole:
        loc = item["ms_locator"]
        if item.get("mark_or_condition_or_null") is not None or loc.get("part") is not None or loc["question"] != q_by_id[item["question_id_or_null"]]["question_number"]:
            whole_errors.append(item["id"])
    marking_check = {"marking_item_count": len(marking_index), "items_with_exactly_one_existing_question_or_part_target": not marking_targets_missing and not marking_xor_errors,
        "missing_targets": marking_targets_missing, "exclusive_target_violations": marking_xor_errors, "marking_locator_mismatches": sorted(set(marking_locator_errors)),
        "dependency_ref_count": len(marking_refs), "unique_dependency_region_count": len(set(marking_refs)), "dependency_errors": dependency_errors,
        "whole_question_target_count": len(whole), "whole_question_no_part_or_inferred_mark_errors": whole_errors,
        "whole_question_targets": [{"id": x["id"], "question_id": x["question_id_or_null"], "ms_locator": x["ms_locator"], "mark_or_condition_or_null": x["mark_or_condition_or_null"], "visual_dependency_refs": x["visual_dependency_refs"]} for x in whole]}

    visual_path_errors = []
    visual_relation_errors = []
    visual_page_errors = []
    visual_status_counts = {}
    for region in v4["regions"]:
        status = region["reviewer_status"]
        visual_status_counts[status] = visual_status_counts.get(status, 0) + 1
        asset_rel = region["rendered_asset_ref"]
        asset_path = CAND / asset_rel
        if not asset_path.exists() or sha(asset_path) != active_batch.get(asset_rel) or sha(asset_path) != active_snapshot.get(asset_rel):
            visual_path_errors.append({"region_id": region["id"], "asset_ref": asset_rel})
        page_ref = region["page_ref"]
        if page_ref.get("source_id") != region["source_id"] or page_ref.get("pdf_page_1_based") != region["pdf_page_1_based"] or (region["source_id"], region["pdf_page_1_based"]) not in page_keys:
            visual_page_errors.append(region["id"])
        for relid in region["relates_to_ids"]:
            qrow = q_by_id.get(relid)
            if not qrow:
                visual_relation_errors.append({"region_id": region["id"], "related_id": relid, "error": "dangling"})
            elif "_qp_" in region["source_id"]:
                root = qrow if qrow.get("source_qp_id") else q_by_id.get(qrow.get("question_id"), {})
                if root.get("source_qp_id") != region["source_id"] or qrow["qp_locator"]["pdf_page_1_based"] != region["pdf_page_1_based"]:
                    visual_relation_errors.append({"region_id": region["id"], "related_id": relid, "error": "cross_source_or_page"})
            else:
                expected_qp = region["source_id"].replace("_ms_", "_qp_")
                root = qrow if qrow.get("source_qp_id") else q_by_id.get(qrow.get("question_id"), {})
                if root.get("source_qp_id") != expected_qp:
                    visual_relation_errors.append({"region_id": region["id"], "related_id": relid, "error": "cross_variant_or_source"})
    visual_check = {"region_count": len(v4["regions"]), "unique_region_ids": len(v_by_id) == len(v4["regions"]),
        "region_page_assets_or_hash_errors": visual_path_errors, "region_page_ref_errors": visual_page_errors,
        "dangling_or_cross_source_page_relations": visual_relation_errors, "reviewer_status_counts": visual_status_counts,
        "changed_region_count_from_v3": len(changed_regions), "changed_region_pages": [{"source_id":sid,"pdf_page_1_based":page} for sid,page in sorted(changed_region_page_keys)]}

    # Distinguish the correction-evidence row-page union from the expanded review union.
    candidate_render_dir = CAND / "renders/v4-correction-source"
    candidate_render_keys = set()
    for image_path in candidate_render_dir.glob("*.png"):
        match = re.fullmatch(r"(.+)-p(\d+)\.png", image_path.name)
        if match:
            candidate_render_keys.add((match.group(1), int(match.group(2))))
    correction_row_page_union = correction_page_keys
    expanded_required_page_union = correction_row_page_union | changed_region_page_keys | cover_page_keys
    a4_fresh_qp_review_set = {(x["source_id"], int(x["pdf_page_1_based"])) for x in render_rows if "_qp_" in x["source_id"]}
    page_sets = {"correction_records": {"record_count": len(evidence["mark_corrections"]) + len(evidence["locator_corrections"]),
                    "deduplicated_source_page_count": len(correction_row_page_union), "source_pages": sorted([{"source_id":s,"pdf_page_1_based":p} for s,p in correction_row_page_union],key=lambda x:(x["source_id"],x["pdf_page_1_based"]))},
                 "v4_reconciled_visual_regions": {"region_count": len(changed_regions), "deduplicated_source_page_count": len(changed_region_page_keys),
                    "source_pages": sorted([{"source_id":s,"pdf_page_1_based":p} for s,p in changed_region_page_keys],key=lambda x:(x["source_id"],x["pdf_page_1_based"]))},
                 "six_qp_covers": {"deduplicated_source_page_count": len(cover_page_keys), "source_pages": sorted([{"source_id":s,"pdf_page_1_based":p} for s,p in cover_page_keys],key=lambda x:x["source_id"])},
                 "a0_erratum_expanded_union": {"deduplicated_source_page_count": len(expanded_required_page_union),
                    "source_pages": sorted([{"source_id":s,"pdf_page_1_based":p} for s,p in expanded_required_page_union],key=lambda x:(x["source_id"],x["pdf_page_1_based"]))},
                 "candidate_correction_render_folder": {"unique_png_page_count": len(candidate_render_keys),
                    "pages_not_in_expanded_union": sorted([{"source_id":s,"pdf_page_1_based":p} for s,p in candidate_render_keys-expanded_required_page_union],key=lambda x:(x["source_id"],x["pdf_page_1_based"])),
                    "expanded_union_pages_missing_from_folder": sorted([{"source_id":s,"pdf_page_1_based":p} for s,p in expanded_required_page_union-candidate_render_keys],key=lambda x:(x["source_id"],x["pdf_page_1_based"]))},
                 "correction_evidence_unique_direct_source_pages_claim": evidence["counts"]["unique_direct_source_pages"],
                 "field_matches_png_count_but_not_expanded_union": evidence["counts"]["unique_direct_source_pages"] == len(candidate_render_keys) and evidence["counts"]["unique_direct_source_pages"] != len(expanded_required_page_union),
                 "a4_fresh_qp_page_count_including_supplemental_check_and_context": len(a4_fresh_qp_review_set),
                 "a4_fresh_qp_pages_cover_expanded_union": expanded_required_page_union.issubset(a4_fresh_qp_review_set)}
    write_json(OUT / "A4_CANDIDATE_REVIEW_CHECKS.json", {"task_id": "P1-S1-A4-B22-RETEST-V4", "source_checks": source_checks,
        "hierarchy_and_unresolved": hierarchy_check, "mark_correction_candidate_checks": correction_index_results,
        "locator_correction_candidate_checks": token_rows, "independent_mark_totals_and_cover_tokens": marks_by_source,
        "marking_targets_and_dependencies": marking_check, "visual_regions": visual_check, "page_set_reconciliation": page_sets,
        "all_source_hashes_and_pages_match": all(x["matches_stage0"] and x.get("matches_candidate_handoff_and_batch") for x in source_checks),
        "all_mark_correction_records_match_candidate_index": all(x["record_matches_candidate"] for x in correction_index_results),
        "all_locator_page_and_transcript_refs_match_candidate_index": all(x["candidate_locator_matches_expected"] and x["candidate_transcript_matches_evidence"] for x in token_rows),
        "token_metadata_findings": [x for x in token_rows if not x["token_claim_matches_label"]],
        "all_six_independent_mark_sums_match_75_and_cover_text": all(x["independent_sum_matches_candidate_and_75"] for x in marks_by_source.values()),
        "all_hierarchy_unresolved_marking_visual_checks_clean": not duplicate_q_ids and not dangling_question_ids and not dangling_parent_ids and unresolved_ids == unresolved_status_ids and not no_child_containers and not marking_targets_missing and not marking_xor_errors and not marking_locator_errors and not dependency_errors and not whole_errors and not visual_path_errors and not visual_page_errors and not visual_relation_errors})

    write_json(OUT / "SOURCE_RENDER_MANIFEST_V4.json", {"task_id": "P1-S1-A4-B22-RETEST-V4", "candidate_version": "B22-A2-v4",
        "source_manifest_sha256": sha(srcman_path), "source_checks": source_checks, "changed_visual_region_ids": [r["id"] for r in changed_regions],
        "correction_record_source_pages": sorted([{"source_id": sid, "pdf_page_1_based": p} for sid, p in correction_page_keys], key=lambda x:(x["source_id"],x["pdf_page_1_based"])),
        "changed_region_source_pages": sorted([{"source_id": sid, "pdf_page_1_based": p} for sid, p in changed_region_page_keys], key=lambda x:(x["source_id"],x["pdf_page_1_based"])),
        "context_required_qp_source_pages": sorted([{"source_id": sid, "pdf_page_1_based": p} for sid,p in context_source_pages], key=lambda x:(x["source_id"],x["pdf_page_1_based"])),
        "six_cover_source_pages": sorted([{"source_id": sid, "pdf_page_1_based": p} for sid,p in cover_page_keys], key=lambda x:x["source_id"]),
        "deduplicated_mandated_union_count": len(mandated_page_union), "correction_evidence_unique_direct_source_pages_claim": evidence["counts"]["unique_direct_source_pages"],
        "candidate_v4_correction_render_png_count": sum(1 for p in (CAND / "renders/v4-correction-source").glob("*.png")),
        "manifest_page_count_discrepancy": evidence["counts"]["unique_direct_source_pages"] != len(mandated_page_union),
        "supplemental_scope_check_source_pages": sorted([{"source_id": sid,"pdf_page_1_based":p} for sid,p in supplemental_scope_check],key=lambda x:x["source_id"]),
        "supplemental_scope_check_note": "9618_w22_qp_12 p2 independently inspected as a sanity check; it shows Q1(a) [5] and no Q1 [2] discrepancy. This is outside the mandated A4 page union.",
        "targets_by_source": {k: sorted(v) for k, v in sorted(targets.items())}, "render_count": len(render_rows),
        "render_method": "Poppler pdftoppm 160 dpi, direct from original source PDFs after recomputed SHA-256 and pypdf page count",
        "render_rows": render_rows, "contact_sheets": [str((contacts / f"{sid}-contact.png").relative_to(OUT)).replace("\\", "/") for sid in sorted(by_source)]})
    write_json(OUT / "PINNED_INPUT_CHECKS.json", {"input_pins": input_pins, "all_match": all(x["matches_pin"] for x in input_pins),
        "batch_manifest_erratum": {"wrong_work_order_digest": "de2c9642d9d0687a67ee7452dc57e7c1c40780006f2f92e3c3c928f91858f9d4",
                                   "corrected_digest": pins["A2_BATCH_MANIFEST"][1],
                                   "addendum_sha256": sha(pins["A4_DISPATCH_HASH_ERRATUM"][0])}})
    print(json.dumps({"sources": len(source_checks), "pages_rendered": len(render_rows), "changed_visual_regions": len(changed_regions),
                      "required_page_union": len(mandated_page_union), "candidate_correction_render_page_count_claim": evidence["counts"]["unique_direct_source_pages"],
                      "all_pins_match": all(x["matches_pin"] for x in input_pins), "hash_chain_pass": chain_check["all_chain_checks_pass"], "output": str(OUT)}, indent=2))


if __name__ == "__main__":
    main()
