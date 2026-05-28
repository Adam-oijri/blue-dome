import { Head } from '@inertiajs/react';
import {
    Archive,
    BarChart3,
    CircleDollarSign,
    Filter,
    Receipt,
    Wallet,
} from 'lucide-react';

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
import { findPatient, localName } from '@/lib/mock/secretary';

type PaymentMethod = 'cash' | 'card' | 'transfer' | 'insurance' | 'check';

const PAYMENTS: {
    ref: string;
    inv: string;
    patient: string;
    date: string;
    method: PaymentMethod;
    amount: number;
}[] = [
    {
        ref: 'PAY-7821',
        inv: 'INV-2026-1284',
        patient: 'p1',
        date: '5 May 11:42',
        method: 'cash',
        amount: 850,
    },
    {
        ref: 'PAY-7820',
        inv: 'INV-2026-1282',
        patient: 'p2',
        date: '4 May 16:15',
        method: 'card',
        amount: 600,
    },
    {
        ref: 'PAY-7819',
        inv: 'INV-2026-1281',
        patient: 'p7',
        date: '4 May 14:30',
        method: 'card',
        amount: 480,
    },
    {
        ref: 'PAY-7818',
        inv: 'INV-2026-1279',
        patient: 'p8',
        date: '2 May 12:08',
        method: 'insurance',
        amount: 750,
    },
    {
        ref: 'PAY-7817',
        inv: 'INV-2026-1276',
        patient: 'p4',
        date: '1 May 17:50',
        method: 'cash',
        amount: 320,
    },
    {
        ref: 'PAY-7816',
        inv: 'INV-2026-1273',
        patient: 'p9',
        date: '30 Apr 10:22',
        method: 'transfer',
        amount: 2400,
    },
    {
        ref: 'PAY-7815',
        inv: 'INV-2026-1270',
        patient: 'p3',
        date: '29 Apr 15:00',
        method: 'cash',
        amount: 540,
    },
    {
        ref: 'PAY-7814',
        inv: 'INV-2026-1268',
        patient: 'p6',
        date: '28 Apr 09:40',
        method: 'card',
        amount: 1100,
    },
    {
        ref: 'PAY-7813',
        inv: 'INV-2026-1265',
        patient: 'p2',
        date: '27 Apr 11:30',
        method: 'insurance',
        amount: 1850,
    },
    {
        ref: 'PAY-7812',
        inv: 'INV-2026-1262',
        patient: 'p1',
        date: '26 Apr 14:18',
        method: 'check',
        amount: 700,
    },
];

const METHOD_LABEL: Record<PaymentMethod, string> = {
    cash: 'Cash',
    card: 'Card',
    transfer: 'Transfer',
    insurance: 'Insurance',
    check: 'Check',
};

const METHOD_TONE: Record<PaymentMethod, StatusTone> = {
    cash: 'olive',
    card: 'info',
    transfer: 'navy',
    insurance: 'warning',
    check: 'neutral',
};

const BREAKDOWN: {
    method: PaymentMethod;
    amt: number;
    pct: number;
    color: string;
}[] = [
    { method: 'cash', amt: 18420, pct: 38, color: 'var(--color-olive-600)' },
    { method: 'card', amt: 14280, pct: 29, color: 'var(--color-info)' },
    { method: 'insurance', amt: 9100, pct: 19, color: 'var(--color-warning)' },
    { method: 'transfer', amt: 5200, pct: 11, color: 'var(--color-navy-700)' },
    {
        method: 'check',
        amt: 1720,
        pct: 3,
        color: 'var(--color-muted-foreground)',
    },
];

