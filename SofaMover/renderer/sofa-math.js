/**
 * Shared math utilities for moving sofa shapes.
 *
 * Rotation path solutions x_j(t) for j=1..6 from the paper,
 * contact path functions A, B, C, D, and movement transforms.
 */

const SofaMath = (() => {

  // --- Rotation matrix R(t) applied to vector (vx, vy) ---
  function rot(t, vx, vy) {
    const c = Math.cos(t), s = Math.sin(t);
    return { x: c * vx - s * vy, y: s * vx + c * vy };
  }

  // --- Unit vectors ---
  function mu(t) { return { x: Math.cos(t), y: Math.sin(t) }; }
  function nu(t) { return { x: -Math.sin(t), y: Math.cos(t) }; }

  // --- Dot product ---
  function dot(a, b) { return a.x * b.x + a.y * b.y; }

  // --- Rotation path functions x_j(t) ---
  // Each takes a constants object with the relevant parameters.

  function x1(t, k) {
    const v = {
      x: k.a1 * Math.cos(t) + k.a2 * Math.sin(t) - 1,
      y: -k.a2 * Math.cos(t) + k.a1 * Math.sin(t) - 0.5
    };
    const r = rot(t, v.x, v.y);
    return { x: r.x + k.k11, y: r.y + k.k12 };
  }

  function x2(t, k) {
    const v = {
      x: -t * t / 4 + k.b1 * t + k.b2,
      y: t / 2 - k.b1 - 1
    };
    const r = rot(t, v.x, v.y);
    return { x: r.x + k.k21, y: r.y + k.k22 };
  }

  function x3(t, k) {
    const v = { x: k.c1 - t, y: k.c2 + t };
    const r = rot(t, v.x, v.y);
    return { x: r.x + k.k31, y: r.y + k.k32 };
  }

  function x4(t, k) {
    const v = {
      x: -t / 2 + k.d1 - 1,
      y: -t * t / 4 + k.d1 * t + k.d2
    };
    const r = rot(t, v.x, v.y);
    return { x: r.x + k.k41, y: r.y + k.k42 };
  }

  function x5(t, k) {
    const v = {
      x: k.e1 * Math.cos(t) + k.e2 * Math.sin(t) - 0.5,
      y: -k.e2 * Math.cos(t) + k.e1 * Math.sin(t) - 1
    };
    const r = rot(t, v.x, v.y);
    return { x: r.x + k.k51, y: r.y + k.k52 };
  }

  function x6(t, k) {
    const v = {
      x: k.f1 * Math.cos(t / 2) + k.f2 * Math.sin(t / 2) - 1,
      y: -k.f2 * Math.cos(t / 2) + k.f1 * Math.sin(t / 2) - 1
    };
    const r = rot(t, v.x, v.y);
    return { x: r.x + k.k61, y: r.y + k.k62 };
  }

  // --- Numerical derivative of a path function ---
  const EPS = 1e-7;
  function deriv(fn, t, k) {
    const p1 = fn(t + EPS, k);
    const p0 = fn(t - EPS, k);
    return { x: (p1.x - p0.x) / (2 * EPS), y: (p1.y - p0.y) / (2 * EPS) };
  }

  // --- Contact path functions ---
  // A(t) = x(t) + mu(t) + (x'(t) . mu(t)) * nu(t)
  // B(t) = x(t) + (x'(t) . mu(t)) * nu(t)
  // C(t) = x(t) + nu(t) - (x'(t) . nu(t)) * mu(t)
  // D(t) = x(t) - (x'(t) . nu(t)) * mu(t)

  function contactA(fn, t, k) {
    const p = fn(t, k), dp = deriv(fn, t, k);
    const m = mu(t), n = nu(t);
    const dpDotMu = dot(dp, m);
    return { x: p.x + m.x + dpDotMu * n.x, y: p.y + m.y + dpDotMu * n.y };
  }

  function contactB(fn, t, k) {
    const p = fn(t, k), dp = deriv(fn, t, k);
    const m = mu(t), n = nu(t);
    const dpDotMu = dot(dp, m);
    return { x: p.x + dpDotMu * n.x, y: p.y + dpDotMu * n.y };
  }

  function contactC(fn, t, k) {
    const p = fn(t, k), dp = deriv(fn, t, k);
    const m = mu(t), n = nu(t);
    const dpDotNu = dot(dp, n);
    return { x: p.x + n.x - dpDotNu * m.x, y: p.y + n.y - dpDotNu * m.y };
  }

  function contactD(fn, t, k) {
    const p = fn(t, k), dp = deriv(fn, t, k);
    const m = mu(t), n = nu(t);
    const dpDotNu = dot(dp, n);
    return { x: p.x - dpDotNu * m.x, y: p.y - dpDotNu * m.y };
  }

  // --- Movement transform ---
  // At rotation angle a with rotation path xFn:
  // transform point p -> R(-a) * (p - x(a)) + (dx, dy)
  function movementTransform(px, py, angle, rotPathPt, dx, dy) {
    const qx = px - rotPathPt.x;
    const qy = py - rotPathPt.y;
    const cosA = Math.cos(-angle);
    const sinA = Math.sin(-angle);
    return {
      x: cosA * qx - sinA * qy + dx,
      y: sinA * qx + cosA * qy + dy
    };
  }

  // --- Animation timing constants ---
  const T1 = 0.2;          // end of enter (sliding) phase
  const T2 = 0.8;          // start of exit (sliding) phase
  const ENTER_DIST = 3;    // distance traveled during enter/exit slides
  const TRANS_EPS = 0.0025; // half-width of transition highlight band in t-space

  // --- Easing function ---
  // Smoothstep: maps [0,1] -> [0,1] with zero derivative at endpoints
  function smoothstep(t) {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    return t * t * (3 - 2 * t);
  }

  // --- Three-phase slider logic with easing and subphases ---
  // subphaseBreakpoints: array of N+1 angle values defining N subphases
  //   e.g. [0, PI/2] for 1 subphase, [0, beta, PI/2-beta, PI/2] for 3 subphases
  // Returns { angle, dx, dy }
  function threePhaseEased(t, subphaseBreakpoints) {
    const bp = subphaseBreakpoints;
    const N = bp.length - 1;  // number of subphases
    let angle = 0, dx = 0, dy = 0;

    if (t <= T1) {
      // Enter phase: slide in from left
      const progress = smoothstep(t / T1);
      dx = -ENTER_DIST * (1 - progress);
    } else if (t <= T2) {
      // Rotation phase: divide [T1, T2] into N equal subintervals
      const rotT = t - T1;
      const rotWidth = T2 - T1;
      const subWidth = rotWidth / N;
      let i = Math.floor(rotT / subWidth);
      if (i >= N) i = N - 1;
      const localT = (rotT - i * subWidth) / subWidth;
      const easedT = smoothstep(localT);
      angle = bp[i] + easedT * (bp[i + 1] - bp[i]);
    } else {
      // Exit phase: slide out downward
      angle = bp[N];  // final angle (should be PI/2)
      const progress = smoothstep((t - T2) / (1 - T2));
      dy = -ENTER_DIST * progress;
    }

    return { angle, dx, dy };
  }

  // --- Phase boundary points ---
  // Returns sorted array of all phase boundary t-values for arrow key navigation.
  function getPhaseBoundaries(subphaseBreakpoints) {
    const N = subphaseBreakpoints.length - 1;
    const subWidth = (T2 - T1) / N;
    const boundaries = [0, T1];
    for (let k = 1; k < N; k++) boundaries.push(T1 + k * subWidth);
    boundaries.push(T2, 1);
    return boundaries;
  }

  // --- Sample points along a curve and apply movement transform ---
  function sampleCurve(curveFn, tStart, tEnd, steps, angle, rotPathFn, rotPathK, dx, dy) {
    const pts = [];
    for (let i = 0; i <= steps; i++) {
      const t = tStart + (tEnd - tStart) * i / steps;
      const p = curveFn(t);
      const rp = rotPathFn(t, rotPathK);
      pts.push(movementTransform(p.x, p.y, angle, rp, dx, dy));
    }
    return pts;
  }

  // --- Draw a polygon from math-coord points ---
  function drawPolygon(ctx, transform, points) {
    ctx.beginPath();
    for (let i = 0; i < points.length; i++) {
      const cp = transform.toCanvas(points[i].x, points[i].y);
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

  // --- Shoelace formula for polygon area ---
  function polygonArea(pts) {
    let area = 0;
    const n = pts.length;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      area += pts[i].x * pts[j].y - pts[j].x * pts[i].y;
    }
    return Math.abs(area) / 2;
  }

  return {
    rot, mu, nu, dot,
    x1, x2, x3, x4, x5, x6,
    deriv,
    contactA, contactB, contactC, contactD,
    movementTransform, threePhaseEased, smoothstep, getPhaseBoundaries,
    T1, T2, ENTER_DIST, TRANS_EPS,
    drawPolygon, polygonArea
  };
})();
