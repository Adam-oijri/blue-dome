import { Link, usePage } from '@inertiajs/react';
import { Check } from 'lucide-react';

import { BrandIconMark } from '@/components/blue-dome/brand-icon-mark';
import { useAuthLang } from '@/lib/i18n/auth-context';
import { useLocale } from '@/lib/i18n/use-locale';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { name } = usePage().props;
    const { slug: locale } = useLocale();
    const { t } = useAuthLang();

    const brand = (name as string) ?? 'BlueDome';
    const features = [
        t.feature_secure,
        t.feature_appointments,
        t.feature_bilingual,
    ];

    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            {/* Brand panel — desktop only */}
            <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-navy-950 to-navy-800 p-12 text-white lg:flex">
                <span
                    className="pointer-events-none absolute end-[-15%] top-[-20%] size-[520px] rounded-full"
                    style={{
                        background:
                            'radial-gradient(circle, rgba(134, 158, 71, 0.22), transparent 70%)',
                    }}
                    aria-hidden
                />
                <Link
                    href={home({ locale })}
                    className="relative z-10 flex items-center gap-3"
                >
                    <BrandIconMark size="lg" />
                    <span className="text-lg font-bold tracking-wide">
                        {brand}
                    </span>
                </Link>

                <div className="relative z-10">
                    <h2 className="text-3xl font-semibold leading-tight">
                        {t.brand_tagline}
                    </h2>
                    <ul className="mt-8 space-y-3">
                        {features.map((feature) => (
                            <li
                                key={feature}
                                className="flex items-center gap-3"
                            >
                                <span className="grid size-6 place-items-center rounded-full bg-olive-600/90">
                                    <Check className="size-3.5" />
                                </span>
                                <span className="text-[15px] text-navy-100">
                                    {feature}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="relative z-10 text-[12px] text-navy-100/70">
                    © {brand}
                </div>
            </div>

            {/* Form column */}
            <div className="flex flex-col items-center justify-center bg-background p-6 md:p-10">
                <div className="w-full max-w-sm">
                    <Link
                        href={home({ locale })}
                        className="mb-8 flex items-center justify-center gap-2.5 lg:hidden"
                    >
                        <BrandIconMark size="md" />
                        <span className="text-[15px] font-bold tracking-wide text-navy-800 dark:text-white">
                            {brand}
                        </span>
                    </Link>

                    {(title || description) && (
                        <div className="mb-6 space-y-1.5 text-center">
                            {title && (
                                <h1 className="text-xl font-semibold tracking-tight">
                                    {title}
                                </h1>
                            )}
                            {description && (
                                <p className="text-sm text-muted-foreground">
                                    {description}
                                </p>
                            )}
                        </div>
                    )}

                    {children}
                </div>
            </div>
        </div>
    );
}
