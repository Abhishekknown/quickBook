import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  service: String,
  timeSlot: String,
  orderId: String,
  paymentStatus: { type: String, default: "pending" },
});

export default mongoose.model("Booking", bookingSchema);
