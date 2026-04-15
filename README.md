# Stock Market Event Pipeline

An end-to-end big data pipeline that ingests daily stock market data, streams events through Apache Kafka, processes them with PySpark, stores them in a DuckDB analytical warehouse, and visualizes technical indicators on a React dashboard.

---

## Architecture Overview

```
Alpha Vantage API
      │
      ▼
 [Ingestion]  ──►  Apache Kafka  ──►  [PySpark Processing]  ──►  Parquet Files
                                                                        │
                                                                        ▼
                                                                [DuckDB Warehouse]
                                                                        │
                                                                        ▼
                                                              [React + Recharts Dashboard]
```

---

## Project Structure

```
Stock_Pipeline/
├── api/               # Alpha Vantage API client
├── config/            # Pipeline configuration (tickers, intervals, etc.)
├── dags/              # Apache Airflow DAGs for scheduling
├── ingestion/         # Kafka producer — fetches and streams market data
├── processing/        # PySpark batch processing and indicator computation
├── storage/           # DuckDB warehouse loader and Parquet management
├── dashboard/         # React + Recharts frontend
├── run_pipeline.py    # Entry point to run the full pipeline
├── docker-compose.yml # Kafka + Zookeeper services
├── Dockerfile
└── requirements.txt
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Data Source | Alpha Vantage API |
| Streaming | Apache Kafka |
| Processing | PySpark + PyArrow |
| Storage | DuckDB + Parquet |
| Orchestration | Apache Airflow |
| Dashboard | React + Recharts |
| Containerization | Docker |

---

## Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+
- Docker & Docker Compose
- Alpha Vantage API key (free at [alphavantage.co](https://www.alphavantage.co))

### 1. Clone the repo

```bash
git clone https://github.com/VinnyPham/Stock_Pipeline.git
cd Stock_Pipeline
```

### 2. Install Python dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure your API key and tickers

Edit `config/` with your Alpha Vantage API key and the tickers you want to track (e.g. AAPL, TSLA, NVDA).

### 4. Start Kafka with Docker

```bash
docker-compose up -d
```

### 5. Run the pipeline

```bash
python run_pipeline.py
python -m api.server
```

### 6. Start the dashboard

```bash
cd dashboard
npm install
npm start
```

---

## Features

- **Daily ingestion** of OHLCV data for 20+ stock tickers via Alpha Vantage
- **Kafka streaming** for decoupled, event-driven data flow between pipeline stages
- **PySpark batch processing** to compute technical indicators (RSI, Bollinger Bands)
- **Parquet storage** partitioned by ticker for efficient reads
- **DuckDB analytical warehouse** for fast OLAP queries on time-series data
- **Airflow DAGs** for automated daily scheduling
- **React dashboard** with Recharts to visualize indicators interactively

---

## Technical Indicators

| Indicator | Description |
|---|---|
| RSI | Relative Strength Index — momentum oscillator (0–100) |
| Bollinger Bands | Volatility bands around a moving average |

---

## Screenshots
<img width="1918" height="906" alt="stock pipeline demo" src="https://github.com/user-attachments/assets/4f59ed7f-3e3d-448d-9de9-75c93b735cf2" />
<img width="1352" height="523" alt="stock pipeline demo 2" src="https://github.com/user-attachments/assets/e90244bb-2ac4-44ad-a5b3-c429df734ad3" />


