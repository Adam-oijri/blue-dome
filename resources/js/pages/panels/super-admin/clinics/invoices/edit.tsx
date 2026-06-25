import { Form, Head, Link } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';

import InvoiceController from '@/actions/App/Http/Controllers/SuperAdmin/InvoiceController';
import { PageHeader } from '@/components/blue-dome/page-header';
import { SectionCard } from '@/components/blue-dome/section-card';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useSuperAdminLang } from '@/lib/i18n/super-admin-context';
import { useLocale } from '@/lib/i18n/use-locale';
import superAdmin from '@/routes/super-admin';

interface Invoice {
    id: string;
    invoice_number: string | null;
    invoice_date: string | null;
    due_date: string | null;
    status: string;
    notes: string | null;
    discount_amount: number | string | null;
    tax_percentage: number | string | null;
}

const STATUSES = [
    'draft',
    'pending',
    'paid',
    'partially_paid',
    'overdue',
    'cancelled',
    'refunded',
    'collections',
];

const selectClass =
    'h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50';

export default function SuperAdminClinicInvoiceEdit({
    clinic,
    invoice,
}: {
    clinic: { id: string; name: string };
    invoice: Invoice;
}) {
    const { t } = useSuperAdminLang();
    const { slug: locale } = useLocale();

    return (
        <>
            <Head
                title={t.cl_invoice_head_edit
                    .replace('{number}', invoice.invoice_number ?? '')
                    .replace('{clinic}', clinic.name)}
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
                            href={superAdmin.clinics.invoices.show.url({
                                locale,
                                clinic: clinic.id,
                                invoice: invoice.id,
                            })}
                        >
                            <ChevronLeft className="size-3.5" />
                            {t.cl_invoice_crumb_invoice}
                        </Link>
                    </Button>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-[13px] font-semibold">
                        {t.cl_invoice_crumb_edit}
                    </span>
                </div>

                <PageHeader
                    title={t.cl_invoice_title_edit.replace(
                        '{number}',
                        invoice.invoice_number ?? '',
                    )}
                    description={clinic.name}
                />

                <SectionCard className="mt-6">
                    <Form
                        {...InvoiceController.update.form({
                            locale,
                            clinic: clinic.id,
                            invoice: invoice.id,
                        })}
                        options={{ preserveScroll: true }}
                        className="space-y-6 p-6"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="status">
                                            {t.cl_invoice_status}
                                        </Label>
                                        <select
                                            id="status"
                                            name="status"
                                            defaultValue={invoice.status}
                                            className={selectClass}
                                        >
                                            {STATUSES.map((s) => (
                                                <option key={s} value={s}>
                                                    {s.replace('_', ' ')}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={errors.status} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="due_date">
                                            {t.cl_invoice_due_date}
                                        </Label>
                                        <Input
                                            id="due_date"
                                            name="due_date"
                                            type="date"
                                            defaultValue={
                                                invoice.due_date?.slice(
                                                    0,
                                                    10,
                                                ) ?? ''
                                            }
                                        />
                                        <InputError message={errors.due_date} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="discount_amount">
                                            {t.cl_invoice_discount}
                                        </Label>
                                        <Input
                                            id="discount_amount"
                                            name="discount_amount"
                                            type="number"
                                            step="0.01"
                                            defaultValue={
                                                invoice.discount_amount ?? ''
                                            }
                                        />
                                        <InputError
                                            message={errors.discount_amount}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="tax_percentage">
                                            {t.cl_invoice_tax}
                                        </Label>
                                        <Input
                                            id="tax_percentage"
                                            name="tax_percentage"
                                            type="number"
                                            step="0.01"
                                            defaultValue={
                                                invoice.tax_percentage ?? ''
                                            }
                                        />
                                        <InputError
                                            message={errors.tax_percentage}
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="notes">
                                        {t.cl_invoice_notes}
                                    </Label>
                                    <textarea
                                        id="notes"
                                        name="notes"
                                        rows={3}
                                        defaultValue={invoice.notes ?? ''}
                                        className="min-h-16 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                    />
                                    <InputError message={errors.notes} />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-navy-900 text-white hover:bg-navy-800"
                                >
                                    {processing && <Spinner />}
                                    {t.cl_invoice_submit_save}
                                </Button>
                            </>
                        )}
                    </Form>
                </SectionCard>
            </div>
        </>
    );
}
