const fs = require('fs');
const path = require('path');
const statesData = require('../src/data/indiaGeographicStates.json');
const allMpsDetailed = require('../src/data/allMpsDetailed.json');

// Canonical State Mapping Table
const STATE_CODE_TO_NAMES = {
  'an': { stateId: 'IN-AN', stateCode: 'AN', stateName: 'Andaman and Nicobar Islands', dbStateNames: ['Andaman And Nicobar Islands', 'Andaman and Nicobar Islands'] },
  'ap': { stateId: 'IN-AP', stateCode: 'AP', stateName: 'Andhra Pradesh', dbStateNames: ['Andhra Pradesh'] },
  'ar': { stateId: 'IN-AR', stateCode: 'AR', stateName: 'Arunachal Pradesh', dbStateNames: ['Arunachal Pradesh'] },
  'as': { stateId: 'IN-AS', stateCode: 'AS', stateName: 'Assam', dbStateNames: ['Assam'] },
  'br': { stateId: 'IN-BR', stateCode: 'BR', stateName: 'Bihar', dbStateNames: ['Bihar'] },
  'ch': { stateId: 'IN-CH', stateCode: 'CH', stateName: 'Chandigarh', dbStateNames: ['Chandigarh'] },
  'ct': { stateId: 'IN-CT', stateCode: 'CT', stateName: 'Chhattisgarh', dbStateNames: ['Chhattisgarh'] },
  'dn': { stateId: 'IN-DH', stateCode: 'DH', stateName: 'Dadra and Nagar Haveli', dbStateNames: ['The Dadra And Nagar Haveli And Daman And Diu', 'Dadra and Nagar Haveli', 'Dadra And Nagar Haveli'] },
  'dd': { stateId: 'IN-DD', stateCode: 'DD', stateName: 'Daman and Diu', dbStateNames: ['The Dadra And Nagar Haveli And Daman And Diu', 'Daman and Diu', 'Daman And Diu'] },
  'dl': { stateId: 'IN-DL', stateCode: 'DL', stateName: 'Delhi', dbStateNames: ['Delhi'] },
  'ga': { stateId: 'IN-GA', stateCode: 'GA', stateName: 'Goa', dbStateNames: ['Goa'] },
  'gj': { stateId: 'IN-GJ', stateCode: 'GJ', stateName: 'Gujarat', dbStateNames: ['Gujarat'] },
  'hr': { stateId: 'IN-HR', stateCode: 'HR', stateName: 'Haryana', dbStateNames: ['Haryana'] },
  'hp': { stateId: 'IN-HP', stateCode: 'HP', stateName: 'Himachal Pradesh', dbStateNames: ['Himachal Pradesh'] },
  'jk': { stateId: 'IN-JK', stateCode: 'JK', stateName: 'Jammu and Kashmir', dbStateNames: ['Jammu And Kashmir', 'Jammu and Kashmir'] },
  'jh': { stateId: 'IN-JH', stateCode: 'JH', stateName: 'Jharkhand', dbStateNames: ['Jharkhand'] },
  'ka': { stateId: 'IN-KA', stateCode: 'KA', stateName: 'Karnataka', dbStateNames: ['Karnataka'] },
  'kl': { stateId: 'IN-KL', stateCode: 'KL', stateName: 'Kerala', dbStateNames: ['Kerala'] },
  'ld': { stateId: 'IN-LD', stateCode: 'LD', stateName: 'Lakshadweep', dbStateNames: ['Lakshadweep'] },
  'mp': { stateId: 'IN-MP', stateCode: 'MP', stateName: 'Madhya Pradesh', dbStateNames: ['Madhya Pradesh'] },
  'mh': { stateId: 'IN-MH', stateCode: 'MH', stateName: 'Maharashtra', dbStateNames: ['Maharashtra'] },
  'mn': { stateId: 'IN-MN', stateCode: 'MN', stateName: 'Manipur', dbStateNames: ['Manipur'] },
  'ml': { stateId: 'IN-ML', stateCode: 'ML', stateName: 'Meghalaya', dbStateNames: ['Meghalaya'] },
  'mz': { stateId: 'IN-MZ', stateCode: 'MZ', stateName: 'Mizoram', dbStateNames: ['Mizoram'] },
  'nl': { stateId: 'IN-NL', stateCode: 'NL', stateName: 'Nagaland', dbStateNames: ['Nagaland'] },
  'or': { stateId: 'IN-OR', stateCode: 'OR', stateName: 'Odisha', dbStateNames: ['Odisha'] },
  'py': { stateId: 'IN-PY', stateCode: 'PY', stateName: 'Puducherry', dbStateNames: ['Puducherry'] },
  'pb': { stateId: 'IN-PB', stateCode: 'PB', stateName: 'Punjab', dbStateNames: ['Punjab'] },
  'rj': { stateId: 'IN-RJ', stateCode: 'RJ', stateName: 'Rajasthan', dbStateNames: ['Rajasthan'] },
  'sk': { stateId: 'IN-SK', stateCode: 'SK', stateName: 'Sikkim', dbStateNames: ['Sikkim'] },
  'tn': { stateId: 'IN-TN', stateCode: 'TN', stateName: 'Tamil Nadu', dbStateNames: ['Tamil Nadu'] },
  'tg': { stateId: 'IN-TG', stateCode: 'TG', stateName: 'Telangana', dbStateNames: ['Telangana'] },
  'tr': { stateId: 'IN-TR', stateCode: 'TR', stateName: 'Tripura', dbStateNames: ['Tripura'] },
  'up': { stateId: 'IN-UP', stateCode: 'UP', stateName: 'Uttar Pradesh', dbStateNames: ['Uttar Pradesh'] },
  'ut': { stateId: 'IN-UT', stateCode: 'UT', stateName: 'Uttarakhand', dbStateNames: ['Uttarakhand'] },
  'wb': { stateId: 'IN-WB', stateCode: 'WB', stateName: 'West Bengal', dbStateNames: ['West Bengal'] }
};

