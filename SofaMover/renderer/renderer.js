/**
 * Renderer orchestration: canvas setup, event wiring, redraw loop.
 * Supports three perspectives: Hallway, Sofa, Both.
 * Includes trackpad scroll with inertia/bounce, keyboard shortcuts, play/pause.
 */

const sofas = [null, UnitSquare, Semicircle, Hammersley, HammersleyGeneralized, Gerver, Romik, RomikPre, RomikDouble, UserDefined];

const canvasTop = document.getElementById('canvas-top');
const ctxTop = canvasTop.getContext('2d');
const canvasBottom = document.getElementById('canvas-bottom');
const ctxBottom = canvasBottom.getContext('2d');

const slider = document.getElementById('position-slider');
const sofaSelect = document.getElementById('sofa-select');
const radiusSection = document.getElementById('radius-section');
const radiusSlider = document.getElementById('radius-slider');
const radiusValue = document.getElementById('radius-value');
const containerTop = document.getElementById('canvas-container-top');
const containerBottom = document.getElementById('canvas-container-bottom');
const divider = document.getElementById('canvas-divider');
const canvasArea = document.getElementById('canvas-area');
const playBtn = document.getElementById('play-btn');
const showContactsCheckbox = document.getElementById('show-contacts');
const showSofaCheckbox = document.getElementById('show-sofa');
const rightSidebar = document.getElementById('right-sidebar');

const showRotPathCheckbox = document.getElementById('show-rot-path');
const showTickMarksCheckbox = document.getElementById('show-tick-marks');

let currentView = 'basic'; // 'basic' | '3d'
let currentPerspective = 'hallway';
let showContacts = false;
let showSofa = true;
let showHallway = true;
let showRotPath = false;
let showTickMarks = false;
const angleLabel = document.getElementById('angle-label');
const phasesSection = document.getElementById('phases-section');
const phasesList = document.getElementById('phases-list');
const SLIDER_MAX = parseInt(slider.max, 10);

// Populate sofa dropdown
sofas.forEach((sofa, i) => {
  const opt = document.createElement('option');
  opt.value = i;
  opt.textContent = sofa ? sofa.name : '(none)';
  sofaSelect.appendChild(opt);
});

const sofaAreaLabel = document.getElementById('sofa-area');

function updateAreaLabel() {
  const sofa = sofas[parseInt(sofaSelect.value, 10)];
  if (!sofa) {
    sofaAreaLabel.textContent = '';
  } else if (sofa.getArea) {
    sofaAreaLabel.textContent = 'Sofa area: ' + sofa.getArea().toFixed(6);
  } else {
    sofaAreaLabel.textContent = 'Sofa area: (unknown)';
  }
}

function updateRadiusUI() {
  const sofa = sofas[parseInt(sofaSelect.value, 10)];
  if (sofa && sofa.hasRadiusParam) {
    radiusSection.style.display = '';
    const r = sofa.minRadius + (parseInt(radiusSlider.value, 10) / 1000) * (sofa.maxRadius - sofa.minRadius);
    sofa.setRadius(r);
    radiusValue.textContent = r.toFixed(3);
  } else {
    radiusSection.style.display = 'none';
  }
  updateAreaLabel();
}

function updateLayout() {
  if (currentPerspective === 'both') {
    containerBottom.style.display = '';
    divider.style.display = '';
  } else {
    containerBottom.style.display = 'none';
    divider.style.display = 'none';
  }
}

function setupCanvas(canvas, container) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = container.clientWidth * dpr;
  canvas.height = container.clientHeight * dpr;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function resizeCanvases() {
  setupCanvas(canvasTop, containerTop);
  if (currentPerspective === 'both') {
    setupCanvas(canvasBottom, containerBottom);
  }
  redraw();
}

function resizeAndRedraw() {
  updateLayout();
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      resizeCanvases();
    });
  });
}

// --- Drawing functions ---

