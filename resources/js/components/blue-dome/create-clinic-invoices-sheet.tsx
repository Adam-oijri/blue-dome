import { useForm } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
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
import { useLocale } from '@/lib/i18n/use-locale';
import superAdmin from '@/routes/super-admin';

type Option = { id: string; [k: string]: unknown };

type LineItem = {
    item_type: string;
    description: string;
    quantity: number | string;
    unit_price: number | string;
};

const FIELD_CLASS =
    'border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]';

const ITEM_TYPES: ReadonlyArray<readonly [string, string]> = [
    ['consultation', 'Consultation'],
    ['procedure', 'Procedure'],
    ['lab_test', 'Lab test'],
    ['imaging', 'Imaging'],
    ['medication', 'Medication'],
    ['vaccination', 'Vaccination'],
    ['supplies', 'Supplies'],
    ['other', 'Other'],
];

const emptyItem = (): LineItem => ({
    item_type: 'consultation',
    description: '',
    quantity: 1,
    unit_price: 0,
});

function patientLabel(patient: Option): string {
    const first = (patient.first_name as string | null) ?? '';
    const last = (patient.last_name as string | null) ?? '';
    const name = `${first} ${last}`.trim();
    const code = patient.patient_code as string | null;

    return (name || patient.id) + (code ? ` (${code})` : '');
}

/**
 * Inline "create invoice" Sheet for the super-admin clinic panel. Clinic-scoped:
 * the host page supplies the `clinicId` plus the clinic's `patients`, and the
 * Sheet posts to the clinic-scoped store url. Drop it anywhere and pass the
 * trigger as `children`.
 */
export function CreateClinicInvoicesSheet({
    children,
    clinicId,
    patients,
}: {
    children: ReactNode;
    clinicId: string;
    patients: Array<{ id: string; [k: string]: unknown }>;
}) {
    const { slug: locale } = useLocale();
    const [open, setOpen] = useState(false);

    const form = useForm<{
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
        const next = form.data.items.map((it, i) =>
            i === index ? { ...it, [key]: value } : it,
        );
        form.setData('items', next);
    };

    const addItem = (): void => {
        form.setData('items', [...form.data.items, emptyItem()]);
    };

    const removeItem = (index: number): void => {
        form.setData(
            'items',
            form.data.items.filter((_, i) => i !== index),
        );
    };

    const total = form.data.items.reduce(
        (sum, it) =>
            sum + Number(it.quantity || 0) * Number(it.unit_price || 0),
        0,
    );

    const itemError = (index: number, field: keyof LineItem): string | undefined =>
        (form.errors as Record<string, string | undefined>)[
            `items.${index}.${field}`
        ];

    const submit = (e: React.FormEvent): void => {
        e.preventDefault();
        form.post(
            superAdmin.clinics.invoices.store.url({
                locale,
                clinic: clinicId,
            }),
            {
                preserveScroll: true,
                onSuccess: () => {
                    setOpen(false);
                    form.reset();
                },
            },
        );
    };

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
                    <SheetTitle>New invoice</SheetTitle>
                    <SheetDescription>
                        Pick a patient and add one or more line items. The
                        invoice is created under this clinic.
                    </SheetDescription>
                </SheetHeader>

                <form
                    onSubmit={submit}
                    className="flex-1 space-y-5 overflow-y-auto px-4 pb-4"
                >
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="patient_id">Patient</Label>
                            <select
                                id="patient_id"
                                value={form.data.patient_id}
                                onChange={(e) =>
                                    form.setData('patient_id', e.target.value)
                                }
                                className={FIELD_CLASS}
                            >
                                <option value="">Select a patient…</option>
                                {patients.map((patient) => (
                                    <option key={patient.id} value={patient.id}>
                                        {patientLabel(patient)}
                                    </option>
                                ))}
                            </select>
                            <InputError message={form.errors.patient_id} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="due_date">Due date</Label>
                            <input
                                id="due_date"
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

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label>Line items</Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="gap-1"
                                onClick={addItem}
                            >
                                <Plus className="size-3.5" />
                                Add item
                            </Button>
                        </div>
                        {form.data.items.map((item, i) => (
                            <div
                                key={i}
                                className="space-y-2 rounded-md border border-border p-3"
                            >
                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_2fr_80px_100px_auto]">
                                    <select
                                        value={item.item_type}
                                        onChange={(e) =>
                                            setItem(
                                                i,
                                                'item_type',
                                                e.target.value,
                                            )
                                        }
                                        className={FIELD_CLASS}
                                    >
                                        {ITEM_TYPES.map(([value, label]) => (
                                            <option key={value} value={value}>
                                                {label}
                                            </option>
                                        ))}
                                    </select>
                                    <input
                                        placeholder="Description"
                                        value={item.description}
                                        onChange={(e) =>
                                            setItem(
                                                i,
                                                'description',
                                                e.target.value,
                                            )
                                        }
                                        className={FIELD_CLASS}
                                    />
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="Qty"
                                        value={item.quantity}
                                        onChange={(e) =>
                                            setItem(i, 'quantity', e.target.value)
                                        }
                                        className={FIELD_CLASS}
                                    />
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="Price"
                                        value={item.unit_price}
                                        onChange={(e) =>
                                            setItem(
                                                i,
                                                'unit_price',
                                                e.target.value,
                                            )
                                        }
                                        className={FIELD_CLASS}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="size-9 p-0 text-danger"
                                        disabled={form.data.items.length === 1}
                                        onClick={() => removeItem(i)}
                                    >
                                        <Trash2 className="size-3.5" />
                                    </Button>
                                </div>
                                <InputError
                                    message={itemError(i, 'item_type')}
                                />
                                <InputError
                                    message={itemError(i, 'description')}
                                />
                                <InputError
                                    message={itemError(i, 'quantity')}
                                />
                                <InputError
                                    message={itemError(i, 'unit_price')}
                                />
                            </div>
                        ))}
                        <InputError message={form.errors.items} />
                        <div className="text-end text-[13px] font-semibold">
                            Subtotal: {total.toFixed(2)} {form.data.currency}
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="notes">Notes</Label>
                        <textarea
                            id="notes"
                            rows={2}
                            value={form.data.notes}
                            onChange={(e) =>
                                form.setData('notes', e.target.value)
                            }
                            className="border-input focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-[3px]"
                        />
                        <InputError message={form.errors.notes} />
                    </div>

                    <Button
                        type="submit"
                        disabled={form.processing}
                        className="w-full bg-navy-900 text-white hover:bg-navy-800"
                    >
                        Create invoice
                    </Button>
                </form>
            </SheetContent>
        </Sheet>
    );
}
