const BASE_URL = "https://booking-system-yeb8.onrender.com";

async function updateSeatsAndCheck() {
  const date = dateInput.value;
  const email = document.getElementById("email").value.trim();

  if (!date) {
    seatsText.innerText = "";
    messageDiv.textContent = "";
    return;
  }

  // Get seats left
  const res = await fetch(`${BASE_URL}/availability/${date}`);
  const data = await res.json();
  seatsText.innerText = `Seats left: ${data.seatsLeft}`;

  // If email present, check if user already booked this date
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
}

// Update seats & booking status when date or email changes
dateInput.addEventListener("change", updateSeatsAndCheck);
document.getElementById("email").addEventListener("input", updateSeatsAndCheck);

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const date = dateInput.value;

  // Final check to prevent double booking before submitting
  const userBookingsRes = await fetch(`${BASE_URL}/bookings/${email}`);
  const bookings = await userBookingsRes.json();

  if (bookings.some(b => b.date === date)) {
    alert("You have already booked a seat on this day.");
    return;
  }

  const res = await fetch(`${BASE_URL}/book`, {
    method: "POST",
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ name, email, date })
  });

  if (res.ok) {
    alert("Booking successful! Check your email.");
    updateSeatsAndCheck();  // Refresh seats after successful booking
  } else {
    const error = await res.text();
    alert(`Error: ${error}`);
  }
});
