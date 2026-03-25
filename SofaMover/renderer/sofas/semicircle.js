/**
 * Semicircle sofa.
 *
 * Shape: upper half of the unit circle centered at origin.
 * Rotation path: x(t) = (0, 0) — the semicircle only rotates, no translation.
 * At rotation angle a: each point p maps to R(-a) * p.
 */

const Semicircle = (() => {
  // Build canonical boundary points
  const numSegments = 64;
  const pts = [];
  for (let i = 0; i <= numSegments; i++) {
    const theta = (i / numSegments) * Math.PI;
    pts.push({ x: Math.cos(theta), y: Math.sin(theta) });
  }

  const breakpoints = [0, Math.PI / 2];

  return {
    name: 'Semicircle',
    getArea() { return Math.PI / 2; },

    canonicalPoints: pts,

    getRotPathPoint(angle) { return { x: 0, y: 0 }; },

    getPhase(t) { return SofaMath.threePhaseEased(t, breakpoints); },
    getPhaseBoundaries() { return SofaMath.getPhaseBoundaries(breakpoints); },

    phases: [
      { name: 'Slide right' },
      { name: '-transition-', transition: true },
      { name: 'Rotation', contactPoints: 'x, A, C' },
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

    getContactPoints(t) {
      const phase = SofaMath.threePhaseEased(t, breakpoints);
      const a = phase.angle;
      if (t <= SofaMath.T1) {
        // Sliding in: only C (y=1 wall)
        return [{ x: -Math.sin(a), y: Math.cos(a), type: 'C' }];
      } else if (t > SofaMath.T2) {
        // Sliding out: only A (x=1 wall)
        return [{ x: Math.cos(a), y: Math.sin(a), type: 'A' }];
      }
      // Rotation: x, A, C
      return [
        { x: 0, y: 0, type: 'corner' },
        { x: Math.cos(a), y: Math.sin(a), type: 'A' },
        { x: -Math.sin(a), y: Math.cos(a), type: 'C' }
      ];
    },

    draw(ctx, transform, t) {
      const phase = SofaMath.threePhaseEased(t, breakpoints);
      const cosA = Math.cos(-phase.angle);
      const sinA = Math.sin(-phase.angle);

      ctx.beginPath();
      for (let i = 0; i < pts.length; i++) {
        const px = pts[i].x, py = pts[i].y;
        const rx = cosA * px - sinA * py + phase.dx;
        const ry = sinA * px + cosA * py + phase.dy;
        const cp = transform.toCanvas(rx, ry);
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
