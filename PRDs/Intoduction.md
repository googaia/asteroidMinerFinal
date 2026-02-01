# PRD: Asteroid Miners - Act 1: The Exploration Phase

## 1. Scene Overview
Act 1 is the onboarding and discovery phase. The player starts with high capital but zero infrastructure. The goal is to transition from a passive observer to an active miner by researching three core technologies.

## 2. Global State & UI
- **Initial Capital:** $100,000,000
- **UI Constraints:** - Minimalist approach.
    - **Element:** `MoneyDisplay` (Top-right overlay).
    - **Background:** `MainGameView` showing Earth and a starfield.
- **Currency Format:** Standard USD (e.g., $100,000,000).

## 3. Technology & Research Requirements
The player must purchase the following upgrades. The total cost is $9,500,000 (remaining within the < $10M budget).

| Tech Pillar | Cost | Unlocks |
| :--- | :--- | :--- |
| **Scan Tech** | $2,500,000 | `ScanButton`, Asteroid Generation, Resource HUD |
| **Rocket Tech** | $4,000,000 | `LaunchButton`, Intercept Trajectory Logic |
| **Mining Tech** | $3,000,000 | `Aetherite` extraction capability (Ends Act 1) |

## 4. Functional Requirements

### 4.1 Discovery (Scan Tech)
Once `ScanTech == true`, the user can trigger a scan.
- **Asteroid Generation:** One asteroid appears on an elliptical orbit toward Earth.
- **Naming Convention:** Random String (e.g., `[Letter]-[Number]`) such as `K-402` or `X-99`.
- **Primary Resource:** **Aetherite** (Rare luminescent material).
- **Resource Volume:** Random range [500 - 2,000] units.

### 4.2 Interception (Rocket Tech)
Once `RocketTech == true` AND an asteroid is scanned:
- **The Interceptor:** A rocket sprite launches from Earth.
- **Trajectory:** Must calculate a path to the asteroid's current coordinates.
- **Logic:** 1. Launch from Earth.
    2. Intercept/Land on Asteroid.
    3. 3-second delay (Docking).
    4. Return to Earth.

### 4.3 Transition to Act 2 (Mining Tech)
- **The Trigger:** Researching `MiningTech` allows the rocket to bring back **Aetherite**.
- **Act 1 Conclusion:** The moment the first unit of Aetherite is successfully delivered to Earth, Act 1 is marked as `Complete`.

## 5. Technical Implementation Notes (for AntiGravity Agent)
- **Asteroid Orbit Formula:** $$r(\theta) = \frac{a(1-e^2)}{1+e\cos\theta}$$
  *Where $a$ is the semi-major axis and $e$ is eccentricity.*
- **Asset Tags:** Use `#rocket-sprite`, `#earth-sprite`, and `#asteroid-primitive`.
- **State Management:** Implement a `GamePhase` enum: `Exploration`, `Industrial`, `Interstellar`.