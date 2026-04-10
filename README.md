# 📊 AI Analytics Dashboard

A full-stack, AI-powered sales analytics dashboard built with **React + FastAPI**.
It visualises 5,000+ sales records with interactive charts and generates natural-language
business insights via OpenAI (or a built-in rule-based engine — no API key required).

---

## ✨ Features

| Feature | Detail |
|---|---|
| 📈 4 interactive charts | Line, Bar, Pie/Donut, Stacked Area |
| 🤖 AI Insights | OpenAI GPT or built-in rule-based analysis |
| 🔍 Smart filters | Date range · Category · Region |
| 📥 CSV export | Download filtered data instantly |
| ⚡ Fast & reactive | All charts update on filter change |
| 🎨 Dark UI | Tailwind CSS dark theme |
| 🐳 Docker ready | One command cloud/local deployment |

---

## 🏗️ Architecture

```
Browser (React + Recharts + Tailwind)
        │
        │  HTTP / REST
        ▼
FastAPI Backend (Python)
        │
        ├── DataProcessor (Pandas) ──► sales_data.csv
        └── AIInsightsGenerator ──────► OpenAI API
                                         └── Rule-based fallback (no key needed)
```

---

## 📁 Folder Structure

```
Dashboard analytics/
├── backend/
│   ├── main.py              ← FastAPI routes
│   ├── data_processor.py    ← Pandas filtering & aggregation
│   ├── ai_insights.py       ← OpenAI / rule-based insight engine
│   ├── generate_data.py     ← Generates the sample dataset
│   ├── requirements.txt
│   ├── Dockerfile
│   └── data/
│       └── sales_data.csv   ← 5,060 rows, 2 years of sales data
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx        ← Main layout & state
│   │   │   ├── KPICards.jsx         ← Metric cards
│   │   │   ├── Filters.jsx          ← Filter bar
│   │   │   ├── InsightsPanel.jsx    ← AI results display
│   │   │   └── charts/
│   │   │       ├── SalesLineChart.jsx   ← Revenue & Profit over time
│   │   │       ├── CategoryBarChart.jsx ← Horizontal bar by category
│   │   │       ├── RegionPieChart.jsx   ← Donut by region
│   │   │       └── TrendAreaChart.jsx   ← Stacked area by category
│   │   ├── services/
│   │   │   └── api.js           ← All API calls centralised here
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── Dockerfile
│   └── .env.example
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🚀 Quick Start (Local — Recommended)

### Prerequisites
- **Python 3.10+** → [python.org](https://python.org)
- **Node.js 18+** → [nodejs.org](https://nodejs.org)
- A terminal (PowerShell, Command Prompt, or Git Bash on Windows)

---

### Step 1 — Start the Backend

Open **Terminal 1** and run:

```bash
# Navigate into the backend folder
cd "Dashboard analytics/backend"

# Create a virtual environment (keeps packages isolated)
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# Mac / Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# (Optional) Add your OpenAI API key for AI-powered insights
#   Copy .env.example to .env and fill in your key
copy ..\\.env.example .env          # Windows
# cp ../.env.example .env           # Mac/Linux

# Start the API server
uvicorn main:app --reload --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
✅  Generated 5,060 records → data/sales_data.csv
```

Test it: open http://localhost:8000 in your browser. You should see `{"status":"ok"}`.

---

### Step 2 — Start the Frontend

Open **Terminal 2** (keep Terminal 1 running) and run:

```bash
# Navigate into the frontend folder
cd "Dashboard analytics/frontend"

# Install Node packages (takes ~1 minute first time)
npm install

# (Optional) copy the env file
copy .env.example .env             # Windows
# cp .env.example .env             # Mac/Linux

# Start the Vite dev server
npm run dev
```

Open **http://localhost:5173** in your browser. 🎉

---

### Step 3 — (Optional) Add OpenAI Key

1. Open `backend/.env`
2. Replace `your_openai_api_key_here` with your actual key from [platform.openai.com](https://platform.openai.com)
3. Restart the backend (`Ctrl+C` then `uvicorn main:app --reload --port 8000`)
4. Click **✨ Generate AI Insights** in the dashboard

> **No API key?** The dashboard still works perfectly — it uses a smart rule-based engine instead.

---

## 🐳 Docker Deployment (Optional)

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/).

```bash
# From the project root
cd "Dashboard analytics"

# Build and start both services
docker-compose up --build

# Open http://localhost:5173
```

To stop:
```bash
docker-compose down
```

---

## 🌐 Cloud Deployment

### Option A — Railway (easiest, free tier)
1. Push this project to a GitHub repo
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Add backend service → set `OPENAI_API_KEY` env var
4. Add frontend service → set `VITE_API_URL` to your backend's Railway URL

### Option B — AWS / Azure
1. Build Docker images: `docker-compose build`
2. Push to ECR / ACR
3. Deploy with ECS / ACI
4. Set environment variables in the task definition / container group

---

## 🔌 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/api/filters` | Available filter options |
| GET | `/api/data` | All chart data (filterable) |
| GET | `/api/summary` | KPI summary stats |
| POST | `/api/insights` | Generate AI insights |
| GET | `/api/download` | Download filtered CSV |

**Common query parameters** (all endpoints except `/` and `/api/filters`):

| Param | Example | Description |
|-------|---------|-------------|
| `date_from` | `2024-06-01` | Start of date range |
| `date_to` | `2024-12-31` | End of date range |
| `category` | `Electronics` | Single category |
| `region` | `North` | Single region |

Interactive docs: http://localhost:8000/docs (Swagger UI, auto-generated by FastAPI)

---

## 📊 Dataset

`backend/data/sales_data.csv` — 5,060 rows of synthetic sales data:

| Column | Type | Example |
|--------|------|---------|
| date | YYYY-MM-DD | 2024-03-15 |
| category | string | Electronics |
| region | string | North |
| units_sold | int | 42 |
| unit_price | float | 349.99 |
| sales | float | 14699.58 |
| profit | float | 2572.43 |
| margin_pct | float | 17.5 |

Regenerate the dataset at any time:
```bash
cd backend
python generate_data.py
```

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React 18 + Vite | Fast HMR, modern ecosystem |
| Styling | Tailwind CSS | Utility-first, consistent dark theme |
| Charts | Recharts | Built on D3, React-native, responsive |
| Backend | FastAPI | Async Python, auto-docs, fast |
| Data | Pandas 2 | Industry-standard data manipulation |
| AI | OpenAI GPT-3.5 | Best-in-class NL generation |
| Fallback | Rule-based engine | Works without any API key |
| Deploy | Docker Compose | One-command reproducible setup |

---

## 🔧 Customisation

**Use your own data**: replace `backend/data/sales_data.csv` with your CSV.
Required columns: `date`, `category`, `region`, `sales`, `units_sold`, `profit`.

**Change AI model**: in `backend/ai_insights.py`, change `model="gpt-3.5-turbo"` to `gpt-4` or any other OpenAI model.

**Add new charts**: create a new component in `frontend/src/components/charts/` and add it to `Dashboard.jsx`.

**Change theme colours**: edit `frontend/tailwind.config.js` and `frontend/src/index.css`.
