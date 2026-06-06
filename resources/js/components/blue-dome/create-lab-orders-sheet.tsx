import { useForm } from '@inertiajs/react';
import { Plus, X } from 'lucide-react';
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
import { enumLabel } from '@/lib/i18n/doctor';
import { useDoctorLang } from '@/lib/i18n/doctor-context';
import { useLocale } from '@/lib/i18n/use-locale';
import labOrders from '@/routes/lab-orders';

type Option = { id: string; [k: string]: unknown };

type ItemForm = {
    test_name: string;
    test_code: string;
    test_category: string;
    specimen_type: string;
    normal_range: string;
    unit: string;
};

const FIELD_CLASS =
    'border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]';

const TEXTAREA_CLASS =
    'border-input focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-[3px]';

const URGENCY_OPTIONS: ReadonlyArray<string> = ['routine', 'urgent', 'stat'];

function emptyItem(): ItemForm {
    return {
        test_name: '',
        test_code: '',
        test_category: '',
        specimen_type: '',
        normal_range: '',
        unit: '',
    };
}

function optionLabel(option: Option): string {
    const first = (option.first_name as string | null | undefined) ?? '';
    const last = (option.last_name as string | null | undefined) ?? '';
    const name = `${first} ${last}`.trim();
    const code = (option.patient_code as string | null | undefined) ?? null;

    if (name && code) {
        return `${name} · ${code}`;
    }

    return name || code || option.id;
}

/**
 * Inline "create lab order" Sheet. Drop it anywhere and pass the trigger as
 * `children`; the host page supplies the `patients` option list. Supports
 * multiple test items via add/remove rows (at least one is always present).
 */
