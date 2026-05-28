import { router, usePage } from '@inertiajs/react';

export type AppLang = 'en' | 'fr' | 'ar';

export type LocaleProp = {
    slug: string;
    country: string;
    lang: AppLang;
    dir: 'ltr' | 'rtl';
    supported: string[];
};

/**
 * Reads the current `{country}-{lang}` locale from the Inertia shared props.
 * Set in `HandleInertiaRequests::resolveLocale()` and driven by the URL prefix
 * via `App\Http\Middleware\SetLocale`.
 */
export function useLocale(): LocaleProp {
    return usePage<{ locale: LocaleProp }>().props.locale;
}

/**
 * Shortcut when callers only need the slug (the common case for Wayfinder
 * route helpers, which take `locale` as the first parameter post locale-routing
 * refactor).
 */
export function useLocaleSlug(): string {
    return useLocale().slug;
}

/**
 * Switches the current URL to a sibling locale that keeps the same country
 * but swaps the language. Triggers an Inertia visit so the server can
 * re-render the page with the right language + dir. Falls back to the
 * default slug if the swap isn't in the supported list.
 */
export function useSwapLang(): (nextLang: AppLang) => void {
    const { slug, country, supported } = useLocale();

    return (nextLang) => {
        const target = `${country.toLowerCase()}-${nextLang}`;

        if (!supported.includes(target) || target === slug) {
            return;
        }

        const currentPath = window.location.pathname.replace(
            new RegExp(`^/${slug}`),
            '',
        );
        const search = window.location.search;
        const url = `/${target}${currentPath || '/'}${search}`;

        router.visit(url, { preserveScroll: true });
    };
}
