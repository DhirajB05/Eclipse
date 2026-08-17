/**
 * Eclipse — Dataset Normalization Script
 * 
 * Reads the raw Kaggle CSV (ev-charging-stations-india.csv),
 * parses it properly (handling quoted commas), normalizes fields,
 * infers charger type from station name, generates deterministic
 * simulated data for missing fields, and outputs clean JSON.
 * 
 * Run:  node scripts/normalize-dataset.js
 * Output: data/stations.json
 */

const fs = require('fs');
const path = require('path');

// ─── CSV Parser (handles quoted fields with commas) ──────────
function parseCSV(text) {
  const lines = text.split('\n').filter(l => l.trim());
  const headers = parseCSVLine(lines[0]);
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length < headers.length) continue;

    const row = {};
    headers.forEach((h, idx) => {
      row[h.trim()] = (values[idx] || '').trim();
    });
    rows.push(row);
  }

  return rows;
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else if (ch === '\r') {
      // skip carriage returns
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

// ─── Deterministic hash for consistent simulated data ────────
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + ch;
    hash |= 0; // 32-bit integer
  }
  return Math.abs(hash);
}

// ─── Infer charger type from station name ────────────────────
function inferChargerType(name) {
  const upper = name.toUpperCase();
  if (upper.includes('DC') && upper.includes('AC')) return 'DC + AC';
  if (upper.includes('DC')) return 'DC Fast Charger';
  if (upper.includes('AC')) return 'AC Charger';
  return 'DC Fast Charger'; // default assumption
}

// ─── Connector type mapping ──────────────────────────────────
function inferConnector(chargerType, hash) {
  if (chargerType === 'AC Charger') {
    return ['Type 2', 'Type 1'][hash % 2];
  }
  return ['CCS2', 'CHAdeMO', 'CCS2 + CHAdeMO'][hash % 3];
}

// ─── Power mapping ───────────────────────────────────────────
function inferPowerKW(chargerType, hash) {
  if (chargerType === 'AC Charger') {
    return [3.3, 7.4, 11, 22][hash % 4];
  }
  if (chargerType === 'DC + AC') {
    return [50, 60, 30][hash % 3];
  }
  return [25, 30, 50, 60, 120, 150][hash % 6];
}

// ─── Operating hours ─────────────────────────────────────────
function inferOperatingHours(hash) {
  const options = [
    '24/7',
    '06:00 - 22:00',
    '08:00 - 20:00',
    '05:00 - 23:00',
    '24/7',
    '07:00 - 21:00'
  ];
  return options[hash % options.length];
}

// ─── Price per kWh ───────────────────────────────────────────
function inferPrice(chargerType, hash) {
  if (chargerType === 'AC Charger') {
    return [8, 10, 12, 14][hash % 4]; // INR/kWh
  }
  return [12, 15, 18, 20, 22, 25][hash % 6]; // INR/kWh
}

// ─── Amenities ───────────────────────────────────────────────
function inferAmenities(hash) {
  const all = ['Restroom', 'Café', 'Wi-Fi', 'Parking', 'Waiting Lounge', 'CCTV', 'Air Filling'];
  const count = 2 + (hash % 4); // 2-5 amenities
  const result = [];
  for (let i = 0; i < count; i++) {
    const item = all[(hash + i * 7) % all.length];
    if (!result.includes(item)) result.push(item);
  }
  return result;
}

// ─── Normalize state names ───────────────────────────────────
const VALID_STATES = new Set([
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi',
  'Jammu & Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh',
  'Andaman & Nicobar Islands', 'Dadra & Nagar Haveli', 'Lakshadweep'
]);

