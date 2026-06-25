import { Deferred, Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    Building2,
    Calendar as CalendarIcon,
    ChevronRight,
    Download,
    Filter,
    MessageCircle,
    Package,
    Receipt,
    TrendingUp,
    UserPlus,
    Users,
    Wallet,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ComponentType } from 'react';

import { KpiCard } from '@/components/blue-dome/kpi-card';
import { NotificationsPanel } from '@/components/blue-dome/notifications-panel';
import { PageHeader } from '@/components/blue-dome/page-header';
import { SectionCard } from '@/components/blue-dome/section-card';
import { StatusPill } from '@/components/blue-dome/status-pill';
import type { StatusTone } from '@/components/blue-dome/status-pill';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    downloadCsv,
    fmtMonth,
    fmtNumber,
    fmtPercent,
    fmtRelativeTime,
} from '@/lib/format';
import { useSuperAdminLang } from '@/lib/i18n/super-admin-context';
import { useLocale } from '@/lib/i18n/use-locale';
import { cn } from '@/lib/utils';
import superAdmin from '@/routes/super-admin';
import type { NotificationItem } from '@/types/notifications';

interface MrrSummary {
    currency: string;
    amount: number;
    by_plan: Record<string, number>;
}

interface RevenueSummary {
    currency: string;
    amount: number;
}

interface RecentSignup {
    id: string;
    name: string;
    country: string | null;
    created_at: string;
    subscription_plan: string;
}

interface AppointmentCountRow {
    clinic_id: string;
    clinic_name: string;
    count: number;
}

interface MonthlyRevenueRow {
    month: string;
    amount: number;
}

interface TopDoctorRow {
    id: string;
    name: string;
    specialty: string | null;
    clinic_id: string;
    clinic_name: string;
    completed: number;
    scheduled: number;
    utilization: number;
    revenue: number;
}

interface TopClinicRow {
    id: string;
    name: string;
    country: string | null;
    subscription_plan: string | null;
    revenue: number;
    patients_count: number;
    users_count: number;
    appointments_count: number;
}

interface OperationsRow {
    clinic_id: string;
    clinic_name: string;
    scheduled: number;
    arrived: number;
    completed: number;
    no_show: number;
    revenue: number;
}

interface AlertRow {
    kind: string;
    tone: 'danger' | 'warning' | 'info' | 'olive';
    title: string;
    description: string;
    href: string | null;
    clinic_id: string | null;
}

interface ActivityRow {
    id: string;
    action: string;
    entity_type: string;
    entity_id: string | null;
    description: string | null;
    created_at: string | null;
    clinic: { id: string; name: string } | null;
    user: { id: string; name: string; role: string } | null;
}

interface Props {
    metrics: {
        total_clinics: number;
        active_clinics: number;
        mrr: MrrSummary;
        active_appointments_today: number;
        recent_signups: RecentSignup[];
        total_revenue: RevenueSummary;
        total_appointments: number;
        total_patients: number;
        doctor_utilization: number;
        whatsapp_delivery_rate: number;
    };
    appointment_counts_by_clinic?: AppointmentCountRow[];
    monthly_revenue?: MonthlyRevenueRow[];
    top_doctors?: TopDoctorRow[];
    top_clinics?: TopClinicRow[];
    operations_today?: OperationsRow[];
    alerts?: AlertRow[];
    recent_activity?: ActivityRow[];
    recent_notifications: NotificationItem[];
}

const ALERT_TONE_CLASS: Record<string, string> = {
    danger: 'border-danger/30 bg-danger-soft/40',
    warning: 'border-warning/30 bg-warning-soft/40',
    info: 'border-info/30 bg-info-soft/40',
    olive: 'border-olive-500/30 bg-olive-50',
};

const ALERT_ICON_CLASS: Record<string, string> = {
    danger: 'text-danger',
    warning: 'text-warning',
    info: 'text-info',
    olive: 'text-olive-700',
};

const ALERT_ICON: Record<string, ComponentType<{ className?: string }>> = {
    low_inventory: Package,
    overdue_invoices: Receipt,
    pending_invite: UserPlus,
};

