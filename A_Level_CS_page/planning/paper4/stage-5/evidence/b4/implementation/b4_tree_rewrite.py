"""Stage 5 B4 candidate implementations for recursion and tree patterns.

These are transparent AlgoCore Python adaptations of the Stage 4 contracts.
They preserve the algorithmic invariants while making the entry points easy to
exercise under the locked CPython harness.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Callable


def algorithm_rewrite(values, *, mode="iterative"):
    """Equivalent iterative/recursive reduction with an observable result."""
    data = list(values)
    if mode == "recursive":
        def rec(i):
            if i == len(data):
                return []
            return [data[i]] + rec(i + 1)
        return rec(0)
    out = []
    for value in data:
        out.append(value)
    return out


@dataclass
class Node:
    key: Any
    left: int | None = None
    right: int | None = None


class BinarySearchTree:
    def __init__(self, capacity: int = 32, root: Any | None = None):
        self.capacity = capacity
        self.nodes: list[Node | None] = []
        self.root: int | None = None
        if root is not None:
            self.root = self._allocate(root)

    def _allocate(self, key):
        if len(self.nodes) >= self.capacity:
            raise OverflowError("tree capacity reached")
        self.nodes.append(Node(key))
        return len(self.nodes) - 1

    def insert(self, key):
        if self.root is None:
            self.root = self._allocate(key)
            return self.root
        current = self.root
        while True:
            node = self.nodes[current]
            if key < node.key:
                if node.left is None:
                    node.left = self._allocate(key)
                    return node.left
                current = node.left
            else:  # frozen equal-key policy: duplicates go right
                if node.right is None:
                    node.right = self._allocate(key)
                    return node.right
                current = node.right

    def search(self, key):
        current = self.root
        while current is not None:
            node = self.nodes[current]
            if key == node.key:
                return node.key
            current = node.left if key < node.key else node.right
        return None

    def traverse(self, order="inorder"):
        result = []
        def visit(index):
            if index is None:
                return
            node = self.nodes[index]
            if order == "preorder":
                result.append(node.key)
            visit(node.left)
            if order == "inorder":
                result.append(node.key)
            visit(node.right)
            if order == "postorder":
                result.append(node.key)
        visit(self.root)
        return result


ENTRY_POINTS = {
    "ALGORITHM_REWRITE": algorithm_rewrite,
    "TREE_SETUP": BinarySearchTree,
    "TREE_INSERT": BinarySearchTree,
    "TREE_SEARCH": BinarySearchTree,
    "TREE_TRAVERSE": BinarySearchTree,
}
