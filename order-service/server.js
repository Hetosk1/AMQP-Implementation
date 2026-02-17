const express = require("express");
const mongoose = require("mongoose");
const amqp = require("amqplib");
const crypto = require("crypto")

const Order = require("./models/Order");


const app = express();
app.use(express.json());

async function start(){

    await mongoose.connect("mongodb://mongodb:27017/orders");
    
    const connection = await amqp.connect("amqp://rabbitmq");
    const channel = await connection.createChannel();
    await channel.assertQueue("order.created");

    app.post('/orders', async (_request, _response) => {
        const {productId, quantity} = _request.body;
        const orderId = crypto.randomUUID();
        
        const order = await Order.create({
            orderId,
            productId,
            quantity,
            status: "PENDING"
        });

        channel.sendToQueue(
            "order.created",
            Buffer.from(JSON.stringify(order))
        );

        _response.json({
            message: "Order placed",
            orderId 
        });
    });
    
    app.listen(3000, () => {
        console.log("Listening at port 3000");
    });

}

start();
