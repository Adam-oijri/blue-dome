import { motion } from 'framer-motion';

import { Counter } from '@/components/landing/counter';
import { FADE_UP, STAGGER } from '@/components/landing/shared/animations';
import { STATS } from '@/components/landing/shared/content';
import type { SectionProps } from '@/components/landing/shared/types';

export function StatsBand({ lang }: SectionProps) {
    return (
        <section className="py-20">
            <div className="mx-auto max-w-7xl px-6 lg:px-10">
                <motion.div
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.3 }}
                    variants={STAGGER}
                    className="grid gap-px overflow-hidden rounded-2xl border-border/60 bg-border/60 shadow-sm sm:grid-cols-2 lg:grid-cols-4"
                >
                    {STATS.map((s) => (
                        <motion.div
                            key={s.label.en}
                            variants={FADE_UP}
                            className="flex flex-col items-center justify-center bg-card p-8 text-center"
                        >
                            <Counter
                                target={s.value}
                                suffix={s.suffix}
                                decimals={s.value % 1 !== 0 ? 1 : 0}
                            />
                            <div className="mt-2 text-[13px] text-muted-foreground">
                                {s.label[lang]}
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
