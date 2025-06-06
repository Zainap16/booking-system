const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  name: String,
  email: String,
  date: String,
  room: String         // e.g. "D40"
});

//emails allowed to book on system

// module.exports = allowedEmails;

bookingSchema.index({ date: 1, room: 1 }, { unique: true }); // Prevent double-booking same room on same date

module.exports = mongoose.model("Booking", bookingSchema);
