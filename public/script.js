// const BASE_URL = "https://booking-system-yeb8.onrender.com";
const BASE_URL = "http://localhost:3000";

const form = document.getElementById("bookingForm");
const dateInput = document.getElementById("date");
const seatsText = document.getElementById("seatsLeft");
const messageDiv = document.getElementById("message");

async function updateSeatsAndCheck() {
  const date = dateInput.value;
  const email = document.getElementById("email").value.trim();

  if (!date) {
    seatsText.innerText = "Seats left: 43";
    messageDiv.textContent = "";
    return;
  }

  try {
    // Get seats left
    const res = await fetch(`${BASE_URL}/availability/${date}`);
    const data = await res.json();
    seatsText.innerText = `Seats left: ${data.seatsLeft}`;

    // Check if this user already booked this date
    if (email) {
      const userBookingsRes = await fetch(`${BASE_URL}/bookings/${email}`);
      const bookings = await userBookingsRes.json();

      const alreadyBookedToday = bookings.some(b => b.date === date);

      if (alreadyBookedToday) {
        messageDiv.style.color = "red";
        messageDiv.textContent = "You have already booked a seat on this day.";
      } else {
        messageDiv.textContent = "";
      }
    } else {
      messageDiv.textContent = "";
    }
  } catch (err) {
    seatsText.innerText = "Seats left: Error";
    console.error("Error fetching availability or bookings:", err);
  }
}

// Update seats & message when date or email changes
dateInput.addEventListener("change", updateSeatsAndCheck);
document.getElementById("email").addEventListener("input", updateSeatsAndCheck);

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const date = dateInput.value;

  if (!name || !email || !date) {
    alert("Please fill in all fields.");
    return;
  }

  try {
    // Final check to prevent duplicate booking
    const userBookingsRes = await fetch(`${BASE_URL}/bookings/${email}`);
    const bookings = await userBookingsRes.json();

    if (bookings.some(b => b.date === date)) {
      alert("You have already booked a seat on this day.");
      return;
    }

    const res = await fetch(`${BASE_URL}/book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, date })
    });

    if (res.ok) {
      alert("Booking successful! Check your email.");
      form.reset();
      messageDiv.textContent = "";
      updateSeatsAndCheck(); // Refresh seat count
    } else {
      const error = await res.text();
      alert(`Error: ${error}`);
    }
  } catch (error) {
    console.error("Booking error:", error);
    alert("Network error. Please try again later.");
  }
});

//load aviavle rooms

async function loadAvailableRooms(date) {
  const response = await fetch(`/available-rooms/${date}`);
  const data = await response.json();
  
  const dropdown = document.getElementById("room");
  dropdown.innerHTML = ""; // clear previous options

  data.availableRooms.forEach(room => {
    const option = document.createElement("option");
    option.value = room;
    option.textContent = room;
    dropdown.appendChild(option);
  });
}

