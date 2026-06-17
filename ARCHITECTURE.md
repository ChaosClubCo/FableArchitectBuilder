
# FableRealm Technical Architecture

## Overview
FableRealm follows a **Modular Simulation Pattern** where the visual layer (Three.js) is decoupled from the logical layer (SimulationService).

## Core Systems

### 1. Simulation Engine (`services/simulationService.ts`)
The game operates on a tick-based loop (default 2500ms).
- **Spatial Coverage Pass**: Calculates service radii (Guards, Mages, Wisdom) using a BFS-like grid traversal.
- **State Integration**: Pure function that accepts `(Grid, Stats)` and returns `(NewGrid, NewStats)`. This ensures determinism and simplified undo/redo capabilities.

### 2. AI Service Layer (`services/geminiService.ts`)
Uses the `@google/genai` SDK with JSON schema enforcement.
- **Quest Generation**: Context-aware prompt engineering that analyzes building counts and gold reserves.
- **Atmospheric News**: Low-latency scrying for whimsical flavor text.

### 3. Graphics & Interaction (`components/IsoMap.tsx`)
- **Instancing**: Future refactor target to handle thousands of entities. Currently uses memoized React components for 3D buildings.
- **Procedural Textures**: Custom Canvas-generated textures for terrain to minimize asset weight and improve offline speed.

### 4. PWA & Persistence
- Uses a `KingdomProfile` structure to allow for future multi-user SaaS integration.
- Service worker manifests are injected via the HTML head to satisfy Chromium installability criteria.
