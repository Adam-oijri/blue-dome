import { Head, Link, useForm } from '@inertiajs/react';
import { ChevronLeft, Plus, Trash2 } from 'lucide-react';

import { PageHeader } from '@/components/blue-dome/page-header';
import { SectionCard } from '@/components/blue-dome/section-card';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { enumLabel } from '@/lib/i18n/doctor';
import { useSuperAdminLang } from '@/lib/i18n/super-admin-context';
import { useLocale } from '@/lib/i18n/use-locale';
import superAdmin from '@/routes/super-admin';

type PatientOpt = {
    id: string;
    first_name: string | null;
    last_name: string | null;
    patient_code: string | null;
};

type LineItem = {
    item_type: string;
    description: string;
    quantity: number | string;
    unit_price: number | string;
};

const ITEM_TYPES = [
    'consultation',
    'procedure',
    'lab_test',
    'imaging',
    'medication',
    'vaccination',
    'supplies',
    'other',
];

const selectClass =
    'h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50';

const emptyItem = (): LineItem => ({
    item_type: 'consultation',
    description: '',
    quantity: 1,
    unit_price: 0,
});

export default function SuperAdminClinicInvoiceCreate({
    clinic,
    patients,
}: {
    clinic: { id: string; name: string };
    patients: PatientOpt[];
}) {
    const { t } = useSuperAdminLang();
    const { slug: locale } = useLocale();
    const itemTypeLabels: Record<string, string> = {
        consultation: t.item_type_consultation,
        procedure: t.item_type_procedure,
        lab_test: t.item_type_lab_test,
        imaging: t.item_type_imaging,
        medication: t.item_type_medication,
        vaccination: t.item_type_vaccination,
        supplies: t.item_type_supplies,
        other: t.item_type_other,
    };
    const { data, setData, post, processing, errors } = useForm<{
        patient_id: string;
        currency: string;
        due_date: string;
        notes: string;
        items: LineItem[];
    }>({
        patient_id: '',
        currency: 'MAD',
        due_date: '',
        notes: '',
        items: [emptyItem()],
    });

    const setItem = (
        index: number,
        key: keyof LineItem,
        value: string,
    ): void => {
        setData(
            'items',
            data.items.map((it, i) =>
                i === index ? { ...it, [key]: value } : it,
            ),
        );
    };

    const total = data.items.reduce(
        (sum, it) =>
            sum + Number(it.quantity || 0) * Number(it.unit_price || 0),
        0,
    );

    const submit = (e: React.FormEvent): void => {
        e.preventDefault();
        post(
            superAdmin.clinics.invoices.store.url({
                locale,
                clinic: clinic.id,
            }),
            { preserveScroll: true },
        );
    };

    return (
        <>
            <Head
                title={t.cl_invoice_head_new.replace('{clinic}', clinic.name)}
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
                            {t.cl_invoices_crumb}
                        </Link>
                    </Button>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-[13px] font-semibold">
                        {t.cl_invoice_crumb_new}
                    </span>
                </div>

                <PageHeader
                    title={t.cl_invoice_title_new}
                    description={clinic.name}
                />

                <SectionCard className="mt-6">
                    <form onSubmit={submit} className="space-y-6 p-6">
                        <div className="grid gap-5 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="patient_id">
                                    {t.cl_invoice_patient}
                                </Label>
                                <select
                                    id="patient_id"
                                    value={data.patient_id}
                                    onChange={(e) =>
                                        setData('patient_id', e.target.value)
                                    }
                                    className={selectClass}
                                    required
                                >
                                    <option value="">
                                        {t.cl_invoice_patient_ph}
                                    </option>
                                    {patients.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {`${p.first_name ?? ''} ${p.last_name ?? ''}`.trim()}
                                            {p.patient_code
                                                ? ` (${p.patient_code})`
                                                : ''}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.patient_id} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="due_date">
                                    {t.cl_invoice_due_date}
                                </Label>
                                <Input
                                    id="due_date"
                                    type="date"
                                    value={data.due_date}
                                    onChange={(e) =>
                                        setData('due_date', e.target.value)
                                    }
                                />
                                <InputError message={errors.due_date} />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label>{t.cl_invoice_line_items}</Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="gap-1"
                                    onClick={() =>
                                        setData('items', [
                                            ...data.items,
                                            emptyItem(),
                                        ])
                                    }
                                >
                                    <Plus className="size-3.5" />
                                    {t.cl_invoice_add_item}
                                </Button>
                            </div>
                            {data.items.map((item, i) => (
                                <div
                                    key={i}
                                    className="grid grid-cols-1 gap-2 rounded-md border border-border p-3 sm:grid-cols-[1fr_2fr_80px_100px_auto]"
                                >
                                    <select
                                        value={item.item_type}
                                        onChange={(e) =>
                                            setItem(
                                                i,
                                                'item_type',
                                                e.target.value,
                                            )
                                        }
                                        className={selectClass}
                                    >
                                        {ITEM_TYPES.map((value) => (
                                            <option key={value} value={value}>
                                                {enumLabel(
                                                    itemTypeLabels,
                                                    value,
                                                )}
                                            </option>
                                        ))}
                                    </select>
                                    <Input
                                        placeholder={
                                            t.cl_invoice_description_ph
                                        }
                                        value={item.description}
                                        onChange={(e) =>
                                            setItem(
                                                i,
                                                'description',
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder={t.cl_invoice_qty_ph}
                                        value={item.quantity}
                                        onChange={(e) =>
                                            setItem(
                                                i,
                                                'quantity',
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder={t.cl_invoice_price_ph}
                                        value={item.unit_price}
                                        onChange={(e) =>
                                            setItem(
                                                i,
                                                'unit_price',
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="size-9 p-0 text-danger"
                                        disabled={data.items.length === 1}
                                        onClick={() =>
                                            setData(
                                                'items',
                                                data.items.filter(
                                                    (_, idx) => idx !== i,
                                                ),
                                            )
                                        }
                                    >
                                        <Trash2 className="size-3.5" />
                                    </Button>
                                </div>
                            ))}
                            <div className="text-end text-[13px] font-semibold">
                                {t.cl_invoice_subtotal}: {total.toFixed(2)}{' '}
                                {data.currency}
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="notes">{t.cl_invoice_notes}</Label>
                            <textarea
                                id="notes"
                                value={data.notes}
                                onChange={(e) =>
                                    setData('notes', e.target.value)
                                }
                                rows={2}
                                className="min-h-12 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-navy-900 text-white hover:bg-navy-800"
                        >
                            {processing && <Spinner />}
                            {t.cl_invoice_submit_create}
                        </Button>
                    </form>
                </SectionCard>
            </div>
        </>
    );
}
