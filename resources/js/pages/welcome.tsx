import { Head, usePage } from '@inertiajs/react';
import { useEffect } from 'react';

import { BackgroundMesh } from '@/components/landing/background-mesh';
import { CompareSection } from '@/components/landing/compare-section';
import { Faq } from '@/components/landing/faq';
import { Features } from '@/components/landing/features';
import { FinalCta } from '@/components/landing/final-cta';
import { Hero } from '@/components/landing/hero';
import { IntegrationsSection } from '@/components/landing/integrations-section';
import { Pricing } from '@/components/landing/pricing';
import { ScrollProgress } from '@/components/landing/scroll-progress';
import { ScrollToTop } from '@/components/landing/scroll-to-top';
import { SecuritySection } from '@/components/landing/security-section';
import type { Lang } from '@/components/landing/shared/types';
import { SiteFooter } from '@/components/landing/site-footer';
import { StatsBand } from '@/components/landing/stats-band';
import { Testimonial } from '@/components/landing/testimonial';
import { TopNav } from '@/components/landing/top-nav';
import { TrustStrip } from '@/components/landing/trust-strip';
import { Workflow } from '@/components/landing/workflow';
import { useLocale } from '@/lib/i18n/use-locale';

interface WelcomeProps {
    canRegister?: boolean;
}

/*
 * The landing page copy currently ships English + French only. When the user
 * lands on the `ma-ar` URL we keep the URL/route but show the French copy
 * (closer to the Moroccan baseline) until Arabic landing translations land.
 */
function toLandingLang(lang: 'en' | 'fr' | 'ar'): Lang {
    return lang === 'ar' ? 'fr' : lang;
}

export default function Welcome({ canRegister = true }: WelcomeProps) {
    const { auth } = usePage<{
        auth: { user: { first_name?: string } | null };
    }>().props;
    const { lang: localeLang, dir } = useLocale();
    const lang = toLandingLang(localeLang);

    useEffect(() => {
        if (typeof document === 'undefined') {
            return;
        }

        document.documentElement.dir = dir;
        document.documentElement.lang = localeLang;
    }, [dir, localeLang]);

    // Force the landing page to render light, regardless of the user's saved
    // appearance preference. Restore the previous theme on unmount so signing
    // in or navigating to /dashboard returns to the user's chosen theme.
    useEffect(() => {
        if (typeof document === 'undefined') {
            return;
        }

        const html = document.documentElement;
        const hadDark = html.classList.contains('dark');
        const prevColorScheme = html.style.colorScheme;

        html.classList.remove('dark');
        html.style.colorScheme = 'light';

        return () => {
            if (hadDark) {
                html.classList.add('dark');
            }

            html.style.colorScheme = prevColorScheme;
        };
    }, []);

    return (
        <>
            <Head title="Blue Dome — Run your clinic with calm precision" />

            <div className="min-h-screen overflow-x-hidden scroll-smooth bg-background font-sans text-foreground antialiased">
                <BackgroundMesh />
                <ScrollProgress />

                <TopNav
                    lang={lang}
                    authed={!!auth.user}
                    canRegister={canRegister}
                />

                <main>
                    <Hero lang={lang} canRegister={canRegister} />
                    <TrustStrip lang={lang} />
                    <Features lang={lang} />
                    <CompareSection lang={lang} />
                    <Workflow lang={lang} />
                    <IntegrationsSection lang={lang} />
                    <StatsBand lang={lang} />
                    <Testimonial lang={lang} />
                    <SecuritySection lang={lang} />
                    <Pricing lang={lang} canRegister={canRegister} />
                    <Faq lang={lang} />
                    <FinalCta lang={lang} canRegister={canRegister} />
                    <SiteFooter lang={lang} />
                </main>

                <ScrollToTop
                    label={lang === 'fr' ? 'Retour en haut' : 'Back to top'}
                />
            </div>
        </>
    );
}
