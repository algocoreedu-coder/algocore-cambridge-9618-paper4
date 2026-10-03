from pathlib import Path

CAPACITY = 8
QueueData = [None] * CAPACITY
Head = 0
Tail = 0
Count = 0


def enqueue(code):
    global Tail, Count
    if Count == CAPACITY:
        return False
    QueueData[Tail] = code
    Tail = (Tail + 1) % CAPACITY
    Count += 1
    return True


def dequeue():
    global Head, Count
    if Count == 0:
        return None
    code = QueueData[Head]
    QueueData[Head] = None
    Head = (Head + 1) % CAPACITY
    Count -= 1
    return code


def peek():
    return None if Count == 0 else QueueData[Head]


def logical_queue():
    return [QueueData[(Head + offset) % CAPACITY] for offset in range(Count)]


def valid_code(code):
    return len(code) == 5 and code[:2].isalpha() and code[:2].isupper() and code[2:].isdigit()


if __name__ == "__main__":
    path = Path(__file__).parents[1] / "inputs" / "bookings.txt"
    rejected = []
    with path.open(encoding="utf-8") as source:
        for line_number, raw in enumerate(source, 1):
            code = raw.strip()
            if not valid_code(code):
                rejected.append((line_number, code, "INVALID"))
            elif not enqueue(code):
                rejected.append((line_number, code, "FULL"))
    print("loaded", logical_queue())
    print("rejected", rejected)
    print("removed", dequeue(), dequeue())
    print("after_remove", logical_queue())
    print("add_ZZ999", enqueue("ZZ999"), logical_queue())
