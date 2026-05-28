import { Form, Head } from '@inertiajs/react';

interface Props {
    appointment: {
        id: string;
        scheduled_start: string;
        scheduled_end: string;
        type: string | null;
        priority: string | null;
        status: string;
        chief_complaint: string | null;
        notes: string | null;
    };
}

export default function AppointmentEdit({ appointment }: Props) {
    return (
        <>
            <Head title="Edit appointment" />
            <div className="flex h-full flex-col p-6">
                <h1 className="mb-4 text-2xl font-semibold">
                    Edit appointment
                </h1>
                <Form
                    action={`/appointments/${appointment.id}`}
                    method="patch"
                    className="grid max-w-2xl grid-cols-2 gap-4 text-sm"
                >
                    {({ errors, processing }) => (
                        <>
                            <label className="flex flex-col gap-1">
                                <span className="text-xs text-neutral-500 uppercase">
                                    Start
                                </span>
                                <input
                                    type="datetime-local"
                                    name="scheduled_start"
                                    defaultValue={
                                        appointment.scheduled_start?.slice(
                                            0,
                                            16,
                                        ) ?? ''
                                    }
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
                                    End
                                </span>
                                <input
                                    type="datetime-local"
                                    name="scheduled_end"
                                    defaultValue={
                                        appointment.scheduled_end?.slice(
                                            0,
                                            16,
                                        ) ?? ''
                                    }
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
                                    Status
                                </span>
                                <select
                                    name="status"
                                    defaultValue={appointment.status}
                                    className="rounded border border-neutral-300 px-3 py-2"
                                >
                                    {[
                                        'scheduled',
                                        'confirmed',
                                        'arrived',
                                        'in_progress',
                                        'completed',
                                        'no_show',
                                    ].map((s) => (
                                        <option key={s} value={s}>
                                            {s}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className="flex flex-col gap-1">
                                <span className="text-xs text-neutral-500 uppercase">
                                    Priority
                                </span>
                                <select
                                    name="priority"
                                    defaultValue={
                                        appointment.priority ?? 'normal'
                                    }
                                    className="rounded border border-neutral-300 px-3 py-2"
                                >
                                    {['low', 'normal', 'high', 'emergency'].map(
                                        (p) => (
                                            <option key={p} value={p}>
                                                {p}
                                            </option>
                                        ),
                                    )}
                                </select>
                            </label>
                            <label className="col-span-2 flex flex-col gap-1">
                                <span className="text-xs text-neutral-500 uppercase">
                                    Notes
                                </span>
                                <textarea
                                    name="notes"
                                    defaultValue={appointment.notes ?? ''}
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
                                    Save changes
                                </button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}
