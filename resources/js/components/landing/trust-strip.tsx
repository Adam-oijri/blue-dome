import { motion, useReducedMotion } from 'framer-motion';

import { BrandWordmark, MARKS } from '@/components/landing/brand-wordmark';
import type { SectionProps } from '@/components/landing/shared/types';

const LOOP = [...MARKS, ...MARKS];

export function TrustStrip({ lang }: SectionProps) {
    const reduced = useReducedMotion();

    return (
        <section className="border-y border-border/40 bg-card/50 backdrop-blur-sm">
            <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.5 }}
                    className="mb-6 text-center text-[11px] font-semibold tracking-wider text-muted-foreground uppercase"
                >
                    {
                        {
                            en: 'Trusted by clinics across Morocco',
                            fr: 'Adopté par des cabinets dans tout le Maroc',
                            ar: 'موثوق به من عيادات في جميع أنحاء المغرب',
                        }[lang]
                    }
                </motion.p>

                <div
                    className="relative overflow-hidden"
                    style={{
                        maskImage:
                            'linear-gradient(90deg, transparent, black 12%, black 88%, transparent)',
                        WebkitMaskImage:
                            'linear-gradient(90deg, transparent, black 12%, black 88%, transparent)',
                    }}
                >
                    {reduced ? (
                        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
                            {MARKS.map((m) => (
                                <BrandWordmark
                                    key={m.name}
                                    name={m.name}
                                    style={m.style}
                                    mark={m.mark}
                                />
                            ))}
                        </div>
                    ) : (
                        <motion.div
                            animate={{ x: ['0%', '-50%'] }}
                            transition={{
                                duration: 36,
                                repeat: Infinity,
                                ease: 'linear',
                            }}
                            className="flex w-max items-center gap-x-12"
                        >
                            {LOOP.map((m, i) => (
                                <BrandWordmark
                                    key={`${m.name}-${i}`}
                                    name={m.name}
                                    style={m.style}
                                    mark={m.mark}
                                />
                            ))}
                        </motion.div>
                    )}
                </div>
            </div>
        </section>
    );
}
