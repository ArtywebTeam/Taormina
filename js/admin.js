/**
 * Ristorante Pizzeria Taormina - Admin Dashboard Handler
 */

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("admin-search");
  const dateFilterInput = document.getElementById("admin-date-filter");
  const tableBody = document.getElementById("admin-table-body");
  const totalCountEl = document.getElementById("admin-total-count");
  const noResultsEl = document.getElementById("admin-no-results");

  // Load or initialize sample reservations if empty
  function getReservations() {
    let list = JSON.parse(localStorage.getItem("taormina_reservations") || "null");
    if (!list) {
      // Default initial entries for realistic display
      list = [
        {
          id: "res_sample_1",
          full_name: "Marco Rossi",
          phone: "+39 340 123 4567",
          email: "marco.rossi@email.it",
          guests: 4,
          date: new Date().toISOString().split("T")[0],
          time: "20:00",
          special_requests: "Tavolo all'aperto se possibile",
          status: "confirmed",
          created_at: new Date().toISOString()
        },
        {
          id: "res_sample_2",
          full_name: "Elena Bianchi",
          phone: "+39 338 987 6543",
          email: "elena.b@gmail.com",
          guests: 2,
          date: new Date().toISOString().split("T")[0],
          time: "21:15",
          special_requests: "Festeggiamo un anniversario",
          status: "pending",
          created_at: new Date().toISOString()
        }
      ];
      localStorage.setItem("taormina_reservations", JSON.stringify(list));
    }
    return list;
  }

  function saveReservations(list) {
    localStorage.setItem("taormina_reservations", JSON.stringify(list));
  }

  function renderTable() {
    const list = getReservations();
    const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
    const selectedDate = dateFilterInput ? dateFilterInput.value : "";

    const filtered = list.filter(item => {
      const matchName = !query || item.full_name.toLowerCase().includes(query) || (item.email && item.email.toLowerCase().includes(query)) || (item.phone && item.phone.includes(query));
      const matchDate = !selectedDate || item.date === selectedDate;
      return matchName && matchDate;
    });

    if (totalCountEl) {
      totalCountEl.textContent = `${list.length} richieste totali`;
    }

    if (!tableBody) return;
    tableBody.innerHTML = "";

    if (filtered.length === 0) {
      if (noResultsEl) noResultsEl.style.display = "block";
      return;
    }

    if (noResultsEl) noResultsEl.style.display = "none";

    filtered.forEach(res => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>
          <b>${escapeHtml(res.full_name)}</b>
          ${res.special_requests ? `<small>${escapeHtml(res.special_requests)}</small>` : ""}
        </td>
        <td>
          ${escapeHtml(res.phone)}
          ${res.email ? `<small>${escapeHtml(res.email)}</small>` : ""}
        </td>
        <td>
          ${escapeHtml(res.date)}
          <small>${escapeHtml(res.time)}</small>
        </td>
        <td>${res.guests}</td>
        <td>
          <span class="status-badge ${res.status}">${res.status}</span>
        </td>
        <td>
          <div class="action-btn-group">
            <button title="Conferma" class="btn-confirm" data-id="${res.id}">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </button>
            <button title="Completa" class="btn-complete" data-id="${res.id}">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </button>
            <button title="Annulla" class="btn-cancel" data-id="${res.id}">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
        </td>
      `;

      // Attach action events
      tr.querySelector(".btn-confirm").addEventListener("click", () => updateStatus(res.id, "confirmed"));
      tr.querySelector(".btn-complete").addEventListener("click", () => updateStatus(res.id, "completed"));
      tr.querySelector(".btn-cancel").addEventListener("click", () => updateStatus(res.id, "cancelled"));

      tableBody.appendChild(tr);
    });
  }

  function updateStatus(id, newStatus) {
    const list = getReservations();
    const target = list.find(r => r.id === id);
    if (target) {
      target.status = newStatus;
      saveReservations(list);
      renderTable();
    }
  }

  function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }

  if (searchInput) searchInput.addEventListener("input", renderTable);
  if (dateFilterInput) dateFilterInput.addEventListener("change", renderTable);

  renderTable();
});
