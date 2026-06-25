import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';

import { FADE_UP } from '@/components/landing/shared/animations';
import type { TIERS } from '@/components/landing/shared/content';
import type { Lang } from '@/components/landing/shared/types';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/lib/i18n/use-locale';
import { cn } from '@/lib/utils';
import { login, register } from '@/routes';

interface PricingTierProps {
    tier: (typeof TIERS)[number];
    lang: Lang;
    canRegister?: boolean;
}

export function PricingTier({
    tier,
    lang,
    canRegister = false,
}: PricingTierProps) {
    const { slug: locale } = useLocale();

    return (
        <motion.div
            variants={FADE_UP}
            whileHover={{ y: -6 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            className={cn(
                'relative rounded-2xl border p-7 shadow-sm transition-shadow hover:shadow-xl',
                tier.featured
                    ? 'border-navy-900 bg-gradient-to-br from-navy-950 to-navy-800 text-white'
                    : 'border-border/70 bg-card',
            )}
        >
            {tier.featured && (
                <motion.span
                    initial={{ opacity: 0, y: -4, scale: 0.9 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{
                        delay: 0.2,
                        type: 'spring',
                        stiffness: 280,
                        damping: 16,
                    }}
                    className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-olive-500 px-3 py-1 text-[10px] font-semibold tracking-widest text-white uppercase"
                >
                    <motion.span
                        animate={{ opacity: [0.85, 1, 0.85] }}
                        transition={{
                            duration: 2.4,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                        className="inline-block"
                    >
                        {
                            {
                                en: 'Most popular',
                                fr: 'Le plus populaire',
                                ar: 'الأكثر رواجًا',
                            }[lang]
                        }
                    </motion.span>
                </motion.span>
            )}

            {tier.featured && (
                <motion.div
                    aria-hidden
                    animate={{ opacity: [0.2, 0.4, 0.2] }}
                    transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                    className="absolute -top-20 -right-12 size-44 rounded-full bg-gradient-to-br from-olive-400/20 to-transparent blur-3xl"
                />
            )}

            <h3
                className={cn(
                    'text-[18px] font-semibold tracking-tight',
                    tier.featured ? 'text-white' : 'text-navy-900',
                )}
            >
                {tier.name[lang]}
            </h3>
            <p
                className={cn(
                    'mt-2 text-[13px] leading-relaxed',
                    tier.featured ? 'text-slate-300' : 'text-muted-foreground',
                )}
            >
                {tier.blurb[lang]}
            </p>

            <div className="mt-6 flex items-baseline gap-1">
                <span
                    className={cn(
                        'text-[44px] font-semibold tracking-tight tabular-nums',
                        tier.featured ? 'text-white' : 'text-navy-900',
                    )}
                >
                    {tier.price}
                </span>
                <span
                    className={cn(
                        'text-[14px] font-semibold',
                        tier.featured
                            ? 'text-slate-300'
                            : 'text-muted-foreground',
                    )}
                >
                    MAD{tier.period[lang]}
                </span>
            </div>

            <Button
                asChild
                className={cn(
                    'group/cta mt-7 w-full',
                    tier.featured
                        ? 'bg-olive-500 text-white hover:bg-olive-600'
                        : 'bg-navy-900 text-white hover:bg-navy-800',
                )}
            >
                <Link
                    href={
                        canRegister ? register({ locale }) : login({ locale })
                    }
                >
                    {tier.cta[lang]}
                    <ArrowRight className="size-3.5 transition-transform group-hover/cta:translate-x-0.5" />
                </Link>
            </Button>

            <ul className="mt-8 space-y-3 text-[13px]">
                {tier.features.map((f, i) => (
                    <motion.li
                        key={f.en}
                        initial={{ opacity: 0, x: -8 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.4 }}
                        transition={{ delay: 0.3 + i * 0.05, duration: 0.4 }}
                        className="flex items-start gap-2"
                    >
                        <Check
                            className={cn(
                                'mt-0.5 size-4 shrink-0',
                                tier.featured
                                    ? 'text-olive-300'
                                    : 'text-olive-600',
                            )}
                        />
                        <span
                            className={
                                tier.featured
                                    ? 'text-slate-200'
                                    : 'text-foreground'
                            }
                        >
                            {f[lang]}
                        </span>
                    </motion.li>
                ))}
            </ul>
        </motion.div>
    );
}
