import { Head, Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    ChevronRight,
    CircleDollarSign,
    Receipt,
    Search,
    Wallet,
} from 'lucide-react';
import { useState } from 'react';

import { CreateInvoicesSheet } from '@/components/blue-dome/create-invoices-sheet';
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
import { enumLabel } from '@/lib/i18n/doctor';
import { useDoctorLang } from '@/lib/i18n/doctor-context';
import { useLocale } from '@/lib/i18n/use-locale';
import { cn } from '@/lib/utils';
import { Pagination } from '@/pages/panels/super-admin/users';
import invoices from '@/routes/invoices';

type Patient = {
    id: string;
    first_name: string | null;
    last_name: string | null;
    patient_code?: string | null;
};

type InvoiceRow = {
    id: string;
    invoice_number: string | null;
    invoice_date: string | null;
    currency: string | null;
    total: string | number;
    paid_amount: string | number;
    balance_due: string | number;
    status: string;
    patient?: Patient | null;
};

type Paginated<T> = {
    data: T[];
    total: number;
    current_page: number;
    last_page: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
};

const STATUS_TONE: Record<string, StatusTone> = {
    draft: 'neutral',
    pending: 'warning',
    partially_paid: 'info',
    paid: 'success',
    overdue: 'danger',
    cancelled: 'neutral',
    refunded: 'info',
};

function money(value: string | number, currency: string | null): string {
    const n = typeof value === 'string' ? parseFloat(value) : value;

    return `${(Number.isFinite(n) ? n : 0).toLocaleString(undefined, {
        maximumFractionDigits: 2,
    })} ${currency ?? 'MAD'}`;
}

function personName(p?: Patient | null): string {
    return p ? `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || '—' : '—';
}

export default function InvoicesIndex({
    invoices: invoiceList,
    patients,
    kpis,
    filters,
}: {
    invoices: Paginated<InvoiceRow>;
    patients: Patient[];
    kpis: {
        invoiced_mtd: number;
        collected_mtd: number;
        outstanding: number;
        overdue: number;
    };
    filters: { patient_id: string | null; status: string | null };
}) {
    const { t } = useDoctorLang();
    const { slug: locale } = useLocale();
    const [search, setSearch] = useState('');

    const filterTabs: Array<{ label: string; status: string | null }> = [
        { label: t.all_label, status: null },
        { label: enumLabel(t.invoice_status_opts, 'paid'), status: 'paid' },
        {
            label: enumLabel(t.invoice_status_opts, 'pending'),
            status: 'pending',
        },
        {
            label: enumLabel(t.invoice_status_opts, 'overdue'),
            status: 'overdue',
        },
    ];

    const setStatus = (status: string | null): void => {
        router.get(
            invoices.index.url({ locale }),
            {
                status: status || undefined,
                patient_id: filters.patient_id || undefined,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const term = search.trim().toLowerCase();
    const rows = term
        ? invoiceList.data.filter(
              (inv) =>
                  (inv.invoice_number ?? '').toLowerCase().includes(term) ||
                  personName(inv.patient).toLowerCase().includes(term),
          )
        : invoiceList.data;

    return (
        <>
            <Head title={t.invoices} />

            <div className="px-8 py-6 lg:px-10">
                <PageHeader
                    title={t.invoices}
                    description={`${invoiceList.total} ${t.invoices} · ${money(kpis.outstanding, 'MAD')} ${t.outstanding}`}
                    actions={
                        <CreateInvoicesSheet patients={patients}>
                            <Button
                                size="sm"
                                className="gap-2 bg-olive-600 text-white hover:bg-olive-700"
                            >
                                {t.new_invoice}
                            </Button>
                        </CreateInvoicesSheet>
                    }
                />

                <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                    <KpiCard
                        label={t.invoiced_mtd}
                        value={money(kpis.invoiced_mtd, 'MAD')}
                        icon={CircleDollarSign}
                        tone="olive"
                    />
                    <KpiCard
                        label={t.collected_mtd}
                        value={money(kpis.collected_mtd, 'MAD')}
                        icon={Wallet}
                        tone="success"
                    />
                    <KpiCard
                        label={t.outstanding}
                        value={money(kpis.outstanding, 'MAD')}
                        icon={Receipt}
                        tone="warn"
                    />
                    <KpiCard
                        label={t.overdue}
                        value={`${kpis.overdue} ${t.invoices}`}
                        icon={AlertTriangle}
                        tone="warn"
                    />
                </div>

                <SectionCard bodyClassName="p-0">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
                        <div className="flex items-center gap-2.5">
                            <h2 className="flex items-center gap-2.5 text-lg font-semibold">
                                <Receipt className="size-4" />
                                {t.all_invoices}
                            </h2>
                            <div className="ms-4 flex gap-1.5">
                                {filterTabs.map((f) => {
                                    const active =
                                        (filters.status ?? null) === f.status;

                                    return (
                                        <Button
                                            key={f.label}
                                            variant={active ? 'default' : 'ghost'}
                                            size="sm"
                                            onClick={() => setStatus(f.status)}
                                            className={cn(
                                                active
                                                    ? 'bg-navy-900 text-white hover:bg-navy-800'
                                                    : '',
                                            )}
                                        >
                                            {f.label}
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="relative max-w-[260px] flex-1">
                            <Search className="pointer-events-none absolute start-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={t.search_invoices_ph}
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
                                    {t.col_patient}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.col_date}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.col_amount}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.col_balance}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.col_status}
                                </TableHead>
                                <TableHead className="w-10" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="py-12 text-center text-sm text-muted-foreground"
                                    >
                                        {invoiceList.data.length === 0
                                            ? t.no_invoices
                                            : 'No invoices match your search.'}
                                    </TableCell>
                                </TableRow>
                            )}
                            {rows.map((inv) => {
                                const tone =
                                    STATUS_TONE[inv.status] ??
                                    ('neutral' as StatusTone);

                                return (
                                    <TableRow
                                        key={inv.id}
                                        className="hover:bg-muted/50"
                                    >
                                        <TableCell className="px-5 py-3 text-[12px] font-medium tabular-nums">
                                            <Link
                                                href={invoices.show.url({
                                                    locale,
                                                    invoice: inv.id,
                                                })}
                                            >
                                                {inv.invoice_number ?? '—'}
                                            </Link>
                                        </TableCell>
                                        <TableCell className="text-[13px] font-medium">
                                            {personName(inv.patient)}
                                        </TableCell>
                                        <TableCell className="text-[12px] text-muted-foreground tabular-nums">
                                            {inv.invoice_date?.slice(0, 10) ??
                                                '—'}
                                        </TableCell>
                                        <TableCell className="text-[13px] font-semibold tabular-nums">
                                            {money(inv.total, inv.currency)}
                                        </TableCell>
                                        <TableCell className="text-[12px] tabular-nums text-muted-foreground">
                                            {money(inv.balance_due, inv.currency)}
                                        </TableCell>
                                        <TableCell>
                                            <StatusPill tone={tone}>
                                                {enumLabel(
                                                    t.invoice_status_opts,
                                                    inv.status,
                                                )}
                                            </StatusPill>
                                        </TableCell>
                                        <TableCell>
                                            <Link
                                                href={invoices.show.url({
                                                    locale,
                                                    invoice: inv.id,
                                                })}
                                            >
                                                <ChevronRight className="size-3.5 text-muted-foreground" />
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>

                    <Pagination paginated={invoiceList} t={t} />
                </SectionCard>
            </div>
        </>
    );
}