function normalizeState(raw) {
  const map = {
    'tamil nadu': 'Tamil Nadu',
    'tamilnadu': 'Tamil Nadu',
    'taminadu': 'Tamil Nadu',
    'delhi ncr': 'Delhi',
    'delhi': 'Delhi',
    'andhra pradesh': 'Andhra Pradesh',
    'andra pradesh': 'Andhra Pradesh',
    'andhrapradesh': 'Andhra Pradesh',
    'maharashtra': 'Maharashtra',
    'maharashra': 'Maharashtra',
    'karnataka': 'Karnataka',
    'kerala': 'Kerala',
    'karala': 'Kerala',
    'haryana': 'Haryana',
    'harayana': 'Haryana',
    'uttar pradesh': 'Uttar Pradesh',
    'telangana': 'Telangana',
    'gujarat': 'Gujarat',
    'rajasthan': 'Rajasthan',
    'west bengal': 'West Bengal',
    'westbengal': 'West Bengal',
    'uttarakhand': 'Uttarakhand',
    'uttrakhand': 'Uttarakhand',
    'uttarkhand': 'Uttarakhand',
    'punjab': 'Punjab',
    'madhya pradesh': 'Madhya Pradesh',
    'odisha': 'Odisha',
    'goa': 'Goa',
    'jharkhand': 'Jharkhand',
    'chhattisgarh': 'Chhattisgarh',
    'chattisgarh': 'Chhattisgarh',
    'himachal pradesh': 'Himachal Pradesh',
    'assam': 'Assam',
    'jammu and kashmir': 'Jammu & Kashmir',
    'jammu': 'Jammu & Kashmir',
    'puducherry': 'Puducherry',
    'pondicherry': 'Puducherry',
    'sikkim': 'Sikkim',
    'chandigarh': 'Chandigarh',
    'bihar': 'Bihar',
    'tripura': 'Tripura',
    'andaman': 'Andaman & Nicobar Islands'
  };

  const cleaned = raw.toLowerCase().trim()
    .replace(/\u00a0/g, ' ')   // non-breaking space
    .replace(/\s+/g, ' ');
  
  const mapped = map[cleaned];
  if (mapped) return mapped;

  // If the raw value is already a valid state, return it
  const titleCase = raw.trim();
  if (VALID_STATES.has(titleCase)) return titleCase;

  // Otherwise return null to signal this row has bad state data
  return null;
}

// ─── MAIN ────────────────────────────────────────────────────
function main() {
  const csvPath = path.join(__dirname, '..', 'data', 'ev-charging-stations-india.csv');
  const outPath = path.join(__dirname, '..', 'data', 'stations.json');

  console.log('Reading CSV...');
  const raw = fs.readFileSync(csvPath, 'utf8');
  const rows = parseCSV(raw);
  console.log(`Parsed ${rows.length} raw rows`);

  // Validate and normalize
  const stations = [];
  const seen = new Set(); // deduplicate by name+lat+lng
  let skipped = 0;

  for (const row of rows) {
    const name = (row.name || '').trim();
    const lat = parseFloat(row.lattitude);
    const lng = parseFloat(row.longitude);
    const state = normalizeState(row.state || '');
    const city = (row.city || '').trim();
    const address = (row.address || '').trim();

    // Skip invalid rows
    if (!name || isNaN(lat) || isNaN(lng) || !state || !city) {
      skipped++;
      continue;
    }

    // Skip obviously bad coordinates (not in India range)
    if (lat < 6 || lat > 36 || lng < 68 || lng > 98) {
      skipped++;
      continue;
    }

    // Deduplicate
    const key = `${name}|${lat}|${lng}`;
    if (seen.has(key)) {
      skipped++;
      continue;
    }
    seen.add(key);

    const hash = simpleHash(name + city);
    const chargerType = inferChargerType(name);
    const connector = inferConnector(chargerType, hash);
    const powerKW = inferPowerKW(chargerType, hash);
    const totalChargers = 2 + (hash % 6); // 2-7 chargers

    stations.push({
      id: stations.length + 1,
      name,
      state,
      city,
      address,
      latitude: lat,
      longitude: lng,
      chargerType,
      connectorType: connector,
      powerKW,
      operatingHours: inferOperatingHours(hash),
      totalChargers,
      pricePerKWh: inferPrice(chargerType, hash),
      amenities: inferAmenities(hash),
      contact: `+91-${String(8000000000 + (hash % 2000000000)).slice(0, 10)}`
    });
  }

  console.log(`\nNormalization complete:`);
  console.log(`  Valid stations: ${stations.length}`);
  console.log(`  Skipped rows:  ${skipped}`);
  console.log(`  States:        ${new Set(stations.map(s => s.state)).size}`);
  console.log(`  Cities:        ${new Set(stations.map(s => s.city)).size}`);

  // Charger type breakdown
  const typeCounts = {};
  stations.forEach(s => {
    typeCounts[s.chargerType] = (typeCounts[s.chargerType] || 0) + 1;
  });
  console.log(`\nCharger type distribution:`);
  Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).forEach(([t, c]) => {
    console.log(`  ${t}: ${c}`);
  });

  // Write output
  fs.writeFileSync(outPath, JSON.stringify(stations, null, 2), 'utf8');
  console.log(`\nWritten to: ${outPath}`);
}

main();
