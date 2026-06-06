import { Head, Link, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useState } from 'react';

import { CreateAppointmentSheet } from '@/components/blue-dome/create-appointment-sheet';
import { PageHeader } from '@/components/blue-dome/page-header';
import { Button } from '@/components/ui/button';
import { useDoctorLang } from '@/lib/i18n/doctor-context';
import { useLocale } from '@/lib/i18n/use-locale';
import { cn } from '@/lib/utils';
import appointments from '@/routes/appointments';
import doctor from '@/routes/doctor';

type Appt = {
    id: string;
    patient?: { first_name: string | null; last_name: string | null } | null;
    scheduled_start: string | null;
    scheduled_end: string | null;
    status: string;
    type: string | null;
};

interface Props {
    appointments: Appt[];
    week: { start: string; end: string; days: string[] };
    prev_week: string;
    next_week: string;
    today: string;
}

const DAY_KEYS = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
] as const;

const HOURS = [
    '08:00',
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
];
const BASE_HOUR = 8;
const ROW_PX = 50;

const TONE: Record<string, string> = {
    in_progress: 'bg-olive-100 text-olive-700 border-s-[3px] border-olive-600',
    arrived: 'bg-olive-100 text-olive-700 border-s-[3px] border-olive-600',
    completed:
        'bg-success-soft text-success border-s-[3px] border-success',
    no_show: 'bg-warning-soft text-warning border-s-[3px] border-warning',
    default: 'bg-navy-100 text-navy-900 border-s-[3px] border-navy-700',
};

const fullName = (
    p?: { first_name: string | null; last_name: string | null } | null,
): string =>
    p ? `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || '—' : '—';

export default function DoctorCalendar({
    appointments: appts,
    week,
    prev_week,
    next_week,
    today,
}: Props) {
    const { t } = useDoctorLang();
    const { slug: locale } = useLocale();
    const [view, setView] = useState<'day' | 'week'>('week');

    const go = (date: string): void =>
        router.get(
            doctor.calendar.url({ locale }),
            { date },
            { preserveState: true, preserveScroll: true, replace: true },
        );

    // Map appointments to grid coordinates relative to the 08:00 baseline.
    const events = appts
        .map((a) => {
            const date = a.scheduled_start?.slice(0, 10) ?? '';
            const dayIndex = week.days.indexOf(date);
            const sH = Number(a.scheduled_start?.slice(11, 13) ?? BASE_HOUR);
            const sM = Number(a.scheduled_start?.slice(14, 16) ?? 0);
            const eH = Number(a.scheduled_end?.slice(11, 13) ?? sH + 1);
            const eM = Number(a.scheduled_end?.slice(14, 16) ?? 0);
            const startF = Math.min(
                Math.max(sH + sM / 60 - BASE_HOUR, 0),
                HOURS.length - 0.25,
            );
            const endF = Math.min(
                Math.max(eH + eM / 60 - BASE_HOUR, startF + 0.25),
                HOURS.length,
            );

            return {
                id: a.id,
                dayIndex,
                row: Math.floor(startF),
                offset: (startF - Math.floor(startF)) * ROW_PX,
                height: (endF - startF) * ROW_PX - 2,
                name: fullName(a.patient),
                reason: a.type ?? '',
                status: a.status,
            };
        })
        .filter((e) => e.dayIndex >= 0);

    const todayIdx = week.days.indexOf(today);
    const visible =
        view === 'day' ? [Math.max(todayIdx, 0)] : [0, 1, 2, 3, 4, 5, 6];

    const fmt = (d: string): string =>
        new Date(d).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
        });

    return (
        <>
            <Head title={t.appointments} />

            <div className="px-8 py-6 lg:px-10">
                <PageHeader
                    title={t.appointments}
                    description={`${fmt(week.start)} – ${fmt(week.end)} · ${appts.length}`}
                    actions={
                        <>
                            <div className="inline-flex gap-px rounded-md bg-muted p-[3px]">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={cn(
                                        'h-7',
                                        view === 'day' &&
                                            'bg-background text-foreground shadow-xs',
                                    )}
                                    onClick={() => setView('day')}
                                >
                                    {t.day}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={cn(
                                        'h-7',
                                        view === 'week' &&
                                            'bg-background text-foreground shadow-xs',
                                    )}
                                    onClick={() => setView('week')}
                                >
                                    {t.week}
                                </Button>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => go(today)}
                            >
                                {t.today}
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="size-8"
                                onClick={() => go(prev_week)}
                            >
                                <ChevronLeft className="size-3.5" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="size-8"
                                onClick={() => go(next_week)}
                            >
                                <ChevronRight className="size-3.5" />
                            </Button>
                            <CreateAppointmentSheet>
                                <Button
                                    size="sm"
                                    className="gap-2 bg-olive-600 text-white hover:bg-olive-700"
                                >
                                    <Plus className="size-3.5" />
                                    {t.new_appointment}
                                </Button>
                            </CreateAppointmentSheet>
                        </>
                    }
                />

                <div
                    className="grid overflow-hidden rounded-xl border border-border bg-card"
                    style={{
                        gridTemplateColumns: `60px repeat(${visible.length}, minmax(0, 1fr))`,
                    }}
                >
                    <div className="border-b border-border bg-muted" />
                    {visible.map((di) => (
                        <div
                            key={di}
                            className="border-b border-border bg-muted p-2.5 text-center text-[11px] font-semibold tracking-wider text-muted-foreground uppercase"
                        >
                            {t[DAY_KEYS[di]]}
                            <div
                                className={cn(
                                    'mt-0.5 text-lg font-semibold tracking-normal normal-case',
                                    week.days[di] === today
                                        ? 'text-olive-700'
                                        : 'text-foreground',
                                )}
                            >
                                {week.days[di]?.slice(8, 10)}
                            </div>
                        </div>
                    ))}

                    {HOURS.map((hour, hi) => (
                        <div key={hour} className="contents">
                            <div className="border-e border-b border-dashed border-border px-1.5 py-2 text-end text-[10px] text-muted-foreground tabular-nums">
                                {hour}
                            </div>
                            {visible.map((di) => {
                                const cellEvents = events.filter(
                                    (e) => e.dayIndex === di && e.row === hi,
                                );

                                return (
                                    <div
                                        key={`${di}-${hour}`}
                                        className="relative min-h-[50px] border-e border-b border-dashed border-border p-0.5 last:border-e-0"
                                    >
                                        {cellEvents.map((e) => (
                                            <Link
                                                key={e.id}
                                                href={appointments.show.url({
                                                    locale,
                                                    appointment: e.id,
                                                })}
                                                className={cn(
                                                    'absolute start-0.5 end-0.5 cursor-pointer overflow-hidden rounded px-1.5 py-1 text-[11px] leading-tight font-medium',
                                                    TONE[e.status] ??
                                                        TONE.default,
                                                )}
                                                style={{
                                                    top: e.offset,
                                                    height: e.height,
                                                }}
                                            >
                                                {e.name}
                                                {e.reason && (
                                                    <small className="mt-0.5 block text-[10px] font-normal opacity-75">
                                                        {e.reason}
                                                    </small>
                                                )}
                                            </Link>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
