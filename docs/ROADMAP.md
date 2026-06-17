
# KeysKingdom Strategic Roadmap (v3.0+)

This document outlines the feature trajectory for KeysKingdom.

## Phase 1: Foundation (COMPLETED)
*Status: v3.0.0 Released*

1.  ✅ **Chronicle of Keys**: Advanced save/load profile management.
2.  ✅ **Procedural Audio Engine**: Dynamic weather/time based soundscapes.
3.  ✅ **The Vault of Keys (Tech Tree)**: Progression system with "Wisdom" currency.
4.  ✅ **Hook-Based Game Loop**: Architectural refactor.
5.  ✅ **Weather System**: Particle-based Rain and Storms with lightning.

## Phase 2: Performance & Economy (Q4 2023)
*Focus: Scalability and Gameplay Depth.*

6.  **Instanced Rendering (High Priority)**
    *   *Why:* To support 50x50 grids and 100+ agents.
    *   *Tech:* `THREE.InstancedMesh` implementation in `IsoMap`.
    
7.  **Advanced Resource Economy**
    *   *Why:* Tech Tree needs more cost types than just "Gold".
    *   *Feature:* Inventory tracking (Key Shards, Mana Stones). 

8.  **Visual Polish: Terrain Shaders**
    *   *Why:* The canvas texture is flat.
    *   *Feature:* Custom ShaderMaterial for ground with edge softening.

9.  **Dynamic Population Agents (Meeples)**
    *   *Why:* The city feels empty.
    *   *Feature:* Citizens walking on roads.

10. **Trade Routes & Merchant System**
    *   *Why:* Passive income and resource exchange.

## Phase 3: AI & Immersion (Q1 2024)
*Focus: Leveraging Gemini Live capabilities.*

11. **The Keeper of Keys (Persona Chat)**
    *   *Description:* Chat directly with the keeper using Live API.
    *   *Tech:* Gemini Multimodal Live API.

12. **Procedural Lore Generation**
    *   *Description:* Generate a history book for the kingdom.

13. **City Inspection Mode**
    *   *Description:* First-person camera drop.

14. **Disaster System 2.0**
    *   *Description:* Interactive disasters (Void Rifts).

15. **Localization Framework**
    *   *Description:* I18n support.

## Phase 4: Expansion (Q2 2024+)

16. **Gamepad Support**
    *   *Description:* Steam Deck verification.

17. **Multiplayer "Visit" Mode**
    *   *Description:* Async cloud viewing of other saves.

18. **Achievements System**
    *   *Description:* Persistent user-level unlocks.

19. **Seasonal Biomes**
    *   *Description:* Winter/Summer tile variants.

20. **Native Mobile Wrapper**
    *   *Description:* Capacitor/Ionic wrapper for App Store release.
