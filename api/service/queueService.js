const amq = require("amqplib");

class QueueService {
    
    static #QUEUE_NAME_PROC = "processing";
    static #QUEUE_NAME_PORC_RESPONSE = "processing_response";

    #channel;
    #queue;

    constructor(channel, queue) {
        this.#channel = channel;
        this.#queue = queue;
    }

    static async #makeChannel (queueName) {

        const connection = await amq.connect("amqp://user:123456@localhost:5672/localhost");
        const channel = await connection.createChannel();
        await channel.assertQueue(queueName, {durable: false});
        return new QueueService(channel, queueName);
    }

    static async makeReceiveQueue() {
       return await this.#makeChannel(this.#QUEUE_NAME_PORC_RESPONSE);
    }

    static async makeSendQueue(data) {
        return await this.#makeChannel(this.#QUEUE_NAME_PROC);
    }

    receive(onMessage) {
        this.#channel.consume(this.#queue, onMessage);
    }

    send(data) {
        this.#channel.sendToQueue(this.#queue, Buffer.from(JSON.stringify(data)))
    }
}

class ProcessingQueue {
    static #instance;
    
    async init() {
        ProcessingQueue.#instance = await QueueService.makeSendQueue();
    }

    getInstance = async () => {
        if(!ProcessingQueue.#instance) {
            await this.init();
            return ProcessingQueue.#instance;
        }
        return ProcessingQueue.#instance;
    }
}

module.exports =  {QueueService,  ProcessingQueue};