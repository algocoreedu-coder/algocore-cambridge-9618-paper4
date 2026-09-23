"""Hash the exact canonical source families consumed by the full registry compiler."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path


HERE = Path(__file__).resolve().parent
APP = HERE.parents[5] / "algocore-fumadocs"
PLANNING = HERE.parents[2]


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


files = {
    *(APP / "content/paper4/lessons").rglob("*.knowledge-unit.json"),
    *(APP / "content/paper4/python").rglob("artifact.json"),
    *(APP / "content/paper4/python").rglob("source.py"),
    *(APP / "content/paper4/python").rglob("fixtures/*.json"),
    *(APP / "content/paper4/visuals").rglob("visuals.json"),
    APP / "content/paper4/assessments/pilot/marking-chains.json",
    APP / "content/paper4/assessments/pilot/assessment-items.json",
    APP / "content/paper4/assessments/production/marking-chains.json",
    APP / "content/paper4/assessments/production/assessment-items.json",
    APP / "content/paper4/mappings/lesson-source-map.json",
    APP / "content/paper4/schema/paper4-v2.schema.json",
    PLANNING / "evidence/p4r-2/a3/EVIDENCE_RESOLVER.json",
    PLANNING / "evidence/p4r-3/a3/EVIDENCE_RESOLVER.json",
}
base = APP.parent.parent
records = [
    {"path": path.relative_to(base).as_posix(), "sha256": sha256(path)}
    for path in sorted(files)
]
aggregate_payload = "".join(f"{item['sha256']}  {item['path']}\n" for item in records)
print(json.dumps({
    "schema_version": "paper4-p4r4-a8-input-hashes-v1",
    "decision": "PASS",
    "checker_mode": "READ_ONLY",
    "file_count": len(records),
    "aggregate_sha256": hashlib.sha256(aggregate_payload.encode("utf-8")).hexdigest(),
    "files": records,
}, indent=2, ensure_ascii=False))
