import { Head, Link, router } from '@inertiajs/react';
import {
    Activity,
    Download,
    Pencil,
    Search,
    Stethoscope,
    Wallet,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { KpiCard } from '@/components/blue-dome/kpi-card';
import { PageHeader } from '@/components/blue-dome/page-header';
import { SectionCard } from '@/components/blue-dome/section-card';
import { StatusPill } from '@/components/blue-dome/status-pill';
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
import { Pagination } from '@/pages/panels/super-admin/users';
import superAdmin from '@/routes/super-admin';

type DoctorRow = {
    id: string;
    clinic_id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
    is_active: boolean;
    last_login_at: string | null;
    specialty: string | null;
    consultation_fee: string | number | null;
    completed_count: number;
    scheduled_count: number;
    clinic?: { id: string; name: string } | null;
};

type Paginated<T> = {
    data: T[];
    total: number;
    current_page: number;
    last_page: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
};

interface Filters {
    clinic_id: string;
    specialty: string;
    search: string;
    [key: string]: string;
}

interface Props {
    doctors: Paginated<DoctorRow>;
    clinics: Array<{ id: string; name: string }>;
    specialties: string[];
    filters: Filters;
    kpis: {
        total: number;
        active: number;
        completed_30d: number;
        avg_fee: number;
        currency: string;
    };
}

export default function SuperAdminDoctorsPage({
    doctors,
    clinics,
    specialties,
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
                superAdmin.doctors.url({ locale }),
                { ...filters, search },
                { preserveState: true, preserveScroll: true, replace: true },
            );
        }, 350);

        return () => clearTimeout(handle);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const setFilter = (key: keyof Filters, value: string): void => {
        router.get(
            superAdmin.doctors.url({ locale }),
            { ...filters, [key]: value },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    return (
        <>
            <Head title={t.doctors_page_title} />

            <div className="px-6 py-5 lg:px-8">
                <PageHeader
                    title={t.doctors_page_title}
                    description={t.doctors_page_sub}
                    actions={
                        <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="gap-2"
                        >
                            <a
                                href={superAdmin.doctors.export.url(
                                    { locale },
                                    { query: filters },
                                )}
                            >
                                <Download className="size-3.5" />
                                Export
                            </a>
                        </Button>
                    }
                />

                <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                    <KpiCard
                        label={t.doctors_kpi_total}
                        value={fmtNumber(kpis.total)}
                        icon={Stethoscope}
                        tone="navy"
                    />
                    <KpiCard
                        label={t.doctors_kpi_active}
                        value={fmtNumber(kpis.active)}
                        icon={Stethoscope}
                        tone="olive"
                    />
                    <KpiCard
                        label={t.doctors_kpi_completed}
                        value={fmtNumber(kpis.completed_30d)}
                        icon={Activity}
                        tone="navy"
                    />
                    <KpiCard
                        label={t.doctors_kpi_avg_fee}
                        value={`${fmtNumber(kpis.avg_fee)} ${kpis.currency}`}
                        icon={Wallet}
                        tone="olive"
                    />
                </div>

                <SectionCard bodyClassName="p-0">
                    <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-4">
                        <div className="relative max-w-[320px] flex-1">
                            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={t.users_search_ph}
                                className="h-9 w-full rounded-md border border-transparent bg-muted ps-9 pe-3 text-sm outline-none"
                            />
                        </div>
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
                            value={filters.specialty}
                            onChange={(e) =>
                                setFilter('specialty', e.target.value)
                            }
                            className="h-9 rounded-md border-0 bg-muted px-3 text-sm outline-none"
                        >
                            <option value="">
                                {t.doctors_filter_specialty}: {t.status_all}
                            </option>
                            {specialties.map((s) => (
                                <option key={s} value={s}>
                                    {s}
                                </option>
                            ))}
                        </select>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="px-5 py-2.5 text-[11px] tracking-wider uppercase">
                                    {t.th_doctor}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.th_specialty}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.th_clinic}
                                </TableHead>
                                <TableHead className="text-end text-[11px] tracking-wider uppercase">
                                    {t.th_completed}
                                </TableHead>
                                <TableHead className="text-end text-[11px] tracking-wider uppercase">
                                    {t.th_scheduled}
                                </TableHead>
                                <TableHead className="text-end text-[11px] tracking-wider uppercase">
                                    {t.th_consultation_fee}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.th_status}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.th_last_login}
                                </TableHead>
                                <TableHead className="w-12" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {doctors.data.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={9}
                                        className="py-12 text-center text-sm text-muted-foreground"
                                    >
                                        {t.empty_no_results}
                                    </TableCell>
                                </TableRow>
                            )}
                            {doctors.data.map((d) => {
                                const fullName =
                                    `${d.first_name ?? ''} ${d.last_name ?? ''}`.trim() ||
                                    d.email;

                                return (
                                    <TableRow
                                        key={d.id}
                                        className="hover:bg-muted/50"
                                    >
                                        <TableCell className="px-5 py-3">
                                            <div className="flex items-center gap-2.5">
                                                <div className="grid size-8 shrink-0 place-items-center rounded-full bg-navy-700 text-xs font-semibold text-white">
                                                    {initials(fullName)}
                                                </div>
                                                <div>
                                                    <div className="text-[13px] font-semibold">
                                                        {fullName}
                                                    </div>
                                                    <div className="text-[11px] text-muted-foreground">
                                                        {d.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-[13px]">
                                            {d.specialty ?? '—'}
                                        </TableCell>
                                        <TableCell>
                                            {d.clinic ? (
                                                <Link
                                                    href={superAdmin.clinics.show.url(
                                                        {
                                                            locale,
                                                            clinic: d.clinic.id,
                                                        },
                                                    )}
                                                    className="text-[13px] hover:underline"
                                                >
                                                    {d.clinic.name}
                                                </Link>
                                            ) : (
                                                <span className="text-[13px] text-muted-foreground">
                                                    —
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-end text-[13px] font-semibold text-navy-900 tabular-nums">
                                            {d.completed_count}
                                        </TableCell>
                                        <TableCell className="text-end text-[13px] tabular-nums">
                                            {d.scheduled_count}
                                        </TableCell>
                                        <TableCell className="text-end text-[13px] tabular-nums">
                                            {d.consultation_fee
                                                ? `${fmtNumber(Number(d.consultation_fee))} ${kpis.currency}`
                                                : '—'}
                                        </TableCell>
                                        <TableCell>
                                            {d.is_active ? (
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
                                                d.last_login_at,
                                                'en',
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                asChild
                                                variant="ghost"
                                                size="sm"
                                                className="size-7 p-0"
                                                title="Edit profile"
                                            >
                                                <Link
                                                    href={superAdmin.doctors.profile.edit.url(
                                                        {
                                                            locale,
                                                            user: d.id,
                                                        },
                                                    )}
                                                >
                                                    <Pencil className="size-3.5" />
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>

                    <Pagination paginated={doctors} t={t} />
                </SectionCard>
            </div>
        </>
    );
}

function initials(name: string): string {
    return name
        .replace(/^Dr\.?\s*/i, '')
        .split(/\s+/)
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}
