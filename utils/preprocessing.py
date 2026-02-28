import pandas as pd

def load_data(file):
    return pd.read_csv(file)

def summarize_data(df):
    summary = df.describe(include="all").to_string()
    return summary
