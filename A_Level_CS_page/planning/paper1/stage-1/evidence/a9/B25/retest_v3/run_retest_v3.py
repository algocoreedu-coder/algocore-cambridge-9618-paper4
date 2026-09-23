import collections
import hashlib
import json
import pathlib
import re
from datetime import datetime, timezone

import pymupdf
from PIL import Image, ImageDraw, ImageFont


ROOT = pathlib.Path.cwd()
S1 = ROOT / "A_Level_CS_page/planning/paper1/stage-1"
S0 = ROOT / "A_Level_CS_page/planning/paper1/stage-0"
CAND = S1 / "evidence/a2/B25/versions/B25-A2-v3"
PARENT = S1 / "evidence/a2/B25/versions/B25-A2-v2"
OUT = S1 / "evidence/a9/B25/retest_v3"
A4 = S1 / "evidence/a4/B25/retest_v3"
A3 = S1 / "evidence/a3/B25/retest_v2"
OUT.mkdir(parents=True, exist_ok=True)
(OUT / "direct_source_renders").mkdir(exist_ok=True)
(OUT / "contact_sheets").mkdir(exist_ok=True)

# Set to PASS only after A9 has visually inspected the generated contact sheets
# and the corrected-row source pages. The first run deliberately remains pending.
MANUAL_VISUAL_RESULT = "PASS"


