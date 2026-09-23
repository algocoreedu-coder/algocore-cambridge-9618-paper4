import hashlib, json
from pathlib import Path

HERE = Path(__file__).resolve().parent
paths = [
    "implementation/stack_pilot.py", "implementation/IMPLEMENTATION_REGISTRY.json",
    "fixtures/P0_FIXTURES.json", "fixtures/FIXTURE_REGISTRY.json", "runs/AUTHOR_RUN.json",
    "qa/A5_INDEPENDENT_RERUN.json", "traces/TRACE_BUNDLE.json", "P0_COVERAGE.json",
    "A1_LEARNING_HANDOFF.md", "P0_GATE_REPORT.md", "README.md",
]
def digest(p):
    h=hashlib.sha256(); h.update(p.read_bytes()); return h.hexdigest()
out={p:digest(HERE/p) for p in paths}
(HERE/"P0_HASHES.json").write_text(json.dumps({"schema_version":"s5-p0-hashes-v1","files":out},indent=2)+"\n",encoding="utf-8")
print(json.dumps(out,indent=2))
