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

const DOCTOR_PAGE_PREFIXES = [
    'panels/doctor/',
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

            // Shared staff-chat page — render it inside the viewer's own panel
            // (super admin, doctor, or secretary) so the role sidebar + Messages
            // nav stay put.
            case name === 'messages/index': {
                const role = (
                    page?.props as
                        | { auth?: { user?: { role?: string } } }
                        | undefined
                )?.auth?.user?.role;

                if (role === 'super_admin') {
                    return SuperAdminLayout;
                }

                return role === 'secretary' ? SecretaryLayout : DoctorLayout;
            }

            case name.startsWith('panels/secretary/') ||
                name === 'secretary/follow-up':
                return SecretaryLayout;

            case DOCTOR_PAGE_PREFIXES.some((prefix) => name.startsWith(prefix)):
                return DoctorLayout;

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
