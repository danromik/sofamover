/**
 * Coordinate transform between math coordinates and canvas pixels,
 * plus L-shaped hallway drawing.
 *
 * Math coordinate system (from the paper):
 *   L_horiz = {(x,y) : x <= 1, 0 <= y <= 1}  -- horizontal arm, extends left
 *   L_vert  = {(x,y) : y <= 1, 0 <= x <= 1}  -- vertical arm, extends down (y -> -inf)
 *   Inner corner at origin (0,0)
 *
 * On canvas: x increases right (same), y increases down (flipped from math).
 * So math y is negated for display: vertical arm extending to y=-inf appears downward.
 */

// Transform for hallway perspective: outer corner (1,1) anchored near top-right
class Transform {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;

    const margin = 30;
    const minRange = 3.46;
    const scaleX = (canvasWidth - margin) / minRange;
    const scaleY = (canvasHeight - margin) / minRange;
    this.scale = Math.min(scaleX, scaleY);

    this.mathXMax = 1 + margin / this.scale;
    this.mathXMin = 1 - (canvasWidth - margin) / this.scale;
    this.mathYMax = 1 + margin / this.scale;
    this.mathYMin = 1 - (canvasHeight - margin) / this.scale;

    this.offsetX = 0;
    this.offsetY = 0;
  }

  toCanvas(mx, my) {
    return {
      x: this.offsetX + (mx - this.mathXMin) * this.scale,
      y: this.offsetY + (this.mathYMax - my) * this.scale
    };
  }

  toPixels(mathDist) {
    return mathDist * this.scale;
  }
}

// Transform for sofa perspective: centered on a given math point
class TransformCentered {
  constructor(canvasWidth, canvasHeight, centerX, centerY, mathRange) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;

    const scaleX = canvasWidth / mathRange;
    const scaleY = canvasHeight / mathRange;
    this.scale = Math.min(scaleX, scaleY);

    // Center (centerX, centerY) in the canvas
    this.mathXMin = centerX - canvasWidth / (2 * this.scale);
    this.mathXMax = centerX + canvasWidth / (2 * this.scale);
    this.mathYMin = centerY - canvasHeight / (2 * this.scale);
    this.mathYMax = centerY + canvasHeight / (2 * this.scale);

    this.offsetX = 0;
    this.offsetY = 0;
  }

  toCanvas(mx, my) {
    return {
      x: this.offsetX + (mx - this.mathXMin) * this.scale,
      y: this.offsetY + (this.mathYMax - my) * this.scale
    };
  }

  toPixels(mathDist) {
    return mathDist * this.scale;
  }
}

// Draw fixed hallway (hallway perspective)
function drawHallway(ctx, transform) {
  const w = transform.canvasWidth;
  const h = transform.canvasHeight;

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, w, h);

  const hLeft = transform.toCanvas(transform.mathXMin, 1);
  const hRight = transform.toCanvas(1, 0);
  ctx.fillStyle = '#3a3a3a';
  ctx.fillRect(0, hLeft.y, hRight.x, hRight.y - hLeft.y);

  const vTop = transform.toCanvas(0, 1);
  const vBottom = transform.toCanvas(1, transform.mathYMin);
  ctx.fillRect(vTop.x, vTop.y, vBottom.x - vTop.x, h - vTop.y);

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;

  const wallH1End = transform.toCanvas(1, 1);
  ctx.beginPath();
  ctx.moveTo(0, wallH1End.y);
  ctx.lineTo(wallH1End.x, wallH1End.y);
  ctx.stroke();

  const wallV1Start = transform.toCanvas(1, 1);
  ctx.beginPath();
  ctx.moveTo(wallV1Start.x, wallV1Start.y);
  ctx.lineTo(wallV1Start.x, h);
  ctx.stroke();

  const wallH0End = transform.toCanvas(0, 0);
  ctx.beginPath();
  ctx.moveTo(0, wallH0End.y);
  ctx.lineTo(wallH0End.x, wallH0End.y);
  ctx.stroke();

  const wallV0Start = transform.toCanvas(0, 0);
  ctx.beginPath();
  ctx.moveTo(wallV0Start.x, wallV0Start.y);
  ctx.lineTo(wallV0Start.x, h);
  ctx.stroke();
}

// Draw hallway in sofa perspective: rotated by angle, offset by rotPathPoint and (dx,dy).
// Hallway point h in sofa frame = R(angle) * (h - (dx, dy)) + rotPathPoint
function drawHallwayRotated(ctx, transform, angle, rotPathPoint, dx, dy) {
  const w = transform.canvasWidth;
  const h = transform.canvasHeight;

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, w, h);

  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);
  const rpx = rotPathPoint.x;
  const rpy = rotPathPoint.y;

  function xform(hx, hy) {
    const qx = hx - dx;
    const qy = hy - dy;
    return {
      x: cosA * qx - sinA * qy + rpx,
      y: sinA * qx + cosA * qy + rpy
    };
  }

  function xformToCanvas(hx, hy) {
    const m = xform(hx, hy);
    return transform.toCanvas(m.x, m.y);
  }

  // Draw the L-shaped hallway as a filled polygon
  // L-shape vertices (using large arm length for visibility)
  const L = 15;
  const lPoly = [
    { x: -L, y: 0 }, { x: 0, y: 0 }, { x: 0, y: -L },
    { x: 1, y: -L }, { x: 1, y: 1 }, { x: -L, y: 1 }
  ];

  ctx.fillStyle = '#3a3a3a';
  ctx.beginPath();
  for (let i = 0; i < lPoly.length; i++) {
    const cp = xformToCanvas(lPoly[i].x, lPoly[i].y);
    if (i === 0) ctx.moveTo(cp.x, cp.y);
    else ctx.lineTo(cp.x, cp.y);
  }
  ctx.closePath();
  ctx.fill();

  // Draw walls (white lines)
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;

  // Inner walls: (-L,0)→(0,0)→(0,-L)
  const iw0 = xformToCanvas(-L, 0);
  const iw1 = xformToCanvas(0, 0);
  const iw2 = xformToCanvas(0, -L);
  ctx.beginPath();
  ctx.moveTo(iw0.x, iw0.y);
  ctx.lineTo(iw1.x, iw1.y);
  ctx.lineTo(iw2.x, iw2.y);
  ctx.stroke();

  // Outer walls: (-L,1)→(1,1)→(1,-L)
  const ow0 = xformToCanvas(-L, 1);
  const ow1 = xformToCanvas(1, 1);
  const ow2 = xformToCanvas(1, -L);
  ctx.beginPath();
  ctx.moveTo(ow0.x, ow0.y);
  ctx.lineTo(ow1.x, ow1.y);
  ctx.lineTo(ow2.x, ow2.y);
  ctx.stroke();
}
