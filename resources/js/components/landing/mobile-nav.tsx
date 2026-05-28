import { Link } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { LangPill } from '@/components/landing/lang-pill';
import { NAV } from '@/components/landing/shared/content';
import type { Lang } from '@/components/landing/shared/types';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/lib/i18n/use-locale';
import { dashboard, login } from '@/routes';

interface MobileNavProps {
    lang: Lang;
    authed: boolean;
    canRegister: boolean;
}

export function MobileNav({ lang, authed, canRegister }: MobileNavProps) {
    const [open, setOpen] = useState(false);
    const { slug: locale } = useLocale();

    useEffect(() => {
        if (!open) {
            return;
        }

        const original = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = original;
        };
    }, [open]);

    return (
        <div className="md:hidden">
            <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label="Open menu"
                className="grid size-9 place-items-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
            >
                <Menu className="size-5" />
            </button>

            <AnimatePresence>
                {open && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            onClick={() => setOpen(false)}
                            aria-hidden
                            className="fixed inset-0 z-[70] bg-navy-950/40 backdrop-blur-sm"
                        />
                        <motion.aside
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{
                                type: 'spring',
                                stiffness: 240,
                                damping: 28,
                            }}
                            className="fixed end-0 top-0 bottom-0 z-[71] flex w-[84vw] max-w-sm flex-col border-s border-border bg-card p-6 shadow-2xl"
                        >
                            <div className="flex items-center justify-between">
                                <div className="text-[14px] font-bold tracking-wide text-navy-900">
                                    BLUE DOME
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setOpen(false)}
                                    aria-label="Close menu"
                                    className="grid size-9 place-items-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    <X className="size-5" />
                                </button>
                            </div>

                            <nav className="mt-10 flex flex-col gap-1">
                                {NAV.map((n, i) => (
                                    <motion.a
                                        key={n.href}
                                        href={n.href}
                                        onClick={() => setOpen(false)}
                                        initial={{ opacity: 0, x: 16 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{
                                            delay: 0.05 + i * 0.06,
                                            duration: 0.3,
                                        }}
                                        className="rounded-md px-3 py-3 text-[18px] font-semibold text-foreground transition-colors hover:bg-muted"
                                    >
                                        {n.label[lang]}
                                    </motion.a>
                                ))}
                            </nav>

                            <div className="mt-auto space-y-4">
                                <LangPill className="!flex w-full justify-center" />

                                {authed ? (
                                    <Button
                                        asChild
                                        className="w-full bg-navy-900 text-white hover:bg-navy-800"
                                    >
                                        <Link href={dashboard({ locale })}>
                                            Dashboard
                                        </Link>
                                    </Button>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        <Button
                                            variant="outline"
                                            asChild
                                            className="w-full"
                                        >
                                            <Link href={login({ locale })}>
                                                {lang === 'fr'
                                                    ? 'Connexion'
                                                    : 'Sign in'}
                                            </Link>
                                        </Button>
                                        {canRegister && (
                                            <Button
                                                asChild
                                                className="w-full bg-navy-900 text-white hover:bg-navy-800"
                                            >
                                                <Link href="/register">
                                                    {lang === 'fr'
                                                        ? 'Démarrer'
                                                        : 'Get started'}
                                                </Link>
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
