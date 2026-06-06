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
import { enumLabel } from '@/lib/i18n/doctor';
import { useDoctorLang } from '@/lib/i18n/doctor-context';
import { useLocale } from '@/lib/i18n/use-locale';
import prescriptions from '@/routes/prescriptions';

export type PrescriptionItemRow = {
    id?: string;
    medication_name?: string | null;
    dosage?: string | null;
};

export type PrescriptionEditable = {
    id: string;
    prescription_date: string | null;
    expiry_date: string | null;
    status: string;
    diagnosis_related: string | null;
    notes: string | null;
    items?: PrescriptionItemRow[];
};

const FIELD_CLASS =
    'border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]';

const TEXTAREA_CLASS =
    'border-input focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-[3px]';

const STATUS_OPTIONS: ReadonlyArray<string> = [
    'draft',
    'active',
    'completed',
    'discontinued',
    'cancelled',
    'expired',
];

/**
 * Inline "edit prescription" Sheet. Edits only the header fields the update
 * endpoint accepts (UpdatePrescriptionRequest); the medication items are shown
 * read-only because they are not editable here. Prefilled from the row; posts
 * via PATCH and stays on the page.
 */
export function EditPrescriptionsSheet({
    children,
    prescription,
}: {
    children: ReactNode;
    prescription: PrescriptionEditable;
}) {
    const { slug: locale } = useLocale();
    const { t } = useDoctorLang();
    const [open, setOpen] = useState(false);

    const form = useForm({
        prescription_date: prescription.prescription_date
            ? String(prescription.prescription_date).slice(0, 10)
            : '',
        expiry_date: prescription.expiry_date
            ? String(prescription.expiry_date).slice(0, 10)
            : '',
        status: prescription.status ?? 'active',
        diagnosis_related: prescription.diagnosis_related ?? '',
        notes: prescription.notes ?? '',
    });

    const items = prescription.items ?? [];

    const submit = (e: React.FormEvent): void => {
        e.preventDefault();
        form.patch(
            prescriptions.update.url({ locale, prescription: prescription.id }),
            {
                preserveScroll: true,
                onSuccess: () => setOpen(false),
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
            <SheetContent className="w-full sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>{t.edit_prescription}</SheetTitle>
                    <SheetDescription>
                        {t.edit_prescription_desc}
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={submit} className="space-y-4 px-4 pb-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-2">
                            <Label htmlFor="edit_prescription_date">
                                {t.issued}
                            </Label>
                            <input
                                id="edit_prescription_date"
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
                            <Label htmlFor="edit_expiry_date">
                                {t.expires_label}
                            </Label>
                            <input
                                id="edit_expiry_date"
                                type="date"
                                value={form.data.expiry_date}
                                onChange={(e) =>
                                    form.setData('expiry_date', e.target.value)
                                }
                                className={FIELD_CLASS}
                            />
                            <InputError message={form.errors.expiry_date} />
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
                        <Label htmlFor="edit_diagnosis_related">
                            {t.diagnosis_label}
                        </Label>
                        <input
                            id="edit_diagnosis_related"
                            value={form.data.diagnosis_related}
                            onChange={(e) =>
                                form.setData(
                                    'diagnosis_related',
                                    e.target.value,
                                )
                            }
                            className={FIELD_CLASS}
                        />
                        <InputError message={form.errors.diagnosis_related} />
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

                    {items.length > 0 && (
                        <div className="rounded-lg border border-border bg-muted/40 p-4">
                            <div className="mb-2 text-[11px] tracking-wider text-muted-foreground uppercase">
                                {t.rx_meds_locked} {t.read_only}
                            </div>
                            <ul className="space-y-1 text-[13px]">
                                {items.map((item, i) => (
                                    <li key={item.id ?? i}>
                                        {item.medication_name || '—'}
                                        {item.dosage ? ` · ${item.dosage}` : ''}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={form.processing}
                        className="w-full bg-olive-600 text-white hover:bg-olive-700"
                    >
                        {t.save_changes}
                    </Button>
                </form>
            </SheetContent>
        </Sheet>
    );
}
