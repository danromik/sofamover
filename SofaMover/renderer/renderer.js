/**
 * Renderer orchestration: canvas setup, event wiring, redraw loop.
 * Supports three perspectives: Hallway, Sofa, Both.
 * Includes trackpad scroll with inertia/bounce, keyboard shortcuts, play/pause.
 */

const sofas = [UnitSquare, Semicircle, Hammersley, HammersleyGeneralized, Gerver, Romik, RomikPre];

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
  opt.textContent = sofa.name;
  sofaSelect.appendChild(opt);
});

const sofaAreaLabel = document.getElementById('sofa-area');

function updateAreaLabel() {
  const sofa = sofas[parseInt(sofaSelect.value, 10)];
  if (sofa.getArea) {
    sofaAreaLabel.textContent = 'Sofa area: ' + sofa.getArea().toFixed(6);
  } else {
    sofaAreaLabel.textContent = 'Sofa area: (unknown)';
  }
}

function updateRadiusUI() {
  const sofa = sofas[parseInt(sofaSelect.value, 10)];
  if (sofa.hasRadiusParam) {
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

  ctx.fillStyle = 'rgba(66, 133, 244, 0.45)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(66, 133, 244, 0.9)';
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
  const rp = sofa.getRotPathPoint(phase.angle);
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
const ROT_PATH_SOFAS = new Set(['Hammersley', 'Generalized Hammersley', 'Gerver', 'Romik']);

function drawRotationPathHallway(ctx, transform, sofa, t) {
  if (!ROT_PATH_SOFAS.has(sofa.name)) return;
  const phase = sofa.getPhase(t);
  const piHalf = Math.PI / 2;
  ctx.beginPath();
  for (let i = 0; i <= ROT_PATH_STEPS; i++) {
    const a = (i / ROT_PATH_STEPS) * piHalf;
    const p = sofa.getRotPathPoint(a);
    const rp = sofa.getRotPathPoint(phase.angle);
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
  const rp = sofa.getRotPathPoint(phase.angle);

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
  const transform = new Transform(w, h);

  ctx.clearRect(0, 0, w, h);
  drawHallway(ctx, transform);
  if (showRotPath) drawRotationPathHallway(ctx, transform, sofa, t);
  if (showSofa) sofa.draw(ctx, transform, t);
  if (showTickMarks) drawTickMarksHallway(ctx, transform, sofa, t);
  if (showContacts) drawContactPointsHallway(ctx, transform, sofa, t);
}

function drawSofaPerspective(ctx, container, sofa, t) {
  const w = container.clientWidth;
  const h = container.clientHeight;

  const transform = new TransformCentered(w, h, -0.3, 0.4, 3.85);

  const phase = sofa.getPhase(t);
  const rp = sofa.getRotPathPoint(phase.angle);

  ctx.clearRect(0, 0, w, h);
  drawHallwayRotated(ctx, transform, phase.angle, rp, phase.dx, phase.dy);
  if (showRotPath) drawRotationPathCanonical(ctx, transform, sofa);
  if (showSofa) drawSofaCanonical(ctx, transform, sofa);
  if (showTickMarks) drawTickMarksCanonical(ctx, transform, sofa);
  if (showContacts) drawContactPointsCanonical(ctx, transform, sofa, t);
}

function buildPhasesUI(sofa) {
  phasesList.innerHTML = '';
  if (!sofa.phases || sofa.phases.length === 0) {
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
    ThreeView.update(sofa, t);
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

  updatePhaseHighlight(sofa, t);

  // Update angle label (hide for unit square, and hide in 3D view)
  if (currentView !== '3d' && sofa.getPhase && sofa !== UnitSquare) {
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

function switchView(view) {
  currentView = view;

  // Update tab buttons
  document.querySelectorAll('#tab-bar .tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === view);
  });

  // Toggle view containers
  document.getElementById('basic-view').style.display = view === 'basic' ? '' : 'none';
  document.getElementById('three-view').style.display = view === '3d' ? '' : 'none';

  // Sidebar visibility
  visibilitySection.style.display = view === '3d' ? 'none' : '';
  if (view === '3d') {
    contactsSection.style.display = 'none';
  } else {
    contactsSection.style.display = showContacts ? '' : 'none';
  }

  if (view === '3d') {
    ThreeView.init();
    ThreeView.setActive(true);
    ThreeView.setPerspective(currentPerspective);
    const sofa = sofas[parseInt(sofaSelect.value, 10)];
    ThreeView.rebuildSofa(sofa);
    redraw();
  } else {
    ThreeView.setActive(false);
    resizeAndRedraw();
  }
}

document.querySelectorAll('#tab-bar .tab').forEach(btn => {
  btn.addEventListener('click', () => switchView(btn.dataset.view));
});

// --- Keyboard shortcuts ---

document.addEventListener('keydown', (e) => {
  // Don't capture when typing in an input
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

  if (e.code === 'ArrowLeft') {
    e.preventDefault();
    if (isPlaying) togglePlay();
    scrollVelocity = 0;
    scrollAnimating = false;
    const sofa = sofas[parseInt(sofaSelect.value, 10)];
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
    scrollVelocity = 0;
    scrollAnimating = false;
    togglePlay();
  } else if (e.key === 's' || e.key === 'S') {
    sofaSelect.value = (parseInt(sofaSelect.value, 10) + 1) % sofas.length;
    updateRadiusUI();
    const sofa = sofas[parseInt(sofaSelect.value, 10)];
    buildPhasesUI(sofa);
    if (currentView === '3d') ThreeView.rebuildSofa(sofa);
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
  if (currentView === '3d') ThreeView.rebuildSofa(sofa);
  redraw();
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

window.addEventListener('resize', () => {
  if (currentView === '3d') {
    ThreeView.resize();
  } else {
    resizeCanvases();
  }
});

// Initial setup
updateRadiusUI();
buildPhasesUI(sofas[0]);
updateLayout();
resizeCanvases();
