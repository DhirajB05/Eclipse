/**
 * Eclipse — My Bookings JS
 * Fetches booking history, filters by tab, and handles cancellation.
 */

const API_BASE = (window.location.origin && window.location.origin.startsWith('http'))
  ? window.location.origin
  : 'http://localhost:3000';

// DOM
const tabBtns     = document.querySelectorAll('.tab-btn');
const bookingsList = document.getElementById('bookingsList');
const emptyState  = document.getElementById('emptyState');
const bLoader     = document.getElementById('bLoader');

// Modal DOM
const cancelModal  = document.getElementById('cancelModal');
const btnCancelYes = document.getElementById('btnCancelYes');
const btnCancelNo  = document.getElementById('btnCancelNo');
const cancelError  = document.getElementById('cancelError');

// QR Modal DOM
const qrModal   = document.getElementById('qrModal');
const qrModalImg = document.getElementById('qrModalImg');
const qrModalId  = document.getElementById('qrModalId');
const btnQrClose = document.getElementById('btnQrClose');

let currentFilter  = 'ALL';
let allBookings    = [];
let bookingToCancel = null;

// Init
fetchBookings();

// Tabs — toggle .active (matches new CSS)
tabBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    tabBtns.forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    currentFilter = e.target.dataset.filter;
    renderBookings();
  });
});

async function fetchBookings() {
  // Show loader
  bookingsList.innerHTML = '';
  if (bLoader) {
    bookingsList.appendChild(bLoader);
    bLoader.style.display = 'flex';
  }
  emptyState.style.display = 'none';

  try {
    const res = await fetch(`${API_BASE}/api/bookings`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch bookings');

    const json = await res.json();
    if (!json.success) throw new Error(json.error);

    allBookings = json.data;
    renderBookings();

  } catch (err) {
    console.error(err);
    bookingsList.innerHTML = '<p style="text-align:center;color:#ff8080;padding:40px;">Error loading bookings. Please try again.</p>';
  }
}

function statusInfo(status) {
  switch (status) {
    case 'CONFIRMED': return { stripClass: 'booking-card__status-strip--confirmed', badgeClass: 'booking-status--confirmed', label: 'Confirmed' };
    case 'CANCELLED': return { stripClass: 'booking-card__status-strip--cancelled', badgeClass: 'booking-status--cancelled', label: 'Cancelled' };
    default:          return { stripClass: 'booking-card__status-strip--pending',   badgeClass: 'booking-status--pending',   label: status };
  }
}

function renderBookings() {
  bookingsList.innerHTML = '';

  let filtered = allBookings;
  if (currentFilter !== 'ALL') {
    filtered = allBookings.filter(b => b.status === currentFilter);
  }

  if (filtered.length === 0) {
    emptyState.style.display = 'flex';
    return;
  }

  emptyState.style.display = 'none';

  filtered.forEach(b => {
    const isPast    = new Date(`${b.date}T${b.startTime}:00`) < new Date();
    const canCancel = b.status === 'CONFIRMED' && !isPast;
    const si        = statusInfo(b.status);

    const card = document.createElement('div');
    card.className = 'booking-card';
    card.innerHTML = `
      <div class="booking-card__status-strip ${si.stripClass}"></div>

      <div class="booking-card__main">
        <div class="booking-card__header">
          <div class="booking-card__station">${escapeHTML(b.stationName)}</div>
          <span class="booking-status ${si.badgeClass}">
            <span class="status-dot"></span>
            ${si.label}
          </span>
        </div>

        <div class="booking-card__meta">
          <div class="booking-card__meta-item">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            ${formatDate(b.date)}
          </div>
          <div class="booking-card__meta-item">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            ${b.startTime} – ${b.endTime}
          </div>
          <div class="booking-card__meta-item">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            ${escapeHTML(b.chargerType)} · ${b.powerKW}kW
          </div>
          <div class="booking-card__meta-item">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
            ${escapeHTML(b.vehicleNumber)}
          </div>
          <div class="booking-card__meta-item">
            <span style="font:500 10px/1 var(--font);color:var(--text-subtle);">ID:</span>
            #${String(b.id).padStart(4, '0')}
          </div>
        </div>

        <div class="booking-card__actions">
          <a href="station-details.html?id=${b.stationId}" class="booking-card__btn">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            View Station
          </a>
          ${b.status === 'CONFIRMED' ? `
          <button class="booking-card__btn" onclick="showQrCode(${b.id})">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/></svg>
            View QR
          </button>` : ''}
          ${canCancel ? `<button class="booking-card__btn booking-card__btn--danger" onclick="promptCancel(${b.id})">Cancel</button>` : ''}
        </div>
      </div>
    `;
    bookingsList.appendChild(card);
  });

  if (window.observeElements) {
    window.observeElements();
  }
}

// Cancel Flow
window.promptCancel = function(id) {
  bookingToCancel = id;
  cancelError.style.display = 'none';
  cancelModal.style.display = 'flex';
};

btnCancelNo.addEventListener('click', () => {
  cancelModal.style.display = 'none';
  bookingToCancel = null;
});

btnCancelYes.addEventListener('click', async () => {
  if (!bookingToCancel) return;

  btnCancelYes.disabled = true;
  btnCancelYes.textContent = 'Cancelling…';

  try {
    const res = await fetch(`${API_BASE}/api/bookings/${bookingToCancel}`, {
      method: 'DELETE'
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to cancel');

    cancelModal.style.display = 'none';
    bookingToCancel = null;
    await fetchBookings();

  } catch (err) {
    console.error(err);
    cancelError.textContent = err.message;
    cancelError.style.display = 'block';
  } finally {
    btnCancelYes.disabled = false;
    btnCancelYes.textContent = 'Yes, Cancel';
  }
});

// QR Flow
window.showQrCode = function(id) {
  qrModalImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=ECLIPSE-BOOKING-${id}`;
  qrModalId.textContent = `Booking ID: #${String(id).padStart(4, '0')}`;
  qrModal.style.display = 'flex';
};

btnQrClose.addEventListener('click', () => {
  qrModal.style.display = 'none';
});

// Utils
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}
