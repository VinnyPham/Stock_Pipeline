FROM apache/airflow:2.8.1

USER root
RUN apt-get update -yqq && \
    apt-get install -y --no-install-recommends openjdk-17-jdk-headless && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV PATH="${JAVA_HOME}/bin:${PATH}"

USER airflow
RUN pip install --no-cache-dir \
    'duckdb==0.10.3' \
    pyspark \
    pandas \
    pyarrow \
    requests \
    python-dotenv \
    apache-airflow-providers-apache-spark