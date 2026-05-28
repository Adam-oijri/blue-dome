import { motion } from 'framer-motion';

interface ScrollCueProps {
    label: string;
}

export function ScrollCue({ label }: ScrollCueProps) {
    return (
        <motion.a
            href="#features"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.6 }}
            className="mt-12 flex flex-col items-center gap-2 text-[11px] tracking-[0.2em] text-muted-foreground uppercase transition-colors hover:text-foreground"
        >
            <span>{label}</span>
            <motion.span
                aria-hidden
                animate={{ y: [0, 6, 0], opacity: [0.4, 1, 0.4] }}
                transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
                className="inline-flex h-6 w-px overflow-hidden border-muted-foreground/40 bg-gradient-to-b from-transparent via-current to-transparent"
            />
        </motion.a>
    );
}
