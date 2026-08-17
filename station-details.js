/**
 * Eclipse — Station Details JavaScript
 * 
 * Fetches and renders station information based on the ?id= URL parameter.
 * Handles skeleton loaders and the "Open in Google Maps" action.
 */

const API_BASE = (window.location.origin && window.location.origin.startsWith('http'))
  ? window.location.origin
  : 'http://localhost:3000';

// DOM Elements
const skeletonLoader = document.getElementById('skeletonLoader');
const contentWrapper = document.getElementById('contentWrapper');
const errorState = document.getElementById('errorState');

const sdName = document.getElementById('sdName');
const sdLocation = document.getElementById('sdLocation');
const sdStatus = document.getElementById('sdStatus');
const sdAvailCount = document.getElementById('sdAvailCount');
const sdTotalCount = document.getElementById('sdTotalCount');
const sdMaxPower = document.getElementById('sdMaxPower');
const sdAddress = document.getElementById('sdAddress');
const sdHours = document.getElementById('sdHours');
const sdContact = document.getElementById('sdContact');
const sdPrice = document.getElementById('sdPrice');
const sdChargerType = document.getElementById('sdChargerType');
const sdConnectorType = document.getElementById('sdConnectorType');
const sdAmenities = document.getElementById('sdAmenities');
const sdChargerList = document.getElementById('sdChargerList');
const btnOpenMaps = document.getElementById('btnOpenMaps');
const btnBookSlot = document.getElementById('btnBookSlot');

let currentStation = null;

// Parse ID from URL (defaults to 1 if missing)
const urlParams = new URLSearchParams(window.location.search);
const stationId = urlParams.get('id') || '1';

fetchStationDetails(stationId);

async function fetchStationDetails(id) {
  try {
    const res = await fetch(`${API_BASE}/api/stations/${id}`);
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const json = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'Unknown error');
    }

    currentStation = json.data;
    renderStation(currentStation);
    if (typeof updateMapLocation === 'function') updateMapLocation();
    
    // Hide skeleton, show content
    skeletonLoader.style.display = 'none';
    contentWrapper.style.display = 'block';

  } catch (err) {
    console.error('Failed to fetch station details:', err);
    showError();
  }
}

function renderStation(station) {
  // Identity Block
  if (sdName) sdName.textContent = station.name;
  if (sdLocation) sdLocation.textContent = `${station.city}, ${station.state}`;

  // Availability Logic
  const availCount = station.availableChargers || 0;
  const totalCount = station.totalChargers || 0;

  if (sdStatus) {
    sdStatus.textContent = `● ${availCount} / ${totalCount} Available`;
    sdStatus.className = 'sd-avail-pill';
  }

  // Summary Block
  if (sdAvailCount) sdAvailCount.textContent = availCount;
  if (sdTotalCount) sdTotalCount.textContent = totalCount;
  if (sdMaxPower) sdMaxPower.textContent = `${station.powerKW} kW`;

  // Left Info Column
  if (sdAddress) sdAddress.textContent = station.address;
  if (sdHours) sdHours.textContent = station.operatingHours || 'Not specified';
  if (sdContact) sdContact.textContent = station.contact || 'Not available';
  if (sdPrice) sdPrice.textContent = `₹${station.pricePerKWh}`;
  
  if (sdChargerType) sdChargerType.textContent = station.chargerType;
  if (sdConnectorType) sdConnectorType.textContent = station.connectorType;

  // Amenities
  if (sdAmenities) {
    sdAmenities.innerHTML = '';
    if (station.amenities && station.amenities.length > 0) {
      station.amenities.forEach(am => {
        const span = document.createElement('span');
        span.className = 'amenity-chip';
        span.textContent = am;
        sdAmenities.appendChild(span);
      });
    } else {
      sdAmenities.innerHTML = '<span class="info-item__value" style="opacity:0.5">None listed</span>';
    }
  }

  // Charger List
  if (sdChargerList) {
    sdChargerList.innerHTML = '';
    if (station.chargers && station.chargers.length > 0) {
      station.chargers.forEach((ch, idx) => {
        const isAvail = ch.status === 'AVAILABLE';
        const statusClass = isAvail ? 'cr-status--available' : 'cr-status--maintenance';
        
        const el = document.createElement('div');
        el.className = 'charger-row';
        el.innerHTML = `
          <div class="cr-left">
            <div class="cr-info">
              <span class="cr-type">Charger ${idx + 1}</span>
              <span class="cr-power">${ch.powerKW} kW • ${ch.connector}</span>
            </div>
          </div>
          <span class="cr-status ${statusClass}">
            <span class="cr-status-dot"></span>
            ${ch.status}
          </span>
        `;
        sdChargerList.appendChild(el);
      });
    } else {
      sdChargerList.innerHTML = '<p style="color: rgba(0,0,0,0.4); font-size: 13px;">No charger details available.</p>';
    }
  }

  // Map & Booking Actions
  if (btnOpenMaps) {
    btnOpenMaps.onclick = () => {
      const query = encodeURIComponent(`${station.name}, ${station.address}`);
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    };
  }

  if (btnBookSlot) {
    btnBookSlot.href = `booking.html?station=${station.id}`;
  }
}

