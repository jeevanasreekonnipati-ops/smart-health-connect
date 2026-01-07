// Demo data
const doctors = [
  { id: 1, name: "Dr. Asha Reddy", specialty: "Internal Medicine", location: "Tirupati", rating: 4.8, nextAvailable: "Tomorrow 10:30" },
  { id: 2, name: "Dr. Vikram Rao", specialty: "Cardiology", location: "Renigunta", rating: 4.6, nextAvailable: "Fri 09:00" },
  { id: 3, name: "Dr. Meera Iyer", specialty: "Pediatrics", location: "Tirupati", rating: 4.7, nextAvailable: "Sat 11:15" },
  { id: 4, name: "Dr. Sameer Khan", specialty: "Dermatology", location: "Chittoor", rating: 4.5, nextAvailable: "Mon 13:00" },
];

const medicines = [
  { id: "M-101", name: "Paracetamol 500mg", use: "Fever, pain relief", price: 25, stock: 42 },
  { id: "M-102", name: "Amoxicillin 250mg", use: "Bacterial infections", price: 68, stock: 20 },
  { id: "M-103", name: "Cetirizine 10mg", use: "Allergy relief", price: 18, stock: 60 },
  { id: "M-104", name: "ORS Sachet", use: "Hydration support", price: 12, stock: 100 },
  { id: "M-105", name: "Ibuprofen 200mg", use: "Inflammation & pain", price: 30, stock: 35 },
];

const patient = {
  vitals: [
    { t: "09:00", hr: 78, bp: 120, spo2: 98 },
    { t: "12:00", hr: 82, bp: 118, spo2: 97 },
    { t: "15:00", hr: 76, bp: 115, spo2: 98 },
    { t: "18:00", hr: 80, bp: 119, spo2: 97 },
    { t: "21:00", hr: 74, bp: 116, spo2: 98 },
  ],
  appointments: [
    { with: "Dr. Asha Reddy", date: "2026-01-10", time: "10:30", reason: "Follow-up" },
  ],
  prescriptions: [
    { name: "Paracetamol 500mg", dose: "1 tab x 3/day", notes: "Take after meals" },
    { name: "Cetirizine 10mg", dose: "1 tab at night", notes: "For allergies" },
  ],
};

let cart = [];

// Utilities
const el = (sel) => document.querySelector(sel);
const fmtRs = (n) => `₹${n.toFixed(0)}`;

// Render doctors
function renderDoctors(list) {
  const wrap = el("#doctor-list");
  wrap.innerHTML = "";
  list.forEach((d) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${d.name}</h3>
      <p class="pill">${d.specialty}</p>
      <p><strong>Location:</strong> ${d.location}</p>
      <p><strong>Rating:</strong> ${d.rating} ★</p>
      <p><strong>Next available:</strong> ${d.nextAvailable}</p>
      <div style="display:flex;gap:8px;margin-top:8px;">
        <button class="btn primary" data-id="${d.id}" aria-label="Book appointment with ${d.name}">Book</button>
        <button class="btn secondary" aria-label="View details for ${d.name}">Details</button>
      </div>
    `;
    card.querySelector(".btn.primary").addEventListener("click", () => openAppointmentModal(d));
    wrap.appendChild(card);
  });
}

// Appointment modal logic
function openAppointmentModal(doctor) {
  const dlg = el("#appointment-modal");
  el("#appointment-doctor").textContent = `Doctor: ${doctor.name} (${doctor.specialty})`;
  dlg.showModal();

  el("#appt-confirm").onclick = (e) => {
    e.preventDefault();
    const date = el("#appt-date").value;
    const time = el("#appt-time").value;
    const reason = el("#appt-reason").value.trim();
    if (!date || !time || !reason) return;

    patient.appointments.push({
      with: doctor.name,
      date,
      time,
      reason,
    });
    renderAppointments();
    dlg.close();
  };
}

// Render medicines
function renderMedicines(list) {
  const wrap = el("#medicine-list");
  wrap.innerHTML = "";
  list.forEach((m) => {
    const card = document.createElement("div");
    card.className = "card";
    const disabled = m.stock <= 0;
    card.innerHTML = `
      <h3>${m.name}</h3>
      <p class="pill">${m.use}</p>
      <p><strong>Price:</strong> ${fmtRs(m.price)}</p>
      <p><strong>Stock:</strong> ${m.stock > 0 ? m.stock : "Out of stock"}</p>
      <button class="btn ${disabled ? "secondary" : "primary"}" ${disabled ? "disabled" : ""} aria-label="Add ${m.name} to cart">
        ${disabled ? "Unavailable" : "Add to cart"}
      </button>
    `;
    if (!disabled) {
      card.querySelector("button").addEventListener("click", () => {
        addToCart(m);
      });
    }
    wrap.appendChild(card);
  });
}

// Cart functions
function addToCart(item) {
  const existing = cart.find((c) => c.id === item.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: item.id, name: item.name, price: item.price, qty: 1 });
  }
  renderCart();
}
function removeFromCart(id) {
  cart = cart.filter((c) => c.id !== id);
  renderCart();
}
function renderCart() {
  const ul = el("#cart-items");
  ul.innerHTML = "";
  let total = 0;
  cart.forEach((c) => {
    total += c.price * c.qty;
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${c.name} × ${c.qty}</span>
      <div style="display:flex;gap:8px;">
        <button class="btn secondary" aria-label="Remove ${c.name} from cart">Remove</button>
      </div>
    `;
    li.querySelector("button").addEventListener("click", () => removeFromCart(c.id));
    ul.appendChild(li);
  });
  el("#cart-total").textContent = `Total: ${fmtRs(total)}`;
}

