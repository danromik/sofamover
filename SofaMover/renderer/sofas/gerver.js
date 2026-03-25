/**
 * Gerver's sofa — the shape with maximum area among all shapes that
 * can be moved around the L-shaped hallway corner.
 *
 * The rotation path is piecewise across 5 phases with angles phi and theta.
 * The boundary is constructed from 5 curve segments using contact paths A, B, C, D.
 *
 * Boundary segments (from Mathematica code):
 *   1. x(t),      t from phi to pi/2-phi        (rotation path itself)
 *   2. D(t),      t from theta to 0              (reversed)
 *   3. C(t),      t from pi/2 to phi             (reversed)
 *   4. A(t),      t from pi/2 to phi             (reversed)
 *   5. B(t),      t from pi/2 to pi/2-theta      (reversed)
 */

const Gerver = (() => {
  // Numerical constants from the paper
  const phi = 0.0391773647900836418632178752424;
  const theta = 0.681301509382724894473855757083;

  const K = {
    k11: -0.210322422072688751416185718488,
    k12: 0.25,
    a1:  1.21032242207268875141618571849,
    a2:  -0.25,

    k21: -0.919179292771593322274696102894,
    k22: 0.472406619750805465181760762512,
    b1:  -0.527624598026784624160503809373,
    b2:  0.920258385160637622893705795012,

    k31: -0.613763229430251668554914291318,
    k32: 0.889626479003221860727043050048,
    c1:  0.626045522848465867552329310386,
    c2:  -0.944750803946430751678992381254,

    k41: -0.308347166088910014835132479741,
    k42: 0.472406619750805465181760762512,
    d1:  1.31302276142423293377616465519,
    d2:  -0.525382670414554437202836294305,

    k51: -1.01720403678781458569364286415,
    k52: 0.25,
    e1:  1.21032242207268875141618571849,
    e2:  0.25
  };

  // Piecewise rotation path
  function gerverX(t) {
    if (t < phi) return SofaMath.x1(t, K);
    if (t < theta) return SofaMath.x2(t, K);
    if (t < Math.PI / 2 - theta) return SofaMath.x3(t, K);
    if (t < Math.PI / 2 - phi) return SofaMath.x4(t, K);
    return SofaMath.x5(t, K);
  }

  // Pick the right x_j function for a given t
  function xFnFor(t) {
    if (t < phi) return SofaMath.x1;
    if (t < theta) return SofaMath.x2;
    if (t < Math.PI / 2 - theta) return SofaMath.x3;
    if (t < Math.PI / 2 - phi) return SofaMath.x4;
    return SofaMath.x5;
  }

  // Contact paths using the correct x_j for each t
  function gerverA(t) { return SofaMath.contactA(xFnFor(t), t, K); }
  function gerverB(t) { return SofaMath.contactB(xFnFor(t), t, K); }
  function gerverC(t) { return SofaMath.contactC(xFnFor(t), t, K); }
  function gerverD(t) { return SofaMath.contactD(xFnFor(t), t, K); }

  // Build canonical boundary points (matching Mathematica construction)
  const N = 100; // points per segment

  function buildBoundary() {
    const pts = [];

    // Segment 1: x(t) for t from phi to pi/2-phi
    for (let i = 0; i <= N; i++) {
      const t = phi + (Math.PI / 2 - 2 * phi) * i / N;
      pts.push(gerverX(t));
    }

    // Segment 2: D(t) for t from theta down to 0
    for (let i = 0; i <= N; i++) {
      const t = theta - theta * i / N;
      pts.push(gerverD(t));
    }

    // Segment 3: C(t) for t from pi/2 down to phi
    for (let i = 0; i <= N; i++) {
      const t = Math.PI / 2 - (Math.PI / 2 - phi) * i / N;
      pts.push(gerverC(t));
    }

    // Segment 4: A(t) for t from pi/2 down to phi
    for (let i = 0; i <= N; i++) {
      const t = Math.PI / 2 - (Math.PI / 2 - phi) * i / N;
      pts.push(gerverA(t));
    }

    // Segment 5: B(t) for t from pi/2 down to pi/2-theta
    for (let i = 0; i <= N; i++) {
      const t = Math.PI / 2 - theta * i / N;
      pts.push(gerverB(t));
    }

    return pts;
  }

  const canonicalPoints = buildBoundary();

  const piHalf = Math.PI / 2;
  const breakpoints = [0, phi, theta, piHalf - theta, piHalf - phi, piHalf];

  // Contact point sets per subphase (eq. 24 from Romik 2016):
  //   0 < a < phi:           {A, C, D}
  //   phi <= a < theta:      {x, A, C, D}
  //   theta <= a <= pi/2-theta: {x, A, C}
  //   pi/2-theta < a <= pi/2-phi: {x, A, B, C}
  //   pi/2-phi < a < pi/2:  {A, B, C}
  function getContactPoints(t) {
    if (t <= SofaMath.T1 || t > SofaMath.T2) return [];
    const phase = SofaMath.threePhaseEased(t, breakpoints);
    const a = phase.angle;
    const pts = [];

    // A is always present during rotation
    pts.push(Object.assign(gerverA(a), { type: 'A' }));

    // x (corner): phi <= a <= pi/2-phi
    if (a >= phi && a <= piHalf - phi) {
      const rp = gerverX(a);
      pts.push({ x: rp.x, y: rp.y, type: 'corner' });
    }

    // B: pi/2-theta < a
    if (a > piHalf - theta)
      pts.push(Object.assign(gerverB(a), { type: 'B' }));

    // C is always present during rotation
    pts.push(Object.assign(gerverC(a), { type: 'C' }));

    // D: a < theta
    if (a < theta)
      pts.push(Object.assign(gerverD(a), { type: 'D' }));

    return pts;
  }

  // Tick marks at curve segment join points (from Mathematica GerverSofaNormalTickMarkData)
  function buildTickMarks() {
    const piH = Math.PI / 2;
    const marks = [];
    function add(pt, nx, ny) { marks.push({ px: pt.x, py: pt.y, nx, ny }); }

    // Rotation path join points (4 marks on x(t) curve)
    const xPhi = gerverX(phi);
    add(xPhi, -Math.sin(theta), -Math.cos(theta));
    const xTheta = gerverX(theta);
    add(xTheta, -Math.cos(1.35), -Math.sin(1.35));
    const xPiHmTheta = gerverX(piH - theta);
    add(xPiHmTheta, Math.cos(1.35), -Math.sin(1.35));
    const xPiHmPhi = gerverX(piH - phi);
    add(xPiHmPhi, Math.sin(theta), -Math.cos(theta));

    // B curve marks
    const bPiHmPhi = gerverB(piH - phi);
    add(bPiHmPhi, -Math.cos(piH - phi), -Math.sin(piH - phi));
    const bPiH = gerverB(piH);
    add(bPiH, 0, -1);

    // D curve marks
    const dPhi = gerverD(phi);
    add(dPhi, Math.sin(phi), -Math.cos(phi));
    const d0 = gerverD(0);
    add(d0, 0, -1);

    // A curve marks
    const aTheta = gerverA(theta);
    add(aTheta, Math.cos(theta), Math.sin(theta));
    const aPiHmTheta = gerverA(piH - theta);
    add(aPiHmTheta, Math.cos(piH - theta), Math.sin(piH - theta));
    const aPiHmPhi = gerverA(piH - phi);
    add(aPiHmPhi, Math.cos(piH - phi), Math.sin(piH - phi));
    const aPiH = gerverA(piH);
    add(aPiH, 0, 1);

    // C curve marks
    const cPiHmTheta = gerverC(piH - theta);
    add(cPiHmTheta, -Math.sin(piH - theta), Math.cos(piH - theta));
    const cTheta = gerverC(theta);
    add(cTheta, -Math.sin(theta), Math.cos(theta));
    const cPhi = gerverC(phi);
    add(cPhi, -Math.cos(piH - phi), Math.sin(piH - phi));
    const c0 = gerverC(0);
    add(c0, 0, 1);

    // Special points
    add({ x: 1, y: 0 }, 0.707, -0.707);
    const cPiH = gerverC(piH);
    add(cPiH, -0.707, -0.707);

    return marks;
  }

  const tickMarks = buildTickMarks();

  return {
    name: 'Gerver',
    getArea() { return 2.2195316688719674; },

    canonicalPoints,
    tickMarkLength: 0.0375,
    getTickMarks() { return tickMarks; },
    getRotPathPoint(angle) { return gerverX(angle); },
    getPhase(t) { return SofaMath.threePhaseEased(t, breakpoints); },
    getPhaseBoundaries() { return SofaMath.getPhaseBoundaries(breakpoints); },
    getContactPoints,

    phases: [
      { name: 'Slide right' },                          // 0
      { name: 'rotation begins', transition: true },     // 1
      { name: 'Phase 1', contactPoints: 'A, C, D' },    // 2
      { name: 'critical angle φ', transition: true },    // 3
      { name: 'Phase 2', contactPoints: 'x, A, C, D' }, // 4
      { name: 'critical angle θ', transition: true },    // 5
      { name: 'Phase 3', contactPoints: 'x, A, C' },    // 6
      { name: 'critical angle π/2−θ', transition: true },// 7
      { name: 'Phase 4', contactPoints: 'x, A, B, C' }, // 8
      { name: 'critical angle π/2−φ', transition: true },// 9
      { name: 'Phase 5', contactPoints: 'A, B, C' },    // 10
      { name: 'rotation ends', transition: true },       // 11
      { name: 'Slide down' }                             // 12
    ],

    getActivePhaseIndex(t) {
      const eps = SofaMath.TRANS_EPS;
      if (t < SofaMath.T1 - eps) return 0;   // Slide right
      if (t < SofaMath.T1 + eps) return 1;   // rotation begins
      if (t > SofaMath.T2 + eps) return 12;  // Slide down
      if (t > SofaMath.T2 - eps) return 11;  // rotation ends
      const rotT = t - SofaMath.T1;
      const rotWidth = SofaMath.T2 - SofaMath.T1;
      const N = breakpoints.length - 1;  // 5 subphases
      const subWidth = rotWidth / N;
      const subIdx = Math.min(Math.floor(rotT / subWidth), N - 1);
      const subStart = SofaMath.T1 + subIdx * subWidth;
      const subEnd = subStart + subWidth;
      // Check if near an internal subphase boundary
      if (subIdx > 0 && t < subStart + eps) return subIdx * 2 + 1;
      if (subIdx < N - 1 && t > subEnd - eps) return subIdx * 2 + 3;
      return subIdx * 2 + 2;
    },

    draw(ctx, transform, t) {
      const phase = SofaMath.threePhaseEased(t, breakpoints);

      // Get rotation path point at current angle
      const rp = gerverX(phase.angle);

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
  };
})();
