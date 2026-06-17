
# KeysKingdom QA Smoke Tests

To be run after every UI refactor.

## 1. Build & Boot
- [ ] Run `vite build`. Verify zero errors.
- [ ] Open app. Verify "Start Screen" displays without horizontal overflow.

## 2. Core Gameplay (The Key Flow)
- [ ] Click "Turn the Key". Verify Three.js scene initializes.
- [ ] Place a "Cottage". Verify Gold decreases and Population starts growing.
- [ ] Press `R` (Desktop) or 📐 (Mobile) to rotate. Verify building orientation changes.

## 3. Intelligence & Services
- [ ] Open "Keeper of Keys" (Advisor). Verify Gemini API returns a response.
- [ ] Open "Vault of Keys" (Research). Verify tech tree renders.

## 4. Persistence
- [ ] Refresh page. Verify "Chronicle of Keys" shows the previous save.
- [ ] Delete a save. Verify it disappears from the list.
