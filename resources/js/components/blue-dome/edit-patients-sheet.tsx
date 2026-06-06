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
import patients from '@/routes/patients';

export type PatientEditable = {
    id: string;
    first_name: string | null;
    last_name: string | null;
    date_of_birth: string | null;
    gender: string | null;
    phone_e164: string | null;
    email: string | null;
    blood_type: string | null;
};

const FIELD_CLASS =
    'border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]';

const BLOOD_TYPE_OPTIONS: ReadonlyArray<string> = [
    'A+',
    'A-',
    'B+',
    'B-',
    'AB+',
    'AB-',
    'O+',
    'O-',
];

/**
 * Inline "edit patient" Sheet. Mirrors the create sheet but is prefilled from
 * the passed patient record. `national_id` and `insurance_number` are decrypted
 * server-side and passed separately (the edit page does the same). Posts via
 * PATCH and stays on the page.
 */
export function EditPatientsSheet({
    children,
    patient,
    national_id,
    insurance_number,
}: {
    children: ReactNode;
    patient: PatientEditable;
    national_id: string | null;
    insurance_number: string | null;
}) {
    const { slug: locale } = useLocale();
    const { t } = useDoctorLang();
    const [open, setOpen] = useState(false);

    const form = useForm({
        first_name: patient.first_name ?? '',
        last_name: patient.last_name ?? '',
        date_of_birth: patient.date_of_birth
            ? String(patient.date_of_birth).slice(0, 10)
            : '',
        phone_e164: patient.phone_e164 ?? '',
        email: patient.email ?? '',
        blood_type: patient.blood_type ?? '',
        national_id: national_id ?? '',
        insurance_number: insurance_number ?? '',
    });

    const submit = (e: React.FormEvent): void => {
        e.preventDefault();
        form.patch(patients.update.url({ locale, patient: patient.id }), {
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
                    form.reset();
                    form.clearErrors();
                }
            }}
        >
            <SheetTrigger asChild>{children}</SheetTrigger>
            <SheetContent className="flex w-full flex-col sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>{t.edit}</SheetTitle>
                    <SheetDescription>
                        {t.first_name} {t.last_name}
                    </SheetDescription>
                </SheetHeader>

                <form
                    onSubmit={submit}
                    className="flex min-h-0 flex-1 flex-col"
                >
                    <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-2">
                                <Label htmlFor="edit_first_name">
                                    {t.first_name}
                                </Label>
                                <input
                                    id="edit_first_name"
                                    value={form.data.first_name}
                                    onChange={(e) =>
                                        form.setData(
                                            'first_name',
                                            e.target.value,
                                        )
                                    }
                                    className={FIELD_CLASS}
                                />
                                <InputError message={form.errors.first_name} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit_last_name">
                                    {t.last_name}
                                </Label>
                                <input
                                    id="edit_last_name"
                                    value={form.data.last_name}
                                    onChange={(e) =>
                                        form.setData(
                                            'last_name',
                                            e.target.value,
                                        )
                                    }
                                    className={FIELD_CLASS}
                                />
                                <InputError message={form.errors.last_name} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit_date_of_birth">
                                {t.date_of_birth}
                            </Label>
                            <input
                                id="edit_date_of_birth"
                                type="date"
                                value={form.data.date_of_birth}
                                onChange={(e) =>
                                    form.setData(
                                        'date_of_birth',
                                        e.target.value,
                                    )
                                }
                                className={FIELD_CLASS}
                            />
                            <InputError message={form.errors.date_of_birth} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit_phone_e164">
                                {t.phone_e164}
                            </Label>
                            <input
                                id="edit_phone_e164"
                                placeholder="+212600000000"
                                value={form.data.phone_e164}
                                onChange={(e) =>
                                    form.setData('phone_e164', e.target.value)
                                }
                                className={FIELD_CLASS}
                            />
                            <InputError message={form.errors.phone_e164} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit_email">{t.email}</Label>
                            <input
                                id="edit_email"
                                type="email"
                                value={form.data.email}
                                onChange={(e) =>
                                    form.setData('email', e.target.value)
                                }
                                className={FIELD_CLASS}
                            />
                            <InputError message={form.errors.email} />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-2">
                                <Label htmlFor="edit_blood_type">
                                    {t.blood_type}
                                </Label>
                                <select
                                    id="edit_blood_type"
                                    value={form.data.blood_type}
                                    onChange={(e) =>
                                        form.setData(
                                            'blood_type',
                                            e.target.value,
                                        )
                                    }
                                    className={FIELD_CLASS}
                                >
                                    <option value="">—</option>
                                    {BLOOD_TYPE_OPTIONS.map((type) => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={form.errors.blood_type} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit_national_id">
                                    {t.national_id}
                                </Label>
                                <input
                                    id="edit_national_id"
                                    value={form.data.national_id}
                                    onChange={(e) =>
                                        form.setData(
                                            'national_id',
                                            e.target.value,
                                        )
                                    }
                                    className={FIELD_CLASS}
                                />
                                <InputError message={form.errors.national_id} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit_insurance_number">
                                {t.insurance_number}
                            </Label>
                            <input
                                id="edit_insurance_number"
                                value={form.data.insurance_number}
                                onChange={(e) =>
                                    form.setData(
                                        'insurance_number',
                                        e.target.value,
                                    )
                                }
                                className={FIELD_CLASS}
                            />
                            <InputError
                                message={form.errors.insurance_number}
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
