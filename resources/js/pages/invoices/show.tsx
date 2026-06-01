import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Receipt, Wallet } from 'lucide-react';

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
import { useLocale } from '@/lib/i18n/use-locale';
import invoices from '@/routes/invoices';

type Money = string | number;

type Patient = {
    id: string;
    first_name: string | null;
    last_name: string | null;
    patient_code?: string | null;
    phone_e164?: string | null;
} | null;

type InvoiceItem = {
    id: string;
    item_type: string | null;
    description: string | null;
    code: string | null;
    quantity: Money;
    unit_price: Money;
    discount_amount: Money | null;
};

type Payment = {
    id: string;
    payment_number: string | null;
    payment_date: string | null;
    payment_method: string | null;
    payment_status: string | null;
    amount: Money;
    currency: string | null;
};

type Invoice = {
    id: string;
    invoice_number: string | null;
    invoice_date: string | null;
    due_date: string | null;
    currency: string | null;
    subtotal: Money;
    total: Money;
    paid_amount: Money;
    balance_due: Money;
    status: string;
    notes?: string | null;
    patient?: Patient;
    items: InvoiceItem[];
    payments: Payment[];
};

const STATUS: Record<string, { tone: StatusTone; label: string }> = {
    draft: { tone: 'neutral', label: 'Draft' },
    pending: { tone: 'warning', label: 'Pending' },
    partially_paid: { tone: 'info', label: 'Partial' },
    paid: { tone: 'success', label: 'Paid' },
    overdue: { tone: 'danger', label: 'Overdue' },
    cancelled: { tone: 'neutral', label: 'Cancelled' },
    refunded: { tone: 'info', label: 'Refunded' },
};

function num(value: Money | null): number {
    const n = typeof value === 'string' ? parseFloat(value) : (value ?? 0);

    return Number.isFinite(n) ? n : 0;
}

function money(value: Money | null, currency: string | null): string {
    return `${num(value).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${currency ?? 'MAD'}`;
}

