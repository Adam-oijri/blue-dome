import { Link } from '@inertiajs/react';
import { Bell } from 'lucide-react';

import { SectionCard } from '@/components/blue-dome/section-card';
import { useLocale } from '@/lib/i18n/use-locale';
import { cn } from '@/lib/utils';
import { index } from '@/routes/notifications';
import type { NotificationItem } from '@/types/notifications';

const LABELS = {
    en: { title: 'Notifications', empty: 'No notifications yet', viewAll: 'View all' },
    fr: { title: 'Notifications', empty: 'Aucune notification', viewAll: 'Tout voir' },
    ar: { title: 'الإشعارات', empty: 'لا توجد إشعارات', viewAll: 'عرض الكل' },
} as const;

export function NotificationsPanel({ items }: { items: NotificationItem[] }) {
    const { slug: locale, lang } = useLocale();
    const t = LABELS[lang] ?? LABELS.en;

    return (
        <SectionCard
            title={t.title}
            titleIcon={<Bell className="size-4" />}
            bodyClassName="p-0"
            actions={
                <Link
                    href={index.url({ locale })}
                    className="text-xs font-medium text-olive-700 hover:underline"
                >
                    {t.viewAll}
                </Link>
            }
        >
            {items.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-muted-foreground">
                    {t.empty}
                </p>
            ) : (
                <ul className="divide-y divide-border">
                    {items.map((item) => {
                        const row = (
                            <div className="flex gap-2.5 px-5 py-3">
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
                                    <p className="truncate text-sm font-medium">
                                        {item.title}
                                    </p>
                                    {item.message && (
                                        <p className="truncate text-[13px] text-muted-foreground">
                                            {item.message}
                                        </p>
                                    )}
                                </div>
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
    );
}
