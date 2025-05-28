const BASE_URL = "https://booking-system-yeb8.onrender.com";
// const BASE_URL = "http://localhost:3000"; - changed

const form = document.getElementById("bookingForm");
const dateInput = document.getElementById("date");
const seatsText = document.getElementById("seatsLeft");
const messageDiv = document.getElementById("message");

async function updateSeatsAndCheck() {
  const date = dateInput.value;
  const email = document.getElementById("email").value.trim();

  if (!date) {
    seatsText.innerText = "Seats left: 42";
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

  // Show loading overlay
  document.getElementById("loadingOverlay").style.display = "flex";

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const selectedDate = dateInput.value;
  // const room = dropdown.value.trim(); - changed
  const room = document.getElementById("room").value.trim();


  if (!selectedDate || !name || !email || !room) {
    document.getElementById("loadingOverlay").style.display = "none"; // Hide loading
    messageDiv.style.color = "red";
    messageDiv.textContent = "Please fill in all fields.";
    return;
  }

  try {
    const res = await fetch("https://booking-system-yeb8.onrender.com/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, date: selectedDate, room })
    });

    if (res.ok) {
      messageDiv.style.color = "green";
      messageDiv.textContent = "Booking successful! Confirmation email sent.";
      updateSeats();
      loadAvailableRooms(selectedDate);
      form.reset();
      dateInput.min = today.toISOString().split("T")[0];
//       const today = new Date();
// dateInput.min = today.toISOString().split("T")[0];

    } else {
      const errorText = await res.text();
      messageDiv.style.color = "red";
      messageDiv.textContent = "Error: " + errorText;
    }
  } catch (error) {
    messageDiv.style.color = "red";
    messageDiv.textContent = "Network error: " + error.message;
  } finally {
    // Hide loading overlay once the message updates
    document.getElementById("loadingOverlay").style.display = "none";
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