function drawSofaCanonical(ctx, transform, sofa) {
  const pts = sofa.canonicalPoints;
  if (!pts || pts.length === 0) return;

  ctx.beginPath();
  for (let i = 0; i < pts.length; i++) {
    const cp = transform.toCanvas(pts[i].x, pts[i].y);
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

const contactColors = {
  A: '#ff4444',
  B: '#44ff44',
  C: '#ffff44',
  D: '#ff44ff',
  corner: '#ffffff'
};

function drawContactDots(ctx, transform, canvasPoints) {
  for (const cp of canvasPoints) {
    ctx.beginPath();
    ctx.arc(cp.cx, cp.cy, 5, 0, 2 * Math.PI);
    ctx.fillStyle = contactColors[cp.type];
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

function drawContactPointsHallway(ctx, transform, sofa, t) {
  if (!sofa.getContactPoints) return;
  const pts = sofa.getContactPoints(t);
  const phase = sofa.getPhase(t);
  const rp = phase.rotPathPoint || sofa.getRotPathPoint(phase.angle);
  const canvasPoints = pts.map(p => {
    const mp = SofaMath.movementTransform(p.x, p.y, phase.angle, rp, phase.dx, phase.dy);
    const cp = transform.toCanvas(mp.x, mp.y);
    return { cx: cp.x, cy: cp.y, type: p.type };
  });
  drawContactDots(ctx, transform, canvasPoints);
}

function drawContactPointsCanonical(ctx, transform, sofa, t) {
  if (!sofa.getContactPoints) return;
  const pts = sofa.getContactPoints(t);
  const canvasPoints = pts.map(p => {
    const cp = transform.toCanvas(p.x, p.y);
    return { cx: cp.x, cy: cp.y, type: p.type };
  });
  drawContactDots(ctx, transform, canvasPoints);
}

const ROT_PATH_STEPS = 200;
const ROT_PATH_SOFAS = new Set(['Hammersley', 'Generalized Hammersley', 'Gerver', 'Romik', 'User-defined']);

function drawRotationPathHallway(ctx, transform, sofa, t) {
  if (!ROT_PATH_SOFAS.has(sofa.name)) return;
  const phase = sofa.getPhase(t);
  const piHalf = Math.PI / 2;
  const rp = phase.rotPathPoint || sofa.getRotPathPoint(phase.angle);
  ctx.beginPath();
  for (let i = 0; i <= ROT_PATH_STEPS; i++) {
    const a = (i / ROT_PATH_STEPS) * piHalf;
    const p = sofa.getRotPathPoint(a);
    const mp = SofaMath.movementTransform(p.x, p.y, phase.angle, rp, phase.dx, phase.dy);
    const cp = transform.toCanvas(mp.x, mp.y);
    if (i === 0) ctx.moveTo(cp.x, cp.y);
    else ctx.lineTo(cp.x, cp.y);
  }
  ctx.setLineDash([6, 4]);
  ctx.strokeStyle = '#888';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawRotationPathCanonical(ctx, transform, sofa) {
  if (!ROT_PATH_SOFAS.has(sofa.name)) return;
  const piHalf = Math.PI / 2;
  ctx.beginPath();
  for (let i = 0; i <= ROT_PATH_STEPS; i++) {
    const a = (i / ROT_PATH_STEPS) * piHalf;
    const p = sofa.getRotPathPoint(a);
    const cp = transform.toCanvas(p.x, p.y);
    if (i === 0) ctx.moveTo(cp.x, cp.y);
    else ctx.lineTo(cp.x, cp.y);
  }
  ctx.setLineDash([6, 4]);
  ctx.strokeStyle = '#888';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawTickMarksHallway(ctx, transform, sofa, t) {
  if (!sofa.getTickMarks) return;
  const marks = sofa.getTickMarks();
  const len = sofa.tickMarkLength;
  const phase = sofa.getPhase(t);
  const rp = phase.rotPathPoint || sofa.getRotPathPoint(phase.angle);

  ctx.beginPath();
  for (const m of marks) {
    const norm = Math.sqrt(m.nx * m.nx + m.ny * m.ny);
    const ux = m.nx / norm, uy = m.ny / norm;
    const p1 = SofaMath.movementTransform(m.px - len * ux, m.py - len * uy, phase.angle, rp, phase.dx, phase.dy);
    const p2 = SofaMath.movementTransform(m.px, m.py, phase.angle, rp, phase.dx, phase.dy);
    const c1 = transform.toCanvas(p1.x, p1.y);
    const c2 = transform.toCanvas(p2.x, p2.y);
    ctx.moveTo(c1.x, c1.y);
    ctx.lineTo(c2.x, c2.y);
  }
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function drawTickMarksCanonical(ctx, transform, sofa) {
  if (!sofa.getTickMarks) return;
  const marks = sofa.getTickMarks();
  const len = sofa.tickMarkLength;

  ctx.beginPath();
  for (const m of marks) {
    const norm = Math.sqrt(m.nx * m.nx + m.ny * m.ny);
    const ux = m.nx / norm, uy = m.ny / norm;
    const c1 = transform.toCanvas(m.px - len * ux, m.py - len * uy);
    const c2 = transform.toCanvas(m.px, m.py);
    ctx.moveTo(c1.x, c1.y);
    ctx.lineTo(c2.x, c2.y);
  }
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function drawHallwayPerspective(ctx, container, sofa, t) {
  const w = container.clientWidth;
  const h = container.clientHeight;
  const transform = sofa && sofa.hallwayType === 's-hallway'
    ? new TransformSHallway(w, h, sofa.V)
    : new Transform(w, h);

  ctx.clearRect(0, 0, w, h);
  if (showHallway) {
    if (sofa && sofa.drawHallway) {
      sofa.drawHallway(ctx, transform);
    } else {
      drawHallway(ctx, transform);
    }
  } else {
    ctx.fillStyle = SofaMath.bgColor();
    ctx.fillRect(0, 0, w, h);
  }
  if (!sofa) return;
  if (showRotPath) drawRotationPathHallway(ctx, transform, sofa, t);
  if (showSofa) sofa.draw(ctx, transform, t);
  if (showTickMarks) drawTickMarksHallway(ctx, transform, sofa, t);
  if (showContacts) drawContactPointsHallway(ctx, transform, sofa, t);
}

function drawSofaPerspective(ctx, container, sofa, t) {
  const w = container.clientWidth;
  const h = container.clientHeight;

  const transform = new TransformCentered(w, h, -0.3, 0.4, 3.85);

  if (!sofa) {
    ctx.clearRect(0, 0, w, h);
    return;
  }

  // User-defined sofa handles its own drawing in idle/dragging states
  if (sofa.isUserDefined && sofa.getState() !== 'complete') {
    ctx.clearRect(0, 0, w, h);
    sofa.drawSofaPerspective(ctx, transform, t);
    return;
  }

  // Sofas with custom sofa-perspective drawing (e.g. S-hallway)
  if (!sofa.isUserDefined && sofa.drawSofaPerspective) {
    ctx.clearRect(0, 0, w, h);
    if (showHallway) {
      sofa.drawSofaPerspective(ctx, transform, t);
    } else {
      ctx.fillStyle = SofaMath.bgColor();
      ctx.fillRect(0, 0, w, h);
    }
    if (showRotPath) drawRotationPathCanonical(ctx, transform, sofa);
    if (showSofa) drawSofaCanonical(ctx, transform, sofa);
    if (showTickMarks) drawTickMarksCanonical(ctx, transform, sofa);
    if (showContacts) drawContactPointsCanonical(ctx, transform, sofa, t);
    return;
  }

  const phase = sofa.getPhase(t);
  const rp = phase.rotPathPoint || sofa.getRotPathPoint(phase.angle);

  ctx.clearRect(0, 0, w, h);
  if (showHallway) {
    drawHallwayRotated(ctx, transform, phase.angle, rp, phase.dx, phase.dy);
  } else {
    ctx.fillStyle = SofaMath.bgColor();
    ctx.fillRect(0, 0, w, h);
  }
  if (showRotPath) drawRotationPathCanonical(ctx, transform, sofa);
  if (showSofa) drawSofaCanonical(ctx, transform, sofa);
  if (showTickMarks) drawTickMarksCanonical(ctx, transform, sofa);
  if (showContacts) drawContactPointsCanonical(ctx, transform, sofa, t);
}

function buildPhasesUI(sofa) {
  phasesList.innerHTML = '';
  if (!sofa || !sofa.phases || sofa.phases.length === 0) {
    phasesSection.style.display = 'none';
    return;
  }
  phasesSection.style.display = '';
  for (const phase of sofa.phases) {
    const div = document.createElement('div');
    div.className = phase.transition ? 'phase-item transition' : 'phase-item';
    if (phase.transition) {
      div.innerHTML = `<div class="phase-name">${phase.name}</div>`;
    } else if (phase.contactPoints != null) {
      div.innerHTML = `<div class="phase-name">${phase.name}</div><div class="phase-contacts">Contact points: ${phase.contactPoints}</div>`;
    } else {
      div.innerHTML = `<div class="phase-name">${phase.name}</div>`;
    }
    phasesList.appendChild(div);
  }
}

function updatePhaseHighlight(sofa, t) {
  if (!sofa.getActivePhaseIndex) return;
  const activeIndex = sofa.getActivePhaseIndex(t);
  const items = phasesList.children;
  for (let i = 0; i < items.length; i++) {
    items[i].classList.toggle('active', i === activeIndex);
  }
}

function redraw() {
  const sofa = sofas[parseInt(sofaSelect.value, 10)];
  const t = parseInt(slider.value, 10) / SLIDER_MAX;

  if (currentView === '3d') {
    if (sofa) ThreeView.update(sofa, t);
  } else {
    if (currentPerspective === 'hallway') {
      drawHallwayPerspective(ctxTop, containerTop, sofa, t);
    } else if (currentPerspective === 'sofa') {
      drawSofaPerspective(ctxTop, containerTop, sofa, t);
    } else {
      setupCanvas(canvasTop, containerTop);
      setupCanvas(canvasBottom, containerBottom);
      drawHallwayPerspective(ctxTop, containerTop, sofa, t);
      drawSofaPerspective(ctxBottom, containerBottom, sofa, t);
    }
  }

  if (sofa) updatePhaseHighlight(sofa, t);

  // Update angle label (hide for unit square, and hide in 3D view)
  if (!sofa) {
    angleLabel.style.display = 'none';
  } else if (currentView !== '3d' && sofa.isUserDefined && sofa.getState() === 'dragging') {
    const deg = sofa.getCurrentAngle() * 180 / Math.PI;
    const degrees = deg.toFixed(1);
    const padded = deg < 10 ? '\u2007' + degrees : degrees;
    angleLabel.textContent = `Rotation angle: ${padded}\u00B0`;
    angleLabel.style.display = '';
  } else if (currentView !== '3d' && sofa.getPhase && sofa !== UnitSquare &&
             !(sofa.isUserDefined && sofa.getState() === 'idle')) {
    const phase = sofa.getPhase(t);
    const deg = phase.angle * 180 / Math.PI;
    const degrees = deg.toFixed(3);
    const padded = deg < 10 ? '\u2007' + degrees : degrees;
    angleLabel.textContent = `Rotation angle: ${padded}\u00B0`;
    angleLabel.style.display = '';
  } else {
    angleLabel.style.display = 'none';
  }
}

// --- Slider helpers ---

// Use a floating-point position for smooth physics, sync to slider
let sliderPos = 0; // 0..SLIDER_MAX

function setSliderPos(v) {
  sliderPos = Math.max(0, Math.min(SLIDER_MAX, v));
  slider.value = Math.round(sliderPos);
  redraw();
}

// --- Trackpad scroll with inertia and bounce ---

let scrollVelocity = 0;
let scrollAnimating = false;

function startScrollAnim() {
  if (scrollAnimating) return;
  scrollAnimating = true;
  scrollAnimLoop();
}

function scrollAnimLoop() {
  if (Math.abs(scrollVelocity) < 0.05) {
    scrollAnimating = false;
    // Snap to bounds if slightly out of range from bounce
    sliderPos = Math.max(0, Math.min(SLIDER_MAX, sliderPos));
    slider.value = Math.round(sliderPos);
    return;
  }

  sliderPos += scrollVelocity;

  // Bounce at edges
  if (sliderPos < 0) {
    sliderPos = 0;
    scrollVelocity = -scrollVelocity * 0.3;
  } else if (sliderPos > SLIDER_MAX) {
    sliderPos = SLIDER_MAX;
    scrollVelocity = -scrollVelocity * 0.3;
  }

  // Friction
  scrollVelocity *= 0.94;

  slider.value = Math.round(sliderPos);
  redraw();

  requestAnimationFrame(scrollAnimLoop);
}

canvasArea.addEventListener('wheel', (e) => {
  e.preventDefault();
  const sofa = sofas[parseInt(sofaSelect.value, 10)];
  if (sofa && sofa.isUserDefined && sofa.getState() === 'dragging') return;
  // Stop play if scrolling
  if (isPlaying) togglePlay();

  scrollVelocity += e.deltaY * 0.3;
  // Clamp max velocity
  scrollVelocity = Math.max(-80, Math.min(80, scrollVelocity));
  startScrollAnim();
}, { passive: false });

// --- Play/Pause animation ---

let isPlaying = false;
let playAnimId = null;
let lastPlayTime = 0;
let playDurationMs = 8000; // full slider sweep duration, adjustable

function togglePlay() {
  isPlaying = !isPlaying;
  playBtn.innerHTML = isPlaying ? '&#9646;&#9646;' : '&#9654;';

  if (isPlaying) {
    // Stop scroll physics
    scrollVelocity = 0;
    scrollAnimating = false;
    lastPlayTime = performance.now();
    playAnimLoop();
  } else {
    if (playAnimId) cancelAnimationFrame(playAnimId);
    playAnimId = null;
  }
}

function playAnimLoop() {
  if (!isPlaying) return;

  const now = performance.now();
  const dt = now - lastPlayTime;
  lastPlayTime = now;

  const increment = (dt / playDurationMs) * SLIDER_MAX;
  sliderPos += increment;

  if (sliderPos >= SLIDER_MAX) {
    sliderPos = 0; // loop
  }

  slider.value = Math.round(sliderPos);
  redraw();

  playAnimId = requestAnimationFrame(playAnimLoop);
}

playBtn.addEventListener('click', togglePlay);

document.getElementById('slower-btn').addEventListener('click', () => {
  playDurationMs = Math.min(playDurationMs * 1.5, 60000);
});

document.getElementById('faster-btn').addEventListener('click', () => {
  playDurationMs = Math.max(playDurationMs / 1.5, 1000);
});

// --- Tab switching ---

const visibilitySection = document.getElementById('visibility-section');
const contactsSection = document.getElementById('contacts-section');
const balancedSection = document.getElementById('balanced-section');
const sofaSection = sofaSelect.closest('.sidebar-section');
const perspectiveSection = document.querySelector('input[name="perspective"]').closest('.sidebar-section');
const bottomBar = document.getElementById('bottom-bar');

function switchView(view) {
  currentView = view;

  // Update tab buttons
  document.querySelectorAll('#tab-bar .tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === view);
  });

  // Toggle view containers
  document.getElementById('basic-view').style.display = view === 'basic' ? '' : 'none';
  document.getElementById('three-view').style.display = view === '3d' ? '' : 'none';
  document.getElementById('balanced-view').style.display = view === 'balanced' ? '' : 'none';

  // Sidebar sections: show/hide based on view
  const isBalanced = view === 'balanced';
  sofaSection.style.display = isBalanced ? 'none' : '';
  perspectiveSection.style.display = isBalanced ? 'none' : '';
  if (isBalanced) {
    radiusSection.style.display = 'none';
  } else {
    updateRadiusUI();
  }
  visibilitySection.style.display = (view === '3d' || isBalanced) ? 'none' : '';
  balancedSection.style.display = isBalanced ? '' : 'none';

  // Right sidebar and bottom bar
  rightSidebar.style.display = isBalanced ? 'none' : '';
  bottomBar.style.display = isBalanced ? 'none' : '';

  if (isBalanced) {
    contactsSection.style.display = 'none';
  } else if (view === '3d') {
    contactsSection.style.display = 'none';
  } else {
    contactsSection.style.display = showContacts ? '' : 'none';
  }

  if (view === '3d') {
    ThreeView.init();
    ThreeView.setActive(true);
    ThreeView.setPerspective(currentPerspective);
    ThreeView.setHallwayVisible(showHallway);
    const sofa = sofas[parseInt(sofaSelect.value, 10)];
    if (sofa) ThreeView.rebuildSofa(sofa);
    redraw();
  } else {
    ThreeView.setActive(false);
    if (!isBalanced) stopBalancingPlay();
    if (isBalanced) {
      requestAnimationFrame(() => {
        BalancedPolygons.render(document.getElementById('balanced-canvas'));
        updateBalancedUI();
      });
    } else {
      resizeAndRedraw();
    }
  }
}

// --- Balanced Polygons controls ---

const nSlider = document.getElementById('n-slider');

function updateBalancedUI() {
  const n = BalancedPolygons.getN();
  document.getElementById('n-value').textContent = n;
  nSlider.value = n;
  document.getElementById('iteration-count').textContent = BalancedPolygons.getIterationCount();
  document.getElementById('balanced-area').textContent = BalancedPolygons.getArea().toFixed(10);
}

function setBalancedN(n) {
  stopBalancingPlay();
  BalancedPolygons.setN(n);
  document.getElementById('iter-timing').textContent = '—';
  BalancedPolygons.render(document.getElementById('balanced-canvas'));
  updateBalancedUI();
}

nSlider.addEventListener('input', () => setBalancedN(parseInt(nSlider.value, 10)));
document.getElementById('n-minus').addEventListener('click', () => setBalancedN(Math.max(3, BalancedPolygons.getN() - 1)));
document.getElementById('n-plus').addEventListener('click', () => setBalancedN(Math.min(100, BalancedPolygons.getN() + 1)));

function doBalancing() {
  const iters = parseInt(document.getElementById('balancing-iters').value, 10);
  const t0 = performance.now();
  for (let i = 0; i < iters; i++) {
    BalancedPolygons.applyBalancing();
  }
  const elapsed = performance.now() - t0;
  const msPerIter = elapsed / iters;
  document.getElementById('iter-timing').textContent =
    msPerIter >= 1 ? msPerIter.toFixed(1) + ' ms' : (msPerIter * 1000).toFixed(0) + ' μs';
  BalancedPolygons.render(document.getElementById('balanced-canvas'));
  updateBalancedUI();
}

let balancingPlaying = false;
let balancingRAF = null;
const balancingPlayBtn = document.getElementById('balancing-play');

function balancingLoop() {
  if (!balancingPlaying) return;
  doBalancing();
  balancingRAF = requestAnimationFrame(balancingLoop);
}

function toggleBalancingPlay() {
  balancingPlaying = !balancingPlaying;
  balancingPlayBtn.innerHTML = balancingPlaying ? '&#9646;&#9646;' : '&#9654;';
  if (balancingPlaying) {
    balancingRAF = requestAnimationFrame(balancingLoop);
  } else if (balancingRAF) {
    cancelAnimationFrame(balancingRAF);
    balancingRAF = null;
  }
}

function stopBalancingPlay() {
  if (balancingPlaying) toggleBalancingPlay();
}

document.getElementById('apply-balancing').addEventListener('click', doBalancing);
balancingPlayBtn.addEventListener('click', toggleBalancingPlay);

document.getElementById('balanced-reset').addEventListener('click', () => {
  stopBalancingPlay();
  BalancedPolygons.reset();
  document.getElementById('iter-timing').textContent = '—';
  BalancedPolygons.render(document.getElementById('balanced-canvas'));
  updateBalancedUI();
});

document.querySelectorAll('#tab-bar .tab').forEach(btn => {
  btn.addEventListener('click', () => switchView(btn.dataset.view));
});

// --- Keyboard shortcuts ---

document.addEventListener('keydown', (e) => {
  // When about modal is open, only handle Escape to dismiss it
  if (document.getElementById('about-overlay').classList.contains('open')) {
    if (e.code === 'Escape') {
      document.getElementById('about-overlay').classList.remove('open');
    }
    return;
  }

  // Don't capture when typing in an input
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

  if (e.code === 'ArrowLeft') {
    e.preventDefault();
    if (isPlaying) togglePlay();
    scrollVelocity = 0;
    scrollAnimating = false;
    const sofa = sofas[parseInt(sofaSelect.value, 10)];
    if (!sofa) return;
    const t = parseInt(slider.value, 10) / SLIDER_MAX;
    const boundaries = sofa.getPhaseBoundaries();
    // Find largest boundary strictly less than current t
    let target = 0;
    for (const b of boundaries) {
      if (b < t - 1e-9) target = b;
    }
    setSliderPos(target * SLIDER_MAX);
  } else if (e.code === 'ArrowRight') {
    e.preventDefault();
    if (isPlaying) togglePlay();
    scrollVelocity = 0;
    scrollAnimating = false;
    const sofa = sofas[parseInt(sofaSelect.value, 10)];
    if (!sofa) return;
    const t = parseInt(slider.value, 10) / SLIDER_MAX;
    const boundaries = sofa.getPhaseBoundaries();
    // Find smallest boundary strictly greater than current t
    let target = 1;
    for (let i = boundaries.length - 1; i >= 0; i--) {
      if (boundaries[i] > t + 1e-9) target = boundaries[i];
    }
    setSliderPos(target * SLIDER_MAX);
  } else if (e.code === 'Space') {
    e.preventDefault();
    if (currentView === 'balanced') {
      doBalancing();
    } else {
      scrollVelocity = 0;
      scrollAnimating = false;
      togglePlay();
    }
  } else if (e.code === 'KeyH' && e.metaKey && e.shiftKey) {
    e.preventDefault();
    showHallway = !showHallway;
    if (currentView === '3d') ThreeView.setHallwayVisible(showHallway);
    redraw();
  } else if (e.key === 's' || e.key === 'S') {
    sofaSelect.value = (parseInt(sofaSelect.value, 10) + 1) % sofas.length;
    updateRadiusUI();
    const sofa = sofas[parseInt(sofaSelect.value, 10)];
    buildPhasesUI(sofa);
    if (sofa && currentView === '3d') ThreeView.rebuildSofa(sofa);
    redraw();
  } else if (e.key === '-') {
    playDurationMs = Math.min(playDurationMs * 1.5, 60000);
  } else if (e.key === '+' || e.key === '=') {
    playDurationMs = Math.max(playDurationMs / 1.5, 1000);
  }
});

// --- Standard UI events ---

slider.addEventListener('input', () => {
  sliderPos = parseInt(slider.value, 10);
  if (isPlaying) togglePlay();
  scrollVelocity = 0;
  scrollAnimating = false;
  redraw();
});

sofaSelect.addEventListener('change', () => {
  updateRadiusUI();
  const sofa = sofas[parseInt(sofaSelect.value, 10)];
  buildPhasesUI(sofa);

  const infoEl = document.getElementById('user-defined-info');
  const udSection = document.getElementById('user-defined-section');
  if (sofa && sofa.isUserDefined) {
    // Force sofa perspective, disable other options
    currentPerspective = 'sofa';
    document.querySelectorAll('input[name="perspective"]').forEach(r => {
      r.checked = (r.value === 'sofa');
      r.disabled = true;
    });
    sofa.reset();
    if (infoEl) infoEl.style.display = '';
    if (udSection) udSection.style.display = '';
  } else {
    document.querySelectorAll('input[name="perspective"]').forEach(r => {
      r.disabled = false;
    });
    if (infoEl) infoEl.style.display = 'none';
    if (udSection) udSection.style.display = 'none';
  }

  if (sofa && currentView === '3d') ThreeView.rebuildSofa(sofa);
  resizeAndRedraw();
});

radiusSlider.addEventListener('input', () => {
  updateRadiusUI();
  if (currentView === '3d') {
    const sofa = sofas[parseInt(sofaSelect.value, 10)];
    ThreeView.rebuildSofa(sofa);
  }
  redraw();
});

showSofaCheckbox.addEventListener('change', (e) => {
  showSofa = e.target.checked;
  redraw();
});

showRotPathCheckbox.addEventListener('change', (e) => {
  showRotPath = e.target.checked;
  redraw();
});

showTickMarksCheckbox.addEventListener('change', (e) => {
  showTickMarks = e.target.checked;
  redraw();
});

showContactsCheckbox.addEventListener('change', (e) => {
  showContacts = e.target.checked;
  document.getElementById('contacts-section').style.display = showContacts ? '' : 'none';
  resizeAndRedraw();
});

document.querySelectorAll('input[name="perspective"]').forEach(radio => {
  radio.addEventListener('change', (e) => {
    currentPerspective = e.target.value;
    if (currentView === '3d') {
      ThreeView.setPerspective(currentPerspective);
    }
    resizeAndRedraw();
  });
});

// --- About modal ---
const aboutOverlay = document.getElementById('about-overlay');
const aboutModal = document.getElementById('about-modal');
let aboutPreviousFocus = null;

function openAboutModal() {
  aboutPreviousFocus = document.activeElement;
  aboutOverlay.classList.add('open');
  aboutOverlay.setAttribute('aria-hidden', 'false');
  // Focus the close button
  document.getElementById('about-close').focus();
}

function closeAboutModal() {
  aboutOverlay.classList.remove('open');
  aboutOverlay.setAttribute('aria-hidden', 'true');
  if (aboutPreviousFocus) {
    aboutPreviousFocus.focus();
    aboutPreviousFocus = null;
  }
}

document.getElementById('app-logo').addEventListener('click', openAboutModal);
document.getElementById('about-close').addEventListener('click', closeAboutModal);
aboutOverlay.addEventListener('click', (e) => {
  if (e.target === aboutOverlay) closeAboutModal();
});

// Focus trap: cycle Tab only through focusable elements inside the modal
aboutOverlay.addEventListener('keydown', (e) => {
  if (e.code !== 'Tab') return;
  const focusable = aboutModal.querySelectorAll('a[href], button, [tabindex]:not([tabindex="-1"])');
  if (focusable.length === 0) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey) {
    if (document.activeElement === first) {
      e.preventDefault();
      last.focus();
    }
  } else {
    if (document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});

// --- Settings panel ---
document.getElementById('settings-btn').addEventListener('click', () => {
  document.getElementById('settings-panel').classList.toggle('open');
});
document.getElementById('settings-close').addEventListener('click', () => {
  document.getElementById('settings-panel').classList.remove('open');
});

// --- Sofa color picker ---
document.getElementById('sofa-color').addEventListener('input', (e) => {
  SofaMath.setSofaColor(e.target.value);
  ThreeView.setSofaColor(e.target.value);
  if (currentView === 'balanced') {
    BalancedPolygons.render(document.getElementById('balanced-canvas'));
  } else {
    redraw();
  }
});

// --- Background color picker ---
document.getElementById('bg-color').addEventListener('input', (e) => {
  SofaMath.setBgColor(e.target.value);
  ThreeView.setBgColor(e.target.value);
  if (currentView === 'balanced') {
    BalancedPolygons.render(document.getElementById('balanced-canvas'));
  } else {
    redraw();
  }
});

// --- User-defined sofa restart ---
document.getElementById('user-defined-restart').addEventListener('click', () => {
  const sofa = sofas[parseInt(sofaSelect.value, 10)];
  if (!sofa.isUserDefined) return;
  sofa.reset();
  const infoEl = document.getElementById('user-defined-info');
  if (infoEl) infoEl.style.display = '';
  updateAreaLabel();
  redraw();
});

// --- User-defined sofa mouse handling ---
canvasTop.addEventListener('mousedown', (e) => {
  const sofa = sofas[parseInt(sofaSelect.value, 10)];
  if (!sofa.isUserDefined || currentView !== 'basic') return;
  const w = containerTop.clientWidth;
  const h = containerTop.clientHeight;
  const transform = new TransformCentered(w, h, -0.3, 0.4, 3.85);
  sofa.onMouseDown(e, canvasTop, transform);
  redraw();
});

canvasTop.addEventListener('mousemove', (e) => {
  const sofa = sofas[parseInt(sofaSelect.value, 10)];
  if (!sofa.isUserDefined || currentView !== 'basic') return;
  if (sofa.getState() !== 'dragging') return;
  const w = containerTop.clientWidth;
  const h = containerTop.clientHeight;
  const transform = new TransformCentered(w, h, -0.3, 0.4, 3.85);
  sofa.onMouseMove(e, canvasTop, transform);
  if (sofa.getState() === 'complete') {
    const infoEl = document.getElementById('user-defined-info');
    if (infoEl) infoEl.style.display = 'none';
    updateAreaLabel();
  }
  redraw();
});

canvasTop.addEventListener('mouseup', (e) => {
  const sofa = sofas[parseInt(sofaSelect.value, 10)];
  if (!sofa.isUserDefined || currentView !== 'basic') return;
  if (sofa.getState() !== 'dragging') return;
  const w = containerTop.clientWidth;
  const h = containerTop.clientHeight;
  const transform = new TransformCentered(w, h, -0.3, 0.4, 3.85);
  sofa.onMouseUp(e, canvasTop, transform);
  if (sofa.getState() === 'complete') {
    const infoEl = document.getElementById('user-defined-info');
    if (infoEl) infoEl.style.display = 'none';
    updateAreaLabel();
  }
  redraw();
});

window.addEventListener('resize', () => {
  if (currentView === '3d') {
    ThreeView.resize();
  } else if (currentView === 'balanced') {
    BalancedPolygons.render(document.getElementById('balanced-canvas'));
  } else {
    resizeCanvases();
  }
});

// Initial setup
updateRadiusUI();
buildPhasesUI(sofas[0]);
updateLayout();
resizeCanvases();

// --- Logo: draw miniature Gerver sofa on a canvas ---
function drawSofaLogo(canvas) {
  if (!canvas || !Gerver) return;
  const ctx = canvas.getContext('2d');
  const pts = Gerver.canonicalPoints;
  if (!pts || pts.length === 0) return;

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of pts) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  const w = maxX - minX, h = maxY - minY;
  const pad = 4;
  const cw = canvas.width, ch = canvas.height;
  const scale = Math.min((cw - 2 * pad) / w, (ch - 2 * pad) / h);
  const ox = (cw - w * scale) / 2 - minX * scale;
  const oy = (ch - h * scale) / 2 - minY * scale;

  ctx.save();
  ctx.translate(cw / 2, ch / 2);
  ctx.rotate(Math.PI);
  ctx.translate(-cw / 2, -ch / 2);

  ctx.shadowColor = 'rgba(255, 140, 0, 0.7)';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.moveTo(pts[0].x * scale + ox, pts[0].y * scale + oy);
  for (let i = 1; i < pts.length; i++) {
    ctx.lineTo(pts[i].x * scale + ox, pts[i].y * scale + oy);
  }
  ctx.closePath();
  ctx.strokeStyle = '#ff8c00';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.shadowBlur = 16;
  ctx.shadowColor = 'rgba(255, 140, 0, 0.4)';
  ctx.stroke();

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.moveTo(pts[0].x * scale + ox, pts[0].y * scale + oy);
  for (let i = 1; i < pts.length; i++) {
    ctx.lineTo(pts[i].x * scale + ox, pts[i].y * scale + oy);
  }
  ctx.closePath();
  ctx.fillStyle = 'rgba(255, 140, 0, 0.1)';
  ctx.fill();
  ctx.restore();
}

drawSofaLogo(document.getElementById('logo-canvas'));
drawSofaLogo(document.getElementById('about-logo-canvas'));
