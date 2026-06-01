import { Form, Head } from '@inertiajs/react';

import { enumLabel } from '@/lib/i18n/doctor';
import { useDoctorLang } from '@/lib/i18n/doctor-context';

export default function PatientCreate() {
    const { t } = useDoctorLang();

    return (
        <>
            <Head title={t.new_patient} />
            <div className="flex h-full flex-col p-6">
                <h1 className="mb-4 text-2xl font-semibold">{t.new_patient}</h1>
                <Form
                    action="/patients"
                    method="post"
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
                                    className="rounded border border-neutral-300 px-3 py-2"
                                />
                                {errors.date_of_birth && (
                                    <span className="text-xs text-red-600">
                                        {errors.date_of_birth}
                                    </span>
                                )}
                            </label>
                            <label className="flex flex-col gap-1">
                                <span className="text-xs text-neutral-500 uppercase">
                                    {t.gender}
                                </span>
                                <select
                                    name="gender"
                                    className="rounded border border-neutral-300 px-3 py-2"
                                >
                                    <option value="">—</option>
                                    <option value="male">
                                        {enumLabel(t.gender_opts, 'male')}
                                    </option>
                                    <option value="female">
                                        {enumLabel(t.gender_opts, 'female')}
                                    </option>
                                    <option value="other">
                                        {enumLabel(t.gender_opts, 'other')}
                                    </option>
                                </select>
                            </label>
                            <label className="flex flex-col gap-1">
                                <span className="text-xs text-neutral-500 uppercase">
                                    {t.phone_e164}
                                </span>
                                <input
                                    name="phone_e164"
                                    placeholder="+212600000000"
                                    className="rounded border border-neutral-300 px-3 py-2"
                                />
                                {errors.phone_e164 && (
                                    <span className="text-xs text-red-600">
                                        {errors.phone_e164}
                                    </span>
                                )}
                            </label>
                            <label className="flex flex-col gap-1">
                                <span className="text-xs text-neutral-500 uppercase">
                                    {t.email}
                                </span>
                                <input
                                    type="email"
                                    name="email"
                                    className="rounded border border-neutral-300 px-3 py-2"
                                />
                                {errors.email && (
                                    <span className="text-xs text-red-600">
                                        {errors.email}
                                    </span>
                                )}
                            </label>
                            <label className="flex flex-col gap-1">
                                <span className="text-xs text-neutral-500 uppercase">
                                    {t.blood_type}
                                </span>
                                <select
                                    name="blood_type"
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
                                    className="rounded border border-neutral-300 px-3 py-2"
                                />
                                {errors.national_id && (
                                    <span className="text-xs text-red-600">
                                        {errors.national_id}
                                    </span>
                                )}
                            </label>

                            <div className="col-span-2 mt-4 flex justify-end gap-2">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
                                >
                                    Save
                                </button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}
