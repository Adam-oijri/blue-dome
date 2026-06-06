import { Head, router } from '@inertiajs/react';
import { Calendar as CalendarIcon, Check, Clock, X } from 'lucide-react';

import { CreateAppointmentSheet } from '@/components/blue-dome/create-appointment-sheet';
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
import type { SecretaryDictionary } from '@/lib/i18n/secretary';
import { useSecretaryLang } from '@/lib/i18n/secretary-context';
import { useLocale } from '@/lib/i18n/use-locale';
import { cn } from '@/lib/utils';
import { appointments as appointmentsRoute } from '@/routes/secretary';

type Person = {
    id: string;
    first_name: string | null;
    last_name: string | null;
} | null;

type Patient = {
    id: string;
    first_name: string | null;
    last_name: string | null;
    gender: 'male' | 'female' | 'other' | null;
    blood_type: string | null;
    chronic_diseases: string | null;
} | null;

type AppointmentRow = {
    id: string;
    patient_id: string;
    doctor_id: string;
    scheduled_start: string | null;
    scheduled_end: string | null;
    status: string;
    type: string | null;
    duration_minutes: number | null;
    patient?: Patient;
    doctor?: Person;
};

type Range = 'today' | 'tomorrow' | 'week';

interface Props {
    appointments: AppointmentRow[];
    kpis: {
        today_count: number;
        pending: number;
        confirmed: number;
        cancelled: number;
    };
    filters: {
        range: Range;
    };
}

const STATUS_TONE: Record<string, StatusTone> = {
    scheduled: 'navy',
    confirmed: 'olive',
    arrived: 'info',
    in_progress: 'info',
    completed: 'success',
    cancelled: 'danger',
    no_show: 'warning',
    rescheduled: 'neutral',
};

const STATUS_LABEL_KEY: Record<string, string> = {
    scheduled: 'ap_status_scheduled',
    confirmed: 'sched_legend_confirmed',
    arrived: 'wr_status_arrived',
    in_progress: 'sched_legend_in_progress',
    completed: 'sched_legend_completed',
    cancelled: 'sched_legend_cancelled',
    no_show: 'ap_status_no_show',
    rescheduled: 'ap_status_rescheduled',
};

