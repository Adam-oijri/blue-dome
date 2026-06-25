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
import prescriptions from '@/routes/prescriptions';

type Option = { id: string; [k: string]: unknown };

type ItemForm = {
    medication_name: string;
    dosage: string;
    frequency_text: string;
    duration_days: string;
    route: string;
    quantity: string;
};

const FIELD_CLASS =
    'border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]';

const TEXTAREA_CLASS =
    'border-input focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-[3px]';

const ROUTE_OPTIONS: ReadonlyArray<string> = [
    'oral',
    'topical',
    'intravenous',
    'intramuscular',
    'subcutaneous',
    'sublingual',
    'rectal',
    'inhalation',
    'ophthalmic',
    'otic',
];

const STATUS_OPTIONS: ReadonlyArray<string> = [
    'draft',
    'active',
    'completed',
    'discontinued',
    'cancelled',
];

function emptyItem(): ItemForm {
    return {
        medication_name: '',
        dosage: '',
        frequency_text: '',
        duration_days: '',
        route: 'oral',
        quantity: '',
    };
}

function optionLabel(option: Option): string {
    const name =
        `${(option.first_name as string) ?? ''} ${(option.last_name as string) ?? ''}`.trim();

    if (name) {
        const code = option.patient_code as string | null | undefined;

        return code ? `${name} · ${code}` : name;
    }

    const trade = option.trade_name as string | null | undefined;

    if (trade) {
        const strength = option.strength as string | null | undefined;

        return [trade, strength].filter(Boolean).join(' ');
    }

    return option.id;
}

/**
 * Inline "issue prescription" Sheet. This is a dynamic multi-item form: a
 * prescription has one patient plus a list of medication items, each with its
 * own add/remove row. Drop it anywhere and pass the trigger as `children`; the
 * host page supplies the `patients` and `medications` option arrays.
 */
