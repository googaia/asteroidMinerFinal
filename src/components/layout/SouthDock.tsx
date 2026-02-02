import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { AnimatePresence, motion } from 'framer-motion';
import { Scan, Rocket, DollarSign } from 'lucide-react';
import clsx from 'clsx';
import { useAudio } from '../../hooks/useAudio';

export const SouthDock: React.FC = () => {
    const {
        research,
        money,
        asteroid,
        launchMiner,
        lastLaunchTime,
        launchCooldown
    } = useGameStore();

    const lastSellTime = useGameStore(s => s.lastSellTime);
    const inventory = useGameStore(s => s.inventory);

    const { playSound } = useAudio();

    const [timeRemaining, setTimeRemaining] = React.useState(0);
    const [sellTimeRemaining, setSellTimeRemaining] = React.useState(0);

    React.useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();

            // Launch Timer
            const diffLaunch = now - lastLaunchTime;
            setTimeRemaining(Math.max(0, launchCooldown - diffLaunch));

            // Sell Timer
            const diffSell = now - lastSellTime;
            setSellTimeRemaining(Math.max(0, 1500 - diffSell));

        }, 50); // Faster update for UI smoothness
        return () => clearInterval(interval);
    }, [lastLaunchTime, launchCooldown, lastSellTime]);

    const showScan = research.scan;
    const showLaunch = research.scan && research.rocket && research.mining && asteroid;
    const showSell = research.market;

    const handleLaunch = () => {
        if (timeRemaining > 0) return;
        playSound('rocket_launch');
        launchMiner();
    };

    const handleSell = () => {
        if (sellTimeRemaining > 0 || inventory.aetherite <= 0) return;
        playSound('click_clean');
        useGameStore.getState().sellAetherite();
    };

    const isCooldown = timeRemaining > 0;
    const isSellCooldown = sellTimeRemaining > 0;
    const hasFunds = money >= 10_000_000;
    const hasAetherite = inventory.aetherite > 0;

    const cooldownProgress = isCooldown ? (timeRemaining / launchCooldown) : 0;
    const sellProgress = isSellCooldown ? (sellTimeRemaining / 1500) : 0;

    const buttons = [
        // ... (Scan button) ...
        {
            id: 'scan',
            label: 'SCAN',
            icon: Scan,
            show: showScan && !asteroid,
            action: () => {
                playSound('click_clean');
                useGameStore.getState().startScan();
            },
            color: 'text-glass-white',
            bg: 'hover:bg-blue-500/20 hover:border-blue-500/30',
            disabled: false
        },
        {
            id: 'launch',
            label: isCooldown
                ? `READY IN ${(timeRemaining / 1000).toFixed(1)}s`
                : (!hasFunds ? 'INSUFFICIENT FUNDS' : 'LAUNCH MINER (-$10M)'),
            icon: Rocket,
            show: showLaunch,
            action: handleLaunch,
            color: (isCooldown || !hasFunds) ? 'text-neutral-slate' : 'text-green-400',
            bg: (isCooldown || !hasFunds) ? 'bg-white/5 cursor-not-allowed' : 'hover:bg-green-500/20 hover:border-green-500/30',
            disabled: isCooldown || !hasFunds
        },
        {
            id: 'sell',
            label: isSellCooldown
                ? 'RECHARGING...'
                : (hasAetherite ? 'SELL 1 ORE' : 'NO ORE'),
            icon: DollarSign,
            show: showSell,
            action: handleSell,
            color: (isSellCooldown || !hasAetherite) ? 'text-neutral-slate' : 'text-green-400',
            bg: (isSellCooldown || !hasAetherite) ? 'bg-white/5 cursor-not-allowed' : 'hover:bg-green-500/20 hover:border-green-500/30',
            disabled: isSellCooldown || !hasAetherite
        }
    ];

    return (
        <div className="pointer-events-auto">
            <motion.div
                layout
                className="flex items-center gap-4 relative"
            >
                <AnimatePresence mode='popLayout'>
                    {buttons.filter(b => b.show).map((btn) => (
                        <motion.button
                            key={btn.id}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            whileHover={!btn.disabled ? { scale: 1.05 } : {}}
                            whileTap={!btn.disabled ? { scale: 0.95 } : {}}
                            onClick={btn.action}
                            disabled={btn.disabled}
                            className={clsx(
                                "relative flex items-center gap-2 px-6 py-3 rounded-full border border-white/5 transition-colors font-mono font-bold text-sm tracking-wider overflow-hidden",
                                btn.color,
                                btn.bg
                            )}
                        >
                            {/* Cooldown Overlay */}
                            {((btn.id === 'launch' && isCooldown) || (btn.id === 'sell' && isSellCooldown)) && (
                                <div
                                    className="absolute inset-0 bg-white/10 z-0 origin-left"
                                    style={{
                                        width: `${(1 - (btn.id === 'launch' ? cooldownProgress : sellProgress)) * 100}%`
                                    }}
                                />
                            )}

                            <div className="relative z-10 flex items-center gap-2">
                                <btn.icon size={16} />
                                {btn.label}
                            </div>
                        </motion.button>
                    ))}
                </AnimatePresence>

                {!showScan && !showLaunch && (
                    <span className="text-neutral-slate/40 font-mono text-xs uppercase tracking-widest">
                        Awaiting Command Protocols...
                    </span>
                )}
            </motion.div>
        </div>
    );
};
