"""A small Aho-Corasick multi-pattern matcher.

Builds a trie of the blocklist terms plus failure links so a single pass over
the text finds every occurrence of every term in O(n + m) time, where n is the
length of the text and m the total length of the matches. This is the
data-structure piece called out in the project's DSA integration notes.
"""

from __future__ import annotations

from collections import deque
from typing import Dict, Iterable, List, Optional, Tuple


class _Node:
    __slots__ = ("children", "fail", "outputs")

    def __init__(self) -> None:
        self.children: Dict[str, "_Node"] = {}
        self.fail: Optional["_Node"] = None
        # Original (pre-normalisation) pattern strings that end at this node,
        # including those reachable through the failure chain.
        self.outputs: List[str] = []


class AhoCorasick:
    """Case-insensitive (by default) multi-pattern string matcher."""

    def __init__(self, patterns: Iterable[str], case_insensitive: bool = True) -> None:
        self.case_insensitive = case_insensitive
        self.root = _Node()
        self._built = False
        for pattern in patterns:
            self.add(pattern)
        self._build()

    def _norm(self, text: str) -> str:
        return text.lower() if self.case_insensitive else text

    def add(self, pattern: str) -> None:
        if not pattern:
            return
        node = self.root
        for ch in self._norm(pattern):
            node = node.children.setdefault(ch, _Node())
        node.outputs.append(pattern)
        self._built = False

    def _build(self) -> None:
        queue: "deque[_Node]" = deque()
        for child in self.root.children.values():
            child.fail = self.root
            queue.append(child)
        while queue:
            current = queue.popleft()
            for ch, nxt in current.children.items():
                queue.append(nxt)
                fail = current.fail
                while fail is not None and ch not in fail.children:
                    fail = fail.fail
                nxt.fail = fail.children[ch] if (fail and ch in fail.children) else self.root
                # A shallower node's outputs are finalised before deeper nodes
                # are visited, so its failure chain is already folded in.
                nxt.outputs = nxt.outputs + nxt.fail.outputs
        self._built = True

    def find(self, text: str) -> List[Tuple[int, int, str]]:
        """Return (start, end_exclusive, pattern) for every match, in scan order."""
        if not self._built:
            self._build()
        results: List[Tuple[int, int, str]] = []
        node = self.root
        haystack = self._norm(text)
        for i, ch in enumerate(haystack):
            while node is not None and ch not in node.children:
                node = node.fail
            if node is None:
                node = self.root
                continue
            node = node.children[ch]
            for pattern in node.outputs:
                start = i - len(pattern) + 1
                results.append((start, i + 1, pattern))
        return results
