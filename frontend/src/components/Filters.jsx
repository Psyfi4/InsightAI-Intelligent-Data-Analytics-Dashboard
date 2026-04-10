/**
 * Filters.jsx
 * Filter bar: date range, category multi-select, region multi-select, Apply button.
 * Fetches available options from the backend so the dropdown lists are always accurate.
 */

import { useState, useEffect } from 'react'
import { fetchFilterOptions } from '../services/api'

export default function Filters({ filters, onFiltersChange, onApply }) {
  const [options, setOptions] = useState({ categories: [], regions: [], date_min: '', date_max: '' })
  const [loadingOptions, setLoadingOptions] = useState(true)

  // Load available filter options once on mount
  useEffect(() => {
    fetchFilterOptions()
      .then(setOptions)
      .catch(() => {
        // Hardcoded fallback if backend is slow to start
        setOptions({
          categories: ['Electronics', 'Clothing', 'Food & Beverage', 'Sports', 'Books'],
          regions:    ['East', 'North', 'South', 'West'],
          date_min:   '2024-01-01',
          date_max:   '2025-12-31',
        })
      })
      .finally(() => setLoadingOptions(false))
  }, [])

  const set = (key, value) => onFiltersChange({ ...filters, [key]: value })

  const reset = () => {
    onFiltersChange({ date_from: '', date_to: '', category: 'All', region: 'All' })
    // Apply immediately after reset
    setTimeout(onApply, 0)
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
      <div className="flex flex-wrap items-end gap-4">

        {/* ── Date From ──────────────────────────────────────────────── */}
        <div className="flex flex-col gap-1 min-w-[140px]">
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Date From
          </label>
          <input
            type="date"
            value={filters.date_from}
            min={options.date_min}
            max={options.date_max}
            onChange={(e) => set('date_from', e.target.value)}
            className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* ── Date To ────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-1 min-w-[140px]">
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Date To
          </label>
          <input
            type="date"
            value={filters.date_to}
            min={options.date_min}
            max={options.date_max}
            onChange={(e) => set('date_to', e.target.value)}
            className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* ── Category ───────────────────────────────────────────────── */}
        <div className="flex flex-col gap-1 min-w-[160px]">
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => set('category', e.target.value)}
            disabled={loadingOptions}
            className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="All">All Categories</option>
            {options.categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* ── Region ─────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-1 min-w-[140px]">
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Region
          </label>
          <select
            value={filters.region}
            onChange={(e) => set('region', e.target.value)}
            disabled={loadingOptions}
            className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="All">All Regions</option>
            {options.regions.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* ── Buttons ────────────────────────────────────────────────── */}
        <div className="flex gap-2 pb-0.5">
          <button
            onClick={onApply}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium
              rounded-lg transition-colors duration-150 whitespace-nowrap"
          >
            Apply Filters
          </button>
          <button
            onClick={reset}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-medium
              rounded-lg transition-colors duration-150 whitespace-nowrap"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Active filters summary pill row */}
      <div className="flex flex-wrap gap-2 mt-3">
        {filters.date_from && (
          <Pill label={`From: ${filters.date_from}`} onRemove={() => set('date_from', '')} />
        )}
        {filters.date_to && (
          <Pill label={`To: ${filters.date_to}`} onRemove={() => set('date_to', '')} />
        )}
        {filters.category && filters.category !== 'All' && (
          <Pill label={`Category: ${filters.category}`} onRemove={() => set('category', 'All')} />
        )}
        {filters.region && filters.region !== 'All' && (
          <Pill label={`Region: ${filters.region}`} onRemove={() => set('region', 'All')} />
        )}
      </div>
    </div>
  )
}

function Pill({ label, onRemove }) {
  return (
    <span className="flex items-center gap-1 bg-blue-900/40 text-blue-300 text-xs px-3 py-1 rounded-full border border-blue-700/50">
      {label}
      <button onClick={onRemove} className="hover:text-white ml-1 leading-none">✕</button>
    </span>
  )
}