export default function SecretaryPayments() {
    const { t, lang } = useSecretaryLang();

    return (
        <>
            <Head title={t.nav_payments} />

            <div className="px-6 py-5 lg:px-8">
                <PageHeader
                    title={t.nav_payments}
                    description="48,720 MAD collected this month · +18% vs April"
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
                                size="sm"
                                className="gap-2 bg-olive-600 text-white hover:bg-olive-700"
                            >
                                <CircleDollarSign className="size-3.5" />
                                Record payment
                            </Button>
                        </>
                    }
                />

                <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                    <KpiCard
                        label="Today"
                        value="2,480 MAD"
                        icon={CircleDollarSign}
                        tone="olive"
                        trend={{ value: '+12%', direction: 'up' }}
                    />
                    <KpiCard
                        label="This week"
                        value="14,820 MAD"
                        icon={Wallet}
                        tone="navy"
                    />
                    <KpiCard
                        label="This month"
                        value="48,720 MAD"
                        icon={BarChart3}
                        tone="success"
                        trend={{ value: '+18%', direction: 'up' }}
                    />
                    <KpiCard
                        label="Avg. payment"
                        value="486 MAD"
                        icon={Receipt}
                        tone="navy"
                    />
                </div>

                <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
                    <SectionCard
                        title="Recent payments"
                        titleIcon={<Wallet className="size-4" />}
                        actions={
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-7"
                            >
                                <Filter className="size-3.5" />
                            </Button>
                        }
                        bodyClassName="p-0"
                    >
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="px-5 py-2.5 text-[11px] tracking-wider uppercase">
                                        Reference
                                    </TableHead>
                                    <TableHead className="text-[11px] tracking-wider uppercase">
                                        Date
                                    </TableHead>
                                    <TableHead className="text-[11px] tracking-wider uppercase">
                                        Patient
                                    </TableHead>
                                    <TableHead className="text-[11px] tracking-wider uppercase">
                                        Invoice
                                    </TableHead>
                                    <TableHead className="text-[11px] tracking-wider uppercase">
                                        Method
                                    </TableHead>
                                    <TableHead className="text-end text-[11px] tracking-wider uppercase">
                                        Amount
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {PAYMENTS.map((r, i) => {
                                    const p = findPatient(r.patient);

                                    if (!p) {
                                        return null;
                                    }

                                    return (
                                        <TableRow
                                            key={i}
                                            className="hover:bg-muted/50"
                                        >
                                            <TableCell className="px-5 py-3 font-mono text-[11px] font-semibold">
                                                {r.ref}
                                            </TableCell>
                                            <TableCell className="text-[12px] text-muted-foreground tabular-nums">
                                                {r.date}
                                            </TableCell>
                                            <TableCell className="text-[13px] font-semibold">
                                                {localName(p, lang)}
                                            </TableCell>
                                            <TableCell className="font-mono text-[11px] text-muted-foreground">
                                                {r.inv}
                                            </TableCell>
                                            <TableCell>
                                                <StatusPill
                                                    tone={METHOD_TONE[r.method]}
                                                    withDot
                                                >
                                                    {METHOD_LABEL[r.method]}
                                                </StatusPill>
                                            </TableCell>
                                            <TableCell className="text-end text-[13px] font-semibold text-olive-700 tabular-nums">
                                                +
                                                {r.amount.toLocaleString(
                                                    'en-US',
                                                )}{' '}
                                                {t.mad}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </SectionCard>

                    <SectionCard title="Method breakdown" bodyClassName="p-4">
                        <div className="mb-3 text-[11px] text-muted-foreground">
                            30-day total
                        </div>
                        <Donut breakdown={BREAKDOWN} />
                        <div className="mt-4 space-y-2">
                            {BREAKDOWN.map((b) => (
                                <div
                                    key={b.method}
                                    className="flex items-center gap-2.5 text-[12px]"
                                >
                                    <span
                                        className="inline-block size-2.5 shrink-0 rounded-sm"
                                        style={{ background: b.color }}
                                    />
                                    <span className="flex-1">
                                        {METHOD_LABEL[b.method]}
                                    </span>
                                    <span className="font-semibold tabular-nums">
                                        {b.amt.toLocaleString('en-US')}
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
}: {
    breakdown: { method: string; pct: number; color: string }[];
}) {
    const r = 50;
    const cx = 60;
    const cy = 60;
    const segs = breakdown.reduce<
        {
            method: string;
            pct: number;
            color: string;
            start: number;
            end: number;
        }[]
    >((list, b) => {
        const start = list.length === 0 ? 0 : list[list.length - 1].end;

        list.push({ ...b, start, end: start + b.pct });

        return list;
    }, []);
    const polar = (pct: number) => {
        const ang = (pct / 100) * 2 * Math.PI - Math.PI / 2;

        return [cx + r * Math.cos(ang), cy + r * Math.sin(ang)] as const;
    };

    return (
        <div className="mx-auto" style={{ width: 120 }}>
            <svg viewBox="0 0 120 120" width="120" height="120">
                {segs.map((s, i) => {
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
                })}
                <circle cx={cx} cy={cy} r="28" fill="white" />
                <text
                    x={cx}
                    y={56}
                    textAnchor="middle"
                    fontSize="10"
                    className="fill-muted-foreground"
                >
                    Total
                </text>
                <text
                    x={cx}
                    y={72}
                    textAnchor="middle"
                    fontSize="14"
                    fontWeight={700}
                    className="fill-navy-900"
                >
                    48.7K
                </text>
            </svg>
        </div>
    );
}
