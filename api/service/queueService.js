const amq = require("amqplib");

class QueueService {
    
    static #QUEUE_NAME_RECEIVE = "receiving";
    static #QUEUE_NAME_SENDING = "sending";

    #channel;

    constructor(channel) {
        this.#channel = channel;
    }

    static async #makeChannel (queueName) {

        const connection = await amq.connect("amqp://user:123456@localhost:5672/localhost");
        const channel = await connection.createChannel();
        await channel.assertQueue(queueName, {durable: false});
        return new QueueService(channel);
    }

    static async makeReceiveQueue() {
       return await this.#makeChannel(this.#QUEUE_NAME_RECEIVE);
    }

    static async makeSendQueue(data) {
        return await this.#makeChannel("sending");
    }

    receive(onMessage) {
        this.#channel.consume(QueueService.#QUEUE_NAME_RECEIVE, onMessage);
    }

    send(data) {
        this.#channel.sendToQueue(QueueService.#QUEUE_NAME_SENDING, Buffer.from(JSON.stringify(data)))
    }
}

module.exports =  QueueService;