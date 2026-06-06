import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import type { ReactNode } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
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

export type InvoiceEditable = {
    id: string;
    invoice_number?: string | null;
    currency?: string | null;
    invoice_date: string | null;
    due_date: string | null;
    discount_amount: Money | null;
    tax_percentage: Money | null;
    status: string;
    notes: string | null;
    payment_terms: string | null;
    insurance_claim_number: string | null;
    insurance_coverage_percentage: Money | null;
    items?: InvoiceItem[];
};

const FIELD_CLASS =
    'border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]';

const TEXTAREA_CLASS =
    'border-input focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-[3px]';

const STATUS_OPTIONS: ReadonlyArray<string> = [
    'draft',
    'pending',
    'paid',
    'partially_paid',
    'overdue',
    'cancelled',
    'refunded',
    'collections',
];

function num(value: Money | null): number {
    const n = typeof value === 'string' ? parseFloat(value) : (value ?? 0);

    return Number.isFinite(n) ? n : 0;
}

function money(value: Money | null, currency: string | null | undefined): string {
    return `${num(value).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${currency ?? 'MAD'}`;
}

/**
 * Inline "edit invoice" Sheet. Edits only the header fields the update endpoint
 * accepts (UpdateInvoiceRequest); line items are immutable here and shown
 * read-only. Prefilled from the row; posts via PATCH and stays on the page.
 */
