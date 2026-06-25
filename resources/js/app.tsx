import { createInertiaApp, router } from '@inertiajs/react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';

import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import DoctorLayout from '@/layouts/doctor-layout';
import SecretaryLayout from '@/layouts/secretary-layout';
import SettingsLayout from '@/layouts/settings/layout';
import SuperAdminLayout from '@/layouts/super-admin-layout';
import { setUrlDefaults } from '@/wayfinder';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

/**
 * Safe browser check (important for SSR)
 */
const isBrowser = typeof window !== 'undefined';

/**
 * Locale handling (SSR SAFE)
 */
const initialLocale = isBrowser
    ? (window.location.pathname.match(/^\/([a-z]{2}-[a-z]{2,3})\b/)?.[1] ??
      'ma-fr')
    : 'ma-fr';

setUrlDefaults({ locale: initialLocale });

/**
 * Sync locale on navigation
 */
router.on('navigate', (event) => {
    const slug = (event.detail.page.props as { locale?: { slug?: string } })
        ?.locale?.slug;

    if (slug) {
        setUrlDefaults({ locale: slug });
    }
});

/**
 * Safe event listeners (only browser)
 */
if (isBrowser) {
    window.addEventListener('vite:preloadError', () => {
        window.location.reload();
    });

    window.addEventListener('unhandledrejection', (event) => {
        const message =
            event.reason instanceof Error
                ? event.reason.message
                : String(event.reason ?? '');

        if (
            message.includes('Failed to fetch dynamically imported module') ||
            message.includes('error loading dynamically imported module')
        ) {
            window.location.reload();
        }
    });
}

/**
 * Generic resource pages that are shared across roles (they live at top-level
 * paths, not under a `panels/<role>/` prefix). Each must render inside the
 * VIEWER'S OWN role layout — never a hard-coded doctor shell — so a secretary
 * never sees the doctor sidebar/topbar/nav, and vice versa. Access to each page
 * is still gated server-side by route middleware + policies.
 */
const SHARED_PAGE_PREFIXES = [
    'patients/',
    'appointments/',
    'prescriptions/',
    'lab-orders/',
    'medical-records/',
    'invoices/',
    'inventory/',
    'medications/',
    'expenses/',
    'vendors/',
    'documents/',
    'document-folders/',
];

/** Map the authenticated user's role to its panel layout. */
function layoutForRole(role: string | undefined) {
    switch (role) {
        case 'super_admin':
            return SuperAdminLayout;
        case 'secretary':
            return SecretaryLayout;
        default:
            // Doctor (and any unexpected fallback) get the doctor shell.
            return DoctorLayout;
    }
}

function roleFromPage(
    page: { props?: unknown } | undefined,
): string | undefined {
    return (page?.props as { auth?: { user?: { role?: string } } } | undefined)
        ?.auth?.user?.role;
}

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),

    layout: (name, page) => {
        switch (true) {
            case name === 'welcome':
                return null;

            case name.startsWith('auth/'):
                return AuthLayout;

            case name.startsWith('settings/'):
                return [AppLayout, SettingsLayout];

            case name.startsWith('panels/super-admin/'):
                return SuperAdminLayout;

            case name.startsWith('panels/secretary/') ||
                name === 'secretary/follow-up':
                return SecretaryLayout;

            case name.startsWith('panels/doctor/'):
                return DoctorLayout;

            // Shared pages (staff chat + the generic resource modules) render
            // inside the viewer's own role panel so the role sidebar + nav stay
            // put — no role ever sees another role's chrome.
            case name === 'messages/index':
            case SHARED_PAGE_PREFIXES.some((prefix) => name.startsWith(prefix)):
                return layoutForRole(roleFromPage(page));

            default:
                return AppLayout;
        }
    },

    strictMode: true,

    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                {app}
                <Toaster />
            </TooltipProvider>
        );
    },

    progress: {
        color: '#4B5563',
    },
});

/**
 * Theme init (browser only)
 */
if (isBrowser) {
    initializeTheme();
}
