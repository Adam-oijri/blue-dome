import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    Calendar as CalendarIcon,
    ChevronRight,
    CircleDollarSign,
    Clock,
    Download,
    Filter,
    FlaskConical,
    MessageCircle,
    MessageSquare,
    MoreVertical,
    Pill,
    Plus,
    Sparkles,
    UserPlus,
    Users,
} from 'lucide-react';
import type { ComponentType } from 'react';

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
import { useDoctorLang } from '@/lib/i18n/doctor-context';
import { useLocale } from '@/lib/i18n/use-locale';
import { DOCTOR_MOCK } from '@/lib/mock/doctor';
import type { AppointmentStatus, KpiEntry } from '@/lib/mock/doctor';
import { cn } from '@/lib/utils';
import doctor from '@/routes/doctor';

type IconComponent = ComponentType<{ className?: string }>;

const KPI_ICONS: Record<KpiEntry['icon'], IconComponent> = {
    users: Users,
    msg: MessageSquare,
    coin: CircleDollarSign,
    clock: Clock,
};

const KPI_TONES: Record<
    KpiEntry['color'],
    'navy' | 'olive' | 'warn' | 'success'
> = {
    '': 'navy',
    olive: 'olive',
    warn: 'warn',
    success: 'success',
};

const STATUS_TONE: Record<AppointmentStatus, StatusTone> = {
    completed: 'success',
    in_progress: 'info',
    arrived: 'olive',
    confirmed: 'navy',
    pending: 'warning',
    cancelled: 'danger',
};

const STATUS_BAR: Record<AppointmentStatus, string> = {
    completed: 'bg-emerald-300',
    in_progress: 'bg-olive-400',
    arrived: 'bg-amber-300',
    confirmed: 'bg-navy-100',
    pending: 'bg-navy-100',
    cancelled: 'bg-red-300',
};

const WHATSAPP_QUEUE: { name: string; time: string; state: 'sent' | 'seen' }[] =
    [
        { name: 'Omar Chraibi', time: 'Tomorrow 14:00', state: 'sent' },
        { name: 'Latifa Ouazzani', time: 'Tomorrow 14:30', state: 'seen' },
        { name: 'Karim Sabri', time: 'Tomorrow 15:30', state: 'sent' },
    ];

const QUICK_ACTIONS: { icon: IconComponent; label: string }[] = [
    { icon: UserPlus, label: 'New patient' },
    { icon: CalendarIcon, label: 'Book slot' },
    { icon: Pill, label: 'Prescription' },
    { icon: FlaskConical, label: 'Lab order' },
];

interface DoctorDashboardProps {
    // Phase 2 will populate these from the controller. Optional for the UI port.
    kpis?: KpiEntry[];
}

