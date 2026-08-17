// Dropdown toggle
const btn  = document.getElementById('aboutBtn');
const drop = document.getElementById('aboutDrop');
btn.addEventListener('click', () => drop.classList.toggle('open'));
document.addEventListener('click', e => {
  if (!btn.contains(e.target)) drop.classList.remove('open');
});

// Landing Page Search Navigation
const landingSearchInput = document.querySelector('.hero__search-input');
const landingSearchBtn = document.querySelector('.hero__search-btn');

if (landingSearchInput && landingSearchBtn) {
  function performLandingSearch() {
    const query = landingSearchInput.value.trim();
    window.location.href = `stations.html?q=${encodeURIComponent(query)}&from=landing`;
  }

  landingSearchBtn.addEventListener('click', performLandingSearch);
  landingSearchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      performLandingSearch();
    }
  });
}

// ── SCROLL-ENTRY ANIMATIONS ───────────────────────────────
// Adds .is-visible class to animate inner-page elements on scroll entry
(function initScrollReveal() {
  const targets = '.station-card, .info-card, .booking-card, .avail-box, ' +
    '.identity-block, .booking-header__station, .form-section, .form-card';

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const siblings = Array.from(entry.target.parentElement?.children || []);
        const idx = siblings.indexOf(entry.target);
        const delay = Math.min(idx * 55, 340);
        setTimeout(() => entry.target.classList.add('is-visible'), delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  function observeAll() {
    document.querySelectorAll(targets).forEach(el => {
      if (!el.classList.contains('is-visible')) observer.observe(el);
    });
  }

  // Expose globally so dynamic renderers (bookings.js, etc.) can re-trigger
  window.observeElements = observeAll;

  // Also watch bookingsList for dynamically inserted booking cards
  const bookingsList = document.getElementById('bookingsList');
  if (bookingsList) {
    new MutationObserver(observeAll).observe(bookingsList, { childList: true });
  }
})();
