import { motion } from 'framer-motion';

import { FeatureCard } from '@/components/landing/feature-card';
import { FADE_UP, STAGGER } from '@/components/landing/shared/animations';
import { FEATURES } from '@/components/landing/shared/content';
import type { SectionProps } from '@/components/landing/shared/types';

export function Features({ lang }: SectionProps) {
    return (
        <section id="features" className="py-24 lg:py-32">
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
                        {
                            {
                                en: 'One platform · not a patchwork',
                                fr: 'Une plateforme · pas un patchwork',
                                ar: 'منصّة واحدة · لا مجموعة أدوات مبعثرة',
                            }[lang]
                        }
                    </motion.p>
                    <motion.h2
                        variants={FADE_UP}
                        className="text-[34px] font-semibold tracking-tight text-navy-950 sm:text-[44px]"
                    >
                        {
                            {
                                en: 'Everything your clinic needs — already wired together.',
                                fr: 'Tout ce dont votre cabinet a besoin — déjà connecté.',
                                ar: 'كل ما تحتاجه عيادتك — مترابط مسبقًا.',
                            }[lang]
                        }
                    </motion.h2>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={STAGGER}
                    className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3"
                >
                    {FEATURES.map((f) => (
                        <FeatureCard key={f.title.en} feature={f} lang={lang} />
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
