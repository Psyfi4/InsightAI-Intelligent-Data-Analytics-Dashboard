/**
 * SalesLineChart.jsx
 * Dual-line chart showing monthly Revenue and Profit over time.
 * Uses Recharts LineChart with custom tooltip and responsive container.
 */

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts'

const formatCurrency = (v) =>
  v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M`
  : v >= 1_000   ? `$${(v / 1_000).toFixed(0)}K`
  : `$${v}`

/** Custom tooltip card */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl text-sm">
      <p className="text-slate-300 font-medium mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-400">{p.name}:</span>
          <span className="text-white font-semibold">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function SalesLineChart({ data = [] }) {
  if (!data.length) return <EmptyState />

  // Shorten month label: "2024-03" → "Mar 24"
  const formatted = data.map((d) => {
    const [year, month] = d.month.split('-')
    const label = new Date(+year, +month - 1).toLocaleString('en', { month: 'short' })
    return { ...d, label: `${label} '${year.slice(2)}` }
  })

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={formatted} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
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
        <Line
          type="monotone"
          dataKey="sales"
          name="Revenue"
          stroke="#3b82f6"
          strokeWidth={2.5}
          dot={{ r: 3, fill: '#3b82f6', strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
        <Line
          type="monotone"
          dataKey="profit"
          name="Profit"
          stroke="#10b981"
          strokeWidth={2.5}
          dot={{ r: 3, fill: '#10b981', strokeWidth: 0 }}
          activeDot={{ r: 5 }}
          strokeDasharray="5 3"
        />
      </LineChart>
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
