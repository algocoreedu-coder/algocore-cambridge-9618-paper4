from pathlib import Path


class TreeNode:
    def __init__(self, data):
        self.data = data
        self.left = None
        self.right = None


def insert(root, value):
    if root is None:
        return TreeNode(value), True, []
    current = root
    path = []
    while True:
        path.append(current.data)
        if value == current.data:
            return root, False, path
        if value < current.data:
            if current.left is None:
                current.left = TreeNode(value)
                return root, True, path
            current = current.left
        else:
            if current.right is None:
                current.right = TreeNode(value)
                return root, True, path
            current = current.right


def search(root, target):
    current, path = root, []
    while current is not None:
        path.append(current.data)
        if target == current.data:
            return True, path
        current = current.left if target < current.data else current.right
    return False, path


def in_order(root):
    if root is None:
        return []
    return in_order(root.left) + [root.data] + in_order(root.right)


if __name__ == "__main__":
    path = Path(__file__).parents[1] / "inputs" / "book_ids.txt"
    root, duplicates = None, []
    with path.open(encoding="utf-8") as source:
        for raw in source:
            root, added, trace = insert(root, int(raw.strip()))
            if not added:
                duplicates.append((int(raw.strip()), trace))
    print("in_order", in_order(root))
    print("duplicates", duplicates)
    for target in (44, 50):
        print(target, search(root, target))
