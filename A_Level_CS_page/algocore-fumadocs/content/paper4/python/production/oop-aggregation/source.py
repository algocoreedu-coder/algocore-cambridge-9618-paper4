from pathlib import Path

class Book:
    def __init__(self, title): self.title = title
    def label(self): return self.title.upper()
class Shelf:
    def __init__(self, capacity): self.capacity, self.books = capacity, []
    def add(self, book):
        if not isinstance(book, Book) or len(self.books) == self.capacity: return False
        self.books.append(book); return True
    def labels(self): return [book.label() for book in self.books]

def run(fixture):
    shelf, trace = Shelf(fixture["capacity"]), []
    for value in fixture.get("items", []):
        item = Book(value) if isinstance(value, str) else value
        before = len(shelf.books); success = shelf.add(item)
        trace.append({"event": "bounded_add", "success": success, "count": len(shelf.books), "unchanged_on_reject": success or before == len(shelf.books)})
    return {"status": "OK", "count": len(shelf.books), "labels": shelf.labels(), "capacity": shelf.capacity, "trace": trace}

if __name__ == "__main__":
    import json
    import sys
    fixture = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    result = run(fixture)
    if not result["trace"]:
        result["trace"].append({"event": "complete_no_steps"})
    print(json.dumps(result, ensure_ascii=False, sort_keys=True, separators=(",", ":")))
