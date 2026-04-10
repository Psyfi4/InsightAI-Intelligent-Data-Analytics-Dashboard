/**
 * TrendAreaChart.jsx
 * Stacked area chart showing monthly sales contribution by category.
 * Pivots the flat month+category data into recharts-compatible format.
 */

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

const formatCurrency = (v) =>
  v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M`
  : v >= 1_000   ? `$${(v / 1_000).toFixed(0)}K`
  : `$${v}`

/**
 * Pivot flat [{month, category, sales}] into
 * [{label, Electronics: 1234, Clothing: 567, …}]
 */
function pivot(data) {
  const months     = [...new Set(data.map((d) => d.month))].sort()
  const categories = [...new Set(data.map((d) => d.category))]

  return months.map((m) => {
    const [year, month] = m.split('-')
    const label = `${new Date(+year, +month - 1).toLocaleString('en', { month: 'short' })} '${year.slice(2)}`
    const row = { month: m, label }
    categories.forEach((cat) => {
      const match = data.find((d) => d.month === m && d.category === cat)
      row[cat] = match ? match.sales : 0
    })
    return row
  })
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const sorted = [...payload].sort((a, b) => b.value - a.value)
  return (
    <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl text-sm min-w-[160px]">
      <p className="text-slate-300 font-medium mb-2">{label}</p>
      {sorted.map((p) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4 py-0.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-slate-400">{p.dataKey}</span>
          </div>
          <span className="text-white font-medium">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function TrendAreaChart({ data = [] }) {
  if (!data.length) return <EmptyState />

  const categories = [...new Set(data.map((d) => d.category))]
  const pivoted    = pivot(data)

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={pivoted} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <defs>
          {categories.map((cat, i) => (
            <linearGradient key={cat} id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={COLORS[i % COLORS.length]} stopOpacity={0.4} />
              <stop offset="95%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.05} />
            </linearGradient>
          ))}
        </defs>

        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis
          dataKey="label"
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: '#334155' }}
        />
        <YAxis
          tickFormatter={formatCurrency}
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={60}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ color: '#94a3b8', fontSize: 12, paddingTop: 12 }}
          iconType="circle"
        />

        {categories.map((cat, i) => (
          <Area
            key={cat}
            type="monotone"
            dataKey={cat}
            stackId="1"
            stroke={COLORS[i % COLORS.length]}
            strokeWidth={1.5}
            fill={`url(#grad-${i})`}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  )
}

function EmptyState() {
  return (
    <div className="flex items-center justify-center h-64 text-slate-500 text-sm">
      No data available for the selected filters.
    </div>
  )
}
