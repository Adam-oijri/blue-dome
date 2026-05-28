import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useRef } from 'react';
import type { ReactNode } from 'react';

interface MagneticButtonProps {
    children: ReactNode;
    strength?: number;
    className?: string;
}

export function MagneticButton({
    children,
    strength = 0.35,
    className,
}: MagneticButtonProps) {
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const springX = useSpring(x, { stiffness: 200, damping: 18, mass: 0.4 });
    const springY = useSpring(y, { stiffness: 200, damping: 18, mass: 0.4 });

    const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = ref.current?.getBoundingClientRect();

        if (!rect) {
            return;
        }

        x.set((e.clientX - (rect.left + rect.width / 2)) * strength);
        y.set((e.clientY - (rect.top + rect.height / 2)) * strength);
    };

    const handleLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMove}
            onMouseLeave={handleLeave}
            style={{ x: springX, y: springY }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
