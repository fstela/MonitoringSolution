const amq = require("amqplib");

class QueueService {
    
    static #QUEUE_NAME_PROC = "processing";
    static #QUEUE_NAME_PORC_RESPONSE = "processing_response";

    /**
     * @type {amq.Channel}
     */
    #channel;

    /**
     * @type {string}
     */
    #queue;

    /**
     * 
     * @param {amq.Channel} channel 
     * @param {string} queue 
     */
    constructor(channel, queue) {
        this.#channel = channel;
        this.#queue = queue;
    }

    static async #makeChannel (queueName) {

        const connection = await amq.connect("amqp://user:123456@localhost:5672/localhost");
        const channel = await connection.createChannel();
        await channel.assertQueue(queueName, {durable: true});
        return new QueueService(channel, queueName);
    }

    static async makeReceiveQueue() {
       return await this.#makeChannel(this.#QUEUE_NAME_PORC_RESPONSE);
    }

    static async makeSendQueue(data) {
        return await this.#makeChannel(this.#QUEUE_NAME_PROC);
    }

    /**
     * 
     * @param {function(amq.ConsumeMessage,amq.Channel):void} onMessage 
     */
    receive(onMessage) {
        this.#channel.consume(this.#queue, (msg) => onMessage(msg, this.#channel), {
            noAck: false
        });
    }

    send(data) {
        this.#channel.sendToQueue(this.#queue, Buffer.from(JSON.stringify(data)), {headers: {"x-delay": 3000}})
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