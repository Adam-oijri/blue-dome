import { router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Mail, Send } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';

import type { Lang } from '@/components/landing/shared/types';
import { useLocale } from '@/lib/i18n/use-locale';
import { subscribe } from '@/routes/newsletter';

export function NewsletterForm({ lang }: { lang: Lang }) {
    const { slug: locale } = useLocale();
    const [email, setEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (!email || submitting) {
            return;
        }

        // Emails the address a localized confirmation + sign-in link.
        router.post(
            subscribe.url({ locale }),
            { email },
            {
                preserveScroll: true,
                onStart: () => setSubmitting(true),
                onFinish: () => setSubmitting(false),
                onSuccess: () => {
                    setSubmitted(true);
                    setEmail('');
                    setTimeout(() => setSubmitted(false), 3500);
                },
            },
        );
    };

    return (
        <div>
            <div className="text-[12px] font-semibold tracking-wider text-navy-900 uppercase">
                {lang === 'fr' ? 'Restez informé' : 'Stay in the loop'}
            </div>
            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                {lang === 'fr'
                    ? 'Nouveautés produit, études cliniques, et nos meilleures pratiques médicales — un email par mois.'
                    : 'Product updates, clinical case studies and best practices — one email a month.'}
            </p>
            <form
                onSubmit={handleSubmit}
                className="mt-4 flex items-center gap-2 rounded-lg border border-border bg-card p-1 transition-all focus-within:border-olive-500 focus-within:ring-2 focus-within:ring-olive-500/20"
            >
                <Mail className="ms-2 size-3.5 shrink-0 text-muted-foreground" />
                <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={
                        lang === 'fr' ? 'votre@email.com' : 'you@example.com'
                    }
                    className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground/60"
                />
                <motion.button
                    type="submit"
                    disabled={submitting}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex h-8 items-center gap-1.5 rounded-md bg-navy-900 px-3 text-[12px] font-semibold text-white transition-colors hover:bg-navy-800 disabled:opacity-60"
                >
                    <AnimatePresence mode="wait">
                        {submitted ? (
                            <motion.span
                                key="done"
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                transition={{ duration: 0.2 }}
                                className="inline-flex items-center gap-1.5"
                            >
                                <Check className="size-3.5" />
                                {lang === 'fr' ? 'Inscrit' : 'Subscribed'}
                            </motion.span>
                        ) : (
                            <motion.span
                                key="default"
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                transition={{ duration: 0.2 }}
                                className="inline-flex items-center gap-1.5"
                            >
                                {lang === 'fr' ? 'S’inscrire' : 'Subscribe'}
                                <Send className="size-3" />
                            </motion.span>
                        )}
                    </AnimatePresence>
                </motion.button>
            </form>
        </div>
    );
}
