const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  name: String,
  email: String,
  date: String,
  room: String         // e.g. "D40"
});

//emails allowed to book on system
// allowlist.js (optional if you want to keep it in a separate file)
const allowedEmails = [
  "matthew.cupido@ardaghgroup.com",
  "zainap.van-blerck@ardaghgroup.com"
];

module.exports = allowedEmails;

bookingSchema.index({ date: 1, room: 1 }, { unique: true }); // Prevent double-booking same room on same date

module.exports = mongoose.model("Booking", bookingSchema);
