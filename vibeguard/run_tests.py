#!/usr/bin/env python3
"""Zero-dependency test runner.

The full suite is written in pytest style. This runner lets it execute on a
machine with no pytest installed (as here) by providing a minimal ``pytest``
shim and discovering ``test_*`` functions itself. If pytest *is* installed,
prefer ``python -m pytest``.
"""

from __future__ import annotations

import importlib
import os
import sys
import traceback
import types

ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, ROOT)


def _install_pytest_shim() -> None:
    if "pytest" in sys.modules:
        return
    shim = types.ModuleType("pytest")

    class _Raises:
        def __init__(self, exc):
            self.exc = exc

        def __enter__(self):
            return self

        def __exit__(self, exc_type, exc, tb):
            if exc_type is None:
                raise AssertionError("expected %r but nothing was raised" % self.exc)
            return issubclass(exc_type, self.exc)

    shim.raises = lambda exc: _Raises(exc)
    sys.modules["pytest"] = shim


def main() -> int:
    _install_pytest_shim()
    test_dir = os.path.join(ROOT, "tests")
    modules = sorted(
        f[:-3]
        for f in os.listdir(test_dir)
        if f.startswith("test_") and f.endswith(".py")
    )
    passed = failed = 0
    failures = []
    for mod_name in modules:
        module = importlib.import_module("tests." + mod_name)
        for name in sorted(dir(module)):
            if not name.startswith("test_"):
                continue
            func = getattr(module, name)
            if not callable(func):
                continue
            try:
                func()
                passed += 1
                print("  ok   %s::%s" % (mod_name, name))
            except Exception as exc:  # noqa: BLE001
                failed += 1
                failures.append((mod_name, name, exc))
                print("  FAIL %s::%s -- %s" % (mod_name, name, exc))
    print("\n%d passed, %d failed" % (passed, failed))
    if failures:
        print("\n--- tracebacks ---")
        for mod_name, name, exc in failures:
            print("\n%s::%s" % (mod_name, name))
            traceback.print_exception(type(exc), exc, exc.__traceback__)
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
