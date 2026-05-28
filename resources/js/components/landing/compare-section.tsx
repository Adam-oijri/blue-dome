import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

import { FADE_UP, STAGGER } from '@/components/landing/shared/animations';
import { COMPARE_ROWS } from '@/components/landing/shared/content';
import type { SectionProps } from '@/components/landing/shared/types';

export function CompareSection({ lang }: SectionProps) {
    return (
        <section className="py-24 lg:py-32">
            <div className="mx-auto max-w-6xl px-6 lg:px-10">
                <motion.div
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.4 }}
                    variants={STAGGER}
                    className="mx-auto max-w-2xl text-center"
                >
                    <motion.p
                        variants={FADE_UP}
                        className="mb-3 text-[12px] font-semibold tracking-wider text-olive-700 uppercase"
                    >
                        {lang === 'fr' ? 'Avant · Après' : 'Before · After'}
                    </motion.p>
                    <motion.h2
                        variants={FADE_UP}
                        className="text-[34px] font-semibold tracking-tight text-navy-950 sm:text-[44px]"
                    >
                        {lang === 'fr'
                            ? 'L’ancienne méthode ne tient plus.'
                            : 'The old way doesn’t scale anymore.'}
                    </motion.h2>
                    <motion.p
                        variants={FADE_UP}
                        className="mt-3 text-[15px] text-muted-foreground"
                    >
                        {lang === 'fr'
                            ? 'Voici ce qui change concrètement dans la journée de votre secrétariat.'
                            : 'Here’s what actually changes in your front desk’s day.'}
                    </motion.p>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={STAGGER}
                    className="mt-14 overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm"
                >
                    <div className="grid grid-cols-1 bg-muted/40 px-6 py-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase md:grid-cols-[1fr_1fr_1fr]">
                        <span>{lang === 'fr' ? 'La tâche' : 'The task'}</span>
                        <span className="hidden md:block">
                            {lang === 'fr'
                                ? 'L’ancienne méthode'
                                : 'The old way'}
                        </span>
                        <span className="hidden md:block">Blue Dome</span>
                    </div>
                    {COMPARE_ROWS.map((row, i) => (
                        <motion.div
                            key={row.label.en}
                            variants={FADE_UP}
                            className="grid grid-cols-1 gap-4 border-t border-border/70 px-6 py-5 md:grid-cols-[1fr_1fr_1fr] md:items-center"
                        >
                            <div className="text-[14px] font-semibold text-navy-900">
                                {row.label[lang]}
                            </div>
                            <div className="flex items-start gap-2 text-[13px] leading-relaxed text-muted-foreground">
                                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-danger-soft text-danger">
                                    <X className="size-3" />
                                </span>
                                <span>{row.old[lang]}</span>
                            </div>
                            <div className="flex items-start gap-2 text-[13px] leading-relaxed font-medium text-navy-900">
                                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-olive-100 text-olive-700">
                                    <Check className="size-3" />
                                </span>
                                <span>{row.blueDome[lang]}</span>
                            </div>
                            {i === COMPARE_ROWS.length - 1 ? null : null}
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
