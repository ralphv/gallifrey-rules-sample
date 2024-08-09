// sample script to produce a message into kafka

import {Kafka} from 'kafkajs';
import {NewOrdersMessageType} from "../modules/providers/NewOrdersDispatcher";

// the sample message that will be produced
const message: NewOrdersMessageType = {
    customerID: "10-0-11-00:02",
    orderID: "13",
    orderItems: [{
        orderItemID: "456",
        orderItemName: "Children of Earth",
        qty: 1,
        price: 12.43,
    }, {
        orderItemID: "42",
        orderItemName: "Type 40 TT Capsule",
        qty: 500,
        price: 26,
    }]
};

void (async () => {
    if (!process.env.GR_KAFKA_BROKERS) {
        console.error(`Missing GR_KAFKA_BROKERS env variable`);
        process.exit(1);
    }

    const kafka = new Kafka({
        clientId: 'produce-client-id',
        brokers: process.env.GR_KAFKA_BROKERS.split(','),
    });

    const producer = kafka.producer();
    console.log(`Connecting to kafka`);
    await producer.connect();
    console.log(`Connected to kafka`);

    console.log(`Producing message`);
    await producer.send({
        topic: 'new-orders',
        messages: [{
            value: JSON.stringify(message)
        }],
    });

    console.log(`Done, disconnecting`);
    await producer.disconnect();
    console.log(`Disconnected`);
})();
