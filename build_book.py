"""Compatibility entry point for the self-contained atlas builder."""
from pathlib import Path
import runpy
runpy.run_path(str(Path(__file__).with_name("build_atlas.py")), run_name="__main__")
