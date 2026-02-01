import { create } from 'zustand';
import { generateAsteroid, type AsteroidData } from '../utils/asteroidGenerator';

interface ResearchState {
    scan: boolean;
    rocket: boolean;
    mining: boolean;
    market: boolean;
}

export const RESEARCH_COSTS = {
    scan: 3_000_000,
    rocket: 4_000_000,
    mining: 3_000_000,
    market: 20_000_000, // Base cost
} as const;

export const RESEARCH_RATES = {
    scan: 0.02,
    rocket: 0.01,
    mining: 0.005,
    market: 0.001
} as const;

interface Miner {
    id: string;
    state: 'IDLE' | 'TRANSIT_OUT' | 'MINING' | 'TRANSIT_HOME' | 'UNLOADING';
    position: [number, number, number];
    targetPosition?: [number, number, number];
    miningStartTime?: number;
}

interface GameState {
    money: number;
    inventory: {
        aetherite: number;
    };
    zoomLevel: number;
    research: ResearchState;
    researchActive: Record<keyof ResearchState, boolean>;
    researchProbabilities: Record<keyof ResearchState, number>; // 0.0 to 1.0
    xp: number; // Experience multiplier
    asteroid: AsteroidData | null;

    // Mining Units
    miners: Miner[];
    asteroidsGenerated: number;
    launchCooldown: number; // in milliseconds
    lastLaunchTime: number;

    // Scan System
    isScanning: boolean;
    asteroidRevealed: boolean;
    startScan: () => void;
    revealAsteroid: () => void;
    finalizeScan: () => void;

    // Actions
    setMoney: (amount: number) => void;
    addMoney: (amount: number) => void;
    subtractMoney: (amount: number) => void;
    setZoomLevel: (level: number) => void;

    // Audio System
    masterVolume: number; // 0.0 - 1.0
    musicVolume: number;
    sfxVolume: number;
    isMuted: boolean;
    currentAct: number;

    // Actions
    setVolume: (type: 'master' | 'music' | 'sfx', value: number) => void;
    toggleMute: () => void;
    setAct: (act: number) => void;

    // Research System
    startResearch: (tech: keyof ResearchState) => void;
    tickResearch: (dt: number) => void;
    boostResearch: (tech: keyof ResearchState, amount: number) => void;
    attemptResearch: (tech: keyof ResearchState) => { success: boolean, chance: number };
    gainXp: (amount: number) => void;

    // Simulation
    tickAsteroid: (dt: number) => void;

    // Mining Actions
    launchMiner: () => void;
    updateMinerState: (id: string, newState: Miner['state']) => void;
    depositResources: (amount: number) => void;
    clearAsteroid: () => void;
    sellAetherite: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
    money: 100_000_000,
    inventory: {
        aetherite: 0,
    },
    zoomLevel: 1.0,
    research: {
        scan: false,
        rocket: false,
        mining: false,
        market: false,
    },
    researchActive: {
        scan: false,
        rocket: false,
        mining: false,
        market: false,
    },
    researchProbabilities: {
        scan: 0.0,
        rocket: 0.0,
        mining: 0.0,
        market: 0.0,
    },
    xp: 0,
    asteroid: null,
    asteroidsGenerated: 0,
    miners: [],
    launchCooldown: 5000, // 5 seconds default
    lastLaunchTime: 0,

    // Scan System
    isScanning: false,
    asteroidRevealed: false,
    startScan: () => set(state => {
        const nextCount = state.asteroidsGenerated + 1;
        return {
            isScanning: true,
            asteroidRevealed: false,
            asteroidsGenerated: nextCount,
            asteroid: generateAsteroid(nextCount)
        };
    }),
    revealAsteroid: () => set({ asteroidRevealed: true }),
    finalizeScan: () => set({ isScanning: false }),

    // Audio Defaults
    masterVolume: 0.5,
    musicVolume: 0.4,
    sfxVolume: 0.6,
    isMuted: false,
    currentAct: 1,

    setVolume: (type, value) => set(() => {
        const key = `${type}Volume` as keyof GameState;
        return { [key]: Math.max(0, Math.min(1, value)) };
    }),

    toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

    setAct: (act) => set({ currentAct: act }),

    setMoney: (amount) => set({ money: amount }),
    addMoney: (amount) => set((state) => ({ money: state.money + amount })),
    subtractMoney: (amount) => set((state) => ({ money: state.money - amount })),
    setZoomLevel: (level) => set({ zoomLevel: level }),

    gainXp: (amount) => set(state => ({ xp: state.xp + amount })),

    startResearch: (tech) => set(state => {
        if (state.research[tech] || state.researchActive[tech]) return {};
        const cost = RESEARCH_COSTS[tech];
        if (state.money < cost) return {};

        return {
            money: state.money - cost,
            researchActive: { ...state.researchActive, [tech]: true },
            researchProbabilities: { ...state.researchProbabilities, [tech]: 0.0 } // Start at 0
        };
    }),

