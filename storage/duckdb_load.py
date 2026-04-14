import os
import duckdb
import glob as glob_module

PROCESSED_DIR = "processed"
DB_PATH = "warehouse.db"

def run():
    con = duckdb.connect(DB_PATH)

    parquet_files = glob_module.glob(f"{PROCESSED_DIR}/*.parquet")
    print(f"Loading {len(parquet_files)} Parquet files into DuckDB...")

    # Load all files into one unified table
    con.execute(f"""
        CREATE OR REPLACE TABLE stock_features AS
        SELECT * FROM read_parquet({parquet_files})
    """)

    count = con.execute("SELECT COUNT(*) FROM stock_features").fetchone()[0]
    print(f"✓ Loaded {count} total rows into stock_features")

    # Show the same spike query, now running as SQL
    print("\n--- Volume Spikes via DuckDB ---")
    result = con.execute("""
        SELECT symbol, date, volume, avg_volume_20, ROUND(price_gap_pct, 2) AS gap_pct
        FROM stock_features
        WHERE volume_spike = true
        ORDER BY date DESC
    """).df()
    print(result.to_string(index=False))

    # Bonus: rolling performance summary per ticker
    print("\n--- Latest SMA20 per Ticker ---")
    summary = con.execute("""
        SELECT symbol,
               MAX(date)       AS latest_date,
               ROUND(LAST(close ORDER BY date), 2)  AS last_close,
               ROUND(LAST(sma_20 ORDER BY date), 2) AS sma_20
        FROM stock_features
        GROUP BY symbol
        ORDER BY symbol
    """).df()
    print(summary.to_string(index=False))

    con.close()

if __name__ == "__main__":
    run()