import plotly.express as px

def sales_by_region(df):
    fig = px.bar(df, x="Region", y="Sales", color="Region",
                 title="Sales by Region", barmode="group")
    return fig

def monthly_trend(df):
    fig = px.line(df, x="Month", y="Sales", color="Region",
                  title="Monthly Sales Trend")
    return fig
