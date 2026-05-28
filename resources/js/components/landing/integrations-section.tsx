import { motion } from 'framer-motion';

import { FADE_UP, STAGGER } from '@/components/landing/shared/animations';
import { INTEGRATIONS } from '@/components/landing/shared/content';
import type {
    Integration,
    IntegrationStatus,
    IntegrationTint,
} from '@/components/landing/shared/content';
import type { SectionProps } from '@/components/landing/shared/types';
import { cn } from '@/lib/utils';

const TINT_BG: Record<IntegrationTint, string> = {
    navy: 'from-navy-700 to-navy-900 text-white',
    olive: 'from-olive-500 to-olive-700 text-white',
    amber: 'from-amber-400 to-amber-600 text-white',
    emerald: 'from-emerald-500 to-emerald-700 text-white',
    sky: 'from-sky-500 to-sky-700 text-white',
    rose: 'from-rose-500 to-rose-700 text-white',
};

const STATUS_LABEL: Record<
    IntegrationStatus,
    { en: string; fr: string; tone: string }
> = {
    live: {
        en: 'Live',
        fr: 'En production',
        tone: 'bg-emerald-100 text-emerald-700',
    },
    beta: {
        en: 'Beta',
        fr: 'Bêta',
        tone: 'bg-amber-100 text-amber-700',
    },
    planned: {
        en: 'Soon',
        fr: 'Bientôt',
        tone: 'bg-muted text-muted-foreground',
    },
};

export function IntegrationsSection({ lang }: SectionProps) {
    return (
        <section className="border-y border-border/40 bg-card/50 py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-10">
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
                        {lang === 'fr' ? 'Intégrations' : 'Integrations'}
                    </motion.p>
                    <motion.h2
                        variants={FADE_UP}
                        className="text-[34px] font-semibold tracking-tight text-navy-950 sm:text-[44px]"
                    >
                        {lang === 'fr'
                            ? 'Branché à votre écosystème existant.'
                            : 'Plugged into your existing ecosystem.'}
                    </motion.h2>
                    <motion.p
                        variants={FADE_UP}
                        className="mt-3 text-[15px] text-muted-foreground"
                    >
                        {lang === 'fr'
                            ? 'Aucune migration explosive. Vos outils continuent de fonctionner — Blue Dome les orchestre.'
                            : 'No big-bang migration. Your existing tools keep working — Blue Dome orchestrates them.'}
                    </motion.p>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.15 }}
                    variants={STAGGER}
                    className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
                >
                    {INTEGRATIONS.map((i) => (
                        <IntegrationCard
                            key={i.name}
                            integration={i}
                            lang={lang}
                        />
                    ))}
                </motion.div>
            </div>
        </section>
    );
}

function IntegrationCard({
    integration,
    lang,
}: {
    integration: Integration;
    lang: SectionProps['lang'];
}) {
    const status = STATUS_LABEL[integration.status];

    return (
        <motion.div
            variants={FADE_UP}
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="group relative flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
        >
            <div className="flex items-center gap-3">
                <div
                    className={cn(
                        'grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-lg font-bold',
                        TINT_BG[integration.tint],
                    )}
                >
                    {integration.initial}
                </div>
                <div className="min-w-0">
                    <div className="truncate text-[13px] font-semibold text-navy-900">
                        {integration.name}
                    </div>
                    <div className="truncate text-[11px] text-muted-foreground">
                        {integration.category[lang]}
                    </div>
                </div>
            </div>
            <div>
                <span
                    className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2 py-px text-[10px] font-semibold',
                        status.tone,
                    )}
                >
                    {integration.status === 'live' && (
                        <motion.span
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{
                                duration: 1.6,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                            className="size-1 rounded-full bg-current"
                        />
                    )}
                    {status[lang]}
                </span>
            </div>
        </motion.div>
    );
}
