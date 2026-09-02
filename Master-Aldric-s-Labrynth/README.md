# Master Aldric's Labyrinth

A web-based training game that teaches Nova Scotia Health pharmacy staff the
"clickology" of Oracle Cerner workflows ahead of Go-Live. A follow-up to
[Charts, Please!](../charts-please).

The audience is already trained on Cerner, so this is a knowledge check, not
first exposure. At each junction the player sees three doors labelled with real
Cerner buttons (`Product…`, `Comments…`, `Order Type`) and picks the correct
next step:

- **Correct pick** advances through the workflow.
- **Wrong pick** hits a dead end that shows the rule from the job aid, then
  returns the player to the same junction.

It is wrapped in an apothecary/alchemy theme: a mentor, **Master Aldric**,
gives briefings and delivers the dead-end rules. No leaderboard and no timer —
the two scarce resources are **Aldric's patience** (a wrong pick costs one; at
zero the workflow restarts) and **hints** (spend one to make the correct door
glow). Progress persists in `localStorage`.

## Tech Stack

React 19 + TypeScript (Vite 8), Vitest for the engine tests. Fully static, no
backend.

## Getting Started

Node.js 20.19+ and npm. All commands run from this directory:

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc type-check + vite build
npm run lint       # eslint over all .ts/.tsx
npm run test:run   # run the engine unit tests once
npm run typecheck  # tsc, no emit
npm run format     # prettier --write .
```

## Structure

The code is strictly layered `types → data → engine → state → ui`, with two
rules enforced throughout:

1. **`game/` imports nothing from `state/` or `ui/`** — no React, DOM,
   `localStorage`, `Date.now()`, or `Math.random()`. The whole game loop is
   unit-testable without rendering anything.
2. **`ui/` never imports `data/` directly** — it receives a built workflow from
   `state/`.

```
src/
├── game/     # pure logic: types, seeded rng, buildWorkflow, engine, theme, data/
├── state/    # the only layer that touches localStorage
└── ui/       # scenes, components, and inline SVG art
```

Workflows are hand-authored from job aid PDFs as loose "authoring" types, then
`buildWorkflow()` normalises them into strict "built" types that the engine
consumes.

## Team

Aitzaz, Sakib

## Status

In development. Core engine and the vertical slice are playable; remaining work
is the Briefing/Complete scenes, remaining art, and content.
