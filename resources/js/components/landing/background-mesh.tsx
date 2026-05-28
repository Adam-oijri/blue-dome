import {
    motion,
    useMotionValue,
    useReducedMotion,
    useScroll,
    useSpring,
    useTransform,
} from 'framer-motion';
import { useEffect } from 'react';

/**
 * Scroll + cursor reactive aurora behind the landing. Two soft blur orbs
 * drift on scroll parallax and gently follow the pointer with spring-damped
 * motion. Falls back to the original static mesh when prefers-reduced-motion
 * is on.
 */
export function BackgroundMesh() {
    const reduced = useReducedMotion();
    const { scrollY } = useScroll();

    const mx = useMotionValue(0);
    const my = useMotionValue(0);

    // Soft spring for the cursor — heavy enough to feel like a balloon, not
    // jittery. Same vocabulary as magnetic-button.tsx and dashboard-mockup.tsx.
    const spring = { stiffness: 50, damping: 18, mass: 1 } as const;
    const cursorX = useSpring(mx, spring);
    const cursorY = useSpring(my, spring);

    // Each orb gets a scroll-driven Y drift and a cursor-driven offset.
    // Opposing direction on the two orbs so they pull apart as you scroll
    // and as the cursor moves — feels alive without being noisy.
    const oliveScrollY = useTransform(scrollY, [0, 800], [0, 80]);
    const navyScrollY = useTransform(scrollY, [0, 800], [0, -80]);

    const oliveCursorX = useTransform(cursorX, (v) => v * 60);
    const oliveCursorY = useTransform(cursorY, (v) => v * 40);
    const navyCursorX = useTransform(cursorX, (v) => v * -50);
    const navyCursorY = useTransform(cursorY, (v) => v * -30);

    const oliveY = useTransform(
        [oliveCursorY, oliveScrollY] as const,
        ([cursor, scroll]: number[]) => cursor + scroll,
    );
    const navyY = useTransform(
        [navyCursorY, navyScrollY] as const,
        ([cursor, scroll]: number[]) => cursor + scroll,
    );

    useEffect(() => {
        if (reduced || typeof window === 'undefined') {
            return;
        }

        const onMove = (event: PointerEvent): void => {
            // Normalise to [-1, 1] so the multipliers above produce a bounded
            // pixel offset regardless of viewport size.
            mx.set(event.clientX / window.innerWidth - 0.5);
            my.set(event.clientY / window.innerHeight - 0.5);
        };

        window.addEventListener('pointermove', onMove, { passive: true });

        return () => {
            window.removeEventListener('pointermove', onMove);
        };
    }, [mx, my, reduced]);

    if (reduced) {
        return (
            <div
                aria-hidden
                className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-olive-100/40 via-background to-navy-50/30" />
                <div className="absolute -top-40 -right-32 size-[520px] rounded-full bg-olive-300/40 blur-[120px]" />
                <div className="bg-navy-300/30 absolute top-[40%] -left-32 size-[480px] rounded-full blur-[140px]" />
            </div>
        );
    }

    return (
        <div
            aria-hidden
            className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
        >
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.6 }}
                className="absolute inset-0 bg-gradient-to-br from-olive-100/40 via-background to-navy-50/30"
            />
            <motion.div
                style={{ x: oliveCursorX, y: oliveY }}
                className="absolute -top-40 -right-32 size-[520px] rounded-full bg-olive-300/40 blur-[120px]"
            />
            <motion.div
                style={{ x: navyCursorX, y: navyY }}
                className="bg-navy-300/30 absolute top-[40%] -left-32 size-[480px] rounded-full blur-[140px]"
            />
        </div>
    );
}