function personName(p?: Patient): string {
    return p ? `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || '—' : '—';
}

function humanize(value: string | null): string {
    return value ? value.replace(/_/g, ' ') : '—';
}

export default function InvoiceShow({ invoice }: { invoice: Invoice }) {
    const { slug: locale } = useLocale();
    const s = STATUS[invoice.status] ?? {
        tone: 'neutral' as StatusTone,
        label: invoice.status,
    };

    return (
        <>
            <Head title={`Invoice ${invoice.invoice_number ?? ''}`.trim()} />

            <div className="px-8 py-6 lg:px-10">
                <Link
                    href={invoices.index.url({ locale })}
                    className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="size-3.5" />
                    Back to invoices
                </Link>

                <PageHeader
                    title={invoice.invoice_number ?? 'Invoice'}
                    description={`${personName(invoice.patient)}${invoice.patient?.patient_code ? ` · ${invoice.patient.patient_code}` : ''}`}
                    actions={<StatusPill tone={s.tone}>{s.label}</StatusPill>}
                />

                <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                    <SummaryStat label="Subtotal" value={money(invoice.subtotal, invoice.currency)} />
                    <SummaryStat label="Total" value={money(invoice.total, invoice.currency)} />
                    <SummaryStat label="Paid" value={money(invoice.paid_amount, invoice.currency)} />
                    <SummaryStat
                        label="Balance due"
                        value={money(invoice.balance_due, invoice.currency)}
                        emphasize={num(invoice.balance_due) > 0}
                    />
                </div>

                <div className="mb-3 flex flex-wrap gap-x-8 gap-y-1 text-[12px] text-muted-foreground">
                    <span>Issued: {invoice.invoice_date?.slice(0, 10) ?? '—'}</span>
                    <span>Due: {invoice.due_date?.slice(0, 10) ?? '—'}</span>
                </div>

                <SectionCard
                    title="Line items"
                    titleIcon={<Receipt className="size-4" />}
                    bodyClassName="p-0"
                >
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="px-5 py-2.5 text-[11px] tracking-wider uppercase">
                                    Description
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    Qty
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    Unit price
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    Discount
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    Line total
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoice.items.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="py-10 text-center text-sm text-muted-foreground"
                                    >
                                        No line items.
                                    </TableCell>
                                </TableRow>
                            )}
                            {invoice.items.map((item) => {
                                const lineTotal =
                                    num(item.quantity) * num(item.unit_price) -
                                    num(item.discount_amount);

                                return (
                                    <TableRow key={item.id}>
                                        <TableCell className="px-5 py-3">
                                            <div className="text-[13px]">
                                                {item.description ?? '—'}
                                            </div>
                                            <div className="text-[11px] text-muted-foreground">
                                                {[humanize(item.item_type), item.code]
                                                    .filter(
                                                        (v) => v && v !== '—',
                                                    )
                                                    .join(' · ')}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-[13px] tabular-nums">
                                            {num(item.quantity)}
                                        </TableCell>
                                        <TableCell className="text-[13px] tabular-nums">
                                            {money(item.unit_price, invoice.currency)}
                                        </TableCell>
                                        <TableCell className="text-[13px] tabular-nums text-muted-foreground">
                                            {money(item.discount_amount, invoice.currency)}
                                        </TableCell>
                                        <TableCell className="text-[13px] font-semibold tabular-nums">
                                            {money(lineTotal, invoice.currency)}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </SectionCard>

                <div className="mt-5">
                    <SectionCard
                        title="Payments"
                        titleIcon={<Wallet className="size-4" />}
                        bodyClassName="p-0"
                    >
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="px-5 py-2.5 text-[11px] tracking-wider uppercase">
                                        Payment
                                    </TableHead>
                                    <TableHead className="text-[11px] tracking-wider uppercase">
                                        Date
                                    </TableHead>
                                    <TableHead className="text-[11px] tracking-wider uppercase">
                                        Method
                                    </TableHead>
                                    <TableHead className="text-[11px] tracking-wider uppercase">
                                        Amount
                                    </TableHead>
                                    <TableHead className="text-[11px] tracking-wider uppercase">
                                        Status
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoice.payments.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="py-10 text-center text-sm text-muted-foreground"
                                        >
                                            No payments recorded.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {invoice.payments.map((p) => (
                                    <TableRow key={p.id}>
                                        <TableCell className="px-5 py-3 text-[12px] font-medium tabular-nums">
                                            {p.payment_number ?? '—'}
                                        </TableCell>
                                        <TableCell className="text-[12px] text-muted-foreground tabular-nums">
                                            {p.payment_date?.slice(0, 10) ?? '—'}
                                        </TableCell>
                                        <TableCell className="text-[12px]">
                                            {humanize(p.payment_method)}
                                        </TableCell>
                                        <TableCell className="text-[13px] font-semibold tabular-nums">
                                            {money(p.amount, p.currency ?? invoice.currency)}
                                        </TableCell>
                                        <TableCell>
                                            <StatusPill
                                                tone={
                                                    p.payment_status === 'completed'
                                                        ? 'success'
                                                        : p.payment_status ===
                                                            'refunded'
                                                          ? 'info'
                                                          : 'warning'
                                                }
                                            >
                                                {humanize(p.payment_status)}
                                            </StatusPill>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </SectionCard>
                </div>
            </div>
        </>
    );
}

function SummaryStat({
    label,
    value,
    emphasize = false,
}: {
    label: string;
    value: string;
    emphasize?: boolean;
}) {
    return (
        <div className="rounded-lg border border-border bg-card p-4">
            <div className="text-[11px] tracking-wider text-muted-foreground uppercase">
                {label}
            </div>
            <div
                className={`mt-1 text-[18px] font-semibold tabular-nums ${emphasize ? 'text-danger' : ''}`}
            >
                {value}
            </div>
        </div>
    );
}
