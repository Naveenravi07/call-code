const amqp = require('amqplib');

const server_uri = "amqp://guest:guest@localhost:5672"
const queueName = 'nova-orchestrator';

async function publishMessage() {

    let msg = {
        id: "123",
        playground_name: "playground_2",
        service_name: "vite-base",
    }

    try {
        const connection = await amqp.connect(server_uri);
        const channel = await connection.createChannel();

        await channel.assertQueue(queueName, {
            durable: false
        });

        channel.sendToQueue(queueName, Buffer.from(JSON.stringify(msg)));

        setTimeout(() => {
            connection.close();
            process.exit(0);
        }, 1000);

    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

publishMessage();
