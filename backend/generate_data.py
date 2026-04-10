"""
generate_data.py
----------------
Generates a realistic synthetic sales dataset (CSV) for the dashboard.
Run once: python generate_data.py
Output: data/sales_data.csv  (~2,000 rows, 2 years of daily sales)
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os
import random

random.seed(42)
np.random.seed(42)

# ─── Configuration ────────────────────────────────────────────────────────────

CATEGORIES = ["Electronics", "Clothing", "Food & Beverage", "Sports", "Books"]
REGIONS    = ["North", "South", "East", "West"]

# (min_unit_price, max_unit_price) per category
PRICE_RANGES = {
    "Electronics":     (80,  500),
    "Clothing":        (15,  120),
    "Food & Beverage": (5,   50),
    "Sports":          (20,  200),
    "Books":           (8,   40),
}

# Profit margin range per category
MARGIN_RANGES = {
    "Electronics":     (0.12, 0.25),
    "Clothing":        (0.30, 0.55),
    "Food & Beverage": (0.18, 0.38),
    "Sports":          (0.22, 0.42),
    "Books":           (0.25, 0.48),
}

# Regional multipliers (some regions sell more)
REGION_MULTIPLIER = {"North": 1.15, "South": 0.90, "East": 1.05, "West": 1.00}

START_DATE = datetime(2024, 1, 1)
END_DATE   = datetime(2025, 12, 31)

# ─── Seasonal factors (month → multiplier) ────────────────────────────────────

def seasonal_factor(month: int, category: str) -> float:
    """Return a seasonal sales multiplier based on month and product type."""
    base = 1.0
    # Holiday spike: Nov–Dec
    if month in (11, 12):
        base = 1.6 if category in ("Electronics", "Clothing") else 1.3
    # Summer: Jun–Aug
    elif month in (6, 7, 8):
        base = 1.4 if category == "Sports" else (0.85 if category == "Electronics" else 1.0)
    # Back-to-school: Aug–Sep
    elif month in (8, 9):
        base += 0.2 if category in ("Electronics", "Books") else 0
    # New Year fitness: Jan
    elif month == 1:
        base = 1.3 if category == "Sports" else 1.0
    return base

# ─── Generate rows ────────────────────────────────────────────────────────────

rows = []
current = START_DATE

while current <= END_DATE:
    n_transactions = random.randint(4, 10)       # transactions per day
    for _ in range(n_transactions):
        cat    = random.choice(CATEGORIES)
        region = random.choice(REGIONS)
        month  = current.month

        factor     = seasonal_factor(month, cat) * REGION_MULTIPLIER[region]
        units      = random.randint(1, 60)
        price_min, price_max = PRICE_RANGES[cat]
        unit_price = round(random.uniform(price_min, price_max) * factor, 2)
        sales      = round(units * unit_price, 2)

        margin_min, margin_max = MARGIN_RANGES[cat]
        margin = random.uniform(margin_min, margin_max)
        profit = round(sales * margin, 2)

        rows.append({
            "date":       current.strftime("%Y-%m-%d"),
            "category":   cat,
            "region":     region,
            "units_sold": units,
            "unit_price": unit_price,
            "sales":      sales,
            "profit":     profit,
            "margin_pct": round(margin * 100, 1),
        })

    current += timedelta(days=1)

# ─── Save ─────────────────────────────────────────────────────────────────────

os.makedirs("data", exist_ok=True)
df = pd.DataFrame(rows)
df.to_csv("data/sales_data.csv", index=False)

print(f"✅  Generated {len(df):,} records → data/sales_data.csv")
print(df.describe())
