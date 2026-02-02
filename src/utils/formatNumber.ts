export const formatNumber = (num: number, isCurrency: boolean = true): string => {
    const prefix = isCurrency ? '$' : '';
    if (num >= 1_000_000_000_000) {
        return `${prefix}${(num / 1_000_000_000_000).toFixed(2).replace(/\.00$/, '')}t`;
    }
    if (num >= 1_000_000_000) {
        return `${prefix}${(num / 1_000_000_000).toFixed(2).replace(/\.00$/, '')}b`;
    }
    if (num >= 1_000_000) {
        return `${prefix}${(num / 1_000_000).toFixed(2).replace(/\.00$/, '')}m`;
    }
    if (num >= 1_000) {
        return `${prefix}${(num / 1_000).toFixed(2).replace(/\.00$/, '')}k`;
    }
    return `${prefix}${num.toLocaleString()}`;
};
