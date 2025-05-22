// Load or initialize
let events = JSON.parse(localStorage.getItem("events")) || [
    { name: "Rock Concert", category: "Music", location: "NYC", date: "2025-06-01", availability: 30 },
    { name: "Movie Night", category: "Cinema", location: "LA", date: "2025-06-05", availability: 50 },
    { name: "Tech Conference", category: "Technology", location: "SF", date: "2025-06-10", availability: 20 },
  ];
  
  let bookings = JSON.parse(localStorage.getItem("bookings")) || [];
  
  const eventsContainer = document.getElementById("eventsContainer");
  const adminForm = document.getElementById("adminForm");
  const searchFilter = document.getElementById("searchFilter");
  const locationFilter = document.getElementById("locationFilter"); // New input for location
  const dateFilter = document.getElementById("dateFilter"); // New input for date
  const bookingLog = document.getElementById("bookingLog");
  const themeToggle = document.getElementById("themeToggle");
  
  const nameInput = document.getElementById("eventName");
  const categoryInput = document.getElementById("eventCategory");
  const locationInput = document.getElementById("eventLocation"); // New admin input for location
  const dateInput = document.getElementById("eventDate");         // New admin input for date
  const availabilityInput = document.getElementById("eventAvailability");
  const updateEventBtn = document.getElementById("updateEventBtn");
  
  let editingIndex = null;
  let bookingIndex = null; // For tracking booking modal
  
  function saveEvents() {
    localStorage.setItem("events", JSON.stringify(events));
  }
  
  function saveBookings() {
    localStorage.setItem("bookings", JSON.stringify(bookings));
  }
  
  function renderEvents() {
    const search = searchFilter.value.toLowerCase();
    const locationVal = locationFilter ? locationFilter.value.toLowerCase() : "";
    const dateVal = dateFilter ? dateFilter.value : "";
  
    eventsContainer.innerHTML = "";
    const filtered = events.filter((e) =>
      (e.name.toLowerCase().includes(search) || e.category.toLowerCase().includes(search)) &&
      (locationVal === "" || e.location.toLowerCase().includes(locationVal)) &&
      (dateVal === "" || e.date === dateVal)
    );
  
    if (filtered.length === 0) {
      eventsContainer.innerHTML = '<div class="text-center">No events found.</div>';
      return;
    }
  
    filtered.forEach((event, index) => {
      const card = document.createElement("div");
      card.className = "col-md-4";
      card.innerHTML = `
        <div class="card p-3">
          <h5>${event.name}</h5>
          <p>Category: ${event.category}</p>
          <p>Location: ${event.location || "N/A"}</p>
          <p>Date: ${event.date || "N/A"}</p>
          <p>Tickets Available: ${event.availability}</p>
          <input type="number" id="qty-${index}" class="form-control mb-2" min="1" max="${event.availability}" value="1" ${event.availability === 0 ? "disabled" : ""}>
          <button class="btn btn-primary btn-book" onclick="initiateBooking(${index})" ${event.availability === 0 ? "disabled" : ""}>Book Ticket</button>
          <button class="btn btn-sm btn-outline-warning mt-2" onclick="editEvent(${index})">Edit</button>
          <button class="btn btn-sm btn-outline-danger mt-1" onclick="deleteEvent(${index})">Delete</button>
        </div>
      `;
      eventsContainer.appendChild(card);
    });
  }
  
  // New function to open payment modal
  function initiateBooking(index) {
    bookingIndex = index;
    const modal = new bootstrap.Modal(document.getElementById("paymentModal"));
    modal.show();
  }
  
  document.getElementById("confirmPaymentBtn").addEventListener("click", () => {
    const qtyInput = document.getElementById(`qty-${bookingIndex}`);
    const qty = parseInt(qtyInput.value);
    if (events[bookingIndex].availability >= qty && qty > 0) {
      events[bookingIndex].availability -= qty;
      bookings.push(`${new Date().toLocaleString()}: Booked ${qty} ticket(s) for ${events[bookingIndex].name}`);
      saveEvents();
      saveBookings();
      alert("🎉 Booking confirmed and payment successful!");
      renderEvents();
      renderBookingLog();
      bootstrap.Modal.getInstance(document.getElementById("paymentModal")).hide();
    } else {
      alert("❌ Not enough tickets available.");
    }
  });
  
  function editEvent(index) {
    nameInput.value = events[index].name;
    categoryInput.value = events[index].category;
    locationInput.value = events[index].location || "";
    dateInput.value = events[index].date || "";
    availabilityInput.value = events[index].availability;
    editingIndex = index;
    updateEventBtn.classList.remove("d-none");
  }
  
  function deleteEvent(index) {
    if (confirm("Delete this event?")) {
      events.splice(index, 1);
      saveEvents();
      renderEvents();
    }
  }
  
  adminForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    const category = categoryInput.value.trim();
    const location = locationInput.value.trim();
    const date = dateInput.value;
    const availability = parseInt(availabilityInput.value);
  
    if (!name || !category || !availability || availability < 1) return;
  
    const eventObj = { name, category, availability };
    if (location) eventObj.location = location;
    if (date) eventObj.date = date;
  
    if (editingIndex !== null) {
      events[editingIndex] = eventObj;
      editingIndex = null;
      updateEventBtn.classList.add("d-none");
    } else {
      events.push(eventObj);
    }
  
    saveEvents();
    renderEvents();
    adminForm.reset();
  });
  
  updateEventBtn.addEventListener("click", () => {
    adminForm.dispatchEvent(new Event("submit"));
  });
  
  searchFilter.addEventListener("input", renderEvents);
  if(locationFilter) locationFilter.addEventListener("input", renderEvents);
  if(dateFilter) dateFilter.addEventListener("input", renderEvents);
  
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
  });
  
  function renderBookingLog() {
    bookingLog.innerHTML = bookings.map(b => `<li class="list-group-item">${b}</li>`).join("");
  }
  
  renderEvents();
  renderBookingLog();
  

  function sendBookingEmail(eventName, quantity, userEmail) {
    const templateParams = {
      event_name: eventName,
      ticket_quantity: quantity,
      user_email: userEmail,
    };
  
    emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams)
      .then(function(response) {
        console.log('Email sent successfully!', response.status, response.text);
      }, function(error) {
        console.error('Failed to send email:', error);
      });
  }
  
  // Example usage after successful booking:
  sendBookingEmail(events[bookingIndex].name, qty, 'nalamarirakesh01@gmail.com');
  