/** @type {import('tailwindcss').Config} */
import { THEME } from './src/theme';

export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'space-black': THEME.colors.spaceBlack,
                'glass-white': THEME.colors.glassWhite,
                'aetherite': THEME.colors.aetherite,
                'warning-red': THEME.colors.warningRed,
                'neutral-slate': THEME.colors.neutralSlate,
            },
            fontFamily: {
                orbitron: ['Orbitron', 'sans-serif'],
                mono: ['"JetBrains Mono"', 'monospace'],
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
            },
        },
    },
    plugins: [],
}
