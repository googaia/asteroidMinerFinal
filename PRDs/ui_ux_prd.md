# PRD: User Interface & Visual Design (Liquid Glass)

## 1. Design Vision
The UI for **Asteroid Miners** is a diegetic "Liquid Glass" HUD. It should look like a high-end, professional interface designed by Apple for a near-future space agency. The aesthetic is clean, high-contrast, and utilizes transparency to keep the 3D space environment as the hero.

## 2. Visual Identity & "Liquid Glass" Tokens
To achieve the professional "Apple-in-Space" look, all UI panels must use these specific Tailwind/CSS properties:

| Element | Specification | Tailwind Utility |
| :--- | :--- | :--- |
| **Backdrop** | High-refraction blur | `backdrop-blur-xl` |
| **Surface** | Semi-transparent deep slate | `bg-slate-950/40` |
| **Borders** | Ultra-thin, low-opacity white | `border-[0.5px] border-white/10` |
| **Corner Radius**| Large, modern rounding | `rounded-2xl` |
| **Typography** | Monospaced for data | `font-mono` (JetBrains Mono) |
| **Typography** | Geometric for headers | `font-sans` (Orbitron/Rajdhani) |

## 3. Structural Layout (The Three-Zone System)

### 3.1 West Wing: Financials & Resources (Left)
- **Position:** Fixed to left center, vertical orientation.
- **Top Section:** Total Funds ($). Large, high-visibility monospaced text.
- **Middle Section:** **Aetherite** inventory count. (Hidden until the **first miner returns and deposits resources**. It must then appear **directly underneath Total Funds**).
- **Bottom Section:** **Stock Ticker.** A subtle, horizontal scrolling list showing the current market value of rare materials.

### 3. Layout & HUD
- **Philosophy:** "Floating Data." Content should float directly on the starfield without heavy containers or visible borders.
- **Top Left (Resources):** Minimalist text only. No background panel or borders. `[LABEL] [VALUE]` format.
- **Top Right (Research):** Frameless list. Research items float. No outer container/capsule.
- **Bottom Center (Actions):** The Launch Button should be a standalone capsule without an outer wrapper/border.
- **Micro-Interactions:** Hover effects should be subtle glints or brightness shifts, not heavy border highlights.
### 3.2 East Wing: Research & Development (Right)
- **Position:** Fixed to right center, vertical orientation.
- **Content:** Research Modules (Cards).
- **Behavior:**
    - **Completion:** When a tech is fully upgraded/unlocked, its card **vanishes**.
    - **Scaling:** The menu container automatically shrinks to fit the remaining cards.
- **Cards:**
    - **State - Locked:** 40% opacity, no glow.
    - **State - Locked:** 40% opacity, no glow.
    - **State - Researching:** (Removed - replaced by Probabilistic).
    - **State - Probabilistic (Standard):** All cards display a "Breakthrough Chance" %. 
        - **Sequential Unlock:** Technologies unlock in order: `Scan` -> `Rocket` -> `Mining` -> `Offworld Trading`.
        - **Growth:** Bar fills slowly over time.
        - **Progress Visual:** The probability bar uses a dynamic color gradient to indicate success chance:
            - **Low (<30%):** Red (Danger/Failure likely).
            - **Medium (30-79%):** Yellow (Uncertain).
            - **High (80%+):** Green (Success likely).
        - **Ready:** When 100%, the card glows **Green** with a 1px border.
        - **Interaction:** "Attempt" button (Capsule). Color matches probability safety (Red/Yellow/Green). Text: "RISK IT"
        - **Boost Button:** Small icon button ($). Hidden when probability reaches 100%.
        - **Start Button:** Capsule shape, no price in label (price shown in header).
        - **Unlocked:** Card vanishes or moves to 'Completed' list.

### 3.3 South Dock: Command & Control (Bottom)
- **Position:** Bottom center, horizontal floating dock.
- **Logic:** This is a context-aware dock inspired by the MacOS Dock.
- **Primary Actions:**
    - **[SCAN]**: Appears when Scan Tech is unlocked.
    - **[LAUNCH]**: Appears only when an asteroid is currently targeted and Rocket Tech is unlocked.
    - **[SCAN]**: Appears when Scan Tech is unlocked.
    - **[LAUNCH]**: Appears only when an asteroid is currently targeted and Rocket Tech is unlocked.
    - **[SELL]**: (Future Feature) Appears when Offworld Trading is unlocked. Mining Tech does *not* enable this.
- **Aesthetic:** Floating "pill" shape with a high blur and glass reflection.

## 4. Interaction & Motion
- **Hover State:** Buttons should increase in `backdrop-brightness` rather than just changing color.
- **Entrance:** Panels should fade in with a slight "blur-to-clear" transition (duration: 300ms).
- **Feedback:** Success (e.g., tech purchased) triggers a brief "Command Blue" pulse on the border.

## 5. Responsive Scalability (Mobile & Multiplatform)
To ensure the interface is not "squished" on smaller screens:
- **Layout Strategy:** 
    - **Always Split:** West Wing MUST stay on the Left. East Wing MUST stay on the Right. Do not stack them vertically.
    - **Hero Zone:** The center of the screen must remain open for the 3D view.
- **Component Compactness & Density:**
    - **Tight Packing:** Containers must "hug" their content. Avoid excessive internal padding.
    - **Padding Standards:**
        - **Outer Container:** Max `p-3` or `p-4` (Desktop), `p-2` (Mobile).
        - **Internal Gaps:** Reduce margins (`mb-1` instead of `mb-4`).
    - **Auto-Sizing:** Panels should use `width: fit-content` and `height: fit-content`.
    - **Min-Widths:** Remove aggressive minimum widths (e.g., `min-w-[280px]`) on mobile. Let the content define the size.
- **Mobile Adjustments (< 768px):**
    - **West Wing:** "Money Only" pill, tightly wrapped around the text.
    - **East Wing:** Compact icons or smaller cards. No full descriptive text if space is tight.
    - **South Dock:** Scales down, simpler graphics.

## 6. Visual Effects (FX)
- **Scan Effect (Sonar):**
    - **Trigger:** Completing Scan Research or clicking [SCAN].
    - **Visual:** A single glowing **Green** ring expanding from Earth.
    - **Interaction:** When the ring intersects the asteroid's orbit, the ring sections near the asteroid are "dragged" or "bent" back towards Earth, creating a distortion effect indicating mass detection.
    - **Reveal:** The asteroid fades in from 0% to 100% opacity exactly when the ring passes it.
    - **Audio:** High-pitch digital ping/sonar sweep.
    - **Timing:** ~4.0s duration max.

---
**AntiGravity Agent Instruction:** When building components in `src/components/ui`, use a wrapper `GlassPanel` component to ensure consistent padding (p-6) and the Liquid Glass tokens defined in Section 2. Use `AnimatePresence` from Framer Motion for the South Dock buttons to handle smooth entrances/exits as they become available.