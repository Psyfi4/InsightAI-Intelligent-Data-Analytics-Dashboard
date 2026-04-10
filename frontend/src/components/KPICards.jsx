/**
 * KPICards.jsx
 * Displays five summary metric cards at the top of the dashboard.
 * Each card has an icon, label, value, and a trend badge.
 */

const fmt = {
  currency: (n) =>
    n >= 1_000_000
      ? `$${(n / 1_000_000).toFixed(1)}M`
      : n >= 1_000
      ? `$${(n / 1_000).toFixed(1)}K`
      : `$${n.toFixed(0)}`,
  number: (n) => n.toLocaleString(),
  percent: (n) => `${n.toFixed(1)}%`,
}

function TrendBadge({ value }) {
  if (value === null || value === undefined) return null
  const positive = value >= 0
  return (
    <span
      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
        positive
          ? 'bg-emerald-900/50 text-emerald-400'
          : 'bg-red-900/50 text-red-400'
      }`}
    >
      {positive ? '▲' : '▼'} {Math.abs(value).toFixed(1)}%
    </span>
  )
}

function Card({ icon, label, value, trend, trendLabel, accent }) {
  return (
    <div
      className={`bg-slate-800 border border-slate-700 rounded-xl p-5 flex flex-col gap-3
        hover:border-slate-600 transition-colors duration-200 fade-in`}
    >
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        {trend !== undefined && <TrendBadge value={trend} />}
      </div>
      <div>
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{label}</p>
        <p className={`text-2xl font-bold mt-1 ${accent || 'text-white'}`}>{value}</p>
      </div>
      {trendLabel && (
        <p className="text-slate-500 text-xs">{trendLabel}</p>
      )}
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
      <div className="skeleton h-6 w-8 mb-3" />
      <div className="skeleton h-3 w-24 mb-2" />
      <div className="skeleton h-7 w-32" />
    </div>
  )
}

export default function KPICards({ summary, loading }) {
  if (loading || !summary) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  const cards = [
    {
      icon: '💰',
      label: 'Total Revenue',
      value: fmt.currency(summary.total_sales),
      trend: summary.mom_growth,
      trendLabel: 'vs previous month',
      accent: 'text-blue-400',
    },
    {
      icon: '📈',
      label: 'Total Profit',
      value: fmt.currency(summary.total_profit),
      trendLabel: `${summary.avg_margin}% average margin`,
      accent: 'text-emerald-400',
    },
    {
      icon: '📦',
      label: 'Units Sold',
      value: fmt.number(summary.total_units),
      trendLabel: `${summary.record_count.toLocaleString()} transactions`,
    },
    {
      icon: '💹',
      label: 'Avg Margin',
      value: fmt.percent(summary.avg_margin),
      accent:
        summary.avg_margin >= 30
          ? 'text-emerald-400'
          : summary.avg_margin >= 20
          ? 'text-amber-400'
          : 'text-red-400',
      trendLabel: summary.avg_margin >= 25 ? 'Healthy ✅' : 'Room to improve ⚠️',
    },
    {
      icon: '🏆',
      label: 'Top Category',
      value: summary.top_category,
      trendLabel: `Top region: ${summary.top_region}`,
      accent: 'text-purple-400',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
      {cards.map((c) => (
        <Card key={c.label} {...c} />
      ))}
    </div>
  )
}
