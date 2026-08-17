/**
 * Eclipse — Booking JS
 * Handles fetching slot availability, selecting slots,
 * and POSTing to the booking API.
 */

const API_BASE = (window.location.origin && window.location.origin.startsWith('http'))
  ? window.location.origin
  : 'http://localhost:3000';

// DOM
const errorState = document.getElementById('errorState');
const contentWrapper = document.getElementById('contentWrapper');
const breadcrumbNav = document.getElementById('breadcrumbNav');

const stName = document.getElementById('stName');
const stAddress = document.getElementById('stAddress');
const bookingDate = document.getElementById('bookingDate');
const slotsLoader = document.getElementById('slotsLoader');
const chargersContainer = document.getElementById('chargersContainer');

const vehicleModel = document.getElementById('vehicleModel');
const vehicleNumber = document.getElementById('vehicleNumber');
const btnSubmit = document.getElementById('btnSubmit');

const sumDate = document.getElementById('sumDate');
const sumTime = document.getElementById('sumTime');
const sumCharger = document.getElementById('sumCharger');

const formError = document.getElementById('formError');
const successModal = document.getElementById('successModal');
const qrCodeImg = document.getElementById('qrCodeImg');
const bookingIdText = document.getElementById('bookingIdText');

// State
const urlParams = new URLSearchParams(window.location.search);
const stationId = urlParams.get('station');
let selectedChargerId = null;
let selectedStartTime = null;
let selectedEndTime = null;

if (!stationId) {
  showError();
} else {
  // Set default date to today
  const today = new Date();
  const tzOffset = today.getTimezoneOffset() * 60000;
  const localISOTime = (new Date(Date.now() - tzOffset)).toISOString().split('T')[0];
  bookingDate.value = localISOTime;
  bookingDate.min = localISOTime; // prevent past dates

  // Fetch initial data
  breadcrumbNav.innerHTML = `<a href="station-details.html?id=${stationId}">← Back to Station</a>`;
  fetchAvailability();
}

// Event Listeners
bookingDate.addEventListener('change', () => {
  resetSelection();
  fetchAvailability();
});

[vehicleModel, vehicleNumber].forEach(el => {
  el.addEventListener('input', validateForm);
});

btnSubmit.addEventListener('click', submitBooking);

// API Calls
async function fetchAvailability() {
  chargersContainer.style.display = 'none';
  slotsLoader.style.display = 'flex';
  
  try {
    const date = bookingDate.value;
    const res = await fetch(`${API_BASE}/api/stations/${stationId}/availability?date=${date}`);
    if (!res.ok) throw new Error('Failed to fetch availability');
    
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    
    stName.textContent = json.data.stationName;
    // Assuming API adds station address or we just omit for brevity; we can fetch station details separately, but API availability doesn't return address. We will update backend if needed, or just show station name.
    stAddress.textContent = `Select an available charger and time slot below.`;
    
    renderChargers(json.data.chargers);
    contentWrapper.style.display = 'block';

  } catch (err) {
    console.error(err);
    showError();
  } finally {
    slotsLoader.style.display = 'none';
  }
}

