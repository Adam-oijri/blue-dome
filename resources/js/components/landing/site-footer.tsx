import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Github, Linkedin, ShieldCheck, Twitter } from 'lucide-react';

import { BrandIconMark } from '@/components/blue-dome/brand-icon-mark';
import { FooterColumn } from '@/components/landing/footer-column';
import { NewsletterForm } from '@/components/landing/newsletter-form';
import { FADE_UP, STAGGER } from '@/components/landing/shared/animations';
import type { SectionProps } from '@/components/landing/shared/types';

const SOCIAL = [
    {
        Icon: Twitter,
        href: 'https://twitter.com/bluedomeapp',
        label: 'Twitter',
    },
    {
        Icon: Linkedin,
        href: 'https://linkedin.com/company/bluedome',
        label: 'LinkedIn',
    },
    { Icon: Github, href: 'https://github.com/bluedome', label: 'GitHub' },
];

export function SiteFooter({ lang }: SectionProps) {
    return (
        <footer className="border-t border-border/40 pt-16 pb-10">
            <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2 }}
                variants={STAGGER}
                className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[1.6fr_1fr_1fr_1.4fr] lg:px-10"
            >
                <motion.div variants={FADE_UP}>
                    <Link href="/" className="flex items-center gap-2.5">
                        <BrandIconMark />
                        <div className="leading-tight">
                            <div className="text-[14px] font-bold tracking-wide text-navy-900">
                                BLUE DOME
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                                Clinic Suite
                            </div>
                        </div>
                    </Link>
                    <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-muted-foreground">
                        {lang === 'fr'
                            ? 'Plateforme cabinet médical conçue à Casablanca pour les cliniques modernes au Maroc et au-delà.'
                            : 'Clinic management platform built in Casablanca for modern medical practices in Morocco and beyond.'}
                    </p>
                    <div className="mt-5 flex items-center gap-2">
                        {SOCIAL.map(({ Icon, href, label }) => (
                            <motion.a
                                key={label}
                                href={href}
                                aria-label={label}
                                whileHover={{ y: -3, scale: 1.08 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 320,
                                    damping: 18,
                                }}
                                className="hover:border-navy-200 grid size-9 place-items-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-navy-900"
                            >
                                <Icon className="size-4" />
                            </motion.a>
                        ))}
                    </div>
                </motion.div>

                <motion.div variants={FADE_UP}>
                    <FooterColumn
                        heading={lang === 'fr' ? 'Produit' : 'Product'}
                        items={[
                            {
                                label:
                                    lang === 'fr'
                                        ? 'Fonctionnalités'
                                        : 'Features',
                                href: '#features',
                            },
                            {
                                label: lang === 'fr' ? 'Tarifs' : 'Pricing',
                                href: '#pricing',
                            },
                            {
                                label:
                                    lang === 'fr' ? 'Témoignages' : 'Customers',
                                href: '#stories',
                            },
                            { label: 'Changelog', href: '#' },
                        ]}
                    />
                </motion.div>

                <motion.div variants={FADE_UP}>
                    <FooterColumn
                        heading={lang === 'fr' ? 'Entreprise' : 'Company'}
                        items={[
                            {
                                label: lang === 'fr' ? 'À propos' : 'About',
                                href: '#',
                            },
                            { label: 'Blog', href: '#' },
                            {
                                label: lang === 'fr' ? 'Contact' : 'Contact',
                                href: 'mailto:hello@bluedome.app',
                            },
                            {
                                label: lang === 'fr' ? 'Carrières' : 'Careers',
                                href: '#',
                            },
                        ]}
                    />
                </motion.div>

                <motion.div variants={FADE_UP}>
                    <NewsletterForm lang={lang} />
                </motion.div>
            </motion.div>

            <div className="mx-auto mt-12 flex max-w-7xl flex-wrap items-center justify-between gap-4 border-t border-border/40 px-6 pt-6 lg:px-10">
                <p className="text-[12px] text-muted-foreground">
                    © 2026 Blue Dome SAS · Casablanca, Morocco
                </p>
                <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-2">
                        <ShieldCheck className="size-3.5 text-olive-600" />
                        {lang === 'fr'
                            ? 'GDPR · Loi 09-08 conforme'
                            : 'GDPR · Law 09-08 compliant'}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
                        {lang === 'fr'
                            ? 'Tous services opérationnels'
                            : 'All systems operational'}
                    </span>
                </div>
            </div>
        </footer>
    );
}
