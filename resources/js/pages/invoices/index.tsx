import { Head } from '@inertiajs/react';
import {
    AlertTriangle,
    ChevronRight,
    CircleDollarSign,
    Clock,
    Download,
    MessageCircle,
    Plus,
    Printer,
    Receipt,
    Search,
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
import { useDoctorLang } from '@/lib/i18n/doctor-context';
import { cn } from '@/lib/utils';

type InvoiceStatus = 'paid' | 'pending' | 'partially_paid' | 'overdue';

const INVOICES: {
    id: string;
    patient: string;
    date: string;
    amount: string;
    status: InvoiceStatus;
    method: string;
}[] = [
    {
        id: 'INV-2026-04812',
        patient: 'Hassan El Amrani',
        date: 'May 5',
        amount: '450',
        status: 'paid',
        method: 'Cash',
    },
    {
        id: 'INV-2026-04811',
        patient: 'Fatima Bennani',
        date: 'May 5',
        amount: '650',
        status: 'paid',
        method: 'Card',
    },
    {
        id: 'INV-2026-04810',
        patient: 'Youssef Tazi',
        date: 'May 5',
        amount: '850',
        status: 'pending',
        method: 'Insurance',
    },
    {
        id: 'INV-2026-04809',
        patient: 'Aicha Berrada',
        date: 'May 5',
        amount: '450',
        status: 'partially_paid',
        method: 'Insurance + Cash',
    },
    {
        id: 'INV-2026-04805',
        patient: 'Salma Idrissi',
        date: 'May 4',
        amount: '300',
        status: 'paid',
        method: 'Card',
    },
    {
        id: 'INV-2026-04802',
        patient: 'Mehdi Saidi',
        date: 'May 4',
        amount: '1,200',
        status: 'overdue',
        method: '—',
    },
    {
        id: 'INV-2026-04798',
        patient: 'Karim Sabri',
        date: 'May 3',
        amount: '450',
        status: 'paid',
        method: 'Cash',
    },
];

const STATUS: Record<InvoiceStatus, { tone: StatusTone; label: string }> = {
    paid: { tone: 'success', label: 'Paid' },
    pending: { tone: 'warning', label: 'Pending' },
    partially_paid: { tone: 'info', label: 'Partial' },
    overdue: { tone: 'danger', label: 'Overdue' },
};

const FILTERS = ['All', 'Paid', 'Pending', 'Overdue'];

export default function InvoicesIndex() {
    const { t } = useDoctorLang();
    const [filter, setFilter] = useState('All');

    return (
        <>
            <Head title={t.invoices} />

            <div className="px-8 py-6 lg:px-10">
                <PageHeader
                    title={t.invoices}
                    description="May 2026 · 142 invoices · 18,420 MAD outstanding"
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
                                className="gap-2 bg-olive-600 text-white hover:bg-olive-700"
                            >
                                <Plus className="size-3.5" />
                                New invoice
                            </Button>
                        </>
                    }
                />

                <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                    <KpiCard
                        label="Revenue this month"
                        value="84,230 MAD"
                        icon={CircleDollarSign}
                        tone="olive"
                    />
                    <KpiCard
                        label="Outstanding"
                        value="18,420 MAD"
                        icon={Receipt}
                        tone="warn"
                    />
                    <KpiCard
                        label="Overdue"
                        value="3 invoices"
                        icon={AlertTriangle}
                        tone="warn"
                    />
                    <KpiCard
                        label="Avg. collection"
                        value="6.2 days"
                        icon={Clock}
                        tone="success"
                    />
                </div>

                <SectionCard bodyClassName="p-0">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
                        <div className="flex items-center gap-2.5">
                            <h2 className="flex items-center gap-2.5 text-lg font-semibold">
                                <Receipt className="size-4" />
                                All invoices
                            </h2>
                            <div className="ms-4 flex gap-1.5">
                                {FILTERS.map((f) => (
                                    <Button
                                        key={f}
                                        variant={
                                            filter === f ? 'default' : 'ghost'
                                        }
                                        size="sm"
                                        onClick={() => setFilter(f)}
                                        className={cn(
                                            filter === f
                                                ? 'bg-navy-900 text-white hover:bg-navy-800'
                                                : '',
                                        )}
                                    >
                                        {f}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="relative max-w-[260px] flex-1">
                            <Search className="pointer-events-none absolute start-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="search"
                                placeholder="Search invoice..."
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
                                    Date
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    Amount
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    Method
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    Status
                                </TableHead>
                                <TableHead className="w-32" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {INVOICES.map((inv) => {
                                const s = STATUS[inv.status];

                                return (
                                    <TableRow
                                        key={inv.id}
                                        className="cursor-pointer hover:bg-muted/50"
                                    >
                                        <TableCell className="px-5 py-3 text-[12px] font-medium tabular-nums">
                                            {inv.id}
                                        </TableCell>
                                        <TableCell className="text-[13px] font-medium">
                                            {inv.patient}
                                        </TableCell>
                                        <TableCell className="text-[12px] text-muted-foreground">
                                            {inv.date}
                                        </TableCell>
                                        <TableCell className="text-[13px] font-semibold tabular-nums">
                                            {inv.amount} MAD
                                        </TableCell>
                                        <TableCell className="text-[12px] text-muted-foreground">
                                            {inv.method}
                                        </TableCell>
                                        <TableCell>
                                            <StatusPill tone={s.tone}>
                                                {s.label}
                                            </StatusPill>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-7"
                                                >
                                                    <MessageCircle className="size-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-7"
                                                >
                                                    <Printer className="size-3.5" />
                                                </Button>
                                                <ChevronRight className="size-3.5 text-muted-foreground" />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </SectionCard>
            </div>
        </>
    );
}
