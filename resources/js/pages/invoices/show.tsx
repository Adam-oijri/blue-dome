import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, FileDown, Receipt, Wallet } from 'lucide-react';

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

const STATUS_TONE: Record<string, StatusTone> = {
    draft: 'neutral',
    pending: 'warning',
    partially_paid: 'info',
    paid: 'success',
    overdue: 'danger',
    cancelled: 'neutral',
    refunded: 'info',
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
    const { t } = useDoctorLang();
    const { slug: locale } = useLocale();
    const statusTone = STATUS_TONE[invoice.status] ?? 'neutral';

    return (
        <>
            <Head title={`Invoice ${invoice.invoice_number ?? ''}`.trim()} />

            <div className="px-8 py-6 lg:px-10">
                <Link
                    href={invoices.index.url({ locale })}
                    className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="size-3.5" />
                    {t.back_to_invoices}
                </Link>

                <PageHeader
                    title={invoice.invoice_number ?? 'Invoice'}
                    description={`${personName(invoice.patient)}${invoice.patient?.patient_code ? ` · ${invoice.patient.patient_code}` : ''}`}
                    actions={
                        <div className="flex items-center gap-2">
                            <StatusPill tone={statusTone}>
                                {enumLabel(t.invoice_status_opts, invoice.status)}
                            </StatusPill>
                            <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="gap-2"
                            >
                                <a
                                    href={invoices.pdf.url({
                                        locale,
                                        invoice: invoice.id,
                                    })}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <FileDown className="size-3.5" />
                                    {t.export_pdf}
                                </a>
                            </Button>
                        </div>
                    }
                />

                <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                    <SummaryStat label={t.subtotal} value={money(invoice.subtotal, invoice.currency)} />
                    <SummaryStat label={t.col_total} value={money(invoice.total, invoice.currency)} />
                    <SummaryStat label={t.paid_label} value={money(invoice.paid_amount, invoice.currency)} />
                    <SummaryStat
                        label={t.balance_due}
                        value={money(invoice.balance_due, invoice.currency)}
                        emphasize={num(invoice.balance_due) > 0}
                    />
                </div>

                <div className="mb-3 flex flex-wrap gap-x-8 gap-y-1 text-[12px] text-muted-foreground">
                    <span>{t.issued}: {invoice.invoice_date?.slice(0, 10) ?? '—'}</span>
                    <span>{t.due}: {invoice.due_date?.slice(0, 10) ?? '—'}</span>
                </div>

                <SectionCard
                    title={t.line_items}
                    titleIcon={<Receipt className="size-4" />}
                    bodyClassName="p-0"
                >
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="px-5 py-2.5 text-[11px] tracking-wider uppercase">
                                    {t.col_description}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.col_qty}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.col_unit_price}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.col_discount}
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    {t.col_total}
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
                                        {t.no_line_items}
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
                        title={t.payments_label}
                        titleIcon={<Wallet className="size-4" />}
                        bodyClassName="p-0"
                    >
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="px-5 py-2.5 text-[11px] tracking-wider uppercase">
                                        {t.payments_label}
                                    </TableHead>
                                    <TableHead className="text-[11px] tracking-wider uppercase">
                                        {t.col_date}
                                    </TableHead>
                                    <TableHead className="text-[11px] tracking-wider uppercase">
                                        {t.col_method}
                                    </TableHead>
                                    <TableHead className="text-[11px] tracking-wider uppercase">
                                        {t.col_amount}
                                    </TableHead>
                                    <TableHead className="text-[11px] tracking-wider uppercase">
                                        {t.col_status}
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
                                            {t.no_payments}
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
                                            {enumLabel(t.payment_method_opts, p.payment_method)}
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
                                                {enumLabel(t.payment_status_opts, p.payment_status)}
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
