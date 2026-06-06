import { Head, router } from '@inertiajs/react';
import {
    AlertTriangle,
    Archive,
    Calendar as CalendarIcon,
    Check,
    CircleDollarSign,
    Clock,
    Printer,
} from 'lucide-react';

import { KpiCard } from '@/components/blue-dome/kpi-card';
import { PageHeader } from '@/components/blue-dome/page-header';
import { SectionCard } from '@/components/blue-dome/section-card';
import { Button } from '@/components/ui/button';
import { fmtNumber } from '@/lib/format';
import { useSecretaryLang } from '@/lib/i18n/secretary-context';
import { useLocale } from '@/lib/i18n/use-locale';
import { cn } from '@/lib/utils';
import { reports as reportsRoute } from '@/routes/secretary';
import { exportMethod as reportsExport } from '@/routes/secretary/reports';

type Period = '7d' | '30d' | 'qtr';

type AppointmentsPerDay = { date: string; count: number };
type RevenuePerWeek = { week_label: string; amount: number | string };
type Funnel = {
    booked: number;
    confirmed: number;
    arrived: number;
    completed: number;
};
type DoctorVolume = { doctor_name: string | null; count: number };

interface Props {
    appointments_per_day: AppointmentsPerDay[];
    revenue_per_week: RevenuePerWeek[];
    funnel: Funnel;
    doctor_volumes: DoctorVolume[];
    filters: {
        period: Period;
    };
}

const PERIODS: ReadonlyArray<Period> = ['7d', '30d', 'qtr'];

const DOCTOR_COLORS = ['bg-navy-700', 'bg-olive-600', 'bg-info'];

const dayLabel = (iso: string): string => {
    const d = new Date(`${iso}T00:00:00`);

    return d.toLocaleDateString('en-US', { weekday: 'short' });
};

const pct = (n: number, total: number): number =>
    total > 0 ? Math.round((n / total) * 100) : 0;

