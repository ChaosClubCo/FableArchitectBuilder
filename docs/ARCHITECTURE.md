
# KeysKingdom Technical Architecture

## 1. Overview
KeysKingdom follows a **Modular Simulation Pattern** orchestrated by React Custom Hooks. The visual layer (Three.js) is decoupled from the logical layer (Services).

## 2. Core Systems

### Orchestration Layer (`hooks/`)
- **`useGameLoop`**: Manages the `setInterval` ticker, `SimulationService` calls, and Auto-save triggers. Decouples time-management from UI rendering.
- **`useKeyboardControls`**: Centralizes input event listeners, handling camera rotation and tool shortcuts.

### Logic Layer (`services/`)
- **Simulation Engine (`simulationService.ts`)**: Pure deterministic logic. Calculates Happiness, Income, and Event lifecycles (Droughts).
- **Research System (`researchService.ts`)**: Directed Acyclic Graph (DAG) managing the Tech Tree. Validates prerequisites and Wisdom costs.
- **Action Dispatcher (`actionService.ts`)**: Handles user interactions (Build, Upgrade, Bulldoze). Returns result objects with success/failure messages.

### Audio Engine (`services/soundService.ts`)
- **Procedural Synthesis**: Uses the Web Audio API (Oscillators, GainNodes, BiquadFilters) to generate sound in real-time.
- **Ambience Graph**:
    - **Wind**: Pink noise through a modulated LowPass filter.
    - **Rain**: White noise through a bandpass filter.
    - **Night**: High-frequency sine waves with LFO modulation (Crickets).
- **Reactive**: Audio state changes based on `CityStats.weather` and `CityStats.time`.

### AI Service Layer (`services/geminiService.ts`)
- **Provider**: Google GenAI SDK (`gemini-3-flash-preview`).
- **Function**: Generates JSON-structured Quests and News based on game state context in KeysKingdom.

### Graphics (`components/IsoMap.tsx`)
- **Renderer**: React Three Fiber (R3F).
- **Building System**: Composite geometry generation (`BuildingSystem.tsx`).
- **Weather**: Particle systems using `THREE.Points` for Rain and Mana effects.

## 3. Data Flow
1.  **Loop**: `useGameLoop` ticks every 2.5s.
2.  **Simulate**: `SimulationService.calculateTick(grid, stats)` returns new state.
3.  **React**: State updates trigger React re-render.
4.  **Render**: `IsoMap` updates 3D scene; `UIOverlay` updates DOM.
5.  **Audio**: `SoundService` updates audio node parameters.
6.  **Persist**: `SaveService` writes to IndexedDB (KeysKingdomDB).

## 4. Tech Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS.
- **3D**: Three.js, @react-three/fiber, @react-three/drei.
- **State/Storage**: React.useState, Dexie.js (IndexedDB).
- **AI**: Google Gemini API.
- **Build**: Vite + PWA Plugin.

<!--
Source: code
Locator: services/, hooks/, components/
Confidence: HIGH
Last Verified: 2023-10-27
-->
