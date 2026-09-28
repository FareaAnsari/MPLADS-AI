const fs = require('fs');
const path = require('path');

const lsMesh = require('../src/data/indiaConstituenciesMesh.json');
const rsMesh = require('../src/data/indiaRajyaSabhaMesh.json');

console.log('================ GEOSPATIAL INTEGRITY AUDIT ================');

let errors = 0;
let warnings = 0;

// 1. Total counts
console.log(`Total Lok Sabha Constituencies: ${lsMesh.length}`);
console.log(`Total Rajya Sabha Seats: ${rsMesh.length}`);

if (lsMesh.length !== 543) {
  console.error(`[ERROR] Expected 543 Lok Sabha constituencies, found ${lsMesh.length}`);
  errors++;
}

// 2. Uniqueness of IDs
const lsIds = new Set();
const lsGeoIds = new Set();
lsMesh.forEach(c => {
  if (lsIds.has(c.id)) {
    console.error(`[ERROR] Duplicate ID found: ${c.id}`);
    errors++;
  }
  lsIds.add(c.id);

  if (lsGeoIds.has(c.geoId)) {
    console.error(`[ERROR] Duplicate GeoID found: ${c.geoId}`);
    errors++;
  }
  lsGeoIds.add(c.geoId);
});

// 3. Coordinate bounds validation
lsMesh.forEach(c => {
  if (typeof c.latitude !== 'number' || typeof c.longitude !== 'number') {
    console.error(`[ERROR] Missing or non-numeric coordinates for ${c.name} (${c.id})`);
    errors++;
    return;
  }
  if (c.latitude < 8.0 || c.latitude > 37.5) {
    console.error(`[ERROR] Latitude out of bounds for ${c.name}: ${c.latitude}`);
    errors++;
  }
  if (c.longitude < 68.0 || c.longitude > 97.5) {
    console.error(`[ERROR] Longitude out of bounds for ${c.name}: ${c.longitude}`);
    errors++;
  }
  if (typeof c.x !== 'number' || typeof c.y !== 'number' || isNaN(c.x) || isNaN(c.y)) {
    console.error(`[ERROR] Invalid SVG x/y for ${c.name}: x=${c.x}, y=${c.y}`);
    errors++;
  }
  if (!c.state || !c.stateCode || !c.house || !c.mpName) {
    console.error(`[ERROR] Incomplete metadata for ${c.name} (${c.id})`);
    errors++;
  }
});

// 4. Specific Landmark Verifications
const checkLandmark = (name, expectedState, minLat, maxLat, minLng, maxLng) => {
  const match = lsMesh.find(c => c.name.toUpperCase().includes(name.toUpperCase()));
  if (!match) {
    console.error(`[ERROR] Landmark constituency "${name}" not found in mesh!`);
    errors++;
    return;
  }
  if (!match.state.toLowerCase().includes(expectedState.toLowerCase()) && 
      !expectedState.toLowerCase().includes(match.state.toLowerCase())) {
    console.error(`[ERROR] Landmark "${name}" state mismatch: expected ${expectedState}, got ${match.state}`);
    errors++;
  }
  if (match.latitude < minLat || match.latitude > maxLat || match.longitude < minLng || match.longitude > maxLng) {
    console.error(`[ERROR] Landmark "${name}" coordinates out of expected range: (${match.latitude}, ${match.longitude})`);
    errors++;
  } else {
    console.log(`[PASS] Landmark "${name}" verified at (${match.latitude}° N, ${match.longitude}° E) in ${match.state}`);
  }
};

console.log('\n--- Checking Key Landmarks ---');
checkLandmark('BHIWANDI', 'Maharashtra', 19.0, 19.6, 72.8, 73.4);
checkLandmark('MUMBAI NORTH', 'Maharashtra', 19.0, 19.4, 72.7, 73.1);
checkLandmark('MUMBAI SOUTH', 'Maharashtra', 18.8, 19.2, 72.7, 73.1);
checkLandmark('NAGPUR', 'Maharashtra', 20.8, 21.5, 78.8, 79.4);
checkLandmark('PUNE', 'Maharashtra', 18.2, 18.8, 73.6, 74.2);
checkLandmark('NEW DELHI', 'Delhi', 28.4, 28.8, 77.0, 77.4);
checkLandmark('BANGALORE CENTRAL', 'Karnataka', 12.8, 13.2, 77.4, 77.8);
checkLandmark('CHENNAI CENTRAL', 'Tamil Nadu', 12.9, 13.3, 80.1, 80.5);
checkLandmark('KOLKATA DAKSHIN', 'West Bengal', 22.3, 22.7, 88.1, 88.5);

console.log('\n================ AUDIT SUMMARY ================');
console.log(`Total Constituencies Checked: ${lsMesh.length}`);
console.log(`Errors Found: ${errors}`);
console.log(`Warnings Found: ${warnings}`);

if (errors > 0) {
  process.exit(1);
} else {
  console.log('✅ ALL GEOSPATIAL & DATA INTEGRITY TESTS PASSED!');
}
