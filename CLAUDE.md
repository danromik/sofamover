# Moving Sofa Project

## Background
This project is by Dan Romik, a mathematician researching the moving sofa problem (a famous open problem in geometry). Dan published a paper on the topic in 2016 and developed accompanying code. The current goal is to continue this research with new code for visualizing moving sofa geometry.

## Project structure

### Resources (`resources/`)
- `resources/romik2016/` — Dan's 2016 paper: LaTeX source (`sofa.tex`), compiled PDF (`romik-movingsofa-2016.pdf`), and figure files (PDF/PNG) included in the paper
- `resources/movingsofas-v1.3.nb` — Mathematica notebook with original code
- `resources/moving-sofa-code.m` — Extracted Mathematica code from the notebook (useful reference for sofa shape definitions and rotation paths)

### SofaMover app (`SofaMover/`)
Electron desktop app for visualizing moving sofa shapes. Three view tabs: 2D View (canvas), 3D View (Three.js WebGL), and Balanced Polygons (iterative sofa optimization).
```
SofaMover/
  package.json, main.js          — Electron setup
  renderer/
    index.html, style.css        — UI layout and styling
    renderer.js                  — Orchestration: events, canvas, redraw loop, tab switching, radius slider UI
    hallway.js                   — Coordinate transform (Transform class) + L-shaped hallway drawing (2D)
    sofa-math.js                 — Shared math: rotation paths x1-x6, contact paths A/B/C/D, movement transform, eased time reparametrization
    three-view.js                — 3D View: dual Three.js viewports, extruded hallway/sofa meshes, orbit controls
    balanced-polygons.js         — Balanced Polygons: Gibbs (2014) iterative sofa optimization via L-shape intersections
    lib/
      three.min.js               — Three.js r128 (global UMD build)
      OrbitControls.js            — Three.js orbit camera controls
      clipper.js                 — Angus Johnson's Clipper library for polygon boolean operations
    sofas/
      unit-square.js             — Unit square (translation only)
      semicircle.js              — Semicircle sofa (rotation only, x(t)=0)
      hammersley.js              — Generalized Hammersley (configurable inner radius r, default 2/pi)
      gerver.js                  — Gerver's optimal sofa (5 rotation path phases, 5 boundary segments)
      romik.js                   — Romik's ambidextrous sofa (3 rotation path phases, 10 boundary segments with reflections)
```

## Important notes
- When formulas from the paper are needed, read the LaTeX source (`sofa.tex`), not the PDF.
- The PDF is useful for viewing included figures (referenced via `\includegraphics` in the LaTeX).
- The Mathematica code (`moving-sofa-code.m`) contains rotation path functions and shape boundary definitions for all sofa shapes.

## Sofa interface
Each sofa in `sofas/` exports a global object with:
- `name` — display name for the dropdown
- `canonicalPoints` — array of {x, y} boundary points in canonical (sofa-centered) coordinates
- `getPhase(t)` — returns `{angle, dx, dy}` for slider parameter t ∈ [0, 1]
- `getRotPathPoint(angle)` — returns rotation path point `{x, y}` at given angle
- `getPhaseBoundaries()` — returns array of phase boundary t-values
- `draw(ctx, transform, t)` — draws the sofa on 2D canvas at slider parameter t
- Optional `hasRadiusParam`, `setRadius(r)`, `getRadius()` — for sofas with a configurable parameter (e.g., Hammersley)

Movement framework (from paper): at rotation angle `a`, a canonical shape point `p` is transformed to `R(-a) * (p - x(a))` where `x(a)` is the rotation path. Shared implementation in `sofa-math.js`. The 3D view reuses the same interface — `canonicalPoints` are extruded into 3D meshes, and `getPhase`/`getRotPathPoint` drive the mesh transform matrix each frame.

## Animation time reparametrization

The slider parameter `t ∈ [0, 1]` is mapped to sofa motion through eased phases defined in `sofa-math.js`.

### Constants (in `sofa-math.js`)
- `T1 = 0.2` — end of enter (sliding) phase
- `T2 = 0.8` — start of exit (sliding) phase
- `ENTER_DIST = 3` — distance traveled during enter/exit slides

