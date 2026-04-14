import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("ALPHA_VANTAGE_KEY")

TICKERS = ["AAPL", "TSLA", "NVDA", "UMAC"]

RAW_DIR = "raw/alpha_vantage"
LOG_DIR = "logs"
PROCESSED_DIR = "processed"
OUTPUT_DIR = PROCESSED_DIR