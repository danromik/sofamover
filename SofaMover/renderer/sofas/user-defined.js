/**
 * User-defined sofa — interactive drag-to-draw rotation path.
 *
 * The user drags a handle from the hallway inner corner (0,0), tracing a path
 * that goes left and up, then left and down, ending on the negative x-axis.
 * The sofa is computed as the intersection of L-shaped hallways along the path.
 */

const UserDefined = (() => {
  // --- State ---
  let state = 'idle'; // 'idle' | 'dragging' | 'complete'
  let pathPoints = [];       // {x, y} in math coords
  let cumArcLengths = [];    // cumulative arc length at each sample
  let assignedAngles = [];   // final angle at each sample (after completion)
  let sofaPolygon = [];      // computed sofa vertices
  let sofaArea = 0;
  let yMax = 0;              // max y seen during drag
  let descending = false;    // y has started decreasing

  // --- Constants ---
  const ARM_LEN = 3;
  const CLIP_SCALE = 1e6;
  const MAX_HALLWAYS = 80;
  const MIN_SAMPLE_PX = 3;       // minimum pixels between samples
  const HANDLE_RADIUS_PX = 15;   // click target radius in pixels
  const ARC_HINT_RADIUS = 0.6;

  // --- Mouse handling ---

  function onMouseDown(e, canvas, transform) {
    if (state === 'complete') {
      // Allow reset by clicking handle area again
      return;
    }
    if (state !== 'idle') return;

    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const math = transform.toMath(cx, cy);
    const dist = Math.sqrt(math.x * math.x + math.y * math.y);
    const handleRadius = HANDLE_RADIUS_PX / transform.scale;

    if (dist < handleRadius) {
      state = 'dragging';
      pathPoints = [{ x: 0, y: 0 }];
      cumArcLengths = [0];
      yMax = 0;
      descending = false;
    }
  }

  function onMouseMove(e, canvas, transform) {
    if (state !== 'dragging') return;

    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const math = transform.toMath(cx, cy);

    // Only accept points left of origin (small tolerance)
    if (math.x > 0.05) return;

    const last = pathPoints[pathPoints.length - 1];
    const dx = math.x - last.x;
    const dy = math.y - last.y;
    const segLen = Math.sqrt(dx * dx + dy * dy);
    const minDist = MIN_SAMPLE_PX / transform.scale;
    if (segLen < minDist) return;

    // Track y profile
    if (math.y > yMax) yMax = math.y;
    if (!descending && yMax > 0.05 && math.y < yMax * 0.85) descending = true;

    // Check for path completion: descending and crossing y=0 on negative x-axis
    if (descending && math.y <= 0 && math.x < -0.1) {
      // Interpolate to find exact x-axis crossing
      const prevY = last.y;
      const frac = prevY / (prevY - math.y);
      const crossX = last.x + frac * (math.x - last.x);
      pathPoints.push({ x: crossX, y: 0 });
      cumArcLengths.push(cumArcLengths[cumArcLengths.length - 1] +
        Math.sqrt((crossX - last.x) ** 2 + last.y ** 2));
      completePath();
      return;
    }

    pathPoints.push({ x: math.x, y: math.y });
    cumArcLengths.push(cumArcLengths[cumArcLengths.length - 1] + segLen);
  }

  function onMouseUp(e, canvas, transform) {
    if (state !== 'dragging') return;
    if (pathPoints.length < 5) {
      state = 'idle';
      pathPoints = [];
      cumArcLengths = [];
      return;
    }

    // Auto-complete: extend vertically down to y=0
    const last = pathPoints[pathPoints.length - 1];
    if (last.y > 0.01) {
      const steps = Math.max(Math.ceil(last.y * transform.scale / MIN_SAMPLE_PX), 3);
      const stepLen = last.y / steps;
      for (let i = 1; i <= steps; i++) {
        const y = last.y * (1 - i / steps);
        pathPoints.push({ x: last.x, y: y });
        cumArcLengths.push(cumArcLengths[cumArcLengths.length - 1] + stepLen);
      }
    }
    // Ensure last point is exactly y=0
    const finalPt = pathPoints[pathPoints.length - 1];
    if (Math.abs(finalPt.y) > 1e-6) {
      pathPoints.push({ x: finalPt.x, y: 0 });
      cumArcLengths.push(cumArcLengths[cumArcLengths.length - 1] + Math.abs(finalPt.y));
    }
    completePath();
  }

  // --- Path completion and polygon computation ---

  function completePath() {
    state = 'complete';

    const totalArc = cumArcLengths[cumArcLengths.length - 1];
    assignedAngles = cumArcLengths.map(l => (l / totalArc) * Math.PI / 2);

    // Subsample if too many points
    let samplePoints, sampleAngles;
    if (pathPoints.length > MAX_HALLWAYS) {
      samplePoints = [];
      sampleAngles = [];
      for (let i = 0; i < MAX_HALLWAYS; i++) {
        const targetArc = (i / (MAX_HALLWAYS - 1)) * totalArc;
        let j = 0;
        while (j < cumArcLengths.length - 1 && cumArcLengths[j + 1] < targetArc) j++;
        const span = cumArcLengths[j + 1] - cumArcLengths[j];
        const frac = span > 0 ? (targetArc - cumArcLengths[j]) / span : 0;
        const p1 = pathPoints[j];
        const p2 = pathPoints[Math.min(j + 1, pathPoints.length - 1)];
        samplePoints.push({ x: p1.x + frac * (p2.x - p1.x), y: p1.y + frac * (p2.y - p1.y) });
        sampleAngles.push((i / (MAX_HALLWAYS - 1)) * Math.PI / 2);
      }
    } else {
      samplePoints = pathPoints;
      sampleAngles = assignedAngles;
    }

    computeSofaPolygon(samplePoints, sampleAngles);
  }

  function buildLShapePath(angle, pos) {
    const L = ARM_LEN;
    const ca = Math.cos(angle), sa = Math.sin(angle);
    const localVerts = [[-L, 0], [0, 0], [0, -L], [1, -L], [1, 1], [-L, 1]];
    return localVerts.map(([u, v]) => ({
      X: Math.round((pos.x + ca * u - sa * v) * CLIP_SCALE),
      Y: Math.round((pos.y + sa * u + ca * v) * CLIP_SCALE)
    }));
  }

  function computeSofaPolygon(points, angles) {
    let result = [buildLShapePath(angles[0], points[0])];

    for (let k = 1; k < points.length; k++) {
      const lShape = buildLShapePath(angles[k], points[k]);
      const cpr = new ClipperLib.Clipper();
      cpr.AddPaths(result, ClipperLib.PolyType.ptSubject, true);
      cpr.AddPath(lShape, ClipperLib.PolyType.ptClip, true);
      const solution = [];
      cpr.Execute(ClipperLib.ClipType.ctIntersection, solution,
        ClipperLib.PolyFillType.pftNonZero, ClipperLib.PolyFillType.pftNonZero);
      result = solution;
      if (result.length === 0) {
        sofaPolygon = [];
        sofaArea = 0;
        return;
      }
    }

    if (result.length === 0) {
      sofaPolygon = [];
      sofaArea = 0;
      return;
    }
    sofaPolygon = result[0].map(p => ({ x: p.X / CLIP_SCALE, y: p.Y / CLIP_SCALE }));
    sofaArea = SofaMath.polygonArea(sofaPolygon);
  }

  // --- Angle estimation during drag ---

  function estimateAngle(index) {
    if (index <= 0) return 0;
    // Calibrated so arc length ~2.0 → 90°
    return Math.min(cumArcLengths[index] * Math.PI / 4, Math.PI / 2);
  }

  function getCurrentAngle() {
    if (state !== 'dragging' || pathPoints.length < 2) return 0;
    return estimateAngle(pathPoints.length - 1);
  }

  // --- Rotation path interpolation ---

  function interpRotPath(angle) {
    if (!assignedAngles.length) return { x: 0, y: 0 };
    if (angle <= 0) return pathPoints[0];
    if (angle >= Math.PI / 2) return pathPoints[pathPoints.length - 1];

    let i = 0;
    while (i < assignedAngles.length - 1 && assignedAngles[i + 1] < angle) i++;
    if (i >= assignedAngles.length - 1) return pathPoints[pathPoints.length - 1];
    const span = assignedAngles[i + 1] - assignedAngles[i];
    const frac = span > 0 ? (angle - assignedAngles[i]) / span : 0;
    return {
      x: pathPoints[i].x + frac * (pathPoints[i + 1].x - pathPoints[i].x),
      y: pathPoints[i].y + frac * (pathPoints[i + 1].y - pathPoints[i].y)
    };
  }

  // --- Drawing: idle state ---

  function drawIdle(ctx, transform) {
    drawHallwayRotated(ctx, transform, 0, { x: 0, y: 0 }, 0, 0);
    drawArcHint(ctx, transform);
    drawHandle(ctx, transform, 0, 0);
  }

  function drawArcHint(ctx, transform) {
    const r = ARC_HINT_RADIUS;
    const steps = 40;

    // Hammersley parametrization: x(a) = r(cos(2a)-1), y(a) = r*sin(2a)
    const pts = [];
    for (let i = 0; i <= steps; i++) {
      const a = (i / steps) * Math.PI / 2;
      pts.push({
        x: r * (Math.cos(2 * a) - 1),
        y: r * Math.sin(2 * a)
      });
    }

    // Draw dashed arc
    ctx.beginPath();
    for (let i = 0; i < pts.length; i++) {
      const cp = transform.toCanvas(pts[i].x, pts[i].y);
      if (i === 0) ctx.moveTo(cp.x, cp.y);
      else ctx.lineTo(cp.x, cp.y);
    }
    ctx.strokeStyle = 'rgba(255, 200, 0, 0.4)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 5]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Arrowhead at end of arc
    const last = transform.toCanvas(pts[steps].x, pts[steps].y);
    const prev = transform.toCanvas(pts[steps - 1].x, pts[steps - 1].y);
    const adx = last.x - prev.x;
    const ady = last.y - prev.y;
    const alen = Math.sqrt(adx * adx + ady * ady);
    if (alen > 0) {
      const ux = adx / alen, uy = ady / alen;
      const arrowLen = 10;
      const arrowWidth = 5;
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(last.x - arrowLen * ux + arrowWidth * uy,
                 last.y - arrowLen * uy - arrowWidth * ux);
      ctx.lineTo(last.x - arrowLen * ux - arrowWidth * uy,
                 last.y - arrowLen * uy + arrowWidth * ux);
      ctx.closePath();
      ctx.fillStyle = 'rgba(255, 200, 0, 0.4)';
      ctx.fill();
    }
  }

  function drawHandle(ctx, transform, mx, my) {
    const cp = transform.toCanvas(mx, my);
    ctx.beginPath();
    ctx.arc(cp.x, cp.y, 8, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(255, 200, 0, 0.8)';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // --- Drawing: dragging state ---

  function drawDragging(ctx, transform) {
    if (pathPoints.length >= 2) {
      // Draw current hallway (fills background with black + draws hallway)
      const cur = pathPoints[pathPoints.length - 1];
      const angle = estimateAngle(pathPoints.length - 1);
      drawHallwayRotated(ctx, transform, angle, cur, 0, 0);
    } else {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, transform.canvasWidth, transform.canvasHeight);
    }

    // Draw faint hallway outlines at sampled positions (on top of current hallway)
    drawHallwayOutlines(ctx, transform);

    // Draw the traced path
    if (pathPoints.length >= 2) {
      ctx.beginPath();
      for (let i = 0; i < pathPoints.length; i++) {
        const cp = transform.toCanvas(pathPoints[i].x, pathPoints[i].y);
        if (i === 0) ctx.moveTo(cp.x, cp.y);
        else ctx.lineTo(cp.x, cp.y);
      }
      ctx.strokeStyle = 'rgba(255, 200, 0, 0.9)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw handle at current position
      const cur = pathPoints[pathPoints.length - 1];
      drawHandle(ctx, transform, cur.x, cur.y);
    }
  }

  function drawHallwayOutlines(ctx, transform) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;

    const L = 8;
    // Draw every Nth point to avoid clutter
    const step = Math.max(1, Math.floor(pathPoints.length / 40));

    for (let k = 0; k < pathPoints.length; k += step) {
      const a = estimateAngle(k);
      const px = pathPoints[k].x, py = pathPoints[k].y;
      const ca = Math.cos(a), sa = Math.sin(a);

      // Inner walls (L-corner)
      const iw1a = transform.toCanvas(px + L * (-sa), py + L * ca);
      const iw1b = transform.toCanvas(px, py);
      const iw2b = transform.toCanvas(px + L * ca, py + L * sa);
      ctx.beginPath();
      ctx.moveTo(iw1a.x, iw1a.y);
      ctx.lineTo(iw1b.x, iw1b.y);
      ctx.lineTo(iw2b.x, iw2b.y);
      ctx.stroke();

      // Outer walls (offset by 1)
      const oc = transform.toCanvas(px + ca - sa, py + sa + ca);
      const ow1a = transform.toCanvas(px + (-sa) - L * ca, py + ca - L * sa);
      const ow2a = transform.toCanvas(px + ca + L * (-sa), py + sa + L * ca);
      ctx.beginPath();
      ctx.moveTo(ow1a.x, ow1a.y);
      ctx.lineTo(oc.x, oc.y);
      ctx.lineTo(ow2a.x, ow2a.y);
      ctx.stroke();
    }
  }

  // --- Drawing: hallway perspective (sofa moving through hallway) ---

  function drawInHallwayPerspective(ctx, transform, t) {
    const phase = SofaMath.threePhaseEased(t, [0, Math.PI / 2]);
    const rp = interpRotPath(phase.angle);

    if (sofaPolygon.length < 3) return;

    ctx.beginPath();
    for (let i = 0; i < sofaPolygon.length; i++) {
      const mp = SofaMath.movementTransform(
        sofaPolygon[i].x, sofaPolygon[i].y,
        phase.angle, rp, phase.dx, phase.dy
      );
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

  // --- Public sofa interface ---

  const breakpoints = [0, Math.PI / 2];

  return {
    name: 'User-defined',
    isUserDefined: true,

    getArea() { return sofaArea; },

    get canonicalPoints() { return sofaPolygon; },

    getRotPathPoint(angle) { return interpRotPath(angle); },

    getPhase(t) {
      if (state !== 'complete') return { angle: 0, dx: 0, dy: 0 };
      return SofaMath.threePhaseEased(t, breakpoints);
    },

    getPhaseBoundaries() {
      return SofaMath.getPhaseBoundaries(breakpoints);
    },

    phases: [
      { name: 'Slide right' },
      { name: '-transition-', transition: true },
      { name: 'User-defined rotation' },
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

    draw(ctx, transform, t) {
      if (state !== 'complete') return;
      // Called from hallway perspective — just draw the moving sofa polygon
      drawInHallwayPerspective(ctx, transform, t);
    },

    drawSofaPerspective(ctx, transform, t) {
      if (state === 'idle') {
        drawIdle(ctx, transform);
      } else if (state === 'dragging') {
        drawDragging(ctx, transform);
      }
      // Complete state is handled by the standard renderer path
    },

    // State & interaction
    getState() { return state; },
    getCurrentAngle,
    onMouseDown,
    onMouseMove,
    onMouseUp,

    reset() {
      state = 'idle';
      pathPoints = [];
      cumArcLengths = [];
      assignedAngles = [];
      sofaPolygon = [];
      sofaArea = 0;
      yMax = 0;
      descending = false;
    }
  };
})();
