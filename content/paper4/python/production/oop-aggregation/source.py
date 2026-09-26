from pathlib import Path

class Book:
    def __init__(self, title):
        self.title = title

    def label(self):
        return self.title.upper()

class Shelf:
    def __init__(self, capacity):
        self.capacity = capacity
        self.books = []

    def add(self, book):
        valid_book = isinstance(book, Book)
        has_space = len(self.books) < self.capacity
        if not valid_book or not has_space:
            return False
        self.books.append(book)
        return True

    def labels(self):
        return [book.label() for book in self.books]

def run(fixture):
    shelf = Shelf(fixture["capacity"])
    trace = []
    for value in fixture.get("items", []):
        item = Book(value) if isinstance(value, str) else value
        before = len(shelf.books)
        success = shelf.add(item)
        trace.append({
            "event": "bounded_add",
            "success": success,
            "count": len(shelf.books),
            "unchanged_on_reject": success or before == len(shelf.books),
            "relationship": "has-a",
        })
    return {
        "status": "OK",
        "count": len(shelf.books),
        "labels": shelf.labels(),
        "capacity": shelf.capacity,
        "trace": trace,
    }

if __name__ == "__main__":
    import json
    import sys
    fixture = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    result = run(fixture)
    if not result["trace"]:
        result["trace"].append({"event": "complete_no_steps"})
    print(json.dumps(result, ensure_ascii=False, sort_keys=True, separators=(",", ":")))
