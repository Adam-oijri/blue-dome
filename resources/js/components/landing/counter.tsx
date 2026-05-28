import { animate, useInView, useMotionValue } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

interface CounterProps {
    target: number;
    suffix?: string;
    decimals?: number;
}

export function Counter({ target, suffix = '', decimals = 0 }: CounterProps) {
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true, amount: 0.5 });
    const value = useMotionValue(0);
    const [display, setDisplay] = useState('0');

    useEffect(() => {
        const unsubscribe = value.on('change', (latest) => {
            setDisplay(
                latest.toLocaleString('en-US', {
                    minimumFractionDigits: decimals,
                    maximumFractionDigits: decimals,
                }),
            );
        });

        return unsubscribe;
    }, [value, decimals]);

    useEffect(() => {
        if (!inView) {
            return;
        }

        const controls = animate(value, target, {
            duration: 1.6,
            ease: [0.22, 1, 0.36, 1],
        });

        return () => controls.stop();
    }, [inView, target, value]);

    return (
        <span
            ref={ref}
            className="text-[40px] font-semibold tracking-tight text-navy-950 tabular-nums sm:text-[48px]"
        >
            {display}
            <span className="text-olive-600">{suffix}</span>
        </span>
    );
}
