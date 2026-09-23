import hashlib
import json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[7]
S2 = Path("A_Level_CS_page/planning/paper1/stage-2")
OLD = S2 / "evidence/a6/glossary-v2"
NEW = S2 / "evidence/a6/glossary-v2-r1"
ISSUED = S2 / "work-orders/c3/P1-S2-A6-CORRECT-GLOSSARY-v2-r1_INPUT_MANIFEST.json"


def sha(path):
    return hashlib.sha256((ROOT / path).read_bytes()).hexdigest()


def file_row(path):
    b = (ROOT / path).read_bytes()
    return {"path": path.as_posix(), "bytes": len(b), "sha256": hashlib.sha256(b).hexdigest()}


def load(path):
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def load_jsonl(path):
    return [json.loads(line) for line in (ROOT / path).read_text(encoding="utf-8").splitlines() if line.strip()]


def check(status, check_id, detail):
    return {"check_id": check_id, "status": "PASS" if status else "FAIL", "detail": detail}


expected_files = sorted([
    "COMMAND_WORD_REGISTER.jsonl", "CONFLICTS_AND_BOUNDARIES.md", "GLOSSARY_SEED_V2.jsonl",
    "HANDOFF.json", "INPUT_MANIFEST.json", "OUTPUT_MANIFEST.json", "QA.json", "RECONCILIATION_DELTA.json",
])
actual_files = sorted(p.name for p in (ROOT / NEW).iterdir() if p.is_file())

issued = load(ISSUED)
copied = load(NEW / "INPUT_MANIFEST.json")
input_drift = []
for row in copied["files"]:
    p = Path(row["path"])
    if not (ROOT / p).exists():
        input_drift.append({"path": row["path"], "error": "MISSING"})
        continue
    cur = file_row(p)
    if cur["bytes"] != row["bytes"] or cur["sha256"] != row["sha256"]:
        input_drift.append({"path": row["path"], "expected": row, "actual": cur})

om = load(NEW / "OUTPUT_MANIFEST.json")
om_rows = om.get("outputs", om.get("files", []))
manifest_bad = []
for row in om_rows:
    cur = file_row(Path(row["path"]))
    if cur["bytes"] != row["bytes"] or cur["sha256"] != row["sha256"]:
        manifest_bad.append({"path": row["path"], "actual": cur})

handoff = load(NEW / "HANDOFF.json")
handoff_bad = []
for key in ["input_manifest", "output_manifest"]:
    row = handoff[key]
    cur = file_row(Path(row["path"]))
    if cur["bytes"] != row["bytes"] or cur["sha256"] != row["sha256"]:
        handoff_bad.append({"field": key, "actual": cur})
for key, row in handoff["primary_outputs"].items():
    cur = file_row(Path(row["path"]))
    if cur["bytes"] != row["bytes"] or cur["sha256"] != row["sha256"]:
        handoff_bad.append({"field": key, "actual": cur})

old_rows = load_jsonl(OLD / "GLOSSARY_SEED_V2.jsonl")
new_rows = load_jsonl(NEW / "GLOSSARY_SEED_V2.jsonl")
old_by = {r["term_id"]: r for r in old_rows}
new_by = {r["term_id"]: r for r in new_rows}

reconciliation_fields = {
    "objective_ids", "pattern_ids", "reconciliation_status", "reconciliation_methods",
    "reconciliation_evidence", "reconciliation_disposition", "reconciliation_sources",
}
protected_drift = []
for term_id in sorted(set(old_by) | set(new_by)):
    if term_id not in old_by or term_id not in new_by:
        protected_drift.append({"term_id": term_id, "kind": "missing_or_extra"})
        continue
    for key in sorted(set(old_by[term_id]) | set(new_by[term_id])):
        if key not in reconciliation_fields and old_by[term_id].get(key) != new_by[term_id].get(key):
            protected_drift.append({"term_id": term_id, "field": key})

old_pairs = {(r["term_id"], pid) for r in old_rows for pid in r["pattern_ids"]}
new_pairs = {(r["term_id"], pid) for r in new_rows for pid in r["pattern_ids"]}
added = new_pairs - old_pairs
removed = old_pairs - new_pairs

