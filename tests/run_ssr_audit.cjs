// Comprehensive browser polyfill for Leaflet, SVG, charting & localStorage
const noop = () => {};

const docObj = {
  documentElement: { 
    style: {},
    classList: { add: noop, remove: noop, contains: () => false }
  },
  createElement: (tag) => ({
    style: {},
    setAttribute: noop,
    getAttribute: () => null,
    appendChild: noop,
    removeChild: noop,
    classList: { add: noop, remove: noop, contains: () => false },
    getContext: () => ({ fillRect: noop, clearRect: noop, getImageData: () => ({ data: [] }), putImageData: noop, createImageData: () => ([]), setTransform: noop, drawImage: noop, save: noop, text: noop, fillText: noop, restore: noop, beginPath: noop, moveTo: noop, lineTo: noop, closePath: noop, stroke: noop, strokeRect: noop, strokeText: noop, fill: noop, arc: noop }),
  }),
  createElementNS: (ns, tag) => ({
    style: {},
    setAttribute: noop,
    getAttribute: () => null,
    appendChild: noop,
    removeChild: noop,
  }),
  getElementsByTagName: () => [],
  getElementById: () => null,
  addEventListener: noop,
  removeEventListener: noop,
};

global.screen = {
  deviceXDPI: 96,
  logicalXDPI: 96,
  width: 1920,
  height: 1080
};

const store = new Map();
global.localStorage = {
  getItem: (k) => store.get(k) || null,
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear(),
};

global.window = {
  requestAnimationFrame: (cb) => setTimeout(cb, 16),
  cancelAnimationFrame: (id) => clearTimeout(id),
  addEventListener: noop,
  removeEventListener: noop,
  dispatchEvent: noop,
  speechSynthesis: { speak: noop, cancel: noop },
  location: { href: 'http://localhost:5173/' },
  print: noop,
  document: docObj,
  navigator: { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
  screen: global.screen,
  devicePixelRatio: 1,
  localStorage: global.localStorage
};

global.document = docObj;
global.navigator = global.window.navigator;

// Dynamically import compiled bundle
import('../dist-test-ssr/render_all_pages.js')
  .catch((err) => {
    console.error('Audit execution error:', err);
    process.exit(1);
  });
