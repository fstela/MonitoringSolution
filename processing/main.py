import json
import pika
from processor import DataProcessor
from storage import Storage

storage = Storage(url="localhost:9060", access_key="mmmm12345", secret_key="xxxx12345", bucket_name="monitoring")
processor = DataProcessor(storage)
QUEUE_NAME_PROCESSING = "processing"
QUEUE_NAME_PROCESSING_RESPONSE = "processing_response"

if __name__ == '__main__':
    conn = pika.BlockingConnection(pika.URLParameters('amqp://user:123456@localhost:5672/localhost'))
    ch_data = conn.channel()

    ch_response = conn.channel()
    ch_response_exchange = QUEUE_NAME_PROCESSING_RESPONSE + "_exchange"
    ch_response.exchange_declare(ch_response_exchange, auto_delete=True)
    ch_response.queue_bind(queue=QUEUE_NAME_PROCESSING_RESPONSE, exchange=ch_response_exchange)


    def on_message(channel, method, properties, body):
        print("Received message {}", body)
        # ch.basic_ack(message.delivery_tag)
        # try:
        response = processor.process_message(body)
        ch_response.basic_publish(body=json.dumps(response), routing_key="", exchange=ch_response_exchange)
        # except:
        #     print("Failed to process the received message {}", message.delivery_tag)


    ch_data.basic_consume(queue=QUEUE_NAME_PROCESSING, on_message_callback=on_message, auto_ack=True)
    ch_data.start_consuming()
