import os
import time
import logging
from ingestion.alpha_vantage import fetch_daily_ohlcv
from config.settings import TICKERS, RAW_DIR, LOG_DIR

os.makedirs(RAW_DIR, exist_ok=True)
os.makedirs(LOG_DIR, exist_ok=True)

logging.basicConfig(
    filename=f"{LOG_DIR}/ingestion.log",
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
)

def run():
    for ticker in TICKERS:
        logging.info(f"Starting fetch: {ticker}")
        try:
            df = fetch_daily_ohlcv(ticker)
            out_path = f"{RAW_DIR}/{ticker}_daily.csv"
            df.to_csv(out_path)
            logging.info(f"Saved {len(df)} rows → {out_path}")
            print(f"✓ {ticker}: {len(df)} rows")
        except Exception as e:
            logging.error(f"Failed {ticker}: {e}")
            print(f"✗ {ticker}: {e}")

        time.sleep(15)  # ~5 req/min on free tier

if __name__ == "__main__":
    run()