const fullName = (p?: Person | Patient): string =>
    p ? `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || '—' : '—';

const initials = (p?: Person | Patient): string =>
    p
        ? `${p.first_name?.[0] ?? ''}${p.last_name?.[0] ?? ''}`.toUpperCase() ||
          '?'
        : '?';

const timeOf = (iso: string | null): string => (iso ? iso.slice(11, 16) : '—');

const isChronic = (p?: Patient): boolean =>
    !!p?.chronic_diseases && p.chronic_diseases.trim().length > 0;

export default function SecretaryAppointments({
    appointments,
    kpis,
    filters,
}: Props) {
    const { t } = useSecretaryLang();
    const { slug: locale } = useLocale();

    const statusTone = (s: string): StatusTone => STATUS_TONE[s] ?? 'neutral';
    const statusLabel = (s: string): string =>
        STATUS_LABEL_KEY[s] ? t[STATUS_LABEL_KEY[s]] : s;

    const setRange = (range: Range): void => {
        router.get(
            appointmentsRoute.url({ locale }),
            { range },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    return (
        <>
            <Head title={t.nav_appointments} />

            <div className="px-6 py-5 lg:px-8">
                <PageHeader
                    title={t.nav_appointments}
                    description={`${fmtNumber(Number(kpis.today_count))} · ${fmtNumber(Number(kpis.confirmed))} ${t.sched_legend_confirmed}`}
                    actions={
                        <CreateAppointmentSheet>
                            <Button
                                size="sm"
                                className="gap-2 bg-olive-600 text-white hover:bg-olive-700"
                            >
                                <CalendarIcon className="size-3.5" />
                                {t.new_appointment}
                            </Button>
                        </CreateAppointmentSheet>
                    }
                />

                <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                    <KpiCard
                        label={t.kpi_today}
                        value={fmtNumber(Number(kpis.today_count))}
                        icon={CalendarIcon}
                        tone="navy"
                    />
                    <KpiCard
                        label={t.kpi_pending}
                        value={fmtNumber(Number(kpis.pending))}
                        icon={Clock}
                        tone="warn"
                    />
                    <KpiCard
                        label={t.sched_legend_confirmed}
                        value={fmtNumber(Number(kpis.confirmed))}
                        icon={Check}
                        tone="success"
                    />
                    <KpiCard
                        label={t.sched_legend_cancelled}
                        value={fmtNumber(Number(kpis.cancelled))}
                        icon={X}
                        tone="olive"
                    />
                </div>

                <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
                    <MiniCalendar t={t} locale={locale} />

                    <SectionCard bodyClassName="p-0">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
                            <div className="flex items-center gap-1.5">
                                {(
                                    [
                                        ['today', t.today],
                                        ['tomorrow', t.ap_range_tomorrow],
                                        ['week', t.ap_range_week],
                                    ] as const
                                ).map(([id, label]) => (
                                    <Button
                                        key={id}
                                        variant={
                                            filters.range === id
                                                ? 'default'
                                                : 'ghost'
                                        }
                                        size="sm"
                                        onClick={() => setRange(id)}
                                        className={cn(
                                            'gap-1.5',
                                            filters.range === id
                                                ? 'bg-navy-900 text-white hover:bg-navy-800'
                                                : '',
                                        )}
                                    >
                                        {label}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="w-24 px-5 py-2.5 text-[11px] tracking-wider uppercase">
                                        {t.wr_col_arrived}
                                    </TableHead>
                                    <TableHead className="text-[11px] tracking-wider uppercase">
                                        {t.wr_col_patient}
                                    </TableHead>
                                    <TableHead className="text-[11px] tracking-wider uppercase">
                                        {t.wr_col_doctor}
                                    </TableHead>
                                    <TableHead className="text-[11px] tracking-wider uppercase">
                                        {t.ap_col_type}
                                    </TableHead>
                                    <TableHead className="text-[11px] tracking-wider uppercase">
                                        {t.ap_col_duration}
                                    </TableHead>
                                    <TableHead className="text-[11px] tracking-wider uppercase">
                                        {t.wr_col_status}
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {appointments.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="py-10 text-center text-sm text-muted-foreground"
                                        >
                                            {t.empty_none}
                                        </TableCell>
                                    </TableRow>
                                )}
                                {appointments.map((a) => (
                                    <TableRow
                                        key={a.id}
                                        className="hover:bg-muted/50"
                                    >
                                        <TableCell className="px-5 py-3 text-[13px] font-semibold tabular-nums">
                                            {timeOf(a.scheduled_start)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2.5">
                                                <div className="grid size-7 shrink-0 place-items-center rounded-full bg-navy-700 text-[10px] font-semibold text-white">
                                                    {initials(a.patient)}
                                                </div>
                                                <div>
                                                    <div className="text-[13px] font-semibold">
                                                        {fullName(a.patient)}
                                                    </div>
                                                    <div className="text-[11px] text-muted-foreground">
                                                        {a.patient
                                                            ?.blood_type ?? '—'}
                                                        {isChronic(a.patient) &&
                                                            ` · ${t.pt_tag_chronic}`}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="grid size-6 shrink-0 place-items-center rounded-full bg-navy-700 text-[10px] font-semibold text-white">
                                                    {initials(a.doctor)}
                                                </div>
                                                <span className="text-[12px]">
                                                    {fullName(a.doctor)}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-[13px]">
                                            {a.type ?? '—'}
                                        </TableCell>
                                        <TableCell className="text-[13px] tabular-nums">
                                            {a.duration_minutes ?? '—'}{' '}
                                            {t.wr_min}
                                        </TableCell>
                                        <TableCell>
                                            <StatusPill
                                                tone={statusTone(a.status)}
                                                withDot
                                            >
                                                {statusLabel(a.status)}
                                            </StatusPill>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </SectionCard>
                </div>
            </div>
        </>
    );
}

function MiniCalendar({
    t,
    locale,
}: {
    t: SecretaryDictionary;
    locale: string;
}) {
    const today = new Date();
    const intlLocale =
        t.dir === 'rtl' ? 'ar' : locale.endsWith('fr') ? 'fr-FR' : 'en-US';
    const monthLabel = today.toLocaleDateString(intlLocale, {
        month: 'long',
        year: 'numeric',
    });
    const weekdayLetters = t.ap_weekday_letters.split(',');
    const days: number[] = [];

    for (let d = 1; d <= 31; d++) {
        days.push(d);
    }

    return (
        <div className="self-start rounded-xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
                <span className="text-[13px] font-semibold">{monthLabel}</span>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[11px]">
                {weekdayLetters.map((d, i) => (
                    <div
                        key={i}
                        className="py-1 font-semibold text-muted-foreground"
                    >
                        {d}
                    </div>
                ))}
                {days.map((d) => (
                    <div
                        key={d}
                        className={cn(
                            'relative grid place-items-center rounded py-1.5 tabular-nums',
                            d === today.getDate()
                                ? 'bg-olive-600 font-semibold text-white'
                                : 'hover:bg-muted',
                        )}
                    >
                        {d}
                    </div>
                ))}
            </div>
        </div>
    );
}
