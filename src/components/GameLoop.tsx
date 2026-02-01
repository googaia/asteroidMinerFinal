import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../store/useGameStore';

export const GameLoop = () => {
    const tickAsteroid = useGameStore(state => state.tickAsteroid);
    const tickResearch = useGameStore(state => state.tickResearch);

    useFrame((_, delta) => {
        tickAsteroid(delta);
        tickResearch(delta);
    });

    return null;
};
