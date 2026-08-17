/**
 * Eclipse — Station Finder JavaScript (stations.js)
 * 
 * Handles:
 * - Wi-Fi loader (3-4 sec)
 * - Fetching stations from API
 * - Rendering station cards
 * - Search, filter, sort
 * - Pagination
 * - Loading/empty/error states
 */

const API_BASE = (window.location.origin && window.location.origin.startsWith('http'))
  ? window.location.origin
  : 'http://localhost:3000';

// ─── DOM REFS ────────────────────────────────
const loaderOverlay   = document.getElementById('loaderOverlay');
const searchInput     = document.getElementById('searchInput');
const searchBtn       = document.getElementById('searchBtn');
const filterState     = document.getElementById('filterState');
const filterCity      = document.getElementById('filterCity');
const filterCharger   = document.getElementById('filterCharger');
const filterAvailable = document.getElementById('filterAvailable');
const filterSort      = document.getElementById('filterSort');
const clearFiltersBtn = document.getElementById('clearFilters');
const resultCount     = document.getElementById('resultCount');
const activeChips     = document.getElementById('activeChips');
const resultsGrid     = document.getElementById('resultsGrid');
const paginationEl    = document.getElementById('pagination');
const emptyState      = document.getElementById('emptyState');
const errorState      = document.getElementById('errorState');
const emptyResetBtn   = document.getElementById('emptyResetBtn');
const errorRetryBtn   = document.getElementById('errorRetryBtn');
const resultsHeader   = document.getElementById('resultsHeader');
const filtersSection  = document.getElementById('filtersSection');

// ─── STATE ───────────────────────────────────
let currentPage = 1;
const PAGE_SIZE = 12;
let isLoading = false;

// ─── WI-FI LOADER ────────────────────────────
function showLoader() {
  loaderOverlay.classList.remove('hidden', 'fade-out');
}

function hideLoader() {
  loaderOverlay.classList.add('fade-out');
  setTimeout(() => loaderOverlay.classList.add('hidden'), 500);
}

// ─── INIT: Check if coming from landing page search ─────────
(function init() {
  const params = new URLSearchParams(window.location.search);
  const query = params.get('q') || '';
  const fromLanding = params.get('from') === 'landing';

  if (query) {
    searchInput.value = query;
  }

  // Load filter options
  loadFilters();

  if (fromLanding) {
    // Show loader for 3-4 seconds, then load results
    showLoader();
    const loaderDuration = 3000 + Math.random() * 1000; // 3-4 sec
    setTimeout(() => {
      hideLoader();
      fetchStations();
    }, loaderDuration);
  } else {
    // Direct navigation — hide loader and load immediately
    loaderOverlay.classList.add('hidden');
    fetchStations();
  }
})();

// ─── LOAD FILTER OPTIONS ─────────────────────
async function loadFilters() {
  try {
    const res = await fetch(`${API_BASE}/api/filters`);
    const json = await res.json();
    if (!json.success) return;

    const { states, cities, chargerTypes } = json.data;

    states.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s;
      opt.textContent = s;
      filterState.appendChild(opt);
    });

    cities.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      filterCity.appendChild(opt);
    });

    chargerTypes.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t;
      opt.textContent = t;
      filterCharger.appendChild(opt);
    });
  } catch (err) {
    console.error('Failed to load filters:', err);
  }
}

// ─── FETCH STATIONS ──────────────────────────
async function fetchStations() {
  if (isLoading) return;
  isLoading = true;

  // Show skeletons
  showSkeletons();
  emptyState.style.display = 'none';
  errorState.style.display = 'none';
  resultsHeader.style.display = '';
  filtersSection.style.display = '';

  try {
    const params = new URLSearchParams();
    const search = searchInput.value.trim();
    if (search) params.set('search', search);
    if (filterState.value) params.set('state', filterState.value);
    if (filterCity.value) params.set('city', filterCity.value);
    if (filterCharger.value) params.set('chargerType', filterCharger.value);
    if (filterAvailable.value) params.set('available', filterAvailable.value);
    if (filterSort.value) params.set('sort', filterSort.value);
    params.set('page', currentPage);
    params.set('limit', PAGE_SIZE);

    const res = await fetch(`${API_BASE}/api/stations?${params}`);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();

    if (!json.success) throw new Error(json.error || 'Unknown error');

    renderStations(json.data, json.pagination);
    renderPagination(json.pagination);
    updateResultCount(json.pagination);
    updateChips();

  } catch (err) {
    console.error('Fetch error:', err);
    showError();
  } finally {
    isLoading = false;
  }
}

