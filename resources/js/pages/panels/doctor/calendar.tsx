import { Head } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

import { PageHeader } from '@/components/blue-dome/page-header';
import { Button } from '@/components/ui/button';
import { useDoctorLang } from '@/lib/i18n/doctor-context';
import { cn } from '@/lib/utils';

type CalendarEvent = {
    day: number;
    hour: number;
    span: number;
    name: string;
    reason: string;
    color: '' | 'olive' | 'warn' | 'block';
};

const DAYS: (
    | 'monday'
    | 'tuesday'
    | 'wednesday'
    | 'thursday'
    | 'friday'
    | 'saturday'
    | 'sunday'
)[] = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
];

const DATES = [4, 5, 6, 7, 8, 9, 10];
const TODAY_INDEX = 1;

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
];

const EVENTS: CalendarEvent[] = [
    {
        day: 0,
        hour: 1,
        span: 1,
        name: 'M. Tahiri',
        reason: 'Follow-up',
        color: '',
    },
    {
        day: 0,
        hour: 3,
        span: 1,
        name: 'S. Bennis',
        reason: 'Consultation',
        color: 'olive',
    },
    {
        day: 1,
        hour: 0,
        span: 0.5,
        name: 'H. El Amrani',
        reason: 'Follow-up',
        color: '',
    },
    {
        day: 1,
        hour: 1,
        span: 1,
        name: 'F. Bennani',
        reason: 'Echo review',
        color: 'olive',
    },
    {
        day: 1,
        hour: 1.75,
        span: 1,
        name: 'Y. Tazi',
        reason: 'Chest pain',
        color: 'warn',
    },
    {
        day: 1,
        hour: 3,
        span: 0.5,
        name: 'M. Saidi',
        reason: 'Pre-op',
        color: '',
    },
    {
        day: 1,
        hour: 6,
        span: 1,
        name: 'L. Ouazzani',
        reason: 'Stress test',
        color: 'olive',
    },
    {
        day: 2,
        hour: 1,
        span: 1,
        name: 'K. Sabri',
        reason: 'Follow-up',
        color: '',
    },
    {
        day: 2,
        hour: 2,
        span: 1,
        name: 'N. Filali',
        reason: 'Palpitations',
        color: 'olive',
    },
    {
        day: 2,
        hour: 6,
        span: 1,
        name: 'T. Berrada',
        reason: 'Consultation',
        color: '',
    },
    {
        day: 3,
        hour: 0,
        span: 1,
        name: 'A. Berrada',
        reason: 'Arrhythmia',
        color: 'olive',
    },
    {
        day: 3,
        hour: 2,
        span: 0.5,
        name: 'K. Mansouri',
        reason: 'Refill',
        color: '',
    },
    {
        day: 3,
        hour: 6,
        span: 1.5,
        name: 'Z. Hilali',
        reason: 'New patient',
        color: 'warn',
    },
    { day: 4, hour: 1, span: 1, name: 'O. Chraibi', reason: 'ECG', color: '' },
    {
        day: 4,
        hour: 4,
        span: 1,
        name: 'Lunch break',
        reason: '',
        color: 'block',
    },
    {
        day: 4,
        hour: 6,
        span: 1,
        name: 'S. Idrissi',
        reason: 'Lab review',
        color: 'olive',
    },
    {
        day: 5,
        hour: 1,
        span: 1,
        name: 'H. Senhaji',
        reason: 'Follow-up',
        color: '',
    },
    {
        day: 5,
        hour: 2,
        span: 1,
        name: 'M. Kettani',
        reason: 'Consultation',
        color: 'olive',
    },
];

const EVENT_TONE: Record<CalendarEvent['color'], string> = {
    '': 'bg-navy-100 text-navy-900 border-s-[3px] border-navy-700',
    olive: 'bg-olive-100 text-olive-700 border-s-[3px] border-olive-600',
    warn: 'bg-warning-soft text-warning border-s-[3px] border-warning',
    block: '',
};

export default function DoctorCalendar() {
    const { t } = useDoctorLang();

    return (
        <>
            <Head title={t.appointments} />

            <div className="px-8 py-6 lg:px-10">
                <PageHeader
                    title={t.appointments}
                    description="Week of May 4 – 10, 2026 · 12 appointments"
                    actions={
                        <>
                            <div className="inline-flex gap-px rounded-md bg-muted p-[3px]">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7"
                                >
                                    {t.day}
                                </Button>
                                <Button
                                    size="sm"
                                    className="h-7 bg-background text-foreground shadow-xs hover:bg-background"
                                >
                                    {t.week}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7"
                                >
                                    {t.month}
                                </Button>
                            </div>
                            <Button variant="outline" size="sm">
                                {t.today}
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="size-8"
                            >
                                <ChevronLeft className="size-3.5" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="size-8"
                            >
                                <ChevronRight className="size-3.5" />
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

                <div
                    className="grid overflow-hidden rounded-xl border border-border bg-card"
                    style={{
                        gridTemplateColumns: '60px repeat(7, minmax(0, 1fr))',
                    }}
                >
                    <div className="border-b border-border bg-muted" />
                    {DAYS.map((d, i) => (
                        <div
                            key={d}
                            className="border-b border-border bg-muted p-2.5 text-center text-[11px] font-semibold tracking-wider text-muted-foreground uppercase"
                        >
                            {t[d]}
                            <div
                                className={cn(
                                    'mt-0.5 text-lg font-semibold tracking-normal normal-case',
                                    i === TODAY_INDEX
                                        ? 'text-olive-700'
                                        : 'text-foreground',
                                )}
                            >
                                {DATES[i]}
                            </div>
                        </div>
                    ))}

                    {HOURS.map((hour, hi) => (
                        <div key={hour} className="contents">
                            <div className="border-e border-b border-dashed border-border px-1.5 py-2 text-end text-[10px] text-muted-foreground tabular-nums">
                                {hour}
                            </div>
                            {DAYS.map((d, di) => {
                                const cellEvents = EVENTS.filter(
                                    (e) =>
                                        e.day === di &&
                                        Math.floor(e.hour) === hi,
                                );

                                return (
                                    <div
                                        key={`${d}-${hour}`}
                                        className="relative min-h-[50px] border-e border-b border-dashed border-border p-0.5 last:border-e-0"
                                    >
                                        {cellEvents.map((e, ei) => {
                                            const offsetTop =
                                                (e.hour - Math.floor(e.hour)) *
                                                50;
                                            const height = e.span * 50 - 2;

                                            if (e.color === 'block') {
                                                return (
                                                    <div
                                                        key={ei}
                                                        className="absolute start-0.5 end-0.5 rounded border border-dashed border-border p-1 text-[10px] text-muted-foreground"
                                                        style={{
                                                            top: offsetTop,
                                                            height,
                                                            backgroundImage:
                                                                'repeating-linear-gradient(45deg, var(--muted), var(--muted) 6px, white 6px, white 12px)',
                                                        }}
                                                    >
                                                        {e.name}
                                                    </div>
                                                );
                                            }

                                            return (
                                                <div
                                                    key={ei}
                                                    className={cn(
                                                        'absolute start-0.5 end-0.5 cursor-pointer rounded px-1.5 py-1 text-[11px] leading-tight font-medium',
                                                        EVENT_TONE[e.color],
                                                    )}
                                                    style={{
                                                        top: offsetTop,
                                                        height,
                                                    }}
                                                >
                                                    {e.name}
                                                    {e.reason && (
                                                        <small className="mt-0.5 block text-[10px] font-normal opacity-75">
                                                            {e.reason}
                                                        </small>
                                                    )}
                                                </div>
                                            );
                                        })}
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
