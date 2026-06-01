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
import { useLocale } from '@/lib/i18n/use-locale';
import patients from '@/routes/patients';

const FIELD_CLASS =
    'border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]';

const GENDER_OPTIONS: ReadonlyArray<readonly [string, string]> = [
    ['', '—'],
    ['male', 'Male'],
    ['female', 'Female'],
    ['other', 'Other'],
];

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
 * Inline "new patient" Sheet. Drop it anywhere and pass the trigger as
 * `children`; on submit it posts to the patient store route and closes itself.
 * Patients have no relational options, so gender and blood type are rendered
 * from fixed enum lists.
 */
export function CreatePatientsSheet({ children }: { children: ReactNode }) {
    const { slug: locale } = useLocale();
    const [open, setOpen] = useState(false);

    const form = useForm({
        first_name: '',
        last_name: '',
        date_of_birth: '',
        gender: '',
        phone_e164: '',
        email: '',
        blood_type: '',
        national_id: '',
    });

    const submit = (e: React.FormEvent): void => {
        e.preventDefault();
        form.post(patients.store.url({ locale }), {
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
                    <SheetTitle>New patient</SheetTitle>
                    <SheetDescription>
                        Add a patient to your clinic. Only the name is required;
                        everything else can be filled in later.
                    </SheetDescription>
                </SheetHeader>

                <form
                    onSubmit={submit}
                    className="flex min-h-0 flex-1 flex-col"
                >
                    <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-2">
                                <Label htmlFor="first_name">First name</Label>
                                <input
                                    id="first_name"
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
                                <Label htmlFor="last_name">Last name</Label>
                                <input
                                    id="last_name"
                                    value={form.data.last_name}
                                    onChange={(e) =>
                                        form.setData('last_name', e.target.value)
                                    }
                                    className={FIELD_CLASS}
                                />
                                <InputError message={form.errors.last_name} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-2">
                                <Label htmlFor="date_of_birth">
                                    Date of birth
                                </Label>
                                <input
                                    id="date_of_birth"
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
                                <InputError
                                    message={form.errors.date_of_birth}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="gender">Gender</Label>
                                <select
                                    id="gender"
                                    value={form.data.gender}
                                    onChange={(e) =>
                                        form.setData('gender', e.target.value)
                                    }
                                    className={FIELD_CLASS}
                                >
                                    {GENDER_OPTIONS.map(([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={form.errors.gender} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="phone_e164">Phone (E.164)</Label>
                            <input
                                id="phone_e164"
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
                            <Label htmlFor="email">Email</Label>
                            <input
                                id="email"
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
                                <Label htmlFor="blood_type">Blood type</Label>
                                <select
                                    id="blood_type"
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
                                <Label htmlFor="national_id">National ID</Label>
                                <input
                                    id="national_id"
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
                    </div>

                    <div className="border-t px-4 py-4">
                        <Button
                            type="submit"
                            disabled={form.processing}
                            className="w-full bg-olive-600 text-white hover:bg-olive-700"
                        >
                            Create patient
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
}
