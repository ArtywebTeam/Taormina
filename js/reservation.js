/**
 * Ristorante Pizzeria Taormina - Reservation Form Handler
 */

document.addEventListener("DOMContentLoaded", () => {
  const reservationForm = document.getElementById("reservation-form");
  const formWrapper = document.getElementById("form-wrapper");
  const confirmationStamp = document.getElementById("confirmation-stamp");
  const submitBtn = document.getElementById("submit-btn");
  const dateInput = document.getElementById("date");

  // Set min date to today's date
  if (dateInput) {
    const today = new Date().toISOString().split("T")[0];
    dateInput.min = today;
  }

  if (reservationForm) {
    reservationForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const lang = localStorage.getItem("lang") || "it";
      const dict = typeof translations !== "undefined" ? translations[lang] : {};

      // Disable button & update text
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = dict.form_submitting || (lang === "it" ? "Invio…" : "Sending…");
      }

      const reservationData = {
        id: "res_" + Date.now(),
        full_name: document.getElementById("full_name").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        email: document.getElementById("email").value.trim(),
        guests: parseInt(document.getElementById("guests").value, 10) || 2,
        date: document.getElementById("date").value,
        time: document.getElementById("time").value,
        special_requests: document.getElementById("special_requests").value.trim(),
        status: "pending",
        created_at: new Date().toISOString()
      };

      // Save to localStorage
      const existing = JSON.parse(localStorage.getItem("taormina_reservations") || "[]");
      existing.unshift(reservationData);
      localStorage.setItem("taormina_reservations", JSON.stringify(existing));

      // Simulate sending delay then show confirmation stamp
      setTimeout(() => {
        if (formWrapper) formWrapper.style.display = "none";
        if (confirmationStamp) {
          confirmationStamp.style.display = "block";
          confirmationStamp.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 600);
    });
  }
});
