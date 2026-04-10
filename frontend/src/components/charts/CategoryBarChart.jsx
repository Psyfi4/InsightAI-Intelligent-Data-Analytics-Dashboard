/**
 * CategoryBarChart.jsx
 * Horizontal bar chart comparing Revenue and Profit across product categories.
 * Horizontal orientation is easier to read with long category names.
 */

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

const formatCurrency = (v) =>
  v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M`
  : v >= 1_000   ? `$${(v / 1_000).toFixed(0)}K`
  : `$${v}`

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl text-sm">
      <p className="text-slate-300 font-medium mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.fill || p.color }} />
          <span className="text-slate-400">{p.name}:</span>
          <span className="text-white font-semibold">{formatCurrency(p.value)}</span>
        </div>
      ))}
      {payload[0] && payload[1] && (
        <p className="text-slate-500 text-xs mt-1 border-t border-slate-700 pt-1">
          Margin: {((payload[1].value / payload[0].value) * 100).toFixed(1)}%
        </p>
      )}
    </div>
  )
}

export default function CategoryBarChart({ data = [] }) {
  if (!data.length) return <EmptyState />

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        barCategoryGap="20%"
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
        <XAxis
          type="number"
          tickFormatter={formatCurrency}
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: '#334155' }}
        />
        <YAxis
          type="category"
          dataKey="category"
          tick={{ fill: '#cbd5e1', fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          width={110}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff08' }} />
        <Legend
          wrapperStyle={{ color: '#94a3b8', fontSize: 12, paddingTop: 8 }}
          iconType="circle"
        />
        <Bar dataKey="sales" name="Revenue" radius={[0, 4, 4, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.9} />
          ))}
        </Bar>
        <Bar dataKey="profit" name="Profit" radius={[0, 4, 4, 0]} fill="#10b981" fillOpacity={0.6} />
      </BarChart>
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
