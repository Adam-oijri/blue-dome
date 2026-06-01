import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Receipt, Trash2 } from 'lucide-react';
import type { FormEvent } from 'react';

import { PageHeader } from '@/components/blue-dome/page-header';
import { SectionCard } from '@/components/blue-dome/section-card';
import { StatusPill } from '@/components/blue-dome/status-pill';
import type { StatusTone } from '@/components/blue-dome/status-pill';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
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

type InvoiceItem = {
    id: string;
    item_type: string | null;
    description: string | null;
    code: string | null;
    quantity: Money;
    unit_price: Money;
    discount_amount: Money | null;
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
    discount_amount: Money | null;
    tax_percentage: Money | null;
    payment_terms: string | null;
    insurance_claim_number: string | null;
    insurance_coverage_percentage: Money | null;
    notes: string | null;
    items: InvoiceItem[];
};

const STATUS_TONE: Record<string, StatusTone> = {
    draft: 'neutral',
    pending: 'warning',
    partially_paid: 'info',
    paid: 'success',
    overdue: 'danger',
    cancelled: 'neutral',
    refunded: 'info',
    collections: 'danger',
};

const STATUS_OPTIONS: ReadonlyArray<string> = [
    'draft',
    'pending',
    'partially_paid',
    'paid',
    'overdue',
    'cancelled',
    'refunded',
    'collections',
];

const FIELD_CLASS =
    'border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]';

const TEXTAREA_CLASS =
    'border-input focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-[3px]';

function num(value: Money | null): number {
    const n = typeof value === 'string' ? parseFloat(value) : (value ?? 0);

    return Number.isFinite(n) ? n : 0;
}

function money(value: Money | null, currency: string | null): string {
    return `${num(value).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${currency ?? 'MAD'}`;
}

type EditForm = {
    invoice_date: string;
    due_date: string;
    status: string;
    discount_amount: string;
    tax_percentage: string;
    payment_terms: string;
    insurance_claim_number: string;
    insurance_coverage_percentage: string;
    notes: string;
};

