const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    orderId: String,
    productId: String,
    quantity: Number,
    status: String
});

module.exports = mongoose.model("Order", orderSchema);