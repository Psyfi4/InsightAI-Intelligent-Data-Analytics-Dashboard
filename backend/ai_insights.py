"""
ai_insights.py
--------------
Generates natural-language insights from the sales data.

Priority order:
  1. OpenAI GPT (if OPENAI_API_KEY is set in .env)
  2. Rule-based fallback (always works — no API key needed)

Prompt engineering approach:
  - Structured data summary injected into a system + user prompt
  - Role: "expert business analyst"
  - Output format: labelled sections (Observations, Trends, Risks, Actions, Forecast)
"""

import os
from dotenv import load_dotenv
import pandas as pd

load_dotenv()


class AIInsightsGenerator:
    """Generates insights via OpenAI or rule-based fallback."""

    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY", "").strip()
        self.use_openai = bool(api_key and api_key != "your_openai_api_key_here")

        if self.use_openai:
            try:
                from openai import OpenAI
                self.client = OpenAI(api_key=api_key)
                print("✅  OpenAI client initialised — AI insights enabled.")
            except ImportError:
                print("⚠️  openai package not installed. Falling back to rule-based insights.")
                self.use_openai = False

    # ── Public entry point ────────────────────────────────────────────────────

    def generate_insights(self, summary: dict, df: pd.DataFrame) -> str:
        """Return a formatted insights string for the given data snapshot."""
        if self.use_openai:
            return self._call_openai(summary, df)
        return self._rule_based_insights(summary, df)

    # ── Prompt builder ────────────────────────────────────────────────────────

    def _build_prompt(self, summary: dict, df: pd.DataFrame) -> str:
        """
        Construct a rich, data-grounded prompt.
        Good prompts = specific numbers + clear output format requested.
        """
        cat_sales    = df.groupby("category")["sales"].sum().sort_values(ascending=False)
        region_sales = df.groupby("region")["sales"].sum().sort_values(ascending=False)

        cat_lines    = "\n".join(f"  • {k}: ${v:,.0f}" for k, v in cat_sales.items())
        region_lines = "\n".join(f"  • {k}: ${v:,.0f}" for k, v in region_sales.items())

        return f"""
You are a senior business analyst advising the executive team.
Analyse the following sales dashboard data and return structured insights.

━━━━━━━━━ SNAPSHOT ━━━━━━━━━
Total Revenue   : ${summary['total_sales']:>12,.2f}
Total Profit    : ${summary['total_profit']:>12,.2f}
Units Sold      : {summary['total_units']:>12,}
Avg Margin      : {summary['avg_margin']:>11.1f}%
MoM Growth      : {summary['mom_growth']:>+11.1f}%
Top Category    : {summary['top_category']}
Top Region      : {summary['top_region']}
Records         : {summary['record_count']:>12,}

━━━━━━━━━ BY CATEGORY ━━━━━━
{cat_lines}

━━━━━━━━━ BY REGION ━━━━━━━━
{region_lines}

Please structure your response with these exact sections:
1. 🔍 Key Observations (2–3 bullet points, reference specific numbers)
2. 📈 Trends & Patterns (what is growing/shrinking and why)
3. ⚠️  Risk Areas (any underperforming metrics that need attention)
4. 🎯 Actionable Recommendations (3–4 concrete, prioritised steps)
5. 🔮 Forecast (short outlook for the next quarter)

Use plain English. Be specific, concise, and direct — no filler sentences.
""".strip()

    # ── OpenAI call ───────────────────────────────────────────────────────────

    def _call_openai(self, summary: dict, df: pd.DataFrame) -> str:
        """Send the prompt to GPT and return the response text."""
        try:
            prompt = self._build_prompt(summary, df)
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are an expert business analyst specialising in retail sales data. "
                            "Your insights are data-driven, specific, and actionable."
                        ),
                    },
                    {"role": "user", "content": prompt},
                ],
                max_tokens=900,
                temperature=0.65,
            )
            return response.choices[0].message.content.strip()

        except Exception as exc:
            # Gracefully fall back so the dashboard never crashes
            error_header = f"⚠️ OpenAI error: {exc}\n\nFalling back to rule-based insights:\n\n"
            return error_header + self._rule_based_insights(summary, df)

    # ── Rule-based fallback ───────────────────────────────────────────────────

    def _rule_based_insights(self, summary: dict, df: pd.DataFrame) -> str:
        """
        Deterministic, data-driven insights that work without any API key.
        Useful for demos or when the OpenAI quota is exhausted.
        """
        lines = []
        s = summary  # shorthand

        # ── 1. Key Observations ───────────────────────────────────────────────
        lines.append("## 🔍 Key Observations\n")

        growth = s["mom_growth"]
        if growth > 8:
            lines.append(f"• **Explosive growth**: Revenue surged **{growth:+.1f}%** month-over-month — well above the 2–4% industry benchmark.")
        elif growth > 2:
            lines.append(f"• **Healthy growth**: Revenue grew **{growth:+.1f}%** month-over-month, consistent with a positive trajectory.")
        elif growth >= 0:
            lines.append(f"• **Flat growth**: Revenue grew only **{growth:+.1f}%** month-over-month. Acceleration strategies are warranted.")
        else:
            lines.append(f"• **Revenue declined {abs(growth):.1f}% month-over-month** — immediate diagnosis of demand drivers is recommended.")

        lines.append(
            f"• **${s['total_sales']:,.0f} total revenue** across **{s['record_count']:,} transactions**, "
            f"yielding **${s['total_profit']:,.0f} profit** at a **{s['avg_margin']}% average margin**."
        )
        lines.append(f"• **{s['top_category']}** is the single largest revenue driver; **{s['top_region']}** leads regionally.\n")

        # ── 2. Trends & Patterns ──────────────────────────────────────────────
        lines.append("## 📈 Trends & Patterns\n")

        cat_sales = df.groupby("category")["sales"].sum().sort_values(ascending=False)
        top_cat   = cat_sales.index[0]
        bot_cat   = cat_sales.index[-1]
        top_pct   = cat_sales.iloc[0] / cat_sales.sum() * 100

        lines.append(
            f"• **{top_cat}** accounts for **{top_pct:.0f}%** of total revenue (${cat_sales.iloc[0]:,.0f}), "
            "suggesting strong consumer demand or pricing power in this segment."
        )
        lines.append(
            f"• **{bot_cat}** contributes only ${cat_sales.iloc[-1]:,.0f} "
            f"({cat_sales.iloc[-1] / cat_sales.sum() * 100:.1f}%) — possible saturation or weak positioning."
        )

        region_sales = df.groupby("region")["sales"].sum().sort_values(ascending=False)
        spread = region_sales.iloc[0] / region_sales.iloc[-1]
        lines.append(
            f"• The top region (**{region_sales.index[0]}**) outperforms the bottom (**{region_sales.index[-1]}**) "
            f"by **{spread:.1f}×** — indicating significant geographic disparity.\n"
        )

        # ── 3. Risk Areas ─────────────────────────────────────────────────────
        lines.append("## ⚠️  Risk Areas\n")

        margin = s["avg_margin"]
        if margin < 15:
            lines.append(f"• 🚨 **Critical margin alert**: {margin}% is dangerously thin. Review COGS and pricing structure immediately.")
        elif margin < 25:
            lines.append(f"• ⚠️ **Margin pressure**: {margin}% margin leaves little room for cost shocks or discounting campaigns.")
        else:
            lines.append(f"• ✅ **Margins are healthy** at {margin}% — maintain disciplined cost controls to protect this.")

        if growth < -5:
            lines.append("• 🚨 **Accelerating decline**: Three consecutive negative MoM figures typically signal structural demand issues, not seasonality.")
        elif growth < 0:
            lines.append("• ⚠️ **Negative growth**: Even mild declines compound over time — act before they become entrenched.")

        lines.append(
            f"• **{bot_cat}** and **{region_sales.index[-1]}** are dual underperformers. "
            "Investigate whether this is a supply, pricing, or awareness issue.\n"
        )

        # ── 4. Recommendations ────────────────────────────────────────────────
        lines.append("## 🎯 Actionable Recommendations\n")
        target_margin = round(margin + 5)

        lines.append(
            f"1. **Double down on {top_cat} in {region_sales.index[0]}**: "
            "Increase marketing spend by 20% in the highest-ROI intersection of your best category and region."
        )
        lines.append(
            f"2. **Revive {bot_cat}**: Run a 60-day A/B test on pricing and promotional bundles. "
            "If lift is <10%, consider reallocating budget to stronger categories."
        )
        lines.append(
            f"3. **Margin improvement target → {target_margin}%**: "
            "Renegotiate supplier contracts on high-volume SKUs and audit fulfilment costs."
        )
        lines.append(
            f"4. **Replicate {region_sales.index[0]}'s playbook**: "
            f"Conduct a win/loss analysis to identify what makes {region_sales.index[0]} outperform, "
            f"then systematically apply it to {region_sales.index[-1]}.\n"
        )

        # ── 5. Forecast ───────────────────────────────────────────────────────
        lines.append("## 🔮 Forecast\n")

        if growth > 5:
            lines.append(
                f"Based on the current **{growth:+.1f}% MoM trajectory**, next quarter is expected to sustain positive momentum. "
                "Ensure inventory and staffing scale proportionally to avoid fulfilment bottlenecks."
            )
        elif growth > 0:
            lines.append(
                "Stable but modest growth is projected for the next quarter. "
                "Executing the recommendations above could push MoM growth into the 5–8% range within 90 days."
            )
        else:
            lines.append(
                "Without corrective action, the current decline is likely to continue. "
                "Prioritise the recommendations above — particularly category and regional diversification — "
                "to return to positive growth within the next two quarters."
            )

        lines.append(
            f"\n---\n*Analysis based on **{s['record_count']:,} records** | "
            f"Revenue: **${s['total_sales']:,.0f}** | "
            f"Margin: **{margin}%** | "
            f"MoM: **{growth:+.1f}%***"
        )

        return "\n".join(lines)
