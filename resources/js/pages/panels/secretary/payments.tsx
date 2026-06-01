import { Head } from '@inertiajs/react';
import { BarChart3, CircleDollarSign, Receipt, Wallet } from 'lucide-react';

import { KpiCard } from '@/components/blue-dome/kpi-card';
import { PageHeader } from '@/components/blue-dome/page-header';
import { SectionCard } from '@/components/blue-dome/section-card';
import { StatusPill } from '@/components/blue-dome/status-pill';
import type { StatusTone } from '@/components/blue-dome/status-pill';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { fmtNumber } from '@/lib/format';
import { useSecretaryLang } from '@/lib/i18n/secretary-context';
import { Pagination } from '@/pages/panels/super-admin/users';

type Person = { first_name: string | null; last_name: string | null };

type PaymentRow = {
    id: string;
    payment_number: string | null;
    payment_date: string | null;
    amount: string | number;
    payment_method: string;
    currency: string | null;
    patient?: Person | null;
    invoice?: { invoice_number: string | null } | null;
};

type Paginated<T> = {
    data: T[];
    total: number;
    current_page: number;
    last_page: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
};

interface Props {
    payments: Paginated<PaymentRow>;
    kpis: {
        today: number;
        week: number;
        month: number;
        avg: number;
        currency: string;
    };
    method_breakdown: { method: string; amount: number; count: number }[];
}

const METHOD_META: Record<string, { tone: StatusTone; color: string }> = {
    cash: { tone: 'olive', color: 'var(--color-olive-600)' },
    bank_wire: { tone: 'navy', color: 'var(--color-navy-700)' },
    card: { tone: 'info', color: 'var(--color-info)' },
    insurance: { tone: 'warning', color: 'var(--color-warning)' },
    check: { tone: 'neutral', color: 'var(--color-muted-foreground)' },
};

const methodMeta = (m: string): { tone: StatusTone; color: string } =>
    METHOD_META[m] ?? {
        tone: 'neutral',
        color: 'var(--color-muted-foreground)',
    };

