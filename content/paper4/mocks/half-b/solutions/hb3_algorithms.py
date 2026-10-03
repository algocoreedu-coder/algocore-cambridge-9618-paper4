def recursive_countdown(number):
    if number == 0:
        return [0]
    return [number] + recursive_countdown(number - 1)


def one_bubble_pass(values):
    values = values.copy()
    swaps = []
    for index in range(len(values) - 1):
        if values[index] > values[index + 1]:
            before = values.copy()
            values[index], values[index + 1] = values[index + 1], values[index]
            swaps.append((index, before, values.copy()))
    return values, swaps


class TwoStackQueue:
    def __init__(self):
        self.in_stack = []
        self.out_stack = []

    def enqueue(self, value):
        self.in_stack.append(value)

    def dequeue(self):
        if not self.out_stack:
            while self.in_stack:
                self.out_stack.append(self.in_stack.pop())
        return None if not self.out_stack else self.out_stack.pop()


if __name__ == "__main__":
    print("recursion", recursive_countdown(3))
    print("bubble", one_bubble_pass([7, 3, 5, 1]))
    queue = TwoStackQueue()
    for value in ("A", "B", "C"):
        queue.enqueue(value)
    print("two_stack_queue", queue.dequeue(), queue.dequeue(), queue.in_stack, queue.out_stack)
    print("complexity", {"linear_search": "O(n)", "binary_search": "O(log n) on sorted data", "bubble_sort": "O(n^2)"})
