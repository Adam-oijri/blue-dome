import { motion } from 'framer-motion';

import { FADE_UP, STAGGER } from '@/components/landing/shared/animations';
import { STEPS } from '@/components/landing/shared/content';
import type { SectionProps } from '@/components/landing/shared/types';

export function Workflow({ lang }: SectionProps) {
    return (
        <section
            id="workflow"
            className="relative overflow-hidden bg-navy-950 py-24 text-white lg:py-32"
        >
            <motion.div
                animate={{ x: [0, 30, 0], y: [0, -15, 0] }}
                transition={{
                    duration: 22,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
                className="absolute -top-40 -right-20 size-[500px] rounded-full bg-gradient-to-br from-olive-400/20 to-transparent blur-3xl"
                aria-hidden
            />
            <motion.div
                animate={{ x: [0, -25, 0], y: [0, 20, 0] }}
                transition={{
                    duration: 28,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
                className="absolute -bottom-40 -left-20 size-[600px] rounded-full bg-navy-700/30 blur-3xl"
                aria-hidden
            />

            <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
                <motion.div
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.4 }}
                    variants={STAGGER}
                    className="mx-auto max-w-2xl text-center"
                >
                    <motion.p
                        variants={FADE_UP}
                        className="mb-3 text-[12px] font-semibold tracking-wider text-olive-300 uppercase"
                    >
                        {lang === 'fr' ? 'Comment ça marche' : 'How it works'}
                    </motion.p>
                    <motion.h2
                        variants={FADE_UP}
                        className="text-[34px] font-semibold tracking-tight sm:text-[44px]"
                    >
                        {lang === 'fr'
                            ? 'Du premier patient au premier rapport.'
                            : 'From first patient to first report.'}
                    </motion.h2>
                </motion.div>

                <div className="relative mt-16">
                    <motion.svg
                        aria-hidden
                        viewBox="0 0 1000 12"
                        preserveAspectRatio="none"
                        className="pointer-events-none absolute top-1/2 right-0 left-0 hidden h-3 w-full -translate-y-1/2 md:block"
                    >
                        <motion.line
                            x1="80"
                            y1="6"
                            x2="920"
                            y2="6"
                            stroke="rgba(134,158,71,0.45)"
                            strokeWidth="1"
                            strokeDasharray="4 6"
                            initial={{ pathLength: 0 }}
                            whileInView={{ pathLength: 1 }}
                            viewport={{ once: true, amount: 0.4 }}
                            transition={{
                                duration: 1.4,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                        />
                    </motion.svg>

                    <motion.div
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={STAGGER}
                        className="relative grid gap-6 md:grid-cols-3"
                    >
                        {STEPS.map((s) => {
                            const Icon = s.icon;

                            return (
                                <motion.div
                                    key={s.n}
                                    variants={FADE_UP}
                                    whileHover={{ y: -4 }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 280,
                                        damping: 20,
                                    }}
                                    className="relative z-10 overflow-hidden rounded-2xl border border-white/15 bg-navy-950 bg-white/5 p-7 backdrop-blur-sm"
                                >
                                    <div className="absolute top-5 right-5 font-mono text-[13px] font-semibold tracking-widest text-olive-300/80">
                                        {s.n}
                                    </div>
                                    <motion.div
                                        whileHover={{ rotate: 8, scale: 1.08 }}
                                        transition={{
                                            type: 'spring',
                                            stiffness: 280,
                                            damping: 14,
                                        }}
                                        className="grid size-12 place-items-center rounded-xl bg-olive-500/15 text-olive-300"
                                    >
                                        <Icon className="size-5" />
                                    </motion.div>
                                    <h3 className="mt-5 text-[19px] font-semibold tracking-tight">
                                        {s.title[lang]}
                                    </h3>
                                    <p className="mt-2 text-[14px] leading-relaxed text-slate-300">
                                        {s.body[lang]}
                                    </p>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
