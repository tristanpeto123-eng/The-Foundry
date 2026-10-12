# Scalp City — The Foundry (evaluation prototype)

A standalone **real 3D Three.js** factory evaluation, not a static mockup.

## Run

Unzip the package. Serve the folder over HTTP, e.g. `python3 -m http.server 8000`, then open `http://localhost:8000` in a browser. For iPhone, host the files on GitHub Pages or another HTTPS static host. The Three.js modules are loaded from jsDelivr, so internet access is required.

## Controls

- Drag to orbit, pinch/scroll to zoom.
- Tap a robot or station to inspect it.
- Play Workflow animates **illustrative** events only; Stop halts the event counter.
- Reset View / Overview returns to the factory overview.

## Scope and limitations

- 12 stations matching Scalp-City-Lab agent IDs.
- Physical factory floor, overhead beams, gantry, robots, conveyor and animated data packets.
- Not connected to Scalp-City-Lab telemetry, backtesting or brokerage.
- No actual trading, order approval, or financial performance claims.
- Prototype is procedural low-poly geometry; the rendered concept board is visual direction only.
- This package does not alter Scalp-City-Lab or Scalp-City-1.
