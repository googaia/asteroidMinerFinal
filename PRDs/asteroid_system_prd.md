# PRD: Asteroid Lifecycle & Resource Scaling

## 1. Objective
To create a dynamic, procedural population of asteroids that act as finite resource nodes. This system must handle scaling difficulty (distance) and scaling rewards (capacity) while providing a high-fidelity visual payoff for depleting a source.

## 2. Orbital Mechanics & Scaling
Asteroids follow a stable elliptical orbit around Earth (the focal point).
- **Early Game (Act 1):** Semi-major axis ($a$) is small, keeping targets in the "Near-Field."
- **Evolutionary Scaling:** As the player's `total_asteroids_scanned` count increases, the potential orbital radius must expand.
- **Randomization:** Each orbit should have a random eccentricity ($e$) and inclination to prevent asteroids from overlapping on the same path.
- **Keplerian Physics:** Angular velocity must vary with distance. Asteroids move faster at **Periapsis** (closest approach) and slower at **Apoapsis** (farthest point). $\dot{\theta} \propto r^{-2}$.



## 3. Resource Scaling (Aetherite Density)
Asteroid richness is finite and increases based on the player's exploration progress.

| Generation Index | Resource Range (Aetherite) | Orbital Distance Scale |
| :--- | :--- | :--- |
| **First Asteroid** | 500 - 1000 | Near-Earth (1x) |
| **2nd - 5th** | 1000 - 2500 | Medium (1.5x) |
| **6th - 10th** | 2500 - 5000 | Distant (2x) |
| **11th+** | $Base \times (1.15)^{n}$ | Deep Space (Exponential) |

**Generation Logic:**
- The system must track `asteroidsGenerated` count to apply the scaling multiplier.
- `aetherite` amount is randomized within the range for the current tier.

**Depletion Logic:**
- Every successful miner return reduces the `current_resources` of the targeted asteroid.
- The asteroid's UI Label must update in real-time to show the remaining `aetherite`.
- When `current_resources <= 0`, the asteroid state changes to `DEPLETED`.

## 4. The "Shatter" Sequence (Destruction)
When an asteroid is depleted, it must execute a visual "Shatter" event before being removed from the game engine.

1. **Mesh Swap:** The single asteroid mesh is instantly replaced by 5–8 smaller fragment primitives.
2. **Kinematics:** Fragments inherit the original orbital velocity but add an outward "shrapnel" vector.
3. **Drift & Fade:** - Fragments drift away from the original center-point.
   - Opacity scales from `1.0` to `0.0` over exactly 3 seconds.
4. **Garbage Collection:** After the 3-second fade, the fragment objects must be destroyed, and the asteroid ID must be removed from the `useGameStore` to preserve performance.



## 5. Technical Requirements for AntiGravity
- **State Array:** Manage asteroids in a `Map` or `Array` in Zustand.
- **Identifier:** Each asteroid needs a unique `id` and a `label` (e.g., "K-201").
- **Performance:** Use `instancedMesh` if the number of active fragments exceeds 50 during a mass-shatter event.
- **Math Formula:** Use the polar form of the ellipse: 
  $$r(\theta) = \frac{a(1-e^2)}{1+e\cos\theta}$$

---
**AntiGravity Agent Instruction:** When implementing the `Shatter` logic, use a `setTimeout` or a frame-count check to ensure the removal of fragments from the Three.js scene happens exactly after the fade-out is complete to avoid "popping" visuals.