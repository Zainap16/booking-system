const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
require("dotenv").config();

const Booking = require("./models/Booking");

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB connection error:", err));
  
// ✅ Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// ✅ Constants
const MAX_SEATS = 43;

// ✅ Email setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
/* 
whitlist valid emails
// Example whitelist (load from DB or env in real app)
const allowedEmployees = [
  "alice@ardaghgroup.com",
  "bob@ardaghgroup.com",
  "carol@ardaghgroup.com"
];

// Inside your booking POST endpoint, after you get `email` from req.body:
if (!allowedEmployees.includes(email.toLowerCase())) {
  return res.status(403).send("Booking allowed only for Ardagh Group employees.");
}

*/
// ✅ Booking endpoint
app.post("/book", async (req, res) => {
  const { email, name, date, room } = req.body;

  //only Ardaghgroup.com emails
 if (!email.toLowerCase().endsWith("@ardaghgroup.com")) {
  return res.status(400).send("Only @ardaghgroup.com email addresses are allowed.");
}

  const bookingDate = new Date(date);
  const today = new Date();

  today.setHours(0, 0, 0, 0);
  bookingDate.setHours(0, 0, 0, 0);



  if (bookingDate <= today) {
    return res.status(400).send("You can only book a day in advance.");
  }

  try {
    // 1. Ensure room isn't already booked on that date
    const existingBooking = await Booking.findOne({ date, room });
    if (existingBooking) {
      return res.status(400).send(`Room ${room} is already booked for ${date}.`);
    }

// 🚫 NEW: Prevent same user from booking multiple rooms on the same day
const userHasBookingOnDate = await Booking.findOne({ email, date });
if (userHasBookingOnDate) {
  return res.status(400).send("You have already booked a seat for this date.");
}

    // 2. Limit total bookings per day
    const bookingsOnDate = await Booking.countDocuments({ date });
    if (bookingsOnDate >= MAX_SEATS) {
      return res.status(400).send("No more seats available for this day.");
    }

    // 3. Weekly booking limit (max 3 per week)
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

    // 4. Save booking
    const newBooking = new Booking({ email, name, date, room });
    await newBooking.save();

    // 5. Send confirmation email
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

//Return Available Rooms
app.get("/available-rooms/:date", async (req, res) => {
  const allRooms = [
    "D40", "D41", "D42", "D46",
    "F52", "F53", "F54", "F55", "F56", "F57", "F58", "F59", "F60", "F61", "F62", "F63",
    "G64", "G65", "G66", "G67", "G68", "G69", "G70", "G71", "G72", "G73", "G74", "G75", "G76", "G77", "G78",
    "H79", "H80", "H81", "H82", "H83", "H84", "H85", "H87", "H88", "H89", "H90", "H91", "H92", "H93"
  ];

  const date = req.params.date;

  try {
    const bookings = await Booking.find({ date });
    const bookedRooms = bookings.map(b => b.room);

    const availableRooms = allRooms.filter(room => !bookedRooms.includes(room));

    res.json({ availableRooms });
  } catch (error) {
    console.error("Error fetching available rooms:", error);
    res.status(500).send("Internal server error");
  }
});


// ✅ Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`);
});
