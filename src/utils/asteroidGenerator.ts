export interface AsteroidData {
    id: string;
    name: string;
    aetherite: number;
    orbit: {
        a: number; // semi-major axis (distance from Earth)
        e: number; // eccentricity (0 = circle, < 1 = ellipse)
        theta: number; // current angle in radians
        speed: number; // orbital speed multiplier
    };
    status: 'ACTIVE' | 'DEPLETED';
}

export const generateAsteroid = (generationCount: number = 1): AsteroidData => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const letter = letters.charAt(Math.floor(Math.random() * letters.length));
    const number = Math.floor(Math.random() * 900) + 100; // 100-999
    const name = `${letter}-${number}`;

    // Resource Scaling Logic
    let minRes = 500;
    let maxRes = 1000;
    let distScale = 1.0;

    if (generationCount === 1) {
        minRes = 500; maxRes = 1000; distScale = 1.0;
    } else if (generationCount <= 5) {
        minRes = 1000; maxRes = 2500; distScale = 1.5;
    } else if (generationCount <= 10) {
        minRes = 2500; maxRes = 5000; distScale = 2.0;
    } else {
        // Exponential
        const exponent = generationCount - 10;
        minRes = 5000 * Math.pow(1.15, exponent);
        maxRes = minRes * 1.5;
        distScale = 2.5 + (exponent * 0.1); // Gradual distance increase
    }

    const aetherite = Math.floor(minRes + Math.random() * (maxRes - minRes));

    // Orbit Scaling
    const baseA = 3 + Math.random() * 2;
    const a = baseA * distScale;

    // Eccentricity
    const e = 0.2 + Math.random() * 0.3;
    const theta = Math.random() * Math.PI * 2;

    // Keep speed readable
    const speed = (0.2 + Math.random() * 0.3) * (Math.random() > 0.5 ? 1 : -1);

    return {
        id: crypto.randomUUID(),
        name,
        aetherite,
        orbit: {
            a,
            e,
            theta,
            speed,
        },
        status: 'ACTIVE',
    };
};
