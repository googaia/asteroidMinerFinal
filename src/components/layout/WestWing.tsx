import React, { useEffect, useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { formatNumber } from '../../utils/formatNumber';
import { motion, AnimatePresence } from 'framer-motion';
import { THEME } from '../../theme';

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
                                    {formatNumber(inventory.aetherite)}
                                </motion.div>
                                <span className="text-[10px] text-neutral-slate font-mono opacity-80">kg</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
};
