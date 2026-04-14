from airflow import DAG # type: ignore
from airflow.operators.bash import BashOperator # type: ignore
from datetime import datetime, timedelta

default_args = {
    "owner":        "vinny",
    "retries":      1,
    "retry_delay":  timedelta(minutes=5),
    "start_date":   datetime(2026, 1, 1),
}

with DAG(
    dag_id="stock_pipeline",
    default_args=default_args,
    description="Daily OHLCV ingestion → Spark features → DuckDB",
    schedule_interval="0 17 * * 1-5",  # 5pm weekdays
    catchup=False,
    tags=["stocks", "pipeline"],
) as dag:

    ingest = BashOperator(
        task_id="ingest",
        bash_command="cd /opt/airflow && python -m ingestion.ingest",
    )

    spark = BashOperator(
        task_id="spark_features",
        bash_command="cd /opt/airflow && python -m processing.spark_jobs",
    )

    load = BashOperator(
        task_id="duckdb_load",
        bash_command="cd /opt/airflow && python -m storage.duckdb_load",
    )

    ingest >> spark >> load