"""Makes the ``app`` package importable when running under real pytest."""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
