from pathlib import Path


class Book:
    def __init__(self, book_id, title):
        self.book_id = book_id
        self.title = title


class Member:
    def __init__(self, member_id, name):
        self.member_id = member_id
        self.name = name


class Loan:
    def __init__(self, member, book, days):
        self.member = member
        self.book = book
        self.days = days

    def charge(self):
        return max(0, self.days - 14) * 0.50


def load_loans(path):
    loans, errors, active_books = [], [], set()
    try:
        with path.open(encoding="utf-8") as source:
            for line_number, raw in enumerate(source, 1):
                try:
                    fields = [field.strip() for field in raw.split("|")]
                    if len(fields) != 5 or any(field == "" for field in fields):
                        raise ValueError("bad fields")
                    member_id, name, book_id, title, days_text = fields
                    days = int(days_text)
                    if days < 0 or book_id in active_books:
                        raise ValueError("invalid days or duplicate book")
                    loans.append(Loan(Member(member_id, name), Book(book_id, title), days))
                    active_books.add(book_id)
                except ValueError as error:
                    errors.append(f"line {line_number}: {error}")
    except FileNotFoundError:
        errors.append("FILE NOT FOUND")
    return loans, errors


if __name__ == "__main__":
    path = Path(__file__).parents[1] / "inputs" / "loans.txt"
    loans, errors = load_loans(path)
    for loan in loans:
        print(loan.member.member_id, loan.book.book_id, loan.days, f"{loan.charge():.2f}")
    print("total", f"{sum(loan.charge() for loan in loans):.2f}")
    print("errors", errors)
