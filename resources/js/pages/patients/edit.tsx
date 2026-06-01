import { Form, Head } from '@inertiajs/react';

import { useDoctorLang } from '@/lib/i18n/doctor-context';

interface Patient {
    id: string;
    first_name: string;
    last_name: string;
    date_of_birth: string | null;
    gender: string | null;
    phone: string | null;
    phone_e164: string | null;
    email: string | null;
    blood_type: string | null;
}

interface Props {
    patient: Patient;
    national_id: string | null;
    insurance_number: string | null;
}

export default function PatientEdit({
    patient,
    national_id,
    insurance_number,
}: Props) {
    const { t } = useDoctorLang();

    return (
        <>
            <Head
                title={`${t.edit} ${patient.first_name} ${patient.last_name}`}
            />
            <div className="flex h-full flex-col p-6">
                <h1 className="mb-4 text-2xl font-semibold">
                    {t.edit} {patient.first_name} {patient.last_name}
                </h1>
                <Form
                    action={`/patients/${patient.id}`}
                    method="patch"
                    className="grid max-w-2xl grid-cols-2 gap-4 text-sm"
                >
                    {({ errors, processing }) => (
                        <>
                            <label className="flex flex-col gap-1">
                                <span className="text-xs text-neutral-500 uppercase">
                                    {t.first_name} {t.required_mark}
                                </span>
                                <input
                                    name="first_name"
                                    defaultValue={patient.first_name}
                                    required
                                    className="rounded border border-neutral-300 px-3 py-2"
                                />
                                {errors.first_name && (
                                    <span className="text-xs text-red-600">
                                        {errors.first_name}
                                    </span>
                                )}
                            </label>
                            <label className="flex flex-col gap-1">
                                <span className="text-xs text-neutral-500 uppercase">
                                    {t.last_name} {t.required_mark}
                                </span>
                                <input
                                    name="last_name"
                                    defaultValue={patient.last_name}
                                    required
                                    className="rounded border border-neutral-300 px-3 py-2"
                                />
                                {errors.last_name && (
                                    <span className="text-xs text-red-600">
                                        {errors.last_name}
                                    </span>
                                )}
                            </label>
                            <label className="flex flex-col gap-1">
                                <span className="text-xs text-neutral-500 uppercase">
                                    {t.date_of_birth}
                                </span>
                                <input
                                    type="date"
                                    name="date_of_birth"
                                    defaultValue={patient.date_of_birth ?? ''}
                                    className="rounded border border-neutral-300 px-3 py-2"
                                />
                            </label>
                            <label className="flex flex-col gap-1">
                                <span className="text-xs text-neutral-500 uppercase">
                                    {t.phone_e164}
                                </span>
                                <input
                                    name="phone_e164"
                                    defaultValue={patient.phone_e164 ?? ''}
                                    className="rounded border border-neutral-300 px-3 py-2"
                                />
                            </label>
                            <label className="flex flex-col gap-1">
                                <span className="text-xs text-neutral-500 uppercase">
                                    {t.email}
                                </span>
                                <input
                                    type="email"
                                    name="email"
                                    defaultValue={patient.email ?? ''}
                                    className="rounded border border-neutral-300 px-3 py-2"
                                />
                            </label>
                            <label className="flex flex-col gap-1">
                                <span className="text-xs text-neutral-500 uppercase">
                                    {t.blood_type}
                                </span>
                                <select
                                    name="blood_type"
                                    defaultValue={patient.blood_type ?? ''}
                                    className="rounded border border-neutral-300 px-3 py-2"
                                >
                                    <option value="">—</option>
                                    {[
                                        'A+',
                                        'A-',
                                        'B+',
                                        'B-',
                                        'AB+',
                                        'AB-',
                                        'O+',
                                        'O-',
                                    ].map((bt) => (
                                        <option key={bt} value={bt}>
                                            {bt}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className="flex flex-col gap-1">
                                <span className="text-xs text-neutral-500 uppercase">
                                    {t.national_id}
                                </span>
                                <input
                                    name="national_id"
                                    defaultValue={national_id ?? ''}
                                    className="rounded border border-neutral-300 px-3 py-2"
                                />
                            </label>
                            <label className="flex flex-col gap-1">
                                <span className="text-xs text-neutral-500 uppercase">
                                    {t.insurance_number}
                                </span>
                                <input
                                    name="insurance_number"
                                    defaultValue={insurance_number ?? ''}
                                    className="rounded border border-neutral-300 px-3 py-2"
                                />
                            </label>

                            <div className="col-span-2 mt-4 flex justify-end gap-2">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
                                >
                                    {t.save_changes}
                                </button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}
