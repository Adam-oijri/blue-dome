import {
    AnimatePresence,
    motion,
    useScroll,
    useTransform,
} from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ScrollToTopProps {
    label?: string;
}

export function ScrollToTop({ label = 'Back to top' }: ScrollToTopProps) {
    const { scrollY } = useScroll();
    const [visible, setVisible] = useState(false);
    const arrowY = useTransform(scrollY, [0, 400], [12, 0]);

    useEffect(() => {
        const unsubscribe = scrollY.on('change', (v) => {
            setVisible(v > 600);
        });

        return unsubscribe;
    }, [scrollY]);

    const handleClick = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <AnimatePresence>
            {visible && (
                <motion.button
                    type="button"
                    onClick={handleClick}
                    aria-label={label}
                    initial={{ opacity: 0, y: 20, scale: 0.85 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.85 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.92 }}
                    className="fixed end-6 bottom-6 z-50 grid size-11 place-items-center rounded-full bg-navy-900 text-white shadow-lg shadow-navy-900/30 hover:bg-navy-800"
                >
                    <motion.span style={{ y: arrowY }}>
                        <ArrowUp className="size-4" />
                    </motion.span>
                </motion.button>
            )}
        </AnimatePresence>
    );
}
