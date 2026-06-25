import { motion } from 'framer-motion';

import { FaqItem } from '@/components/landing/faq-item';
import { FADE_UP, STAGGER } from '@/components/landing/shared/animations';
import { FAQ as FAQ_DATA } from '@/components/landing/shared/content';
import type { SectionProps } from '@/components/landing/shared/types';

export function Faq({ lang }: SectionProps) {
    return (
        <section id="faq" className="py-24 lg:py-32">
            <div className="mx-auto max-w-3xl px-6 lg:px-10">
                <motion.div
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.4 }}
                    variants={STAGGER}
                    className="text-center"
                >
                    <motion.p
                        variants={FADE_UP}
                        className="mb-3 text-[12px] font-semibold tracking-wider text-olive-700 uppercase"
                    >
                        {
                            {
                                en: 'FAQ',
                                fr: 'FAQ',
                                ar: 'الأسئلة الشائعة',
                            }[lang]
                        }
                    </motion.p>
                    <motion.h2
                        variants={FADE_UP}
                        className="text-[34px] font-semibold tracking-tight text-navy-950 sm:text-[44px]"
                    >
                        {
                            {
                                en: 'Frequently asked questions.',
                                fr: 'Questions fréquentes.',
                                ar: 'الأسئلة الشائعة.',
                            }[lang]
                        }
                    </motion.h2>
                    <motion.p
                        variants={FADE_UP}
                        className="mt-3 text-[15px] text-muted-foreground"
                    >
                        {
                            {
                                en: "Didn't find your answer? Email us at hello@bluedome.app.",
                                fr: 'Pas trouvé votre réponse ? Écrivez-nous à hello@bluedome.app.',
                                ar: 'لم تجد إجابتك؟ راسلنا على hello@bluedome.app.',
                            }[lang]
                        }
                    </motion.p>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.1 }}
                    variants={STAGGER}
                    className="mt-12 space-y-3"
                >
                    {FAQ_DATA.map((f, i) => (
                        <FaqItem
                            key={f.q.en}
                            question={f.q[lang]}
                            answer={f.a[lang]}
                            defaultOpen={i === 0}
                        />
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
