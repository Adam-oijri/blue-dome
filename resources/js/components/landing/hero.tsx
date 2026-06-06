import { Link } from '@inertiajs/react';
import { motion, useScroll, useTransform } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { ArrowRight, Check, ChevronRight, Sparkles } from 'lucide-react';

import { DashboardMockup } from '@/components/landing/dashboard-mockup';
import { MagneticButton } from '@/components/landing/magnetic-button';
import { ScrollCue } from '@/components/landing/scroll-cue';
import { FADE_UP, STAGGER } from '@/components/landing/shared/animations';
import type { SectionProps } from '@/components/landing/shared/types';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/lib/i18n/use-locale';
import { login, register } from '@/routes';

const WORD_FADE: Variants = {
    hidden: { opacity: 0, y: 18 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
    },
};

const WORD_STAGGER: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.05, delayChildren: 0.2 } },
};

function splitWords(text: string) {
    return text.split(' ').map((word, i) => (
        <motion.span
            key={`${word}-${i}`}
            variants={WORD_FADE}
            className="inline-block whitespace-pre"
        >
            {word}
            {i < text.split(' ').length - 1 ? ' ' : ''}
        </motion.span>
    ));
}

export function Hero({
    lang,
    canRegister = false,
}: SectionProps & { canRegister?: boolean }) {
    const { slug: locale } = useLocale();
    const { scrollY } = useScroll();
    const heroParallax = useTransform(scrollY, [0, 600], [0, 80]);
    const heroOpacity = useTransform(scrollY, [0, 400], [1, 0.6]);

    const beforeHighlight =
        lang === 'fr' ? 'Gérez votre cabinet avec' : 'Run your clinic with';
    const highlighted = lang === 'fr' ? 'précision calme' : 'calm precision';
    const afterHighlight = '.';

    return (
        <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28">
            <div className="mx-auto max-w-7xl px-6 lg:px-10">
                <motion.div
                    initial="hidden"
                    animate="show"
                    variants={STAGGER}
                    className="mx-auto max-w-3xl text-center"
                >
                    <motion.div
                        variants={FADE_UP}
                        className="mb-6 flex justify-center"
                    >
                        <motion.span
                            whileHover={{ scale: 1.04 }}
                            transition={{
                                type: 'spring',
                                stiffness: 300,
                                damping: 18,
                            }}
                            className="inline-flex items-center gap-2 rounded-full border border-olive-200 bg-olive-50 px-3 py-1 text-[12px] font-semibold text-olive-700"
                        >
                            <motion.span
                                animate={{ rotate: [0, 12, -8, 0] }}
                                transition={{
                                    duration: 2.4,
                                    repeat: Infinity,
                                    repeatDelay: 4,
                                    ease: 'easeInOut',
                                }}
                            >
                                <Sparkles className="size-3" />
                            </motion.span>
                            {lang === 'fr'
                                ? 'Nouveau · Confirmations WhatsApp natives'
                                : 'New · Native WhatsApp confirmations'}
                        </motion.span>
                    </motion.div>

                    <motion.h1
                        initial="hidden"
                        animate="show"
                        variants={WORD_STAGGER}
                        className="text-[44px] leading-[1.05] font-semibold tracking-tight text-balance text-navy-950 sm:text-[56px] lg:text-[68px]"
                    >
                        {splitWords(beforeHighlight)}{' '}
                        <motion.span
                            variants={WORD_FADE}
                            className="inline-block bg-gradient-to-r from-olive-600 to-olive-800 bg-clip-text text-transparent"
                        >
                            {highlighted}
                        </motion.span>
                        <motion.span
                            variants={WORD_FADE}
                            className="inline-block"
                        >
                            {afterHighlight}
                        </motion.span>
                    </motion.h1>

                    <motion.p
                        variants={FADE_UP}
                        className="mx-auto mt-6 max-w-2xl text-[17px] leading-relaxed text-balance text-muted-foreground sm:text-[19px]"
                    >
                        {lang === 'fr'
                            ? 'Blue Dome unifie planning, dossiers cliniques, facturation et messagerie WhatsApp pour les cabinets médicaux modernes au Maroc — en français, en arabe, en anglais.'
                            : 'Blue Dome unifies scheduling, clinical records, billing and WhatsApp messaging for modern medical practices in Morocco — in English, French, and Arabic.'}
                    </motion.p>

                    <motion.div
                        variants={FADE_UP}
                        className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
                    >
                        <MagneticButton>
                            <Button
                                asChild
                                size="lg"
                                className="h-12 gap-2 bg-navy-900 px-6 text-white shadow-lg shadow-navy-900/20 hover:bg-navy-800"
                            >
                                <Link
                                    href={
                                        canRegister
                                            ? register({ locale })
                                            : login({ locale })
                                    }
                                >
                                    {lang === 'fr'
                                        ? 'Commencer gratuitement'
                                        : 'Start free trial'}
                                    <ArrowRight className="size-4" />
                                </Link>
                            </Button>
                        </MagneticButton>
                        <MagneticButton strength={0.2}>
                            <Button
                                asChild
                                variant="outline"
                                size="lg"
                                className="h-12 gap-2 px-6"
                            >
                                <a href="#features">
                                    {lang === 'fr'
                                        ? 'Voir une démo'
                                        : 'See a demo'}
                                    <ChevronRight className="size-4" />
                                </a>
                            </Button>
                        </MagneticButton>
                    </motion.div>

                    <motion.div
                        variants={FADE_UP}
                        className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12px] text-muted-foreground"
                    >
                        {[
                            lang === 'fr'
                                ? '14 jours gratuits'
                                : '14 days free',
                            lang === 'fr'
                                ? 'Sans carte bancaire'
                                : 'No credit card',
                            lang === 'fr'
                                ? 'Migration assistée'
                                : 'Guided migration',
                        ].map((text, i) => (
                            <motion.span
                                key={text}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    delay: 1 + i * 0.1,
                                    duration: 0.4,
                                }}
                                className="flex items-center gap-1.5"
                            >
                                <Check className="size-3.5 text-olive-600" />
                                {text}
                            </motion.span>
                        ))}
                    </motion.div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        delay: 0.5,
                        duration: 0.9,
                        ease: [0.22, 1, 0.36, 1],
                    }}
                    style={{ y: heroParallax, opacity: heroOpacity }}
                    className="relative mx-auto mt-16 max-w-5xl"
                >
                    <DashboardMockup lang={lang} />
                </motion.div>

                <div className="hidden justify-center lg:flex">
                    <ScrollCue
                        label={
                            lang === 'fr' ? 'Voir plus' : 'Scroll to explore'
                        }
                    />
                </div>
            </div>
        </section>
    );
}
