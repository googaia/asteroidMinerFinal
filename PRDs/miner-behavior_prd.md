# PRD: Miner Behavior & Mission Loop

## 1. Objective
Define the lifecycle of a Miner unit from launch to resource deposit. The system must support single-unit operations in Act 1 and scale to fleet-level management in later acts.

## 2. The Mission Loop (States)
Each Miner operates on a finite state machine:
1. **Idle/Hangar:** Waiting on Earth for launch.
2. **Transit-Out:** Launching from Earth and intercepting the target Asteroid.
3. **Approach/Docking:** Aligning with the asteroid's orbital path and landing.
4. **Mining:** Remaining stationary on the asteroid to extract resources.
5. **Transit-Home:** Departing the asteroid and returning to Earth.
6. **Unloading:** Depositing Aetherite and resetting to Idle.

## 3. Flight & Physics Logic

### 3.1 Launch Origin
- Miners should not launch from a single point. 
- **Requirement:** Procedurally select a random coordinate on the Earth sphere's surface for each launch to simulate global spaceports.

### 3.2 Intercept Trajectory (`TRANSIT_OUT`)
- **Dynamic Tracking:** The Miner must recalculate its heading *every frame* to point continuously at the moving asteroid's *current* position (Pure Pursuit).
- **Interception:** The miner moves along this updating vector until distance < 0.2 units.

### 3.3 Docking & Mining (`MINING`)
- **Hard Lock:** Upon reaching the asteroid, the Miner must strictly synchronized its position with the asteroid.
- **Visual Attachment:** The miner should appear "landed" on the surface, moving and rotating exactly with the asteroid as it orbits.
- **Visuals:** Use `#rocket-particle-trail` during transit, which deactivates upon landing.



## 4. Mining Mechanics
- **Mining Duration:** A variable `miningTime` (Seconds).
- **Capacity:** A variable `cargoCapacity` (Amount of Aetherite per trip).
- **Visual Feedback:** 
  - A small progress bar must appear above the Miner while docked.
  - **Performance Requirement:** The progress bar animation must typically be handled via **Direct DOM Manipulation** (Refs) or shader uniforms update in the `useFrame` loop to ensure smooth 60fps updates without triggering React component re-renders.
  - Text "EXTRACTING..." should be visible.

## 5. UI & Cooldown Logic

### 5.1 The Launch Button
- **Location:** South Dock.
- **Requirements:** 
  - **Tech:** Must unlock Scan, Rocket, AND Mining.
  - **Funds:** $10,000,000 per launch.
- **Function:** Triggers the launch of one Miner to the currently selected asteroid. Deducts funds immediately.

### 5.2 Cooldown System
To prevent infinite rapid-fire launches, the button must implement a cooldown:
- **Base Cooldown:** `launchCooldown` (Default: 5.0 seconds).
- **UI State:** When clicked, the button should fill with a "radial wipe" or "loading bar" overlay indicating time remaining.
- **Upgradability:** The `launchCooldown` variable must be stored in the **Zustand Store** so that later research can reduce this value (e.g., $5.0s \to 2.5s$).

## 6. Data & State Integration (Zustand)
The Miner system must report back to `useGameStore.ts`:
- **On Landing:** Set `isMining: true`.
- **On Return:** `aetherite_count += cargoCapacity`. **Trigger UI Update:** The Aetherite display in West Wing must be revealed if it was hidden.
- **Active Miners:** Maintain an array of `activeMinerObjects` to track multiple simultaneous flights.

---
**AntiGravity Agent Instruction:** 1. Use the `useFrame` hook to update Miner positions based on their current state. 
2. Ensure the "Return to Earth" logic calculates the Earth's position dynamically, as the Earth may move or rotate. 
3. Implement the cooldown using a simple `lastLaunchTime` timestamp comparison in the UI component to ensure high performance.