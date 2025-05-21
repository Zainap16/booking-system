const express = require("express");
const app = express(); // ✅ create the Express app
const fs = require("fs");
const bodyParser = require("body-parser");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config(); // ✅ Load environment variables early

// ✅ Middleware
app.use(cors());
app.use(bodyParser.json());

// ✅ Constants
const MAX_SEATS = 44;
const BOOKINGS_FILE = "./bookings.json";

// ✅ Email setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ✅ Read bookings from file
function getBookings() {
  if (!fs.existsSync(BOOKINGS_FILE)) return [];
  return JSON.parse(fs.readFileSync(BOOKINGS_FILE, "utf8"));
}

// ✅ Save a booking
function saveBooking(booking) {
  const all = getBookings();
  all.push(booking);
  fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(all, null, 2));
}

// ✅ Get this week's bookings for a user
function getWeekBookings(email, date) {
  const all = getBookings();
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay()); // Sunday
  const end = new Date(start);
  end.setDate(end.getDate() + 6); // Saturday

  return all.filter(b =>
    b.email === email &&
    new Date(b.date) >= start &&
    new Date(b.date) <= end
  );
}

// ✅ Booking endpoint
app.post("/book", (req, res) => {
  const { email, name, date } = req.body;
  const bookingDate = new Date(date);
  const today = new Date();

  today.setHours(0, 0, 0, 0);
  bookingDate.setHours(0, 0, 0, 0);

  if (bookingDate <= today) {
    return res.status(400).send("You can only book a day in advance.");
  }

  const all = getBookings();
  const alreadyBooked = all.filter(b => b.date === date).length;

  if (alreadyBooked >= MAX_SEATS) {
    return res.status(400).send("No more seats available for this day.");
  }

  const userBookings = getWeekBookings(email, date);
  if (userBookings.length >= 3) {
    return res.status(400).send("You have already booked 3 days this week.");
  }

  const booking = { email, name, date };
  saveBooking(booking);

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
});

// ✅ Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`);
});

// app.get("/", (req, res) => {
//   res.send("Booking server is up and running!");
// });

app.use(express.static("public"));

app.get("/availability/:date", (req, res) => {
  const date = req.params.date;
  const all = getBookings();
  const count = all.filter(b => b.date === date).length;
  res.json({ seatsLeft: MAX_SEATS - count });
});


