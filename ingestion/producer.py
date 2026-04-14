import os
import json
import time
import glob
import logging
import pandas as pd
from kafka import KafkaProducer
from config.settings import RAW_DIR, LOG_DIR

logging.basicConfig(
    filename=f"{LOG_DIR}/producer.log",
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
)

TOPIC = "ohlcv-raw"
DELAY = 0.05  # seconds between messages — tweak to go faster/slower

def run():
    producer = KafkaProducer(
        bootstrap_servers="localhost:9092",
        value_serializer=lambda v: json.dumps(v).encode("utf-8"),
    )

    csv_files = glob.glob(f"{RAW_DIR}/*.csv")
    if not csv_files:
        print("No CSVs found — run ingestion first.")
        return

    for path in csv_files:
        df = pd.read_csv(path, index_col="date")
        ticker = df["symbol"].iloc[0]
        print(f"Producing {len(df)} messages for {ticker}...")

        for date, row in df.iterrows():
            message = {
                "date":   date,
                "symbol": ticker,
                "open":   row["open"],
                "high":   row["high"],
                "low":    row["low"],
                "close":  row["close"],
                "volume": row["volume"],
            }
            producer.send(TOPIC, value=message)
            logging.info(f"Sent: {ticker} {date}")
            time.sleep(DELAY)

        producer.flush()
        print(f"✓ Done: {ticker}")

if __name__ == "__main__":
    run()