/**
 * RegionPieChart.jsx
 * Donut-style pie chart showing revenue share by region.
 * Includes a custom legend with percentage breakdowns.
 */

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']

const fmt = (v) =>
  v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M`
  : v >= 1_000   ? `$${(v / 1_000).toFixed(0)}K`
  : `$${v}`

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl text-sm">
      <p className="text-white font-semibold">{d.name}</p>
      <p className="text-slate-300 mt-1">Revenue: <span className="text-white">{fmt(d.value)}</span></p>
      <p className="text-slate-300">Share: <span className="text-white">{d.payload.share}%</span></p>
    </div>
  )
}

/** Custom legend placed to the right of the chart */
function CustomLegend({ data }) {
  const total = data.reduce((s, d) => s + d.sales, 0)
  return (
    <div className="flex flex-col justify-center gap-3 pl-4">
      {data.map((d, i) => (
        <div key={d.region} className="flex items-center gap-3">
          <span
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ background: COLORS[i % COLORS.length] }}
          />
          <div>
            <p className="text-slate-200 text-sm font-medium">{d.region}</p>
            <p className="text-slate-400 text-xs">{fmt(d.sales)} · {((d.sales / total) * 100).toFixed(1)}%</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function RegionPieChart({ data = [] }) {
  if (!data.length) return <EmptyState />

  const total = data.reduce((s, d) => s + d.sales, 0)
  const enriched = data.map((d) => ({
    ...d,
    name: d.region,
    value: d.sales,
    share: ((d.sales / total) * 100).toFixed(1),
  }))

  return (
    <div className="flex items-center">
      <ResponsiveContainer width="60%" height={260}>
        <PieChart>
          <Pie
            data={enriched}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={105}
            paddingAngle={3}
            dataKey="value"
            stroke="none"
          >
            {enriched.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {/* Centre label */}
          <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle" fill="#94a3b8" fontSize={11}>
            Total
          </text>
          <text x="50%" y="56%" textAnchor="middle" dominantBaseline="middle" fill="#f1f5f9" fontSize={14} fontWeight="bold">
            {fmt(total)}
          </text>
        </PieChart>
      </ResponsiveContainer>
      <CustomLegend data={data} />
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex items-center justify-center h-64 text-slate-500 text-sm">
      No data available for the selected filters.
    </div>
  )
}
