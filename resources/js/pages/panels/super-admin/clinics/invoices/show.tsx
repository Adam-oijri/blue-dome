import { Form, Head, Link } from '@inertiajs/react';
import { ChevronLeft, Undo2 } from 'lucide-react';

import PaymentController from '@/actions/App/Http/Controllers/SuperAdmin/PaymentController';
import { PageHeader } from '@/components/blue-dome/page-header';
import { SectionCard } from '@/components/blue-dome/section-card';
import { StatusPill } from '@/components/blue-dome/status-pill';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useLocale } from '@/lib/i18n/use-locale';
import superAdmin from '@/routes/super-admin';

interface Invoice {
    id: string;
    invoice_number: string | null;
    status: string;
    currency: string | null;
    subtotal: number | string;
    total: number | string;
    paid_amount: number | string;
    balance_due: number | string;
    patient?: {
        first_name: string | null;
        last_name: string | null;
        patient_code: string | null;
    } | null;
    items: Array<{
        id: string;
        description: string;
        quantity: number | string;
        unit_price: number | string;
        line_total?: number | string;
    }>;
    payments: Array<{
        id: string;
        amount: number | string;
        payment_method: string;
        payment_status: string;
        payment_date: string | null;
    }>;
}

const selectClass =
    'h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50';

export default function SuperAdminClinicInvoiceShow({
    clinic,
    invoice,
}: {
    clinic: { id: string; name: string };
    invoice: Invoice;
}) {
    const { slug: locale } = useLocale();
    const currency = invoice.currency ?? '';

    return (
        <>
            <Head
                title={`Invoice ${invoice.invoice_number ?? ''} — ${clinic.name}`}
            />

            <div className="px-6 py-5 lg:px-8">
                <div className="mb-4 flex items-center gap-2 text-sm">
                    <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="-ms-2 gap-1"
                    >
                        <Link
                            href={superAdmin.clinics.invoices.index.url({
                                locale,
                                clinic: clinic.id,
                            })}
                        >
                            <ChevronLeft className="size-3.5" />
                            Invoices
                        </Link>
                    </Button>
                    <span className="text-muted-foreground">/</span>
                    <span className="font-mono text-[13px] font-semibold">
                        {invoice.invoice_number ?? invoice.id.slice(0, 8)}
                    </span>
                </div>

                <PageHeader
                    title={`Invoice ${invoice.invoice_number ?? ''}`}
                    description={
                        <span className="flex items-center gap-2.5">
                            <StatusPill tone="navy" withDot>
                                {invoice.status.replace('_', ' ')}
                            </StatusPill>
                            <span className="text-[13px] text-muted-foreground">
                                {invoice.patient
                                    ? `${invoice.patient.first_name ?? ''} ${invoice.patient.last_name ?? ''}`.trim()
                                    : ''}
                                {` · ${invoice.total} ${currency} · paid ${invoice.paid_amount} · balance ${invoice.balance_due}`}
                            </span>
                        </span>
                    }
                />

                <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
                    <div className="space-y-5">
                        <SectionCard title="Line items" bodyClassName="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead className="px-5 py-2.5 text-[11px] tracking-wider uppercase">
                                            Description
                                        </TableHead>
                                        <TableHead className="text-end text-[11px] tracking-wider uppercase">
                                            Qty
                                        </TableHead>
                                        <TableHead className="text-end text-[11px] tracking-wider uppercase">
                                            Unit
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {invoice.items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="px-5 py-3 text-[13px]">
                                                {item.description}
                                            </TableCell>
                                            <TableCell className="text-end text-[13px] tabular-nums">
                                                {item.quantity}
                                            </TableCell>
                                            <TableCell className="text-end text-[13px] tabular-nums">
                                                {item.unit_price}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </SectionCard>

                        <SectionCard title="Payments" bodyClassName="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead className="px-5 py-2.5 text-[11px] tracking-wider uppercase">
                                            Date
                                        </TableHead>
                                        <TableHead className="text-[11px] tracking-wider uppercase">
                                            Method
                                        </TableHead>
                                        <TableHead className="text-end text-[11px] tracking-wider uppercase">
                                            Amount
                                        </TableHead>
                                        <TableHead className="text-[11px] tracking-wider uppercase">
                                            Status
                                        </TableHead>
                                        <TableHead className="w-20" />
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {invoice.payments.length === 0 && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={5}
                                                className="py-8 text-center text-sm text-muted-foreground"
                                            >
                                                No payments yet.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {invoice.payments.map((p) => (
                                        <TableRow key={p.id}>
                                            <TableCell className="px-5 py-3 text-[12px]">
                                                {p.payment_date?.slice(0, 10) ??
                                                    '—'}
                                            </TableCell>
                                            <TableCell className="text-[13px]">
                                                {p.payment_method}
                                            </TableCell>
                                            <TableCell className="text-end text-[13px] tabular-nums">
                                                {p.amount}
                                            </TableCell>
                                            <TableCell>
                                                <StatusPill
                                                    tone={
                                                        p.payment_status ===
                                                        'refunded'
                                                            ? 'neutral'
                                                            : 'success'
                                                    }
                                                    withDot
                                                >
                                                    {p.payment_status}
                                                </StatusPill>
                                            </TableCell>
                                            <TableCell>
                                                {p.payment_status ===
                                                    'completed' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        asChild
                                                        className="h-7 gap-1 text-[11px] text-danger"
                                                    >
                                                        <Link
                                                            href={superAdmin.clinics.payments.refund.url(
                                                                {
                                                                    locale,
                                                                    clinic: clinic.id,
                                                                    payment:
                                                                        p.id,
                                                                },
                                                            )}
                                                            method="post"
                                                            as="button"
                                                            onBefore={() =>
                                                                confirm(
                                                                    'Refund this payment?',
                                                                )
                                                            }
                                                        >
                                                            <Undo2 className="size-3.5" />
                                                            Refund
                                                        </Link>
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </SectionCard>
                    </div>

                    <SectionCard title="Record payment" bodyClassName="p-5">
                        <Form
                            {...PaymentController.store.form({
                                locale,
                                clinic: clinic.id,
                            })}
                            options={{ preserveScroll: true }}
                            className="space-y-4"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <input
                                        type="hidden"
                                        name="invoice_id"
                                        value={invoice.id}
                                    />
                                    <div className="grid gap-2">
                                        <Label htmlFor="amount">Amount</Label>
                                        <Input
                                            id="amount"
                                            name="amount"
                                            type="number"
                                            step="0.01"
                                            defaultValue={String(
                                                invoice.balance_due,
                                            )}
                                            required
                                        />
                                        {errors.amount && (
                                            <span className="text-[12px] text-danger">
                                                {errors.amount}
                                            </span>
                                        )}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="payment_method">
                                            Method
                                        </Label>
                                        <select
                                            id="payment_method"
                                            name="payment_method"
                                            defaultValue="cash"
                                            className={selectClass}
                                        >
                                            <option value="cash">cash</option>
                                            <option value="bank_wire">
                                                bank_wire
                                            </option>
                                        </select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="reference_number">
                                            Reference (optional)
                                        </Label>
                                        <Input
                                            id="reference_number"
                                            name="reference_number"
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full bg-navy-900 text-white hover:bg-navy-800"
                                    >
                                        {processing && <Spinner />}
                                        Record payment
                                    </Button>
                                </>
                            )}
                        </Form>
                    </SectionCard>
                </div>
            </div>
        </>
    );
}
