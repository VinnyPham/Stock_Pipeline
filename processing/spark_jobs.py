from pyspark.sql import SparkSession
from pyspark.sql import functions as F
from pyspark.sql.window import Window
import pyarrow as pa
import pyarrow.parquet as pq
import glob as glob_module
import os

RAW_DIR    = "raw/alpha_vantage"
OUTPUT_DIR = "processed"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def create_session():
    os.environ["PYSPARK_PYTHON"] = "python"
    os.environ["PYSPARK_DRIVER_PYTHON"] = "python"
    
    return (
        SparkSession.builder
        .appName("StockPipeline")
        .master("local[*]")   # use all CPU cores on your machine
        .getOrCreate()
    )

def compute_features(df):
    # Base window — 20 days, per ticker
    window_20 = (
        Window
        .partitionBy("symbol")
        .orderBy("date")
        .rowsBetween(-19, 0)
    )

    # Ordered window (no frame limit) — needed for lag/lead
    window_ordered = (
        Window
        .partitionBy("symbol")
        .orderBy("date")
    )

    # ── SMA20 + Volume baseline ──────────────────────────────
    df = df \
        .withColumn("sma_20",        F.avg("close").over(window_20)) \
        .withColumn("avg_volume_20", F.avg("volume").over(window_20))

    # ── Bollinger Bands ──────────────────────────────────────
    # std dev of close over 20 days, bands at ±2σ
    df = df \
        .withColumn("std_20",      F.stddev("close").over(window_20)) \
        .withColumn("bb_upper",    F.col("sma_20") + (F.col("std_20") * 2)) \
        .withColumn("bb_lower",    F.col("sma_20") - (F.col("std_20") * 2)) \
        .withColumn("bb_width",    (F.col("bb_upper") - F.col("bb_lower")) / F.col("sma_20")) \
        .withColumn("bb_signal",
            F.when(F.col("close") > F.col("bb_upper"), "overbought")
             .when(F.col("close") < F.col("bb_lower"), "oversold")
             .otherwise("neutral")
        )

    # ── RSI (14) ─────────────────────────────────────────────
    # Step 1: daily price change
    df = df.withColumn("price_change",
        F.col("close") - F.lag("close", 1).over(window_ordered)
    )

    # Step 2: separate gains and losses
    df = df \
        .withColumn("gain", F.when(F.col("price_change") > 0, F.col("price_change")).otherwise(0.0)) \
        .withColumn("loss", F.when(F.col("price_change") < 0, F.abs("price_change")).otherwise(0.0))

    # Step 3: 14-period rolling average gain/loss
    window_14 = (
        Window
        .partitionBy("symbol")
        .orderBy("date")
        .rowsBetween(-13, 0)
    )

    df = df \
        .withColumn("avg_gain", F.avg("gain").over(window_14)) \
        .withColumn("avg_loss", F.avg("loss").over(window_14))

    # Step 4: RSI = 100 - (100 / (1 + RS))
    df = df.withColumn("rsi_14",
        F.when(F.col("avg_loss") == 0, 100.0)
         .otherwise(
             100 - (100 / (1 + (F.col("avg_gain") / F.col("avg_loss"))))
         )
    )

    # RSI signal zones
    df = df.withColumn("rsi_signal",
        F.when(F.col("rsi_14") >= 70, "overbought")
         .when(F.col("rsi_14") <= 30, "oversold")
         .otherwise("neutral")
    )

    # ── Existing features ────────────────────────────────────
    df = df \
        .withColumn("volume_spike", F.col("volume") > F.col("avg_volume_20") * 2) \
        .withColumn("prev_close",   F.lag("close", 1).over(window_ordered)) \
        .withColumn("price_gap_pct",
            (F.col("open") - F.col("prev_close")) / F.col("prev_close") * 100
        ) \
        .withColumn("gap_flag", F.abs("price_gap_pct") > 1.5)

    # Drop intermediate columns — keep output clean
    df = df.drop("price_change", "gain", "loss", "avg_gain", "avg_loss",
                 "std_20", "prev_close")

    return df

def run():
    spark = create_session()

    csv_files = glob_module.glob(f"{RAW_DIR}/*.csv")
    print(f"Found {len(csv_files)} CSV files: {csv_files}")

    df = (
        spark.read
        .option("header", "true")
        .option("inferSchema", "true")
        .csv(csv_files)
    )

    df = df.withColumn("date", F.to_date("date"))
    featured_df = compute_features(df)

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    pandas_df = featured_df.toPandas()

    for symbol, group in pandas_df.groupby("symbol"):
        out_path = os.path.join(OUTPUT_DIR, f"{symbol}_features.parquet")
        table = pa.Table.from_pandas(group.reset_index(drop=True))
        pq.write_table(table, out_path)
        print(f"✓ Wrote {len(group)} rows → {out_path}")

    spikes = pandas_df[pandas_df["volume_spike"] == True][
        ["symbol", "date", "volume", "avg_volume_20", "price_gap_pct"]
    ].sort_values("date", ascending=False)

    print(f"\n--- Volume Spikes Detected: {len(spikes)} ---")
    print(spikes.to_string(index=False))

    spark.stop()
    
if __name__ == "__main__":
    run()