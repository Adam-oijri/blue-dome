import { useEffect } from 'react';
import type { ReactNode } from 'react';

import { SECRETARY_I18N } from '@/lib/i18n/secretary';
import type { SecretaryDictionary, SecretaryLang } from '@/lib/i18n/secretary';
import { useLocale, useSwapLang } from '@/lib/i18n/use-locale';

type SecretaryLangContextValue = {
    lang: SecretaryLang;
    setLang: (lang: SecretaryLang) => void;
    t: SecretaryDictionary;
};

export function SecretaryLangProvider({ children }: { children: ReactNode }) {
    return <>{children}</>;
}

export function useSecretaryLang(): SecretaryLangContextValue {
    const { lang } = useLocale();
    const swapLang = useSwapLang();
    const t = SECRETARY_I18N[lang];

    useEffect(() => {
        if (typeof document === 'undefined') {
            return;
        }

        document.documentElement.dir = t.dir;
        document.documentElement.lang = lang;
    }, [lang, t.dir]);

    return { lang, setLang: swapLang, t };
}
