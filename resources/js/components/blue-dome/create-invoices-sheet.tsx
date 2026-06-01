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
import { useDoctorLang } from '@/lib/i18n/doctor-context';
import { useLocale } from '@/lib/i18n/use-locale';
import invoices from '@/routes/invoices';

type Option = { id: string; [k: string]: unknown };

type LineItem = {
    item_type: string;
    description: string;
    quantity: number | string;
    unit_price: number | string;
};

const FIELD_CLASS =
    'border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]';

const ITEM_TYPE_OPTIONS: ReadonlyArray<readonly [string, string]> = [
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

function optionLabel(option: Option): string {
    const name =
        `${(option.first_name as string) ?? ''} ${(option.last_name as string) ?? ''}`.trim();
    const code = option.patient_code as string | null | undefined;

    return (name || option.id) + (code ? ` (${code})` : '');
}

/**
 * Inline "create invoice" Sheet. This is a dynamic multi-item form: a header
 * (patient + due date + notes) plus a repeatable list of line items with
 * add/remove row controls. Drop it anywhere and pass the trigger as `children`;
 * the host page supplies the patient options it has already loaded.
 */
export function CreateInvoicesSheet({
    children,
    patients,
}: {
    children: ReactNode;
    patients: Option[];
}) {
    const { t } = useDoctorLang();
    const { slug: locale } = useLocale();
    const [open, setOpen] = useState(false);

    const form = useForm<{
        patient_id: string;
        due_date: string;
        notes: string;
        tax_percentage: number | string;
        discount_percentage: number | string;
        items: LineItem[];
    }>({
        patient_id: '',
        due_date: '',
        notes: '',
        tax_percentage: '',
        discount_percentage: '',
        items: [emptyItem()],
    });

    const setItem = (
        index: number,
        key: keyof LineItem,
        value: string,
    ): void => {
        const next = form.data.items.map((item, i) =>
            i === index ? { ...item, [key]: value } : item,
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

    const itemError = (index: number, field: keyof LineItem): string | undefined =>
        (form.errors as Record<string, string>)[`items.${index}.${field}`];

    const submit = (e: React.FormEvent): void => {
        e.preventDefault();
        form.post(invoices.store.url({ locale }), {
            preserveScroll: true,
            onSuccess: () => {
                setOpen(false);
                form.reset();
            },
        });
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
                    <SheetTitle>{t.new_invoice}</SheetTitle>
                    <SheetDescription>
                        Pick a patient and add at least one line item. The
                        invoice is billed under your clinic.
                    </SheetDescription>
                </SheetHeader>

                <form
                    onSubmit={submit}
                    className="flex flex-1 flex-col overflow-y-auto"
                >
                    <div className="space-y-4 px-4 pb-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="patient_id">
                                    {t.col_patient}
                                </Label>
                                <select
                                    id="patient_id"
                                    value={form.data.patient_id}
                                    onChange={(e) =>
                                        form.setData(
                                            'patient_id',
                                            e.target.value,
                                        )
                                    }
                                    className={FIELD_CLASS}
                                >
                                    <option value="">Select a patient…</option>
                                    {patients.map((patient) => (
                                        <option
                                            key={patient.id}
                                            value={patient.id}
                                        >
                                            {optionLabel(patient)}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={form.errors.patient_id} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="due_date">{t.due}</Label>
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

                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-2">
                                <Label htmlFor="tax_percentage">Tax %</Label>
                                <input
                                    id="tax_percentage"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    value={form.data.tax_percentage}
                                    onChange={(e) =>
                                        form.setData(
                                            'tax_percentage',
                                            e.target.value,
                                        )
                                    }
                                    className={FIELD_CLASS}
                                />
                                <InputError
                                    message={form.errors.tax_percentage}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="discount_percentage">
                                    {t.col_discount} %
                                </Label>
                                <input
                                    id="discount_percentage"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    value={form.data.discount_percentage}
                                    onChange={(e) =>
                                        form.setData(
                                            'discount_percentage',
                                            e.target.value,
                                        )
                                    }
                                    className={FIELD_CLASS}
                                />
                                <InputError
                                    message={form.errors.discount_percentage}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label>{t.line_items}</Label>
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
                            {typeof form.errors.items === 'string' && (
                                <InputError message={form.errors.items} />
                            )}
                            {form.data.items.map((item, i) => (
                                <div
                                    key={i}
                                    className="grid grid-cols-1 gap-2 rounded-md border border-border p-3 sm:grid-cols-[1fr_2fr_80px_100px_auto]"
                                >
                                    <div className="grid gap-1">
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
                                            {ITEM_TYPE_OPTIONS.map(
                                                ([value, label]) => (
                                                    <option
                                                        key={value}
                                                        value={value}
                                                    >
                                                        {label}
                                                    </option>
                                                ),
                                            )}
                                        </select>
                                        <InputError
                                            message={itemError(i, 'item_type')}
                                        />
                                    </div>
                                    <div className="grid gap-1">
                                        <input
                                            placeholder={t.col_description}
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
                                        <InputError
                                            message={itemError(
                                                i,
                                                'description',
                                            )}
                                        />
                                    </div>
                                    <div className="grid gap-1">
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder={t.col_qty}
                                            value={item.quantity}
                                            onChange={(e) =>
                                                setItem(
                                                    i,
                                                    'quantity',
                                                    e.target.value,
                                                )
                                            }
                                            className={FIELD_CLASS}
                                        />
                                        <InputError
                                            message={itemError(i, 'quantity')}
                                        />
                                    </div>
                                    <div className="grid gap-1">
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder={t.col_unit_price}
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
                                        <InputError
                                            message={itemError(i, 'unit_price')}
                                        />
                                    </div>
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
                            ))}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="notes">{t.notes_label}</Label>
                            <textarea
                                id="notes"
                                rows={3}
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
                            className="w-full bg-olive-600 text-white hover:bg-olive-700"
                        >
                            {t.new_invoice}
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
}
