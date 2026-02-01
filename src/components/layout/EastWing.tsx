import React, { useState } from 'react';
import { useGameStore, RESEARCH_COSTS, RESEARCH_RATES } from '../../store/useGameStore';
import { formatNumber } from '../../utils/formatNumber';
import { Microscope, Rocket, Box, DollarSign } from 'lucide-react';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { useAudio } from '../../hooks/useAudio';

export const EastWing: React.FC = () => {
    const { money, research, researchActive, researchProbabilities, attemptResearch, startResearch, boostResearch, inventory } = useGameStore();
    const [lastResult, setLastResult] = useState<Record<string, 'success' | 'fail' | 'idle'>>({});
    const { playSound } = useAudio();

    const handleAttempt = (id: string) => {
        playSound('click_clean');
        const { success } = attemptResearch(id as any);

        if (success) {
            if (id === 'scan') {
                useGameStore.getState().startScan();
            }
        }

        setLastResult(prev => ({ ...prev, [id]: success ? 'success' : 'fail' }));
        setTimeout(() => setLastResult(prev => ({ ...prev, [id]: 'idle' })), 2000);
    };

    const handleStart = (id: string) => {
        playSound('click_clean');
        startResearch(id as any);
    };

    const handleBoost = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        playSound('click_clean');
        boostResearch(id as any, 1_000_000); // Boost $1M flat
    };

    const getProgressBarColor = (prob: number) => {
        if (prob >= 1.0) return 'bg-green-400';
        if (prob >= 0.8) return 'bg-gradient-to-r from-yellow-400 to-green-400';
        if (prob >= 0.3) return 'bg-gradient-to-r from-red-500 to-yellow-400';
        return 'bg-red-500';
    };

    const upgrades = [
        {
            id: 'scan',
            name: 'Scan Tech',
            icon: Microscope,
            cost: RESEARCH_COSTS.scan,
            description: 'Long-range sensors.',
            unlocked: research.scan,
            visible: !research.scan // Show until done
        },
        {
            id: 'rocket',
            name: 'Rocket Tech',
            icon: Rocket,
            cost: RESEARCH_COSTS.rocket,
            description: 'Interception thrusters.',
            unlocked: research.rocket,
            visible: research.scan && !research.rocket // Show only after Scan is done
        },
        {
            id: 'mining',
            name: 'Mining Tech',
            icon: Box,
            cost: RESEARCH_COSTS.mining,
            description: 'Extraction drones.',
            unlocked: research.mining,
            visible: research.rocket && !research.mining // Show only after Rocket is done
        },
        {
            id: 'market',
            name: 'Offworld Trading',
            icon: DollarSign,
            cost: RESEARCH_COSTS.market,
            description: 'Sell Aetherite.',
            unlocked: research.market,
            visible: research.mining && inventory.aetherite > 0 && !research.market // Existing + Mining req
        }
    ];

    return (
        <div className="flex flex-col gap-4 h-full pointer-events-auto items-end pr-4 pt-4">
            <div className="flex flex-col gap-3 w-full max-w-[280px]">
                <h3 className="text-neutral-slate text-[8px] md:text-[10px] uppercase tracking-[0.2em] font-mono mb-0 text-right opacity-80 shadow-black drop-shadow-md">
                    R&D Division (Probabilistic)
                </h3>

                <div className="flex flex-col gap-2 overflow-y-auto pr-1">
                    <AnimatePresence>
                        {upgrades
                            .filter(u => u.visible)
                            .map((upgrade) => {
                                const id = upgrade.id as keyof typeof RESEARCH_COSTS;
                                const canAfford = money >= upgrade.cost;
                                const Icon = upgrade.icon;
                                const isActive = researchActive[id];
                                const probability = researchProbabilities[id] || 0;
                                const result = lastResult[id];
                                const canAffordBoost = money >= 1_000_000;
                                const isReady = probability >= 1.0;

                                return (
                                    <motion.div
                                        key={upgrade.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className={clsx(
                                            "relative p-3 rounded-xl border transition-all duration-300 w-full bg-white/5 border-white/5",
                                            result === 'fail' && "border-red-500/50 bg-red-500/10 animate-shake",
                                            isActive && isReady && "border-green-400 shadow-[0_0_10px_rgba(74,222,128,0.2)] bg-green-500/5",
                                            isActive && !isReady && "border-aetherite/30"
                                        )}
                                    >
                                        {/* Header & Stats - Compact */}
                                        <div className="flex justify-between items-center mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className={clsx("p-2 rounded-lg text-glass-white transition-colors", isActive ? "bg-white/10" : "bg-white/5")}>
                                                    <Icon size={16} className={clsx(isActive && "text-aetherite animate-pulse")} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-sans font-bold text-sm text-glass-white leading-none mb-0.5">{upgrade.name}</span>
                                                    {!isActive && (
                                                        <span className="font-mono text-[10px] text-neutral-slate">{formatNumber(upgrade.cost)}</span>
                                                    )}
                                                    {isActive && (
                                                        <div className="flex items-center gap-2">
                                                            <span className={clsx("font-mono text-[10px] font-bold",
                                                                probability >= 0.8 ? "text-green-400" :
                                                                    probability >= 0.3 ? "text-yellow-400" : "text-red-400"
                                                            )}>
                                                                {(probability * 100).toFixed(1)}%
                                                            </span>
                                                            {!isReady && (
                                                                <span className="font-mono text-[9px] opacity-60 text-aetherite">
                                                                    +{(RESEARCH_RATES[id] * (1 + useGameStore.getState().xp * 0.05) * 100).toFixed(1)}%/s
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Progress Bar - Slim & Integrated */}
                                        {isActive && (
                                            <div className="relative h-1 w-full bg-white/5 rounded-full overflow-hidden mb-3">
                                                <motion.div
                                                    className={clsx("h-full absolute left-0 top-0", isReady ? "bg-green-400 shadow-[0_0_10px_#4ade80]" : getProgressBarColor(probability))}
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${probability * 100}%` }}
                                                    transition={{ type: "spring", stiffness: 50 }}
                                                />
                                            </div>
                                        )}

                                        {/* Actions - Modern & streamlined */}
                                        <div className="flex gap-2">
                                            {isActive ? (
                                                <>
                                                    {!isReady && (
                                                        <button
                                                            onClick={(e) => handleBoost(upgrade.id, e)}
                                                            disabled={!canAffordBoost}
                                                            className={`
                                                                px-3 py-1.5 rounded-full border transition-all flex items-center justify-center gap-1.5
                                                                ${canAffordBoost
                                                                    ? 'bg-aetherite/10 hover:bg-aetherite/20 border-aetherite/30 text-aetherite hover:shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                                                                    : 'bg-white/5 border-white/5 text-white/10 cursor-not-allowed'}
                                                            `}
                                                            title="Boost Research ($1M)"
                                                        >
                                                            <DollarSign size={12} strokeWidth={3} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleAttempt(upgrade.id)}
                                                        className={`
                                                            flex-1 py-1.5 rounded-full text-[10px] font-bold tracking-wider border transition-all
                                                            ${result === 'fail'
                                                                ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse'
                                                                : isReady
                                                                    ? 'bg-green-500/20 border-green-400 text-green-300 shadow-[0_0_15px_rgba(74,222,128,0.3)]'
                                                                    : probability >= 0.8
                                                                        ? 'bg-gradient-to-r from-yellow-500/10 to-green-500/10 border-green-400/30 text-green-200'
                                                                        : probability >= 0.3
                                                                            ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-200'
                                                                            : 'bg-red-500/10 border-red-500/30 text-red-300'}
                                                        `}
                                                    >
                                                        {result === 'fail' ? 'FAILED' : (isReady ? 'BREAKTHROUGH' : 'RISK IT')}
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    onClick={() => handleStart(upgrade.id)}
                                                    disabled={!canAfford}
                                                    className={`
                                                        w-full py-2 rounded-full text-[10px] font-bold tracking-wider border transition-all
                                                        ${canAfford
                                                            ? 'bg-white/5 hover:bg-white/10 border-white/20 text-white hover:border-white/40'
                                                            : 'bg-transparent border-white/5 text-white/10 cursor-not-allowed'}
                                                    `}
                                                >
                                                    START PROJECT
                                                </button>
                                            )}
                                        </div>

                                        {result === 'fail' && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[1px] rounded-xl pointer-events-none">
                                                <span className="text-red-500 font-bold font-mono text-sm tracking-widest">PROTOYPE EXPLODED</span>
                                            </div>
                                        )}

                                    </motion.div>
                                );
                            })}
                    </AnimatePresence>

                    {upgrades.every(u => u.unlocked || (u.visible === false && !u.unlocked)) && (
                        <div className="text-neutral-slate text-[10px] md:text-xs font-mono text-center py-2 opacity-50 whitespace-nowrap">
                            RD QUEUE EMPTY
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
