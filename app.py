import streamlit as st
import pandas as pd
from utils.preprocessing import load_data, summarize_data
from utils.visualization import sales_by_region, monthly_trend
from llm_insights import generate_insight

st.set_page_config(page_title="AI Data Dashboard", layout="wide")

st.title("📊 AI-Powered Data Analytics Dashboard")

uploaded_file = st.file_uploader("Upload CSV File", type=["csv"])

if uploaded_file:
    df = load_data(uploaded_file)
else:
    df = load_data("data/sample_data.csv")

st.subheader("Dataset Preview")
st.dataframe(df)

# Visualization Section
st.subheader("📈 Visualizations")

col1, col2 = st.columns(2)

with col1:
    fig1 = sales_by_region(df)
    st.plotly_chart(fig1, use_container_width=True)

with col2:
    fig2 = monthly_trend(df)
    st.plotly_chart(fig2, use_container_width=True)

# AI Insights
st.subheader("🤖 AI Generated Insights")

if st.button("Generate AI Insights"):
    summary = summarize_data(df)
    insight = generate_insight(summary)
    st.text_area("AI Explanation", insight, height=250)
