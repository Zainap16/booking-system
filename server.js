const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
require("dotenv").config();

const Booking = require("./models/Booking");

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// ✅ Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// ✅ Constants
const MAX_SEATS = 44;

// ✅ Email setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ✅ Booking endpoint
app.post("/book", async (req, res) => {
  const { email, name, date } = req.body;
  const bookingDate = new Date(date);
  const today = new Date();

  today.setHours(0, 0, 0, 0);
  bookingDate.setHours(0, 0, 0, 0);

  if (bookingDate <= today) {
    return res.status(400).send("You can only book a day in advance.");
  }

  try {
    const bookingsOnDate = await Booking.countDocuments({ date });

    if (bookingsOnDate >= MAX_SEATS) {
      return res.status(400).send("No more seats available for this day.");
    }

    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay()); // Sunday
    const end = new Date(start);
    end.setDate(end.getDate() + 6); // Saturday

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

    const newBooking = new Booking({ email, name, date });
    await newBooking.save();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Booking Confirmed",
      text: `Hello ${name},\n\nYour seat has been booked for ${date}.\n\nBest regards,\nOffice Admin`
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
    res.status(500).send("Internal server error.");
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

// ✅ Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`);
});