// Dashboard: vitals chart (vanilla canvas)
function renderVitalsChart() {
  const canvas = el("#vitals-chart");
  const ctx = canvas.getContext("2d");
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  // Axes
  ctx.strokeStyle = "rgba(255,255,255,0.2)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(40, 20); ctx.lineTo(40, h - 30); ctx.lineTo(w - 20, h - 30);
  ctx.stroke();

  // Scale helpers
  const xs = patient.vitals.map((v, i) => 40 + i * ((w - 60) / (patient.vitals.length - 1)));
  const hrVals = patient.vitals.map((v) => v.hr); // Heart rate
  const bpVals = patient.vitals.map((v) => v.bp); // Systolic
  const minHr = Math.min(...hrVals) - 5;
  const maxHr = Math.max(...hrVals) + 5;
  const minBp = Math.min(...bpVals) - 5;
  const maxBp = Math.max(...bpVals) + 5;
  const yScale = (val, min, max) => (h - 30) - ((val - min) / (max - min)) * (h - 60);

  // Heart rate line
  ctx.strokeStyle = "#4f7df3";
  ctx.lineWidth = 2;
  ctx.beginPath();
  hrVals.forEach((v, i) => {
    const x = xs[i], y = yScale(v, minHr, maxHr);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke();

  // BP line
  ctx.strokeStyle = "#2ad1b8";
  ctx.lineWidth = 2;
  ctx.beginPath();
  bpVals.forEach((v, i) => {
    const x = xs[i], y = yScale(v, minBp, maxBp);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Legend
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.font = "12px system-ui";
  ctx.fillText("Heart Rate", 52, 20);
  ctx.fillStyle = "#4f7df3"; ctx.fillRect(40, 12, 8, 8);
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fillText("Systolic BP", 140, 20);
  ctx.fillStyle = "#2ad1b8"; ctx.fillRect(126, 12, 8, 8);
}

// Dashboard lists
function renderVitalsList() {
  const ul = el("#vitals-list");
  ul.innerHTML = "";
  patient.vitals.forEach((v) => {
    const li = document.createElement("li");
    li.textContent = `${v.t} • HR ${v.hr} bpm • BP ${v.bp} • SpO₂ ${v.spo2}%`;
    ul.appendChild(li);
  });
}
function renderAppointments() {
  const ul = el("#appointments-list");
  ul.innerHTML = "";
  patient.appointments.forEach((a) => {
    const li = document.createElement("li");
    li.textContent = `${a.date} ${a.time} • ${a.with} • ${a.reason}`;
    ul.appendChild(li);
  });
}
function renderPrescriptions() {
  const ul = el("#prescriptions-list");
  ul.innerHTML = "";
  patient.prescriptions.forEach((p) => {
    const li = document.createElement("li");
    li.textContent = `${p.name} — ${p.dose} (${p.notes})`;
    ul.appendChild(li);
  });
}

// Search handlers
function attachSearchHandlers() {
  el("#doctor-search").addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase().trim();
    const filtered = doctors.filter(
      (d) => d.name.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q) || d.location.toLowerCase().includes(q)
    );
    renderDoctors(filtered);
  });

  el("#pharmacy-search").addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase().trim();
    const filtered = medicines.filter(
      (m) => m.name.toLowerCase().includes(q) || m.use.toLowerCase().includes(q)
    );
    renderMedicines(filtered);
  });
}

// Contact form (demo)
function attachContactForm() {
  const form = el("#contact-form");
  const status = el("#contact-status");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = el("#contact-name").value.trim();
    const email = el("#contact-email").value.trim();
    const msg = el("#contact-message").value.trim();
    if (!name || !email || !msg) {
      status.textContent = "Please fill in all fields.";
      return;
    }
    status.textContent = "Thanks! We’ll get back to you (demo only).";
    form.reset();
  });
}

// Checkout (demo)
function attachCheckout() {
  el("#checkout-btn").addEventListener("click", () => {
    if (cart.length === 0) return alert("Your cart is empty.");
    alert("Order placed (demo). Thank you!");
    cart = [];
    renderCart();
  });
}

// Init
function init() {
  renderDoctors(doctors);
  renderMedicines(medicines);
  renderAppointments();
  renderPrescriptions();
  renderVitalsList();
  renderVitalsChart();
  renderCart();
  attachSearchHandlers();
  attachContactForm();
  attachCheckout();
}

document.addEventListener("DOMContentLoaded", init);