import { motion, useScroll, useSpring } from 'framer-motion';

export function ScrollProgress() {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 220,
        damping: 30,
        mass: 0.3,
        restDelta: 0.001,
    });

    return (
        <motion.div
            style={{ scaleX }}
            aria-hidden
            className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-gradient-to-r from-olive-500 via-navy-700 to-navy-900"
        />
    );
}
