import { useEffect } from 'react';
import type { ReactNode } from 'react';

import { SUPER_ADMIN_I18N } from '@/lib/i18n/super-admin';
import type {
    SuperAdminDictionary,
    SuperAdminLang,
} from '@/lib/i18n/super-admin';
import { useLocale, useSwapLang } from '@/lib/i18n/use-locale';

type SuperAdminLangContextValue = {
    lang: SuperAdminLang;
    setLang: (lang: SuperAdminLang) => void;
    t: SuperAdminDictionary;
};

export function SuperAdminLangProvider({ children }: { children: ReactNode }) {
    return <>{children}</>;
}

export function useSuperAdminLang(): SuperAdminLangContextValue {
    const { lang } = useLocale();
    const swapLang = useSwapLang();
    const t = SUPER_ADMIN_I18N[lang];

    useEffect(() => {
        if (typeof document === 'undefined') {
            return;
        }

        document.documentElement.dir = t.dir;
        document.documentElement.lang = lang;
    }, [lang, t.dir]);

    return { lang, setLang: swapLang, t };
}
