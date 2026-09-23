"""Reproducible B7 candidate runner."""
import importlib.util
from pathlib import Path

_spec = importlib.util.spec_from_file_location("b7_builder", Path(__file__).with_name("build_b7.py"))
_module = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_module)
main = _module.main


if __name__ == "__main__":
    main()
