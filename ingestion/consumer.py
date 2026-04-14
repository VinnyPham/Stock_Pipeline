import json
from kafka import KafkaConsumer

TOPIC = "ohlcv-raw"

consumer = KafkaConsumer(
    TOPIC,
    bootstrap_servers="localhost:9092",
    auto_offset_reset="earliest",
    value_deserializer=lambda v: json.loads(v.decode("utf-8")),
)

print(f"Listening on topic '{TOPIC}'...\n")

for message in consumer:
    data = message.value
    print(f"[{data['symbol']}] {data['date']} | close={data['close']} vol={data['volume']:.0f}")