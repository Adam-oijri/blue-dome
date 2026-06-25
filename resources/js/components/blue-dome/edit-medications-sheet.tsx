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
import { useDoctorLang } from '@/lib/i18n/doctor-context';
import { useLocale } from '@/lib/i18n/use-locale';
import medications from '@/routes/medications';

const FIELD_CLASS =
    'border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]';

const TEXTAREA_CLASS =
    'border-input focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-[3px]';

export type EditableMedication = {
    id: string;
    trade_name: string | null;
    generic_name: string | null;
    form: string | null;
    strength: string | null;
    manufacturer: string | null;
    category: string | null;
    is_active: boolean;
    requires_prescription: boolean;
    atc_code?: string | null;
    side_effects?: string | null;
    contraindications?: string | null;
    storage_instructions?: string | null;
};

/**
 * Inline "edit medication" Sheet. Edits the core formulary fields shown in the
 * list and PATCHes `medications.update`. Deeper fields (side effects,
 * contraindications, storage) are left untouched — UpdateMedicationRequest is
 * `sometimes`-validated, so omitting them preserves their stored values.
 */
export function EditMedicationsSheet({
    medication,
    children,
}: {
    medication: EditableMedication;
    children: ReactNode;
}) {
    const { slug: locale } = useLocale();
    const { t } = useDoctorLang();
    const [open, setOpen] = useState(false);

    const yesNoOptions: ReadonlyArray<readonly [string, string]> = [
        ['1', t.yes],
        ['0', t.no_label],
    ];

    const form = useForm({
        trade_name: medication.trade_name ?? '',
        generic_name: medication.generic_name ?? '',
        form: medication.form ?? '',
        strength: medication.strength ?? '',
        manufacturer: medication.manufacturer ?? '',
        category: medication.category ?? '',
        atc_code: medication.atc_code ?? '',
        requires_prescription: medication.requires_prescription ? '1' : '0',
        is_active: medication.is_active ? '1' : '0',
        side_effects: medication.side_effects ?? '',
        contraindications: medication.contraindications ?? '',
        storage_instructions: medication.storage_instructions ?? '',
    });

    const submit = (e: React.FormEvent): void => {
        e.preventDefault();
        form.patch(medications.update.url({ locale, medication: medication.id }), {
            preserveScroll: true,
            onSuccess: () => setOpen(false),
        });
    };

    return (
        <Sheet
            open={open}
            onOpenChange={(next) => {
                setOpen(next);

                if (!next) {
                    form.clearErrors();
                }
            }}
        >
            <SheetTrigger asChild>{children}</SheetTrigger>
            <SheetContent className="flex w-full flex-col sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>{t.edit_medication}</SheetTitle>
                    <SheetDescription>{t.formulary}</SheetDescription>
                </SheetHeader>

                <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
                    <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit_trade_name">
                                {t.trade_name}
                            </Label>
                            <input
                                id="edit_trade_name"
                                value={form.data.trade_name}
                                onChange={(e) =>
                                    form.setData('trade_name', e.target.value)
                                }
                                className={FIELD_CLASS}
                            />
                            <InputError message={form.errors.trade_name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit_generic_name">
                                {t.generic_name}
                            </Label>
                            <input
                                id="edit_generic_name"
                                value={form.data.generic_name}
                                onChange={(e) =>
                                    form.setData('generic_name', e.target.value)
                                }
                                className={FIELD_CLASS}
                            />
                            <InputError message={form.errors.generic_name} />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-2">
                                <Label htmlFor="edit_form">
                                    {t.form_label}
                                </Label>
                                <input
                                    id="edit_form"
                                    value={form.data.form}
                                    onChange={(e) =>
                                        form.setData('form', e.target.value)
                                    }
                                    placeholder={t.eg_tablet}
                                    className={FIELD_CLASS}
                                />
                                <InputError message={form.errors.form} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit_strength">
                                    {t.strength}
                                </Label>
                                <input
                                    id="edit_strength"
                                    value={form.data.strength}
                                    onChange={(e) =>
                                        form.setData('strength', e.target.value)
                                    }
                                    className={FIELD_CLASS}
                                />
                                <InputError message={form.errors.strength} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit_manufacturer">
                                {t.manufacturer}
                            </Label>
                            <input
                                id="edit_manufacturer"
                                value={form.data.manufacturer}
                                onChange={(e) =>
                                    form.setData('manufacturer', e.target.value)
                                }
                                className={FIELD_CLASS}
                            />
                            <InputError message={form.errors.manufacturer} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit_atc_code">{t.atc_code}</Label>
                            <input
                                id="edit_atc_code"
                                value={form.data.atc_code}
                                onChange={(e) =>
                                    form.setData('atc_code', e.target.value)
                                }
                                className={FIELD_CLASS}
                            />
                            <InputError message={form.errors.atc_code} />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-2">
                                <Label htmlFor="edit_category">
                                    {t.col_category}
                                </Label>
                                <input
                                    id="edit_category"
                                    value={form.data.category}
                                    onChange={(e) =>
                                        form.setData('category', e.target.value)
                                    }
                                    className={FIELD_CLASS}
                                />
                                <InputError message={form.errors.category} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit_requires_prescription">
                                    {t.requires_prescription}
                                </Label>
                                <select
                                    id="edit_requires_prescription"
                                    value={form.data.requires_prescription}
                                    onChange={(e) =>
                                        form.setData(
                                            'requires_prescription',
                                            e.target.value,
                                        )
                                    }
                                    className={FIELD_CLASS}
                                >
                                    {yesNoOptions.map(([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                                <InputError
                                    message={form.errors.requires_prescription}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit_is_active">
                                {t.active_label}
                            </Label>
                            <select
                                id="edit_is_active"
                                value={form.data.is_active}
                                onChange={(e) =>
                                    form.setData('is_active', e.target.value)
                                }
                                className={FIELD_CLASS}
                            >
                                {yesNoOptions.map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                            <InputError message={form.errors.is_active} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit_side_effects">
                                {t.side_effects}
                            </Label>
                            <textarea
                                id="edit_side_effects"
                                rows={3}
                                value={form.data.side_effects}
                                onChange={(e) =>
                                    form.setData('side_effects', e.target.value)
                                }
                                className={TEXTAREA_CLASS}
                            />
                            <InputError message={form.errors.side_effects} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit_contraindications">
                                {t.contraindications}
                            </Label>
                            <textarea
                                id="edit_contraindications"
                                rows={3}
                                value={form.data.contraindications}
                                onChange={(e) =>
                                    form.setData(
                                        'contraindications',
                                        e.target.value,
                                    )
                                }
                                className={TEXTAREA_CLASS}
                            />
                            <InputError
                                message={form.errors.contraindications}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit_storage_instructions">
                                {t.storage_instructions}
                            </Label>
                            <textarea
                                id="edit_storage_instructions"
                                rows={3}
                                value={form.data.storage_instructions}
                                onChange={(e) =>
                                    form.setData(
                                        'storage_instructions',
                                        e.target.value,
                                    )
                                }
                                className={TEXTAREA_CLASS}
                            />
                            <InputError
                                message={form.errors.storage_instructions}
                            />
                        </div>
                    </div>

                    <div className="border-t px-4 py-4">
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