export function EditInvoicesSheet({
    children,
    invoice,
}: {
    children: ReactNode;
    invoice: InvoiceEditable;
}) {
    const { slug: locale } = useLocale();
    const { t } = useDoctorLang();
    const [open, setOpen] = useState(false);

    const form = useForm({
        invoice_date: invoice.invoice_date
            ? String(invoice.invoice_date).slice(0, 10)
            : '',
        due_date: invoice.due_date ? String(invoice.due_date).slice(0, 10) : '',
        discount_amount:
            invoice.discount_amount != null
                ? String(invoice.discount_amount)
                : '',
        tax_percentage:
            invoice.tax_percentage != null
                ? String(invoice.tax_percentage)
                : '',
        status: invoice.status,
        notes: invoice.notes ?? '',
        payment_terms: invoice.payment_terms ?? '',
        insurance_claim_number: invoice.insurance_claim_number ?? '',
        insurance_coverage_percentage:
            invoice.insurance_coverage_percentage != null
                ? String(invoice.insurance_coverage_percentage)
                : '',
    });

    const submit = (e: React.FormEvent): void => {
        e.preventDefault();
        form.patch(invoices.update.url({ locale, invoice: invoice.id }), {
            preserveScroll: true,
            onSuccess: () => setOpen(false),
        });
    };

    const items = invoice.items ?? [];

    return (
        <Sheet
            open={open}
            onOpenChange={(next) => {
                setOpen(next);

                if (!next) {
                    form.reset();
                    form.clearErrors();
                }
            }}
        >
            <SheetTrigger asChild>{children}</SheetTrigger>
            <SheetContent className="flex w-full flex-col sm:max-w-2xl">
                <SheetHeader>
                    <SheetTitle>
                        {`${t.edit_invoice} ${invoice.invoice_number ?? ''}`.trim()}
                    </SheetTitle>
                    <SheetDescription>{t.invoice_details}</SheetDescription>
                </SheetHeader>

                <form
                    onSubmit={submit}
                    className="flex flex-1 flex-col overflow-y-auto"
                >
                    <div className="space-y-4 px-4 pb-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-2">
                                <Label htmlFor="edit_invoice_date">
                                    {t.issued}
                                </Label>
                                <input
                                    id="edit_invoice_date"
                                    type="date"
                                    value={form.data.invoice_date}
                                    onChange={(e) =>
                                        form.setData(
                                            'invoice_date',
                                            e.target.value,
                                        )
                                    }
                                    className={FIELD_CLASS}
                                />
                                <InputError
                                    message={form.errors.invoice_date}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit_due_date">{t.due}</Label>
                                <input
                                    id="edit_due_date"
                                    type="date"
                                    value={form.data.due_date}
                                    onChange={(e) =>
                                        form.setData('due_date', e.target.value)
                                    }
                                    className={FIELD_CLASS}
                                />
                                <InputError message={form.errors.due_date} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit_status">{t.col_status}</Label>
                            <select
                                id="edit_status"
                                value={form.data.status}
                                onChange={(e) =>
                                    form.setData('status', e.target.value)
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
                            <InputError message={form.errors.status} />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-2">
                                <Label htmlFor="edit_discount_amount">
                                    {t.col_discount} (
                                    {invoice.currency ?? 'MAD'})
                                </Label>
                                <input
                                    id="edit_discount_amount"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={form.data.discount_amount}
                                    onChange={(e) =>
                                        form.setData(
                                            'discount_amount',
                                            e.target.value,
                                        )
                                    }
                                    className={`${FIELD_CLASS} tabular-nums`}
                                />
                                <InputError
                                    message={form.errors.discount_amount}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit_tax_percentage">
                                    {t.tax_label} (%)
                                </Label>
                                <input
                                    id="edit_tax_percentage"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={form.data.tax_percentage}
                                    onChange={(e) =>
                                        form.setData(
                                            'tax_percentage',
                                            e.target.value,
                                        )
                                    }
                                    className={`${FIELD_CLASS} tabular-nums`}
                                />
                                <InputError
                                    message={form.errors.tax_percentage}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit_payment_terms">
                                {t.payment_terms}
                            </Label>
                            <input
                                id="edit_payment_terms"
                                type="text"
                                maxLength={100}
                                value={form.data.payment_terms}
                                onChange={(e) =>
                                    form.setData(
                                        'payment_terms',
                                        e.target.value,
                                    )
                                }
                                className={FIELD_CLASS}
                            />
                            <InputError message={form.errors.payment_terms} />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-2">
                                <Label htmlFor="edit_insurance_claim_number">
                                    {t.insurance_claim_number}
                                </Label>
                                <input
                                    id="edit_insurance_claim_number"
                                    type="text"
                                    maxLength={100}
                                    value={form.data.insurance_claim_number}
                                    onChange={(e) =>
                                        form.setData(
                                            'insurance_claim_number',
                                            e.target.value,
                                        )
                                    }
                                    className={FIELD_CLASS}
                                />
                                <InputError
                                    message={
                                        form.errors.insurance_claim_number
                                    }
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit_insurance_coverage_percentage">
                                    {t.insurance_coverage_pct}
                                </Label>
                                <input
                                    id="edit_insurance_coverage_percentage"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={
                                        form.data.insurance_coverage_percentage
                                    }
                                    onChange={(e) =>
                                        form.setData(
                                            'insurance_coverage_percentage',
                                            e.target.value,
                                        )
                                    }
                                    className={`${FIELD_CLASS} tabular-nums`}
                                />
                                <InputError
                                    message={
                                        form.errors
                                            .insurance_coverage_percentage
                                    }
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit_notes">{t.notes_label}</Label>
                            <textarea
                                id="edit_notes"
                                rows={3}
                                value={form.data.notes}
                                onChange={(e) =>
                                    form.setData('notes', e.target.value)
                                }
                                className={TEXTAREA_CLASS}
                            />
                            <InputError message={form.errors.notes} />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>{t.line_items}</Label>
                                <span className="text-[11px] tracking-wider text-muted-foreground uppercase">
                                    {t.read_only_label}
                                </span>
                            </div>
                            <div className="rounded-md border border-border">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
                                            <TableHead className="px-4 py-2 text-[11px] tracking-wider uppercase">
                                                {t.col_description}
                                            </TableHead>
                                            <TableHead className="text-[11px] tracking-wider uppercase">
                                                {t.col_qty}
                                            </TableHead>
                                            <TableHead className="text-[11px] tracking-wider uppercase">
                                                {t.col_unit_price}
                                            </TableHead>
                                            <TableHead className="text-[11px] tracking-wider uppercase">
                                                {t.col_total}
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {items.length === 0 && (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={4}
                                                    className="py-8 text-center text-sm text-muted-foreground"
                                                >
                                                    {t.no_line_items}
                                                </TableCell>
                                            </TableRow>
                                        )}
                                        {items.map((item) => {
                                            const lineTotal =
                                                num(item.quantity) *
                                                    num(item.unit_price) -
                                                num(item.discount_amount);

                                            return (
                                                <TableRow key={item.id}>
                                                    <TableCell className="px-4 py-2.5">
                                                        <div className="text-[13px]">
                                                            {item.description ??
                                                                '—'}
                                                        </div>
                                                        <div className="text-[11px] text-muted-foreground">
                                                            {[
                                                                item.item_type
                                                                    ? enumLabel(
                                                                          t.invoice_item_type_opts,
                                                                          item.item_type,
                                                                      )
                                                                    : null,
                                                                item.code,
                                                            ]
                                                                .filter(
                                                                    (v) =>
                                                                        v &&
                                                                        v !==
                                                                            '—',
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
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={form.processing}
                            className="w-full bg-olive-600 text-white hover:bg-olive-700"
                        >
                            {t.save_changes}
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
}