### Phase structure for rotating sofas
- **Enter phase** `[0, T1]`: sofa slides in from the left with easing, angle = 0
- **Rotation phase** `[T1, T2]`: divided into N equal subintervals (one per rotation subphase), each with ease-in/ease-out. The angle within each subinterval interpolates between subphase angle breakpoints.
- **Exit phase** `[T2, 1]`: sofa slides out downward with easing, angle = π/2

The function `threePhaseEased(t, subphaseBreakpoints)` implements this. Each sofa passes an array of N+1 angle breakpoints defining N subphases.

### Easing function
`smoothstep(t) = 3t² - 2t³` — maps [0,1] → [0,1] with zero derivative at both endpoints, providing smooth acceleration/deceleration.

### Per-sofa subphase breakpoints
| Sofa | N | Breakpoints |
|------|---|-------------|
| Semicircle | 1 | `[0, π/2]` |
| Hammersley | 1 | `[0, π/2]` |
| Gerver | 5 | `[0, φ, θ, π/2−θ, π/2−φ, π/2]` where φ≈0.0392, θ≈0.6813 |
| Romik | 3 | `[0, β, π/2−β, π/2]` where β≈0.2897 |

### Unit square (special case)
The unit square has no rotation, so T1/T2 don't apply. Its motion is 2 eased subphases:
- `[0, 0.5]`: slide right (eased)
- `[0.5, 1]`: slide down (eased)

## Visual style

### 2D View
- Black background, gray hallway interior, white hallway walls
- Hallway arms extend to canvas edges
- Viewport shifted so outer corner (1,1) is near top-right of canvas
- Sofa filled with semi-transparent blue, stroked with opaque blue

### 3D View
- Three.js WebGL rendering with black background
- Hallway: gray L-shaped floor with white extruded wall rails (height H1 = 0.2)
- Sofa: 2D canonical shape extruded upward (height H2 = 0.6), translucent blue material
- Dual viewports: hallway perspective (sofa moves) and sofa perspective (hallway moves around fixed sofa)
- OrbitControls for drag-to-orbit camera; scroll drives animation (not zoom)
- Coordinate mapping: math (x, y) → Three.js (x, h, -y) where h is height

## Tabbed UI
- **2D View**: 2D canvas rendering with perspective options (Hallway/Sofa/Both split-screen)
- **3D View**: Three.js rendering with same perspective options mapped to dual 3D viewports
- **Balanced Polygons**: Iterative sofa optimization (see below)
- Shared across 2D/3D tabs: sofa selector, area label, radius slider, perspective radios, bottom slider with play/pause/speed
- Hidden in 3D View: visibility checkboxes, contact points legend
- Balanced Polygons tab has its own sidebar controls (N, iterations, balancing buttons)

## Balanced Polygons view

Implements the approach from Gibbs (2014) for numerically approximating the optimal moving sofa shape. The sofa polygon is computed as the intersection of N+1 rotated and translated L-shaped hallways, initialized along the Hammersley rotation path with r = 2/π.

### Algorithm
- **Initialization**: N+1 hallways at evenly spaced angles α_k = kπ/(2N), with inner corner positions along the Hammersley rotation path: P_k = (r(cos(2α_k) − 1), r·sin(2α_k))
- **Polygon computation**: Iterative polygon intersection using Clipper library (integer-based, robust). Each L-shape is built as a 6-vertex polygon with arms of length 3.
- **Balancing (gradient ascent)**: For each movable hallway k (1..N−1), compute numerical gradient ∂A/∂x and ∂A/∂y via finite differences, then step in the gradient direction. Step size = 0.02, gradient epsilon = 1e-5.

### Controls
- **N slider** (3–100): number of hallway steps, with +/− buttons
- **Iterations per click**: 1, 10, 100, 1000, or 10000
- **Apply Balancing**: run iterations (also triggered by Space key)
- **Play/Pause**: continuously apply balancing with live polygon updates
- **Reset**: return to Hammersley initialization

### Key files
- `balanced-polygons.js` — state, polygon computation (Clipper), gradient ascent balancing, rendering
- `lib/clipper.js` — Angus Johnson's Clipper v6.1.3a for polygon boolean intersection

## Todo
1. **Better UI**: Allow user to drag the sofa shape directly instead of using the slider
