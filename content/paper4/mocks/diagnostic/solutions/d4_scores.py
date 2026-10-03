from pathlib import Path
from tempfile import TemporaryDirectory


def analyse_scores(path):
    values = []
    invalid = []
    with path.open(encoding="utf-8") as source:
        for line_number, raw in enumerate(source, 1):
            text = raw.strip()
            if text == "":
                continue
            try:
                values.append(int(text))
            except ValueError:
                invalid.append((line_number, text))
    average = None if not values else sum(values) / len(values)
    return average, invalid


if __name__ == "__main__":
    with TemporaryDirectory() as temporary:
        empty = Path(temporary) / "empty.txt"
        mixed = Path(temporary) / "mixed.txt"
        empty.write_text("", encoding="utf-8")
        mixed.write_text("12\nbad\n\n18\n", encoding="utf-8")
        print("empty", analyse_scores(empty))
        print("mixed", analyse_scores(mixed))
