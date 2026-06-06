import { Link, router, usePage } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLocale } from '@/lib/i18n/use-locale';
import { cn } from '@/lib/utils';
import { feed, index, read, readAll } from '@/routes/notifications';
import type { NotificationItem } from '@/types/notifications';

const LABELS = {
    en: {
        title: 'Notifications',
        empty: 'No notifications yet',
        markAll: 'Mark all read',
        viewAll: 'View all',
        loading: 'Loading…',
    },
    fr: {
        title: 'Notifications',
        empty: 'Aucune notification',
        markAll: 'Tout marquer comme lu',
        viewAll: 'Tout voir',
        loading: 'Chargement…',
    },
    ar: {
        title: 'الإشعارات',
        empty: 'لا توجد إشعارات',
        markAll: 'تحديد الكل كمقروء',
        viewAll: 'عرض الكل',
        loading: 'جارٍ التحميل…',
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

export function NotificationBell() {
    const { slug: locale, lang } = useLocale();
    const unread = usePage().props.notifications?.unread ?? 0;
    const t = LABELS[lang] ?? LABELS.en;

    const [items, setItems] = useState<NotificationItem[] | null>(null);
    const [loading, setLoading] = useState(false);

    const loadFeed = (): void => {
        setLoading(true);
        fetch(feed.url({ locale }), {
            headers: { Accept: 'application/json' },
            credentials: 'same-origin',
        })
            .then((res) => (res.ok ? res.json() : { items: [] }))
            .then((data: { items?: NotificationItem[] }) =>
                setItems(data.items ?? []),
            )
            .catch(() => setItems([]))
            .finally(() => setLoading(false));
    };

    const markAll = (): void => {
        router.post(
            readAll.url({ locale }),
            {},
            { preserveScroll: true, onSuccess: () => loadFeed() },
        );
    };

    const onItemClick = (item: NotificationItem): void => {
        if (item.kind === 'alert' && item.notification_id && !item.read) {
            router.patch(
                read.url({ locale, notification: item.notification_id }),
                {},
                { preserveScroll: true, preserveState: true },
            );
        }
    };

    return (
        <DropdownMenu onOpenChange={(open) => open && loadFeed()}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className="relative size-9"
                    aria-label={t.title}
                >
                    <Bell className="size-4" />
                    {unread > 0 && (
                        <span className="absolute -end-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white">
                            {unread > 99 ? '99+' : unread}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-80 p-0">
                <div className="flex items-center justify-between border-b border-border px-3 py-2">
                    <span className="text-sm font-semibold">{t.title}</span>
                    {unread > 0 && (
                        <button
                            type="button"
                            onClick={markAll}
                            className="text-xs text-muted-foreground transition hover:text-foreground"
                        >
                            {t.markAll}
                        </button>
                    )}
                </div>

                <div className="max-h-80 overflow-y-auto">
                    {loading && items === null ? (
                        <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                            {t.loading}
                        </p>
                    ) : (items?.length ?? 0) === 0 ? (
                        <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                            {t.empty}
                        </p>
                    ) : (
                        items?.map((item) => {
                            const body = (
                                <div className="flex gap-2 px-3 py-2.5">
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
                                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                                            {formatAt(item.at, lang)}
                                        </p>
                                    </div>
                                </div>
                            );

                            return item.href ? (
                                <Link
                                    key={item.id}
                                    href={item.href}
                                    onClick={() => onItemClick(item)}
                                    className="block border-b border-border/60 transition last:border-0 hover:bg-muted/60"
                                >
                                    {body}
                                </Link>
                            ) : (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => onItemClick(item)}
                                    className="block w-full border-b border-border/60 text-start transition last:border-0 hover:bg-muted/60"
                                >
                                    {body}
                                </button>
                            );
                        })
                    )}
                </div>

                <div className="border-t border-border px-3 py-2 text-center">
                    <Link
                        href={index.url({ locale })}
                        className="text-xs font-medium text-olive-700 hover:underline"
                    >
                        {t.viewAll}
                    </Link>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