export default function SecretaryReports({
    appointments_per_day,
    revenue_per_week,
    funnel,
    doctor_volumes,
    filters,
}: Props) {
    const { t } = useSecretaryLang();
    const { slug: locale } = useLocale();
    const period = filters.period;

    const periodLabels: Record<Period, string> = {
        '7d': t.rep_period_7d,
        '30d': t.rep_period_30d,
        qtr: t.rep_period_qtr,
    };

    const setPeriod = (next: Period): void => {
        router.get(
            reportsRoute.url({ locale }),
            { period: next },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const maxAppts = Math.max(1, ...appointments_per_day.map((d) => d.count));
    const maxRev = Math.max(
        1,
        ...revenue_per_week.map((r) => Number(r.amount)),
    );
    const maxDoc = Math.max(1, ...doctor_volumes.map((d) => d.count));

    const totalAppts = funnel.booked;
    const totalRevenue = revenue_per_week.reduce(
        (s, r) => s + Number(r.amount),
        0,
    );
    const showRate = pct(funnel.arrived, funnel.booked);
    const noShowRate =
        funnel.booked > 0
            ? Math.max(0, 100 - pct(funnel.arrived, funnel.booked))
            : 0;

    const funnelRows: { label: string; n: number; color: string }[] = [
        { label: t.rep_funnel_booked, n: funnel.booked, color: 'bg-navy-700' },
        {
            label: t.rep_funnel_confirmed,
            n: funnel.confirmed,
            color: 'bg-navy-600',
        },
        {
            label: t.rep_funnel_arrived,
            n: funnel.arrived,
            color: 'bg-olive-600',
        },
        {
            label: t.rep_funnel_completed,
            n: funnel.completed,
            color: 'bg-olive-500',
        },
    ];

    return (
        <>
            <Head title={t.nav_reports} />

            <div className="px-6 py-5 lg:px-8">
                <PageHeader
                    title={t.nav_reports}
                    description={t.rep_subtitle}
                    actions={
                        <>
                            <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="gap-2"
                            >
                                <a
                                    href={reportsExport.url(
                                        { locale },
                                        { query: { period } },
                                    )}
                                >
                                    <Archive className="size-3.5" />
                                    {t.action_export}
                                </a>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={() => window.print()}
                            >
                                <Printer className="size-3.5" />
                                {t.action_print}
                            </Button>
                        </>
                    }
                />

                <div className="mb-4 inline-flex gap-px rounded-md bg-muted p-[3px]">
                    {PERIODS.map((id) => (
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
                            {periodLabels[id]}
                        </button>
                    ))}
                </div>

                <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
                    <KpiCard
                        label={t.rep_kpi_total_appts}
                        value={fmtNumber(totalAppts)}
                        icon={CalendarIcon}
                        tone="navy"
                    />
                    <KpiCard
                        label={t.rep_kpi_show_rate}
                        value={`${showRate}%`}
                        icon={Check}
                        tone="success"
                    />
                    <KpiCard
                        label={t.rep_kpi_revenue}
                        value={`${fmtNumber(totalRevenue)} ${t.mad}`}
                        icon={CircleDollarSign}
                        tone="olive"
                    />
                    <KpiCard
                        label={t.rep_kpi_completed}
                        value={fmtNumber(funnel.completed)}
                        icon={Clock}
                        tone="navy"
                    />
                    <KpiCard
                        label={t.rep_kpi_no_shows}
                        value={`${noShowRate}%`}
                        icon={AlertTriangle}
                        tone="warn"
                    />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                    <SectionCard
                        title={t.rep_appt_volume}
                        bodyClassName="p-4"
                    >
                        <div className="mb-3 text-[11px] text-muted-foreground">
                            {t.rep_daily_appts}
                        </div>
                        <div className="flex h-40 items-end gap-2">
                            {appointments_per_day.map((d) => (
                                <div
                                    key={d.date}
                                    className="flex flex-1 flex-col justify-end gap-px"
                                >
                                    {d.count > 0 ? (
                                        <div
                                            className="rounded-t-sm bg-navy-700"
                                            style={{
                                                height: `${(d.count / maxAppts) * 100}%`,
                                            }}
                                        />
                                    ) : (
                                        <div className="h-1 bg-muted/60" />
                                    )}
                                </div>
                            ))}
                            {appointments_per_day.length === 0 && (
                                <div className="flex-1 text-center text-[12px] text-muted-foreground">
                                    {t.empty_none}
                                </div>
                            )}
                        </div>
                        <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
                            {appointments_per_day.map((d) => (
                                <span
                                    key={d.date}
                                    className="flex-1 text-center"
                                >
                                    {dayLabel(d.date)}
                                </span>
                            ))}
                        </div>
                    </SectionCard>

                    <SectionCard title={t.rep_revenue_trend} bodyClassName="p-4">
                        <div className="mb-3 text-[11px] text-muted-foreground">
                            {t.rep_weekly_collected} · {t.mad}
                        </div>
                        <div className="flex h-40 items-end gap-3">
                            {revenue_per_week.map((r) => (
                                <div
                                    key={r.week_label}
                                    className="flex flex-1 flex-col items-stretch gap-1"
                                >
                                    <div className="text-center text-[10px] font-semibold tabular-nums">
                                        {fmtNumber(Number(r.amount))}
                                    </div>
                                    <div
                                        className="rounded-t-sm bg-olive-600"
                                        style={{
                                            height: `${(Number(r.amount) / maxRev) * 100}%`,
                                        }}
                                    />
                                </div>
                            ))}
                            {revenue_per_week.length === 0 && (
                                <div className="flex-1 text-center text-[12px] text-muted-foreground">
                                    {t.empty_none}
                                </div>
                            )}
                        </div>
                        <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
                            {revenue_per_week.map((r) => (
                                <span
                                    key={r.week_label}
                                    className="flex-1 text-center"
                                >
                                    {r.week_label}
                                </span>
                            ))}
                        </div>
                    </SectionCard>

                    <SectionCard
                        title={t.rep_conversion_funnel}
                        bodyClassName="space-y-3 p-4"
                    >
                        <div className="text-[11px] text-muted-foreground">
                            {t.rep_funnel_flow}
                        </div>
                        {funnelRows.map((f) => {
                            const p = pct(f.n, totalAppts);

                            return (
                                <div key={f.label}>
                                    <div className="flex items-center justify-between text-[12px]">
                                        <span>{f.label}</span>
                                        <span className="font-semibold tabular-nums">
                                            {p}%
                                        </span>
                                    </div>
                                    <div className="relative mt-1 h-5 overflow-hidden rounded bg-muted">
                                        <div
                                            className={cn(
                                                'absolute inset-y-0 start-0 flex items-center px-2 text-[11px] font-semibold text-white',
                                                f.color,
                                            )}
                                            style={{ width: `${p}%` }}
                                        >
                                            {f.n}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </SectionCard>

                    <SectionCard
                        title={t.rep_by_doctor}
                        bodyClassName="space-y-3 p-4"
                    >
                        {doctor_volumes.length === 0 && (
                            <div className="text-[12px] text-muted-foreground">
                                {t.empty_none}
                            </div>
                        )}
                        {doctor_volumes.map((d, i) => (
                            <div
                                key={d.doctor_name ?? `doctor-${i}`}
                                className="grid grid-cols-[160px_1fr_40px] items-center gap-3 text-[12px]"
                            >
                                <span className="truncate">
                                    {d.doctor_name?.trim() || t.unassigned}
                                </span>
                                <div className="relative h-4 overflow-hidden rounded bg-muted">
                                    <div
                                        className={cn(
                                            'h-full rounded',
                                            DOCTOR_COLORS[
                                                i % DOCTOR_COLORS.length
                                            ],
                                        )}
                                        style={{
                                            width: `${(d.count / maxDoc) * 100}%`,
                                        }}
                                    />
                                </div>
                                <span className="text-end font-semibold tabular-nums">
                                    {d.count}
                                </span>
                            </div>
                        ))}
                    </SectionCard>
                </div>
            </div>
        </>
    );
}
