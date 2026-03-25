/**
 * Romik's sofa before symmetrization (shape S_x from section 5 of the paper).
 *
 * The final Romik sofa Σ = S_x ∩ reflect(S_x).
 * S_x uses only the non-reflected boundary segments:
 *   1. x(t),  t: beta -> pi/2-beta
 *   2. D(t),  t: pi/2-beta -> 0
 *      {C(pi/2-beta).x, 0}         (close bottom-left)
 *   4. C(t),  t: pi/2-beta -> 0
 *   8. A(t),  t: pi/2 -> beta, then append (1, 1/2)
 *      {1, 0}                       (close bottom-right)
 *  10. B(t),  t: pi/2 -> beta
 *
 * Reuses all math, phases, and contact point logic from _RomikImpl.
 */

const RomikPre = (() => {
  const impl = _RomikImpl;
  const { beta, piHalf, range, rangeFromBeta, N,
          ambiX, ambiA, ambiB, ambiC, ambiD } = impl;

  function buildBoundary() {
    const pts = [];

    // Seg 1: x(t), t from beta to pi/2-beta (Rest = skip first point)
    for (let i = 1; i <= N; i++) {
      const t = beta + rangeFromBeta * i / N;
      pts.push(ambiX(t));
    }

    // Seg 2: D(t), t from pi/2-beta down to 0
    for (let i = 0; i <= N; i++) {
      const t = (piHalf - beta) * (1 - i / N);
      pts.push(ambiD(t));
    }

    // Close bottom-left: drop to y=0 at C(pi/2-beta).x
    const cStart = ambiC(piHalf - beta);
    pts.push({ x: cStart.x, y: 0 });

    // Seg 4: C(t), t from pi/2-beta down to 0
    for (let i = 0; i <= N; i++) {
      const t = (piHalf - beta) * (1 - i / N);
      pts.push(ambiC(t));
    }

    // Seg 8: A(t), t from pi/2 down to beta, then append (1, 0.5)
    for (let i = 0; i < N; i++) {
      const t = piHalf - range * i / N;
      pts.push(ambiA(t));
    }
    pts.push({ x: 1, y: 0.5 });

    // Close bottom-right
    pts.push({ x: 1, y: 0 });

    // Seg 10: B(t), t from pi/2 down to beta (Most = skip last)
    for (let i = 0; i < N; i++) {
      const t = piHalf - range * i / N;
      pts.push(ambiB(t));
    }

    return pts;
  }

  const canonicalPoints = buildBoundary();

  function buildTickMarks() {
    const piH = Math.PI / 2;
    const piHmB = piH - beta;
    const marks = [];
    function add(pt, nx, ny) { marks.push({ px: pt.x, py: pt.y, nx, ny }); }

    // Rotation path join points (non-reflected only)
    const xBeta = ambiX(beta);
    add(xBeta, -Math.cos(beta), -Math.sin(beta));
    const xPiHmB = ambiX(piHmB);
    add(xPiHmB, Math.sin(piHmB), -Math.cos(piHmB));

    // D curve marks (non-reflected only)
    const dBeta = ambiD(beta);
    add(dBeta, Math.sin(beta), -Math.cos(beta));
    const d0 = ambiD(0);
    add(d0, 0, -1);

    // B curve marks (non-reflected only)
    const bPiHmB = ambiB(piHmB);
    add(bPiHmB, -Math.cos(piHmB), -Math.sin(piHmB));
    const bPiH = ambiB(piH);
    add(bPiH, 0, -1);

    // C curve mark (non-reflected only)
    const cBeta = ambiC(beta);
    add(cBeta, -Math.sin(beta), Math.cos(beta));

    // A curve mark (non-reflected only)
    const aPiHmB = ambiA(piHmB);
    add(aPiHmB, Math.cos(piHmB), Math.sin(piHmB));

    // Bottom-closing join points (new for S_x)
    const cStart = ambiC(piHmB);
    add({ x: cStart.x, y: 0 }, 0, -1);
    add({ x: 1, y: 0 }, 0.707, -0.707);

    return marks;
  }

  const tickMarks = buildTickMarks();

  // Reuse Romik's phases and getActivePhaseIndex
  const phases = [
    { name: 'Slide right' },
    { name: 'rotation begins', transition: true },
    { name: 'Phase 1', contactPoints: 'A, C, D' },
    { name: 'critical angle β', transition: true },
    { name: 'Phase 2', contactPoints: 'x, A, B, C, D' },
    { name: 'critical angle π/2−β', transition: true },
    { name: 'Phase 3', contactPoints: 'A, B, C' },
    { name: 'rotation ends', transition: true },
    { name: 'Slide down' }
  ];

  function getActivePhaseIndex(t) {
    const eps = SofaMath.TRANS_EPS;
    if (t < SofaMath.T1 - eps) return 0;
    if (t < SofaMath.T1 + eps) return 1;
    if (t > SofaMath.T2 + eps) return 8;
    if (t > SofaMath.T2 - eps) return 7;
    const rotT = t - SofaMath.T1;
    const rotWidth = SofaMath.T2 - SofaMath.T1;
    const Nsub = impl.breakpoints.length - 1;
    const subWidth = rotWidth / Nsub;
    const subIdx = Math.min(Math.floor(rotT / subWidth), Nsub - 1);
    const subStart = SofaMath.T1 + subIdx * subWidth;
    const subEnd = subStart + subWidth;
    if (subIdx > 0 && t < subStart + eps) return subIdx * 2 + 1;
    if (subIdx < Nsub - 1 && t > subEnd - eps) return subIdx * 2 + 3;
    return subIdx * 2 + 2;
  }

  function draw(ctx, transform, t) {
    const phase = SofaMath.threePhaseEased(t, impl.breakpoints);
    const rp = ambiX(phase.angle);

    ctx.beginPath();
    for (let i = 0; i < canonicalPoints.length; i++) {
      const p = canonicalPoints[i];
      const mp = SofaMath.movementTransform(p.x, p.y, phase.angle, rp, phase.dx, phase.dy);
      const cp = transform.toCanvas(mp.x, mp.y);
      if (i === 0) ctx.moveTo(cp.x, cp.y);
      else ctx.lineTo(cp.x, cp.y);
    }
    ctx.closePath();

    ctx.fillStyle = SofaMath.sofaFill();
    ctx.fill();
    ctx.strokeStyle = SofaMath.sofaStroke();
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  return {
    name: 'Romik (pre-symmetrization)',
    getArea() { return SofaMath.polygonArea(canonicalPoints); },
    canonicalPoints,
    tickMarkLength: 0.03125,
    getTickMarks() { return tickMarks; },
    getRotPathPoint(angle) { return ambiX(angle); },
    getPhase(t) { return SofaMath.threePhaseEased(t, impl.breakpoints); },
    getPhaseBoundaries() { return SofaMath.getPhaseBoundaries(impl.breakpoints); },
    getContactPoints: impl.getContactPoints,
    phases,
    getActivePhaseIndex,
    draw
  };
})();
