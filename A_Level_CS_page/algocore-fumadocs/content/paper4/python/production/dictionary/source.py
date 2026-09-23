from pathlib import Path

class DictionaryADT:
    def __init__(self): self.entries = []
    def find(self, key):
        return next((value for stored, value in self.entries if stored == key), None)
    def insert(self, key, value):
        if self.find(key) is not None: return False
        self.entries.append([key, value]); return True
    def delete(self, key):
        for index, pair in enumerate(self.entries):
            if pair[0] == key: self.entries.pop(index); return True
        return False

def run(fixture):
    table, trace = DictionaryADT(), []
    for key, value in fixture.get("initial", []): table.insert(key, value)
    before = [list(pair) for pair in table.entries]
    inserted = table.insert(fixture["insert"][0], fixture["insert"][1])
    deleted = table.delete(fixture["delete"])
    frequency = {}
    for token in fixture.get("tokens", []): frequency[token] = frequency.get(token, 0) + 1
    trace += [{"event": "insert", "success": inserted}, {"event": "delete", "success": deleted}, {"event": "aggregate", "groups": len(frequency)}]
    return {"status": "OK", "before": before, "entries": table.entries, "inserted": inserted, "deleted": deleted, "found": table.find(fixture["find"]), "frequency": frequency, "trace": trace}

if __name__ == "__main__":
    import json
    import sys
    fixture = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    result = run(fixture)
    if not result["trace"]:
        result["trace"].append({"event": "complete_no_steps"})
    print(json.dumps(result, ensure_ascii=False, sort_keys=True, separators=(",", ":")))
