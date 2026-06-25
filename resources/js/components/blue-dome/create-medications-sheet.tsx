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

/**
 * Inline "add medication" Sheet. Drop it anywhere and pass the trigger as
 * `children`. The form mirrors `StoreMedicationRequest`: the medication is
 * created under the authenticated user's clinic, so no options need to be
 * supplied by the host page.
 */
export function CreateMedicationsSheet({ children }: { children: ReactNode }) {
    const { t } = useDoctorLang();
    const { slug: locale } = useLocale();
    const [open, setOpen] = useState(false);

    const yesNoOptions: ReadonlyArray<readonly [string, string]> = [
        ['1', t.yes],
        ['0', t.no_label],
    ];

    const form = useForm({
        trade_name: '',
        generic_name: '',
        form: '',
        strength: '',
        manufacturer: '',
        category: '',
        atc_code: '',
        requires_prescription: '1',
        is_active: '1',
        side_effects: '',
        contraindications: '',
        storage_instructions: '',
    });

    const submit = (e: React.FormEvent): void => {
        e.preventDefault();
        form.post(medications.store.url({ locale }), {
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
            <SheetContent className="flex w-full flex-col sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>{t.add_medication}</SheetTitle>
                    <SheetDescription>{t.formulary}</SheetDescription>
                </SheetHeader>

                <form
                    onSubmit={submit}
                    className="flex min-h-0 flex-1 flex-col"
                >
                    <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-4">
                        <div className="grid gap-2">
                            <Label htmlFor="trade_name">{t.trade_name}</Label>
                            <input
                                id="trade_name"
                                value={form.data.trade_name}
                                onChange={(e) =>
                                    form.setData('trade_name', e.target.value)
                                }
                                className={FIELD_CLASS}
                            />
                            <InputError message={form.errors.trade_name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="generic_name">
                                {t.generic_name}
                            </Label>
                            <input
                                id="generic_name"
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
                                <Label htmlFor="form">{t.form_label}</Label>
                                <input
                                    id="form"
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
                                <Label htmlFor="strength">{t.strength}</Label>
                                <input
                                    id="strength"
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
                            <Label htmlFor="manufacturer">
                                {t.manufacturer}
                            </Label>
                            <input
                                id="manufacturer"
                                value={form.data.manufacturer}
                                onChange={(e) =>
                                    form.setData('manufacturer', e.target.value)
                                }
                                className={FIELD_CLASS}
                            />
                            <InputError message={form.errors.manufacturer} />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-2">
                                <Label htmlFor="category">
                                    {t.col_category}
                                </Label>
                                <input
                                    id="category"
                                    value={form.data.category}
                                    onChange={(e) =>
                                        form.setData('category', e.target.value)
                                    }
                                    className={FIELD_CLASS}
                                />
                                <InputError message={form.errors.category} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="atc_code">{t.atc_code}</Label>
                                <input
                                    id="atc_code"
                                    value={form.data.atc_code}
                                    onChange={(e) =>
                                        form.setData('atc_code', e.target.value)
                                    }
                                    className={FIELD_CLASS}
                                />
                                <InputError message={form.errors.atc_code} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-2">
                                <Label htmlFor="requires_prescription">
                                    {t.requires_prescription}
                                </Label>
                                <select
                                    id="requires_prescription"
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
                            <div className="grid gap-2">
                                <Label htmlFor="is_active">
                                    {t.active_label}
                                </Label>
                                <select
                                    id="is_active"
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
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="side_effects">
                                {t.side_effects}
                            </Label>
                            <textarea
                                id="side_effects"
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
                            <Label htmlFor="contraindications">
                                {t.contraindications}
                            </Label>
                            <textarea
                                id="contraindications"
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
                            <Label htmlFor="storage_instructions">
                                {t.storage_instructions}
                            </Label>
                            <textarea
                                id="storage_instructions"
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
                            {t.add_medication}
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
}
