import { Head, Link, router } from '@inertiajs/react';
import { Search, UserCog, Users as UsersIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { InviteStaffSheet } from '@/components/blue-dome/invite-staff-sheet';
import { KpiCard } from '@/components/blue-dome/kpi-card';
import { PageHeader } from '@/components/blue-dome/page-header';
import { SectionCard } from '@/components/blue-dome/section-card';
import { StatusPill } from '@/components/blue-dome/status-pill';
import type { StatusTone } from '@/components/blue-dome/status-pill';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { fmtNumber, fmtRelativeTime } from '@/lib/format';
import { useSuperAdminLang } from '@/lib/i18n/super-admin-context';
import { useLocale } from '@/lib/i18n/use-locale';
import { cn } from '@/lib/utils';
import superAdmin from '@/routes/super-admin';

type UserRow = {
    id: string;
    clinic_id: string | null;
    first_name: string | null;
    last_name: string | null;
    email: string;
    role: 'super_admin' | 'doctor' | 'secretary';
    is_active: boolean;
    last_login_at: string | null;
    deleted_at: string | null;
    clinic?: { id: string; name: string } | null;
};

type ClinicOpt = { id: string; name: string };

type Paginated<T> = {
    data: T[];
    total: number;
    current_page: number;
    last_page: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
};

interface Filters {
    role: string;
    clinic_id: string;
    status: 'all' | 'active' | 'inactive' | 'deleted' | string;
    search: string;
}

interface Props {
    users: Paginated<UserRow>;
    clinics: ClinicOpt[];
    filters: Filters;
    kpis: {
        total: number;
        active: number;
        doctors: number;
        secretaries: number;
    };
}

const ROLE_TONE: Record<string, StatusTone> = {
    super_admin: 'navy',
    doctor: 'info',
    secretary: 'neutral',
};

export default function SuperAdminUsersPage({
    users,
    clinics,
    filters,
    kpis,
}: Props) {
    const { t } = useSuperAdminLang();
    const { slug: locale } = useLocale();

    const [search, setSearch] = useState(filters.search ?? '');

    useEffect(() => {
        const handle = setTimeout(() => {
            if (search === filters.search) {
                return;
            }

            router.get(
                superAdmin.users.url({ locale }),
                {
                    search,
                    role: filters.role,
                    clinic_id: filters.clinic_id,
                    status: filters.status,
                },
                { preserveState: true, preserveScroll: true, replace: true },
            );
        }, 350);

        return () => clearTimeout(handle);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const setFilter = (key: keyof Filters, value: string): void => {
        router.get(
            superAdmin.users.url({ locale }),
            { ...filters, [key]: value },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    return (
        <>
            <Head title={t.users_page_title} />

            <div className="px-6 py-5 lg:px-8">
                <PageHeader
                    title={t.users_page_title}
                    description={t.users_page_sub}
                    actions={<InviteStaffSheet clinics={clinics} />}
                />

                <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                    <KpiCard
                        label={t.users_kpi_total}
                        value={fmtNumber(kpis.total)}
                        icon={UsersIcon}
                        tone="navy"
                    />
                    <KpiCard
                        label={t.users_kpi_active}
                        value={fmtNumber(kpis.active)}
                        icon={UsersIcon}
                        tone="olive"
                    />
                    <KpiCard
                        label={t.users_kpi_doctors}
                        value={fmtNumber(kpis.doctors)}
                        icon={UserCog}
                        tone="navy"
                    />
                    <KpiCard
                        label={t.users_kpi_secretaries}
                        value={fmtNumber(kpis.secretaries)}
                        icon={UserCog}
                        tone="navy"
                    />
                </div>

                <SectionCard bodyClassName="p-0">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
                        <div className="relative max-w-[320px] flex-1">
                            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={t.users_search_ph}
                                className="h-9 w-full rounded-md border border-transparent bg-muted ps-9 pe-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <select
                                value={filters.role}
                                onChange={(e) =>
                                    setFilter('role', e.target.value)
                                }
                                className="h-9 rounded-md border-0 bg-muted px-3 text-sm outline-none"
                            >
                                <option value="">
                                    {t.users_filter_role}: {t.status_all}
                                </option>
                                <option value="super_admin">
                                    {t.role_super_admin}
                                </option>
                                <option value="doctor">{t.role_doctor}</option>
                                <option value="secretary">
                                    {t.role_secretary}
                                </option>
                            </select>
                            <select
                                value={filters.clinic_id}
                                onChange={(e) =>
                                    setFilter('clinic_id', e.target.value)
                                }
                                className="h-9 rounded-md border-0 bg-muted px-3 text-sm outline-none"
                            >
                                <option value="">
                                    {t.users_filter_clinic}: {t.status_all}
                                </option>
                                {clinics.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={filters.status}
                                onChange={(e) =>
                                    setFilter('status', e.target.value)
                                }
                                className="h-9 rounded-md border-0 bg-muted px-3 text-sm outline-none"
                            >
                                <option value="all">
                                    {t.users_filter_status}: {t.status_all}
                                </option>
                                <option value="active">
                                    {t.status_active}
                                </option>
                                <option value="inactive">
                                    {t.status_inactive}
                                </option>
                                <option value="deleted">
                                    {t.status_deleted}
                                </option>
                            </select>
                        </div>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="px-5 py-2.5 text-[11px] tracking-wider uppercase">
                                    {t.th_doctor}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.th_email}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.th_role}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.th_clinic}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.th_status}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.th_last_login}
                                </TableHead>
                                <TableHead className="text-end text-[11px] tracking-wider uppercase">
                                    {t.th_action}
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.data.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="py-12 text-center text-sm text-muted-foreground"
                                    >
                                        {t.empty_no_results}
                                    </TableCell>
                                </TableRow>
                            )}
                            {users.data.map((u) => {
                                const fullName =
                                    `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim() ||
                                    u.email;

                                return (
                                    <TableRow
                                        key={u.id}
                                        className="hover:bg-muted/50"
                                    >
                                        <TableCell className="px-5 py-3">
                                            <div className="flex items-center gap-2.5">
                                                <div className="grid size-8 shrink-0 place-items-center rounded-full bg-navy-700 text-xs font-semibold text-white">
                                                    {initials(fullName)}
                                                </div>
                                                <span className="text-[13px] font-semibold">
                                                    {fullName}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-[13px]">
                                            {u.email}
                                        </TableCell>
                                        <TableCell>
                                            <StatusPill
                                                tone={
                                                    ROLE_TONE[u.role] ??
                                                    'neutral'
                                                }
                                            >
                                                {t[`role_${u.role}`] ?? u.role}
                                            </StatusPill>
                                        </TableCell>
                                        <TableCell>
                                            {u.clinic ? (
                                                <Link
                                                    href={superAdmin.clinics.show.url(
                                                        {
                                                            locale,
                                                            clinic: u.clinic.id,
                                                        },
                                                    )}
                                                    className="text-[13px] hover:underline"
                                                >
                                                    {u.clinic.name}
                                                </Link>
                                            ) : (
                                                <span className="text-[13px] text-muted-foreground">
                                                    —
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {u.deleted_at ? (
                                                <StatusPill tone="neutral">
                                                    {t.status_deleted}
                                                </StatusPill>
                                            ) : u.is_active ? (
                                                <StatusPill
                                                    tone="success"
                                                    withDot
                                                >
                                                    {t.status_active}
                                                </StatusPill>
                                            ) : (
                                                <StatusPill
                                                    tone="warning"
                                                    withDot
                                                >
                                                    {t.status_inactive}
                                                </StatusPill>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-[12px] text-muted-foreground">
                                            {fmtRelativeTime(
                                                u.last_login_at,
                                                'en',
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-end gap-1">
                                                {u.clinic && (
                                                    <Button
                                                        asChild
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7"
                                                    >
                                                        <Link
                                                            href={superAdmin.clinics.show.url(
                                                                {
                                                                    locale,
                                                                    clinic: u
                                                                        .clinic
                                                                        .id,
                                                                },
                                                            )}
                                                        >
                                                            {t.action_view}
                                                        </Link>
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>

                    <Pagination paginated={users} t={t} />
                </SectionCard>
            </div>
        </>
    );
}

function initials(name: string): string {
    return name
        .split(/\s+/)
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

export function Pagination<T>({
    paginated,
    t,
}: {
    paginated: Paginated<T>;
    t: Record<string, string>;
}) {
    if (paginated.last_page <= 1) {
        return null;
    }

    const summary = (
        t.pagination_summary ?? 'Page {current} of {last} · {total}'
    )
        .replace('{current}', String(paginated.current_page))
        .replace('{last}', String(paginated.last_page))
        .replace('{total}', String(paginated.total));

    return (
        <div className="flex items-center justify-between border-t border-border px-5 py-3 text-[12px]">
            <span className="text-muted-foreground">{summary}</span>
            <div className="flex items-center gap-1">
                {paginated.links.map((link, i) => (
                    <Link
                        key={i}
                        href={link.url ?? '#'}
                        preserveScroll
                        preserveState
                        className={cn(
                            'rounded px-2 py-1 text-[12px]',
                            link.active
                                ? 'bg-navy-900 text-white'
                                : link.url
                                  ? 'text-muted-foreground hover:bg-muted'
                                  : 'pointer-events-none text-muted-foreground/50',
                        )}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ))}
            </div>
        </div>
    );
}