let mapInstance;
let mapMarker;

window.initMap = function() {
  if (typeof google === 'undefined' || !google.maps) {
    updateMapLocation();
    return;
  }
  const defaultLoc = { lat: 20.5937, lng: 78.9629 }; // Center of India
  try {
    mapInstance = new google.maps.Map(document.getElementById('actualMap'), {
      zoom: 12,
      center: defaultLoc,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: [
        { elementType: "geometry", stylers: [{ color: "#212121" }] },
        { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
        { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#757575" }] },
        { featureType: "administrative.country", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
        { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
        { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
        { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
        { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#181818" }] },
        { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
        { featureType: "poi.park", elementType: "labels.text.stroke", stylers: [{ color: "#1b1b1b" }] },
        { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#2c2c2c" }] },
        { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
        { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#373737" }] },
        { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3c3c3c" }] },
        { featureType: "road.highway.controlled_access", elementType: "geometry", stylers: [{ color: "#4e4e4e" }] },
        { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
        { featureType: "transit", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
        { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3d3d3d" }] }
      ]
    });
  } catch (e) {
    console.warn("Google Maps init error, falling back to OpenStreetMap", e);
  }

  if (currentStation && currentStation.latitude && currentStation.longitude) {
    updateMapLocation();
  }
};

// Catch Google Maps API auth error if placeholder key is used
window.gm_authFailure = function() {
  console.warn("Google Maps Auth Failure - rendering fallback map");
  updateMapLocation();
};

function updateMapLocation() {
  if (!currentStation || !currentStation.latitude || !currentStation.longitude) return;
  const lat = currentStation.latitude;
  const lng = currentStation.longitude;
  const mapEl = document.getElementById('actualMap');
  if (!mapEl) return;

  if (typeof google !== 'undefined' && google.maps && mapInstance) {
    const loc = { lat: lat, lng: lng };
    mapInstance.setCenter(loc);
    mapInstance.setZoom(15);
    
    if (mapMarker) {
      mapMarker.setPosition(loc);
    } else {
      mapMarker = new google.maps.Marker({
        position: loc,
        map: mapInstance,
        title: currentStation.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: '#A1FEA0',
          fillOpacity: 1,
          strokeColor: '#000',
          strokeWeight: 2,
          scale: 8
        }
      });
    }
  } else {
    // Fallback dark interactive map embed
    const bbox = `${lng - 0.008},${lat - 0.008},${lng + 0.008},${lat + 0.008}`;
    mapEl.innerHTML = `
      <iframe 
        width="100%" 
        height="100%" 
        frameborder="0" 
        scrolling="no" 
        marginheight="0" 
        marginwidth="0" 
        src="https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}"
        style="border: none; width: 100%; height: 100%; filter: invert(90%) hue-rotate(180deg) brightness(95%) contrast(90%);">
      </iframe>
    `;
  }
}

function showError() {
  skeletonLoader.style.display = 'none';
  contentWrapper.style.display = 'none';
  errorState.style.display = 'flex';
}
