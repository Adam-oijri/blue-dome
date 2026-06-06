import { Head, Link } from '@inertiajs/react';

import { PageHeader } from '@/components/blue-dome/page-header';
import { SectionCard } from '@/components/blue-dome/section-card';
import { useLocale } from '@/lib/i18n/use-locale';
import { cn } from '@/lib/utils';
import type { NotificationItem } from '@/types/notifications';

const LABELS = {
    en: {
        title: 'Notifications',
        description: 'Recent activity and alerts across your clinic',
        empty: 'No notifications yet',
    },
    fr: {
        title: 'Notifications',
        description: "Activité et alertes récentes de votre clinique",
        empty: 'Aucune notification',
    },
    ar: {
        title: 'الإشعارات',
        description: 'النشاط والتنبيهات الأخيرة في عيادتك',
        empty: 'لا توجد إشعارات',
    },
} as const;

function formatAt(at: string | null, lang: string): string {
    if (!at) {
        return '';
    }

    try {
        return new Intl.DateTimeFormat(lang, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(at));
    } catch {
        return '';
    }
}

export default function NotificationsIndex({
    items,
}: {
    items: NotificationItem[];
}) {
    const { lang } = useLocale();
    const t = LABELS[lang] ?? LABELS.en;

    return (
        <>
            <Head title={t.title} />

            <div className="px-8 py-6 lg:px-10">
                <PageHeader title={t.title} description={t.description} />

                <SectionCard bodyClassName="p-0" className="mt-5">
                    {items.length === 0 ? (
                        <p className="px-5 py-10 text-center text-sm text-muted-foreground">
                            {t.empty}
                        </p>
                    ) : (
                        <ul className="divide-y divide-border">
                            {items.map((item) => {
                                const row = (
                                    <div className="flex gap-3 px-5 py-3.5">
                                        <span
                                            className={cn(
                                                'mt-1.5 size-2 shrink-0 rounded-full',
                                                item.read
                                                    ? 'bg-transparent'
                                                    : item.important
                                                      ? 'bg-danger'
                                                      : 'bg-olive-500',
                                            )}
                                        />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium">
                                                {item.title}
                                            </p>
                                            {item.message && (
                                                <p className="text-[13px] text-muted-foreground">
                                                    {item.message}
                                                </p>
                                            )}
                                        </div>
                                        <span className="shrink-0 text-[11px] text-muted-foreground">
                                            {formatAt(item.at, lang)}
                                        </span>
                                    </div>
                                );

                                return (
                                    <li key={item.id}>
                                        {item.href ? (
                                            <Link
                                                href={item.href}
                                                className="block transition hover:bg-muted/60"
                                            >
                                                {row}
                                            </Link>
                                        ) : (
                                            row
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </SectionCard>
            </div>
        </>
    );
}
