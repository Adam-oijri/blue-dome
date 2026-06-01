import { Head, Link, router } from '@inertiajs/react';
import {
    Activity,
    Calendar as CalendarIcon,
    ChevronRight,
    Clock,
    Download,
    FlaskConical,
    MessageCircle,
    Pill,
    Sparkles,
    UserPlus,
    Users,
} from 'lucide-react';

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
import { downloadCsv } from '@/lib/format';
import type { DoctorDictionary } from '@/lib/i18n/doctor';
import { useDoctorLang } from '@/lib/i18n/doctor-context';
import { useLocale } from '@/lib/i18n/use-locale';
import { cn } from '@/lib/utils';
import appointments from '@/routes/appointments';
import doctor from '@/routes/doctor';
import labOrders from '@/routes/lab-orders';
import medicalRecords from '@/routes/medical-records';
import patients from '@/routes/patients';
import prescriptions from '@/routes/prescriptions';

type Person = {
    first_name: string | null;
    last_name: string | null;
    phone?: string | null;
};

type ScheduleAppt = {
    id: string;
    patient?: Person | null;
    scheduled_start: string | null;
    status: string;
    type: string | null;
};

type PendingAppt = {
    id: string;
    patient?: Person | null;
    scheduled_start: string | null;
};

type RecentPatient = {
    id: string;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
    gender: string | null;
    blood_type: string | null;
    last_visit: string | null;
};