    tickResearch: (dt) => set(state => {
        const xpMult = 1 + (state.xp * 0.05); // Buffed XP
        const newProbs = { ...state.researchProbabilities };
        let changed = false;

        (Object.keys(newProbs) as Array<keyof ResearchState>).forEach(key => {
            // Only tick if Active and Not Completed
            if (state.researchActive[key] && !state.research[key]) {
                const baseRate = RESEARCH_RATES[key];
                const oldVal = newProbs[key];
                newProbs[key] = Math.min(1.0, newProbs[key] + (baseRate * xpMult * dt));
                if (newProbs[key] !== oldVal) changed = true;
            }
        });

        return changed ? { researchProbabilities: newProbs } : {};
    }),

    tickAsteroid: (dt) => set(state => {
        if (!state.asteroid) return {};

        const { a, e, speed, theta } = state.asteroid.orbit;

        // Keplerian Integration
        const r = (a * (1 - e * e)) / (1 + e * Math.cos(theta));
        const k = speed * (a * a);
        const dTheta = (k / (r * r)) * dt;

        return {
            asteroid: {
                ...state.asteroid,
                orbit: {
                    ...state.asteroid.orbit,
                    theta: theta + dTheta
                }
            }
        };
    }),

    boostResearch: (tech, amount) => set(state => {
        if (!state.researchActive[tech]) return {}; // Can only boost active projects
        if (state.money < amount) return {};
        const boostAmount = (amount / 1_000_000) * 0.1; // $1M = +10%
        const newProb = Math.min(1.0, state.researchProbabilities[tech] + boostAmount);
        return {
            money: state.money - amount,
            researchProbabilities: {
                ...state.researchProbabilities,
                [tech]: newProb
            }
        };
    }),

    attemptResearch: (tech) => {
        const state = get();
        // If not active, trying to attempt means we haven't paid.
        // But UI should handle that. 
        // If active, we check chance.

        if (!state.researchActive[tech]) return { success: false, chance: 0 };

        const chance = state.researchProbabilities[tech];

        // Roll
        const roll = Math.random();
        const success = roll < chance;

        const newState: Partial<GameState> = {};

        if (success) {
            newState.research = { ...state.research, [tech]: true };
            newState.researchActive = { ...state.researchActive, [tech]: false };

            // Side Effects
            if (tech === 'scan') {
                // Trigger Scan Animation instead of immediate spawn
                // We'll set immediate state update here, but we also want to trigger the scan.
                // We can't call 'set' twice securely in one go without merging, so we return the merged object.
                // But startScan logic is simple: isScanning: true.
                (newState as any).isScanning = true;
                // Note: The asteroid generation will happen after animation via finalizeScan
            }
        } else {
            // Failure penalty: Project scrapped.
            // Reset probability to 0. Active set to false (must pay cost again).
            newState.researchActive = { ...state.researchActive, [tech]: false };
            newState.researchProbabilities = { ...state.researchProbabilities, [tech]: 0.0 };
        }

        set(newState as any);
        return { success, chance };
    },

    launchMiner: () => {
        const state = get();
        const now = Date.now();
        const LAUNCH_COST = 10_000_000;

        // COOLDOWN CHECK
        if (now - state.lastLaunchTime < state.launchCooldown) return;

        // TECH CHECK (Must have all 3)
        if (!state.research.scan || !state.research.rocket || !state.research.mining) return;

        // ASTEROID CHECK
        if (!state.asteroid || state.asteroid.status === 'DEPLETED') return;

        // FUNDS CHECK
        if (state.money < LAUNCH_COST) return;

        // Create new miner
        const newMiner: Miner = {
            id: crypto.randomUUID(),
            state: 'TRANSIT_OUT',
            position: [0, 0, 0],
            targetPosition: [0, 0, 0],
        };

        set((state) => ({
            money: state.money - LAUNCH_COST,
            miners: [...state.miners, newMiner],
            lastLaunchTime: now,
            xp: state.xp + 5 // +5 XP per launch
        }));
    },

    updateMinerState: (id, newState) => {
        set((state) => ({
            miners: state.miners.map((m) =>
                m.id === id ? { ...m, state: newState } : m
            ),
        }));
        // Cleanup if finished (optional, or keep for tracking)
        if (newState === 'IDLE') {
            set((state) => ({
                miners: state.miners.filter(m => m.id !== id)
            }));
        }
    },

    depositResources: (amount) => {
        const state = get();
        // Requirement: Scan, Rocket, AND Mining must be unlocked to collect ore
        if (state.research.scan && state.research.rocket && state.research.mining) {

            const currentAsteroid = state.asteroid;
            let newAsteroidState = currentAsteroid;

            if (currentAsteroid) {
                const remaining = Math.max(0, currentAsteroid.aetherite - amount);
                newAsteroidState = {
                    ...currentAsteroid,
                    aetherite: remaining,
                    status: remaining <= 0 ? 'DEPLETED' : 'ACTIVE'
                };
            }

            set((state) => ({
                inventory: {
                    ...state.inventory,
                    aetherite: state.inventory.aetherite + amount
                },
                asteroid: newAsteroidState
            }));
        }
    },

    clearAsteroid: () => {
        set({ asteroid: null });
    },

    sellAetherite: () => {
        const state = get();
        const amount = state.inventory.aetherite;
        if (amount <= 0) return;

        const PRICE_PER_UNIT = 15_000; // Market Rate
        const revenue = amount * PRICE_PER_UNIT;

        set((state) => ({
            money: state.money + revenue,
            inventory: { ...state.inventory, aetherite: 0 }
        }));
    }
}));
