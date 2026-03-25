// three-view.js — 3D View with dual viewports (hallway + sofa perspectives)
// Uses Three.js r128 (global build)

const ThreeView = (() => {
  // --- Constants ---
  const H1 = 0.2;   // rail (wall) height
  const H2 = 0.6;   // sofa extrusion height
  const ARM_LEN = 5; // hallway arm length

  // --- State ---
  let initialized = false;
  let isActive = false;
  let currentPerspective = 'hallway'; // 'hallway' | 'sofa' | 'both'

  // Two viewports: hallway perspective (top) and sofa perspective (bottom)
  let hallwayVP = null; // { renderer, scene, camera, controls, sofaMesh, hallwayGroup }
  let sofaVP = null;

  let currentSofaGeometry = null;
  const sofaMaterial = new THREE.MeshStandardMaterial({
    color: 0x4285f4,
    transparent: true,
    opacity: 0.7,
    side: THREE.DoubleSide
  });
  const sofaEdgeMaterial = new THREE.LineBasicMaterial({
    color: 0x4285f4,
    transparent: true,
    opacity: 0.9
  });

  // --- Coordinate mapping ---
  // Math (x, y) at height h -> Three.js (x, h, -y)
  // Floor is xz-plane (y=0), walls extrude upward (y direction)

  function createViewport(canvas) {
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 100);
    camera.position.set(0, 4, 4);
    camera.lookAt(0, 0, 0);

    const controls = new THREE.OrbitControls(camera, canvas);
    controls.target.set(0, 0, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.enableZoom = false; // scroll drives animation slider instead

    // Lighting
    scene.add(new THREE.AmbientLight(0x888888));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(3, 5, 2);
    scene.add(dirLight);

    // Build hallway
    const hallwayGroup = buildHallway();
    scene.add(hallwayGroup);

    // Sofa placeholder mesh
    const sofaMesh = new THREE.Mesh(new THREE.BufferGeometry(), sofaMaterial);
    sofaMesh.matrixAutoUpdate = false;
    scene.add(sofaMesh);

    return { renderer, scene, camera, controls, sofaMesh, hallwayGroup };
  }

  // --- Hallway construction ---
  function buildHallway() {
    const group = new THREE.Group();
    const L = ARM_LEN;

    // Walls (rails): thin extruded boxes along wall edges, height H1
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const wallThickness = 0.03;

    // Floor: L-shaped polygon at y=0
    // In math coords: horizontal arm x in [-L, 1], y in [0, 1]; vertical arm x in [0, 1], y in [-L, 0]
    // Three.js: shape in xz-plane, so shape coords use (x, -y) -> (x, z) where z = -y
    const floorShape = new THREE.Shape();
    // Shape uses math coords directly; rotation.x = -PI/2 maps shape (sx,sy) → Three.js (sx, 0, -sy)
    // L-shape vertices in math coords, extended by wallThickness to support offset rails:
    const wt = wallThickness;
    floorShape.moveTo(-L, -wt);
    floorShape.lineTo(-wt, -wt);
    floorShape.lineTo(-wt, -L);
    floorShape.lineTo(1 + wt, -L);
    floorShape.lineTo(1 + wt, 1 + wt);
    floorShape.lineTo(-L, 1 + wt);
    floorShape.closePath();

    const floorGeom = new THREE.ShapeGeometry(floorShape);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x3a3a3a, side: THREE.DoubleSide });
    const floorMesh = new THREE.Mesh(floorGeom, floorMat);
    // ShapeGeometry lies in xy-plane; rotate to xz-plane (floor)
    floorMesh.rotation.x = -Math.PI / 2;
    group.add(floorMesh);

    // Helper: create a wall segment from (x1,z1) to (x2,z2) with height H1
    // (nx, nz) is the outward normal — rail is offset so its inner face aligns with the wall line
    function addWall(x1, z1, x2, z2, nx, nz) {
      const dx = x2 - x1;
      const dz = z2 - z1;
      const len = Math.sqrt(dx * dx + dz * dz);
      const geom = new THREE.BoxGeometry(len, H1, wallThickness);
      const mesh = new THREE.Mesh(geom, wallMat);
      const offset = wallThickness / 2;
      // Position at midpoint, half-height, offset outward so inner face is on the wall line
      mesh.position.set((x1 + x2) / 2 + nx * offset, H1 / 2, (z1 + z2) / 2 + nz * offset);
      // Rotate to align with wall direction
      const angle = Math.atan2(dz, dx);
      mesh.rotation.y = -angle;
      group.add(mesh);
    }

    // Walls use Three.js (x, z) coords where z = -math_y
    // Outward normals point away from hallway interior
    // Inner walls (math): (-L,0) -> (0,0) -> (0,-L)
    // Three.js (x,z):    (-L,0) -> (0,0) -> (0,L)
    addWall(-L, 0, 0, 0, 0, 1);    // horizontal inner wall, outward = +z
    addWall(0, 0, 0, L, -1, 0);    // vertical inner wall, outward = -x

    // Outer walls (math): (-L,1) -> (1,1) -> (1,-L)
    // Three.js (x,z):    (-L,-1) -> (1,-1) -> (1,L)
    addWall(-L, -1, 1, -1, 0, -1); // horizontal outer wall, outward = -z
    addWall(1, -1, 1, L, 1, 0);    // vertical outer wall, outward = +x

    return group;
  }

  // --- Sofa geometry from canonical points ---
  function buildSofaGeometry(canonicalPoints) {
    if (!canonicalPoints || canonicalPoints.length < 3) return null;

    const shape = new THREE.Shape();
    // Shape uses math coords directly; layFlat rotation maps shape (sx,sy) → Three.js (sx, 0, -sy)
    shape.moveTo(canonicalPoints[0].x, canonicalPoints[0].y);
    for (let i = 1; i < canonicalPoints.length; i++) {
      shape.lineTo(canonicalPoints[i].x, canonicalPoints[i].y);
    }
    shape.closePath();

    const geom = new THREE.ExtrudeGeometry(shape, {
      depth: H2,
      bevelEnabled: false
    });
    return geom;
  }

  // --- Movement transform as Matrix4 ---
  // Math: R(-angle) * (p - rotPathPt) + (dx, dy)
  // In Three.js coords: rotation around Y axis
  function buildMovementMatrix(angle, rotPathPt, dx, dy) {
    // Step 1: Translate canonical point by -rotPathPt in math coords
    //   Math: (px - rpx, py - rpy)
    //   Three.js: translate by (-rpx, 0, rpy) since z = -y
    const t1 = new THREE.Matrix4().makeTranslation(-rotPathPt.x, 0, rotPathPt.y);

    // Step 2: Rotate by -angle around Y axis
    //   Math R(-angle) in 2D maps to Three.js rotation around Y by -angle
    const rot = new THREE.Matrix4().makeRotationY(-angle);

    // Step 3: Translate by (dx, dy) in math coords
    //   Three.js: translate by (dx, 0, -dy)
    const t2 = new THREE.Matrix4().makeTranslation(dx, 0, -dy);

    // Compose: t2 * rot * t1
    const mat = new THREE.Matrix4();
    mat.multiplyMatrices(t2, rot);
    mat.multiply(t1);
    return mat;
  }

  // --- Inverse transform for sofa perspective ---
  // In sofa perspective, the sofa stays at canonical position and the hallway moves.
  // Hallway point h in sofa frame = R(angle) * (h - (dx, dy)) + rotPathPt
  // In Three.js: we transform the hallway group
  function buildHallwayTransformMatrix(angle, rotPathPt, dx, dy) {
    // Step 1: Translate hallway by -(dx, dy)
    //   Three.js: translate by (-dx, 0, dy)
    const t1 = new THREE.Matrix4().makeTranslation(-dx, 0, dy);

    // Step 2: Rotate by angle around Y
    //   Math R(angle) in 2D maps to Three.js rotation around Y by +angle
    const rot = new THREE.Matrix4().makeRotationY(angle);

    // Step 3: Translate by rotPathPt
    //   Three.js: translate by (rpx, 0, -rpy)
    const t2 = new THREE.Matrix4().makeTranslation(rotPathPt.x, 0, -rotPathPt.y);

    // Compose: t2 * rot * t1
    const mat = new THREE.Matrix4();
    mat.multiplyMatrices(t2, rot);
    mat.multiply(t1);
    return mat;
  }

  // --- Public API ---
  function init() {
    if (initialized) return;

    const canvasTop = document.getElementById('three-canvas-top');
    const canvasBottom = document.getElementById('three-canvas-bottom');

    hallwayVP = createViewport(canvasTop);
    sofaVP = createViewport(canvasBottom);

    // Set up default camera positions
    // Hallway viewport: elevated view looking at hallway corner
    hallwayVP.camera.position.set(-1, 3, 3);
    hallwayVP.controls.target.set(0, 0, 0);
    hallwayVP.controls.update();

    // Sofa viewport: similar angle
    sofaVP.camera.position.set(-1, 3, 3);
    sofaVP.controls.target.set(0, 0, 0);
    sofaVP.controls.update();

    initialized = true;

    // Start animation loop
    animate();
  }

  function animate() {
    requestAnimationFrame(animate);
    if (!isActive) return;

    if (currentPerspective === 'both') {
      hallwayVP.controls.update();
      hallwayVP.renderer.render(hallwayVP.scene, hallwayVP.camera);
      sofaVP.controls.update();
      sofaVP.renderer.render(sofaVP.scene, sofaVP.camera);
    } else if (currentPerspective === 'sofa') {
      sofaVP.controls.update();
      sofaVP.renderer.render(sofaVP.scene, sofaVP.camera);
    } else {
      hallwayVP.controls.update();
      hallwayVP.renderer.render(hallwayVP.scene, hallwayVP.camera);
    }
  }

  function update(sofa, t) {
    if (!initialized) return;

    const phase = sofa.getPhase(t);
    const rp = sofa.getRotPathPoint(phase.angle);

    // Update hallway viewport: sofa moves, hallway stays fixed
    const sofaMatrix = buildMovementMatrix(phase.angle, rp, phase.dx, phase.dy);

    // The ExtrudeGeometry is created in the xy-plane (shape) extruded along z.
    // We need to first rotate it to lie in the xz-plane (so it sits on the floor),
    // then apply the movement transform.
    const layFlat = new THREE.Matrix4().makeRotationX(-Math.PI / 2);
    const hallwaySofaMat = new THREE.Matrix4();
    hallwaySofaMat.multiplyMatrices(sofaMatrix, layFlat);
    hallwayVP.sofaMesh.matrix.copy(hallwaySofaMat);

    // Reset hallway group transform in hallway viewport (hallway is static)
    hallwayVP.hallwayGroup.matrixAutoUpdate = false;
    hallwayVP.hallwayGroup.matrix.identity();

    // Update sofa viewport: sofa at canonical position, hallway transforms around it
    sofaVP.sofaMesh.matrix.copy(layFlat);

    const hallwayMatrix = buildHallwayTransformMatrix(phase.angle, rp, phase.dx, phase.dy);
    sofaVP.hallwayGroup.matrixAutoUpdate = false;
    sofaVP.hallwayGroup.matrix.copy(hallwayMatrix);
  }

  function rebuildSofa(sofa) {
    if (!initialized) return;

    if (currentSofaGeometry) {
      currentSofaGeometry.dispose();
    }

    const pts = sofa.canonicalPoints;
    currentSofaGeometry = buildSofaGeometry(pts);

    if (currentSofaGeometry) {
      hallwayVP.sofaMesh.geometry.dispose();
      hallwayVP.sofaMesh.geometry = currentSofaGeometry;

      sofaVP.sofaMesh.geometry.dispose();
      sofaVP.sofaMesh.geometry = currentSofaGeometry;
    }
  }

  function resize() {
    if (!initialized) return;

    resizeViewport(hallwayVP, document.getElementById('three-container-top'));
    resizeViewport(sofaVP, document.getElementById('three-container-bottom'));
  }

  function resizeViewport(vp, container) {
    if (!container || container.style.display === 'none') return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (w === 0 || h === 0) return;
    vp.renderer.setSize(w, h, false);
    vp.camera.aspect = w / h;
    vp.camera.updateProjectionMatrix();
  }

  function setActive(active) {
    isActive = active;
    if (active && initialized) {
      // Defer resize to next frame so containers have correct dimensions
      requestAnimationFrame(() => resize());
    }
  }

  function setPerspective(name) {
    currentPerspective = name;

    const topContainer = document.getElementById('three-container-top');
    const bottomContainer = document.getElementById('three-container-bottom');
    const divider = document.getElementById('three-divider');

    if (name === 'both') {
      topContainer.style.display = '';
      bottomContainer.style.display = '';
      divider.style.display = '';
    } else if (name === 'sofa') {
      topContainer.style.display = 'none';
      bottomContainer.style.display = '';
      divider.style.display = 'none';
    } else {
      // hallway (default)
      topContainer.style.display = '';
      bottomContainer.style.display = 'none';
      divider.style.display = 'none';
    }

    if (isActive) {
      requestAnimationFrame(() => resize());
    }
  }

  return { init, update, rebuildSofa, resize, setActive, setPerspective };
})();