// ─── RENDER STATIONS ─────────────────────────
function renderStations(stations, pagination) {
  resultsGrid.innerHTML = '';

  if (stations.length === 0) {
    showEmpty();
    return;
  }

  emptyState.style.display = 'none';
  errorState.style.display = 'none';

  stations.forEach(station => {
    const card = createStationCard(station);
    resultsGrid.appendChild(card);
  });

  if (window.observeElements) {
    window.observeElements();
  }
}

function createStationCard(s) {
  const el = document.createElement('div');
  el.className = 'station-card';
  el.id = `station-${s.id}`;

  // Determine availability status
  let availClass, availText;
  const ratio = s.availableChargers / s.totalChargers;
  if (ratio >= 0.5) {
    availClass = 'station-card__avail--open';
    availText = `${s.availableChargers}/${s.totalChargers} Available`;
  } else if (ratio > 0) {
    availClass = 'station-card__avail--limited';
    availText = `${s.availableChargers}/${s.totalChargers} Available`;
  } else {
    availClass = 'station-card__avail--closed';
    availText = 'Unavailable';
  }

  el.innerHTML = `
    <div class="station-card__content">
      <div class="station-card__top">
        <span class="station-card__avail ${availClass}">
          <span class="station-card__avail-dot"></span>
          ${availText}
        </span>
        <button class="station-card__bookmark" aria-label="Save station">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.72-8.72 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </div>

      <div class="station-card__body">
        <h3 class="station-card__name">${escapeHTML(s.name)}</h3>
        <div class="station-card__location">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <span class="station-card__location-text">${escapeHTML(s.city)}, ${escapeHTML(s.state)}</span>
        </div>
      </div>

      <hr class="station-card__divider" />

      <div class="station-card__spec-grid">
        <div class="station-card__spec-cell">
          <span class="station-card__spec-label">CHARGER</span>
          <span class="station-card__spec-value">${escapeHTML(s.chargerType)}</span>
        </div>
        <div class="station-card__spec-cell">
          <span class="station-card__spec-label">POWER</span>
          <span class="station-card__spec-value">${s.powerKW} kW</span>
        </div>
        <div class="station-card__spec-cell">
          <span class="station-card__spec-label">CONNECTOR</span>
          <span class="station-card__spec-value">${escapeHTML(s.connectorType)}</span>
        </div>
        <div class="station-card__spec-cell">
          <span class="station-card__spec-label">HOURS</span>
          <span class="station-card__spec-value">${escapeHTML(s.operatingHours)}</span>
        </div>
      </div>

      <hr class="station-card__divider" />

      <div class="station-card__footer">
        <div class="station-card__price-box">
          <span class="station-card__price-label">PRICE</span>
          <span class="station-card__price">
            &#x20B9;<strong>${s.pricePerKWh}</strong><span class="station-card__price-unit"> /kWh</span>
          </span>
        </div>
        <a href="station-details.html?id=${s.id}" class="station-card__cta">
          View Station &rarr;
        </a>
      </div>
    </div>

    <div class="station-card__image-panel">
      <img src="Charging_Station.png" alt="${escapeHTML(s.name)}" />
    </div>
  `;

  // Make entire card clickable except bookmark button
  el.style.cursor = 'pointer';
  el.addEventListener('click', (e) => {
    if (!e.target.closest('.station-card__bookmark')) {
      window.location.href = `station-details.html?id=${s.id}`;
    }
  });

  const bmBtn = el.querySelector('.station-card__bookmark');
  if (bmBtn) {
    bmBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      bmBtn.classList.toggle('is-saved');
    });
  }

  return el;
}

// ─── SKELETONS ───────────────────────────────
function showSkeletons() {
  resultsGrid.innerHTML = '';
  for (let i = 0; i < 6; i++) {
    const skel = document.createElement('div');
    skel.className = 'skeleton-card';
    skel.innerHTML = `
      <div class="skeleton-line skeleton-line--title"></div>
      <div class="skeleton-line skeleton-line--subtitle"></div>
      <div class="skeleton-specs">
        <div class="skeleton-spec"></div>
        <div class="skeleton-spec"></div>
        <div class="skeleton-spec"></div>
        <div class="skeleton-spec"></div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div class="skeleton-line skeleton-line--short" style="margin:0;"></div>
        <div class="skeleton-line skeleton-line--btn" style="margin:0;"></div>
      </div>
    `;
    resultsGrid.appendChild(skel);
  }
}

