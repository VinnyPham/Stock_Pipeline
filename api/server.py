from flask import Flask, jsonify
from flask_cors import CORS
import duckdb
import pandas as pd

app = Flask(__name__)
CORS(app)

DB_PATH = "warehouse.db"

def query(sql):
    con = duckdb.connect(DB_PATH, read_only=True)
    result = con.execute(sql).df()
    con.close()
    return result


def jsonify_df(df):
    records = df.astype(object).where(pd.notnull(df), None).to_dict(orient="records")
    return jsonify(records)


@app.after_request
def no_cache_headers(response):
    response.headers["Cache-Control"] = "no-store, max-age=0, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response


@app.route("/api/spikes")
def spikes():
    df = query("""
        SELECT symbol, CAST(date AS VARCHAR) as date,
               volume, avg_volume_20,
               ROUND(price_gap_pct, 2) as gap_pct
        FROM stock_features
        WHERE volume_spike = true
        ORDER BY date DESC
    """)
    return jsonify_df(df)

@app.route("/api/ohlcv/<symbol>")
def ohlcv(symbol):
    df = query(f"""
        SELECT CAST(date AS VARCHAR) as date,
               open, high, low, close, volume,
               ROUND(sma_20, 2) as sma_20
        FROM stock_features
        WHERE symbol = '{symbol.upper()}'
        ORDER BY date ASC
    """)
    return jsonify_df(df)

@app.route("/api/summary")
def summary():
    df = query("""
        SELECT symbol,
               CAST(MAX(date) AS VARCHAR) as latest_date,
               ROUND(LAST(close ORDER BY date), 2) as last_close,
               ROUND(LAST(sma_20 ORDER BY date), 2) as sma_20,
               ROUND((LAST(close ORDER BY date) - LAST(sma_20 ORDER BY date))
                     / LAST(sma_20 ORDER BY date) * 100, 2) as pct_above_sma
        FROM stock_features
        GROUP BY symbol
        ORDER BY symbol
    """)
    return jsonify_df(df)

@app.route("/api/indicators/<symbol>")
def indicators(symbol):
    df = query(f"""
        SELECT
            CAST(date AS VARCHAR)     AS date,
            ROUND(close, 2)           AS close,
            ROUND(sma_20, 2)          AS sma_20,
            ROUND(bb_upper, 2)        AS bb_upper,
            ROUND(bb_lower, 2)        AS bb_lower,
            ROUND(rsi_14, 2)          AS rsi_14,
            rsi_signal,
            bb_signal,
            open, high, low,
            volume
        FROM stock_features
        WHERE symbol = '{symbol.upper()}'
        ORDER BY date ASC
    """)
    return jsonify_df(df)

@app.route("/api/signals")
def signals():
    df = query("""
        SELECT
            symbol,
            CAST(date AS VARCHAR)   AS date,
            ROUND(close, 2)         AS close,
            ROUND(rsi_14, 2)        AS rsi_14,
            rsi_signal,
            bb_signal,
            ROUND(bb_upper, 2)      AS bb_upper,
            ROUND(bb_lower, 2)      AS bb_lower
        FROM stock_features
        WHERE rsi_signal != 'neutral'
           OR bb_signal  != 'neutral'
        ORDER BY date DESC
        LIMIT 50
    """)
    return jsonify_df(df)

if __name__ == "__main__":
    app.run(debug=True, port=5000)