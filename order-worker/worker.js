const amqp = require("amqplib");
const mongoose = require("mongoose");
const redis = require("redis");
const Order = require("./models/Order");

async function connectMongo() {
  while (true) {
    try {
      await mongoose.connect("mongodb://mongodb:27017/orders");
      console.log("MongoDB connected");
      break;
    } catch (err) {
      console.log("MongoDB not ready, retrying...");
      await new Promise(res => setTimeout(res, 3000));
    }
  }
}

async function connectRabbitMQ() {
  while (true) {
    try {
      const connection = await amqp.connect("amqp://rabbitmq");
      const channel = await connection.createChannel();
      await channel.assertQueue("order.created");
      console.log("Connected to RabbitMQ");
      return channel;
    } catch (err) {
      console.log("RabbitMQ not ready, retrying...");
      await new Promise(res => setTimeout(res, 3000));
    }
  }
}

async function startWorker() {
  await connectMongo();

  const redisClient = redis.createClient({
    url: "redis://redis:6379"
  });

  await redisClient.connect();
  console.log("Redis connected");

  const channel = await connectRabbitMQ();

  channel.consume("order.created", async (msg) => {
    if (!msg) return;

    try {
      const content = msg.content.toString(); // FIXED HERE
      const order = JSON.parse(content);

      const stock = await redisClient.get(
        `inventory:${order.productId}`
      );

      if (stock && parseInt(stock) >= order.quantity) {
        await redisClient.decrBy(
          `inventory:${order.productId}`,
          order.quantity
        );

        await Order.updateOne(
          { orderId: order.orderId },
          { status: "COMPLETED" }
        );

        console.log(`Order ${order.orderId} COMPLETED`);
      } else {
        await Order.updateOne(
          { orderId: order.orderId },
          { status: "FAILED" }
        );

        console.log(`Order ${order.orderId} FAILED`);
      }

      channel.ack(msg);

    } catch (err) {
      console.error("Worker processing error:", err);
      channel.ack(msg); // prevent infinite crash loop
    }
  });

  console.log("Worker listening for orders...");
}

startWorker();