// ─── PAGINATION ──────────────────────────────
function renderPagination(p) {
  paginationEl.innerHTML = '';

  if (p.totalPages <= 1) return;

  // Previous
  const prevBtn = document.createElement('button');
  prevBtn.className = 'pagination__btn';
  prevBtn.textContent = '←';
  prevBtn.disabled = p.page <= 1;
  prevBtn.addEventListener('click', () => { currentPage = p.page - 1; fetchStations(); scrollToTop(); });
  paginationEl.appendChild(prevBtn);

  // Page numbers
  const maxVisible = 7;
  let start = Math.max(1, p.page - 3);
  let end = Math.min(p.totalPages, start + maxVisible - 1);
  if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);

  if (start > 1) {
    addPageBtn(1, p.page);
    if (start > 2) addEllipsis();
  }

  for (let i = start; i <= end; i++) {
    addPageBtn(i, p.page);
  }

  if (end < p.totalPages) {
    if (end < p.totalPages - 1) addEllipsis();
    addPageBtn(p.totalPages, p.page);
  }

  // Next
  const nextBtn = document.createElement('button');
  nextBtn.className = 'pagination__btn';
  nextBtn.textContent = '→';
  nextBtn.disabled = p.page >= p.totalPages;
  nextBtn.addEventListener('click', () => { currentPage = p.page + 1; fetchStations(); scrollToTop(); });
  paginationEl.appendChild(nextBtn);
}

function addPageBtn(page, current) {
  const btn = document.createElement('button');
  btn.className = `pagination__btn${page === current ? ' pagination__btn--active' : ''}`;
  btn.textContent = page;
  btn.addEventListener('click', () => { currentPage = page; fetchStations(); scrollToTop(); });
  paginationEl.appendChild(btn);
}

function addEllipsis() {
  const span = document.createElement('span');
  span.className = 'pagination__btn';
  span.textContent = '…';
  span.style.cursor = 'default';
  span.style.border = 'none';
  span.style.background = 'none';
  paginationEl.appendChild(span);
}

function scrollToTop() {
  document.getElementById('searchHeader').scrollIntoView({ behavior: 'smooth' });
}

// ─── RESULT COUNT ────────────────────────────
function updateResultCount(p) {
  const from = (p.page - 1) * p.limit + 1;
  const to = Math.min(p.page * p.limit, p.total);
  resultCount.innerHTML = `Showing <strong>${from}–${to}</strong> of <strong>${p.total}</strong> stations`;
}

// ─── ACTIVE CHIPS ────────────────────────────
function updateChips() {
  activeChips.innerHTML = '';

  const filters = [
    { label: `State: ${filterState.value}`, value: filterState.value, clear: () => { filterState.value = ''; } },
    { label: `City: ${filterCity.value}`, value: filterCity.value, clear: () => { filterCity.value = ''; } },
    { label: `Type: ${filterCharger.value}`, value: filterCharger.value, clear: () => { filterCharger.value = ''; } },
    { label: 'Available Only', value: filterAvailable.value, clear: () => { filterAvailable.value = ''; } },
    { label: `Search: "${searchInput.value}"`, value: searchInput.value.trim(), clear: () => { searchInput.value = ''; } },
  ];

  filters.forEach(f => {
    if (!f.value) return;
    const chip = document.createElement('span');
    chip.className = 'chip';
    chip.innerHTML = `${escapeHTML(f.label)} <button class="chip__remove" aria-label="Remove filter">✕</button>`;
    chip.querySelector('.chip__remove').addEventListener('click', () => {
      f.clear();
      currentPage = 1;
      fetchStations();
    });
    activeChips.appendChild(chip);
  });
}

// ─── EMPTY / ERROR ───────────────────────────
function showEmpty() {
  resultsGrid.innerHTML = '';
  paginationEl.innerHTML = '';
  resultCount.innerHTML = '<strong>0</strong> stations found';
  emptyState.style.display = '';
  errorState.style.display = 'none';
}

function showError() {
  resultsGrid.innerHTML = '';
  paginationEl.innerHTML = '';
  resultCount.textContent = '';
  emptyState.style.display = 'none';
  errorState.style.display = '';
  resultsHeader.style.display = 'none';
}

// ─── ESCAPE HTML ─────────────────────────────
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

searchBtn.addEventListener('click', () => { 
  currentPage = 1; 
  showLoader();
  setTimeout(() => {
    hideLoader();
    fetchStations();
  }, 500);
});

searchInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') { 
    currentPage = 1; 
    showLoader();
    setTimeout(() => {
      hideLoader();
      fetchStations();
    }, 500);
  }
});

[filterState, filterCity, filterCharger, filterAvailable, filterSort].forEach(el => {
  el.addEventListener('change', () => { currentPage = 1; fetchStations(); });
});

clearFiltersBtn.addEventListener('click', () => {
  searchInput.value = '';
  filterState.value = '';
  filterCity.value = '';
  filterCharger.value = '';
  filterAvailable.value = '';
  filterSort.value = '';
  currentPage = 1;
  fetchStations();
});

emptyResetBtn.addEventListener('click', () => {
  clearFiltersBtn.click();
});

errorRetryBtn.addEventListener('click', () => {
  fetchStations();
});