patterns_obj = load(S2 / "evidence/a4/pattern-final-v1/PATTERN_CATALOG.json")
patterns = patterns_obj["patterns"]
command_rows = [r for r in new_rows if r["term_kind"] == "COMMAND_WORD"]
command_map = {r["canonical_en"]: r["term_id"] for r in command_rows}
expected_command_pairs = set()
for pattern in patterns:
    for observation in pattern.get("command_words_observed", []):
        for token in observation.split(";"):
            token = token.strip()
            if token in command_map:
                expected_command_pairs.add((command_map[token], pattern["pattern_id"]))
actual_command_pairs = {(r["term_id"], pid) for r in command_rows for pid in r["pattern_ids"]}

required_removed = {("TERM-VAL-CHECK-DIGIT", pid) for pid in [
    "PAT-C3A2-0362", "PAT-C3A2-0394", "PAT-C3A2-0395", "PAT-C3A2-0396", "PAT-C3A2-0397",
    "PAT-C3A2-0398", "PAT-C3A2-0399", "PAT-C3A2-0400", "PAT-C3A2-0401",
]}
justify = new_by["TERM-CW-JUSTIFY"]
check_digit = new_by["TERM-VAL-CHECK-DIGIT"]
check_digit_req_ids = sorted({e.get("requirement_id") for e in check_digit["reconciliation_evidence"] if e.get("link_kind") == "OBJECTIVE"})

delta = load(NEW / "RECONCILIATION_DELTA.json")
delta_rows = delta["rows"]
delta_bad = []
def normalized_delta_value(key, value):
    if key == "reconciliation_methods" and isinstance(value, str):
        return [value]
    return value

for row in delta_rows:
    term_id = row["term_id"]
    before = row["before"]
    after = row["after"]
    for key in reconciliation_fields:
        if key in before and before[key] != normalized_delta_value(key, old_by[term_id].get(key)):
            delta_bad.append({"term_id": term_id, "side": "before", "field": key})
        if key in after and after[key] != normalized_delta_value(key, new_by[term_id].get(key)):
            delta_bad.append({"term_id": term_id, "side": "after", "field": key})

prohibited = []
for name in expected_files:
    data = (ROOT / NEW / name).read_bytes()
    bad = [(i, b) for i, b in enumerate(data) if b < 32 and b != 10 or b == 127]
    if bad:
        prohibited.append({"file": name, "count": len(bad), "sample": bad[:10]})
boundary = (ROOT / NEW / "CONFLICTS_AND_BOUNDARIES.md").read_text(encoding="utf-8")
required_tokens = [
    "requirement_ids", "validation", "verification", "bit", "byte", "accuracy", "table", "record",
    "field", "attribute", "relationship", "normalisation", "normalised",
]
missing_tokens = [t for t in required_tokens if t not in boundary]

