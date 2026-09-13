# Aethelclock

**A complete celestial mechanical engine; an Antikythera-mechanism-style orrery, built in TypeScript.**

- Live: [niksgraves.github.io/aethelclock](https://niksgraves.github.io/aethelclock)

## Overview

Aethelclock is a browser-based orrery that simulates the mechanical gear train logic of the ancient Antikythera mechanism. Rather than animating planets on independent timers, every planet's motion is derived from a single shared input: a master crank, propagated through a chain of gear ratios, exactly as a real geared mechanical device would work.

Built solo, from concept to working simulation, in 1 hour 35 minutes (Tracked using Hackatime). And more to come!

## How it works

- **Single driving input.** One master crank angle represents elapsed time. Every planet's position is a deterministic function of that one value, there is no independent "planet clock."
- **Ephemeris-driven propagation.** Each body is defined by an orbital radius, sidereal period (in Earth days), eccentricity, and color. A planet's angular velocity relative to the crank is derived from its period, so orbital motion emerges from real orbital data rather than hardcoded per planet speeds.
- **Radian based math throughout.** All angular calculations are done in radians rather than degrees, since angular velocity propagation falls out directly without unit conversion overhead in the render loop.
## Ephemeris data

Each body's motion is defined by an orbital radius, sidereal period (in Earth days), and eccentricity:

```typescript
public readonly ephemeris: Record<string, PlanetaryMetrics> = {
  // --- Inner Terrestrial Train ---
  MERCURY: { radius: 25,  period: 87.969,   eccentricity: 0.2056, color: '#8a8d8f' },
  VENUS:   { radius: 45,  period: 224.701,  eccentricity: 0.0067, color: '#e3bb76' },
  EARTH:   { radius: 70,  period: 365.256,  eccentricity: 0.0167, color: '#4ba3e3' },
  MARS:    { radius: 95,  period: 686.980,  eccentricity: 0.0934, color: '#c15c3d' },

  // --- Outer Gas Giant Train (Scaled Radii) ---
  JUPITER: { radius: 125, period: 4332.59,  eccentricity: 0.0489, color: '#b07f35' }, // ~11.86 Earth Years
  SATURN:  { radius: 150, period: 10759.22, eccentricity: 0.0555, color: '#ead6b8' }, // ~29.46 Earth Years
  URANUS:  { radius: 175, period: 30688.50, eccentricity: 0.0472, color: '#4b70dd' }, // ~84.02 Earth Years
  NEPTUNE: { radius: 195, period: 60195.00, eccentricity: 0.0086, color: '#274687' }  // ~164.8 Earth Years
};
```

## Features

- Multi gear mechanical core with full solar system projection (Mercury - Neptune)
- Master input crank for time advancement (in Earth days)
- Radial orbit visualization with concentric reference rings

## Roadmap

- [x] **Floating master crank** - replace the linear slider with a circular dial the user grabs and rotates directly, with angle-delta tracking and inertial coasting after release, so it doubles as a visible "time cursor" in the scene rather than a UI bar.

- [ ] **Moons** - nested gear trains driven off each parent planet's angle rather than the crank directly (e.g. Earth's Moon, Mars's Phobos/Deimos, the Galilean moons of Jupiter, Titan), with exaggerated orbit radii for visibility at solar system scale.

- [ ] **Epicyclic (planetary) gearing** - layer a secondary rotating frame onto the outer planets to reproduce true apparent retrograde motion, the same way historical geared astronomical devices modeled it.

- [ ] **Eclipse/Saros cycle prediction** - a Moon gear train geared to the ~223-month Saros cycle, showing the ancient mechanism's most notable original capability.

## Tech stack

- TypeScript
- Deployed via GitHub Pages

## Author

Built by Niks.