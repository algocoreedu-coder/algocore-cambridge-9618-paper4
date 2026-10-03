from pathlib import Path


def load_stock(path):
    codes, quantities, rejected = [], [], []
    with path.open(encoding="utf-8") as source:
        for line_number, raw in enumerate(source, 1):
            try:
                code, quantity_text = [part.strip() for part in raw.split(",")]
                quantity = int(quantity_text)
                if code in codes or quantity < 0:
                    raise ValueError
                codes.append(code)
                quantities.append(quantity)
            except ValueError:
                rejected.append(line_number)
    return codes, quantities, rejected


def insertion_sort(codes, quantities):
    for first_unsorted in range(1, len(codes)):
        code, quantity = codes[first_unsorted], quantities[first_unsorted]
        position = first_unsorted
        while position > 0 and codes[position - 1] > code:
            codes[position] = codes[position - 1]
            quantities[position] = quantities[position - 1]
            position -= 1
        codes[position], quantities[position] = code, quantity


def binary_search(codes, target):
    low, high, comparisons = 0, len(codes) - 1, 0
    trace = []
    while low <= high:
        middle = (low + high) // 2
        comparisons += 1
        trace.append((low, high, middle, codes[middle]))
        if codes[middle] == target:
            return middle, comparisons, trace
        if codes[middle] < target:
            low = middle + 1
        else:
            high = middle - 1
    return -1, comparisons, trace


if __name__ == "__main__":
    path = Path(__file__).parents[1] / "inputs" / "stock.txt"
    codes, quantities, rejected = load_stock(path)
    print("before", list(zip(codes, quantities)), "rejected", rejected)
    insertion_sort(codes, quantities)
    print("after", list(zip(codes, quantities)))
    for target in ("BK204", "ZZ000"):
        print(target, binary_search(codes, target))