interface Props {
    kpis: {
        today_count: number;
        pending_confirmations: number;
        completed_today: number;
        week_upcoming: number;
    };
    today_schedule: ScheduleAppt[];
    pending_confirmations_list: PendingAppt[];
    recent_patients: RecentPatient[];
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

const fullName = (p?: Person | null): string =>
    p ? `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || '—' : '—';

const initials = (p?: Person | null): string =>
    p
        ? `${p.first_name?.[0] ?? ''}${p.last_name?.[0] ?? ''}`.toUpperCase() ||
          '?'
        : '?';

const timeOf = (iso: string | null): string => (iso ? iso.slice(11, 16) : '—');

export default function DoctorDashboard({
    kpis,
    today_schedule,
    pending_confirmations_list,
    recent_patients,
}: Props) {
    const { t } = useDoctorLang();
    const { slug: locale } = useLocale();

    const statusLabel = (s: string): string => {
        type StringKey = {
            [K in keyof DoctorDictionary]: DoctorDictionary[K] extends string
                ? K
                : never;
        }[keyof DoctorDictionary];
        const map: Record<string, StringKey> = {
            confirmed: 'confirmed',
            in_progress: 'in_progress',
            completed: 'completed',
            arrived: 'arrived',
            cancelled: 'cancelled',
            no_show: 'no_show',
            scheduled: 'upcoming',
        };
        const key = map[s];

        return key ? t[key] : s.replace('_', ' ');
    };

    const inProgress = today_schedule.find((a) => a.status === 'in_progress');

    return (
        <>
            <Head title={t.dashboard} />

            <div className="px-8 py-6 lg:px-10">
                <PageHeader
                    title={t.good_morning}
                    description={t.today_summary}
                    actions={
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={() =>
                                    downloadCsv(
                                        `today-schedule-${new Date().toISOString().slice(0, 10)}.csv`,
                                        today_schedule.map((a) => ({
                                            time: timeOf(a.scheduled_start),
                                            patient: fullName(a.patient),
                                            type: a.type ?? '',
                                            status: a.status,
                                        })),
                                    )
                                }
                            >
                                <Download className="size-3.5" />
                                Export
                            </Button>
                            <CreateAppointmentSheet>
                                <Button
                                    size="sm"
                                    className="gap-2 bg-navy-900 text-white hover:bg-navy-800"
                                >
                                    <UserPlus className="size-3.5" />
                                    {t.new_appointment}
                                </Button>
                            </CreateAppointmentSheet>
                        </>
                    }
                />

                <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                    <KpiCard
                        label={t.todays_patients}
                        value={kpis.today_count}
                        icon={Users}
                        tone="navy"
                    />
                    <KpiCard
                        label={t.pending_confirmations}
                        value={kpis.pending_confirmations}
                        icon={MessageCircle}
                        tone="warn"
                    />
                    <KpiCard
                        label={t.completed}
                        value={kpis.completed_today}
                        icon={Activity}
                        tone="success"
                    />
                    <KpiCard
                        label={t.upcoming}
                        value={kpis.week_upcoming}
                        icon={CalendarIcon}
                        tone="olive"
                    />
                </div>

                <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
                    <SectionCard
                        title={t.todays_schedule}
                        titleIcon={<CalendarIcon className="size-4" />}
                        bodyClassName="p-0"
                        actions={
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                asChild
                            >
                                <Link href={doctor.calendar.url({ locale })}>
                                    {t.view_calendar}
                                    <ChevronRight className="size-3.5" />
                                </Link>
                            </Button>
                        }
                    >
                        {today_schedule.length === 0 ? (
                            <div className="px-5 py-10 text-center text-sm text-muted-foreground">
                                {t.no_appointments}
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {today_schedule.map((apt) => (
                                    <Link
                                        key={apt.id}
                                        href={appointments.show.url({
                                            locale,
                                            appointment: apt.id,
                                        })}
                                        className="grid items-center gap-4 px-5 py-3.5 hover:bg-muted/50"
                                        style={{
                                            gridTemplateColumns:
                                                '64px minmax(0, 1fr) auto',
                                        }}
                                    >
                                        <div className="text-[14px] font-semibold tabular-nums">
                                            {timeOf(apt.scheduled_start)}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="truncate text-[14px] font-semibold">
                                                {fullName(apt.patient)}
                                            </div>
                                            <div className="truncate text-[12px] text-muted-foreground">
                                                {apt.type ?? ''}
                                            </div>
                                        </div>
                                        <StatusPill
                                            tone={
                                                STATUS_TONE[apt.status] ??
                                                'neutral'
                                            }
                                            withDot
                                        >
                                            {statusLabel(apt.status)}
                                        </StatusPill>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </SectionCard>

                    <div className="flex flex-col gap-4">
                        {inProgress && (
                            <SectionCard
                                title={t.in_progress}
                                titleIcon={<Activity className="size-4" />}
                                bodyClassName="p-4"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="grid size-10 shrink-0 place-items-center rounded-full bg-navy-700 text-sm font-semibold text-white">
                                        {initials(inProgress.patient)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="text-[14px] font-semibold">
                                            {fullName(inProgress.patient)}
                                        </div>
                                        <div className="mt-0.5 truncate text-[12px] text-muted-foreground">
                                            {inProgress.type ?? ''}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <Button
                                        asChild
                                        size="sm"
                                        className="w-full gap-2 bg-navy-900 text-white hover:bg-navy-800"
                                    >
                                        <Link
                                            href={medicalRecords.create.url(
                                                { locale },
                                                {
                                                    query: {
                                                        appointment:
                                                            inProgress.id,
                                                    },
                                                },
                                            )}
                                        >
                                            <Clock className="size-3.5" />
                                            {t.consultations}
                                        </Link>
                                    </Button>
                                </div>
                            </SectionCard>
                        )}

                        <SectionCard
                            title={t.pending_confirmations}
                            titleIcon={<MessageCircle className="size-4" />}
                            actions={
                                <StatusPill tone="warning">
                                    {kpis.pending_confirmations} {t.pending}
                                </StatusPill>
                            }
                            bodyClassName="p-0"
                        >
                            {pending_confirmations_list.length === 0 ? (
                                <div className="px-4 py-8 text-center text-[13px] text-muted-foreground">
                                    {t.all_confirmed}
                                </div>
                            ) : (
                                <div className="divide-y divide-border">
                                    {pending_confirmations_list.map((m) => (
                                        <Link
                                            key={m.id}
                                            href={appointments.show.url({
                                                locale,
                                                appointment: m.id,
                                            })}
                                            className="flex items-center gap-2.5 px-4 py-3 hover:bg-muted/50"
                                        >
                                            <div className="grid size-7 shrink-0 place-items-center rounded-full bg-olive-600 text-[11px] font-semibold text-white">
                                                {initials(m.patient)}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="truncate text-[13px] font-medium">
                                                    {fullName(m.patient)}
                                                </div>
                                                <div className="text-[11px] text-muted-foreground tabular-nums">
                                                    {m.scheduled_start
                                                        ?.slice(0, 16)
                                                        .replace('T', ' ') ??
                                                        ''}
                                                </div>
                                            </div>
                                            <StatusPill
                                                tone="warning"
                                                className="text-[10px]"
                                            >
                                                {t.pending}
                                            </StatusPill>
                                        </Link>
                                    ))}
                                </div>
                            )}
                            <div className="border-t border-border p-3">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full"
                                    asChild
                                >
                                    <Link
                                        href={doctor.confirmations.url({
                                            locale,
                                        })}
                                    >
                                        {t.confirmations}
                                        <ChevronRight className="size-3.5" />
                                    </Link>
                                </Button>
                            </div>
                        </SectionCard>

                        <SectionCard
                            title={t.quick_actions}
                            titleIcon={<Sparkles className="size-4" />}
                            bodyClassName="grid grid-cols-2 gap-2 p-4"
                        >
                            <QuickAction
                                icon={UserPlus}
                                label={t.patients}
                                href={patients.create.url({ locale })}
                            />
                            <CreateAppointmentSheet>
                                <Button
                                    variant="outline"
                                    className="h-16 flex-col gap-1 text-xs"
                                >
                                    <CalendarIcon className="size-[18px]" />
                                    {t.new_appointment}
                                </Button>
                            </CreateAppointmentSheet>
                            <QuickAction
                                icon={Pill}
                                label={t.prescriptions}
                                href={prescriptions.create.url({ locale })}
                            />
                            <QuickAction
                                icon={FlaskConical}
                                label={t.lab_orders}
                                href={labOrders.create.url({ locale })}
                            />
                        </SectionCard>
                    </div>
                </div>

                <SectionCard
                    title={t.recent_patients}
                    titleIcon={<Users className="size-4" />}
                    actions={
                        <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1"
                            asChild
                        >
                            <Link href={patients.index.url({ locale })}>
                                {t.patients}
                                <ChevronRight className="size-3.5" />
                            </Link>
                        </Button>
                    }
                    bodyClassName="p-0"
                    className="mt-5"
                >
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="px-5 py-2.5 text-[11px] tracking-wider uppercase">
                                    {t.patients}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.gender}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.blood_type}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.last_visit}
                                </TableHead>
                                <TableHead className="w-12" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recent_patients.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="py-10 text-center text-sm text-muted-foreground"
                                    >
                                        {t.no_appointments}
                                    </TableCell>
                                </TableRow>
                            )}
                            {recent_patients.map((p) => (
                                <TableRow
                                    key={p.id}
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() =>
                                        router.visit(
                                            patients.show.url({
                                                locale,
                                                patient: p.id,
                                            }),
                                        )
                                    }
                                >
                                    <TableCell className="px-5 py-3">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={cn(
                                                    'grid size-8 shrink-0 place-items-center rounded-full text-xs font-semibold text-white',
                                                    p.gender === 'male'
                                                        ? 'bg-navy-700'
                                                        : 'bg-olive-600',
                                                )}
                                            >
                                                {initials(p)}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-[13px] font-medium">
                                                    {fullName(p)}
                                                </div>
                                                <div className="text-[11px] text-muted-foreground">
                                                    {p.phone ?? ''}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-[13px]">
                                        {p.gender
                                            ? p.gender === 'male'
                                                ? t.male
                                                : t.female
                                            : '—'}
                                    </TableCell>
                                    <TableCell>
                                        {p.blood_type ? (
                                            <StatusPill tone="danger">
                                                {p.blood_type}
                                            </StatusPill>
                                        ) : (
                                            '—'
                                        )}
                                    </TableCell>
                                    <TableCell className="text-[12px] text-muted-foreground tabular-nums">
                                        {p.last_visit?.slice(0, 10) ?? '—'}
                                    </TableCell>
                                    <TableCell>
                                        <ChevronRight className="size-3.5 text-muted-foreground" />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </SectionCard>
            </div>
        </>
    );
}

function QuickAction({
    icon: Icon,
    label,
    href,
}: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    href: string;
}) {
    return (
        <Button
            variant="outline"
            className="h-16 flex-col gap-1 text-xs"
            asChild
        >
            <Link href={href}>
                <Icon className="size-[18px]" />
                {label}
            </Link>
        </Button>
    );
}
