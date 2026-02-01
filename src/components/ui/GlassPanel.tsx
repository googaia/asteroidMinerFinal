import React from 'react';
import clsx from 'clsx';

interface GlassPanelProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
    children,
    className,
    onClick
}) => {
    return (
        <div
            onClick={onClick}
            className={clsx(
                "backdrop-blur-xl bg-slate-950/40 border border-white/10 rounded-2xl p-6",
                "transition-all duration-300",
                className
            )}
        >
            {children}
        </div>
    );
};
