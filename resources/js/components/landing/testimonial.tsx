import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useEffect, useState } from 'react';

import { TESTIMONIALS } from '@/components/landing/shared/content';
import type { SectionProps } from '@/components/landing/shared/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ROTATE_MS = 7000;

export function Testimonial({ lang }: SectionProps) {
    const [index, setIndex] = useState(0);
    const [paused, setPaused] = useState(false);

    useEffect(() => {
        if (paused) {
            return;
        }

        const id = setInterval(() => {
            setIndex((i) => (i + 1) % TESTIMONIALS.length);
        }, ROTATE_MS);

        return () => clearInterval(id);
    }, [paused]);

    const current = TESTIMONIALS[index];

    return (
        <section
            id="stories"
            className="py-24 lg:py-32"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            <div className="mx-auto max-w-4xl px-6 text-center lg:px-10">
                <div className="mx-auto mb-6 flex justify-center gap-1 text-olive-600">
                    {[0, 1, 2, 3, 4].map((i) => (
                        <motion.span
                            key={i}
                            initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
                            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                            viewport={{ once: true, amount: 0.5 }}
                            transition={{
                                delay: 0.1 + i * 0.07,
                                type: 'spring',
                                stiffness: 280,
                                damping: 14,
                            }}
                        >
                            <Star className="size-5 fill-current" />
                        </motion.span>
                    ))}
                </div>

                <div className="relative min-h-[260px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -16 }}
                            transition={{
                                duration: 0.5,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                        >
                            <blockquote className="text-[24px] leading-snug font-medium text-balance text-navy-950 sm:text-[32px]">
                                {current.quote[lang]}
                            </blockquote>
                            <div className="mt-8 flex items-center justify-center gap-3">
                                <div
                                    className={cn(
                                        'grid size-12 place-items-center rounded-full text-sm font-semibold text-white',
                                        current.avatarTone === 'navy'
                                            ? 'bg-gradient-to-br from-navy-700 to-navy-900'
                                            : 'bg-gradient-to-br from-olive-500 to-olive-700',
                                    )}
                                >
                                    {current.initials}
                                </div>
                                <div className="text-left">
                                    <div className="text-[14px] font-semibold text-navy-900">
                                        {current.name}
                                    </div>
                                    <div className="text-[12px] text-muted-foreground">
                                        {current.role[lang]}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="mt-10 flex items-center justify-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        aria-label="Previous"
                        onClick={() =>
                            setIndex(
                                (i) =>
                                    (i - 1 + TESTIMONIALS.length) %
                                    TESTIMONIALS.length,
                            )
                        }
                        className="size-9 rounded-full"
                    >
                        <ChevronLeft className="size-4" />
                    </Button>

                    <div className="flex gap-2">
                        {TESTIMONIALS.map((_, i) => {
                            const active = i === index;

                            return (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => setIndex(i)}
                                    aria-label={`Testimonial ${i + 1}`}
                                    className={cn(
                                        'h-1.5 rounded-full transition-all',
                                        active
                                            ? 'w-8 bg-navy-900'
                                            : 'w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50',
                                    )}
                                />
                            );
                        })}
                    </div>

                    <Button
                        variant="outline"
                        size="icon"
                        aria-label="Next"
                        onClick={() =>
                            setIndex((i) => (i + 1) % TESTIMONIALS.length)
                        }
                        className="size-9 rounded-full"
                    >
                        <ChevronRight className="size-4" />
                    </Button>
                </div>
            </div>
        </section>
    );
}
