import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';

interface SidebarRowProps {
    label: string;
    active?: boolean;
    badge?: string;
}

export function SidebarRow({ label, active, badge }: SidebarRowProps) {
    return (
        <motion.div
            whileHover={{ x: 2 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            className={cn(
                'mb-0.5 flex items-center gap-2 rounded px-2 py-1.5 text-[11px]',
                active
                    ? 'bg-navy-800 font-semibold text-white'
                    : 'text-slate-300',
            )}
        >
            <span className="size-2 rounded-full bg-slate-700/40" aria-hidden />
            <span className="flex-1">{label}</span>
            {badge && (
                <span
                    className={cn(
                        'rounded-full px-1.5 text-[9px] font-semibold',
                        active
                            ? 'bg-olive-600 text-white'
                            : 'bg-navy-800 text-slate-400',
                    )}
                >
                    {badge}
                </span>
            )}
        </motion.div>
    );
}
