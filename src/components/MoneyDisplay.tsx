import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { formatNumber } from '../utils/formatNumber';

export const MoneyDisplay: React.FC = () => {
    const money = useGameStore((state) => state.money);

    return (
        <div className="fixed top-4 right-6 z-50 pointer-events-none">
            <div
                className="backdrop-blur-xl bg-white/5 border border-white/20 p-4 rounded-lg shadow-[0_0_15px_rgba(255,255,255,0.05)]"
            >
                <div className="text-neutral-slate text-xs uppercase tracking-widest mb-1 font-mono">
                    Funds Available
                </div>
                <div className="text-glass-white text-3xl font-bold font-mono tracking-wide text-shadow-sm">
                    {formatNumber(money)}
                </div>
            </div>
        </div>
    );
};
