import csv
import json
import sys
from pathlib import Path


class Book:
    def __init__(self, title, pages):
        self.Title = title
        self.Pages = pages

    def as_record(self):
        return {"type": "BOOK", "title": self.Title, "pages": self.Pages}

    def set_pages(self, pages):
        if not isinstance(pages, int) or pages <= 0:
            return False
        self.Pages = pages
        return True


class EBook(Book):
    def __init__(self, title, pages, file_format):
        super().__init__(title, pages)
        self.FileFormat = file_format

    def as_record(self):
        record = super().as_record()
        record["type"] = "EBOOK"
        record["file_format"] = self.FileFormat
        return record


def read_books(csv_path, trace):
    books = []
    with open(csv_path, "r", encoding="utf-8", newline="") as csv_file:
        reader = csv.reader(csv_file)
        for line_number, fields in enumerate(reader, start=1):
            trace.append({"event": "read_record", "line": line_number, "fields": fields})
            if len(fields) < 3 or fields[1] == "":
                return None, f"INVALID_RECORD_AT_LINE_{line_number}"
            try:
                pages = int(fields[2])
            except ValueError:
                return None, f"INVALID_PAGES_AT_LINE_{line_number}"
            record_type = fields[0]
            if record_type == "BOOK" and len(fields) == 3:
                book = Book(fields[1], pages)
            elif record_type == "EBOOK" and len(fields) == 4:
                book = EBook(fields[1], pages, fields[3])
            else:
                return None, f"INVALID_TYPE_AT_LINE_{line_number}"
            books.append(book)
            trace.append({"event": "construct_object", "line": line_number, "type": record_type, "title": fields[1]})
    return books, "OK"


def lookup_and_update(books, title, new_pages, trace):
    for book in books:
        if book.Title == title:
            updated = book.set_pages(new_pages)
            trace.append({"event": "update", "title": title, "new_pages": new_pages, "updated": updated})
            return book, "UPDATED" if updated else "INVALID_UPDATE"
    trace.append({"event": "lookup_not_found", "title": title})
    return None, "NOT_FOUND"


def run(fixture, fixture_path):
    trace = []
    csv_path = Path(fixture_path).parent / fixture["csv_file"]
    books, status = read_books(csv_path, trace)
    if books is None:
        return {"status": status, "books": [], "trace": trace}
    found, update_status = lookup_and_update(books, fixture["lookup_title"], fixture["new_pages"], trace)
    found_record = None if found is None else found.as_record()
    return {
        "status": update_status,
        "books": [book.as_record() for book in books],
        "found": found_record,
        "trace": trace,
    }


if __name__ == "__main__":
    fixture_path = sys.argv[1]
    with open(fixture_path, "r", encoding="utf-8") as fixture_file:
        print(json.dumps(run(json.load(fixture_file), fixture_path), ensure_ascii=False, sort_keys=True))
