from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[5]
BATCH = ROOT / "stage-1" / "batches" / "2025"
HEADER = re.compile(r"^### (?P<part>.+?) QP\[(?P<qp>.*?)\] MS\[(?P<ms>.*?)\] MARKS (?P<marks>\d+)/(?P<msmarks>\d+)$", re.M)

for path in sorted(BATCH.glob("9618_*_review.txt")):
    text = path.read_text(encoding="utf-8")
    matches = list(HEADER.finditer(text))
    print(path.stem)
    for i, match in enumerate(matches):
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        section = text[match.end():end]
        ms = section.split("MS BEGIN:", 1)[1]
        lines = [line.strip() for line in ms.splitlines() if line.strip()]
        pre = []
        for line in lines[1:]:
            if line == "•" or line.startswith("Example") or line.startswith("©"):
                break
            pre.append(line)
        print(f"  {match.group('part'):9} {match.group('marks'):>2}: {' | '.join(pre[:5])}")
