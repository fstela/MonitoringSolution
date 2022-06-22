import amqp
from processor import DataProcessor
from storage import Storage

storage = Storage("localhost", "mmmm12345", "xxxxxx")
processor = DataProcessor(storage)

if __name__ == '__main__':
    with amqp.Connection(host="localhost:5672", userid="user", password="123456", virtual_host="localhost") as conn:
        ch = conn.channel()


        def on_message(message):
            print("Received message {}", message.delivery_tag)
            ch.basic_ack(message.delivery_tag)
            try:
                response = processor.process_message(message.body)
                ch.basic_publish(amqp.Message(response), queue="receiving")
            except:
                print("Failed to process the received message {}", message.delivery_tag)


        ch.basic_consume(queue="sending", callback=on_message)
        while True:
            conn.drain_events()