export default function DoctorDashboard({ kpis }: DoctorDashboardProps) {
    const { t, lang } = useDoctorLang();
    const { slug: locale } = useLocale();
    const resolvedKpis = kpis ?? DOCTOR_MOCK.kpis[lang];
    const inProgress = DOCTOR_MOCK.schedule.find(
        (s) => s.status === 'in_progress',
    );

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
                            >
                                <Download className="size-3.5" />
                                Export
                            </Button>
                            <Button
                                size="sm"
                                className="gap-2 bg-navy-900 text-white hover:bg-navy-800"
                            >
                                <Plus className="size-3.5" />
                                {t.new_appointment}
                            </Button>
                        </>
                    }
                />

                <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                    {resolvedKpis.map((kpi, i) => (
                        <KpiCard
                            key={i}
                            label={kpi.label}
                            value={kpi.value}
                            icon={KPI_ICONS[kpi.icon]}
                            tone={KPI_TONES[kpi.color]}
                            trend={{ value: kpi.trend, direction: 'up' }}
                        />
                    ))}
                </div>

                <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
                    <SectionCard
                        title={t.todays_schedule}
                        titleIcon={<CalendarIcon className="size-4" />}
                        bodyClassName="p-0"
                        actions={
                            <>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="gap-2"
                                >
                                    <Filter className="size-3.5" />
                                    All
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2"
                                    asChild
                                >
                                    <Link
                                        href={doctor.calendar.url({ locale })}
                                    >
                                        {t.view_calendar}
                                        <ChevronRight className="size-3.5" />
                                    </Link>
                                </Button>
                            </>
                        }
                    >
                        <ul className="divide-y divide-border">
                            {DOCTOR_MOCK.schedule.map((apt, i) => (
                                <li
                                    key={i}
                                    className="grid cursor-pointer items-center gap-4 px-5 py-3.5 hover:bg-muted/50"
                                    style={{
                                        gridTemplateColumns:
                                            '72px 4px minmax(0, 1fr) auto',
                                    }}
                                >
                                    <div className="text-xs font-medium text-muted-foreground tabular-nums">
                                        <div className="text-[14px] font-semibold text-foreground">
                                            {apt.time}
                                        </div>
                                        {apt.duration}
                                    </div>
                                    <div
                                        className={cn(
                                            'h-full self-stretch rounded',
                                            STATUS_BAR[apt.status],
                                        )}
                                    />
                                    <div className="min-w-0">
                                        <div className="truncate text-[14px] font-semibold">
                                            {apt.name[lang]}
                                        </div>
                                        <div className="truncate text-[12px] text-muted-foreground">
                                            {apt.reason[lang]}
                                        </div>
                                    </div>
                                    <StatusPill
                                        tone={STATUS_TONE[apt.status]}
                                        withDot
                                    >
                                        {t[apt.status]}
                                    </StatusPill>
                                </li>
                            ))}
                        </ul>
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
                                        {inProgress.name.en
                                            .split(' ')
                                            .map((s) => s[0])
                                            .join('')}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="text-[14px] font-semibold">
                                            {inProgress.name[lang]}
                                        </div>
                                        <div className="mt-0.5 truncate text-[12px] text-muted-foreground">
                                            {inProgress.reason[lang]}
                                        </div>
                                        <div className="mt-2 flex items-center gap-3 text-[11px]">
                                            <StatusPill tone="olive">
                                                <Clock className="size-3" />
                                                14 min
                                            </StatusPill>
                                            <span className="text-muted-foreground">
                                                42y · M · B+
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 flex gap-2">
                                    <Button
                                        size="sm"
                                        className="flex-1 gap-2 bg-navy-900 text-white hover:bg-navy-800"
                                    >
                                        <CalendarIcon className="size-3.5" />
                                        Open visit
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="size-8"
                                    >
                                        <MoreVertical className="size-3.5" />
                                    </Button>
                                </div>
                            </SectionCard>
                        )}

                        <SectionCard
                            title="WhatsApp"
                            titleIcon={<MessageCircle className="size-4" />}
                            actions={
                                <StatusPill tone="warning">
                                    5 {t.pending}
                                </StatusPill>
                            }
                            bodyClassName="p-0"
                        >
                            <ul className="divide-y divide-border">
                                {WHATSAPP_QUEUE.map((m, i) => (
                                    <li
                                        key={i}
                                        className="flex items-center gap-2.5 px-4 py-3"
                                    >
                                        <div className="grid size-7 shrink-0 place-items-center rounded-full bg-olive-600 text-[11px] font-semibold text-white">
                                            {m.name
                                                .split(' ')
                                                .map((s) => s[0])
                                                .join('')}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="truncate text-[13px] font-medium">
                                                {m.name}
                                            </div>
                                            <div className="text-[11px] text-muted-foreground">
                                                {m.time}
                                            </div>
                                        </div>
                                        <StatusPill
                                            tone={
                                                m.state === 'seen'
                                                    ? 'info'
                                                    : 'olive'
                                            }
                                            className="text-[10px]"
                                        >
                                            {m.state === 'seen'
                                                ? '✓✓ Seen'
                                                : '✓ Sent'}
                                        </StatusPill>
                                    </li>
                                ))}
                            </ul>
                            <div className="border-t border-border p-3">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full"
                                >
                                    View all 5 →
                                </Button>
                            </div>
                        </SectionCard>

                        <SectionCard
                            title={t.quick_actions}
                            titleIcon={<Sparkles className="size-4" />}
                            bodyClassName="grid grid-cols-2 gap-2 p-4"
                        >
                            {QUICK_ACTIONS.map((a) => (
                                <Button
                                    key={a.label}
                                    variant="outline"
                                    className="h-16 flex-col gap-1 text-xs"
                                >
                                    <a.icon className="size-[18px]" />
                                    {a.label}
                                </Button>
                            ))}
                        </SectionCard>
                    </div>
                </div>

                <SectionCard
                    title={t.recent_patients}
                    titleIcon={<Users className="size-4" />}
                    actions={
                        <Button variant="ghost" size="sm" className="gap-1">
                            View all
                            <ChevronRight className="size-3.5" />
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
                                    {t.patient_id}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.age} / {t.gender}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.blood_type}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.last_visit}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.insurance}
                                </TableHead>
                                <TableHead className="w-12" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {DOCTOR_MOCK.patients.slice(0, 6).map((p) => (
                                <TableRow
                                    key={p.id}
                                    className="cursor-pointer hover:bg-muted/50"
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
                                                {p.name.en
                                                    .split(' ')
                                                    .map((s) => s[0])
                                                    .join('')}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-[13px] font-medium">
                                                    {p.name[lang]}
                                                </div>
                                                <div className="text-[11px] text-muted-foreground">
                                                    {p.phone}
                                                </div>
                                            </div>
                                            {p.flag === 'new' && (
                                                <StatusPill tone="olive">
                                                    New
                                                </StatusPill>
                                            )}
                                            {p.flag === 'chronic' && (
                                                <StatusPill tone="warning">
                                                    Chronic
                                                </StatusPill>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-[12px] text-muted-foreground tabular-nums">
                                        {p.id}
                                    </TableCell>
                                    <TableCell className="text-[13px] tabular-nums">
                                        {p.age} ·{' '}
                                        {p.gender === 'male' ? 'M' : 'F'}
                                    </TableCell>
                                    <TableCell>
                                        <StatusPill tone="danger">
                                            {p.blood}
                                        </StatusPill>
                                    </TableCell>
                                    <TableCell className="text-[12px] text-muted-foreground tabular-nums">
                                        {p.last_visit}
                                    </TableCell>
                                    <TableCell className="text-[12px] text-muted-foreground">
                                        {p.insurance}
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
