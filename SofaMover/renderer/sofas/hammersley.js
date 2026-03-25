/**
 * Hammersley sofa and Generalized Hammersley sofa.
 *
 * Rotation path: x(t) = r(cos(2t) - 1, sin(2t))
 * Standard Hammersley: r = 2/pi (optimal radius)
 * Generalized: r is configurable via a UI slider.
 */

const _HammersleyImpl = (() => {
  const arcSteps = 48;

  function rotPath(a, r) {
    return { x: r * (Math.cos(2 * a) - 1), y: r * Math.sin(2 * a) };
  }

  function buildCanonicalPoints(r) {
    const pts = [];
    const twoR = 2 * r;

    pts.push({ x: 0, y: 0 });
    pts.push({ x: 1, y: 0 });

    for (let i = 1; i <= arcSteps; i++) {
      const theta = (i / arcSteps) * Math.PI / 2;
      pts.push({ x: Math.cos(theta), y: Math.sin(theta) });
    }

    pts.push({ x: -twoR, y: 1 });

    for (let i = 1; i <= arcSteps; i++) {
      const theta = Math.PI / 2 + (i / arcSteps) * Math.PI / 2;
      pts.push({ x: -twoR + Math.cos(theta), y: Math.sin(theta) });
    }

    pts.push({ x: -twoR, y: 0 });

    if (r > 0.001) {
      for (let i = 1; i <= arcSteps; i++) {
        const theta = Math.PI - (i / arcSteps) * Math.PI;
        pts.push({ x: -r + r * Math.cos(theta), y: r * Math.sin(theta) });
      }
    }

    return pts;
  }

  function movementTransformPt(px, py, a, r, dx, dy) {
    const rp = rotPath(a, r);
    const qx = px - rp.x;
    const qy = py - rp.y;
    const cosA = Math.cos(-a);
    const sinA = Math.sin(-a);
    return {
      x: cosA * qx - sinA * qy + dx,
      y: sinA * qx + cosA * qy + dy
    };
  }

  const breakpoints = [0, Math.PI / 2];

  function drawWithRadius(ctx, transform, t, r) {
    const phase = SofaMath.threePhaseEased(t, breakpoints);
    const pts = buildCanonicalPoints(r);

    ctx.beginPath();
    for (let i = 0; i < pts.length; i++) {
      const mp = movementTransformPt(pts[i].x, pts[i].y, phase.angle, r, phase.dx, phase.dy);
      const cp = transform.toCanvas(mp.x, mp.y);
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

  function rotPathFn(t, k) { return rotPath(t, k.r); }

  function getContactPointsForRadius(t, r) {
    // No contact points during sliding phases
    if (t <= SofaMath.T1 || t > SofaMath.T2) return [];
    const phase = SofaMath.threePhaseEased(t, breakpoints);
    const angle = phase.angle;
    const k = { r };
    const a = SofaMath.contactA(rotPathFn, angle, k);
    const b = SofaMath.contactB(rotPathFn, angle, k);
    const c = SofaMath.contactC(rotPathFn, angle, k);
    const d = SofaMath.contactD(rotPathFn, angle, k);
    const rp = rotPath(angle, r);
    return [
      { x: rp.x, y: rp.y, type: 'corner' },
      { x: a.x, y: a.y, type: 'A' },
      { x: b.x, y: b.y, type: 'B' },
      { x: c.x, y: c.y, type: 'C' },
      { x: d.x, y: d.y, type: 'D' }
    ];
  }

  return { rotPath, buildCanonicalPoints, drawWithRadius, getContactPointsForRadius, breakpoints };
})();

const Hammersley = {
  name: 'Hammersley',
  getArea() { const r = 2 / Math.PI; return Math.PI / 2 + r * (2 - Math.PI / 2 * r); },

  phases: [
    { name: 'Slide right' },
    { name: '-transition-', transition: true },
    { name: 'Sliding and rotation', contactPoints: 'x, A, B, C, D' },
    { name: '-transition-', transition: true },
    { name: 'Slide down' }
  ],
  getActivePhaseIndex(t) {
    const eps = SofaMath.TRANS_EPS;
    if (t < SofaMath.T1 - eps) return 0;
    if (t < SofaMath.T1 + eps) return 1;
    if (t <= SofaMath.T2 - eps) return 2;
    if (t <= SofaMath.T2 + eps) return 3;
    return 4;
  },

  get canonicalPoints() { return _HammersleyImpl.buildCanonicalPoints(2 / Math.PI); },
  getRotPathPoint(angle) { return _HammersleyImpl.rotPath(angle, 2 / Math.PI); },
  getPhase(t) { return SofaMath.threePhaseEased(t, _HammersleyImpl.breakpoints); },
  getPhaseBoundaries() { return SofaMath.getPhaseBoundaries(_HammersleyImpl.breakpoints); },

  getContactPoints(t) {
    return _HammersleyImpl.getContactPointsForRadius(t, 2 / Math.PI);
  },

  draw(ctx, transform, t) {
    _HammersleyImpl.drawWithRadius(ctx, transform, t, 2 / Math.PI);
  }
};

const HammersleyGeneralized = (() => {
  let currentRadius = 2 / Math.PI;

  return {
    name: 'Generalized Hammersley',
    getArea() { const r = currentRadius; return Math.PI / 2 + r * (2 - Math.PI / 2 * r); },
    phases: [
      { name: 'Slide right' },
      { name: '-transition-', transition: true },
      { name: 'Sliding and rotation', contactPoints: 'x, A, B, C, D' },
      { name: '-transition-', transition: true },
      { name: 'Slide down' }
    ],
    getActivePhaseIndex(t) {
      const eps = SofaMath.TRANS_EPS;
      if (t < SofaMath.T1 - eps) return 0;
      if (t < SofaMath.T1 + eps) return 1;
      if (t <= SofaMath.T2 - eps) return 2;
      if (t <= SofaMath.T2 + eps) return 3;
      return 4;
    },
    hasRadiusParam: true,
    defaultRadius: 2 / Math.PI,
    minRadius: 0,
    maxRadius: 1,

    setRadius(r) { currentRadius = r; },
    getRadius() { return currentRadius; },

    get canonicalPoints() { return _HammersleyImpl.buildCanonicalPoints(currentRadius); },
    getRotPathPoint(angle) { return _HammersleyImpl.rotPath(angle, currentRadius); },
    getPhase(t) { return SofaMath.threePhaseEased(t, _HammersleyImpl.breakpoints); },
    getPhaseBoundaries() { return SofaMath.getPhaseBoundaries(_HammersleyImpl.breakpoints); },

    getContactPoints(t) {
      return _HammersleyImpl.getContactPointsForRadius(t, currentRadius);
    },

    draw(ctx, transform, t) {
      _HammersleyImpl.drawWithRadius(ctx, transform, t, currentRadius);
    }
  };
})();
