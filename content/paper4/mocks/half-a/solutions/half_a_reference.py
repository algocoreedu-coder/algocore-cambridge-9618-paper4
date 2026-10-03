from pathlib import Path

SIZE = 10
Data = [""] * SIZE
Next = list(range(1, SIZE)) + [-1]
StartPointer = -1
FreePointer = 0


def Initialise():
    global Data, Next, StartPointer, FreePointer
    Data = [""] * SIZE
    Next = list(range(1, SIZE)) + [-1]
    StartPointer = -1
    FreePointer = 0


initialise = Initialise


def append(code):
    global StartPointer, FreePointer
    if FreePointer == -1:
        return False
    new_pointer = FreePointer
    FreePointer = Next[new_pointer]
    Data[new_pointer] = code
    Next[new_pointer] = -1
    if StartPointer == -1:
        StartPointer = new_pointer
    else:
        current = StartPointer
        while Next[current] != -1:
            current = Next[current]
        Next[current] = new_pointer
    return True


Append = append


def remove_first(code):
    global StartPointer, FreePointer
    previous = -1
    current = StartPointer
    while current != -1 and Data[current] != code:
        previous, current = current, Next[current]
    if current == -1:
        return False
    if previous == -1:
        StartPointer = Next[current]
    else:
        Next[previous] = Next[current]
    Data[current] = ""
    Next[current] = FreePointer
    FreePointer = current
    return True


RemoveFirst = remove_first


def to_list():
    result = []
    current = StartPointer
    while current != -1:
        result.append(Data[current])
        current = Next[current]
    return result


ToList = to_list


def load_orders(path):
    total = 0
    rejected = []
    try:
        with path.open(encoding="utf-8") as source:
            for line_number, raw in enumerate(source, 1):
                try:
                    code, quantity_text = [part.strip() for part in raw.split(",")]
                    quantity = int(quantity_text)
                    if not code or not 1 <= quantity <= 20:
                        raise ValueError
                    if not append(code):
                        rejected.append(f"line {line_number}: FULL")
                    else:
                        total += quantity
                except ValueError:
                    rejected.append(f"line {line_number}: INVALID")
    except FileNotFoundError:
        return [], 0, ["FILE NOT FOUND"]
    return to_list(), total, rejected


def write_logs(output_path, codes, rejected):
    with output_path.open("w", encoding="utf-8") as output:
        for code in codes:
            output.write(f"ACCEPTED,{code}\n")
    with output_path.open("a", encoding="utf-8") as output:
        for message in rejected:
            output.write(f"REJECTED,{message}\n")


def removal_trace(target):
    initialise()
    for code in ("A", "B", "C", "D"):
        append(code)
    before_next = Next.copy()
    before = {"start": StartPointer, "free": FreePointer, "list": to_list()}
    removed = remove_first(target)
    changed_next = [(index, before_next[index], Next[index]) for index in range(SIZE) if before_next[index] != Next[index]]
    after = {"start": StartPointer, "free": FreePointer, "list": to_list()}
    return {"target": target, "removed": removed, "before": before, "changed_next": changed_next, "after": after}


if __name__ == "__main__":
    from tempfile import TemporaryDirectory

    initialise()
    input_path = Path(__file__).parents[1] / "inputs" / "orders.txt"
    codes, total, rejected = load_orders(input_path)
    print("codes=", codes)
    print("quantity=", total)
    print("rejected=", rejected)
    for target in ("A", "C", "D", "X"):
        print("remove_trace=", removal_trace(target))
    initialise()
    codes, total, rejected = load_orders(input_path)
    with TemporaryDirectory() as temporary:
        output_path = Path(temporary) / "order_log.txt"
        write_logs(output_path, codes, rejected)
        print("written_log=", output_path.read_text(encoding="utf-8").splitlines())