const ALERT_PILL: Record<string, StatusTone> = {
    danger: 'danger',
    warning: 'warning',
    info: 'info',
    olive: 'olive',
};

export default function SuperAdminDashboard({
    metrics,
    appointment_counts_by_clinic,
    monthly_revenue,
    top_doctors,
    top_clinics,
    operations_today,
    alerts,
    recent_activity,
    recent_notifications,
}: Props) {
    const { t, lang } = useSuperAdminLang();
    const { slug: locale } = useLocale();

    const [docSort, setDocSort] = useState<'revenue' | 'util' | 'completed'>(
        'completed',
    );
    const [docClinicFilter, setDocClinicFilter] = useState<string>('all');

    const doctorsList = useMemo(() => top_doctors ?? [], [top_doctors]);

    const doctorClinicOptions = useMemo(() => {
        const map = new Map<string, string>();

        for (const d of doctorsList) {
            map.set(d.clinic_id, d.clinic_name);
        }

        return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
    }, [doctorsList]);

    const filteredDoctors = useMemo(() => {
        const list =
            docClinicFilter === 'all'
                ? doctorsList
                : doctorsList.filter((d) => d.clinic_id === docClinicFilter);

        return [...list].sort((a, b) => {
            if (docSort === 'revenue') {
                return b.revenue - a.revenue;
            }

            if (docSort === 'util') {
                return b.utilization - a.utilization;
            }

            return b.completed - a.completed;
        });
    }, [doctorsList, docClinicFilter, docSort]);

    const opsTotals = (operations_today ?? []).reduce(
        (acc, r) => ({
            scheduled: acc.scheduled + r.scheduled,
            arrived: acc.arrived + r.arrived,
            completed: acc.completed + r.completed,
            no_show: acc.no_show + r.no_show,
            revenue: acc.revenue + r.revenue,
        }),
        { scheduled: 0, arrived: 0, completed: 0, no_show: 0, revenue: 0 },
    );

    const exportDoctorsCsv = (): void => {
        downloadCsv(
            `top-doctors-${new Date().toISOString().split('T')[0]}.csv`,
            filteredDoctors.map((d) => ({
                doctor: d.name,
                specialty: d.specialty ?? '',
                clinic: d.clinic_name,
                completed: d.completed,
                scheduled: d.scheduled,
                utilization: `${(d.utilization * 100).toFixed(0)}%`,
                revenue: d.revenue.toFixed(2),
            })),
        );
    };

    const currency = metrics.total_revenue.currency;

    return (
        <>
            <Head title={t.page_title} />

            <div className="px-6 py-5 lg:px-8">
                <PageHeader
                    title={t.page_title}
                    description={`${t.page_clinic} · ${t.page_period_label}`}
                />

                <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
                    <KpiCard
                        label={t.kpi_revenue}
                        value={`${fmtNumber(metrics.total_revenue.amount)} ${currency}`}
                        icon={Wallet}
                        tone="olive"
                    />
                    <KpiCard
                        label={t.kpi_appointments}
                        value={fmtNumber(metrics.total_appointments)}
                        icon={CalendarIcon}
                        tone="navy"
                    />
                    <KpiCard
                        label={t.kpi_patients}
                        value={fmtNumber(metrics.total_patients)}
                        icon={Users}
                        tone="navy"
                    />
                    <KpiCard
                        label={t.kpi_utilization}
                        value={fmtPercent(metrics.doctor_utilization)}
                        icon={TrendingUp}
                        tone="olive"
                    />
                    <KpiCard
                        label={t.kpi_whatsapp}
                        value={fmtPercent(metrics.whatsapp_delivery_rate)}
                        icon={MessageCircle}
                        tone="navy"
                    />
                </div>

                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
                    <div className="flex flex-col gap-5">
                        <NotificationsPanel items={recent_notifications} />
                        <SectionCard
                            title={t.revenue_title}
                            titleIcon={<Wallet className="size-4" />}
                            bodyClassName="p-5"
                        >
                            <div className="mb-3 text-[12px] text-muted-foreground">
                                {t.revenue_sub}
                            </div>
                            <Deferred
                                data="monthly_revenue"
                                fallback={
                                    <div className="h-[220px] animate-pulse rounded bg-muted" />
                                }
                            >
                                <RevenueChart
                                    data={monthly_revenue ?? []}
                                    lang={lang}
                                    currency={currency}
                                />
                            </Deferred>
                        </SectionCard>

                        <SectionCard
                            title={t.doctors_title}
                            actions={
                                <>
                                    <select
                                        value={docClinicFilter}
                                        onChange={(e) =>
                                            setDocClinicFilter(e.target.value)
                                        }
                                        className="h-8 rounded-md border-0 bg-muted px-2 text-[12px] outline-none"
                                    >
                                        <option value="all">
                                            {t.branch_all}
                                        </option>
                                        {doctorClinicOptions.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="gap-1.5"
                                        onClick={() =>
                                            setDocClinicFilter('all')
                                        }
                                    >
                                        <Filter className="size-3.5" />
                                        {t.action_clear}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="gap-1.5"
                                        onClick={exportDoctorsCsv}
                                    >
                                        <Download className="size-3.5" />
                                        {t.action_export}
                                    </Button>
                                </>
                            }
                            bodyClassName="p-0"
                        >
                            <div className="border-b border-border px-5 pb-3 text-[12px] text-muted-foreground">
                                {t.doctors_sub}
                            </div>
                            <Deferred
                                data="top_doctors"
                                fallback={
                                    <div className="space-y-2 px-5 py-4">
                                        {[0, 1, 2].map((i) => (
                                            <div
                                                key={i}
                                                className="h-10 animate-pulse rounded bg-muted"
                                            />
                                        ))}
                                    </div>
                                }
                            >
                                {filteredDoctors.length === 0 ? (
                                    <div className="px-5 py-12 text-center text-sm text-muted-foreground">
                                        {t.empty_no_data}
                                    </div>
                                ) : (
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
                                                <SortHead
                                                    id="completed"
                                                    label={t.th_completed}
                                                    sort={docSort}
                                                    onSort={setDocSort}
                                                    numeric
                                                />
                                                <SortHead
                                                    id="util"
                                                    label={t.th_utilization}
                                                    sort={docSort}
                                                    onSort={setDocSort}
                                                />
                                                <SortHead
                                                    id="revenue"
                                                    label={t.th_revenue}
                                                    sort={docSort}
                                                    onSort={setDocSort}
                                                    numeric
                                                />
                                                <TableHead className="w-8" />
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredDoctors.map((d) => (
                                                <TableRow
                                                    key={d.id}
                                                    className="hover:bg-muted/50"
                                                >
                                                    <TableCell className="px-5 py-3">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="grid size-8 shrink-0 place-items-center rounded-full bg-navy-700 text-xs font-semibold text-white">
                                                                {initials(
                                                                    d.name,
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div className="text-[13px] font-semibold">
                                                                    {d.name ||
                                                                        '—'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-[13px]">
                                                        {d.specialty ?? '—'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Link
                                                            href={superAdmin.clinics.show.url(
                                                                {
                                                                    locale,
                                                                    clinic: d.clinic_id,
                                                                },
                                                            )}
                                                            className="text-[13px] hover:underline"
                                                        >
                                                            {d.clinic_name}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell className="text-end text-[13px] font-semibold text-navy-900 tabular-nums">
                                                        {d.completed}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <div className="relative h-1.5 max-w-[64px] flex-1 overflow-hidden rounded bg-muted">
                                                                <div
                                                                    className="h-full rounded bg-olive-500"
                                                                    style={{
                                                                        width: `${Math.min(100, d.utilization * 100)}%`,
                                                                    }}
                                                                />
                                                            </div>
                                                            <span className="text-[12px] font-semibold tabular-nums">
                                                                {fmtPercent(
                                                                    d.utilization,
                                                                )}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-end text-[13px] font-semibold text-navy-900 tabular-nums">
                                                        {fmtNumber(d.revenue)}{' '}
                                                        <span className="text-[11px] font-normal text-muted-foreground">
                                                            {currency}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <ChevronRight className="size-3.5 text-muted-foreground" />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </Deferred>
                        </SectionCard>

                        <SectionCard
                            title={t.branch_compare_title}
                            actions={
                                <span className="text-[12px] text-muted-foreground">
                                    {t.branch_compare_sub}
                                </span>
                            }
                            bodyClassName="p-5"
                        >
                            <Deferred
                                data="top_clinics"
                                fallback={
                                    <div className="h-32 animate-pulse rounded bg-muted" />
                                }
                            >
                                {(top_clinics ?? []).length === 0 ? (
                                    <div className="text-center text-sm text-muted-foreground">
                                        {t.empty_no_data}
                                    </div>
                                ) : (
                                    <div className="grid gap-5 sm:grid-cols-2">
                                        {(top_clinics ?? []).map((c, idx) => (
                                            <ClinicStats
                                                key={c.id}
                                                clinic={c}
                                                isTop={idx === 0}
                                                t={t}
                                                currency={currency}
                                                locale={locale}
                                            />
                                        ))}
                                    </div>
                                )}
                            </Deferred>
                        </SectionCard>

                        <SectionCard
                            title={t.ops_title}
                            actions={
                                <span className="text-[12px] text-muted-foreground">
                                    {t.ops_sub}
                                </span>
                            }
                            bodyClassName="p-0"
                        >
                            <Deferred
                                data="operations_today"
                                fallback={
                                    <div className="space-y-2 px-5 py-4">
                                        {[0, 1, 2].map((i) => (
                                            <div
                                                key={i}
                                                className="h-10 animate-pulse rounded bg-muted"
                                            />
                                        ))}
                                    </div>
                                }
                            >
                                {(operations_today ?? []).length === 0 ? (
                                    <div className="px-5 py-12 text-center text-sm text-muted-foreground">
                                        {t.empty_no_data}
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/50">
                                                <TableHead className="px-5 py-2.5 text-[11px] tracking-wider uppercase">
                                                    {t.th_clinic}
                                                </TableHead>
                                                <TableHead className="text-end text-[11px] tracking-wider uppercase">
                                                    {t.th_scheduled}
                                                </TableHead>
                                                <TableHead className="text-end text-[11px] tracking-wider uppercase">
                                                    {t.th_arrived}
                                                </TableHead>
                                                <TableHead className="text-end text-[11px] tracking-wider uppercase">
                                                    {t.th_completed}
                                                </TableHead>
                                                <TableHead className="text-end text-[11px] tracking-wider uppercase">
                                                    {t.th_no_show}
                                                </TableHead>
                                                <TableHead className="text-end text-[11px] tracking-wider uppercase">
                                                    {t.th_revenue}
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {(operations_today ?? []).map(
                                                (r) => (
                                                    <TableRow
                                                        key={r.clinic_id}
                                                        className="hover:bg-muted/50"
                                                    >
                                                        <TableCell className="px-5 py-3">
                                                            <Link
                                                                href={superAdmin.clinics.show.url(
                                                                    {
                                                                        locale,
                                                                        clinic: r.clinic_id,
                                                                    },
                                                                )}
                                                                className="text-[13px] font-semibold hover:underline"
                                                            >
                                                                {r.clinic_name}
                                                            </Link>
                                                        </TableCell>
                                                        <TableCell className="text-end text-[13px] tabular-nums">
                                                            {r.scheduled}
                                                        </TableCell>
                                                        <TableCell className="text-end text-[13px] font-semibold text-success tabular-nums">
                                                            {r.arrived}
                                                        </TableCell>
                                                        <TableCell className="text-end text-[13px] font-semibold text-navy-900 tabular-nums">
                                                            {r.completed}
                                                        </TableCell>
                                                        <TableCell
                                                            className={cn(
                                                                'text-end text-[13px] tabular-nums',
                                                                r.no_show > 0
                                                                    ? 'font-semibold text-warning'
                                                                    : 'text-muted-foreground',
                                                            )}
                                                        >
                                                            {r.no_show}
                                                        </TableCell>
                                                        <TableCell className="text-end text-[13px] font-semibold text-navy-900 tabular-nums">
                                                            {fmtNumber(
                                                                r.revenue,
                                                            )}{' '}
                                                            <span className="text-[11px] font-normal text-muted-foreground">
                                                                {currency}
                                                            </span>
                                                        </TableCell>
                                                    </TableRow>
                                                ),
                                            )}
                                        </TableBody>
                                        <TableFooter>
                                            <TableRow>
                                                <TableCell className="px-5 py-3 text-[13px] font-semibold">
                                                    {t.totals}
                                                </TableCell>
                                                <TableCell className="text-end text-[13px] tabular-nums">
                                                    {opsTotals.scheduled}
                                                </TableCell>
                                                <TableCell className="text-end text-[13px] tabular-nums">
                                                    {opsTotals.arrived}
                                                </TableCell>
                                                <TableCell className="text-end text-[13px] tabular-nums">
                                                    {opsTotals.completed}
                                                </TableCell>
                                                <TableCell className="text-end text-[13px] tabular-nums">
                                                    {opsTotals.no_show}
                                                </TableCell>
                                                <TableCell className="text-end text-[13px] font-semibold tabular-nums">
                                                    {fmtNumber(
                                                        opsTotals.revenue,
                                                    )}{' '}
                                                    <span className="text-[11px] font-normal text-muted-foreground">
                                                        {currency}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        </TableFooter>
                                    </Table>
                                )}
                            </Deferred>
                        </SectionCard>
                    </div>

                    <div className="flex flex-col gap-5">
                        <SectionCard
                            title={t.platform_health}
                            titleIcon={<Building2 className="size-4" />}
                            bodyClassName="space-y-3 p-4 text-[13px]"
                        >
                            <PlatformRow
                                label={t.total_clinics}
                                value={fmtNumber(metrics.total_clinics)}
                            />
                            <PlatformRow
                                label={t.active_clinics}
                                value={fmtNumber(metrics.active_clinics)}
                            />
                            <PlatformRow
                                label={t.mrr}
                                value={`${fmtNumber(metrics.mrr.amount)} ${metrics.mrr.currency}`}
                            />
                            <PlatformRow
                                label={t.appointments_today}
                                value={fmtNumber(
                                    metrics.active_appointments_today,
                                )}
                            />
                            <div className="border-t border-border pt-3">
                                <div className="mb-1.5 text-[11px] text-muted-foreground">
                                    {t.appts_per_clinic_7d}
                                </div>
                                <Deferred
                                    data="appointment_counts_by_clinic"
                                    fallback={
                                        <div className="h-12 animate-pulse rounded bg-muted" />
                                    }
                                >
                                    {(appointment_counts_by_clinic ?? [])
                                        .length === 0 ? (
                                        <div className="text-[12px] text-muted-foreground">
                                            {t.empty_no_data}
                                        </div>
                                    ) : (
                                        <ul className="space-y-1 text-[12px]">
                                            {(
                                                appointment_counts_by_clinic ??
                                                []
                                            )
                                                .slice(0, 4)
                                                .map((row) => (
                                                    <li
                                                        key={row.clinic_id}
                                                        className="flex justify-between"
                                                    >
                                                        <Link
                                                            href={superAdmin.clinics.show.url(
                                                                {
                                                                    locale,
                                                                    clinic: row.clinic_id,
                                                                },
                                                            )}
                                                            className="truncate hover:underline"
                                                        >
                                                            {row.clinic_name}
                                                        </Link>
                                                        <span className="font-semibold tabular-nums">
                                                            {row.count}
                                                        </span>
                                                    </li>
                                                ))}
                                        </ul>
                                    )}
                                </Deferred>
                            </div>
                        </SectionCard>

                        <SectionCard
                            title={t.activity_title}
                            actions={
                                <span className="text-[12px] text-muted-foreground">
                                    {t.activity_sub}
                                </span>
                            }
                            bodyClassName="p-0"
                        >
                            <Deferred
                                data="recent_activity"
                                fallback={
                                    <div className="space-y-2 p-4">
                                        {[0, 1, 2, 3].map((i) => (
                                            <div
                                                key={i}
                                                className="h-10 animate-pulse rounded bg-muted"
                                            />
                                        ))}
                                    </div>
                                }
                            >
                                {(recent_activity ?? []).length === 0 ? (
                                    <div className="p-6 text-center text-sm text-muted-foreground">
                                        {t.empty_no_data}
                                    </div>
                                ) : (
                                    <ul className="max-h-[360px] divide-y divide-border overflow-y-auto">
                                        {(recent_activity ?? []).map((a) => (
                                            <li
                                                key={a.id}
                                                className="px-4 py-2.5"
                                            >
                                                <div className="flex items-start gap-2.5">
                                                    <div className="grid size-7 shrink-0 place-items-center rounded-full bg-navy-700 text-[10px] font-semibold text-white">
                                                        {initials(
                                                            a.user?.name ??
                                                                t.system_actor,
                                                        )}
                                                    </div>
                                                    <div className="min-w-0 flex-1 text-[12px] leading-tight">
                                                        <span className="font-semibold">
                                                            {a.user?.name ??
                                                                t.system_actor}
                                                        </span>{' '}
                                                        <span className="text-muted-foreground">
                                                            {a.action.replace(
                                                                /_/g,
                                                                ' ',
                                                            )}{' '}
                                                            {a.entity_type}
                                                        </span>
                                                        {a.clinic && (
                                                            <div className="text-[11px] text-muted-foreground">
                                                                {a.clinic.name}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="shrink-0 text-[11px] text-muted-foreground">
                                                        {fmtRelativeTime(
                                                            a.created_at,
                                                            lang,
                                                        )}
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </Deferred>
                            <div className="border-t border-border px-4 py-2.5">
                                <Link
                                    href={superAdmin.activityLog.url({
                                        locale,
                                    })}
                                    className="text-[12px] font-semibold text-navy-900 hover:underline"
                                >
                                    {t.activity_view_all}
                                </Link>
                            </div>
                        </SectionCard>

                        <SectionCard
                            title={t.alerts_title}
                            actions={
                                <Deferred
                                    data="alerts"
                                    fallback={
                                        <StatusPill tone="neutral">
                                            …
                                        </StatusPill>
                                    }
                                >
                                    <StatusPill
                                        tone={
                                            (alerts ?? []).length > 0
                                                ? 'danger'
                                                : 'success'
                                        }
                                    >
                                        {(alerts ?? []).length}
                                    </StatusPill>
                                </Deferred>
                            }
                            bodyClassName="space-y-2 p-3"
                        >
                            <Deferred
                                data="alerts"
                                fallback={
                                    <div className="space-y-2">
                                        {[0, 1, 2].map((i) => (
                                            <div
                                                key={i}
                                                className="h-16 animate-pulse rounded bg-muted"
                                            />
                                        ))}
                                    </div>
                                }
                            >
                                {(alerts ?? []).length === 0 ? (
                                    <div className="py-6 text-center text-sm text-muted-foreground">
                                        {t.empty_no_alerts}
                                    </div>
                                ) : (
                                    (alerts ?? []).map((a, i) => {
                                        const Icon =
                                            ALERT_ICON[a.kind] ?? AlertTriangle;

                                        return (
                                            <div
                                                key={i}
                                                className={cn(
                                                    'rounded-lg border p-3',
                                                    ALERT_TONE_CLASS[a.tone],
                                                )}
                                            >
                                                <div className="flex items-start gap-2.5">
                                                    <Icon
                                                        className={cn(
                                                            'size-4 shrink-0',
                                                            ALERT_ICON_CLASS[
                                                                a.tone
                                                            ],
                                                        )}
                                                    />
                                                    <div className="min-w-0 flex-1">
                                                        <div className="text-[12px] font-semibold">
                                                            {a.title}
                                                        </div>
                                                        <div className="text-[11px] text-muted-foreground">
                                                            {a.description}
                                                        </div>
                                                    </div>
                                                    {a.href && (
                                                        <Button
                                                            asChild
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-7 text-[11px]"
                                                        >
                                                            <Link href={a.href}>
                                                                <StatusPill
                                                                    tone={
                                                                        ALERT_PILL[
                                                                            a
                                                                                .tone
                                                                        ]
                                                                    }
                                                                >
                                                                    {
                                                                        t.action_view
                                                                    }
                                                                </StatusPill>
                                                            </Link>
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </Deferred>
                        </SectionCard>
                    </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-2.5 shadow-sm">
                    <Button
                        asChild
                        className="gap-1.5 bg-olive-600 text-white hover:bg-olive-700"
                    >
                        <Link href={superAdmin.users.url({ locale })}>
                            <UserPlus className="size-3.5" />
                            {t.dock_invite}
                        </Link>
                    </Button>
                    <span className="h-6 w-px bg-border" />
                    <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5"
                        onClick={exportDoctorsCsv}
                    >
                        <Download className="size-3.5" />
                        {t.dock_export}
                    </Button>
                    <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="gap-1.5"
                    >
                        <Link href={superAdmin.activityLog.url({ locale })}>
                            <AlertTriangle className="size-3.5" />
                            {t.dock_audit}
                        </Link>
                    </Button>
                </div>

                {metrics.recent_signups.length > 0 && (
                    <SectionCard
                        title={t.recent_signups}
                        bodyClassName="space-y-1 p-3 text-[12px]"
                        className="mt-5"
                    >
                        {metrics.recent_signups.slice(0, 5).map((clinic) => (
                            <Link
                                key={clinic.id}
                                href={superAdmin.clinics.show.url({
                                    locale,
                                    clinic: clinic.id,
                                })}
                                className="flex justify-between rounded px-2 py-1.5 hover:bg-muted/40"
                            >
                                <span className="font-semibold">
                                    {clinic.name}
                                </span>
                                <span className="text-muted-foreground">
                                    {clinic.subscription_plan} ·{' '}
                                    {clinic.country ?? '—'}
                                </span>
                            </Link>
                        ))}
                    </SectionCard>
                )}
            </div>
        </>
    );
}

function initials(name: string): string {
    return name
        .replace(/^Dr\.?\s*/i, '')
        .replace(/^د\.\s*/, '')
        .split(/\s+/)
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

function SortHead({
    id,
    label,
    sort,
    onSort,
    numeric,
}: {
    id: 'revenue' | 'util' | 'completed';
    label: string;
    sort: string;
    onSort: (s: 'revenue' | 'util' | 'completed') => void;
    numeric?: boolean;
}) {
    return (
        <TableHead
            onClick={() => onSort(id)}
            className={cn(
                'cursor-pointer text-[11px] tracking-wider uppercase',
                numeric && 'text-end',
            )}
        >
            <span className="inline-flex items-center gap-1">
                {label}
                {sort === id && <span className="text-olive-600">↓</span>}
            </span>
        </TableHead>
    );
}

function RevenueChart({
    data,
    lang,
    currency,
}: {
    data: MonthlyRevenueRow[];
    lang: 'en' | 'fr' | 'ar';
    currency: string;
}) {
    if (data.length === 0) {
        return (
            <div className="py-10 text-center text-sm text-muted-foreground">
                No payments yet.
            </div>
        );
    }

    const max = Math.max(...data.map((d) => d.amount), 1);
    const W = 720;
    const H = 220;
    const P = { l: 12, r: 12, t: 14, b: 28 };
    const innerW = W - P.l - P.r;
    const innerH = H - P.t - P.b;
    const slot = innerW / data.length;
    const bw = Math.min(28, slot * 0.55);
    const ticks = 4;
    const tickVals = Array.from(
        { length: ticks + 1 },
        (_, i) => (max * i) / ticks,
    );

    const ytd = data.reduce((s, d) => s + d.amount, 0);

    return (
        <>
            <div className="mb-2 flex items-end justify-between">
                <div>
                    <div className="text-[11px] tracking-wider text-muted-foreground uppercase">
                        12-month total
                    </div>
                    <div className="text-[22px] font-semibold text-navy-900 tabular-nums">
                        {fmtNumber(ytd)}{' '}
                        <span className="text-[12px] font-semibold text-muted-foreground">
                            {currency}
                        </span>
                    </div>
                </div>
            </div>
            <svg
                viewBox={`0 0 ${W} ${H}`}
                width="100%"
                height={H}
                style={{ display: 'block', direction: 'ltr' }}
            >
                {tickVals.map((v, i) => {
                    const y = P.t + innerH - (v / max) * innerH;

                    return (
                        <g key={i}>
                            <line
                                x1={P.l}
                                y1={y}
                                x2={W - P.r}
                                y2={y}
                                stroke="var(--color-border)"
                                strokeDasharray={i === 0 ? '' : '2 3'}
                            />
                            <text
                                x={W - P.r - 2}
                                y={y - 3}
                                fontSize="9.5"
                                fill="var(--color-muted-foreground)"
                                textAnchor="end"
                                fontFamily="JetBrains Mono"
                            >
                                {v >= 1000
                                    ? `${Math.round(v / 1000)}k`
                                    : Math.round(v)}
                            </text>
                        </g>
                    );
                })}
                {data.map((row, i) => {
                    const x = P.l + slot * i + slot / 2 - bw / 2;
                    const h = (row.amount / max) * innerH;
                    const y = P.t + innerH - h;
                    const isLast = i === data.length - 1;

                    return (
                        <g key={row.month}>
                            <rect
                                x={x}
                                y={y}
                                width={bw}
                                height={h}
                                fill={
                                    isLast
                                        ? 'var(--color-navy-900)'
                                        : 'var(--color-navy-700)'
                                }
                                rx="2"
                            />
                            <text
                                x={x + bw / 2}
                                y={H - 10}
                                fontSize="10.5"
                                fill={
                                    isLast
                                        ? 'var(--color-navy-900)'
                                        : 'var(--color-muted-foreground)'
                                }
                                fontWeight={isLast ? 600 : 400}
                                textAnchor="middle"
                                fontFamily="Inter"
                            >
                                {fmtMonth(row.month, lang)}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </>
    );
}

function ClinicStats({
    clinic,
    isTop,
    t,
    currency,
    locale,
}: {
    clinic: TopClinicRow;
    isTop: boolean;
    t: Record<string, string>;
    currency: string;
    locale: string;
}) {
    return (
        <div>
            <div className="flex items-center gap-2">
                <Link
                    href={superAdmin.clinics.show.url({
                        locale,
                        clinic: clinic.id,
                    })}
                    className="text-[15px] font-semibold text-navy-900 hover:underline"
                >
                    {clinic.name}
                </Link>
                {isTop && <StatusPill tone="olive">{t.main_badge}</StatusPill>}
            </div>
            <div className="mb-3 text-[11px] text-muted-foreground">
                {clinic.country ?? '—'}
            </div>
            <dl className="space-y-1.5 divide-border text-[12px]">
                <StatRow
                    label={t.label_revenue}
                    value={`${fmtNumber(clinic.revenue)} ${currency}`}
                />
                <StatRow
                    label={t.label_patients}
                    value={clinic.patients_count}
                />
                <StatRow label={t.label_staff} value={clinic.users_count} />
                <StatRow
                    label={t.label_appts}
                    value={clinic.appointments_count}
                />
                <StatRow
                    label={t.label_avg_visit}
                    value={clinic.subscription_plan ?? '—'}
                />
            </dl>
        </div>
    );
}

function StatRow({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-semibold tabular-nums">{value}</span>
        </div>
    );
}

function PlatformRow({
    label,
    value,
}: {
    label: string;
    value: string | number;
}) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-semibold text-navy-900 tabular-nums">
                {value}
            </span>
        </div>
    );
}
