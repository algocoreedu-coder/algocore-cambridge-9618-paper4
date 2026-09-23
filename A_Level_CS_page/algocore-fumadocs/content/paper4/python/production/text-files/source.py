from pathlib import Path
from tempfile import TemporaryDirectory

def parse_records(text):
    records = []
    for raw in text.splitlines():
        if raw == "": continue
        fields = raw.split(",")
        if len(fields) != 2: raise ValueError("malformed record")
        records.append({"name": fields[0], "score": int(fields[1])})
    return records

def run(fixture):
    trace = []
    with TemporaryDirectory() as directory:
        source, output = Path(directory) / "input.txt", Path(directory) / "output.txt"
        source.write_text(fixture["content"], encoding="utf-8", newline="\n")
        committed = fixture.get("committed", "SAFE\n")
        output.write_text(committed, encoding="utf-8", newline="\n")
        try:
            records = parse_records(source.read_text(encoding="utf-8"))
            rendered = "".join(f"{record['name']}:{record['score']}\n" for record in records)
            output.write_text(rendered, encoding="utf-8", newline="\n")
            with output.open("a", encoding="utf-8", newline="\n") as handle: handle.write(fixture.get("append", ""))
            trace += [{"event": "load", "records": len(records)}, {"event": "overwrite"}, {"event": "append"}]
            return {"status": "OK", "records": records, "output": output.read_text(encoding="utf-8"), "trace": trace}
        except (OSError, UnicodeError, ValueError) as error:
            trace.append({"event": "reject", "type": type(error).__name__})
            return {"status": "INVALID_FILE", "output": output.read_text(encoding="utf-8"), "trace": trace}

if __name__ == "__main__":
    import json
    import sys
    fixture = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    result = run(fixture)
    if not result["trace"]:
        result["trace"].append({"event": "complete_no_steps"})
    print(json.dumps(result, ensure_ascii=False, sort_keys=True, separators=(",", ":")))
