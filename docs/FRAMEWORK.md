# Framework & Stack

## 1. Frontend Core
- **Library**: React 19 (via `aistudiocdn.com` imports).
- **Build Tool**: Vite (`vite.config.ts`).
- **Language**: TypeScript.

## 2. Rendering
- **3D Engine**: Three.js (`three`).
- **React Bindings**: `@react-three/fiber` (R3F), `@react-three/drei`.
- **Canvas**: Used for procedural texture generation in `IsoMap.tsx`.

## 3. Intelligence
- **SDK**: `@google/genai`.
- **Model**: `gemini-3-flash-preview` (hardcoded in `services/geminiService.ts`).
- **Pattern**: Direct client-to-API calls.

## 4. Persistence
- **Database**: IndexedDB wrapper via `dexie`.
- **Strategy**: Asynchronous saves triggered on tick loop (`App.tsx`).

## 5. Styles
- **Framework**: Tailwind CSS (via CDN `cdn.tailwindcss.com`).

## 6. Infrastructure
- **Hosting**: Static Web Host (Status: UNKNOWN - Vercel/Netlify implied by stack).
- **CI/CD**: GitHub Actions.

<!--
Source: code
Locator: index.html, package.json, vite.config.ts
Confidence: HIGH
Last Verified: 2023-10-27
-->