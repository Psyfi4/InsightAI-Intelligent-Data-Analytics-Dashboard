/**
 * Dashboard.jsx
 * ─────────────
 * Root layout component. Manages all state and coordinates:
 *   • Filter bar    → triggers data reload
 *   • KPI cards     → shows summary stats
 *   • Four charts   → visualise sales data
 *   • AI panel      → shows / hides insights
 *   • Download btn  → streams CSV from backend
 */

import { useState, useEffect, useCallback } from 'react'
import KPICards      from './KPICards'
import Filters       from './Filters'
import InsightsPanel from './InsightsPanel'
import SalesLineChart   from './charts/SalesLineChart'
import CategoryBarChart from './charts/CategoryBarChart'
import RegionPieChart   from './charts/RegionPieChart'
import TrendAreaChart   from './charts/TrendAreaChart'
import { fetchData, fetchSummary, generateInsights, downloadReport } from '../services/api'

// ── Initial filter state ───────────────────────────────────────────────────────

const DEFAULT_FILTERS = { date_from: '', date_to: '', category: 'All', region: 'All' }

// ── Helper: Section card wrapper ───────────────────────────────────────────────

function ChartCard({ title, span = 1, children }) {
  return (
    <div className={`bg-slate-800 border border-slate-700 rounded-xl p-5 ${span === 2 ? 'lg:col-span-2' : ''}`}>
      <h2 className="text-base font-semibold text-slate-100 mb-4">{title}</h2>
      {children}
    </div>
  )
}

// ── Loading / error overlays ───────────────────────────────────────────────────

function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`bg-slate-800 border border-slate-700 rounded-xl p-5 ${i <= 2 ? 'lg:col-span-2' : ''}`}
          style={{ height: 360 }}
        >
          <div className="skeleton h-4 w-40 mb-4" />
          <div className="skeleton w-full" style={{ height: 280 }} />
        </div>
      ))}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [filters,         setFilters]         = useState(DEFAULT_FILTERS)
  const [chartData,       setChartData]       = useState(null)
  const [summary,         setSummary]         = useState(null)
  const [insights,        setInsights]        = useState('')
  const [showInsights,    setShowInsights]    = useState(false)
  const [loading,         setLoading]         = useState(true)
  const [insightsLoading, setInsightsLoading] = useState(false)
  const [error,           setError]           = useState(null)
  const [lastUpdated,     setLastUpdated]     = useState(null)

  // ── Data loader ─────────────────────────────────────────────────────────────

  const loadData = useCallback(async (activeFilters = filters) => {
    setLoading(true)
    setError(null)
    try {
      const [data, sum] = await Promise.all([
        fetchData(activeFilters),
        fetchSummary(activeFilters),
      ])
      setChartData(data)
      setSummary(sum)
      setLastUpdated(new Date().toLocaleTimeString())
    } catch {
      setError('Cannot reach the backend. Make sure uvicorn is running on port 8000.')
    } finally {
      setLoading(false)
    }
  }, [filters])   // eslint-disable-line react-hooks/exhaustive-deps

  // Load on first mount
  useEffect(() => { loadData() }, [])   // eslint-disable-line react-hooks/exhaustive-deps

  // ── AI insights ─────────────────────────────────────────────────────────────

  const handleGenerateInsights = async () => {
    setInsightsLoading(true)
    setShowInsights(true)
    setInsights('')
    try {
      const result = await generateInsights(filters)
      setInsights(result.insights)
    } catch {
      setInsights('⚠️ Could not generate insights. Please check the backend is running and try again.')
    } finally {
      setInsightsLoading(false)
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-900">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="bg-slate-800/80 backdrop-blur border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-screen-xl mx-auto px-6 py-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              📊 AI Analytics Dashboard
            </h1>
            <p className="text-slate-400 text-xs mt-0.5">
              Sales performance · powered by AI
              {lastUpdated && (
                <span className="ml-2 text-slate-600">· updated {lastUpdated}</span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Refresh */}
            <button
              onClick={() => loadData()}
              disabled={loading}
              className="px-3 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50
                text-slate-300 text-sm rounded-lg transition-colors duration-150"
              title="Refresh data"
            >
              {loading ? '⏳' : '🔄'} Refresh
            </button>

            {/* Download */}
            <button
              onClick={() => downloadReport(filters)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium
                rounded-lg transition-colors duration-150 flex items-center gap-2"
            >
              📥 Download CSV
            </button>

            {/* Generate Insights */}
            <button
              onClick={handleGenerateInsights}
              disabled={insightsLoading || loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800
                disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg
                transition-colors duration-150 flex items-center gap-2"
            >
              {insightsLoading
                ? <><span className="animate-spin-slow">⚙️</span> Analysing…</>
                : '✨ Generate AI Insights'
              }
            </button>
          </div>
        </div>
      </header>

      {/* ── Page body ───────────────────────────────────────────────────────── */}
      <main className="max-w-screen-xl mx-auto px-6 py-6 space-y-6">

        {/* Filters */}
        <Filters
          filters={filters}
          onFiltersChange={setFilters}
          onApply={() => loadData(filters)}
        />

        {/* Error banner */}
        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 px-5 py-3 rounded-xl text-sm flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-semibold">Backend unreachable</p>
              <p className="text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* KPI row */}
        <KPICards summary={summary} loading={loading} />

        {/* Charts grid */}
        {loading ? (
          <LoadingGrid />
        ) : chartData ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Sales over time — full width */}
            <ChartCard title="📈 Revenue & Profit Over Time" span={2}>
              <SalesLineChart data={chartData.sales_over_time} />
            </ChartCard>

            {/* Category bar + Region pie — side by side */}
            <ChartCard title="🏷️ Sales by Category">
              <CategoryBarChart data={chartData.sales_by_category} />
            </ChartCard>

            <ChartCard title="🗺️ Sales by Region">
              <RegionPieChart data={chartData.sales_by_region} />
            </ChartCard>

            {/* Category trend — full width */}
            <ChartCard title="📊 Monthly Revenue Trend by Category" span={2}>
              <TrendAreaChart data={chartData.monthly_trend} />
            </ChartCard>

          </div>
        ) : null}

        {/* AI Insights panel */}
        {showInsights && (
          <InsightsPanel insights={insights} loading={insightsLoading} />
        )}

        {/* Footer */}
        <footer className="text-center text-slate-600 text-xs py-4 border-t border-slate-800">
          AI Analytics Dashboard · Built with React + FastAPI + Recharts
        </footer>

      </main>
    </div>
  )
}
