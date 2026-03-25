# SofaMover

A desktop application for visualizing and animating solutions to the [moving sofa problem](https://en.wikipedia.org/wiki/Moving_sofa_problem), a famous open problem in geometry that asks for the largest shape that can be moved around a right-angled corner in a hallway of unit width.

## Sofa shapes

The app includes animations of several known sofa shapes:

- **Unit square** — translation only, no rotation
- **Semicircle** — the simplest rotating sofa
- **Hammersley sofa** — generalized Hammersley construction with configurable inner radius
- **Gerver's sofa** — the conjectured optimal sofa (area ≈ 2.2195)
- **Romik's ambidextrous sofa** — an optimal symmetric sofa that can navigate two successive corners

## Features

- **2D View** with hallway, sofa, and contact point perspectives
- **3D View** with extruded hallway and sofa meshes, dual viewports (hallway and sofa reference frames), and orbit camera controls
- **Balanced Polygons** — iterative optimization view implementing Gibbs's (2014) approach: start from a Hammersley sofa approximation (intersection of N rotated L-shaped hallways) and apply gradient ascent to maximize the area, converging toward the Gerver sofa
- Animated sofa movement with play/pause, speed control, and a scrubbing slider
- Switchable perspectives: hallway frame, sofa frame, or split-screen

## Running

Requires [Node.js](https://nodejs.org/).

```bash
cd SofaMover
npm install
npm start
```

## Status

This project is a work in progress. I'm actively working on improving the visualizations and adding more sofa visualization features.

## Author

[Dan Romik](https://www.math.ucdavis.edu/~romik/) — see also the accompanying [research paper](https://www.math.ucdavis.edu/~romik/movingsofa/).

## License

MIT
