"""
main.py
-------
FastAPI application — the backbone of the AI Analytics Dashboard.

Endpoints:
  GET  /               → health check
  GET  /api/filters    → available filter options (categories, regions, date range)
  GET  /api/data       → chart data (time-series, by category, by region, monthly trend)
  GET  /api/summary    → KPI cards (totals, margins, MoM growth)
  POST /api/insights   → AI-generated natural language insights
  GET  /api/download   → download filtered data as CSV

Run:
  uvicorn main:app --reload --port 8000
"""

import io
from typing import Optional

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from data_processor import DataProcessor
from ai_insights import AIInsightsGenerator

# ── App setup ─────────────────────────────────────────────────────────────────

app = FastAPI(
    title="AI Analytics Dashboard API",
    description="Processes sales data and generates AI-powered insights.",
    version="1.0.0",
)

# Allow the React dev server (port 3000 or 5173) to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Initialise shared resources once at startup ────────────────────────────────

processor    = DataProcessor("data/sales_data.csv")
ai_generator = AIInsightsGenerator()

# ── Helper: shared filter parameters ──────────────────────────────────────────

def common_filters(
    date_from: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    date_to:   Optional[str] = Query(None, description="End date   (YYYY-MM-DD)"),
    category:  Optional[str] = Query(None, description="Comma-separated categories, or 'All'"),
    region:    Optional[str] = Query(None, description="Comma-separated regions, or 'All'"),
):
    """Reusable filter dependency — avoids repeating query params in every route."""
    return processor.get_filtered_data(date_from, date_to, category, region)

# ── Routes ─────────────────────────────────────────────────────────────────────

@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "AI Analytics Dashboard API is running 🚀"}


@app.get("/api/filters", tags=["Metadata"])
def get_filter_options():
    """
    Returns the available categories, regions, and date boundaries
    so the frontend can populate its filter dropdowns dynamically.
    """
    return processor.get_filter_options()


@app.get("/api/data", tags=["Data"])
def get_chart_data(
    date_from: Optional[str] = Query(None),
    date_to:   Optional[str] = Query(None),
    category:  Optional[str] = Query(None),
    region:    Optional[str] = Query(None),
):
    """
    Returns all chart data in one call to minimise round-trips.
    The frontend calls this whenever filters change.
    """
    df = processor.get_filtered_data(date_from, date_to, category, region)
    return {
        "sales_over_time":    processor.get_sales_over_time(df),
        "sales_by_category":  processor.get_sales_by_category(df),
        "sales_by_region":    processor.get_sales_by_region(df),
        "monthly_trend":      processor.get_monthly_trend(df),
    }


@app.get("/api/summary", tags=["Data"])
def get_summary(
    date_from: Optional[str] = Query(None),
    date_to:   Optional[str] = Query(None),
    category:  Optional[str] = Query(None),
    region:    Optional[str] = Query(None),
):
    """Returns KPI summary stats for the filtered dataset."""
    df = processor.get_filtered_data(date_from, date_to, category, region)
    return processor.get_summary_stats(df)


@app.post("/api/insights", tags=["AI"])
def generate_insights(
    date_from: Optional[str] = Query(None),
    date_to:   Optional[str] = Query(None),
    category:  Optional[str] = Query(None),
    region:    Optional[str] = Query(None),
):
    """
    Sends the filtered dataset summary to OpenAI (or rule-based fallback)
    and returns natural-language insights.

    This is a POST so it's clear that it triggers an expensive operation.
    """
    df      = processor.get_filtered_data(date_from, date_to, category, region)
    summary = processor.get_summary_stats(df)
    text    = ai_generator.generate_insights(summary, df)
    return {"insights": text, "source": "openai" if ai_generator.use_openai else "rule-based"}


@app.get("/api/download", tags=["Export"])
def download_csv(
    date_from: Optional[str] = Query(None),
    date_to:   Optional[str] = Query(None),
    category:  Optional[str] = Query(None),
    region:    Optional[str] = Query(None),
):
    """
    Streams the filtered dataset back as a downloadable CSV file.
    The frontend opens this URL directly in a new tab.
    """
    df = processor.get_filtered_data(date_from, date_to, category, region)
    buf = io.StringIO()
    df.to_csv(buf, index=False)
    buf.seek(0)
    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=sales_report.csv"},
    )