function renderChargers(chargers) {
  chargersContainer.innerHTML = '';
  
  if (chargers.length === 0) {
    chargersContainer.innerHTML = '<p style="color: rgba(255,255,255,0.5);">No chargers found for this station.</p>';
    chargersContainer.style.display = 'block';
    return;
  }

  chargers.forEach((ch, idx) => {
    const block = document.createElement('div');
    block.className = 'charger-block';
    
    const isMaintenance = ch.status === 'MAINTENANCE';
    
    let html = `
      <div class="charger-block__header">
        <span class="charger-block__title">Charger ${idx + 1}</span>
        <span class="charger-block__specs">${ch.powerKW} kW • ${ch.connector}</span>
      </div>
    `;

    if (isMaintenance) {
      html += `<p style="color: #ffc832; font-size: 13px;">Currently under maintenance</p>`;
    } else {
      html += `<div class="slots-grid">`;
      // Generate slots from 08:00 to 22:00
      const slots = generateTimeSlots('08:00', '22:00');
      
      slots.forEach(slot => {
        // Check if slot is booked
        const isBooked = ch.bookedSlots.some(b => {
          return slot.start >= b.startTime && slot.start < b.endTime;
        });

        // Check if slot is in the past (only for today)
        let isPast = false;
        const now = new Date();
        const slotDate = new Date(`${bookingDate.value}T${slot.start}:00`);
        if (slotDate < now) {
          isPast = true;
        }

        const disabled = isBooked || isPast ? 'disabled' : '';
        html += `<button class="slot-btn" ${disabled} data-charger="${ch.id}" data-start="${slot.start}" data-end="${slot.end}">${slot.start}</button>`;
      });
      html += `</div>`;
    }
    
    block.innerHTML = html;
    chargersContainer.appendChild(block);
  });

  // Attach slot click events
  document.querySelectorAll('.slot-btn:not(:disabled)').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'));
      e.target.classList.add('selected');
      
      selectedChargerId = e.target.dataset.charger;
      selectedStartTime = e.target.dataset.start;
      selectedEndTime = e.target.dataset.end;
      
      updateSummary();
    });
  });

  chargersContainer.style.display = 'block';
}

function generateTimeSlots(startStr, endStr) {
  const slots = [];
  let current = new Date(`2000-01-01T${startStr}:00`);
  const end = new Date(`2000-01-01T${endStr}:00`);
  
  while (current < end) {
    const startString = current.toTimeString().slice(0, 5);
    current.setHours(current.getHours() + 1);
    const endString = current.toTimeString().slice(0, 5);
    slots.push({ start: startString, end: endString });
  }
  return slots;
}

function updateSummary() {
  if (selectedStartTime && selectedEndTime) {
    sumDate.textContent = new Date(bookingDate.value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    sumTime.textContent = `${selectedStartTime} - ${selectedEndTime}`;
    sumTime.classList.add('highlight');
    
    // Find charger index visually (approximate)
    const chargerBtns = document.querySelectorAll(`button[data-charger="${selectedChargerId}"]`);
    if(chargerBtns.length > 0) {
      // we can't easily get index without searching dom tree, just show ID
      sumCharger.textContent = `Charger #${selectedChargerId}`;
    }
  } else {
    sumDate.textContent = '—';
    sumTime.textContent = '—';
    sumTime.classList.remove('highlight');
    sumCharger.textContent = '—';
  }
  validateForm();
}

function resetSelection() {
  selectedChargerId = null;
  selectedStartTime = null;
  selectedEndTime = null;
  updateSummary();
}

function validateForm() {
  const m = vehicleModel.value.trim();
  const n = vehicleNumber.value.trim();
  
  formError.style.display = 'none';

  if (selectedChargerId && selectedStartTime && m && n) {
    btnSubmit.disabled = false;
  } else {
    btnSubmit.disabled = true;
  }
}

async function submitBooking() {
  if (btnSubmit.disabled) return;
  
  btnSubmit.disabled = true;
  btnSubmit.textContent = 'Processing...';
  formError.style.display = 'none';

  const payload = {
    stationId: parseInt(stationId),
    chargerId: parseInt(selectedChargerId),
    date: bookingDate.value,
    startTime: selectedStartTime,
    endTime: selectedEndTime,
    vehicleModel: vehicleModel.value.trim(),
    vehicleNumber: vehicleNumber.value.trim()
  };

  try {
    const res = await fetch(`${API_BASE}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const json = await res.json();

    if (!res.ok) {
      throw new Error(json.error || 'Failed to confirm booking');
    }

    // Generate QR Code
    const bookingId = json.data.id;
    qrCodeImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${bookingId}`;
    qrCodeImg.style.display = 'block';
    bookingIdText.textContent = `Booking ID: #${String(bookingId).padStart(4, '0')}`;

    // Success
    successModal.style.display = 'flex';

  } catch (err) {
    console.error(err);
    formError.textContent = err.message;
    formError.style.display = 'block';
    btnSubmit.disabled = false;
    btnSubmit.textContent = 'Confirm Booking';
  }
}

function showError() {
  contentWrapper.style.display = 'none';
  errorState.style.display = 'flex';
}
