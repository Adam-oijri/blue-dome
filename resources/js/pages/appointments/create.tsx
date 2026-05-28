import { Form, Head } from '@inertiajs/react';

export default function AppointmentCreate() {
    return (
        <>
            <Head title="Schedule appointment" />
            <div className="flex h-full flex-col p-6">
                <h1 className="mb-4 text-2xl font-semibold">
                    Schedule appointment
                </h1>
                <Form
                    action="/appointments"
                    method="post"
                    className="grid max-w-2xl grid-cols-2 gap-4 text-sm"
                >
                    {({ errors, processing }) => (
                        <>
                            <label className="flex flex-col gap-1">
                                <span className="text-xs text-neutral-500 uppercase">
                                    Patient ID *
                                </span>
                                <input
                                    name="patient_id"
                                    required
                                    className="rounded border border-neutral-300 px-3 py-2 font-mono text-xs"
                                />
                                {errors.patient_id && (
                                    <span className="text-xs text-red-600">
                                        {errors.patient_id}
                                    </span>
                                )}
                            </label>
                            <label className="flex flex-col gap-1">
                                <span className="text-xs text-neutral-500 uppercase">
                                    Doctor ID *
                                </span>
                                <input
                                    name="doctor_id"
                                    required
                                    className="rounded border border-neutral-300 px-3 py-2 font-mono text-xs"
                                />
                                {errors.doctor_id && (
                                    <span className="text-xs text-red-600">
                                        {errors.doctor_id}
                                    </span>
                                )}
                            </label>
                            <label className="flex flex-col gap-1">
                                <span className="text-xs text-neutral-500 uppercase">
                                    Start *
                                </span>
                                <input
                                    type="datetime-local"
                                    name="scheduled_start"
                                    required
                                    className="rounded border border-neutral-300 px-3 py-2"
                                />
                                {errors.scheduled_start && (
                                    <span className="text-xs text-red-600">
                                        {errors.scheduled_start}
                                    </span>
                                )}
                            </label>
                            <label className="flex flex-col gap-1">
                                <span className="text-xs text-neutral-500 uppercase">
                                    End *
                                </span>
                                <input
                                    type="datetime-local"
                                    name="scheduled_end"
                                    required
                                    className="rounded border border-neutral-300 px-3 py-2"
                                />
                                {errors.scheduled_end && (
                                    <span className="text-xs text-red-600">
                                        {errors.scheduled_end}
                                    </span>
                                )}
                            </label>
                            <label className="flex flex-col gap-1">
                                <span className="text-xs text-neutral-500 uppercase">
                                    Type
                                </span>
                                <select
                                    name="type"
                                    className="rounded border border-neutral-300 px-3 py-2"
                                >
                                    <option value="consultation">
                                        Consultation
                                    </option>
                                    <option value="follow_up">Follow-up</option>
                                    <option value="emergency">Emergency</option>
                                    <option value="routine_checkup">
                                        Routine checkup
                                    </option>
                                    <option value="vaccination">
                                        Vaccination
                                    </option>
                                </select>
                            </label>
                            <label className="flex flex-col gap-1">
                                <span className="text-xs text-neutral-500 uppercase">
                                    Priority
                                </span>
                                <select
                                    name="priority"
                                    className="rounded border border-neutral-300 px-3 py-2"
                                >
                                    <option value="normal">Normal</option>
                                    <option value="low">Low</option>
                                    <option value="high">High</option>
                                    <option value="emergency">Emergency</option>
                                </select>
                            </label>
                            <label className="col-span-2 flex flex-col gap-1">
                                <span className="text-xs text-neutral-500 uppercase">
                                    Reason / chief complaint
                                </span>
                                <textarea
                                    name="chief_complaint"
                                    rows={3}
                                    className="rounded border border-neutral-300 px-3 py-2"
                                />
                            </label>

                            <div className="col-span-2 mt-4 flex justify-end gap-2">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
                                >
                                    Schedule
                                </button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}
