/**
 * Romik's ambidextrous moving sofa.
 *
 * Rotation path is piecewise across 3 phases with angle beta:
 *   x1(t) for 0 <= t < beta
 *   x6(t) for beta <= t < pi/2 - beta
 *   x5(t) for pi/2 - beta <= t <= pi/2
 *
 * The shape has up-down symmetry (reflection across y = 1/2).
 *
 * Boundary is 10 curve segments (from Mathematica code):
 *   1. x(t),                t: beta -> pi/2-beta
 *   2. D(t),                t: pi/2-beta -> 0
 *   3. reflect(C(t)),       t: 0 -> pi/2-beta
 *   4. C(t),                t: pi/2-beta -> 0
 *   5. reflect(D(t)),       t: 0 -> pi/2-beta
 *   6. reflect(x(t)),       t: pi/2-beta -> beta
 *   7. reflect(B(t)),       t: beta -> pi/2
 *   8. A(t),                t: pi/2 -> beta, then append (1, 0.5)
 *   9. reflect(A(t)),       t: beta -> pi/2
 *  10. B(t),                t: pi/2 -> beta
 *
 * reflect(pt) = (pt.x, 1 - pt.y)
 */

// Shared helpers for Romik sofa variants
const _RomikImpl = (() => {
  const beta = 0.289653820817320941743521611736;

  const K = {
    k11: 0.124712637587267758739932415305,
    k12: 0.5,
    a1:  0.875287362412732241260067584695,
    a2:  0,

    k61: -0.167049816550309655013423446260,
    k62: 0.5,
    f1:  1.20293890815691138907022280034,
    f2:  -0.498273610464875672029397859080,

    k51: -0.458812270687887068766779307825,
    k52: 0.5,
    e1:  0.875287362412732241260067584695,
    e2:  0,

    // Not used by this sofa but needed for SofaMath function signatures
    k21: 0, k22: 0, b1: 0, b2: 0,
    k31: 0, k32: 0, c1: 0, c2: 0,
    k41: 0, k42: 0, d1: 0, d2: 0
  };

  function reflect(pt) { return { x: pt.x, y: 1 - pt.y }; }

  // Piecewise rotation path
  function ambiX(t) {
    if (t < beta) return SofaMath.x1(t, K);
    if (t < Math.PI / 2 - beta) return SofaMath.x6(t, K);
    return SofaMath.x5(t, K);
  }

  function xFnFor(t) {
    if (t < beta) return SofaMath.x1;
    if (t < Math.PI / 2 - beta) return SofaMath.x6;
    return SofaMath.x5;
  }

  function ambiA(t) { return SofaMath.contactA(xFnFor(t), t, K); }
  function ambiB(t) { return SofaMath.contactB(xFnFor(t), t, K); }
  function ambiC(t) { return SofaMath.contactC(xFnFor(t), t, K); }
  function ambiD(t) { return SofaMath.contactD(xFnFor(t), t, K); }

  const N = 100;
  const piHalf = Math.PI / 2;
  const breakpoints = [0, beta, piHalf - beta, piHalf];
  const range = piHalf - beta;  // beta to pi/2-beta range
  const rangeFromBeta = piHalf - 2 * beta;

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

    // Seg 3: reflect(C(t)), t from 0 to pi/2-beta
    for (let i = 0; i <= N; i++) {
      const t = (piHalf - beta) * i / N;
      pts.push(reflect(ambiC(t)));
    }

    // Seg 4: C(t), t from pi/2-beta down to 0
    for (let i = 0; i <= N; i++) {
      const t = (piHalf - beta) * (1 - i / N);
      pts.push(ambiC(t));
    }

    // Seg 5: reflect(D(t)), t from 0 to pi/2-beta
    for (let i = 0; i <= N; i++) {
      const t = (piHalf - beta) * i / N;
      pts.push(reflect(ambiD(t)));
    }

    // Seg 6: reflect(x(t)), t from pi/2-beta down to beta (Most = skip last)
    for (let i = 0; i < N; i++) {
      const t = (piHalf - beta) - rangeFromBeta * i / N;
      pts.push(reflect(ambiX(t)));
    }

    // Seg 7: reflect(B(t)), t from beta to pi/2 (Rest = skip first)
    for (let i = 1; i <= N; i++) {
      const t = beta + range * i / N;
      pts.push(reflect(ambiB(t)));
    }

    // Seg 8: A(t), t from pi/2 down to beta, then append (1, 0.5)
    for (let i = 0; i < N; i++) {
      const t = piHalf - range * i / N;
      pts.push(ambiA(t));
    }
    pts.push({ x: 1, y: 0.5 });

    // Seg 9: reflect(A(t)), t from beta to pi/2 (Rest = skip first)
    for (let i = 1; i <= N; i++) {
      const t = beta + range * i / N;
      pts.push(reflect(ambiA(t)));
    }

    // Seg 10: B(t), t from pi/2 down to beta (Most = skip last)
    for (let i = 0; i < N; i++) {
      const t = piHalf - range * i / N;
      pts.push(ambiB(t));
    }

    return pts;
  }

  const canonicalPoints = buildBoundary();

  // Contact point sets per subphase (eq. 46 from Romik 2016):
  //   0 < a < beta:              {A, C, D}
  //   beta <= a <= pi/2-beta:    {x, A, B, C, D}
  //   pi/2-beta < a < pi/2:     {A, B, C}
  function getContactPoints(t) {
    if (t <= SofaMath.T1 || t > SofaMath.T2) return [];
    const phase = SofaMath.threePhaseEased(t, breakpoints);
    const a = phase.angle;
    const pts = [];

    // A is always present during rotation
    pts.push(Object.assign(ambiA(a), { type: 'A' }));

    if (a >= beta && a <= piHalf - beta) {
      // Middle subphase: all 5
      const rp = ambiX(a);
      pts.push({ x: rp.x, y: rp.y, type: 'corner' });
      pts.push(Object.assign(ambiB(a), { type: 'B' }));
      pts.push(Object.assign(ambiC(a), { type: 'C' }));
      pts.push(Object.assign(ambiD(a), { type: 'D' }));
    } else if (a < beta) {
      // First subphase: {A, C, D}
      pts.push(Object.assign(ambiC(a), { type: 'C' }));
      pts.push(Object.assign(ambiD(a), { type: 'D' }));
    } else {
      // Third subphase: {A, B, C}
      pts.push(Object.assign(ambiB(a), { type: 'B' }));
      pts.push(Object.assign(ambiC(a), { type: 'C' }));
    }

    return pts;
  }

  // Tick marks at curve segment join points (from Mathematica AmbidextrousSofaNormalTickMarkData)
  function buildTickMarks() {
    const piH = Math.PI / 2;
    const piHmB = piH - beta;
    const marks = [];
    function add(pt, nx, ny) { marks.push({ px: pt.x, py: pt.y, nx, ny }); }

    // Rotation path join points on x(t) and reflect(x(t))
    const xBeta = ambiX(beta);
    add(xBeta, -Math.cos(beta), -Math.sin(beta));
    const xPiHmB = ambiX(piHmB);
    add(xPiHmB, Math.sin(piHmB), -Math.cos(piHmB));
    add(reflect(xBeta), -Math.cos(beta), Math.sin(beta));
    add(reflect(xPiHmB), Math.sin(piHmB), Math.cos(piHmB));

    // D curve marks
    const dBeta = ambiD(beta);
    add(dBeta, Math.sin(beta), -Math.cos(beta));
    add(reflect(dBeta), Math.sin(beta), Math.cos(beta));
    const d0 = ambiD(0);
    add(d0, 0, -1);
    add(reflect(d0), 0, 1);

    // B curve marks
    const bPiHmB = ambiB(piHmB);
    add(bPiHmB, -Math.cos(piHmB), -Math.sin(piHmB));
    add(reflect(bPiHmB), -Math.cos(piHmB), Math.sin(piHmB));
    const bPiH = ambiB(piH);
    add(bPiH, 0, -1);
    add(reflect(bPiH), 0, 1);

    // C curve marks
    const cBeta = ambiC(beta);
    add(cBeta, -Math.sin(beta), Math.cos(beta));
    add(reflect(cBeta), -Math.sin(beta), -Math.cos(beta));

    // A curve marks
    const aPiHmB = ambiA(piHmB);
    add(aPiHmB, Math.cos(piHmB), Math.sin(piHmB));
    add(reflect(aPiHmB), Math.cos(piHmB), -Math.sin(piHmB));

    // Special points
    add({ x: 1, y: 0.5 }, 1, 0);
    const cPiH = ambiC(piH);
    add({ x: cPiH.x, y: 0.5 }, -1, 0);

    return marks;
  }

  const tickMarks = buildTickMarks();

  return {
    beta, K, piHalf, breakpoints, range, rangeFromBeta, N,
    reflect, ambiX, ambiA, ambiB, ambiC, ambiD,
    getContactPoints, buildTickMarks,
    canonicalPoints, tickMarks
  };
})();

