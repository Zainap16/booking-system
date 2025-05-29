// server.js

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
require("dotenv").config();

const Booking = require("./models/Booking");

// ✅ Allowed email list (case-insensitive, stored in lowercase)
// const= [
//   "matthew.cupido@ardaghgroup.com",
//   "zainap.van-blerck@ardaghgroup.com"
// ];


// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// ✅ Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// ✅ Constants
const MAX_SEATS = 42;
const ROOMS = [
  "F52", "F53", "F54", "F55", "F56", "F57", "F58", "F59", "F60", "F61", "F62", "F63",
  "G64", "G65", "G66", "G67", "G68", "G69", "G70", "G71", "G72", "G73", "G74", "G75", "G76", "G77", "G78",
  "H79", "H80", "H81", "H82", "H83", "H84", "H85","H86", "H87", "H88", "H89", "H90", "H91", "H92", "H93"
];

// ✅ Email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ✅ Booking endpoint
app.post("/book", async (req, res) => {
   let { email, name, date, room } = req.body;

  if (!email || !name || !date || !room) {
    return res.status(400).send("Missing required fields.");
  }

// Normalize email to lowercase for comparison
email = email.trim().toLowerCase();

// Only allow emails with domain '@ardaghgroup.com'
if (!email.endsWith("@ardaghgroup.com")) {
  return res.status(403).send("Only @ardaghgroup.com email addresses are allowed to make bookings.");
}


  // if (!email.endsWith("@ardaghgroup.com")) {
  //   return res.status(400).send("Only ardaghgroup email addresses are allowed.");
  // }
  const bookingDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  bookingDate.setHours(0, 0, 0, 0);
  
  // ❌ Reject if booking is for weekend
  const dayOfWeek = bookingDate.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return res.status(400).send("Bookings are not allowed on weekends.");
  }

  if (bookingDate <= today) {
    return res.status(400).send("You can only book a day in advance.");
  }

  try {
    const existingBooking = await Booking.findOne({ date, room });
    if (existingBooking) {
      return res.status(400).send(`Seat ${room} is already booked for ${date}. Refresh the webpage.`);
    }

    const userHasBookingOnDate = await Booking.findOne({ email, date });
    if (userHasBookingOnDate) {
      return res.status(400).send("You have already booked a seat for this date.");
    }

    const bookingsOnDate = await Booking.countDocuments({ date });
    if (bookingsOnDate >= MAX_SEATS) {
      return res.status(400).send("No more seats available for this day.");
    }

    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    const end = new Date(start);
    end.setDate(end.getDate() + 6);

    const userWeekBookings = await Booking.find({
      email,
      date: {
        $gte: start.toISOString().split("T")[0],
        $lte: end.toISOString().split("T")[0]
      }
    });

    if (userWeekBookings.length >= 3) {
      return res.status(400).send("You have already booked 3 days this week.");
    }

    const newBooking = new Booking({ email: email.toLowerCase(), name, date, room });
    await newBooking.save();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Booking Confirmed",
      text: `Hello ${name},\n\nYour seat (${room}) has been booked for ${date}.\n\nBest regards,\nOffice Admin`
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Email failed", err);
      } else {
        console.log("Email sent", info.response);
      }
    });

    res.status(200).send("Booking successful.");
  } catch (error) {
    console.error("Error during booking:", error);
    //ic hanged this from interal server error
    res.status(500).send("This seat has already been booked. Refresh this page. error.");
  }
});

// ✅ Availability endpoint
app.get("/availability/:date", async (req, res) => {
  try {
    const date = req.params.date;
    const count = await Booking.countDocuments({ date });
    res.json({ seatsLeft: MAX_SEATS - count });
  } catch (error) {
    console.error("Error fetching availability:", error);
    res.status(500).send("Internal server error.");
  }
});

// ✅ Available rooms endpoint
app.get("/available-rooms/:date", async (req, res) => {
  const { date } = req.params;

  try {
    const bookings = await Booking.find({ date });
    const bookedRooms = bookings.map(b => b.room);
    const availableRooms = ROOMS.filter(room => !bookedRooms.includes(room));

    res.json({ availableRooms });
  } catch (error) {
    console.error("Error fetching available seats:", error);
    res.status(500).send("Internal server error");
  }
});

/// ✅ Cancel booking endpoint
app.delete("/cancel", async (req, res) => {
  const { email, date, room } = req.body;

  if (!email || !date || !room) {
    return res.status(400).send("Missing email, date, or seat");
  }

  try {
    const bookingDate = new Date(date);
    bookingDate.setHours(0, 0, 0, 0);
    const now = new Date();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (bookingDate.getTime() === today.getTime()) {
      return res.status(400).send("Cancellation not allowed on the booking day.");
    }

    if (bookingDate.getTime() === tomorrow.getTime()) {
      const noonToday = new Date(today);
      noonToday.setHours(22, 0, 0, 0);
      if (now >= noonToday) {
        return res.status(400).send("Cancellation not allowed after 10 PM the day before the booking.");
      }
    }

    if (bookingDate < today) {
      return res.status(400).send("Cannot cancel a booking in the past.");
    }

    const result = await Booking.findOneAndDelete({
      email: email.toLowerCase(),
      date,
      room: room.toUpperCase()
    });

    if (!result) {
      return res.status(404).send("Booking not found");
    }

    // ✅ Send cancellation email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Booking Cancelled",
      text: `Hello,\n\nYour booking for seat ${room.toUpperCase()} on ${date} has been successfully cancelled.\n\nBest regards,\nOffice Admin`
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Cancellation email failed:", err);
      } else {
        console.log("Cancellation email sent:", info.response);
      }
    });

    res.status(200).send("Booking cancelled successfully");
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).send("Internal server error");
  }
});


// ✅ Get booked rooms for user & date
app.get("/booked-rooms", async (req, res) => {
  const { email, date } = req.query;

  if (!email || !date) {
    return res.status(400).send("Missing email or date");
  }

  try {
    const bookings = await Booking.find({ email: email.toLowerCase(), date });
    const bookedRooms = bookings.map(b => b.room);
    res.json({ bookedRooms });
  } catch (err) {
    console.error("Error fetching booked seats:", err);
    res.status(500).send("Internal server error");
  }
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at port ${PORT}`);
});