// SVG Path parser
function parseSvgPathToPolygons(d) {
  const commands = d.match(/([a-df-z]|[-+]?[0-9]*\.?[0-9]+(?:e[-+]?[0-9]+)?)/gi) || [];
  const polygons = [];
  let currentPoly = [];
  let currentX = 0, currentY = 0, startX = 0, startY = 0;
  
  let i = 0;
  while (i < commands.length) {
    const token = commands[i];
    if (token === 'm') {
      if (currentPoly.length > 2) polygons.push(currentPoly);
      currentPoly = [];
      const dx = parseFloat(commands[++i]);
      const dy = parseFloat(commands[++i]);
      currentX += dx;
      currentY += dy;
      startX = currentX;
      startY = currentY;
      currentPoly.push([currentX, currentY]);
    } else if (token === 'l') {
      const dx = parseFloat(commands[++i]);
      const dy = parseFloat(commands[++i]);
      currentX += dx;
      currentY += dy;
      currentPoly.push([currentX, currentY]);
    } else if (token === 'L') {
      const x = parseFloat(commands[++i]);
      const y = parseFloat(commands[++i]);
      currentX = x;
      currentY = y;
      currentPoly.push([currentX, currentY]);
    } else if (token === 'z' || token === 'Z') {
      currentX = startX;
      currentY = startY;
      if (currentPoly.length > 2) polygons.push(currentPoly);
      currentPoly = [];
    } else if (!isNaN(parseFloat(token))) {
      const dx = parseFloat(token);
      const dy = parseFloat(commands[++i]);
      currentX += dx;
      currentY += dy;
      currentPoly.push([currentX, currentY]);
    }
    i++;
  }
  if (currentPoly.length > 2) polygons.push(currentPoly);
  return polygons;
}

// Ray-casting point-in-polygon
function pointInPolygon(point, vs) {
  const x = point[0], y = point[1];
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0], yi = vs[i][1];
    const xj = vs[j][0], yj = vs[j][1];
    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

const statePolygonsMap = statesData.states.map(state => ({
  id: state.id,
  name: state.name,
  cx: state.cx,
  cy: state.cy,
  minX: state.minX,
  maxX: state.maxX,
  minY: state.minY,
  maxY: state.maxY,
  polygons: parseSvgPathToPolygons(state.path)
}));

function isPointInState(x, y, stateId) {
  const stateObj = statePolygonsMap.find(s => s.id === stateId);
  if (!stateObj) return false;
  for (const poly of stateObj.polygons) {
    if (pointInPolygon([x, y], poly)) return true;
  }
  return false;
}

// Linear Affine Projection Formulas (WGS84 lat/lng <-> SVG x/y)
// x = -1402.9919 + 20.6804 * lng - 0.2381 * lat
// y = 835.0225 + 0.4652 * lng - 23.1695 * lat
function geoToSvg(lat, lng) {
  const x = -1402.9919 + 20.6804 * lng - 0.2381 * lat;
  const y = 835.0225 + 0.4652 * lng - 23.1695 * lat;
  return { x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) };
}

function svgToGeo(x, y) {
  // Inverse affine transformation
  // x - c0 = c1*lng + c2*lat
  // y - d0 = d1*lng + d2*lat
  const c0 = -1402.9919, c1 = 20.6804, c2 = -0.2381;
  const d0 = 835.0225, d1 = 0.4652, d2 = -23.1695;
  const det = c1 * d2 - c2 * d1;
  const dx = x - c0;
  const dy = y - d0;
  const lng = (dx * d2 - dy * c2) / det;
  const lat = (c1 * dy - d1 * dx) / det;
  return { lat: Number(lat.toFixed(4)), lng: Number(lng.toFixed(4)) };
}

// Generate pointy-topped regular hexagon SVG path
function createHexPath(cx, cy, radius) {
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i + 30);
    const px = (cx + radius * Math.cos(angle)).toFixed(1);
    const py = (cy + radius * Math.sin(angle)).toFixed(1);
    pts.push(`${px},${py}`);
  }
  return `M ${pts[0]} L ${pts[1]} L ${pts[2]} L ${pts[3]} L ${pts[4]} L ${pts[5]} Z`;
}

module.exports = {
  STATE_CODE_TO_NAMES,
  statePolygonsMap,
  isPointInState,
  geoToSvg,
  svgToGeo,
  createHexPath
};
