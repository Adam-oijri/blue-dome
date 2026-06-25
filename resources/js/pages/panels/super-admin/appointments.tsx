import { Head, Link, router } from '@inertiajs/react';
import { Calendar, CheckCircle2, Download, Slash, XCircle } from 'lucide-react';

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
import { fmtNumber } from '@/lib/format';
import { enumLabel } from '@/lib/i18n/doctor';
import { useSuperAdminLang } from '@/lib/i18n/super-admin-context';
import { useLocale } from '@/lib/i18n/use-locale';
import { Pagination } from '@/pages/panels/super-admin/users';
import superAdmin from '@/routes/super-admin';

type AppointmentRow = {
    id: string;
    clinic_id: string;
    status: string;
    appointment_day: string | null;
    scheduled_start: string | null;
    scheduled_end: string | null;
    confirmation_status: string | null;
    clinic?: { id: string; name: string } | null;
    patient?: {
        id: string;
        first_name: string | null;
        last_name: string | null;
    } | null;
    doctor?: {
        id: string;
        first_name: string | null;
        last_name: string | null;
    } | null;
};

type Paginated<T> = {
    data: T[];
    total: number;
    current_page: number;
    last_page: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
};

interface Filters {
    status: string;
    clinic_id: string;
    from: string | null;
    to: string | null;
    [key: string]: string | null;
}

interface Props {
    appointments: Paginated<AppointmentRow>;
    clinics: Array<{ id: string; name: string }>;
    filters: Filters;
    kpis: {
        total: number;
        completed: number;
        cancelled: number;
        no_show: number;
    };
}

const STATUS_TONE: Record<string, StatusTone> = {
    scheduled: 'navy',
    confirmed: 'info',
    arrived: 'olive',
    in_progress: 'olive',
    completed: 'success',
    cancelled: 'danger',
    no_show: 'warning',
    rescheduled: 'neutral',
};

