"""Utility helpers for the backend."""

from pathlib import Path

import pandas as pd


def read_csv(file_path: str) -> pd.DataFrame:
    """Load a CSV file into a DataFrame."""
    return pd.read_csv(file_path)


def ensure_dir(path: str) -> Path:
    """Ensure a directory exists and return its Path."""
    p = Path(path)
    p.mkdir(parents=True, exist_ok=True)
    return p
