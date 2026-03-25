/**
 * Unit square sofa.
 *
 * The unit square fits exactly in the hallway (width 1). It moves through
 * via pure translation — no rotation needed.
 *
 * Two eased subphases (slider t in [0, 1]):
 *   Subphase 1 (t in [0, 0.5]):   Slide right through horizontal arm (eased)
 *   Subphase 2 (t in [0.5, 1]):   Slide down through vertical arm (eased)
 *
 * Position is the bottom-left corner of the square in math coordinates.
 * At the corner, bottom-left = (0, 0), so the square occupies [0,1] x [0,1].
 */

const UnitSquare = {
  name: 'Unit Square',
  getArea() { return 1; },

  canonicalPoints: [
    { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }
  ],

  // Unit square has no rotation — rotation path is always (0,0)
  getRotPathPoint(angle) { return { x: 0, y: 0 }; },

  getPhase(t) {
    const dist = SofaMath.ENTER_DIST;
    if (t <= 0.5) {
      const progress = SofaMath.smoothstep(t / 0.5);
      return { angle: 0, dx: -dist * (1 - progress), dy: 0 };
    } else {
      const progress = SofaMath.smoothstep((t - 0.5) / 0.5);
      return { angle: 0, dx: 0, dy: -dist * progress };
    }
  },

  getPhaseBoundaries() { return [0, 0.5, 1]; },

  phases: [
    { name: 'Slide right' },
    { name: '-transition-', transition: true },
    { name: 'Slide down' }
  ],
  getActivePhaseIndex(t) {
    const eps = SofaMath.TRANS_EPS;
    if (t < 0.5 - eps) return 0;
    if (t <= 0.5 + eps) return 1;
    return 2;
  },

  draw(ctx, transform, t) {
    const p = this.getPhase(t);
    const topLeft = transform.toCanvas(p.dx, p.dy + 1);
    const size = transform.toPixels(1);

    ctx.fillStyle = 'rgba(66, 133, 244, 0.45)';
    ctx.fillRect(topLeft.x, topLeft.y, size, size);

    ctx.strokeStyle = 'rgba(66, 133, 244, 0.9)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(topLeft.x, topLeft.y, size, size);
  }
};