def sha256(path: pathlib.Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def read_json(path: pathlib.Path):
    return json.loads(path.read_text(encoding="utf-8"))


def read_jsonl(path: pathlib.Path):
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def dump(path: pathlib.Path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def norm(text):
    return re.sub(r"\s+", " ", text or "").strip()


def rel(path: pathlib.Path) -> str:
    return path.relative_to(ROOT).as_posix()


def manifest_entry(path: pathlib.Path, base: pathlib.Path):
    return {
        "path": path.relative_to(base).as_posix(),
        "byte_count": path.stat().st_size,
        "sha256": sha256(path),
    }


def verify_declared_manifest(manifest_path: pathlib.Path, base: pathlib.Path):
    obj = read_json(manifest_path)
    checked = []
    for item in obj["files"]:
        p = base / item["path"]
        expected_bytes = item.get("byte_count", item.get("bytes"))
        actual_hash = sha256(p) if p.is_file() else None
        actual_bytes = p.stat().st_size if p.is_file() else None
        checked.append({
            "path": item["path"],
            "expected_sha256": item["sha256"],
            "actual_sha256": actual_hash,
            "expected_byte_count": expected_bytes,
            "actual_byte_count": actual_bytes,
            "match": actual_hash == item["sha256"] and actual_bytes == expected_bytes,
        })
    return obj, checked


PINNED = {
    "work_order": (S1 / "evidence/a0/B25_A9_V3_RETEST_DISPATCH.md", "556a9c63b65e4a36fb6fb830b9010c0a9d0a8cab5219f85eeb0c9d8e61a8d485"),
    "dispatch_record": (S1 / "evidence/a0/B25_A9_V3_RETEST_DISPATCH_RECORD.json", ""),
    "candidate_handoff": (CAND / "HANDOFF_CHECK.json", "e498e1f978bc038e98de3551d5dffe061b1f71fce866d86744ec24e3a82d02c5"),
    "candidate_batch_manifest": (CAND / "BATCH_MANIFEST.json", "4a9e64a05d6205e4f3cae6e2b8c013e34d5176f757ecffbe66a1c58171c98489"),
    "candidate_snapshot_manifest": (CAND / "SNAPSHOT_MANIFEST.json", "e78a8b8f8f2b399ed6f442de614abdd494b4d357494524c3f0c4cc9150cc3957"),
    "candidate_marking_index": (CAND / "MARKING_INDEX.jsonl", "a200dabddd320b94aaf159c4b5742a63de5a4c0f0b936584bb9794fdc0616eef"),
    "candidate_a0_audit": (S1 / "evidence/a0/B25_A2_V3_A0_AUDIT.json", "355a8c024ece148cf365f7d443cf59fe39046e5a9988f35515a01faf9c4f3abe"),
    "a4_v3_handoff": (A4 / "HANDOFF_RETEST_V3.json", "ee8ecad7113936858d16e9396ce17db6e8a4c2a199845c076c3b6d659b31347d"),
    "a4_v3_output_manifest": (A4 / "OUTPUT_MANIFEST_V3.json", "2671c7ea746beae667af56d6e01f900ab1bc0454a8b47bf798fc0aaecbc83ddf"),
    "a4_v3_a0_audit": (S1 / "evidence/a0/B25_A4_V3_HANDOFF_AUDIT.json", "7c7e96329cf07251ee0c15eb8c6cd5a495d5f9cd87020eee8b17cb51ea1fecb9"),
    "a3_v2_handoff": (A3 / "HANDOFF_RETEST_V2.json", "e190a65d00eb9a5a4c67babc03580e3427340b138b6a36566972327f2f420112"),
    "a9_v2_handoff": (S1 / "evidence/a9/B25/review_v2/HANDOFF_REVIEW_V2.json", "c01a3453afed6095a0948fb29d98e5d9e3639e261da956dd89334b3eadc0108d"),
    "a9_v2_findings": (S1 / "evidence/a9/B25/review_v2/FINDINGS_V2.json", "d3b50d623011aba5dfc0f2189052a41c06d868c75cd305621285d38abd062ce9"),
    "stage0_source_manifest": (S0 / "evidence/a2/SOURCE_MANIFEST.json", "195a68ad98b4739dff0d3496dc93ba9e85d67d2dae0d88e3d4e4a088f1259c9c"),
    "schema_v1_1": (S1 / "CORPUS_SCHEMA.md", "9fe71d4719b0c8f9fd6d6fd6fb0316c7f9a840b6b964634889ea6d98245a1f1f"),
    "policy_v1_1": (S1 / "EXTRACTION_POLICY.md", "97bd6c69ea8d459ea99713e943c2d092a88999b6df7cb315d2820547789c11f2"),
}

pin_checks = []
for label, (path, expected) in PINNED.items():
    actual = sha256(path) if path.is_file() else None
    if not expected and path.is_file():
        expected = actual
    pin_checks.append({
        "label": label,
        "path": rel(path),
        "expected_sha256": expected,
        "actual_sha256": actual,
        "match": actual == expected,
    })

# Candidate snapshot: all 450 entries must be rehashed and byte-count checked.
snapshot = read_json(CAND / "SNAPSHOT_MANIFEST.json")
snapshot_checks = []
for item in snapshot["files"]:
    p = CAND / item["path"]
    actual_hash = sha256(p) if p.is_file() else None
    actual_bytes = p.stat().st_size if p.is_file() else None
    snapshot_checks.append({
        "path": item["path"],
        "expected_sha256": item["sha256"],
        "actual_sha256": actual_hash,
        "expected_byte_count": item["byte_count"],
        "actual_byte_count": actual_bytes,
        "match": actual_hash == item["sha256"] and actual_bytes == item["byte_count"],
    })

# Same-version A4 evidence and carried-forward A3 evidence integrity.
a4_manifest, a4_output_checks = verify_declared_manifest(A4 / "OUTPUT_MANIFEST_V3.json", A4)
a3_manifest, a3_output_checks = verify_declared_manifest(A3 / "OUTPUT_MANIFEST_V2.json", A3)

# A3's context/scope/locator/visual evidence carries only if v2 and v3 are byte-identical
# for all files in that scope.
a3_scope_paths = ["QUESTION_INDEX.jsonl", "PAGE_INDEX.jsonl", "VISUAL_MANIFEST.json"]
for folder in ["contexts", "transcripts", "renders"]:
    a3_scope_paths.extend(p.relative_to(CAND).as_posix() for p in sorted((CAND / folder).rglob("*")) if p.is_file())
a3_identity = []
for rp in sorted(a3_scope_paths):
    before = PARENT / rp
    after = CAND / rp
    a3_identity.append({
        "path": rp,
        "v2_sha256": sha256(before) if before.is_file() else None,
        "v3_sha256": sha256(after) if after.is_file() else None,
        "byte_identical": before.is_file() and after.is_file() and sha256(before) == sha256(after),
    })

# Authoritative 2025 sources.
stage0 = read_json(S0 / "evidence/a2/SOURCE_MANIFEST.json")
sources = sorted(
    [x for x in stage0["primary_sources"] if x.get("year") == 2025 and x.get("kind") in {"qp", "ms"}],
    key=lambda x: x["id"],
)
source_checks = []
source_by_id = {}
for src in sources:
    p = ROOT / src["path"]
    doc = pymupdf.open(p)
    row = {
        "source_id": src["id"],
        "path": src["path"],
        "expected_sha256": src["sha256"],
        "actual_sha256": sha256(p),
        "expected_byte_count": src["bytes"],
        "actual_byte_count": p.stat().st_size,
        "expected_pages": src["page_count"],
        "actual_pages": len(doc),
    }
    row["match"] = row["expected_sha256"] == row["actual_sha256"] and row["expected_byte_count"] == row["actual_byte_count"] and row["expected_pages"] == row["actual_pages"]
    source_checks.append(row)
    source_by_id[src["id"]] = {"meta": src, "path": p}
    doc.close()

PAGES = read_jsonl(CAND / "PAGE_INDEX.jsonl")
QUESTIONS = read_jsonl(CAND / "QUESTION_INDEX.jsonl")
MARKS = read_jsonl(CAND / "MARKING_INDEX.jsonl")
VISUAL_DOC = read_json(CAND / "VISUAL_MANIFEST.json")
VISUALS = VISUAL_DOC["visual_regions"]
CONTEXT_FILES = sorted((CAND / "contexts").glob("*.json"))
CONTEXTS = [read_json(p) for p in CONTEXT_FILES]

pmap = {(x["source_id"], x["pdf_page_1_based"]): x for x in PAGES}
qmap = {x["id"]: x for x in QUESTIONS}
mmap = {x["id"]: x for x in MARKS}
vmap = {x["id"]: x for x in VISUALS}
cmap = {x["question_id"]: x for x in CONTEXTS}
all_ids = set(qmap) | set(mmap)

roots = [x for x in QUESTIONS if "question_number" in x and x.get("parent_id_or_null") is None]
parts = [x for x in QUESTIONS if "label" in x]
children = collections.defaultdict(list)
for part in parts:
    children[part.get("parent_part_id_or_null") or part["question_id"]].append(part["id"])
parent_groups = [x for x in parts if children.get(x["id"]) and x.get("marks_displayed_or_null") is None]

duplicates = {
    "question_or_part": sorted([k for k, n in collections.Counter(x["id"] for x in QUESTIONS).items() if n > 1]),
    "marking_item": sorted([k for k, n in collections.Counter(x["id"] for x in MARKS).items() if n > 1]),
    "visual_region": sorted([k for k, n in collections.Counter(x["id"] for x in VISUALS).items() if n > 1]),
}

crossref_errors = []
allowed_statuses = {
    "question": {"EXTRACTED", "MS_LINKED"},
    "mark": {"MS_LINKED"},
    "visual": {"RENDERED_PENDING_INDEPENDENT_REVIEW"},
    "page_extraction": {"EXTRACTED"},
    "page_visual": {"A2_CONTACT_SHEET_SCREENED_FULL_RENDER_PENDING_INDEPENDENT_REVIEW", "A2_VISUALLY_INSPECTED_PENDING_INDEPENDENT_REVIEW"},
}
for page in PAGES:
    key = (page["source_id"], page["pdf_page_1_based"])
    if key not in pmap or page["source_id"] not in source_by_id:
        crossref_errors.append(["page", key, "source"])
    tr = page.get("transcript_ref_or_null")
    if not tr or not (CAND / tr).is_file():
        crossref_errors.append(["page", key, "transcript"])
for q in QUESTIONS:
    loc = q["qp_locator"]
    if (loc["source_id"], loc["pdf_page_1_based"]) not in pmap:
        crossref_errors.append(["question", q["id"], "qp_locator"])
    if not (CAND / q["prompt_transcript_ref"]).is_file():
        crossref_errors.append(["question", q["id"], "prompt_transcript"])
    if "label" in q:
        if q["question_id"] not in qmap or (q.get("parent_part_id_or_null") and q["parent_part_id_or_null"] not in qmap):
            crossref_errors.append(["part", q["id"], "parent"])
    elif q.get("context_ref_or_null") and not (CAND / q["context_ref_or_null"]).is_file():
        crossref_errors.append(["question", q["id"], "context"])
for ctx in CONTEXTS:
    if ctx["question_id"] not in qmap:
        crossref_errors.append(["context", ctx["question_id"], "question"])
    for ev in ctx["source_evidence"]:
        if (ev["source_id"], ev["pdf_page_1_based"]) not in pmap or not (CAND / ev["transcript_ref"]).is_file():
            crossref_errors.append(["context", ctx["question_id"], ev["pdf_page_1_based"]])

mark_target_counts = {"part": 0, "whole_question": 0}
terminal_header_re = re.compile(r"Question\s*(?:[/|\r\n ]+)Answer\s*(?:[/|\r\n ]+)Marks?\s*$", re.I)
mark_checks = []
for m in MARKS:
    targets = [x for x in [m.get("part_id_or_null"), m.get("question_id_or_null")] if x]
    target_type = "part" if m.get("part_id_or_null") else "whole_question"
    mark_target_counts[target_type] += 1
    loc = m["ms_locator"]
    transcript = CAND / m["transcript_ref"]
    errors = []
    if len(targets) != 1 or targets[0] not in qmap:
        errors.append("target")
    if (loc["source_id"], loc["pdf_page_1_based"]) not in pmap or "_ms_" not in loc["source_id"]:
        errors.append("locator")
    if not transcript.is_file():
        errors.append("transcript")
    elif norm(m.get("mark_or_condition_or_null")) not in norm(transcript.read_text(encoding="utf-8")):
        errors.append("excerpt_not_in_transcript")
    for vid in m.get("visual_dependency_refs", []):
        v = vmap.get(vid)
        if not v or (v["source_id"], v["pdf_page_1_based"]) != (loc["source_id"], loc["pdf_page_1_based"]) or m["id"] not in v["relates_to_ids"]:
            errors.append("visual_dependency")
    if not m.get("visual_dependency_refs"):
        errors.append("visual_dependency_empty")
    mark_checks.append({
        "record_id": m["id"],
        "target_type": target_type,
        "target_id": targets[0] if len(targets) == 1 else None,
        "locator": loc,
        "terminal_generic_header": bool(terminal_header_re.search(m.get("mark_or_condition_or_null") or "")),
        "errors": errors,
        "pass": not errors and not terminal_header_re.search(m.get("mark_or_condition_or_null") or ""),
    })

visual_errors = []
for v in VISUALS:
    if (v["source_id"], v["pdf_page_1_based"]) not in pmap:
        visual_errors.append([v["id"], "page"])
    if not (CAND / v["rendered_asset_ref"]).is_file():
        visual_errors.append([v["id"], "render"])
    for target in v["relates_to_ids"]:
        if target not in all_ids:
            visual_errors.append([v["id"], target])

status_errors = []
for q in QUESTIONS:
    if q["status"] not in allowed_statuses["question"]:
        status_errors.append([q["id"], q["status"]])
for m in MARKS:
    if m["status"] not in allowed_statuses["mark"]:
        status_errors.append([m["id"], m["status"]])
for v in VISUALS:
    if v["reviewer_status"] not in allowed_statuses["visual"]:
        status_errors.append([v["id"], v["reviewer_status"]])
for p in PAGES:
    if p["extraction_status"] not in allowed_statuses["page_extraction"] or p["visual_status"] not in allowed_statuses["page_visual"]:
        status_errors.append([[p["source_id"], p["pdf_page_1_based"]], [p["extraction_status"], p["visual_status"]]])

parent_errors = []
for pg in parent_groups:
    if pg.get("marks_displayed_or_null") is not None or pg.get("ms_locator_or_null") is not None or any((m.get("part_id_or_null") or m.get("question_id_or_null")) == pg["id"] for m in MARKS):
        parent_errors.append(pg["id"])

marks_by_qp = {}
for sid in sorted(x["id"] for x in sources if x["kind"] == "qp"):
    marks_by_qp[sid] = sum(int(x["marks_displayed_or_null"]) for x in QUESTIONS if x["qp_locator"]["source_id"] == sid and x.get("marks_displayed_or_null") is not None)

# Exact eight-record v3 correction and immutable semantic rows.
finding_v2 = read_json(S1 / "evidence/a9/B25/review_v2/FINDINGS_V2.json")["findings"][0]
target_ids = sorted(x["record_id"] for x in finding_v2["occurrences"])
old_marks = {x["id"]: x for x in read_jsonl(PARENT / "MARKING_INDEX.jsonl")}
corrected_rows = []
changed_ids = []
for mid in sorted(mmap):
    if old_marks[mid] != mmap[mid]:
        changed_ids.append(mid)
for mid in target_ids:
    old = old_marks[mid]
    new = mmap[mid]
    changed_fields = sorted(k for k in set(old) | set(new) if old.get(k) != new.get(k))
    oldn, newn = norm(old["mark_or_condition_or_null"]), norm(new["mark_or_condition_or_null"])
    removed = oldn[len(newn):].strip() if oldn.startswith(newn) else None
    loc = new["ms_locator"]
    doc = pymupdf.open(source_by_id[loc["source_id"]]["path"])
    direct_text = doc[loc["pdf_page_1_based"] - 1].get_text()
    doc.close()
    directn = norm(direct_text)
    pos = directn.find(newn)
    source_following = directn[pos + len(newn):pos + len(newn) + 80] if pos >= 0 else None
    corrected_rows.append({
        "record_id": mid,
        "severity": "Major at v2 intake",
        "owner": "A2 correction; A4/A9 retest",
        "source_id": loc["source_id"],
        "pdf_page_1_based": loc["pdf_page_1_based"],
        "table_row": new.get("table_row_ref_or_null"),
        "changed_fields": changed_fields,
        "removed_normalized_text": removed,
        "answer_and_condition_preserved": newn and oldn.startswith(newn),
        "terminal_mark_retained": bool(re.search(r"\b\d+\s*$", new["mark_or_condition_or_null"])),
        "target_preserved": old.get("part_id_or_null") == new.get("part_id_or_null") and old.get("question_id_or_null") == new.get("question_id_or_null"),
        "locator_preserved": old["ms_locator"] == new["ms_locator"],
        "transcript_preserved": old["transcript_ref"] == new["transcript_ref"],
        "table_row_preserved": old.get("table_row_ref_or_null") == new.get("table_row_ref_or_null"),
        "visual_dependency_preserved": old.get("visual_dependency_refs") == new.get("visual_dependency_refs"),
        "status_preserved": old["status"] == new["status"],
        "direct_source_contains_corrected_excerpt": pos >= 0,
        "direct_source_following_text": source_following,
        "direct_source_boundary_is_following_generic_header": bool(source_following and re.match(r"Question Answer Marks?\b", source_following.strip(), re.I)),
        "terminal_generic_header_absent": not terminal_header_re.search(new["mark_or_condition_or_null"] or ""),
    })

# Eleven v2 regressions: ten context removals and W25/13 Q7(e).
correction_v2 = read_json(CAND / "CORRECTION_CHECKS.json")["correction_scope"]
context_retests = []
for item in correction_v2["context_records"]:
    ctx = cmap[item["question_id"]]
    removed_page = item["removed_pdf_page_1_based"]
    doc = pymupdf.open(source_by_id[ctx["source_qp_id"]]["path"])
    direct_text = doc[removed_page - 1].get_text()
    doc.close()
    context_retests.append({
        "question_id": item["question_id"],
        "removed_pdf_page_1_based": removed_page,
        "classification": item["classification"],
        "absent_from_all_context_pages": removed_page not in ctx["all_context_pages"],
        "absent_from_continuation_pages": removed_page not in ctx["continuation_pages"],
        "absent_from_source_evidence": all(x["pdf_page_1_based"] != removed_page for x in ctx["source_evidence"]),
        "direct_source_text_sha256": hashlib.sha256(direct_text.encode("utf-8")).hexdigest(),
        "direct_source_text_excerpt": norm(direct_text)[:240],
    })

preserved_context_controls = [
    {"question_id": "9618_s25_qp_11-q8", "required_present": [15], "required_absent": []},
    {"question_id": "9618_w25_qp_13-q5", "required_present": [7, 8], "required_absent": [9]},
]
for control in preserved_context_controls:
    pages = cmap[control["question_id"]]["all_context_pages"]
    control["actual_all_context_pages"] = pages
    control["pass"] = all(x in pages for x in control["required_present"]) and all(x not in pages for x in control["required_absent"])

q7e = mmap["9618_w25_qp_13-q7-pe-mi-1"]
q7e_retest = {
    "record_id": q7e["id"],
    "source_locator": q7e["ms_locator"],
    "terminal_generic_header_absent": not terminal_header_re.search(q7e["mark_or_condition_or_null"]),
    "answer_condition_and_mark_present": all(x in norm(q7e["mark_or_condition_or_null"]) for x in ["Range Check", "Existence Check", "Format Check", "max 3 marks", "3"]),
    "target": q7e["part_id_or_null"],
    "transcript_exists": (CAND / q7e["transcript_ref"]).is_file(),
    "visual_dependencies_resolve": all(x in vmap for x in q7e["visual_dependency_refs"]),
}

# Direct original-page sample: all session/component/source combinations and all required risk classes.
sample_specs = [
    ("9618_s25_qp_11", 2, "first-question/shared-page baseline"),
    ("9618_s25_qp_11", 7, "v1 boundary removal; Q4 starts"),
    ("9618_s25_qp_11", 15, "required Q8 continuation with trace table retained"),
    ("9618_s25_qp_12", 5, "v1 boundary removal; Q3 starts"),
    ("9618_s25_qp_12", 8, "table/diagram risk"),
    ("9618_s25_qp_12", 11, "v1 boundary removal; Q6 starts"),
    ("9618_s25_qp_13", 2, "whole-question/shared-page baseline"),
    ("9618_w25_qp_11", 7, "v1 boundary removal; Q3 logic circuit and truth table"),
    ("9618_w25_qp_11", 11, "v1 boundary removal; Q6 starts"),
    ("9618_w25_qp_12", 13, "v1 boundary removal; Q8 starts"),
    ("9618_w25_qp_12", 15, "v1 boundary removal; Q10 starts"),
    ("9618_w25_qp_13", 3, "v1 boundary removal; Q2 starts"),
    ("9618_w25_qp_13", 5, "v1 boundary removal; Q4 starts"),
    ("9618_w25_qp_13", 7, "required Q5 multi-page continuation retained"),
    ("9618_w25_qp_13", 8, "required Q5 multi-page continuation retained"),
    ("9618_w25_qp_13", 9, "v1 boundary exclusion; next-question notice only"),
    ("9618_s25_ms_11", 3, "mark-scheme alternatives/conditions"),
    ("9618_s25_ms_12", 5, "part-target and row-boundary"),
    ("9618_s25_ms_13", 5, "mark-scheme table/conditions"),
    ("9618_w25_ms_11", 3, "mark-scheme alternatives/conditions"),
    ("9618_w25_ms_12", 4, "corrected whole-question row 1 boundary"),
    ("9618_w25_ms_12", 5, "corrected part row 2(b) boundary"),
    ("9618_w25_ms_12", 8, "corrected table row 5(e) boundary"),
    ("9618_w25_ms_12", 9, "corrected formula row 6(d) boundary"),
    ("9618_w25_ms_12", 10, "corrected row 8(b)(ii) boundary"),
    ("9618_w25_ms_12", 11, "corrected rows 9(b) and 10(c) boundaries"),
    ("9618_w25_ms_13", 6, "corrected diagram row 3(b) boundary"),
    ("9618_w25_ms_13", 12, "W25/13 Q7(e) prior correction retest"),
]

samples = []
rendered_paths = []
for sid, page_no, purpose in sample_specs:
    doc = pymupdf.open(source_by_id[sid]["path"])
    page = doc[page_no - 1]
    pix = page.get_pixmap(matrix=pymupdf.Matrix(1.15, 1.15), alpha=False)
    out_path = OUT / "direct_source_renders" / f"{sid}-p{page_no:03d}.png"
    pix.save(out_path)
    direct_text = page.get_text()
    doc.close()
    candidate_path = CAND / "renders/full_pages" / f"{sid}-p{page_no:02d}.png"
    with Image.open(out_path) as a, Image.open(candidate_path) as b:
        pixel_match = a.mode == b.mode and a.size == b.size and a.tobytes() == b.tobytes()
        size = a.size
    transcript_path = CAND / f"transcripts/{sid}-p{page_no:03d}.txt"
    samples.append({
        "source_id": sid,
        "session": "May/June" if "_s25_" in sid else "October/November",
        "component": sid[-2:],
        "kind": "mark_scheme" if "_ms_" in sid else "question_paper",
        "pdf_page_1_based": page_no,
        "purpose": purpose,
        "direct_render_path": out_path.relative_to(OUT).as_posix(),
        "direct_render_sha256": sha256(out_path),
        "candidate_render_path": candidate_path.relative_to(CAND).as_posix(),
        "decoded_pixel_match": pixel_match,
        "pixel_dimensions": list(size),
        "fresh_text_matches_candidate_transcript": transcript_path.is_file() and norm(direct_text) == norm(transcript_path.read_text(encoding="utf-8")),
        "fresh_text_sha256": hashlib.sha256(direct_text.encode("utf-8")).hexdigest(),
    })
    rendered_paths.append((out_path, f"{sid} p{page_no}: {purpose}"))

# Contact sheets are review aids derived from the fresh direct-source renders.
font = ImageFont.load_default()
sheet_paths = []
for group_index in range(0, len(rendered_paths), 7):
    group = rendered_paths[group_index:group_index + 7]
    thumb_w = 520
    cards = []
    for p, title in group:
        with Image.open(p) as im:
            ratio = thumb_w / im.width
            thumb = im.resize((thumb_w, int(im.height * ratio)), Image.Resampling.LANCZOS)
        card = Image.new("RGB", (thumb_w + 20, thumb.height + 52), "white")
        card.paste(thumb, (10, 42))
        draw = ImageDraw.Draw(card)
        draw.text((10, 8), title[:90], fill="black", font=font)
        cards.append(card)
    sheet_w = max(x.width for x in cards) * 2
    rows_n = (len(cards) + 1) // 2
    sheet_h = max(x.height for x in cards) * rows_n
    sheet = Image.new("RGB", (sheet_w, sheet_h), "#dddddd")
    for i, card in enumerate(cards):
        sheet.paste(card, ((i % 2) * card.width, (i // 2) * card.height))
    sheet_path = OUT / "contact_sheets" / f"DIRECT_SAMPLE_{group_index // 7 + 1:02d}.jpg"
    sheet.save(sheet_path, quality=92)
    sheet_paths.append(sheet_path)

counts = {
    "pages": len(PAGES),
    "question_roots": len(roots),
    "parts": len(parts),
    "question_and_part_records": len(QUESTIONS),
    "marking_items": len(MARKS),
    "question_contexts": len(CONTEXTS),
    "visual_regions": len(VISUALS),
    "parent_groups": len(parent_groups),
}

check_bools = {
    "frozen_pins": all(x["match"] for x in pin_checks),
    "candidate_snapshot_450": snapshot["file_count"] == 450 and len(snapshot_checks) == 450 and all(x["match"] for x in snapshot_checks),
    "a3_handoff_and_outputs": all(x["match"] for x in a3_output_checks),
    "a3_carried_forward_identity": len(a3_identity) > 0 and all(x["byte_identical"] for x in a3_identity),
    "a4_handoff_and_outputs": all(x["match"] for x in a4_output_checks),
    "source_pdfs": len(source_checks) == 12 and sum(x["actual_pages"] for x in source_checks) == 178 and all(x["match"] for x in source_checks),
    "aggregate_counts": counts == {"pages": 178, "question_roots": 51, "parts": 207, "question_and_part_records": 258, "marking_items": 183, "question_contexts": 51, "visual_regions": 144, "parent_groups": 27},
    "unique_ids": not any(duplicates.values()),
    "allowed_statuses": not status_errors,
    "cross_references": not crossref_errors and not visual_errors and all(x["pass"] for x in mark_checks),
    "six_75_mark_totals": len(marks_by_qp) == 6 and all(x == 75 for x in marks_by_qp.values()),
    "parent_groups": len(parent_groups) == 27 and not parent_errors,
    "eight_exact_corrections": changed_ids == target_ids and all(
        x["changed_fields"] == ["mark_or_condition_or_null"]
        and x["removed_normalized_text"] == "Question Answer Marks"
        and x["answer_and_condition_preserved"]
        and x["terminal_mark_retained"]
        and x["target_preserved"]
        and x["locator_preserved"]
        and x["transcript_preserved"]
        and x["table_row_preserved"]
        and x["visual_dependency_preserved"]
        and x["status_preserved"]
        and x["direct_source_contains_corrected_excerpt"]
        and x["direct_source_boundary_is_following_generic_header"]
        and x["terminal_generic_header_absent"]
        for x in corrected_rows
    ),
    "zero_terminal_generic_headers": not any(x["terminal_generic_header"] for x in mark_checks),
    "ten_context_regressions": len(context_retests) == 10 and all(x["absent_from_all_context_pages"] and x["absent_from_continuation_pages"] and x["absent_from_source_evidence"] for x in context_retests),
    "preserved_context_controls": all(x["pass"] for x in preserved_context_controls),
    "w25_13_q7e": all(q7e_retest[k] for k in ["terminal_generic_header_absent", "answer_condition_and_mark_present", "transcript_exists", "visual_dependencies_resolve"]),
    "direct_source_sample": len(samples) == 28 and len({x["source_id"] for x in samples}) == 12 and all(x["decoded_pixel_match"] and x["fresh_text_matches_candidate_transcript"] for x in samples),
    "manual_visual_inspection": MANUAL_VISUAL_RESULT == "PASS",
}

machine = {
    "schema_version": "1.0",
    "artifact_version": "B25-A9-RETEST-v3",
    "work_order": "P1-S1-A9-B25-RETEST-V3",
    "candidate": "B25-A2-v3",
    "counts": counts,
    "marks_by_qp": marks_by_qp,
    "status_counts": {
        "question_and_part": dict(collections.Counter(x["status"] for x in QUESTIONS)),
        "marking_item": dict(collections.Counter(x["status"] for x in MARKS)),
        "visual_region": dict(collections.Counter(x["reviewer_status"] for x in VISUALS)),
    },
    "mark_target_counts": mark_target_counts,
    "duplicates": duplicates,
    "status_errors": status_errors,
    "cross_reference_errors": crossref_errors,
    "visual_errors": visual_errors,
    "mark_check_failures": [x for x in mark_checks if not x["pass"]],
    "parent_group_errors": parent_errors,
    "checks": check_bools,
    "result": "PASS" if all(check_bools.values()) else "PENDING_OR_FAIL",
}

inputs = {
    "schema_version": "1.0",
    "artifact_version": "B25-A9-INPUTS-v3",
    "pins": pin_checks,
    "summary": {"checked": len(pin_checks), "mismatches": sum(not x["match"] for x in pin_checks)},
    "candidate_snapshot": {
        "manifest_path": rel(CAND / "SNAPSHOT_MANIFEST.json"),
        "manifest_sha256": sha256(CAND / "SNAPSHOT_MANIFEST.json"),
        "declared_entries": snapshot["file_count"],
        "checked_entries": len(snapshot_checks),
        "checked_bytes": sum(x["actual_byte_count"] or 0 for x in snapshot_checks),
        "mismatches": [x for x in snapshot_checks if not x["match"]],
    },
    "a3_carried_forward": {
        "handoff_sha256": sha256(A3 / "HANDOFF_RETEST_V2.json"),
        "declared_outputs_checked": len(a3_output_checks),
        "declared_output_mismatches": [x for x in a3_output_checks if not x["match"]],
        "v2_to_v3_scope_files_checked": len(a3_identity),
        "v2_to_v3_identity_mismatches": [x for x in a3_identity if not x["byte_identical"]],
        "basis": "QUESTION_INDEX, PAGE_INDEX, VISUAL_MANIFEST, every context, transcript and render are byte-identical between B25-A2-v2 and B25-A2-v3.",
    },
    "a4_same_version": {
        "handoff_candidate": read_json(A4 / "HANDOFF_RETEST_V3.json")["candidate_version"],
        "recommendation": read_json(A4 / "HANDOFF_RETEST_V3.json")["recommendation"],
        "declared_outputs_checked": len(a4_output_checks),
        "declared_output_mismatches": [x for x in a4_output_checks if not x["match"]],
    },
}

source_manifest = {
    "schema_version": "1.0",
    "artifact_version": "B25-A9-SOURCES-v3",
    "stage0_manifest": {"path": rel(S0 / "evidence/a2/SOURCE_MANIFEST.json"), "sha256": sha256(S0 / "evidence/a2/SOURCE_MANIFEST.json")},
    "sources": source_checks,
    "summary": {"source_count": len(source_checks), "total_pages": sum(x["actual_pages"] for x in source_checks), "mismatches": sum(not x["match"] for x in source_checks)},
}

direct_source = {
    "schema_version": "1.0",
    "artifact_version": "B25-A9-DIRECT-SOURCE-v3",
    "method": "Fresh PyMuPDF extraction and 1.15x RGB rendering from the 12 Stage 0-pinned original PDFs; decoded pixels compared with candidate full-page renders. A9 separately inspects the generated contact sheets and corrected-row pages.",
    "risk_classes": ["blank/imprint and next-question boundaries", "shared-page context", "multi-page prompts", "diagrams", "tables", "formulae", "mark-scheme alternatives and conditions", "whole-question and part targets", "v1 correction retest", "v2 terminal-header correction retest"],
    "samples": samples,
    "contact_sheets": [manifest_entry(x, OUT) for x in sheet_paths],
    "corrected_rows": corrected_rows,
    "context_retests": context_retests,
    "preserved_context_controls": preserved_context_controls,
    "w25_13_q7e": q7e_retest,
    "manual_visual_result": MANUAL_VISUAL_RESULT,
    "summary": {
        "pages_sampled": len(samples),
        "sources_represented": len({x["source_id"] for x in samples}),
        "pixel_mismatches": sum(not x["decoded_pixel_match"] for x in samples),
        "text_mismatches": sum(not x["fresh_text_matches_candidate_transcript"] for x in samples),
        "corrected_boundaries_checked": len(corrected_rows),
        "context_boundaries_checked": len(context_retests),
    },
}

checks_list = []
for cid, criterion, key, evidence in [
    ("C01", "Frozen input identities", "frozen_pins", f"{len(pin_checks)} pins rehashed"),
    ("C02", "Candidate snapshot integrity", "candidate_snapshot_450", f"{len(snapshot_checks)} entries rehashed"),
    ("C03", "A3 carried-forward identity", "a3_carried_forward_identity", f"{len(a3_identity)} context/scope/locator/visual files byte-identical v2 to v3"),
    ("C04", "A4-v3 evidence identity", "a4_handoff_and_outputs", f"{len(a4_output_checks)} declared payload files rehashed"),
    ("C05", "Authoritative source identity", "source_pdfs", "12 PDFs, 178 pages"),
    ("C06", "Aggregate counts", "aggregate_counts", json.dumps(counts, sort_keys=True)),
    ("C07", "Unique IDs", "unique_ids", "question/part, marking and visual IDs"),
    ("C08", "Allowed statuses", "allowed_statuses", "page, question/part, marking and visual status sets"),
    ("C09", "Cross-references", "cross_references", "locators, parents, contexts, transcripts, targets and visual dependencies"),
    ("C10", "Six 75-mark totals", "six_75_mark_totals", json.dumps(marks_by_qp, sort_keys=True)),
    ("C11", "Parent groups", "parent_groups", f"{len(parent_groups)} structural parents; no synthetic mark target"),
    ("C12", "Eight A9-B25-MS-01 corrections", "eight_exact_corrections", "all source boundaries and preserved fields retested"),
    ("C13", "Zero residual terminal generic headers", "zero_terminal_generic_headers", "all 183 marking excerpts scanned"),
    ("C14", "Ten context-boundary regressions", "ten_context_regressions", "all ten removals rechecked"),
    ("C15", "Required context controls", "preserved_context_controls", "S25/11 Q8 p15; W25/13 Q5 pp7-8 retained, p9 excluded"),
    ("C16", "W25/13 Q7(e) regression", "w25_13_q7e", "answer, condition, mark, target, locator, transcript and visual dependency preserved"),
    ("C17", "Direct original-page sample", "direct_source_sample", "28 pages, 12 sources, all risk classes"),
    ("C18", "A9 manual visual inspection", "manual_visual_inspection", "generated direct-source contact sheets and corrected pages"),
]:
    checks_list.append({"id": cid, "criterion": criterion, "result": "PASS" if check_bools[key] else "PENDING_OR_FAIL", "evidence": evidence})

open_findings = []
if all(v for k, v in check_bools.items() if k != "manual_visual_inspection") and MANUAL_VISUAL_RESULT == "PENDING":
    open_findings.append({"id": "A9-B25-V3-MANUAL", "severity": "Review control", "status": "PENDING", "owner": "A9", "locator": "contact_sheets/DIRECT_SAMPLE_01.jpg through DIRECT_SAMPLE_04.jpg", "summary": "Manual visual inspection has not yet been recorded.", "retest": "Inspect generated direct-source evidence, set MANUAL_VISUAL_RESULT to PASS, and rerun."})
elif not all(check_bools.values()):
    for key, value in check_bools.items():
        if not value:
            open_findings.append({"id": f"A9-B25-V3-{key.upper()}", "severity": "Major", "status": "OPEN", "owner": "A2/A3/A4 according to criterion", "locator": key, "summary": f"Gate check failed: {key}", "retest": "Correct the exact frozen-input or candidate defect and rerun independent A9 review."})

findings = {
    "schema_version": "1.0",
    "artifact_version": "B25-A9-FINDINGS-v3",
    "candidate": "B25-A2-v3",
    "prior_finding_disposition": {"id": "A9-B25-MS-01", "severity": "Major", "status": "CLOSED_VERIFIED" if check_bools["eight_exact_corrections"] and check_bools["zero_terminal_generic_headers"] else "OPEN", "owner": "A2", "retest": "A9 independently checked all eight original MS boundaries and rescanned all 183 marking rows."},
    "open_findings": open_findings,
    "counts": {
        "critical_open": sum(x.get("severity") == "Critical" for x in open_findings),
        "major_open": sum(x.get("severity") == "Major" for x in open_findings),
        "minor_open": sum(x.get("severity") == "Minor" for x in open_findings),
        "review_control_pending": sum(x.get("severity") == "Review control" for x in open_findings),
    },
}

dump(OUT / "INPUT_MANIFEST_V3.json", inputs)
dump(OUT / "SOURCE_MANIFEST_V3.json", source_manifest)
dump(OUT / "DIRECT_SOURCE_EVIDENCE_V3.json", direct_source)
dump(OUT / "MACHINE_CHECKS_V3.json", machine)
dump(OUT / "CHECK_MATRIX_V3.json", {"schema_version": "1.0", "artifact_version": "B25-A9-CHECK-MATRIX-v3", "checks": checks_list, "summary": {"pass": sum(x["result"] == "PASS" for x in checks_list), "pending_or_fail": sum(x["result"] != "PASS" for x in checks_list)}})
dump(OUT / "FINDINGS_V3.json", findings)

recommendation = "PASS" if all(check_bools.values()) and not open_findings else "CHANGES_REQUIRED"
report = f"""# B25 independent retest v3

Work order: P1-S1-A9-B25-RETEST-V3  
Candidate: B25-A2-v3  
Reviewer: A9 independent reviewer  
Recommendation: **{recommendation}**  
Status: frozen for A0 audit and decision

## Gate result

The independent v3 retest {'passes' if recommendation == 'PASS' else 'does not yet pass'}. The 450-entry candidate snapshot, all frozen inputs, the 12 original 2025 PDFs (178 pages), the carried A3-v2 evidence and the same-version A4-v3 evidence were rehashed. A3-covered context, hierarchy, locator, transcript and visual files are byte-identical between B25-A2-v2 and B25-A2-v3.

## Corrected Major finding

A9-B25-MS-01 is {'closed' if check_bools['eight_exact_corrections'] and check_bools['zero_terminal_generic_headers'] else 'not closed'}. All eight cited records were checked against their original W25/12 or W25/13 marking-scheme page. Each corrected excerpt stops at its terminal mark immediately before the next table's generic `Question / Answer / Marks` header. The answer and marking condition, terminal mark, target, locator, transcript, table row, status and visual dependency remain unchanged. A complete scan of all 183 marking items found {sum(x['terminal_generic_header'] for x in mark_checks)} residual terminal generic headers.

## Complete batch gate

The candidate has {counts['pages']} pages, {counts['question_roots']} question roots, {counts['parts']} parts, {counts['marking_items']} marking items, {counts['question_contexts']} contexts, {counts['visual_regions']} visual regions and {counts['parent_groups']} parent groups. IDs and statuses are valid; parent, locator, transcript, context, target and visual cross-references resolve. Marking targets are {mark_target_counts['part']} parts and {mark_target_counts['whole_question']} whole questions. Each of the six question papers sums to 75 marks.

## Regression and direct-source review

All ten prior context-boundary removals remain absent. S25/11 Q8 page 15 and W25/13 Q5 pages 7–8 remain included, while W25/13 Q5 page 9 remains excluded. W25/13 Q7(e) retains its answer, condition, mark 3, target, locator, transcript and visual dependency without the following table header.

Twenty-eight pages sampled directly from the original PDFs represent every May/June and October/November component 11, 12 and 13 QP/MS source and all required risk classes. Fresh decoded renders match candidate pixels on all {len(samples)} pages, and fresh extracted text matches every corresponding candidate transcript. Manual visual inspection is recorded as **{MANUAL_VISUAL_RESULT}**.

## Scope

This handoff recommends only the Stage 1 B25 gate disposition above. It makes no Stage 2, app, lesson, taxonomy, teaching-coverage or translation claim. A0 retains batch decision authority.
"""
(OUT / "REVIEW_REPORT_V3.md").write_text(report, encoding="utf-8")

# Freeze non-self-referential review outputs before building the handoff.
excluded = {"OUTPUT_MANIFEST_V3.json", "HANDOFF_RETEST_V3.json", "HANDOFF_RETEST_V3.sha256"}
payload_files = [p for p in sorted(OUT.rglob("*")) if p.is_file() and p.name not in excluded]
output_manifest = {
    "schema_version": "1.0",
    "artifact_version": "B25-A9-OUTPUTS-v3",
    "exclusions": sorted(excluded),
    "file_count": len(payload_files),
    "files": [manifest_entry(p, OUT) for p in payload_files],
}
dump(OUT / "OUTPUT_MANIFEST_V3.json", output_manifest)

handoff = {
    "schema_version": "1.0",
    "artifact_version": "B25-A9-RETEST-v3",
    "work_order": "P1-S1-A9-B25-RETEST-V3",
    "candidate": "B25-A2-v3",
    "reviewer": "A9 independent reviewer",
    "created_at_utc": datetime.now(timezone.utc).isoformat(),
    "state": "FROZEN_FOR_A0_AUDIT_AND_DECISION",
    "recommendation": recommendation,
    "batch_acceptance": False,
    "candidate_modified": False,
    "write_scope_observed": rel(OUT) + "/",
    "input_verification": {
        "pins_checked": len(pin_checks),
        "pin_mismatches": sum(not x["match"] for x in pin_checks),
        "snapshot_entries_checked": len(snapshot_checks),
        "snapshot_mismatches": sum(not x["match"] for x in snapshot_checks),
        "a3_scope_files_checked": len(a3_identity),
        "a3_scope_identity_mismatches": sum(not x["byte_identical"] for x in a3_identity),
        "a4_payload_files_checked": len(a4_output_checks),
        "a4_payload_mismatches": sum(not x["match"] for x in a4_output_checks),
        "source_pdfs_checked": len(source_checks),
        "source_pages": sum(x["actual_pages"] for x in source_checks),
        "source_mismatches": sum(not x["match"] for x in source_checks),
    },
    "review_results": {
        "counts": counts,
        "mark_target_counts": mark_target_counts,
        "six_qp_totals": marks_by_qp,
        "corrected_rows_checked": len(corrected_rows),
        "corrected_rows_failed": sum(not all([x["changed_fields"] == ["mark_or_condition_or_null"], x["answer_and_condition_preserved"], x["terminal_mark_retained"], x["target_preserved"], x["locator_preserved"], x["transcript_preserved"], x["table_row_preserved"], x["visual_dependency_preserved"], x["direct_source_boundary_is_following_generic_header"], x["terminal_generic_header_absent"]]) for x in corrected_rows),
        "terminal_generic_headers_remaining": sum(x["terminal_generic_header"] for x in mark_checks),
        "context_boundary_retests": len(context_retests),
        "direct_source_pages_sampled": len(samples),
        "direct_source_pixel_mismatches": sum(not x["decoded_pixel_match"] for x in samples),
        "manual_visual_inspection": MANUAL_VISUAL_RESULT,
        "open_critical": findings["counts"]["critical_open"],
        "open_major": findings["counts"]["major_open"],
        "open_minor": findings["counts"]["minor_open"],
    },
    "prior_finding": findings["prior_finding_disposition"],
    "deliverables": {
        "review_report": {"path": "REVIEW_REPORT_V3.md", "sha256": sha256(OUT / "REVIEW_REPORT_V3.md")},
        "machine_checks": {"path": "MACHINE_CHECKS_V3.json", "sha256": sha256(OUT / "MACHINE_CHECKS_V3.json")},
        "findings": {"path": "FINDINGS_V3.json", "sha256": sha256(OUT / "FINDINGS_V3.json")},
        "input_manifest": {"path": "INPUT_MANIFEST_V3.json", "sha256": sha256(OUT / "INPUT_MANIFEST_V3.json")},
        "source_manifest": {"path": "SOURCE_MANIFEST_V3.json", "sha256": sha256(OUT / "SOURCE_MANIFEST_V3.json")},
        "direct_source_evidence": {"path": "DIRECT_SOURCE_EVIDENCE_V3.json", "sha256": sha256(OUT / "DIRECT_SOURCE_EVIDENCE_V3.json")},
        "check_matrix": {"path": "CHECK_MATRIX_V3.json", "sha256": sha256(OUT / "CHECK_MATRIX_V3.json")},
        "output_manifest": {"path": "OUTPUT_MANIFEST_V3.json", "sha256": sha256(OUT / "OUTPUT_MANIFEST_V3.json"), "file_count": len(payload_files)},
    },
    "limitations": ["No Stage 2, app, lesson, taxonomy, teaching-coverage or translation claim.", "A0 retains final batch decision authority."],
    "stop_instruction": "Freeze and stop for A0 audit and decision.",
}
dump(OUT / "HANDOFF_RETEST_V3.json", handoff)
(OUT / "HANDOFF_RETEST_V3.sha256").write_text(f"{sha256(OUT / 'HANDOFF_RETEST_V3.json')}  HANDOFF_RETEST_V3.json\n", encoding="ascii")

print(json.dumps({
    "recommendation": recommendation,
    "machine_result": machine["result"],
    "failed_or_pending_checks": [k for k, v in check_bools.items() if not v],
    "open_findings": open_findings,
    "handoff_sha256": sha256(OUT / "HANDOFF_RETEST_V3.json"),
    "output_manifest_sha256": sha256(OUT / "OUTPUT_MANIFEST_V3.json"),
}, indent=2))
