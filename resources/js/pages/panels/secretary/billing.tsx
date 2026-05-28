import { Head } from '@inertiajs/react';
import {
    AlertTriangle,
    Archive,
    CircleDollarSign,
    Plus,
    Receipt,
    Search,
    Wallet,
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
import { findPatient, localName } from '@/lib/mock/secretary';
import { cn } from '@/lib/utils';

type InvStatus = 'paid' | 'pending' | 'partially_paid' | 'overdue';

const INVOICES: {
    num: string;
    patient: string;
    issued: string;
    due: string;
    total: number;
    paid: number;
    status: InvStatus;
}[] = [
    {
        num: 'INV-2026-1284',
        patient: 'p1',
        issued: '5 May',
        due: '20 May',
        total: 850,
        paid: 850,
        status: 'paid',
    },
    {
        num: 'INV-2026-1283',
        patient: 'p4',
        issued: '5 May',
        due: '20 May',
        total: 1450,
        paid: 0,
        status: 'pending',
    },
    {
        num: 'INV-2026-1282',
        patient: 'p2',
        issued: '4 May',
        due: '19 May',
        total: 600,
        paid: 600,
        status: 'paid',
    },
    {
        num: 'INV-2026-1281',
        patient: 'p7',
        issued: '4 May',
        due: '19 May',
        total: 980,
        paid: 480,
        status: 'partially_paid',
    },
    {
        num: 'INV-2026-1280',
        patient: 'p9',
        issued: '3 May',
        due: '18 May',
        total: 2200,
        paid: 0,
        status: 'pending',
    },
    {
        num: 'INV-2026-1279',
        patient: 'p8',
        issued: '2 May',
        due: '17 May',
        total: 750,
        paid: 750,
        status: 'paid',
    },
    {
        num: 'INV-2026-1278',
        patient: 'p3',
        issued: '2 May',
        due: '17 May',
        total: 1100,
        paid: 0,
        status: 'pending',
    },
    {
        num: 'INV-2026-1265',
        patient: 'p6',
        issued: '20 Apr',
        due: '5 May',
        total: 1850,
        paid: 0,
        status: 'overdue',
    },
    {
        num: 'INV-2026-1259',
        patient: 'p10',
        issued: '18 Apr',
        due: '3 May',
        total: 920,
        paid: 0,
        status: 'overdue',
    },
    {
        num: 'INV-2026-1241',
        patient: 'p5',
        issued: '10 Apr',
        due: '25 Apr',
        total: 540,
        paid: 0,
        status: 'overdue',
    },
];

const STATUS_PILL: Record<InvStatus, { tone: StatusTone; label: string }> = {
    paid: { tone: 'success', label: 'Paid' },
    pending: { tone: 'warning', label: 'Pending' },
    partially_paid: { tone: 'info', label: 'Partial' },
    overdue: { tone: 'danger', label: 'Overdue' },
};

const AGING_BUCKETS = [
    { label: 'Current', amount: 7920, pct: 62, color: 'bg-olive-500' },
    { label: '1-30 days', amount: 3580, pct: 28, color: 'bg-warning' },
    { label: '31-60 days', amount: 890, pct: 7, color: 'bg-orange-500' },
    { label: '61+ days', amount: 450, pct: 3, color: 'bg-danger' },
];

export default function SecretaryBilling() {
    const { t, lang } = useSecretaryLang();
    const [filter, setFilter] = useState<'all' | InvStatus>('all');
    const list =
        filter === 'all'
            ? INVOICES
            : INVOICES.filter((i) => i.status === filter);

    return (
        <>
            <Head title={t.nav_billing} />

            <div className="px-6 py-5 lg:px-8">
                <PageHeader
                    title={t.nav_billing}
                    description="42 open invoices · 3 overdue · 48,720 MAD collected this month"
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
                                <Plus className="size-3.5" />
                                New invoice
                            </Button>
                        </>
                    }
                />

                <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                    <KpiCard
                        label="Open invoices"
                        value="42"
                        icon={Receipt}
                        tone="navy"
                    />
                    <KpiCard
                        label="Overdue"
                        value="3"
                        icon={AlertTriangle}
                        tone="warn"
                        trend={{ value: '+1', direction: 'down' }}
                    />
                    <KpiCard
                        label="Collected"
                        value="48,720 MAD"
                        icon={CircleDollarSign}
                        tone="olive"
                        trend={{ value: '+18%', direction: 'up' }}
                    />
                    <KpiCard
                        label="Outstanding"
                        value="12,840 MAD"
                        icon={Wallet}
                        tone="warn"
                    />
                </div>

                <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
                    <SectionCard bodyClassName="p-0">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
                            <div className="flex flex-wrap gap-1.5">
                                {(
                                    [
                                        ['all', 'All', INVOICES.length],
                                        [
                                            'pending',
                                            'Pending',
                                            INVOICES.filter(
                                                (i) => i.status === 'pending',
                                            ).length,
                                        ],
                                        [
                                            'overdue',
                                            'Overdue',
                                            INVOICES.filter(
                                                (i) => i.status === 'overdue',
                                            ).length,
                                        ],
                                        [
                                            'paid',
                                            'Paid',
                                            INVOICES.filter(
                                                (i) => i.status === 'paid',
                                            ).length,
                                        ],
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
                            <div className="relative max-w-[240px] flex-1">
                                <Search className="pointer-events-none absolute start-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type="search"
                                    placeholder="Search invoices…"
                                    className="h-8 w-full rounded-md border border-transparent bg-muted ps-8 pe-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                />
                            </div>
                        </div>

                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="px-5 py-2.5 text-[11px] tracking-wider uppercase">
                                        Invoice
                                    </TableHead>
                                    <TableHead className="text-[11px] tracking-wider uppercase">
                                        Patient
                                    </TableHead>
                                    <TableHead className="text-[11px] tracking-wider uppercase">
                                        Issued
                                    </TableHead>
                                    <TableHead className="text-[11px] tracking-wider uppercase">
                                        Due
                                    </TableHead>
                                    <TableHead className="text-end text-[11px] tracking-wider uppercase">
                                        Total
                                    </TableHead>
                                    <TableHead className="text-end text-[11px] tracking-wider uppercase">
                                        Balance
                                    </TableHead>
                                    <TableHead className="text-[11px] tracking-wider uppercase">
                                        Status
                                    </TableHead>
                                    <TableHead className="w-20" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {list.map((r, i) => {
                                    const p = findPatient(r.patient);

                                    if (!p) {
                                        return null;
                                    }

                                    const balance = r.total - r.paid;
                                    const s = STATUS_PILL[r.status];

                                    return (
                                        <TableRow
                                            key={i}
                                            className="hover:bg-muted/50"
                                        >
                                            <TableCell className="px-5 py-3 font-mono text-[11px] font-semibold">
                                                {r.num}
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
                                                        <div className="text-[12px] font-semibold">
                                                            {localName(p, lang)}
                                                        </div>
                                                        <div className="text-[11px] text-muted-foreground">
                                                            {p.insurance}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-[12px] text-muted-foreground tabular-nums">
                                                {r.issued}
                                            </TableCell>
                                            <TableCell
                                                className={cn(
                                                    'text-[12px] tabular-nums',
                                                    r.status === 'overdue'
                                                        ? 'font-semibold text-danger'
                                                        : 'text-muted-foreground',
                                                )}
                                            >
                                                {r.due}
                                            </TableCell>
                                            <TableCell className="text-end text-[13px] font-semibold tabular-nums">
                                                {r.total.toLocaleString(
                                                    'en-US',
                                                )}{' '}
                                                <span className="text-[11px] font-normal text-muted-foreground">
                                                    {t.mad}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-end text-[13px] tabular-nums">
                                                {balance > 0 ? (
                                                    <span className="font-semibold text-navy-900">
                                                        {balance.toLocaleString(
                                                            'en-US',
                                                        )}{' '}
                                                        <span className="text-[11px] font-normal text-muted-foreground">
                                                            {t.mad}
                                                        </span>
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground/60">
                                                        —
                                                    </span>
                                                )}
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
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7"
                                                >
                                                    View
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </SectionCard>

                    <SectionCard
                        title="Aging analysis"
                        bodyClassName="space-y-3 p-4"
                    >
                        <div className="text-[11px] text-muted-foreground">
                            Outstanding balances by age
                        </div>
                        {AGING_BUCKETS.map((b) => (
                            <div key={b.label}>
                                <div className="flex items-center justify-between text-[12px]">
                                    <span>{b.label}</span>
                                    <span className="font-semibold tabular-nums">
                                        {b.pct}%
                                    </span>
                                </div>
                                <div className="relative mt-1 h-5 overflow-hidden rounded bg-muted">
                                    <div
                                        className={cn(
                                            'absolute inset-y-0 start-0 flex items-center px-2 text-[11px] font-semibold text-white',
                                            b.color,
                                        )}
                                        style={{ width: `${b.pct}%` }}
                                    >
                                        {b.amount.toLocaleString('en-US')}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div className="mt-2 flex items-center justify-between border-t border-border pt-3">
                            <span className="text-[12px] text-muted-foreground">
                                Total outstanding
                            </span>
                            <span className="text-[15px] font-semibold text-navy-900 tabular-nums">
                                12,840 {t.mad}
                            </span>
                        </div>
                    </SectionCard>
                </div>
            </div>
        </>
    );
}
