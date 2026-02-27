import amqp from "amqplib";

const QUEUE_NAME = "rezervacije";
const RABBIT_URL = process.env.RABBITMQ_URL || "amqp://rabbitmq";

export async function publishReservation(data: any) {
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
}