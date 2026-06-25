import { motion } from 'framer-motion';

import { useLocale, useSwapLang } from '@/lib/i18n/use-locale';
import type { AppLang } from '@/lib/i18n/use-locale';
import { cn } from '@/lib/utils';

// Marketing-route language switcher. Fully trilingual, matching the app.
const LANGS: AppLang[] = ['en', 'fr', 'ar'];

interface LangPillProps {
    className?: string;
}

export function LangPill({ className }: LangPillProps) {
    const { lang } = useLocale();
    const swapLang = useSwapLang();

    return (
        <div
            className={cn(
                'hidden gap-px rounded-md bg-muted p-[3px] sm:inline-flex',
                className,
            )}
        >
            {LANGS.map((l) => {
                const active = lang === l;

                return (
                    <button
                        key={l}
                        type="button"
                        onClick={() => swapLang(l)}
                        className={cn(
                            'relative h-7 rounded-sm px-2.5 text-[11px] font-semibold tracking-wider transition-colors',
                            active
                                ? 'text-foreground'
                                : 'text-muted-foreground hover:text-foreground',
                        )}
                    >
                        {active && (
                            <motion.span
                                layoutId="lang-pill-indicator"
                                className="absolute inset-0 rounded-sm bg-background shadow-xs"
                                transition={{
                                    type: 'spring',
                                    bounce: 0.2,
                                    duration: 0.5,
                                }}
                            />
                        )}
                        <span className="relative">{l.toUpperCase()}</span>
                    </button>
                );
            })}
        </div>
    );
}
