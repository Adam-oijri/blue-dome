import { motion } from 'framer-motion';
import { Database, Eye, Flag, Key, Lock, Shield } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { FADE_UP, STAGGER } from '@/components/landing/shared/animations';
import { SECURITY_BADGES } from '@/components/landing/shared/content';
import type { SecurityIcon } from '@/components/landing/shared/content';
import type { SectionProps } from '@/components/landing/shared/types';

const ICONS: Record<SecurityIcon, LucideIcon> = {
    shield: Shield,
    lock: Lock,
    key: Key,
    database: Database,
    flag: Flag,
    eye: Eye,
};

export function SecuritySection({ lang }: SectionProps) {
    return (
        <section className="py-24 lg:py-32">
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
                                en: 'Security · Compliance',
                                fr: 'Sécurité · Conformité',
                                ar: 'الأمان · الامتثال',
                            }[lang]
                        }
                    </motion.p>
                    <motion.h2
                        variants={FADE_UP}
                        className="text-[34px] font-semibold tracking-tight text-navy-950 sm:text-[44px]"
                    >
                        {
                            {
                                en: 'Built around patient data.',
                                fr: 'Conçu autour des données patient.',
                                ar: 'مصمَّم حول بيانات المرضى.',
                            }[lang]
                        }
                    </motion.h2>
                    <motion.p
                        variants={FADE_UP}
                        className="mt-3 text-[15px] text-muted-foreground"
                    >
                        {
                            {
                                en: 'Your patients trust you with their health. Here’s how we protect their record.',
                                fr: 'Vos patients vous confient leur santé. Voici comment nous protégeons leur dossier.',
                                ar: 'يأتمنك مرضاك على صحتهم. وإليك كيف نحمي سجلاتهم.',
                            }[lang]
                        }
                    </motion.p>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.15 }}
                    variants={STAGGER}
                    className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3"
                >
                    {SECURITY_BADGES.map((badge) => {
                        const Icon = ICONS[badge.icon];

                        return (
                            <motion.div
                                key={badge.title.en}
                                variants={FADE_UP}
                                whileHover={{ y: -4 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 300,
                                    damping: 22,
                                }}
                                className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-6 shadow-sm transition-shadow hover:shadow-lg"
                            >
                                <motion.div
                                    whileHover={{ rotate: -8, scale: 1.05 }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 260,
                                        damping: 14,
                                    }}
                                    className="grid size-11 place-items-center rounded-xl bg-navy-50 text-navy-700"
                                >
                                    <Icon className="size-5" />
                                </motion.div>
                                <h3 className="mt-5 text-[16px] font-semibold tracking-tight text-navy-900">
                                    {badge.title[lang]}
                                </h3>
                                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                                    {badge.description[lang]}
                                </p>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
}
