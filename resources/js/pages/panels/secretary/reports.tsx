import { Head } from '@inertiajs/react';
import {
    AlertTriangle,
    Archive,
    Calendar as CalendarIcon,
    Check,
    CircleDollarSign,
    Clock,
    Printer,
} from 'lucide-react';
import { useState } from 'react';

import { KpiCard } from '@/components/blue-dome/kpi-card';
import { PageHeader } from '@/components/blue-dome/page-header';
import { SectionCard } from '@/components/blue-dome/section-card';
import { Button } from '@/components/ui/button';
import { useSecretaryLang } from '@/lib/i18n/secretary-context';
import { SECRETARY_MOCK, localName } from '@/lib/mock/secretary';
import { cn } from '@/lib/utils';

const APPTS_PER_DAY = [
    { day: 'Mon', a: 12, b: 6 },
    { day: 'Tue', a: 14, b: 8 },
    { day: 'Wed', a: 13, b: 6 },
    { day: 'Thu', a: 16, b: 10 },
    { day: 'Fri', a: 15, b: 9 },
    { day: 'Sat', a: 8, b: 4 },
    { day: 'Sun', a: 0, b: 0 },
];

const REV_PER_WEEK = [
    { week: 'W14', value: 42 },
    { week: 'W15', value: 51 },
    { week: 'W16', value: 47 },
    { week: 'W17', value: 49 },
];

const FUNNEL = [
    { label: 'Booked', pct: 100, n: 184, color: 'bg-navy-700' },
    { label: 'Confirmed', pct: 78, n: 144, color: 'bg-navy-600' },
    { label: 'Arrived', pct: 71, n: 131, color: 'bg-olive-600' },
    { label: 'Completed', pct: 68, n: 125, color: 'bg-olive-500' },
];

