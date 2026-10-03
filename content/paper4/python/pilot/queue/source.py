import json
import sys


class CircularQueue:
    def __init__(self, capacity, trace):
        if capacity <= 0:
            trace.append({"event": "reject_invalid_capacity", "capacity": capacity})
            raise ValueError("capacity must be positive")
        self.items = [None] * capacity
        self.front = 0
        self.rear = 0
        self.count = 0
        self.trace = trace

    def enqueue(self, item):
        self.trace.append({"event": "check_full", "count": self.count, "capacity": len(self.items)})
        if self.count == len(self.items):
            return False
        insert_index = self.rear
        self.items[insert_index] = item
        self.rear = (self.rear + 1) % len(self.items)
        self.count += 1
        self.trace.append({"event": "enqueue", "index": insert_index, "item": item})
        return True

    def dequeue(self):
        self.trace.append({"event": "check_empty", "count": self.count})
        if self.count == 0:
            return None
        remove_index = self.front
        item = self.items[remove_index]
        self.items[remove_index] = None
        self.front = (self.front + 1) % len(self.items)
        self.count -= 1
        self.trace.append({"event": "dequeue", "index": remove_index, "item": item})
        return item

    def live_items(self):
        values = []
        for offset in range(self.count):
            values.append(self.items[(self.front + offset) % len(self.items)])
        self.trace.append({"event": "inspect", "values": values})
        return values


def reduce_numeric(queue, preserve, trace):
    original_count = queue.count
    total = 0
    for _ in range(original_count):
        item = queue.dequeue()
        if type(item) in (int, float):
            total += item
        trace.append({"event": "reduce_item", "item": item, "total": total})
        if preserve:
            queue.enqueue(item)
    trace.append({"event": "reduce_complete", "mode": "preserve" if preserve else "consume", "total": total})
    return total


def run(fixture):
    trace = []
    try:
        queue = CircularQueue(fixture["capacity"], trace)
    except ValueError as error:
        return {"status": "INVALID_CAPACITY", "message": str(error), "trace": trace}
    removed = []
    operation_results = []
    for operation in fixture["operations"]:
        if operation[0] == "enqueue":
            operation_results.append(queue.enqueue(operation[1]))
        elif operation[0] == "dequeue":
            removed.append(queue.dequeue())
        else:
            return {"status": "UNKNOWN_OPERATION", "operation": operation[0], "trace": trace}
    live = queue.live_items()
    reduce_trace = []
    reduce_values = fixture.get("reduce_values", live)
    reduce_queue = CircularQueue(max(1, len(reduce_values)), [])
    for item in reduce_values:
        reduce_queue.enqueue(item)
    reduce_mode = fixture.get("reduce_mode", "consume")
    numeric_total = reduce_numeric(reduce_queue, reduce_mode == "preserve", reduce_trace)
    reduce_live = reduce_queue.live_items()
    trace.extend(reduce_trace)
    return {
        "status": "OK",
        "operation_results": operation_results,
        "removed": removed,
        "live": live,
        "numeric_total": numeric_total,
        "reduce_mode": reduce_mode,
        "reduce_live": reduce_live,
        "front": queue.front,
        "rear": queue.rear,
        "count": queue.count,
        "trace": trace,
    }


if __name__ == "__main__":
    with open(sys.argv[1], "r", encoding="utf-8") as fixture_file:
        print(json.dumps(run(json.load(fixture_file)), ensure_ascii=False, sort_keys=True))
