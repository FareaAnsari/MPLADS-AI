/**
 * GIS Map Popup & Tooltip Collision-Aware Positioning Engine
 * Enforces strict containment inside the map container boundaries.
 */

export interface AnchorPoint {
  x: number;
  y: number;
}

export interface PopupSize {
  width: number;
  height: number;
}

export interface MapBounds {
  width: number;
  height: number;
}

export interface PopupPositionResult {
  left: number;
  top: number;
  placement: 'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-right' | 'bottom-center';
  isFlippedX: boolean;
  isFlippedY: boolean;
}

/**
 * Calculates collision-aware, viewport-constrained popup coordinates.
 *
 * @param anchorPoint Point of interest in map container pixel coordinates
 * @param popupSize Rendered or expected dimensions of the popup card
 * @param mapBounds Dimensions of the map viewport/container
 * @param margin Safety margin in pixels from the map edge (default: 14px)
 */
export function calculatePopupPosition(
  anchorPoint: AnchorPoint,
  popupSize: PopupSize,
  mapBounds: MapBounds,
  margin: number = 14
): PopupPositionResult {
  const { width: pWidth, height: pHeight } = popupSize;
  const { width: mWidth, height: mHeight } = mapBounds;

  let isFlippedX = false;
  let isFlippedY = false;

  // 1. HORIZONTAL COLLISION RESOLUTION:
  // Default: center aligned with anchor
  let left = anchorPoint.x - pWidth / 2;
  let horizPlacement: 'left' | 'right' | 'center' = 'center';

  // Case 1: Left-edge collision (anchor too close to left border)
  if (anchorPoint.x - pWidth / 2 < margin + 12) {
    left = anchorPoint.x + 20; // Shift to the right of anchor
    horizPlacement = 'right';
    isFlippedX = true;
  }
  // Case 2: Right-edge collision (anchor too close to right border)
  else if (anchorPoint.x + pWidth / 2 > mWidth - margin - 12) {
    left = anchorPoint.x - pWidth - 20; // Shift to the left of anchor
    horizPlacement = 'left';
    isFlippedX = true;
  }

  // Strict clamp inside container horizontal boundary: [margin, mWidth - pWidth - margin]
  const clampedLeft = Math.max(margin, Math.min(mWidth - pWidth - margin, left));

  // 2. VERTICAL COLLISION RESOLUTION:
  // Default: placed above anchor
  let top = anchorPoint.y - pHeight - 16;
  let vertPlacement: 'top' | 'bottom' = 'top';

  // Case 3: Top-edge collision (anchor too close to top border)
  if (top < margin) {
    top = anchorPoint.y + 24; // Flip below anchor
    vertPlacement = 'bottom';
    isFlippedY = true;
  }
  // Case 4: Bottom-edge collision (if flipped below and exceeds bottom border)
  else if (anchorPoint.y + pHeight + 24 > mHeight - margin && top < margin) {
    top = anchorPoint.y - pHeight - 16;
  }

  // Strict clamp inside container vertical boundary: [margin, mHeight - pHeight - margin]
  const clampedTop = Math.max(margin, Math.min(mHeight - pHeight - margin, top));

  const placement = `${vertPlacement}-${horizPlacement}` as PopupPositionResult['placement'];

  return {
    left: Math.round(clampedLeft),
    top: Math.round(clampedTop),
    placement,
    isFlippedX,
    isFlippedY
  };
}
