import csv
import json
import sys
from pathlib import Path


class Book:
    def __init__(self, title, pages):
        self.Title = title
        self.Pages = pages

    def as_record(self):
        return {"title": self.Title, "pages": self.Pages}


def read_books(csv_path, trace):
    books = []
    with open(csv_path, "r", encoding="utf-8", newline="") as csv_file:
        reader = csv.reader(csv_file)
        for line_number, fields in enumerate(reader, start=1):
            trace.append({"event": "read_record", "line": line_number, "fields": fields})
            if len(fields) != 2 or fields[0] == "":
                return None, f"INVALID_RECORD_AT_LINE_{line_number}"
            try:
                pages = int(fields[1])
            except ValueError:
                return None, f"INVALID_PAGES_AT_LINE_{line_number}"
            books.append(Book(fields[0], pages))
            trace.append({"event": "construct_object", "line": line_number, "title": fields[0]})
    return books, "OK"


def run(fixture, fixture_path):
    trace = []
    csv_path = Path(fixture_path).parent / fixture["csv_file"]
    books, status = read_books(csv_path, trace)
    if books is None:
        return {"status": status, "books": [], "trace": trace}
    lookup_title = fixture["lookup_title"]
    found = None
    for book in books:
        if book.Title == lookup_title:
            found = book.as_record()
            break
    trace.append({"event": "lookup", "title": lookup_title, "found": found is not None})
    return {"status": status, "books": [book.as_record() for book in books], "found": found, "trace": trace}


if __name__ == "__main__":
    fixture_path = sys.argv[1]
    with open(fixture_path, "r", encoding="utf-8") as fixture_file:
        print(json.dumps(run(json.load(fixture_file), fixture_path), ensure_ascii=False, sort_keys=True))
