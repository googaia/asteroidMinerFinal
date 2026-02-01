export const formatNumber = (num: number): string => {
    if (num >= 1_000_000_000_000) {
        return `$${(num / 1_000_000_000_000).toFixed(2).replace(/\.00$/, '')}t`;
    }
    if (num >= 1_000_000_000) {
        return `$${(num / 1_000_000_000).toFixed(2).replace(/\.00$/, '')}b`;
    }
    if (num >= 1_000_000) {
        return `$${(num / 1_000_000).toFixed(2).replace(/\.00$/, '')}m`;
    }
    if (num >= 1_000) {
        return `$${(num / 1_000).toFixed(2).replace(/\.00$/, '')}k`;
    }
    return `$${num.toLocaleString()}`;
};
