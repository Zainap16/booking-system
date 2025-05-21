const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  name: String,
  email: String,
  date: String
});

module.exports = mongoose.model("Booking", bookingSchema);
