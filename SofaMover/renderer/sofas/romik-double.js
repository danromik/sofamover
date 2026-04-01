/**
 * Romik's ambidextrous sofa — double turn (S-shaped hallway).
 *
 * Same sofa shape as Romik, but navigates a hallway with two right-angle turns.
 * Animation has 5 phases: slide right, rotate CW, slide down, rotate CCW, slide right.
 *
 * Based on SofaMovieWithHallwayTwoCorners from MovingSofas.wl (2016).
 *
 * Phase 4 rotation path (second corner) uses the "basepoint" formula:
 *   basepoint = ambiX(a)  where a = pi/2*(4-time) in Mathematica (a goes pi/2 to 0)
 *   basepoint.x = ambiX(pi/2).x - basepoint.x
 *   basepoint.y = 1 - basepoint.y
 * Then: Translate[Rotate[Translate[sofa, -basepoint], -a, {0,0}], {1, -V+1}]
 */

const RomikDouble = (() => {
  const impl = _RomikImpl;
  const piHalf = Math.PI / 2;

  // S-hallway vertical segment length (distance between inner corners).
  // The first inner corner is at (0,0), the second at (1, -V+1).
  // Mathematica uses armlength=2.8, so V = armlength = 2.8.
  // The hallway polygon uses V as the arm length parameter.
  const V = 3;

  // Phase timing (normalized to [0,1])
  const P1 = 0.10;   // end of slide-right-in
  const P2 = 0.35;   // end of first rotation
  const P3 = 0.65;   // end of slide-down
  const P4 = 0.90;   // end of second rotation

  // Romik rotation subphase breakpoints
  const breakpoints = impl.breakpoints; // [0, beta, pi/2-beta, pi/2]
  const revBreakpoints = [piHalf, piHalf - impl.beta, impl.beta, 0];
  const N_SUB = breakpoints.length - 1; // 3 subphases

  // Rotation path endpoint
  const rpAtPiHalf = impl.ambiX(piHalf);

  // Slide distance derived from continuity at Phase 3/4 boundary.
  // From the Mathematica code: xinitial = armlength + leftendpoint
  // Solving: xinitial = V - 1 + rpAtPiHalf.x
  const SLIDE_DIST = V - 1 + rpAtPiHalf.x;

  // Modified rotation path for second corner (Phase 4)
  function modifiedRotPath(a) {
    const rp = impl.ambiX(a);
    return {
      x: rpAtPiHalf.x - rp.x,
      y: 1 - rp.y
    };
  }

  // Interpolate angle with smoothstep easing across subphases
  function interpAngle(t, tStart, tEnd, bps) {
    const rotT = t - tStart;
    const rotWidth = tEnd - tStart;
    const subWidth = rotWidth / N_SUB;
    let i = Math.floor(rotT / subWidth);
    if (i >= N_SUB) i = N_SUB - 1;
    const localT = (rotT - i * subWidth) / subWidth;
    const easedT = SofaMath.smoothstep(localT);
    return bps[i] + easedT * (bps[i + 1] - bps[i]);
  }

  function getPhase(t) {
    if (t <= P1) {
      // Phase 1: Slide right in
      const progress = SofaMath.smoothstep(t / P1);
      const angle = 0;
      const rp = impl.ambiX(0);
      return { angle, dx: -SLIDE_DIST * (1 - progress), dy: 0, rotPathPoint: rp, phaseNum: 1 };
    }
    if (t <= P2) {
      // Phase 2: First rotation (CW, angle 0 -> pi/2)
      const angle = interpAngle(t, P1, P2, breakpoints);
      const rp = impl.ambiX(angle);
      return { angle, dx: 0, dy: 0, rotPathPoint: rp, phaseNum: 2 };
    }
    if (t <= P3) {
      // Phase 3: Slide down
      const progress = SofaMath.smoothstep((t - P2) / (P3 - P2));
      const angle = piHalf;
      const rp = impl.ambiX(piHalf);
      return { angle, dx: 0, dy: -SLIDE_DIST * progress, rotPathPoint: rp, phaseNum: 3 };
    }
    if (t <= P4) {
      // Phase 4: Second rotation (CCW, angle pi/2 -> 0)
      // Angle goes from pi/2 to 0 using reversed breakpoints
      const angle = interpAngle(t, P3, P4, revBreakpoints);
      const rp = modifiedRotPath(angle);
      // Second corner offset: {1, -V+1} in Mathematica
      return { angle, dx: 1, dy: -V + 1, rotPathPoint: rp, phaseNum: 4 };
    }
    // Phase 5: Slide right out
    // From Mathematica: Translate[sofa, {-rpAtPiHalf.x + 1 + xinitial*(time-4), -V}]
    // Pure translation (no rotation): p + {-rpAtPiHalf.x + 1 + xinitial*progress, -V}
    const progress = SofaMath.smoothstep((t - P4) / (1 - P4));
    const rp = { x: 0, y: 0 };
    return {
      angle: 0,
      dx: -rpAtPiHalf.x + 1 + SLIDE_DIST * progress,
      dy: -V,
      rotPathPoint: rp,
      phaseNum: 5
    };
  }

  // Phase boundary t-values for arrow key navigation
  function getPhaseBoundaries() {
    const boundaries = [0, P1];
    // First rotation subphase boundaries
    const subWidth1 = (P2 - P1) / N_SUB;
    for (let k = 1; k < N_SUB; k++) boundaries.push(P1 + k * subWidth1);
    boundaries.push(P2, P3);
    // Second rotation subphase boundaries
    const subWidth2 = (P4 - P3) / N_SUB;
    for (let k = 1; k < N_SUB; k++) boundaries.push(P3 + k * subWidth2);
    boundaries.push(P4, 1);
    return boundaries;
  }

  // Draw sofa in hallway perspective
  function draw(ctx, transform, t) {
    const phase = getPhase(t);
    const rp = phase.rotPathPoint;

    ctx.beginPath();
    for (let i = 0; i < impl.canonicalPoints.length; i++) {
      const p = impl.canonicalPoints[i];
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

  // Contact points only during Phase 2 (first rotation)
  function getContactPoints(t) {
    if (t <= P1 || t > P2) return [];
    // Delegate to _RomikImpl's contact point logic
    // Need to compute the angle for the contact point lookup
    const phase = getPhase(t);
    const a = phase.angle;

    const pts = [];
    pts.push(Object.assign(impl.ambiA(a), { type: 'A' }));

    if (a >= impl.beta && a <= piHalf - impl.beta) {
      const rp = impl.ambiX(a);
      pts.push({ x: rp.x, y: rp.y, type: 'corner' });
      pts.push(Object.assign(impl.ambiB(a), { type: 'B' }));
      pts.push(Object.assign(impl.ambiC(a), { type: 'C' }));
      pts.push(Object.assign(impl.ambiD(a), { type: 'D' }));
    } else if (a < impl.beta) {
      pts.push(Object.assign(impl.ambiC(a), { type: 'C' }));
      pts.push(Object.assign(impl.ambiD(a), { type: 'D' }));
    } else {
      pts.push(Object.assign(impl.ambiB(a), { type: 'B' }));
      pts.push(Object.assign(impl.ambiC(a), { type: 'C' }));
    }

    return pts;
  }

  // Phases UI
  const phases = [
    { name: 'Slide right' },
    { name: 'rotation begins', transition: true },
    { name: 'Phase 1', contactPoints: 'A, C, D' },
    { name: 'critical angle \u03B2', transition: true },
    { name: 'Phase 2', contactPoints: 'x, A, B, C, D' },
    { name: 'critical angle \u03C0/2\u2212\u03B2', transition: true },
    { name: 'Phase 3', contactPoints: 'A, B, C' },
    { name: 'rotation ends', transition: true },
    { name: 'Slide down' },
    { name: 'rotation begins (2nd)', transition: true },
    { name: 'Phase 3\u2032' },
    { name: 'critical angle \u03B2', transition: true },
    { name: 'Phase 2\u2032' },
    { name: 'critical angle \u03C0/2\u2212\u03B2', transition: true },
    { name: 'Phase 1\u2032' },
    { name: 'rotation ends (2nd)', transition: true },
    { name: 'Slide right' }
  ];

  function getActivePhaseIndex(t) {
    const eps = SofaMath.TRANS_EPS;

    // Phase 1: slide right
    if (t < P1 - eps) return 0;
    if (t < P1 + eps) return 1; // rotation begins

    // Phase 2: first rotation (3 subphases -> indices 2, 4, 6 with transitions 3, 5)
    if (t <= P2 + eps) {
      if (t > P2 - eps) return 7; // rotation ends
      const rotT = t - P1;
      const subWidth = (P2 - P1) / N_SUB;
      const subIdx = Math.min(Math.floor(rotT / subWidth), N_SUB - 1);
      const subStart = P1 + subIdx * subWidth;
      const subEnd = subStart + subWidth;
      if (subIdx > 0 && t < subStart + eps) return subIdx * 2 + 1; // transition
      if (subIdx < N_SUB - 1 && t > subEnd - eps) return subIdx * 2 + 3; // transition
      return subIdx * 2 + 2; // phase
    }

    // Phase 3: slide down
    if (t < P3 - eps) return 8;
    if (t < P3 + eps) return 9; // rotation begins (2nd)

    // Phase 4: second rotation (3 subphases -> indices 10, 12, 14 with transitions 11, 13)
    if (t <= P4 + eps) {
      if (t > P4 - eps) return 15; // rotation ends (2nd)
      const rotT = t - P3;
      const subWidth = (P4 - P3) / N_SUB;
      const subIdx = Math.min(Math.floor(rotT / subWidth), N_SUB - 1);
      const subStart = P3 + subIdx * subWidth;
      const subEnd = subStart + subWidth;
      if (subIdx > 0 && t < subStart + eps) return 10 + subIdx * 2 - 1; // transition
      if (subIdx < N_SUB - 1 && t > subEnd - eps) return 10 + subIdx * 2 + 1; // transition
      return 10 + subIdx * 2; // phase
    }

    // Phase 5: slide right
    return 16;
  }

  // S-hallway drawing methods
  function drawHallway(ctx, transform) {
    const w = transform.canvasWidth;
    const h = transform.canvasHeight;
    const L = 15;

    ctx.fillStyle = SofaMath.bgColor();
    ctx.fillRect(0, 0, w, h);

    // S-hallway polygon (filled interior)
    // Vertices from Mathematica: (-L,0),(0,0),(0,-L),(L+1,-L),(L+1,-L+1),(1,-L+1),(1,1),(-L,1)
    // Using V instead of L for the vertical segment
    const poly = [
      { x: -L, y: 0 }, { x: 0, y: 0 }, { x: 0, y: -V },
      { x: L + 1, y: -V }, { x: L + 1, y: -V + 1 }, { x: 1, y: -V + 1 },
      { x: 1, y: 1 }, { x: -L, y: 1 }
    ];

    ctx.fillStyle = '#3a3a3a';
    ctx.beginPath();
    for (let i = 0; i < poly.length; i++) {
      const cp = transform.toCanvas(poly[i].x, poly[i].y);
      if (i === 0) ctx.moveTo(cp.x, cp.y);
      else ctx.lineTo(cp.x, cp.y);
    }
    ctx.closePath();
    ctx.fill();

    // Inner walls (white lines)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;

    // Inner wall path: (-L,0) -> (0,0) -> (0,-V) -> (L+1,-V)
    const iw = [
      { x: -L, y: 0 }, { x: 0, y: 0 }, { x: 0, y: -V }, { x: L + 1, y: -V }
    ];
    ctx.beginPath();
    for (let i = 0; i < iw.length; i++) {
      const cp = transform.toCanvas(iw[i].x, iw[i].y);
      if (i === 0) ctx.moveTo(cp.x, cp.y);
      else ctx.lineTo(cp.x, cp.y);
    }
    ctx.stroke();

    // Outer wall path: (-L,1) -> (1,1) -> (1,-V+1) -> (L+1,-V+1)
    const ow = [
      { x: -L, y: 1 }, { x: 1, y: 1 }, { x: 1, y: -V + 1 }, { x: L + 1, y: -V + 1 }
    ];
    ctx.beginPath();
    for (let i = 0; i < ow.length; i++) {
      const cp = transform.toCanvas(ow[i].x, ow[i].y);
      if (i === 0) ctx.moveTo(cp.x, cp.y);
      else ctx.lineTo(cp.x, cp.y);
    }
    ctx.stroke();
  }

  // Sofa-perspective hallway drawing (S-hallway rotated around sofa)
  function drawSofaPerspective(ctx, transform, t) {
    const w = transform.canvasWidth;
    const h = transform.canvasHeight;
    const phase = getPhase(t);
    const rp = phase.rotPathPoint;
    const angle = phase.angle;
    const dx = phase.dx;
    const dy = phase.dy;

    ctx.fillStyle = SofaMath.bgColor();
    ctx.fillRect(0, 0, w, h);

    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const rpx = rp.x;
    const rpy = rp.y;

    // Inverse of movementTransform: hallway point h -> sofa frame
    // Forward: q = R(-a)*(p - rp) + (dx, dy)
    // Inverse: p = R(a)*(q - (dx, dy)) + rp
    // So for hallway point h: sofa_frame = R(a)*(h - (dx, dy)) + rp
    function xformToCanvas(hx, hy) {
      const qx = hx - dx;
      const qy = hy - dy;
      const mx = cosA * qx - sinA * qy + rpx;
      const my = sinA * qx + cosA * qy + rpy;
      return transform.toCanvas(mx, my);
    }

    // S-hallway polygon
    const L = 15;
    const sPoly = [
      { x: -L, y: 0 }, { x: 0, y: 0 }, { x: 0, y: -V },
      { x: L + 1, y: -V }, { x: L + 1, y: -V + 1 }, { x: 1, y: -V + 1 },
      { x: 1, y: 1 }, { x: -L, y: 1 }
    ];

    ctx.fillStyle = '#3a3a3a';
    ctx.beginPath();
    for (let i = 0; i < sPoly.length; i++) {
      const cp = xformToCanvas(sPoly[i].x, sPoly[i].y);
      if (i === 0) ctx.moveTo(cp.x, cp.y);
      else ctx.lineTo(cp.x, cp.y);
    }
    ctx.closePath();
    ctx.fill();

    // Inner walls
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;

    const iw = [
      { x: -L, y: 0 }, { x: 0, y: 0 }, { x: 0, y: -V }, { x: L + 1, y: -V }
    ];
    ctx.beginPath();
    for (let i = 0; i < iw.length; i++) {
      const cp = xformToCanvas(iw[i].x, iw[i].y);
      if (i === 0) ctx.moveTo(cp.x, cp.y);
      else ctx.lineTo(cp.x, cp.y);
    }
    ctx.stroke();

    // Outer walls
    const ow = [
      { x: -L, y: 1 }, { x: 1, y: 1 }, { x: 1, y: -V + 1 }, { x: L + 1, y: -V + 1 }
    ];
    ctx.beginPath();
    for (let i = 0; i < ow.length; i++) {
      const cp = xformToCanvas(ow[i].x, ow[i].y);
      if (i === 0) ctx.moveTo(cp.x, cp.y);
      else ctx.lineTo(cp.x, cp.y);
    }
    ctx.stroke();
  }

  // 3D hallway type identifier
  const hallwayType = 's-hallway';

  // Build S-hallway for Three.js
  function buildHallwayGroup() {
    const group = new THREE.Group();
    const L = 5; // ARM_LEN from three-view.js
    const H1 = 0.2;
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xc27070 });
    const wallThickness = 0.03;
    const wt = wallThickness;

    // Floor: S-shaped polygon in math coords
    const floorShape = new THREE.Shape();
    floorShape.moveTo(-L, -wt);
    floorShape.lineTo(-wt, -wt);
    floorShape.lineTo(-wt, -V - wt);
    floorShape.lineTo(L + 1 + wt, -V - wt);
    floorShape.lineTo(L + 1 + wt, -V + 1 + wt);
    floorShape.lineTo(1 + wt, -V + 1 + wt);
    floorShape.lineTo(1 + wt, 1 + wt);
    floorShape.lineTo(-L, 1 + wt);
    floorShape.closePath();

    const floorGeom = new THREE.ShapeGeometry(floorShape);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x3a3a3a, side: THREE.DoubleSide });
    const floorMesh = new THREE.Mesh(floorGeom, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    group.add(floorMesh);

    // Wall helper
    function addWall(x1, z1, x2, z2, nx, nz) {
      const ddx = x2 - x1;
      const dz = z2 - z1;
      const len = Math.sqrt(ddx * ddx + dz * dz);
      const geom = new THREE.BoxGeometry(len, H1, wallThickness);
      const mesh = new THREE.Mesh(geom, wallMat);
      const offset = wallThickness / 2;
      mesh.position.set((x1 + x2) / 2 + nx * offset, H1 / 2, (z1 + z2) / 2 + nz * offset);
      const wallAngle = Math.atan2(dz, ddx);
      mesh.rotation.y = -wallAngle;
      group.add(mesh);
    }

    // Three.js coords: (x, h, z) where z = -math_y
    // Inner walls (math): (-L,0)->(0,0)->(0,-V)->(L+1,-V)
    // In Three.js z:      (-L,0)->(0,0)->(0,V)->(L+1,V)
    //
    // At the 2nd inner corner (0,V), extend both walls past the corner by wt
    // so their bodies overlap, forming a solid joint (same pattern as 1st corner).
    addWall(-L, 0, 0, 0, 0, 1);              // horiz inner, top arm
    addWall(0, 0, 0, V + wt, -1, 0);         // vert inner, left side (extended past 2nd corner)
    addWall(-wt, V, L + 1, V, 0, 1);         // horiz inner, bottom arm (extended past 2nd corner)

    // Outer walls (math): (-L,1)->(1,1)->(1,-V+1)->(L+1,-V+1)
    // In Three.js z:      (-L,-1)->(1,-1)->(1,V-1)->(L+1,V-1)
    //
    // At the 2nd outer corner (1,V-1), we can't extend either wall past the
    // corner without intruding into the hallway. Instead, place a small cap box.
    addWall(-L, -1, 1 + wt, -1, 0, -1);      // horiz outer, top arm (extended past 1st corner)
    addWall(1, -1, 1, V - 1, 1, 0);          // vert outer, right side (ends at 2nd corner)
    addWall(1, V - 1, L + 1, V - 1, 0, -1);  // horiz outer, bottom arm (starts at 2nd corner)

    // Corner cap at 2nd outer corner: small box bridging the two outer wall ends
    const capGeom = new THREE.BoxGeometry(wt, H1, wt);
    const capMesh = new THREE.Mesh(capGeom, wallMat);
    capMesh.position.set(1 + wt / 2, H1 / 2, V - 1 - wt / 2);
    group.add(capMesh);

    return group;
  }

  return {
    name: 'Romik (double turn)',
    hallwayType,
    getArea() {
      // Same area as standard Romik
      const s2 = Math.sqrt(2);
      return Math.cbrt(3 + 2 * s2) + Math.cbrt(3 - 2 * s2) - 1
           + Math.atan(((s2 + 1) ** (1/3) - (s2 - 1) ** (1/3)) / 2);
    },
    canonicalPoints: impl.canonicalPoints,
    tickMarkLength: 0.03125,
    getTickMarks() { return impl.tickMarks; },
    getRotPathPoint(angle) { return impl.ambiX(angle); },
    getPhase,
    getPhaseBoundaries,
    getContactPoints,
    phases,
    getActivePhaseIndex,
    draw,
    drawHallway,
    drawSofaPerspective,
    buildHallwayGroup,
    V
  };
})();
