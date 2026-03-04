import amqp from "amqplib";

const RABBIT_URL = process.env.RABBITMQ_URL || "amqp://rabbitmq";
const QUEUE_NAME = "rezervacije";

export async function publishEvent(data: any) {
  try {
    const connection = await amqp.connect(RABBIT_URL);
    const channel = await connection.createChannel();

    await channel.assertQueue(QUEUE_NAME, { durable: true });

    channel.sendToQueue(
      QUEUE_NAME,
      Buffer.from(JSON.stringify(data)),
      { persistent: true }
    );

    await channel.close();
    await connection.close();

  } catch (error) {
    console.error("Greška pri slanju na RabbitMQ:", error);
  }
}