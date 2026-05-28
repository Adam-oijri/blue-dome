import { motion } from 'framer-motion';

import { FADE_UP } from '@/components/landing/shared/animations';
import type { FEATURES } from '@/components/landing/shared/content';
import { TONE_BG } from '@/components/landing/shared/content';
import type { Lang } from '@/components/landing/shared/types';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
    feature: (typeof FEATURES)[number];
    lang: Lang;
}

export function FeatureCard({ feature, lang }: FeatureCardProps) {
    const Icon = feature.icon;

    return (
        <motion.div
            variants={FADE_UP}
            whileHover={{ y: -6 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-6 shadow-sm transition-shadow hover:shadow-xl"
        >
            <motion.div
                whileHover={{ rotate: -10, scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 280, damping: 14 }}
                className={cn(
                    'grid size-11 place-items-center rounded-xl',
                    TONE_BG[feature.tone],
                )}
            >
                <Icon className="size-5" />
            </motion.div>
            <h3 className="mt-5 text-[18px] font-semibold tracking-tight text-navy-900">
                {feature.title[lang]}
            </h3>
            <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
                {feature.body[lang]}
            </p>
            <motion.div
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="absolute bottom-0 left-0 h-px w-full origin-left bg-gradient-to-r from-olive-500 to-olive-300"
            />
            <div
                className="to-navy-400/0 absolute -right-12 -bottom-12 size-32 rounded-full bg-gradient-to-br from-olive-400/30 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                aria-hidden
            />
        </motion.div>
    );
}
