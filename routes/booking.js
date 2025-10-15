import express from "express";
import Razorpay from "razorpay";
import Booking from "../models/Booking.js";

const router = express.Router();

// 🔹 Create Razorpay Order
router.post("/create", async (req, res) => {
  try {
    const { name, email, phone, service, timeSlot, amount } = req.body;

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: amount * 100, // in paise
      currency: "INR",
      payment_capture: 1,
    });

    const newBooking = new Booking({
      name, email, phone, service, timeSlot, orderId: order.id,
    });

    await newBooking.save();

    res.json({
      orderId: order.id,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔹 Razorpay Webhook (payment confirmation)
router.post("/webhook", express.json(), async (req, res) => {
  try {
    const { event, payload } = req.body;
    if (event === "payment.captured") {
      const orderId = payload.payment.entity.order_id;
      await Booking.findOneAndUpdate(
        { orderId },
        { paymentStatus: "confirmed" }
      );
      console.log("✅ Payment confirmed for order:", orderId);
    }
    res.status(200).send("ok");
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).send("error");
  }
});

export default router;