qa = load(NEW / "QA.json")
checks = [
    check(actual_files == expected_files, "A0-C3C-G2R1-01-EXACT-EIGHT", {"actual": actual_files}),
    check(sha(ISSUED) == sha(NEW / "INPUT_MANIFEST.json") and copied == issued, "A0-C3C-G2R1-02-INPUT-COPY", {"issued": sha(ISSUED), "copy": sha(NEW / "INPUT_MANIFEST.json")}),
    check(len(copied["files"]) == 295 and not input_drift, "A0-C3C-G2R1-03-INPUT-REHASH", {"checked": len(copied["files"]), "drift": input_drift}),
    check(len(om_rows) == 6 and not manifest_bad and not handoff_bad, "A0-C3C-G2R1-04-CLOSURE", {"manifest_entries": len(om_rows), "manifest_bad": manifest_bad, "handoff_bad": handoff_bad}),
    check(len(old_rows) == len(new_rows) == len(old_by) == len(new_by) == 96 and set(old_by) == set(new_by), "A0-C3C-G2R1-05-TERM-IDENTITY", {"old": len(old_rows), "new": len(new_rows), "unique_new": len(new_by)}),
    check(not protected_drift and sha(OLD / "COMMAND_WORD_REGISTER.jsonl") == sha(NEW / "COMMAND_WORD_REGISTER.jsonl"), "A0-C3C-G2R1-06-PRESERVATION", {"protected_drift": protected_drift, "command_sha256": sha(NEW / "COMMAND_WORD_REGISTER.jsonl")}),
    check(len(added) == 63 and len(removed) == 9 and removed == required_removed and len(new_pairs) == 874, "A0-C3C-G2R1-07-PAIR-DELTA", {"added": len(added), "removed": len(removed), "net": len(new_pairs)-len(old_pairs), "new_total": len(new_pairs), "unexpected_removed": sorted(removed-required_removed), "missing_required_removals": sorted(required_removed-removed)}),
    check(actual_command_pairs == expected_command_pairs and len(added & expected_command_pairs) == 63, "A0-C3C-G2R1-08-COMMAND-PROJECTION", {"expected": len(expected_command_pairs), "actual": len(actual_command_pairs), "missing": sorted(expected_command_pairs-actual_command_pairs), "extra": sorted(actual_command_pairs-expected_command_pairs), "added_expected": len(added & expected_command_pairs)}),
    check(justify["reconciliation_status"] == "RECONCILED" and justify["pattern_ids"] == ["PAT-C3A2-0028", "PAT-C3A2-0075", "PAT-C3A2-0142", "PAT-C3A2-0192"], "A0-C3C-G2R1-09-JUSTIFY", {"status": justify["reconciliation_status"], "pattern_ids": justify["pattern_ids"]}),
    check(check_digit["objective_ids"] == ["AC26-6.2-02"] and check_digit["pattern_ids"] == [] and check_digit_req_ids == ["REQ-6.2-02-07"], "A0-C3C-G2R1-10-CHECK-DIGIT", {"objective_ids": check_digit["objective_ids"], "pattern_ids": check_digit["pattern_ids"], "objective_evidence_requirement_ids": check_digit_req_ids}),
    check(len(delta_rows) == 96 and not delta_bad and len(delta.get("added_pairs", [])) == 63 and len(delta.get("removed_pairs", [])) == 9, "A0-C3C-G2R1-11-DELTA", {"rows": len(delta_rows), "mismatches": delta_bad, "added_pairs": len(delta.get("added_pairs", [])), "removed_pairs": len(delta.get("removed_pairs", []))}),
    check(not prohibited and not missing_tokens, "A0-C3C-G2R1-12-TEXT-INTEGRITY", {"prohibited": prohibited, "missing_required_tokens": missing_tokens}),
    check(qa.get("author_check_result") == "PASS" and all(c.get("result") == "PASS" for c in qa.get("checks", [])), "A0-C3C-G2R1-13-QA", {"result": qa.get("author_check_result"), "checks": len(qa.get("checks", []))}),
]

result = {
    "schema_version": "1.0",
    "audit_role": "A0 glossary-v2-r1 pre-retest independent audit",
    "artifact": "glossary-v2-r1",
    "result": "PASS" if all(c["status"] == "PASS" for c in checks) else "FAIL",
    "author_handoff": file_row(NEW / "HANDOFF.json"),
    "counts": {
        "terms": len(new_rows), "command_words": len(command_rows),
        "objective_link_instances": sum(len(r["objective_ids"]) for r in new_rows),
        "pattern_link_instances": len(new_pairs),
        "status_counts": dict(Counter(r["reconciliation_status"] for r in new_rows)),
    },
    "checks": checks,
    "note": "Fresh independent A3 and A4 full-packet retests remain required; this audit does not close findings or accept C3c."
}

out = S2 / "evidence/a0/c3c/GLOSSARY_V2_R1_PRE_RETEST_AUDIT.json"
(ROOT / out).write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
print(json.dumps({"result": result["result"], "audit": file_row(out), "failed": [c["check_id"] for c in checks if c["status"] != "PASS"]}, indent=2))
