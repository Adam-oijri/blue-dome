import { useEffect } from 'react';
import type { ReactNode } from 'react';

import { DOCTOR_I18N } from '@/lib/i18n/doctor';
import type { DoctorDictionary, DoctorLang } from '@/lib/i18n/doctor';
import { useLocale, useSwapLang } from '@/lib/i18n/use-locale';

type DoctorLangContextValue = {
    lang: DoctorLang;
    setLang: (lang: DoctorLang) => void;
    t: DoctorDictionary;
};

export function DoctorLangProvider({ children }: { children: ReactNode }) {
    return <>{children}</>;
}

export function useDoctorLang(): DoctorLangContextValue {
    const { lang } = useLocale();
    const swapLang = useSwapLang();
    const t = DOCTOR_I18N[lang];

    useEffect(() => {
        if (typeof document === 'undefined') {
            return;
        }

        document.documentElement.dir = t.dir;
        document.documentElement.lang = lang;
    }, [lang, t.dir]);

    return { lang, setLang: swapLang, t };
}
