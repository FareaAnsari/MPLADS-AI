function calculatePopupPosition(anchorPoint, popupSize, mapBounds, margin = 14) {
  const { width: pWidth, height: pHeight } = popupSize;
  const { width: mWidth, height: mHeight } = mapBounds;

  let isFlippedX = false;
  let isFlippedY = false;

  let left = anchorPoint.x - pWidth / 2;
  let horizPlacement = 'center';

  if (anchorPoint.x - pWidth / 2 < margin + 12) {
    left = anchorPoint.x + 20;
    horizPlacement = 'right';
    isFlippedX = true;
  } else if (anchorPoint.x + pWidth / 2 > mWidth - margin - 12) {
    left = anchorPoint.x - pWidth - 20;
    horizPlacement = 'left';
    isFlippedX = true;
  }

  const clampedLeft = Math.max(margin, Math.min(mWidth - pWidth - margin, left));

  let top = anchorPoint.y - pHeight - 16;
  let vertPlacement = 'top';

  if (anchorPoint.y - pHeight - 16 < margin) {
    top = anchorPoint.y + 20;
    vertPlacement = 'bottom';
    isFlippedY = true;
  }

  const clampedTop = Math.max(margin, Math.min(mHeight - pHeight - margin, top));
  const placement = `${vertPlacement}-${horizPlacement}`;

  return {
    left: Math.round(clampedLeft),
    top: Math.round(clampedTop),
    placement,
    isFlippedX,
    isFlippedY
  };
}

console.log('=== RUNNING POPUP POSITIONING COLLISION TESTS ===\n');

let failed = 0;
function assert(cond, msg) {
  if (!cond) {
    console.error(`❌ FAIL: ${msg}`);
    failed++;
  }
}

const mapBounds = { width: 600, height: 550 };
const popupSize = { width: 260, height: 120 };
const margin = 14;

// Test 1: Left-edge collision (anchor at x = 30, y = 250)
const leftEdge = calculatePopupPosition({ x: 30, y: 250 }, popupSize, mapBounds, margin);
console.log('Test 1 (Left Edge near Gujarat/Maharashtra):', leftEdge);
assert(leftEdge.left >= margin, `Left edge overflow: ${leftEdge.left} < ${margin}`);
assert(leftEdge.left + popupSize.width <= mapBounds.width - margin, 'Exceeds right boundary');
assert(leftEdge.isFlippedX, 'Should flip X when near left edge');

// Test 2: Right-edge collision (anchor at x = 580, y = 250)
const rightEdge = calculatePopupPosition({ x: 580, y: 250 }, popupSize, mapBounds, margin);
console.log('Test 2 (Right Edge near Northeast/Assam):', rightEdge);
assert(rightEdge.left >= margin, `Left edge underflow: ${rightEdge.left} < ${margin}`);
assert(rightEdge.left + popupSize.width <= mapBounds.width - margin, `Right edge overflow: ${rightEdge.left + popupSize.width} > ${mapBounds.width - margin}`);
assert(rightEdge.isFlippedX, 'Should flip X when near right edge');

// Test 3: Top-edge collision (anchor at x = 300, y = 40 near Kashmir/Ladakh)
const topEdge = calculatePopupPosition({ x: 300, y: 40 }, popupSize, mapBounds, margin);
console.log('Test 3 (Top Edge near Ladakh/J&K):', topEdge);
assert(topEdge.top >= margin, `Top edge underflow: ${topEdge.top} < ${margin}`);
assert(topEdge.top + popupSize.height <= mapBounds.height - margin, 'Bottom overflow when top edge');
assert(topEdge.isFlippedY, 'Should flip Y below anchor when near top edge');

// Test 4: Bottom-edge collision (anchor at x = 300, y = 520 near Kanyakumari/Kerala)
const bottomEdge = calculatePopupPosition({ x: 300, y: 520 }, popupSize, mapBounds, margin);
console.log('Test 4 (Bottom Edge near Tamil Nadu/Kerala):', bottomEdge);
assert(bottomEdge.top >= margin, 'Top underflow');
assert(bottomEdge.top + popupSize.height <= mapBounds.height - margin, `Bottom edge overflow: ${bottomEdge.top + popupSize.height} > ${mapBounds.height - margin}`);

// Test 5: Top-Left corner collision (anchor at x = 10, y = 10)
const cornerEdge = calculatePopupPosition({ x: 10, y: 10 }, popupSize, mapBounds, margin);
console.log('Test 5 (Extreme Corner x=10, y=10):', cornerEdge);
assert(cornerEdge.left >= margin, `Corner left underflow: ${cornerEdge.left}`);
assert(cornerEdge.top >= margin, `Corner top underflow: ${cornerEdge.top}`);
assert(cornerEdge.left + popupSize.width <= mapBounds.width - margin, 'Corner right overflow');
assert(cornerEdge.top + popupSize.height <= mapBounds.height - margin, 'Corner bottom overflow');

console.log('\n=================================================');
if (failed === 0) {
  console.log('✅ ALL 4-WAY EDGE COLLISION TESTS PASSED (0 errors)');
} else {
  console.error(`❌ ${failed} TESTS FAILED`);
  process.exit(1);
}
