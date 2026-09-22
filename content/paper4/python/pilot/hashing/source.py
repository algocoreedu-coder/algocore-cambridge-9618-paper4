import json
import sys


class HashTable:
    def __init__(self, size, trace):
        if size <= 0:
            raise ValueError("size must be positive")
        self.slots = [None] * size
        self.trace = trace

    def address(self, key):
        return key % len(self.slots)

    def insert(self, key):
        start = self.address(key)
        for step in range(len(self.slots)):
            index = (start + step) % len(self.slots)
            self.trace.append({"event": "probe_insert", "key": key, "index": index, "step": step})
            if self.slots[index] is None:
                self.slots[index] = key
                return index
            if self.slots[index] == key:
                return index
        return -1

    def search(self, key):
        start = self.address(key)
        for step in range(len(self.slots)):
            index = (start + step) % len(self.slots)
            self.trace.append({"event": "probe_search", "key": key, "index": index, "step": step})
            if self.slots[index] is None:
                return -1
            if self.slots[index] == key:
                return index
        return -1


def run(fixture):
    trace = []
    if not all(isinstance(key, int) for key in fixture["insert_keys"] + [fixture["search_key"]]):
        trace.append({"event": "reject_non_integer_key"})
        return {"status": "INVALID_KEY", "trace": trace}
    try:
        table = HashTable(fixture["size"], trace)
    except ValueError as error:
        return {"status": "INVALID_SIZE", "message": str(error), "trace": trace}
    inserted_at = []
    for key in fixture["insert_keys"]:
        inserted_at.append(table.insert(key))
    found_at = table.search(fixture["search_key"])
    return {
        "status": "OK",
        "inserted_at": inserted_at,
        "found_at": found_at,
        "slots": table.slots,
        "trace": trace,
    }


if __name__ == "__main__":
    with open(sys.argv[1], "r", encoding="utf-8") as fixture_file:
        print(json.dumps(run(json.load(fixture_file)), ensure_ascii=False, sort_keys=True))