export default function InvoiceEdit({ invoice }: { invoice: Invoice }) {
    const { t } = useDoctorLang();
    const { slug: locale } = useLocale();
    const statusTone = STATUS_TONE[invoice.status] ?? 'neutral';

    const { data, setData, patch, processing, errors } = useForm<EditForm>({
        invoice_date: invoice.invoice_date?.slice(0, 10) ?? '',
        due_date: invoice.due_date?.slice(0, 10) ?? '',
        status: invoice.status,
        discount_amount:
            invoice.discount_amount != null
                ? String(invoice.discount_amount)
                : '',
        tax_percentage:
            invoice.tax_percentage != null
                ? String(invoice.tax_percentage)
                : '',
        payment_terms: invoice.payment_terms ?? '',
        insurance_claim_number: invoice.insurance_claim_number ?? '',
        insurance_coverage_percentage:
            invoice.insurance_coverage_percentage != null
                ? String(invoice.insurance_coverage_percentage)
                : '',
        notes: invoice.notes ?? '',
    });

    function submit(event: FormEvent) {
        event.preventDefault();
        patch(invoices.update.url({ locale, invoice: invoice.id }), {
            preserveScroll: true,
        });
    }

    function destroy() {
        if (!window.confirm('Delete this invoice? This cannot be undone.')) {
            return;
        }

        router.delete(invoices.destroy.url({ locale, invoice: invoice.id }), {
            preserveScroll: true,
        });
    }

    return (
        <>
            <Head title={`${t.edit_invoice} ${invoice.invoice_number ?? ''}`.trim()} />

            <div className="px-8 py-6 lg:px-10">
                <Link
                    href={invoices.show.url({ locale, invoice: invoice.id })}
                    className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="size-3.5 rtl:rotate-180" />
                    {t.back_to_invoices}
                </Link>

                <PageHeader
                    title={`${t.edit} · ${invoice.invoice_number ?? 'Invoice'}`}
                    description={`${money(invoice.total, invoice.currency)} · ${t.balance_due}: ${money(invoice.balance_due, invoice.currency)}`}
                    actions={
                        <div className="flex items-center gap-3">
                            <StatusPill tone={statusTone}>
                                {enumLabel(
                                    t.invoice_status_opts,
                                    invoice.status,
                                )}
                            </StatusPill>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={destroy}
                                className="text-danger"
                            >
                                <Trash2 className="size-4" />
                                {t.delete_action}
                            </Button>
                        </div>
                    }
                />

                <div className="grid gap-5 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <SectionCard title={t.invoice_details}>
                            <form
                                onSubmit={submit}
                                className="space-y-4"
                                noValidate
                            >
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="invoice_date">
                                            {t.issued}
                                        </Label>
                                        <input
                                            id="invoice_date"
                                            type="date"
                                            value={data.invoice_date}
                                            onChange={(e) =>
                                                setData(
                                                    'invoice_date',
                                                    e.target.value,
                                                )
                                            }
                                            className={FIELD_CLASS}
                                        />
                                        <InputError
                                            message={errors.invoice_date}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="due_date">{t.due}</Label>
                                        <input
                                            id="due_date"
                                            type="date"
                                            value={data.due_date}
                                            onChange={(e) =>
                                                setData(
                                                    'due_date',
                                                    e.target.value,
                                                )
                                            }
                                            className={FIELD_CLASS}
                                        />
                                        <InputError message={errors.due_date} />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="status">
                                        {t.col_status}
                                    </Label>
                                    <select
                                        id="status"
                                        value={data.status}
                                        onChange={(e) =>
                                            setData('status', e.target.value)
                                        }
                                        className={FIELD_CLASS}
                                    >
                                        {STATUS_OPTIONS.map((option) => (
                                            <option key={option} value={option}>
                                                {enumLabel(
                                                    t.invoice_status_opts,
                                                    option,
                                                )}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.status} />
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="discount_amount">
                                            {t.col_discount} (
                                            {invoice.currency ?? 'MAD'})
                                        </Label>
                                        <input
                                            id="discount_amount"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={data.discount_amount}
                                            onChange={(e) =>
                                                setData(
                                                    'discount_amount',
                                                    e.target.value,
                                                )
                                            }
                                            className={`${FIELD_CLASS} tabular-nums`}
                                        />
                                        <InputError
                                            message={errors.discount_amount}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="tax_percentage">
                                            {t.tax_label} (%)
                                        </Label>
                                        <input
                                            id="tax_percentage"
                                            type="number"
                                            min="0"
                                            max="100"
                                            step="0.01"
                                            value={data.tax_percentage}
                                            onChange={(e) =>
                                                setData(
                                                    'tax_percentage',
                                                    e.target.value,
                                                )
                                            }
                                            className={`${FIELD_CLASS} tabular-nums`}
                                        />
                                        <InputError
                                            message={errors.tax_percentage}
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="payment_terms">
                                        {t.payment_terms}
                                    </Label>
                                    <input
                                        id="payment_terms"
                                        type="text"
                                        maxLength={100}
                                        value={data.payment_terms}
                                        onChange={(e) =>
                                            setData(
                                                'payment_terms',
                                                e.target.value,
                                            )
                                        }
                                        className={FIELD_CLASS}
                                    />
                                    <InputError
                                        message={errors.payment_terms}
                                    />
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="insurance_claim_number">
                                            {t.insurance_claim_number}
                                        </Label>
                                        <input
                                            id="insurance_claim_number"
                                            type="text"
                                            maxLength={100}
                                            value={data.insurance_claim_number}
                                            onChange={(e) =>
                                                setData(
                                                    'insurance_claim_number',
                                                    e.target.value,
                                                )
                                            }
                                            className={FIELD_CLASS}
                                        />
                                        <InputError
                                            message={
                                                errors.insurance_claim_number
                                            }
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="insurance_coverage_percentage">
                                            {t.insurance_coverage_pct}
                                        </Label>
                                        <input
                                            id="insurance_coverage_percentage"
                                            type="number"
                                            min="0"
                                            max="100"
                                            step="0.01"
                                            value={
                                                data.insurance_coverage_percentage
                                            }
                                            onChange={(e) =>
                                                setData(
                                                    'insurance_coverage_percentage',
                                                    e.target.value,
                                                )
                                            }
                                            className={`${FIELD_CLASS} tabular-nums`}
                                        />
                                        <InputError
                                            message={
                                                errors.insurance_coverage_percentage
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="notes">
                                        {t.notes_label}
                                    </Label>
                                    <textarea
                                        id="notes"
                                        rows={3}
                                        value={data.notes}
                                        onChange={(e) =>
                                            setData('notes', e.target.value)
                                        }
                                        className={TEXTAREA_CLASS}
                                    />
                                    <InputError message={errors.notes} />
                                </div>

                                <div className="flex items-center gap-3 pt-1">
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-olive-600 text-white hover:bg-olive-700"
                                    >
                                        {t.save_changes}
                                    </Button>
                                    <Link
                                        href={invoices.show.url({
                                            locale,
                                            invoice: invoice.id,
                                        })}
                                        className="text-[13px] text-muted-foreground hover:text-foreground"
                                    >
                                        {t.back}
                                    </Link>
                                </div>
                            </form>
                        </SectionCard>
                    </div>

                    <div className="space-y-5">
                        <SectionCard title={t.summary_label}>
                            <dl className="space-y-2.5 text-[13px]">
                                <SummaryRow
                                    label={t.subtotal}
                                    value={money(
                                        invoice.subtotal,
                                        invoice.currency,
                                    )}
                                />
                                <SummaryRow
                                    label={t.col_total}
                                    value={money(
                                        invoice.total,
                                        invoice.currency,
                                    )}
                                />
                                <SummaryRow
                                    label={t.paid_label}
                                    value={money(
                                        invoice.paid_amount,
                                        invoice.currency,
                                    )}
                                />
                                <div className="border-t border-border pt-2.5">
                                    <SummaryRow
                                        label={t.balance_due}
                                        value={money(
                                            invoice.balance_due,
                                            invoice.currency,
                                        )}
                                        emphasize={num(invoice.balance_due) > 0}
                                    />
                                </div>
                            </dl>
                        </SectionCard>
                    </div>
                </div>

                <div className="mt-5">
                    <SectionCard
                        title={t.line_items}
                        titleIcon={<Receipt className="size-4" />}
                        actions={
                            <span className="text-[11px] tracking-wider text-muted-foreground uppercase">
                                {t.read_only_label}
                            </span>
                        }
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
                                        num(item.quantity) *
                                            num(item.unit_price) -
                                        num(item.discount_amount);

                                    return (
                                        <TableRow key={item.id}>
                                            <TableCell className="px-5 py-3">
                                                <div className="text-[13px]">
                                                    {item.description ?? '—'}
                                                </div>
                                                <div className="text-[11px] text-muted-foreground">
                                                    {[
                                                        item.item_type
                                                            ? enumLabel(t.invoice_item_type_opts, item.item_type)
                                                            : null,
                                                        item.code,
                                                    ]
                                                        .filter(
                                                            (v) =>
                                                                v && v !== '—',
                                                        )
                                                        .join(' · ')}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-[13px] tabular-nums">
                                                {num(item.quantity)}
                                            </TableCell>
                                            <TableCell className="text-[13px] tabular-nums">
                                                {money(
                                                    item.unit_price,
                                                    invoice.currency,
                                                )}
                                            </TableCell>
                                            <TableCell className="text-[13px] tabular-nums text-muted-foreground">
                                                {money(
                                                    item.discount_amount,
                                                    invoice.currency,
                                                )}
                                            </TableCell>
                                            <TableCell className="text-[13px] font-semibold tabular-nums">
                                                {money(
                                                    lineTotal,
                                                    invoice.currency,
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </SectionCard>
                </div>
            </div>
        </>
    );
}

function SummaryRow({
    label,
    value,
    emphasize = false,
}: {
    label: string;
    value: string;
    emphasize?: boolean;
}) {
    return (
        <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">{label}</dt>
            <dd
                className={`font-semibold tabular-nums ${emphasize ? 'text-danger' : ''}`}
            >
                {value}
            </dd>
        </div>
    );
}