const fullName = (
    p: Person | null | undefined,
    fallback: string,
): string =>
    p
        ? `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || fallback
        : fallback;

export default function SecretaryPayments({
    payments,
    kpis,
    method_breakdown,
}: Props) {
    const { t } = useSecretaryLang();

    const money = (n: number): string => `${fmtNumber(n)} ${t.mad}`;
    const methodLabel = (m: string): string => t[`pay_method_${m}`] ?? m;
    const breakdownTotal = method_breakdown.reduce(
        (s, b) => s + Number(b.amount),
        0,
    );

    return (
        <>
            <Head title={t.nav_payments} />

            <div className="px-6 py-5 lg:px-8">
                <PageHeader title={t.nav_payments} description={money(kpis.month)} />

                <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                    <KpiCard
                        label={t.today}
                        value={money(kpis.today)}
                        icon={CircleDollarSign}
                        tone="olive"
                    />
                    <KpiCard
                        label={t.pay_kpi_week}
                        value={money(kpis.week)}
                        icon={Wallet}
                        tone="navy"
                    />
                    <KpiCard
                        label={t.pay_kpi_month}
                        value={money(kpis.month)}
                        icon={BarChart3}
                        tone="success"
                    />
                    <KpiCard
                        label={t.pay_kpi_avg}
                        value={money(kpis.avg)}
                        icon={Receipt}
                        tone="navy"
                    />
                </div>

                <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
                    <SectionCard
                        title={t.nav_payments}
                        titleIcon={<Wallet className="size-4" />}
                        bodyClassName="p-0"
                    >
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="px-5 py-2.5 text-[11px] tracking-wider uppercase">
                                        {t.pay_col_reference}
                                    </TableHead>
                                    <TableHead className="text-[11px] tracking-wider uppercase">
                                        {t.col_date}
                                    </TableHead>
                                    <TableHead className="text-[11px] tracking-wider uppercase">
                                        {t.col_patient}
                                    </TableHead>
                                    <TableHead className="text-[11px] tracking-wider uppercase">
                                        {t.col_invoice}
                                    </TableHead>
                                    <TableHead className="text-[11px] tracking-wider uppercase">
                                        {t.col_method}
                                    </TableHead>
                                    <TableHead className="text-end text-[11px] tracking-wider uppercase">
                                        {t.col_amount}
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {payments.data.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="py-10 text-center text-sm text-muted-foreground"
                                        >
                                            {t.empty_none}
                                        </TableCell>
                                    </TableRow>
                                )}
                                {payments.data.map((r) => {
                                    const m = methodMeta(r.payment_method);

                                    return (
                                        <TableRow
                                            key={r.id}
                                            className="hover:bg-muted/50"
                                        >
                                            <TableCell className="px-5 py-3 font-mono text-[11px] font-semibold">
                                                {r.payment_number ?? '—'}
                                            </TableCell>
                                            <TableCell className="text-[12px] text-muted-foreground tabular-nums">
                                                {r.payment_date?.slice(0, 10) ??
                                                    '—'}
                                            </TableCell>
                                            <TableCell className="text-[13px] font-semibold">
                                                {fullName(
                                                    r.patient,
                                                    t.unassigned,
                                                )}
                                            </TableCell>
                                            <TableCell className="font-mono text-[11px] text-muted-foreground">
                                                {r.invoice?.invoice_number ??
                                                    '—'}
                                            </TableCell>
                                            <TableCell>
                                                <StatusPill
                                                    tone={m.tone}
                                                    withDot
                                                >
                                                    {methodLabel(
                                                        r.payment_method,
                                                    )}
                                                </StatusPill>
                                            </TableCell>
                                            <TableCell className="text-end text-[13px] font-semibold text-olive-700 tabular-nums">
                                                {money(Number(r.amount))}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                        <Pagination paginated={payments} t={t} />
                    </SectionCard>

                    <SectionCard
                        title={t.pay_breakdown_title}
                        bodyClassName="p-4"
                    >
                        <div className="mb-3 text-[11px] text-muted-foreground">
                            {t.pay_breakdown_caption}
                        </div>
                        <Donut
                            breakdown={method_breakdown}
                            total={breakdownTotal}
                        />
                        <div className="mt-4 space-y-2">
                            {method_breakdown.length === 0 && (
                                <div className="text-[12px] text-muted-foreground">
                                    {t.empty_none}
                                </div>
                            )}
                            {method_breakdown.map((b) => (
                                <div
                                    key={b.method}
                                    className="flex items-center gap-2.5 text-[12px]"
                                >
                                    <span
                                        className="inline-block size-2.5 shrink-0 rounded-sm"
                                        style={{
                                            background: methodMeta(b.method)
                                                .color,
                                        }}
                                    />
                                    <span className="flex-1">
                                        {methodLabel(b.method)}
                                    </span>
                                    <span className="font-semibold tabular-nums">
                                        {fmtNumber(Number(b.amount))}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </SectionCard>
                </div>
            </div>
        </>
    );
}

function Donut({
    breakdown,
    total,
}: {
    breakdown: { method: string; amount: number }[];
    total: number;
}) {
    const r = 50;
    const cx = 60;
    const cy = 60;
    const safeTotal = total > 0 ? total : 1;
    const segs = breakdown.reduce<
        { method: string; color: string; start: number; end: number }[]
    >((list, b) => {
        const pct = (Number(b.amount) / safeTotal) * 100;
        const start = list.length === 0 ? 0 : list[list.length - 1].end;

        list.push({
            method: b.method,
            color: METHOD_META[b.method]?.color ?? 'var(--color-muted-foreground)',
            start,
            end: start + pct,
        });

        return list;
    }, []);
    const polar = (pct: number): readonly [number, number] => {
        const ang = (pct / 100) * 2 * Math.PI - Math.PI / 2;

        return [cx + r * Math.cos(ang), cy + r * Math.sin(ang)] as const;
    };

    return (
        <div className="mx-auto" style={{ width: 120 }}>
            <svg viewBox="0 0 120 120" width="120" height="120">
                {total > 0 ? (
                    segs.map((s, i) => {
                        const [x1, y1] = polar(s.start);
                        const [x2, y2] = polar(s.end);
                        const large = s.end - s.start > 50 ? 1 : 0;
                        const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;

                        return (
                            <path
                                key={i}
                                d={path}
                                fill={s.color}
                                stroke="white"
                                strokeWidth="2"
                            />
                        );
                    })
                ) : (
                    <circle
                        cx={cx}
                        cy={cy}
                        r={r}
                        fill="var(--color-muted)"
                    />
                )}
                <circle cx={cx} cy={cy} r="28" fill="white" />
                <text
                    x={cx}
                    y={64}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight={700}
                    className="fill-navy-900"
                >
                    {fmtNumber(total)}
                </text>
            </svg>
        </div>
    );
}
