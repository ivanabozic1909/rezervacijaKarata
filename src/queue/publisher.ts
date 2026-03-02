import amqp from "amqplib";

const RABBIT_URL = process.env.RABBITMQ_URL || "amqp://rabbitmq";

// Postojeća funkcija za nove rezervacije
export async function publishReservation(data: any) {
  const connection = await amqp.connect(RABBIT_URL);
  const channel = await connection.createChannel();
  const QUEUE_NAME = "rezervacije";

  await channel.assertQueue(QUEUE_NAME, { durable: true });
  channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(data)), { persistent: true });

  await channel.close();
  await connection.close();
}

// NOVO: Funkcija za ostale događaje (Otkazivanje, Izmena)
export async function publishEvent(queueName: string, data: any) {
  try {
    const connection = await amqp.connect(RABBIT_URL);
    const channel = await connection.createChannel();

    await channel.assertQueue(queueName, { durable: true });
    
    channel.sendToQueue(
      queueName,
      Buffer.from(JSON.stringify(data)),
      { persistent: true }
    );

    await channel.close();
    await connection.close();
  } catch (error) {
    console.error("Greška pri slanju na RabbitMQ:", error);
  }
}