import { motion } from 'framer-motion';

const STYLES = {
    serif: 'font-serif text-[18px] font-semibold tracking-tight italic',
    bold: 'font-sans text-[15px] font-extrabold tracking-[0.18em] uppercase',
    mono: 'font-mono text-[14px] tracking-tight',
    rounded: 'font-sans text-[16px] font-bold tracking-tight',
    thin: 'font-sans text-[16px] font-light tracking-[0.05em]',
    display: 'font-sans text-[17px] font-black tracking-[-0.02em] uppercase',
} as const;

const MARKS: { name: string; style: keyof typeof STYLES; mark?: string }[] = [
    { name: 'Cabinet Lahlou', style: 'serif', mark: '✦' },
    { name: 'CHEIKH ZAID', style: 'bold' },
    { name: 'Polyclinique Atlas', style: 'rounded', mark: '◐' },
    { name: 'biocenter', style: 'mono', mark: '○' },
    { name: 'PASTEUR · MA', style: 'display' },
    { name: 'Idrissi Médical', style: 'thin', mark: '◇' },
];

export function BrandWordmark({
    name,
    style,
    mark,
}: {
    name: string;
    style: keyof typeof STYLES;
    mark?: string;
}) {
    return (
        <motion.span
            whileHover={{
                color: 'rgb(15 30 54 / 0.85)',
                scale: 1.04,
            }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-muted-foreground/60 transition-colors hover:text-navy-900"
        >
            {mark && (
                <span className="text-[14px] text-olive-600/70" aria-hidden>
                    {mark}
                </span>
            )}
            <span className={STYLES[style]}>{name}</span>
        </motion.span>
    );
}

export { MARKS };
