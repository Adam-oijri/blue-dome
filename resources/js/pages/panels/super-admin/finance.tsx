import { Head, Link } from '@inertiajs/react';
import {
    Building2,
    CreditCard,
    Download,
    Receipt,
    TrendingUp,
    Wallet,
} from 'lucide-react';

import { KpiCard } from '@/components/blue-dome/kpi-card';
import { PageHeader } from '@/components/blue-dome/page-header';
import { SectionCard } from '@/components/blue-dome/section-card';
import { StatusPill } from '@/components/blue-dome/status-pill';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { fmtMonth, fmtNumber } from '@/lib/format';
import { useSuperAdminLang } from '@/lib/i18n/super-admin-context';
import { useLocale } from '@/lib/i18n/use-locale';
import superAdmin from '@/routes/super-admin';

interface MonthlyRevenueRow {
    month: string;
    amount: number;
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

interface MrrSummary {
    currency: string;
    amount: number;
    by_plan: Record<string, number>;
}

interface OverdueRow {
    clinic_id: string;
    clinic_name: string;
    overdue_count: number;
    overdue_amount: number;
}

interface PaymentMethodRow {
    method: string;
    count: number;
    amount: number;
}

interface Props {
    mrr: MrrSummary;
    monthly_revenue: MonthlyRevenueRow[];
    top_clinics: TopClinicRow[];
    total_revenue: { currency: string; amount: number };
    active_subscriptions: number;
    overdue_by_clinic: OverdueRow[];
    overdue_total: number;
    payment_methods: PaymentMethodRow[];
    currency: string;
}

export default function SuperAdminFinancePage({
    mrr,
    monthly_revenue,
    top_clinics,
    total_revenue,
    active_subscriptions,
    overdue_by_clinic,
    overdue_total,
    payment_methods,
    currency,
}: Props) {
    const { t, lang } = useSuperAdminLang();
    const { slug: locale } = useLocale();

    return (
        <>
            <Head title={t.finance_page_title} />

            <div className="px-6 py-5 lg:px-8">
                <PageHeader
                    title={t.finance_page_title}
                    description={t.finance_page_sub}
                    actions={
                        <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="gap-2"
                        >
                            <a href={superAdmin.finance.export.url({ locale })}>
                                <Download className="size-3.5" />
                                Export revenue
                            </a>
                        </Button>
                    }
                />

                <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                    <KpiCard
                        label={t.finance_kpi_mrr}
                        value={`${fmtNumber(mrr.amount)} ${mrr.currency}`}
                        icon={Wallet}
                        tone="olive"
                    />
                    <KpiCard
                        label={t.finance_kpi_revenue30}
                        value={`${fmtNumber(total_revenue.amount)} ${total_revenue.currency}`}
                        icon={TrendingUp}
                        tone="navy"
                    />
                    <KpiCard
                        label={t.finance_kpi_overdue}
                        value={`${fmtNumber(overdue_total)} ${currency}`}
                        icon={Receipt}
                        tone="warn"
                    />
                    <KpiCard
                        label={t.finance_kpi_active_subs}
                        value={fmtNumber(active_subscriptions)}
                        icon={Building2}
                        tone="olive"
                    />
                </div>

                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
                    <div className="flex flex-col gap-5">
                        <SectionCard
                            title={t.revenue_title}
                            titleIcon={<Wallet className="size-4" />}
                            bodyClassName="p-5"
                        >
                            <div className="mb-3 text-[12px] text-muted-foreground">
                                {t.revenue_sub}
                            </div>
                            <RevenueChart
                                data={monthly_revenue}
                                lang={lang}
                                currency={currency}
                            />
                        </SectionCard>

                        <SectionCard
                            title={t.branch_compare_title}
                            bodyClassName="p-0"
                        >
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead className="px-5 py-2.5 text-[11px] tracking-wider uppercase">
                                            {t.th_clinic}
                                        </TableHead>
                                        <TableHead className="text-[11px] tracking-wider uppercase">
                                            {t.th_country}
                                        </TableHead>
                                        <TableHead className="text-[11px] tracking-wider uppercase">
                                            {t.th_plan}
                                        </TableHead>
                                        <TableHead className="text-end text-[11px] tracking-wider uppercase">
                                            {t.label_patients}
                                        </TableHead>
                                        <TableHead className="text-end text-[11px] tracking-wider uppercase">
                                            {t.label_appts}
                                        </TableHead>
                                        <TableHead className="text-end text-[11px] tracking-wider uppercase">
                                            {t.th_revenue}
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {top_clinics.length === 0 && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={6}
                                                className="py-12 text-center text-sm text-muted-foreground"
                                            >
                                                {t.empty_no_data}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {top_clinics.map((c) => (
                                        <TableRow
                                            key={c.id}
                                            className="hover:bg-muted/50"
                                        >
                                            <TableCell className="px-5 py-3">
                                                <Link
                                                    href={superAdmin.clinics.show.url(
                                                        {
                                                            locale,
                                                            clinic: c.id,
                                                        },
                                                    )}
                                                    className="text-[13px] font-semibold hover:underline"
                                                >
                                                    {c.name}
                                                </Link>
                                            </TableCell>
                                            <TableCell className="text-[13px]">
                                                {c.country ?? '—'}
                                            </TableCell>
                                            <TableCell>
                                                <StatusPill tone="navy">
                                                    {c.subscription_plan ?? '—'}
                                                </StatusPill>
                                            </TableCell>
                                            <TableCell className="text-end text-[13px] tabular-nums">
                                                {c.patients_count}
                                            </TableCell>
                                            <TableCell className="text-end text-[13px] tabular-nums">
                                                {c.appointments_count}
                                            </TableCell>
                                            <TableCell className="text-end text-[13px] font-semibold text-navy-900 tabular-nums">
                                                {fmtNumber(c.revenue)}{' '}
                                                {currency}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </SectionCard>

                        <SectionCard
                            title={t.finance_overdue_title}
                            bodyClassName="p-0"
                        >
                            <div className="border-b border-border px-5 pb-3 text-[12px] text-muted-foreground">
                                {t.finance_overdue_sub}
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead className="px-5 py-2.5 text-[11px] tracking-wider uppercase">
                                            {t.th_clinic}
                                        </TableHead>
                                        <TableHead className="text-end text-[11px] tracking-wider uppercase">
                                            Count
                                        </TableHead>
                                        <TableHead className="text-end text-[11px] tracking-wider uppercase">
                                            {t.th_amount}
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {overdue_by_clinic.length === 0 && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={3}
                                                className="py-8 text-center text-sm text-muted-foreground"
                                            >
                                                {t.empty_no_data}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {overdue_by_clinic.map((row) => (
                                        <TableRow
                                            key={row.clinic_id}
                                            className="hover:bg-muted/50"
                                        >
                                            <TableCell className="px-5 py-3">
                                                <Link
                                                    href={superAdmin.clinics.show.url(
                                                        {
                                                            locale,
                                                            clinic: row.clinic_id,
                                                        },
                                                    )}
                                                    className="text-[13px] hover:underline"
                                                >
                                                    {row.clinic_name}
                                                </Link>
                                            </TableCell>
                                            <TableCell className="text-end text-[13px] tabular-nums">
                                                {row.overdue_count}
                                            </TableCell>
                                            <TableCell className="text-end text-[13px] font-semibold text-warning tabular-nums">
                                                {fmtNumber(row.overdue_amount)}{' '}
                                                {currency}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </SectionCard>
                    </div>

                    <div className="flex flex-col gap-5">
                        <SectionCard
                            title={t.finance_mrr_by_plan}
                            titleIcon={<Wallet className="size-4" />}
                            bodyClassName="p-4 space-y-3 text-[13px]"
                        >
                            {Object.keys(mrr.by_plan).length === 0 && (
                                <div className="text-center text-sm text-muted-foreground">
                                    {t.empty_no_data}
                                </div>
                            )}
                            {Object.entries(mrr.by_plan).map(
                                ([plan, count]) => (
                                    <div
                                        key={plan}
                                        className="flex items-center justify-between"
                                    >
                                        <span className="text-muted-foreground capitalize">
                                            {plan}
                                        </span>
                                        <span className="font-semibold text-navy-900 tabular-nums">
                                            {count}{' '}
                                            {count === 1 ? 'clinic' : 'clinics'}
                                        </span>
                                    </div>
                                ),
                            )}
                        </SectionCard>

                        <SectionCard
                            title={t.finance_payment_methods_title}
                            titleIcon={<CreditCard className="size-4" />}
                            bodyClassName="p-0"
                        >
                            <div className="border-b border-border px-5 pb-3 text-[12px] text-muted-foreground">
                                {t.finance_payment_methods_sub}
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead className="px-5 py-2.5 text-[11px] tracking-wider uppercase">
                                            {t.th_method}
                                        </TableHead>
                                        <TableHead className="text-end text-[11px] tracking-wider uppercase">
                                            Count
                                        </TableHead>
                                        <TableHead className="text-end text-[11px] tracking-wider uppercase">
                                            {t.th_amount}
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {payment_methods.length === 0 && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={3}
                                                className="py-8 text-center text-sm text-muted-foreground"
                                            >
                                                {t.empty_no_data}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {payment_methods.map((m) => (
                                        <TableRow key={m.method}>
                                            <TableCell className="px-5 py-3 text-[13px] capitalize">
                                                {m.method.replace('_', ' ')}
                                            </TableCell>
                                            <TableCell className="text-end text-[13px] tabular-nums">
                                                {m.count}
                                            </TableCell>
                                            <TableCell className="text-end text-[13px] font-semibold text-navy-900 tabular-nums">
                                                {fmtNumber(m.amount)} {currency}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </SectionCard>
                    </div>
                </div>
            </div>
        </>
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
    const total = data.reduce((s, d) => s + d.amount, 0);
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

    return (
        <>
            <div className="mb-2 flex items-end justify-between">
                <div>
                    <div className="text-[11px] tracking-wider text-muted-foreground uppercase">
                        12-month total
                    </div>
                    <div className="text-[22px] font-semibold text-navy-900 tabular-nums">
                        {fmtNumber(total)}{' '}
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
