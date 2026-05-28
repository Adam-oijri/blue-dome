import { Head } from '@inertiajs/react';
import {
    Archive,
    Calendar as CalendarIcon,
    Check,
    ChevronLeft,
    ChevronRight,
    Clock,
    MoreHorizontal,
    Plus,
    Printer,
    Search,
    X,
} from 'lucide-react';
import { useState } from 'react';

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
import { useSecretaryLang } from '@/lib/i18n/secretary-context';
import { findDoctor, findPatient, localName } from '@/lib/mock/secretary';
import { cn } from '@/lib/utils';

type ApptStatus =
    | 'scheduled'
    | 'confirmed'
    | 'arrived'
    | 'in_progress'
    | 'completed'
    | 'cancelled';

const APPT_DATA: {
    time: string;
    patient: string;
    doctor: string;
    type: string;
    dur: number;
    status: ApptStatus;
}[] = [
    {
        time: '09:00',
        patient: 'p1',
        doctor: 'd1',
        type: 'Follow-up',
        dur: 30,
        status: 'completed',
    },
    {
        time: '09:30',
        patient: 'p4',
        doctor: 'd2',
        type: 'Consultation',
        dur: 30,
        status: 'completed',
    },
    {
        time: '10:00',
        patient: 'p7',
        doctor: 'd1',
        type: 'Consultation',
        dur: 30,
        status: 'completed',
    },
    {
        time: '10:30',
        patient: 'p2',
        doctor: 'd2',
        type: 'Follow-up',
        dur: 30,
        status: 'completed',
    },
    {
        time: '11:00',
        patient: 'p9',
        doctor: 'd1',
        type: 'First visit',
        dur: 45,
        status: 'in_progress',
    },
    {
        time: '11:00',
        patient: 'p5',
        doctor: 'd2',
        type: 'Consultation',
        dur: 30,
        status: 'arrived',
    },
    {
        time: '11:30',
        patient: 'p4',
        doctor: 'd1',
        type: 'Follow-up',
        dur: 30,
        status: 'confirmed',
    },
    {
        time: '12:00',
        patient: 'p7',
        doctor: 'd2',
        type: 'Checkup',
        dur: 30,
        status: 'confirmed',
    },
    {
        time: '14:00',
        patient: 'p8',
        doctor: 'd1',
        type: 'Procedure',
        dur: 60,
        status: 'scheduled',
    },
    {
        time: '14:30',
        patient: 'p3',
        doctor: 'd2',
        type: 'Follow-up',
        dur: 30,
        status: 'confirmed',
    },
    {
        time: '15:00',
        patient: 'p6',
        doctor: 'd1',
        type: 'Consultation',
        dur: 30,
        status: 'confirmed',
    },
    {
        time: '15:30',
        patient: 'p10',
        doctor: 'd2',
        type: 'First visit',
        dur: 45,
        status: 'scheduled',
    },
    {
        time: '16:00',
        patient: 'p2',
        doctor: 'd1',
        type: 'Follow-up',
        dur: 30,
        status: 'cancelled',
    },
    {
        time: '16:30',
        patient: 'p5',
        doctor: 'd2',
        type: 'Consultation',
        dur: 30,
        status: 'confirmed',
    },
];

const STATUS: Record<ApptStatus, { tone: StatusTone; label: string }> = {
    scheduled: { tone: 'neutral', label: 'Scheduled' },
    confirmed: { tone: 'olive', label: 'Confirmed' },
    arrived: { tone: 'info', label: 'Arrived' },
    in_progress: { tone: 'info', label: 'In progress' },
    completed: { tone: 'success', label: 'Completed' },
    cancelled: { tone: 'danger', label: 'Cancelled' },
};

