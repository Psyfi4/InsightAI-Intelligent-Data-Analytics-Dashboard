"""
data_processor.py
-----------------
Loads, filters, and aggregates the sales CSV for the API endpoints.
Uses Pandas for all transformations — no database required.
"""

import os
import subprocess
import pandas as pd
from typing import Optional


class DataProcessor:
    """Handles all data loading, filtering, and aggregation."""

    def __init__(self, filepath: str):
        self.filepath = filepath
        self.df = self._load_data()

    # ── Private helpers ───────────────────────────────────────────────────────

    def _load_data(self) -> pd.DataFrame:
        """Load CSV, generate it first if it doesn't exist."""
        if not os.path.exists(self.filepath):
            print("⚠️  Dataset not found — generating it now …")
            script = os.path.join(os.path.dirname(__file__), "generate_data.py")
            subprocess.run(["python", script], check=True, cwd=os.path.dirname(__file__))

        df = pd.read_csv(self.filepath)
        df["date"]  = pd.to_datetime(df["date"])
        df["month"] = df["date"].dt.to_period("M").astype(str)   # e.g. "2024-03"
        df["year"]  = df["date"].dt.year
        return df

    # ── Public: filtering ─────────────────────────────────────────────────────

    def get_filtered_data(
        self,
        date_from: Optional[str] = None,
        date_to:   Optional[str] = None,
        category:  Optional[str] = None,
        region:    Optional[str] = None,
    ) -> pd.DataFrame:
        """Return a copy of the dataframe after applying all active filters."""
        df = self.df.copy()

        if date_from:
            df = df[df["date"] >= pd.to_datetime(date_from)]
        if date_to:
            df = df[df["date"] <= pd.to_datetime(date_to)]

        # Accept comma-separated lists, e.g. "Electronics,Books"
        if category and category != "All":
            cats = [c.strip() for c in category.split(",")]
            df = df[df["category"].isin(cats)]
        if region and region != "All":
            regs = [r.strip() for r in region.split(",")]
            df = df[df["region"].isin(regs)]

        return df

    # ── Public: aggregations ──────────────────────────────────────────────────

    def get_sales_over_time(self, df: pd.DataFrame) -> list:
        """Monthly totals — used by the line chart."""
        agg = (
            df.groupby("month")
            .agg(sales=("sales", "sum"), profit=("profit", "sum"), units=("units_sold", "sum"))
            .reset_index()
            .sort_values("month")
        )
        # Round for cleaner JSON
        agg["sales"]  = agg["sales"].round(2)
        agg["profit"] = agg["profit"].round(2)
        return agg.to_dict("records")

    def get_sales_by_category(self, df: pd.DataFrame) -> list:
        """Total by category — used by the bar chart."""
        agg = (
            df.groupby("category")
            .agg(sales=("sales", "sum"), profit=("profit", "sum"), units=("units_sold", "sum"))
            .reset_index()
            .sort_values("sales", ascending=False)
        )
        agg["sales"]  = agg["sales"].round(2)
        agg["profit"] = agg["profit"].round(2)
        return agg.to_dict("records")

    def get_sales_by_region(self, df: pd.DataFrame) -> list:
        """Total by region — used by the pie chart."""
        agg = (
            df.groupby("region")
            .agg(sales=("sales", "sum"), profit=("profit", "sum"), units=("units_sold", "sum"))
            .reset_index()
            .sort_values("sales", ascending=False)
        )
        agg["sales"]  = agg["sales"].round(2)
        agg["profit"] = agg["profit"].round(2)
        return agg.to_dict("records")

    def get_monthly_trend(self, df: pd.DataFrame) -> list:
        """Monthly sales broken down by category — used by the area chart."""
        agg = (
            df.groupby(["month", "category"])
            .agg(sales=("sales", "sum"))
            .reset_index()
            .sort_values("month")
        )
        agg["sales"] = agg["sales"].round(2)
        return agg.to_dict("records")

    def get_summary_stats(self, df: pd.DataFrame) -> dict:
        """KPI card values: totals, averages, growth, top performers."""
        if df.empty:
            return {
                "total_sales": 0, "total_profit": 0,
                "total_units": 0, "avg_margin": 0,
                "mom_growth": 0, "top_category": "N/A",
                "top_region": "N/A", "record_count": 0,
            }

        total_sales  = df["sales"].sum()
        total_profit = df["profit"].sum()
        total_units  = int(df["units_sold"].sum())
        avg_margin   = round((total_profit / total_sales * 100) if total_sales else 0, 1)

        # Month-over-month growth: compare last two months in the filtered set
        monthly = (
            df.groupby("month")["sales"].sum()
            .reset_index()
            .sort_values("month")
        )
        mom_growth = 0.0
        if len(monthly) >= 2:
            last  = monthly.iloc[-1]["sales"]
            prev  = monthly.iloc[-2]["sales"]
            mom_growth = round(((last - prev) / prev * 100) if prev else 0, 1)

        top_cat    = df.groupby("category")["sales"].sum().idxmax()
        top_region = df.groupby("region")["sales"].sum().idxmax()

        return {
            "total_sales":   round(total_sales, 2),
            "total_profit":  round(total_profit, 2),
            "total_units":   total_units,
            "avg_margin":    avg_margin,
            "mom_growth":    mom_growth,
            "top_category":  top_cat,
            "top_region":    top_region,
            "record_count":  len(df),
        }

    def get_filter_options(self) -> dict:
        """Available dropdown values for the filter bar."""
        return {
            "categories": sorted(self.df["category"].unique().tolist()),
            "regions":    sorted(self.df["region"].unique().tolist()),
            "date_min":   self.df["date"].min().strftime("%Y-%m-%d"),
            "date_max":   self.df["date"].max().strftime("%Y-%m-%d"),
        }
