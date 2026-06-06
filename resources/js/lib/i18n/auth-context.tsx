import { useEffect } from 'react';

import { AUTH_I18N } from '@/lib/i18n/auth';
import type { AuthDictionary } from '@/lib/i18n/auth';
import { useLocale } from '@/lib/i18n/use-locale';

/**
 * Pre-login language hook for the auth screens. Reads the locale from the URL
 * (`/{country}-{lang}/…`) and returns the matching dictionary, syncing the
 * document direction/lang so RTL (Arabic) renders correctly.
 */
export function useAuthLang(): { t: AuthDictionary } {
    const { lang } = useLocale();
    const t = AUTH_I18N[lang];

    useEffect(() => {
        if (typeof document === 'undefined') {
            return;
        }

        document.documentElement.dir = t.dir;
        document.documentElement.lang = lang;
    }, [lang, t.dir]);

    return { t };
}
