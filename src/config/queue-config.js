const amqlib = require("amqplib");
let channel, connection;
async function connectRabbitMQ() {
  try {
    connection = await amqlib.connect("amqp://localhost");

    channel = await connection.createChannel();
    await channel.assertQueue("noti-queue");
    console.log("RabbitMQ connected");
  } catch (error) {
    console.log(error);
  }
}

async function sendData(data) {
  try {
    if (channel) {
      console.log("Channel not found, reconnecting...");
      await connectRabbitMQ();
    }
    await channel.sendToQueue("noti-queue", Buffer.from(JSON.stringify(data)));
    console.log("Message sent:", data);
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  connectRabbitMQ,
  sendData,
};
