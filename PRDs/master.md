# Master PRD: Asteroid Miners (Project: Infinite Horizon)

## 1. Executive Summary
**Asteroid Miners** is an exponential, incremental strategy game tracking humanity's evolution from Earth-bound scarcity to a multi-planetary civilization. The game utilizes a "single-view" infinite zoom mechanic, transitioning from 1:1 scale orbital intercepts to galactic-scale terraforming.

## 2. Platform Strategy & Technical Stack
- **Core Engine:** React Three Fiber (R3F) / Three.js.
- **Physics Engine:** Rapier.js (WASM) for high-performance debris.
- **State Management:** **Zustand** (Single Source of Truth). 
- **Styling/UI:** Tailwind CSS (Overlay Layer).
- **Responsive Framework:** React-use-measure or native R3F `useThree` resize observers.

## 3. Dynamic Scaling & Responsiveness
The game must be **fully liquid**, adapting instantly to any screen size or aspect ratio.
- **Canvas Scaling:** The 3D `<Canvas>` must fill 100% of its parent container. Use `ResizeObserver` to update camera aspect ratios.
- **UI Adaptation:** Use Tailwind's responsive breakpoints. On mobile, UI modules should collapse into a "Command Center" drawer.
- **Fluid Typography:** Use `clamp()` functions for text to ensure legibility on 4-inch phones and 32-inch monitors.

## 4. Visual Identity & Theme Configuration
To maintain a consistent aesthetic (Liquid Glass / High-Tech Minimalism), the following theme tokens must be used:

### 4.1 Color Palette (Tailwind/Three.js)
| Token | Hex Code | Usage |
| :--- | :--- | :--- |
| **Space Black** | `#05070A` | Primary Background / Skybox Clear Color |
| **Glass White** | `#FFFFFF` | Primary UI Elements, Borders, Text (Variable Opacity) |
| **Aetherite** | `#BC13FE` | Rare Material Glow, High-Level Tech |
| **Warning Red** | `#FF3131` | Low Energy, Collision Warnings, Structural Damage |
| **Neutral Slate** | `#94A3B8` | Subtext, Secondary UI |

### 4.2 Typography
- **Primary Header:** `Orbitron` or `Rajdhani` (Sans-serif, Geometric)
- **Data/Terminal:** `JetBrains Mono` or `Roboto Mono` (Monospaced for numbers/logs)

### 4.3 UI Component Rules
- **Style:** "Liquid Glass" - High blur (`backdrop-blur-xl`), white borders with low opacity (`border-white/20`), and subtle gradients.
- **Currency:** Must use abbreviations: `k` (thousands), `m` (millions), `b` (billions), `t` (trillions). Example: `$100m`.
- **Transparency:** Backgrounds should be `bg-white/5` or `bg-black/40` depending on contrast needs.
- **Borders:** 1px solid `White` with 0.1-0.3 alpha.
- **Animations:** All transitions should use a "Glitch-in" or "Fast Slide" (Duration: 150ms).

## 5. Global State Architecture (The SST)
All variables must reside in a single **Zustand Store**. 
- **Economy:** `money` (BigInt/Decimal.js), `aetherite_count`.
- **Navigation:** `zoom_level` (float), `current_focus_target` (Object ID).
- **Environment:** `window_dimensions` (width/height for UI calculations).

## 6. The "Infinite Zoom" Mechanic
| Tier | Scale | Focus | UI Complexity |
| :--- | :--- | :--- | :--- |
| **I** | 1:100k | Earth / Near-Orbit | Minimalist (HUD Only) |
| **II** | 1:10M | Inner Solar System | Multi-object tracking, Labs |
| **III** | 1:1B | Outer Solar System | Logistics, Fleet Management |
| **IV** | 1:100B | Interstellar | Ark Ship status, Warp metrics |

## 7. Development Phases (The Acts)
- **Act 1:** Exploration ($100M start, first scan).
    - **Research Mechanics:** ALL research upgrades utilize a **Active Probability System**.
        - **Initiation:** User pays the base cost to **Start Research**.
        - **Development:** Once started, the "Success Chance" bar gradually fills over time (Variable Rates).
        - **Risk/Reward:** User can "Attempt Breakthrough" at any time.
            - **<100%:** Probabilistic roll. **Failure** destroys the prototype (Progress reset, must re-fund).
            - **100%:** Guaranteed success. Card glows green.
        - **Funding:** Can still inject capital to boost the running probability.
    - **Market Unlock:** Requires finding Aetherite first.
- **Act 2:** Industrialization (Drones, Moon base).
- **Act 3:** Expansion (Mars, Asteroid Belt).
- **Act 4:** Exodus (The Arks for **Ark: Genesis**).

---
**AntiGravity Agent Instruction:** Reference Section 4.1 when creating the Tailwind configuration (`tailwind.config.js`) and the Three.js material library. Use the provided hex codes to ensure the Aetherite glow and HUD elements remain visually unified.