export default function SuperAdminAppointmentsPage({
    appointments,
    clinics,
    filters,
    kpis,
}: Props) {
    const { t } = useSuperAdminLang();
    const { slug: locale } = useLocale();
    const statusLabels: Record<string, string> = {
        scheduled: t.appt_status_scheduled,
        confirmed: t.appt_status_confirmed,
        arrived: t.appt_status_arrived,
        in_progress: t.appt_status_in_progress,
        completed: t.appt_status_completed,
        cancelled: t.appt_status_cancelled,
        no_show: t.appt_status_no_show,
    };

    const setFilter = (key: keyof Filters, value: string): void => {
        router.get(
            superAdmin.appointments.url({ locale }),
            { ...filters, [key]: value || undefined },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    return (
        <>
            <Head title={t.appts_page_title} />

            <div className="px-6 py-5 lg:px-8">
                <PageHeader
                    title={t.appts_page_title}
                    description={t.appts_page_sub}
                    actions={
                        <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="gap-2"
                        >
                            <a
                                href={superAdmin.appointments.export.url(
                                    { locale },
                                    { query: filters },
                                )}
                            >
                                <Download className="size-3.5" />
                                {t.action_export}
                            </a>
                        </Button>
                    }
                />

                <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                    <KpiCard
                        label={t.appts_kpi_total}
                        value={fmtNumber(kpis.total)}
                        icon={Calendar}
                        tone="navy"
                    />
                    <KpiCard
                        label={t.appts_kpi_completed}
                        value={fmtNumber(kpis.completed)}
                        icon={CheckCircle2}
                        tone="olive"
                    />
                    <KpiCard
                        label={t.appts_kpi_cancelled}
                        value={fmtNumber(kpis.cancelled)}
                        icon={XCircle}
                        tone="warn"
                    />
                    <KpiCard
                        label={t.appts_kpi_no_show}
                        value={fmtNumber(kpis.no_show)}
                        icon={Slash}
                        tone="warn"
                    />
                </div>

                <SectionCard bodyClassName="p-0">
                    <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-4">
                        <select
                            value={filters.status}
                            onChange={(e) =>
                                setFilter('status', e.target.value)
                            }
                            className="h-9 rounded-md border-0 bg-muted px-3 text-sm outline-none"
                        >
                            <option value="">
                                {t.appts_filter_status}: {t.status_all}
                            </option>
                            <option value="scheduled">
                                {enumLabel(statusLabels, 'scheduled')}
                            </option>
                            <option value="confirmed">
                                {enumLabel(statusLabels, 'confirmed')}
                            </option>
                            <option value="arrived">
                                {enumLabel(statusLabels, 'arrived')}
                            </option>
                            <option value="in_progress">
                                {enumLabel(statusLabels, 'in_progress')}
                            </option>
                            <option value="completed">
                                {enumLabel(statusLabels, 'completed')}
                            </option>
                            <option value="cancelled">
                                {enumLabel(statusLabels, 'cancelled')}
                            </option>
                            <option value="no_show">
                                {enumLabel(statusLabels, 'no_show')}
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
                                {t.th_clinic}: {t.status_all}
                            </option>
                            {clinics.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                        <label className="text-[12px] text-muted-foreground">
                            {t.appts_filter_from}
                            <input
                                type="date"
                                value={filters.from ?? ''}
                                onChange={(e) =>
                                    setFilter('from', e.target.value)
                                }
                                className="ms-2 h-9 rounded-md border-0 bg-muted px-3 text-sm outline-none"
                            />
                        </label>
                        <label className="text-[12px] text-muted-foreground">
                            {t.appts_filter_to}
                            <input
                                type="date"
                                value={filters.to ?? ''}
                                onChange={(e) =>
                                    setFilter('to', e.target.value)
                                }
                                className="ms-2 h-9 rounded-md border-0 bg-muted px-3 text-sm outline-none"
                            />
                        </label>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="px-5 py-2.5 text-[11px] tracking-wider uppercase">
                                    {t.th_date}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.th_clinic}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.th_patient}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.th_doctor}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.th_status}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.th_confirmation}
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {appointments.data.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="py-12 text-center text-sm text-muted-foreground"
                                    >
                                        {t.empty_no_results}
                                    </TableCell>
                                </TableRow>
                            )}
                            {appointments.data.map((a) => (
                                <TableRow
                                    key={a.id}
                                    className="hover:bg-muted/50"
                                >
                                    <TableCell className="px-5 py-3 text-[13px]">
                                        <div>{a.appointment_day ?? '—'}</div>
                                        {a.scheduled_start && (
                                            <div className="text-[11px] text-muted-foreground">
                                                {new Date(
                                                    a.scheduled_start,
                                                ).toLocaleTimeString(
                                                    undefined,
                                                    {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    },
                                                )}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {a.clinic ? (
                                            <Link
                                                href={superAdmin.clinics.show.url(
                                                    {
                                                        locale,
                                                        clinic: a.clinic.id,
                                                    },
                                                )}
                                                className="text-[13px] hover:underline"
                                            >
                                                {a.clinic.name}
                                            </Link>
                                        ) : (
                                            <span className="text-[13px] text-muted-foreground">
                                                —
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-[13px]">
                                        {a.patient
                                            ? `${a.patient.first_name ?? ''} ${a.patient.last_name ?? ''}`.trim()
                                            : '—'}
                                    </TableCell>
                                    <TableCell className="text-[13px]">
                                        {a.doctor
                                            ? `${a.doctor.first_name ?? ''} ${a.doctor.last_name ?? ''}`.trim()
                                            : '—'}
                                    </TableCell>
                                    <TableCell>
                                        <StatusPill
                                            tone={
                                                STATUS_TONE[a.status] ??
                                                'neutral'
                                            }
                                            withDot
                                        >
                                            {a.status.replace(/_/g, ' ')}
                                        </StatusPill>
                                    </TableCell>
                                    <TableCell className="text-[12px] text-muted-foreground">
                                        {a.confirmation_status?.replace(
                                            /_/g,
                                            ' ',
                                        ) ?? '—'}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <Pagination paginated={appointments} t={t} />
                </SectionCard>
            </div>
        </>
    );
}