// Romik's ambidextrous sofa (symmetrized)
const Romik = (() => {
  const impl = _RomikImpl;

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
    const N = impl.breakpoints.length - 1;
    const subWidth = rotWidth / N;
    const subIdx = Math.min(Math.floor(rotT / subWidth), N - 1);
    const subStart = SofaMath.T1 + subIdx * subWidth;
    const subEnd = subStart + subWidth;
    if (subIdx > 0 && t < subStart + eps) return subIdx * 2 + 1;
    if (subIdx < N - 1 && t > subEnd - eps) return subIdx * 2 + 3;
    return subIdx * 2 + 2;
  }

  function draw(ctx, transform, t) {
    const phase = SofaMath.threePhaseEased(t, impl.breakpoints);
    const rp = impl.ambiX(phase.angle);

    ctx.beginPath();
    for (let i = 0; i < impl.canonicalPoints.length; i++) {
      const p = impl.canonicalPoints[i];
      const mp = SofaMath.movementTransform(p.x, p.y, phase.angle, rp, phase.dx, phase.dy);
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

  return {
    name: 'Romik',
    getArea() {
      const s2 = Math.sqrt(2);
      return Math.cbrt(3 + 2 * s2) + Math.cbrt(3 - 2 * s2) - 1
           + Math.atan(((s2 + 1) ** (1/3) - (s2 - 1) ** (1/3)) / 2);
    },
    canonicalPoints: impl.canonicalPoints,
    tickMarkLength: 0.03125,
    getTickMarks() { return impl.tickMarks; },
    getRotPathPoint(angle) { return impl.ambiX(angle); },
    getPhase(t) { return SofaMath.threePhaseEased(t, impl.breakpoints); },
    getPhaseBoundaries() { return SofaMath.getPhaseBoundaries(impl.breakpoints); },
    getContactPoints: impl.getContactPoints,
    phases,
    getActivePhaseIndex,
    draw
  };
})();
