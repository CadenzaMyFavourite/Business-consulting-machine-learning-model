"""ETL utilities for loading and preparing dataset(s) for analytics."""

import pandas as pd


def load_clients(path: str = "data/demo_clients.csv") -> pd.DataFrame:
    """Load a dataset of client-level metrics."""
    df = pd.read_csv(path)
    return df


def clean_clients(df: pd.DataFrame) -> pd.DataFrame:
    """Basic cleaning: type conversions and missing data."""
    df = df.copy()
    for col in ["customers", "repeat_rate", "avg_age", "social_engagement"]:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")
    df.fillna(df.median(numeric_only=True), inplace=True)
    return df


def summarize_clients(df: pd.DataFrame) -> dict:
    """Return a small summary dict for reporting."""
    return {
        "row_count": int(len(df)),
        "avg_customers": float(df["customers"].mean()),
        "avg_repeat_rate": float(df["repeat_rate"].mean()),
        "avg_age": float(df["avg_age"].mean()),
        "avg_social_engagement": float(df["social_engagement"].mean()),
    }