export function CreateLabOrdersSheet({
    children,
    patients,
    external_labs = [],
}: {
    children: ReactNode;
    patients: Array<{ id: string; [k: string]: unknown }>;
    external_labs?: Array<{ id: string; lab_name: string | null }>;
}) {
    const { t } = useDoctorLang();
    const { slug: locale } = useLocale();
    const [open, setOpen] = useState(false);

    const form = useForm<{
        patient_id: string;
        external_lab_id: string;
        order_date: string;
        urgency: string;
        fasting_required: boolean;
        clinical_diagnosis: string;
        notes: string;
        items: ItemForm[];
        images: File[];
    }>({
        patient_id: '',
        external_lab_id: '',
        order_date: '',
        urgency: 'routine',
        fasting_required: false,
        clinical_diagnosis: '',
        notes: '',
        items: [emptyItem()],
        images: [],
    });

    const err = form.errors as Record<string, string | undefined>;

    const updateItem = (i: number, patch: Partial<ItemForm>): void => {
        const next = form.data.items.map((item, idx) =>
            idx === i ? { ...item, ...patch } : item,
        );
        form.setData('items', next);
    };

    const addItem = (): void =>
        form.setData('items', [...form.data.items, emptyItem()]);

    const removeItem = (i: number): void =>
        form.setData(
            'items',
            form.data.items.filter((_, idx) => idx !== i),
        );

    const submit = (e: React.FormEvent): void => {
        e.preventDefault();
        form.post(labOrders.store.url({ locale }), {
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
            <SheetContent className="w-full sm:max-w-2xl">
                <SheetHeader>
                    <SheetTitle>{t.new_lab_order}</SheetTitle>
                    <SheetDescription>
                        Pick a patient and add the tests to order. At least one
                        test is required.
                    </SheetDescription>
                </SheetHeader>

                <form
                    onSubmit={submit}
                    className="flex-1 space-y-4 overflow-y-auto px-4 pb-4"
                >
                    <div className="grid gap-2">
                        <Label htmlFor="patient_id">{t.col_patient}</Label>
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
                                    {optionLabel(patient)}
                                </option>
                            ))}
                        </select>
                        <InputError message={err.patient_id} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="external_lab_id">{t.lab_col}</Label>
                        <select
                            id="external_lab_id"
                            value={form.data.external_lab_id}
                            onChange={(e) =>
                                form.setData('external_lab_id', e.target.value)
                            }
                            className={FIELD_CLASS}
                        >
                            <option value="">{t.in_house}</option>
                            {external_labs.map((lab) => (
                                <option key={lab.id} value={lab.id}>
                                    {lab.lab_name ?? '—'}
                                </option>
                            ))}
                        </select>
                        <InputError message={err.external_lab_id} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-2">
                            <Label htmlFor="order_date">Order date</Label>
                            <input
                                id="order_date"
                                type="date"
                                value={form.data.order_date}
                                onChange={(e) =>
                                    form.setData('order_date', e.target.value)
                                }
                                className={FIELD_CLASS}
                            />
                            <InputError message={err.order_date} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="urgency">{t.urgency_col}</Label>
                            <select
                                id="urgency"
                                value={form.data.urgency}
                                onChange={(e) =>
                                    form.setData('urgency', e.target.value)
                                }
                                className={FIELD_CLASS}
                            >
                                {URGENCY_OPTIONS.map((value) => (
                                    <option key={value} value={value}>
                                        {enumLabel(t.urgency_opts, value)}
                                    </option>
                                ))}
                            </select>
                            <InputError message={err.urgency} />
                        </div>
                    </div>

                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={form.data.fasting_required}
                            onChange={(e) =>
                                form.setData(
                                    'fasting_required',
                                    e.target.checked,
                                )
                            }
                            className="size-4 rounded border-input"
                        />
                        Fasting required
                    </label>
                    <InputError message={err.fasting_required} />

                    <div className="grid gap-2">
                        <Label htmlFor="clinical_diagnosis">
                            Clinical diagnosis
                        </Label>
                        <textarea
                            id="clinical_diagnosis"
                            rows={2}
                            value={form.data.clinical_diagnosis}
                            onChange={(e) =>
                                form.setData(
                                    'clinical_diagnosis',
                                    e.target.value,
                                )
                            }
                            className={TEXTAREA_CLASS}
                        />
                        <InputError message={err.clinical_diagnosis} />
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
                            className={TEXTAREA_CLASS}
                        />
                        <InputError message={err.notes} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="images">Attachments (images / PDF)</Label>
                        <input
                            id="images"
                            type="file"
                            multiple
                            accept="image/*,application/pdf"
                            onChange={(e) =>
                                form.setData(
                                    'images',
                                    Array.from(e.target.files ?? []),
                                )
                            }
                            className="text-sm file:me-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-sm"
                        />
                        {form.data.images.length > 0 && (
                            <p className="text-[12px] text-muted-foreground">
                                {form.data.images.length} file(s) selected
                            </p>
                        )}
                        <InputError message={err.images} />
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label>{t.tests_col}</Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="gap-1.5"
                                onClick={addItem}
                            >
                                <Plus className="size-3.5" />
                                Add test
                            </Button>
                        </div>

                        {err.items && (
                            <p className="text-[13px] text-danger">
                                {err.items}
                            </p>
                        )}

                        {form.data.items.map((item, i) => (
                            <div
                                key={i}
                                className="rounded-lg border border-border p-3"
                            >
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="grid gap-1.5 sm:col-span-2">
                                        <Label htmlFor={`test_name-${i}`}>
                                            Test name
                                        </Label>
                                        <input
                                            id={`test_name-${i}`}
                                            value={item.test_name}
                                            onChange={(e) =>
                                                updateItem(i, {
                                                    test_name: e.target.value,
                                                })
                                            }
                                            className={FIELD_CLASS}
                                        />
                                        <InputError
                                            message={
                                                err[`items.${i}.test_name`]
                                            }
                                        />
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor={`test_code-${i}`}>
                                            Test code
                                        </Label>
                                        <input
                                            id={`test_code-${i}`}
                                            value={item.test_code}
                                            onChange={(e) =>
                                                updateItem(i, {
                                                    test_code: e.target.value,
                                                })
                                            }
                                            className={FIELD_CLASS}
                                        />
                                        <InputError
                                            message={
                                                err[`items.${i}.test_code`]
                                            }
                                        />
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor={`test_category-${i}`}>
                                            Category
                                        </Label>
                                        <input
                                            id={`test_category-${i}`}
                                            value={item.test_category}
                                            onChange={(e) =>
                                                updateItem(i, {
                                                    test_category:
                                                        e.target.value,
                                                })
                                            }
                                            className={FIELD_CLASS}
                                        />
                                        <InputError
                                            message={
                                                err[`items.${i}.test_category`]
                                            }
                                        />
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor={`specimen_type-${i}`}>
                                            Specimen type
                                        </Label>
                                        <input
                                            id={`specimen_type-${i}`}
                                            value={item.specimen_type}
                                            onChange={(e) =>
                                                updateItem(i, {
                                                    specimen_type:
                                                        e.target.value,
                                                })
                                            }
                                            className={FIELD_CLASS}
                                        />
                                        <InputError
                                            message={
                                                err[`items.${i}.specimen_type`]
                                            }
                                        />
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor={`normal_range-${i}`}>
                                            Normal range
                                        </Label>
                                        <input
                                            id={`normal_range-${i}`}
                                            value={item.normal_range}
                                            onChange={(e) =>
                                                updateItem(i, {
                                                    normal_range:
                                                        e.target.value,
                                                })
                                            }
                                            className={FIELD_CLASS}
                                        />
                                        <InputError
                                            message={
                                                err[`items.${i}.normal_range`]
                                            }
                                        />
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor={`unit-${i}`}>Unit</Label>
                                        <input
                                            id={`unit-${i}`}
                                            value={item.unit}
                                            onChange={(e) =>
                                                updateItem(i, {
                                                    unit: e.target.value,
                                                })
                                            }
                                            className={FIELD_CLASS}
                                        />
                                        <InputError
                                            message={err[`items.${i}.unit`]}
                                        />
                                    </div>
                                </div>
                                <div className="mt-2 flex justify-end">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="gap-1.5 text-danger"
                                        disabled={form.data.items.length <= 1}
                                        onClick={() => removeItem(i)}
                                    >
                                        <X className="size-3.5" />
                                        {t.delete_action}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Button
                        type="submit"
                        disabled={form.processing}
                        className="w-full bg-olive-600 text-white hover:bg-olive-700"
                    >
                        {t.new_lab_order}
                    </Button>
                </form>
            </SheetContent>
        </Sheet>
    );
}
