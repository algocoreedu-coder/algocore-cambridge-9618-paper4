from __future__ import annotations

import hashlib
import json
import platform
import subprocess
import sys
import tempfile
from datetime import datetime, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent
RUNNER = HERE / "run_p0.py"
OUT = HERE / "qa" / "A5_INDEPENDENT_RERUN.json"


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def main() -> int:
    with tempfile.TemporaryDirectory(prefix="algocore-p0-a5-") as temp:
        proc = subprocess.run(
            [sys.executable, str(RUNNER)], cwd=temp, text=True,
            capture_output=True, timeout=10, check=False,
        )
        report = {
            "schema_version": "s5-p0-independent-rerun-v1",
            "batch_id": "P0", "reviewer": "A5_independent_test_engineer",
            "author_excluded_from_review": True,
            "clean_state": {
                "fresh_process": True, "temporary_workdir": temp,
                "environment_reset": "subprocess inherited only standard process environment; no test state read from cwd",
            },
            "runtime": {"python": sys.version, "implementation": platform.python_implementation(),
                        "os": platform.platform(), "command": f"{sys.executable} {RUNNER.name}",
                        "timeout_seconds": 10, "termination": "completed" if proc.returncode == 0 else "nonzero_exit"},
            "stdout": proc.stdout,
            "stderr": proc.stderr,
            "exit_code": proc.returncode,
            "run_report_sha256": sha256(HERE / "runs" / "AUTHOR_RUN.json"),
            "trace_bundle_sha256": sha256(HERE / "traces" / "TRACE_BUNDLE.json"),
            "author_run_counts_after_rerun": json.loads((HERE / "runs" / "AUTHOR_RUN.json").read_text(encoding="utf-8"))["fresh_fixture_counts"],
            "source_anchor_counts_after_rerun": json.loads((HERE / "runs" / "AUTHOR_RUN.json").read_text(encoding="utf-8"))["source_anchor_counts"],
            "result": "PASS" if proc.returncode == 0 else "REWORK",
            "checked_at": datetime.now(timezone.utc).isoformat(),
        }
    OUT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"result": report["result"], "exit_code": proc.returncode}, ensure_ascii=True))
    return proc.returncode


if __name__ == "__main__":
    raise SystemExit(main())
