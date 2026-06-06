import { Link, router, usePage } from '@inertiajs/react';
import { Search, UserPlus } from 'lucide-react';
import { useState } from 'react';

import { NotificationBell } from '@/components/blue-dome/notification-bell';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useSuperAdminLang } from '@/lib/i18n/super-admin-context';
import { useLocale } from '@/lib/i18n/use-locale';
import { cn } from '@/lib/utils';
import superAdmin from '@/routes/super-admin';

export type SuperAdminPeriod = 'today' | 'week' | 'month' | 'quarter' | 'ytd';

const PERIODS: { id: SuperAdminPeriod; key: string }[] = [
    { id: 'today', key: 'period_today' },
    { id: 'week', key: 'period_week' },
    { id: 'month', key: 'period_month' },
    { id: 'quarter', key: 'period_quarter' },
    { id: 'ytd', key: 'period_ytd' },
];

export function SuperAdminTopbar() {
    const { t } = useSuperAdminLang();
    const { slug: locale } = useLocale();
    const page = usePage();
    const [search, setSearch] = useState('');

    const dashboardUrl = superAdmin.dashboard.url({ locale });
    const isDashboard = page.url.split('?')[0] === dashboardUrl;
    const period =
        (page.props.period as SuperAdminPeriod | undefined) ?? 'month';

    const submitSearch = (e: React.FormEvent): void => {
        e.preventDefault();

        if (!search.trim()) {
            return;
        }

        router.get(
            superAdmin.clinics.index.url({ locale }),
            { search },
            { preserveState: false },
        );
    };

    const changePeriod = (next: SuperAdminPeriod): void => {
        router.get(
            dashboardUrl,
            { period: next },
            { preserveScroll: true, preserveState: false },
        );
    };

    return (
        <header className="flex h-[60px] shrink-0 items-center gap-3 border-b border-border bg-card px-6">
            <SidebarTrigger className="-ms-1 md:hidden" />

            <form
                onSubmit={submitSearch}
                className="relative max-w-[320px] flex-1"
            >
                <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t.search_ph}
                    className={cn(
                        'h-9 w-full rounded-md border border-transparent bg-muted ps-9 pe-3 text-sm transition-[border-color,box-shadow] outline-none',
                        'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
                    )}
                />
            </form>

            {isDashboard && (
                <div className="inline-flex gap-px rounded-md bg-muted p-[3px]">
                    {PERIODS.map((p) => (
                        <button
                            key={p.id}
                            type="button"
                            onClick={() => changePeriod(p.id)}
                            className={cn(
                                'h-7 rounded-sm px-2.5 text-[11px] font-semibold transition-colors',
                                period === p.id
                                    ? 'bg-background text-foreground shadow-xs'
                                    : 'text-muted-foreground hover:text-foreground',
                            )}
                        >
                            {t[p.key] ?? p.id}
                        </button>
                    ))}
                </div>
            )}

            <div className="ms-auto flex items-center gap-2">
                <NotificationBell />

                <Button
                    className="bg-olive-600 text-white hover:bg-olive-700"
                    asChild
                >
                    <Link href={superAdmin.users.url({ locale })}>
                        <UserPlus className="size-4" />
                        {t.cta_invite}
                    </Link>
                </Button>
            </div>
        </header>
    );
}