export default function SecretaryAppointments() {
    const { t, lang } = useSecretaryLang();
    const [filter, setFilter] = useState<'today' | 'tomorrow' | 'week'>(
        'today',
    );

    return (
        <>
            <Head title={t.nav_appointments} />

            <div className="px-6 py-5 lg:px-8">
                <PageHeader
                    title={t.nav_appointments}
                    description="14 appointments today across 2 doctors · 6 confirmed · 8 to confirm"
                    actions={
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                            >
                                <Printer className="size-3.5" />
                                Print
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                            >
                                <Archive className="size-3.5" />
                                Export
                            </Button>
                            <Button
                                size="sm"
                                className="gap-2 bg-olive-600 text-white hover:bg-olive-700"
                            >
                                <Plus className="size-3.5" />
                                {t.new_appointment}
                            </Button>
                        </>
                    }
                />

                <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                    <KpiCard
                        label="Today's appointments"
                        value="24"
                        icon={CalendarIcon}
                        tone="navy"
                        trend={{ value: '+3', direction: 'up' }}
                    />
                    <KpiCard
                        label="Pending confirmations"
                        value="7"
                        icon={Clock}
                        tone="warn"
                    />
                    <KpiCard
                        label="Confirmed"
                        value="14"
                        icon={Check}
                        tone="olive"
                    />
                    <KpiCard
                        label="Cancelled"
                        value="6"
                        icon={X}
                        tone="warn"
                        trend={{ value: '-0.4%', direction: 'up' }}
                    />
                </div>

                <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
                    <MiniCalendar />

                    <SectionCard bodyClassName="p-0">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
                            <div className="flex items-center gap-1.5">
                                {(
                                    [
                                        ['today', 'Today', 14],
                                        ['tomorrow', 'Tomorrow', 10],
                                        ['week', 'Week', 62],
                                    ] as const
                                ).map(([id, label, ct]) => (
                                    <Button
                                        key={id}
                                        variant={
                                            filter === id ? 'default' : 'ghost'
                                        }
                                        size="sm"
                                        onClick={() => setFilter(id)}
                                        className={cn(
                                            'gap-1.5',
                                            filter === id
                                                ? 'bg-navy-900 text-white hover:bg-navy-800'
                                                : '',
                                        )}
                                    >
                                        {label}
                                        <span className="text-[11px] tabular-nums opacity-70">
                                            {ct}
                                        </span>
                                    </Button>
                                ))}
                            </div>
                            <div className="relative max-w-[260px] flex-1">
                                <Search className="pointer-events-none absolute start-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type="search"
                                    placeholder="Search appointments…"
                                    className="h-8 w-full rounded-md border border-transparent bg-muted ps-8 pe-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                />
                            </div>
                        </div>

                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="w-24 px-5 py-2.5 text-[11px] tracking-wider uppercase">
                                        Time
                                    </TableHead>
                                    <TableHead className="text-[11px] tracking-wider uppercase">
                                        Patient
                                    </TableHead>
                                    <TableHead className="text-[11px] tracking-wider uppercase">
                                        Doctor
                                    </TableHead>
                                    <TableHead className="text-[11px] tracking-wider uppercase">
                                        Type
                                    </TableHead>
                                    <TableHead className="text-[11px] tracking-wider uppercase">
                                        Duration
                                    </TableHead>
                                    <TableHead className="text-[11px] tracking-wider uppercase">
                                        Status
                                    </TableHead>
                                    <TableHead className="w-24" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {APPT_DATA.map((r, i) => {
                                    const p = findPatient(r.patient);
                                    const d = findDoctor(r.doctor);

                                    if (!p || !d) {
                                        return null;
                                    }

                                    const s = STATUS[r.status];

                                    return (
                                        <TableRow
                                            key={i}
                                            className="hover:bg-muted/50"
                                        >
                                            <TableCell className="px-5 py-3 text-[13px] font-semibold tabular-nums">
                                                {r.time}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2.5">
                                                    <div
                                                        className={cn(
                                                            'grid size-7 shrink-0 place-items-center rounded-full text-[10px] font-semibold text-white',
                                                            p.gender === 'm'
                                                                ? 'bg-navy-700'
                                                                : 'bg-olive-600',
                                                        )}
                                                    >
                                                        {p.initials}
                                                    </div>
                                                    <div>
                                                        <div className="text-[13px] font-semibold">
                                                            {localName(p, lang)}
                                                        </div>
                                                        <div className="text-[11px] text-muted-foreground">
                                                            {p.blood}
                                                            {p.chronic &&
                                                                ' · Chronic'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className={cn(
                                                            'grid size-6 shrink-0 place-items-center rounded-full text-[10px] font-semibold text-white',
                                                            d.hue === 'navy'
                                                                ? 'bg-navy-700'
                                                                : 'bg-olive-600',
                                                        )}
                                                    >
                                                        {d.initials}
                                                    </div>
                                                    <span className="text-[12px]">
                                                        {localName(
                                                            d,
                                                            lang,
                                                        ).replace(
                                                            /^(Dr\.|د\.)\s*/,
                                                            '',
                                                        )}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-[13px]">
                                                {r.type}
                                            </TableCell>
                                            <TableCell className="text-[13px] tabular-nums">
                                                {r.dur} {t.wr_min}
                                            </TableCell>
                                            <TableCell>
                                                <StatusPill
                                                    tone={s.tone}
                                                    withDot
                                                >
                                                    {s.label}
                                                </StatusPill>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7"
                                                    >
                                                        View
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="size-7"
                                                    >
                                                        <MoreHorizontal className="size-3.5" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </SectionCard>
                </div>
            </div>
        </>
    );
}

function MiniCalendar() {
    const aprTail = [27, 28, 29, 30];
    const mayDays: {
        d: number;
        today?: boolean;
        selected?: boolean;
        mark?: boolean;
    }[] = [];

    for (let d = 1; d <= 31; d++) {
        mayDays.push({
            d,
            today: d === 5,
            selected: d === 5,
            mark: d % 3 === 0,
        });
    }

    return (
        <div className="self-start rounded-xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
                <span className="text-[13px] font-semibold">May 2026</span>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="size-6">
                        <ChevronLeft className="size-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="size-6">
                        <ChevronRight className="size-3" />
                    </Button>
                </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[11px]">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                    <div
                        key={i}
                        className="py-1 font-semibold text-muted-foreground"
                    >
                        {d}
                    </div>
                ))}
                {aprTail.map((d) => (
                    <div
                        key={`apr-${d}`}
                        className="py-1.5 text-muted-foreground/40 tabular-nums"
                    >
                        {d}
                    </div>
                ))}
                {mayDays.map((c) => (
                    <div
                        key={c.d}
                        className={cn(
                            'relative grid place-items-center rounded py-1.5 tabular-nums',
                            c.selected
                                ? 'bg-olive-600 font-semibold text-white'
                                : c.today
                                  ? 'font-semibold text-olive-700'
                                  : 'hover:bg-muted',
                        )}
                    >
                        {c.d}
                        {c.mark && !c.selected && (
                            <span className="absolute bottom-0.5 size-1 rounded-full bg-olive-500" />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
