/**
 * Balanced Polygons view — Gibbs (2014) iterative approach to approximating
 * the optimal moving sofa via intersection of rotated/translated L-shaped hallways.
 */

const BalancedPolygons = (() => {
  // --- State ---
  let N = 4;
  let positions = [];   // N+1 inner corner positions {x, y}
  let angles = [];       // N+1 rotation angles
  let polygon = [];      // computed sofa polygon vertices
  let area = 0;
  let iterationCount = 0;

  const R_HAMMERSLEY = 2 / Math.PI;

  // --- Initialization ---
  function initHammersley() {
    angles = [];
    positions = [];
    for (let k = 0; k <= N; k++) {
      const a = k * Math.PI / (2 * N);
      angles.push(a);
      positions.push({
        x: R_HAMMERSLEY * (Math.cos(2 * a) - 1),
        y: R_HAMMERSLEY * Math.sin(2 * a)
      });
    }
    iterationCount = 0;
    recompute();
  }

  function setN(newN) {
    if (newN < 3 || newN > 100) return;
    N = newN;
    initHammersley();
  }

  function getN() { return N; }
  function getArea() { return area; }
  function getIterationCount() { return iterationCount; }

  // --- Polygon computation using Clipper library (integer-based, robust) ---

  const ARM_LEN = 3;   // length of hallway arms for polygon representation
  const CLIP_SCALE = 1e6; // scale factor: Clipper uses integers

  // Build an L-shaped hallway polygon at given angle and position.
  // In local (u,v) coords the L is: u ≤ 1, v ≤ 1, NOT(u < 0 AND v < 0)
  // Vertices (clipped to arm length L): (-L,0),(0,0),(0,-L),(1,-L),(1,1),(-L,1)
  // Returns Clipper path (array of {X, Y} integer points)
  function buildLShapePath(angle, pos) {
    const L = ARM_LEN;
    const ca = Math.cos(angle), sa = Math.sin(angle);
    const px = pos.x, py = pos.y;
    const localVerts = [[-L, 0], [0, 0], [0, -L], [1, -L], [1, 1], [-L, 1]];
    return localVerts.map(([u, v]) => ({
      X: Math.round((px + ca * u - sa * v) * CLIP_SCALE),
      Y: Math.round((py + sa * u + ca * v) * CLIP_SCALE)
    }));
  }

  // Compute the sofa polygon as intersection of all L-shaped hallways
  function computePolygon(pos) {
    const usePos = pos || positions;

    let result = [buildLShapePath(angles[0], usePos[0])];

    for (let k = 1; k <= N; k++) {
      const lShape = buildLShapePath(angles[k], usePos[k]);
      const cpr = new ClipperLib.Clipper();
      cpr.AddPaths(result, ClipperLib.PolyType.ptSubject, true);
      cpr.AddPath(lShape, ClipperLib.PolyType.ptClip, true);
      const solution = [];
      cpr.Execute(ClipperLib.ClipType.ctIntersection, solution,
        ClipperLib.PolyFillType.pftNonZero, ClipperLib.PolyFillType.pftNonZero);
      result = solution;
      if (result.length === 0) return [];
    }

    // Convert from Clipper {X,Y} integers to {x,y} floats
    if (result.length === 0) return [];
    return result[0].map(p => ({ x: p.X / CLIP_SCALE, y: p.Y / CLIP_SCALE }));
  }

  function computeArea(poly) {
    return SofaMath.polygonArea(poly);
  }

  function recompute() {
    polygon = computePolygon();
    area = computeArea(polygon);
  }

  // --- Balancing operation ---
  // Gradient ascent: for each hallway k (1..N-1), compute numerical gradient
  // of area w.r.t. P_k position, then step in the gradient direction.

  const GRAD_EPS = 1e-5;  // finite difference step for gradient
  const STEP_SIZE = 0.02;  // gradient ascent step size

  function applyBalancing() {
    // Compute all gradients first, then apply (so they don't interfere)
    const grads = [];
    const baseArea = computeArea(computePolygon());

    for (let k = 1; k < N; k++) {
      const orig = { x: positions[k].x, y: positions[k].y };

      // Partial derivative w.r.t. x
      positions[k] = { x: orig.x + GRAD_EPS, y: orig.y };
      const dAdx = (computeArea(computePolygon()) - baseArea) / GRAD_EPS;

      // Partial derivative w.r.t. y
      positions[k] = { x: orig.x, y: orig.y + GRAD_EPS };
      const dAdy = (computeArea(computePolygon()) - baseArea) / GRAD_EPS;

      // Restore original position
      positions[k] = orig;
      grads.push({ k, dAdx, dAdy });
    }

    // Apply gradient steps
    for (const g of grads) {
      positions[g.k] = {
        x: positions[g.k].x + STEP_SIZE * g.dAdx,
        y: positions[g.k].y + STEP_SIZE * g.dAdy
      };
    }

    recompute();
    iterationCount++;
  }

  // --- Rendering ---

  function render(canvas) {
    const dpr = window.devicePixelRatio || 1;
    const container = canvas.parentElement;
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (w === 0 || h === 0) return;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';

    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Black background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, w, h);

    if (polygon.length < 3) return;

    // Set up transform: center on the sofa, which is roughly around (-0.6, 0.5)
    const transform = new TransformCentered(w, h, -0.6, 0.5, 3.5);

    // Draw hallway outlines (semi-transparent)
    drawHallways(ctx, transform);

    // Draw sofa polygon
    drawPolygon(ctx, transform);
  }

  function drawHallways(ctx, transform) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;

    const L = 8;

    for (let k = 0; k <= N; k++) {
      const a = angles[k];
      const px = positions[k].x, py = positions[k].y;
      const ca = Math.cos(a), sa = Math.sin(a);

      // Inner corner is at (px, py)
      // Inner wall directions: along (ca, sa) and along (-sa, ca)
      // Outer walls are offset by 1 in the perpendicular direction

      // Inner wall 1 (u=0): from pk along direction (-sa, ca) for L in both directions
      // Inner wall 2 (v=0): from pk along direction (ca, sa) for L in both directions

      // Wall endpoints in math coords
      // Inner L: pk + t*(-sa, ca) for u=0 wall (going in negative v direction)
      //          pk + t*(ca, sa) for v=0 wall (going in negative u direction)

      // Inner walls (the L-corner)
      const iw1a = transform.toCanvas(px + L * (-sa), py + L * ca);
      const iw1b = transform.toCanvas(px, py);
      const iw2b = transform.toCanvas(px + L * ca, py + L * sa);
      ctx.beginPath();
      ctx.moveTo(iw1a.x, iw1a.y);
      ctx.lineTo(iw1b.x, iw1b.y);
      ctx.lineTo(iw2b.x, iw2b.y);
      ctx.stroke();

      // Outer walls: offset by 1 in both directions
      // Outer wall A (v=1): starts at pk + 1*(-sa, ca), extends along (ca, sa)
      const ow1_start = { x: px + (-sa), y: py + ca };
      const ow1a = transform.toCanvas(ow1_start.x - L * ca, ow1_start.y - L * sa);
      const ow1b = transform.toCanvas(ow1_start.x + L * ca, ow1_start.y + L * sa);

      // Outer wall B (u=1): starts at pk + 1*(ca, sa), extends along (-sa, ca)
      const ow2_start = { x: px + ca, y: py + sa };
      const ow2a = transform.toCanvas(ow2_start.x - L * (-sa), ow2_start.y - L * ca);
      const ow2b = transform.toCanvas(ow2_start.x + L * (-sa), ow2_start.y + L * ca);

      // Outer corner at pk + (ca - sa, sa + ca)
      const oc = transform.toCanvas(px + ca - sa, py + sa + ca);

      ctx.beginPath();
      ctx.moveTo(ow1a.x, ow1a.y);
      ctx.lineTo(oc.x, oc.y);
      ctx.lineTo(ow2a.x, ow2a.y);
      ctx.stroke();
    }
  }

  function drawPolygon(ctx, transform) {
    if (polygon.length < 3) return;

    ctx.beginPath();
    for (let i = 0; i < polygon.length; i++) {
      const cp = transform.toCanvas(polygon[i].x, polygon[i].y);
      if (i === 0) ctx.moveTo(cp.x, cp.y);
      else ctx.lineTo(cp.x, cp.y);
    }
    ctx.closePath();

    ctx.fillStyle = 'rgba(66, 133, 244, 0.45)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(66, 133, 244, 0.9)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // --- Public API ---
  initHammersley();

  return {
    setN,
    getN,
    getArea,
    getIterationCount,
    applyBalancing,
    reset: initHammersley,
    render,
    recompute
  };
})();
