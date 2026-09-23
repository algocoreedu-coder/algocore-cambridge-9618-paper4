"""Build all candidate B6 artifacts using the locked runner."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from run_b6 import build

if __name__ == "__main__":
    build()
