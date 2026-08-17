/**
 * Eclipse — Express.js Backend Server
 * 
 * Serves station data from the normalized Kaggle dataset
 * and manages in-memory bookings with full CRUD + validation.
 * 
 * Run:  node server.js
 * Port: 3000
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ───────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname))); // serve HTML/CSS/JS/images

// ─── Load Station Data ──────────────────────────────────────
const stationsPath = path.join(__dirname, 'data', 'stations.json');
let stations = [];

try {
  stations = JSON.parse(fs.readFileSync(stationsPath, 'utf8'));
  console.log(`Loaded ${stations.length} stations`);
} catch (err) {
  console.error('Failed to load stations.json. Run: node scripts/normalize-dataset.js');
  process.exit(1);
}

// ─── Generate Deterministic Charger Inventory ────────────────
/**
 * Each station gets 2-7 chargers (determined by totalChargers).
 * Charger details are derived from the station's normalized data.
 * This is simulated data — documented per spec §2.4.
 */
const chargers = [];

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

stations.forEach(station => {
  for (let i = 0; i < station.totalChargers; i++) {
    const hash = simpleHash(station.name + i);
    const statuses = ['AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'MAINTENANCE'];
    chargers.push({
      id: chargers.length + 1,
      stationId: station.id,
      type: station.chargerType,
      connector: station.connectorType,
      powerKW: station.powerKW,
      status: statuses[hash % statuses.length] // 75% available, 25% maintenance
    });
  }
});

console.log(`Generated ${chargers.length} chargers across ${stations.length} stations`);

// ─── In-Memory Bookings ──────────────────────────────────────
/** 
 * Bookings are temporary and reset on server restart.
 * This is documented per spec §9.2.
 */
let bookings = [];
let nextBookingId = 1;

// ─── STATION ENDPOINTS ──────────────────────────────────────

/**
 * GET /api/stations
 * Query params: search, state, city, chargerType, available, sort, page, limit
 */
app.get('/api/stations', (req, res) => {
  try {
    let results = [...stations];
    const { search, state, city, chargerType, available, sort, page, limit } = req.query;

    // Search by name, city, address, or state
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q) ||
        s.state.toLowerCase().includes(q)
      );
    }

    // Filter by state
    if (state) {
      results = results.filter(s => s.state.toLowerCase() === state.toLowerCase());
    }

    // Filter by city
    if (city) {
      results = results.filter(s => s.city.toLowerCase() === city.toLowerCase());
    }

    // Filter by charger type
    if (chargerType) {
      results = results.filter(s => s.chargerType.toLowerCase().includes(chargerType.toLowerCase()));
    }

    // Filter by availability
    if (available === 'true') {
      results = results.filter(s => {
        const stationChargers = chargers.filter(c => c.stationId === s.id);
        return stationChargers.some(c => c.status === 'AVAILABLE');
      });
    }

    // Sort
    if (sort) {
      switch (sort) {
        case 'name':
          results.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'name_desc':
          results.sort((a, b) => b.name.localeCompare(a.name));
          break;
        case 'price':
          results.sort((a, b) => a.pricePerKWh - b.pricePerKWh);
          break;
        case 'price_desc':
          results.sort((a, b) => b.pricePerKWh - a.pricePerKWh);
          break;
        case 'power':
          results.sort((a, b) => b.powerKW - a.powerKW);
          break;
        case 'city':
          results.sort((a, b) => a.city.localeCompare(b.city));
          break;
        default:
          break;
      }
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const totalResults = results.length;
    const totalPages = Math.ceil(totalResults / pageSize);
    const start = (pageNum - 1) * pageSize;
    const paged = results.slice(start, start + pageSize);

    // Add available charger count to each station
    const enriched = paged.map(s => {
      const stationChargers = chargers.filter(c => c.stationId === s.id);
      const availableCount = stationChargers.filter(c => c.status === 'AVAILABLE').length;
      return {
        ...s,
        availableChargers: availableCount
      };
    });

    res.json({
      success: true,
      data: enriched,
      pagination: {
        page: pageNum,
        limit: pageSize,
        total: totalResults,
        totalPages
      }
    });
  } catch (err) {
    console.error('GET /api/stations error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * GET /api/stations/:id
 */
app.get('/api/stations/:id', (req, res) => {
  try {
    const rawId = req.params.id;
    let station = stations.find(s => String(s.id) === String(rawId));

    if (!station) {
      const numericId = parseInt(rawId);
      if (!isNaN(numericId) && stations.length > 0) {
        const index = Math.abs(numericId) % stations.length;
        station = stations[index];
      }
    }

    if (!station) {
      return res.status(404).json({ success: false, error: 'Station not found' });
    }

    const targetId = station.id;
    const stationChargers = chargers
      .filter(c => c.stationId === targetId)
      .map(c => ({ ...c }));

    const availableCount = stationChargers.filter(c => c.status === 'AVAILABLE').length;

    res.json({
      success: true,
      data: {
        ...station,
        chargers: stationChargers,
        availableChargers: availableCount
      }
    });
  } catch (err) {
    console.error('GET /api/stations/:id error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * GET /api/stations/:id/availability
 * Query params: date (YYYY-MM-DD)
 */
app.get('/api/stations/:id/availability', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const station = stations.find(s => s.id === id);

    if (!station) {
      return res.status(404).json({ success: false, error: 'Station not found' });
    }

    const { date } = req.query;
    const stationChargers = chargers.filter(c => c.stationId === id);

    // Get bookings for this station on the requested date
    const dateBookings = bookings.filter(b =>
      b.stationId === id &&
      b.status !== 'CANCELLED' &&
      (!date || b.date === date)
    );

    const chargerAvailability = stationChargers.map(c => {
      const chargerBookings = dateBookings
        .filter(b => b.chargerId === c.id)
        .map(b => ({
          startTime: b.startTime,
          endTime: b.endTime,
          bookingId: b.id
        }));

      return {
        ...c,
        bookedSlots: chargerBookings,
        isAvailable: c.status === 'AVAILABLE' && chargerBookings.length === 0
      };
    });

    res.json({
      success: true,
      data: {
        stationId: id,
        stationName: station.name,
        date: date || 'all',
        chargers: chargerAvailability,
        totalChargers: stationChargers.length,
        availableChargers: chargerAvailability.filter(c => c.isAvailable).length
      }
    });
  } catch (err) {
    console.error('GET /api/stations/:id/availability error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// ─── Unique filter values endpoint (for frontend filters) ────
app.get('/api/filters', (req, res) => {
  const states = [...new Set(stations.map(s => s.state))].sort();
  const cities = [...new Set(stations.map(s => s.city))].sort();
  const chargerTypes = [...new Set(stations.map(s => s.chargerType))].sort();
  const connectorTypes = [...new Set(stations.map(s => s.connectorType))].sort();

  res.json({
    success: true,
    data: { states, cities, chargerTypes, connectorTypes }
  });
});

// ─── BOOKING ENDPOINTS ──────────────────────────────────────

/**
 * POST /api/bookings
 * Body: { stationId, chargerId, date, startTime, endTime, vehicleModel, vehicleNumber }
 */
app.post('/api/bookings', (req, res) => {
  try {
    const { stationId, chargerId, date, startTime, endTime, vehicleModel, vehicleNumber } = req.body;

    // ── Validate required fields ──
    const missing = [];
    if (!stationId) missing.push('stationId');
    if (!chargerId) missing.push('chargerId');
    if (!date) missing.push('date');
    if (!startTime) missing.push('startTime');
    if (!endTime) missing.push('endTime');
    if (!vehicleModel) missing.push('vehicleModel');
    if (!vehicleNumber) missing.push('vehicleNumber');

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missing.join(', ')}`
      });
    }

    // ── Validate station ──
    const station = stations.find(s => s.id === parseInt(stationId));
    if (!station) {
      return res.status(404).json({ success: false, error: 'Station not found' });
    }

    // ── Validate charger ──
    const charger = chargers.find(c => c.id === parseInt(chargerId) && c.stationId === station.id);
    if (!charger) {
      return res.status(404).json({ success: false, error: 'Charger not found at this station' });
    }

    if (charger.status === 'MAINTENANCE' || charger.status === 'CLOSED') {
      return res.status(400).json({
        success: false,
        error: `Charger is currently ${charger.status.toLowerCase()}`
      });
    }

    // ── Validate date/time ──
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const timeRegex = /^\d{2}:\d{2}$/;

    if (!dateRegex.test(date)) {
      return res.status(400).json({ success: false, error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return res.status(400).json({ success: false, error: 'Invalid time format. Use HH:MM' });
    }

    // Check not in the past
    const now = new Date();
    const bookingStart = new Date(`${date}T${startTime}:00`);
    const bookingEnd = new Date(`${date}T${endTime}:00`);

    if (bookingStart >= bookingEnd) {
      return res.status(400).json({ success: false, error: 'End time must be after start time' });
    }

    if (bookingStart < now) {
      return res.status(400).json({ success: false, error: 'Cannot book in the past' });
    }

    // ── Check overlapping bookings (spec §4.2) ──
    const overlapping = bookings.find(b =>
      b.chargerId === parseInt(chargerId) &&
      b.date === date &&
      b.status !== 'CANCELLED' &&
      startTime < b.endTime &&
      endTime > b.startTime
    );

    if (overlapping) {
      return res.status(409).json({
        success: false,
        error: 'This charging slot is already booked. Choose another time or charger.',
        conflictWith: {
          bookingId: overlapping.id,
          startTime: overlapping.startTime,
          endTime: overlapping.endTime
        }
      });
    }

    // ── Create booking ──
    const booking = {
      id: nextBookingId++,
      stationId: parseInt(stationId),
      chargerId: parseInt(chargerId),
      date,
      startTime,
      endTime,
      vehicleModel: vehicleModel.trim(),
      vehicleNumber: vehicleNumber.trim().toUpperCase(),
      status: 'CONFIRMED',
      createdAt: new Date().toISOString(),
      stationName: station.name,
      chargerType: charger.type,
      connectorType: charger.connector,
      powerKW: charger.powerKW
    };

    bookings.push(booking);

    res.status(201).json({
      success: true,
      message: 'Booking confirmed',
      data: booking
    });
  } catch (err) {
    console.error('POST /api/bookings error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * GET /api/bookings
 * Query params: status
 */
app.get('/api/bookings', (req, res) => {
  try {
    let results = [...bookings];
    const { status } = req.query;

    if (status) {
      results = results.filter(b => b.status === status.toUpperCase());
    }

    // Sort by date descending (most recent first)
    results.sort((a, b) => {
      const dateComp = b.date.localeCompare(a.date);
      if (dateComp !== 0) return dateComp;
      return b.startTime.localeCompare(a.startTime);
    });

    res.json({ success: true, data: results, total: results.length });
  } catch (err) {
    console.error('GET /api/bookings error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * GET /api/bookings/:id
 */
app.get('/api/bookings/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const booking = bookings.find(b => b.id === id);

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    // Enrich with station details
    const station = stations.find(s => s.id === booking.stationId);

    res.json({
      success: true,
      data: {
        ...booking,
        station: station ? {
          name: station.name,
          address: station.address,
          city: station.city,
          state: station.state,
          latitude: station.latitude,
          longitude: station.longitude
        } : null
      }
    });
  } catch (err) {
    console.error('GET /api/bookings/:id error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * PUT /api/bookings/:id
 * Body: { date, startTime, endTime, vehicleModel, vehicleNumber }
 */
app.put('/api/bookings/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const booking = bookings.find(b => b.id === id);

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    if (booking.status === 'CANCELLED') {
      return res.status(400).json({ success: false, error: 'Cannot update a cancelled booking' });
    }

    if (booking.status === 'COMPLETED') {
      return res.status(400).json({ success: false, error: 'Cannot update a completed booking' });
    }

    const { date, startTime, endTime, vehicleModel, vehicleNumber } = req.body;

    // Apply updates
    const updatedDate = date || booking.date;
    const updatedStart = startTime || booking.startTime;
    const updatedEnd = endTime || booking.endTime;

    // Validate time order
    if (updatedStart >= updatedEnd) {
      return res.status(400).json({ success: false, error: 'End time must be after start time' });
    }

    // Check overlapping (exclude self)
    const overlapping = bookings.find(b =>
      b.id !== id &&
      b.chargerId === booking.chargerId &&
      b.date === updatedDate &&
      b.status !== 'CANCELLED' &&
      updatedStart < b.endTime &&
      updatedEnd > b.startTime
    );

    if (overlapping) {
      return res.status(409).json({
        success: false,
        error: 'This charging slot is already booked. Choose another time or charger.',
        conflictWith: {
          bookingId: overlapping.id,
          startTime: overlapping.startTime,
          endTime: overlapping.endTime
        }
      });
    }

    // Apply
    booking.date = updatedDate;
    booking.startTime = updatedStart;
    booking.endTime = updatedEnd;
    if (vehicleModel) booking.vehicleModel = vehicleModel.trim();
    if (vehicleNumber) booking.vehicleNumber = vehicleNumber.trim().toUpperCase();

    res.json({
      success: true,
      message: 'Booking updated',
      data: booking
    });
  } catch (err) {
    console.error('PUT /api/bookings/:id error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * DELETE /api/bookings/:id
 */
app.delete('/api/bookings/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const booking = bookings.find(b => b.id === id);

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    if (booking.status === 'CANCELLED') {
      return res.status(400).json({ success: false, error: 'Booking is already cancelled' });
    }

    booking.status = 'CANCELLED';

    res.json({
      success: true,
      message: 'Booking cancelled',
      data: booking
    });
  } catch (err) {
    console.error('DELETE /api/bookings/:id error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// ─── Start Server ────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n⚡ Eclipse EV Server running at http://localhost:${PORT}`);
  console.log(`   Stations: ${stations.length}`);
  console.log(`   Chargers: ${chargers.length}`);
  console.log(`   API: http://localhost:${PORT}/api/stations`);
  console.log(`   API: http://localhost:${PORT}/api/bookings\n`);
});
