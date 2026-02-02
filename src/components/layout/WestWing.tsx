import React, { useEffect, useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { formatNumber } from '../../utils/formatNumber';
import { motion, AnimatePresence } from 'framer-motion';
import { THEME } from '../../theme';

const SparkChart = () => {
    const history = useGameStore(s => s.priceHistory);
    // Safe access
    if (!history || history.length < 2) return null;

    const min = Math.min(...history);
    const max = Math.max(...history);
    const range = max - min || 1;

    const points = history.map((val, i) => {
        const x = (i / (history.length - 1)) * 100;
        const y = 100 - ((val - min) / range) * 100;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
            <polyline
                points={points}
                fill="none"
                stroke="#4ade80"
                strokeWidth="4"
                vectorEffect="non-scaling-stroke"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* Gradient Fill */}
            <path d={`M 0 100 L 0 ${100 - ((history[0] - min) / range) * 100} ${points.replace(/,/g, ' ')} L 100 100 Z`} fill="url(#gradient)" opacity="0.2" />
            <defs>
                <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#4ade80" />
                    <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
                </linearGradient>
            </defs>
        </svg>
    );
};

export const WestWing: React.FC = () => {
    const { money, inventory } = useGameStore();
    const hasAetherite = inventory.aetherite > 0;

    // Pulse animation key
    const [pulseKey, setPulseKey] = useState(0);

    useEffect(() => {
        if (inventory.aetherite > 0) {
            setPulseKey(prev => prev + 1);
        }
    }, [inventory.aetherite]);

    return (
        <div className="flex flex-col gap-4 h-full pointer-events-auto items-start">
            {/* Financials & Resources Panel */}
            <div className="w-fit min-w-[160px] p-2 transition-all flex flex-col gap-3">

                {/* Total Funds */}
                <div>
                    <h3 className="text-neutral-slate text-[10px] uppercase tracking-[0.2em] font-mono mb-0.5 opacity-80">
                        Total Funds
                    </h3>
                    <div className="text-3xl text-glass-white font-mono font-bold tracking-tight leading-none shadow-black drop-shadow-lg">
                        {formatNumber(money)}
                    </div>
                </div>

                {/* Aetherite Resource Display */}
                <AnimatePresence>
                    {hasAetherite && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, y: -5 }}
                            animate={{ opacity: 1, height: 'auto', y: 0 }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex flex-col mt-1"
                        >
                            <h3 className="text-neutral-slate text-[10px] uppercase tracking-[0.2em] font-mono mb-0.5 opacity-80">
                                Aetherite
                            </h3>
                            <div className="flex items-baseline gap-1">
                                <motion.div
                                    key={pulseKey}
                                    initial={{ scale: 1.1, textShadow: `0 0 10px ${THEME.colors.aetherite}` }}
                                    animate={{ scale: 1, textShadow: "0 0 0px transparent" }}
                                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                    className="text-2xl font-mono font-bold leading-none shadow-black drop-shadow-lg"
                                    style={{ color: THEME.colors.aetherite }}
                                >
                                    {formatNumber(inventory.aetherite, false)}
                                </motion.div>
                                <span className="text-[10px] text-neutral-slate font-mono opacity-80">kg</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Market Ticker */}
                <AnimatePresence>
                    {useGameStore(s => s.research.market) && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="flex flex-col mt-2 pt-2 border-t border-white/5"
                        >
                            <div className="flex justify-between items-center w-full">
                                <div className="flex flex-col">
                                    <span className="text-white text-xs font-bold tracking-tight">AETHERITE</span>
                                    <span className="text-[9px] text-neutral-slate uppercase tracking-wide opacity-60">Market Price</span>
                                </div>

                                {/* Spark Chart */}
                                <div className="flex-1 px-4 h-8 flex items-center justify-center opacity-80">
                                    <SparkChart />
                                </div>

                                <div className="flex flex-col items-end">
                                    <span className="text-glass-white font-mono font-bold text-sm">
                                        {formatNumber(useGameStore(s => s.aetheritePrice || 1000000))}
                                    </span>
                                    <div className="bg-green-500/20 px-1.5 py-0.5 rounded text-[9px] text-green-400 font-bold font-mono flex items-center gap-1">
                                        +{(useGameStore(s => 1.5 - s.marketSaturation) * 100 - 100).toFixed(1)}%
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
};