export function CreatePrescriptionsSheet({
    children,
    patients,
    medicationSuggestions = [],
}: {
    children: ReactNode;
    patients: Array<{ id: string; [k: string]: unknown }>;
    medicationSuggestions?: string[];
}) {
    const { t } = useDoctorLang();
    const { slug: locale } = useLocale();
    const [open, setOpen] = useState(false);

    const form = useForm<{
        patient_id: string;
        prescription_date: string;
        expiry_date: string;
        status: string;
        diagnosis_related: string;
        notes: string;
        items: ItemForm[];
    }>({
        patient_id: '',
        prescription_date: '',
        expiry_date: '',
        status: 'active',
        diagnosis_related: '',
        notes: '',
        items: [emptyItem()],
    });

    const err = form.errors as Record<string, string | undefined>;

    const updateItem = (i: number, patch: Partial<ItemForm>): void => {
        const next = form.data.items.map((item, idx) =>
            idx === i ? { ...item, ...patch } : item,
        );
        form.setData('items', next);
    };

    const addItem = (): void => {
        form.setData('items', [...form.data.items, emptyItem()]);
    };

    const removeItem = (i: number): void => {
        const next = form.data.items.filter((_, idx) => idx !== i);
        form.setData('items', next);
    };

    const submit = (e: React.FormEvent): void => {
        e.preventDefault();
        form.post(prescriptions.store.url({ locale }), {
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
                    <SheetTitle>{t.issue_prescription}</SheetTitle>
                    <SheetDescription>
                        {t.issue_prescription_desc}
                    </SheetDescription>
                </SheetHeader>

                <form
                    onSubmit={submit}
                    className="flex min-h-0 flex-1 flex-col"
                >
                    <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-4">
                        <div className="grid gap-3 sm:grid-cols-2">
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
                                    <option value="">
                                        {t.select_patient_ph}
                                    </option>
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
                                <Label htmlFor="status">{t.col_status}</Label>
                                <select
                                    id="status"
                                    value={form.data.status}
                                    onChange={(e) =>
                                        form.setData('status', e.target.value)
                                    }
                                    className={FIELD_CLASS}
                                >
                                    {STATUS_OPTIONS.map((status) => (
                                        <option key={status} value={status}>
                                            {enumLabel(
                                                t.prescription_status_opts,
                                                status,
                                            )}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={form.errors.status} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="prescription_date">
                                    {t.issued}
                                </Label>
                                <input
                                    id="prescription_date"
                                    type="date"
                                    value={form.data.prescription_date}
                                    onChange={(e) =>
                                        form.setData(
                                            'prescription_date',
                                            e.target.value,
                                        )
                                    }
                                    className={FIELD_CLASS}
                                />
                                <InputError
                                    message={form.errors.prescription_date}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="expiry_date">
                                    {t.expires_label}
                                </Label>
                                <input
                                    id="expiry_date"
                                    type="date"
                                    value={form.data.expiry_date}
                                    onChange={(e) =>
                                        form.setData(
                                            'expiry_date',
                                            e.target.value,
                                        )
                                    }
                                    className={FIELD_CLASS}
                                />
                                <InputError message={form.errors.expiry_date} />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <datalist id="medication-suggestions">
                                {medicationSuggestions.map((name) => (
                                    <option key={name} value={name} />
                                ))}
                            </datalist>
                            <div className="flex items-center justify-between">
                                <Label>{t.rx_meds_locked}</Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="gap-2"
                                    onClick={addItem}
                                >
                                    <Plus className="size-3.5" />
                                    {t.add_label}
                                </Button>
                            </div>

                            {err.items && (
                                <InputError message={err.items} />
                            )}

                            {form.data.items.map((item, i) => (
                                <div
                                    key={i}
                                    className="rounded-lg border border-input p-3"
                                >
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <div className="grid gap-1.5 sm:col-span-2">
                                            <Label htmlFor={`med-${i}`}>
                                                {t.medication}
                                            </Label>
                                            <input
                                                id={`med-${i}`}
                                                list="medication-suggestions"
                                                value={item.medication_name}
                                                onChange={(e) =>
                                                    updateItem(i, {
                                                        medication_name:
                                                            e.target.value,
                                                    })
                                                }
                                                placeholder={t.medication_name_ph}
                                                className={FIELD_CLASS}
                                            />
                                            <InputError
                                                message={
                                                    err[
                                                        `items.${i}.medication_name`
                                                    ]
                                                }
                                            />
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label htmlFor={`dose-${i}`}>
                                                {t.dosage}
                                            </Label>
                                            <input
                                                id={`dose-${i}`}
                                                value={item.dosage}
                                                onChange={(e) =>
                                                    updateItem(i, {
                                                        dosage: e.target.value,
                                                    })
                                                }
                                                className={FIELD_CLASS}
                                            />
                                            <InputError
                                                message={
                                                    err[`items.${i}.dosage`]
                                                }
                                            />
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label htmlFor={`freq-${i}`}>
                                                {t.frequency}
                                            </Label>
                                            <input
                                                id={`freq-${i}`}
                                                value={item.frequency_text}
                                                placeholder={
                                                    t.freq_twice_daily_ph
                                                }
                                                onChange={(e) =>
                                                    updateItem(i, {
                                                        frequency_text:
                                                            e.target.value,
                                                    })
                                                }
                                                className={FIELD_CLASS}
                                            />
                                            <InputError
                                                message={
                                                    err[
                                                        `items.${i}.frequency_text`
                                                    ]
                                                }
                                            />
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label htmlFor={`dur-${i}`}>
                                                {t.duration} ({t.days_label})
                                            </Label>
                                            <input
                                                id={`dur-${i}`}
                                                type="number"
                                                min={1}
                                                value={item.duration_days}
                                                onChange={(e) =>
                                                    updateItem(i, {
                                                        duration_days:
                                                            e.target.value,
                                                    })
                                                }
                                                className={FIELD_CLASS}
                                            />
                                            <InputError
                                                message={
                                                    err[
                                                        `items.${i}.duration_days`
                                                    ]
                                                }
                                            />
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label htmlFor={`route-${i}`}>
                                                {t.route_label}
                                            </Label>
                                            <select
                                                id={`route-${i}`}
                                                value={item.route}
                                                onChange={(e) =>
                                                    updateItem(i, {
                                                        route: e.target.value,
                                                    })
                                                }
                                                className={FIELD_CLASS}
                                            >
                                                {ROUTE_OPTIONS.map((route) => (
                                                    <option
                                                        key={route}
                                                        value={route}
                                                    >
                                                        {enumLabel(
                                                            t.route_opts,
                                                            route,
                                                        )}
                                                    </option>
                                                ))}
                                            </select>
                                            <InputError
                                                message={
                                                    err[`items.${i}.route`]
                                                }
                                            />
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label htmlFor={`qty-${i}`}>
                                                {t.quantity_label}
                                            </Label>
                                            <input
                                                id={`qty-${i}`}
                                                type="number"
                                                min={1}
                                                value={item.quantity}
                                                onChange={(e) =>
                                                    updateItem(i, {
                                                        quantity:
                                                            e.target.value,
                                                    })
                                                }
                                                className={FIELD_CLASS}
                                            />
                                            <InputError
                                                message={
                                                    err[`items.${i}.quantity`]
                                                }
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
                                            {t.remove_label}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="diagnosis_related">
                                {t.diagnosis_label}
                            </Label>
                            <input
                                id="diagnosis_related"
                                value={form.data.diagnosis_related}
                                onChange={(e) =>
                                    form.setData(
                                        'diagnosis_related',
                                        e.target.value,
                                    )
                                }
                                className={FIELD_CLASS}
                            />
                            <InputError
                                message={form.errors.diagnosis_related}
                            />
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
                                className={TEXTAREA_CLASS}
                            />
                            <InputError message={form.errors.notes} />
                        </div>
                    </div>

                    <div className="border-t border-input px-4 py-4">
                        <Button
                            type="submit"
                            disabled={form.processing}
                            className="w-full bg-olive-600 text-white hover:bg-olive-700"
                        >
                            {t.issue_prescription}
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
}
