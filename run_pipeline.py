import subprocess
import sys
import os
import glob
from config.settings import TICKERS, RAW_DIR, OUTPUT_DIR

def cleanup_stale_files():
    print("\n=== Cleanup ===")

    # Remove CSVs for tickers no longer in settings
    existing_csvs = glob.glob(f"{RAW_DIR}/*.csv")
    for path in existing_csvs:
        sym = os.path.basename(path).replace("_daily.csv", "")
        if sym not in TICKERS:
            os.remove(path)
            print(f"  Removed stale CSV: {path}")

    # Remove Parquet files for tickers no longer in settings
    existing_parquets = glob.glob(f"{OUTPUT_DIR}/*.parquet")
    for path in existing_parquets:
        sym = os.path.basename(path).replace("_features.parquet", "")
        if sym not in TICKERS:
            os.remove(path)
            print(f"  Removed stale Parquet: {path}")

steps = [
    ("Cleanup",     cleanup_stale_files),
    ("Ingestion",   ["python", "-m", "ingestion.ingest"]),
    ("Spark jobs",  ["python", "-m", "processing.spark_jobs"]),
    ("DuckDB load", ["python", "-m", "storage.duckdb_load"]),
]

for name, step in steps:
    print(f"\n{'='*40}\n{name}\n{'='*40}")
    if callable(step):
        step()
    else:
        result = subprocess.run(step)
        if result.returncode != 0:
            print(f"Pipeline failed at: {name}")
            sys.exit(1)

print("\n✓ Pipeline complete")