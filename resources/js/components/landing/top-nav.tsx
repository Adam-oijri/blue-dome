import { Link } from '@inertiajs/react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

import { BrandIconMark } from '@/components/blue-dome/brand-icon-mark';
import { LangPill } from '@/components/landing/lang-pill';
import { MobileNav } from '@/components/landing/mobile-nav';
import { NAV } from '@/components/landing/shared/content';
import type { Lang } from '@/components/landing/shared/types';
import { useActiveSection } from '@/components/landing/use-active-section';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/lib/i18n/use-locale';
import { dashboard, login } from '@/routes';

interface TopNavProps {
    lang: Lang;
    authed: boolean;
    canRegister: boolean;
}

const SECTION_IDS = ['features', 'workflow', 'pricing', 'stories', 'faq'];

export function TopNav({ lang, authed, canRegister }: TopNavProps) {
    const { scrollY } = useScroll();
    const navBlur = useTransform(scrollY, [0, 80], [0, 12]);
    const navOpacity = useTransform(scrollY, [0, 120], [0.6, 0.92]);
    const navBg = useTransform(navOpacity, (o) => `rgba(255, 255, 255, ${o})`);
    const navBackdrop = useTransform(navBlur, (b) => `blur(${b}px)`);
    const activeSection = useActiveSection(SECTION_IDS);
    const { slug: locale } = useLocale();

    return (
        <motion.header
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{
                backdropFilter: navBackdrop,
                WebkitBackdropFilter: navBackdrop,
                backgroundColor: navBg,
            }}
            className="fixed inset-x-0 top-0 z-50 border-b border-border/40"
        >
            <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-6 lg:px-10">
                <Link href="/" className="group flex items-center gap-2.5">
                    <motion.div
                        whileHover={{ rotate: -8, scale: 1.05 }}
                        transition={{
                            type: 'spring',
                            stiffness: 300,
                            damping: 18,
                        }}
                    >
                        <BrandIconMark />
                    </motion.div>
                    <div className="leading-tight">
                        <div className="text-[14px] font-bold tracking-wide text-navy-900">
                            BLUE DOME
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                            Clinic Suite
                        </div>
                    </div>
                </Link>

                <nav className="ms-6 hidden items-center gap-1 md:flex">
                    {NAV.map((n) => {
                        const sectionId = n.href.replace('#', '');
                        const active = activeSection === sectionId;

                        return (
                            <a
                                key={n.href}
                                href={n.href}
                                className="relative px-3 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
                            >
                                {active && (
                                    <motion.span
                                        layoutId="nav-active"
                                        className="absolute inset-0 rounded-md bg-muted"
                                        transition={{
                                            type: 'spring',
                                            bounce: 0.2,
                                            duration: 0.5,
                                        }}
                                    />
                                )}
                                <span
                                    className={
                                        active
                                            ? 'relative text-foreground'
                                            : 'relative'
                                    }
                                >
                                    {n.label[lang]}
                                </span>
                            </a>
                        );
                    })}
                </nav>

                <div className="ms-auto flex items-center gap-2">
                    <div className="hidden md:flex md:items-center md:gap-2">
                        <LangPill />

                        {authed ? (
                            <Button
                                size="sm"
                                asChild
                                className="bg-navy-900 text-white hover:bg-navy-800"
                            >
                                <Link href={dashboard({ locale })}>
                                    Dashboard
                                    <ArrowRight className="size-3.5" />
                                </Link>
                            </Button>
                        ) : (
                            <>
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href={login({ locale })}>
                                        {lang === 'fr'
                                            ? 'Connexion'
                                            : 'Sign in'}
                                    </Link>
                                </Button>
                                {canRegister && (
                                    <Button
                                        size="sm"
                                        asChild
                                        className="bg-navy-900 text-white hover:bg-navy-800"
                                    >
                                        <Link href="/register">
                                            {lang === 'fr'
                                                ? 'Démarrer'
                                                : 'Get started'}
                                            <ArrowRight className="size-3.5" />
                                        </Link>
                                    </Button>
                                )}
                            </>
                        )}
                    </div>

                    <MobileNav
                        lang={lang}
                        authed={authed}
                        canRegister={canRegister}
                    />
                </div>
            </div>
        </motion.header>
    );
}
