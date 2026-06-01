import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

import { MagneticButton } from '@/components/landing/magnetic-button';
import type { SectionProps } from '@/components/landing/shared/types';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/lib/i18n/use-locale';
import { login } from '@/routes';

export function FinalCta({
    lang,
    canRegister = false,
}: SectionProps & { canRegister?: boolean }) {
    const { slug: locale } = useLocale();

    return (
        <section className="py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.7 }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-950 to-navy-800 p-12 text-center text-white shadow-2xl shadow-navy-900/20 sm:p-16 lg:p-20"
                >
                    <motion.div
                        aria-hidden
                        animate={{ x: [0, 40, 0], y: [0, -20, 0] }}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                        className="absolute -top-40 -right-40 size-[500px] rounded-full bg-gradient-to-br from-olive-400/30 to-transparent blur-3xl"
                    />
                    <motion.div
                        aria-hidden
                        animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
                        transition={{
                            duration: 24,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                        className="absolute -bottom-32 -left-32 size-[400px] rounded-full bg-gradient-to-br from-navy-700/30 to-transparent blur-3xl"
                    />

                    <motion.h2
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.4 }}
                        transition={{ delay: 0.1, duration: 0.7 }}
                        className="relative text-[34px] font-semibold tracking-tight text-balance sm:text-[44px] lg:text-[52px]"
                    >
                        {lang === 'fr'
                            ? 'Prêt à donner à votre cabinet l’infrastructure qu’il mérite ?'
                            : 'Ready to give your clinic the infrastructure it deserves?'}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.4 }}
                        transition={{ delay: 0.25, duration: 0.6 }}
                        className="relative mx-auto mt-5 max-w-xl text-[16px] leading-relaxed text-muted-foreground/90"
                    >
                        {lang === 'fr'
                            ? '14 jours gratuits. Migration accompagnée. Sans engagement.'
                            : 'Fourteen days free. Guided migration. No commitment.'}
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.4 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className="relative mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
                    >
                        <MagneticButton>
                            <Button
                                asChild
                                size="lg"
                                className="h-12 gap-2 bg-olive-500 px-7 text-white hover:bg-olive-600"
                            >
                                <Link
                                    href={
                                        canRegister
                                            ? '/register'
                                            : login({ locale })
                                    }
                                >
                                    {lang === 'fr'
                                        ? 'Démarrer maintenant'
                                        : 'Start now'}
                                    <ArrowRight className="size-4" />
                                </Link>
                            </Button>
                        </MagneticButton>
                        <MagneticButton strength={0.2}>
                            <Button
                                asChild
                                size="lg"
                                variant="outline"
                                className="h-12 gap-2 border-white/20 bg-white/5 px-6 text-white hover:bg-white/15 hover:text-white"
                            >
                                <a href="mailto:hello@bluedome.app">
                                    {lang === 'fr'
                                        ? 'Parler à un humain'
                                        : 'Talk to a human'}
                                </a>
                            </Button>
                        </MagneticButton>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
