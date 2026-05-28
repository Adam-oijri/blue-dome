import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useState } from 'react';

import { FADE_UP } from '@/components/landing/shared/animations';
import { cn } from '@/lib/utils';

interface FaqItemProps {
    question: string;
    answer: string;
    defaultOpen?: boolean;
}

export function FaqItem({
    question,
    answer,
    defaultOpen = false,
}: FaqItemProps) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <motion.div
            variants={FADE_UP}
            className="overflow-hidden rounded-xl border border-border bg-card"
        >
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/40"
            >
                <span className="text-[15px] font-semibold text-navy-900">
                    {question}
                </span>
                <motion.span
                    animate={{ rotate: open ? 45 : 0 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 16 }}
                    className={cn(
                        'grid size-7 shrink-0 place-items-center rounded-full transition-colors',
                        open
                            ? 'bg-olive-600 text-white'
                            : 'bg-muted text-muted-foreground',
                    )}
                >
                    <Plus className="size-3.5" />
                </motion.span>
            </button>
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        key="answer"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                            height: {
                                duration: 0.35,
                                ease: [0.22, 1, 0.36, 1],
                            },
                            opacity: { duration: 0.25 },
                        }}
                        className="overflow-hidden"
                    >
                        <div className="px-5 pb-5 text-[14px] leading-relaxed text-muted-foreground">
                            {answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
