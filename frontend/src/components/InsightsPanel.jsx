/**
 * InsightsPanel.jsx
 * Displays AI-generated insights with markdown-like formatting.
 * Includes a "Copy to clipboard" button and a loading skeleton.
 */

import { useState } from 'react'

/** Lightweight markdown → HTML converter for the insight text */
function renderMarkdown(text) {
  return text
    // ## Heading → <h2>
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    // **bold** → <strong>
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // *italic* → <em>
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Bullet points
    .replace(/^• (.+)$/gm, '<li>$1</li>')
    // Numbered list items
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    // Wrap consecutive <li> in <ul>
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
    // Horizontal rule
    .replace(/^---$/gm, '<hr />')
    // Remaining line breaks → <p>
    .replace(/\n{2,}/g, '</p><p>')
    .replace(/^(?!<[hpul])(.+)$/gm, '<p>$1</p>')
}

export default function InsightsPanel({ insights, loading }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(insights).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="bg-slate-800 border border-blue-800/50 rounded-xl p-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🤖</span>
          <h2 className="text-lg font-semibold text-white">AI Insights</h2>
          {loading && (
            <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded-full border border-blue-700/50 animate-pulse-slow">
              Analysing…
            </span>
          )}
          {!loading && insights && (
            <span className="text-xs bg-emerald-900/40 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-700/40">
              Ready ✓
            </span>
          )}
        </div>
        {!loading && insights && (
          <button
            onClick={handleCopy}
            className="text-xs px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300
              rounded-lg transition-colors duration-150"
          >
            {copied ? '✅ Copied!' : '📋 Copy'}
          </button>
        )}
      </div>

      {/* Content area */}
      {loading ? (
        <InsightsSkeleton />
      ) : (
        <div
          className="insights-content text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(insights) }}
        />
      )}
    </div>
  )
}

function InsightsSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="skeleton h-4 w-1/3" />
      <div className="skeleton h-3 w-full" />
      <div className="skeleton h-3 w-5/6" />
      <div className="skeleton h-3 w-4/5" />
      <div className="skeleton h-4 w-1/4 mt-5" />
      <div className="skeleton h-3 w-full" />
      <div className="skeleton h-3 w-3/4" />
      <div className="skeleton h-4 w-1/3 mt-5" />
      <div className="skeleton h-3 w-full" />
      <div className="skeleton h-3 w-5/6" />
      <div className="skeleton h-3 w-2/3" />
    </div>
  )
}
