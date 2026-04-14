import requests
import pandas as pd
from config.settings import API_KEY

BASE_URL = "https://www.alphavantage.co/query"

def fetch_daily_ohlcv(symbol: str) -> pd.DataFrame:
    params = {
        "function": "TIME_SERIES_DAILY",
        "symbol": symbol,
        "outputsize": "compact",
        "apikey": API_KEY,
    }
    r = requests.get(BASE_URL, params=params)
    r.raise_for_status()
    data = r.json()

    if "Time Series (Daily)" not in data:
        raise ValueError(f"Bad response for {symbol}: {data.get('Note') or data}")

    df = pd.DataFrame(data["Time Series (Daily)"]).T
    df.index.name = "date"
    df.index = pd.to_datetime(df.index)
    df.columns = ["open", "high", "low", "close", "volume"]
    df = df.astype(float)
    df["symbol"] = symbol
    return df.sort_index()