export default function SecretaryReports() {
    const { t, lang } = useSecretaryLang();
    const [period, setPeriod] = useState<'today' | '7d' | '30d' | 'qtr'>('7d');
    const maxAppts = Math.max(...APPTS_PER_DAY.map((d) => d.a + d.b));
    const maxRev = Math.max(...REV_PER_WEEK.map((r) => r.value));

    const docBars = [
        {
            name: localName(SECRETARY_MOCK.doctors[0], lang),
            n: 84,
            color: 'bg-navy-700',
        },
        {
            name: localName(SECRETARY_MOCK.doctors[1], lang),
            n: 71,
            color: 'bg-olive-600',
        },
        {
            name: localName(SECRETARY_MOCK.doctors[2], lang),
            n: 29,
            color: 'bg-info',
        },
    ];

    return (
        <>
            <Head title={t.nav_reports} />

            <div className="px-6 py-5 lg:px-8">
                <PageHeader
                    title={t.nav_reports}
                    description="Insights across appointments, revenue, and conversion"
                    actions={
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                            >
                                <Archive className="size-3.5" />
                                Export
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                            >
                                <Printer className="size-3.5" />
                                Print
                            </Button>
                        </>
                    }
                />

                <div className="mb-4 inline-flex gap-px rounded-md bg-muted p-[3px]">
                    {(
                        [
                            ['today', 'Today'],
                            ['7d', '7 days'],
                            ['30d', '30 days'],
                            ['qtr', 'Quarter'],
                        ] as const
                    ).map(([id, label]) => (
                        <button
                            key={id}
                            type="button"
                            onClick={() => setPeriod(id)}
                            className={cn(
                                'h-7 rounded-sm px-3 text-[12px] font-semibold transition-colors',
                                period === id
                                    ? 'bg-background text-foreground shadow-xs'
                                    : 'text-muted-foreground hover:text-foreground',
                            )}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
                    <KpiCard
                        label="Total appts"
                        value="184"
                        icon={CalendarIcon}
                        tone="navy"
                        trend={{ value: '+12%', direction: 'up' }}
                    />
                    <KpiCard
                        label="Show rate"
                        value="71%"
                        icon={Check}
                        tone="success"
                        trend={{ value: '+3.2%', direction: 'up' }}
                    />
                    <KpiCard
                        label="Revenue"
                        value="48.7K MAD"
                        icon={CircleDollarSign}
                        tone="olive"
                        trend={{ value: '+18%', direction: 'up' }}
                    />
                    <KpiCard
                        label="Avg. duration"
                        value="28 min"
                        icon={Clock}
                        tone="navy"
                    />
                    <KpiCard
                        label="No-shows"
                        value="4.2%"
                        icon={AlertTriangle}
                        tone="warn"
                        trend={{ value: '-0.4%', direction: 'up' }}
                    />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                    <SectionCard title="Appointment volume" bodyClassName="p-4">
                        <div className="mb-3 text-[11px] text-muted-foreground">
                            Daily · 7 days · stacked by doctor
                        </div>
                        <div className="flex h-40 items-end gap-2">
                            {APPTS_PER_DAY.map((d, i) => (
                                <div
                                    key={i}
                                    className="flex flex-1 flex-col gap-px"
                                >
                                    {d.b > 0 && (
                                        <div
                                            className="rounded-t-sm bg-olive-600"
                                            style={{
                                                height: `${(d.b / maxAppts) * 100}%`,
                                            }}
                                        />
                                    )}
                                    {d.a > 0 && (
                                        <div
                                            className="bg-navy-700"
                                            style={{
                                                height: `${(d.a / maxAppts) * 100}%`,
                                            }}
                                        />
                                    )}
                                    {d.a === 0 && d.b === 0 && (
                                        <div className="h-1 bg-muted/60" />
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
                            {APPTS_PER_DAY.map((d) => (
                                <span
                                    key={d.day}
                                    className="flex-1 text-center"
                                >
                                    {d.day}
                                </span>
                            ))}
                        </div>
                        <div className="mt-3 flex gap-4 text-[11px]">
                            <span className="flex items-center gap-1.5">
                                <span className="inline-block size-2.5 rounded-sm bg-navy-700" />
                                Dr. Lahlou
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="inline-block size-2.5 rounded-sm bg-olive-600" />
                                Dr. Idrissi
                            </span>
                        </div>
                    </SectionCard>

                    <SectionCard title="Revenue trend" bodyClassName="p-4">
                        <div className="mb-3 text-[11px] text-muted-foreground">
                            Last 4 weeks · MAD '000
                        </div>
                        <div className="flex h-40 items-end gap-3">
                            {REV_PER_WEEK.map((r, i) => (
                                <div
                                    key={i}
                                    className="flex flex-1 flex-col items-stretch gap-1"
                                >
                                    <div className="text-center text-[10px] font-semibold tabular-nums">
                                        {r.value}
                                    </div>
                                    <div
                                        className="rounded-t-sm bg-olive-600"
                                        style={{
                                            height: `${(r.value / maxRev) * 100}%`,
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
                            {REV_PER_WEEK.map((r) => (
                                <span
                                    key={r.week}
                                    className="flex-1 text-center"
                                >
                                    {r.week}
                                </span>
                            ))}
                        </div>
                    </SectionCard>

                    <SectionCard
                        title="Conversion funnel"
                        bodyClassName="space-y-3 p-4"
                    >
                        <div className="text-[11px] text-muted-foreground">
                            Booked → confirmed → arrived → completed
                        </div>
                        {FUNNEL.map((f) => (
                            <div key={f.label}>
                                <div className="flex items-center justify-between text-[12px]">
                                    <span>{f.label}</span>
                                    <span className="font-semibold tabular-nums">
                                        {f.pct}%
                                    </span>
                                </div>
                                <div className="relative mt-1 h-5 overflow-hidden rounded bg-muted">
                                    <div
                                        className={cn(
                                            'absolute inset-y-0 start-0 flex items-center px-2 text-[11px] font-semibold text-white',
                                            f.color,
                                        )}
                                        style={{ width: `${f.pct}%` }}
                                    >
                                        {f.n}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </SectionCard>

                    <SectionCard
                        title="By doctor · 7d"
                        bodyClassName="space-y-3 p-4"
                    >
                        {docBars.map((d) => (
                            <div
                                key={d.name}
                                className="grid grid-cols-[160px_1fr_40px] items-center gap-3 text-[12px]"
                            >
                                <span className="truncate">{d.name}</span>
                                <div className="relative h-4 overflow-hidden rounded bg-muted">
                                    <div
                                        className={cn(
                                            'h-full rounded',
                                            d.color,
                                        )}
                                        style={{ width: `${d.n}%` }}
                                    />
                                </div>
                                <span className="text-end font-semibold tabular-nums">
                                    {d.n}
                                </span>
                            </div>
                        ))}
                    </SectionCard>
                </div>
            </div>
        </>
    );
}
