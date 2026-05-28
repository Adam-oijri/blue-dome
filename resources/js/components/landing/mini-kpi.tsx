import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';

interface MiniKpiProps {
    label: string;
    value: string;
    tone: 'navy' | 'warn' | 'olive';
}

export function MiniKpi({ label, value, tone }: MiniKpiProps) {
    return (
        <motion.div
            whileHover={{ y: -2 }}
            transition={{ type: 'spring', stiffness: 320, damping: 20 }}
            className="rounded-lg border border-border bg-card p-2.5"
        >
            <div className="text-[10px] text-muted-foreground">{label}</div>
            <div
                className={cn(
                    'mt-0.5 text-[15px] font-semibold tabular-nums',
                    tone === 'navy' && 'text-navy-900',
                    tone === 'warn' && 'text-warning',
                    tone === 'olive' && 'text-olive-700',
                )}
            >
                {value}
            </div>
        </motion.div>
    );
}
