/**
 * api.js — centralised API service layer
 * All HTTP calls go through here so only one file needs to change
 * if the backend URL changes.
 */

import axios from 'axios'

// Reads VITE_API_URL from .env; falls back to localhost for local dev
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 45_000,   // 45 s — AI endpoint can be slow
})

/** Convert a filters object into query-string params, omitting empty values */
function buildParams(filters = {}) {
  const p = {}
  if (filters.date_from) p.date_from = filters.date_from
  if (filters.date_to)   p.date_to   = filters.date_to
  if (filters.category && filters.category !== 'All') p.category = filters.category
  if (filters.region   && filters.region   !== 'All') p.region   = filters.region
  return p
}

/** GET /api/data — all chart series for the filtered period */
export async function fetchData(filters = {}) {
  const res = await api.get('/api/data', { params: buildParams(filters) })
  return res.data
}

/** GET /api/summary — KPI card values */
export async function fetchSummary(filters = {}) {
  const res = await api.get('/api/summary', { params: buildParams(filters) })
  return res.data
}

/** GET /api/filters — category / region lists + date boundaries */
export async function fetchFilterOptions() {
  const res = await api.get('/api/filters')
  return res.data
}

/** POST /api/insights — AI-generated analysis text */
export async function generateInsights(filters = {}) {
  const res = await api.post('/api/insights', null, { params: buildParams(filters) })
  return res.data
}

/**
 * GET /api/download — opens the CSV in a new browser tab so the
 * browser handles the "Save As" dialog natively.
 */
export function downloadReport(filters = {}) {
  const params = new URLSearchParams(buildParams(filters)).toString()
  const url = `${BASE_URL}/api/download${params ? '?' + params : ''}`
  window.open(url, '_blank')
}
