import { Form, Head, Link } from '@inertiajs/react';

interface VitalSign {
    id: string;
    recorded_at: string;
    temperature_c: string | null;
    blood_pressure_sys: number | null;
    blood_pressure_dia: number | null;
    heart_rate: number | null;
    respiratory_rate: number | null;
    oxygen_saturation: string | null;
    blood_glucose: string | null;
    weight_kg: string | null;
    height_cm: string | null;
    bmi: string | null;
    pain_score: number | null;
    notes: string | null;
}

interface Paginator<T> {
    data: T[];
    total: number;
}

interface Props {
    patient: {
        id: string;
        first_name: string;
        last_name: string;
        patient_code: string | null;
    };
    vital_signs: Paginator<VitalSign>;
}

export default function PatientVitalSigns({ patient, vital_signs }: Props) {
    return (
        <>
            <Head
                title={`Vital signs — ${patient.first_name} ${patient.last_name}`}
            />
            <div className="flex h-full flex-col p-6">
                <div className="mb-4">
                    <Link
                        href={`/patients/${patient.id}`}
                        className="text-xs text-blue-600 hover:underline"
                    >
                        ← Back to patient
                    </Link>
                    <h1 className="text-2xl font-semibold">
                        Vital signs — {patient.first_name} {patient.last_name}
                    </h1>
                </div>

                <section className="mb-6 rounded border border-neutral-200 p-4">
                    <h2 className="mb-3 text-sm font-semibold text-neutral-500 uppercase">
                        Record new reading
                    </h2>
                    <Form
                        action={`/patients/${patient.id}/vital-signs`}
                        method="post"
                        className="grid grid-cols-3 gap-3 text-sm"
                    >
                        {({ errors, processing }) => (
                            <>
                                <label className="flex flex-col gap-1">
                                    <span className="text-xs text-neutral-500 uppercase">
                                        Temp (°C)
                                    </span>
                                    <input
                                        type="number"
                                        step="0.1"
                                        name="temperature_c"
                                        className="rounded border border-neutral-300 px-2 py-1"
                                    />
                                    {errors.temperature_c && (
                                        <span className="text-xs text-red-600">
                                            {errors.temperature_c}
                                        </span>
                                    )}
                                </label>
                                <label className="flex flex-col gap-1">
                                    <span className="text-xs text-neutral-500 uppercase">
                                        BP sys
                                    </span>
                                    <input
                                        type="number"
                                        name="blood_pressure_sys"
                                        className="rounded border border-neutral-300 px-2 py-1"
                                    />
                                </label>
                                <label className="flex flex-col gap-1">
                                    <span className="text-xs text-neutral-500 uppercase">
                                        BP dia
                                    </span>
                                    <input
                                        type="number"
                                        name="blood_pressure_dia"
                                        className="rounded border border-neutral-300 px-2 py-1"
                                    />
                                </label>
                                <label className="flex flex-col gap-1">
                                    <span className="text-xs text-neutral-500 uppercase">
                                        HR
                                    </span>
                                    <input
                                        type="number"
                                        name="heart_rate"
                                        className="rounded border border-neutral-300 px-2 py-1"
                                    />
                                </label>
                                <label className="flex flex-col gap-1">
                                    <span className="text-xs text-neutral-500 uppercase">
                                        Weight (kg)
                                    </span>
                                    <input
                                        type="number"
                                        step="0.1"
                                        name="weight_kg"
                                        className="rounded border border-neutral-300 px-2 py-1"
                                    />
                                </label>
                                <label className="flex flex-col gap-1">
                                    <span className="text-xs text-neutral-500 uppercase">
                                        Height (cm)
                                    </span>
                                    <input
                                        type="number"
                                        step="0.1"
                                        name="height_cm"
                                        className="rounded border border-neutral-300 px-2 py-1"
                                    />
                                </label>
                                <label className="col-span-3 flex flex-col gap-1">
                                    <span className="text-xs text-neutral-500 uppercase">
                                        Notes
                                    </span>
                                    <textarea
                                        name="notes"
                                        rows={2}
                                        className="rounded border border-neutral-300 px-2 py-1"
                                    />
                                </label>
                                <div className="col-span-3 mt-2 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
                                    >
                                        Record
                                    </button>
                                </div>
                            </>
                        )}
                    </Form>
                </section>

                <section>
                    <h2 className="mb-3 text-sm font-semibold text-neutral-500 uppercase">
                        History ({vital_signs.total})
                    </h2>
                    {vital_signs.data.length === 0 ? (
                        <p className="text-xs text-neutral-400">
                            No vital signs recorded yet.
                        </p>
                    ) : (
                        <table className="w-full text-left text-xs">
                            <thead className="border-b border-neutral-200 text-neutral-500 uppercase">
                                <tr>
                                    <th className="px-2 py-1">When</th>
                                    <th className="px-2 py-1">Temp</th>
                                    <th className="px-2 py-1">BP</th>
                                    <th className="px-2 py-1">HR</th>
                                    <th className="px-2 py-1">BMI</th>
                                    <th className="px-2 py-1">Pain</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vital_signs.data.map((v) => (
                                    <tr
                                        key={v.id}
                                        className="border-b border-neutral-100"
                                    >
                                        <td className="px-2 py-1 font-mono">
                                            {v.recorded_at}
                                        </td>
                                        <td className="px-2 py-1">
                                            {v.temperature_c ?? '—'}
                                        </td>
                                        <td className="px-2 py-1">
                                            {v.blood_pressure_sys}/
                                            {v.blood_pressure_dia}
                                        </td>
                                        <td className="px-2 py-1">
                                            {v.heart_rate ?? '—'}
                                        </td>
                                        <td className="px-2 py-1">
                                            {v.bmi ?? '—'}
                                        </td>
                                        <td className="px-2 py-1">
                                            {v.pain_score ?? '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </section>
            </div>
        </>
    );
}
